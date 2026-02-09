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
  // Pull settings
  const settings = await db.collection('settings').doc('platform-config').get();
  console.log('=== Settings (raw Firestore values) ===');
  if (settings.exists) {
    const d = settings.data();
    console.log('commissionRate:', d.commissionRate);
    console.log('minFare:', d.minFare);
    console.log('baseFare:', d.baseFare);
    console.log('perKmRate:', d.perKmRate);
    console.log('perMinRate:', d.perMinRate);
    console.log('cancellationFee:', d.cancellationFee);
  } else {
    console.log('No settings document');
  }

  // Pull the known ride
  console.log('\n=== Ride: vExMqWSqcltSdjM5P1rw ===');
  const ride = await db.collection('bookings').doc('vExMqWSqcltSdjM5P1rw').get();
  if (ride.exists) {
    const d = ride.data();
    console.log('price:', d.price, '(type:', typeof d.price + ')');
    console.log('distance:', d.distance);
    console.log('duration:', d.duration);
    console.log('status:', d.status);
    console.log('bookingType:', d.bookingType);
    console.log('bookingClass:', d.bookingClass);
    console.log('paymentMethod:', d.paymentMethod);

    // Check all price-related fields
    console.log('\nAll numeric fields:');
    for (const [key, val] of Object.entries(d)) {
      if (typeof val === 'number') {
        console.log(`  ${key}: ${val}`);
      }
    }
  }

  // Try calculation both ways
  if (settings.exists) {
    const s = settings.data();
    console.log('\n=== Price verification (18.2km, 31min) ===');

    // If settings are in ngwee
    const ngweePrice = s.baseFare + (s.perKmRate * 18.2) + (s.perMinRate * 31);
    console.log(`If ngwee: ${s.baseFare} + (${s.perKmRate} × 18.2) + (${s.perMinRate} × 31) = ${ngweePrice} ngwee = K${(ngweePrice / 100).toFixed(2)}`);

    // If settings are in kwacha
    const kwachaPrice = s.baseFare + (s.perKmRate * 18.2) + (s.perMinRate * 31);
    console.log(`If kwacha: ${s.baseFare} + (${s.perKmRate} × 18.2) + (${s.perMinRate} × 31) = K${kwachaPrice.toFixed(2)}`);

    console.log(`\nActual ride price: K260`);
    console.log(`Ngwee calculation gives: K${(ngweePrice / 100).toFixed(2)}`);
    console.log(`Kwacha calculation gives: K${kwachaPrice.toFixed(2)}`);
  }

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
