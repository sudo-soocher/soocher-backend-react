import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  User,
  CreditCard,
  TrendingUp,
  Loader2,
} from "lucide-react";

// shadcn components
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import LoadingSpinner from "../components/common/LoadingSpinner";
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

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  // Mock data for withdrawals
  const mockWithdrawals = [
    {
      id: "WD001",
      userId: "user123",
      userName: "Dr. Sarah Johnson",
      amount: 2500,
      status: "pending",
      requestDate: "2024-01-15T10:30:00Z",
      bankAccount: "****1234",
      bankName: "Chase Bank",
    },
    {
      id: "WD002",
      userId: "user456",
      userName: "Dr. Michael Chen",
      amount: 1800,
      status: "approved",
      requestDate: "2024-01-14T14:20:00Z",
      approvedDate: "2024-01-15T09:15:00Z",
      bankAccount: "****5678",
      bankName: "Wells Fargo",
    },
    {
      id: "WD003",
      userId: "user789",
      userName: "Dr. Emily Davis",
      amount: 3200,
      status: "rejected",
      requestDate: "2024-01-13T16:45:00Z",
      rejectedDate: "2024-01-14T11:30:00Z",
      bankAccount: "****9012",
      bankName: "Bank of America",
      rejectionReason: "Insufficient documentation",
    },
    {
      id: "WD004",
      userId: "user101",
      userName: "Dr. Robert Wilson",
      amount: 1500,
      status: "pending",
      requestDate: "2024-01-12T12:00:00Z",
      bankAccount: "****3456",
      bankName: "Citibank",
    },
    {
      id: "WD005",
      userId: "user202",
      userName: "Dr. Lisa Martinez",
      amount: 2800,
      status: "approved",
      requestDate: "2024-01-11T08:30:00Z",
      approvedDate: "2024-01-12T15:45:00Z",
      bankAccount: "****7890",
      bankName: "PNC Bank",
    },
  ];

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWithdrawals(mockWithdrawals);
      calculateStats(mockWithdrawals);
      setLoading(false);
    }, 1000);
  };

  const calculateStats = (withdrawalData) => {
    const stats = {
      total: withdrawalData.length,
      pending: withdrawalData.filter((w) => w.status === "pending").length,
      approved: withdrawalData.filter((w) => w.status === "approved").length,
      rejected: withdrawalData.filter((w) => w.status === "rejected").length,
      totalAmount: withdrawalData.reduce((sum, w) => sum + w.amount, 0),
    };
    setStats(stats);
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bankAccount.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" || withdrawal.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading withdrawals..." />;
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={14} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.4px" }}>Withdrawal Management</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Manage and process withdrawal requests from doctors</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: stats.total, color: "#6366f1", bg: "#e0e7ff" },
            { label: "Pending", value: stats.pending, color: "#f59e0b", bg: "#fef3c7" },
            { label: "Approved", value: stats.approved, color: "#10b981", bg: "#d1fae5" },
            { label: "Rejected", value: stats.rejected, color: "#ef4444", bg: "#fee2e2" },
          ].map(s => (
            <div key={s.label} style={{ padding: "6px 14px", borderRadius: 20, background: s.bg, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${s.color}22` }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Requests", value: stats.total, icon: DollarSign, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "#ef4444", bg: "#fef2f2" },
          { label: "Total Amount", value: formatCurrency(stats.totalAmount), icon: TrendingUp, color: "#8b5cf6", bg: "#f5f3ff" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="admin-card"
            style={{ padding: "12px 14px", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: -5, right: -5, opacity: 0.05, transform: "rotate(-10deg)", pointerEvents: "none" }}>
              <stat.icon size={60} color={stat.color} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={14} color={stat.color} />
              </div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#64748b" }}>{stat.label}</p>
            </div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#93c5fd" }} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by ID, doctor name, or bank account..."
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 12.5, color: "#1e3a5f", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "white"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; }}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger style={{ width: 168, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Withdrawals Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredWithdrawals.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <DollarSign size={40} style={{ color: "#bfdbfe", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>No withdrawals found</p>
            <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f8fbff", borderBottom: "1.5px solid #e0f2fe" }}>
                  {["ID", "Doctor", "Amount", "Bank Details", "Status", "Request Date", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal, idx) => (
                  <tr
                    key={withdrawal.id}
                    style={{ borderBottom: "1px solid #f0f7ff", background: idx % 2 === 0 ? "white" : "#fafcff", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafcff"}
                  >
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12.5, color: "#64748b" }}>
                      {withdrawal.id}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={13} color="#6366f1" />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{withdrawal.userName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CreditCard size={12} color="#94a3b8" />
                          <span style={{ fontSize: 12.5, color: "#334155" }}>{withdrawal.bankAccount}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{withdrawal.bankName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>{getStatusBadge(withdrawal.status)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#64748b" }}>
                      {formatDate(withdrawal.requestDate)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {withdrawal.status === "pending" && (
                          <>
                            <button
                              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #a7f3d0", background: "#f0fdf4", color: "#10b981", fontSize: 11, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#d1fae5"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#f0fdf4"; }}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 11, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; }}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #e2e8f0", background: "transparent", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#1e3a5f"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdrawals;
