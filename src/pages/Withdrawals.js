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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading withdrawals...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Withdrawal Management
          </h1>
          <p className="text-gray-600">
            Manage and process withdrawal requests from doctors
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by ID, doctor name, or bank account..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
            <CardDescription>
              {filteredWithdrawals.length} withdrawal request(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredWithdrawals.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No withdrawals found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-mono text-sm">
                        {withdrawal.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {withdrawal.userName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(withdrawal.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {withdrawal.bankAccount}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {withdrawal.bankName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(withdrawal.requestDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {withdrawal.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdrawals;
