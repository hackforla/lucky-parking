import React from "react";
import mapboxgl from "mapbox-gl";
import "./mainMap.css";
const axios = require("axios");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

class MainMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -21.92,
      lat: 64.1436456,
      zoom: 2,
      data: [],
    };
  }

  async componentDidMount() {
    await axios
      .get("/api/citation")
      .then((data) => {
        for (let i = 0; i < 1000; i++) {
          this.state.data.push(data.data[i]);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    const map = await new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    });

    map.on("move", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });

    this.state.data.map((data) => {
      let el = document.createElement("div");
      el.className = "marker";
      return new mapboxgl.Marker(el)
        .setLngLat([data.longitude, data.latitude])
        .addTo(map);
    });
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
