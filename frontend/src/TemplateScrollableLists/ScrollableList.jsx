import React from 'react';
import './ScrollableList.css';

const ScrollableList = ({ children, maxHeight = "400px" }) => {
  return (
    <div 
      className="scrollable-list-wrapper" 
      style={{ maxHeight: maxHeight }}
    >
      {children}
    </div>
  );
};

export default ScrollableList;