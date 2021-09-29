import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Select from "react-select";
import PropTypes from "prop-types";
import * as tables from "../indexTables";

const axios = require("axios");
const API_URL = process.env.REACT_APP_API_URL;

const Graph = ({ polygonData, darkMode }) => {
  const [data, setData] = useState(null);
  const [selectedKey, setSelectedKey] = useState("make");
  const [title, setTitle] = useState({
    value: "make",
    label: "Make of Vehicle",
  });
  const [categories, setCategories] = useState([]);
  const [isPolygon, setIsPolygon] = useState(null);

  const fetchGraph = async () => {
    try {
      let parsed;
      let categoryArray = [];
      let citationSum = 0;
      if (Array.isArray(polygonData)) {
        setIsPolygon(true);
        const response = await axios.get(`${API_URL}/api/citation/graph`, {
          params: {
            polygon: polygonData,
            filterBy: selectedKey,
          },
        });
        parsed = response.data.map((obj) => {
          obj["y"] = parseInt(obj.y);
          citationSum += obj.y;
          return obj;
        });
      } else {
        setIsPolygon(false);
        const response = await axios.get(`${API_URL}/api/citation/graph/zip`, {
          params: {
            zip: polygonData,
            filterBy: selectedKey,
          },
        });

        parsed = response.data.map((obj) => {
          obj["y"] = parseInt(obj.y);
          citationSum += obj.y;
          return obj;
        });
      }
      parsed = parsed.filter(datum => datum.y !== 0);
      parsed.sort((first,second) => second.y - first.y);
      parsed.forEach((datum) => {
        if (categoryArray.indexOf(datum.name) === -1) {
          switch (selectedKey) {
            case "fine_amount":
              categoryArray.push("$" + datum.name);
              break;
            case "color":
              // If abbreviation is not in the table, use 'Other'
              categoryArray.push(tables.colorTable[datum.name] || "Other");
              break;
            case "body_style":
              // If abbreviation is not in the table, use 'Other'
              categoryArray.push(tables.typeTable[datum.name] || "Other");
              break;
            default:
              categoryArray.push(datum.name);
              break;
          }
          datum["percentage"] = ((datum.y / citationSum) * 100).toFixed(2) + "%";
        }
      });
      setCategories(categoryArray);
      setData(parsed);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [selectedKey, polygonData]);

  const options = {
    title: {
      text: `${title.label}`,
      style: {
        textDecoration: "underline",
        fontSize: "30px",
        fontFamily: "Helvetica",
        color: "#47be22",
      },
    },
    chart: {
      backgroundColor: darkMode ? "" : "#ffffff",
    },
    xAxis: {
      categories: categories
    },
    yAxis: {
      title: {
        text: "Number of Citations"
      }
    },
    toolTip: {
      pointFormat: `{point.percentage}`
    },
    series: [
      {
        type: "bar",
        name: "violations",
        colorByPoint: true,
        data: data,
        dataLabels: {
          enabled: true,
          style: {
            fontFamily: "DIN1451Alt",
            color: darkMode ? "white" : "black",
          },
        },
      },
    ],
  };

  const selectOptions = [
    { value: "color", label: "Color" },
    { value: "body_style", label: "Car Body Type" },
    { value: "fine_amount", label: "Fine Amount" },
    { value: "make", label: "Make of Vehicle" },
    { value: "state_plate", label: "State of License Plate" },
    { value: "violation_description", label: "Violation" },
    { value: "weekday", label: "Day of the Week" },
  ];

  const customStyles = {
    dropdownIndicator: (base, state) => ({
      ...base,
      transition: "all .3s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(90deg)" : null,
      color: darkMode ? "white" : "black",
    }),
    singleValue: (styles) => ({
      ...styles,
      color: darkMode ? "white" : "black",
    }),
    control: (styles) => ({
      ...styles,
      backgroundColor: darkMode ? "#272727" : "white",
      fontFamily: "VT323",
      borderColor: darkMode ? "white" : "black",
      fontSize: "15px",
      boxShadow: "none",
      border: 0,
      borderBottom: darkMode ? "1px solid #616161" : "1px solid black",
      borderRadius: 0,
    }),
    indicatorSeparator: (base, state) => ({
      ...base,
      backgroundColor: state.selectProps.menuIsOpen ? "#47be22" : "black",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: darkMode
          ? isFocused
            ? "#35b228"
            : "#272727"
          : isFocused
          ? "#adeba1"
          : "white",
        color: darkMode ? "#dedede" : "black",
        cursor: isDisabled ? "not-allowed" : "default",
        fontFamily: "VT323",
        fontSize: "15px",
        ":active": {
          ...styles[":active"],
          backgroundColor: "#47be22",
        },
      };
    },
  };

  return (
    <div>
      <div>
        {
        isPolygon === false 
        ? <h2 className="header-text">Citation Summary in { polygonData }</h2>
        : <h2 className="header-text">Citation Summary in Selected Area</h2>
        }
      </div>
      <div className="select">
        <Select
          value={title}
          onChange={(e) => {
            setSelectedKey(e.value);
            setTitle(e);
          }}
          options={selectOptions}
          defaultValue={selectOptions[3]}
          styles={customStyles}
        />
      </div>
      <div className="chart">
        <HighchartsReact
          Highcharts={Highcharts}
          options={options}
          containerProps={{ className: "chartContainer" }}
        />
      </div>
    </div>
  );
};

export default Graph;

Graph.propTypes = {
  polygonData: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  darkMode: PropTypes.bool,
};
