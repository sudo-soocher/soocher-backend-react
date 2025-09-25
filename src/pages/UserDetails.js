import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Stethoscope,
  Heart,
  Activity,
  Award,
  GraduationCap,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Edit,
  Settings,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getDocument } from "../firebase/firestore";
import "./UserDetails.css";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDocument("Users", userId);

      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.error || "User not found");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  const getVerificationStatus = (isVerified) => {
    if (isVerified === true) {
      return {
        icon: <CheckCircle className="verified-icon" />,
        text: "Verified",
        color: "#10b981",
      };
    } else if (isVerified === false) {
      return {
        icon: <XCircle className="unverified-icon" />,
        text: "Not Verified",
        color: "#ef4444",
      };
    }
    return {
      icon: <AlertCircle className="pending-icon" />,
      text: "Pending",
      color: "#f59e0b",
    };
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case "doctor":
        return <Stethoscope className="user-type-icon doctor" />;
      case "patient":
        return <Heart className="user-type-icon patient" />;
      default:
        return <User className="user-type-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="user-details-container">
        <div className="user-details-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-details-container">
        <div className="user-details-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
          </div>
        </div>
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <h3>Error Loading User</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchUserDetails}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-details-container">
        <div className="user-details-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
          </div>
        </div>
        <div className="no-data">
          <AlertCircle className="no-data-icon" />
          <h3>User Not Found</h3>
          <p>The requested user could not be found.</p>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus(user.isVerified);
  const userType = user.userType || "user";

  return (
    <div className="user-details-container">
      {/* Header */}
      <div className="user-details-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={handleGoBack}>
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="header-title">
              <h1>User Profile</h1>
              <div className="user-id-header">ID: {user.id || userId}</div>
            </div>
          </div>
          <div className="header-actions">
            <button className="edit-btn">
              <Edit size={16} />
              Edit Profile
            </button>
            <button className="settings-btn">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="user-details-content">
        <motion.div
          className="user-details-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* User Info Header */}
          <div className="user-info-header">
            <div className="user-avatar">{getUserTypeIcon(userType)}</div>
            <div className="user-basic-info">
              <h2>{user.name || user.displayName || "N/A"}</h2>
              <div className="user-type-badge">
                {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </div>
              <div className="verification-status">
                {verificationStatus.icon}
                <span style={{ color: verificationStatus.color }}>
                  {verificationStatus.text}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-section">
            <h3>Contact Information</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <Mail className="contact-icon" />
                <div className="contact-content">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">{user.email || "N/A"}</span>
                </div>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <div className="contact-content">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">
                    {user.phoneNumber || user.phone || "N/A"}
                  </span>
                </div>
              </div>
              {user.address && (
                <div className="contact-item">
                  <MapPin className="contact-icon" />
                  <div className="contact-content">
                    <span className="contact-label">Address</span>
                    <span className="contact-value">{user.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="personal-section">
            <h3>Personal Information</h3>
            <div className="personal-grid">
              {user.dateOfBirth && (
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">
                      {formatDate(user.dateOfBirth)}
                    </span>
                  </div>
                </div>
              )}
              {user.age && (
                <div className="info-item">
                  <Clock className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Age</span>
                    <span className="info-value">{user.age} years old</span>
                  </div>
                </div>
              )}
              {user.gender && (
                <div className="info-item">
                  <User className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{user.gender}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Specific Information */}
          {userType === "doctor" && (
            <div className="doctor-section">
              <h3>Professional Information</h3>
              <div className="doctor-grid">
                {user.specialty && (
                  <div className="info-item">
                    <Activity className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Specialty</span>
                      <span className="info-value">{user.specialty}</span>
                    </div>
                  </div>
                )}
                {user.experience && (
                  <div className="info-item">
                    <Award className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Experience</span>
                      <span className="info-value">
                        {user.experience} years
                      </span>
                    </div>
                  </div>
                )}
                {user.qualification && (
                  <div className="info-item">
                    <GraduationCap className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Qualification</span>
                      <span className="info-value">{user.qualification}</span>
                    </div>
                  </div>
                )}
                {user.licenseNumber && (
                  <div className="info-item">
                    <Shield className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">License Number</span>
                      <span className="info-value">{user.licenseNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Patient Specific Information */}
          {userType === "patient" && (
            <div className="patient-section">
              <h3>Medical Information</h3>
              <div className="patient-grid">
                {user.medicalHistory && (
                  <div className="info-item full-width">
                    <FileText className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Medical History</span>
                      <span className="info-value">{user.medicalHistory}</span>
                    </div>
                  </div>
                )}
                {user.currentMedications && (
                  <div className="info-item full-width">
                    <FileText className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Current Medications</span>
                      <span className="info-value">
                        {user.currentMedications}
                      </span>
                    </div>
                  </div>
                )}
                {user.allergies && (
                  <div className="info-item full-width">
                    <AlertCircle className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Allergies</span>
                      <span className="info-value">{user.allergies}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="account-section">
            <h3>Account Information</h3>
            <div className="account-grid">
              <div className="info-item">
                <Calendar className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Joined</span>
                  <span className="info-value">
                    {formatDateTime(user.createdAt)}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Clock className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">
                    {formatDateTime(user.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Shield className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Account Status</span>
                  <span className="info-value">
                    {user.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDetails;
