import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
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

const TransactionViewer = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    income: 0,
    expenses: 0,
    pending: 0,
    completed: 0,
  });

  // Mock data for transactions
  const mockTransactions = [
    {
      id: "TXN001",
      userId: "user123",
      userName: "Dr. Sarah Johnson",
      type: "income",
      amount: 2500,
      status: "completed",
      description: "Consultation payment",
      date: "2024-01-15T10:30:00Z",
      paymentMethod: "Credit Card",
    },
    {
      id: "TXN002",
      userId: "user456",
      userName: "Dr. Michael Chen",
      type: "expense",
      amount: 1800,
      status: "completed",
      description: "Withdrawal",
      date: "2024-01-14T14:20:00Z",
      paymentMethod: "Bank Transfer",
    },
    {
      id: "TXN003",
      userId: "user789",
      userName: "Dr. Emily Davis",
      type: "income",
      amount: 3200,
      status: "pending",
      description: "Consultation payment",
      date: "2024-01-13T16:45:00Z",
      paymentMethod: "Debit Card",
    },
    {
      id: "TXN004",
      userId: "user101",
      userName: "Dr. Robert Wilson",
      type: "income",
      amount: 1500,
      status: "completed",
      description: "Subscription fee",
      date: "2024-01-12T12:00:00Z",
      paymentMethod: "Credit Card",
    },
    {
      id: "TXN005",
      userId: "user202",
      userName: "Dr. Lisa Martinez",
      type: "expense",
      amount: 2800,
      status: "completed",
      description: "Withdrawal",
      date: "2024-01-11T08:30:00Z",
      paymentMethod: "Bank Transfer",
    },
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTransactions(mockTransactions);
      calculateStats(mockTransactions);
      setLoading(false);
    }, 1000);
  };

  const calculateStats = (transactionData) => {
    const stats = {
      total: transactionData.length,
      income: transactionData
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: transactionData
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
      pending: transactionData.filter((t) => t.status === "pending").length,
      completed: transactionData.filter((t) => t.status === "completed").length,
    };
    setStats(stats);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus =
      filterStatus === "all" || transaction.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type) => {
    if (type === "income") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <ArrowDownRight className="h-3 w-3 mr-1" />
          Income
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          Expense
        </Badge>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
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
    return <LoadingSpinner fullHeight message="Loading transactions..." />;
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Receipt size={14} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#1e3a5f", letterSpacing: "-0.4px" }}>Transaction Viewer</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>View and manage all financial transactions</p>
        </div>
        {/* Stat chips */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: stats.total, color: "#6366f1", bg: "#e0e7ff" },
            { label: "Income", value: `$${(stats.income / 1000).toFixed(1)}k`, color: "#10b981", bg: "#d1fae5" },
            { label: "Expenses", value: `$${(stats.expenses / 1000).toFixed(1)}k`, color: "#ef4444", bg: "#fee2e2" },
            { label: "Pending", value: stats.pending, color: "#f59e0b", bg: "#fef3c7" },
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
          { label: "Total Transactions", value: stats.total, icon: Receipt, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Total Income", value: formatCurrency(stats.income), icon: TrendingUp, color: "#10b981", bg: "#ecfdf5" },
          { label: "Total Expenses", value: formatCurrency(stats.expenses), icon: TrendingDown, color: "#ef4444", bg: "#fef2f2" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "#6366f1", bg: "#e0e7ff" },
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
            placeholder="Search by ID, user name, or description..."
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "#f0f7ff", fontSize: 12.5, color: "#1e3a5f", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "white"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; }}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger style={{ width: 140, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger style={{ width: 140, height: 36, borderRadius: 9, border: "1.5px solid #bfdbfe", background: "white", fontSize: 12.5, fontFamily: "Inter,sans-serif" }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <CreditCard size={40} style={{ color: "#bfdbfe", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e3a5f" }}>No transactions found</p>
            <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f8fbff", borderBottom: "1.5px solid #e0f2fe" }}>
                  {["Transaction ID", "User", "Type", "Amount", "Description", "Payment Method", "Status", "Date"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, idx) => (
                  <tr
                    key={transaction.id}
                    style={{ borderBottom: "1px solid #f0f7ff", background: idx % 2 === 0 ? "white" : "#fafcff", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafcff"}
                  >
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12.5, color: "#64748b" }}>
                      {transaction.id}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={13} color="#6366f1" />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{transaction.userName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>{getTypeBadge(transaction.type)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: transaction.type === "income" ? "#10b981" : "#ef4444" }}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#64748b" }}>
                      {transaction.description}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CreditCard size={12} color="#94a3b8" />
                        <span style={{ fontSize: 12.5, color: "#334155" }}>{transaction.paymentMethod}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>{getStatusBadge(transaction.status)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#64748b" }}>
                      {formatDate(transaction.date)}
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

export default TransactionViewer;

