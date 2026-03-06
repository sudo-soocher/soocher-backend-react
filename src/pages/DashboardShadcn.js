import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  DollarSign,
  CheckCircle,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Eye,
  UserPlus,
  CreditCard,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  CalendarPlus,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getDoctorStats } from "../services/doctorService";
import { getPatientStats } from "../services/patientService";
import ManualBookingDialog from "../components/consultations/ManualBookingDialog";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import LoadingSpinner from "../components/common/LoadingSpinner";

// ─── Staggered fade-up helper ────────────────────────────────────────────────
const FadeUp = ({ delay = 0, children, style }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    style={style}
  >
    {children}
  </motion.div>
);

// ─── Specialties Popover ──────────────────────────────────────────────────────
const SpecialtiesPopover = ({ specialties }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        title="View all specialties"
        style={{ marginLeft: "auto", width: 26, height: 26, borderRadius: 8, border: "1.5px solid #bfdbfe", background: "#f0f7ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s", flexShrink: 0 }}
        onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#6366f1"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#f0f7ff"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
      >
        <Eye size={13} color="#6366f1" />
      </button>
    </PopoverTrigger>
    <PopoverContent style={{ width: 280, padding: 0, borderRadius: 14, border: "1px solid #bfdbfe", boxShadow: "0 8px 30px rgba(99,102,241,0.12)" }} align="end">
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #e0f2fe" }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#1e3a5f" }}>All Doctor Specialties</span>
      </div>
      <div style={{ maxHeight: 300, overflowY: "auto", padding: "8px 14px" }}>
        {specialties.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < specialties.length - 1 ? "1px solid #f0f7ff" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: "#334155" }}>{s.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}%</span>
          </div>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = memo(({ card, index }) => {
  const Icon = card.icon;
  return (
    <FadeUp delay={0.08 + index * 0.07}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "20px 22px",
        border: `1px solid ${card.borderColor}`,
        boxShadow: `0 1px 4px rgba(0,0,0,0.05), 0 0 0 0 ${card.shadowColor}`,
        transition: "all 0.25s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${card.shadowColor}`; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {/* Background accent blob */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: card.blobColor, opacity: 0.55 }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {card.title}
            </p>
            <p style={{ margin: "6px 0 4px", fontSize: 30, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-1px", lineHeight: 1 }}>
              {card.value.toLocaleString()}
            </p>
            <p style={{ margin: "4px 0 8px", fontSize: 11.5, color: "#94a3b8" }}>{card.description}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: card.trend === "up" ? "#dcfce7" : "#fef2f2", fontSize: 11, fontWeight: 700, color: card.trend === "up" ? "#16a34a" : "#dc2626" }}>
              {card.trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {card.change} this month
            </div>
          </div>

          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg, ${card.iconGradientFrom}, ${card.iconGradientTo})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 12px ${card.shadowColor}`,
            flexShrink: 0,
          }}>
            <Icon size={22} color="white" />
          </div>
        </div>
      </div>
    </FadeUp>
  );
});
StatCard.displayName = "StatCard";

// ─── Activity item ────────────────────────────────────────────────────────────
const activityColors = { success: "#10b981", warning: "#f59e0b", info: "#3b82f6" };

const ActivityItem = ({ activity, index }) => {
  const Icon = activity.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.5 + index * 0.07 }}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: "1px solid #f0f7ff" }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: `${activityColors[activity.type]}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={15} style={{ color: activityColors[activity.type] }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "#1e3a5f" }}>{activity.action}</p>
        <p style={{ margin: "1px 0 0", fontSize: 11.5, color: "#64748b" }}>{activity.user}</p>
      </div>
      <span style={{ fontSize: 10.5, color: "#94a3b8", whiteSpace: "nowrap", marginTop: 2 }}>{activity.time}</span>
    </motion.div>
  );
};

// ─── Quick Action Button ───────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, color, bg, onClick }) => (
  <button
    onClick={onClick}
    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "14px 8px", borderRadius: 12, border: `1.5px solid ${bg}`, background: bg, cursor: "pointer", transition: "all 0.18s", flex: 1 }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 16px ${bg}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={17} color="white" />
    </div>
    <span style={{ fontSize: 11, fontWeight: 600, color: "#334155", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
  </button>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashboardShadcn = memo(() => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, withdrawals: 0, verifications: 0 });
  const [loading, setLoading] = useState(true);
  const [doctorStats, setDoctorStats] = useState(null);
  const [timeRange, setTimeRange] = useState("6months");
  const [showManualBookingDialog, setShowManualBookingDialog] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorStatsResult, patientStatsResult] = await Promise.all([
        getDoctorStats(),
        getPatientStats(),
      ]);
      if (doctorStatsResult.success) {
        setDoctorStats(doctorStatsResult.data);
        setStats(prev => ({ ...prev, doctors: doctorStatsResult.data.total, verifications: doctorStatsResult.data.verified }));
      }
      if (patientStatsResult.success) {
        setStats(prev => ({ ...prev, patients: patientStatsResult.data.total }));
      }
      setStats(prev => ({ ...prev, withdrawals: 23 }));
    } catch {
      setStats({ doctors: 156, patients: 1247, withdrawals: 23, verifications: 89 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const revenueData = useMemo(() => [
    { name: "Jan", revenue: 4000, patients: 240 },
    { name: "Feb", revenue: 3000, patients: 139 },
    { name: "Mar", revenue: 5200, patients: 980 },
    { name: "Apr", revenue: 4780, patients: 390 },
    { name: "May", revenue: 3890, patients: 480 },
    { name: "Jun", revenue: 5390, patients: 520 },
  ], []);

  const revenueChartConfig = { revenue: { label: "Revenue", color: "#3b82f6" }, patients: { label: "Patients", color: "#6366f1" } };

  const doctorSpecialties = useMemo(() => {
    if (doctorStats?.specializations) {
      return Object.entries(doctorStats.specializations).map(([name, value], i) => ({
        name, value: Math.round((value / doctorStats.total) * 100),
        color: ["#3b82f6", "#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#06b6d4"][i % 6],
      }));
    }
    return [
      { name: "Cardiology", value: 35, color: "#3b82f6" },
      { name: "Neurology", value: 25, color: "#6366f1" },
      { name: "Orthopedics", value: 20, color: "#0ea5e9" },
      { name: "Pediatrics", value: 20, color: "#06b6d4" },
    ];
  }, [doctorStats]);

  const pieChartConfig = useMemo(() => ({
    value: { label: "Percentage" },
    ...doctorSpecialties.reduce((acc, s) => { acc[s.name] = { label: s.name, color: s.color }; return acc; }, {}),
  }), [doctorSpecialties]);

  const statCards = useMemo(() => [
    { title: "Total Doctors", value: stats.doctors, icon: UserCheck, description: "Active medical professionals", change: "+12%", trend: "up", borderColor: "#bfdbfe", shadowColor: "rgba(59,130,246,0.15)", blobColor: "#dbeafe", iconGradientFrom: "#3b82f6", iconGradientTo: "#6366f1" },
    { title: "Total Patients", value: stats.patients, icon: Users, description: "Registered patients", change: "+8%", trend: "up", borderColor: "#a5f3fc", shadowColor: "rgba(6,182,212,0.15)", blobColor: "#cffafe", iconGradientFrom: "#0ea5e9", iconGradientTo: "#06b6d4" },
    { title: "Pending Withdrawals", value: stats.withdrawals, icon: DollarSign, description: "Awaiting approval", change: "-3%", trend: "down", borderColor: "#bbf7d0", shadowColor: "rgba(16,185,129,0.15)", blobColor: "#d1fae5", iconGradientFrom: "#10b981", iconGradientTo: "#059669" },
    { title: "Verifications", value: stats.verifications, icon: CheckCircle, description: "Verified accounts", change: "+15%", trend: "up", borderColor: "#ddd6fe", shadowColor: "rgba(99,102,241,0.15)", blobColor: "#ede9fe", iconGradientFrom: "#6366f1", iconGradientTo: "#8b5cf6" },
  ], [stats]);

  const recentActivities = useMemo(() => [
    { id: 1, action: "New doctor registered", user: "Dr. Sarah Johnson", time: "2 min ago", type: "success", icon: UserPlus },
    { id: 2, action: "Patient consultation completed", user: "Dr. Michael Chen", time: "15 min ago", type: "info", icon: Activity },
    { id: 3, action: "Withdrawal request processed", user: "Dr. Emily Davis", time: "1 hour ago", type: "warning", icon: CreditCard },
    { id: 4, action: "Doctor verification approved", user: "Dr. Robert Wilson", time: "2 hours ago", type: "success", icon: CheckCircle },
    { id: 5, action: "New patient registered", user: "Patient Portal", time: "3 hours ago", type: "info", icon: UserPlus },
  ], []);

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading Dashboard..." />;
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>

      {/* Page Header */}
      <FadeUp delay={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={14} color="white" />
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.5px" }}>
                Dashboard Overview
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Welcome back! Here's what's happening with Soocher today.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger style={{ width: 150, height: 36, borderRadius: 10, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => { }}
              style={{ height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", border: "none", fontSize: 12.5, fontWeight: 600, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "0 14px", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
            >
              <Eye size={14} /> View Reports
            </Button>
          </div>
        </div>
      </FadeUp>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 22 }}>
        {statCards.map((card, i) => <StatCard key={card.title} card={card} index={i} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 22 }}>

        {/* Area chart */}
        <FadeUp delay={0.3}>
          <div className="admin-card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={16} color="#3b82f6" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}>Revenue & Growth</span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#94a3b8" }}>Monthly revenue and patient growth trends</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[{ color: "#3b82f6", label: "Revenue" }, { color: "#6366f1", label: "Patients" }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            <ChartContainer config={revenueChartConfig} style={{ height: 220 }}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f7ff" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gRevenue)" />
                <Area type="monotone" dataKey="patients" stroke="#6366f1" strokeWidth={2} fill="url(#gPatients)" />
              </AreaChart>
            </ChartContainer>
          </div>
        </FadeUp>

        {/* Pie chart */}
        <FadeUp delay={0.38}>
          <div className="admin-card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <PieChartIcon size={15} color="#6366f1" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}>Doctor Specialties</span>
              <SpecialtiesPopover specialties={doctorSpecialties} />
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 11.5, color: "#94a3b8" }}>Distribution of medical specialties</p>
            <ChartContainer config={pieChartConfig} style={{ height: 160 }}>
              <PieChart>
                <Pie data={doctorSpecialties} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value" labelLine={false} label={false}>
                  {doctorSpecialties.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(v, n) => [`${v}%`, n]} />} />
              </PieChart>
            </ChartContainer>
            {/* Show only top 4 specialties inline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 12 }}>
              {doctorSpecialties.slice(0, 4).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
                    <span style={{ fontSize: 11.5, color: "#334155" }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: s.color }}>{s.value}%</span>
                </div>
              ))}
              {doctorSpecialties.length > 4 && (
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", textAlign: "center" }}>
                  +{doctorSpecialties.length - 4} more — click 👁 to view all
                </p>
              )}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Activity + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* Recent Activity */}
        <FadeUp delay={0.42}>
          <div className="admin-card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Activity size={15} color="#3b82f6" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}>Recent Activity</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>View all →</span>
            </div>
            {recentActivities.map((a, i) => <ActivityItem key={a.id} activity={a} index={i} />)}
          </div>
        </FadeUp>

        {/* Quick Actions */}
        <FadeUp delay={0.48}>
          <div className="admin-card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <BarChart3 size={15} color="#6366f1" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}>Quick Actions</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <QuickAction icon={CalendarPlus} label="Manual Booking" color="#3b82f6" bg="#eff6ff" onClick={() => setShowManualBookingDialog(true)} />
              <QuickAction icon={UserCheck} label="Verify Doctor" color="#10b981" bg="#f0fdf4" onClick={() => { }} />
              <QuickAction icon={DollarSign} label="Withdrawals" color="#f59e0b" bg="#fffbeb" onClick={() => { }} />
              <QuickAction icon={Users} label="All Patients" color="#6366f1" bg="#ede9fe" onClick={() => { }} />
              <QuickAction icon={BarChart3} label="Reports" color="#0ea5e9" bg="#f0f9ff" onClick={() => { }} />
              <QuickAction icon={Calendar} label="Schedule" color="#ec4899" bg="#fdf2f8" onClick={() => { }} />
            </div>

            {/* Mini stat strip */}
            <div style={{ marginTop: 18, padding: "12px 14px", background: "linear-gradient(135deg,#eff6ff,#ede9fe)", borderRadius: 12, border: "1px solid #bfdbfe" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Today's Summary</p>
              {[
                { label: "New Registrations", value: "14", color: "#3b82f6" },
                { label: "Completed Sessions", value: "38", color: "#10b981" },
                { label: "Pending Reviews", value: "7", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 11.5, color: "#475569" }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>

      <ManualBookingDialog
        open={showManualBookingDialog}
        onOpenChange={setShowManualBookingDialog}
        onSuccess={() => console.log("Manual booking created successfully")}
      />
    </div>
  );
});

DashboardShadcn.displayName = "DashboardShadcn";
export default DashboardShadcn;
