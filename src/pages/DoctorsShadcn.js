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
          `Doctor ${doctorId} ${
            isVerified ? "verified" : "unverified"
          } successfully`
        );
      } else {
        console.error("Error toggling verification:", result.error);
        alert(
          `Error ${isVerified ? "verifying" : "unverifying"} doctor: ${
            result.error
          }`
        );
        // Revert the switch state on error
      }
    } catch (error) {
      console.error("Error toggling verification:", error);
      alert(
        `Failed to ${isVerified ? "verify" : "unverify"} doctor: ${
          error.message
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
                  onToggleVerification={handleToggleVerification}
                  togglingVerification={togglingVerification}
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

        {/* Doctor Detail Dialog - Enhanced with Tabs */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <span>Doctor Details</span>
              </DialogTitle>
              <DialogDescription>
                Complete information about the selected doctor
              </DialogDescription>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-6">
                {/* Doctor Header */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                    <AvatarImage src={selectedDoctor?.profileImage} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                      {selectedDoctor?.name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {getDisplayName(selectedDoctor)}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {selectedDoctor?.specialization}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusBadge(selectedDoctor)}
                      {selectedDoctor?.averageRating > 0 && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                          {selectedDoctor?.averageRating?.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowDetailsDialog(false);
                        handleEditDoctor(selectedDoctor);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Doctor
                    </Button>
                  </div>
                </div>

                {/* Tabbed Content */}
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basic">
                      <User className="h-4 w-4 mr-1" />
                      Basic
                    </TabsTrigger>
                    <TabsTrigger value="professional">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Professional
                    </TabsTrigger>
                    <TabsTrigger value="timeslots">
                      <Clock className="h-4 w-4 mr-1" />
                      Time Slots
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      <FileText className="h-4 w-4 mr-1" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="financial">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      Financial
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                      <Award className="h-4 w-4 mr-1" />
                      Statistics
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm text-gray-500">UID</span>
                            </div>
                            <span className="font-mono text-sm text-gray-900">{selectedDoctor?.uid || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm text-gray-500">Phone</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.phoneNumber || "Not provided"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-green-600" />
                              <span className="text-sm text-gray-500">WhatsApp</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.whatsappNumber || "Not provided"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-sm text-gray-500">Email</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.email || "Not provided"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-sm text-gray-500">City</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.currentCity || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm text-gray-500">State</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.currentState || "N/A"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Languages Known</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {(selectedDoctor?.knownLanguages || selectedDoctor?.languagesKnown || []).length > 0 ? (
                              (selectedDoctor?.knownLanguages || selectedDoctor?.languagesKnown || []).map((lang, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                                  <Languages className="h-3 w-3 mr-1" />
                                  {lang}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No languages specified</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                              <span className="text-sm text-gray-500">Joined</span>
                            </div>
                            <span className="text-sm text-gray-900">{formatDate(selectedDoctor?.dateOfAccountCreation || selectedDoctor?.accountCreationDate)}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm text-gray-500">Verified</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.isAccountVerified ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-orange-500" />
                              <span className="text-sm text-gray-500">Documents</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.documentsSubmitted ? "Submitted" : "Not Submitted"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm text-gray-500">Soocher Club</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.soocherClubEnabled ? "Enabled" : "Disabled"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Professional Tab */}
                  <TabsContent value="professional" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Professional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm text-gray-500">Specialization</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.specialization || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-2 text-yellow-500" />
                              <span className="text-sm text-gray-500">MCI Number</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.mciNumber || "Not provided"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm text-gray-500">Experience</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.numExp || "Not specified"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-purple-500" />
                              <span className="text-sm text-gray-500">Works At</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.worksAt || "Not specified"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">About Doctor</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {selectedDoctor?.aboutMe || "No description provided"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Time Slots Tab */}
                  <TabsContent value="timeslots" className="space-y-4 mt-4">
                    {/* Slot Duration Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Slot Duration</p>
                              <p className="text-xl font-bold text-gray-900">{selectedDoctor?.slotDuration || 15} minutes</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                              <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Break Between Slots</p>
                              <p className="text-xl font-bold text-gray-900">{selectedDoctor?.breakBetweenSlots || 5} minutes</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Weekly Time Slots */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Weekly Time Slots</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedDoctor?.timeSlots ? (
                          <div className="space-y-4">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                              const dayKey = day.toLowerCase();
                              const slot = selectedDoctor.timeSlots[dayKey];
                              const slotDuration = selectedDoctor.slotDuration || 15;
                              const breakTime = selectedDoctor.breakBetweenSlots || 5;
                              
                              // Generate individual time slots
                              const generateTimeSlots = () => {
                                if (!slot?.enabled || !slot?.startTime || !slot?.endTime) return [];
                                
                                // Parse time string (handles both "09:00" and "09:00 AM" formats)
                                const parseTime = (timeStr) => {
                                  if (!timeStr) return { hours: 0, mins: 0 };
                                  
                                  // Check if it contains AM/PM
                                  const upperTime = timeStr.toUpperCase();
                                  const hasAMPM = upperTime.includes('AM') || upperTime.includes('PM');
                                  
                                  if (hasAMPM) {
                                    // Parse 12-hour format: "09:00 AM" or "05:00 PM"
                                    const isPM = upperTime.includes('PM');
                                    const timePart = timeStr.replace(/\s*(AM|PM)/i, '').trim();
                                    const [hourStr, minStr] = timePart.split(':');
                                    let hours = parseInt(hourStr, 10);
                                    const mins = parseInt(minStr, 10) || 0;
                                    
                                    // Convert to 24-hour
                                    if (isPM && hours !== 12) hours += 12;
                                    if (!isPM && hours === 12) hours = 0;
                                    
                                    return { hours, mins };
                                  } else {
                                    // Parse 24-hour format: "09:00" or "17:00"
                                    const [hourStr, minStr] = timeStr.split(':');
                                    return {
                                      hours: parseInt(hourStr, 10) || 0,
                                      mins: parseInt(minStr, 10) || 0
                                    };
                                  }
                                };
                                
                                const slots = [];
                                const startParsed = parseTime(slot.startTime);
                                const endParsed = parseTime(slot.endTime);
                                
                                let currentMinutes = startParsed.hours * 60 + startParsed.mins;
                                const endMinutes = endParsed.hours * 60 + endParsed.mins;
                                
                                while (currentMinutes + slotDuration <= endMinutes) {
                                  const hours = Math.floor(currentMinutes / 60);
                                  const mins = currentMinutes % 60;
                                  const endSlotMinutes = currentMinutes + slotDuration;
                                  const endHours = Math.floor(endSlotMinutes / 60);
                                  const endMins = endSlotMinutes % 60;
                                  
                                  // Format to 12-hour with AM/PM
                                  const formatTime = (h, m) => {
                                    const period = h >= 12 ? 'PM' : 'AM';
                                    const hour12 = h % 12 || 12;
                                    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
                                  };
                                  
                                  slots.push({
                                    start: formatTime(hours, mins),
                                    end: formatTime(endHours, endMins),
                                  });
                                  
                                  currentMinutes += slotDuration + breakTime;
                                }
                                
                                return slots;
                              };
                              
                              const timeSlots = generateTimeSlots();
                              
                              return (
                                <div key={day} className="border rounded-lg overflow-hidden">
                                  <div className={`flex items-center justify-between p-3 ${slot?.enabled ? "bg-green-50" : "bg-gray-50"}`}>
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${slot?.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                                      <span className="font-semibold text-gray-900">{day}</span>
                                    </div>
                                    {slot?.enabled ? (
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="bg-white text-gray-600">
                                          {slot.startTime} - {slot.endTime}
                                        </Badge>
                                        <Badge className="bg-green-500">{timeSlots.length} Slots</Badge>
                                      </div>
                                    ) : (
                                      <Badge variant="secondary">Unavailable</Badge>
                                    )}
                                  </div>
                                  
                                  {slot?.enabled && timeSlots.length > 0 && (
                                    <div className="p-3 bg-white">
                                      <div className="flex flex-wrap gap-2">
                                        {timeSlots.map((ts, index) => (
                                          <Badge 
                                            key={index} 
                                            variant="outline" 
                                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-1"
                                          >
                                            {ts.start} - {ts.end}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-medium">No time slots configured</p>
                            <p className="text-sm mt-1">Time slots have not been set up for this doctor</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => {
                                setShowDetailsDialog(false);
                                handleEditDoctor(selectedDoctor);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Configure Time Slots
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Profile Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDoctor?.profileImage ? (
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={selectedDoctor.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openImageModal(selectedDoctor.profileImage, "Profile Image")}
                              />
                            </div>
                          ) : (
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                              <User className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Aadhar Card - Front</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDoctor?.aadharFrontUrl ? (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <Button
                                variant="outline"
                                onClick={() => openImageModal(selectedDoctor.aadharFrontUrl, "Aadhar Card - Front")}
                                className="w-full h-full"
                              >
                                <Eye className="h-5 w-5 mr-2" />
                                View Document
                              </Button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <FileText className="h-8 w-8 mx-auto mb-1" />
                                <span className="text-xs">Not uploaded</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Aadhar Card - Back</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDoctor?.aadharBackUrl ? (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <Button
                                variant="outline"
                                onClick={() => openImageModal(selectedDoctor.aadharBackUrl, "Aadhar Card - Back")}
                                className="w-full h-full"
                              >
                                <Eye className="h-5 w-5 mr-2" />
                                View Document
                              </Button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <FileText className="h-8 w-8 mx-auto mb-1" />
                                <span className="text-xs">Not uploaded</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">MCI Certificate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDoctor?.mciUploadUrl ? (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <Button
                                variant="outline"
                                onClick={() => openImageModal(selectedDoctor.mciUploadUrl, "MCI Certificate")}
                                className="w-full h-full"
                              >
                                <Eye className="h-5 w-5 mr-2" />
                                View Document
                              </Button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <FileText className="h-8 w-8 mx-auto mb-1" />
                                <span className="text-xs">Not uploaded</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Financial Tab */}
                  <TabsContent value="financial" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Consultation Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600">
                            ₹{selectedDoctor?.consultationFees || 0}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Per consultation</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm text-gray-500">UPI ID</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.upiID || selectedDoctor?.upiId || "Not provided"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm text-gray-500">Withdrawal Status</span>
                            </div>
                            <span className="text-sm text-gray-900">{selectedDoctor?.withdrawalStatus || "N/A"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Statistics Tab */}
                  <TabsContent value="stats" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="pt-6 text-center">
                          <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                          <div className="text-3xl font-bold text-yellow-700">
                            {selectedDoctor?.averageRating?.toFixed(1) || "N/A"}
                          </div>
                          <p className="text-sm text-yellow-600">Average Rating</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="pt-6 text-center">
                          <Globe className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                          <div className="text-3xl font-bold text-blue-700">
                            {selectedDoctor?.numOnline || "0"}
                          </div>
                          <p className="text-sm text-blue-600">Online Consultations</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="pt-6 text-center">
                          <Building2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <div className="text-3xl font-bold text-green-700">
                            {selectedDoctor?.numOffline || "0"}
                          </div>
                          <p className="text-sm text-green-600">Offline Consultations</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="pt-6 text-center">
                          <Clock className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                          <div className="text-3xl font-bold text-purple-700">
                            {selectedDoctor?.numExp || "N/A"}
                          </div>
                          <p className="text-sm text-purple-600">Years Experience</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
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
    </div>
  );
});

DoctorsShadcn.displayName = "DoctorsShadcn";

export default DoctorsShadcn;
