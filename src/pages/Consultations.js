import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Clock,
  User,
  Calendar,
  Video,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  Copy,
  CalendarDays,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import consultationService from "../services/consultationService";
import "./Consultations.css";

const Consultations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Set initial filter based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/consultations/upcoming")) {
      setStatusFilter("upcoming");
    } else if (path.includes("/consultations/active")) {
      setStatusFilter("active");
    } else if (path.includes("/consultations/completed")) {
      setStatusFilter("completed");
    } else if (path.includes("/consultations/past")) {
      setStatusFilter("past");
    } else if (path.includes("/consultations/abandoned")) {
      setStatusFilter("abandoned");
    } else if (path.includes("/consultations/cancelled")) {
      setStatusFilter("cancelled");
    } else {
      setStatusFilter("all");
    }
  }, [location.pathname]);

  const statusOptions = [
    { value: "all", label: "All Consultations", count: 0 },
    { value: "upcoming", label: "Upcoming", count: 0 },
    { value: "active", label: "Active", count: 0 },
    { value: "completed", label: "Completed", count: 0 },
    { value: "past", label: "Past", count: 0 },
    { value: "abandoned", label: "Abandoned", count: 0 },
    { value: "cancelled", label: "Cancelled", count: 0 },
  ];

  useEffect(() => {
    fetchConsultations();
  }, [statusFilter, selectedDate]);

  const fetchConsultations = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch consultations by date, then filter client-side
      const result = await consultationService.getConsultationsByDate(
        selectedDate,
        50, // Increased page size to accommodate filtering
        loadMore ? lastDoc : null
      );

      const formattedConsultations = result.consultations.map((consultation) =>
        consultationService.formatConsultationData(consultation)
      );

      // Filter consultations based on status
      let filteredConsultations = formattedConsultations;
      if (statusFilter !== "all") {
        filteredConsultations = formattedConsultations.filter(
          (consultation) => {
            return consultation.category === statusFilter;
          }
        );
      }

      if (loadMore) {
        setConsultations((prev) => [...prev, ...filteredConsultations]);
      } else {
        setConsultations(filteredConsultations);
        setCurrentPage(1);
      }

      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
      fetchConsultations(true);
    }
  };

  const handleRefresh = () => {
    setLastDoc(null);
    setCurrentPage(1);
    setSelectedDate(new Date()); // Reset to today's date
    fetchConsultations();
  };

  const handleViewDetails = (consultation) => {
    navigate(`/consultations/${consultation.id}`);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);
  };

  const handleCopyConsultationId = async (consultationId) => {
    try {
      await navigator.clipboard.writeText(consultationId);
      setCopiedId(consultationId);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy consultation ID:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = consultationId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(consultationId);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.patientName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consultation.doctorName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consultation.consultationId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="status-icon completed" />;
      case "In Progress":
        return <Play className="status-icon in-progress" />;
      case "Started":
        return <Pause className="status-icon started" />;
      case "Active":
        return <Play className="status-icon active" />;
      case "Upcoming":
        return <Clock className="status-icon upcoming" />;
      case "Past":
        return <Clock className="status-icon past" />;
      case "Abandoned":
        return <AlertCircle className="status-icon abandoned" />;
      case "Scheduled":
        return <Clock className="status-icon scheduled" />;
      case "Cancelled":
        return <XCircle className="status-icon cancelled" />;
      default:
        return <AlertCircle className="status-icon" />;
    }
  };

  const getConsultationTypeIcon = (consultation) => {
    if (consultation.videoConsultDone) {
      return <Video className="consultation-type-icon" />;
    }
    return <Phone className="consultation-type-icon" />;
  };

  if (loading && consultations.length === 0) {
    return (
      <div className="consultations-container">
        <div className="consultations-header">
          <h1>Consultations</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="consultations-container">
      {/* Header */}
      <div className="consultations-header">
        <div className="header-content">
          <div className="header-left">
            <MessageSquare className="header-icon" />
            <div className="header-title-section">
              <h1>Consultations</h1>
              <div className="date-indicator">
                for {formatDate(selectedDate)}
              </div>
            </div>
            <span className="consultation-count">{consultations.length}</span>
          </div>
          <div className="header-actions">
            <div className="calendar-container">
              <CalendarDays className="calendar-icon" />
              <div className="calendar-content">
                <span className="calendar-date">
                  {formatDate(selectedDate)}
                </span>
                <input
                  type="date"
                  className="calendar-input"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={loading ? "spinning" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="consultations-filters">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search consultations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <Filter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle />
          <span>{error}</span>
          <button onClick={handleRefresh} className="retry-btn">
            Retry
          </button>
        </motion.div>
      )}

      {/* Consultations List */}
      <div className="consultations-list">
        {filteredConsultations.length === 0 ? (
          <div className="empty-state">
            <MessageSquare className="empty-icon" />
            <h3>No consultations found</h3>
            <p>
              {searchTerm
                ? "No consultations match your search criteria"
                : "No consultations available at the moment"}
            </p>
          </div>
        ) : (
          filteredConsultations.map((consultation, index) => (
            <motion.div
              key={consultation.id}
              className="consultation-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="consultation-header">
                <div className="consultation-info">
                  <div className="consultation-id">
                    #{consultation.consultationId?.slice(-8) || "N/A"}
                  </div>
                  <div className="consultation-status">
                    {getStatusIcon(consultation.status)}
                    <span
                      className="status-text"
                      style={{ color: consultation.statusColor }}
                    >
                      {consultation.status}
                    </span>
                  </div>
                </div>
                <div className="consultation-type">
                  {getConsultationTypeIcon(consultation)}
                </div>
              </div>

              <div className="consultation-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <User className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Patient</span>
                      <span className="detail-value name-value">
                        {consultation.patientName || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <User className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Doctor</span>
                      <span className="detail-value name-value">
                        {consultation.doctorName || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <Calendar className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Scheduled</span>
                      <span className="detail-value">
                        {consultation.formattedConsultationTime}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Clock className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">
                        {consultation.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {consultation.patientDetails?.notesForDoctor && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <MessageSquare className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Notes</span>
                        <span className="detail-value">
                          {consultation.patientDetails.notesForDoctor}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {consultation.actualStartTime && (
                  <div className="detail-row">
                    <div className="detail-item">
                      <Play className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Started</span>
                        <span className="detail-value">
                          {consultation.formattedActualStartTime}
                        </span>
                      </div>
                    </div>
                    {consultation.actualEndTime && (
                      <div className="detail-item">
                        <CheckCircle className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Ended</span>
                          <span className="detail-value">
                            {consultation.formattedActualEndTime}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="consultation-actions">
                <div className="action-buttons">
                  <button
                    className="action-btn primary"
                    onClick={() => handleViewDetails(consultation)}
                  >
                    View Details
                  </button>
                  <button
                    className={`action-btn copy-btn ${
                      copiedId === consultation.consultationId ? "copied" : ""
                    }`}
                    onClick={() =>
                      handleCopyConsultationId(consultation.consultationId)
                    }
                    title="Copy Consultation ID"
                  >
                    <Copy size={16} />
                    {copiedId === consultation.consultationId
                      ? "Copied!"
                      : "Copy ID"}
                  </button>
                </div>
                <button className="action-btn secondary">
                  <MoreVertical />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && filteredConsultations.length > 0 && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="spinning" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Consultations;
