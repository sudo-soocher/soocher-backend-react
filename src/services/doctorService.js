import {
  getCollection,
  getDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  getPaginatedCollection,
  usersCollection,
} from "../firebase/firestore";
import { where, orderBy, limit } from "firebase/firestore";

// Doctor data model based on your Firestore structure
export const DoctorModel = {
  // Basic Info
  uid: "",
  name: "",
  phoneNumber: "",
  email: "",
  profileImage: "",

  // Professional Info
  specialization: "",
  mciNumber: "",
  numExp: "",
  worksAt: "",
  aboutMe: "",

  // Verification
  isAccountVerified: false,
  documentsSubmitted: false,
  aadharFrontUrl: "",
  aadharBackUrl: "",
  mciUploadUrl: "",

  // Financial
  consultationFees: "",
  upiID: "",
  upiId: "",
  withdrawalStatus: "",

  // Statistics
  averageRating: 0,
  numOnline: "",
  numOffline: "",

  // Location
  currentCity: "",
  currentState: "",

  // Languages
  knownLanguages: [],
  languagesKnown: [],

  // Features
  soocherClubEnabled: false,

  // Timestamps
  accountCreationDate: null,
  lastTokenUpdate: null,

  // Technical
  fcmToken: "",
  oneSignalSubId: "",
  stream_token: "",

  // Coupons
  coupons: [],
};

// Get all doctors
export const getDoctors = async (filters = {}) => {
  try {
    console.log("Getting doctors with filters:", filters);

    // Start with just the basic type filter
    const constraints = [where("type", "==", "DOCTOR")];

    console.log("Firestore constraints:", constraints);
    const result = await getCollection(usersCollection, constraints);
    console.log("Firestore result:", result);

    if (result.success && result.data) {
      console.log("Found doctors:", result.data.length);
      result.data.forEach((doctor, index) => {
        console.log(`Doctor ${index + 1}:`, {
          uid: doctor.uid,
          name: doctor.name,
          type: doctor.type,
          specialization: doctor.specialization,
          isAccountVerified: doctor.isAccountVerified,
        });
      });
    }

    return result;
  } catch (error) {
    console.error("Error in getDoctors:", error);
    return { success: false, error: error.message };
  }
};

// Get doctors with pagination
export const getDoctorsPaginated = async (
  pageSize = 10,
  lastDoc = null,
  filters = {}
) => {
  try {
    const constraints = [
      where("type", "==", "DOCTOR"),
      orderBy("accountCreationDate", "desc"),
    ];

    // Add additional filters
    if (filters.specialization) {
      constraints.push(where("specialization", "==", filters.specialization));
    }
    if (filters.isVerified !== undefined) {
      constraints.push(where("isAccountVerified", "==", filters.isVerified));
    }
    if (filters.city) {
      constraints.push(where("currentCity", "==", filters.city));
    }
    if (filters.state) {
      constraints.push(where("currentState", "==", filters.state));
    }

    const result = await getPaginatedCollection(
      usersCollection,
      constraints,
      pageSize,
      lastDoc
    );
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get single doctor by ID
export const getDoctor = async (doctorId) => {
  try {
    const result = await getDocument(usersCollection, doctorId);
    if (result.success && result.data.type === "DOCTOR") {
      return result;
    } else {
      return { success: false, error: "Doctor not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update doctor
export const updateDoctor = async (doctorId, data) => {
  try {
    // Remove fields that shouldn't be updated directly
    const { uid, type, accountCreationDate, ...updateData } = data;

    const result = await updateDocument(usersCollection, doctorId, updateData);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete doctor (soft delete by updating type)
export const deleteDoctor = async (doctorId) => {
  try {
    const result = await updateDocument(usersCollection, doctorId, {
      type: "DELETED_DOCTOR",
      deletedAt: new Date(),
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify doctor
export const verifyDoctor = async (doctorId, verificationData = {}) => {
  try {
    const result = await updateDocument(usersCollection, doctorId, {
      isAccountVerified: true,
      documentsSubmitted: true,
      verificationDate: new Date(),
      ...verificationData,
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reject doctor verification
export const rejectDoctorVerification = async (doctorId, reason = "") => {
  try {
    const result = await updateDocument(usersCollection, doctorId, {
      isAccountVerified: false,
      verificationRejected: true,
      rejectionReason: reason,
      rejectionDate: new Date(),
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get doctor statistics
export const getDoctorStats = async () => {
  try {
    const result = await getDoctors();
    if (!result.success) return result;

    const doctors = result.data;
    const stats = {
      total: doctors.length,
      verified: doctors.filter((d) => d.isAccountVerified).length,
      pending: doctors.filter((d) => !d.isAccountVerified).length,
      specializations: {},
      cities: {},
      states: {},
      averageRating: 0,
      totalConsultations: 0,
    };

    // Calculate statistics
    doctors.forEach((doctor) => {
      // Specializations
      if (doctor.specialization) {
        stats.specializations[doctor.specialization] =
          (stats.specializations[doctor.specialization] || 0) + 1;
      }

      // Cities
      if (doctor.currentCity) {
        stats.cities[doctor.currentCity] =
          (stats.cities[doctor.currentCity] || 0) + 1;
      }

      // States
      if (doctor.currentState) {
        stats.states[doctor.currentState] =
          (stats.states[doctor.currentState] || 0) + 1;
      }

      // Average rating
      if (doctor.averageRating) {
        stats.averageRating += doctor.averageRating;
      }

      // Total consultations
      const online = parseInt(doctor.numOnline?.replace(/[^0-9]/g, "") || "0");
      const offline = parseInt(
        doctor.numOffline?.replace(/[^0-9]/g, "") || "0"
      );
      stats.totalConsultations += online + offline;
    });

    // Calculate average rating
    const doctorsWithRating = doctors.filter((d) => d.averageRating > 0);
    if (doctorsWithRating.length > 0) {
      stats.averageRating = stats.averageRating / doctorsWithRating.length;
    }

    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Subscribe to doctors real-time updates
export const subscribeToDoctors = (callback, filters = {}) => {
  try {
    const constraints = [
      where("type", "==", "DOCTOR"),
      orderBy("accountCreationDate", "desc"),
    ];

    // Add additional filters
    if (filters.specialization) {
      constraints.push(where("specialization", "==", filters.specialization));
    }
    if (filters.isVerified !== undefined) {
      constraints.push(where("isAccountVerified", "==", filters.isVerified));
    }

    return subscribeToCollection(usersCollection, constraints, callback);
  } catch (error) {
    console.error("Error setting up doctors subscription:", error);
    return null;
  }
};

// Search doctors
export const searchDoctors = async (searchTerm, filters = {}) => {
  try {
    const result = await getDoctors(filters);
    if (!result.success) return result;

    const doctors = result.data;
    const searchLower = searchTerm.toLowerCase();

    const filteredDoctors = doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(searchLower) ||
        doctor.specialization?.toLowerCase().includes(searchLower) ||
        doctor.currentCity?.toLowerCase().includes(searchLower) ||
        doctor.currentState?.toLowerCase().includes(searchLower) ||
        doctor.worksAt?.toLowerCase().includes(searchLower) ||
        doctor.mciNumber?.toLowerCase().includes(searchLower)
    );

    return { success: true, data: filteredDoctors };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (specialization) => {
  try {
    const result = await getDoctors({ specialization });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get verified doctors
export const getVerifiedDoctors = async () => {
  try {
    const result = await getDoctors({ isVerified: true });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get pending verification doctors
export const getPendingDoctors = async () => {
  try {
    const result = await getDoctors({ isVerified: false });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
