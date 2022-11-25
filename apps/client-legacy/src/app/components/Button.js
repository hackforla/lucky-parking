import React, { useState } from 'react';

function Button({ name, className, onClick }) {
  return (
    <div>
      <button className={className} onClick={onClick}>
        {name}
      </button>
    </div>
  );
}

export default Button;
