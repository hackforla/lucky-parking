import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import FreehandMode from 'mapbox-gl-draw-freehand-mode';
import { connect } from "react-redux";
import {
  getCitationData,
  getMap,
  handleSidebar,
  handleDrawing,
  getPolygonData,
  getRangeActive,
} from "../../../redux/actions/index";
import { heatMap, places } from "./MapLayers";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';


const axios = require("axios");
const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

const API_URL = process.env.REACT_APP_API_URL;
mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

function mapDispatchToProps(dispatch) {
  return {
    getCitationData: (test) => dispatch(getCitationData(test)),
    getMap: (mapRef) => dispatch(getMap(mapRef)),
    handleSidebar: (isSidebarOpen) => dispatch(handleSidebar(isSidebarOpen)),
    handleDrawing: (drawingPresent) => dispatch(handleDrawing(drawingPresent)),
    getPolygonData: (polygonData) => dispatch(getPolygonData(polygonData)),
    getRangeActive: (activateDateRange) => dispatch(getRangeActive(activateDateRange)),
  };
}

const mapStateToProps = (state) => {
  return {
    citation: state.citation,
    mapRef: state.mapRef,
    isSidebarOpen: state.isSidebarOpen,
    activateDateRange: state.activateDateRange,
    startDate: state.startDate,
    endDate: state.endDate,
    drawingPresent: state.drawingPresent,
  };
};

const ConnectedMap = ({
  getCitationData,
  mapRef,
  isSidebarOpen,
  handleSidebar,
  activateDateRange,
  startDate,
  endDate,
  drawingPresent,
  handleDrawing,
  getPolygonData,
}) => {
  const [coordinates, setCoordinates] = useState({ lng: [], lat: [] });

  const [zoom, setZoom] = useState(12.5);
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
    //axios.get(API_URL).then(data => console.log(data));

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyle,
      center: [-118.373330, 34.060959],
      zoom: zoom,
      
    });

    map.on('load', () => {
      var bounds = map.getBounds().toArray();
      setCoordinates({
        lng: bounds[0],
        lat: bounds[1],
      });
    })

    var draw = new MapboxDraw({
      modes: Object.assign(MapboxDraw.modes, {
        draw_polygon: FreehandMode
      }),
      displayControlsDefault: false,
      controls: {
      polygon: true,
      trash: true
    }
    });
    
    map.addControl(draw, 'top-right');
    map.addControl(new mapboxgl.NavigationControl({showCompass: false}), "bottom-right");

    const drawnData = async () => {
      var drawData = draw.getAll();
      
      try {
        const response = await axios
        .get(`${API_URL}/api/citation/draw`, {
          params: {
            polygon: drawData.features[0].geometry.coordinates,
          },
        })
        setData(response.data);
        getPolygonData(drawData.features[0].geometry.coordinates);
        handleDrawing(true);
        sideBar[0].classList.add("--container-open");
        map.off("click", "places", layerClick)
        var drawPolygon = document.getElementsByClassName('mapbox-gl-draw_polygon');
        drawPolygon[0].disabled = true;
        drawPolygon[0].classList.add('disabled-button');
      } catch (err) {
        console.log(err);
      }
    }

    map.on('draw.create', () => {drawnData(); map.scrollZoom.disable();});
    map.on('draw.update', () => drawnData())
    map.on('draw.delete', 
      () => {
        handleDrawing(false); 
        sideBar[0].classList.remove("--container-open");
        map.on("click", "places", layerClick);
        var drawPolygon = document.getElementsByClassName('mapbox-gl-draw_polygon');
        drawPolygon[0].disabled = false;
        drawPolygon[0].classList.remove('disabled-button');
        map.scrollZoom.enable();
    })

    map.on('zoomend', () => {
      var zoomLevel = map.getZoom()
      var drawPolygon = document.getElementsByClassName('mapbox-gl-draw_polygon');
      if (zoomLevel < 12) {
        drawPolygon[0].disabled = true;
        drawPolygon[0].classList.add('disabled-button');
      } else if (zoomLevel > 12) {
        drawPolygon[0].disabled = false;
        drawPolygon[0].classList.remove('disabled-button');
      }
    })

    map.on('mouseenter', 'places', () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'places', () => {
      map.getCanvas().style.cursor = ''
    })

    map.once("style.load", () => {
      let dataSources = {
        type: "geojson",
        data: null,
      };

      map.addSource("places", dataSources);
      map.addLayer(places);
      map.addLayer(heatMap);

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      });
      mapRef.current.appendChild(geocoder.onAdd(map));
    });

    const layerClick = (e) => {
      axios
        .get(`${API_URL}/api/citation/point`, {
          params: {
            index: e.features[0].properties.description,
          },
        })
        .then((data) => {
          getCitationData(data.data[0]);
        })
        .catch((error) => {
          console.log(error);
        })
  
        handleSidebar(false);
        closeButtonHandle[0].classList.add("--show");
        sideBar[0].classList.add("--container-open");
        closeButton[0].classList.remove("--closeButton-close");
    }

    map.on("click", "places", layerClick);
    map.on("touchend", "places", layerClick);

    map.on("moveend", () => {
      var bounds = map.getBounds().toArray();
      setCoordinates({
        lng: bounds[0],
        lat: bounds[1],
      });
      setZoom(map.getZoom().toFixed(2));
    });
    setMap(map);
    setMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (mounted) {
      map.getSource("places").setData(data);
    }
  }, [data]);

  useEffect(() => {
    if (mounted && drawingPresent === false) {
      fetchData();
      if (map.getSource("places") && zoom < 13) {
        handleSidebar(true);
        sideBar[0].classList.remove("--container-open");
        closeButton[0].classList.add("--closeButton-close");
      }
    }
  }, [coordinates, zoom, drawingPresent, startDate, endDate, activateDateRange]);

  function fetchData() {
    activateDateRange ?
      axios
        .get(`${API_URL}/api/timestamp`, {
          params: {
            longitude: coordinates.lng,
            latitude: coordinates.lat,
            startDate: new Date(startDate).toLocaleString(),
            endDate: new Date(endDate).toLocaleString(),
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
          map.getSource("places").setData(data.data);
        })
        .catch((error) => {
          console.log(error);
        })
  }

  return (
    <div className="map-container">
      <div ref={mapContainer} className="mapContainer" />
    </div>
  );
};

const Map = connect(mapStateToProps, mapDispatchToProps)(ConnectedMap);

export default Map;
