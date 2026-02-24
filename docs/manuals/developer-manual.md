# Developer Manual – HRIS System

## 1. Purpose

This manual defines development standards and engineering guidelines for contributors working on the HRIS monorepo.

It applies to both backend and frontend developers.

This document complements the repository README by focusing on implementation discipline rather than environment setup.

---

## 2. Monorepo Development Rules

- Each application must remain within its designated directory under `apps/`.
- Shared cross-client contracts belong in `packages/shared`.
- Infrastructure configuration belongs in `infra/`.
- Documentation must remain in `docs/`.

Responsibilities must not overlap across layers.

---

## 3. Architecture Guidelines

The HRIS system follows a layered architecture where each layer has defined responsibilities.

### Frontend Responsibilities (Web & Mobile)
- Consume API strictly through defined contracts.
- Implement permission-aware UI rendering.
- Maintain clear separation between UI state and backend logic.
- Use shared types from `packages/shared` when applicable.

### Backend Responsibilities
- Implement business logic and data validation.
- Enforce authentication and authorization.
- Define and maintain API contracts.
- Manage database schema through controlled migrations.
- Log privileged or state-changing operations.

Implementation standards for each layer may evolve as modules mature.

---

## 4. API Contract Discipline

The API contract is a shared agreement between frontend and backend.

Rules:

- Frontend should rely only on documented API behavior.
- Backend should return intentionally shaped response objects.
- Breaking changes must be coordinated.
- Shared types should be synchronized through `packages/shared` when necessary.

---

## 5. Branching & Collaboration Policy

- `main` → Stable branch
- `dev` → Integration branch
- `feature/<module>` → Isolated feature development

Rules:
- No direct commits to `main`
- All changes go through Pull Requests
- Commits must be focused and descriptive

---

## 6. Documentation Policy

- Each module must have documentation under its respective directory in `docs/`.
- Architectural changes must update `docs/architecture/`.
- Documentation must reflect actual implementation state.
- Teams may expand or revise documentation relevant to their area.
- This document may evolve collaboratively as frontend and backend standards mature.

---

## 7. Current System Status

The system is being developed incrementally by module.

At this stage:
- Core authentication and authorization mechanisms have been implemented.
- Additional modules are being introduced progressively following dependency order.

Module-level documentation should always reflect actual implementation progress.

> This document was initialized during early backend development and is expected to evolve as frontend modules are formalized.