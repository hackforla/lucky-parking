import React from "react";
import mapboxgl from "mapbox-gl";
import "./mainMap.css";

let MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

const axios = require("axios");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

class MainMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -77.038659,
      lat: 39,
      zoom: 8,
      data: [],
      map: null,
    };
  }

  async componentDidMount() {
    const map = await new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    });

    this.setState({
      map: map,
    });

    this.state.map.on("move", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });

    this.state.map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      })
    );
  }

  async componentDidUpdate(prevProps, prevState) {
    let points = document.getElementsByClassName("marker").length;

    if (this.state.zoom > 16) {
      if (
        this.state.lat !== prevState.lat ||
        this.state.lng !== prevState.lng
      ) {
        await axios
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
      }
    } else if (this.state.zoom < 16 && points !== 0) {
      let points = document.getElementsByClassName("marker");

      while (points.length > 0) points[0].remove();
    }
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
