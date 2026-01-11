# 🚀 Deploy Notification Cloud Function

## Quick Deployment Steps

### 1. Navigate to Functions Directory
```bash
cd functions
```

### 2. Install Dependencies (if not already done)
```bash
npm install
```

### 3. Build TypeScript
```bash
npm run build
```

### 4. Deploy the Function
```bash
firebase deploy --only functions:sendNotificationToAll
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

---

## What the Function Does

The `sendNotificationToAll` Cloud Function:

✅ **Handles CORS** - Allows requests from your React app  
✅ **Validates Input** - Ensures title and message are provided  
✅ **Targets Users** - Supports 'all', 'doctors', or 'patients'  
✅ **Batches Notifications** - Sends in batches of 500 tokens (FCM limit)  
✅ **Error Handling** - Logs errors and returns detailed responses  
✅ **Returns Statistics** - Provides success/failure counts  

---

## Function URL

After deployment, your function will be available at:
```
https://asia-southeast1-soocherv2.cloudfunctions.net/sendNotificationToAll
```

This URL is already configured in `src/services/notificationService.js`.

---

## Testing the Function

### Option 1: Test from Firebase Console
1. Go to Firebase Console → Functions
2. Click on `sendNotificationToAll`
3. Click "Test" tab
4. Use this test payload:
```json
{
  "title": "Test Notification",
  "message": "This is a test message",
  "target": "all"
}
```

### Option 2: Test from Your App
1. Go to `/notifications` page
2. Fill out the form
3. Click "Send Notification"
4. Check the response in the browser console

---

## Verify Deployment

### Check Function Status
```bash
firebase functions:list
```

### View Function Logs
```bash
firebase functions:log --only sendNotificationToAll
```

Or in Firebase Console:
1. Go to Firebase Console → Functions
2. Click on `sendNotificationToAll`
3. Click "Logs" tab

---

## Troubleshooting

### Function Not Deploying
- **Check Firebase CLI**: `firebase --version`
- **Check Login**: `firebase login`
- **Check Project**: `firebase projects:list`
- **Set Project**: `firebase use soocherv2`

### Function Deployed But Not Working
- **Check Logs**: `firebase functions:log`
- **Check CORS**: Ensure CORS headers are set (already included)
- **Check Permissions**: Function needs Firestore read permissions
- **Check FCM**: Ensure Firebase Cloud Messaging is enabled

### "Failed to fetch" Error
- Function might not be deployed
- Check function URL is correct
- Check Firebase Console → Functions for deployment status
- Verify CORS is properly configured

---

## Function Code Location

The function code is in:
```
functions/src/index.ts
```

---

## Next Steps After Deployment

1. ✅ Test sending a notification from `/notifications` page
2. ✅ Check Firestore `notifications` collection for saved records
3. ✅ Verify push notifications are received on devices
4. ✅ Check function logs for any errors

---

## Function Response Format

### Success Response
```json
{
  "success": true,
  "message": "Notification sent to 150 device(s)",
  "recipientsCount": 150,
  "totalTokens": 150,
  "successCount": 150,
  "failureCount": 0
}
```

### Error Response
```json
{
  "error": "Error message here"
}
```

---

**Ready to deploy?** Run the commands above! 🚀

