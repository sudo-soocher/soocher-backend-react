import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Ticket,
  Calendar,
  Users,
  UserCheck,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../services/couponService";
import { getDoctors } from "../services/doctorService";
import { getPatients } from "../services/patientService";

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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
import { cn } from "../lib/utils";

const CouponsShadcn = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    couponCode: "",
    couponDescription: "",
    couponExpiry: "",
    couponName: "",
    couponType: "Generic",
    couponValue: "",
    currentUsageCount: 0,
    isGeneric: true,
    maxUsageLimit: 10,
    targetedDoctorIds: [],
    targetedUserIds: [],
    usedByUserIds: [],
  });

  // Multi-select states
  const [doctorPopoverOpen, setDoctorPopoverOpen] = useState(false);
  const [patientPopoverOpen, setPatientPopoverOpen] = useState(false);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");

  // Load coupons
  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCoupons();
      if (result.success) {
        setCoupons(result.data || []);
      } else {
        console.error("Error loading coupons:", result.error);
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load doctors
  const loadDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const result = await getDoctors();
      if (result.success) {
        setDoctors(result.data || []);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  // Load patients
  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const result = await getPatients();
      if (result.success) {
        setPatients(result.data || []);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
    loadDoctors();
    loadPatients();
  }, [loadCoupons, loadDoctors, loadPatients]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    let filtered = coupons;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (coupon) =>
          coupon.couponName?.toLowerCase().includes(searchLower) ||
          coupon.couponCode?.toLowerCase().includes(searchLower) ||
          coupon.couponDescription?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((coupon) => coupon.couponType === filterType);
    }

    return filtered;
  }, [coupons, searchTerm, filterType]);

  // Reset form
  const resetForm = () => {
    setFormData({
      couponCode: "",
      couponDescription: "",
      couponExpiry: "",
      couponName: "",
      couponType: "Generic",
      couponValue: "",
      currentUsageCount: 0,
      isGeneric: true,
      maxUsageLimit: 10,
      targetedDoctorIds: [],
      targetedUserIds: [],
      usedByUserIds: [],
    });
    setEditingCoupon(null);
    setDoctorSearchTerm("");
    setPatientSearchTerm("");
  };

  // Open create dialog
  const handleCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  // Open edit dialog
  const handleEdit = (coupon) => {
    setFormData({
      couponCode: coupon.couponCode || "",
      couponDescription: coupon.couponDescription || "",
      couponExpiry: coupon.couponExpiry || "",
      couponName: coupon.couponName || "",
      couponType: coupon.couponType || "Generic",
      couponValue: coupon.couponValue || "",
      currentUsageCount: coupon.currentUsageCount || 0,
      isGeneric: coupon.isGeneric !== undefined ? coupon.isGeneric : true,
      maxUsageLimit: coupon.maxUsageLimit || 10,
      targetedDoctorIds: coupon.targetedDoctorIds || [],
      targetedUserIds: coupon.targetedUserIds || [],
      usedByUserIds: coupon.usedByUserIds || [],
    });
    setEditingCoupon(coupon);
    setShowDialog(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.couponName || !formData.couponCode || !formData.couponValue) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const couponData = {
        ...formData,
        isGeneric: formData.couponType === "Generic",
        couponType: formData.couponType,
      };

      let result;
      if (editingCoupon) {
        // Use couponCode as the document ID (id field should be the couponCode)
        const couponId = editingCoupon.id || editingCoupon.couponCode;
        result = await updateCoupon(couponId, couponData);
      } else {
        result = await createCoupon(couponData);
      }

      if (result.success) {
        await loadCoupons();
        setShowDialog(false);
        resetForm();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Error saving coupon. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete "${coupon.couponName}"?`)) {
      return;
    }

    try {
      // Use couponCode as the document ID (id field should be the couponCode)
      const couponId = coupon.id || coupon.couponCode;
      const result = await deleteCoupon(couponId);
      if (result.success) {
        await loadCoupons();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Error deleting coupon. Please try again.");
    }
  };

  // Filtered doctors for search
  const filteredDoctors = useMemo(() => {
    if (!doctorSearchTerm) return doctors;
    const searchLower = doctorSearchTerm.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(searchLower) ||
        doctor.specialization?.toLowerCase().includes(searchLower) ||
        doctor.email?.toLowerCase().includes(searchLower)
    );
  }, [doctors, doctorSearchTerm]);

  // Filtered patients for search
  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm) return patients;
    const searchLower = patientSearchTerm.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.name?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phoneNumber?.toLowerCase().includes(searchLower)
    );
  }, [patients, patientSearchTerm]);

  // Get selected doctor names
  const getSelectedDoctorNames = () => {
    return formData.targetedDoctorIds
      .map((id) => {
        const doctor = doctors.find((d) => d.uid === id);
        return doctor?.name || id;
      })
      .join(", ") || "None selected";
  };

  // Get selected patient names
  const getSelectedPatientNames = () => {
    return formData.targetedUserIds
      .map((id) => {
        const patient = patients.find((p) => p.uid === id);
        return patient?.name || id;
      })
      .join(", ") || "None selected";
  };

  // Toggle doctor selection
  const toggleDoctor = (doctorId) => {
    setFormData((prev) => {
      const currentIds = prev.targetedDoctorIds || [];
      if (currentIds.includes(doctorId)) {
        return {
          ...prev,
          targetedDoctorIds: currentIds.filter((id) => id !== doctorId),
        };
      } else {
        return {
          ...prev,
          targetedDoctorIds: [...currentIds, doctorId],
        };
      }
    });
  };

  // Toggle patient selection
  const togglePatient = (patientId) => {
    setFormData((prev) => {
      const currentIds = prev.targetedUserIds || [];
      if (currentIds.includes(patientId)) {
        return {
          ...prev,
          targetedUserIds: currentIds.filter((id) => id !== patientId),
        };
      } else {
        return {
          ...prev,
          targetedUserIds: [...currentIds, patientId],
        };
      }
    });
  };

  // Check if coupon is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons Manager</h1>
          <p className="text-gray-500 mt-1">
            Manage discount coupons and promotional codes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadCoupons}
            disabled={loading}
            className="gap-2"
          >
            <RotateCcw
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search coupons by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Generic">Generic</SelectItem>
                <SelectItem value="Targeted">Targeted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || filterType !== "all"
                ? "No coupons found matching your filters"
                : "No coupons created yet"}
            </p>
            {!searchTerm && filterType === "all" && (
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Coupon
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{coupon.couponName}</CardTitle>
                      <CardDescription className="mt-1">
                        {coupon.couponCode}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(coupon)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {coupon.couponDescription}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          coupon.couponType === "Generic"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {coupon.couponType}
                      </Badge>
                      {isExpired(coupon.couponExpiry) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-2 font-semibold">
                          ₹{coupon.couponValue}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Usage:</span>
                        <span className="ml-2 font-semibold">
                          {coupon.currentUsageCount || 0}/
                          {coupon.maxUsageLimit || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Expires: {formatDate(coupon.couponExpiry)}</span>
                    </div>
                    {coupon.couponType === "Targeted" && (
                      <div className="text-sm text-gray-500">
                        <div>
                          Doctors: {coupon.targetedDoctorIds?.length || 0}
                        </div>
                        <div>
                          Patients: {coupon.targetedUserIds?.length || 0}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? "Update coupon details and save changes"
                : "Fill in the details to create a new coupon"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="couponName">
                    Coupon Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="couponName"
                    value={formData.couponName}
                    onChange={(e) =>
                      setFormData({ ...formData, couponName: e.target.value })
                    }
                    placeholder="e.g., GULF1400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponCode">
                    Coupon Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="couponCode"
                    value={formData.couponCode}
                    onChange={(e) =>
                      setFormData({ ...formData, couponCode: e.target.value })
                    }
                    placeholder="e.g., GULF1400"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="couponDescription">Description</Label>
                  <Textarea
                    id="couponDescription"
                    value={formData.couponDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        couponDescription: e.target.value,
                      })
                    }
                    placeholder="e.g., Flat ₹1400 off your consultation fees"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponValue">
                    Coupon Value (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="couponValue"
                    type="number"
                    value={formData.couponValue}
                    onChange={(e) =>
                      setFormData({ ...formData, couponValue: e.target.value })
                    }
                    placeholder="1400"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponExpiry">Expiry Date</Label>
                  <Input
                    id="couponExpiry"
                    type="date"
                    value={formData.couponExpiry}
                    onChange={(e) =>
                      setFormData({ ...formData, couponExpiry: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsageLimit">Max Usage Limit</Label>
                  <Input
                    id="maxUsageLimit"
                    type="number"
                    value={formData.maxUsageLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsageLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponType">Coupon Type</Label>
                  <Select
                    value={formData.couponType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        couponType: value,
                        isGeneric: value === "Generic",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Generic">Generic</SelectItem>
                      <SelectItem value="Targeted">Targeted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Targeted Selection (only for Targeted coupons) */}
            {formData.couponType === "Targeted" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Target Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Doctors</Label>
                    <Popover
                      open={doctorPopoverOpen}
                      onOpenChange={setDoctorPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {formData.targetedDoctorIds.length > 0
                            ? `${formData.targetedDoctorIds.length} selected`
                            : "Select doctors"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-2">
                          <Input
                            placeholder="Search doctors..."
                            value={doctorSearchTerm}
                            onChange={(e) =>
                              setDoctorSearchTerm(e.target.value)
                            }
                            className="mb-2"
                          />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {loadingDoctors ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : filteredDoctors.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No doctors found
                            </div>
                          ) : (
                            <div className="p-2 space-y-1">
                              {filteredDoctors.map((doctor) => (
                                <div
                                  key={doctor.uid}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  onClick={() => toggleDoctor(doctor.uid)}
                                >
                                  <Checkbox
                                    checked={formData.targetedDoctorIds.includes(
                                      doctor.uid
                                    )}
                                    onCheckedChange={() =>
                                      toggleDoctor(doctor.uid)
                                    }
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {doctor.name || "Unknown"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {doctor.specialization || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {formData.targetedDoctorIds.length > 0 && (
                          <div className="p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  targetedDoctorIds: [],
                                });
                              }}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    {formData.targetedDoctorIds.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {getSelectedDoctorNames()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Target Patients</Label>
                    <Popover
                      open={patientPopoverOpen}
                      onOpenChange={setPatientPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {formData.targetedUserIds.length > 0
                            ? `${formData.targetedUserIds.length} selected`
                            : "Select patients"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-2">
                          <Input
                            placeholder="Search patients..."
                            value={patientSearchTerm}
                            onChange={(e) =>
                              setPatientSearchTerm(e.target.value)
                            }
                            className="mb-2"
                          />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {loadingPatients ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : filteredPatients.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No patients found
                            </div>
                          ) : (
                            <div className="p-2 space-y-1">
                              {filteredPatients.map((patient) => (
                                <div
                                  key={patient.uid}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  onClick={() => togglePatient(patient.uid)}
                                >
                                  <Checkbox
                                    checked={formData.targetedUserIds.includes(
                                      patient.uid
                                    )}
                                    onCheckedChange={() =>
                                      togglePatient(patient.uid)
                                    }
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {patient.name || "Unknown"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {patient.email || patient.phoneNumber || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {formData.targetedUserIds.length > 0 && (
                          <div className="p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  targetedUserIds: [],
                                });
                              }}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    {formData.targetedUserIds.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {getSelectedPatientNames()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                resetForm();
              }}
              disabled={submitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsShadcn;

