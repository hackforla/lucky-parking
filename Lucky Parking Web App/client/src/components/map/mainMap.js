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
      mrkLng: 20,
      mrkLat: 20,
    };
  }

  componentDidMount() {
    axios.get("/api/location").then((data) => {
      console.log(data.data);
      this.setState({
        mrkLng: Number(data.data[0].longitude),
        mrkLat: Number(data.data[0].latitude),
      });
    });

    const map = new mapboxgl.Map({
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

    setTimeout(() => {
      new mapboxgl.Marker()
        .setLngLat([this.state.mrkLng, this.state.mrkLat])
        .addTo(map);
    }, 1000);
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
