const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error('MONGO_URL missing in .env');

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });

  console.log('✅ MongoDB connected');
}

module.exports = { connectDB };
