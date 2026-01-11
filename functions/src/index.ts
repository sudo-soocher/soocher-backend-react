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
