import React, { useState, useEffect } from 'react';
import './Filter.css';

const Filter = ({ onApplyFilters, initialFilters = {} }) => {
  const [gender, setGender] = useState(initialFilters.gender || 'any');
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin || '');
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax || '');
  const [facilities, setFacilities] = useState(initialFilters.facilities ? initialFilters.facilities.split(',') : []);

  // Sync internal states with initialFilters when initialFilters props change (e.g. on reset or back button)
  useEffect(() => {
    setGender(initialFilters.gender || 'any');
    setPriceMin(initialFilters.priceMin || '');
    setPriceMax(initialFilters.priceMax || '');
    setFacilities(initialFilters.facilities ? initialFilters.facilities.split(',') : []);
  }, [initialFilters.gender, initialFilters.priceMin, initialFilters.priceMax, initialFilters.facilities]);

  const facilityOptions = [
    { label: 'WiFi', value: 'Wifi' },
    { label: 'Air Conditioner', value: 'AC' },
    { label: 'Laundry', value: 'Laundry' },
    { label: 'Gym', value: 'Gym' },
    { label: 'Food Included', value: 'Food Included' },
    { label: 'CCTV Security', value: 'CCTV' },
    { label: 'Power Backup', value: 'Power Backup' }
  ];

  const handleGenderChange = (g) => {
    setGender(g);
    onApplyFilters({
      gender: g,
      priceMin,
      priceMax,
      facilities: facilities.join(',')
    });
  };

  const handleFacilityChange = (value) => {
    const updatedFacilities = facilities.includes(value)
      ? facilities.filter(f => f !== value)
      : [...facilities, value];
    
    setFacilities(updatedFacilities);
    onApplyFilters({
      gender,
      priceMin,
      priceMax,
      facilities: updatedFacilities.join(',')
    });
  };

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters({
      gender,
      priceMin,
      priceMax,
      facilities: facilities.join(',')
    });
  };

  const handleReset = () => {
    setGender('any');
    setPriceMin('');
    setPriceMax('');
    setFacilities([]);
    onApplyFilters({
      gender: 'any',
      priceMin: '',
      priceMax: '',
      facilities: ''
    });
  };

  return (
    <div className="filter-sidebar premium-card p-4 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0 font-display">Filters</h5>
        <button className="btn btn-link btn-sm text-decoration-none text-muted p-0" onClick={handleReset}>
          Reset All
        </button>
      </div>

      <form onSubmit={handleApply}>
        {/* Gender Filter */}
        <div className="mb-4">
          <label className="form-label font-display small text-muted text-uppercase mb-2">Gender</label>
          <div className="gender-options d-flex gap-2">
            {['any', 'boys', 'girls', 'unisex'].map((g) => (
              <button
                key={g}
                type="button"
                className={`btn btn-sm btn-filter-gender text-capitalize flex-grow-1 ${gender === g ? 'active' : ''}`}
                onClick={() => handleGenderChange(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-4">
          <label className="form-label font-display small text-muted text-uppercase mb-2">Budget (₹ / month)</label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="number"
              className="form-control custom-input"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <span className="text-muted small">to</span>
            <input
              type="number"
              className="form-control custom-input"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
        </div>

        {/* Facilities Filter */}
        <div className="mb-4">
          <label className="form-label font-display small text-muted text-uppercase mb-2">Facilities</label>
          <div className="facilities-grid d-flex flex-column gap-2">
            {facilityOptions.map((facility) => (
              <div key={facility.value} className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`facility-${facility.value}`}
                  checked={facilities.includes(facility.value)}
                  onChange={() => handleFacilityChange(facility.value)}
                />
                <label className="form-check-label small" htmlFor={`facility-${facility.value}`}>
                  {facility.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-premium-primary w-100 py-2 mt-2">
          Apply Filters
        </button>
      </form>
    </div>
  );
};

export default Filter;
