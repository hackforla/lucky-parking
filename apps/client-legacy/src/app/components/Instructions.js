import React, { useState } from 'react';
import polygonToolIconButton from '../../assets/images/polygon.png';

function Instructions({ show, handleShow }) {
  // const [show, setShow] = useState(true);

  // const handleShow = (e) => {
  //   setShow(!show);
  // };

  return show ? (
    <div className="instructions-container">
      <h2>HOW IT WORKS:</h2>
      <div className="instructions">
        <p className="text-description">
          Navigate by searching any location within Los Angeles County in the
          Search Bar. Pan by dragging the mouse. Zoom by scrolling up and down
          or using the buttons in the bottom right.
        </p>
        <br />
        <p className="text-description">
          View parking citation data using any of the following:
          <ul>
            <li>
              <small className="bullet-point">
                To select by zip code, click the &nbsp;
                <img
                  src="https://img.icons8.com/material-outlined/24/000000/zip-code.png"
                  alt="zip code icon"
                />
                &nbsp; button to bring up the zip code boundaries. Double click
                within a zip code to bring up data about citations in the
                region.
              </small>
            </li>
            <li>
              <small className="bullet-point">
                To select a custom region, click the &nbsp;
                <img src={polygonToolIconButton} alt="polygon tool icon" />
                &nbsp; button to use a polygon selection tool. Click and then
                move the mouse to draw a custom shape, which will bring up data
                about citations in the region.
              </small>
            </li>
          </ul>
        </p>
        <button className="button-instructions" onClick={handleShow}>
          Close Instructions
        </button>
      </div>
    </div>
  ) : (
    <div className="button-container">
      <button className="button-instructions" onClick={handleShow}>
        Instructions
      </button>
    </div>
  );
}

export default Instructions;
