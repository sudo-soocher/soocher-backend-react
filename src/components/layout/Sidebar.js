import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ isMobile, isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      path: "/doctors",
      label: "Doctors",
      icon: UserCheck,
      badge: "12",
      submenu: [
        { path: "/doctors/all", label: "All Doctors" },
        { path: "/doctors/pending", label: "Pending Verification" },
        { path: "/doctors/verified", label: "Verified" },
      ],
    },
    {
      path: "/patients",
      label: "Patients",
      icon: Users,
      badge: "1.2k",
      submenu: [
        { path: "/patients/all", label: "All Patients" },
        { path: "/patients/active", label: "Active" },
        { path: "/patients/inactive", label: "Inactive" },
      ],
    },
    {
      path: "/withdrawals",
      label: "Withdrawals",
      icon: DollarSign,
      badge: "23",
      submenu: [
        { path: "/withdrawals/pending", label: "Pending" },
        { path: "/withdrawals/approved", label: "Approved" },
        { path: "/withdrawals/rejected", label: "Rejected" },
      ],
    },
    {
      path: "/consultations",
      label: "Consultations",
      icon: MessageSquare,
      badge: "45",
      submenu: [
        { path: "/consultations/all", label: "All Consultations" },
        { path: "/consultations/active", label: "Active" },
        { path: "/consultations/completed", label: "Completed" },
      ],
    },
    {
      path: "/reports",
      label: "Reports",
      icon: BarChart3,
      badge: null,
    },
  ];

  const bottomMenuItems = [
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/logout", label: "Logout", icon: LogOut },
  ];

  const toggleSubmenu = (path) => {
    setExpandedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const containerVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      x: -300,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const submenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`sidebar ${isMobile ? "mobile" : ""} ${
          isOpen ? "open" : ""
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Header */}
        <motion.div className="sidebar-header" variants={itemVariants}>
          <div className="logo-container">
            <div className="logo">
              <span className="logo-text">S</span>
            </div>
            <div className="logo-content">
              <h3>Soocher</h3>
              <span className="logo-subtitle">Admin Panel</span>
            </div>
          </div>
          {isMobile && (
            <motion.button
              className="close-button"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          )}
        </motion.div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <motion.div key={item.path} variants={itemVariants}>
              <div className="nav-item-container">
                <Link
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.path);
                    }
                    if (isMobile) {
                      onClose();
                    }
                  }}
                >
                  <div className="nav-item-content">
                    <div className="nav-icon">
                      <item.icon size={20} />
                    </div>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </div>
                  {item.submenu && (
                    <motion.div
                      className="nav-arrow"
                      animate={{
                        rotate: expandedItems[item.path] ? 90 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={16} />
                    </motion.div>
                  )}
                </Link>

                {/* Submenu */}
                <AnimatePresence>
                  {item.submenu && expandedItems[item.path] && (
                    <motion.div
                      className="submenu"
                      variants={submenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`submenu-item ${
                            isActive(subItem.path) ? "active" : ""
                          }`}
                          onClick={() => isMobile && onClose()}
                        >
                          <span className="submenu-dot"></span>
                          <span className="submenu-label">{subItem.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Menu */}
        <motion.div className="sidebar-bottom" variants={itemVariants}>
          <div className="bottom-menu">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-menu-item ${
                  isActive(item.path) ? "active" : ""
                }`}
                onClick={() => isMobile && onClose()}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Sidebar;
