import React from 'react';
import './SearchBar.css';
import searchIcon from '../assets/search-icon.svg';

const SearchBar = ({ text, value, onChange }) => {
  return (
    <div className="search-outer-frame">
      <div className="search-inner-tray">
        <img 
          src={searchIcon} 
          alt="" 
          className="search-svg-icon" 
          aria-hidden="true" 
        />
        <input 
          type="text" 
          className="search-input" 
          placeholder={text || "Search..."}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;