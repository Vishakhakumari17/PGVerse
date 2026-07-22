import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './OwnerDashboard.css';
import '../Payment/Payment.css';

// Chart.js imports
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const OwnerDashboard = () => {
  const { user, showToast } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [pgs, setPgs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [matchedReqs, setMatchedReqs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student records states
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    portalPassword: 'Galaxy@1234',
    course: 'Undergraduate',
    seat: 'A1',
    months: 1,
    isBlocked: false
  });
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    portalPassword: 'Galaxy@1234',
    course: 'Undergraduate',
    seat: 'A1',
    months: 1
  });

  // Settings Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Subscription states
  const [subData, setSubData] = useState({
    activeSubscription: null,
    pendingSubscription: null,
    listingsUsed: 0,
    history: []
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [buyingPlan, setBuyingPlan] = useState(false);

  // Review reply states
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Add/Edit PG Form States
  const [showForm, setShowForm] = useState(false);
  const [editPgId, setEditPgId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Offline Admission Form States
  const [admName, setAdmName] = useState('');
  const [admFatherName, setAdmFatherName] = useState('');
  const [admMobile, setAdmMobile] = useState('');
  const [admParentMobile, setAdmParentMobile] = useState('');
  const [admAadhar, setAdmAadhar] = useState('');
  const [admMonthlyFee, setAdmMonthlyFee] = useState('');
  const [admPaidFee, setAdmPaidFee] = useState('');
  const [admSelectedPg, setAdmSelectedPg] = useState('');
  const [admSelectedRoomType, setAdmSelectedRoomType] = useState('');
  const [admPhoto, setAdmPhoto] = useState('');
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [submittingAdmission, setSubmittingAdmission] = useState(false);
  
  // Manage PG states
  const [selectedPgToManage, setSelectedPgToManage] = useState(null);
  const [manageModalTab, setManageModalTab] = useState('rooms');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState('Single');
  const [newRoomSharing, setNewRoomSharing] = useState(1);
  const [newRoomPrice, setNewRoomPrice] = useState(5000);
  const [newRoomTotalSeats, setNewRoomTotalSeats] = useState(1);
  const [newRoomFloor, setNewRoomFloor] = useState('Ground');
  const [newRoomStatus, setNewRoomStatus] = useState('Available');
  const [newRoomAmenities, setNewRoomAmenities] = useState('');
  const [updatingRoom, setUpdatingRoom] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [mapCoordinates, setMapCoordinates] = useState('');
  const [gender, setGender] = useState('boys');
  const [facilities, setFacilities] = useState('');
  const [nearbyColleges, setNearbyColleges] = useState('');
  const [images, setImages] = useState(['']);

  // Rooms Form State
  const [rooms, setRooms] = useState([
    { roomType: 'Single Room', sharing: 1, price: 6000, availability: 2, amenities: ['AC', 'Wifi'] },
    { roomType: 'Double Sharing', sharing: 2, price: 4000, availability: 4, amenities: ['Wifi'] }
  ]);

  // Subscription Payment Flow States
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdSub, setCreatedSub] = useState(null);
  const [showSubReceipt, setShowSubReceipt] = useState(false);
  const [qrFrame, setQrFrame] = useState('Standard Border');
  const [qrTheme, setQrTheme] = useState('Classic Black & White');
  const [qrLogo, setQrLogo] = useState('PGVerse Icon');
  const [pgSearchQuery, setPgSearchQuery] = useState('');
  const [admissionSearchQuery, setAdmissionSearchQuery] = useState('');
  const [genericConfirmModal, setGenericConfirmModal] = useState(null);
  const [updatingAdmission, setUpdatingAdmission] = useState(null);
  const [updatingPaidFeeAmount, setUpdatingPaidFeeAmount] = useState(0);
  const [showPendingDuesModal, setShowPendingDuesModal] = useState(false);
  const [selectedPaymentsPgFilter, setSelectedPaymentsPgFilter] = useState('');
  
  const [feePayments, setFeePayments] = useState([]);
  const [showFeeRecordModal, setShowFeeRecordModal] = useState(null);
  const [recordFeeMonth, setRecordFeeMonth] = useState('January');
  const [recordFeeYear, setRecordFeeYear] = useState(2026);
  const [recordFeeAmount, setRecordFeeAmount] = useState('');
  const [recordFeeStatus, setRecordFeeStatus] = useState('Paid');
  const [feeSearchQuery, setFeeSearchQuery] = useState('');
  const [showPaymentsLogModal, setShowPaymentsLogModal] = useState(false);
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState('');
  
  const [trackerPgId, setTrackerPgId] = useState('');
  const [trackerRoomType, setTrackerRoomType] = useState('All');
  const [trackerMonth, setTrackerMonth] = useState('July');
  const [trackerYear, setTrackerYear] = useState(2026);
  const [trackerSearchQuery, setTrackerSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [activeTab, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Unconditionally fetch owner subscription status
      const subRes = await api.get('/subscriptions/owner');
      setSubData(subRes.data);

      // Fetch bookings & admissions unconditionally so they are always available for room counts
      try {
        const bookingsRes = await api.get('/bookings');
        setBookings(bookingsRes.data);
      } catch (e) {
        console.error(e);
      }

      try {
        const admissionsRes = await api.get('/offline-admissions');
        setAdmissions(admissionsRes.data);
      } catch (e) {
        console.error(e);
      }

      try {
        const pgsRes = await api.get(`/pgs?ownerId=${user.id || user._id}`);
        setPgs(pgsRes.data);
      } catch (e) {
        console.error(e);
      }

      try {
        const paymentsRes = await api.get('/fee-payments/owner');
        setFeePayments(paymentsRes.data || []);
      } catch (e) {
        console.error(e);
      }

      if (activeTab === 'dashboard') {
        // Already loaded globally
      } else if (activeTab === 'pgs') {
        // Already loaded globally
      } else if (activeTab === 'requests') {
        // Already loaded globally
      } else if (activeTab === 'reviews') {
        // Fetch all user listed PGs first, then gather their reviews
        const resPgs = await api.get(`/pgs?ownerId=${user.id || user._id}`);
        const allReviews = [];
        for (const pg of resPgs.data) {
          const detailRes = await api.get(`/pgs/${pg._id}`);
          if (detailRes.reviews) {
            detailRes.reviews.forEach(r => {
              allReviews.push({ ...r, pgName: pg.name });
            });
          }
        }
        setReviews(allReviews);
      } else if (activeTab === 'admissions') {
        const pgsRes = await api.get(`/pgs?ownerId=${user.id || user._id}`);
        setPgs(pgsRes.data);
        const admissionsRes = await api.get('/offline-admissions');
        setAdmissions(admissionsRes.data);
      } else if (activeTab === 'matches') {
        const resMatches = await api.get('/admin/contact-requests/owner');
        setMatchedReqs(resMatches.data);
      } else if (activeTab === 'analytics') {
        const res = await api.get('/bookings/analytics/owner');
        setAnalytics(res.data);
      } else if (activeTab === 'students') {
        const pgsRes = await api.get(`/pgs?ownerId=${user.id || user._id}`);
        setPgs(pgsRes.data);
        const admissionsRes = await api.get('/offline-admissions');
        setAdmissions(admissionsRes.data);
      }
    } catch (err) {
      console.error('Error fetching owner panel details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordFeePayment = async (e) => {
    e.preventDefault();
    if (!showFeeRecordModal) return;
    try {
      const payload = {
        studentType: showFeeRecordModal.type,
        studentId: showFeeRecordModal.id,
        studentName: showFeeRecordModal.name,
        pgName: showFeeRecordModal.pgName,
        roomType: showFeeRecordModal.roomType,
        monthlyFee: Number(showFeeRecordModal.monthlyFee),
        month: recordFeeMonth,
        year: Number(recordFeeYear),
        amountPaid: Number(recordFeeAmount),
        status: recordFeeStatus
      };
      await api.post('/fee-payments', payload);
      showToast('Fee payment recorded successfully!', 'success');
      setShowFeeRecordModal(null);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to record fee payment', 'error');
    }
  };

  const handleDeleteFeePayment = async (paymentId) => {
    try {
      await api.delete(`/fee-payments/${paymentId}`);
      showToast('Fee payment record deleted successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to delete fee payment record', 'error');
    }
  };

  const handleBuyPlan = (planName) => {
    let price = 299;
    let limit = 2;
    if (planName === 'standard') {
      price = 799;
      limit = 10;
    } else if (planName === 'premium') {
      price = 1499;
      limit = 9999;
    }
    setCheckoutPlan({ name: planName, price, limit });
    setPaymentSuccess(false);
    setCreatedSub(null);
    setShowSubReceipt(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setUpiId('');
  };

  const handlePaySubscription = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'upi') {
      const upiRegex = /^[\w.\-_]+@[a-zA-Z0-9.\-_]+$/;
      if (!upiRegex.test(upiId)) {
        showToast('Please enter a valid UPI ID (e.g. name@upi)', 'error');
        return;
      }
    }
    setBuyingPlan(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const transactionId = `TXN-SUB-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await api.post('/subscriptions', {
        planName: checkoutPlan.name,
        transactionId
      });
      setCreatedSub(res.data.data || res.data);
      setPaymentSuccess(true);
      showToast(`Subscription request for ${checkoutPlan.name.toUpperCase()} submitted!`, 'success');
      // Refresh subscription data
      const subRes = await api.get('/subscriptions/owner');
      setSubData(subRes.data);
    } catch (err) {
      showToast(err.message || 'Subscription payment failed', 'error');
    } finally {
      setBuyingPlan(false);
    }
  };

  const getQrColor = () => {
    if (qrTheme === 'Brown & Gold Theme') return '5C4033';
    if (qrTheme === 'Deep Slate Theme') return '2D2A26';
    return '000000';
  };

  const resetFormFields = () => {
    setAgreeTerms(false);
    setEditPgId(null);
    setName('');
    setDescription('');
    setAddress('');
    setCity('');
    setState('');
    setLandmark('');
    setMapCoordinates('');
    setGender('boys');
    setFacilities('');
    setNearbyColleges('');
    setImages([
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'
    ]);
    setRooms([
      { roomType: 'Single Room', sharing: 1, price: 6000, availability: 2, amenities: ['AC', 'Wifi'] },
      { roomType: 'Double Sharing', sharing: 2, price: 4500, availability: 4, amenities: ['Wifi'] }
    ]);
  };

  const handleOpenAddForm = () => {
    if (!subData.activeSubscription) {
      showToast('You must purchase a subscription plan to list properties.', 'warning');
      setSearchParams({ tab: 'subscription' });
      return;
    }

    if (subData.listingsUsed >= subData.activeSubscription.listingLimit) {
      showToast(`You have reached your listing limit of ${subData.activeSubscription.listingLimit} PGs. Please upgrade your plan.`, 'warning');
      setSearchParams({ tab: 'subscription' });
      return;
    }

    resetFormFields();
    setShowForm(true);
  };

  const handleOpenEditForm = (pgItem) => {
    setAgreeTerms(true);
    setEditPgId(pgItem._id);
    setName(pgItem.name);
    setDescription(pgItem.description);
    setAddress(pgItem.location.address);
    setCity(pgItem.location.city);
    setState(pgItem.location.state);
    setLandmark(pgItem.location.landmark || '');
    setMapCoordinates(pgItem.location.mapCoordinates || '');
    setGender(pgItem.gender);
    setFacilities(pgItem.facilities.join(', '));
    setNearbyColleges(pgItem.nearbyColleges.join(', '));
    setImages(pgItem.images && pgItem.images.length > 0 ? pgItem.images : ['']);
    setRooms(pgItem.rooms);
    setShowForm(true);
  };

  const handleAddRoomRow = () => {
    setRooms(prev => [...prev, { roomType: 'Triple Sharing', sharing: 3, price: 3500, availability: 1, amenities: ['Wifi'] }]);
  };

  const handleRemoveRoomRow = (index) => {
    setRooms(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenManageModal = (pgItem) => {
    setSelectedPgToManage(pgItem);
    setManageModalTab('rooms');
    setNewRoomNumber('');
    setNewRoomType('Single');
    setNewRoomSharing(1);
    setNewRoomPrice(5000);
    setNewRoomTotalSeats(1);
    setNewRoomFloor('Ground');
    setNewRoomStatus('Available');
    setNewRoomAmenities('');
  };

  const handleUpdateRoomsList = async (updatedRooms) => {
    setUpdatingRoom(true);
    try {
      const res = await api.put(`/pgs/${selectedPgToManage._id}`, {
        ...selectedPgToManage,
        rooms: updatedRooms,
        bypassApprovalReset: true
      });
      if (res.success) {
        setSelectedPgToManage(res.data);
        showToast('Rooms and seats configuration updated successfully!', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update rooms.', 'danger');
    } finally {
      setUpdatingRoom(false);
    }
  };

  const handleAddRoomToPg = async (e) => {
    e.preventDefault();
    if (!newRoomNumber) {
      showToast('Please specify a room number.', 'warning');
      return;
    }
    const newRoomObj = {
      roomNumber: newRoomNumber,
      roomType: newRoomType,
      sharing: Number(newRoomSharing),
      price: Number(newRoomPrice),
      totalSeats: Number(newRoomTotalSeats),
      availability: Number(newRoomTotalSeats), // available initially equals totalSeats
      roomFloor: newRoomFloor,
      roomStatus: newRoomStatus,
      amenities: newRoomAmenities ? newRoomAmenities.split(',').map(a => a.trim()) : []
    };
    const updatedRooms = [...selectedPgToManage.rooms, newRoomObj];
    await handleUpdateRoomsList(updatedRooms);
    setNewRoomNumber('');
    setNewRoomType('Single');
    setNewRoomSharing(1);
    setNewRoomPrice(5000);
    setNewRoomTotalSeats(1);
    setNewRoomFloor('Ground');
    setNewRoomStatus('Available');
    setNewRoomAmenities('');
  };

  const handleRemoveRoomFromPg = async (roomIndex) => {
    const updatedRooms = selectedPgToManage.rooms.filter((_, idx) => idx !== roomIndex);
    await handleUpdateRoomsList(updatedRooms);
  };

  const handleUpdateRoomField = async (roomIndex, field, value) => {
    const updatedRooms = selectedPgToManage.rooms.map((room, idx) => {
      if (idx === roomIndex) {
        return { ...room, [field]: Number(value) };
      }
      return room;
    });
    await handleUpdateRoomsList(updatedRooms);
  };

  const handleRemoveStudentFromPg = async (bookingId) => {
    if (!window.confirm('Are you sure you want to remove this student and cancel their booking? This will make the seat available again.')) {
      return;
    }
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      showToast('Student removed and booking cancelled successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to remove student.', 'danger');
    }
  };

  const handleOpenAdmissionModal = () => {
    setAdmName('');
    setAdmFatherName('');
    setAdmMobile('');
    setAdmParentMobile('');
    setAdmAadhar('');
    setAdmMonthlyFee('');
    setAdmPaidFee('');
    setAdmSelectedPg('');
    setAdmSelectedRoomType('');
    setAdmPhoto('');
    setShowAdmissionModal(true);
  };

  const handleAdmissionPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Photo size should be less than 2.5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdmPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    if (!admSelectedPg) {
      showToast('Please select a PG to admit the student.', 'warning');
      return;
    }
    setSubmittingAdmission(true);
    try {
      const payload = {
        name: admName,
        fatherName: admFatherName,
        mobileNumber: admMobile,
        parentMobileNumber: admParentMobile,
        aadharCard: admAadhar,
        monthlyFee: Number(admMonthlyFee),
        paidFee: Number(admPaidFee),
        pg: admSelectedPg,
        roomType: admSelectedRoomType || 'General',
        photo: admPhoto
      };
      await api.post('/offline-admissions', payload);
      showToast('Student admitted and registered offline successfully!', 'success');
      setShowAdmissionModal(false);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to submit offline admission.', 'danger');
    } finally {
      setSubmittingAdmission(false);
    }
  };

  const handleDeleteAdmission = async (admissionId) => {
    if (!window.confirm('Are you sure you want to delete this admission record? This will return the seat back to the PG.')) {
      return;
    }
    try {
      await api.delete(`/offline-admissions/${admissionId}`);
      showToast('Admission record deleted successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to delete record.', 'danger');
    }
  };

  const handleOpenUpdatePaidFeeModal = (adm) => {
    setUpdatingAdmission(adm);
    setUpdatingPaidFeeAmount(adm.paidFee);
  };

  const handleSaveUpdatedPaidFee = async (e) => {
    e.preventDefault();
    if (!updatingAdmission) return;
    try {
      await api.put(`/offline-admissions/${updatingAdmission._id}`, {
        paidFee: Number(updatingPaidFeeAmount)
      });
      showToast('Student admission fee updated successfully!', 'success');
      setUpdatingAdmission(null);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to update admission fee', 'error');
    }
  };

  const handleMarkBookingAsPaid = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/payment-status`, { paymentStatus: 'completed' });
      showToast('Booking payment marked as completed!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to update payment status', 'error');
    }
  };

  const handleImageURLChange = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const handleImageFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Image size should be less than 2.5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...images];
      updated[index] = reader.result;
      setImages(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageURL = () => {
    setImages(prev => [...prev, '']);
  };

  const handleRemoveImageURL = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoomChange = (index, field, value) => {
    const updated = [...rooms];
    if (field === 'sharing' || field === 'price' || field === 'availability') {
      updated[index][field] = Number(value);
    } else if (field === 'amenities') {
      updated[index][field] = value.split(',').map(s => s.trim());
    } else {
      updated[index][field] = value;
    }
    setRooms(updated);
  };

  const handleSavePG = async (e) => {
    e.preventDefault();
    if (images.filter(Boolean).length === 0) {
      showToast('Please provide at least one photo/URL.', 'error');
      return;
    }
    if (rooms.length === 0) {
      showToast('Please add at least one room package.', 'error');
      return;
    }

    const payload = {
      name,
      description,
      location: { address, city, state, landmark, mapCoordinates },
      gender,
      facilities: facilities.split(',').map(s => s.trim()).filter(Boolean),
      nearbyColleges: nearbyColleges.split(',').map(s => s.trim()).filter(Boolean),
      images: images.filter(Boolean),
      rooms
    };

    try {
      if (editPgId) {
        await api.put(`/pgs/${editPgId}`, payload);
        showToast('PG listing updated successfully! Admin might review changes.', 'success');
      } else {
        await api.post('/pgs', payload);
        showToast('New PG listing created successfully! Awaiting Admin approval.', 'success');
      }
      setShowForm(false);
      resetFormFields();
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Saving PG listing failed', 'error');
    }
  };

  const handleDeletePG = async (pgId) => {
    try {
      await api.delete(`/pgs/${pgId}`);
      showToast('PG listing deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Deletion failed', 'error');
    }
  };

  const handleUpdateBooking = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      showToast(`Booking request ${status === 'accepted' ? 'ACCEPTED' : 'REJECTED'} successfully!`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleReviewReply = async (reviewId) => {
    if (!replyText) return;
    try {
      await api.post(`/pgs/reviews/${reviewId}/reply`, { reply: replyText });
      showToast('Reply posted successfully.', 'success');
      setReplyText('');
      setActiveReplyId(null);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to post reply', 'error');
    }
  };

  // Owner action on student match request
  const handleOwnerMatchAction = async (requestId, pgId, action) => {
    try {
      await api.put(`/admin/contact-requests/${requestId}/owner-action`, { pgId, action });
      showToast(`Student requirement matching ${action === 'accept' ? 'ACCEPTED' : 'REJECTED'}!`, 'success');
      setMatchedReqs(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      showToast(err.message || 'Failed to update contact request', 'error');
    }
  };

  // Student specific handlers (Offline Admissions)
  const handleToggleStudentBlock = async (studentId, currentBlockedStatus) => {
    try {
      const nextStatus = !currentBlockedStatus;
      await api.put(`/offline-admissions/${studentId}`, { isBlocked: nextStatus });
      showToast(
        nextStatus 
          ? 'Student account marked Inactive / Blocked.' 
          : 'Student account activated successfully.', 
        'success'
      );
      setAdmissions(prev => prev.map(s => s._id === studentId ? { ...s, isBlocked: nextStatus } : s));
      if (selectedStudentDetail && selectedStudentDetail._id === studentId) {
        setSelectedStudentDetail(prev => ({ ...prev, isBlocked: nextStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student record permanently?')) return;
    try {
      await api.delete(`/offline-admissions/${studentId}`);
      showToast('Student record deleted permanently', 'success');
      setAdmissions(prev => prev.filter(s => s._id !== studentId));
    } catch (err) {
      showToast(err.message || 'Deletion failed', 'error');
    }
  };

  const handleEditStudentClick = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      phone: student.mobileNumber || student.phone || '',
      parentPhone: student.parentMobileNumber || '',
      fatherName: student.fatherName || '',
      aadharCard: student.aadharCard || '',
      monthlyFee: student.monthlyFee || 0,
      paidFee: student.paidFee || 0,
      roomType: student.roomType || 'General',
      pg: student.pg?._id || student.pg || '',
      portalPassword: student.portalPassword || 'Galaxy@1234',
      months: student.months || 1,
      isBlocked: student.isBlocked || false
    });
  };

  const handleSaveStudentEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        mobileNumber: editForm.phone,
        parentMobileNumber: editForm.parentPhone,
        fatherName: editForm.fatherName,
        aadharCard: editForm.aadharCard,
        monthlyFee: Number(editForm.monthlyFee),
        paidFee: Number(editForm.paidFee),
        roomType: editForm.roomType,
        portalPassword: editForm.portalPassword,
        months: Number(editForm.months),
        isBlocked: editForm.isBlocked
      };
      const response = await api.put(`/offline-admissions/${editingStudent._id}`, payload);
      showToast('Student record updated successfully!', 'success');
      const updatedData = response.data?.data || response.data || payload;
      setAdmissions(prev => prev.map(s => s._id === editingStudent._id ? { ...s, ...updatedData } : s));
      setEditingStudent(null);
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleSaveStudentAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: addForm.name,
        email: addForm.email,
        mobileNumber: addForm.phone,
        parentMobileNumber: addForm.parentPhone || 'N/A',
        fatherName: addForm.fatherName || 'N/A',
        aadharCard: addForm.aadharCard || 'N/A',
        monthlyFee: Number(addForm.monthlyFee || 0),
        paidFee: Number(addForm.paidFee || 0),
        roomType: addForm.roomType || 'General',
        pg: addForm.pg || pgs[0]?._id,
        portalPassword: addForm.portalPassword || 'Galaxy@1234',
        months: Number(addForm.months || 1)
      };
      const response = await api.post('/offline-admissions', payload);
      showToast('Student record created successfully!', 'success');
      const createdData = response.data?.data || response.data || payload;
      setAdmissions(prev => [createdData, ...prev]);
      setShowAddStudentModal(false);
      setAddForm({
        name: '',
        email: '',
        phone: '',
        parentPhone: '',
        fatherName: '',
        aadharCard: '',
        monthlyFee: 0,
        paidFee: 0,
        roomType: 'General',
        pg: '',
        portalPassword: 'Galaxy@1234',
        months: 1
      });
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Creation failed', 'error');
    }
  };

  // Setup analytics chart datasets
  const getRevenueChartData = () => {
    if (!analytics || !analytics.pgRevenueBreakdown) return null;
    const labels = Object.keys(analytics.pgRevenueBreakdown);
    const data = Object.values(analytics.pgRevenueBreakdown);
    return {
      labels,
      datasets: [{
        label: 'Earnings (₹)',
        data,
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        borderWidth: 1
      }]
    };
  };

  const getRoomsChartData = () => {
    if (!analytics || !analytics.roomTypeDistribution) return null;
    const labels = Object.keys(analytics.roomTypeDistribution);
    const data = Object.values(analytics.roomTypeDistribution);
    return {
      labels,
      datasets: [{
        label: 'Bookings',
        data,
        backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(16, 115, 81, 0.8)'],
        borderColor: ['#6366f1', '#10b981'],
        borderWidth: 1
      }]
    };
  };

  return (
    <div className="container py-4 page-container text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="font-display mb-0">Owner Dashboard</h2>
        {activeTab === 'pgs' && !showForm && (
          <button className="btn btn-premium-primary" onClick={handleOpenAddForm}>
            + Add New PG
          </button>
        )}
      </div>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-lg-3 col-md-4">
          <div className="premium-card p-3 dashboard-menu shadow-sm">
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'dashboard' }); setShowForm(false); }}
            >
              <i className="bi bi-speedometer2 fs-5"></i>
              <span>Dashboard Overview</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'pgs' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'pgs' }); setShowForm(false); }}
            >
              <i className="bi bi-building fs-5"></i>
              <span>My listed PGs</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'requests' }); setShowForm(false); }}
            >
              <i className="bi bi-card-checklist fs-5"></i>
              <span>Booking Requests</span>
            </button>
            <button
               className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'admissions' ? 'active' : ''}`}
               onClick={() => { setSearchParams({ tab: 'admissions' }); setShowForm(false); }}
             >
               <i className="bi bi-person-plus fs-5"></i>
               <span>Register Student</span>
             </button>
            <button
               className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'matches' ? 'active' : ''}`}
               onClick={() => { setSearchParams({ tab: 'matches' }); setShowForm(false); }}
             >
               <i className="bi bi-person-check fs-5"></i>
               <span>Student Contact Requests</span>
             </button>
             <button
               className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'students' ? 'active' : ''}`}
               onClick={() => { setSearchParams({ tab: 'students' }); setShowForm(false); }}
             >
               <i className="bi bi-person-badge fs-5"></i>
               <span>Student Records</span>
             </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'reviews' }); setShowForm(false); }}
            >
              <i className="bi bi-chat-left-text fs-5"></i>
              <span>Manage Reviews</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'analytics' }); setShowForm(false); }}
            >
              <i className="bi bi-graph-up fs-5"></i>
              <span>Analytics & Metrics</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'subscription' }); setShowForm(false); }}
            >
              <i className="bi bi-wallet2 fs-5"></i>
              <span>Subscription Plans</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 d-flex align-items-center gap-2 ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'settings' }); setShowForm(false); }}
            >
              <i className="bi bi-gear fs-5"></i>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="col-lg-9 col-md-8">
          {showForm && (
            <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetFormFields(); } }} style={{ zIndex: 2050, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
              <div className="modal-box-custom premium-card p-5 position-relative text-start" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}>
                <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => { setShowForm(false); resetFormFields(); }}></button>
                <h4 className="font-display mb-4 text-success fw-bold">{editPgId ? 'Edit Hostels' : 'List New Accommodation'}</h4>
                <form onSubmit={handleSavePG}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">PG Name</label>
                    <input type="text" className="form-control custom-input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Gender Rules</label>
                    <select className="form-select custom-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="boys">Boys Only</option>
                      <option value="girls">Girls Only</option>
                      <option value="unisex">Unisex Co-living</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Description</label>
                  <textarea className="form-control custom-input" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label small text-muted">Address</label>
                    <input type="text" className="form-control custom-input" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">City</label>
                    <input type="text" className="form-control custom-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">State</label>
                    <input type="text" className="form-control custom-input" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Landmark</label>
                    <input type="text" className="form-control custom-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Google Maps Embed URL</label>
                    <input type="text" className="form-control custom-input" value={mapCoordinates} onChange={(e) => setMapCoordinates(e.target.value)} placeholder="https://www.google.com/maps/embed/v1/..." />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Nearby Colleges (Comma-separated)</label>
                    <input type="text" className="form-control custom-input" value={nearbyColleges} onChange={(e) => setNearbyColleges(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Facilities (Comma-separated)</label>
                    <input type="text" className="form-control custom-input" value={facilities} onChange={(e) => setFacilities(e.target.value)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small text-muted mb-2">Hostel Gallery Photos (URLs or Local Uploads)</label>
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          type="text"
                          className="form-control custom-input flex-grow-1"
                          placeholder={`Image URL #${idx + 1} (e.g. https://domain.com/photo.jpg)`}
                          value={imgUrl.startsWith('data:') ? 'Local file uploaded' : imgUrl}
                          onChange={(e) => handleImageURLChange(idx, e.target.value)}
                          disabled={imgUrl.startsWith('data:')}
                        />
                        
                        {/* File Upload Button */}
                        <label className="btn btn-premium-secondary py-2 px-3 mb-0 d-flex align-items-center justify-content-center" style={{ cursor: 'pointer' }}>
                          <i className="bi bi-cloud-upload"></i>
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={(e) => handleImageFileChange(idx, e)}
                          />
                        </label>

                        {imgUrl.startsWith('data:') && (
                          <button type="button" className="btn btn-outline-warning py-2 px-3" onClick={() => handleImageURLChange(idx, '')}>
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}

                        {images.length > 1 && (
                          <button type="button" className="btn btn-outline-danger py-2 px-3" onClick={() => handleRemoveImageURL(idx)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      
                      {/* Image Preview */}
                      {imgUrl && (
                        <div className="mt-2 text-start d-flex align-items-center gap-2">
                          <img
                            src={imgUrl}
                            alt={`Preview #${idx + 1}`}
                            className="rounded border"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          {imgUrl.startsWith('data:') && (
                            <span className="badge bg-success py-1 px-2 text-white">Ready to upload</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-premium-secondary mt-1" onClick={handleAddImageURL}>
                    + Add Another Photo / URL
                  </button>
                </div>

                {/* Rooms section */}
                <hr className="my-4" />
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="font-display mb-0">Rooms & Pricing Packages</h5>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddRoomRow}>+ Add Room Package</button>
                </div>

                <div className="table-responsive mb-4">
                  <table className="table align-middle">
                    <thead>
                      <tr className="table-light">
                        <th>Type Name</th>
                        <th style={{ width: '100px' }}>Sharing</th>
                        <th style={{ width: '120px' }}>Price (₹)</th>
                        <th style={{ width: '100px' }}>Quantity</th>
                        <th>Amenities</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room, idx) => (
                        <tr key={idx}>
                          <td>
                            <input type="text" className="form-control form-control-sm custom-input" value={room.roomType} onChange={(e) => handleRoomChange(idx, 'roomType', e.target.value)} required />
                          </td>
                          <td>
                            <input type="number" className="form-control form-control-sm custom-input" value={room.sharing} onChange={(e) => handleRoomChange(idx, 'sharing', e.target.value)} required />
                          </td>
                          <td>
                            <input type="number" className="form-control form-control-sm custom-input" value={room.price} onChange={(e) => handleRoomChange(idx, 'price', e.target.value)} required />
                          </td>
                          <td>
                            <input type="number" className="form-control form-control-sm custom-input" value={room.availability} onChange={(e) => handleRoomChange(idx, 'availability', e.target.value)} required />
                          </td>
                          <td>
                            <input type="text" className="form-control form-control-sm custom-input" value={room.amenities.join(', ')} onChange={(e) => handleRoomChange(idx, 'amenities', e.target.value)} placeholder="AC, Wifi" />
                          </td>
                          <td className="text-end">
                            <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => handleRemoveRoomRow(idx)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Terms and Conditions */}
                <hr className="my-4" />
                <div className="p-4 border rounded mb-4" style={{ backgroundColor: 'rgba(200, 155, 60, 0.05)', borderColor: 'var(--surface-border)' }}>
                  <h6 className="font-display fw-bold mb-3"><i className="bi bi-shield-check text-primary me-2"></i>Terms & Conditions</h6>
                  <ul className="small text-muted ps-3 mb-3 d-flex flex-column gap-2" style={{ listStyleType: 'disc' }}>
                    <li>Only genuine PG/Hostel properties are allowed.</li>
                    <li>Fake or misleading information may lead to account suspension.</li>
                    <li>Owners are responsible for maintaining accurate rent, facilities, and room availability.</li>
                    <li>PGVerse charges are non-refundable after plan activation.</li>
                    <li>Admin has the right to verify or reject any listing.</li>
                    <li>Property images must be real and belong to the listed property.</li>
                  </ul>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="agreeTermsCheck"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="agreeTermsCheck" style={{ color: 'var(--text)' }}>
                      I have read and agree to the Terms & Conditions.
                    </label>
                  </div>
                </div>

                <div className="d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-premium-secondary" onClick={() => { setShowForm(false); resetFormFields(); }}>Cancel</button>
                  <button type="submit" className="btn btn-premium-primary" disabled={!agreeTerms}>Save Accommodation</button>
                </div>
              </form>
            </div>
          </div>
        )}

          <>
              {activeTab === 'dashboard' && (
                <>
                  <div className="premium-card p-4 mb-4" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="small text-muted text-uppercase tracking-wider font-display">Subscription Plan</span>
                          {subData.activeSubscription ? (
                            <span className="badge bg-success text-white">Active</span>
                          ) : subData.pendingSubscription ? (
                            <span className="badge bg-warning text-dark">Pending Admin Approval</span>
                          ) : (
                            <span className="badge bg-danger text-white">No Active Plan</span>
                          )}
                        </div>
                        <h4 className="font-display mb-1 text-primary fw-bold" style={{ color: 'var(--primary-theme)' }}>
                          {subData.activeSubscription ? `${subData.activeSubscription.planName.toUpperCase()} Plan` : subData.pendingSubscription ? `${subData.pendingSubscription.planName.toUpperCase()} Plan (Pending)` : 'No Plan Purchased'}
                        </h4>
                        <p className="small text-muted mb-0">
                          {subData.activeSubscription ? (
                            <>
                              Expires on: <strong>{new Date(subData.activeSubscription.endDate).toLocaleDateString()}</strong> | 
                              Listings Used: <strong>{subData.listingsUsed} / {subData.activeSubscription.listingLimit === 9999 ? 'Unlimited' : subData.activeSubscription.listingLimit}</strong>
                            </>
                          ) : subData.pendingSubscription ? (
                            <>Your subscription request is pending. Admin will approve it shortly.</>
                          ) : (
                            <>Choose a subscription plan to publish and manage your PG listings on PGVerse.</>
                          )}
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm px-3" onClick={() => setSearchParams({ tab: 'subscription' })}>
                          {subData.activeSubscription ? 'Upgrade Plan' : subData.pendingSubscription ? 'View Requests' : 'Buy Plan'}
                        </button>
                        {subData.activeSubscription && (
                          <button className="btn btn-premium-primary btn-sm px-3" onClick={() => setSearchParams({ tab: 'subscription' })}>
                            Renew Subscription
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Metrics Grid */}
                  {(() => {
                    const totalPGCount = pgs.length;
                    const approvedPGCount = pgs.filter(p => p.isApproved).length;
                    const pendingPGCount = pgs.filter(p => !p.isApproved).length;

                    const acceptedBookings = bookings.filter(b => b.bookingStatus === 'accepted');
                    const pendingBookings = bookings.filter(b => b.bookingStatus === 'pending');
                    const studentCount = acceptedBookings.length;
                    
                    const completedPaymentBookings = bookings.filter(b => b.paymentStatus === 'completed');
                    const pendingPaymentBookings = bookings.filter(b => b.paymentStatus === 'pending');
                    
                    const totalEarnings = completedPaymentBookings.reduce((sum, b) => sum + (b.advancePaymentAmount || 0), 0);
                    const pendingEarnings = pendingPaymentBookings.reduce((sum, b) => sum + (b.advancePaymentAmount || 0), 0);

                    return (
                      <div className="d-flex flex-wrap gap-3 mb-4">
                        <div className="flex-fill" style={{ minWidth: '200px' }}>
                          <div 
                            className="premium-card p-3 d-flex align-items-center gap-3 shadow-sm border-0 h-100" 
                            style={{ background: 'rgba(99, 102, 241, 0.04)', borderLeft: '3px solid #6366f1', cursor: 'pointer' }}
                            onClick={() => setSearchParams({ tab: 'pgs' })}
                          >
                            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                              <i className="bi bi-building fs-5"></i>
                            </div>
                            <div>
                              <span className="small text-muted d-block font-display" style={{ fontSize: '0.75rem' }}>Total PGs</span>
                              <h5 className="mb-0 fw-bold font-display" style={{ color: 'var(--text)' }}>{totalPGCount}</h5>
                            </div>
                          </div>
                        </div>

                        <div className="flex-fill" style={{ minWidth: '200px' }}>
                          <div 
                            className="premium-card p-3 d-flex align-items-center gap-3 shadow-sm border-0 h-100" 
                            style={{ background: 'rgba(16, 185, 129, 0.04)', borderLeft: '3px solid #10b981', cursor: 'pointer' }}
                            onClick={() => setSearchParams({ tab: 'pgs' })}
                          >
                            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                              <i className="bi bi-check-circle fs-5"></i>
                            </div>
                            <div>
                              <span className="small text-muted d-block font-display" style={{ fontSize: '0.75rem' }}>Approved PGs</span>
                              <h5 className="mb-0 fw-bold font-display" style={{ color: 'var(--text)' }}>{approvedPGCount}</h5>
                            </div>
                          </div>
                        </div>

                        <div className="flex-fill" style={{ minWidth: '200px' }}>
                          <div 
                            className="premium-card p-3 d-flex align-items-center gap-3 shadow-sm border-0 h-100" 
                            style={{ background: 'rgba(59, 130, 246, 0.04)', borderLeft: '3px solid #3b82f6', cursor: 'pointer' }}
                            onClick={() => setSearchParams({ tab: 'admissions' })}
                          >
                            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                              <i className="bi bi-people fs-5"></i>
                            </div>
                            <div>
                              <span className="small text-muted d-block font-display" style={{ fontSize: '0.75rem' }}>Students</span>
                              <h5 className="mb-0 fw-bold font-display" style={{ color: 'var(--text)' }}>{studentCount}</h5>
                            </div>
                          </div>
                        </div>

                        <div className="flex-fill" style={{ minWidth: '200px' }}>
                          <div 
                            className="premium-card p-3 d-flex align-items-center gap-3 shadow-sm border-0 h-100" 
                            style={{ background: 'rgba(139, 92, 246, 0.04)', borderLeft: '3px solid #8b5cf6', cursor: 'pointer' }}
                            onClick={() => {
                              setShowPaymentsLogModal(true);
                              setPaymentsSearchQuery('');
                            }}
                          >
                            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                              <i className="bi bi-cash-coin fs-5"></i>
                            </div>
                            <div>
                              <span className="small text-muted d-block font-display" style={{ fontSize: '0.75rem' }}>Payments</span>
                              <h5 className="mb-0 fw-bold font-display" style={{ color: 'var(--text)' }}>₹{totalEarnings}</h5>
                            </div>
                          </div>
                        </div>

                        <div className="flex-fill" style={{ minWidth: '200px' }}>
                          <div 
                            className="premium-card p-3 d-flex align-items-center gap-3 shadow-sm border-0 h-100" 
                            style={{ background: 'rgba(239, 68, 68, 0.04)', borderLeft: '3px solid #ef4444', cursor: 'pointer' }}
                            onClick={() => {
                              setShowPendingDuesModal(true);
                            }}
                          >
                            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                              <i className="bi bi-hourglass-split fs-5"></i>
                            </div>
                            <div>
                              <span className="small text-muted d-block font-display" style={{ fontSize: '0.75rem' }}>Due / Pending</span>
                              <h5 className="mb-0 fw-bold font-display" style={{ color: 'var(--text)' }}>₹{pendingEarnings}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {activeTab === 'pgs' && (
                <div className="premium-card p-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <h4 className="font-display mb-0">My listed Accommodations</h4>
                    <button className="btn btn-premium-primary btn-sm" onClick={handleOpenAddForm}>
                      <i className="bi bi-plus-circle me-1"></i>List New PG
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                      <i className="bi bi-search me-2 text-muted"></i>
                      <input
                        type="text"
                        className="input-blank flex-grow-1"
                        placeholder="Search accommodations by name, city, or location..."
                        value={pgSearchQuery}
                        onChange={(e) => setPgSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)', width: '100%' }}
                      />
                      {pgSearchQuery && (
                        <button 
                          type="button" 
                          className="btn-close" 
                          onClick={() => setPgSearchQuery('')}
                          style={{ filter: 'var(--close-filter)', fontSize: '0.75rem' }}
                        ></button>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <Loader />
                  ) : pgs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-building fs-1 mb-3 d-block"></i>
                      <p className="mb-3">You haven't listed any hostel accommodations yet.</p>
                      <button className="btn btn-premium-primary btn-sm" onClick={handleOpenAddForm}>List PG now</button>
                    </div>
                  ) : (() => {
                    const filtered = pgs.filter(pgItem => {
                      const query = pgSearchQuery.toLowerCase();
                      return (
                        pgItem.name?.toLowerCase().includes(query) ||
                        pgItem.location?.city?.toLowerCase().includes(query) ||
                        pgItem.location?.address?.toLowerCase().includes(query)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-search fs-2 mb-2 d-block"></i>
                          <p className="mb-0">No accommodations match your search query.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="d-flex flex-column gap-3">
                        {filtered.map((pgItem, index) => (
                          <div key={pgItem._id} className="p-3 border rounded d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                              <h5 className="font-display mb-1"><span className="text-muted me-2">{index + 1}.</span>{pgItem.name}</h5>
                              <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{pgItem.location.address}, {pgItem.location.city}</small>
                              <div className="d-flex gap-2 mt-2">
                                <span className="badge bg-light text-dark border">
                                  Approval: {pgItem.isApproved ? '🟢 APPROVED' : '🟡 PENDING'}
                                </span>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                type="button"
                                className="btn btn-owner-view"
                                onClick={() => handleOpenManageModal(pgItem)}
                              >
                                <i className="bi bi-eye me-2"></i>View
                              </button>
                              <button className="btn btn-owner-edit" onClick={() => handleOpenEditForm(pgItem)}>
                                <i className="bi bi-pencil-square me-2"></i>Edit
                              </button>
                              <button className="btn btn-owner-delete" onClick={() => setDeleteConfirmId(pgItem._id)}>
                                <i className="bi bi-trash me-2"></i>Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">Booking Requests</h4>
                  {loading ? <Loader /> : bookings.filter(b => b.bookingStatus === 'pending').length === 0 ? (
                    <p className="text-muted small text-center my-4">No pending booking requests received yet.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {bookings.filter(b => b.bookingStatus === 'pending').map((req) => (
                        <div key={req._id} className="p-3 border rounded d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="font-display mb-1">{req.pg?.name} - {req.roomType}</h6>
                            <p className="small text-muted mb-1">Student: <strong>{req.student?.name}</strong> ({req.student?.phone})</p>
                            <div className="d-flex gap-3 small text-muted mt-1">
                              <span>Start Date: {new Date(req.bookingDate).toLocaleDateString()}</span>
                              <span>Stay: {req.duration} Mos</span>
                              <span>Advance: ₹{req.advancePaymentAmount}</span>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            {req.bookingStatus === 'pending' ? (
                              <>
                                <button className="btn btn-sm btn-success text-white py-1 px-3" onClick={() => handleUpdateBooking(req._id, 'accepted')}>Accept</button>
                                <button className="btn btn-sm btn-danger text-white py-1 px-3" onClick={() => handleUpdateBooking(req._id, 'rejected')}>Reject</button>
                              </>
                            ) : (
                              <span className="badge bg-light text-dark uppercase small">{req.bookingStatus}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB ADMISSIONS: OFFLINE STUDENT REGISTRATION */}
              {activeTab === 'admissions' && (
                <div className="premium-card p-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <h4 className="font-display mb-0">Offline Admission Registry</h4>
                    <button 
                      className="btn btn-premium-primary d-flex align-items-center gap-2"
                      onClick={handleOpenAdmissionModal}
                    >
                      <i className="bi bi-person-plus-fill"></i> Admit New Student
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                      <i className="bi bi-search me-2 text-muted"></i>
                      <input
                        type="text"
                        className="input-blank flex-grow-1"
                        placeholder="Search admitted students by name, father's name, phone, aadhar, or accommodation..."
                        value={admissionSearchQuery}
                        onChange={(e) => setAdmissionSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)', width: '100%' }}
                      />
                      {admissionSearchQuery && (
                        <button 
                          type="button" 
                          className="btn-close" 
                          onClick={() => setAdmissionSearchQuery('')}
                          style={{ filter: 'var(--close-filter)', fontSize: '0.75rem' }}
                        ></button>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <Loader />
                  ) : admissions.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-person-badge fs-1 mb-3 d-block"></i>
                      <p className="mb-0">No offline student admissions registered yet.</p>
                    </div>
                  ) : (() => {
                    const filtered = admissions.filter(adm => {
                      const query = admissionSearchQuery.toLowerCase();
                      return (
                        adm.name?.toLowerCase().includes(query) ||
                        adm.fatherName?.toLowerCase().includes(query) ||
                        adm.mobileNumber?.toLowerCase().includes(query) ||
                        adm.aadharCard?.toLowerCase().includes(query) ||
                        adm.pg?.name?.toLowerCase().includes(query)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-search fs-2 mb-2 d-block"></i>
                          <p className="mb-0">No student records match your search query.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Father's Name</th>
                              <th>Contact Info</th>
                              <th>Aadhar Card</th>
                              <th>Assigned Accommodation</th>
                              <th>Room Type</th>
                              <th>Monthly Fee</th>
                              <th>Paid Fee</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((adm, index) => (
                              <tr key={adm._id || index}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    {adm.photo ? (
                                      <img 
                                        src={adm.photo} 
                                        alt={adm.name} 
                                        className="rounded-circle object-fit-cover" 
                                        style={{ width: '40px', height: '40px', border: '1px solid var(--surface-border)' }}
                                      />
                                    ) : (
                                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', color: 'var(--primary-theme)' }}>
                                        <i className="bi bi-person-fill fs-5"></i>
                                      </div>
                                    )}
                                    <strong>{adm.name}</strong>
                                  </div>
                                </td>
                                <td>{adm.fatherName}</td>
                                <td>
                                  <span className="small d-block"><i className="bi bi-telephone text-muted me-1"></i>{adm.mobileNumber}</span>
                                  <span className="small d-block"><i className="bi bi-shield text-muted me-1"></i>P: {adm.parentMobileNumber}</span>
                                </td>
                                <td><span className="badge bg-light text-dark border font-monospace">{adm.aadharCard}</span></td>
                                <td>
                                  <strong>{adm.pg?.name || 'N/A'}</strong>
                                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{adm.pg?.location?.city}</small>
                                </td>
                                <td><span className="badge bg-secondary text-white">{adm.roomType}</span></td>
                                <td>₹{adm.monthlyFee}</td>
                                <td>₹{adm.paidFee}</td>
                                <td className="text-end">
                                  <div className="d-flex gap-2 justify-content-end">
                                    <button 
                                      className="btn btn-outline-success btn-sm"
                                      onClick={() => handleOpenUpdatePaidFeeModal(adm)}
                                    >
                                      <i className="bi bi-pencil-square"></i> Update Fee
                                    </button>
                                    <button 
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => {
                                        setGenericConfirmModal({
                                          title: "Delete Admission?",
                                          message: "Do you really want to delete this registered student admission record?",
                                          onConfirm: () => handleDeleteAdmission(adm._id)
                                        });
                                      }}
                                    >
                                      <i className="bi bi-trash"></i> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB MATCHES: STUDENT MATCHES FOR PROPERTY LOCATION */}
              {activeTab === 'matches' && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">New Student Requests (Matching)</h4>
                  {loading ? <Loader /> : matchedReqs.length === 0 ? (
                    <p className="text-muted small text-center my-4">No student requirements matched currently.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3 text-start mb-5">
                      {matchedReqs.map((req) => (
                        <div key={req._id} className="p-4 border rounded animate-fade-in">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="font-display mb-1" style={{ fontSize: '1.05rem' }}>Student: {req.student?.name}</h5>
                              <p className="small text-muted mb-2"><i className="bi bi-envelope me-1"></i>{req.student?.email} | <i className="bi bi-telephone me-1"></i>{req.student?.phone}</p>
                              
                              <div className="d-flex flex-column gap-1 small mt-2">
                                <span><strong>Preferred Location:</strong> {req.preferredLocation}</span>
                                <span><strong>Budget Limit:</strong> ₹{req.budget}/Month</span>
                                <span><strong>Gender Pref:</strong> <span className="text-capitalize">{req.gender}</span></span>
                              </div>
                            </div>

                            <div className="text-end">
                              <span className="small text-muted d-block mb-2">My Matching Property:</span>
                              {req.matchedPGs.map((myPg) => (
                                <div key={myPg._id} className="d-flex gap-2 justify-content-end mb-2">
                                  <span className="small fw-semibold text-indigo align-self-center me-2">{myPg.name}</span>
                                  <button 
                                    className="btn btn-sm btn-success text-white py-1 px-3"
                                    onClick={() => handleOwnerMatchAction(req._id, myPg._id, 'accept')}
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger py-1 px-3"
                                    onClick={() => handleOwnerMatchAction(req._id, myPg._id, 'reject')}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <hr className="my-5" />

                  <h4 className="font-display mb-4 text-success fw-bold">Accepted Booked Students (Contact Info)</h4>
                  {(() => {
                    const acceptedBookings = (Array.isArray(bookings) ? bookings : []).filter(b => b.bookingStatus === 'accepted');
                    if (acceptedBookings.length === 0) {
                      return <p className="text-muted small text-center my-4">No accepted student bookings found.</p>;
                    }
                    return (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead>
                            <tr className="table-light">
                              <th style={{ width: '80px' }}>S.No.</th>
                              <th>Student Name</th>
                              <th>PG Booked</th>
                              <th>Room Type</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Booking Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {acceptedBookings.map((b, idx) => (
                              <tr key={b._id || idx}>
                                <td><strong>{idx + 1}</strong></td>
                                <td><strong>{b.student?.name || 'Student'}</strong></td>
                                <td>{b.pg?.name || 'N/A'}</td>
                                <td><span className="badge bg-secondary text-white">{b.roomType}</span></td>
                                <td>{b.student?.email}</td>
                                <td>{b.student?.phone || 'N/A'}</td>
                                <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4 font-indigo">Manage Property Reviews</h4>
                  {loading ? <Loader /> : reviews.length === 0 ? (
                    <p className="text-muted small text-center my-4">No reviews posted on your PGs yet.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3 text-start">
                      {reviews.map((rev) => (
                        <div key={rev._id} className="p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="font-display mb-0">{rev.user?.name || 'Anonymous Student'}</h6>
                              <small className="text-muted">on <strong>{rev.pgName}</strong></small>
                            </div>
                            <div className="review-stars">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i key={star} className={`bi bi-star${rev.rating >= star ? '-fill text-warning' : ''} small`}></i>
                              ))}
                            </div>
                          </div>
                          <p className="small mb-2 text-muted italic">"{rev.comment}"</p>

                          {rev.ownerReply ? (
                            <div className="p-2 bg-light border-start border-primary border-3 small text-muted">
                              <strong>Your response:</strong> "{rev.ownerReply}"
                            </div>
                          ) : (
                            activeReplyId === rev._id ? (
                              <div className="d-flex gap-2 mt-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm custom-input"
                                  placeholder="Type reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button className="btn btn-sm btn-premium-primary" onClick={() => handleReviewReply(rev._id)}>Send</button>
                                <button className="btn btn-sm btn-premium-secondary" onClick={() => setActiveReplyId(null)}>Cancel</button>
                              </div>
                            ) : (
                              <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none" onClick={() => { setActiveReplyId(rev._id); setReplyText(''); }}>
                                Reply to Review
                              </button>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">Revenue & Occupancy Metrics</h4>
                  {loading ? <Loader /> : !analytics ? (
                    <p className="text-muted small">No metrics currently available</p>
                  ) : (
                    <div>
                      <div className="row g-3 mb-5">
                        <div className="col-md-4">
                          <div className="stat-card" style={{ borderTop: '4px solid #6366f1', background: 'linear-gradient(180deg, var(--surface) 0%, rgba(99, 102, 241, 0.08) 100%)' }}>
                            <span className="text-muted small text-uppercase font-display tracking-wider mb-2 d-block">Listed PGs</span>
                            <h3 className="font-display mt-1 text-primary fw-bold">{analytics.totalPGs}</h3>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="stat-card" style={{ borderTop: '4px solid #10b981', background: 'linear-gradient(180deg, var(--surface) 0%, rgba(16, 185, 129, 0.08) 100%)' }}>
                            <span className="text-muted small text-uppercase font-display tracking-wider mb-2 d-block">Confirmed Bookings</span>
                            <h3 className="font-display mt-1 text-success fw-bold">{analytics.totalBookings}</h3>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6', background: 'linear-gradient(180deg, var(--surface) 0%, rgba(139, 92, 246, 0.08) 100%)' }}>
                            <span className="text-muted small text-uppercase font-display tracking-wider mb-2 d-block">Estimated Revenue</span>
                            <h3 className="font-display mt-1 fw-bold" style={{ color: '#8b5cf6' }}>₹{analytics.totalRevenue}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="row g-4 justify-content-center">
                        <div className="col-md-6 col-lg-5">
                          <h6 className="font-display text-center mb-3">Revenue by Property</h6>
                          {getRevenueChartData() ? (
                            <Doughnut data={getRevenueChartData()} />
                          ) : (
                            <span className="small text-muted text-center d-block">No revenues breakdown</span>
                          )}
                        </div>
                        <div className="col-md-6 col-lg-7">
                          <h6 className="font-display text-center mb-3">Popular Room Packages</h6>
                          {getRoomsChartData() ? (
                            <Bar
                              data={getRoomsChartData()}
                              options={{
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: { stepSize: 1 }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <span className="small text-muted text-center d-block">No occupancy distributions</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'subscription' && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">Subscription & Listing System</h4>
                  
                  {paymentSuccess && createdSub ? (
                    <div className="success-payment-view text-center py-4">
                      {/* Confetti & Checkmark Screen */}
                      <div className="success-card-wrapper animate-fade-in mb-4">
                        <div className="confetti-container">
                          <div className="confetti-piece"></div>
                          <div className="confetti-piece"></div>
                          <div className="confetti-piece"></div>
                          <div className="confetti-piece"></div>
                          <div className="confetti-piece"></div>
                          <div className="confetti-piece"></div>
                          <div className="confetti-piece"></div>
                          <div className="confetti-piece"></div>
                        </div>

                        <div className="success-checkmark-circle" style={{ background: 'var(--success)', color: '#fff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.5rem' }}>
                          <i className="bi bi-check-lg"></i>
                        </div>

                        <h2 className="success-title">Payment succeeded!</h2>
                        <p className="success-subtitle">
                          Your subscription plan request was submitted successfully. Admin will review and activate it shortly!
                        </p>

                        <div className="d-flex flex-column gap-2 align-items-center mt-4">
                          <button 
                            className="btn btn-premium-primary"
                            onClick={() => {
                              setCheckoutPlan(null);
                              setPaymentSuccess(false);
                              setCreatedSub(null);
                              setShowSubReceipt(false);
                            }}
                          >
                            Back to Subscription Panel
                          </button>
                          
                          <button 
                            className="btn btn-link text-primary mt-2" 
                            onClick={() => setShowSubReceipt(!showSubReceipt)}
                          >
                            <i className={`bi ${showSubReceipt ? 'bi-eye-slash' : 'bi-receipt'} me-2`}></i>
                            {showSubReceipt ? 'Hide Receipt' : 'View / Print Subscription Receipt'}
                          </button>
                        </div>
                      </div>

                      {/* Printable Receipt */}
                      {showSubReceipt && (
                        <div className="row justify-content-center mt-4">
                          <div className="col-md-9 col-lg-8">
                            <div className="premium-card p-5 text-start receipt-container border" id="printable-receipt" style={{ background: '#FFFFFF', color: '#2D2A26' }}>
                              <div className="text-center mb-4 receipt-header">
                                <span className="fs-1 d-block mb-2">✅</span>
                                <h3 className="font-display text-success">Subscription Confirmed!</h3>
                                <p className="text-muted small">Thank you for subscribing to PGVerse. Here is your receipt.</p>
                              </div>

                              <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                                <div>
                                  <h6 className="font-display mb-1 text-dark">PGVerse Pvt Ltd.</h6>
                                  <p className="text-muted small mb-0">Mumbai, Maharashtra, India</p>
                                </div>
                                <div className="text-end">
                                  <h6 className="font-display text-uppercase mb-1" style={{ color: 'var(--accent)' }}>Receipt</h6>
                                  <p className="small mb-0 font-monospace text-muted">{createdSub.receiptNumber || 'N/A'}</p>
                                </div>
                              </div>

                              <div className="row g-3 small mb-4">
                                <div className="col-6">
                                  <span className="text-muted text-uppercase d-block fs-8">Billed To (Owner)</span>
                                  <span className="fw-semibold text-dark">{user.name}</span>
                                  <span className="text-muted d-block">{user.email}</span>
                                </div>
                                <div className="col-6 text-end">
                                  <span className="text-muted text-uppercase d-block fs-8">Subscription Details</span>
                                  <span className="fw-semibold text-dark">{createdSub.planName?.toUpperCase()} Plan</span>
                                  <span className="text-muted d-block">Listing Limit: {createdSub.listingLimit === 9999 ? 'Unlimited' : `${createdSub.listingLimit} Listings`}</span>
                                </div>
                              </div>

                              <table className="table table-borderless table-sm small border-bottom mb-4">
                                <thead>
                                  <tr className="table-light">
                                    <th className="text-dark">Description</th>
                                    <th className="text-end text-dark">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="text-dark">PGVerse Owner Subscription - {createdSub.planName?.toUpperCase()} Package</td>
                                    <td className="text-end text-dark">₹{createdSub.price}</td>
                                  </tr>
                                  <tr className="border-top fw-bold text-dark fs-6">
                                    <td>Total Paid</td>
                                    <td className="text-end">₹{createdSub.price}</td>
                                  </tr>
                                </tbody>
                              </table>

                              <div className="bg-light p-3 rounded small mb-4 font-monospace border text-dark">
                                <div className="d-flex justify-content-between">
                                  <span>Subscription ID:</span>
                                  <span>{createdSub._id}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span>Transaction ID:</span>
                                  <span>{createdSub.transactionId || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span>Order Date:</span>
                                  <span>{new Date(createdSub.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span>Payment Status:</span>
                                  <span className="text-warning fw-bold text-uppercase">Awaiting Admin Approval</span>
                                </div>
                              </div>

                              <p className="text-muted fs-8 text-center mb-0">
                                This is a computer-generated subscription receipt and does not require signatures.
                              </p>

                              <div className="d-flex gap-3 mt-4 justify-content-center print-hide">
                                <button className="btn btn-premium-secondary py-2.5 px-4" onClick={() => window.print()}>
                                  <i className="bi bi-printer me-2"></i> Print / Download Receipt
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : checkoutPlan ? (
                    <div className="row justify-content-center text-start">
                      {buyingPlan && <Loader fullPage={true} />}
                      <div className="col-lg-10">
                        <div className="premium-card p-4 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', borderColor: 'var(--surface-border)' }}>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="font-display mb-0">Subscription Checkout</h3>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-premium-secondary"
                              onClick={() => setCheckoutPlan(null)}
                            >
                              Cancel & Go Back
                            </button>
                          </div>

                          <form onSubmit={handlePaySubscription}>
                            {/* Summary Box */}
                            <div className="p-3 bg-light rounded border mb-4">
                              <div className="d-flex justify-content-between font-display text-dark small mb-1">
                                <span>Selected Package:</span>
                                <span className="fw-bold text-uppercase text-primary">{checkoutPlan.name} Plan</span>
                              </div>
                              <div className="d-flex justify-content-between font-display text-dark small mb-1">
                                <span>Listings Allowed:</span>
                                <span className="fw-semibold">{checkoutPlan.limit === 9999 ? 'Unlimited' : `${checkoutPlan.limit} listings`}</span>
                              </div>
                              <div className="d-flex justify-content-between font-display text-primary fw-bold fs-5 mt-2 pt-2 border-top">
                                <span>Amount Payable:</span>
                                <span>₹{checkoutPlan.price}</span>
                              </div>
                            </div>

                            {/* Payment Method Switcher */}
                            <h5 className="font-display mb-3">Choose Payment Method</h5>
                            <div className="d-flex gap-3 mb-4">
                              <button
                                type="button"
                                className={`btn flex-grow-1 py-3 border d-flex align-items-center justify-content-center gap-2 ${paymentMethod === 'card' ? 'active-method border-primary text-primary' : 'bg-white'}`}
                                onClick={() => setPaymentMethod('card')}
                                style={paymentMethod === 'card' ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--surface)' } : {}}
                              >
                                <i className="bi bi-credit-card fs-4"></i>
                                <span className="font-display fw-bold">Card</span>
                              </button>
                              <button
                                type="button"
                                className={`btn flex-grow-1 py-3 border d-flex align-items-center justify-content-center gap-2 ${paymentMethod === 'upi' ? 'active-method border-primary text-primary' : 'bg-white'}`}
                                onClick={() => setPaymentMethod('upi')}
                                style={paymentMethod === 'upi' ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--surface)' } : {}}
                              >
                                <i className="bi bi-phone-vibrate fs-4"></i>
                                <span className="font-display fw-bold">UPI / QR</span>
                              </button>
                            </div>

                            {paymentMethod === 'card' ? (
                              <div className="card-payment-form">
                                <div className="mb-3">
                                  <label className="form-label small text-muted font-display">Cardholder Name</label>
                                  <input type="text" className="form-control custom-input" placeholder="e.g. John Doe" required />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label small text-muted font-display">Card Number</label>
                                  <input
                                    type="text"
                                    className="form-control custom-input"
                                    placeholder="1234 5678 1234 5678"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    maxLength={16}
                                    required
                                  />
                                </div>
                                <div className="row g-3 mb-4">
                                  <div className="col-6">
                                    <label className="form-label small text-muted font-display">Expiry Date</label>
                                    <input
                                      type="text"
                                      className="form-control custom-input"
                                      placeholder="MM/YY"
                                      value={cardExpiry}
                                      onChange={(e) => setCardExpiry(e.target.value)}
                                      maxLength={5}
                                      required
                                    />
                                  </div>
                                  <div className="col-6">
                                    <label className="form-label small text-muted font-display">CVV</label>
                                    <input
                                      type="password"
                                      className="form-control custom-input"
                                      placeholder="•••"
                                      value={cardCvv}
                                      onChange={(e) => setCardCvv(e.target.value)}
                                      maxLength={3}
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="upi-dual-panel">
                                <div className="upi-left-form text-start">
                                  <h5 className="font-display mb-3">UPI / QR Checkout</h5>
                                  
                                  <div className="mb-3">
                                    <label className="form-label small text-muted font-display">Email Address</label>
                                    <input 
                                      type="email" 
                                      className="form-control custom-input" 
                                      placeholder="yourname@domain.com" 
                                      defaultValue={user?.email} 
                                      readOnly 
                                    />
                                  </div>
                                  
                                  <div className="mb-3">
                                    <label className="form-label small text-muted font-display">Enter Subject / Note</label>
                                    <input 
                                      type="text" 
                                      className="form-control custom-input" 
                                      placeholder="PGVerse Subscription Plan" 
                                      defaultValue={`${checkoutPlan.name?.toUpperCase()} Plan subscription`}
                                      readOnly
                                    />
                                  </div>

                                  <div className="mb-3">
                                    <label className="form-label small text-muted font-display">UPI ID (e.g. name@upi)</label>
                                    <input
                                      type="text"
                                      className="form-control custom-input"
                                      placeholder="john@okaxis"
                                      value={upiId}
                                      onChange={(e) => setUpiId(e.target.value)}
                                      required={paymentMethod === 'upi'}
                                    />
                                    <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                                      QR code updates dynamically as you type your UPI ID.
                                    </small>
                                  </div>
                                </div>

                                <div className="upi-right-qr">
                                  <div className={`qr-box-container ${qrFrame === 'Glassmorphic Frame' ? 'frame-glass' : qrFrame === 'Minimalist Frame' ? 'frame-minimal' : 'frame-standard'}`}>
                                    <div className="position-relative" style={{ width: '130px', height: '130px' }}>
                                      <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&color=${getQrColor()}&data=${encodeURIComponent(
                                          upiId ? `upi://pay?pa=${upiId}&pn=PGVerse&am=${checkoutPlan.price}&cu=INR` : `upi://pay?pa=pgverse@pay&pn=PGVerse&am=${checkoutPlan.price}&cu=INR`
                                        )}`} 
                                        alt="UPI Payment QR Code"
                                        title="Scan to pay via UPI"
                                        style={{ width: '130px', height: '130px', display: 'block' }}
                                      />
                                      {qrLogo === 'PGVerse Icon' && (
                                        <div className="qr-center-logo position-absolute start-50 top-50 translate-middle d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm border border-warning" style={{ width: '26px', height: '26px', zIndex: 10 }}>
                                          <span style={{ fontSize: '0.7rem', lineHeight: '1' }}>🏠</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <button type="submit" className="btn btn-premium-primary w-100 py-3 font-display mt-3">
                              Confirm & Pay ₹{checkoutPlan.price}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Current Active Plan Card */}
                      <div className="p-4 rounded border mb-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--surface-border)' }}>
                        <div className="row g-4 align-items-center">
                          <div className="col-md-8">
                            <span className="small text-muted text-uppercase tracking-wider font-display mb-1 d-block">Current Subscription status</span>
                            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-display mb-0 text-primary fw-bold" style={{ color: 'var(--primary-theme)' }}>
                                {subData.activeSubscription ? `${subData.activeSubscription.planName.toUpperCase()} Plan` : 'No Active Plan'}
                              </h3>
                              {subData.activeSubscription ? (
                                <span className="badge bg-success py-1.5 px-3 text-white">Active Plan</span>
                              ) : subData.pendingSubscription ? (
                                <span className="badge bg-warning py-1.5 px-3 text-dark">Pending Admin Approval</span>
                              ) : (
                                <span className="badge bg-danger py-1.5 px-3 text-white">Expired Plan</span>
                              )}
                            </div>
                            <p className="small text-muted mb-0">
                              {subData.activeSubscription ? (
                                <>
                                  Valid from: <strong>{new Date(subData.activeSubscription.startDate).toLocaleDateString()}</strong> to <strong>{new Date(subData.activeSubscription.endDate).toLocaleDateString()}</strong>
                                  <br />
                                  Listing capacity: <strong>{subData.listingsUsed}</strong> listings used out of <strong>{subData.activeSubscription.listingLimit === 9999 ? 'Unlimited' : subData.activeSubscription.listingLimit}</strong> limit.
                                </>
                              ) : subData.pendingSubscription ? (
                                <>
                                  You requested the <strong>{subData.pendingSubscription.planName.toUpperCase()}</strong> plan (₹{subData.pendingSubscription.price}).
                                  <br />
                                  Awaiting Admin payment approval. Please wait for activation.
                                </>
                              ) : (
                                <>Choose a subscription plan below to publish and manage your PG listings on PGVerse.</>
                              )}
                            </p>
                          </div>
                          
                          <div className="col-md-4 text-md-end">
                            <div className="d-flex flex-column gap-2 align-items-md-end justify-content-center">
                              <span className="small text-muted">Remaining Limit</span>
                              <h2 className="font-display mb-0 fw-bold">
                                {subData.activeSubscription ? (
                                  subData.activeSubscription.listingLimit === 9999 ? '∞' : (subData.activeSubscription.listingLimit - subData.listingsUsed)
                                ) : 0}
                              </h2>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Cards Section */}
                      <h5 className="font-display mb-4 text-center">Available Subscription Plans</h5>
                      <div className="row g-4 justify-content-center mb-5">
                        {/* Basic Plan */}
                        <div className="col-md-4">
                          <div className="p-4 border rounded h-100 d-flex flex-column text-center pricing-card" style={{ background: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                            <h5 className="font-display fw-bold mb-1 text-primary">Basic Plan</h5>
                            <div className="my-3">
                              <h2 className="font-display fw-bold mb-0 text-dark" style={{ color: 'var(--text)' }}>₹299</h2>
                              <span className="small text-muted">/ Month</span>
                            </div>
                            <ul className="list-unstyled small text-muted text-start my-4 flex-grow-1 d-flex flex-column gap-2">
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Add up to <strong>2 PG listings</strong></li>
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Basic customer support</li>
                              <li><i className="bi bi-x-circle text-danger me-2"></i>No Priority listing</li>
                              <li><i className="bi bi-x-circle text-danger me-2"></i>No Featured PG badge</li>
                            </ul>
                            <button 
                              className="btn btn-purple-gradient w-100 py-2.5 fw-semibold mt-3"
                              disabled={buyingPlan || subData.pendingSubscription || (subData.activeSubscription?.planName === 'basic')}
                              onClick={() => handleBuyPlan('basic')}
                            >
                              {subData.activeSubscription?.planName === 'basic' ? 'Current Plan' : 'Buy Plan'}
                            </button>
                          </div>
                        </div>

                        {/* Standard Plan */}
                        <div className="col-md-4">
                          <div className="p-4 border rounded h-100 d-flex flex-column text-center pricing-card featured" style={{ background: 'var(--surface)', borderColor: 'var(--accent)', borderWidth: '2px', boxShadow: '0 8px 30px rgba(200, 155, 60, 0.15)' }}>
                            <div className="badge bg-accent text-dark align-self-center py-1 px-3 mb-2 font-display small fw-bold">MOST POPULAR</div>
                            <h5 className="font-display fw-bold mb-1 text-primary">Standard Plan</h5>
                            <div className="my-3">
                              <h2 className="font-display fw-bold mb-0 text-dark" style={{ color: 'var(--text)' }}>₹799</h2>
                              <span className="small text-muted">/ 6 Months</span>
                            </div>
                            <ul className="list-unstyled small text-muted text-start my-4 flex-grow-1 d-flex flex-column gap-2">
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Add up to <strong>10 PG listings</strong></li>
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Priority listing support</li>
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Better visibility in search</li>
                              <li><i className="bi bi-x-circle text-danger me-2"></i>No Featured PG badge</li>
                            </ul>
                            <button 
                              className="btn btn-purple-gradient w-100 py-2.5 fw-semibold mt-3"
                              disabled={buyingPlan || subData.pendingSubscription || (subData.activeSubscription?.planName === 'standard')}
                              onClick={() => handleBuyPlan('standard')}
                            >
                              {subData.activeSubscription?.planName === 'standard' ? 'Current Plan' : 'Buy Plan'}
                            </button>
                          </div>
                        </div>

                        {/* Premium Plan */}
                        <div className="col-md-4">
                          <div className="p-4 border rounded h-100 d-flex flex-column text-center pricing-card" style={{ background: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                            <h5 className="font-display fw-bold mb-1 text-primary">Premium Plan</h5>
                            <div className="my-3">
                              <h2 className="font-display fw-bold mb-0 text-dark" style={{ color: 'var(--text)' }}>₹1499</h2>
                              <span className="small text-muted">/ Year</span>
                            </div>
                            <ul className="list-unstyled small text-muted text-start my-4 flex-grow-1 d-flex flex-column gap-2">
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i><strong>Unlimited PG listings</strong></li>
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Featured PG badge</li>
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Highest search priority</li>
                              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Premium customer support</li>
                            </ul>
                            <button 
                              className="btn btn-purple-gradient w-100 py-2.5 fw-semibold mt-3"
                              disabled={buyingPlan || subData.pendingSubscription || (subData.activeSubscription?.planName === 'premium')}
                              onClick={() => handleBuyPlan('premium')}
                            >
                              {subData.activeSubscription?.planName === 'premium' ? 'Current Plan' : 'Buy Plan'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Listing Charges */}
                      <div className="p-4 rounded border mb-5 bg-light" style={{ borderColor: 'var(--surface-border)' }}>
                        <h5 className="font-display mb-3 fw-bold">Listing Charges</h5>
                        <div className="row g-3">
                          <div className="col-sm-4">
                            <div className="p-2 border rounded text-center bg-white" style={{ color: 'var(--text)' }}>
                              <strong>Monthly Plan</strong> : ₹299
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className="p-2 border rounded text-center bg-white" style={{ color: 'var(--text)' }}>
                              <strong>6-Month Plan</strong> : ₹799
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className="p-2 border rounded text-center bg-white" style={{ color: 'var(--text)' }}>
                              <strong>Yearly Plan</strong> : ₹1499
                            </div>
                          </div>
                        </div>
                        <p className="small text-muted mt-3 mb-0 text-center italic">
                          "Choose a subscription plan to publish and manage your PG listings on PGVerse."
                        </p>
                      </div>

                      {/* Contact Admin Support Card */}
                      <div className="row g-4 justify-content-center">
                        <div className="col-md-8">
                          <div className="p-4 rounded border text-center font-display shadow-sm" style={{ borderTop: '4px solid var(--primary-theme)', background: 'rgba(255,255,255,0.01)', borderColor: 'var(--surface-border)' }}>
                            <h5 className="fw-bold mb-3"><i className="bi bi-headset text-primary me-2"></i>Need Help? Contact Admin</h5>
                            <div className="row g-3 text-start my-3 justify-content-center">
                              <div className="col-sm-6">
                                <div className="d-flex align-items-center gap-3 p-2.5 border rounded">
                                  <i className="bi bi-whatsapp text-success fs-3"></i>
                                  <div>
                                    <span className="small text-muted d-block">WhatsApp Support</span>
                                    <strong style={{ color: 'var(--text)' }}>+91 98765 43210</strong>
                                  </div>
                                </div>
                              </div>
                              <div className="col-sm-6">
                                <div className="d-flex align-items-center gap-3 p-2.5 border rounded">
                                  <i className="bi bi-envelope text-primary fs-3"></i>
                                  <div>
                                    <span className="small text-muted d-block">Email Support</span>
                                    <strong style={{ color: 'var(--text)' }}>support@pgverse.com</strong>
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 text-center">
                                <span className="small text-muted">
                                  <i className="bi bi-clock me-1"></i>Business Hours: Monday – Saturday (10:00 AM – 7:00 PM)
                                </span>
                              </div>
                            </div>
                            <div className="d-flex gap-3 justify-content-center mt-4">
                              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success px-4 d-flex align-items-center gap-2">
                                <i className="bi bi-whatsapp"></i> Chat on WhatsApp
                              </a>
                              <a href="mailto:support@pgverse.com" className="btn btn-sm btn-outline-primary px-4 d-flex align-items-center gap-2">
                                <i className="bi bi-envelope"></i> Send Email
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'students' && (
                <div className="premium-card p-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
                    <div>
                      <h4 className="font-display mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-person-badge text-accent"></i> Student Records
                      </h4>
                      <p className="text-muted small mb-0">Complete student database</p>
                    </div>
                    <div className="w-100 w-sm-auto">
                      <input
                        type="text"
                        className="form-control bg-dark-subtle border-0 text-dark rounded-3 px-3 py-2 text-start"
                        placeholder="Search by name or email..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        style={{ maxWidth: '300px' }}
                      />
                    </div>
                  </div>

                  {admissions.length === 0 ? (
                    <p className="text-muted text-center py-4 small">No student records found in the database.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table premium-table align-middle">
                        <thead>
                          <tr className="text-muted">
                            <th>Student</th>
                            <th>Portal Password</th>
                            <th>PG Name</th>
                            <th>Room Type</th>
                            <th>Months</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>Joining Date</th>
                            <th>Status</th>
                            <th className="text-center">Mark Inactive</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admissions
                            .filter(s => 
                              s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                              s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                            )
                            .map((student) => {
                              const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST';
                              const formattedDate = new Date(student.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              });
                              return (
                                <tr key={student._id}>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      {student.photo ? (
                                        <img 
                                          src={student.photo} 
                                          alt={student.name}
                                          className="rounded-circle object-fit-cover"
                                          style={{ width: '36px', height: '36px' }}
                                        />
                                      ) : (
                                        <div 
                                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold text-uppercase"
                                          style={{ 
                                            width: '36px', 
                                            height: '36px', 
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                                            fontSize: '0.85rem'
                                          }}
                                        >
                                          {initials}
                                        </div>
                                      )}
                                      <div>
                                        <div className="fw-semibold font-display">{student.name}</div>
                                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                          STU_{student._id?.slice(-6).toUpperCase()}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="font-monospace text-accent">{student.portalPassword || 'Galaxy@1234'}</td>
                                  <td>{student.pg?.name || 'N/A'}</td>
                                  <td>{student.roomType || 'General'}</td>
                                  <td className="fw-semibold text-primary">{student.months || 1}</td>
                                  <td>{student.mobileNumber || student.phone}</td>
                                  <td>{student.email || 'N/A'}</td>
                                  <td>{formattedDate}</td>
                                  <td>
                                    <span className={`badge ${student.isBlocked ? 'bg-danger' : 'bg-success'}`}>
                                      {student.isBlocked ? 'Inactive' : 'Active'}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <input 
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={!!student.isBlocked}
                                      onChange={() => handleToggleStudentBlock(student._id, student.isBlocked)}
                                    />
                                  </td>
                                  <td className="text-end">
                                    <div className="d-flex gap-2 justify-content-end align-items-center">
                                      <button
                                        className="btn btn-sm btn-icon text-primary p-0 border-0 bg-transparent"
                                        onClick={() => setSelectedStudentDetail(student)}
                                        title="View Student"
                                      >
                                        <i className="bi bi-eye-fill fs-5"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-icon text-warning p-0 border-0 bg-transparent"
                                        onClick={() => handleEditStudentClick(student)}
                                        title="Edit Student"
                                      >
                                        <i className="bi bi-pencil-fill fs-5"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-icon text-danger p-0 border-0 bg-transparent"
                                        onClick={() => handleDeleteStudent(student._id)}
                                        title="Delete Student"
                                      >
                                        <i className="bi bi-trash-fill fs-5"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="premium-card p-5" style={{ maxWidth: '550px' }}>
                  <h4 className="font-display mb-4 text-gradient fw-bold">Settings</h4>
                  <p className="text-muted small mb-4">Manage your account credentials and security.</p>
                  
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label className="form-label small text-muted font-display">Current Password</label>
                      <div className="position-relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="form-control custom-input w-100 pe-5"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{ zIndex: 10, outline: 'none', boxShadow: 'none' }}
                        >
                          <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label small text-muted font-display">New Password</label>
                      <div className="position-relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="form-control custom-input w-100 pe-5"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ zIndex: 10, outline: 'none', boxShadow: 'none' }}
                        >
                          <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label small text-muted font-display">Confirm New Password</label>
                      <div className="position-relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control custom-input w-100 pe-5"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ zIndex: 10, outline: 'none', boxShadow: 'none' }}
                        >
                          <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-premium-primary py-2.5 px-4 font-display"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Updating...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}
          </>
        </div>

        {/* Delete PG Confirmation Modal */}
        {deleteConfirmId && (
          <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmId(null); }} style={{ zIndex: 2060, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-box-custom premium-card p-5 text-center position-relative" style={{ maxWidth: '400px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}>
              <div className="mb-4">
                <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
              </div>
              <h4 className="font-display mb-3 fw-bold text-danger">Delete PG Listing?</h4>
              <p className="small text-muted mb-4">Are you sure you want to delete this listing? This action cannot be undone.</p>
              
              <div className="d-flex gap-3 justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-premium-secondary px-4 py-2" 
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 py-2" 
                  onClick={async () => {
                    const id = deleteConfirmId;
                    setDeleteConfirmId(null);
                    await handleDeletePG(id);
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Rooms, Seats & Students Modal */}
        {selectedPgToManage && (
          <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setSelectedPgToManage(null); }} style={{ zIndex: 2050, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
            <div className="modal-box-custom premium-card p-4 position-relative" style={{ maxWidth: '750px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
              
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={() => setSelectedPgToManage(null)}
                style={{ filter: 'var(--close-filter)' }}
              ></button>

              <div className="mb-4">
                <span className="badge bg-primary text-uppercase tracking-wider mb-2" style={{ background: 'var(--primary-theme)', color: '#fff' }}>Accommodation Manager</span>
                <h3 className="font-display mb-1 fw-bold" style={{ color: 'var(--primary-theme)' }}>{selectedPgToManage.name}</h3>
                <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{selectedPgToManage.location.address}, {selectedPgToManage.location.city}</small>
              </div>

              {/* Section 1: Rooms & Seats */}
              <div className="mb-5">
                <h5 className="font-display mb-3 fw-bold text-primary" style={{ color: 'var(--primary-theme)' }}>Active Room Plans & Occupancy</h5>
                {selectedPgToManage.rooms.length === 0 ? (
                  <p className="text-muted small my-3">No room types added yet. Use the form below to add a room package.</p>
                ) : (
                  <div className="table-responsive mb-4">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Room No.</th>
                          <th>Room Type</th>
                          <th>Floor</th>
                          <th>Status</th>
                          <th>Sharing</th>
                          <th>Monthly Price</th>
                          <th className="text-center">Total Seats</th>
                          <th>Allocated / Booked</th>
                          <th>Empty / Available</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPgToManage.rooms.map((room, index) => {
                          const safeBookings = Array.isArray(bookings) ? bookings : [];
                          const safeAdmissions = Array.isArray(admissions) ? admissions : [];

                          const onlineBooked = safeBookings.filter(b => {
                            const pgId = b.pg && (typeof b.pg === 'object' ? b.pg._id : b.pg);
                            return pgId === selectedPgToManage._id && ['accepted', 'pending'].includes(b.bookingStatus) && b.roomType === room.roomType;
                          }).length;

                          const offlineBooked = safeAdmissions.filter(a => {
                            const pgId = a.pg && (typeof a.pg === 'object' ? a.pg._id : a.pg);
                            return pgId === selectedPgToManage._id && a.roomType === room.roomType;
                          }).length;

                          const bookedSeats = onlineBooked + offlineBooked;
                          const availableSeats = room.availability;
                          const totalSeats = room.totalSeats || (bookedSeats + availableSeats);

                          const getStatusBadgeColor = (status) => {
                            switch (status) {
                              case 'Available': return 'bg-success';
                              case 'Occupied': return 'bg-danger';
                              case 'Maintenance': return 'bg-warning text-dark';
                              default: return 'bg-secondary';
                            }
                          };

                          return (
                            <tr key={room._id || index}>
                              <td><span className="badge bg-light text-dark border font-monospace">Room {room.roomNumber || 'N/A'}</span></td>
                              <td><strong>{room.roomType}</strong></td>
                              <td>{room.roomFloor || 'Ground'}</td>
                              <td><span className={`badge ${getStatusBadgeColor(room.roomStatus || 'Available')}`}>{room.roomStatus || 'Available'}</span></td>
                              <td>{room.sharing} Sharing</td>
                              <td>
                                <div className="input-group input-group-sm" style={{ width: '110px' }}>
                                  <span className="input-group-text">₹</span>
                                  <input 
                                    type="number" 
                                    className="form-control" 
                                    defaultValue={room.price}
                                    onBlur={(e) => handleUpdateRoomField(index, 'price', e.target.value)}
                                  />
                                </div>
                              </td>
                              <td className="text-center font-display fw-bold text-muted">
                                {totalSeats}
                              </td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="badge bg-primary text-white mb-1" style={{ fontSize: '0.75rem', width: 'fit-content' }}>
                                    Booked: {bookedSeats}
                                  </span>
                                  <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                                    (Online: {onlineBooked} | Offline: {offlineBooked})
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="input-group input-group-sm" style={{ width: '90px' }}>
                                  <input 
                                    type="number" 
                                    className="form-control" 
                                    defaultValue={room.availability}
                                    onBlur={(e) => handleUpdateRoomField(index, 'availability', e.target.value)}
                                  />
                                </div>
                              </td>
                              <td className="text-end">
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => {
                                    setGenericConfirmModal({
                                      title: "Delete Room Plan?",
                                      message: "Do you really want to delete this room plan?",
                                      onConfirm: () => handleRemoveRoomFromPg(index)
                                    });
                                  }}
                                  disabled={updatingRoom}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <hr className="my-4" />

                <h5 className="font-display mb-3 fw-bold text-primary" style={{ color: 'var(--primary-theme)' }}><i className="bi bi-plus-circle me-2"></i>Add New Room Plan</h5>
                <form onSubmit={handleAddRoomToPg} className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Room Number *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="e.g. 101"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Room Type *</label>
                    <select 
                      className="form-select form-select-sm"
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                      required
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Sharing Capacity *</label>
                    <select 
                      className="form-select form-select-sm"
                      value={newRoomSharing}
                      onChange={(e) => setNewRoomSharing(Number(e.target.value))}
                      required
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Monthly Rent (₹) *</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">₹</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Rent amount"
                        min="0"
                        value={newRoomPrice}
                        onChange={(e) => setNewRoomPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Total Seats *</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      min="1"
                      value={newRoomTotalSeats}
                      onChange={(e) => setNewRoomTotalSeats(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Room Floor</label>
                    <select 
                      className="form-select form-select-sm"
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(e.target.value)}
                    >
                      <option value="Ground">Ground</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Room Status</label>
                    <select 
                      className="form-select form-select-sm"
                      value={newRoomStatus}
                      onChange={(e) => setNewRoomStatus(e.target.value)}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="col-12 text-end mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-premium-primary btn-sm px-4" 
                      disabled={updatingRoom}
                    >
                      {updatingRoom ? 'Saving...' : 'Save Room'}
                    </button>
                  </div>
                </form>
              </div>

              <hr className="my-5" />

              {/* Section 2: Registered Students */}
              <div>
                <h5 className="font-display mb-3 fw-bold text-primary" style={{ color: 'var(--primary-theme)' }}>
                  Registered Students ({(Array.isArray(bookings) ? bookings : []).filter(b => {
                    const pgId = b.pg && (typeof b.pg === 'object' ? b.pg._id : b.pg);
                    return pgId === selectedPgToManage._id && ['accepted', 'pending'].includes(b.bookingStatus);
                  }).length})
                </h5>
                {(() => {
                  const safeBookings = Array.isArray(bookings) ? bookings : [];
                  const registeredStudents = safeBookings.filter(b => {
                    const pgId = b.pg && (typeof b.pg === 'object' ? b.pg._id : b.pg);
                    return pgId === selectedPgToManage._id && ['accepted', 'pending'].includes(b.bookingStatus);
                  });

                  if (registeredStudents.length === 0) {
                    return (
                      <div className="text-center py-5 text-muted">
                        <i className="bi bi-people fs-1 mb-3 d-block"></i>
                        <p className="mb-0">No active/accepted student bookings found for this accommodation.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Contact Information</th>
                            <th>Room Type</th>
                            <th>Booked Date</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredStudents.map((booking) => (
                            <tr key={booking._id}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px', color: 'var(--primary-theme)' }}>
                                    <i className="bi bi-person-fill"></i>
                                  </div>
                                  <div>
                                    <strong>{booking.student?.name || 'Student'}</strong>
                                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Receipt: {booking.receiptNumber}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="small d-block"><i className="bi bi-envelope-fill text-muted me-1"></i>{booking.student?.email}</span>
                                <span className="small d-block"><i className="bi bi-telephone-fill text-muted me-1"></i>{booking.student?.phone || 'N/A'}</span>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark border">{booking.roomType}</span>
                                <span className={`badge ms-2 ${booking.bookingStatus === 'accepted' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                  {booking.bookingStatus === 'accepted' ? 'Active/Accepted' : 'Pending Approval'}
                                </span>
                              </td>
                              <td>
                                <span className="small text-muted">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                              </td>
                              <td className="text-end">
                                <button 
                                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                                  onClick={() => {
                                    setGenericConfirmModal({
                                      title: "Remove Student?",
                                      message: "Do you really want to remove this student from this PG?",
                                      onConfirm: () => handleRemoveStudentFromPg(booking._id)
                                    });
                                  }}
                                >
                                  <i className="bi bi-person-dash"></i> Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                <button 
                  type="button" 
                  className="btn btn-premium-primary btn-sm px-4" 
                  onClick={() => setSelectedPgToManage(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Offline Admission Modal Form */}
        {showAdmissionModal && (
          <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setShowAdmissionModal(false); }} style={{ zIndex: 2060, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
            <div className="modal-box-custom premium-card p-4 position-relative" style={{ maxWidth: '600px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
              
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={() => setShowAdmissionModal(false)}
                style={{ filter: 'var(--close-filter)' }}
              ></button>

              <div className="mb-4 text-center">
                <i className="bi bi-person-plus text-primary fs-1 mb-2 d-block" style={{ color: 'var(--primary-theme)' }}></i>
                <h3 className="font-display mb-1 fw-bold">Offline Student Admission</h3>
                <p className="small text-muted">Register a student manually staying at your PG.</p>
              </div>

              <form onSubmit={handleAdmissionSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Student Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter student's full name"
                    value={admName}
                    onChange={(e) => setAdmName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Father's Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter father's name"
                    value={admFatherName}
                    onChange={(e) => setAdmFatherName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    value={admMobile}
                    onChange={(e) => setAdmMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Parent Mobile Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    value={admParentMobile}
                    onChange={(e) => setAdmParentMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Aadhar Card Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="12-digit Aadhar number"
                    pattern="[0-9]{12}"
                    value={admAadhar}
                    onChange={(e) => setAdmAadhar(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Student Photo</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*"
                    onChange={handleAdmissionPhotoChange}
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Select Accommodation (PG)</label>
                  <select 
                    className="form-select"
                    value={admSelectedPg}
                    onChange={(e) => {
                      setAdmSelectedPg(e.target.value);
                      setAdmSelectedRoomType('');
                    }}
                    required
                  >
                    <option value="">-- Choose PG --</option>
                    {pgs.map((pg) => (
                      <option key={pg._id} value={pg._id}>{pg.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Select Room Type</label>
                  <select 
                    className="form-select"
                    value={admSelectedRoomType}
                    onChange={(e) => setAdmSelectedRoomType(e.target.value)}
                    disabled={!admSelectedPg}
                    required
                  >
                    <option value="">-- Choose Sharing Room --</option>
                    {admSelectedPg && pgs.find(p => p._id === admSelectedPg)?.rooms.map((room, idx) => (
                      <option key={room._id || idx} value={room.roomType}>
                        {room.roomType} (₹{room.price}/mo) - {room.availability} seats left
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Monthly Fee (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Monthly rent amount"
                    value={admMonthlyFee}
                    onChange={(e) => setAdmMonthlyFee(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Paid Fee Upfront (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Amount paid during admission"
                    value={admPaidFee}
                    onChange={(e) => setAdmPaidFee(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 text-end mt-4">
                  <button 
                    type="button" 
                    className="btn btn-premium-secondary me-2" 
                    onClick={() => setShowAdmissionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-premium-primary px-4" 
                    disabled={submittingAdmission}
                  >
                    {submittingAdmission ? 'Submitting...' : 'Confirm Admission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {updatingAdmission && (
          <div 
            className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" 
            onClick={(e) => { if (e.target === e.currentTarget) setUpdatingAdmission(null); }} 
            style={{ zIndex: 2060, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}
          >
            <div className="modal-box-custom premium-card p-4 position-relative" style={{ maxWidth: '400px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}>
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={() => setUpdatingAdmission(null)}
                style={{ filter: 'var(--close-filter)' }}
              ></button>

              <h4 className="font-display mb-3 fw-bold text-success" style={{ color: 'var(--primary-theme)' }}>Update Paid Fee</h4>
              <p className="small text-muted mb-4">
                Update the total paid fee amount for <strong>{updatingAdmission.name}</strong>.
              </p>

              <form onSubmit={handleSaveUpdatedPaidFee}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Monthly Fee (Rent)</label>
                  <input type="text" className="form-control" value={`₹${updatingAdmission.monthlyFee}`} disabled style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Total Paid Fee Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={updatingPaidFeeAmount} 
                    onChange={(e) => setUpdatingPaidFeeAmount(e.target.value)} 
                    required 
                    min="0"
                  />
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                  <button type="button" className="btn btn-premium-secondary px-4" onClick={() => setUpdatingAdmission(null)}>Cancel</button>
                  <button type="submit" className="btn btn-premium-primary px-4">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Record Fee Payment Modal */}
        {showFeeRecordModal && (
          <div 
            className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" 
            onClick={(e) => { if (e.target === e.currentTarget) setShowFeeRecordModal(null); }} 
            style={{ zIndex: 2060, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}
          >
            <div className="modal-box-custom premium-card p-4 position-relative" style={{ maxWidth: '500px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={() => setShowFeeRecordModal(null)}
                style={{ filter: 'var(--close-filter)' }}
              ></button>

              <h4 className="font-display mb-3 fw-bold text-success" style={{ color: 'var(--primary-theme)' }}>Record Fee Payment</h4>
              <p className="small text-muted mb-4">
                Log a monthly fee payment for <strong>{showFeeRecordModal.name}</strong> ({showFeeRecordModal.pgName}).
              </p>

              <form onSubmit={handleRecordFeePayment}>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Select Month</label>
                    <select
                      className="form-select"
                      value={recordFeeMonth}
                      onChange={(e) => setRecordFeeMonth(e.target.value)}
                      required
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Select Year</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={recordFeeYear}
                      onChange={(e) => setRecordFeeYear(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Amount Paid (₹)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={recordFeeAmount}
                      onChange={(e) => setRecordFeeAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Payment Status</label>
                    <select
                      className="form-select"
                      value={recordFeeStatus}
                      onChange={(e) => setRecordFeeStatus(e.target.value)}
                      required
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                  <button 
                    type="button" 
                    className="btn btn-premium-secondary px-4" 
                    onClick={() => setShowFeeRecordModal(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-premium-primary px-4"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payments Log History Modal */}
        {showPaymentsLogModal && (
          <div 
            className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" 
            onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentsLogModal(false); }} 
            style={{ zIndex: 2060, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}
          >
            <div className="modal-box-custom premium-card p-4 position-relative" style={{ maxWidth: '750px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={() => setShowPaymentsLogModal(false)}
                style={{ filter: 'var(--close-filter)' }}
              ></button>

              <h4 className="font-display mb-3 fw-bold text-success" style={{ color: 'var(--primary-theme)' }}>Recorded Payments History Log</h4>
              <p className="small text-muted mb-4">
                List of all online admitted students who paid the advance payment during booking.
              </p>

              {/* Filters */}
              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <div className="input-group-premium d-flex align-items-center border rounded px-3 py-1.5" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                    <i className="bi bi-search me-2 text-muted"></i>
                    <input
                      type="text"
                      className="input-blank flex-grow-1"
                      placeholder="Search by student name..."
                      value={paymentsSearchQuery}
                      onChange={(e) => setPaymentsSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.875rem' }}
                    />
                    {paymentsSearchQuery && (
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setPaymentsSearchQuery('')}
                        style={{ filter: 'var(--close-filter)', fontSize: '0.75rem' }}
                      ></button>
                    )}
                  </div>
                </div>
                <div className="col-md-5">
                  <select
                    className="form-select custom-input py-1.5 w-100"
                    value={selectedPaymentsPgFilter}
                    onChange={(e) => setSelectedPaymentsPgFilter(e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  >
                    <option value="">All PGs</option>
                    {(pgs || []).map(p => (
                      <option key={p._id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(() => {
                const filteredBookings = (bookings || []).filter(b => {
                  if (b.paymentStatus !== 'completed') return false;
                  if (selectedPaymentsPgFilter && b.pg?.name !== selectedPaymentsPgFilter) return false;
                  const query = paymentsSearchQuery.toLowerCase();
                  return (
                    b.student?.name?.toLowerCase().includes(query) ||
                    b.pg?.name?.toLowerCase().includes(query) ||
                    b.roomType?.toLowerCase().includes(query)
                  );
                });

                if (filteredBookings.length === 0) {
                  return <p className="text-muted small text-center my-4">No completed payment records found.</p>;
                }

                return (
                  <div className="table-responsive" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <table className="table table-hover align-middle" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr className="table-light text-muted">
                          <th>Student</th>
                          <th>Accommodation / Room</th>
                          <th>Booking Date</th>
                          <th>Amount Paid</th>
                          <th>Status</th>
                          <th>Date Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b) => (
                          <tr key={b._id}>
                            <td>
                              <strong>{b.student?.name || 'Online Student'}</strong>
                              <span className="badge bg-light text-dark border small ms-1" style={{ fontSize: '0.6rem' }}>ONLINE</span>
                            </td>
                            <td>
                              <span className="d-block">{b.pg?.name || 'N/A'}</span>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>{b.roomType}</small>
                            </td>
                            <td className="fw-semibold">
                              {new Date(b.bookingDate).toLocaleDateString()}
                            </td>
                            <td className="fw-bold text-success">₹{b.advancePaymentAmount}</td>
                            <td>
                              <span className="badge bg-success">
                                ✅ Paid
                              </span>
                            </td>
                            <td className="small text-muted">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                <button 
                  type="button" 
                  className="btn btn-premium-primary px-4" 
                  onClick={() => setShowPaymentsLogModal(false)}
                >
                  Close Log
                </button>
              </div>
            </div>
          </div>
        )}

        {showPendingDuesModal && (
          <div 
            className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" 
            onClick={(e) => { if (e.target === e.currentTarget) setShowPendingDuesModal(false); }} 
            style={{ zIndex: 2060, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}
          >
            <div className="modal-box-custom premium-card p-4 position-relative" style={{ maxWidth: '800px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 m-3" 
                onClick={() => setShowPendingDuesModal(false)}
                style={{ filter: 'var(--close-filter)' }}
              ></button>

              <h4 className="font-display mb-3 fw-bold text-danger">Online Admissions Pending Dues</h4>
              <p className="small text-muted mb-4">
                List of all online admitted students who did not pay the advance payment during booking.
              </p>

              {(() => {
                const pendingAdmissions = (bookings || []).filter(b => b.paymentStatus === 'pending');
                if (pendingAdmissions.length === 0) {
                  return <p className="text-muted small text-center my-4">No online bookings with pending advance payments.</p>;
                }
                return (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                      <thead>
                        <tr className="table-light text-muted">
                          <th>Student</th>
                          <th>Chosen PG / Room</th>
                          <th>Booking Date</th>
                          <th>Advance Amount</th>
                          <th>Status</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingAdmissions.map((b) => (
                          <tr key={b._id}>
                            <td>
                              <strong>{b.student?.name || 'Online Student'}</strong>
                              <small className="text-muted d-block">{b.student?.phone || 'N/A'}</small>
                            </td>
                            <td>
                              <strong>{b.pg?.name || 'N/A'}</strong>
                              <small className="text-muted d-block">{b.roomType}</small>
                            </td>
                            <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                            <td className="fw-semibold text-danger">₹{b.advancePaymentAmount}</td>
                            <td>
                              <span className="badge bg-danger">❌ Unpaid</span>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-success py-1 px-3"
                                onClick={() => handleMarkBookingAsPaid(b._id)}
                              >
                                <i className="bi bi-check-circle"></i> Mark Paid
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                <button 
                  type="button" 
                  className="btn btn-premium-secondary px-4" 
                  onClick={() => setShowPendingDuesModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Confirmation Modal */}
        {genericConfirmModal && (
          <div 
            className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" 
            onClick={(e) => { if (e.target === e.currentTarget) setGenericConfirmModal(null); }} 
            style={{ zIndex: 2100, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)' }}
          >
            <div className="modal-box-custom premium-card p-5 text-center position-relative" style={{ maxWidth: '400px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}>
              <div className="mb-4">
                <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
              </div>
              <h4 className="font-display mb-3 fw-bold text-danger">{genericConfirmModal.title}</h4>
              <p className="small text-muted mb-4">{genericConfirmModal.message}</p>
              
              <div className="d-flex gap-3 justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-premium-secondary px-4 py-2" 
                  onClick={() => setGenericConfirmModal(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 py-2" 
                  onClick={() => {
                    genericConfirmModal.onConfirm();
                    setGenericConfirmModal(null);
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudentDetail && (
          <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style={{ zIndex: 2100, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-box-custom premium-card p-5 animate-fade-in text-start position-relative" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <button className="btn-close position-absolute top-0 end-0 m-3 bg-transparent border-0" onClick={() => setSelectedStudentDetail(null)}><i className="bi bi-x fs-4 text-white"></i></button>
              <h4 className="font-display mb-4 text-accent">Student Profile Details</h4>
              <div className="row g-3">
                <div className="col-12">
                  <p className="mb-2"><strong>Name:</strong> {selectedStudentDetail.name}</p>
                  <p className="mb-2"><strong>Father's Name:</strong> {selectedStudentDetail.fatherName}</p>
                  <p className="mb-2"><strong>Email:</strong> {selectedStudentDetail.email || 'N/A'}</p>
                  <p className="mb-2"><strong>Phone:</strong> {selectedStudentDetail.mobileNumber || selectedStudentDetail.phone}</p>
                  <p className="mb-2"><strong>Parent Contact:</strong> {selectedStudentDetail.parentMobileNumber || 'N/A'}</p>
                  <p className="mb-2"><strong>Aadhar Card:</strong> {selectedStudentDetail.aadharCard || 'N/A'}</p>
                  <p className="mb-2"><strong>Portal Password:</strong> {selectedStudentDetail.portalPassword || 'Galaxy@1234'}</p>
                  <p className="mb-2"><strong>PG Name:</strong> {selectedStudentDetail.pg?.name || 'N/A'}</p>
                  <p className="mb-2"><strong>Room Type:</strong> {selectedStudentDetail.roomType || 'General'}</p>
                  <p className="mb-2"><strong>Monthly Fee:</strong> ₹{selectedStudentDetail.monthlyFee || 0}</p>
                  <p className="mb-2"><strong>Paid Fee:</strong> ₹{selectedStudentDetail.paidFee || 0}</p>
                  <p className="mb-2"><strong>Months:</strong> {selectedStudentDetail.months || 1}</p>
                  <p className="mb-2"><strong>Status:</strong> {selectedStudentDetail.isBlocked ? 'Inactive / Blocked' : 'Active'}</p>
                  <p className="mb-2"><strong>Joined Date:</strong> {new Date(selectedStudentDetail.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 d-flex gap-2 justify-content-end">
                <button 
                  className={`btn btn-sm ${selectedStudentDetail.isBlocked ? 'btn-success text-white' : 'btn-outline-warning'}`}
                  onClick={() => {
                    handleToggleStudentBlock(selectedStudentDetail._id, selectedStudentDetail.isBlocked);
                    setSelectedStudentDetail(null);
                  }}
                >
                  {selectedStudentDetail.isBlocked ? 'Activate Account' : 'Block Account'}
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setSelectedStudentDetail(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Student Edit Modal */}
        {editingStudent && (
          <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style={{ zIndex: 2100, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-box-custom premium-card p-4 animate-fade-in text-start position-relative" style={{ maxWidth: '650px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', maxHeight: '90vh', overflowY: 'auto' }}>
              <button className="btn-close position-absolute top-0 end-0 m-3 bg-transparent border-0" onClick={() => setEditingStudent(null)}><i className="bi bi-x fs-4 text-white"></i></button>
              <h4 className="font-display mb-3 text-accent fw-bold">Edit Student Record</h4>
              <form onSubmit={handleSaveStudentEdit}>
                <div className="row g-2">
                  <div className="col-md-6 mb-1">
                    <label className="form-label small text-muted font-display">Student Name</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display font-display">Father's Name</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      value={editForm.fatherName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control custom-input" 
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Contact Phone</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Parent Contact</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      value={editForm.parentPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Aadhar Card</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      value={editForm.aadharCard}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aadharCard: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Portal Password</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      value={editForm.portalPassword}
                      onChange={(e) => setEditForm(prev => ({ ...prev, portalPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">PG Name</label>
                    <select 
                      className="form-select custom-input"
                      value={editForm.pg}
                      onChange={(e) => setEditForm(prev => ({ ...prev, pg: e.target.value }))}
                      required
                    >
                      <option value="">Select a PG</option>
                      {pgs.map(pg => (
                        <option key={pg._id} value={pg._id}>{pg.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Room Type</label>
                    <input 
                      type="text" 
                      className="form-control custom-input" 
                      value={editForm.roomType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, roomType: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Monthly Fee</label>
                    <input 
                      type="number" 
                      className="form-control custom-input" 
                      value={editForm.monthlyFee}
                      onChange={(e) => setEditForm(prev => ({ ...prev, monthlyFee: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Paid Fee</label>
                    <input 
                      type="number" 
                      className="form-control custom-input" 
                      value={editForm.paidFee}
                      onChange={(e) => setEditForm(prev => ({ ...prev, paidFee: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label small text-muted font-display">Months (Stay Duration)</label>
                    <input 
                      type="number" 
                      className="form-control custom-input" 
                      value={editForm.months}
                      onChange={(e) => setEditForm(prev => ({ ...prev, months: Number(e.target.value) }))}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4 form-check text-start mt-3">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="modalIsBlocked"
                    checked={editForm.isBlocked}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isBlocked: e.target.checked }))}
                  />
                  <label className="form-check-label small text-muted ms-2" htmlFor="modalIsBlocked">Mark Inactive / Blocked</label>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button type="submit" className="btn btn-sm btn-premium-primary px-4 py-2 border-0">Save Changes</button>
                  <button type="button" className="btn btn-sm btn-secondary px-4 py-2 border-0" onClick={() => setEditingStudent(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Student Add Modal */}
        {showAddStudentModal && (
          <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style={{ zIndex: 2100, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-box-custom premium-card p-5 animate-fade-in text-start position-relative" style={{ maxWidth: '500px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <button className="btn-close position-absolute top-0 end-0 m-3 bg-transparent border-0" onClick={() => setShowAddStudentModal(false)}><i className="bi bi-x fs-4 text-white"></i></button>
              <h4 className="font-display mb-4 text-accent">Register New Student</h4>
              <form onSubmit={handleSaveStudentAdd}>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Student Name</label>
                  <input 
                    type="text" 
                    className="form-control custom-input" 
                    value={addForm.name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control custom-input" 
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="student@example.com"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-control custom-input" 
                    value={addForm.phone}
                    onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter 10-digit number"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Portal Password</label>
                  <input 
                    type="text" 
                    className="form-control custom-input" 
                    value={addForm.portalPassword}
                    onChange={(e) => setAddForm(prev => ({ ...prev, portalPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Course</label>
                  <select 
                    className="form-select custom-input" 
                    value={addForm.course}
                    onChange={(e) => setAddForm(prev => ({ ...prev, course: e.target.value }))}
                    required
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Seat No.</label>
                  <input 
                    type="text" 
                    className="form-control custom-input" 
                    value={addForm.seat}
                    onChange={(e) => setAddForm(prev => ({ ...prev, seat: e.target.value }))}
                    placeholder="e.g. A2"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Months (Duration of Stay)</label>
                  <input 
                    type="number" 
                    className="form-control custom-input" 
                    value={addForm.months}
                    onChange={(e) => setAddForm(prev => ({ ...prev, months: Number(e.target.value) }))}
                    placeholder="e.g. 3"
                    min="1"
                    required
                  />
                </div>
                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button type="submit" className="btn btn-sm btn-premium-primary px-4 py-2 border-0">Add Student</button>
                  <button type="button" className="btn btn-sm btn-secondary px-4 py-2 border-0" onClick={() => setShowAddStudentModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
