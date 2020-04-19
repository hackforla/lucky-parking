import React from "react";
import mapboxgl from "mapbox-gl";
import "./mainMap.css";

const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

const axios = require("axios");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

class MainMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -118.2,
      lat: 34.05,
      zoom: 15,
      data: [],
      map: null,
    };
  }

  async componentDidMount() {
    this.setState({
      map: await new mapboxgl.Map({
        container: this.mapContainer,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [this.state.lng, this.state.lat],
        zoom: this.state.zoom,
      }),
    });

    this.state.map.on("move", () => {
      this.setState({
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

  componentDidUpdate(prevProps, prevState) {
    // let points = document.getElementsByClassName("marker").length;

    if (this.state.zoom >= 16) {
      if (
        this.state.lat !== prevState.lat ||
        this.state.lng !== prevState.lng
      ) {
        axios
          .get("/api/citation", {
            params: {
              longitude: this.state.lng,
              latitude: this.state.lat,
            },
          })
          .then((data) => {
            this.setState({
              data: data.data,
            });
          })
          .catch((error) => {
            console.log(error);
          });

        prevState.map.on("render", function () {
          if (!prevState.map.getSource("places")) {
            prevState.map.addSource("places", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    properties: {
                      description:
                        "<strong>Make it Mount Pleasant</strong><p>Make it Mount Pleasant is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>",
                      icon: "theatre",
                    },
                    geometry: {
                      type: "Point",
                      coordinates: [-118.2, 34.05],
                    },
                  },
                ],
              },
            });

            // Add a layer showing the places.
            prevState.map.addLayer({
              id: "places",
              type: "symbol",
              source: "places",
              layout: {
                "icon-image": "{icon}-15",
                "icon-allow-overlap": true,
              },
            });

            // Create a popup, but don't add it to the map yet.
            var popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
            });

            prevState.map.on("mouseenter", "places", function (e) {
              // Change the cursor style as a UI indicator.
              prevState.map.getCanvas().style.cursor = "pointer";

              var coordinates = e.features[0].geometry.coordinates.slice();
              var description = e.features[0].properties.description;

              // Ensure that if the map is zoomed out such that multiple
              // copies of the feature are visible, the popup appears
              // over the copy being pointed to.
              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }

              // Populate the popup and set its coordinates
              // based on the feature found.
              popup
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(prevState.map);
            });

            prevState.map.on("mouseleave", "places", function () {
              prevState.map.getCanvas().style.cursor = "";
              popup.remove();
            });
          }
        });
      }

      // this.state.data.map((data) => {
      //   let el = document.createElement("div");
      //   el.className = "marker";

      //   let longitude = JSON.parse(data.long);
      //   let latitude = JSON.parse(data.lat);
      //   return new mapboxgl.Marker(el)
      //     .setLngLat([longitude, latitude])
      //     .addTo(this.state.map);
      // });
    }
    // else if (this.state.zoom <= 16 && points !== 0) {
    //   let points = document.getElementsByClassName("marker");

    //   while (points.length > 0) points[0].remove();
    // }
  }

  render() {
    return (
      <div>
        <div className="sidebarStyle">
          <div>
            Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom:{" "}
            {this.state.zoom}
          </div>
        </div>
        <div ref={(el) => (this.mapContainer = el)} className="mapContainer" />
      </div>
    );
  }
}

export default MainMap;
