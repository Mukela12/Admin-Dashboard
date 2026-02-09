/**
 * Seed script to create the admin user in Firestore.
 *
 * Usage: node scripts/seed-admin.js
 *
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * to be set in .env.local or environment.
 */

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load .env.local
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function seedAdmin() {
  const email = 'Jessekatungu@gmail.com';
  const password = 'Milan18$';

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.collection('admins').doc(email).set({
    email,
    password: hashedPassword,
    role: 'super-admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.log('Admin user seeded successfully!');
  console.log(`  Email: ${email}`);
  console.log('  Password: ********');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
