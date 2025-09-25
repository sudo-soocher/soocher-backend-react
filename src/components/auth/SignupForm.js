import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { signUp } from "../../firebase/auth";
import "./SignupForm.css";

const SignupForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await signUp(
      formData.email,
      formData.password,
      formData.displayName
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <motion.div
        className="success-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle className="success-icon" size={48} />
        <h3>Account Created Successfully!</h3>
        <p>You can now sign in with your credentials.</p>
      </motion.div>
    );
  }

  return (
    <div className="signup-container">
      <motion.div
        className="signup-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="signup-header">
          <h2>Create Admin Account</h2>
          <p>Set up your Soocher admin credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form-content">
          <div className="form-group">
            <div className="input-container">
              <User className="input-icon" size={20} />
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="form-input"
                placeholder=" "
              />
              <label className="form-label">Full Name</label>
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder=" "
              />
              <label className="form-label">Email Address</label>
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder=" "
              />
              <label className="form-label">Password</label>
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder=" "
              />
              <label className="form-label">Confirm Password</label>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
              >
                <AlertCircle className="error-icon" size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="signup-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupForm;
