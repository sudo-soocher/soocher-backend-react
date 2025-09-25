import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  UserX,
  Eye,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Loader2,
  X,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { getCollection, usersCollection } from "../firebase/firestore";
import "./Patients.css";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);

      // Try to get all users first to debug
      const allUsersResult = await getCollection(usersCollection, []);
      console.log(
        "All users in collection:",
        allUsersResult.data?.map((item) => ({
          uid: item.uid,
          type: item.type,
          name: item.name,
          email: item.email,
        }))
      );

      // Now try the filtered query
      const result = await getCollection(usersCollection, [
        { field: "type", operator: "==", value: "PATIENT" },
      ]);

      if (result.success) {
        console.log("Filtered query result:", result.data);
        console.log(
          "Data types found:",
          result.data.map((item) => ({
            uid: item.uid,
            type: item.type,
            name: item.name,
          }))
        );

        // Additional client-side filtering as fallback
        const filteredData = result.data.filter((item) => {
          // Check if it's actually a patient based on the data structure
          const hasPatientFields =
            item.currentCity || item.currentState || item.dob || item.gender;
          const isPatientType =
            item.type === "PATIENT" || item.type === "patient";

          return isPatientType && hasPatientFields;
        });

        console.log("Final filtered patients:", filteredData);
        setPatients(filteredData);
        // Stats will be calculated automatically via memoizedStats
      } else {
        console.error("Error loading patients:", result.error);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Memoized stats calculation
  const memoizedStats = useMemo(() => {
    if (!patients.length) return null;

    const total = patients.length;
    const active = patients.filter(
      (patient) => patient.isActive !== false
    ).length;
    const inactive = patients.filter(
      (patient) => patient.isActive === false
    ).length;
    const newThisMonth = patients.filter((patient) => {
      const createdAt = patient.dateOfAccountCreation
        ? new Date(patient.dateOfAccountCreation)
        : new Date();
      const now = new Date();
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      total,
      active,
      inactive,
      newThisMonth,
    };
  }, [patients]);

  const getDisplayName = useCallback((patient) => {
    return patient.name || patient.email?.split("@")[0] || "Unknown Patient";
  }, []);

  const getStatusBadge = useCallback((patient) => {
    if (patient.isActive === false) {
      return (
        <span className="status-badge inactive">
          <XCircle size={12} />
          Inactive
        </span>
      );
    } else {
      return (
        <span className="status-badge active">
          <CheckCircle size={12} />
          Active
        </span>
      );
    }
  }, []);

  const handleViewDetails = useCallback((patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  }, []);

  const handleRefresh = useCallback(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        getDisplayName(patient)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [patients, searchTerm, getDisplayName]);

  if (loading) {
    return (
      <div className="patients-loading">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="loading-spinner" size={40} />
          <p>Loading patients...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="patients-page">
      {/* Header */}
      <div className="patients-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Patients Management</h1>
            <p>Manage and monitor patient accounts</p>
          </div>
          <div className="header-actions">
            <button className="refresh-button" onClick={handleRefresh}>
              <RotateCcw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {memoizedStats && (
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon total">
              <User size={24} />
            </div>
            <div className="stat-content">
              <h3>{memoizedStats.total}</h3>
              <p>Total Patients</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon active">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{memoizedStats.active}</h3>
              <p>Active Patients</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon inactive">
              <UserX size={24} />
            </div>
            <div className="stat-content">
              <h3>{memoizedStats.inactive}</h3>
              <p>Inactive Patients</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon new">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>{memoizedStats.newThisMonth}</h3>
              <p>New This Month</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search */}
      <div className="search-section">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="patients-content">
        {filteredPatients.length === 0 ? (
          <div className="no-patients">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <User size={48} className="no-patients-icon" />
              <h3>No patients found</h3>
              <p>
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No patients have been registered yet"}
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="patients-grid">
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.uid}
                className="patient-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <div className="patient-header">
                  <div className="patient-avatar">
                    {patient.profileImage ? (
                      <img
                        src={patient.profileImage}
                        alt={getDisplayName(patient)}
                      />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="patient-info">
                    <h3>{getDisplayName(patient)}</h3>
                    <p className="patient-email">{patient.email}</p>
                    {getStatusBadge(patient)}
                  </div>
                  <div className="patient-quick-actions">
                    <button
                      className="quick-action-button view-details"
                      onClick={() => handleViewDetails(patient)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="patient-details">
                  <div className="detail-item">
                    <Phone size={14} />
                    <span>{patient.phoneNumber || "Not provided"}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>
                      {patient.currentCity && patient.currentState
                        ? `${patient.currentCity}, ${patient.currentState}`
                        : "Location not provided"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>
                      Joined:{" "}
                      {patient.dateOfAccountCreation
                        ? new Date(
                            patient.dateOfAccountCreation
                          ).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <AnimatePresence>
        {showDetailsDialog && selectedPatient && (
          <motion.div
            className="details-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsDialog(false)}
          >
            <motion.div
              className="details-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="details-modal-header">
                <h2>Patient Details</h2>
                <button
                  className="close-button"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="details-modal-body">
                <div className="patient-details-grid">
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">
                        {getDisplayName(selectedPatient)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">
                        {selectedPatient.email}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">
                        {selectedPatient.phoneNumber || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Date of Birth:</span>
                      <span className="detail-value">
                        {selectedPatient.dob
                          ? new Date(selectedPatient.dob).toLocaleDateString()
                          : "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Gender:</span>
                      <span className="detail-value">
                        {selectedPatient.gender || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Health Score:</span>
                      <span className="detail-value">
                        {selectedPatient.healthScore !== -1
                          ? selectedPatient.healthScore
                          : "Not available"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Location</h3>
                    <div className="detail-row">
                      <span className="detail-label">City:</span>
                      <span className="detail-value">
                        {selectedPatient.currentCity || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">State:</span>
                      <span className="detail-value">
                        {selectedPatient.currentState || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Coordinates:</span>
                      <span className="detail-value">
                        {selectedPatient.location?.latitude &&
                        selectedPatient.location?.longitude
                          ? `${selectedPatient.location.latitude}, ${selectedPatient.location.longitude}`
                          : "Not available"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Timezone:</span>
                      <span className="detail-value">
                        {selectedPatient.timezone || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Account Information</h3>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        {selectedPatient.isActive !== false
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">
                        {selectedPatient.dateOfAccountCreation
                          ? new Date(
                              selectedPatient.dateOfAccountCreation
                            ).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">WhatsApp Number:</span>
                      <span className="detail-value">
                        {selectedPatient.whatsappNumber || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">FCM Token:</span>
                      <span className="detail-value">
                        {selectedPatient.fcmToken
                          ? "Available"
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;
