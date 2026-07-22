import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import Filter from '../../components/Filter/Filter';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pgList, setPgList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract initial values from query URL
  const city = searchParams.get('city') || '';
  const college = searchParams.get('college') || '';
  const gender = searchParams.get('gender') || 'any';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  const facilities = searchParams.get('facilities') || '';

  useEffect(() => {
    const fetchPGsings = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        // Only show approved PGs to normal searches
        queryParams.set('approvedOnly', 'true');
        
        const res = await api.get(`/pgs?${queryParams.toString()}`);
        setPgList(res.data);
      } catch (err) {
        console.error('Error fetching PGsings:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPGsings();
  }, [searchParams]);

  const handleApplyFilters = (filters) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Set or delete params based on filter selection
    if (filters.gender && filters.gender !== 'any') {
      newParams.set('gender', filters.gender);
    } else {
      newParams.delete('gender');
    }

    if (filters.priceMin) {
      newParams.set('priceMin', filters.priceMin);
    } else {
      newParams.delete('priceMin');
    }

    if (filters.priceMax) {
      newParams.set('priceMax', filters.priceMax);
    } else {
      newParams.delete('priceMax');
    }

    if (filters.facilities) {
      newParams.set('facilities', filters.facilities);
    } else {
      newParams.delete('facilities');
    }

    setSearchParams(newParams);
  };

  return (
    <div className="container py-4 page-container">
      {/* Search Header */}
      <div className="mb-4">
        <SearchBar initialCity={city} initialCollege={college} />
      </div>

      <div className="row g-4 mt-2">
        {/* Left Side Filters */}
        <div className="col-lg-3 col-md-4">
          <Filter
            onApplyFilters={handleApplyFilters}
            initialFilters={{
              gender,
              priceMin,
              priceMax,
              facilities
            }}
          />
        </div>

        {/* Right Side Cards Grid */}
        <div className="col-lg-9 col-md-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="font-display mb-0">
              {loading ? 'Searching PGs...' : `${pgList.length} Accommodations Found`}
            </h5>
            <span className="small text-muted">Showing verified listings</span>
          </div>

          {loading ? (
            <Loader />
          ) : pgList.length === 0 ? (
            <div className="text-center py-5 glass-card empty-search-container animate-fade-in">
              <span className="fs-1 mb-3 d-block">🔍</span>
              <h4 className="font-display">No Accommodations Match Your Search</h4>
              <p className="text-muted small mb-4">Try clearing filters, adjusting your budget, or searching a different city.</p>
              <button
                className="btn btn-premium-primary"
                onClick={() => setSearchParams({})}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {pgList.map((pg) => (
                <div key={pg._id} className="col-lg-4 col-md-6">
                  <Card pg={pg} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
