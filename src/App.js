import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import LoginForm from "./components/auth/LoginFormShadcn";
import SignupForm from "./components/auth/SignupForm";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/DashboardShadcn";
import Doctors from "./pages/DoctorsShadcn";
import Patients from "./pages/PatientsShadcn";
import Withdrawals from "./pages/Withdrawals";
import Consultations from "./pages/ConsultationsShadcn";
import ConsultationDetails from "./pages/ConsultationDetailsShadcn";
import EditConsultation from "./pages/EditConsultation";
import UserDetails from "./pages/UserDetails";
import TransactionViewer from "./pages/TransactionViewer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Main App Routes
const AppRoutes = () => {
  const { user, loading } = useAuthContext();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : showSignup ? (
            <SignupForm onSuccess={() => setShowSignup(false)} />
          ) : (
            <LoginForm onShowSignup={() => setShowSignup(true)} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupForm onSuccess={() => setShowSignup(false)} />
          )
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/all" element={<Doctors />} />
        <Route path="doctors/pending" element={<Doctors />} />
        <Route path="doctors/verified" element={<Doctors />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/all" element={<Patients />} />
        <Route path="patients/pending" element={<Patients />} />
        <Route path="patients/verified" element={<Patients />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="consultations/all" element={<Consultations />} />
        <Route path="consultations/active" element={<Consultations />} />
        <Route path="consultations/completed" element={<Consultations />} />
        <Route
          path="consultations/:consultationId"
          element={<ConsultationDetails />}
        />
        <Route
          path="consultations/:consultationId/edit"
          element={<EditConsultation />}
        />
        <Route path="users/:userId" element={<UserDetails />} />
        <Route path="transactions" element={<TransactionViewer />} />
        <Route path="reports" element={<div>Reports Page</div>} />
        <Route path="" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
