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
  Loader2,
  Eye,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import consultationService from "../services/consultationService";

// shadcn components
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

const ConsultationsShadcn = () => {
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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "In Progress":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "Started":
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case "Active":
        return <Play className="h-4 w-4 text-purple-600" />;
      case "Upcoming":
        return <Clock className="h-4 w-4 text-cyan-600" />;
      case "Past":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "Abandoned":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "Scheduled":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
      case "Active":
        return "secondary";
      case "Upcoming":
        return "outline";
      case "Past":
        return "secondary";
      case "Abandoned":
        return "destructive";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getConsultationTypeIcon = (consultation) => {
    if (consultation.videoConsultDone) {
      return <Video className="h-4 w-4" />;
    }
    return <Phone className="h-4 w-4" />;
  };

  if (loading && consultations.length === 0) {
    return <LoadingSpinner fullHeight message="Fetching consultation data from Soocher..." />;
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={14} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.4px" }}>Consultations</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            for {formatDate(selectedDate)} • {consultations.length} total
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Popover>
            <PopoverTrigger asChild>
              <button style={{ height: 36, padding: "0 14px", borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 13, fontWeight: 600, color: "#1e3a5f", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <CalendarDays size={14} color="#3b82f6" />
                {formatDate(selectedDate)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { if (date) setSelectedDate(date); }}
                initialFocus
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{ height: 36, padding: "0 14px", borderRadius: 9, border: "1.5px solid #e0e7ff", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 6, cursor: loading ? "not-allowed" : "pointer" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#93c5fd" }} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search consultations..."
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 12.5, color: "#1e3a5f", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "white"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} color="#64748b" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger style={{ width: 168, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <AlertCircle size={16} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={handleRefresh} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "white", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Consultations Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredConsultations.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <MessageSquare size={40} style={{ color: "#bfdbfe", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>No consultations found</p>
            <p style={{ fontSize: 12.5, color: "#94a3b8" }}>
              {searchTerm ? "No consultations match your search criteria" : "No consultations available at the moment"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#f8fbff", borderBottom: "1.5px solid #e0f2fe" }}>
                  {["Consultation ID", "Patient", "Doctor", "Scheduled Time", "Duration", "Type", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.map((consultation, idx) => (
                  <tr
                    key={consultation.id}
                    style={{ borderBottom: "1px solid #f0f7ff", background: idx % 2 === 0 ? "white" : "#fafcff", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafcff"}
                  >
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12.5, color: "#64748b" }}>
                      #{consultation.consultationId?.slice(-8) || "N/A"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar className="h-7 w-7 ring-1 ring-blue-100">
                          <AvatarFallback className="bg-blue-50 text-blue-700 text-xs font-semibold">
                            {consultation.patientName?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{consultation.patientName || "N/A"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar className="h-7 w-7 ring-1 ring-green-100">
                          <AvatarFallback className="bg-green-50 text-green-700 text-xs font-semibold">
                            {consultation.doctorName?.charAt(0) || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{consultation.doctorName || "N/A"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#64748b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={12} color="#94a3b8" />
                        {consultation.formattedConsultationTime}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#1e3a5f", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={12} color="#94a3b8" />
                        {consultation.duration}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4, background: "#f1f5f9", width: "fit-content" }}>
                        {getConsultationTypeIcon(consultation)}
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{consultation.videoConsultDone ? "Video" : "Phone"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge variant={getStatusBadgeVariant(consultation.status)} className="flex items-center space-x-1 px-2 py-0.5" style={{ width: "max-content", fontSize: 11 }}>
                        {getStatusIcon(consultation.status)}
                        <span className="font-medium">{consultation.status}</span>
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleViewDetails(consultation)}
                          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 11, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}
                        >
                          <Eye size={12} /> Details
                        </button>
                        <button
                          onClick={() => handleCopyConsultationId(consultation.consultationId)}
                          style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: copiedId === consultation.consultationId ? "#ecfdf5" : "transparent", color: copiedId === consultation.consultationId ? "#10b981" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { if (copiedId !== consultation.consultationId) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#1e3a5f"; } }}
                          onMouseLeave={e => { if (copiedId !== consultation.consultationId) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}
                          title="Copy ID"
                        >
                          {copiedId === consultation.consultationId ? <CheckCircle size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && filteredConsultations.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{ padding: "8px 24px", borderRadius: 20, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 13, fontWeight: 600, color: "#1e3a5f", display: "flex", alignItems: "center", gap: 8, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#e0f2fe"; } }}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#f0f7ff"; } }}
          >
            {loading ? (
              <><RefreshCw size={14} className="animate-spin" /> Loading...</>
            ) : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsultationsShadcn;
