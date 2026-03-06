# 🚀 FCM Token Setup - Quick Start

## The Problem
Your Cloud Function is working, but it returns: **"No devices found with FCM tokens"**

This means users in Firestore don't have `fcmToken` values saved yet.

---

## ✅ Solution: Two Options

### Option 1: Mobile App Integration (Production)

**This is the proper way** - FCM tokens should be saved automatically from your mobile app.

See `FCM_TOKEN_SETUP.md` for complete mobile app integration guide.

**Quick Steps:**
1. Install FCM package in mobile app
2. Request notification permissions
3. Get FCM token on app start/login
4. Save token to Firestore using the `updateFCMToken` Cloud Function

---

### Option 2: Manual Testing (Development)

**For testing purposes**, you can manually add FCM tokens to Firestore.

#### Step 1: Get a Real FCM Token

**From React Native App:**
```javascript
import messaging from '@react-native-firebase/messaging';

const token = await messaging().getToken();
console.log('FCM Token:', token);
```

**From Flutter App:**
```dart
String? token = await FirebaseMessaging.instance.getToken();
print('FCM Token: $token');
```

#### Step 2: Add Token to Firestore

**Option A: Using Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Open `Users` collection
3. Select a user document
4. Add field: `fcmToken` (string) with your token value
5. Add field: `lastTokenUpdate` (timestamp) with current time

**Option B: Using Test Script**
1. Update `scripts/add-test-fcm-token.js` with your userId and token
2. Run: `node scripts/add-test-fcm-token.js`

**Option C: Using Cloud Function**
Call the `updateFCMToken` function from your mobile app:
```javascript
const functions = firebase.functions();
const updateToken = functions.httpsCallable('updateFCMToken');
await updateToken({ fcmToken: 'YOUR_TOKEN_HERE' });
```

---

## 🔍 Verify Tokens Are Saved

### Check Firestore
1. Go to Firebase Console → Firestore Database
2. Open `Users` collection
3. Check if user documents have `fcmToken` field populated

### Test Query
Run this in Firebase Console → Firestore → Run Query:
```javascript
// Collection: Users
// Filter: fcmToken != null
```

### Test Notification
1. Go to `/notifications` page
2. Send a test notification
3. Check if it finds tokens now

---

## 📱 Mobile App Integration (Recommended)

### React Native Example

```javascript
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';

function useFCMToken() {
  useEffect(() => {
    async function setupFCM() {
      try {
        // Request permission
        const authStatus = await messaging().requestPermission();
        if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED) {
          return;
        }

        // Get token
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);

        // Save to Firestore via Cloud Function
        const updateToken = functions().httpsCallable('updateFCMToken');
        await updateToken({ fcmToken });

        // Listen for token refresh
        messaging().onTokenRefresh(async (newToken) => {
          await updateToken({ fcmToken: newToken });
        });
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    }

    if (auth().currentUser) {
      setupFCM();
    }
  }, []);
}

export default useFCMToken;
```

### Flutter Example

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_functions/cloud_functions.dart';

Future<void> setupFCM() async {
  try {
    // Request permission
    NotificationSettings settings = await FirebaseMessaging.instance.requestPermission();
    if (settings.authorizationStatus != AuthorizationStatus.authorized) {
      return;
    }

    // Get token
    String? token = await FirebaseMessaging.instance.getToken();
    print('FCM Token: $token');

    // Save to Firestore via Cloud Function
    final callable = FirebaseFunctions.instance.httpsCallable('updateFCMToken');
    await callable.call({'fcmToken': token});

    // Listen for token refresh
    FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
      await callable.call({'fcmToken': newToken});
    });
  } catch (e) {
    print('FCM setup error: $e');
  }
}
```

---

## 🎯 Next Steps

1. ✅ **For Testing**: Manually add FCM tokens to Firestore (see Option 2 above)
2. ✅ **For Production**: Integrate FCM token saving in mobile app (see Option 1)
3. ✅ **Deploy Cloud Function**: `updateFCMToken` function is ready to use
4. ✅ **Test**: Send notification from `/notifications` page

---

## 📚 Full Documentation

- **Complete Setup Guide**: See `FCM_TOKEN_SETUP.md`
- **Cloud Function**: Already created in `functions/src/index.ts`
- **Test Script**: Available in `scripts/add-test-fcm-token.js`

---

**Once tokens are saved, your notifications will work!** 🎉


