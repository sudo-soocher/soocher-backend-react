import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Edit3,
  CalendarDays,
  Stethoscope,
  Clock,
  User,
  Loader2,
  RefreshCw,
  Calendar,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DateTimePicker from "../components/common/DateTimePicker";
import DoctorSearchDropdown from "../components/consultations/DoctorSearchDropdown";
import consultationService from "../services/consultationService";
import { getDoctors } from "../services/doctorService";
import "./EditConsultation.css";

// Helper function to format doctor name with Dr. prefix
const formatDoctorName = (name, specialization) => {
  if (!name) return "N/A";

  // Don't add Dr. prefix for Psychology specialty
  if (specialization && specialization.toLowerCase().includes("psychology")) {
    return name;
  }

  // Add Dr. prefix for all other specializations (case-insensitive check)
  const nameLower = name.toLowerCase();
  if (nameLower.startsWith("dr. ") || nameLower.startsWith("dr ")) {
    return name;
  }
  return `Dr. ${name}`;
};

const EditConsultation = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookedTimes, setBookedTimes] = useState([]); // Store booked timeslots
  const [formData, setFormData] = useState({
    consultationTime: null,
    doctorId: "",
    doctorName: "",
    doctorDetails: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (consultationId) {
      fetchConsultationDetails();
      loadDoctors();
    }
  }, [consultationId]);

  // Load booked consultations for a specific date (excluding current consultation)
  const loadBookedTimes = async (date) => {
    if (!date) return;
    
    try {
      const result = await consultationService.getConsultationsByDate(date, 100);
      if (result && result.consultations) {
        // Extract consultation times, excluding the current consultation being edited
        const times = result.consultations
          .filter(c => {
            // Exclude current consultation being edited
            if (c.id === consultationId) return false;
            // Only exclude if explicitly cancelled
            const isCancelled = c.cancelledByDoctor === true || c.cancelledByPatient === true;
            return !isCancelled;
          })
          .map(c => {
            const time = new Date(c.consultationTime);
            return time;
          })
          .filter(t => !isNaN(t.getTime()));
        
        setBookedTimes(times);
      }
    } catch (error) {
      console.error("Error loading booked times:", error);
    }
  };

  // Handle date change from DateTimePicker
  const handleDatePickerDateChange = (date) => {
    if (date && date instanceof Date && !isNaN(date.getTime())) {
      loadBookedTimes(date);
    }
  };

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

      // Initialize form data
      const consultationTime = formattedData.consultationTime
        ? new Date(formattedData.consultationTime)
        : null;

      setFormData({
        consultationTime,
        doctorId: formattedData.participants?.[1] || "",
        doctorName: formattedData.doctorName || "",
        doctorDetails: formattedData.doctorDetails || null,
      });
      
      // Load booked times for the consultation date
      if (consultationTime) {
        loadBookedTimes(consultationTime);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching consultation details:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const result = await getDoctors();
      if (result.success) {
        setDoctors(result.data || []);
      } else {
        console.error("Failed to load doctors:", result.error);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleDoctorSelect = (selectedDoctor) => {
    if (selectedDoctor) {
      setFormData((prev) => ({
        ...prev,
        doctorId: selectedDoctor.uid,
        doctorName: selectedDoctor.name,
        doctorDetails: {
          specialty: selectedDoctor.specialization,
          experience: selectedDoctor.numExp,
          worksAt: selectedDoctor.worksAt,
          profileImage: selectedDoctor.profileImage,
        },
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.consultationTime) {
      newErrors.consultationTime = "Consultation time is required";
    } else {
      const selectedTime = formData.consultationTime.getTime();
      const now = new Date().getTime();
      if (selectedTime <= now) {
        newErrors.consultationTime = "Consultation time must be in the future";
      }
    }

    if (!formData.doctorId) {
      newErrors.doctorId = "Please select a doctor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        consultationTime: formData.consultationTime.getTime(),
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        doctorDetails: formData.doctorDetails,
      };

      const updatedConsultation = await consultationService.updateConsultation(
        consultationId,
        updateData
      );

      // Format the updated consultation data
      const formattedData =
        consultationService.formatConsultationData(updatedConsultation);
      setConsultation(formattedData);

      setSuccess(true);
      setTimeout(() => {
        navigate(`/consultations/${consultationId}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating consultation:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/consultations/${consultationId}`);
  };

  if (loading) {
    return (
      <div className="edit-consultation-container">
        <div className="edit-consultation-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back to Consultation
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

  if (error && !consultation) {
    return (
      <div className="edit-consultation-container">
        <div className="edit-consultation-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back to Consultation
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
      <div className="edit-consultation-container">
        <div className="edit-consultation-header">
          <div className="header-content">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
                Back to Consultation
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
    <div className="edit-consultation-container">
      {/* Header */}
      <div className="edit-consultation-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={handleGoBack}>
              <ArrowLeft size={20} />
              Back to Consultation
            </button>
            <div className="header-title">
              <div className="title-icon">
                <Edit3 size={24} />
              </div>
              <div className="title-content">
                <h1>Edit Consultation</h1>
                <p>Update consultation time and doctor assignment</p>
                <div className="consultation-id">
                  Consultation #
                  {consultation.consultationId?.slice(-8) || "N/A"}
                </div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={
                saving || !formData.consultationTime || !formData.doctorId
              }
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="edit-consultation-content">
        {success ? (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="success-icon" />
            <h3>Consultation Updated Successfully!</h3>
            <p>
              Your changes have been saved. Redirecting to consultation
              details...
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="edit-form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form Grid */}
            <div className="form-grid">
              {/* Consultation Time */}
              <div className="form-group">
                <DateTimePicker
                  value={formData.consultationTime}
                  onChange={(date) =>
                    handleInputChange("consultationTime", date)
                  }
                  onDateChange={handleDatePickerDateChange}
                  excludeTimes={bookedTimes}
                  placeholder="Select consultation date and time"
                  disabled={saving}
                  error={errors.consultationTime}
                  minDate={new Date()}
                  showTimeSelect={true}
                  slotDuration={55}
                  dateFormat="MMM dd, yyyy hh:mm:aa"
                  timeFormat="hh:mm:aa"
                />
                {errors.consultationTime && (
                  <span className="error-text">{errors.consultationTime}</span>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="form-group">
                <label className="form-label">
                  <Stethoscope className="label-icon" />
                  <span>Assign Doctor</span>
                </label>
                <DoctorSearchDropdown
                  doctors={doctors}
                  selectedDoctorId={formData.doctorId}
                  onDoctorSelect={handleDoctorSelect}
                  loading={doctorsLoading}
                  error={errors.doctorId}
                  placeholder="Search and select a doctor..."
                />
                {errors.doctorId && (
                  <span className="error-text">{errors.doctorId}</span>
                )}
              </div>
            </div>

            {/* Selected Doctor Info */}
            {formData.doctorDetails && (
              <motion.div
                className="selected-doctor-info"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="info-header">
                  <User className="info-icon" />
                  <h4>Selected Doctor</h4>
                </div>
                <div className="doctor-card">
                  <div className="doctor-avatar">
                    {formData.doctorDetails.profileImage ? (
                      <img
                        src={formData.doctorDetails.profileImage}
                        alt={formData.doctorName}
                        className="doctor-profile-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <User size={20} className="doctor-avatar-fallback" />
                  </div>
                  <div className="doctor-info">
                    <div className="doctor-name">
                      {formatDoctorName(
                        formData.doctorName,
                        formData.doctorDetails.specialty
                      )}
                    </div>
                    <div className="doctor-specialty">
                      {formData.doctorDetails.specialty}
                    </div>
                    <div className="doctor-meta">
                      {formData.doctorDetails.experience && (
                        <span className="meta-item">
                          {formData.doctorDetails.experience} years experience
                        </span>
                      )}
                      {formData.doctorDetails.worksAt && (
                        <span className="meta-item">
                          {formData.doctorDetails.worksAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Current Consultation Info */}
            <div className="current-consultation-info">
              <h3>Current Consultation Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Current Time</span>
                  <span className="info-value">
                    {consultation.formattedConsultationTime}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Doctor</span>
                  <span className="info-value">
                    {consultation.doctorName || "Not assigned"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value status-badge">
                    {consultation.status}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EditConsultation;
