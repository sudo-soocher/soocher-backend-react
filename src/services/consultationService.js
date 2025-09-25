import { db } from "../firebase/config";
import { consultationsCollection } from "../firebase/firestore";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

class ConsultationService {
  constructor() {
    this.collectionName = consultationsCollection;
  }

  // Get all consultations with pagination
  async getAllConsultations(pageSize = 10, lastDoc = null) {
    try {
      const consultationsRef = collection(db, this.collectionName);
      let q = query(
        consultationsRef,
        orderBy("consultationTime", "desc"),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(
          consultationsRef,
          orderBy("consultationTime", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const consultations = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        consultations.push({
          id: doc.id,
          ...doc.data(),
        });
        lastVisible = doc;
      });

      return {
        consultations,
        lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      console.error("Error fetching consultations:", error);
      throw error;
    }
  }

  // Get consultations by status
  async getConsultationsByStatus(status, pageSize = 10, lastDoc = null) {
    try {
      const consultationsRef = collection(db, this.collectionName);
      let q;

      switch (status) {
        case "active":
          q = query(
            consultationsRef,
            where("videoConsultDone", "==", false),
            where("cancelledByDoctor", "==", false),
            orderBy("consultationTime", "desc"),
            limit(pageSize)
          );
          break;
        case "completed":
          q = query(
            consultationsRef,
            where("videoConsultDone", "==", true),
            orderBy("consultationTime", "desc"),
            limit(pageSize)
          );
          break;
        default:
          return this.getAllConsultations(pageSize, lastDoc);
      }

      if (lastDoc) {
        q = query(
          consultationsRef,
          where(
            status === "active" ? "videoConsultDone" : "videoConsultDone",
            "==",
            status === "active" ? false : true
          ),
          orderBy("consultationTime", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const consultations = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        consultations.push({
          id: doc.id,
          ...doc.data(),
        });
        lastVisible = doc;
      });

      return {
        consultations,
        lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      console.error(`Error fetching ${status} consultations:`, error);
      throw error;
    }
  }

  // Get consultation by ID
  async getConsultationById(consultationId) {
    try {
      const consultationRef = doc(db, this.collectionName, consultationId);
      const consultationSnap = await getDoc(consultationRef);

      if (consultationSnap.exists()) {
        return {
          id: consultationSnap.id,
          ...consultationSnap.data(),
        };
      } else {
        throw new Error("Consultation not found");
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
      throw error;
    }
  }

  // Update consultation
  async updateConsultation(consultationId, updateData) {
    try {
      const consultationRef = doc(db, this.collectionName, consultationId);

      // Validate that consultation exists
      const consultationSnap = await getDoc(consultationRef);
      if (!consultationSnap.exists()) {
        throw new Error("Consultation not found");
      }

      // Prepare update data with timestamp
      const updatePayload = {
        ...updateData,
        lastModified: new Date().getTime(),
      };

      // If consultation time is being updated, also update expiration time
      if (updateData.consultationTime) {
        const consultationTime = updateData.consultationTime;

        // Determine expiration time based on doctor specialization
        let expirationMinutes = 15; // Default for most doctors

        // Check if doctor details include specialization
        if (updateData.doctorDetails && updateData.doctorDetails.specialty) {
          const specialty = updateData.doctorDetails.specialty.toLowerCase();
          if (specialty.includes("psychology")) {
            expirationMinutes = 55; // 55 minutes for Psychology doctors
          } else {
            expirationMinutes = 15; // 15 minutes for other doctors
          }
        } else if (updateData.doctorName) {
          // Fallback: check if doctor name suggests psychology (less reliable)
          const doctorName = updateData.doctorName.toLowerCase();
          if (
            doctorName.includes("psychology") ||
            doctorName.includes("psychologist")
          ) {
            expirationMinutes = 55;
          } else {
            expirationMinutes = 15;
          }
        }

        const expirationTime = consultationTime + expirationMinutes * 60 * 1000;
        updatePayload.consultationExpiration = expirationTime;

        // Set chat expiration to consultation expiration + 7 days
        const chatExpirationTime = expirationTime + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        updatePayload.chatExpiration = chatExpirationTime;
      }

      // If doctor is being changed, update participants array
      if (updateData.doctorId && updateData.doctorName) {
        const currentData = consultationSnap.data();
        const currentParticipants = currentData.participants || [];

        // Replace the doctor in participants array (assuming doctor is at index 1)
        if (currentParticipants.length >= 2) {
          currentParticipants[1] = updateData.doctorId;
        } else if (currentParticipants.length === 1) {
          // Only patient exists, add doctor
          currentParticipants.push(updateData.doctorId);
        }

        updatePayload.participants = currentParticipants;
        updatePayload.doctorName = updateData.doctorName;
        updatePayload.doctorDetails =
          updateData.doctorDetails || currentData.doctorDetails;

        // If consultation time exists and doctor is being changed, recalculate expiration
        if (currentData.consultationTime) {
          const consultationTime = currentData.consultationTime;

          // Determine expiration time based on new doctor's specialization
          let expirationMinutes = 15; // Default for most doctors

          if (updateData.doctorDetails && updateData.doctorDetails.specialty) {
            const specialty = updateData.doctorDetails.specialty.toLowerCase();
            if (specialty.includes("psychology")) {
              expirationMinutes = 55; // 55 minutes for Psychology doctors
            }
          } else if (updateData.doctorName) {
            // Fallback: check if doctor name suggests psychology
            const doctorName = updateData.doctorName.toLowerCase();
            if (
              doctorName.includes("psychology") ||
              doctorName.includes("psychologist")
            ) {
              expirationMinutes = 55;
            }
          }

          const expirationTime =
            consultationTime + expirationMinutes * 60 * 1000;
          updatePayload.consultationExpiration = expirationTime;

          // Set chat expiration to consultation expiration + 7 days
          const chatExpirationTime = expirationTime + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
          updatePayload.chatExpiration = chatExpirationTime;
        }
      }

      await updateDoc(consultationRef, updatePayload);

      // Return updated consultation
      const updatedSnap = await getDoc(consultationRef);
      return {
        id: updatedSnap.id,
        ...updatedSnap.data(),
      };
    } catch (error) {
      console.error("Error updating consultation:", error);
      throw error;
    }
  }

  // Get consultations by doctor ID
  async getConsultationsByDoctor(doctorId, pageSize = 10, lastDoc = null) {
    try {
      const consultationsRef = collection(db, this.collectionName);
      let q = query(
        consultationsRef,
        where("participants", "array-contains", doctorId),
        orderBy("consultationTime", "desc"),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(
          consultationsRef,
          where("participants", "array-contains", doctorId),
          orderBy("consultationTime", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const consultations = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        consultations.push({
          id: doc.id,
          ...doc.data(),
        });
        lastVisible = doc;
      });

      return {
        consultations,
        lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      console.error("Error fetching doctor consultations:", error);
      throw error;
    }
  }

  // Get consultations by patient ID
  async getConsultationsByPatient(patientId, pageSize = 10, lastDoc = null) {
    try {
      const consultationsRef = collection(db, this.collectionName);
      let q = query(
        consultationsRef,
        where("participants", "array-contains", patientId),
        orderBy("consultationTime", "desc"),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(
          consultationsRef,
          where("participants", "array-contains", patientId),
          orderBy("consultationTime", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const consultations = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        consultations.push({
          id: doc.id,
          ...doc.data(),
        });
        lastVisible = doc;
      });

      return {
        consultations,
        lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      console.error("Error fetching patient consultations:", error);
      throw error;
    }
  }

  // Get consultations by date
  async getConsultationsByDate(date, pageSize = 10, lastDoc = null) {
    try {
      // Create start and end of day timestamps in epoch millis
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const startOfDayMillis = startOfDay.getTime();

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayMillis = endOfDay.getTime();

      const consultationsRef = collection(db, this.collectionName);
      let q = query(
        consultationsRef,
        where("consultationTime", ">=", startOfDayMillis),
        where("consultationTime", "<=", endOfDayMillis),
        orderBy("consultationTime", "desc"),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(
          consultationsRef,
          where("consultationTime", ">=", startOfDayMillis),
          where("consultationTime", "<=", endOfDayMillis),
          orderBy("consultationTime", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const consultations = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        consultations.push({
          id: doc.id,
          ...doc.data(),
        });
        lastVisible = doc;
      });

      return {
        consultations,
        lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      console.error("Error fetching consultations by date:", error);
      throw error;
    }
  }

  // Get consultations by date and status
  async getConsultationsByDateAndStatus(
    date,
    status,
    pageSize = 10,
    lastDoc = null
  ) {
    try {
      // Create start and end of day timestamps in epoch millis
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const startOfDayMillis = startOfDay.getTime();

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayMillis = endOfDay.getTime();

      const consultationsRef = collection(db, this.collectionName);
      let q;

      // Build query based on status
      switch (status) {
        case "active":
          q = query(
            consultationsRef,
            where("consultationTime", ">=", startOfDayMillis),
            where("consultationTime", "<=", endOfDayMillis),
            where("videoConsultDone", "==", false),
            where("cancelledByDoctor", "==", false),
            orderBy("consultationTime", "desc"),
            limit(pageSize)
          );
          break;
        case "completed":
          q = query(
            consultationsRef,
            where("consultationTime", ">=", startOfDayMillis),
            where("consultationTime", "<=", endOfDayMillis),
            where("videoConsultDone", "==", true),
            orderBy("consultationTime", "desc"),
            limit(pageSize)
          );
          break;
        default:
          return this.getConsultationsByDate(date, pageSize, lastDoc);
      }

      if (lastDoc) {
        const constraints = [
          where("consultationTime", ">=", startOfDayMillis),
          where("consultationTime", "<=", endOfDayMillis),
          orderBy("consultationTime", "desc"),
          startAfter(lastDoc),
          limit(pageSize),
        ];

        if (status === "active") {
          constraints.splice(2, 0, where("videoConsultDone", "==", false));
          constraints.splice(3, 0, where("cancelledByDoctor", "==", false));
        } else if (status === "completed") {
          constraints.splice(2, 0, where("videoConsultDone", "==", true));
        }

        q = query(consultationsRef, ...constraints);
      }

      const snapshot = await getDocs(q);
      const consultations = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        consultations.push({
          id: doc.id,
          ...doc.data(),
        });
        lastVisible = doc;
      });

      return {
        consultations,
        lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      console.error(`Error fetching ${status} consultations by date:`, error);
      throw error;
    }
  }

  // Categorize consultation based on time and actual start/end times
  categorizeConsultation(consultation) {
    const now = new Date().getTime();
    const consultationTime = consultation.consultationTime;
    const consultationExpiration = consultation.consultationExpiration;
    const actualStartTime = consultation.actualStartTime;
    const actualEndTime = consultation.actualEndTime;

    // Check if consultation was successfully completed (both start and end times exist)
    const isSuccessfullyCompleted =
      actualStartTime &&
      actualStartTime !== "" &&
      actualEndTime &&
      actualEndTime !== "";

    // If consultation was cancelled by doctor, it's cancelled regardless of time
    if (consultation.cancelledByDoctor) {
      return "cancelled";
    }

    // If consultation was successfully completed (both actualStartTime and actualEndTime exist)
    if (isSuccessfullyCompleted) {
      return "completed";
    }

    // If consultation was marked as completed in the system (videoConsultDone is true)
    if (consultation.videoConsultDone) {
      return "completed";
    }

    // Check if consultation was abandoned (no actual start/end times and past expiration)
    const isAbandoned =
      (!actualStartTime ||
        actualStartTime === "" ||
        !actualEndTime ||
        actualEndTime === "") &&
      consultationExpiration &&
      now > consultationExpiration;

    if (isAbandoned) {
      return "abandoned";
    }

    // Time-based categorization
    if (now < consultationTime) {
      return "upcoming";
    } else if (now >= consultationTime && now <= consultationExpiration) {
      return "active";
    } else if (now > consultationExpiration) {
      return "past";
    }

    // Default fallback
    return "scheduled";
  }

  // Format consultation data for display
  formatConsultationData(consultation) {
    const formatTime = (timestamp) => {
      if (!timestamp) return "N/A";
      return new Date(timestamp).toLocaleString();
    };

    const getStatus = (consultation) => {
      const category = this.categorizeConsultation(consultation);

      switch (category) {
        case "cancelled":
          return "Cancelled";
        case "completed":
          return "Completed";
        case "abandoned":
          return "Abandoned";
        case "upcoming":
          return "Upcoming";
        case "active":
          if (consultation.doctorInRoom && consultation.patientInRoom) {
            return "In Progress";
          }
          if (consultation.actualStartTime) {
            return "Started";
          }
          return "Active";
        case "past":
          return "Past";
        default:
          return "Scheduled";
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "Completed":
          return "#10B981";
        case "In Progress":
          return "#3B82F6";
        case "Started":
          return "#F59E0B";
        case "Active":
          return "#8B5CF6";
        case "Upcoming":
          return "#06B6D4";
        case "Past":
          return "#6B7280";
        case "Abandoned":
          return "#F97316";
        case "Scheduled":
          return "#6B7280";
        case "Cancelled":
          return "#EF4444";
        default:
          return "#6B7280";
      }
    };

    const status = getStatus(consultation);

    return {
      ...consultation,
      formattedConsultationTime: formatTime(consultation.consultationTime),
      formattedActualStartTime: formatTime(consultation.actualStartTime),
      formattedActualEndTime: formatTime(consultation.actualEndTime),
      status: status,
      statusColor: getStatusColor(status),
      category: this.categorizeConsultation(consultation),
      duration:
        consultation.actualStartTime && consultation.actualEndTime
          ? Math.round(
              (consultation.actualEndTime - consultation.actualStartTime) /
                60000
            ) + " min"
          : "N/A",
    };
  }
}

export default new ConsultationService();
