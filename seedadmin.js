const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./src/models/Admin');

const ADMIN_NAME = 'Visezy Admin';
const ADMIN_EMAIL = 'admin@visezy.in';
const ADMIN_PASSWORD = 'admin@123';

async function seedAdmin() {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL;

    if (!mongoUri) {
      throw new Error('MongoDB URI not found in .env');
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB connected');

    // Delete ALL existing admins
    const deleted = await Admin.deleteMany({});

    console.log(`🗑️ Deleted ${deleted.deletedCount} old admin(s)`);

    // Create only the required admin
    const admin = await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'super_admin',
      isActive: true,
    });

    console.log('\n✅ Admin created successfully!');
    console.log('────────────────────────────');
    console.log(`Name     : ${admin.name}`);
    console.log(`Email    : ${admin.email}`);
    console.log(`Password : ${ADMIN_PASSWORD}`);
    console.log(`Role     : ${admin.role}`);
    console.log('────────────────────────────');

    await mongoose.disconnect();

    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedAdmin();