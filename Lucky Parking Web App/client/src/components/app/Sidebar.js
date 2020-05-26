import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { handleSidebar } from "../../redux/actions/index";

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
      <div>{data.index}</div>
      <div>{data.issuedate}</div>
      <div>{data.location}</div>
      <div>{data.violation}</div>
      <div>{data.day}</div>
      <div>{data.lat}</div>
      <div>{data.long}</div>
      <div>{data.time}</div>
      <div className="sidebar__closeButton" onClick={sideBarCloseHandler}>
        <div className="sidebar__closeButton--close"></div>
      </div>
    </div>
  );
}

const Sidebar = connect(mapStateToProps, mapDispatchToProps)(ConnectedSideBar);

export default Sidebar;
