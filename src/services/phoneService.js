import { auth } from "../firebase/config";
import { db } from "../firebase/config";

/**
 * Fetch phone number from Firebase Auth using Cloud Function
 * @param {string} userId - The user ID (doctor or patient)
 * @returns {Promise<{success: boolean, phoneNumber?: string, error?: string}>}
 */
export const fetchPhoneNumber = async (userId) => {
  try {
    // Get current user to access Firebase Auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // First check if phone number already exists in Firestore
    const { doc, getDoc } = await import("firebase/firestore");
    const userDocRef = doc(db, "Users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    // Check if phone number already exists
    if (userData.phoneNumber || userData.whatsappNumber) {
      return {
        success: true,
        phoneNumber: userData.phoneNumber || userData.whatsappNumber,
        message: "Phone number already exists",
      };
    }

    // Call your Cloud Function to fetch phone number from Firebase Auth
    const response = await fetch(
      "https://asia-southeast1-soocherv2.cloudfunctions.net/onPhoneNumberRequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: userId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cloud Function failed: ${response.status}`);
    }

    const phoneNumber = await response.text();

    if (phoneNumber && phoneNumber !== "null" && phoneNumber !== "undefined") {
      // Update local state with the fetched phone number
      await updatePhoneNumber(userId, phoneNumber);

      return {
        success: true,
        phoneNumber: phoneNumber,
        message: "Phone number fetched successfully from Firebase Auth",
      };
    } else {
      return {
        success: false,
        error:
          "Phone number not available. This user may have signed in with Google/Apple Sign-In or their phone number is not verified in Firebase Auth.",
      };
    }
  } catch (error) {
    console.error("Error fetching phone number:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch phone number",
    };
  }
};

/**
 * Update phone number in Firestore document
 * @param {string} userId - The user ID
 * @param {string} phoneNumber - The phone number to save
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updatePhoneNumber = async (userId, phoneNumber) => {
  try {
    const { doc, updateDoc } = await import("firebase/firestore");

    const userDocRef = doc(db, "Users", userId);
    await updateDoc(userDocRef, {
      phoneNumber: phoneNumber,
      whatsappNumber: phoneNumber,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating phone number:", error);
    return {
      success: false,
      error: error.message || "Failed to update phone number",
    };
  }
};

/**
 * Check if user has phone number in their profile
 * @param {string} userId - The user ID
 * @returns {Promise<{hasPhone: boolean, phoneNumber?: string}>}
 */
export const checkPhoneNumber = async (userId) => {
  try {
    const { doc, getDoc } = await import("firebase/firestore");

    const userDocRef = doc(db, "Users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { hasPhone: false };
    }

    const userData = userDoc.data();
    const phoneNumber = userData.phoneNumber || userData.whatsappNumber;

    return {
      hasPhone: !!phoneNumber,
      phoneNumber: phoneNumber,
    };
  } catch (error) {
    console.error("Error checking phone number:", error);
    return { hasPhone: false };
  }
};
