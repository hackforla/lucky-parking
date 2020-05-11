import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { connect } from "react-redux";
import { getCitationData } from "../../redux/actions/index";

const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

const axios = require("axios");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

function mapDispatchToProps(dispatch) {
  return {
    getCitationData: (test) => dispatch(getCitationData(test)),
  };
}

const ConnectedMap = ({ getCitationData }) => {
  const [lng, setLng] = useState(-118.2);
  const [lat, setLat] = useState(34.05);
  const [zoom, setZoom] = useState(15);
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);
  const [mounted, setMounted] = useState(false);

  const mapContainer = useRef();

  useEffect(() => {
    (async () => {
      await setMap(
        new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [lng, lat],
          zoom: zoom,
        })
      );
      await map.on("move", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });
      await map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          autocomplete: false,
        })
      );
    })();
  }, []);

  useEffect(() => {
    // The map triggers the http requests when the zoom level is bigger than or equal to 16
    if (zoom >= 16) {
      // The map updates the data points rendering on the map as the user changes locatio
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
            description: {
              violation: data.violation,
              day: data.day,
              issueDate: data.issuedate,
              time: data.time,
              location: data.location,
            },
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
        if (!map.getSource("places")) {
          map.addSource("places", dataSources);

          map.addLayer({
            id: "places",
            type: "symbol",
            source: "places",
            layout: {
              "icon-image": "{icon}-15",
              "icon-allow-overlap": true,
            },
          });
        }
        if (map.getSource("places")) {
          map.removeLayer("places");
          map.removeSource("places");

          setData([]);

          map.addSource("places", dataSources);

          map.addLayer({
            id: "places",
            type: "symbol",
            source: "places",
            layout: {
              "icon-image": "{icon}-15",
              "icon-allow-overlap": true,
            },
          });
        }

        map.on("click", "places", (e) => {
          let description = e.features[0].properties.description;

          getCitationData(description);
        });
      });
    }
    if (map !== null) {
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

const Map = connect(null, mapDispatchToProps)(ConnectedMap);

export default Map;
