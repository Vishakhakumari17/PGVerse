import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './Home.css';

const Home = () => {
  const [featuredPGs, setFeaturedPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studentCount: 0,
    verifiedOwnersCount: 0,
    verifiedPgsCount: 0,
    averageRating: 4.8
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only approved PGs, limit to 3 for landing page
        const res = await api.get('/pgs?approvedOnly=true');
        setFeaturedPGs(res.data.slice(0, 3));

        // Fetch dynamic metrics
        const statsRes = await api.get('/pgs/public-stats');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section text-center d-flex align-items-center position-relative py-5">
        <div className="container py-5 z-2 animate-fade-in">
          <span className="badge bg-indigo-light font-display py-2 px-3 mb-3 text-uppercase tracking-wider rounded-pill">
            🚀 The Ultimate PG Booking Experience
          </span>
          <h1 className="hero-title text-white font-display mb-3">
            Find Your Perfect <span className="text-gradient">Paying Guest</span>
          </h1>
          <p className="hero-subtitle mb-5 mx-auto max-w-2xl">
            Book fully furnished rooms near top colleges and tech hubs. Enjoy modern amenities, verified listings, and secure payment pathways.
          </p>
          
          <div className="search-bar-wrapper mx-auto max-w-4xl">
            <SearchBar />
          </div>
        </div>
        <div className="hero-bg-blur position-absolute w-100 h-100 top-0 start-0 z-1"></div>
      </section>

      {/* Gender Categories Section */}
      <section className="container py-5 my-3 text-center">
        <h2 className="section-title font-display mb-2">Explore by Category</h2>
        <p className="text-muted mb-5">Select a hostel category tailored to your preferences</p>
        <div className="row g-4">
          {[
            { title: 'Boys Hostels', gender: 'boys', icon: '♂️' },
            { title: 'Girls Hostels', gender: 'girls', icon: '♀️' },
            { title: 'Co-Living Spaces', gender: 'unisex', icon: '👥' }
          ].map((cat) => (
            <div key={cat.gender} className="col-md-4">
              <Link to={`/search?gender=${cat.gender}`} className={`category-card d-block p-5 text-white ${cat.gender}`}>
                <span className="fs-1 mb-3 d-block">{cat.icon}</span>
                <h4 className="font-display mb-2">{cat.title}</h4>
                <span className="small text-white-50">View Listings →</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="featured-section py-5">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h2 className="section-title font-display mb-2">Featured Accommodations</h2>
              <p className="text-muted mb-0">Handpicked high-quality properties recommended for you</p>
            </div>
            <Link to="/search" className="btn btn-premium-secondary py-2 px-3">
              View All
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : featuredPGs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-building fs-1 mb-3 d-block"></i>
              <p>No PGs have been approved by Admin yet. Log in as Admin to approve listings!</p>
            </div>
          ) : (
            <div className="row g-4">
              {featuredPGs.map((pg) => (
                <div key={pg._id} className="col-lg-4 col-md-6">
                  <Card pg={pg} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials/Metrics Section */}
      <section className="metrics-section py-5 text-center text-white" style={{ backgroundColor: '#090d16' }}>
        <div className="container py-4">
          <div className="row g-4 justify-content-center">
            {[
              { num: `${800 + (stats.studentCount || 0)}+`, text: 'Happy Students' },
              { num: `${10 + (stats.verifiedOwnersCount || 0)}+`, text: `Trusted PG Owners (${stats.verifiedPgsCount || 0} Verified PGs)` },
              { num: `${(stats.averageRating || 4.8).toFixed(1)}★`, text: 'Average Rating' }
            ].map((metric, i) => (
              <div key={i} className="col-md-4 col-sm-6 col-12">
                <h2 className="metric-num text-gradient font-display mb-2">{metric.num}</h2>
                <p className="small mb-0 text-uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{metric.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
