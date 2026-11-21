require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

const run = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    const result = await seedDatabase();
    console.log('Seed summary:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error running seed script:', err);
    process.exit(1);
  }
};

run();
