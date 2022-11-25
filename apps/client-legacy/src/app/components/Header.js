import React, { useState } from 'react';
import Instructions from './Instructions';
import logo from '../../assets/images/logo.png';

function Header() {
  const [showInstructions, setShowInstructions] = useState(true);

  const handleShow = (e) => {
    setShowInstructions(!showInstructions);
  };

  const headerClass =
    showInstructions === true
      ? 'header-container-show-instr'
      : 'header-container';

  return (
    <div className={headerClass}>
      <img src={logo} alt="Logo" className="picture" />
      <div className="line" id="line1" />
      <h4>LOS ANGELES PARKING CITATION DATA</h4>
      <div className="line" id="line2" />
      <p>
        Helping L.A. communities make informed decisions about parking policies
      </p>
      <Instructions show={showInstructions} handleShow={handleShow} />
    </div>
  );
}

export default Header;
