import React from "react";

function Instructions() {
  return (
    <div className="instructions-container">
      <h2 style={{ margin: "50px" }}>HOW IT WORKS:</h2>
      <div className="instructions">
        <p>
          Navigate by searching any location within Los Angeles County in the
          Search Bar. Pan by dragging the mouse. Zoom by scrolling up and down
          or using the buttons in the bottom right.
        </p>
        <br />
        <p>
          View parking citation data using any of the following:
          <ul>
            <li>
              To select by zip code, click the &nbsp;
              <img
                src="https://img.icons8.com/material-outlined/24/000000/zip-code.png"
                alt="zip code icon"
              />
              &nbsp; button to bring up the zip code boundaries. Double click
              within a zip code to bring up data about citations in the region.
            </li>
            <li>
              To select a custom region, click the !!!INSERT POLYGON BUTTON!!!
              button to use a polygon selection tool. Click and then move the
              mouse to draw a custom shape, which will bring up data about
              citations in the region.
            </li>
          </ul>
        </p>
        <button
          style={{
            fontFamily: "Roboto",
            fontWeight: 700,
            fontSize: "14px",
            padding: "8px 46px",
            backgroundColor: "white",
            border: "1px solid white",
            margin: "1em",
          }}
        >
          Got It!
        </button>
      </div>
    </div>
  );
}

export default Instructions;
