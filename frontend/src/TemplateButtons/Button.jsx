import React from 'react';
import './Button.css';

const Button = (props) => {
  return (
    <button className={`general-button ${props.className || ""}`} onClick={props.onClick}>
      <span className="button-content">
        {props.text}
      </span>
    </button>
  );
};

export default Button;