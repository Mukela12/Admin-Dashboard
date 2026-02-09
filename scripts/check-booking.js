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

async function checkBookings() {
  const snapshot = await db.collection('bookings').limit(3).get();
  snapshot.docs.forEach(doc => {
    const d = doc.data();
    console.log('---');
    console.log('ID:', doc.id);
    console.log('price:', d.price, '(type:', typeof d.price + ')');
    console.log('distance:', d.distance);
    console.log('duration:', d.duration);
    console.log('passenger:', d.passengerInfo?.fullName);
    console.log('driver:', d.confirmedDriver?.fullName);
    console.log('status:', d.status);
  });
  process.exit(0);
}

checkBookings().catch(e => { console.error(e); process.exit(1); });
