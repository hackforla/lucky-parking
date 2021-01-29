import React, { useEffect, useState } from "react";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Select from 'react-select';

const Graph = ({ data }) => {

  const [selectedKey, setSelectedKey] = useState("make");
  const [title, setTitle] = useState({ value: 'make', label: 'Make' });

  const dataProcess = (data, sKey) => {
    var res = data.reduce((obj, v) => {
      obj[v[`${sKey}`]] = (obj[v[`${sKey}`]] || 0) + 1;
      return obj;
    }, {})
  
    let final = Object.keys(res).map((key, i) => {
      return {
        name: Object.keys(res)[i],
        y: res[key] / data.length * 100,
      }
    })
  
    return final;
  }

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
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
    series: [{
      type: "pie",
      name: "violations",
      colorByPoint: true,
      data: dataProcess(data, selectedKey),
      dataLabels: {
        style: {
          fontFamily: 'DIN1451Alt',
          color: "black"
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
      color: 'black'
    }),
    control: styles => ({
       ...styles,
       backgroundColor: 'white',
       fontFamily: 'VT323',
       borderColor: "black",
       fontSize: "15px",
       boxShadow: 'none',
       border: 0,
       borderBottom: "1px solid black",
       borderRadius: 0,
      }),
      indicatorSeparator: (base, state) => ({...base, backgroundColor: state.selectProps.menuIsOpen ? "#47be22" : "black" }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused ? '#adeba1' : "white",
      color: 'black',
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