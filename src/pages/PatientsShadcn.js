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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Patients...</h3>
            <p className="text-muted-foreground text-center">
              Fetching patient data from Soocher
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{getPageTitle()}</h1>
                <p className="text-green-100 text-lg">{getPageDescription()}</p>
              </div>
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.total}
                      </div>
                      <div className="text-green-100 text-sm">
                        Total Patients
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.verified}
                      </div>
                      <div className="text-green-100 text-sm">
                        Healthy (80+)
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.pending}
                      </div>
                      <div className="text-green-100 text-sm">
                        Needs Attention
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(stats.averageHealthScore || 0)}
                      </div>
                      <div className="text-green-100 text-sm">
                        Avg Health Score
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search patients by name, email, city, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Patients</SelectItem>
                      <SelectItem value="verified">Healthy (80+)</SelectItem>
                      <SelectItem value="pending">
                        Needs Attention (&lt;60)
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterGender} onValueChange={setFilterGender}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterGender("all");
                  }}
                  className="h-12 px-6"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="space-y-6">
          {filteredPatients.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {filterStatus === "pending"
                    ? "No patients need attention"
                    : filterStatus === "verified"
                    ? "No healthy patients found"
                    : "No patients found"}
                </h3>
                <p className="text-muted-foreground">
                  {filterStatus === "pending"
                    ? "All patients have good health scores"
                    : filterStatus === "verified"
                    ? "No patients with health scores 80+ found"
                    : "Try adjusting your search or filter criteria"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPatients.map((patient) => (
                  <PatientCard
                    key={patient.uid}
                    patient={patient}
                    onViewDetails={handleViewDetails}
                    onEditPatient={handleEditPatient}
                    onFetchPhoneNumber={handleFetchPhoneNumber}
                    fetchingPhoneNumbers={fetchingPhoneNumbers}
                    getStatusBadge={getStatusBadge}
                    getDisplayName={getDisplayName}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {(() => {
                      const pages = [];
                      const showEllipsis = totalPages > 7;

                      if (showEllipsis) {
                        // Always show first 2 pages
                        for (let i = 1; i <= 2; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={
                                currentPage === i ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              className="w-8 h-8 p-0"
                            >
                              {i}
                            </Button>
                          );
                        }

                        // Show ellipsis if current page is far from start
                        if (currentPage > 4) {
                          pages.push(
                            <span
                              key="ellipsis-start"
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }

                        // Show current page and surrounding pages
                        const startPage = Math.max(3, currentPage - 1);
                        const endPage = Math.min(
                          totalPages - 2,
                          currentPage + 1
                        );

                        for (let i = startPage; i <= endPage; i++) {
                          if (i > 2 && i < totalPages - 1) {
                            pages.push(
                              <Button
                                key={i}
                                variant={
                                  currentPage === i ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="w-8 h-8 p-0"
                              >
                                {i}
                              </Button>
                            );
                          }
                        }

                        // Show ellipsis if current page is far from end
                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span
                              key="ellipsis-end"
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }

                        // Always show last 2 pages
                        for (let i = totalPages - 1; i <= totalPages; i++) {
                          if (i > 2) {
                            pages.push(
                              <Button
                                key={i}
                                variant={
                                  currentPage === i ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="w-8 h-8 p-0"
                              >
                                {i}
                              </Button>
                            );
                          }
                        }
                      } else {
                        // Show all pages if total is 7 or less
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={
                                currentPage === i ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              className="w-8 h-8 p-0"
                            >
                              {i}
                            </Button>
                          );
                        }
                      }

                      return pages;
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Results info */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredPatients.length)} of{" "}
                {filteredPatients.length} patients
              </div>
            </>
          )}
        </div>

        {/* Patient Detail Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected patient
              </DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedPatient?.profileImage} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-2xl font-semibold">
                      {selectedPatient?.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {getDisplayName(selectedPatient)}
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      {selectedPatient?.gender}
                    </p>
                    {getStatusBadge(selectedPatient)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          UID: {selectedPatient?.uid || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {selectedPatient?.phoneNumber || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedPatient?.email || "Not provided"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {selectedPatient?.currentCity || "N/A"},{" "}
                          {selectedPatient?.currentState || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Health Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">Health Score:</span>
                        <span className="ml-2">
                          {selectedPatient?.healthScore || 0}/100
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Family Members:</span>
                        <span className="ml-2">
                          {selectedPatient?.familyMembers?.length || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">Joined:</span>
                        <span className="ml-2">
                          {formatDate(selectedPatient?.dateOfAccountCreation)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className="ml-2">
                          {selectedPatient?.isAccountVerified
                            ? "Verified"
                            : "Pending"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
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
    </div>
  );
});

PatientsShadcn.displayName = "PatientsShadcn";

export default PatientsShadcn;
