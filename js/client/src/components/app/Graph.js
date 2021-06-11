import React, { useEffect, useState } from "react";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Select from 'react-select';
import PropTypes from 'prop-types';


const axios = require("axios");
const API_URL = process.env.REACT_APP_API_URL;

const Graph = ({ polygonData, darkMode }) => {
  const [data, setData] = useState(null)
  const [selectedKey, setSelectedKey] = useState("make");
  const [title, setTitle] = useState({ value: 'make', label: 'Make' });

  const fetchGraph = async () => {
    const response = await axios
      .get(`${API_URL}/api/citation/graph`, {
        params: {
          polygon: polygonData,
          filterBy: selectedKey,
        },
      })
      
    var parsed = response.data.map((obj) => {
      obj["y"] = (parseInt(obj.y))
      return obj
    })

    setData(parsed)
  }

  useEffect(() => {
    fetchGraph();
  }, [selectedKey, polygonData])

  const options = {
    title: {
      text: `${title.label}`,
      style: {
        textDecoration: "underline",
        fontSize: "30px",
        fontFamily: "Helvetica",
        color: "#47be22",
      }
    },
    chart: {
      backgroundColor: darkMode ? '' : '#ffffff'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
    series: [{
      type: "pie",
      name: "violations",
      colorByPoint: true,
      data: data,
      dataLabels: {
        style: {
          fontFamily: 'DIN1451Alt',
          color: darkMode ? "white" : "black"
        }
      }
    }]
  }

  const selectOptions = [
    { value: 'color', label: 'Color' },
    { value: 'body_style', label: 'Body Style' },
    { value: 'fine_amount', label: 'Fine Amount' },
    { value: 'make', label: 'Make' },
    { value: 'state_plate', label: 'State' },
    { value: 'violation_description', label: 'Violation' },
    { value: 'weekday', label: 'Weekday' },
  ]

  const customStyles = {
    dropdownIndicator: (base, state) => ({
      ...base,
      transition: 'all .3s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(90deg)' : null,
      color: darkMode ? 'white' : 'black'
    }),
    singleValue: styles => ({...styles, color: darkMode ? 'white' : "black"}),
    control: styles => ({
       ...styles,
       backgroundColor: darkMode ? '#272727' : 'white',
       fontFamily: 'VT323',
       borderColor: darkMode ? 'white' : "black",
       fontSize: "15px",
       boxShadow: 'none',
       border: 0,
       borderBottom: darkMode ? '1px solid #616161' : "1px solid black",
       borderRadius: 0,
      }),
      indicatorSeparator: (base, state) => ({...base, backgroundColor: state.selectProps.menuIsOpen ? "#47be22" : "black" }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: darkMode ? isFocused ? '#35b228' : "#272727" : isFocused ? '#adeba1' : "white",
      color: darkMode ? '#dedede': 'black',
      cursor: isDisabled ? 'not-allowed' : 'default',
      fontFamily: 'VT323',
      fontSize: '15px',
      ':active': {
        ...styles[':active'],
        backgroundColor: "#47be22"
      }
    };
  },
  }


  return(
    <div>
      <div className="select">
        <Select
        value={title}
        onChange={(e) => {setSelectedKey(e.value); setTitle(e)}}
        options={selectOptions} 
        defaultValue={selectOptions[3]}
        styles={customStyles} 
        />
      </div>
      <div className="chart">
        <HighchartsReact 
          Highcharts={Highcharts}
          options={options}
          containerProps={{ className: 'chartContainer' }}
        />
      </div>
    </div>
  )
}

export default Graph;

Graph.propTypes = {
  polygonData: PropTypes.array.isRequired,
  darkMode: PropTypes.bool
};