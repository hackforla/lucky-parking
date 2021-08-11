import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import mapboxgl from "mapbox-gl";
import {
  getMap,
  getRangeActive,
  getStartDate,
  getEndDate,
  activateDarkMode,
} from "../../redux/actions/index";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import "react-datepicker/dist/react-datepicker.css";

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_TOKEN;

const mapStateToProps = (state) => {
  return {
    map: state.map,
    startDate: state.startDate,
    endDate: state.endDate,
    activateDateRange: state.activateDateRange,
    darkMode: state.darkMode,
  };
};

// setState
function mapDispatchToProps(dispatch) {
  return {
    getMap: (map) => dispatch(getMap(map)),
    getRangeActive: (activateDateRange) =>
      dispatch(getRangeActive(activateDateRange)),
    getStartDate: (startDate) => dispatch(getStartDate(startDate)),
    getEndDate: (endDate) => dispatch(getEndDate(endDate)),
    activateDarkMode: (darkMode) => dispatch(activateDarkMode(darkMode)),
  };
}

const ConnectGeosearch = ({
  getMap,
  startDate,
  endDate,
  getEndDate,
  getStartDate,
  getRangeActive,
  activateDateRange,
  activateDarkMode,
  darkMode,
}) => {
  const [dateRangeActive, setDateRangeActive] = useState(false);
  const [disableHover, setDisableHover] = useState(false);

  const searchContainer = useRef();

  useEffect(() => {
    setDateRangeActive(true);
    getRangeActive(dateRangeActive);
  }, [startDate, endDate]);

  getMap(searchContainer);

  return (
    <div className="geosearch">
      <div
        className={`geosearch__main ${
          !disableHover
            ? activateDateRange
              ? "geosearch__main--active"
              : "geosearch__main--inactive"
            : "geosearch__main--disable"
        }`}
      >
        <div className="testGeoSearch" ref={searchContainer} />
        <div className="geoSearchBarComponents">
          <label>From :</label>
          <DatePicker
            selected={startDate}
            showTimeSelect
            dateFormat="MM/dd/yyyy"
            onChange={(date) => getStartDate(date)}
          />
        </div>
        <div className="geoSearchBarComponents">
          <label>To :</label>
          <DatePicker
            selected={endDate}
            showTimeSelect
            minDate={startDate}
            dateFormat="MM/dd/yyyy"
            onChange={(date) => getEndDate(date)}
          />
        </div>
        <div
          className={`geoSearchBarDateToggle ${
            activateDateRange
              ? "geoSearchBarDateToggle--visible"
              : "geoSearchBarDateToggle--invis"
          }`}
          onClick={() => getRangeActive(false)}
          onMouseEnter={() => setDisableHover(true)}
          onMouseLeave={() => setDisableHover(false)}
        >
          RESET DATE
        </div>
        {/* <div className="toggleDarkMode" onClick={() => activateDarkMode(!darkMode)}>
       <CgDarkMode size="25px" className="darkModeIcon"/>
        </div> */}
      </div>
    </div>
  );
};

const Geosearch = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectGeosearch);

export default Geosearch;

Geosearch.propTypes = {
  getMap: PropTypes.func,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  getEndDate: PropTypes.func,
  getStartDate: PropTypes.func,
  getRangeActive: PropTypes.func,
  activateDateRange: PropTypes.bool,
  activateDarkMode: PropTypes.func,
  darkMode: PropTypes.bool,
};
