import React from "react";
import mapboxgl from "mapbox-gl";

const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

const axios = require("axios");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

class MainMap extends React.Component {
  constructor() {
    super();
    this.state = {
      lng: -118.2,
      lat: 34.05,
      zoom: 15,
      data: [],
      map: null
    };
  }

  async componentDidMount() {
    await this.setState({
      map: new mapboxgl.Map({
        container: this.mapContainer,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [this.state.lng, this.state.lat],
        zoom: this.state.zoom,
      }),
    });

    this.state.map.on("move", async () => {
      await this.setState({
        lng: this.state.map.getCenter().lng.toFixed(4),
        lat: this.state.map.getCenter().lat.toFixed(4),
        zoom: this.state.map.getZoom().toFixed(2),
      });
    });

    this.state.map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        autocomplete: false,
      })
    );
  }
  
  async componentDidUpdate(prevProps, prevState) {
    // The map triggers the http requests when the zoom level is bigger than or equal to 16
    if (this.state.zoom >= 16) {
      // The map updates the data points rendering on the map as the user changes location
      if (
        prevState.lng !== this.state.lng ||
        prevState.lat !== this.state.lat ||
        prevState.zoom !== this.state.zoom
      ) {
        await axios
          .get("/api/citation", {
            params: {
              longitude: this.state.lng,
              latitude: this.state.lat,
            },
          })
          .then(async (data) => {
            await this.setState({
              data: data.data,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }

      let dataSources = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      };

      let dataFeatures = [];
      this.state.data.map((data) => 
        dataFeatures.push({
          type: "Feature",
          properties: {
            description: `<strong>Citation : ${data.violation}</strong><p>IssueDate: ${data.day}, ${data.issuedate}
            Time: ${data.time}  
            Location: ${data.location}</p>`,
            icon: "bicycle"
          },
          geometry: {
            type: "Point",
            coordinates: [JSON.parse(data.long), JSON.parse(data.lat)],
          },
        })
      );

      dataSources.data.features = dataFeatures;

      this.state.map.once("render", () => {
        if (!this.state.map.getSource("places")) {
          this.state.map.addSource("places", dataSources);

          this.state.map.addLayer({
            id: "places",
            type: "symbol",
            source: "places",
            layout: {
              "icon-image": "{icon}-15",
              "icon-allow-overlap": true,
            }
          });
        }
        if (
          (this.state.map.getSource("places") &&
            prevState.lng !== this.state.lng) ||
          prevState.lat !== this.state.lat ||
          prevState.zoom !== this.state.zoom
        ) {
          this.state.map.removeLayer("places");
          this.state.map.removeSource("places");

          this.setState({
            data: [],
          });

          this.state.map.addSource("places", dataSources);

          this.state.map.addLayer({
            id: "places",
            type: "symbol",
            source: "places",
            layout: {
              "icon-image": "{icon}-15",
              "icon-allow-overlap": true,
            }
          });
        }

        var popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        this.state.map.on("click", "places", (e) => {
          this.state.map.getCanvas().style.cursor = "pointer";
          var coordinates = e.features[0].geometry.coordinates.slice();
          var description = e.features[0].properties.description;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          popup
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(this.state.map);
        });

        this.state.map.on("mouseleave", "places", () => {
          this.state.map.getCanvas().style.cursor = "";
          popup.remove();
        });
      });
    }

    // The map removes the points on the map when the zoom level is less than 16
    if (this.state.map.getSource("places") && this.state.zoom < 16) {
      // console.log("triggered");
      this.state.map.removeLayer("places");
      this.state.map.removeSource("places");

      this.setState({
        data: [],
      });
    }
  }

  render() {
    return (
      <div className="map-container">
        {/* <div className="sidebarStyle">
          <div>
            Latitude: {this.state.lat} | Longitude: {this.state.lng} | Zoom:{" "}
            {this.state.zoom}
          </div>
        </div> */}
        <div ref={(el) => (this.mapContainer = el)} className="mapContainer" />
      </div>
    );
  }
}

export default MainMap;
