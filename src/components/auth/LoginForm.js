import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import "./LoginForm.css";

const LoginForm = ({ onShowSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    blur: {
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-form"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="login-header" variants={itemVariants}>
          <motion.div
            className="logo-container"
            variants={logoVariants}
            whileHover="hover"
          >
            <div className="logo">S</div>
          </motion.div>
          <motion.h2 variants={itemVariants}>Welcome to Soocher</motion.h2>
          <motion.p variants={itemVariants}>
            Sign in to your admin dashboard
          </motion.p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="login-form-content"
          variants={itemVariants}
        >
          <motion.div className="form-group" variants={itemVariants}>
            <div className="input-container">
              <Mail className="input-icon" size={20} />
              <motion.input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="form-input"
                placeholder=" "
                variants={inputVariants}
                whileFocus="focus"
                whileBlur="blur"
              />
              <motion.label
                htmlFor="email"
                className="form-label"
                animate={{
                  y: email ? -28 : 0,
                  scale: email ? 0.85 : 1,
                  color: email ? "#60a5fa" : "rgba(255, 255, 255, 0.6)",
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                Email Address
              </motion.label>
              <motion.div
                className="input-border"
                animate={{
                  scaleX: email ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <div className="input-container">
              <Lock className="input-icon" size={20} />
              <motion.input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="form-input"
                placeholder=" "
                variants={inputVariants}
                whileFocus="focus"
                whileBlur="blur"
              />
              <motion.label
                htmlFor="password"
                className="form-label"
                animate={{
                  y: password ? -28 : 0,
                  scale: password ? 0.85 : 1,
                  color: password ? "#60a5fa" : "rgba(255, 255, 255, 0.6)",
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                Password
              </motion.label>
              <motion.button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </motion.button>
              <motion.div
                className="input-border"
                animate={{
                  scaleX: password ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <AlertCircle className="error-icon" size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="login-button"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  className="button-loader"
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="loader-spinner" size={20} />
                </motion.div>
              ) : (
                <motion.span
                  className="button-text"
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Sign In
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.div
            className="signup-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onShowSignup}
                className="signup-button-link"
              >
                Create Admin Account
              </button>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default LoginForm;
