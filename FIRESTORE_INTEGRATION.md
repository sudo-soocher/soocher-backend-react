# 🔥 Firestore Integration & Data Models

## ✨ **Updated Firestore Structure**

### **Collection Structure**

- **Main Collection**: `/Users` (instead of separate collections)
- **Doctor Filtering**: `type == "DOCTOR"`
- **Patient Filtering**: `type == "PATIENT"`

### **Data Models**

#### **Doctor Model** (`type: "DOCTOR"`)

```javascript
{
  // Basic Info
  uid: "string",
  name: "string",
  phoneNumber: "string",
  email: "string",
  profileImage: "string",

  // Professional Info
  specialization: "string",
  mciNumber: "string",
  numExp: "string",
  worksAt: "string",
  aboutMe: "string",

  // Verification
  isAccountVerified: boolean,
  documentsSubmitted: boolean,
  aadharFrontUrl: "string",
  aadharBackUrl: "string",
  mciUploadUrl: "string",

  // Financial
  consultationFees: "string",
  upiID: "string",
  upiId: "string",
  withdrawalStatus: "string",

  // Statistics
  averageRating: number,
  numOnline: "string",
  numOffline: "string",

  // Location
  currentCity: "string",
  currentState: "string",

  // Languages
  knownLanguages: array,
  languagesKnown: array,

  // Features
  soocherClubEnabled: boolean,

  // Timestamps
  accountCreationDate: timestamp,
  lastTokenUpdate: timestamp,

  // Technical
  fcmToken: "string",
  oneSignalSubId: "string",
  stream_token: "string",

  // Coupons
  coupons: array,
}
```

#### **Patient Model** (`type: "PATIENT"`)

```javascript
{
  // Basic Info
  uid: "string",
  name: "string",
  phoneNumber: "string",
  whatsappNumber: "string",
  email: "string",
  profileImage: "string",

  // Personal Info
  gender: "string",
  dob: timestamp,

  // Location
  currentCity: "string",
  currentState: "string",
  timezone: "string",
  location: {
    latitude: number,
    longitude: number,
  },

  // Health
  healthScore: number,

  // Family
  familyMembers: array,

  // Timestamps
  dateOfAccountCreation: timestamp,
  lastTokenUpdate: timestamp,

  // Technical
  fcmToken: "string",
}
```

## 🛠️ **Service Layer**

### **Doctor Service** (`src/services/doctorService.js`)

#### **Core Functions**

- `getDoctors(filters)` - Get all doctors with optional filters
- `getDoctorsPaginated(pageSize, lastDoc, filters)` - Paginated doctor list
- `getDoctor(doctorId)` - Get single doctor by ID
- `updateDoctor(doctorId, data)` - Update doctor information
- `deleteDoctor(doctorId)` - Soft delete doctor
- `verifyDoctor(doctorId, verificationData)` - Verify doctor account
- `rejectDoctorVerification(doctorId, reason)` - Reject doctor verification

#### **Statistics Functions**

- `getDoctorStats()` - Get comprehensive doctor statistics
- `getDoctorsBySpecialization(specialization)` - Filter by specialty
- `getVerifiedDoctors()` - Get only verified doctors
- `getPendingDoctors()` - Get pending verification doctors

#### **Search & Filter Functions**

- `searchDoctors(searchTerm, filters)` - Search doctors by multiple fields
- `subscribeToDoctors(callback, filters)` - Real-time updates

### **Patient Service** (`src/services/patientService.js`)

#### **Core Functions**

- `getPatients(filters)` - Get all patients with optional filters
- `getPatientsPaginated(pageSize, lastDoc, filters)` - Paginated patient list
- `getPatient(patientId)` - Get single patient by ID
- `updatePatient(patientId, data)` - Update patient information
- `deletePatient(patientId)` - Soft delete patient

#### **Health Management**

- `updatePatientHealthScore(patientId, healthScore)` - Update health score
- `addFamilyMember(patientId, familyMember)` - Add family member
- `removeFamilyMember(patientId, familyMemberId)` - Remove family member

#### **Statistics Functions**

- `getPatientStats()` - Get comprehensive patient statistics
- `getPatientsByGender(gender)` - Filter by gender
- `getPatientsByLocation(city, state)` - Filter by location
- `getPatientsWithHealthScores()` - Get patients with health data
- `getRecentPatients()` - Get patients registered in last 30 days

#### **Search & Filter Functions**

- `searchPatients(searchTerm, filters)` - Search patients by multiple fields
- `subscribeToPatients(callback, filters)` - Real-time updates

## 📊 **Dashboard Integration**

### **Real Data Loading**

- **Doctor Statistics**: Total, verified, pending counts
- **Patient Statistics**: Total, gender distribution, health scores
- **Specialization Distribution**: Dynamic pie chart data
- **Location Analytics**: City and state distributions

### **Loading States**

- **Smooth Loading**: Animated loading spinners
- **Error Handling**: Fallback to mock data on errors
- **Progressive Loading**: Load data in parallel for better performance

## 🏥 **Doctor Management Page**

### **Features**

- **Doctor List**: Grid view with cards
- **Search & Filter**: By name, specialization, city, MCI number
- **Status Filtering**: All, verified, pending verification
- **Real-time Stats**: Live statistics in header
- **Doctor Details Modal**: Comprehensive doctor information
- **Verification Actions**: Verify or reject doctor accounts

### **Doctor Card Information**

- **Profile**: Avatar, name, specialization
- **Status**: Verified/Pending badge
- **Location**: City and state
- **Contact**: Phone number
- **Rating**: Average rating display
- **Statistics**: Online/offline consultations, fees
- **Actions**: View details, verify/reject

### **Verification Workflow**

- **Pending Doctors**: Show verification buttons
- **Verified Doctors**: Show verified status
- **Rejection**: Add rejection reason
- **Real-time Updates**: Refresh data after actions

## 🔍 **Search & Filtering**

### **Doctor Search Fields**

- Name
- Specialization
- City
- State
- MCI Number
- Works At

### **Patient Search Fields**

- Name
- Phone Number
- WhatsApp Number
- Email
- City
- State

### **Filter Options**

- **Status**: Verified, pending, all
- **Location**: City, state
- **Gender**: Male, female, other (patients)
- **Health Score**: With/without health data (patients)

## 📱 **Responsive Design**

### **Mobile Optimization**

- **Grid Layout**: Responsive card grid
- **Touch Interactions**: Mobile-friendly buttons
- **Modal Design**: Full-screen on mobile
- **Search Interface**: Optimized for mobile input

### **Tablet Support**

- **Adaptive Grid**: Adjusts column count
- **Touch Gestures**: Swipe-friendly interactions
- **Modal Sizing**: Appropriate for tablet screens

## 🚀 **Performance Optimizations**

### **Data Loading**

- **Parallel Requests**: Load doctor and patient data simultaneously
- **Pagination**: Support for large datasets
- **Caching**: Efficient data management
- **Error Boundaries**: Graceful error handling

### **Real-time Updates**

- **Firestore Listeners**: Live data synchronization
- **Efficient Queries**: Optimized Firestore queries
- **Memory Management**: Proper cleanup of listeners

## 🔧 **Technical Implementation**

### **Firestore Queries**

```javascript
// Get doctors
const constraints = [
  where("type", "==", "DOCTOR"),
  orderBy("accountCreationDate", "desc"),
];

// Get patients
const constraints = [
  where("type", "==", "PATIENT"),
  orderBy("dateOfAccountCreation", "desc"),
];
```

### **Error Handling**

- **Service Level**: Comprehensive error handling
- **UI Level**: User-friendly error messages
- **Fallback Data**: Mock data when services fail

### **Type Safety**

- **Data Models**: Clear structure definitions
- **Validation**: Input validation for updates
- **Consistent Types**: Standardized data formats

## 🎯 **Future Enhancements**

### **Planned Features**

- **Advanced Filtering**: Date ranges, rating filters
- **Bulk Operations**: Mass verify/reject doctors
- **Export Functionality**: CSV/PDF export
- **Analytics Dashboard**: Detailed insights
- **Notification System**: Real-time alerts

### **Performance Improvements**

- **Virtual Scrolling**: For large lists
- **Image Optimization**: Lazy loading
- **Caching Strategy**: Redis integration
- **CDN Integration**: Fast image delivery

The Firestore integration now provides a robust, scalable foundation for managing doctors and patients with real-time updates, comprehensive search capabilities, and a modern user interface!
