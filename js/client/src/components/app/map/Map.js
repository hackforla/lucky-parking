import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import FreehandMode from "mapbox-gl-draw-freehand-mode";
import { connect } from "react-redux";
import {
  getCitationData,
  getMap,
  handleSidebar,
  handleDrawing,
  getPolygonData,
  getRangeActive,
  toggleSearchDate,
} from "../../../redux/actions/index";
import { heatMap, places, zipcodes, zipCodeLines } from "./MapLayers";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import polylabel from "polylabel";
import PropTypes from "prop-types";
import axios from "axios";
import turfArea from "@turf/area";
const turfPolygon = require("@turf/helpers");
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
    getRangeActive: (activateDateRange) =>
      dispatch(getRangeActive(activateDateRange)),
    toggleSearchDate: (isSearchDateClicked) => dispatch(toggleSearchDate(isSearchDateClicked)),
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
    isSearchDateClicked: state.isSearchDateClicked,
  };
};

const ConnectedMap = ({
  getCitationData,
  mapRef,
  handleSidebar,
  activateDateRange,
  startDate,
  endDate,
  drawingPresent,
  handleDrawing,
  getPolygonData,
  isSearchDateClicked,
}) => {
  const [coordinates, setCoordinates] = useState({ lng: [], lat: [] });
  const [zoom, setZoom] = useState(12.5);
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [zipLayer, setZipLayer] = useState(null);
  const hoverZip = useRef(null);
  const activeZip = useRef(null);

  const updateActiveZip = (zip) => activeZip.current = zip === activeZip.current ? null : zip;

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

    // why the bounds are [lon,lat] I don't understand
    // but that's what mapbox expects
    const bounds = [
      [-118.67962814689666, 33.63116512843463], // Southwest Lon, Lat
      [-117.8593163974756, 34.352283062977925], // Northeast Lon, Lat
    ];

    class ZipToggle {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("button");
        this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
        this._container.id = "zip-toggle-button";
        var icon = document.createElement("img");
        icon.src =
          "https://img.icons8.com/material-outlined/24/000000/zip-code.png";
        this._container.appendChild(icon);
        this._container.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          // const zipSource = {
          //   type: "vector",
          //   url: "mapbox://mg78856.3vymwflo",
          // }

          var visibility = map.getLayoutProperty("zipcodes", "visibility");

          if (visibility === "visible") {
            map.setLayoutProperty("zipcodes", "visibility", "none");
            map.setLayoutProperty("zipcodeLines", "visibility", "none");
            map.setLayoutProperty("heatmap", "visibility", "visible");
            map.setLayoutProperty("places", "visibility", "visible");
            map.on("click", "places", layerClick);
            handleDrawing(false);
            sideBar[0].classList.remove("--container-open");
          } else {
            map.setLayoutProperty("zipcodes", "visibility", "visible");
            map.setLayoutProperty("zipcodeLines", "visibility", "visible");
            map.setLayoutProperty("heatmap", "visibility", "none");
            map.setLayoutProperty("places", "visibility", "none");
            map.off("click", "places", layerClick);
          }
        };
        return this._container;
      }

      onRemove() {
        updateActiveZip(null);
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyle,
      center: [-118.37333, 34.060959],
      zoom: zoom,
      maxBounds: bounds,
    });

    map.on("load", () => {
      var bounds = map.getBounds().toArray();
      setCoordinates({
        lng: bounds[0],
        lat: bounds[1],
      });
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        // for some reason, the bounds this is making is between Santa Monica (lower left) and slightly above the Getty (upper right)
        // which breaks search functionality... hard coding the search to LA metropolitan area until a proper fix is added
        // bbox: [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
        bbox: [-118.6796, 33.6311, -117.8593, 34.3522],
        placeholder: "Search location",
      });
      mapRef.current.appendChild(geocoder.onAdd(map));
    });

    // for the time being, simplify the draw tool
    var draw = new MapboxDraw({
      // modes: Object.assign(MapboxDraw.modes, {
      //   draw_polygon: FreehandMode,
      // }),
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    const zipToggle = new ZipToggle();

    map.addControl(draw, "top-right");
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );
    map.addControl(zipToggle);

    // Add tooltip instructions to the buttons in upper right
    // TODO: eventually could put this in a loop of some kind but it's only 3 buttons right now

    const zipButton = document.getElementById("zip-toggle-button");
    zipButton.setAttribute("data-for", "button-tooltip");
    zipButton.setAttribute(
      "data-tip",
      "Click to Toggle Zip Code Layer On or Off"
    );

    const polygonButton = document.getElementsByClassName(
      "mapbox-gl-draw_polygon"
    )[0];

    polygonButton.setAttribute("data-for", "button-tooltip");
    polygonButton.setAttribute("data-tip", "Click to Draw a Polygon Selection");

    const trashButton = document.getElementsByClassName(
      "mapbox-gl-draw_trash"
    )[0];
    trashButton.setAttribute("data-for", "button-tooltip");
    trashButton.setAttribute("data-tip", "Click to Delete Polygon Selection");

    let tooltip = (
      <ReactTooltip
        id="button-tooltip"
        getContent={(dataTip) => `${dataTip}`}
      />
    );
    let tooltip_div = document.createElement("div");

    // arbitrary location, could go anywhere since the tooltip will
    // relocate to float over hovered button

    zipButton.appendChild(tooltip_div);
    ReactDOM.render(tooltip, tooltip_div);

    /*
      When a polygon is drawn via the polygon tool,
      data for each citation in the polygon will be 
      displayed on the map and the side graph.
    */
    const drawnData = async () => {
      var drawData = draw.getAll();

      try {
        const response = await axios.get(`${API_URL}/api/citation/draw`, {
          params: {
            polygon: drawData.features[0].geometry.coordinates,
          },
        });
        setData(response.data);
        getPolygonData(drawData.features[0].geometry.coordinates);
        handleDrawing(true);
        sideBar[0].classList.add("--container-open");
        map.off("click", "places", layerClick);
        var drawPolygon = document.getElementsByClassName(
          "mapbox-gl-draw_polygon"
        );
        drawPolygon[0].disabled = true;
        drawPolygon[0].classList.add("disabled-button");

        cameraMovement(drawData.features[0].geometry.coordinates);
      } catch (err) {
        console.log(err);
      }
    };

    /*
      When a zip is selected during the zip layer toggle,
      data for each citation in the zipcode will be 
      displayed on the map and the side graph.
    */
    const zipStatics = async (zip) => {
      try {
        const response = await axios.get(`${API_URL}/api/citation/draw/zip`, {
          params: {
            zip: zip,
          },
        });
        setData(response.data);
        getPolygonData(zip);
        handleDrawing(true);
        sideBar[0].classList.add("--container-open");
        map.setLayoutProperty("heatmap", "visibility", "visible");
        map.setLayoutProperty("places", "visibility", "visible");
      } catch (err) {
        console.log(err);
      }
    };

    /*
      Dictates camera movement during 
      zip layer toggle or polygon tool toggle
    */
    const cameraMovement = (polygonCoordinates) => {
      // Pole of inaccessibility of a region
      const center = polylabel(polygonCoordinates);
      // Will be used to find the area of the region
      const polygon = turfPolygon.polygon(polygonCoordinates);
      
      /*
        Use a slight offset for the x-axis so the selected
        zip is not covered by the citation summary side window.
      */ 
      const offset = 0.02;
      const adjustedCenter = [center[0] - offset, center[1]];
      
      const area = turfArea(polygon);
      const areaCutoffs = {
        first: 20000000,
        second: 100000000,
      };  

      /*
        Zoom level is determined by the area cut offs,
        where the bigger the area gets, the bigger the zoom is.
      */               
      if (area < areaCutoffs.first) {
        map.easeTo({ center: adjustedCenter, zoom: 13});
      }
      else if (area < areaCutoffs.second) {
        map.easeTo({ center: adjustedCenter, zoom: 12});
      }
      else {
        map.easeTo({ center: adjustedCenter, zoom: 11.5});
      }
    };

    map.on("draw.create", () => {
      drawnData();
      map.scrollZoom.disable();
    });
    map.on("draw.update", () => drawnData());
    map.on("draw.delete", () => {
      handleDrawing(false);
      sideBar[0].classList.remove("--container-open");
      map.on("click", "places", layerClick);
      var drawPolygon = document.getElementsByClassName(
        "mapbox-gl-draw_polygon"
      );
      drawPolygon[0].disabled = false;
      drawPolygon[0].classList.remove("disabled-button");
      map.scrollZoom.enable();
    });

    // disable polygon tool when zoomed too far out
    // degrades performance when someone selects everything

    map.on("zoomend", () => {
      var zoomLevel = map.getZoom();
      var drawPolygon = document.getElementsByClassName(
        "mapbox-gl-draw_polygon"
      );
      if (zoomLevel < 12) {
        drawPolygon[0].disabled = true;
        drawPolygon[0].classList.add("disabled-button");
      } else if (zoomLevel > 12) {
        drawPolygon[0].disabled = false;
        drawPolygon[0].classList.remove("disabled-button");
      }
    });

    // change cursor when on map

    map.on("mouseenter", "places", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "places", () => {
      map.getCanvas().style.cursor = "";
    });

    /* 
      On click event when zip layer is toggled.
    */
    map.on("click", "zipcodes", (e) => {
      const zip = e.features[0].properties.zipcode;
      if (zip === activeZip.current) {
        map.setLayoutProperty('heatmap', 'visibility', 'none');
        map.setLayoutProperty('places', 'visibility', 'none');
        sideBar[0].classList.remove("--container-open");
      } else {
        const zipSource = map.getSource('zipcodes');
        const zipGeometry = {};
        // From all the possible zipcodes, get the specific zip only
        for (let element of zipSource['_data'].features){
          if (element.id === zip){
            zipGeometry.data = element;
            break;
          }
        }
        zipStatics(zip);
        cameraMovement(zipGeometry.data.geometry.coordinates[0]);
      }
      updateActiveZip(zip);
    });

    // Show zip code tooltip when
    // hovering over the zip code layer

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on("mousemove", "zipcodes", (e) => {
      const zip = e.features[0].properties.zipcode;
      if (hoverZip !== null) {
        map.setFeatureState(
          { source: "zipcodes", id: hoverZip.current },
          { hover: false }
        );
      }
      hoverZip.current = zip;
      popup.setLngLat(e.lngLat).setText(hoverZip.current).addTo(map);
      map.setFeatureState(
        { source: "zipcodes", id: hoverZip.current },
        { hover: true }
      );
    });

    map.on("mouseleave", "zipcodes", () => {
      popup.remove();
    });

    // add layers and sources

    map.once("style.load", () => {
      let dataSources = {
        type: "geojson",
        data: null,
      };
      const zipSource = {
        type: "geojson",
        //url: "mapbox://mg78856.3vymwflo",
        data: null,
      };

      map.addSource("places", dataSources);
      map.addSource("zipcodes", zipSource);
      map.addSource("zipCodeLines", zipSource);
      map.addLayer(zipcodes);
      map.addLayer(zipCodeLines);
      map.addLayer(places);
      map.addLayer(heatMap);
    });

    // display individual citation data on click

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
        });

      handleSidebar(false);
      closeButtonHandle[0].classList.add("--show");
      sideBar[0].classList.add("--container-open");
      closeButton[0].classList.remove("--closeButton-close");
    };

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
      if (zipLayer === null) {
        fetchZipLayer();
      }
      if (map.getSource("places") && zoom < 13) {
        handleSidebar(true);
        sideBar[0].classList.remove("--container-open");
        closeButton[0].classList.add("--closeButton-close");
      }
    }
  }, [
    coordinates,
    zoom,
    drawingPresent,
    activateDateRange,
    isSearchDateClicked,
  ]);

  function fetchData() {
    activateDateRange
      ? axios
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
      : axios
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
          });
  }

  function fetchZipLayer() {
    axios
      .get(`${API_URL}/api/zipcodes`, {})
      .then((data) => {
        setZipLayer(data.data);
        map.getSource("zipcodes").setData(data.data);
      })
      .catch((error) => {
        console.log(error);
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

Map.propTypes = {
  getCitationData: PropTypes.func,
  mapRef: PropTypes.object,
  handleSidebar: PropTypes.func,
  activateDateRange: PropTypes.bool,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  drawingPresent: PropTypes.bool,
  handleDrawing: PropTypes.func,
  getPolygonData: PropTypes.func,
  isSearchDateClicked: PropTypes.bool,
  toggleSearchDate: PropTypes.func,
};
