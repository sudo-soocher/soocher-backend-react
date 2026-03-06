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
  Briefcase,
  Building2,
  Globe,
  CreditCard,
  Award,
  Languages,
  Stethoscope,
  IndianRupee,
  Image,
  ExternalLink,
} from "lucide-react";
import {
  getDoctors,
  getDoctorStats,
  verifyDoctor,
  toggleDoctorVerification,
  updateDoctor,
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
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";

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
    onToggleVerification,
    togglingVerification,
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
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Verified</span>
                    <Switch
                      checked={doctor?.isAccountVerified || false}
                      onCheckedChange={(checked) => {
                        onToggleVerification(doctor, checked);
                      }}
                      disabled={togglingVerification[doctor.uid]}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
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
  const [fetchingPhoneNumbers, setFetchingPhoneNumbers] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 doctors per page
  const [togglingVerification, setTogglingVerification] = useState({});

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

  const handleToggleVerification = async (doctor, isVerified) => {
    const doctorId = doctor.uid;

    // Set loading state for this specific doctor
    setTogglingVerification((prev) => ({ ...prev, [doctorId]: true }));

    try {
      const result = await toggleDoctorVerification(doctorId, isVerified);

      if (result.success) {
        // Update the doctor in the local state
        setDoctors((prevDoctors) =>
          prevDoctors.map((d) =>
            d.uid === doctorId ? { ...d, isAccountVerified: isVerified } : d
          )
        );

        // Update stats if available
        if (stats) {
          const newStats = { ...stats };
          if (isVerified) {
            newStats.verified = (newStats.verified || 0) + 1;
            newStats.pending = Math.max((newStats.pending || 0) - 1, 0);
          } else {
            newStats.verified = Math.max((newStats.verified || 0) - 1, 0);
            newStats.pending = (newStats.pending || 0) + 1;
          }
          setStats(newStats);
        }

        console.log(
          `Doctor ${doctorId} ${isVerified ? "verified" : "unverified"
          } successfully`
        );
      } else {
        console.error("Error toggling verification:", result.error);
        alert(
          `Error ${isVerified ? "verifying" : "unverifying"} doctor: ${result.error
          }`
        );
        // Revert the switch state on error
      }
    } catch (error) {
      console.error("Error toggling verification:", error);
      alert(
        `Failed to ${isVerified ? "verify" : "unverify"} doctor: ${error.message
        }`
      );
      // Revert the switch state on error
    } finally {
      // Clear loading state
      setTogglingVerification((prev) => ({ ...prev, [doctorId]: false }));
    }
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
    // Default time slots if not present
    const defaultTimeSlots = {
      monday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      tuesday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      wednesday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      thursday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      friday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    };
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
      numExp: doctor.numExp || "",
      consultationFees: doctor.consultationFees || "",
      aboutMe: doctor.aboutMe || "",
      averageRating: doctor.averageRating || 0,
      numOnline: doctor.numOnline || "",
      numOffline: doctor.numOffline || "",
      knownLanguages: doctor.knownLanguages || doctor.languagesKnown || [],
      languagesKnown: doctor.languagesKnown || doctor.knownLanguages || [],
      upiId: doctor.upiId || doctor.upiID || "",
      upiID: doctor.upiID || doctor.upiId || "",
      soocherClubEnabled: doctor.soocherClubEnabled || false,
      timeSlots: doctor.timeSlots || defaultTimeSlots,
      slotDuration: doctor.slotDuration || 15,
      breakBetweenSlots: doctor.breakBetweenSlots || 5,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDoctor) return;

    setEditLoading(true);
    try {
      // Call the API to update the doctor in Firebase
      const result = await updateDoctor(editingDoctor.uid, editFormData);

      if (result.success) {
        // Update the local state after successful save
        setDoctors((prevDoctors) =>
          prevDoctors.map((d) =>
            d.uid === editingDoctor.uid ? { ...d, ...editFormData } : d
          )
        );

        console.log(
          "Doctor updated successfully:",
          editingDoctor.uid,
          editFormData
        );
        alert("Doctor information updated successfully!");
        setShowEditDialog(false);
        setEditingDoctor(null);
        setEditFormData({});
      } else {
        console.error("Error updating doctor:", result.error);
        alert(`Failed to update doctor information: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert(`Failed to update doctor information: ${error.message}`);
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
    // Don't add "Dr." if name already starts with "Dr." or "Dr " (case-insensitive)
    const nameLower = name.toLowerCase();
    if (nameLower.startsWith("dr. ") || nameLower.startsWith("dr ")) {
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
        <Badge variant="destructive" className="flex justify-center items-center whitespace-nowrap px-2 py-0.5 min-w-[110px]">
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
    return <LoadingSpinner fullHeight message="Loading Doctors..." />;
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>

      {/* Page Header */}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#0ea5e9,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Stethoscope size={14} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.4px" }}>{getPageTitle()}</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{getPageDescription()}</p>
        </div>
        {/* Stat chips */}
        {stats && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: stats.total, color: "#3b82f6", bg: "#dbeafe" },
              { label: "Verified", value: stats.verified, color: "#10b981", bg: "#d1fae5" },
              { label: "Pending", value: stats.pending, color: "#f59e0b", bg: "#fef3c7" },
              { label: "No Docs", value: stats.noDocuments, color: "#ef4444", bg: "#fee2e2" },
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
            placeholder="Search by name, specialty, city, MCI…"
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 12.5, color: "#1e3a5f", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "white"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; }}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger style={{ width: 168, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending Verification</SelectItem>
            <SelectItem value="no-documents">No Documents</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
          <SelectTrigger style={{ width: 180, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map(s => <SelectItem key={s.value} value={s.value}>{s.label} ({s.count})</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={resetFilters}
          style={{ height: 36, padding: "0 14px", borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "Inter,sans-serif", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.color = "#1e3a5f"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#64748b"; }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredDoctors.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <UserCheck size={40} style={{ color: "#bfdbfe", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>No doctors found</p>
            <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#f8fbff", borderBottom: "1.5px solid #e0f2fe" }}>
                    {["Doctor", "Specialty", "Location", "Contact", "Rating / Fees", "Status", "Verified", "Actions"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDoctors.map((doctor, idx) => (
                    <tr
                      key={doctor.uid}
                      style={{ borderBottom: "1px solid #f0f7ff", background: idx % 2 === 0 ? "white" : "#fafcff", transition: "background 0.15s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafcff"}
                      onClick={() => handleViewDetails(doctor)}
                    >
                      {/* Doctor Name + Avatar */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar style={{ width: 34, height: 34, flexShrink: 0 }}>
                            <AvatarImage src={doctor?.profileImage} />
                            <AvatarFallback style={{ background: "linear-gradient(135deg,#0ea5e9,#3b82f6)", color: "white", fontSize: 12, fontWeight: 700 }}>
                              {getDisplayName(doctor)?.[0] || "D"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{getDisplayName(doctor)}</p>
                            <p style={{ margin: 0, fontSize: 10.5, color: "#94a3b8" }}>UID: {doctor?.uid?.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      {/* Specialty */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "#334155", fontWeight: 500 }}>{doctor?.specialization || "—"}</span>
                      </td>
                      {/* Location */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "#64748b" }}>{[doctor?.currentCity, doctor?.currentState].filter(Boolean).join(", ") || "—"}</span>
                      </td>
                      {/* Contact */}
                      <td style={{ padding: "12px 14px" }}>
                        {doctor?.phoneNumber || doctor?.whatsappNumber ? (
                          <span style={{ fontSize: 12.5, color: "#334155" }}>{doctor?.phoneNumber || doctor?.whatsappNumber}</span>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); handleFetchPhoneNumber(doctor); }}
                            disabled={fetchingPhoneNumbers[doctor.uid]}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#3b82f6", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            {fetchingPhoneNumbers[doctor.uid] ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : null}
                            Fetch Phone
                          </button>
                        )}
                      </td>
                      {/* Rating / Fees */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>★ {doctor?.averageRating || "—"}</span>
                          <span style={{ fontSize: 11.5, color: "#64748b" }}>₹{doctor?.consultationFees || "—"}</span>
                        </div>
                      </td>
                      {/* Status badge */}
                      <td style={{ padding: "12px 14px" }}>{getStatusBadge(doctor)}</td>
                      {/* Verified toggle */}
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        <Switch
                          checked={doctor?.isAccountVerified || false}
                          onCheckedChange={checked => handleToggleVerification(doctor, checked)}
                          disabled={togglingVerification[doctor.uid]}
                        />
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleViewDetails(doctor)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #bfdbfe", background: "#f0f7ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                          >
                            <Eye size={13} color="#3b82f6" />
                          </button>
                          <button
                            onClick={() => handleEditDoctor(doctor)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #d0d9ff", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "#6366f1"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.borderColor = "#d0d9ff"; }}
                          >
                            <Edit size={13} color="#6366f1" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f0f7ff" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Showing {startIndex + 1}–{Math.min(endIndex, filteredDoctors.length)} of {filteredDoctors.length}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #bfdbfe", background: currentPage === 1 ? "#f8fbff" : "white", fontSize: 12, color: currentPage === 1 ? "#94a3b8" : "#3b82f6", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif" }}
                  >← Prev</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = totalPages <= 5 ? i + 1 : Math.max(1, currentPage - 2) + i;
                    if (page > totalPages) return null;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${currentPage === page ? "#3b82f6" : "#bfdbfe"}`, background: currentPage === page ? "#3b82f6" : "white", color: currentPage === page ? "white" : "#334155", fontSize: 12, fontWeight: currentPage === page ? 700 : 400, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #bfdbfe", background: currentPage === totalPages ? "#f8fbff" : "white", fontSize: 12, color: currentPage === totalPages ? "#94a3b8" : "#3b82f6", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif" }}
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Doctor Detail Dialog - Compact Dashboard Style */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent style={{ maxWidth: 680, maxHeight: "88vh", overflowY: "auto", padding: "0", borderRadius: 14, border: "1.5px solid #e0f2fe" }}>
          {selectedDoctor && (
            <>
              {/* Header */}
              <div style={{ padding: "16px 20px 14px", background: "linear-gradient(135deg,#f0f7ff,#e8f4fd)", borderBottom: "1px solid #dbeafe", borderRadius: "14px 14px 0 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar style={{ width: 42, height: 42, flexShrink: 0 }}>
                    <AvatarImage src={selectedDoctor?.profileImage} />
                    <AvatarFallback style={{ background: "linear-gradient(135deg,#0ea5e9,#3b82f6)", color: "white", fontSize: 15, fontWeight: 700 }}>
                      {selectedDoctor?.name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>{getDisplayName(selectedDoctor)}</span>
                      {getStatusBadge(selectedDoctor)}
                    </div>
                    <span style={{ fontSize: 11.5, color: "#64748b" }}>{selectedDoctor?.specialization || "—"} {selectedDoctor?.currentCity ? `· ${selectedDoctor.currentCity}` : ""}</span>
                  </div>
                  <button
                    onClick={() => { setShowDetailsDialog(false); handleEditDoctor(selectedDoctor); }}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #bfdbfe", background: "white", fontSize: 11.5, color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" }}
                  >
                    <Edit size={11} /> Edit
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="info" style={{ padding: "0" }}>
                <TabsList style={{ margin: "0", borderRadius: 0, background: "#f8fbff", borderBottom: "1px solid #e0f2fe", display: "flex", gap: 0, height: 38, padding: "0 12px" }}>
                  {[
                    { value: "info", label: "Info" },
                    { value: "professional", label: "Professional" },
                    { value: "schedule", label: "Schedule" },
                    { value: "documents", label: "Documents" },
                    { value: "financial", label: "Financial" },
                    { value: "stats", label: "Stats" },
                  ].map(t => (
                    <TabsTrigger key={t.value} value={t.value} style={{ fontSize: 11.5, fontWeight: 600, padding: "0 12px", borderRadius: 0 }}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Info Tab */}
                <TabsContent value="info" style={{ padding: "14px 20px", margin: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "UID", value: selectedDoctor?.uid?.slice(0, 16) + "…" || "N/A" },
                      { label: "Phone", value: selectedDoctor?.phoneNumber || "—" },
                      { label: "WhatsApp", value: selectedDoctor?.whatsappNumber || "—" },
                      { label: "Email", value: selectedDoctor?.email || "—" },
                      { label: "City", value: selectedDoctor?.currentCity || "—" },
                      { label: "State", value: selectedDoctor?.currentState || "—" },
                      { label: "Joined", value: formatDate(selectedDoctor?.dateOfAccountCreation || selectedDoctor?.accountCreationDate) },
                      { label: "Documents", value: selectedDoctor?.documentsSubmitted ? "Submitted" : "Not Submitted" },
                      { label: "Soocher Club", value: selectedDoctor?.soocherClubEnabled ? "Enabled" : "Disabled" },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "#f8fbff", borderRadius: 8, border: "1px solid #e0f2fe" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>{row.label}</span>
                        <span style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 500, maxWidth: 220, textAlign: "right", wordBreak: "break-word" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Languages */}
                  {(selectedDoctor?.knownLanguages || selectedDoctor?.languagesKnown || []).length > 0 && (
                    <div style={{ marginTop: 10, padding: "9px 10px", background: "#f8fbff", borderRadius: 8, border: "1px solid #e0f2fe" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px", display: "block", marginBottom: 6 }}>Languages</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {(selectedDoctor?.knownLanguages || selectedDoctor?.languagesKnown || []).map((lang, i) => (
                          <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }}>{lang}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional" style={{ padding: "14px 20px", margin: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    {[
                      { label: "Specialization", value: selectedDoctor?.specialization || "—" },
                      { label: "MCI Number", value: selectedDoctor?.mciNumber || "—" },
                      { label: "Experience", value: selectedDoctor?.numExp ? `${selectedDoctor.numExp} yrs` : "—" },
                      { label: "Works At", value: selectedDoctor?.worksAt || "—" },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "#f8fbff", borderRadius: 8, border: "1px solid #e0f2fe" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>{row.label}</span>
                        <span style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 500 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  {selectedDoctor?.aboutMe && (
                    <div style={{ padding: "10px 12px", background: "#f8fbff", borderRadius: 8, border: "1px solid #e0f2fe" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px", display: "block", marginBottom: 6 }}>About</span>
                      <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, margin: 0 }}>{selectedDoctor.aboutMe}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" style={{ padding: "14px 20px", margin: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: "9px 12px", background: "#f0f7ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                      <span style={{ fontSize: 10.5, color: "#64748b", display: "block" }}>Slot Duration</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>{selectedDoctor?.slotDuration || 15} min</span>
                    </div>
                    <div style={{ padding: "9px 12px", background: "#f5f3ff", borderRadius: 8, border: "1px solid #d0d9ff" }}>
                      <span style={{ fontSize: 10.5, color: "#64748b", display: "block" }}>Break Between</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>{selectedDoctor?.breakBetweenSlots || 5} min</span>
                    </div>
                  </div>
                  {selectedDoctor?.timeSlots ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                        const slot = selectedDoctor.timeSlots[day.toLowerCase()];
                        return (
                          <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: slot?.enabled ? "#f0fdf4" : "#f8fafc", borderRadius: 8, border: `1px solid ${slot?.enabled ? "#bbf7d0" : "#e2e8f0"}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: slot?.enabled ? "#22c55e" : "#cbd5e1" }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#1e3a5f" }}>{day}</span>
                            </div>
                            {slot?.enabled
                              ? <span style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>{slot.startTime} – {slot.endTime}</span>
                              : <span style={{ fontSize: 11, color: "#94a3b8" }}>Off</span>
                            }
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
                      <Clock size={28} style={{ margin: "0 auto 8px" }} />
                      <p style={{ fontSize: 12 }}>No time slots configured</p>
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" style={{ padding: "14px 20px", margin: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Profile Image", url: selectedDoctor?.profileImage, isImg: true },
                      { label: "Aadhar Front", url: selectedDoctor?.aadharFrontUrl, isImg: false },
                      { label: "Aadhar Back", url: selectedDoctor?.aadharBackUrl, isImg: false },
                      { label: "MCI Certificate", url: selectedDoctor?.mciUploadUrl, isImg: false },
                    ].map(doc => (
                      <div key={doc.label} style={{ borderRadius: 9, border: "1.5px solid #e0f2fe", overflow: "hidden" }}>
                        <div style={{ padding: "6px 10px", background: "#f0f7ff", borderBottom: "1px solid #e0f2fe" }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>{doc.label}</span>
                        </div>
                        <div style={{ padding: 8 }}>
                          {doc.url ? (
                            doc.isImg ? (
                              <img src={doc.url} alt={doc.label} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, cursor: "pointer" }} onClick={() => openImageModal(doc.url, doc.label)} />
                            ) : (
                              <button onClick={() => openImageModal(doc.url, doc.label)} style={{ width: "100%", height: 80, borderRadius: 6, border: "1px dashed #93c5fd", background: "#f0f7ff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <Eye size={16} color="#3b82f6" />
                                <span style={{ fontSize: 10.5, color: "#3b82f6", fontWeight: 600 }}>View</span>
                              </button>
                            )
                          ) : (
                            <div style={{ height: 80, borderRadius: 6, background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                              <FileText size={16} color="#cbd5e1" />
                              <span style={{ fontSize: 10.5, color: "#94a3b8" }}>Not uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial" style={{ padding: "14px 20px", margin: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ padding: "14px 16px", background: "#f0fdf4", borderRadius: 10, border: "1.5px solid #bbf7d0", textAlign: "center" }}>
                      <span style={{ fontSize: 10.5, color: "#64748b", display: "block", marginBottom: 4 }}>Consultation Fee</span>
                      <span style={{ fontSize: 24, fontWeight: 800, color: "#15803d" }}>₹{selectedDoctor?.consultationFees || 0}</span>
                      <span style={{ fontSize: 10.5, color: "#86efac", display: "block" }}>per session</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "UPI ID", value: selectedDoctor?.upiID || selectedDoctor?.upiId || "—" },
                        { label: "Withdrawal", value: selectedDoctor?.withdrawalStatus || "N/A" },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8fbff", borderRadius: 8, border: "1px solid #e0f2fe" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{row.label}</span>
                          <span style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats" style={{ padding: "14px 20px", margin: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Avg Rating", value: selectedDoctor?.averageRating?.toFixed(1) || "—", color: "#f59e0b", bg: "#fef3c7" },
                      { label: "Online Consults", value: selectedDoctor?.numOnline || "0", color: "#3b82f6", bg: "#dbeafe" },
                      { label: "Offline Consults", value: selectedDoctor?.numOffline || "0", color: "#10b981", bg: "#d1fae5" },
                      { label: "Experience (yrs)", value: selectedDoctor?.numExp || "—", color: "#8b5cf6", bg: "#ede9fe" },
                    ].map(s => (
                      <div key={s.label} style={{ padding: "14px 16px", background: s.bg, borderRadius: 10, border: `1.5px solid ${s.color}33`, textAlign: "center" }}>
                        <span style={{ fontSize: 24, fontWeight: 800, color: s.color, display: "block" }}>{s.value}</span>
                        <span style={{ fontSize: 10.5, color: s.color, fontWeight: 600 }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div style={{ padding: "10px 20px", borderTop: "1px solid #e0f2fe", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowDetailsDialog(false)}
                  style={{ padding: "6px 16px", borderRadius: 8, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12, color: "#64748b", cursor: "pointer", fontFamily: "Inter,sans-serif" }}
                >
                  Close
                </button>
              </div>
            </>
          )}
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

      {/* Edit Doctor Dialog - Enhanced with Tabs */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-6 w-6 text-blue-600" />
              <span>Edit Doctor Information</span>
            </DialogTitle>
            <DialogDescription>
              Update doctor details and save changes to the database
            </DialogDescription>
          </DialogHeader>
          {editingDoctor && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">
                  <User className="h-4 w-4 mr-1" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="professional">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Professional
                </TabsTrigger>
                <TabsTrigger value="location">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="timeslots">
                  <Clock className="h-4 w-4 mr-1" />
                  Time Slots
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <Award className="h-4 w-4 mr-1" />
                  Stats & Fees
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
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
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
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
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
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
                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                        <Input
                          id="whatsapp"
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="languages">Languages Known (comma-separated)</Label>
                      <Input
                        id="languages"
                        value={(editFormData.knownLanguages || editFormData.languagesKnown || []).join(", ")}
                        onChange={(e) => {
                          const languages = e.target.value.split(",").map(l => l.trim()).filter(l => l);
                          setEditFormData({
                            ...editFormData,
                            knownLanguages: languages,
                            languagesKnown: languages,
                          });
                        }}
                        placeholder="English, Hindi, Telugu..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional Tab */}
              <TabsContent value="professional" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Professional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization *</Label>
                        <Input
                          id="specialization"
                          value={editFormData.specialization}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              specialization: e.target.value,
                            })
                          }
                          placeholder="e.g., Cardiology, Dermatology"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mciNumber">MCI/Registration Number</Label>
                        <Input
                          id="mciNumber"
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
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          value={editFormData.numExp}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              numExp: e.target.value,
                            })
                          }
                          placeholder="e.g., 5 years or 10+"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="worksAt">Hospital/Clinic</Label>
                        <Input
                          id="worksAt"
                          value={editFormData.worksAt}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              worksAt: e.target.value,
                            })
                          }
                          placeholder="Where the doctor practices"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutMe">About / Bio</Label>
                      <Textarea
                        id="aboutMe"
                        value={editFormData.aboutMe}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            aboutMe: e.target.value,
                          })
                        }
                        placeholder="Doctor's professional bio and description..."
                        className="min-h-[120px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Location Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
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
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
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
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          value={editFormData.upiId || editFormData.upiID || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              upiId: e.target.value,
                              upiID: e.target.value,
                            })
                          }
                          placeholder="doctor@upi"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Time Slots Tab */}
              <TabsContent value="timeslots" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Weekly Availability</CardTitle>
                    <p className="text-xs text-gray-400 mt-1">Set the doctor's available time slots for each day of the week</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const dayKey = day.toLowerCase();
                      const timeSlots = editFormData.timeSlots || {};
                      const daySlot = timeSlots[dayKey] || { enabled: false, startTime: "09:00", endTime: "17:00" };
                      const slotDuration = editFormData.slotDuration || 15;
                      const breakTime = editFormData.breakBetweenSlots || 5;

                      // Calculate slots for preview
                      const calculateSlotCount = () => {
                        if (!daySlot.enabled || !daySlot.startTime || !daySlot.endTime) return 0;

                        const parseTime = (timeStr) => {
                          if (!timeStr) return 0;
                          const [hourStr, minStr] = timeStr.split(':');
                          return parseInt(hourStr, 10) * 60 + (parseInt(minStr, 10) || 0);
                        };

                        const startMins = parseTime(daySlot.startTime);
                        const endMins = parseTime(daySlot.endTime);
                        const totalMins = endMins - startMins;

                        if (totalMins <= 0) return 0;

                        let count = 0;
                        let current = 0;
                        while (current + slotDuration <= totalMins) {
                          count++;
                          current += slotDuration + breakTime;
                        }
                        return count;
                      };

                      const slotCount = calculateSlotCount();

                      return (
                        <div key={day} className="border rounded-lg overflow-hidden">
                          <div className={`flex items-center space-x-4 p-3 ${daySlot.enabled ? "bg-green-50" : "bg-gray-50"}`}>
                            <div className="flex items-center space-x-2 w-32">
                              <Checkbox
                                id={`day-${dayKey}`}
                                checked={daySlot.enabled}
                                onCheckedChange={(checked) => {
                                  setEditFormData({
                                    ...editFormData,
                                    timeSlots: {
                                      ...timeSlots,
                                      [dayKey]: { ...daySlot, enabled: checked }
                                    }
                                  });
                                }}
                              />
                              <Label htmlFor={`day-${dayKey}`} className="font-semibold">{day}</Label>
                            </div>

                            <div className="flex items-center space-x-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <Label className="text-xs text-gray-500">From:</Label>
                                <Input
                                  type="time"
                                  value={daySlot.startTime}
                                  onChange={(e) => {
                                    setEditFormData({
                                      ...editFormData,
                                      timeSlots: {
                                        ...timeSlots,
                                        [dayKey]: { ...daySlot, startTime: e.target.value }
                                      }
                                    });
                                  }}
                                  disabled={!daySlot.enabled}
                                  className="w-32"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Label className="text-xs text-gray-500">To:</Label>
                                <Input
                                  type="time"
                                  value={daySlot.endTime}
                                  onChange={(e) => {
                                    setEditFormData({
                                      ...editFormData,
                                      timeSlots: {
                                        ...timeSlots,
                                        [dayKey]: { ...daySlot, endTime: e.target.value }
                                      }
                                    });
                                  }}
                                  disabled={!daySlot.enabled}
                                  className="w-32"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {daySlot.enabled && slotCount > 0 && (
                                <Badge className="bg-blue-500">{slotCount} Slots</Badge>
                              )}
                              <Badge variant={daySlot.enabled ? "default" : "secondary"} className={daySlot.enabled ? "bg-green-500" : ""}>
                                {daySlot.enabled ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                          </div>

                          {/* Show generated slots preview when enabled */}
                          {daySlot.enabled && slotCount > 0 && (
                            <div className="p-3 bg-white border-t">
                              <p className="text-xs text-gray-500 mb-2">Generated Time Slots:</p>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  const slots = [];
                                  const parseTime = (timeStr) => {
                                    if (!timeStr) return 0;
                                    const [hourStr, minStr] = timeStr.split(':');
                                    return parseInt(hourStr, 10) * 60 + (parseInt(minStr, 10) || 0);
                                  };
                                  const formatTime = (mins) => {
                                    const h = Math.floor(mins / 60);
                                    const m = mins % 60;
                                    const period = h >= 12 ? 'PM' : 'AM';
                                    const hour12 = h % 12 || 12;
                                    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
                                  };

                                  const startMins = parseTime(daySlot.startTime);
                                  const endMins = parseTime(daySlot.endTime);
                                  let current = startMins;

                                  while (current + slotDuration <= endMins) {
                                    slots.push(
                                      <Badge
                                        key={current}
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                      >
                                        {formatTime(current)} - {formatTime(current + slotDuration)}
                                      </Badge>
                                    );
                                    current += slotDuration + breakTime;
                                  }
                                  return slots;
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Slot Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="slotDuration">Consultation Duration (minutes)</Label>
                        <Select
                          value={String(editFormData.slotDuration || "15")}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              slotDuration: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="55">55 minutes (Psychology)</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="breakTime">Break Between Slots (minutes)</Label>
                        <Select
                          value={String(editFormData.breakBetweenSlots || "5")}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              breakBetweenSlots: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select break time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No break</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allEnabled = {};
                          ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].forEach(day => {
                            allEnabled[day] = { enabled: true, startTime: "09:00", endTime: "17:00" };
                          });
                          setEditFormData({ ...editFormData, timeSlots: allEnabled });
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Enable All Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const weekdaysOnly = {};
                          ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(day => {
                            weekdaysOnly[day] = { enabled: true, startTime: "09:00", endTime: "17:00" };
                          });
                          ["saturday", "sunday"].forEach(day => {
                            weekdaysOnly[day] = { enabled: false, startTime: "09:00", endTime: "17:00" };
                          });
                          setEditFormData({ ...editFormData, timeSlots: weekdaysOnly });
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Weekdays Only
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allDisabled = {};
                          ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].forEach(day => {
                            allDisabled[day] = { enabled: false, startTime: "09:00", endTime: "17:00" };
                          });
                          setEditFormData({ ...editFormData, timeSlots: allDisabled });
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Disable All Days
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats & Fees Tab */}
              <TabsContent value="stats" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Consultation Fees</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fees">Consultation Fee (₹)</Label>
                        <Input
                          id="fees"
                          value={editFormData.consultationFees}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              consultationFees: e.target.value,
                            })
                          }
                          placeholder="Fee amount in rupees"
                          type="number"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rating">Average Rating</Label>
                        <Input
                          id="rating"
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
                        <Label htmlFor="online">Online Consultations</Label>
                        <Input
                          id="online"
                          value={editFormData.numOnline}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              numOnline: e.target.value,
                            })
                          }
                          placeholder="e.g., 100+ or 150"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="offline">Offline Consultations</Label>
                        <Input
                          id="offline"
                          value={editFormData.numOffline}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              numOffline: e.target.value,
                            })
                          }
                          placeholder="e.g., 200+ or 300"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="soocherClub"
                        checked={editFormData.soocherClubEnabled || false}
                        onCheckedChange={(checked) =>
                          setEditFormData({
                            ...editFormData,
                            soocherClubEnabled: checked,
                          })
                        }
                      />
                      <Label htmlFor="soocherClub">Soocher Club Enabled</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="mt-6">
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
                  <CheckCircle className="h-4 w-4 mr-2" />
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

DoctorsShadcn.displayName = "DoctorsShadcn";

export default DoctorsShadcn;
