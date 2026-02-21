/**
 * FCM Flow Analysis Script
 * Traces the full approval flow and checks fcmToken availability on driver docs.
 */

const admin = require('firebase-admin');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

async function main() {
  console.log('=== FCM NOTIFICATION FLOW ANALYSIS ===\n');

  // 1. Check all driver-applications and their linked driver docs
  console.log('--- DRIVER APPLICATIONS ---');
  const apps = await db.collection('driver-applications').get();
  console.log(`Total applications: ${apps.size}\n`);

  for (const appDoc of apps.docs) {
    const appData = appDoc.data();
    const uid = appDoc.id;
    const status = appData.status || appData.driverVerificationStatus || 'unknown';
    const fullName = appData.identity?.fullName || appData.driverFullName || 'Unknown';

    console.log(`  Application: ${uid}`);
    console.log(`    Name: ${fullName}`);
    console.log(`    Status: ${status}`);

    // Check linked driver doc
    const driverDoc = await db.collection('drivers').doc(uid).get();
    if (driverDoc.exists) {
      const driverData = driverDoc.data();
      console.log(`    Driver doc exists: YES`);
      console.log(`    fcmToken: ${driverData.fcmToken ? driverData.fcmToken.substring(0, 30) + '...' : 'NOT SET'}`);
      console.log(`    driverInfo.verificationStatus: ${driverData.driverInfo?.verificationStatus || '(missing)'}`);

      // Check all top-level fields that contain 'token' or 'fcm'
      const tokenFields = Object.keys(driverData).filter(k =>
        k.toLowerCase().includes('token') || k.toLowerCase().includes('fcm')
      );
      if (tokenFields.length > 0) {
        console.log(`    Token-related fields: ${tokenFields.join(', ')}`);
      }

      // Check if token is nested somewhere
      if (driverData.driverInfo) {
        const nestedTokens = Object.keys(driverData.driverInfo).filter(k =>
          k.toLowerCase().includes('token') || k.toLowerCase().includes('fcm')
        );
        if (nestedTokens.length > 0) {
          console.log(`    driverInfo token fields: ${nestedTokens.join(', ')}`);
        }
      }
    } else {
      console.log(`    Driver doc exists: NO`);
    }
    console.log();
  }

  // 2. Check ALL drivers for fcmToken presence
  console.log('--- ALL DRIVERS FCM TOKEN CHECK ---');
  const drivers = await db.collection('drivers').get();
  console.log(`Total drivers: ${drivers.size}\n`);

  let withToken = 0;
  let withoutToken = 0;

  for (const driverDoc of drivers.docs) {
    const data = driverDoc.data();
    const hasToken = !!data.fcmToken;
    if (hasToken) withToken++;
    else withoutToken++;

    console.log(`  Driver: ${driverDoc.id}`);
    console.log(`    Name: ${data.fullName || data.firstName || 'Unknown'}`);
    console.log(`    fcmToken: ${hasToken ? data.fcmToken.substring(0, 40) + '...' : 'NOT SET'}`);
    console.log(`    verificationStatus: ${data.driverInfo?.verificationStatus || '(missing)'}`);
    console.log();
  }

  console.log(`\n--- SUMMARY ---`);
  console.log(`Drivers with fcmToken: ${withToken}`);
  console.log(`Drivers without fcmToken: ${withoutToken}`);

  // 3. Check notifications collection
  console.log('\n--- NOTIFICATIONS COLLECTION ---');
  const notifs = await db.collection('notifications').limit(5).get();
  console.log(`Total notifications: ${notifs.size}`);
  notifs.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  ${doc.id}: ${data.title} -> ${data.userId} (read: ${data.read})`);
  });

  // 4. Check if Firebase Messaging is configured
  console.log('\n--- FIREBASE MESSAGING CHECK ---');
  try {
    const messaging = admin.messaging();
    console.log('  Firebase Messaging initialized: YES');
    // Try a dry run with a fake token to see if messaging service is working
    try {
      await messaging.send({ token: 'fake-token-test', notification: { title: 'test' } }, true);
      console.log('  Messaging dry run: OK');
    } catch (e) {
      if (e.code === 'messaging/invalid-argument' || e.code === 'messaging/registration-token-not-registered') {
        console.log('  Messaging dry run: SERVICE WORKING (token rejected as expected)');
      } else {
        console.log(`  Messaging dry run error: ${e.code || e.message}`);
      }
    }
  } catch (e) {
    console.log(`  Firebase Messaging error: ${e.message}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
