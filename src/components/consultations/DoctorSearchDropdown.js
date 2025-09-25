import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Check,
  ChevronDown,
  Stethoscope,
  Star,
  MapPin,
} from "lucide-react";
import "./DoctorSearchDropdown.css";

// Helper function to format doctor name with Dr. prefix
const formatDoctorName = (name, specialization) => {
  if (!name) return "N/A";

  // Don't add Dr. prefix for Psychology specialty
  if (specialization && specialization.toLowerCase().includes("psychology")) {
    return name;
  }

  // Add Dr. prefix for all other specializations
  return name.startsWith("Dr. ") ? name : `Dr. ${name}`;
};

const DoctorSearchDropdown = ({
  doctors = [],
  selectedDoctorId,
  onDoctorSelect,
  loading = false,
  error = null,
  placeholder = "Search and select a doctor...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedDoctor = doctors.find(
    (doctor) => doctor.uid === selectedDoctorId
  );

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter((doctor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doctor.name?.toLowerCase().includes(searchLower) ||
      doctor.specialization?.toLowerCase().includes(searchLower) ||
      doctor.currentCity?.toLowerCase().includes(searchLower) ||
      doctor.worksAt?.toLowerCase().includes(searchLower) ||
      doctor.mciNumber?.toLowerCase().includes(searchLower)
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        searchInputRef.current?.focus();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDoctors.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredDoctors.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredDoctors[highlightedIndex]) {
          handleDoctorSelect(filteredDoctors[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleDoctorSelect = (doctor) => {
    onDoctorSelect(doctor);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (!loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  return (
    <div className="doctor-search-dropdown" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${
          error ? "error" : ""
        }`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="trigger-content">
          {selectedDoctor ? (
            <div className="selected-doctor">
              <div className="doctor-avatar">
                {selectedDoctor.profileImage ? (
                  <img
                    src={selectedDoctor.profileImage}
                    alt={selectedDoctor.name}
                    className="doctor-profile-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <User size={18} className="doctor-avatar-fallback" />
              </div>
              <div className="doctor-info">
                <div className="doctor-name-row">
                  <span className="doctor-name">
                    {formatDoctorName(
                      selectedDoctor.name,
                      selectedDoctor.specialization
                    )}
                  </span>
                  {selectedDoctor.isAccountVerified && (
                    <div className="verified-badge-small">
                      <Check size={8} />
                    </div>
                  )}
                </div>
                <span className="doctor-specialty">
                  {selectedDoctor.specialization}
                </span>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              <Search size={16} />
              <span>{placeholder}</span>
            </div>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`chevron ${isOpen ? "rotated" : ""}`}
        />
      </div>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-content"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search Input */}
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner" />
                <span>Loading doctors...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="error-state">
                <span>{error}</span>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredDoctors.length === 0 && (
              <div className="no-results">
                <User size={24} />
                <span>No doctors found</span>
                <small>Try adjusting your search terms</small>
              </div>
            )}

            {/* Doctor List */}
            {!loading && !error && filteredDoctors.length > 0 && (
              <div className="doctor-list" role="listbox">
                {filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.uid}
                    className={`doctor-item ${
                      highlightedIndex === index ? "highlighted" : ""
                    } ${selectedDoctorId === doctor.uid ? "selected" : ""}`}
                    onClick={() => handleDoctorSelect(doctor)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={selectedDoctorId === doctor.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="doctor-avatar">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={doctor.name}
                          className="doctor-profile-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <User size={18} className="doctor-avatar-fallback" />
                    </div>
                    <div className="doctor-details">
                      <div className="doctor-header">
                        <div className="doctor-name-container">
                          <span className="doctor-name">
                            {formatDoctorName(
                              doctor.name,
                              doctor.specialization
                            )}
                          </span>
                          {doctor.isAccountVerified && (
                            <div className="verified-badge">
                              <Check size={10} />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                        <div className="doctor-specialty">
                          <Stethoscope size={14} />
                          <span>{doctor.specialization}</span>
                        </div>
                      </div>
                    </div>
                    <div className="doctor-actions">
                      {selectedDoctorId === doctor.uid && (
                        <div className="selected-indicator">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorSearchDropdown;
