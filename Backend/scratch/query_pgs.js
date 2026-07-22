const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const PG = require('../models/PG');

dotenv.config({ path: '../.env' });

const queryPGs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pgverse');
    const pgs = await PG.find().populate('owner', 'name email');
    console.log('--- ALL PG LISTINGS ---');
    console.log(JSON.stringify(pgs, null, 2));
    console.log('------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

queryPGs();
