import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  User,
  UserX,
  Eye,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Loader2,
  X,
  RotateCcw,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Star,
  Edit,
} from "lucide-react";
import { getPatients, getPatientStats } from "../services/patientService";
import { fetchPhoneNumber, updatePhoneNumber } from "../services/phoneService";

// shadcn components
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// Memoized Patient Card Component for better performance
const PatientCard = memo(
  ({
    patient,
    onViewDetails,
    onEditPatient,
    onFetchPhoneNumber,
    fetchingPhoneNumbers,
    getStatusBadge,
    getDisplayName,
    formatDate,
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Card
          className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 shadow-md bg-white"
          onClick={() => onViewDetails(patient)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patient?.profileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-lg font-semibold">
                    {getDisplayName(patient)?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {getDisplayName(patient)}
                  </h3>
                  <p className="text-sm text-gray-500">{patient?.gender}</p>
                </div>
              </div>
              {getStatusBadge(patient)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {patient?.currentCity}, {patient?.currentState}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span>UID: {patient?.uid || "N/A"}</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                {patient?.phoneNumber || patient?.whatsappNumber ? (
                  <span>{patient?.phoneNumber || patient?.whatsappNumber}</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFetchPhoneNumber(patient);
                    }}
                    disabled={fetchingPhoneNumbers[patient.uid]}
                    className="h-6 px-2 text-xs"
                  >
                    {fetchingPhoneNumbers[patient.uid] ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      "Fetch Phone Number"
                    )}
                  </Button>
                )}
              </div>

              {!patient?.phoneNumber && !patient?.whatsappNumber && (
                <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  May be using Google/Apple Sign-In
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>Joined {formatDate(patient?.dateOfAccountCreation)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex space-x-4 text-sm">
                  <span className="font-medium">
                    Health Score: {patient?.healthScore || "N/A"}
                  </span>
                  <span className="font-medium">
                    Family: {patient?.familyMembers?.length || 0}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPatient(patient);
                    }}
                    className="h-8 px-3"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

PatientCard.displayName = "PatientCard";

const PatientsShadcn = memo(() => {
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [stats, setStats] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [genders, setGenders] = useState([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [profileStates, setProfileStates] = useState({});
  const [fetchingPhoneNumbers, setFetchingPhoneNumbers] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 patients per page

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Loading patients...");

      const [patientsResult, statsResult] = await Promise.all([
        getPatients(),
        getPatientStats(),
      ]);

      console.log("Patients result:", patientsResult);
      console.log("Stats result:", statsResult);

      if (patientsResult.success) {
        console.log("Setting patients:", patientsResult.data);
        if (patientsResult.data && patientsResult.data.length > 0) {
          setPatients(patientsResult.data);
          // Calculate stats from patients data
          const calculatedStats = calculateStats(patientsResult.data);
          setStats(calculatedStats);

          // Extract genders for dropdown
          if (calculatedStats.genders) {
            const genderList = Object.keys(calculatedStats.genders);
            setGenders(genderList);
          }
        } else {
          console.log("No patients found in database");
          setPatients([]);
          setStats({
            total: 0,
            verified: 0,
            pending: 0,
            genders: {},
            cities: {},
            states: {},
            averageHealthScore: 0,
            totalFamilyMembers: 0,
          });
        }
      } else {
        console.error("Failed to load patients:", patientsResult.error);
        setPatients([]);
        setStats({
          total: 0,
          verified: 0,
          pending: 0,
          genders: {},
          cities: {},
          states: {},
          averageHealthScore: 0,
          totalFamilyMembers: 0,
        });
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
      setStats({
        total: 0,
        verified: 0,
        pending: 0,
        genders: {},
        cities: {},
        states: {},
        averageHealthScore: 0,
        totalFamilyMembers: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (patientsData) => {
    const stats = {
      total: patientsData.length,
      verified: patientsData.filter((p) => (p.healthScore || 0) >= 80).length,
      pending: patientsData.filter((p) => (p.healthScore || 0) < 60).length,
      genders: {},
      cities: {},
      states: {},
      averageHealthScore: 0,
      totalFamilyMembers: 0,
    };

    patientsData.forEach((patient) => {
      // Genders
      if (patient.gender) {
        stats.genders[patient.gender] =
          (stats.genders[patient.gender] || 0) + 1;
      }

      // Cities
      if (patient.currentCity) {
        stats.cities[patient.currentCity] =
          (stats.cities[patient.currentCity] || 0) + 1;
      }

      // States
      if (patient.currentState) {
        stats.states[patient.currentState] =
          (stats.states[patient.currentState] || 0) + 1;
      }

      // Health score
      if (patient.healthScore && patient.healthScore > 0) {
        stats.averageHealthScore += patient.healthScore;
      }

      // Family members
      if (patient.familyMembers) {
        stats.totalFamilyMembers += patient.familyMembers.length;
      }
    });

    // Calculate average health score
    const patientsWithHealthScore = patientsData.filter(
      (p) => p.healthScore && p.healthScore > 0
    );
    if (patientsWithHealthScore.length > 0) {
      stats.averageHealthScore =
        stats.averageHealthScore / patientsWithHealthScore.length;
    }

    return stats;
  };

  const filterPatients = useCallback(() => {
    let filtered = patients;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.currentCity?.toLowerCase().includes(searchLower) ||
          patient.currentState?.toLowerCase().includes(searchLower) ||
          patient.phoneNumber?.includes(searchTerm) ||
          patient.whatsappNumber?.includes(searchTerm)
      );
    }

    // Filter by health status
    if (filterStatus === "verified") {
      filtered = filtered.filter((patient) => (patient.healthScore || 0) >= 80);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter((patient) => (patient.healthScore || 0) < 60);
    }

    // Filter by gender
    if (filterGender !== "all") {
      filtered = filtered.filter((patient) => patient.gender === filterGender);
    }

    return filtered;
  }, [patients, searchTerm, filterStatus, filterGender]);

  const filteredPatients = useMemo(() => filterPatients(), [filterPatients]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = useMemo(
    () => filteredPatients.slice(startIndex, endIndex),
    [filteredPatients, startIndex, endIndex]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterGender]);

  // Set filter status based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/patients/pending")) {
      setFilterStatus("pending");
    } else if (path.includes("/patients/verified")) {
      setFilterStatus("verified");
    } else {
      setFilterStatus("all");
    }
  }, [location.pathname]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setEditFormData({
      name: patient.name || "",
      phoneNumber: patient.phoneNumber || "",
      whatsappNumber: patient.whatsappNumber || "",
      email: patient.email || "",
      gender: patient.gender || "",
      currentCity: patient.currentCity || "",
      currentState: patient.currentState || "",
      healthScore: patient.healthScore || 0,
      familyMembers: patient.familyMembers || [],
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPatient) return;

    setEditLoading(true);
    try {
      // Here you would typically make an API call to update the patient
      // For now, we'll update the local state
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.uid === editingPatient.uid ? { ...p, ...editFormData } : p
        )
      );

      console.log("Patient updated:", editingPatient.uid, editFormData);
      alert("Patient information updated successfully!");
      setShowEditDialog(false);
      setEditingPatient(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Failed to update patient information. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleFetchPhoneNumber = async (patient) => {
    try {
      console.log("Fetching phone number for patient:", patient.uid);

      // Set loading state for this specific patient
      setFetchingPhoneNumbers((prev) => ({ ...prev, [patient.uid]: true }));

      // Use the new client-side phone service
      const result = await fetchPhoneNumber(patient.uid);

      if (result.success && result.phoneNumber) {
        // Update the patient in the local state
        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p.uid === patient.uid
              ? {
                ...p,
                phoneNumber: result.phoneNumber,
                whatsappNumber: result.phoneNumber,
              }
              : p
          )
        );

        console.log("Phone number fetched and updated:", result.phoneNumber);
        alert(`Phone number fetched successfully: ${result.phoneNumber}`);
      } else {
        console.error("Phone number fetch failed:", result.error);
        alert(result.error || "Failed to fetch phone number");
      }
    } catch (error) {
      console.error("Error fetching phone number:", error);
      alert(`Failed to fetch phone number: ${error.message}`);
    } finally {
      // Clear loading state
      setFetchingPhoneNumbers((prev) => ({ ...prev, [patient.uid]: false }));
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedImageTitle("");
  };

  const openImageModal = (imageUrl, title) => {
    setSelectedImage(imageUrl);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  const getDisplayName = useCallback((patient) => {
    return patient.name || "Unknown Patient";
  }, []);

  const getStatusBadge = useCallback((patient) => {
    // For patients, we can show health score status instead of verification
    const healthScore = patient.healthScore || 0;
    if (healthScore >= 80) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <Star className="h-3 w-3 mr-1" />
          Excellent Health
        </Badge>
      );
    } else if (healthScore >= 60) {
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Star className="h-3 w-3 mr-1" />
          Good Health
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <Star className="h-3 w-3 mr-1" />
          Needs Attention
        </Badge>
      );
    }
  }, []);

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const getPageTitle = useCallback(() => {
    switch (filterStatus) {
      case "verified":
        return "Healthy Patients";
      case "pending":
        return "Patients Needing Attention";
      default:
        return "All Patients";
    }
  }, [filterStatus]);

  const getPageDescription = useCallback(() => {
    switch (filterStatus) {
      case "verified":
        return "Patients with good health scores (80+)";
      case "pending":
        return "Patients with health scores below 60";
      default:
        return "Complete list of all registered patients";
    }
  }, [filterStatus]);

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading Patients..." />;
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>

      {/* Page Header */}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={14} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.4px" }}>{getPageTitle()}</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{getPageDescription()}</p>
        </div>
        {stats && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: stats.total, color: "#6366f1", bg: "#e0e7ff" },
              { label: "Healthy (80+)", value: stats.verified, color: "#10b981", bg: "#d1fae5" },
              { label: "Needs Attention", value: stats.pending, color: "#f59e0b", bg: "#fef3c7" },
              { label: "Avg Health", value: `${Math.round(stats.averageHealthScore || 0)}`, color: "#3b82f6", bg: "#dbeafe" },
            ].map(s => (
              <div key={s.label} style={{ padding: "6px 14px", borderRadius: 20, background: s.bg, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${s.color}22` }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#93c5fd" }} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, city or phone…"
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 12.5, color: "#1e3a5f", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "white"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; }}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger style={{ width: 168, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Health Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            <SelectItem value="verified">Healthy (80+)</SelectItem>
            <SelectItem value="pending">Needs Attention (&lt;60)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterGender} onValueChange={setFilterGender}>
          <SelectTrigger style={{ width: 140, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            {genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => { setSearchTerm(""); setFilterStatus("all"); setFilterGender("all"); }}
          style={{ height: 36, padding: "0 14px", borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "Inter,sans-serif", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.color = "#1e3a5f"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#64748b"; }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredPatients.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <User size={40} style={{ color: "#c7d2fe", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>No patients found</p>
            <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
                <thead>
                  <tr style={{ background: "#f8fbff", borderBottom: "1.5px solid #e0f2fe" }}>
                    {["Patient", "Gender", "Health Score", "Location", "Contact", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient, idx) => {
                    const hs = patient?.healthScore || 0;
                    const hsColor = hs >= 80 ? "#10b981" : hs >= 60 ? "#3b82f6" : "#f59e0b";
                    return (
                      <tr
                        key={patient.uid}
                        style={{ borderBottom: "1px solid #f0f7ff", background: idx % 2 === 0 ? "white" : "#fafcff", transition: "background 0.15s", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafcff"}
                        onClick={() => handleViewDetails(patient)}
                      >
                        {/* Patient Name + Avatar */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar style={{ width: 34, height: 34, flexShrink: 0 }}>
                              <AvatarImage src={patient?.profileImage} />
                              <AvatarFallback style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 12, fontWeight: 700 }}>
                                {getDisplayName(patient)?.[0] || "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{getDisplayName(patient)}</p>
                              <p style={{ margin: 0, fontSize: 10.5, color: "#94a3b8" }}>{patient?.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        {/* Gender */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 12.5, color: "#64748b" }}>{patient?.gender || "—"}</span>
                        </td>
                        {/* Health Score */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 50, height: 6, borderRadius: 3, background: "#e0f2fe", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${hs}%`, background: hsColor, borderRadius: 3, transition: "width 0.4s ease" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: hsColor }}>{hs}</span>
                          </div>
                        </td>
                        {/* Location */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 12.5, color: "#64748b" }}>{[patient?.currentCity, patient?.currentState].filter(Boolean).join(", ") || "—"}</span>
                        </td>
                        {/* Contact */}
                        <td style={{ padding: "12px 14px" }}>
                          {patient?.phoneNumber ? (
                            <span style={{ fontSize: 12.5, color: "#334155" }}>{patient.phoneNumber}</span>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); handleFetchPhoneNumber(patient); }}
                              disabled={fetchingPhoneNumbers[patient.uid]}
                              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, border: "1px solid #c7d2fe", background: "#f5f3ff", color: "#6366f1", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 4 }}
                            >
                              {fetchingPhoneNumbers[patient.uid] ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : null}
                              Fetch Phone
                            </button>
                          )}
                        </td>
                        {/* Status */}
                        <td style={{ padding: "12px 14px" }}>{getStatusBadge(patient)}</td>
                        {/* Actions */}
                        <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleViewDetails(patient)}
                              style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #c7d2fe", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "#6366f1"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                            >
                              <Eye size={13} color="#6366f1" />
                            </button>
                            <button
                              onClick={() => handleEditPatient(patient)}
                              style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #bfdbfe", background: "#f0f7ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                            >
                              <Edit size={13} color="#3b82f6" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f0f7ff" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Showing {startIndex + 1}–{Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #bfdbfe", background: currentPage === 1 ? "#f8fbff" : "white", fontSize: 12, color: currentPage === 1 ? "#94a3b8" : "#6366f1", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif" }}
                  >← Prev</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = totalPages <= 5 ? i + 1 : Math.max(1, currentPage - 2) + i;
                    if (page > totalPages) return null;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${currentPage === page ? "#6366f1" : "#bfdbfe"}`, background: currentPage === page ? "#6366f1" : "white", color: currentPage === page ? "white" : "#334155", fontSize: 12, fontWeight: currentPage === page ? 700 : 400, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #bfdbfe", background: currentPage === totalPages ? "#f8fbff" : "white", fontSize: 12, color: currentPage === totalPages ? "#94a3b8" : "#6366f1", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif" }}
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Patient Detail Dialog - Compact Dashboard Style */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent style={{ maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: "0", borderRadius: 14, border: "1.5px solid #e0e7ff" }}>
          {selectedPatient && (
            <>
              {/* Header */}
              <div style={{ padding: "16px 20px 14px", background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", borderBottom: "1px solid #ddd6fe", borderRadius: "14px 14px 0 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar style={{ width: 40, height: 40, flexShrink: 0 }}>
                    <AvatarImage src={selectedPatient?.profileImage} />
                    <AvatarFallback style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 14, fontWeight: 700 }}>
                      {selectedPatient?.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>{getDisplayName(selectedPatient)}</span>
                      {getStatusBadge(selectedPatient)}
                    </div>
                    <span style={{ fontSize: 11.5, color: "#64748b" }}>
                      {selectedPatient?.gender || "—"}
                      {selectedPatient?.currentCity ? ` · ${selectedPatient.currentCity}` : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => { setShowDetailsDialog(false); handleEditPatient(selectedPatient); }}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #d0d9ff", background: "white", fontSize: 11.5, color: "#6366f1", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" }}
                  >
                    <Edit size={11} /> Edit
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Contact */}
                <div style={{ background: "#f8fbff", borderRadius: 9, border: "1px solid #e0e7ff", overflow: "hidden" }}>
                  <div style={{ padding: "6px 12px", background: "#f5f3ff", borderBottom: "1px solid #e0e7ff" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>Contact</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {[
                      { label: "UID", value: selectedPatient?.uid?.slice(0, 14) + "…" || "N/A" },
                      { label: "Phone", value: selectedPatient?.phoneNumber || "—" },
                      { label: "WhatsApp", value: selectedPatient?.whatsappNumber || "—" },
                      { label: "Email", value: selectedPatient?.email || "—" },
                    ].map((row, i) => (
                      <div key={row.label} style={{ display: "flex", flexDirection: "column", padding: "7px 12px", borderTop: i >= 2 ? "1px solid #ede9fe" : "none", borderLeft: i % 2 === 1 ? "1px solid #ede9fe" : "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.3px" }}>{row.label}</span>
                        <span style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 500, wordBreak: "break-word" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health & Location */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {/* Health Score */}
                  <div style={{ background: "#f8fbff", borderRadius: 9, border: "1px solid #e0e7ff", overflow: "hidden" }}>
                    <div style={{ padding: "6px 12px", background: "#f5f3ff", borderBottom: "1px solid #e0e7ff" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>Health Score</span>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      {(() => {
                        const hs = selectedPatient?.healthScore || 0;
                        const color = hs >= 80 ? "#10b981" : hs >= 60 ? "#3b82f6" : "#f59e0b";
                        return (
                          <>
                            <span style={{ fontSize: 22, fontWeight: 800, color }}>{hs}<span style={{ fontSize: 12, color: "#94a3b8" }}>/100</span></span>
                            <div style={{ marginTop: 6, height: 5, borderRadius: 3, background: "#e0f2fe", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${hs}%`, background: color, borderRadius: 3 }} />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Location */}
                  <div style={{ background: "#f8fbff", borderRadius: 9, border: "1px solid #e0e7ff", overflow: "hidden" }}>
                    <div style={{ padding: "6px 12px", background: "#f5f3ff", borderBottom: "1px solid #e0e7ff" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>Location</span>
                    </div>
                    <div style={{ padding: "7px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        { label: "City", value: selectedPatient?.currentCity || "—" },
                        { label: "State", value: selectedPatient?.currentState || "—" },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{row.label}</span>
                          <span style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div style={{ background: "#f8fbff", borderRadius: 9, border: "1px solid #e0e7ff", overflow: "hidden" }}>
                  <div style={{ padding: "6px 12px", background: "#f5f3ff", borderBottom: "1px solid #e0e7ff" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>Account</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {[
                      { label: "Joined", value: formatDate(selectedPatient?.dateOfAccountCreation) },
                      { label: "Family Members", value: selectedPatient?.familyMembers?.length || 0 },
                      { label: "Status", value: selectedPatient?.isAccountVerified ? "Verified" : "Pending" },
                    ].map((row, i) => (
                      <div key={row.label} style={{ display: "flex", flexDirection: "column", padding: "7px 12px", borderTop: i >= 2 ? "1px solid #ede9fe" : "none", borderLeft: i % 2 === 1 ? "1px solid #ede9fe" : "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.3px" }}>{row.label}</span>
                        <span style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 500 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "10px 20px", borderTop: "1px solid #e0e7ff", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowDetailsDialog(false)}
                  style={{ padding: "6px 16px", borderRadius: 8, border: "1.5px solid #d0d9ff", background: "white", fontSize: 12, color: "#64748b", cursor: "pointer", fontFamily: "Inter,sans-serif" }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImageTitle}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt={selectedImageTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeImageModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
            <DialogDescription>
              Update patient details and save changes
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Patient's full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender *</label>
                  <Input
                    value={editFormData.gender}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value,
                      })
                    }
                    placeholder="Male/Female/Other"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={editFormData.phoneNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    WhatsApp Number
                  </label>
                  <Input
                    value={editFormData.whatsappNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        whatsappNumber: e.target.value,
                      })
                    }
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    placeholder="patient@example.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={editFormData.currentCity}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        currentCity: e.target.value,
                      })
                    }
                    placeholder="Current city"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={editFormData.currentState}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        currentState: e.target.value,
                      })
                    }
                    placeholder="Current state"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Health Score</label>
                  <Input
                    value={editFormData.healthScore}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        healthScore: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0-100"
                    type="number"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

PatientsShadcn.displayName = "PatientsShadcn";

export default PatientsShadcn;
