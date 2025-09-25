import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getDoctorStats } from "../services/doctorService";
import { getPatientStats } from "../services/patientService";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    withdrawals: 0,
    verifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [doctorStats, setDoctorStats] = useState(null);
  const [patientStats, setPatientStats] = useState(null);

  // Load real data from Firestore
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load doctor and patient statistics
        const [doctorStatsResult, patientStatsResult] = await Promise.all([
          getDoctorStats(),
          getPatientStats(),
        ]);

        if (doctorStatsResult.success) {
          setDoctorStats(doctorStatsResult.data);
          setStats((prev) => ({
            ...prev,
            doctors: doctorStatsResult.data.total,
            verifications: doctorStatsResult.data.verified,
          }));
        }

        if (patientStatsResult.success) {
          setPatientStats(patientStatsResult.data);
          setStats((prev) => ({
            ...prev,
            patients: patientStatsResult.data.total,
          }));
        }

        // Mock data for withdrawals (you can implement this later)
        setStats((prev) => ({
          ...prev,
          withdrawals: 23, // This would come from a withdrawal service
        }));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Fallback to mock data on error
        setStats({
          doctors: 156,
          patients: 1247,
          withdrawals: 23,
          verifications: 89,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Chart data - using real data when available
  const revenueData = [
    { name: "Jan", revenue: 4000, patients: 240 },
    { name: "Feb", revenue: 3000, patients: 139 },
    { name: "Mar", revenue: 2000, patients: 980 },
    { name: "Apr", revenue: 2780, patients: 390 },
    { name: "May", revenue: 1890, patients: 480 },
    { name: "Jun", revenue: 2390, patients: 380 },
  ];

  // Doctor specialties from real data
  const doctorSpecialties = doctorStats?.specializations
    ? Object.entries(doctorStats.specializations).map(
        ([name, value], index) => ({
          name,
          value: Math.round((value / doctorStats.total) * 100),
          color: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#06b6d4",
          ][index % 6],
        })
      )
    : [
        { name: "Cardiology", value: 35, color: "#3b82f6" },
        { name: "Neurology", value: 25, color: "#10b981" },
        { name: "Orthopedics", value: 20, color: "#f59e0b" },
        { name: "Pediatrics", value: 20, color: "#ef4444" },
      ];

  const recentActivities = [
    {
      id: 1,
      action: "New doctor registered",
      time: "2 minutes ago",
      type: "success",
    },
    {
      id: 2,
      action: "Patient consultation completed",
      time: "15 minutes ago",
      type: "info",
    },
    {
      id: 3,
      action: "Withdrawal request processed",
      time: "1 hour ago",
      type: "warning",
    },
    {
      id: 4,
      action: "Doctor verification approved",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: 5,
      action: "New patient registered",
      time: "3 hours ago",
      type: "info",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  const statCards = [
    {
      title: "Total Doctors",
      value: stats.doctors,
      icon: UserCheck,
      color: "blue",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Total Patients",
      value: stats.patients,
      icon: Users,
      color: "green",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Pending Withdrawals",
      value: stats.withdrawals,
      icon: DollarSign,
      color: "yellow",
      change: "-3%",
      trend: "down",
    },
    {
      title: "Verifications",
      value: stats.verifications,
      icon: CheckCircle,
      color: "purple",
      change: "+15%",
      trend: "up",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <motion.div
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="loading-spinner" size={48} />
          <h3>Loading Dashboard...</h3>
          <p>Fetching the latest data from Soocher</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with Soocher today.</p>
        </div>
        <div className="header-actions">
          <motion.button
            className="action-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar size={16} />
            Last 30 days
          </motion.button>
          <motion.button
            className="action-button primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity size={16} />
            View Reports
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="stats-grid" variants={itemVariants}>
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            className={`stat-card ${card.color}`}
            variants={itemVariants}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 },
            }}
          >
            <div className="stat-card-header">
              <div className="stat-icon">
                <card.icon size={24} />
              </div>
              <motion.button
                className="stat-menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MoreHorizontal size={16} />
              </motion.button>
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <div className="stat-value">
                <motion.span
                  key={card.value}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {card.value.toLocaleString()}
                </motion.span>
                <div className="stat-change">
                  {card.trend === "up" ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  <span className={card.trend}>{card.change}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="charts-section">
        <motion.div className="chart-card" variants={itemVariants}>
          <div className="chart-header">
            <h3>Revenue & Patient Growth</h3>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color revenue"></div>
                <span>Revenue</span>
              </div>
              <div className="legend-item">
                <div className="legend-color patients"></div>
                <span>Patients</span>
              </div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#revenueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stackId="2"
                  stroke="#10b981"
                  fill="url(#patientsGradient)"
                />
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="patientsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="chart-card" variants={itemVariants}>
          <div className="chart-header">
            <h3>Doctor Specialties</h3>
            <span className="chart-subtitle">Distribution by specialty</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={doctorSpecialties}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {doctorSpecialties.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            {doctorSpecialties.map((item, index) => (
              <div key={index} className="pie-legend-item">
                <div
                  className="pie-legend-color"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{item.name}</span>
                <span className="pie-legend-value">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div className="activity-section" variants={itemVariants}>
        <div className="activity-header">
          <h3>Recent Activity</h3>
          <motion.button
            className="view-all-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
          </motion.button>
        </div>
        <div className="activity-list">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="activity-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`activity-indicator ${activity.type}`}></div>
              <div className="activity-content">
                <p className="activity-action">{activity.action}</p>
                <div className="activity-time">
                  <Clock size={12} />
                  <span>{activity.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
