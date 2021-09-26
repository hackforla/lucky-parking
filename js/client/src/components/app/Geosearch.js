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
  const minDate = new Date("06/10/2010");
  const maxDate = new Date("04/01/2021");
  const searchContainer = useRef();

  //Todo: Datepicker Styling
  // helper function, extract needed
  function range(start, end, increment) {
    const output = [];
    for (let i = start; i <= end; i += increment) {
      output.push(i);
    }
    return output;
  }

  function getYear(date) {
    return date.getFullYear();
  }

  const years = range(2010, getYear(new Date()), 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function getMonth(date) {
    return months[date.getMonth()];
  }

  const handleClearDateRange = (e) => {
    getRangeActive(false);
    getStartDate(null);
    getEndDate(maxDate);
  };

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
          <label>Citation Date Range From :</label>

          <DatePicker
            renderCustomHeader={({ date, changeYear, changeMonth }) => (
              <div
                style={{
                  margin: 10,
                  padding: "3px",
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                }}
              >
                <select
                  value={months[getMonth(date)]}
                  onChange={({ target: { value } }) =>
                    changeMonth(months.indexOf(value))
                  }
                  style={{
                    padding: "5px",
                    margin: "3px",
                    color: "#fff",
                    backgroundColor: "#47be22",
                    borderRadius: "5px",
                    fontSize: "16px",
                    textAlign: "center",
                  }}
                >
                  {months.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={getYear(date)}
                  onChange={({ target: { value } }) => changeYear(value)}
                  style={{
                    padding: "5px 25px",
                    margin: "3px 6px",
                    color: "#fff",
                    backgroundColor: "#47be22",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
            selected={startDate}
            showTimeSelect
            minDate={minDate}
            maxDate={endDate}
            dateFormat="MM/dd/yyyy"
            placeholderText="MM/DD/YYYY"
            onChange={(date) => getStartDate(date)}
          >
            <div
              style={{
                padding: "5px 0 5px 5px",
                color: "orangered",
                fontSize: "14px",
              }}
            >
              Please select a date after <b>June 10th, 2010</b>.
            </div>
          </DatePicker>
        </div>
        <div className="geoSearchBarComponents">
          <label>To :</label>
          <DatePicker
            renderCustomHeader={({ date, changeYear, changeMonth }) => (
              <div
                style={{
                  margin: 10,
                  padding: "3px",
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                }}
              >
                <select
                  value={getYear(date)}
                  onChange={({ target: { value } }) => changeYear(value)}
                  style={{
                    padding: "5px 25px",
                    margin: "3px 6px",
                    color: "#fff",
                    backgroundColor: "#47be22",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={months[getMonth(date)]}
                  onChange={({ target: { value } }) =>
                    changeMonth(months.indexOf(value))
                  }
                  style={{
                    padding: "5px",
                    margin: "3px",
                    color: "#fff",
                    backgroundColor: "#47be22",
                    borderRadius: "5px",
                    fontSize: "16px",
                    textAlign: "center",
                  }}
                >
                  {months.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
            selected={endDate}
            showTimeSelect
            minDate={startDate}
            maxDate={maxDate}
            dateFormat="MM/dd/yyyy"
            placeholderText="Present"
            onChange={(date) =>
              dateRangeActive === false ? getEndDate(maxDate) : getEndDate(date)
            }
          >
            <div style={{ color: "orangered", fontSize: "14px" }}>
              Please select a date prior <b>April 1st, 2021</b>.
            </div>
          </DatePicker>
        </div>
        <div
          className={`geoSearchBarDateToggle${
            activateDateRange ? "--visible" : "--invis"
          }`}
          onClick={(e) => handleClearDateRange(e)}
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
