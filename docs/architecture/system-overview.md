# System Overview – HRIS Monorepo

## 1. Purpose

This document provides a high-level architectural overview of the HRIS system.

The system is built as a monorepo to support coordinated development across web, mobile, and backend teams while maintaining consistency, shared contracts, and clear separation of concerns.

---

## 2. System Architecture

The HRIS system is composed of three collaborating layers:

Web Client / Mobile Client ↔ Backend API ↔ Database

- Web and Mobile provide user experiences and workflow interfaces.
- The Backend API provides secure access, business processes, and data operations.
- The Database stores system records and supports reporting and transactional workflows.

All layers are required to deliver a complete HRIS experience.

---

## 3. Application Responsibilities

### Web Client (`apps/web`)
- Administrative and management interface
- Role- and permission-aware screens
- Consumes backend endpoints based on defined API contracts

### Mobile Client (`apps/mobile`)
- Employee/end-user interface (mobile-focused workflows)
- Permission-aware navigation and features
- Consumes backend endpoints based on defined API contracts

### Backend API (`apps/api`)
- Implements authentication and authorization mechanisms
- Enforces business rules and validations
- Provides stable API contracts for clients
- Records audit logs for privileged actions
- Persists and queries data through the database layer

### Database (`infra/docker`)
- Stores master data and transactional records
- Supports integrity constraints and reporting queries
- Maintained through controlled schema migrations

---

## 4. Monorepo Structure

```
apps/
├── web/
├── mobile/
├── api/
packages/
└── shared/
infra/
└── docker/
docs/
```

### Shared Contracts (`packages/shared`)
Shared contracts exist to reduce duplication and keep client integrations consistent.
They are updated as endpoints stabilize and modules are integrated across layers.

---

## 5. System Modules

The HRIS system is organized into functional modules.  
Each module spans web, mobile (where applicable), and backend layers.

Modules are implemented incrementally based on system dependencies.

1. Identity & Access Management (IAM)  
   Authentication, role management, permission enforcement, and activity logging.

2. Employee Core (Master Data)  
   Central employee records and foundational HR information.

3. Attendance & Leave  
   Time tracking, leave applications, and balance management.

4. Payroll  
   Salary computation, deductions, and payslip generation.

5. Reporting & Analytics  
   Aggregated insights and operational dashboards.

6. Clearance & Exit  
   Exit workflows and approval tracking.

7. Organizational Structure  
   Regions, departments, and position classifications.

Each module is considered a full-stack capability, requiring coordination between frontend and backend implementations.

---

## 6. Design Principles

- One system delivered through web, mobile, and API layers
- Clear contracts between layers (API + shared types when needed)
- Permission-driven access control across the product
- Incremental, reviewable module delivery
- Documentation aligned with real implementation progress