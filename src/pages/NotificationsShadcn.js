import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Send,
  History,
  Users,
  UserCheck,
  User,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { sendNotificationToAll, getNotificationHistory, saveNotificationToFirestore } from "../services/notificationService";
import { cn } from "../lib/utils";

const NotificationsShadcn = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === "history") {
      loadNotificationHistory();
    }
  }, [activeTab]);

  const loadNotificationHistory = async () => {
    setLoadingHistory(true);
    try {
      const result = await getNotificationHistory();
      if (result.success) {
        setNotificationHistory(result.data || []);
      } else {
        setNotificationHistory([]);
      }
    } catch (error) {
      console.error("Error loading notification history:", error);
      setNotificationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      showToast("Validation Error", "Please fill in both title and message", "destructive");
      return;
    }

    setIsSending(true);

    try {
      // Save notification to Firestore first
      const saveResult = await saveNotificationToFirestore({
        title: title.trim(),
        message: message.trim(),
        target,
        status: "pending",
      });

      if (!saveResult.success) {
        console.error("Failed to save notification:", saveResult.error);
      }

      // Send notification via Cloud Function
      const result = await sendNotificationToAll(title.trim(), message.trim(), target);

      if (result.success) {
        // Update notification status to sent
        if (saveResult.success && saveResult.id) {
          await saveNotificationToFirestore({
            id: saveResult.id,
            status: "sent",
            sentAt: new Date(),
            recipientsCount: result.data?.recipientsCount || 0,
          }, true); // true = update existing
        }

        showToast("Success", result.message || "Notification sent successfully to all devices", "success");
        
        // Reset form
        setTitle("");
        setMessage("");
        setTarget("all");
        
        // Reload history and switch to history tab
        setTimeout(() => {
          loadNotificationHistory();
          setActiveTab("history");
        }, 1500);
      } else {
        // Update notification status to failed
        if (saveResult.success && saveResult.id) {
          await saveNotificationToFirestore({
            id: saveResult.id,
            status: "failed",
            error: result.error,
          }, true);
        }

        // Show detailed error message
        const errorMsg = result.error || "Failed to send notification";
        showToast(
          "Error Sending Notification", 
          errorMsg.includes("Cloud Function is not accessible") 
            ? errorMsg 
            : `Failed to send notification: ${errorMsg}`,
          "destructive"
        );
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

  const getStatusBadge = (status) => {
    const variants = {
      sent: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={cn("text-xs", variants[status] || variants.pending)}>
        {status || "pending"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            Send push notifications to all devices and view history
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
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
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="send" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Send Notification</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        {/* Send Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send Push Notification</CardTitle>
              <CardDescription>
                Broadcast notifications to all users, doctors, or patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Target Selection */}
                <div className="space-y-2">
                  <Label htmlFor="target">Target Audience *</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger id="target">
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>All Users</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="doctors">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4" />
                          <span>Doctors Only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="patients">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Patients Only</span>
                        </div>
                      </SelectItem>
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
                        on their mobile devices. The notification will be saved
                        to Firestore for history tracking.
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
                      Sending Notification...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View all sent notifications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-4">
                  {notificationHistory.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTargetIcon(notification.target || "all")}
                          <span className="text-sm font-medium text-gray-600">
                            {getTargetLabel(notification.target || "all")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(notification.status)}
                          <span className="text-xs text-gray-400 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      {notification.recipientsCount !== undefined && (
                        <p className="text-xs text-gray-500">
                          Sent to {notification.recipientsCount} device(s)
                        </p>
                      )}
                      {notification.error && (
                        <div className="mt-2">
                          <p className="text-xs text-red-600">
                            Error: {notification.error}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsShadcn;

