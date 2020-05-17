import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return { citation: state.citation };
};

function ConnectedSideBar({ citation }) {
  const [data, setData] = useState("");

  useEffect(() => {
    if (citation !== null) {
      const citations = JSON.parse(citation);
      setData(citations);
    }
  }, [citation]);

  return (
    <div className="sidebar-container">
      <div>{data.index}</div>
    </div>
  );
}

const Sidebar = connect(mapStateToProps)(ConnectedSideBar);

export default Sidebar;
