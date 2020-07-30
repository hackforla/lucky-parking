import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { connect } from "react-redux";
import {
  getCitationData,
  getMap,
  handleSidebar,
} from "../../redux/actions/index";

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
    setMap(
      new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: zoom,
      })
    );
    fetchData();
    setMounted(true);
  }, []);

  //updates the map only when mounted or data is updated
  useEffect(() => {
    if (mounted) {
      updateMap();
    }
  }, [mounted, data]);

  useEffect(() => {
    if (mounted) {
      map.on("move", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      });

      mapRef.current.appendChild(geocoder.onAdd(map));
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      // The map removes the points on the map when the zoom level is less than 10
      if (map.getSource("places") && zoom < 10) {
        map.removeLayer("places");
        map.removeSource("places");
        map.removeLayer("meter");
        map.removeSource("meter");
        handleSidebar(true);
        sideBar[0].classList.remove("--container-open");
        closeButton[0].classList.add("--closeButton-close");
        setData([]);
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
    console.log("i fetched data");
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

    map.once("render", () => {
      const places = {
        id: "places",
        type: "symbol",
        source: "places",
        layout: {
          "icon-image": "{icon}-15",
          "icon-allow-overlap": true,
        },
      };
      const meters = {
        id: "meter",
        source: "meter",
        type: "line",
        "source-layer": "meter_lines-1l60am",
        paint: {
          "line-color": "#e50cff",
          "line-width": 2,
        },
      };
      if (!map.getSource("places") && !map.getSource("meter")) {
        map.addSource("places", dataSources);
        map.addSource("meter", {
          type: "vector",
          url: "mapbox://breeze094.bqlt7yn4",
        });
        map.addLayer(meters);
        map.addLayer(places);
      } else {
        map.removeLayer("places");
        map.removeSource("places");

        map.addSource("places", dataSources);
        map.addLayer(places);
      }

      map.on("click", "places", (e) => {
        let description = e.features[0].properties.description;
        handleSidebar(false);
        closeButtonHandle[0].classList.add("--show");
        sideBar[0].classList.add("--container-open");
        closeButton[0].classList.remove("--closeButton-close");
        getCitationData(description);
      });
    });
  }

  return (
    <div className="map-container">
      <div ref={mapContainer} className="mapContainer" />
    </div>
  );
};

const Map = connect(mapStateToProps, mapDispatchToProps)(ConnectedMap);

export default Map;
