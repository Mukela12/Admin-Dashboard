/**
 * Firebase Connection Test Script
 * This script tests Firebase connectivity and explores the database schema
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    // Check if credentials are available
    if (!process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Missing Firebase credentials in .env file');
    }

    // Check if private key is still placeholder
    if (process.env.FIREBASE_PRIVATE_KEY.includes('Your_Private_Key_Here')) {
      throw new Error('Firebase private key is still a placeholder. Please add your actual private key.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    throw error;
  }
}

// List all collections in Firestore
async function listCollections(db) {
  try {
    console.log('\n📚 Fetching collections...');
    const collections = await db.listCollections();

    console.log(`\nFound ${collections.length} collections:\n`);
    return collections.map(col => col.id);
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
    return [];
  }
}

// Get sample document from a collection
async function getSampleDocument(db, collectionName, limit = 1) {
  try {
    const snapshot = await db.collection(collectionName).limit(limit).get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
  } catch (error) {
    console.error(`❌ Error getting sample from ${collectionName}:`, error.message);
    return null;
  }
}

// Analyze collection schema
async function analyzeCollectionSchema(db, collectionName) {
  try {
    console.log(`\n🔍 Analyzing collection: ${collectionName}`);
    console.log('─'.repeat(50));

    // Get sample documents
    const samples = await getSampleDocument(db, collectionName, 3);

    if (!samples || samples.length === 0) {
      console.log('  (empty collection)');
      return;
    }

    // Get document count
    const snapshot = await db.collection(collectionName).count().get();
    console.log(`  Total documents: ${snapshot.data().count}`);

    // Analyze field structure from first document
    const firstDoc = samples[0];
    console.log(`\n  Sample Document ID: ${firstDoc.id}`);
    console.log('  Fields:');

    Object.entries(firstDoc.data).forEach(([key, value]) => {
      const type = Array.isArray(value) ? 'array' : typeof value;
      const valuePreview = JSON.stringify(value).substring(0, 50);
      console.log(`    - ${key}: ${type} ${valuePreview.length < 50 ? '= ' + valuePreview : '= ' + valuePreview + '...'}`);
    });

    return {
      collectionName,
      documentCount: snapshot.data().count,
      sampleDocument: firstDoc
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${collectionName}:`, error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🔥 Firebase Database Schema Explorer');
  console.log('═'.repeat(50));

  try {
    // Initialize Firebase
    const db = initializeFirebase();

    // List all collections
    const collectionNames = await listCollections(db);

    if (collectionNames.length === 0) {
      console.log('\n⚠️  No collections found or unable to access database');
      return;
    }

    // Analyze each collection
    const schemas = [];
    for (const collectionName of collectionNames) {
      const schema = await analyzeCollectionSchema(db, collectionName);
      if (schema) {
        schemas.push(schema);
      }
    }

    // Print summary
    console.log('\n\n📊 SCHEMA SUMMARY');
    console.log('═'.repeat(50));
    schemas.forEach(schema => {
      console.log(`  ${schema.collectionName}: ${schema.documentCount} documents`);
    });

    console.log('\n✅ Analysis complete!');
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
