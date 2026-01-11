import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Check,
  ChevronDown,
  MapPin,
  Phone,
} from "lucide-react";
import "./PatientSearchDropdown.css";

const PatientSearchDropdown = ({
  patients = [],
  selectedPatientId,
  onPatientSelect,
  loading = false,
  error = null,
  placeholder = "Search and select a patient...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedPatient = patients.find(
    (patient) => patient.uid === selectedPatientId
  );

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phoneNumber?.toLowerCase().includes(searchLower) ||
      patient.currentCity?.toLowerCase().includes(searchLower) ||
      patient.currentState?.toLowerCase().includes(searchLower)
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
          prev < filteredPatients.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPatients.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredPatients[highlightedIndex]) {
          handlePatientSelect(filteredPatients[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  const handlePatientSelect = (patient) => {
    onPatientSelect(patient);
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
    <div className="patient-search-dropdown" ref={dropdownRef}>
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
          {selectedPatient ? (
            <div className="selected-patient">
              <div className="patient-avatar">
                {selectedPatient.profileImage ? (
                  <img
                    src={selectedPatient.profileImage}
                    alt={selectedPatient.name}
                    className="patient-profile-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <User size={16} className="patient-avatar-fallback" />
              </div>
              <div className="patient-info">
                <div className="patient-name-row">
                  <span className="patient-name">{selectedPatient.name}</span>
                </div>
                <span className="patient-contact">
                  {selectedPatient.phoneNumber || selectedPatient.email || "N/A"}
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
                placeholder="Search patients..."
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
                <span>Loading patients...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="error-state">
                <span>{error}</span>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredPatients.length === 0 && (
              <div className="no-results">
                <User size={24} />
                <span>No patients found</span>
                <small>Try adjusting your search terms</small>
              </div>
            )}

            {/* Patient List */}
            {!loading && !error && filteredPatients.length > 0 && (
              <div className="patient-list" role="listbox">
                {filteredPatients.map((patient, index) => (
                  <motion.div
                    key={patient.uid}
                    className={`patient-item ${
                      highlightedIndex === index ? "highlighted" : ""
                    } ${selectedPatientId === patient.uid ? "selected" : ""}`}
                    onClick={() => handlePatientSelect(patient)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={selectedPatientId === patient.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="patient-avatar">
                      {patient.profileImage ? (
                        <img
                          src={patient.profileImage}
                          alt={patient.name}
                          className="patient-profile-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <User size={16} className="patient-avatar-fallback" />
                    </div>
                    <div className="patient-details">
                      <div className="patient-header">
                        <div className="patient-name-container">
                          <span className="patient-name">{patient.name}</span>
                        </div>
                        <div className="patient-meta">
                          {patient.phoneNumber && (
                            <div className="patient-contact-item">
                              <Phone size={12} />
                              <span>{patient.phoneNumber}</span>
                            </div>
                          )}
                          {(patient.currentCity || patient.currentState) && (
                            <div className="patient-contact-item">
                              <MapPin size={12} />
                              <span>
                                {[patient.currentCity, patient.currentState]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="patient-actions">
                      {selectedPatientId === patient.uid && (
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

export default PatientSearchDropdown;

