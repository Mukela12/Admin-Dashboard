/**
 * Seed Admin Credentials Script
 * Seeds the Firestore `admins` collection with an admin user.
 *
 * Usage: node scripts/seed-admin.js
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedAdmin() {
  if (!process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Missing Firebase credentials in .env file');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  const db = admin.firestore();

  const email = 'Jessekatungu@gmail.com';
  const password = 'Milan18$';
  const hashedPassword = await bcrypt.hash(password, 12);

  await db.collection('admins').doc(email).set({
    email,
    password: hashedPassword,
    role: 'superadmin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.log(`Admin seeded: ${email}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
