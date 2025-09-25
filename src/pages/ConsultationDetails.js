import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Copy,
  ExternalLink,
  Mail,
  Phone as PhoneIcon,
  Stethoscope,
  Heart,
  Activity,
  RefreshCw,
  Eye,
  Edit,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import consultationService from "../services/consultationService";
import "./ConsultationDetails.css";

const ConsultationDetails = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (consultationId) {
      fetchConsultationDetails();
    }
  }, [consultationId]);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const detailedData = await consultationService.getConsultationById(
        consultationId
      );
      const formattedData =
        consultationService.formatConsultationData(detailedData);
      setConsultation(formattedData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching consultation details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async (consultationId) => {
    try {
      await navigator.clipboard.writeText(consultationId);
      setCopiedId(consultationId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy consultation ID:", err);
    }
  };

  const handleGoBack = () => {
    navigate("/consultations");
  };

  const handleViewPatientProfile = () => {
    if (consultation?.participants && consultation.participants.length > 0) {
      const patientUid = consultation.participants[0];
      navigate(`/users/${patientUid}`);
    }
  };

  const handleViewDoctorProfile = () => {
    if (consultation?.participants && consultation.participants.length > 1) {
      const doctorUid = consultation.participants[1];
      navigate(`/users/${doctorUid}`);
    }
  };

  const handleEditConsultation = () => {
    navigate(`/consultations/${consultationId}/edit`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="status-icon completed" />;
      case "In Progress":
        return <Play className="status-icon in-progress" />;
      case "Started":
        return <Pause className="status-icon started" />;
      case "Scheduled":
        return <Clock className="status-icon scheduled" />;
      case "Cancelled":
        return <XCircle className="status-icon cancelled" />;
      default:
        return <AlertCircle className="status-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="consultation-details-container">
        <div className="consultation-details-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back to Consultations
              </button>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading consultation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consultation-details-container">
        <div className="consultation-details-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back to Consultations
              </button>
            </div>
          </div>
        </div>
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <h3>Error Loading Consultation</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchConsultationDetails}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="consultation-details-container">
        <div className="consultation-details-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back to Consultations
              </button>
            </div>
          </div>
        </div>
        <div className="no-data">
          <AlertCircle className="no-data-icon" />
          <h3>Consultation Not Found</h3>
          <p>The requested consultation could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-details-container">
      {/* Header */}
      <div className="consultation-details-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={handleGoBack}>
              <ArrowLeft size={20} />
              Back to Consultations
            </button>
            <div className="header-title">
              <h1>Consultation Details</h1>
              <div className="consultation-id-header">
                #{consultation.consultationId?.slice(-8) || "N/A"}
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="edit-btn"
              onClick={handleEditConsultation}
              disabled={
                consultation?.status === "Completed" ||
                consultation?.status === "Cancelled"
              }
              title="Edit Consultation"
            >
              <Edit size={16} />
              Edit
            </button>
            {consultation.consultationId && (
              <button
                className={`copy-id-btn ${copiedId ? "copied" : ""}`}
                onClick={() => handleCopyId(consultation.consultationId)}
                title="Copy Consultation ID"
              >
                <Copy size={16} />
                {copiedId ? "Copied!" : "Copy ID"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="consultation-details-content">
        <motion.div
          className="consultation-details-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Status */}
          <div className="status-section">
            <div className="status-info">
              <div className="status-badge">
                {getStatusIcon(consultation.status)}
                <span
                  className="status-text"
                  style={{ color: consultation.statusColor }}
                >
                  {consultation.status}
                </span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="participants-section">
            <h2>Participants</h2>
            <div className="participants-grid">
              <div className="participant-card">
                <div className="participant-header">
                  <User className="participant-icon" />
                  <span className="participant-label">Patient</span>
                </div>
                <div className="participant-details">
                  <div className="participant-name">
                    {consultation.patientName || "N/A"}
                  </div>
                  {consultation.patientDetails && (
                    <div className="participant-info">
                      {consultation.patientDetails.email && (
                        <div className="info-item">
                          <Mail size={14} />
                          <span>{consultation.patientDetails.email}</span>
                        </div>
                      )}
                      {consultation.patientDetails.phone && (
                        <div className="info-item">
                          <PhoneIcon size={14} />
                          <span>{consultation.patientDetails.phone}</span>
                        </div>
                      )}
                      {consultation.patientDetails.age && (
                        <div className="info-item">
                          <Heart size={14} />
                          <span>
                            {consultation.patientDetails.age} years old
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="participant-actions">
                    <button
                      className="view-profile-btn"
                      onClick={handleViewPatientProfile}
                      disabled={
                        !consultation?.participants ||
                        consultation.participants.length === 0
                      }
                    >
                      <Eye size={16} />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="participant-card">
                <div className="participant-header">
                  <Stethoscope className="participant-icon" />
                  <span className="participant-label">Doctor</span>
                </div>
                <div className="participant-details">
                  <div className="participant-name">
                    {consultation.doctorName || "N/A"}
                  </div>
                  {consultation.doctorDetails && (
                    <div className="participant-info">
                      {consultation.doctorDetails.specialty && (
                        <div className="info-item">
                          <Activity size={14} />
                          <span>{consultation.doctorDetails.specialty}</span>
                        </div>
                      )}
                      {consultation.doctorDetails.experience && (
                        <div className="info-item">
                          <Clock size={14} />
                          <span>
                            {consultation.doctorDetails.experience} years
                            experience
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="participant-actions">
                    <button
                      className="view-profile-btn"
                      onClick={handleViewDoctorProfile}
                      disabled={
                        !consultation?.participants ||
                        consultation.participants.length < 2
                      }
                    >
                      <Eye size={16} />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="schedule-section">
            <h2>Schedule Information</h2>
            <div className="schedule-grid">
              <div className="schedule-item">
                <Calendar className="schedule-icon" />
                <div className="schedule-content">
                  <span className="schedule-label">Scheduled Time</span>
                  <span className="schedule-value">
                    {consultation.formattedConsultationTime}
                  </span>
                </div>
              </div>

              {consultation.actualStartTime && (
                <div className="schedule-item">
                  <Play className="schedule-icon" />
                  <div className="schedule-content">
                    <span className="schedule-label">Started At</span>
                    <span className="schedule-value">
                      {consultation.formattedActualStartTime}
                    </span>
                  </div>
                </div>
              )}

              {consultation.actualEndTime && (
                <div className="schedule-item">
                  <CheckCircle className="schedule-icon" />
                  <div className="schedule-content">
                    <span className="schedule-label">Ended At</span>
                    <span className="schedule-value">
                      {consultation.formattedActualEndTime}
                    </span>
                  </div>
                </div>
              )}

              <div className="schedule-item">
                <Clock className="schedule-icon" />
                <div className="schedule-content">
                  <span className="schedule-label">Duration</span>
                  <span className="schedule-value">
                    {consultation.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Notes */}
          {consultation.patientDetails?.notesForDoctor && (
            <div className="notes-section">
              <h2>Patient Notes</h2>
              <div className="notes-content">
                <MessageSquare className="notes-icon" />
                <p>{consultation.patientDetails.notesForDoctor}</p>
              </div>
            </div>
          )}

          {/* Consultation Details */}
          <div className="consultation-info-section">
            <h2>Consultation Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Consultation ID</span>
                <span className="info-value">
                  {consultation.consultationId || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Room Status</span>
                <span className="info-value">
                  {consultation.doctorInRoom && consultation.patientInRoom
                    ? "Both participants in room"
                    : consultation.doctorInRoom
                    ? "Doctor in room"
                    : consultation.patientInRoom
                    ? "Patient in room"
                    : "Waiting for participants"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Cancelled by Doctor</span>
                <span className="info-value">
                  {consultation.cancelledByDoctor ? "Yes" : "No"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Video Consult Done</span>
                <span className="info-value">
                  {consultation.videoConsultDone ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {consultation.patientDetails && (
            <div className="additional-info-section">
              <h2>Additional Information</h2>
              <div className="additional-info-grid">
                {consultation.patientDetails.medicalHistory && (
                  <div className="info-item">
                    <span className="info-label">Medical History</span>
                    <span className="info-value">
                      {consultation.patientDetails.medicalHistory}
                    </span>
                  </div>
                )}
                {consultation.patientDetails.currentMedications && (
                  <div className="info-item">
                    <span className="info-label">Current Medications</span>
                    <span className="info-value">
                      {consultation.patientDetails.currentMedications}
                    </span>
                  </div>
                )}
                {consultation.patientDetails.allergies && (
                  <div className="info-item">
                    <span className="info-label">Allergies</span>
                    <span className="info-value">
                      {consultation.patientDetails.allergies}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ConsultationDetails;
