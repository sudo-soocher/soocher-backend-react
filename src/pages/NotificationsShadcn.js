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
import LoadingSpinner from "../components/common/LoadingSpinner";
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
    <div className="space-y-5">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={14} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.4px" }}>Notifications</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Send push notifications to all devices and view history
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: toast.variant === "success" ? "#ecfdf5" : "#fef2f2", border: `1px solid ${toast.variant === "success" ? "#a7f3d0" : "#fecaca"}`, color: toast.variant === "success" ? "#065f46" : "#ef4444", fontSize: 13, display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
            {toast.variant === "success" ? <CheckCircle2 size={16} style={{ marginTop: 2 }} /> : <AlertCircle size={16} style={{ marginTop: 2 }} />}
            <div>
              <strong style={{ display: "block", marginBottom: 2 }}>{toast.title}</strong>
              <span style={{ opacity: 0.9 }}>{toast.description}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList style={{ background: "#f0f7ff", padding: 4, borderRadius: 10 }}>
          <TabsTrigger value="send" style={{ borderRadius: 8, fontSize: 13, fontWeight: 600 }} className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            <Send size={14} /> <span>Send Notification</span>
          </TabsTrigger>
          <TabsTrigger value="history" style={{ borderRadius: 8, fontSize: 13, fontWeight: 600 }} className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            <History size={14} /> <span>History</span>
          </TabsTrigger>
        </TabsList>

        {/* Send Tab */}
        <TabsContent value="send">
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e3a5f", margin: "0 0 4px 0" }}>Send Push Notification</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Broadcast notifications to all users, doctors, or patients</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Selection */}
              <div className="space-y-2">
                <Label htmlFor="target" style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Target Audience <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger id="target" style={{ borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f8fbff" }}>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center space-x-2"><Users size={14} /><span>All Users</span></div>
                    </SelectItem>
                    <SelectItem value="doctors">
                      <div className="flex items-center space-x-2"><UserCheck size={14} /><span>Doctors Only</span></div>
                    </SelectItem>
                    <SelectItem value="patients">
                      <div className="flex items-center space-x-2"><User size={14} /><span>Patients Only</span></div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0 }}>
                  {target === "all" && "Send to all doctors and patients"}
                  {target === "doctors" && "Send to all doctors only"}
                  {target === "patients" && "Send to all patients only"}
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Title <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  style={{ borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f8fbff", fontSize: 13 }}
                  onFocus={e => e.currentTarget.style.background = "white"}
                  onBlur={e => e.currentTarget.style.background = "#f8fbff"}
                />
                <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0, textAlign: "right" }}>{title.length}/100</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Message <span style={{ color: "#ef4444" }}>*</span></Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  maxLength={500}
                  style={{ borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f8fbff", fontSize: 13, resize: "none" }}
                  onFocus={e => e.currentTarget.style.background = "white"}
                  onBlur={e => e.currentTarget.style.background = "#f8fbff"}
                />
                <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0, textAlign: "right" }}>{message.length}/500</p>
              </div>

              {/* Info Box */}
              <div style={{ background: "#eff6ff", border: "1px dashed #93c5fd", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bell size={16} color="#2563eb" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>Notification Preview</h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                      This notification will be sent to all devices with valid FCM tokens matching your target audience. Users will receive this as a push notification. It will also be logged in the History tab.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending || !title.trim() || !message.trim()}
                style={{ width: "100%", height: 44, borderRadius: 9, border: "none", background: isSending || !title.trim() || !message.trim() ? "#94a3b8" : "#3b82f6", color: "white", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: isSending || !title.trim() || !message.trim() ? "not-allowed" : "pointer", transition: "background 0.2s" }}
              >
                {isSending ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={16} /> Broadcast Notification</>
                )}
              </button>
            </form>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #e0f2fe", background: "#f8fbff" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e3a5f", margin: "0 0 4px 0" }}>Notification History</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>View previously sent notifications and their delivery status</p>
            </div>

            {loadingHistory ? (
              <LoadingSpinner message="Loading notification history..." />
            ) : notificationHistory.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <History size={40} style={{ color: "#bfdbfe", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>No notifications yet</p>
                <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Send your first notification to see history here.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: "#f0f7ff", borderBottom: "1px solid #bfdbfe" }}>
                      {["Date Sent", "Target", "Notification", "Status", "Recipients"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {notificationHistory.map((notification, idx) => (
                      <tr
                        key={notification.id}
                        style={{ borderBottom: "1px solid #f0f7ff", background: idx % 2 === 0 ? "white" : "#fafcff" }}
                      >
                        <td style={{ padding: "14px 16px", fontSize: 12.5, color: "#64748b" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Clock size={12} /> {formatDate(notification.createdAt)}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#475569", background: "#f1f5f9", padding: "4px 8px", borderRadius: 6, width: "fit-content" }}>
                            {getTargetIcon(notification.target || "all")}
                            {getTargetLabel(notification.target || "all")}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", maxWidth: 300 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", marginBottom: 2 }}>{notification.title}</div>
                          <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{notification.message}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {getStatusBadge(notification.status)}
                          {notification.error && (
                            <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={notification.error}>
                              Error: {notification.error}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12.5, fontWeight: 600, color: "#334155" }}>
                          {notification.recipientsCount !== undefined ? notification.recipientsCount : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsShadcn;

