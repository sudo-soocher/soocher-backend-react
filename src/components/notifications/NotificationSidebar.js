import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bell,
  Send,
  Clock,
  Users,
  UserCheck,
  User,
  Loader2,
  Plus,
  History,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { sendNotificationToAll } from "../../services/notificationService";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { getCollection } from "../../firebase/firestore";
import { where, orderBy } from "firebase/firestore";

const NotificationSidebar = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("send"); // 'send' or 'history'
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Load notification history from Firestore
  useEffect(() => {
    if (isOpen && activeTab === "history") {
      loadNotificationHistory();
    }
  }, [isOpen, activeTab]);

  const loadNotificationHistory = async () => {
    setLoadingHistory(true);
    try {
      // Assuming you have a 'notifications' collection in Firestore
      const result = await getCollection("notifications", [
        orderBy("createdAt", "desc"),
        // limit(50) // Limit to last 50 notifications
      ]);

      if (result.success) {
        setNotificationHistory(result.data || []);
      } else {
        console.error("Failed to load notification history:", result.error);
        // If collection doesn't exist, show empty state
        setNotificationHistory([]);
      }
    } catch (error) {
      console.error("Error loading notification history:", error);
      setNotificationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      showToast("Validation Error", "Please fill in both title and message", "destructive");
      return;
    }

    setIsSending(true);

    try {
      const result = await sendNotificationToAll(title, message, target);

      if (result.success) {
        showToast("Success", result.message || "Notification sent successfully to all devices", "success");
        
        // Save to history (optional - you can create a Cloud Function to do this)
        // For now, we'll add it locally
        const newNotification = {
          id: Date.now().toString(),
          title,
          message,
          target,
          createdAt: new Date(),
          status: "sent",
        };
        setNotificationHistory([newNotification, ...notificationHistory]);
        
        // Reset form
        setTitle("");
        setMessage("");
        setTarget("all");
        
        // Switch to history tab after sending
        setTimeout(() => {
          setActiveTab("history");
        }, 1500);
      } else {
        showToast("Error", result.error || "Failed to send notification", "destructive");
      }
    } catch (error) {
      showToast("Error", error.message || "An unexpected error occurred", "destructive");
    } finally {
      setIsSending(false);
    }
  };

  const getTargetIcon = (targetValue) => {
    switch (targetValue) {
      case "doctors":
        return <UserCheck className="h-4 w-4" />;
      case "patients":
        return <User className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTargetLabel = (targetValue) => {
    switch (targetValue) {
      case "doctors":
        return "Doctors";
      case "patients":
        return "Patients";
      default:
        return "All Users";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 bg-white shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manage & send notifications
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("send")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                  activeTab === "send"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                  activeTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <div className="flex items-center justify-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </div>
              </button>
            </div>

            {/* Toast Notification */}
            {toast && (
              <div className="px-6 pt-4">
                <Alert
                  variant={toast.variant === "destructive" ? "destructive" : "default"}
                  className={toast.variant === "success" ? "bg-green-50 border-green-200" : ""}
                >
                  {toast.variant === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertTitle className={toast.variant === "success" ? "text-green-900" : ""}>
                    {toast.title}
                  </AlertTitle>
                  <AlertDescription className={toast.variant === "success" ? "text-green-700" : ""}>
                    {toast.description}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "send" ? (
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Target Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="target">Target Audience</Label>
                      <Select value={target} onValueChange={setTarget}>
                        <SelectTrigger id="target">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="doctors">Doctors Only</SelectItem>
                          <SelectItem value="patients">Patients Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {target === "all" && "Send to all doctors and patients"}
                        {target === "doctors" && "Send to all doctors only"}
                        {target === "patients" && "Send to all patients only"}
                      </p>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter notification title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500">
                        {title.length}/100 characters
                      </p>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter notification message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500">
                        {message.length}/500 characters
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            Notification Preview
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            This notification will be sent to all devices with valid
                            FCM tokens. Users will receive this as a push notification
                            on their mobile devices.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSending || !title.trim() || !message.trim()}
                      className="w-full"
                      size="lg"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Notification
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="p-6">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : notificationHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <History className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">No notifications yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Send your first notification to see history here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notificationHistory.map((notification) => (
                        <div
                          key={notification.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getTargetIcon(notification.target || "all")}
                              <span className="text-xs font-medium text-gray-600">
                                {getTargetLabel(notification.target || "all")}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDate(notification.createdAt)}
                              </span>
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.status && (
                            <div className="mt-2">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                  notification.status === "sent"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                )}
                              >
                                {notification.status}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationSidebar;

