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

---

# Development

## Technology Stack

The mobile application is built using the following technologies:

- React Native
- Expo SDK 54
- Expo Router
- React 19
- TypeScript
- React Navigation
- Shared workspace package (`@hris/shared`)

## Project Structure

```
apps/mobile
├── app/
├── assets/
├── components/
├── constants/
├── hooks/
├── scripts/
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

The project follows Expo Router conventions while remaining aligned with the overall HRIS monorepo architecture.

## Running the Application

From the repository root:

```bash
# Start Expo development server
pnpm dev:mobile

# Run on Android
pnpm --filter mobile android

# Run on iOS
pnpm --filter mobile ios

# Run in the browser
pnpm --filter mobile web

# Lint the project
pnpm --filter mobile lint

# Export a production bundle
pnpm --filter mobile build
```

## Shared Workspace

The mobile application shares common resources through the monorepo workspace package located at:

```
packages/shared
```

As development progresses, this package will provide reusable:

- DTOs
- Shared types
- API-related models

to keep the web and mobile applications consistent while maintaining the backend as the single source of truth.

## Implementation Status

The Expo workspace and application foundation are already configured within the monorepo.

Current implementation includes:

- Expo Router configuration
- Navigation foundation
- Project configuration
- Shared workspace integration
- Development tooling

Business modules and employee self-service workflows will be implemented after the web application reaches functional completion, final integration, and production readiness.

## Development Principles

The mobile application follows the same architectural principles as the web application:

- Backend remains the source of truth.
- Business rules must not be duplicated on the client.
- Existing API contracts should be preserved.
- User authentication and authorization are enforced by the backend.
- Mobile consumes existing HRIS APIs rather than implementing separate backend logic.

Future development will follow the established feature ownership used throughout the HRIS system to ensure consistency across platforms.