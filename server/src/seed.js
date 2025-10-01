require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/db');
const { User } = require('../src/models/User');

async function run() {
  await connectDB();

  const users = [
    { name: 'Alice Admin',    email: 'admin@hms.test',     role: 'ADMIN',     password: 'admin123' },
    { name: 'Rita Reception', email: 'reception@hms.test', role: 'RECEPTION', password: 'recept123' },
    { name: 'Dr. Dave',       email: 'doctor@hms.test',    role: 'DOCTOR',    password: 'doctor123' },
    { name: 'Lee Lab',        email: 'lab@hms.test',       role: 'LAB',       password: 'lab123' }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ name: u.name, email: u.email, role: u.role, passwordHash });
      console.log(`✅ Created ${u.role}: ${u.email} / ${u.password}`);
    } else {
      console.log(`ℹ️  Exists: ${u.email}`);
    }
  }

  console.log('✅ Seeding done.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
