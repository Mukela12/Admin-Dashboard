const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
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

async function check() {
  // Check float-transactions
  const txns = await db.collection('float-transactions').limit(3).get();
  console.log('=== float-transactions ===');
  txns.docs.forEach(doc => {
    const d = doc.data();
    console.log('amount:', d.amount, '(type:', typeof d.amount + ')', 'type:', d.type);
  });

  // Check payments
  const pays = await db.collection('payments').limit(3).get();
  console.log('\n=== payments ===');
  pays.docs.forEach(doc => {
    const d = doc.data();
    console.log('amount:', d.amount, '(type:', typeof d.amount + ')', 'status:', d.status);
  });

  // Check settings
  const settings = await db.collection('settings').doc('platform-config').get();
  console.log('\n=== settings ===');
  if (settings.exists) {
    const d = settings.data();
    console.log('minFare:', d.minFare);
    console.log('baseFare:', d.baseFare);
    console.log('perKmRate:', d.perKmRate);
    console.log('perMinRate:', d.perMinRate);
    console.log('cancellationFee:', d.cancellationFee);
  } else {
    console.log('No settings document found');
  }

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
