import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { connect } from "react-redux";
import {
  getCitationData,
  getMap,
  handleSidebar,
} from "../../../redux/actions/index";
import { heatMap, places, meters } from "./MapLayers";

const axios = require("axios");
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
  const [lng, setLng] = useState(-118.2);
  const [lat, setLat] = useState(34.05);
  const [zoom, setZoom] = useState(15);
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);
  const [mounted, setMounted] = useState(false);

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
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.once("load", () => {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      });
      mapRef.current.appendChild(geocoder.onAdd(map));

      let dataSources = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      };

      map.addSource("places", dataSources);
      map.addLayer(places);

      map.addSource("meters", {
        type: "vector",
        url: "mapbox://breeze094.bqlt7yn4",
      });
      map.addLayer(meters);
    });

    map.on("click", "places", (e) => {
      let description = e.features[0].properties.description;
      handleSidebar(false);
      closeButtonHandle[0].classList.add("--show");
      sideBar[0].classList.add("--container-open");
      closeButton[0].classList.remove("--closeButton-close");
      getCitationData(description);
    });

    map.on("moveend", () => {
      setLng(map.getCenter().lng.toFixed(4));

      setLat(map.getCenter().lat.toFixed(4));

      setZoom(map.getZoom().toFixed(2));
    });
    
    setMap(map);
    setMounted(true);
  }, []);

  //updates the map only when mounted or data is updated
  useEffect(() => {
    if (mounted) {
      updateMap();
    }
  }, [mounted, data]);

  // useEffect(() => {
  //   if (mounted) {

  //   }
  // }, [mounted]);

  useEffect(() => {
    if (zoom >= 13) fetchData();
    if (mounted) {
      // The map removes the points on the map when the zoom level is less than 13
      if (map.getSource("places") && zoom < 13) {
        handleSidebar(true);
        sideBar[0].classList.remove("--container-open");
        closeButton[0].classList.add("--closeButton-close");
      }
    }
  }, [lat, lng, zoom]);

  function fetchData() {
    axios
      .get("/api/citation", {
        params: {
          longitude: lng,
          latitude: lat,
        },
      })
      .then((data) => {
        setData(data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function updateMap() {
    let dataSources = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    };

    let dataFeatures = [];
    data.map((data) =>
      dataFeatures.push({
        type: "Feature",
        properties: {
          description: data,
          icon: "bicycle",
        },
        geometry: {
          type: "Point",
          coordinates: [JSON.parse(data.longitude), JSON.parse(data.latitude)],
        },
      })
    );

    dataSources.data.features = dataFeatures;
 

    map.getSource("places").setData(dataSources);
    
  }

  return (
    <div className="map-container">
      <div ref={mapContainer} className="mapContainer" />
    </div>
  );
};

const Map = connect(mapStateToProps, mapDispatchToProps)(ConnectedMap);

export default Map;
