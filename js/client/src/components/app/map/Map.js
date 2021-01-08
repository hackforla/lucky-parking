import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { connect } from "react-redux";
import {
  getCitationData,
  getMap,
  handleSidebar,
} from "../../../redux/actions/index";
import { heatMap, places } from "./MapLayers";


const axios = require("axios");
const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

const API_URL = process.env.REACT_APP_API_URL;
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
    activateDateRange: state.activateDateRange,
    startDate: state.startDate,
    endDate: state.endDate
  };
};

const ConnectedMap = ({
  getCitationData,
  mapRef,
  isSidebarOpen,
  handleSidebar,
  activateDateRange,
  startDate,
  endDate
}) => {
  const [coordinates, setCoordinates] = useState({ lng: [-118.21064300537162, 34.043039338159375], lat: [-118.18931407928518, 34.05671120815498] });

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
    // just to see if we're hitting the API
    axios.get(API_URL).then(data => console.log(data));

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyle,
      center: [-118.2, 34.05],
      zoom: zoom,
      
    });

    map.once("style.load", () => {
      let dataSources = {
        type: "geojson",
        data: null,
      };

      map.addSource("places", dataSources);
      map.addLayer(places);
      map.addLayer(heatMap);

      console.log("beginning " + dataSources);


      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      });
      mapRef.current.appendChild(geocoder.onAdd(map));
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
      var bounds = map.getBounds().toArray();
      setCoordinates({
        lng: bounds[0],
        lat: bounds[1],
      });
      setZoom(map.getZoom().toFixed(2));
    });

    fetchData();
    setMap(map);
    setMounted(true);
  }, []);

  //updates the map only when mounted or data is updated
  useEffect(() => {
    if (mounted) {
      updateMap();
    }
  }, [data]);

  useEffect(() => {
    if (mounted) {
      fetchData();
      if (map.getSource("places") && zoom < 13) {
        handleSidebar(true);
        sideBar[0].classList.remove("--container-open");
        closeButton[0].classList.add("--closeButton-close");
      }
    }
  }, [coordinates, zoom]);

  function fetchData() {
    activateDateRange ?
      axios
        .get(`${API_URL}/api/timestamp`, {
          params: {
            longitude: coordinates.lng,
            latitude: coordinates.lat,
            startDate: new Date(startDate).toLocaleDateString(),
            endDate: new Date(endDate).toLocaleDateString(),
          },
        })
        .then((data) => {
          setData(data.data);
        })
        .catch((error) => {
          console.log(error);
        })
    :
      axios
        .get(`${API_URL}/api/citation`, {
          params: {
            longitude: coordinates.lng,
            latitude: coordinates.lat,
          },
        })
        .then((data) => {
          setData(data.data);
        })
        .catch((error) => {
          console.log(error);
        })
  }

  function updateMap() {
    let dataSources = {
      type: "FeatureCollection",
      features: [],
    };

    let dataFeatures = data.map((data) => {
      return {
        type: "Feature",
        properties: {
          description: data,
        },
        geometry: {
          type: "Point",
          coordinates: [JSON.parse(data.longitude), JSON.parse(data.latitude)],
        },
      };
    });

    dataSources.features = dataFeatures;
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
