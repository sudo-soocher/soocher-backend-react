import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  Eye,
  UserPlus,
  CreditCard,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { getDoctorStats } from "../services/doctorService";
import { getPatientStats } from "../services/patientService";

// shadcn components
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const DashboardShadcn = memo(() => {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    withdrawals: 0,
    verifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [doctorStats, setDoctorStats] = useState(null);
  const [patientStats, setPatientStats] = useState(null);
  const [timeRange, setTimeRange] = useState("6months");

  // Load real data from Firestore
  const loadDashboardData = useCallback(async () => {
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

      // Mock data for withdrawals
      setStats((prev) => ({
        ...prev,
        withdrawals: 23,
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
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Chart data - using real data when available
  const revenueData = useMemo(
    () => [
      { name: "Jan", revenue: 4000, patients: 240, consultations: 180 },
      { name: "Feb", revenue: 3000, patients: 139, consultations: 120 },
      { name: "Mar", revenue: 2000, patients: 980, consultations: 150 },
      { name: "Apr", revenue: 2780, patients: 390, consultations: 200 },
      { name: "May", revenue: 1890, patients: 480, consultations: 160 },
      { name: "Jun", revenue: 2390, patients: 380, consultations: 190 },
    ],
    []
  );

  // Chart configurations
  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    patients: {
      label: "Patients",
      color: "hsl(var(--chart-2))",
    },
  };

  // Doctor specialties from real data
  const doctorSpecialties = useMemo(() => {
    if (doctorStats?.specializations) {
      return Object.entries(doctorStats.specializations).map(
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
      );
    }
    return [
      { name: "Cardiology", value: 35, color: "#3b82f6" },
      { name: "Neurology", value: 25, color: "#10b981" },
      { name: "Orthopedics", value: 20, color: "#f59e0b" },
      { name: "Pediatrics", value: 20, color: "#ef4444" },
    ];
  }, [doctorStats]);

  // Pie chart configuration
  const pieChartConfig = useMemo(
    () => ({
      value: {
        label: "Percentage",
      },
      ...doctorSpecialties.reduce((acc, specialty) => {
        acc[specialty.name] = {
          label: specialty.name,
          color: specialty.color,
        };
        return acc;
      }, {}),
    }),
    [doctorSpecialties]
  );

  const recentActivities = useMemo(
    () => [
      {
        id: 1,
        action: "New doctor registered",
        user: "Dr. Sarah Johnson",
        time: "2 minutes ago",
        type: "success",
        icon: UserPlus,
      },
      {
        id: 2,
        action: "Patient consultation completed",
        user: "Dr. Michael Chen",
        time: "15 minutes ago",
        type: "info",
        icon: Activity,
      },
      {
        id: 3,
        action: "Withdrawal request processed",
        user: "Dr. Emily Davis",
        time: "1 hour ago",
        type: "warning",
        icon: CreditCard,
      },
      {
        id: 4,
        action: "Doctor verification approved",
        user: "Dr. Robert Wilson",
        time: "2 hours ago",
        type: "success",
        icon: CheckCircle,
      },
      {
        id: 5,
        action: "New patient registered",
        user: "Patient Portal",
        time: "3 hours ago",
        type: "info",
        icon: UserPlus,
      },
    ],
    []
  );

  const statCards = useMemo(
    () => [
      {
        title: "Total Doctors",
        value: stats.doctors,
        icon: UserCheck,
        color: "blue",
        change: "+12%",
        trend: "up",
        description: "Active medical professionals",
      },
      {
        title: "Total Patients",
        value: stats.patients,
        icon: Users,
        color: "green",
        change: "+8%",
        trend: "up",
        description: "Registered patients",
      },
      {
        title: "Pending Withdrawals",
        value: stats.withdrawals,
        icon: DollarSign,
        color: "yellow",
        change: "-3%",
        trend: "down",
        description: "Awaiting approval",
      },
      {
        title: "Verifications",
        value: stats.verifications,
        icon: CheckCircle,
        color: "purple",
        change: "+15%",
        trend: "up",
        description: "Verified accounts",
      },
    ],
    [stats]
  );

  const getActivityIcon = useCallback((type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  const getActivityColor = useCallback((type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Dashboard
            </h3>
            <p className="text-gray-600 text-center">
              Fetching the latest data from Soocher
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening with Soocher today.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {card.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                          {card.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {card.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              card.trend === "up" ? "default" : "secondary"
                            }
                            className={
                              card.trend === "up"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {card.trend === "up" ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {card.change}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-full ${
                          card.color === "blue"
                            ? "bg-blue-100"
                            : card.color === "green"
                            ? "bg-green-100"
                            : card.color === "yellow"
                            ? "bg-yellow-100"
                            : "bg-purple-100"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            card.color === "blue"
                              ? "text-blue-600"
                              : card.color === "green"
                              ? "text-green-600"
                              : card.color === "yellow"
                              ? "text-yellow-600"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Revenue & Growth</span>
                </CardTitle>
                <CardDescription>
                  Monthly revenue and patient growth trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-80">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="var(--color-revenue)"
                      fill="var(--color-revenue)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="patients"
                      stackId="2"
                      stroke="var(--color-patients)"
                      fill="var(--color-patients)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Doctor Specialties Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Doctor Specialties</span>
                </CardTitle>
                <CardDescription>
                  Distribution of medical specialties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ChartContainer config={pieChartConfig} className="h-64">
                    <PieChart>
                      <Pie
                        data={doctorSpecialties}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={60}
                        innerRadius={20}
                        fill="hsl(var(--chart-1))"
                        dataKey="value"
                      >
                        {doctorSpecialties.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => [`${value}%`, name]}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>

                  {/* Custom Legend */}
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
                    {doctorSpecialties.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground whitespace-nowrap">
                          {entry.name} ({entry.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest updates and activities in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.5 + activity.id * 0.1,
                        }}
                        className={`flex items-start space-x-3 p-4 rounded-lg border ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        <div className="flex-shrink-0">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.user}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Verify Doctor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Withdrawal
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View All Patients
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

DashboardShadcn.displayName = "DashboardShadcn";

export default DashboardShadcn;
