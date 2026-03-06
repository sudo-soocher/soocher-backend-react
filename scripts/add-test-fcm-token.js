/**
 * Test Script: Add FCM Token to Firestore
 * 
 * This script helps you add test FCM tokens to user documents for testing notifications.
 * 
 * Usage:
 * 1. Get a real FCM token from your mobile app (check console logs)
 * 2. Update the userId and fcmToken below
 * 3. Run: node scripts/add-test-fcm-token.js
 * 
 * Or use Firebase Admin SDK directly in your code
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Make sure you have serviceAccountKey.json in the firebase/ directory
const serviceAccount = require('../firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Add FCM token to a user document
 * @param {string} userId - User ID from Firestore
 * @param {string} fcmToken - FCM token from mobile app
 */
async function addFCMTokenToUser(userId, fcmToken) {
  try {
    const userRef = db.collection('Users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`User ${userId} not found in Firestore`);
      return;
    }

    await userRef.update({
      fcmToken: fcmToken,
      lastTokenUpdate: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ FCM token added to user ${userId}`);
    console.log(`   Token: ${fcmToken.substring(0, 20)}...`);
  } catch (error) {
    console.error('Error adding FCM token:', error);
  }
}

/**
 * Add FCM token to multiple users
 * @param {Array<{userId: string, fcmToken: string}>} users - Array of user objects
 */
async function addFCMTokensToUsers(users) {
  for (const user of users) {
    await addFCMTokenToUser(user.userId, user.fcmToken);
  }
}

/**
 * Get all users without FCM tokens
 */
async function getUsersWithoutTokens() {
  try {
    const usersSnapshot = await db.collection('Users').get();
    const usersWithoutTokens = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.fcmToken || data.fcmToken.trim() === '') {
        usersWithoutTokens.push({
          id: doc.id,
          name: data.name || 'Unknown',
          type: data.type || 'Unknown',
          email: data.email || 'No email',
        });
      }
    });

    console.log(`\n📊 Found ${usersWithoutTokens.length} users without FCM tokens:\n`);
    usersWithoutTokens.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.type}) - ${user.email} - ID: ${user.id}`);
    });

    return usersWithoutTokens;
  } catch (error) {
    console.error('Error getting users without tokens:', error);
    return [];
  }
}

// ============================================
// CONFIGURATION - Update these values
// ============================================

// Option 1: Add token to a specific user
const TEST_USER_ID = 'YOUR_USER_ID_HERE';
const TEST_FCM_TOKEN = 'YOUR_FCM_TOKEN_HERE';

// Option 2: Add tokens to multiple users
const TEST_USERS = [
  {
    userId: 'USER_ID_1',
    fcmToken: 'FCM_TOKEN_1',
  },
  {
    userId: 'USER_ID_2',
    fcmToken: 'FCM_TOKEN_2',
  },
];

// ============================================
// EXECUTION
// ============================================

async function main() {
  console.log('🔔 FCM Token Management Script\n');

  // Uncomment the action you want to perform:

  // 1. Add token to a specific user
  if (TEST_USER_ID !== 'YOUR_USER_ID_HERE' && TEST_FCM_TOKEN !== 'YOUR_FCM_TOKEN_HERE') {
    await addFCMTokenToUser(TEST_USER_ID, TEST_FCM_TOKEN);
  }

  // 2. Add tokens to multiple users
  // await addFCMTokensToUsers(TEST_USERS);

  // 3. List users without tokens
  // await getUsersWithoutTokens();

  // 4. Get count of users with tokens
  const usersWithTokens = await db
    .collection('Users')
    .where('fcmToken', '!=', null)
    .get();
  
  console.log(`\n📱 Total users with FCM tokens: ${usersWithTokens.size}`);

  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('Script error:', error);
  process.exit(1);
});


