import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../../pages/Login";
import ForgotPassword from "../../pages/ForgotPassword";
import Layout from "../../layouts/dashboard/Layout";
import RequireAuth from "./guards/RequireAuth";
import GuestOnly from "./guards/GuestOnly";
import AdminOnly from "./guards/AdminOnly";
import Dashboard from "../../features/dashboard/Dashboard";

// Personal Records
import EmployeeManagement from "../../features/employees/EmployeeManagement";

// Attendance
import AdminAttendance from "../../features/attendance/admin/AdminAttendance";

// DAR
import DailyAccomplishment from "../../features/daily-accomplishment/DailyAccomplishment";

// Leave Management
import LeaveManagement from "../../features/leave/LeaveManagement";

// Payroll
import Payroll from "../../features/payroll/Payroll";

// Government Compliance
import GovernmentCompliance from "../../features/compliance/GovernmentCompliance";

import UserAttendance from "../../features/attendance/user/UserAttendance";
import AssetManagement from "../../features/asset-management/AssetManagement";

// User Pages
import MyPerformance from "../../pages/user/MyPerformance";

// Clearance
import ClearanceList from "../../pages/clearance/ClearanceList";
import ClearanceForm from "../../pages/clearance/ClearanceForm";

// HRIS System
import HRISSystem from "../../pages/HRISSystem";

// Settings
import Settings from "../../features/settings/Settings";

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
                <EmployeeManagement />
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
                <DailyAccomplishment mode="admin" />
              </AdminOnly>
            }
          />
          <Route
            path="payroll"
            element={
              <AdminOnly>
                <Payroll mode="admin" />
              </AdminOnly>
            }
          />
          <Route
            path="assets"
            element={
              <AdminOnly>
                <AssetManagement mode="admin" />
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
          <Route path="settings" element={<Settings />} />

          {/* Shared routes */}
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="my-attendance" element={<UserAttendance />} />
          <Route path="my-daily-accomplishment" element={<DailyAccomplishment mode="user" />} />

          {/* User Pages */}
          <Route path="my-payslips" element={<Payroll mode="user" />} />
          <Route path="my-assets" element={<AssetManagement mode="user" />} />
          <Route path="my-performance" element={<MyPerformance />} />
        </Route>
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}