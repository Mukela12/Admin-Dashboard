/**
 * Comprehensive verification script
 * Tests all collections and schema alignment with mobile AdminService
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

async function checkCollection(name, limit = 2) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`COLLECTION: ${name}`);
  console.log('='.repeat(60));
  const snap = await db.collection(name).limit(limit).get();
  if (snap.empty) {
    console.log('  (empty)');
    return [];
  }
  console.log(`  Total docs (sampled ${snap.size}):`);
  snap.docs.forEach((doc) => {
    console.log(`\n  --- Doc ID: ${doc.id} ---`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
  return snap.docs;
}

async function checkAdminCredentials() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('ADMIN CREDENTIALS CHECK');
  console.log('='.repeat(60));

  // Check both emails
  const emails = ['Mukelathegreat@gmail.com', 'Jessekatungu@gmail.com'];
  for (const email of emails) {
    const doc = await db.collection('admins').doc(email).get();
    if (doc.exists) {
      const data = doc.data();
      console.log(`\n  [FOUND] ${email}`);
      console.log(`    role: ${data.role || '(none)'}`);
      console.log(`    has password hash: ${!!data.password}`);
      if (data.password) {
        // Test known passwords
        const tests = [
          { pw: 'securePassword123', label: 'securePassword123' },
          { pw: 'Milan18$', label: 'Milan18$' },
        ];
        for (const t of tests) {
          const match = await bcrypt.compare(t.pw, data.password);
          console.log(`    password="${t.label}": ${match ? 'MATCH' : 'no match'}`);
        }
      }
    } else {
      console.log(`\n  [NOT FOUND] ${email}`);
    }
  }
}

async function checkDriverApplicationSchema() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('DRIVER APPLICATION SCHEMA ANALYSIS');
  console.log('='.repeat(60));

  const snap = await db.collection('driver-applications').limit(3).get();
  if (snap.empty) {
    console.log('  No applications found');
    return;
  }

  snap.docs.forEach((doc) => {
    const data = doc.data();
    console.log(`\n  Doc ID: ${doc.id}`);
    console.log(`    status field: ${data.status || '(missing)'}`);
    console.log(`    driverVerificationStatus: ${data.driverVerificationStatus || '(missing)'}`);
    console.log(`    Has identity obj: ${!!data.identity}`);
    console.log(`    Has vehicle obj: ${!!data.vehicle}`);
    console.log(`    Has flat fields (carMake etc): ${!!data.carMake}`);
    console.log(`    canDrive: ${data.canDrive}`);
    console.log(`    canDeliver: ${data.canDeliver}`);
    console.log(`    canAllDay: ${data.canAllDay}`);
    if (data.identity) {
      console.log(`    identity keys: ${Object.keys(data.identity).join(', ')}`);
    }
    if (data.vehicle) {
      console.log(`    vehicle keys: ${Object.keys(data.vehicle).join(', ')}`);
    }
  });
}

async function checkDriverSchema() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('DRIVER DOC SCHEMA ANALYSIS');
  console.log('='.repeat(60));

  const snap = await db.collection('drivers').limit(3).get();
  if (snap.empty) {
    console.log('  No drivers found');
    return;
  }

  snap.docs.forEach((doc) => {
    const data = doc.data();
    console.log(`\n  Doc ID: ${doc.id}`);
    console.log(`    fullName: ${data.fullName || '(missing)'}`);
    console.log(`    avatar: ${data.avatar ? '(set)' : '(missing)'}`);
    console.log(`    profileComplete: ${data.profileComplete}`);
    console.log(`    fcmToken: ${data.fcmToken ? '(set)' : '(missing)'}`);
    if (data.driverInfo) {
      console.log(`    driverInfo.verificationStatus: ${data.driverInfo.verificationStatus || '(missing)'}`);
      console.log(`    driverInfo.status: ${data.driverInfo.status || '(missing)'}`);
      console.log(`    driverInfo.floatBalance: ${data.driverInfo.floatBalance}`);
      console.log(`    driverInfo.childPickUpStatus: ${data.driverInfo.childPickUpStatus || '(missing)'}`);
    } else {
      console.log('    driverInfo: (missing)');
    }
    if (data.vehicleInfo) {
      console.log(`    vehicleInfo.rideClasses: ${JSON.stringify(data.vehicleInfo.rideClasses)}`);
      console.log(`    vehicleInfo.deliveryClasses: ${JSON.stringify(data.vehicleInfo.deliveryClasses)}`);
    } else {
      console.log('    vehicleInfo: (missing)');
    }
  });
}

async function main() {
  console.log('BANTURIDE ADMIN DASHBOARD - FULL VERIFICATION');
  console.log(new Date().toISOString());

  try {
    // 1. Check admin credentials
    await checkAdminCredentials();

    // 2. Check driver application schema
    await checkDriverApplicationSchema();

    // 3. Check driver doc schema
    await checkDriverSchema();

    // 4. Check child-pickup applications
    await checkCollection('child-pickup-applications', 2);

    // 5. Check config collection (Enos's pricing)
    await checkCollection('config', 5);

    // 6. Check settings collection (dashboard's current)
    await checkCollection('settings', 5);

    // 7. Check notifications collection
    await checkCollection('notifications', 3);

    console.log(`\n${'='.repeat(60)}`);
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(60));
  } catch (err) {
    console.error('ERROR:', err.message);
  }

  process.exit(0);
}

main();
