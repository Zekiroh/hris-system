# Module 1 – Identity & Access Management (IAM)

## 1. Overview

The Identity & Access Management (IAM) module provides the foundational security layer of the HRIS system.  

All other modules depend on IAM for:

- Authentication
- Authorization
- Permission enforcement
- Audit tracking

IAM must remain stable before any business module can operate safely.

Implemented using:

- JWT authentication
- Role-Based Access Control (RBAC)
- Permission matrix enforcement
- Centralized activity logging

---

## 2. Scope

This module covers:

- Login authentication
- Role management (`SUPER_ADMIN`, `ADMIN`, `USER`)
- Permission enforcement per module (View / Create / Update / Archive)
- Admin user management (CRUD + activation + password reset)
- Activity log monitoring with CSV export

No public registration is allowed. Accounts are created internally.

---

## 3. Architectural Role

IAM is classified as:

- Foundation module
- High-security boundary layer
- Cross-cutting concern across all modules
- Low-frequency writes, high-security sensitivity

All feature modules depend on IAM validation before executing business logic.

---

## 4. Roles

```
| Role          | Description                                   |
| -----------   | --------------------------------------------- |
| `SUPER_ADMIN` | Full system access                            |
| `ADMIN`       | Restricted by assigned permissions            |
| `USER`        | Non-admin role (future employee-level access) |
```
Security Rule:

- ADMIN cannot modify SUPER_ADMIN accounts.
- Permission checks enforced per module.
- Endpoints protected via `[Authorize]` and `PermissionAuthorize`.

---

## 5. Data Model

Entities involved:

- `User`
- `Role`
- `Permission`
- `ActivityLog`

Relationship:

- A User belongs to one Role
- A Role contains multiple Permissions
- ActivityLogs record actions performed by authenticated users

---

## 6. Core Schema

### Table: `users`
- `Id` 
- `Email` 
- `FullName`
- `PasswordHash`
- `RoleId` 
- `NormalizedEmail`
- `IsActive`
- `CreatedAt` (UTC)
- `UpdatedAt` (UTC)

### Table: `roles`
- `Id`
- `Name` (Super Admin, Admin, User)
- `IsSystem`
- `NormalizedName` 

### Table: `permissions`
- `Id`
- `Module`
- `CanView`
- `CanCreate`
- `CanUpdate`
- `CanArchive`

### Table: `activity_logs`
- `Id`
- `ActorUserId`
- `ActorEmail`
- `ActorRole`
- `Action`
- `Module`
- `TargetType`
- `TargetId`
- `Summary`
- `MetadataJson`
- `IpAddress`
- `UserAgent`
- `CreatedAt` (UTC)

Schema created via EF Core migrations and verified using DBeaver.

---

## 7. Core Endpoints

### Authentication

- `POST /auth/login`
- `GET /auth/me`

### Admin – User Management

- `GET /admin/users`
- `POST /admin/users`
- `PUT /admin/users/{id}`
- `PATCH /admin/users/{id}/status`
- `PATCH /admin/users/{id}/password`

### Admin – Permissions

- `GET /admin/permissions`
- `PATCH /admin/permissions/{id}`

### Activity Logs

- `GET /admin/activity-logs`
- `GET /admin/activity-logs/export`

All endpoints validated via Swagger.

---

## 8. Authorization Strategy

Authentication:

- JWT tokens signed using configured secret key
- Token contains user role and claims

Authorization:

- `[Authorize]` attribute for authentication boundary
- Custom `PermissionAuthorize(module, action)` attribute
- RBAC enforced at controller level

---

## 9. Audit Logging

Audit logs are automatically created for:

- `USER_CREATE`
- `USER_UPDATE`
- `USER_STATUS_UPDATE`
- `USER_PASSWORD_RESET`
- `PERMISSION_UPDATE`

Each log stores:

- `ActorUserId`
- `ActorEmail`
- `ActorRole`
- `Action`
- `Module`
- `TargetType`
- `TargetId`
- `Summary`
- `MetadataJson`
- `IpAddress`
- `UserAgent`
- `CreatedAt` (UTC)

---

## 10. Migration History

Key migrations:

- `Init_UserRole`
- `IAMv1_CoreFields`
- `IAMv1_SeedRoles`
- `IAMv1_Permissions`
- `IAMv1_SeedPermissions`
- `IAMv1_ActivityLogs`

All migrations verified clean and reproducible.

---

## 11. Notes

IAM follows a feature-based structure:

```
Features/IAM/
├── Controllers
├── DTOs
└── Services
```

---

## 12. Status

IAM v1 – Completed and Stable

Includes:

- JWT authentication
- Role-based access control
- Permission enforcement per module
- Admin user management
- Activity logging with export
- EF migrations verified
- Runtime validated via Swagger

IAM is considered closed and production-stable within `dev`.