import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ initialCity = '', initialCollege = '' }) => {
  const [city, setCity] = useState(initialCity);
  const [college, setCollege] = useState(initialCollege);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = [];
    if (city) queryParams.push(`city=${encodeURIComponent(city)}`);
    if (college) queryParams.push(`college=${encodeURIComponent(college)}`);
    
    navigate(`/search?${queryParams.join('&')}`);
  };

  return (
    <form className="search-bar-form p-2 p-md-3 glass-card text-start animate-fade-in" onSubmit={handleSearch}>
      <div className="row g-3 align-items-center">
        {/* City Input */}
        <div className="col-md-5">
          <div className="input-group-premium d-flex align-items-center px-3 py-2 border-end-md">
            <span className="search-icon-wrapper me-2 text-primary">
              <i className="bi bi-geo-alt fs-5"></i>
            </span>
            <div className="flex-grow-1">
              <label className="label-tiny text-uppercase text-muted">City</label>
              <input
                type="text"
                className="input-blank w-100"
                placeholder="Where are you going?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* College / Landmark Input */}
        <div className="col-md-5">
          <div className="input-group-premium d-flex align-items-center px-3 py-2">
            <span className="search-icon-wrapper me-2 text-primary">
              <i className="bi bi-book fs-5"></i>
            </span>
            <div className="flex-grow-1">
              <label className="label-tiny text-uppercase text-muted">College / Location</label>
              <input
                type="text"
                className="input-blank w-100"
                placeholder="Search near your college..."
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="col-md-2 text-center text-md-end">
          <button type="submit" className="btn btn-premium-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-search"></i>
            <span>Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
