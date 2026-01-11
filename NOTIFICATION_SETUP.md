# 📱 Notification Setup Guide

## Overview

This guide explains how to set up and use the notification system to send push notifications to all devices (doctors and patients) in your Soocher application.

## 🏗️ Architecture

The notification system consists of:

1. **Frontend (React)**: Notification page at `/notifications` for sending notifications
2. **Firestore Database**: Stores notification history in `notifications` collection
3. **Cloud Function**: Handles FCM (Firebase Cloud Messaging) to send push notifications

---

## 📋 Prerequisites

1. Firebase project with Firestore enabled
2. Firebase Cloud Functions set up
3. FCM (Firebase Cloud Messaging) configured
4. User documents in Firestore with `fcmToken` field

---

## 🔥 Step 1: Set Up Firestore Collection

### Create `notifications` Collection

The notifications will be automatically saved to Firestore. The collection structure is:

```javascript
notifications/
  {notificationId}/
    title: string              // Notification title
    message: string            // Notification message
    target: string             // 'all', 'doctors', or 'patients'
    status: string             // 'pending', 'sent', or 'failed'
    recipientsCount: number   // Number of devices notified
    error: string | null       // Error message if failed
    sentAt: timestamp | null   // When notification was sent
    createdAt: timestamp      // When notification was created
    updatedAt: timestamp      // Last update time
```

### Firestore Security Rules

Add these rules to your Firestore security rules:

```javascript
match /notifications/{notificationId} {
  // Allow read for authenticated admin users
  allow read: if request.auth != null;
  
  // Allow create/update for authenticated admin users
  allow create, update: if request.auth != null;
  
  // Allow delete for authenticated admin users (optional)
  allow delete: if request.auth != null;
}
```

---

## ☁️ Step 2: Create Cloud Function

### Function: `sendNotificationToAll`

Create a Cloud Function in your Firebase project:

**Location**: `functions/src/index.ts` (or `index.js`)

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendNotificationToAll = functions.https.onRequest(async (req, res) => {
  // CORS handling
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { title, message, target, data } = req.body;

    // Validate input
    if (!title || !message) {
      res.status(400).json({ error: 'Title and message are required' });
      return;
    }

    // Get FCM tokens based on target
    const db = admin.firestore();
    let tokens: string[] = [];

    if (target === 'all') {
      // Get all users with FCM tokens
      const usersSnapshot = await db.collection('Users')
        .where('fcmToken', '!=', null)
        .get();
      
      usersSnapshot.forEach((doc) => {
        const fcmToken = doc.data().fcmToken;
        if (fcmToken && fcmToken.trim() !== '') {
          tokens.push(fcmToken);
        }
      });
    } else if (target === 'doctors') {
      // Get only doctors with FCM tokens
      const doctorsSnapshot = await db.collection('Users')
        .where('type', '==', 'DOCTOR')
        .where('fcmToken', '!=', null)
        .get();
      
      doctorsSnapshot.forEach((doc) => {
        const fcmToken = doc.data().fcmToken;
        if (fcmToken && fcmToken.trim() !== '') {
          tokens.push(fcmToken);
        }
      });
    } else if (target === 'patients') {
      // Get only patients with FCM tokens
      const patientsSnapshot = await db.collection('Users')
        .where('type', '==', 'PATIENT')
        .where('fcmToken', '!=', null)
        .get();
      
      patientsSnapshot.forEach((doc) => {
        const fcmToken = doc.data().fcmToken;
        if (fcmToken && fcmToken.trim() !== '') {
          tokens.push(fcmToken);
        }
      });
    }

    if (tokens.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No devices found with FCM tokens',
        recipientsCount: 0,
      });
      return;
    }

    // Remove duplicates
    tokens = [...new Set(tokens)];

    // Send notifications in batches (FCM allows up to 500 tokens per batch)
    const batchSize = 500;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      
      const message = {
        notification: {
          title: title,
          body: message,
        },
        data: {
          ...data,
          type: 'broadcast',
          target: target,
        },
        tokens: batch,
      };

      try {
        const response = await admin.messaging().sendMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;

        // Handle failed tokens (optional: remove invalid tokens from Firestore)
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`Failed to send to token ${batch[idx]}:`, resp.error);
            }
          });
        }
      } catch (error) {
        console.error('Error sending batch:', error);
        failureCount += batch.length;
      }
    }

    res.status(200).json({
      success: true,
      message: `Notification sent to ${successCount} device(s)`,
      recipientsCount: successCount,
      totalTokens: tokens.length,
      successCount,
      failureCount,
    });
  } catch (error: any) {
    console.error('Error in sendNotificationToAll:', error);
    res.status(500).json({
      error: error.message || 'Failed to send notification',
    });
  }
});
```

### Deploy the Function

```bash
cd functions
npm install
firebase deploy --only functions:sendNotificationToAll
```

---

## 📱 Step 3: Using the Notification Page

### Access the Page

1. Navigate to `/notifications` in your application
2. Or click "Notifications" in the sidebar menu

### Send a Notification

1. **Select Target Audience**:
   - **All Users**: Sends to both doctors and patients
   - **Doctors Only**: Sends only to doctors
   - **Patients Only**: Sends only to patients

2. **Enter Title**: Up to 100 characters
   - This appears as the notification title on devices

3. **Enter Message**: Up to 500 characters
   - This appears as the notification body on devices

4. **Click "Send Notification"**
   - The notification is saved to Firestore
   - Cloud Function is called to send push notifications
   - Status is updated based on success/failure

### View History

1. Click the **"History"** tab
2. View all sent notifications with:
   - Target audience
   - Title and message
   - Status (sent/pending/failed)
   - Timestamp
   - Number of recipients

---

## 🔍 Step 4: Verify Setup

### Check Firestore

1. Go to Firebase Console → Firestore Database
2. Check `notifications` collection
3. Verify notifications are being saved

### Check Cloud Function Logs

1. Go to Firebase Console → Functions
2. Click on `sendNotificationToAll`
3. View logs to see execution details

### Test Notification

1. Send a test notification from the page
2. Check if it appears in Firestore
3. Verify push notification is received on devices

---

## 🛠️ Troubleshooting

### Notification Not Saving to Firestore

- **Check Firestore Security Rules**: Ensure authenticated users can write
- **Check Browser Console**: Look for errors
- **Verify Collection Name**: Should be `notifications` (lowercase)

### Push Notifications Not Received

- **Check FCM Tokens**: Verify users have valid `fcmToken` in Firestore
- **Check Cloud Function Logs**: Look for errors in function execution
- **Verify FCM Setup**: Ensure Firebase Cloud Messaging is properly configured
- **Check Device Permissions**: Users must allow notifications on their devices

### Cloud Function Errors

- **Check Function Logs**: Firebase Console → Functions → Logs
- **Verify Dependencies**: Ensure `firebase-admin` is installed
- **Check Permissions**: Function needs Firestore read permissions
- **Verify Collection Path**: Should be `Users` (capital U)

---

## 📊 Notification Data Model

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'doctors' | 'patients';
  status: 'pending' | 'sent' | 'failed';
  recipientsCount: number;
  error?: string | null;
  sentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🚀 Advanced Features

### Custom Data Payload

You can add custom data to notifications:

```javascript
await sendNotificationToAll(
  "Title",
  "Message",
  "all",
  {
    customField: "value",
    action: "open_screen",
    screen: "consultations"
  }
);
```

### Filter by Additional Criteria

Modify the Cloud Function to filter by:
- Location (city/state)
- Account verification status
- Last active date
- Custom user properties

---

## 📝 Notes

1. **FCM Token Management**: Invalid tokens are automatically handled by FCM
2. **Rate Limiting**: FCM has rate limits; large batches may take time
3. **Batching**: Notifications are sent in batches of 500 tokens
4. **Error Handling**: Failed notifications are marked with status "failed"
5. **History**: All notifications are saved for audit purposes

---

## 🔐 Security Considerations

1. **Authentication**: Only authenticated admin users should access the notification page
2. **Validation**: Cloud Function validates all inputs
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **Audit Trail**: All notifications are logged in Firestore

---

## 📚 Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)

---

## ✅ Checklist

- [ ] Firestore `notifications` collection created
- [ ] Firestore security rules configured
- [ ] Cloud Function `sendNotificationToAll` deployed
- [ ] FCM tokens stored in user documents
- [ ] Notification page accessible at `/notifications`
- [ ] Test notification sent successfully
- [ ] Notification history visible in Firestore

---

**Need Help?** Check the Firebase Console logs or contact your development team.

