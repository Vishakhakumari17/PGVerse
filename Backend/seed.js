const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const PG = require('./models/PG');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pgverse');
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await PG.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    console.log('Collections cleared.');

    // 1. Create Users
    console.log('Creating seed users...');
    
    // Hash passwords manually because we bypass mongoose pre-save in insertMany,
    // or we can use User.create. Let's use User.create so pre-save hashes it.
    const student = await User.create({
      name: 'Aarav Mehta',
      email: 'student@pgverse.com',
      password: 'password123',
      role: 'student',
      phone: '9876543210',
      isVerified: true
    });

    const owner = await User.create({
      name: 'Rajesh Sharma',
      email: 'owner@pgverse.com',
      password: 'password123',
      role: 'owner',
      phone: '8765432109',
      isVerified: true,
      isApprovedOwner: true
    });

    const admin = await User.create({
      name: 'Vishakha kumari',
      email: 'vishakhaguptahjp@gmail.com',
      password: 'password123',
      role: 'admin',
      phone: '7654321098',
      isVerified: true
    });

    console.log('Users created successfully.');

    // 2. Create PGs
    console.log('Creating seed PGs...');

    const pg1 = await PG.create({
      owner: owner._id,
      name: 'Stanza Living Premium',
      description: 'Stanza Living is a high-end luxury student co-living hostel with regular housekeeping, premium gym access, laundry, buffet meals, and biometric security systems. Ideal for students attending nearby colleges.',
      location: {
        address: '5th Block, Near IIT Main Gate, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        landmark: 'Near IIT Powai Main Gate',
        mapCoordinates: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.7997576579893!2d72.9126488758414!3d19.116413450766358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c7f17fffffff%3A0x7dbf174ee182db07!2sIIT%20Bombay!5e0!3m2!1sen!2sin!4v1717000000000!5m2!1sen!2sin'
      },
      nearbyColleges: ['IIT Bombay', 'K J Somaiya College', 'I2IT'],
      facilities: ['Wifi', 'AC', 'Laundry', 'Gym', 'Food Included', 'CCTV', 'Power Backup'],
      gender: 'unisex',
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'
      ],
      rooms: [
        {
          roomType: 'Single Luxury Room',
          sharing: 1,
          price: 15000,
          availability: 2,
          amenities: ['AC', 'Wifi', 'Attached Washroom', 'Balcony']
        },
        {
          roomType: 'Double Sharing Room',
          sharing: 2,
          price: 8500,
          availability: 5,
          amenities: ['Wifi', 'AC', 'Attached Washroom']
        },
        {
          roomType: 'Triple Sharing Economy',
          sharing: 3,
          price: 5500,
          availability: 3,
          amenities: ['Wifi']
        }
      ],
      isApproved: true,
      ratingsAverage: 4.5,
      ratingsCount: 2
    });

    const pg2 = await PG.create({
      owner: owner._id,
      name: 'Aditya Girls PG',
      description: 'Safe and secure paying guest accommodation exclusively for female students. Gated access, 24/7 CCTV surveillance, and nutritious homestyle meals included. Just 5 minutes walk from local commerce colleges.',
      location: {
        address: 'Sec-12, Near Metro Station, Dwarka',
        city: 'Delhi',
        state: 'Delhi',
        landmark: 'Dwarka Sec-12 Metro Station',
        mapCoordinates: ''
      },
      nearbyColleges: ['Netaji Subhas University of Technology (NSUT)', 'Deen Dayal Upadhyaya College'],
      facilities: ['Wifi', 'Laundry', 'Food Included', 'CCTV', 'Power Backup'],
      gender: 'girls',
      images: [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
        'https://images.unsplash.com/photo-1616047006787-b24c71a3384d'
      ],
      rooms: [
        {
          roomType: 'Double Sharing Room',
          sharing: 2,
          price: 7000,
          availability: 4,
          amenities: ['Wifi', 'Attached Washroom']
        },
        {
          roomType: 'Triple Sharing Room',
          sharing: 3,
          price: 5000,
          availability: 0, // Mocking sold out package
          amenities: ['Wifi']
        }
      ],
      isApproved: true,
      ratingsAverage: 4.8,
      ratingsCount: 1
    });

    const pg3 = await PG.create({
      owner: owner._id,
      name: 'Boys Shelter Residency',
      description: 'Hostel accommodation offering standard amenities for boys. High-speed internet, gaming zone, and study halls included. Well-connected to regional coaching institutes and engineering centers.',
      location: {
        address: 'Rajeev Gandhi Salai, OMR, Sholinganallur',
        city: 'Bangalore',
        state: 'Karnataka',
        landmark: 'Near Elcot SEZ',
        mapCoordinates: ''
      },
      nearbyColleges: ['Sathyabama University', 'KCG College of Technology'],
      facilities: ['Wifi', 'Gym', 'CCTV', 'Power Backup'],
      gender: 'boys',
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'
      ],
      rooms: [
        {
          roomType: 'Single Standard',
          sharing: 1,
          price: 11000,
          availability: 3,
          amenities: ['Wifi', 'AC']
        },
        {
          roomType: 'Double Sharing',
          sharing: 2,
          price: 6500,
          availability: 8,
          amenities: ['Wifi']
        }
      ],
      isApproved: false, // Pending approval to test admin dashboards
      ratingsAverage: 0,
      ratingsCount: 0
    });

    console.log('PGs created successfully.');

    // 3. Create Reviews
    console.log('Creating seed reviews...');
    await Review.create({
      pg: pg1._id,
      user: student._id,
      rating: 5,
      comment: 'Excellent place! Highly clean rooms, fast wifi, and the food quality is amazing. Worth the premium price.',
      ownerReply: 'Thank you Aarav for your kind words! We strive to offer the best co-living experience.'
    });

    await Review.create({
      pg: pg1._id,
      user: student._id,
      rating: 4,
      comment: 'The location is excellent, right outside IIT gate. Room sharing space is decent, but laundry gets slightly delayed sometimes.'
    });

    await Review.create({
      pg: pg2._id,
      user: student._id,
      rating: 5,
      comment: 'Extremely safe hostel, highly recommended for girls. Gated guard is very strict and food tastes like home.'
    });

    console.log('Reviews created successfully.');

    // 4. Create Bookings
    console.log('Creating booking entries...');
    await Booking.create({
      pg: pg1._id,
      student: student._id,
      roomType: 'Double Sharing Room',
      bookingDate: new Date(),
      duration: 6,
      advancePaymentAmount: 8500,
      paymentStatus: 'completed',
      bookingStatus: 'accepted',
      receiptNumber: 'PGV-SEED-001',
      transactionId: 'TXN-SEED-MOCK-999'
    });

    await Booking.create({
      pg: pg2._id,
      student: student._id,
      roomType: 'Double Sharing Room',
      bookingDate: new Date(),
      duration: 3,
      advancePaymentAmount: 7000,
      paymentStatus: 'pending',
      bookingStatus: 'accepted',
      receiptNumber: 'PGV-SEED-PENDING-002',
      transactionId: ''
    });

    console.log('Bookings created successfully.');
    console.log('--- DATABASE SEEDING COMPLETED ---');
    console.log('Credentials list:');
    console.log('1. Student Role: student@pgverse.com / password123');
    console.log('2. Owner Role: owner@pgverse.com / password123');
    console.log('3. Admin Role: vishakhaguptahjp@gmail.com / password123');
    console.log('----------------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedData();
