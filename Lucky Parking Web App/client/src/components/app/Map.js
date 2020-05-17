import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { connect } from "react-redux";
import { getCitationData, getMap } from "../../redux/actions/index";

const axios = require("axios");
const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

function mapDispatchToProps(dispatch) {
  return {
    getCitationData: (test) => dispatch(getCitationData(test)),
    getMap: (mapRef) => dispatch(getMap(mapRef)),
  };
}

const mapStateToProps = (state) => {
  return { citation: state.citation, mapRef: state.mapRef };
};

const ConnectedMap = ({ getCitationData, mapRef }) => {
  const [lng, setLng] = useState(-118.2);
  const [lat, setLat] = useState(34.05);
  const [zoom, setZoom] = useState(15);
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);
  const [mounted, setMounted] = useState(false);

  const mapContainer = useRef();

  useEffect(() => {
    setMap(
      new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: zoom,
      })
    );

    setMounted(true);
  }, []);

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
    // The map triggers the http requests when the zoom level is bigger than or equal to 16
    if (zoom >= 16) {
      // The map updates the data points rendering on the map as the user changes location
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
            coordinates: [JSON.parse(data.long), JSON.parse(data.lat)],
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
        if (!map.getSource("places")) {
          map.addSource("places", dataSources);
          map.addLayer(places);
        } else {
          map.removeLayer("places");
          map.removeSource("places");

          map.addSource("places", dataSources);
          map.addLayer(places);
        }

        map.on("click", "places", (e) => {
          let description = e.features[0].properties.description;

          getCitationData(description);
        });
      });
    }
    if (mounted) {
      // The map removes the points on the map when the zoom level is less than 16
      if (map.getSource("places") && zoom < 16) {
        map.removeLayer("places");
        map.removeSource("places");

        setData([]);
      }
    }
  }, [lat, lng, zoom]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="mapContainer" />
    </div>
  );
};

const Map = connect(mapStateToProps, mapDispatchToProps)(ConnectedMap);

export default Map;
