import React from "react";
import "./header.css";

const Header = () => {
  return (
    <div>
      <div className="logoContainer">
        <div className="logoTop"></div>
        <div className="logoCenter"></div>
        <div className="logoBottom"></div>
      </div>
      <div className="header">
        <h1 class="heading-primary">
          <span class="heading-primary-main">Lucky Parking</span>
          <span class="heading-primary-sub">Free parking around you</span>
        </h1>
      </div>
    </div>
  );
};

export default Header;
