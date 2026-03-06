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
  X,
  ChevronRight,
  CreditCard,
  Ticket,
  Bell,
  CalendarPlus,
  Stethoscope,
  ShieldCheck,
  List,
  Clock,
  CheckCircle,
  Play,
  Video,
  UserX,
  Activity,
} from "lucide-react";
import ManualBookingDialog from "../consultations/ManualBookingDialog";
import { cn } from "../../lib/utils";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, iconColor: "#3b82f6", bgColor: "#dbeafe" },
  {
    path: "/doctors", label: "Doctors", icon: Stethoscope, iconColor: "#0ea5e9", bgColor: "#e0f2fe",
    badge: "12",
    submenu: [
      { path: "/doctors/all", label: "All Doctors", icon: List },
      { path: "/doctors/pending", label: "Pending Verification", icon: Clock },
      { path: "/doctors/verified", label: "Verified", icon: CheckCircle },
    ],
  },
  {
    path: "/patients", label: "Patients", icon: Users, iconColor: "#6366f1", bgColor: "#e0e7ff",
    badge: "1.2k",
    submenu: [
      { path: "/patients/all", label: "All Patients", icon: List },
      { path: "/patients/verified", label: "Healthy (80+)", icon: Activity },
      { path: "/patients/pending", label: "Needs Attention", icon: UserX },
    ],
  },
  { path: "/withdrawals", label: "Withdrawals", icon: DollarSign, iconColor: "#10b981", bgColor: "#d1fae5", badge: "5" },
  {
    path: "/consultations", label: "Consultations", icon: MessageSquare, iconColor: "#f59e0b", bgColor: "#fef3c7",
    badge: "24",
    submenu: [
      { path: "/consultations/all", label: "All Consultations", icon: List },
      { path: "/consultations/active", label: "Active", icon: Play },
      { path: "/consultations/completed", label: "Completed", icon: CheckCircle },
      { path: null, label: "Create Booking", isAction: true, icon: CalendarPlus },
    ],
  },
  { path: "/transactions", label: "Transactions", icon: CreditCard, iconColor: "#8b5cf6", bgColor: "#ede9fe" },
  { path: "/coupons", label: "Coupons Manager", icon: Ticket, iconColor: "#ec4899", bgColor: "#fce7f3" },
  { path: "/notifications", label: "Notifications", icon: Bell, iconColor: "#06b6d4", bgColor: "#cffafe" },
  { path: "/reports", label: "Reports", icon: BarChart3, iconColor: "#f97316", bgColor: "#ffedd5" },
];

const SidebarShadcn = ({ isMobile, isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});
  const [showManualBookingDialog, setShowManualBookingDialog] = useState(false);

  const toggleExpanded = (path) =>
    setExpandedItems((prev) => ({ ...prev, [path]: !prev[path] }));

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const isSubmenuActive = (submenu) =>
    submenu.some((item) => location.pathname === item.path);

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white", borderRight: "1px solid hsl(213,30%,92%)", overflowY: "auto" }}>

      {/* Logo Header */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid hsl(213,30%,93%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 38, height: 38,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              borderRadius: 11,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
            }}>
              <Stethoscope size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", letterSpacing: "-0.2px" }}>Soocher</div>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>Admin Panel</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={onClose} style={{ background: "hsl(213,40%,95%)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} color="#64748b" />
            </button>
          )}
        </div>

        {/* Admin badge */}
        <div style={{ marginTop: 14, padding: "8px 10px", background: "linear-gradient(135deg, #eff6ff, #e0e7ff)", borderRadius: 10, border: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={14} color="#3b82f6" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1e40af" }}>System Administrator</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>Full access</div>
          </div>
          <div style={{ marginLeft: "auto", width: 7, height: 7, background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 0 2px #dcfce7" }} />
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
          Navigation
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedItems[item.path];
            const isItemActive = isActive(item.path) || (hasSubmenu && isSubmenuActive(item.submenu));

            return (
              <div key={item.path}>
                {hasSubmenu ? (
                  <div
                    className={cn("nav-item", isItemActive && "active")}
                    onClick={() => toggleExpanded(item.path)}
                  >
                    <div className="nav-icon-wrap" style={isItemActive ? { background: item.bgColor } : {}}>
                      <Icon size={15} style={{ color: isItemActive ? item.iconColor : "#64748b" }} />
                    </div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: isItemActive ? item.bgColor : "#f1f5f9", color: isItemActive ? item.iconColor : "#64748b", padding: "2px 7px", borderRadius: 20, border: `1px solid ${isItemActive ? item.bgColor : "transparent"}` }}>
                        {item.badge}
                      </span>
                    )}
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.18 }}>
                      <ChevronRight size={13} style={{ color: "#94a3b8" }} />
                    </motion.div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={cn("nav-item", isItemActive && "active")}
                  >
                    <div className="nav-icon-wrap" style={isItemActive ? { background: item.bgColor } : {}}>
                      <Icon size={15} style={{ color: isItemActive ? item.iconColor : "#64748b" }} />
                    </div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: isItemActive ? item.bgColor : "#f1f5f9", color: isItemActive ? item.iconColor : "#64748b", padding: "2px 7px", borderRadius: 20 }}>
                        {item.badge}
                      </span>
                    )}
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
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ marginLeft: 10, marginTop: 2, display: "flex", flexDirection: "column", gap: 1, paddingLeft: 34, borderLeft: "2px solid #e0f2fe" }}>
                        {item.submenu.map((subItem) => {
                          if (subItem.isAction) {
                            const ActionIcon = subItem.icon || CalendarPlus;
                            return (
                              <button
                                key={subItem.label}
                                onClick={() => { setShowManualBookingDialog(true); if (isMobile) onClose(); }}
                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", fontSize: 12.5, fontWeight: 500, color: "#3b82f6", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%", marginTop: 2 }}
                              >
                                <ActionIcon size={12} />
                                {subItem.label}
                              </button>
                            );
                          }
                          const SubIcon = subItem.icon;
                          const subActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={onClose}
                              style={{
                                display: "flex", alignItems: "center", gap: 7,
                                padding: "7px 10px", borderRadius: 8, fontSize: 12.5,
                                fontWeight: subActive ? 600 : 400,
                                color: subActive ? "#1d4ed8" : "#64748b",
                                background: subActive ? "#eff6ff" : "transparent",
                                textDecoration: "none",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={e => { if (!subActive) e.currentTarget.style.background = "#f8fafc"; }}
                              onMouseLeave={e => { if (!subActive) e.currentTarget.style.background = "transparent"; }}
                            >
                              {SubIcon && <SubIcon size={12} style={{ color: subActive ? "#3b82f6" : "#94a3b8", flexShrink: 0 }} />}
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 12px 16px", borderTop: "1px solid hsl(213,30%,93%)" }}>
        <button
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 500, color: "#64748b", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#334155"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748b"; }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings size={15} color="#64748b" />
          </div>
          Settings
        </button>
        <button
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 500, color: "#ef4444", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={15} color="#ef4444" />
          </div>
          Logout
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40"
                style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              />
              <motion.div
                className="fixed left-0 top-0 h-full z-50"
                style={{ width: 260 }}
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
              >
                {sidebarContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <ManualBookingDialog
          open={showManualBookingDialog}
          onOpenChange={setShowManualBookingDialog}
          onSuccess={() => console.log("Manual booking created successfully")}
        />
      </>
    );
  }

  return (
    <>
      <div className="hidden md:block" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, zIndex: 40 }}>
        {sidebarContent}
      </div>
      {!isMobile && (
        <ManualBookingDialog
          open={showManualBookingDialog}
          onOpenChange={setShowManualBookingDialog}
          onSuccess={() => console.log("Manual booking created successfully")}
        />
      )}
    </>
  );
};

export default SidebarShadcn;
