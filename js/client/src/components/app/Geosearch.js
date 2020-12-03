import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import mapboxgl from "mapbox-gl";
import { getMap } from "../../redux/actions/index";
import { connect } from "react-redux";

import "react-datepicker/dist/react-datepicker.css";

const axios = require("axios");
const API_URL = process.env.REACT_APP_API_URL;

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

const mapStateToProps = (state) => {
  return { map: state.map };
};

// setState
function mapDispatchToProps(dispatch) {
  return {
    getMap: (map) => dispatch(getMap(map)),
  };
}

const ConnectGeosearch = ({ map, getMap }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const searchContainer = useRef();

  function fetchTimeData() {
    axios
      .get(`${API_URL}/api/timestamp`, {
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      })
      .then((data) => {
        console.log('Time: ' + data.data)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    fetchTimeData();
  }, [startDate, endDate])

  getMap(searchContainer);

  return (
    <div className="geosearch">
      <div className="geosearch__main">
        <div className="testGeoSearch" ref={searchContainer} />
        <div className="geoSearchBarComponents">
          <label>From :</label>
          <DatePicker
            selected={startDate}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="yyyy/MM/dd HH:mm:ss"
            onChange={date => setStartDate(date)}
          />
        </div>
        <div className="geoSearchBarComponents">
          <label>To :</label>
          <DatePicker
            selected={endDate}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="yyyy/MM/dd HH:mm:ss"
            onChange={date => setEndDate(date)}
          />
        </div>
      </div>
    </div>
  );
};

const Geosearch = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectGeosearch);

export default Geosearch;
