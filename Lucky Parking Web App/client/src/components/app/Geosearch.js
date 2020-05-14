import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import mapboxgl from "mapbox-gl";

import { connect } from "react-redux";

import "react-datepicker/dist/react-datepicker.css";

const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

const mapStateToProps = (state) => {
  return { map: state.map };
};

const ConnectGeosearch = ({ map }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [geocoder, setGeocoder] = useState(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: map,
      autocomplete: false,
    })
  );

  const searchContainer = useRef();

  useEffect(() => {
    searchContainer.current.appendChild(geocoder.onAdd(map));
  }, [geocoder]);

  return (
    <div className="geosearch">
      <div className="testGeoSearch" ref={searchContainer} />
      <div className="geosearch__main">
        From :
        <DatePicker
          selected={startDate}
          onChange={(e) => {
            setStartDate(e);
          }}
        />
        <select
          className="geosearch__main-time-select"
          style={{ marginRight: "5rem" }}
        >
          <option>12:00 AM</option>
          <option>12:30 AM</option>
          <option>1:00 AM</option>
          <option>1:30 AM</option>
          <option>2:00 AM</option>
          <option>2:30 AM</option>
          <option>3:00 AM</option>
          <option>3:30 AM</option>
          <option>4:00 AM</option>
          <option>4:30 AM</option>
          <option>5:00 AM</option>
          <option>5:30 AM</option>
          <option>6:00 AM</option>
          <option>6:30 AM</option>
          <option>7:00 AM</option>
          <option>7:30 AM</option>
          <option>8:00 AM</option>
          <option>8:30 AM</option>
          <option>9:00 AM</option>
          <option>9:30 AM</option>
          <option>10:00 AM</option>
          <option>10:30 AM</option>
          <option>11:00 AM</option>
          <option>11:30 AM</option>
          <option>12:00 PM</option>
          <option>12:30 PM</option>
          <option>1:00 PM</option>
          <option>1:30 PM</option>
          <option>2:00 PM</option>
          <option>2:30 PM</option>
          <option>3:00 PM</option>
          <option>3:30 PM</option>
          <option>4:00 PM</option>
          <option>4:30 PM</option>
          <option>5:00 PM</option>
          <option>5:30 PM</option>
          <option>6:00 PM</option>
          <option>6:30 PM</option>
          <option>7:00 PM</option>
          <option>7:30 PM</option>
          <option>8:00 PM</option>
          <option>8:30 PM</option>
          <option>9:00 PM</option>
          <option>9:30 PM</option>
          <option>10:00 PM</option>
          <option>10:30 PM</option>
          <option>11:00 PM</option>
          <option>11:30 PM</option>
        </select>
        To :
        <DatePicker
          selected={endDate}
          onChange={(e) => {
            setEndDate(e);
          }}
        />
        <select className="geosearch__main-time-select">
          <option>12:00 AM</option>
          <option>12:30 AM</option>
          <option>1:00 AM</option>
          <option>1:30 AM</option>
          <option>2:00 AM</option>
          <option>2:30 AM</option>
          <option>3:00 AM</option>
          <option>3:30 AM</option>
          <option>4:00 AM</option>
          <option>4:30 AM</option>
          <option>5:00 AM</option>
          <option>5:30 AM</option>
          <option>6:00 AM</option>
          <option>6:30 AM</option>
          <option>7:00 AM</option>
          <option>7:30 AM</option>
          <option>8:00 AM</option>
          <option>8:30 AM</option>
          <option>9:00 AM</option>
          <option>9:30 AM</option>
          <option>10:00 AM</option>
          <option>10:30 AM</option>
          <option>11:00 AM</option>
          <option>11:30 AM</option>
          <option>12:00 PM</option>
          <option>12:30 PM</option>
          <option>1:00 PM</option>
          <option>1:30 PM</option>
          <option>2:00 PM</option>
          <option>2:30 PM</option>
          <option>3:00 PM</option>
          <option>3:30 PM</option>
          <option>4:00 PM</option>
          <option>4:30 PM</option>
          <option>5:00 PM</option>
          <option>5:30 PM</option>
          <option>6:00 PM</option>
          <option>6:30 PM</option>
          <option>7:00 PM</option>
          <option>7:30 PM</option>
          <option>8:00 PM</option>
          <option>8:30 PM</option>
          <option>9:00 PM</option>
          <option>9:30 PM</option>
          <option>10:00 PM</option>
          <option>10:30 PM</option>
          <option>11:00 PM</option>
          <option>11:30 PM</option>
        </select>
      </div>
    </div>
  );
};

const Geosearch = connect(mapStateToProps)(ConnectGeosearch);

export default Geosearch;
