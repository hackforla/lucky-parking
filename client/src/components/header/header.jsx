import React from "react";
import "./header.css";

const Header = () => {
  return (
    <div className="header">
      <h1 className="heading-primary">
        <span className="heading-primary-main">Lucky Parking</span>
        <span className="heading-primary-sub">Free parking around you</span>
      </h1>
      <a href="#" className="btn btn-white btn-animated">
        Discover App
      </a>
    </div>
  );
};

export default Header;
