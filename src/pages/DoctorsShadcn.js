import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  UserCheck,
  Eye,
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
  User,
  Edit,
} from "lucide-react";
import {
  getDoctors,
  getDoctorStats,
  verifyDoctor,
} from "../services/doctorService";
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

// Memoized Doctor Card Component for better performance
const DoctorCard = memo(
  ({
    doctor,
    onViewDetails,
    onEditDoctor,
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
          onClick={() => onViewDetails(doctor)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor?.profileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                    {getDisplayName(doctor)?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {getDisplayName(doctor)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {doctor?.specialization}
                  </p>
                </div>
              </div>
              {getStatusBadge(doctor)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {doctor?.currentCity}, {doctor?.currentState}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span>UID: {doctor?.uid || "N/A"}</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                {doctor?.phoneNumber || doctor?.whatsappNumber ? (
                  <span>{doctor?.phoneNumber || doctor?.whatsappNumber}</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFetchPhoneNumber(doctor);
                    }}
                    disabled={fetchingPhoneNumbers[doctor.uid]}
                    className="h-6 px-2 text-xs"
                  >
                    {fetchingPhoneNumbers[doctor.uid] ? (
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

              {!doctor?.phoneNumber && !doctor?.whatsappNumber && (
                <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  May be using Google/Apple Sign-In
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>Joined {formatDate(doctor?.dateOfAccountCreation)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex space-x-4 text-sm">
                  <span className="font-medium">
                    Rating: {doctor?.averageRating || "N/A"}
                  </span>
                  <span className="font-medium">
                    Fees: ₹{doctor?.consultationFees || "N/A"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDoctor(doctor);
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

DoctorCard.displayName = "DoctorCard";

const DoctorsShadcn = memo(() => {
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [stats, setStats] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMciNumber, setVerificationMciNumber] = useState("");
  const [verificationOnlineConsultations, setVerificationOnlineConsultations] =
    useState("");
  const [
    verificationOfflineConsultations,
    setVerificationOfflineConsultations,
  ] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [profileStates, setProfileStates] = useState({});
  const [fetchingPhoneNumbers, setFetchingPhoneNumbers] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 doctors per page

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Loading doctors...");

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
              uid: "07TmVeXYDHbGUF5X1fRdLPzUYWK2",
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
              uid: "0QsvwGQLngQr7SAsyHHPlwhaVxe2",
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
            {
              uid: "0SV50V6j3wMkhAcawbCW5QTBiYd2",
              name: "Dr. Michael Brown",
              specialization: "Dermatology",
              phoneNumber: null,
              whatsappNumber: null,
              email: "michael.brown@example.com",
              currentCity: "Chicago",
              currentState: "IL",
              isAccountVerified: true,
              averageRating: 4.8,
              numOnline: "80+",
              numOffline: "120+",
              consultationFees: "250",
              accountCreationDate: Date.now() - 259200000,
              profileImage: null,
              mciNumber: "54321",
              worksAt: "City Medical Center",
              aboutMe:
                "Experienced dermatologist with expertise in cosmetic and medical dermatology. Specializing in skin cancer detection and treatment, acne management, and anti-aging treatments. Committed to providing personalized care and staying updated with the latest dermatological advances.",
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
          {
            uid: "mock3",
            name: "Dr. Michael Brown",
            specialization: "Dermatology",
            phoneNumber: null,
            whatsappNumber: null,
            email: "michael.brown@example.com",
            currentCity: "Chicago",
            currentState: "IL",
            isAccountVerified: true,
            averageRating: 4.8,
            numOnline: "80+",
            numOffline: "120+",
            consultationFees: "250",
            accountCreationDate: Date.now() - 259200000,
            profileImage: null,
            mciNumber: "54321",
            worksAt: "City Medical Center",
            aboutMe:
              "Experienced dermatologist with expertise in cosmetic and medical dermatology. Specializing in skin cancer detection and treatment, acne management, and anti-aging treatments. Committed to providing personalized care and staying updated with the latest dermatological advances.",
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
  }, []);

  const filterDoctors = useCallback(() => {
    let filtered = doctors;
    console.log(
      "Filtering doctors with status:",
      filterStatus,
      "Total doctors:",
      doctors.length
    );

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor?.name?.toLowerCase().includes(searchLower) ||
          doctor?.specialization?.toLowerCase().includes(searchLower) ||
          doctor?.currentCity?.toLowerCase().includes(searchLower) ||
          doctor?.mciNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filterStatus === "verified") {
      filtered = filtered.filter((doctor) => doctor?.isAccountVerified);
      console.log("After verified filter:", filtered.length);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(
        (doctor) =>
          doctor?.documentsSubmitted === true &&
          doctor?.isAccountVerified === false
      );
      console.log("After pending filter:", filtered.length);
    } else if (filterStatus === "no-documents") {
      filtered = filtered.filter(
        (doctor) => doctor?.documentsSubmitted !== true
      );
      console.log("After no-documents filter:", filtered.length);
    }

    // Specialty filter
    if (filterSpecialty !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor?.specialization === filterSpecialty
      );
    }

    console.log("Final filtered doctors:", filtered.length);
    return filtered;
  }, [doctors, searchTerm, filterStatus, filterSpecialty]);

  // Memoized filtered doctors
  const filteredDoctors = useMemo(() => filterDoctors(), [filterDoctors]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDoctors = useMemo(
    () => filteredDoctors.slice(startIndex, endIndex),
    [filteredDoctors, startIndex, endIndex]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterSpecialty]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Set filter based on URL path
  useEffect(() => {
    const path = location.pathname;
    console.log("Current path:", path);
    if (path === "/doctors/pending") {
      setFilterStatus("pending");
      console.log("Set filter to pending");
    } else if (path === "/doctors/verified") {
      setFilterStatus("verified");
      console.log("Set filter to verified");
    } else if (path === "/doctors/all" || path === "/doctors") {
      setFilterStatus("all");
      console.log("Set filter to all");
    }
  }, [location.pathname]);

  const handleVerifyDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setVerificationMciNumber(doctor.mciNumber || "");
    setVerificationOnlineConsultations(doctor.numOnline || "");
    setVerificationOfflineConsultations(doctor.numOffline || "");
    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = async () => {
    if (!verificationMciNumber.trim()) {
      alert("Please enter MCI Number");
      return;
    }

    if (!verificationOnlineConsultations.trim()) {
      alert("Please enter Online Consultations count");
      return;
    }

    if (!verificationOfflineConsultations.trim()) {
      alert("Please enter Offline Consultations count");
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
                  numOnline: verificationOnlineConsultations,
                  numOffline: verificationOfflineConsultations,
                }
              : doctor
          )
        );
        setShowVerificationModal(false);
        setVerificationMciNumber("");
        setVerificationOnlineConsultations("");
        setVerificationOfflineConsultations("");
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

  const handleFetchPhoneNumber = async (doctor) => {
    try {
      console.log("Fetching phone number for doctor:", doctor.uid);

      // Set loading state for this specific doctor
      setFetchingPhoneNumbers((prev) => ({ ...prev, [doctor.uid]: true }));

      // Use the new client-side phone service
      const result = await fetchPhoneNumber(doctor.uid);

      if (result.success && result.phoneNumber) {
        // Update the doctor in the local state
        setDoctors((prevDoctors) =>
          prevDoctors.map((d) =>
            d.uid === doctor.uid
              ? {
                  ...d,
                  phoneNumber: result.phoneNumber,
                  whatsappNumber: result.phoneNumber,
                }
              : d
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
      setFetchingPhoneNumbers((prev) => ({ ...prev, [doctor.uid]: false }));
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setEditFormData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      phoneNumber: doctor.phoneNumber || "",
      whatsappNumber: doctor.whatsappNumber || "",
      email: doctor.email || "",
      currentCity: doctor.currentCity || "",
      currentState: doctor.currentState || "",
      worksAt: doctor.worksAt || "",
      mciNumber: doctor.mciNumber || "",
      consultationFees: doctor.consultationFees || "",
      aboutMe: doctor.aboutMe || "",
      averageRating: doctor.averageRating || 0,
      numOnline: doctor.numOnline || "",
      numOffline: doctor.numOffline || "",
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDoctor) return;

    setEditLoading(true);
    try {
      // Here you would typically make an API call to update the doctor
      // For now, we'll update the local state
      setDoctors((prevDoctors) =>
        prevDoctors.map((d) =>
          d.uid === editingDoctor.uid ? { ...d, ...editFormData } : d
        )
      );

      console.log("Doctor updated:", editingDoctor.uid, editFormData);
      alert("Doctor information updated successfully!");
      setShowEditDialog(false);
      setEditingDoctor(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert("Failed to update doctor information. Please try again.");
    } finally {
      setEditLoading(false);
    }
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
    const total = doctorsList?.length || 0;
    const verified =
      doctorsList?.filter((doctor) => doctor?.isAccountVerified).length || 0;
    const pending =
      doctorsList?.filter(
        (doctor) =>
          doctor?.documentsSubmitted === true &&
          doctor?.isAccountVerified === false
      ).length || 0;
    const noDocuments =
      doctorsList?.filter((doctor) => doctor?.documentsSubmitted !== true)
        .length || 0;

    // Calculate specializations
    const specializations = {};
    doctorsList?.forEach((doctor) => {
      if (doctor?.specialization) {
        specializations[doctor.specialization] =
          (specializations[doctor.specialization] || 0) + 1;
      }
    });

    // Calculate cities
    const cities = {};
    doctorsList?.forEach((doctor) => {
      if (doctor?.currentCity) {
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

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  }, []);

  const getDisplayName = useCallback((doctor) => {
    const name = doctor?.name || "Unknown Doctor";
    // Don't add "Dr." prefix for Psychology specialty doctors
    if (doctor?.specialization === "Psychology") {
      return name;
    }
    return `Dr. ${name}`;
  }, []);

  const getStatusBadge = useCallback((doctor) => {
    if (doctor?.isAccountVerified) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    } else if (
      doctor?.documentsSubmitted === true &&
      doctor?.isAccountVerified === false
    ) {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          No Documents
        </Badge>
      );
    }
  }, []);

  const getPageTitle = useCallback(() => {
    const path = location.pathname;
    if (path === "/doctors/pending") {
      return "Pending Verification";
    } else if (path === "/doctors/verified") {
      return "Verified Doctors";
    } else if (path === "/doctors/all") {
      return "All Doctors";
    }
    return "Doctor Management";
  }, [location.pathname]);

  const getPageDescription = useCallback(() => {
    const path = location.pathname;
    if (path === "/doctors/pending") {
      return "Review and verify doctor applications";
    } else if (path === "/doctors/verified") {
      return "View all verified doctor accounts";
    } else if (path === "/doctors/all") {
      return "Manage all doctor accounts";
    }
    return "Manage and verify doctor accounts";
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Doctors...</h3>
            <p className="text-muted-foreground text-center">
              Fetching doctor data from Soocher
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{getPageTitle()}</h1>
                <p className="text-blue-100 text-lg">{getPageDescription()}</p>
              </div>
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.total}
                      </div>
                      <div className="text-blue-100 text-sm">Total Doctors</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.verified}
                      </div>
                      <div className="text-blue-100 text-sm">Verified</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.pending}
                      </div>
                      <div className="text-blue-100 text-sm">Pending</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.noDocuments}
                      </div>
                      <div className="text-blue-100 text-sm">No Documents</div>
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
                  placeholder="Search doctors by name, specialization, city, or MCI number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-12">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">
                        Pending Verification
                      </SelectItem>
                      <SelectItem value="no-documents">
                        Documents Not Submitted
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterSpecialty}
                    onValueChange={setFilterSpecialty}
                  >
                    <SelectTrigger className="h-12">
                      <UserCheck className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem
                          key={specialty.value}
                          value={specialty.value}
                        >
                          {specialty.label} ({specialty.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    disabled={
                      searchTerm === "" &&
                      filterStatus === "all" &&
                      filterSpecialty === "all"
                    }
                    className="h-12"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        <div className="space-y-6">
          {filteredDoctors.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {filterStatus === "pending"
                    ? "No pending verifications"
                    : filterStatus === "verified"
                    ? "No verified doctors"
                    : "No doctors found"}
                </h3>
                <p className="text-muted-foreground">
                  {filterStatus === "pending"
                    ? "All doctor applications have been processed"
                    : filterStatus === "verified"
                    ? "No doctors have been verified yet"
                    : "Try adjusting your search or filter criteria"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.uid}
                  doctor={doctor}
                  onViewDetails={handleViewDetails}
                  onEditDoctor={handleEditDoctor}
                  onFetchPhoneNumber={handleFetchPhoneNumber}
                  fetchingPhoneNumbers={fetchingPhoneNumbers}
                  getStatusBadge={getStatusBadge}
                  getDisplayName={getDisplayName}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                          variant={currentPage === i ? "default" : "outline"}
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
                    const endPage = Math.min(totalPages - 2, currentPage + 1);

                    for (let i = startPage; i <= endPage; i++) {
                      if (i > 2 && i < totalPages - 1) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
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
                        <span key="ellipsis-end" className="px-2 text-gray-500">
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
                            variant={currentPage === i ? "default" : "outline"}
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
                          variant={currentPage === i ? "default" : "outline"}
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
            {Math.min(endIndex, filteredDoctors.length)} of{" "}
            {filteredDoctors.length} doctors
          </div>
        </div>

        {/* Doctor Detail Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Doctor Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected doctor
              </DialogDescription>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedDoctor?.profileImage} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                      {selectedDoctor?.name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {getDisplayName(selectedDoctor)}
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      {selectedDoctor?.specialization}
                    </p>
                    {getStatusBadge(selectedDoctor)}
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
                          UID: {selectedDoctor?.uid || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {selectedDoctor?.phoneNumber || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedDoctor?.email || "Not provided"}</span>
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
                          {selectedDoctor?.currentCity || "N/A"},{" "}
                          {selectedDoctor?.currentState || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Professional Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">MCI Number:</span>
                        <span className="ml-2">
                          {selectedDoctor?.mciNumber || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Works At:</span>
                        <span className="ml-2">
                          {selectedDoctor?.worksAt || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Consultation Fee:</span>
                        <span className="ml-2">
                          ₹{selectedDoctor?.consultationFees || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-40 overflow-y-auto">
                        <p className="text-muted-foreground whitespace-pre-wrap break-words">
                          {selectedDoctor?.aboutMe || "No description provided"}
                        </p>
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

        {/* Verification Dialog */}
        <Dialog
          open={showVerificationModal}
          onOpenChange={setShowVerificationModal}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <UserCheck className="h-6 w-6 mr-2" />
                Verify Doctor
              </DialogTitle>
              <DialogDescription>
                Review documents and complete verification process
              </DialogDescription>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Doctor Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedDoctor?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                          {selectedDoctor?.name?.charAt(0) || "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {getDisplayName(selectedDoctor)}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedDoctor?.specialization}
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {selectedDoctor?.currentCity},{" "}
                            {selectedDoctor?.currentState}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {selectedDoctor?.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Verification Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Aadhar Card - Front
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDoctor?.aadharFrontUrl ? (
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  openImageModal(
                                    selectedDoctor.aadharFrontUrl,
                                    "Aadhar Card - Front"
                                  )
                                }
                                className="h-full w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Document
                              </Button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Aadhar Card - Back
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDoctor?.aadharBackUrl ? (
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  openImageModal(
                                    selectedDoctor.aadharBackUrl,
                                    "Aadhar Card - Back"
                                  )
                                }
                                className="h-full w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Document
                              </Button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            MCI Certificate
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDoctor?.mciUploadUrl ? (
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  openImageModal(
                                    selectedDoctor.mciUploadUrl,
                                    "MCI Certificate"
                                  )
                                }
                                className="h-full w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Document
                              </Button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Verification Details
                    </CardTitle>
                    <CardDescription>
                      Enter the required information to complete verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="mciNumber"
                          className="text-sm font-medium"
                        >
                          MCI Number *
                        </label>
                        <Input
                          id="mciNumber"
                          value={verificationMciNumber}
                          onChange={(e) =>
                            setVerificationMciNumber(e.target.value)
                          }
                          placeholder="Enter MCI Number (e.g., 12345)"
                          className="h-12"
                        />
                        <p className="text-xs text-muted-foreground flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          This number will be verified against official records
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="onlineConsultations"
                          className="text-sm font-medium"
                        >
                          Online Consultations *
                        </label>
                        <Input
                          id="onlineConsultations"
                          value={verificationOnlineConsultations}
                          onChange={(e) =>
                            setVerificationOnlineConsultations(e.target.value)
                          }
                          placeholder="Number of online consultations"
                          className="h-12"
                          type="number"
                          min="0"
                        />
                        <p className="text-xs text-muted-foreground flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Total online consultations conducted
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="offlineConsultations"
                          className="text-sm font-medium"
                        >
                          Offline Consultations *
                        </label>
                        <Input
                          id="offlineConsultations"
                          value={verificationOfflineConsultations}
                          onChange={(e) =>
                            setVerificationOfflineConsultations(e.target.value)
                          }
                          placeholder="Number of offline consultations"
                          className="h-12"
                          type="number"
                          min="0"
                        />
                        <p className="text-xs text-muted-foreground flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Total offline consultations conducted
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeVerificationModal}
                disabled={verificationLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleVerificationSubmit}
                disabled={verificationLoading || !verificationMciNumber.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {verificationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying Doctor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Doctor
                  </>
                )}
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

        {/* Edit Doctor Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Doctor Information</DialogTitle>
              <DialogDescription>
                Update doctor details and save changes
              </DialogDescription>
            </DialogHeader>
            {editingDoctor && (
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
                      placeholder="Doctor's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Specialization *
                    </label>
                    <Input
                      value={editFormData.specialization}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="Medical specialization"
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
                      placeholder="doctor@example.com"
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
                    <label className="text-sm font-medium">Works At</label>
                    <Input
                      value={editFormData.worksAt}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          worksAt: e.target.value,
                        })
                      }
                      placeholder="Hospital/Clinic name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">MCI Number</label>
                    <Input
                      value={editFormData.mciNumber}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          mciNumber: e.target.value,
                        })
                      }
                      placeholder="Medical Council registration number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Consultation Fee (₹)
                    </label>
                    <Input
                      value={editFormData.consultationFees}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          consultationFees: e.target.value,
                        })
                      }
                      placeholder="Consultation fee amount"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Average Rating
                    </label>
                    <Input
                      value={editFormData.averageRating}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          averageRating: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0-5"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Online Consultations
                    </label>
                    <Input
                      value={editFormData.numOnline}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          numOnline: e.target.value,
                        })
                      }
                      placeholder="Number of online consultations"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Offline Consultations
                    </label>
                    <Input
                      value={editFormData.numOffline}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          numOffline: e.target.value,
                        })
                      }
                      placeholder="Number of offline consultations"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">About Me</label>
                  <textarea
                    value={editFormData.aboutMe}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        aboutMe: e.target.value,
                      })
                    }
                    placeholder="Doctor's bio and description"
                    className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
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
                className="bg-blue-600 hover:bg-blue-700"
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

DoctorsShadcn.displayName = "DoctorsShadcn";

export default DoctorsShadcn;
