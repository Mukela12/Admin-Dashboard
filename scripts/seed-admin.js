/**
 * Seed Admin Credentials Script
 * Seeds the Firestore `admins` collection with admin users.
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

  const admins = [
    { email: 'Jessekatungu@gmail.com', password: 'Milan18$', role: 'super-admin' },
    { email: 'Mukelathegreat@gmail.com', password: 'securePassword123', role: 'super-admin' },
  ];

  for (const a of admins) {
    const existing = await db.collection('admins').doc(a.email).get();
    if (existing.exists) {
      console.log(`[SKIP] ${a.email} already exists`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(a.password, 12);
    await db.collection('admins').doc(a.email).set({
      email: a.email,
      password: hashedPassword,
      role: a.role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log(`[CREATED] ${a.email}`);
  }

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
