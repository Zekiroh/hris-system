import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Login from "../../pages/Login";
import ForgotPassword from "../../pages/ForgotPassword";
import Layout from "../../components/layout/Layout";
import RequireAuth from "../../components/RequireAuth";
import GuestOnly from "../../components/GuestOnly";
import Dashboard from "../../pages/Dashboard";

// Personal Records
import EmployeeList from "../../pages/personal-records/EmployeeList";
import EmployeeProfile from "../../pages/personal-records/EmployeeProfile";

// Attendance
import AdminAttendance from "../../pages/attendance/admin/AdminAttendance";

// DAR
import AdminDailyAccomplishmentReport from "../../pages/DAR/AdminDailyAccomplishmentReport";
import DailyAccomplishmentReport from "../../pages/DailyReport/DailyAccomplishmentReport";

// Leave Management
import LeaveManagement from "../../pages/leave/LeaveManagement";

// Payroll
import Payroll from "../../pages/payroll/Payroll";

// Government Compliance
import GovernmentCompliance from "../../pages/compliance/GovernmentCompliance";

// Employee Self-Service
import EmployeeSelfService from "../../pages/self-service/EmployeeSelfService";
import UserAttendance from "../../pages/attendance/user/UserAttendance";

// User Pages
import MyPaySlips from "../../pages/user/MyPaySlips";
import CompanyDirectory from "../../pages/user/CompanyDirectory";
import MyPerformance from "../../pages/user/MyPerformance";
import CompanyNews from "../../pages/user/CompanyNews";
import UserAssetManagement from "../../pages/user/UserAssetManagement";

// Asset Management
import AssetManagement from "../../pages/assets/AssetManagement";

// Clearance
import ClearanceList from "../../pages/clearance/ClearanceList";
import ClearanceForm from "../../pages/clearance/ClearanceForm";

// HRIS System
import HRISSystem from "../../pages/HRISSystem";

// Admin Settings
import AdminSettings from "../../pages/admin/AdminSettings";
import UserSettings from "../../pages/user/UserSettings";

/**
 * Blocks non-admin roles from accessing admin-only routes.
 */
function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return isAdmin ? <AdminSettings /> : <UserSettings />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />

          {/* Admin-only routes */}
          <Route
            path="personal-records"
            element={
              <AdminOnly>
                <EmployeeList />
              </AdminOnly>
            }
          />
          <Route
            path="employee/:id"
            element={
              <AdminOnly>
                <EmployeeProfile />
              </AdminOnly>
            }
          />
          <Route
            path="attendance"
            element={
              <AdminOnly>
                <AdminAttendance />
              </AdminOnly>
            }
          />
          <Route
            path="daily-accomplishment"
            element={
              <AdminOnly>
                <AdminDailyAccomplishmentReport />
              </AdminOnly>
            }
          />
          <Route
            path="payroll"
            element={
              <AdminOnly>
                <Payroll />
              </AdminOnly>
            }
          />
          <Route
            path="assets"
            element={
              <AdminOnly>
                <AssetManagement />
              </AdminOnly>
            }
          />
          <Route
            path="clearance"
            element={
              <AdminOnly>
                <ClearanceList />
              </AdminOnly>
            }
          />
          <Route
            path="clearance/:id"
            element={
              <AdminOnly>
                <ClearanceForm />
              </AdminOnly>
            }
          />
          <Route
            path="hris"
            element={
              <AdminOnly>
                <HRISSystem />
              </AdminOnly>
            }
          />
          <Route
            path="compliance"
            element={
              <AdminOnly>
                <GovernmentCompliance />
              </AdminOnly>
            }
          />
          <Route path="settings" element={<SettingsPage />} />

          {/* Shared routes */}
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="my-attendance" element={<UserAttendance />} />
          <Route path="my-daily-accomplishment" element={<DailyAccomplishmentReport />} />
          <Route path="self-service" element={<EmployeeSelfService />} />

          {/* User Pages */}
          <Route path="my-payslips" element={<MyPaySlips />} />
          <Route path="my-assets" element={<UserAssetManagement />} />
          <Route path="company-directory" element={<CompanyDirectory />} />
          <Route path="my-performance" element={<MyPerformance />} />
          <Route path="company-news" element={<CompanyNews />} />
        </Route>
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
