import React from "react";
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return { citation: state.citation };
};

function ConnectedSideBar({ citation }) {
  return (
    <div className="sidebar-container">
      <div>{citation}</div>
    </div>
  );
}

const Sidebar = connect(mapStateToProps)(ConnectedSideBar);

export default Sidebar;
