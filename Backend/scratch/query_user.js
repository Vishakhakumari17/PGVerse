const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const approveUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pgverse');
    const res = await User.updateMany(
      { email: 'vishakhaguptahjp@gmail.com' },
      { $set: { isApprovedOwner: true, isBlocked: false } }
    );
    console.log('--- USER UPDATE RESULTS ---');
    console.log(res);
    console.log('--------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

approveUser();
