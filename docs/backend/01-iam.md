# Module 1 – Identity & Access Management (IAM)

## 1. Overview

The Identity & Access Management (IAM) module provides the foundational security layer of the HRIS system.  
All other modules depend on this layer for authentication, authorization, and audit tracking.

Implemented using:
- JWT authentication
- Role-Based Access Control (RBAC)
- Permission matrix enforcement
- Centralized activity logging

---

## 2. Scope

This module covers:

- Login authentication
- Role management (SUPER_ADMIN, ADMIN, USER)
- Permission enforcement per module (View / Create / Update / Archive)
- Admin user management (CRUD + activation + password reset)
- Activity log monitoring with CSV export

No public registration is allowed. Accounts are created internally.

---

## 3. Roles

| Role | Description |
|------|------------|
| SUPER_ADMIN | Full system access |
| ADMIN | Restricted by assigned permissions |
| USER | Non-admin role (future employee-level access) |

Security Rule:
- ADMIN cannot modify SUPER_ADMIN accounts.
- Endpoints are protected using `[Authorize]` and custom permission attributes.

---

## 4. Core Endpoints

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

## 5. Data Model

Entities involved:

- `User`
- `Role`
- `Permission`
- `ActivityLog`

Relationships:
- A User belongs to a Role
- A Role contains multiple Permissions
- ActivityLogs record system actions performed by users

---

## 6. Audit Logging

Audit logs are automatically created for:

- USER_CREATE
- USER_UPDATE
- USER_STATUS_UPDATE
- USER_PASSWORD_RESET
- PERMISSION_UPDATE

Each log stores:

- ActorUserId
- ActorEmail
- ActorRole
- Action
- Module
- TargetType
- TargetId
- Summary
- IP Address
- User Agent
- CreatedAt (UTC)

---

## 7. Architecture Notes

IAM follows a feature-based structure:

```
Features/IAM/
├── Controllers
├── DTOs
└── Services
```


Authentication uses JWT tokens signed via configured secret key.  
Authorization combines:

- Role-based checks
- Permission-based checks (custom attribute)
- Endpoint-level protection

---

## 8. Status

IAM v1 completed and runtime validated.

Includes:
- Authentication
- RBAC
- Permission enforcement
- Audit logging
- Feature-based refactor
- EF migrations for Permissions and ActivityLogs