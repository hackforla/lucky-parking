import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { handleSidebar } from "../../redux/actions/index";
import CountUp from 'react-countup';

const mapStateToProps = (state) => {
  return { citation: state.citation, isSidebarOpen: state.isSidebarOpen };
};

function mapDispatchToProps(dispatch) {
  return {
    handleSidebar: (isSidebarOpen) => dispatch(handleSidebar(isSidebarOpen)),
  };
}

function ConnectedSideBar({ citation, isSidebarOpen, handleSidebar }) {
  const [data, setData] = useState("");
  const sideBar = document.getElementsByClassName("sidebar-container");
  const closeButton = document.getElementsByClassName(
    "sidebar__closeButton--close"
  );

  useEffect(() => {
    if (citation !== null) {
      const citations = JSON.parse(citation);
      setData(citations);
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

  return (
    <div className="sidebar-container">
      <h2 className="title">Date</h2>
      <div className="desc">{
        new Date(data.datetime).toLocaleDateString(
          'en-gb',
          {
            year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: "numeric",
          minute: "numeric",
          hour12: true
          }
        )}</div>
      <h2 className="title">Location</h2>
      <div className="desc">{data.location}</div>
      <h2 className="title">Violation</h2>
      <div className="desc">{data.violation_description}</div>
      <h2 className="title">Violation Code</h2>
      <div className="desc">{data.violation_code}</div>
      <h2 className="vehicle">Vehicle</h2>
      <div className="left">
        Make
        <div className="leftData">{data.make}</div>
      </div>
      <div className="left">
        State
        <div className="leftData">{data.state_plate}</div>
      </div>
      <div className="left">
        Type
        <div className="leftData">{data.body_style}</div>
      </div>
      <div className="bottomLeft">
        Color
        <div className="leftData">{data.color}</div>
      </div>
      <h2 className="fine">Fine Amount</h2>
      <div className="dollar">
        $
        <span className="dollarAmt">
          <CountUp end={data.fine_amount || null} duration={1.5} decimal="." decimals={2}/>
        </span>
      </div>
      <div className="sidebar__closeButton" onClick={sideBarCloseHandler}>
        <div className="sidebar__closeButton--close"></div>
      </div>
    </div>
  );
}

const Sidebar = connect(mapStateToProps, mapDispatchToProps)(ConnectedSideBar);

export default Sidebar;
