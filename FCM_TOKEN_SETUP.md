# 🔔 FCM Token Setup Guide

## Overview

Firebase Cloud Messaging (FCM) tokens are unique identifiers for each device that allow push notifications to be sent. These tokens need to be:
1. **Generated** by the mobile app when it starts
2. **Saved** to Firestore in the user's document
3. **Updated** when the token refreshes (happens periodically)

---

## 📱 Mobile App Setup (React Native / Flutter / Native)

### Step 1: Install FCM Package

#### React Native
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
# or
yarn add @react-native-firebase/app @react-native-firebase/messaging
```

#### Flutter
```yaml
dependencies:
  firebase_messaging: ^14.0.0
```

#### Native Android/iOS
- Follow Firebase SDK setup for your platform

---

## 📝 Step 2: Get FCM Token and Save to Firestore

### React Native Example

```javascript
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

async function saveFCMTokenToFirestore() {
  try {
    // Request permission for notifications (iOS)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Notification permission not granted');
      return;
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();
    console.log('FCM Token:', fcmToken);

    // Get current user ID
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log('User not logged in');
      return;
    }

    // Save token to Firestore
    await firestore()
      .collection('Users')
      .doc(currentUser.uid)
      .update({
        fcmToken: fcmToken,
        lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
      });

    console.log('FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

// Call when app starts or user logs in
saveFCMTokenToFirestore();
```

### Flutter Example

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

Future<void> saveFCMTokenToFirestore() async {
  try {
    // Request permission
    NotificationSettings settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus != AuthorizationStatus.authorized) {
      print('Notification permission not granted');
      return;
    }

    // Get FCM token
    String? fcmToken = await FirebaseMessaging.instance.getToken();
    print('FCM Token: $fcmToken');

    if (fcmToken == null) {
      print('Failed to get FCM token');
      return;
    }

    // Get current user ID
    User? currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      print('User not logged in');
      return;
    }

    // Save token to Firestore
    await FirebaseFirestore.instance
        .collection('Users')
        .doc(currentUser.uid)
        .update({
      'fcmToken': fcmToken,
      'lastTokenUpdate': FieldValue.serverTimestamp(),
    });

    print('FCM token saved to Firestore');
  } catch (error) {
    print('Error saving FCM token: $error');
  }
}

// Call when app starts or user logs in
saveFCMTokenToFirestore();
```

---

## 🔄 Step 3: Handle Token Refresh

FCM tokens can refresh periodically. You need to listen for token refresh events and update Firestore.

### React Native

```javascript
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Listen for token refresh
messaging().onTokenRefresh(async (fcmToken) => {
  console.log('FCM Token refreshed:', fcmToken);
  
  const currentUser = auth().currentUser;
  if (currentUser) {
    try {
      await firestore()
        .collection('Users')
        .doc(currentUser.uid)
        .update({
          fcmToken: fcmToken,
          lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
        });
      console.log('FCM token updated in Firestore');
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }
});
```

### Flutter

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

// Listen for token refresh
FirebaseMessaging.instance.onTokenRefresh.listen((fcmToken) {
  print('FCM Token refreshed: $fcmToken');
  
  User? currentUser = FirebaseAuth.instance.currentUser;
  if (currentUser != null) {
    FirebaseFirestore.instance
        .collection('Users')
        .doc(currentUser.uid)
        .update({
      'fcmToken': fcmToken,
      'lastTokenUpdate': FieldValue.serverTimestamp(),
    }).then((_) {
      print('FCM token updated in Firestore');
    }).catchError((error) {
      print('Error updating FCM token: $error');
    });
  }
});
```

---

## 🎯 Step 4: Complete Implementation Pattern

### React Native Complete Example

```javascript
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

function useFCMToken() {
  useEffect(() => {
    let unsubscribeTokenRefresh;

    async function setupFCM() {
      try {
        // Request permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Notification permission denied');
          return;
        }

        // Get initial token
        const fcmToken = await messaging().getToken();
        await saveTokenToFirestore(fcmToken);

        // Listen for token refresh
        unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
          await saveTokenToFirestore(newToken);
        });
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    }

    async function saveTokenToFirestore(token) {
      const currentUser = auth().currentUser;
      if (!currentUser || !token) return;

      try {
        await firestore()
          .collection('Users')
          .doc(currentUser.uid)
          .update({
            fcmToken: token,
            lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
          });
        console.log('FCM token saved:', token.substring(0, 20) + '...');
      } catch (error) {
        console.error('Error saving FCM token:', error);
      }
    }

    setupFCM();

    return () => {
      if (unsubscribeTokenRefresh) {
        unsubscribeTokenRefresh();
      }
    };
  }, []);
}

// Use in your App component
export default function App() {
  useFCMToken();
  // ... rest of your app
}
```

---

## 🔍 Step 5: Verify Tokens in Firestore

### Check Firestore Console

1. Go to Firebase Console → Firestore Database
2. Open `Users` collection
3. Check user documents for `fcmToken` field
4. Verify `lastTokenUpdate` timestamp

### Query Users with Tokens

```javascript
// In Firebase Console or Cloud Function
const usersWithTokens = await db
  .collection('Users')
  .where('fcmToken', '!=', null)
  .get();

console.log(`Found ${usersWithTokens.size} users with FCM tokens`);
```

---

## 🛠️ Step 6: Update Existing Users (Migration)

If you have existing users without tokens, you can create a Cloud Function to update them when they log in:

```typescript
// In functions/src/index.ts
export const updateUserFCMToken = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { fcmToken } = data;
    if (!fcmToken) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'FCM token is required'
      );
    }

    const db = admin.firestore();
    await db.collection('Users').doc(context.auth.uid).update({
      fcmToken: fcmToken,
      lastTokenUpdate: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);
```

---

## 📋 Checklist

- [ ] FCM package installed in mobile app
- [ ] Notification permissions requested
- [ ] FCM token retrieved on app start
- [ ] Token saved to Firestore in user document
- [ ] Token refresh listener set up
- [ ] Token updated when it refreshes
- [ ] Verified tokens exist in Firestore
- [ ] Test notification sent successfully

---

## 🐛 Troubleshooting

### Token Not Saving

- **Check Permissions**: Ensure notification permissions are granted
- **Check Auth**: Verify user is logged in before saving token
- **Check Firestore Rules**: Ensure users can update their own documents
- **Check Logs**: Look for errors in console/logs

### Token Not Updating

- **Check Refresh Listener**: Ensure `onTokenRefresh` is set up
- **Check Network**: Token refresh requires internet connection
- **Check App State**: Token refresh happens when app is active

### No Tokens Found

- **Check Collection**: Verify you're checking the correct collection (`Users`)
- **Check Field Name**: Ensure field is `fcmToken` (case-sensitive)
- **Check User Type**: Verify users have `type: "DOCTOR"` or `type: "PATIENT"`

---

## 🔐 Firestore Security Rules

Ensure your Firestore rules allow users to update their own FCM token:

```javascript
match /Users/{userId} {
  // Allow users to update their own FCM token
  allow update: if request.auth != null 
    && request.auth.uid == userId
    && request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['fcmToken', 'lastTokenUpdate']);
  
  // Allow read for authenticated users
  allow read: if request.auth != null;
}
```

---

## 📚 Additional Resources

- [React Native Firebase Messaging](https://rnfirebase.io/messaging/usage)
- [Flutter Firebase Messaging](https://firebase.flutter.dev/docs/messaging/overview)
- [FCM Token Management](https://firebase.google.com/docs/cloud-messaging/manage-tokens)

---

**Once tokens are saved, your notification system will work!** 🎉

