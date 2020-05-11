import React from "react";
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return { testRedux: state.testRedux };
};

function ConnectedSideBar({ testRedux }) {
  return (
    <div className="sidebar-container">
      <div>{testRedux}</div>
    </div>
  );
}

const Sidebar = connect(mapStateToProps)(ConnectedSideBar);

export default Sidebar;
