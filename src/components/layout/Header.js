import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Menu,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import "./Header.css";

const Header = ({ onMenuClick, isMobile }) => {
  const { user, logout } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const notifications = [
    { id: 1, title: "New doctor registered", time: "2 min ago", unread: true },
    {
      id: 2,
      title: "Withdrawal request pending",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      title: "Patient consultation completed",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 4,
      title: "System maintenance scheduled",
      time: "2 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="header">
      <div className="header-content">
        {/* Left Section */}
        <div className="header-left">
          {isMobile && (
            <motion.button
              className="menu-button"
              onClick={onMenuClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={20} />
            </motion.button>
          )}
          <div className="header-title">
            <h1>Admin Dashboard</h1>
            <span className="header-subtitle">Soocher Management System</span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="header-center">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search doctors, patients, reports..."
              className="search-input"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Dark Mode Toggle */}
          <motion.button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Notifications */}
          <div className="notifications-container">
            <motion.button
              className="notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <motion.span
                  className="notification-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notifications-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <button
                      className="mark-all-read"
                      onClick={() => setShowNotifications(false)}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`notification-item ${
                          notification.unread ? "unread" : ""
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="notification-content">
                          <p className="notification-title">
                            {notification.title}
                          </p>
                          <span className="notification-time">
                            {notification.time}
                          </span>
                        </div>
                        {notification.unread && (
                          <div className="notification-dot"></div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="user-menu-container">
            <motion.button
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="user-avatar">
                <User size={16} />
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user?.displayName || user?.email?.split("@")[0]}
                </span>
                <span className="user-role">Administrator</span>
              </div>
              <ChevronDown size={16} className="user-arrow" />
            </motion.button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="user-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="user-dropdown-name">
                        {user?.displayName || user?.email?.split("@")[0]}
                      </p>
                      <p className="user-dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-menu">
                    <button className="dropdown-item">
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button className="dropdown-item">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
