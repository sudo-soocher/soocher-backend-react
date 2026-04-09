/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Cloud Functions for sending notifications


import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Cloud Function to send push notifications to all devices
 * Supports targeting: 'all', 'doctors', or 'patients'
 */
export const sendNotificationToAll = functions.https.onRequest(
  async (req, res) => {
    // CORS handling
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    try {
      const {title, message, target = "all", data = {}} = req.body;

      // Validate input
      if (!title || !message) {
        res.status(400).json({error: "Title and message are required"});
        return;
      }

      const db = admin.firestore();
      let tokens: string[] = [];

      // Get FCM tokens based on target
      // Note: Firestore doesn't support multiple where clauses with != null
      // So we fetch and filter client-side
      if (target === "all") {
        // Get all users with FCM tokens
        const usersSnapshot = await db
          .collection("Users")
          .where("fcmToken", "!=", null)
          .get();

        usersSnapshot.forEach((doc) => {
          const fcmToken = doc.data().fcmToken;
          if (fcmToken && fcmToken.trim() !== "") {
            tokens.push(fcmToken);
          }
        });
      } else if (target === "doctors") {
        // Get only doctors with FCM tokens
        const doctorsSnapshot = await db
          .collection("Users")
          .where("type", "==", "DOCTOR")
          .get();

        doctorsSnapshot.forEach((doc) => {
          const userData = doc.data();
          const fcmToken = userData.fcmToken;
          if (fcmToken && fcmToken.trim() !== "") {
            tokens.push(fcmToken);
          }
        });
      } else if (target === "patients") {
        // Get only patients with FCM tokens
        const patientsSnapshot = await db
          .collection("Users")
          .where("type", "==", "PATIENT")
          .get();

        patientsSnapshot.forEach((doc) => {
          const userData = doc.data();
          const fcmToken = userData.fcmToken;
          if (fcmToken && fcmToken.trim() !== "") {
            tokens.push(fcmToken);
          }
        });
      }

      // Remove duplicates
      tokens = [...new Set(tokens)];

      if (tokens.length === 0) {
        res.status(200).json({
          success: true,
          message: "No devices found with FCM tokens",
          recipientsCount: 0,
          totalTokens: 0,
          successCount: 0,
          failureCount: 0,
        });
        return;
      }

      // Send notifications in batches (FCM allows up to 500 tokens per batch)
      const batchSize = 500;
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);

        const messagePayload = {
          notification: {
            title: title,
            body: message,
          },
          data: {
            ...data,
            type: "broadcast",
            target: target,
          },
          tokens: batch,
        };

        try {
          const response = await admin.messaging()
            .sendEachForMulticast(messagePayload);
          successCount += response.successCount;
          failureCount += response.failureCount;

          // Handle failed tokens (optional: log for debugging)
          if (response.failureCount > 0) {
            response.responses.forEach(
              (resp: admin.messaging.SendResponse, idx: number) => {
                if (!resp.success) {
                  console.error(
                    `Failed to send to token ${batch[idx]}:`,
                    resp.error
                  );
                }
              }
            );
          }
        } catch (error: unknown) {
          console.error("Error sending batch:", error);
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
    } catch (error: unknown) {
      console.error("Error in sendNotificationToAll:", error);
      const errorMessage = error instanceof Error ?
        error.message : "Failed to send notification";
      res.status(500).json({
        error: errorMessage,
      });
    }
  }
);

/**
 * Cloud Function to send push notifications to specific user IDs
 * Fetches FCM tokens from Users collection and sends notifications
 */
export const sendNotificationToUserIds = functions.https.onRequest(
  async (req, res) => {
    // CORS handling
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    try {
      const {userIds, title, message, data = {}} = req.body;

      // Validate input
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({error: "userIds array is required"});
        return;
      }

      if (!title || !message) {
        res.status(400).json({error: "Title and message are required"});
        return;
      }

      const db = admin.firestore();
      const tokens: string[] = [];
      const userTokenMap: {[key: string]: string} = {};

      // Fetch FCM tokens for each user ID
      for (const userId of userIds) {
        try {
          const userDoc = await db.collection("Users").doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            const fcmToken = userData?.fcmToken;
            if (fcmToken && fcmToken.trim() !== "") {
              tokens.push(fcmToken);
              userTokenMap[userId] = fcmToken;
            }
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
        }
      }

      if (tokens.length === 0) {
        res.status(200).json({
          success: true,
          message: "No devices found with FCM tokens for the specified users",
          recipientsCount: 0,
          totalTokens: 0,
          successCount: 0,
          failureCount: 0,
        });
        return;
      }

      // Send notifications
      let successCount = 0;
      let failureCount = 0;

      const messagePayload = {
        notification: {
          title: title,
          body: message,
        },
        data: {
          ...data,
          type: "booking",
        },
        tokens: tokens,
      };

      try {
        const response = await admin.messaging()
          .sendEachForMulticast(messagePayload);
        successCount = response.successCount;
        failureCount = response.failureCount;

        // Log failed tokens
        if (response.failureCount > 0) {
          response.responses.forEach(
            (resp: admin.messaging.SendResponse, idx: number) => {
              if (!resp.success) {
                console.error(
                  `Failed to send to token ${tokens[idx]}:`,
                  resp.error
                );
              }
            }
          );
        }
      } catch (error: unknown) {
        console.error("Error sending notifications:", error);
        failureCount = tokens.length;
      }

      res.status(200).json({
        success: true,
        message: `Notification sent to ${successCount} device(s)`,
        recipientsCount: successCount,
        totalTokens: tokens.length,
        successCount,
        failureCount,
      });
    } catch (error: unknown) {
      console.error("Error in sendNotificationToUserIds:", error);
      const errorMessage = error instanceof Error ?
        error.message : "Failed to send notification";
      res.status(500).json({
        error: errorMessage,
      });
    }
  }
);

/**
 * Cloud Function to send booking confirmation notifications
 * Sends personalized notifications to both patient and doctor
 */
export const sendBookingNotifications = functions.https.onRequest(
  async (req, res) => {
    // CORS handling
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    try {
      const {
        patientId,
        patientName,
        doctorId,
        doctorName,
        consultationTime,
        consultationId,
      } = req.body;

      // Validate input
      if (!patientId || !doctorId || !consultationTime) {
        res.status(400).json({
          error: "patientId, doctorId, and consultationTime are required",
        });
        return;
      }

      const db = admin.firestore();
      const results = {
        patient: {success: false, error: null as string | null},
        doctor: {success: false, error: null as string | null},
      };

      // Format date and time
      const dateObj = new Date(consultationTime);
      const dateStr = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Send notification to patient
      try {
        const patientDoc = await db.collection("Users").doc(patientId).get();
        if (patientDoc.exists) {
          const patientData = patientDoc.data();
          const fcmToken = patientData?.fcmToken;

          if (fcmToken && fcmToken.trim() !== "") {
            const patientBody = "Your appointment with Dr. " +
              (doctorName || "your doctor") + " on " + dateStr +
              " at " + timeStr + " is confirmed.";
            const patientMessage = {
              notification: {
                title: "Appointment Confirmed",
                body: patientBody,
              },
              data: {
                type: "booking_confirmed",
                consultationId: consultationId || "",
                doctorId: doctorId,
                consultationTime: String(consultationTime),
              },
              token: fcmToken,
            };

            await admin.messaging().send(patientMessage);
            results.patient.success = true;
          } else {
            results.patient.error = "No FCM token found for patient";
          }
        } else {
          results.patient.error = "Patient not found";
        }
      } catch (err: unknown) {
        console.error("Error sending to patient:", err);
        results.patient.error = err instanceof Error ?
          err.message : "Failed to send to patient";
      }

      // Send notification to doctor
      try {
        const doctorDoc = await db.collection("Users").doc(doctorId).get();
        if (doctorDoc.exists) {
          const doctorData = doctorDoc.data();
          const fcmToken = doctorData?.fcmToken;

          if (fcmToken && fcmToken.trim() !== "") {
            const doctorBody = "New appointment booked with " +
              (patientName || "a patient") + " on " + dateStr +
              " at " + timeStr + ".";
            const doctorMessage = {
              notification: {
                title: "New Appointment",
                body: doctorBody,
              },
              data: {
                type: "new_booking",
                consultationId: consultationId || "",
                patientId: patientId,
                consultationTime: String(consultationTime),
              },
              token: fcmToken,
            };

            await admin.messaging().send(doctorMessage);
            results.doctor.success = true;
          } else {
            results.doctor.error = "No FCM token found for doctor";
          }
        } else {
          results.doctor.error = "Doctor not found";
        }
      } catch (err: unknown) {
        console.error("Error sending to doctor:", err);
        results.doctor.error = err instanceof Error ?
          err.message : "Failed to send to doctor";
      }

      res.status(200).json({
        success: results.patient.success || results.doctor.success,
        message: "Booking notifications processed",
        results,
      });
    } catch (error: unknown) {
      console.error("Error in sendBookingNotifications:", error);
      const errorMessage = error instanceof Error ?
        error.message : "Failed to send booking notifications";
      res.status(500).json({
        error: errorMessage,
      });
    }
  }
);

/**
 * Flexible Common Cloud Function to send various notifications
 * Supports predefined types: booking_confirmed, booking_cancelled, ...
 */
/**
 * Flexible Common Cloud Function to send various notifications
 */
export const sendNotification = functions.https.onRequest(
  {region: "asia-southeast1", cors: true},
  async (req: any, res: any) => {
    try {
      const {
        notificationType = "custom",
        patientId, doctorId, userIds = [],
        title, body, patientName, doctorName,
        consultationTime, consultationId,
        additionalData = {},
      } = req.body;

      if (!patientId && !doctorId && (!userIds || userIds.length === 0)) {
        res.status(400).json({error: "At least one recipient is required"});
        return;
      }

      const db = admin.firestore();
      let pTitle = title;
      let pBody = body;
      let dTitle = title;
      let dBody = body;

      if (consultationTime) {
        const d = new Date(consultationTime);
        const dStr = d.toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric",
        });
        const tStr = d.toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", hour12: true,
        });

        if (notificationType === "booking_confirmed") {
          pTitle = "Appointment Confirmed";
          pBody = `Your appointment with Dr. ${doctorName || "your doctor"}` +
            ` on ${dStr} at ${tStr} is confirmed.`;
          dTitle = "New Appointment";
          dBody = `New appointment booked with ${patientName || "a patient"}` +
            ` on ${dStr} at ${tStr}.`;
        } else if (notificationType === "booking_cancelled") {
          pTitle = "Appointment Cancelled";
          pBody = `Your appointment with Dr. ${doctorName || "your doctor"}` +
            ` on ${dStr} at ${tStr} has been cancelled.`;
          dTitle = "Appointment Cancelled";
          dBody = `Appointment with ${patientName || "a patient"}` +
            ` on ${dStr} at ${tStr} has been cancelled.`;
        } else if (notificationType === "booking_rescheduled") {
          pTitle = "Appointment Rescheduled";
          pBody = `Your appointment with Dr. ${doctorName || "your doctor"}` +
            ` has been rescheduled to ${dStr} at ${tStr}.`;
          dTitle = "Appointment Rescheduled";
          dBody = `Appointment with ${patientName || "a patient"}` +
            ` has been rescheduled to ${dStr} at ${tStr}.`;
        }
      }

      if (!pTitle || !pBody) {
        if (notificationType === "custom") {
          res.status(400).json({error: "Title and body are required"});
          return;
        }
      }

      const results = {successCount: 0, failureCount: 0, details: [] as any[]};

      const sendToUser = async (uid: string, t: string, b: string) => {
        try {
          const userDoc = await db.collection("Users").doc(uid).get();
          const fcmToken = userDoc.data()?.fcmToken;
          if (fcmToken && fcmToken.trim() !== "") {
            await admin.messaging().send({
              notification: {title: t, body: b},
              data: {
                ...additionalData,
                notificationType,
                consultationId: consultationId || "",
                consultationTime: consultationTime ?
                  String(consultationTime) : "",
              },
              token: fcmToken,
            });
            results.successCount++;
            results.details.push({uid, success: true});
          } else {
            results.failureCount++;
            results.details.push({uid, success: false, error: "No FCM token"});
          }
        } catch (err: unknown) {
          results.failureCount++;
          const msg = err instanceof Error ? err.message : "FCM Error";
          results.details.push({uid, success: false, error: msg});
        }
      };

      if (patientId) await sendToUser(patientId, pTitle, pBody);
      if (doctorId) await sendToUser(doctorId, dTitle, dBody);

      for (const uid of userIds) {
        if (uid !== patientId && uid !== doctorId) {
          await sendToUser(uid, title || pTitle, body || pBody);
        }
      }

      res.status(200).json({
        success: results.successCount > 0,
        message: `Processed ${results.successCount + results.failureCount}`,
        results,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal Error";
      res.status(500).json({error: msg});
    }
  }
);
