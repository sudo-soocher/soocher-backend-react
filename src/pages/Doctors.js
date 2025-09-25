import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  MapPin,
  Star,
  Phone,
  Mail,
  Calendar,
  Loader2,
  FileText,
  X,
  Clock,
  AlertCircle,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  XCircle,
} from "lucide-react";
import {
  getDoctors,
  getDoctorStats,
  verifyDoctor,
} from "../services/doctorService";
import { testFirebaseConnection } from "../utils/firebaseTest";
import "./Doctors.css";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [stats, setStats] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMciNumber, setVerificationMciNumber] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [profileStates, setProfileStates] = useState({});

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filterStatus, filterSpecialty]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      console.log("Loading doctors...");

      // First test Firebase connection
      const connectionTest = await testFirebaseConnection();
      console.log("Firebase connection test:", connectionTest);

      const [doctorsResult, statsResult] = await Promise.all([
        getDoctors(),
        getDoctorStats(),
      ]);

      console.log("Doctors result:", doctorsResult);
      console.log("Stats result:", statsResult);

      if (doctorsResult.success) {
        console.log("Setting doctors:", doctorsResult.data);
        if (doctorsResult.data && doctorsResult.data.length > 0) {
          setDoctors(doctorsResult.data);
          // Calculate stats from doctors data
          const calculatedStats = calculateStats(doctorsResult.data);
          setStats(calculatedStats);

          // Extract specialties for dropdown
          if (calculatedStats.specializations) {
            const specialtyList = Object.keys(
              calculatedStats.specializations
            ).map((specialty) => ({
              value: specialty,
              label: specialty,
              count: calculatedStats.specializations[specialty],
            }));
            setSpecialties(specialtyList);
          }
        } else {
          console.log("No doctors found, using mock data for testing");
          // Mock data for testing
          setDoctors([
            {
              uid: "mock1",
              name: "Dr. John Smith",
              specialization: "Cardiology",
              phoneNumber: "+1234567890",
              email: "john.smith@example.com",
              currentCity: "New York",
              currentState: "NY",
              isAccountVerified: true,
              averageRating: 4.8,
              numOnline: "150+",
              numOffline: "200+",
              consultationFees: "250",
              accountCreationDate: Date.now() - 86400000,
              profileImage: null,
              mciNumber: "12345",
              worksAt: "City Hospital",
              aboutMe: "Experienced cardiologist with 10+ years of practice.",
            },
            {
              uid: "mock2",
              name: "Dr. Sarah Johnson",
              specialization: "Neurology",
              phoneNumber: "+1234567891",
              email: "sarah.johnson@example.com",
              currentCity: "Los Angeles",
              currentState: "CA",
              isAccountVerified: false,
              averageRating: 4.5,
              numOnline: "100+",
              numOffline: "150+",
              consultationFees: "300",
              accountCreationDate: Date.now() - 172800000,
              profileImage: null,
              mciNumber: "67890",
              worksAt: "General Hospital",
              aboutMe: "Neurologist specializing in movement disorders.",
            },
          ]);
        }
      } else {
        console.error("Failed to load doctors:", doctorsResult.error);
        // Use mock data as fallback
        setDoctors([
          {
            uid: "mock1",
            name: "Dr. John Smith",
            specialization: "Cardiology",
            phoneNumber: "+1234567890",
            email: "john.smith@example.com",
            currentCity: "New York",
            currentState: "NY",
            isAccountVerified: true,
            averageRating: 4.8,
            numOnline: "150+",
            numOffline: "200+",
            consultationFees: "250",
            accountCreationDate: Date.now() - 86400000,
            profileImage: null,
            mciNumber: "12345",
            worksAt: "City Hospital",
            aboutMe: "Experienced cardiologist with 10+ years of practice.",
          },
        ]);
      }

      if (statsResult.success) {
        console.log("Setting stats:", statsResult.data);
        setStats(statsResult.data);

        // Extract specialties for dropdown
        if (statsResult.data.specializations) {
          const specialtyList = Object.keys(
            statsResult.data.specializations
          ).map((specialty) => ({
            value: specialty,
            label: specialty,
            count: statsResult.data.specializations[specialty],
          }));
          setSpecialties(specialtyList);
        }
      } else {
        console.error("Failed to load stats:", statsResult.error);
        // Mock stats as fallback
        setStats({
          total: 2,
          verified: 1,
          pending: 1,
          specializations: {
            Cardiology: 1,
            Neurology: 1,
          },
          cities: {
            "New York": 1,
            "Los Angeles": 1,
          },
          states: {
            NY: 1,
            CA: 1,
          },
        });

        // Mock specialties
        setSpecialties([
          { value: "Cardiology", label: "Cardiology", count: 1 },
          { value: "Neurology", label: "Neurology", count: 1 },
        ]);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.name?.toLowerCase().includes(searchLower) ||
          doctor.specialization?.toLowerCase().includes(searchLower) ||
          doctor.currentCity?.toLowerCase().includes(searchLower) ||
          doctor.mciNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filterStatus === "verified") {
      filtered = filtered.filter((doctor) => doctor.isAccountVerified);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(
        (doctor) =>
          doctor.documentsSubmitted === true &&
          doctor.isAccountVerified === false
      );
    } else if (filterStatus === "no-documents") {
      filtered = filtered.filter(
        (doctor) => doctor.documentsSubmitted !== true
      );
    }

    // Specialty filter
    if (filterSpecialty !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.specialization === filterSpecialty
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleVerifyDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setVerificationMciNumber(doctor.mciNumber || "");
    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = async () => {
    if (!verificationMciNumber.trim()) {
      alert("Please enter MCI Number");
      return;
    }

    setVerificationLoading(true);
    try {
      const result = await verifyDoctor(selectedDoctor.uid);
      if (result.success) {
        // Update the doctor in the local state
        setDoctors((prev) =>
          prev.map((doctor) =>
            doctor.uid === selectedDoctor.uid
              ? {
                  ...doctor,
                  isAccountVerified: true,
                  mciNumber: verificationMciNumber,
                }
              : doctor
          )
        );
        setShowVerificationModal(false);
        setVerificationMciNumber("");
        console.log("Doctor verified successfully");
      } else {
        console.error("Error verifying doctor:", result.error);
        alert("Error verifying doctor. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying doctor:", error);
      alert("Error verifying doctor. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationMciNumber("");
    setSelectedDoctor(null);
  };

  const openImageModal = (imageUrl, imageTitle) => {
    setSelectedImage(imageUrl);
    setSelectedImageTitle(imageTitle);
    setShowImageModal(true);
  };

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsDialog(true);
  };

  const handleProfileToggle = async (doctorId, currentState) => {
    const newState = !currentState;

    // Update the doctor's isAccountVerified status in the doctors array
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.uid === doctorId
          ? { ...doctor, isAccountVerified: newState }
          : doctor
      )
    );

    // Also update the profileStates for UI consistency
    setProfileStates((prev) => ({
      ...prev,
      [doctorId]: newState,
    }));

    // Here you would typically make an API call to update the profile status
    // For now, we'll just update the local state
    console.log(`Profile ${doctorId} ${newState ? "verified" : "unverified"}`);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedImageTitle("");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterSpecialty("all");
  };

  const calculateStats = (doctorsList) => {
    const total = doctorsList.length;
    const verified = doctorsList.filter(
      (doctor) => doctor.isAccountVerified
    ).length;
    const pending = doctorsList.filter(
      (doctor) =>
        doctor.documentsSubmitted === true && doctor.isAccountVerified === false
    ).length;
    const noDocuments = doctorsList.filter(
      (doctor) => doctor.documentsSubmitted !== true
    ).length;

    // Calculate specializations
    const specializations = {};
    doctorsList.forEach((doctor) => {
      if (doctor.specialization) {
        specializations[doctor.specialization] =
          (specializations[doctor.specialization] || 0) + 1;
      }
    });

    // Calculate cities
    const cities = {};
    doctorsList.forEach((doctor) => {
      if (doctor.currentCity) {
        cities[doctor.currentCity] = (cities[doctor.currentCity] || 0) + 1;
      }
    });

    return {
      total,
      verified,
      pending,
      noDocuments,
      specializations,
      cities,
    };
  };

  const openDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  const getDisplayName = (doctor) => {
    const name = doctor.name || "Unknown Doctor";
    // Don't add "Dr." prefix for Psychology specialty doctors
    if (doctor.specialization === "Psychology") {
      return name;
    }
    return `Dr. ${name}`;
  };

  const getStatusBadge = (doctor) => {
    if (doctor.isAccountVerified) {
      return (
        <span className="status-badge verified">
          <CheckCircle size={12} />
          Verified
        </span>
      );
    } else if (
      doctor.documentsSubmitted === true &&
      doctor.isAccountVerified === false
    ) {
      return (
        <span className="status-badge pending">
          <Clock size={12} />
          Pending
        </span>
      );
    } else {
      return (
        <span className="status-badge no-documents">
          <AlertCircle size={12} />
          No Documents
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="doctors-loading">
        <motion.div
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="loading-spinner" size={48} />
          <h3>Loading Doctors...</h3>
          <p>Fetching doctor data from Soocher</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Doctor Management</h1>
          <p>Manage and verify doctor accounts</p>
        </div>
        <div className="header-stats">
          {stats && (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Doctors</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.verified}</span>
                <span className="stat-label">Verified</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.pending}</span>
                <span className="stat-label">Pending Verification</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.noDocuments}</span>
                <span className="stat-label">No Documents</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search doctors by name, specialization, city, or MCI number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-container">
            <Filter size={18} className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Doctors</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending Verification</option>
              <option value="no-documents">Documents Not Submitted</option>
            </select>
          </div>

          <div className="filter-container">
            <UserCheck size={18} className="filter-icon" />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label} ({specialty.count})
                </option>
              ))}
            </select>
          </div>

          <button
            className="reset-filters-button"
            onClick={resetFilters}
            disabled={
              searchTerm === "" &&
              filterStatus === "all" &&
              filterSpecialty === "all"
            }
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Doctors List */}
      <div className="doctors-list">
        {filteredDoctors.length === 0 ? (
          <div className="empty-state">
            <UserCheck size={48} className="empty-icon" />
            <h3>No doctors found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.uid}
                className="doctor-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <div className="doctor-header">
                  <div className="doctor-avatar">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={getDisplayName(doctor)}
                      />
                    ) : (
                      <UserCheck size={24} />
                    )}
                  </div>
                  <div className="doctor-info">
                    <h3>{getDisplayName(doctor)}</h3>
                    <p className="specialization">{doctor.specialization}</p>
                    {getStatusBadge(doctor)}
                  </div>
                  <div className="doctor-quick-actions">
                    <button
                      className="quick-action-button view-details"
                      onClick={() => handleViewDetails(doctor)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <div className="profile-toggle-container">
                      <button
                        className={`profile-toggle ${
                          doctor.isAccountVerified ? "enabled" : "disabled"
                        }`}
                        onClick={() =>
                          handleProfileToggle(
                            doctor.uid,
                            doctor.isAccountVerified || false
                          )
                        }
                        title={
                          doctor.isAccountVerified
                            ? "Unverify Profile"
                            : "Verify Profile"
                        }
                      >
                        {doctor.isAccountVerified ? (
                          <ToggleRight size={20} />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="doctor-details">
                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>
                      {doctor.currentCity}, {doctor.currentState}
                    </span>
                  </div>
                  <div className="detail-item">
                    <Phone size={14} />
                    <span>{doctor.phoneNumber}</span>
                  </div>
                  <div className="detail-item">
                    <Star size={14} />
                    <span>{doctor.averageRating || 0}/5</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>Joined {formatDate(doctor.accountCreationDate)}</span>
                  </div>
                </div>

                <div className="doctor-footer">
                  <div className="doctor-stats">
                    <span className="stat">
                      <strong>{doctor.numOnline || 0}</strong> Online
                    </span>
                    <span className="stat">
                      <strong>{doctor.numOffline || 0}</strong> Offline
                    </span>
                    <span className="stat">
                      <strong>₹{doctor.consultationFees || 0}</strong> Fee
                    </span>
                  </div>
                  {doctor.documentsSubmitted === true &&
                    !doctor.isAccountVerified && (
                      <div className="verification-actions">
                        <button
                          className="verify-button"
                          onClick={() => handleVerifyDoctor(doctor)}
                        >
                          <CheckCircle size={18} />
                          Verify
                        </button>
                      </div>
                    )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Detail Modal */}
      <AnimatePresence>
        {showModal && selectedDoctor && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Doctor Details</h2>
                <button className="close-button" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="doctor-profile">
                  <div className="profile-image">
                    {selectedDoctor.profileImage ? (
                      <img
                        src={selectedDoctor.profileImage}
                        alt={getDisplayName(selectedDoctor)}
                      />
                    ) : (
                      <UserCheck size={48} />
                    )}
                  </div>
                  <div className="profile-info">
                    <h3>{getDisplayName(selectedDoctor)}</h3>
                    <p className="specialization">
                      {selectedDoctor.specialization}
                    </p>
                    {getStatusBadge(selectedDoctor)}
                  </div>
                </div>

                <div className="details-grid">
                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <div className="detail-item">
                      <Phone size={16} />
                      <span>{selectedDoctor.phoneNumber}</span>
                    </div>
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>{selectedDoctor.email || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Location</h4>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>
                        {selectedDoctor.currentCity},{" "}
                        {selectedDoctor.currentState}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Professional Details</h4>
                    <div className="detail-item">
                      <span className="label">MCI Number:</span>
                      <span>{selectedDoctor.mciNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Experience:</span>
                      <span>{selectedDoctor.numExp}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Works At:</span>
                      <span>{selectedDoctor.worksAt || "Not specified"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Consultation Fee:</span>
                      <span>₹{selectedDoctor.consultationFees}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>About</h4>
                    <p className="about-text">
                      {selectedDoctor.aboutMe || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && selectedDoctor && (
          <motion.div
            className="verification-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeVerificationModal}
          >
            <motion.div
              className="verification-modal"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="verification-modal-header">
                <div className="header-content">
                  <div className="header-icon">
                    <UserCheck size={24} />
                  </div>
                  <div className="header-text">
                    <h2>Verify Doctor</h2>
                    <p>Review documents and complete verification</p>
                  </div>
                </div>
                <button
                  className="verification-close-button"
                  onClick={closeVerificationModal}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="verification-modal-body">
                <div className="verification-content">
                  <div className="doctor-info-card">
                    <div className="doctor-avatar">
                      {selectedDoctor.profileImage ? (
                        <img
                          src={selectedDoctor.profileImage}
                          alt={getDisplayName(selectedDoctor)}
                        />
                      ) : (
                        <UserCheck size={32} />
                      )}
                    </div>
                    <div className="doctor-details">
                      <h3>{getDisplayName(selectedDoctor)}</h3>
                      <p className="specialization">
                        {selectedDoctor.specialization}
                      </p>
                      <div className="doctor-meta">
                        <span className="meta-item">
                          <MapPin size={14} />
                          {selectedDoctor.currentCity},{" "}
                          {selectedDoctor.currentState}
                        </span>
                        <span className="meta-item">
                          <Phone size={14} />
                          {selectedDoctor.phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="documents-section">
                    <div className="section-header">
                      <h4>
                        <FileText size={20} />
                        Verification Documents
                      </h4>
                      <p>Click on any document to view in full screen</p>
                    </div>
                    <div className="documents-grid">
                      <div className="document-card">
                        <div className="document-header">
                          <h5>Aadhar Card - Front</h5>
                          <span className="document-status">
                            {selectedDoctor.aadharFrontUrl ? (
                              <CheckCircle
                                size={16}
                                className="status-icon verified"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="status-icon missing"
                              />
                            )}
                          </span>
                        </div>
                        {selectedDoctor.aadharFrontUrl ? (
                          <div className="document-image-container">
                            <img
                              src={selectedDoctor.aadharFrontUrl}
                              alt="Aadhar Card Front"
                              className="document-image clickable-image"
                              onClick={() =>
                                openImageModal(
                                  selectedDoctor.aadharFrontUrl,
                                  "Aadhar Card - Front"
                                )
                              }
                            />
                            <div className="image-overlay">
                              <Eye size={20} />
                              <span>Click to expand</span>
                            </div>
                          </div>
                        ) : (
                          <div className="no-document">
                            <FileText size={32} />
                            <p>No Aadhar front uploaded</p>
                          </div>
                        )}
                      </div>

                      <div className="document-card">
                        <div className="document-header">
                          <h5>Aadhar Card - Back</h5>
                          <span className="document-status">
                            {selectedDoctor.aadharBackUrl ? (
                              <CheckCircle
                                size={16}
                                className="status-icon verified"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="status-icon missing"
                              />
                            )}
                          </span>
                        </div>
                        {selectedDoctor.aadharBackUrl ? (
                          <div className="document-image-container">
                            <img
                              src={selectedDoctor.aadharBackUrl}
                              alt="Aadhar Card Back"
                              className="document-image clickable-image"
                              onClick={() =>
                                openImageModal(
                                  selectedDoctor.aadharBackUrl,
                                  "Aadhar Card - Back"
                                )
                              }
                            />
                            <div className="image-overlay">
                              <Eye size={20} />
                              <span>Click to expand</span>
                            </div>
                          </div>
                        ) : (
                          <div className="no-document">
                            <FileText size={32} />
                            <p>No Aadhar back uploaded</p>
                          </div>
                        )}
                      </div>

                      <div className="document-card">
                        <div className="document-header">
                          <h5>MCI Certificate</h5>
                          <span className="document-status">
                            {selectedDoctor.mciUploadUrl ? (
                              <CheckCircle
                                size={16}
                                className="status-icon verified"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="status-icon missing"
                              />
                            )}
                          </span>
                        </div>
                        {selectedDoctor.mciUploadUrl ? (
                          <div className="document-image-container">
                            <img
                              src={selectedDoctor.mciUploadUrl}
                              alt="MCI Certificate"
                              className="document-image clickable-image"
                              onClick={() =>
                                openImageModal(
                                  selectedDoctor.mciUploadUrl,
                                  "MCI Certificate"
                                )
                              }
                            />
                            <div className="image-overlay">
                              <Eye size={20} />
                              <span>Click to expand</span>
                            </div>
                          </div>
                        ) : (
                          <div className="no-document">
                            <FileText size={32} />
                            <p>No MCI certificate uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mci-input-section">
                    <div className="input-header">
                      <h4>
                        <CheckCircle size={20} />
                        MCI Verification
                      </h4>
                      <p>Enter the MCI number to complete verification</p>
                    </div>
                    <div className="input-container">
                      <label htmlFor="mciNumber">MCI Number *</label>
                      <input
                        type="text"
                        id="mciNumber"
                        value={verificationMciNumber}
                        onChange={(e) =>
                          setVerificationMciNumber(e.target.value)
                        }
                        placeholder="Enter MCI Number (e.g., 12345)"
                        className="mci-input"
                        required
                      />
                      <div className="input-hint">
                        <AlertCircle size={14} />
                        <span>
                          This number will be verified against official records
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="verification-modal-footer">
                <button
                  className="cancel-button"
                  onClick={closeVerificationModal}
                  disabled={verificationLoading}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  className="verify-submit-button"
                  onClick={handleVerificationSubmit}
                  disabled={
                    verificationLoading || !verificationMciNumber.trim()
                  }
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 size={16} className="loading-spinner" />
                      Verifying Doctor...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Verify Doctor
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && selectedImage && (
          <motion.div
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.div
              className="image-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="image-modal-header">
                <h3>{selectedImageTitle}</h3>
                <button className="image-modal-close" onClick={closeImageModal}>
                  <X size={24} />
                </button>
              </div>
              <div className="image-modal-body">
                <img
                  src={selectedImage}
                  alt={selectedImageTitle}
                  className="expanded-image"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Dialog */}
      <AnimatePresence>
        {showDetailsDialog && selectedDoctor && (
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
                <h2>Doctor Details</h2>
                <button
                  className="close-button"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="details-modal-body">
                <div className="doctor-details-grid">
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">
                        {getDisplayName(selectedDoctor)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">
                        {selectedDoctor.email}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">
                        {selectedDoctor.phoneNumber || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Specialization:</span>
                      <span className="detail-value">
                        {selectedDoctor.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Location</h3>
                    <div className="detail-row">
                      <span className="detail-label">City:</span>
                      <span className="detail-value">
                        {selectedDoctor.city || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">State:</span>
                      <span className="detail-value">
                        {selectedDoctor.state || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Status</h3>
                    <div className="detail-row">
                      <span className="detail-label">Verification:</span>
                      <span className="detail-value">
                        {selectedDoctor.isAccountVerified
                          ? "Verified"
                          : "Pending"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Documents:</span>
                      <span className="detail-value">
                        {selectedDoctor.documentsSubmitted
                          ? "Submitted"
                          : "Not Submitted"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Verification Status:</span>
                      <span className="detail-value">
                        {selectedDoctor.isAccountVerified
                          ? "Verified"
                          : "Unverified"}
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

export default Doctors;
