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
  ChevronDown,
} from "lucide-react";

// shadcn components
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const SidebarShadcn = ({ isMobile, isOpen, onClose }) => {
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
        { path: "/patients/verified", label: "Healthy (80+)" },
        { path: "/patients/pending", label: "Needs Attention" },
      ],
    },
    {
      path: "/withdrawals",
      label: "Withdrawals",
      icon: DollarSign,
      badge: "5",
    },
    {
      path: "/consultations",
      label: "Consultations",
      icon: MessageSquare,
      badge: "24",
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

  const toggleExpanded = (path) => {
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

  const isSubmenuActive = (submenu) => {
    return submenu.some((item) => location.pathname === item.path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Soocher</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedItems[item.path];
          const isItemActive =
            isActive(item.path) ||
            (hasSubmenu && isSubmenuActive(item.submenu));

          return (
            <div key={item.path}>
              {hasSubmenu ? (
                <div
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer group",
                    isItemActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => {
                    toggleExpanded(item.path);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer group",
                    isItemActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              )}

              {/* Submenu */}
              <AnimatePresence>
                {hasSubmenu && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={onClose}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            location.pathname === subItem.path
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            {/* Sidebar */}
            <motion.div
              className="fixed left-0 top-0 h-full w-80 z-50"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0 md:z-40">
      {sidebarContent}
    </div>
  );
};

export default SidebarShadcn;
