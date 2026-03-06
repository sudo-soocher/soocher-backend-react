import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "medium", message = "Loading...", fullHeight = false }) => {
  const sizeMap = {
    small: 24,
    medium: 36,
    large: 48,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        height: fullHeight ? "100%" : "auto",
        minHeight: fullHeight ? "300px" : "auto",
        width: "100%"
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: sizeMap[size], height: sizeMap[size] }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid #e0f2fe",
            borderTopColor: "#3b82f6",
            boxSizing: "border-box"
          }}
        />
        <Loader2
          size={sizeMap[size] * 0.45}
          color="#3b82f6"
          style={{ position: "absolute", animation: "spin 2s linear infinite" }}
        />
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: 16, fontSize: 13.5, fontWeight: 600, color: "#64748b", letterSpacing: "0.2px", margin: "16px 0 0 0" }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;
