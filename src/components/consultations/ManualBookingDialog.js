import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Stethoscope,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import DateTimePicker from "../common/DateTimePicker";
import DoctorSearchDropdown from "./DoctorSearchDropdown";
import PatientSearchDropdown from "./PatientSearchDropdown";
import { getDoctors } from "../../services/doctorService";
import { getPatients } from "../../services/patientService";
import consultationService from "../../services/consultationService";
const ManualBookingDialog = ({ open, onOpenChange, onSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    consultationTime: null,
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    doctorDetails: null,
  });
  const [errors, setErrors] = useState({});

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Load doctors and patients when dialog opens
  useEffect(() => {
    if (open) {
      loadDoctors();
      loadPatients();
      // Reset form when dialog opens
      setFormData({
        consultationTime: null,
        patientId: "",
        patientName: "",
        doctorId: "",
        doctorName: "",
        doctorDetails: null,
      });
      setErrors({});
    }
  }, [open]);

  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const result = await getDoctors();
      if (result.success) {
        setDoctors(result.data || []);
      } else {
        console.error("Failed to load doctors:", result.error);
        showToast("Error", "Failed to load doctors. Please try again.", "destructive");
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      showToast("Error", "Failed to load doctors. Please try again.", "destructive");
    } finally {
      setDoctorsLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      setPatientsLoading(true);
      const result = await getPatients();
      if (result.success) {
        setPatients(result.data || []);
      } else {
        console.error("Failed to load patients:", result.error);
        showToast("Error", "Failed to load patients. Please try again.", "destructive");
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      showToast("Error", "Failed to load patients. Please try again.", "destructive");
    } finally {
      setPatientsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePatientSelect = (patient) => {
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientId: patient.uid,
        patientName: patient.name,
      }));
    }
  };

  const handleDoctorSelect = (doctor) => {
    if (doctor) {
      setFormData((prev) => ({
        ...prev,
        doctorId: doctor.uid,
        doctorName: doctor.name,
        doctorDetails: {
          specialty: doctor.specialization,
          experience: doctor.numExp,
          worksAt: doctor.worksAt,
          profileImage: doctor.profileImage,
        },
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.consultationTime) {
      newErrors.consultationTime = "Consultation time is required";
    } else {
      const selectedTime = formData.consultationTime.getTime();
      const now = new Date().getTime();
      if (selectedTime <= now) {
        newErrors.consultationTime = "Consultation time must be in the future";
      }
    }

    if (!formData.patientId) {
      newErrors.patientId = "Please select a patient";
    }

    if (!formData.doctorId) {
      newErrors.doctorId = "Please select a doctor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const consultationData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        doctorDetails: formData.doctorDetails,
        consultationTime: formData.consultationTime,
      };

      const createdConsultation = await consultationService.createConsultation(
        consultationData
      );

      showToast("Success", "Manual booking created successfully!", "default");

      // Reset form
      setFormData({
        consultationTime: null,
        patientId: "",
        patientName: "",
        doctorId: "",
        doctorName: "",
        doctorDetails: null,
      });
      setErrors({});

      // Close dialog and notify parent
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(createdConsultation);
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      showToast("Error", error.message || "Failed to create booking. Please try again.", "destructive");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Manual Booking
          </DialogTitle>
          <DialogDescription>
            Create a new consultation booking by selecting a patient, doctor, and
            consultation time.
          </DialogDescription>
        </DialogHeader>

        {/* Toast Notification */}
        {toast && (
          <Alert
            variant={toast.variant === "destructive" ? "destructive" : "default"}
            className="mb-4"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{toast.title}</AlertTitle>
            <AlertDescription>{toast.description}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient *
            </Label>
            <PatientSearchDropdown
              patients={patients}
              selectedPatientId={formData.patientId}
              onPatientSelect={handlePatientSelect}
              loading={patientsLoading}
              error={errors.patientId}
              placeholder="Search and select a patient..."
            />
            {errors.patientId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.patientId}
              </p>
            )}
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label htmlFor="doctor" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Doctor *
            </Label>
            <DoctorSearchDropdown
              doctors={doctors}
              selectedDoctorId={formData.doctorId}
              onDoctorSelect={handleDoctorSelect}
              loading={doctorsLoading}
              error={errors.doctorId}
              placeholder="Search and select a doctor..."
            />
            {errors.doctorId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.doctorId}
              </p>
            )}
          </div>

          {/* Consultation Time */}
          <div className="space-y-2">
            <Label htmlFor="consultationTime" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Consultation Date & Time *
            </Label>
            <DateTimePicker
              value={formData.consultationTime}
              onChange={(date) => handleInputChange("consultationTime", date)}
              placeholder="Select consultation date and time"
              disabled={submitting}
              error={errors.consultationTime}
              minDate={new Date()}
              showTimeSelect={true}
              dateFormat="MMM dd, yyyy hh:mm:aa"
              timeFormat="hh:mm:aa"
            />
            {errors.consultationTime && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.consultationTime}
              </p>
            )}
          </div>

          {/* Selected Doctor Info */}
          {formData.doctorDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Selected Doctor</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {formData.doctorDetails.profileImage ? (
                    <img
                      src={formData.doctorDetails.profileImage}
                      alt={formData.doctorName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{formData.doctorName}</p>
                  <p className="text-sm text-gray-600">
                    {formData.doctorDetails.specialty}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Selected Patient Info */}
          {formData.patientName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-green-900">Selected Patient</h4>
              </div>
              <p className="font-medium text-gray-900">{formData.patientName}</p>
            </motion.div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualBookingDialog;

