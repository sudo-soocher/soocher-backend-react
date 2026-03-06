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
import LoadingSpinner from "../components/common/LoadingSpinner";
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
    per_user_limit: 1,
    tray_visibility: true,
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
      per_user_limit: 1,
      tray_visibility: true,
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
      per_user_limit: coupon.per_user_limit ?? 1,
      tray_visibility: coupon.tray_visibility !== undefined ? coupon.tray_visibility : true,
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
    <div className="space-y-5">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ticket size={14} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.4px" }}>Coupons Manager</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Manage discount coupons and promotional codes</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={loadCoupons}
            disabled={loading}
            style={{ height: 36, padding: "0 14px", borderRadius: 9, border: "1.5px solid #e0e7ff", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 6, cursor: loading ? "not-allowed" : "pointer" }}
          >
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            style={{ height: 36, padding: "0 16px", borderRadius: 9, border: "none", background: "#3b82f6", fontSize: 13, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: "0 2px 4px rgba(59,130,246,0.2)" }}
          >
            <Plus size={14} />
            Create Coupon
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
            placeholder="Search coupons by name, code, or description..."
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 12.5, color: "#1e3a5f", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "white"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; }}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger style={{ width: 160, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Generic">Generic</SelectItem>
            <SelectItem value="Targeted">Targeted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coupons Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <LoadingSpinner message="Loading coupons..." />
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Ticket size={40} style={{ color: "#bfdbfe", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>
              {searchTerm || filterType !== "all" ? "No coupons found matching your filters" : "No coupons created yet"}
            </p>
            {!searchTerm && filterType === "all" && (
              <button
                onClick={handleCreate}
                style={{ marginTop: 16, height: 36, padding: "0 16px", borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 13, fontWeight: 600, color: "#3b82f6", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <Plus size={14} /> Create Your First Coupon
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#f8fbff", borderBottom: "1.5px solid #e0f2fe" }}>
                  {["Name", "Code", "Type", "Value", "Usage", "Expires", "Visibility", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon, idx) => (
                  <tr
                    key={coupon.id}
                    style={{ borderBottom: "1px solid #f0f7ff", background: idx % 2 === 0 ? "white" : "#fafcff", transition: "background 0.15s", opacity: isExpired(coupon.couponExpiry) ? 0.6 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafcff"}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>{coupon.couponName}</span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{coupon.couponDescription}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 12.5, fontFamily: "monospace", padding: "3px 8px", background: "#f1f5f9", borderRadius: 4, fontWeight: 600, color: "#334155" }}>
                        {coupon.couponCode}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge variant={coupon.couponType === "Generic" ? "default" : "secondary"} style={{ fontSize: 10.5, padding: "0px 6px" }}>
                        {coupon.couponType}
                      </Badge>
                      {coupon.couponType === "Targeted" && (
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                          D: {coupon.targetedDoctorIds?.length || 0} | P: {coupon.targetedUserIds?.length || 0}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                      ₹{coupon.couponValue}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#334155", fontWeight: 500 }}>
                      {coupon.currentUsageCount || 0} / {coupon.maxUsageLimit || 0}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: isExpired(coupon.couponExpiry) ? "#ef4444" : "#64748b", fontSize: 12.5 }}>
                        {isExpired(coupon.couponExpiry) ? <AlertCircle size={12} /> : <Calendar size={12} />}
                        {formatDate(coupon.couponExpiry)}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {coupon.tray_visibility !== false ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981", fontSize: 11, fontWeight: 600 }}>
                          <CheckCircle size={12} /> Visible
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>
                          <X size={12} /> Hidden
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleEdit(coupon)}
                          style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}
                          title="Edit"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; }}
                          title="Delete"
                        >
                          <Trash2 size={12} />
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
                {formData.couponType !== "Targeted" && (
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
                )}
                <div className="space-y-2">
                  <Label htmlFor="per_user_limit">Per User Limit</Label>
                  <Input
                    id="per_user_limit"
                    type="number"
                    value={formData.per_user_limit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        per_user_limit: parseInt(e.target.value) || 0,
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
                <div className="space-y-2 flex items-center gap-3 pt-6">
                  <Switch
                    id="tray_visibility"
                    checked={formData.tray_visibility}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, tray_visibility: checked })
                    }
                  />
                  <Label htmlFor="tray_visibility" className="cursor-pointer">
                    Tray Visibility
                  </Label>
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

