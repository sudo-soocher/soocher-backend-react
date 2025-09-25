# Soocher Backend Dashboard Setup

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. **Create Firebase Project:**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Services:**

   - Go to Authentication → Sign-in method → Enable Email/Password
   - Go to Firestore Database → Create database (start in test mode)
   - Go to Storage → Get started

3. **Get Configuration:**

   - Go to Project Settings → General → Your apps
   - Click "Add app" → Web app
   - Copy the Firebase configuration

4. **Add Environment Variables:**
   - Create `.env.local` file in project root
   - Add your Firebase config:
   ```bash
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### 3. Start Development

```bash
npm start
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Generic components
│   └── layout/         # Layout components
├── context/            # React Context providers
├── firebase/           # Firebase configuration and services
├── hooks/              # Custom React hooks
├── pages/              # Page components
└── utils/              # Helper functions
```

## 🔧 Features Implemented

✅ **Firebase Integration**

- Authentication (Email/Password)
- Firestore Database
- Storage for files

✅ **Dashboard Layout**

- Responsive sidebar navigation
- Header with user info
- Protected routes

✅ **Authentication System**

- Login form with validation
- Protected routes
- Loading states
- Error handling

✅ **Modern UI**

- Clean, professional design
- Responsive layout
- Loading spinners
- Error messages

## 🎯 Next Steps

1. **Create Admin User:**

   - Use Firebase Console → Authentication → Add user
   - Or implement signup functionality

2. **Add Data Management:**

   - Doctor management pages
   - Patient management pages
   - Withdrawal request handling
   - Verification workflows

3. **Add Analytics:**
   - Charts and graphs
   - Report generation
   - Data visualization

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Use Firebase Security Rules for Firestore
- Implement proper authentication checks
- Validate all user inputs

## 📱 Responsive Design

The dashboard is fully responsive and works on:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)
