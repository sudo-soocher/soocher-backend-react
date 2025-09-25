import { db } from "../firebase/config";
import { collection, getDocs, where, query, limit } from "firebase/firestore";

export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");

    // Test 1: Try to get any documents from Users collection
    const usersRef = collection(db, "Users");
    const snapshot = await getDocs(usersRef);

    console.log("Total documents in Users collection:", snapshot.size);

    if (snapshot.empty) {
      console.log("No documents found in Users collection");
      return { success: false, error: "No documents found" };
    }

    // Test 2: Try to get documents with type filter
    const doctorsQuery = query(
      usersRef,
      where("type", "==", "DOCTOR"),
      limit(5)
    );
    const doctorsSnapshot = await getDocs(doctorsQuery);

    console.log("Doctors found:", doctorsSnapshot.size);

    const doctors = [];
    doctorsSnapshot.forEach((doc) => {
      doctors.push({ id: doc.id, ...doc.data() });
    });

    console.log("Sample doctors:", doctors);

    // Test 3: Try to get patients
    const patientsQuery = query(
      usersRef,
      where("type", "==", "PATIENT"),
      limit(5)
    );
    const patientsSnapshot = await getDocs(patientsQuery);

    console.log("Patients found:", patientsSnapshot.size);

    const patients = [];
    patientsSnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });

    console.log("Sample patients:", patients);

    return {
      success: true,
      data: {
        totalUsers: snapshot.size,
        doctors: doctors.length,
        patients: patients.length,
        sampleDoctors: doctors,
        samplePatients: patients,
      },
    };
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return { success: false, error: error.message };
  }
};
