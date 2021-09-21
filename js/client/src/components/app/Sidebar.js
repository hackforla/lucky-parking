import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { handleSidebar } from "../../redux/actions/index";
import CountUp from "react-countup";
import Graph from "./Graph";
import { IconContext } from "react-icons";
import { BsChevronDoubleDown } from "react-icons/bs";
import PropTypes from "prop-types";
import * as tables from "../indexTables";

const mapStateToProps = (state) => {
  return {
    citation: state.citation,
    isSidebarOpen: state.isSidebarOpen,
    drawingPresent: state.drawingPresent,
    polygonData: state.polygonData,
    darkMode: state.darkMode,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    handleSidebar: (isSidebarOpen) => dispatch(handleSidebar(isSidebarOpen)),
  };
}

function ConnectedSideBar({
  citation,
  isSidebarOpen,
  handleSidebar,
  drawingPresent,
  polygonData,
  darkMode,
}) {
  const [data, setData] = useState("");
  const sideBar = document.getElementsByClassName("sidebar-container");
  const mapGrid = document.getElementsByClassName("map-container");
  const closeButton = document.getElementsByClassName(
    "sidebar__closeButton--close"
  );

  useEffect(() => {
    if (citation !== null) {
      setData(citation);
    }
  }, [citation]);

  const sideBarCloseHandler = () => {
    if (!isSidebarOpen) {
      sideBar[0].classList.remove("--container-open");
      closeButton[0].classList.add("--closeButton-close");
      handleSidebar(true);
    } else {
      sideBar[0].classList.add("--container-open");
      closeButton[0].classList.remove("--closeButton-close");
      handleSidebar(false);
    }
  };

  return drawingPresent ? (
    <div className="sidebar-container extra">
      <div className="content-wrapper">
        <Graph polygonData={polygonData} darkMode={darkMode} />
      </div>
    </div>
  ) : (
    <div className="sidebar-container">
      <div className="content-wrapper">
        <IconContext.Provider value={{ size: "2.5em", className: "close-btn" }}>
          <span className="mobile-close" onClick={sideBarCloseHandler}>
            <BsChevronDoubleDown />
          </span>
        </IconContext.Provider>
        <h2 className="header-text">Ticket Details</h2>
        <h2 className="title">Ticket Date</h2>
        <div className="desc">
          {new Date(data.datetime).toLocaleDateString("en-gb", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </div>
        <h2 className="title">Location</h2>
        <div className="desc">{data.location}</div>
        <h2 className="title">Violation</h2>
        <div className="desc">{data.violation_description}</div>
        <h2 className="title">Violation Code</h2>
        <div className="desc">{data.violation_code}</div>
        <h2 className="vehicle">Vehicle</h2>
        <div className="left">
          Make
          <div className="leftData">{tables.makeTable[data.make_ind]}</div>
        </div>
        <div className="left">
          State
          <div className="leftData">{data.state_plate}</div>
        </div>
        <div className="left">
          Type
          {/* If abbreviation is not in the table, use 'Other' */}
          <div className="leftData">{tables.typeTable[data.body_style] || "Other"}</div>
        </div>
        <div className="bottomLeft">
          Color
          {/* If abbreviation is not in the table, use 'Other' */}
          <div className="leftData">{tables.colorTable[data.color] || "Other"}</div>
        </div>
        <h2 className="fine">Fine Amount</h2>
        <div className="dollar">
          $
          <span className="dollarAmt">
            <CountUp
              end={data.fine_amount || 0}
              duration={1.5}
              decimal="."
              decimals={2}
            />
          </span>
        </div>
        <div className="sidebar__closeButton" onClick={sideBarCloseHandler}>
          <div className="sidebar__closeButton--close"></div>
        </div>
      </div>
    </div>
  );
}

const Sidebar = connect(mapStateToProps, mapDispatchToProps)(ConnectedSideBar);

export default Sidebar;

Sidebar.propTypes = {
  citation: PropTypes.shape({
    body_style: PropTypes.string,
    color: PropTypes.string,
    datetime: PropTypes.string,
    fine_amount: PropTypes.number,
    geometry: PropTypes.string,
    index: PropTypes.string,
    latitude: PropTypes.number,
    location: PropTypes.string,
    longitude: PropTypes.number,
    make: PropTypes.string,
    make_ind: PropTypes.string,
    state_plate: PropTypes.string,
    violation_code: PropTypes.string,
    violation_description: PropTypes.string,
    weekday: PropTypes.string,
  }),
  isSidebarOpen: PropTypes.bool,
  handleSidebar: PropTypes.func,
  drawingPresent: PropTypes.bool,
  polygonData: PropTypes.array,
};
