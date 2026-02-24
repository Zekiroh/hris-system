# Module 2 – Employee Information Management (Core Master Data)

## 1. Overview

The Employee Core module serves as the central master data repository of the HRIS system.

All operational modules depend on this layer, including:

- Payroll
- Leave Management
- Attendance
- Clearance
- Reports & Analytics
- Government Compliance

If this module fails structurally, dependent modules will be affected.

---

## 2. Scope

This module will manage:

- Employee basic profile
- Employment status
- Government numbers (SSS, PhilHealth, Pag-IBIG, TIN)
- Emergency contact
- Family background
- Education history
- Civil service eligibility
- Work experience
- Voluntary work
- Other declarations
- Document uploads (contracts, 201 file, performance records)

---

## 3. Architectural Role

Employee Core is classified as:

- Master Data Module
- Low-frequency writes
- High read dependency from other modules

This module defines the structural foundation of the HR system.

---

## 4. Planned Data Model (Draft)

Proposed entities:

- Employee
- EmploymentDetails
- EmergencyContact
- FamilyBackground
- EducationRecord
- WorkExperience
- VoluntaryWork
- GovernmentIdentifiers
- EmployeeDocument

Final schema to be confirmed during database design phase.

---

## 4A. Phase 1 MVP Schema (Initial ERD Target)

This Phase 1 schema defines the minimum employee master record required to unblock other modules.

### Table: `employees` (Phase 1)

Core identity:
- `id` (PK, bigint/int)
- `employeeNo` (unique)
- `firstName`
- `middleName` (nullable)
- `lastName`
- `suffix` (nullable)

Basic contact:
- `email` (nullable, unique if present)
- `mobileNo` (nullable)

Personal profile (minimal, expand later):
- `birthDate` (nullable)
- `sex` (nullable)
- `civilStatus` (nullable)

Address (minimal, expand later):
- `addressLine1` (nullable)
- `addressLine2` (nullable)
- `city` (nullable)
- `province` (nullable)
- `zipCode` (nullable)

Employment snapshot (minimal; normalization may come in Phase 2):
- `employmentStatus` (e.g., Active/Resigned/Separated)
- `hireDate` (nullable)
- `departmentId` (nullable, reference later)
- `positionId` (nullable, reference later)

System fields:
- `isActive` (bool)
- `createdAt`
- `updatedAt` (nullable)

### Notes (Phase 1)
- Phase 1 intentionally keeps most sub-records (family, education, work exp, etc.) for Phase 2+.
- Once the `employees` table exists, ERD should be generated/validated via DBeaver.

---

## 4B. Phase 1 Endpoints (Draft)

These endpoints cover the minimum CRUD required by admin-facing screens.

- `GET /employees`  
  List employees (paging/filtering to be added when UI requires it)

- `GET /employees/{id}`  
  Get employee profile (Phase 1 fields)

- `POST /employees`  
  Create employee profile (Phase 1 fields)

- `PUT /employees/{id}`  
  Update employee profile (Phase 1 fields)

- `PATCH /employees/{id}/status`  
  Activate/deactivate employee record

---

## 5. Dependency Map

This module feeds:

- Payroll (salary computation, employment status)
- Leave (employee balance and eligibility)
- Attendance (employee reference)
- Clearance (exit validation)
- Reports (classification and headcount)

---

## 6. Implementation Status

Phase 1 (MVP) – Completed
- employees table created via EF migration
- Employee entity + DbSet added
- CRUD endpoints implemented (GET /employees, GET /employees/{id}, POST, PUT, archive)
- RBAC enforced via PermissionAuthorize for module EMPLOYEES
- Permission module key normalized (EMPLOYEES) and legacy values cleaned
- Unique index enforced on EmployeeNumber
- DTO validation corrected for DateHired (nullable DTO pattern)

Phase 2 (Next)

- Add pagination + filtering + search for GET /employees
- Add dedicated status endpoint (PATCH /employees/{id}/status) if needed by UI
- Expand schema (employment details split or additional tables) based on C1–C4 screens