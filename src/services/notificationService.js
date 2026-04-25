/**
 * Notification Service
 * Handles sending push notifications to devices via Firebase Cloud Messaging
 * and managing notification history in Firestore
 */

import { createDocument, updateDocument, getCollection } from "../firebase/firestore";
import { orderBy, limit } from "firebase/firestore";

/**
 * Send notification to all devices
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} target - Target audience: 'all', 'doctors', 'patients'
 * @param {object} data - Additional data payload (optional)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const sendNotificationToAll = async (title, message, target = 'all', data = {}) => {
  try {
    // Call Cloud Function to send notifications
    // This assumes you have a Cloud Function set up to handle FCM notifications
    const cloudFunctionUrl = "https://asia-southeast1-soocherv2.cloudfunctions.net/sendNotificationToAll";
    
    const response = await fetch(cloudFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        message,
        target, // 'all', 'doctors', 'patients'
        data,
      }),
    }).catch((fetchError) => {
      console.error("--- NOTIFICATION ALL DEBUG START ---");
      console.error("URL:", cloudFunctionUrl);
      console.error("Payload:", { title, message, target, data });
      console.error("Error Message:", fetchError.message);
      console.error("--- NOTIFICATION ALL DEBUG END ---");
      throw new Error(
        `Failed to connect to Cloud Function. Please ensure the function 'sendNotificationToAll' is deployed. ` +
        `Error: ${fetchError.message || 'Network request failed'}`
      );
    });

    if (!response.ok) {
      let errorMessage = `Cloud Function returned status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
        const text = await response.text().catch(() => '');
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || "Notification sent successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || "Failed to send notification";
    
    if (error.message && error.message.includes("Failed to fetch")) {
      errorMessage = 
        "Cloud Function is not accessible. Please ensure:\n" +
        "1. The Cloud Function 'sendNotificationToAll' is deployed\n" +
        "2. CORS is properly configured in the Cloud Function\n" +
        "3. Check Firebase Console → Functions for deployment status";
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Send notification to specific users by their FCM tokens
 * @param {Array<string>} fcmTokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data payload (optional)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const sendNotificationToTokens = async (fcmTokens, title, message, data = {}) => {
  try {
    const response = await fetch(
      "https://asia-southeast1-soocherv2.cloudfunctions.net/sendNotificationToTokens",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fcmTokens,
          title,
          message,
          data,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Cloud Function failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || "Notification sent successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
};

/**
 * Save notification to Firestore for history tracking
 * @param {object} notificationData - Notification data to save
 * @param {boolean} isUpdate - Whether this is an update to existing notification
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const saveNotificationToFirestore = async (notificationData, isUpdate = false) => {
  try {
    if (isUpdate && notificationData.id) {
      // Update existing notification
      const { id, ...updateData } = notificationData;
      const result = await updateDocument("notifications", id, {
        ...updateData,
        updatedAt: new Date(),
      });
      
      if (result.success) {
        return { success: true, id };
      } else {
        return { success: false, error: result.error };
      }
    } else {
      // Create new notification
      const result = await createDocument("notifications", {
        title: notificationData.title,
        message: notificationData.message,
        target: notificationData.target || "all",
        status: notificationData.status || "pending",
        recipientsCount: notificationData.recipientsCount || 0,
        error: notificationData.error || null,
        sentAt: notificationData.sentAt || null,
        createdAt: new Date(),
      });

      if (result.success) {
        return { success: true, id: result.id };
      } else {
        return { success: false, error: result.error };
      }
    }
  } catch (error) {
    console.error("Error saving notification to Firestore:", error);
    return {
      success: false,
      error: error.message || "Failed to save notification",
    };
  }
};

/**
 * Get notification history from Firestore
 * @param {number} limitCount - Maximum number of notifications to retrieve
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getNotificationHistory = async (limitCount = 50) => {
  try {
    const result = await getCollection("notifications", [
      orderBy("createdAt", "desc"),
      limit(limitCount),
    ]);

    if (result.success) {
      return {
        success: true,
        data: result.data || [],
      };
    } else {
      return {
        success: false,
        error: result.error,
        data: [],
      };
    }
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch notification history",
      data: [],
    };
  }
};

/**
 * Send booking confirmation notifications to patient and doctor
 * Patient receives: "Your appointment with Dr. {Doctor Name} on {Date} at {Time} is confirmed."
 * Doctor receives: "New appointment booked with {Patient Name} on {Date} at {Time}."
 * 
 * @param {object} bookingData - Booking information
 * @param {string} bookingData.patientId - Patient's user ID
 * @param {string} bookingData.patientName - Patient's name
 * @param {string} bookingData.doctorId - Doctor's user ID
 * @param {string} bookingData.doctorName - Doctor's name
 * @param {number} bookingData.consultationTime - Consultation time in milliseconds
 * @param {string} bookingData.consultationId - Consultation ID (optional)
 * @returns {Promise<{success: boolean, message?: string, error?: string, results?: object}>}
 */
export const sendBookingNotifications = async (bookingData) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      doctorName,
      consultationTime,
      consultationId,
    } = bookingData;

    // Validate required fields
    if (!patientId || !doctorId || !consultationTime) {
      return {
        success: false,
        error: "patientId, doctorId, and consultationTime are required",
      };
    }
    
    const cloudFunctionUrl = "https://asia-southeast1-soocherv2.cloudfunctions.net/sendBookingNotifications";
    const response = await fetch(cloudFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId,
        patientName: patientName || "Patient",
        doctorId,
        doctorName: doctorName || "Doctor",
        consultationTime,
        consultationId: consultationId || "",
      }),
    }).catch((fetchError) => {
      console.error("Network error calling sendBookingNotifications:", fetchError);
      throw new Error(
        `Failed to connect to Cloud Function. Error: ${fetchError.message || 'Network request failed'}`
      );
    });

    if (!response.ok) {
      let errorMessage = `Cloud Function returned status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        const text = await response.text().catch(() => '');
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }    const result = await response.json();

    return {
      success: result.success,
      message: result.message || "Booking notifications sent",
      results: result.results,
    };
  } catch (error) {
    console.error("Error sending booking notifications:", error);
    return {
      success: false,
      error: error.message || "Failed to send booking notifications",
    };
  }
};

/**
 * Send notification to specific user IDs
 * @param {Array<string>} userIds - Array of user IDs to send notification to
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data payload (optional)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const sendNotificationToUserIds = async (userIds, title, message, data = {}) => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        error: "userIds array is required",
      };
    }

    if (!title || !message) {
      return {
        success: false,
        error: "Title and message are required",
      };
    }

    const cloudFunctionUrl = "https://asia-southeast1-soocherv2.cloudfunctions.net/sendNotificationToUserIds";

    const response = await fetch(cloudFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userIds,
        title,
        message,
        data,
      }),
    }).catch((fetchError) => {
      console.error("--- NOTIFICATION DEBUG START ---");
      console.error("URL:", cloudFunctionUrl);
      console.error("Payload:", { userIds, title, message, data });
      console.error("Error Message:", fetchError.message);
      console.error("Error Stack:", fetchError.stack);
      console.error("--- NOTIFICATION DEBUG END ---");
      throw new Error(
        `Failed to connect to Cloud Function. Error: ${fetchError.message || 'Network request failed'}`
      );
    });

    if (!response.ok) {
      let errorMessage = `Cloud Function returned status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        const text = await response.text().catch(() => '');
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || "Notification sent successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error sending notification to user IDs:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
};

/**
 * Common function to send any type of notification
 * @param {object} data - Notification data
 * @param {string} data.notificationType - 'booking_confirmed', 'booking_cancelled', 'booking_rescheduled', or 'custom'
 * @param {string} [data.patientId] - Patient User ID
 * @param {string} [data.doctorId] - Doctor User ID
 * @param {Array<string>} [data.userIds] - Additional User IDs
 * @param {string} [data.title] - Custom title (required if notificationType is 'custom')
 * @param {string} [data.body] - Custom body (required if notificationType is 'custom')
 * @param {number} [data.consultationTime] - Consultation time in epoch millis
 * @param {string} [data.consultationId] - Consultation ID
 * @param {string} [data.patientName] - Patient name for templates
 * @param {string} [data.doctorName] - Doctor name for templates
 * @param {object} [data.additionalData] - Extra data payload
 */
export const sendNotification = async (data) => {
  try {
    const cloudFunctionUrl = "https://asia-southeast1-soocherv2.cloudfunctions.net/sendNotification";
    
    const response = await fetch(cloudFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Cloud Function failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling sendNotification:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
};