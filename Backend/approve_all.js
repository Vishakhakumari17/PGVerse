const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const approveAllOwners = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pgverse');
    console.log('Connected to database.');
    
    const result = await User.updateMany(
      { role: 'owner' },
      { $set: { isApprovedOwner: true } }
    );
    
    console.log(`Successfully approved all owner profiles! Modified: ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Error running script:', err);
    process.exit(1);
  }
};

approveAllOwners();
