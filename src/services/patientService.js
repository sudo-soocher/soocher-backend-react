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

// Patient data model based on your Firestore structure
export const PatientModel = {
  // Basic Info
  uid: "",
  name: "",
  phoneNumber: "",
  whatsappNumber: "",
  email: "",
  profileImage: "",

  // Personal Info
  gender: "",
  dob: null,

  // Location
  currentCity: "",
  currentState: "",
  timezone: "",
  location: {
    latitude: null,
    longitude: null,
  },

  // Health
  healthScore: -1,

  // Family
  familyMembers: [],

  // Timestamps
  dateOfAccountCreation: null,
  lastTokenUpdate: null,

  // Technical
  fcmToken: "",
};

// Get all patients
export const getPatients = async (filters = {}) => {
  try {
    const constraints = [
      where("type", "==", "PATIENT"),
      orderBy("dateOfAccountCreation", "desc"),
    ];

    // Add additional filters
    if (filters.gender) {
      constraints.push(where("gender", "==", filters.gender));
    }
    if (filters.city) {
      constraints.push(where("currentCity", "==", filters.city));
    }
    if (filters.state) {
      constraints.push(where("currentState", "==", filters.state));
    }
    if (filters.hasHealthScore !== undefined) {
      if (filters.hasHealthScore) {
        constraints.push(where("healthScore", ">", -1));
      } else {
        constraints.push(where("healthScore", "==", -1));
      }
    }

    const result = await getCollection(usersCollection, constraints);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get patients with pagination
export const getPatientsPaginated = async (
  pageSize = 10,
  lastDoc = null,
  filters = {}
) => {
  try {
    const constraints = [
      where("type", "==", "PATIENT"),
      orderBy("dateOfAccountCreation", "desc"),
    ];

    // Add additional filters
    if (filters.gender) {
      constraints.push(where("gender", "==", filters.gender));
    }
    if (filters.city) {
      constraints.push(where("currentCity", "==", filters.city));
    }
    if (filters.state) {
      constraints.push(where("currentState", "==", filters.state));
    }
    if (filters.hasHealthScore !== undefined) {
      if (filters.hasHealthScore) {
        constraints.push(where("healthScore", ">", -1));
      } else {
        constraints.push(where("healthScore", "==", -1));
      }
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

// Get single patient by ID
export const getPatient = async (patientId) => {
  try {
    const result = await getDocument(usersCollection, patientId);
    if (result.success && result.data.type === "PATIENT") {
      return result;
    } else {
      return { success: false, error: "Patient not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update patient
export const updatePatient = async (patientId, data) => {
  try {
    // Remove fields that shouldn't be updated directly
    const { uid, type, dateOfAccountCreation, ...updateData } = data;

    const result = await updateDocument(usersCollection, patientId, updateData);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete patient (soft delete by updating type)
export const deletePatient = async (patientId) => {
  try {
    const result = await updateDocument(usersCollection, patientId, {
      type: "DELETED_PATIENT",
      deletedAt: new Date(),
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update patient health score
export const updatePatientHealthScore = async (patientId, healthScore) => {
  try {
    const result = await updateDocument(usersCollection, patientId, {
      healthScore: healthScore,
      healthScoreUpdatedAt: new Date(),
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add family member
export const addFamilyMember = async (patientId, familyMember) => {
  try {
    const patient = await getPatient(patientId);
    if (!patient.success) return patient;

    const currentFamily = patient.data.familyMembers || [];
    const updatedFamily = [
      ...currentFamily,
      {
        ...familyMember,
        id: Date.now().toString(),
        addedAt: new Date(),
      },
    ];

    const result = await updateDocument(usersCollection, patientId, {
      familyMembers: updatedFamily,
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Remove family member
export const removeFamilyMember = async (patientId, familyMemberId) => {
  try {
    const patient = await getPatient(patientId);
    if (!patient.success) return patient;

    const currentFamily = patient.data.familyMembers || [];
    const updatedFamily = currentFamily.filter(
      (member) => member.id !== familyMemberId
    );

    const result = await updateDocument(usersCollection, patientId, {
      familyMembers: updatedFamily,
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get patient statistics
export const getPatientStats = async () => {
  try {
    const result = await getPatients();
    if (!result.success) return result;

    const patients = result.data;
    const stats = {
      total: patients.length,
      male: patients.filter((p) => p.gender === "Male").length,
      female: patients.filter((p) => p.gender === "Female").length,
      other: patients.filter((p) => p.gender === "Other").length,
      withHealthScore: patients.filter((p) => p.healthScore > -1).length,
      withoutHealthScore: patients.filter((p) => p.healthScore === -1).length,
      cities: {},
      states: {},
      averageHealthScore: 0,
      totalFamilyMembers: 0,
      recentRegistrations: 0,
    };

    // Calculate statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    patients.forEach((patient) => {
      // Cities
      if (patient.currentCity) {
        stats.cities[patient.currentCity] =
          (stats.cities[patient.currentCity] || 0) + 1;
      }

      // States
      if (patient.currentState) {
        stats.states[patient.currentState] =
          (stats.states[patient.currentState] || 0) + 1;
      }

      // Health score
      if (patient.healthScore > -1) {
        stats.averageHealthScore += patient.healthScore;
      }

      // Family members
      if (patient.familyMembers) {
        stats.totalFamilyMembers += patient.familyMembers.length;
      }

      // Recent registrations (last 30 days)
      if (patient.dateOfAccountCreation) {
        const registrationDate = new Date(patient.dateOfAccountCreation);
        if (registrationDate >= thirtyDaysAgo) {
          stats.recentRegistrations++;
        }
      }
    });

    // Calculate average health score
    const patientsWithHealthScore = patients.filter((p) => p.healthScore > -1);
    if (patientsWithHealthScore.length > 0) {
      stats.averageHealthScore =
        stats.averageHealthScore / patientsWithHealthScore.length;
    }

    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Subscribe to patients real-time updates
export const subscribeToPatients = (callback, filters = {}) => {
  try {
    const constraints = [
      where("type", "==", "PATIENT"),
      orderBy("dateOfAccountCreation", "desc"),
    ];

    // Add additional filters
    if (filters.gender) {
      constraints.push(where("gender", "==", filters.gender));
    }
    if (filters.city) {
      constraints.push(where("currentCity", "==", filters.city));
    }
    if (filters.state) {
      constraints.push(where("currentState", "==", filters.state));
    }

    return subscribeToCollection(usersCollection, constraints, callback);
  } catch (error) {
    console.error("Error setting up patients subscription:", error);
    return null;
  }
};

// Search patients
export const searchPatients = async (searchTerm, filters = {}) => {
  try {
    const result = await getPatients(filters);
    if (!result.success) return result;

    const patients = result.data;
    const searchLower = searchTerm.toLowerCase();

    const filteredPatients = patients.filter(
      (patient) =>
        patient.name?.toLowerCase().includes(searchLower) ||
        patient.phoneNumber?.includes(searchTerm) ||
        patient.whatsappNumber?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.currentCity?.toLowerCase().includes(searchLower) ||
        patient.currentState?.toLowerCase().includes(searchLower)
    );

    return { success: true, data: filteredPatients };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get patients by gender
export const getPatientsByGender = async (gender) => {
  try {
    const result = await getPatients({ gender });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get patients by location
export const getPatientsByLocation = async (city, state) => {
  try {
    const filters = {};
    if (city) filters.city = city;
    if (state) filters.state = state;

    const result = await getPatients(filters);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get patients with health scores
export const getPatientsWithHealthScores = async () => {
  try {
    const result = await getPatients({ hasHealthScore: true });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get recent patients (last 30 days)
export const getRecentPatients = async () => {
  try {
    const result = await getPatients();
    if (!result.success) return result;

    const patients = result.data;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentPatients = patients.filter((patient) => {
      if (!patient.dateOfAccountCreation) return false;
      const registrationDate = new Date(patient.dateOfAccountCreation);
      return registrationDate >= thirtyDaysAgo;
    });

    return { success: true, data: recentPatients };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
