import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { connect } from "react-redux";
import {
  getCitationData,
  getMap,
  handleSidebar,
} from "../../../redux/actions/index";
import { places, heatmap } from "./MapLayers";

const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

function mapDispatchToProps(dispatch) {
  return {
    getCitationData: (test) => dispatch(getCitationData(test)),
    getMap: (mapRef) => dispatch(getMap(mapRef)),
    handleSidebar: (isSidebarOpen) => dispatch(handleSidebar(isSidebarOpen)),
  };
}

const mapStateToProps = (state) => {
  return {
    citation: state.citation,
    mapRef: state.mapRef,
    isSidebarOpen: state.isSidebarOpen,
  };
};

const ConnectedMap = ({
  getCitationData,
  mapRef,
  isSidebarOpen,
  handleSidebar,
}) => {
  const [coordinates, setCoordinates] = useState({
    lng: [-118.21064300537162, 34.043039338159375],
    lat: [-118.18931407928518, 34.05671120815498],
  });

  const [zoom, setZoom] = useState(15);
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [mapboxStyle, setMapBoxStyle] = useState(
    "mapbox://styles/mapbox/dark-v10"
  );

  const mapContainer = useRef();
  const sideBar = document.getElementsByClassName("sidebar-container");
  const closeButton = document.getElementsByClassName(
    "sidebar__closeButton--close"
  );
  const closeButtonHandle = document.getElementsByClassName(
    "sidebar__closeButton"
  );

  //first mounted
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyle,
      center: [-118.2, 34.05],
      zoom: zoom,
      minZoom: 13,
    });

    map.once("style.load", () => {
      let dataSources = {
        type: "vector",
        url: "mapbox://gregpawin.cl775u6c",
      };

      map.addSource("places", dataSources);
      map.addLayer(places);
      map.addLayer(heatmap);

      console.log("beginning " + dataSources);

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      });
      mapRef.current.appendChild(geocoder.onAdd(map));
    });

    map.on("click", "places", (e) => {
      let description = JSON.stringify(e.features[0].properties);
      setData(description);
      handleSidebar(false);
      closeButtonHandle[0].classList.add("--show");
      sideBar[0].classList.add("--container-open");
      closeButton[0].classList.remove("--closeButton-close");
      getCitationData(description);
    });

    setMap(map);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (map.getSource("places") && zoom < 13) {
        handleSidebar(true);
        sideBar[0].classList.remove("--container-open");
        closeButton[0].classList.add("--closeButton-close");
      }
    }
  }, [coordinates, zoom]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="mapContainer" />
    </div>
  );
};

const Map = connect(mapStateToProps, mapDispatchToProps)(ConnectedMap);

export default Map;
