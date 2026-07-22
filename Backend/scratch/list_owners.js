const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const listOwners = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pgverse');
    const owners = await User.find({ role: 'owner' }, 'name email phone role isApprovedOwner isBlocked');
    console.log('--- OWNER USERS IN DATABASE ---');
    console.log(JSON.stringify(owners, null, 2));
    console.log('------------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listOwners();
