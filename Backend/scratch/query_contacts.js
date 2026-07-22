const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const PG = require('../models/PG');
const ContactRequest = require('../models/ContactRequest');

dotenv.config({ path: '../.env' });

const queryContacts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pgverse');
    const requests = await ContactRequest.find().populate('student', 'name email');
    console.log('--- ALL CONTACT REQUESTS ---');
    console.log(JSON.stringify(requests, null, 2));
    console.log('----------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

queryContacts();
