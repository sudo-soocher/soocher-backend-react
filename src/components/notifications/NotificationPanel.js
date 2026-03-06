import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bell, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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

const NotificationPanel = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);

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
      const result = await sendNotificationToAll(title, message, target);

      if (result.success) {
        showToast("Success", result.message || "Notification sent successfully to all devices", "success");
        // Reset form
        setTitle("");
        setMessage("");
        setTarget("all");
        // Close panel after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        showToast("Error", result.error || "Failed to send notification", "destructive");
      }
    } catch (error) {
      showToast("Error", error.message || "An unexpected error occurred", "destructive");
    } finally {
      setIsSending(false);
    }
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

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 bg-white shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Send Notification
                    </h2>
                    <p className="text-xs text-gray-500">
                      Broadcast to all devices
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

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6">
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
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 space-y-3">
                <Button
                  type="submit"
                  onClick={handleSubmit}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                  disabled={isSending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;

