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

This module manages:

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

Final schema to be confirmed during Phase 3+ database design.

---

## 4A. Phase 1 MVP Schema (Implemented)

This Phase 1 schema defines the minimum employee master record required to unblock other modules.

### Table: `employees`

Core identity:

- `Id` (GUID, PK)
- `EmployeeNumber` (unique)
- `FirstName`
- `MiddleName` (nullable)
- `LastName`

Personal profile:
- `BirthDate` (nullable)
- `Sex` (nullable)
- `CivilStatus` (nullable)

Employment snapshot:
- `DateHired`
- `Department` (nullable)
- `Position` (nullable)

System fields:
- `IsActive` (bool)
- `CreatedAtUtc`
- `UpdatedAtUtc` (nullable)

### Notes (Phase 1)

- Implemented via EF Core migration.
- Unique index enforced on `EmployeeNumber`.
- DateOnly binding handled using nullable DTO pattern.
- RBAC enforced using PermissionAuthorize with module key `EMPLOYEES`.

---

## 4B. Phase 2 Enhancements (Completed)

Phase 2 extended the core module to support UI-ready list operations and C1 basic information.

### API Enhancements

- Pagination implemented for `GET /employees`
- Search implemented across:
  - EmployeeNumber
  - FirstName
  - MiddleName
  - LastName
  - Department
  - Position
  - Filtering via `IsActive`
- `PagedEmployeesResponse` introduced:
  - `Items`
  - `TotalCount`
  - `Page`
  - `PageSize`
- Dedicated status endpoint implemented:
  - `PATCH /employees/{id}/status`

### C1 Basic Information Fields Added

- `ContactNumber`
- `Email`
- `AddressLine1`
- `AddressLine2`
- `City`
- `Province`
- `ZipCode`

Implemented via:

- EF migration: `Employee_C1_BasicInfoFields`
- DTO updates (Create + Update)
- Write mapping in `EmployeesService`
- Swagger verification (POST, PUT, PATCH)

Validation Improvements

- [EmailAddress] applied to Email fields
- [Range] validation applied to pagination parameters
- [MaxLength] applied to Search
- [BindRequired] enforced for status PATCH request

All changes verified via Swagger and database inspection.

---

## 5. Dependancy Map

This module feeds:

- Payroll (salary computation, employment status)
- Leave (employee balance and eligibility)
- Attendance (employee reference)
- Clearance (exit validation)
- Reports (classfication and headcount)

---

## 6. Implementation Status

### Phase 1 (MVP) – Completed

- employees table created via EF migration
- Employee entity + DbSet added
- CRUD endpoints implemented (GET /employees, GET /employees/{id}, POST, PUT, archive)
- RBAC enforced via PermissionAuthorize for module EMPLOYEES
- Permission module key normalized (EMPLOYEES) and legacy values cleaned
- Unique index enforced on EmployeeNumber
- DTO validation corrected for DateHired (nullable DTO pattern)

### Phase 2 – Completed

API Enhancements:

- Pagination implemented for GET /employees
- Filtering by IsActive supported
- Search implemented across:
  - EmployeeNumber
  - FirstName
  - MiddleName
  - LastName
  - Department
  - Position
- PagedEmployeesResponse introduced (items, totalCount, page, pageSize)
- Dedicated status endpoint implemented (PATCH /employees/{id}/status)

Schema Expansion (C1 Basic Info):

- Added ContactNumber
- Added Email
- Added AddressLine1
- Added AddressLine2
- Added City
- Added Province
- Added ZipCode
- EF migration created and applied (Employee_C1_BasicInfoFields)

Validation Improvements:

- EmailAddress validation added to Create and Update DTOs
- Range validation added to pagination parameters
- MaxLength validation added to Search
- BindRequired enforced for PATCH status payload

Verification:

- Swagger tested (POST, PUT, PATCH)
- Build succeeded with no regressions
- Database schema verified via DBeaver