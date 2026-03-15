import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Copy,
  ExternalLink,
  Mail,
  Phone as PhoneIcon,
  Stethoscope,
  Heart,
  Activity,
  RefreshCw,
  Eye,
  Edit,
  Video,
  Phone,
  Loader2,
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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const ConsultationDetailsShadcn = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (consultationId) {
      fetchConsultationDetails();
    }
  }, [consultationId]);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const detailedData = await consultationService.getConsultationById(
        consultationId
      );
      const formattedData =
        consultationService.formatConsultationData(detailedData);
      setConsultation(formattedData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching consultation details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async (consultationId) => {
    try {
      await navigator.clipboard.writeText(consultationId);
      setCopiedId(consultationId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy consultation ID:", err);
    }
  };

  const handleGoBack = () => {
    navigate("/consultations");
  };

  const handleViewPatientProfile = () => {
    if (consultation?.participants && consultation.participants.length > 0) {
      const patientUid = consultation.participants[0];
      navigate(`/users/${patientUid}`);
    }
  };

  const handleViewDoctorProfile = () => {
    if (consultation?.participants && consultation.participants.length > 1) {
      const doctorUid = consultation.participants[1];
      navigate(`/users/${doctorUid}`);
    }
  };

  const handleEditConsultation = () => {
    navigate(`/consultations/${consultationId}/edit`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "In Progress":
        return <Play className="h-5 w-5 text-blue-600" />;
      case "Started":
        return <Pause className="h-5 w-5 text-yellow-600" />;
      case "Scheduled":
        return <Clock className="h-5 w-5 text-gray-600" />;
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Scheduled":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading Consultation Details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Consultations
            </Button>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <AlertCircle className="h-16 w-16 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                Error Loading Consultation
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={fetchConsultationDetails}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Consultations
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Consultation Not Found
              </h3>
              <p className="text-gray-600">
                The requested consultation could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Consultations
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Consultation Details
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="font-mono text-sm">
                    #{consultation.consultationId?.slice(-8) || "N/A"}
                  </Badge>
                  <Badge
                    variant={getStatusBadgeVariant(consultation.status)}
                    className="flex items-center space-x-1"
                  >
                    {getStatusIcon(consultation.status)}
                    <span>{consultation.status}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleEditConsultation}
                disabled={
                  consultation?.status === "Completed" ||
                  consultation?.status === "Cancelled"
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {consultation.consultationId && (
                <Button
                  variant="outline"
                  onClick={() => handleCopyId(consultation.consultationId)}
                  className={
                    copiedId
                      ? "bg-green-50 text-green-700 border-green-200"
                      : ""
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedId ? "Copied!" : "Copy ID"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Participants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Patient Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Patient</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {consultation.patientName?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {consultation.patientName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">Patient</p>
                  </div>
                </div>
                {consultation.patientDetails && (
                  <div className="space-y-2">
                    {consultation.patientDetails.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{consultation.patientDetails.email}</span>
                      </div>
                    )}
                    {consultation.patientDetails.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{consultation.patientDetails.phone}</span>
                      </div>
                    )}
                    {consultation.patientDetails.age && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Heart className="h-4 w-4" />
                        <span>{consultation.patientDetails.age} years old</span>
                      </div>
                    )}
                  </div>
                )}
                <Button
                  onClick={handleViewPatientProfile}
                  disabled={
                    !consultation?.participants ||
                    consultation.participants.length === 0
                  }
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Doctor Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <span>Doctor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-green-100">
                    <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                      {consultation.doctorName?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {consultation.doctorName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">Doctor</p>
                  </div>
                </div>
                {consultation.doctorDetails && (
                  <div className="space-y-2">
                    {consultation.doctorDetails.specialty && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Activity className="h-4 w-4" />
                        <span>{consultation.doctorDetails.specialty}</span>
                      </div>
                    )}
                    {consultation.doctorDetails.experience && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {consultation.doctorDetails.experience} years
                          experience
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <Button
                  onClick={handleViewDoctorProfile}
                  disabled={
                    !consultation?.participants ||
                    consultation.participants.length < 2
                  }
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Schedule Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        Scheduled Time
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {consultation.formattedConsultationTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {consultation.duration}
                      </p>
                    </div>
                  </div>

                  {consultation.actualStartTime && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Play className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                          Started At
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {consultation.formattedActualStartTime}
                        </p>
                      </div>
                    </div>
                  )}

                  {consultation.actualEndTime && (
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                          Ended At
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {consultation.formattedActualEndTime}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Notes */}
            {consultation.patientDetails?.notesForDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                    <span>Patient Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-gray-800 leading-relaxed">
                      {consultation.patientDetails.notesForDoctor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consultation Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <span>Consultation Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Consultation ID
                    </p>
                    <p className="text-sm font-mono text-gray-900">
                      {consultation.consultationId || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Room Status
                    </p>
                    <p className="text-sm text-gray-900">
                      {consultation.doctorInRoom && consultation.patientInRoom
                        ? "Both participants in room"
                        : consultation.doctorInRoom
                          ? "Doctor in room"
                          : consultation.patientInRoom
                            ? "Patient in room"
                            : "Waiting for participants"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Cancelled by Doctor
                    </p>
                    <p className="text-sm text-gray-900">
                      {consultation.cancelledByDoctor ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Consultation Type
                    </p>
                    <div className="flex items-center space-x-2">
                      {consultation.videoConsultDone ? (
                        <Video className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Phone className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-900">
                        {consultation.videoConsultDone ? "Video" : "Phone"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Booking Source
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={(consultation.meetLink ? "web" : consultation.booking_type) === "web" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                        {(consultation.meetLink ? "web" : consultation.booking_type)?.toUpperCase() || "APP"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {consultation.meetLink && (
                  <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Video className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                            Google Meet Link
                          </p>
                          <a
                            href={consultation.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            {consultation.meetLink}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                        onClick={() => {
                          navigator.clipboard.writeText(consultation.meetLink);
                          setCopiedId(`meet-${consultation.consultationId}`);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                      >
                        {copiedId === `meet-${consultation.consultationId}` ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Copied Link
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4 mr-1" />
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            {consultation.patientDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span>Additional Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultation.patientDetails.medicalHistory && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Medical History
                        </p>
                        <p className="text-sm text-gray-900">
                          {consultation.patientDetails.medicalHistory}
                        </p>
                      </div>
                    )}
                    {consultation.patientDetails.currentMedications && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Current Medications
                        </p>
                        <p className="text-sm text-gray-900">
                          {consultation.patientDetails.currentMedications}
                        </p>
                      </div>
                    )}
                    {consultation.patientDetails.allergies && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Allergies
                        </p>
                        <p className="text-sm text-gray-900">
                          {consultation.patientDetails.allergies}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailsShadcn;
