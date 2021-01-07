import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import mapboxgl from "mapbox-gl";
import {
   getMap,
   getRangeActive,
   getStartDate,
   getEndDate,
} from "../../redux/actions/index";
import { connect } from "react-redux";

import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.REACT_APP_API_URL;

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

const mapStateToProps = (state) => {
  return {
     map: state.map,
     startDate: state.startDate,
     endDate: state.endDate,
     activateDateRange: state.activateDateRange,
    };
};

// setState
function mapDispatchToProps(dispatch) {
  return {
    getMap: (map) => dispatch(getMap(map)),
    getRangeActive: (activateDateRange) => dispatch(getRangeActive(activateDateRange)),
    getStartDate: (startDate) => dispatch(getStartDate(startDate)),
    getEndDate: (endDate) => dispatch(getEndDate(endDate)),
  };
}

const ConnectGeosearch = ({
  map,
  getMap,
  startDate,
  endDate,
  getEndDate,
  getStartDate,
  getRangeActive,
}) => {
  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date());
  const [dateRangeActive, setDateRangeActive] = useState(false);

  const searchContainer = useRef();

  // function fetchTimeData() {
  //   axios
  //     .get(`${API_URL}/api/timestamp`, {
  //       params: {
  //         startDate: new Date(startDate).toLocaleDateString(),
  //         endDate: new Date(endDate).toLocaleDateString(),
  //       },
  //     })
  //     .then((data) => {
  //       console.log('Time: ' + data.data)
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }

  useEffect(() => {
    setDateRangeActive(true);
    getRangeActive(dateRangeActive)
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
            dateFormat="MM/dd/yyyy"
            onChange={date => getStartDate(date)}
          />
        </div>
        <div className="geoSearchBarComponents">
          <label>To :</label>
          <DatePicker
            selected={endDate}
            showTimeSelect
            dateFormat="MM/dd/yyyy"
            onChange={date => getEndDate(date)}
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
