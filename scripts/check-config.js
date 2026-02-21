/**
 * Config Collection Inspector
 * Pulls documents from `config` and `settings` collections to compare structures.
 *
 * Usage: node scripts/check-config.js
 */

const admin = require('firebase-admin');
require('dotenv').config();

async function checkConfig() {
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

  // Check `config` collection (Enos's setup)
  console.log('=== CONFIG COLLECTION ===');
  const configSnap = await db.collection('config').get();
  if (configSnap.empty) {
    console.log('  (empty)');
  } else {
    configSnap.docs.forEach((doc) => {
      console.log(`\n  Doc ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }

  // Check `settings` collection (dashboard's current setup)
  console.log('\n=== SETTINGS COLLECTION ===');
  const settingsSnap = await db.collection('settings').get();
  if (settingsSnap.empty) {
    console.log('  (empty)');
  } else {
    settingsSnap.docs.forEach((doc) => {
      console.log(`\n  Doc ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }

  process.exit(0);
}

checkConfig().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
