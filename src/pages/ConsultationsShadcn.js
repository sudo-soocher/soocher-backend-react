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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Consultations
            </h3>
            <p className="text-gray-600 text-center">
              Fetching consultation data from Soocher
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Consultations
                </h1>
                <p className="text-gray-600">
                  for {formatDate(selectedDate)} • {consultations.length} total
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {formatDate(selectedDate)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    initialFocus
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search consultations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="ml-auto"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Consultations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredConsultations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No consultations found
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  {searchTerm
                    ? "No consultations match your search criteria"
                    : "No consultations available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredConsultations.map((consultation, index) => (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600">
                    <CardContent className="p-0">
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <Badge
                                variant="secondary"
                                className="font-mono text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                #
                                {consultation.consultationId?.slice(-8) ||
                                  "N/A"}
                              </Badge>
                              <Badge
                                variant={getStatusBadgeVariant(
                                  consultation.status
                                )}
                                className="flex items-center space-x-1.5 px-3 py-1"
                              >
                                {getStatusIcon(consultation.status)}
                                <span className="font-medium">
                                  {consultation.status}
                                </span>
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border">
                              {getConsultationTypeIcon(consultation)}
                              <span className="text-xs font-medium text-gray-600">
                                {consultation.videoConsultDone
                                  ? "Video"
                                  : "Phone"}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="p-6">
                        {/* Patient and Doctor Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                            <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {consultation.patientName?.charAt(0) || "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-base">
                                {consultation.patientName || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500 font-medium">
                                Patient
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                            <Avatar className="h-12 w-12 ring-2 ring-green-100">
                              <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                                {consultation.doctorName?.charAt(0) || "D"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-base">
                                {consultation.doctorName || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500 font-medium">
                                Doctor
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Consultation Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-3">
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
                          </div>
                          <div className="space-y-3">
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
                          </div>
                        </div>

                        {/* Notes Section */}
                        {consultation.patientDetails?.notesForDoctor && (
                          <div className="mb-6">
                            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                              <div className="p-2 bg-amber-100 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                                  Patient Notes
                                </p>
                                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-amber-200">
                                  {consultation.patientDetails.notesForDoctor}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actual Times */}
                        {consultation.actualStartTime && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => handleViewDetails(consultation)}
                              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Details</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCopyConsultationId(
                                  consultation.consultationId
                                )
                              }
                              className={`flex items-center space-x-2 px-3 py-2 ${
                                copiedId === consultation.consultationId
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <Copy className="h-4 w-4" />
                              <span>
                                {copiedId === consultation.consultationId
                                  ? "Copied!"
                                  : "Copy ID"}
                              </span>
                            </Button>
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            ID:{" "}
                            {consultation.consultationId?.slice(-12) || "N/A"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Load More Button */}
        {hasMore && filteredConsultations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-8"
          >
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
              className="px-8"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConsultationsShadcn;
