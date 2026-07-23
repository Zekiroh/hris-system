# HRIS Mobile Application

## Status

The mobile application is planned for a future development phase and is not part of the current web production scope.

## Purpose

The mobile app will provide the employee self-service experience using the existing HRIS backend APIs.

## Planned Employee Self-Service Capabilities

- View and manage attendance
- Apply for leave and view leave balances
- View payslips
- View and request updates to personal information
- View assigned assets and clearance status
- View performance evaluations
- Read company announcements
- Submit daily accomplishment reports

## Architecture

The mobile application must:

- Use React Native
- Reuse the existing backend APIs
- Keep the backend as the source of truth
- Preserve the existing User -> Employee relationship
- Avoid duplicating business rules from the web application
- Follow the same roles: Super Admin, Admin, and User

## Backend Ownership

Employee Self-Service is a capability group rather than a separate backend module.

Ownership belongs under:

- Employees
- Attendance
- LeaveManagement
- Payroll
- AssetManagement
- ClearanceManagement
- PerformanceManagement
- AnnouncementManagement
- DailyAccomplishmentReport

## Current Priority

The current project phase focuses on completing and stabilizing the web application. Mobile implementation is deferred until web modules, final integration, and production review are complete.
