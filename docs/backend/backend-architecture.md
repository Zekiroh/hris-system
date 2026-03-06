# Backend Architecture – HRIS API

## 1. Technology Stack

- ASP.NET Core Web API
- Entity Framework Core
- MySQL (Dockerized)
- JWT Authentication
- Role-Based Access Control (RBAC)

---

## 2. Architectural Pattern

The backend follows a feature-based (vertical slice) architecture.

```
Features/
├── IAM/
├── Employees/
```

Each feature contains:

- Controllers
- DTOs
- Services

This structure ensures:
- Module isolation
- Easier scaling
- Reduced coupling
- Cleaner permission enforcement

---

## 3. Security Architecture

Authentication:
- JWT tokens generated on login
- Signed using configured secret key

Authorization:
- `[Authorize]` attribute for role protection
- Custom `PermissionAuthorize` attribute for module-level permissions

Security Layers:
1. Role-level protection
2. Permission-level enforcement
3. Business rule validation (e.g., ADMIN cannot modify SUPER_ADMIN)

---

## 4. Audit Logging

All critical administrative actions are logged into `ActivityLogs`.

Audit captures:
- Actor identity
- Action type
- Target entity
- IP Address
- User Agent
- Timestamp (UTC)

Logging is centralized via `ActivityLogger` service.

---

## 5. Database Strategy

- Code-first EF Core migrations
- Controlled schema evolution
- Normalized master data design
- No direct entity exposure (DTO-only responses)

---

## 6. API Design Principles

- RESTful conventions
- Clear endpoint grouping
- Consistent HTTP status codes
- DTO-based request/response contracts
- Swagger validation during development

---

## 7. Current Module Status

IAM v1: Completed and validated.
Employee Core: Pending implementation.