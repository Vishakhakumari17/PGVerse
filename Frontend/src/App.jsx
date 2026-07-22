import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';



// Context Wrapper
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import PGDetails from './pages/PGDetails/PGDetails';
import Search from './pages/Search/Search';
import Booking from './pages/Booking/Booking';
import Payment from './pages/Payment/Payment';
import Dashboard from './pages/Dashboard/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Profile from './pages/Profile/Profile';
import Contact from './pages/Contact/Contact';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';

function AppContent() {
  const { user } = useContext(AuthContext);

  // Hide footer if user is logged in as owner or admin
  const showFooter = !user || (user.role !== 'owner' && user.role !== 'admin');

  return (
    <div className="d-flex flex-column min-vh-100 app-bg-container">
      {/* Background glowing blobs for modern premium design */}
      <div className="aurora-blob aurora-blob-1"></div>
      <div className="aurora-blob aurora-blob-2"></div>
      <div className="aurora-blob aurora-blob-3"></div>

      {/* Main Header */}
      <Navbar />

      {/* Page Routing */}
      <main className="flex-grow-1 position-relative z-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pgs/:id" element={<PGDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student Secured Routes */}
          <Route
            path="/booking/:pgId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Owner Secured Routes */}
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Secured Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all Redirect */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Footer Branding */}
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
