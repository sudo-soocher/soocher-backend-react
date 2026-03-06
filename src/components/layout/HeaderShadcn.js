import React, { useState } from "react";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const HeaderShadcn = ({ onMenuClick, isMobile }) => {
  const { user, logout } = useAuthContext();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const notifications = [
    { id: 1, title: "New doctor registered", time: "2 min ago", unread: true, color: "#3b82f6" },
    { id: 2, title: "Withdrawal request pending", time: "15 min ago", unread: true, color: "#f59e0b" },
    { id: 3, title: "Patient consultation completed", time: "1 hour ago", unread: false, color: "#10b981" },
    { id: 4, title: "System maintenance scheduled", time: "2 hours ago", unread: false, color: "#6366f1" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="glass-header" style={{ position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 62 }}>

        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isMobile && (
            <button
              onClick={onMenuClick}
              style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Menu size={17} color="#3b82f6" />
            </button>
          )}
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "#1e3a5f", margin: 0, letterSpacing: "-0.3px" }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
              Soocher Management System
            </p>
          </div>
        </div>

        {/* Center — Search */}
        {!isMobile && (
          <div style={{ flex: 1, maxWidth: 380, margin: "0 32px" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#93c5fd" }} />
              <input
                type="text"
                placeholder="Search doctors, patients, reports…"
                style={{
                  width: "100%",
                  paddingLeft: 34,
                  paddingRight: 14,
                  height: 37,
                  borderRadius: 10,
                  border: "1.5px solid #bfdbfe",
                  background: "#f0f7ff",
                  fontSize: 12.5,
                  color: "#1e3a5f",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
          </div>
        )}

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Notification bell */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <button style={{ position: "relative", background: "#f0f7ff", border: "1.5px solid #bfdbfe", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <Bell size={16} color="#3b82f6" />
                {unreadCount > 0 && (
                  <span className="pulse-badge" style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", borderRadius: "50%", width: 17, height: 17, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent style={{ width: 320, padding: 0, borderRadius: 14, border: "1px solid #bfdbfe", boxShadow: "0 8px 30px rgba(59,130,246,0.12)" }} align="end">
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #e0f2fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e3a5f" }}>Notifications</span>
                <button onClick={() => setShowNotifications(false)} style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  Mark all read
                </button>
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f0f7ff", background: n.unread ? "#fafcff" : "white", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? "#fafcff" : "white"}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.unread ? n.color : "#e2e8f0", marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: n.unread ? 600 : 400, color: "#1e3a5f" }}>{n.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "#e0f2fe", margin: "0 2px" }} />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 10px 5px 5px", borderRadius: 11, border: "1.5px solid #bfdbfe", background: "#f0f7ff", cursor: "pointer", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <Avatar style={{ width: 28, height: 28 }}>
                  <AvatarImage src={user?.photoURL} />
                  <AvatarFallback style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", fontSize: 11, fontWeight: 700 }}>
                    {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div style={{ textAlign: "left" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1e3a5f" }}>
                      {user?.displayName || user?.email?.split("@")[0]}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>Administrator</p>
                  </div>
                )}
                <ChevronDown size={12} color="#94a3b8" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ width: 220, borderRadius: 14, border: "1px solid #bfdbfe", boxShadow: "0 8px 30px rgba(59,130,246,0.12)" }}>
              <DropdownMenuLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar style={{ width: 34, height: 34 }}>
                    <AvatarImage src={user?.photoURL} />
                    <AvatarFallback style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", fontSize: 13, fontWeight: 700 }}>
                      {user?.displayName?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#1e3a5f" }}>
                      {user?.displayName || user?.email?.split("@")[0]}
                    </p>
                    <p style={{ margin: 0, fontSize: 10.5, color: "#94a3b8" }}>{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem style={{ cursor: "pointer", fontSize: 13, color: "#334155" }}>
                <User size={14} style={{ marginRight: 8, color: "#3b82f6" }} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem style={{ cursor: "pointer", fontSize: 13, color: "#334155" }}>
                <Settings size={14} style={{ marginRight: 8, color: "#6366f1" }} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} style={{ cursor: "pointer", fontSize: 13, color: "#ef4444" }}>
                <LogOut size={14} style={{ marginRight: 8 }} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default HeaderShadcn;
