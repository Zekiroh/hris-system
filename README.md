# HRIS System

HRIS (Human Resource Information System) full-stack application developed during OJT.

This repository uses a monorepo structure that contains the web client, mobile client, and backend API in a single codebase to maintain consistency, structure, and organized team development.

---

## Overview

The system is designed to handle core human resource processes such as employee records, attendance, leave processing, payroll, compliance tracking, and related administrative workflows.

The repository structure allows:

- Centralized development
- Shared code between web and mobile applications
- Clear separation between frontend and backend layers
- Structured collaboration across the team

---

## Architecture

```
hris-system/ 
├── apps/ 
│ ├── web/ # React web application 
│ ├── mobile/ # React Native mobile application 
│ ├── api/ # ASP.NET Core Web API 
│ 
├── packages/ 
│ └── shared/ # Shared code used by Web and Mobile
│ 
├── docs/ # Project documentation and references
```

### Application Responsibilities

- **apps/web**  
  Web client responsible for administrative and management interfaces.

- **apps/mobile**  
  Mobile client for employee-facing functionality.

- **apps/api**  
  Responsible for business logic and database operations.

- **packages/shared**  
  Shared code used by both web and mobile applications.

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Web       | React + TypeScript + Vite |
| Mobile    | React Native + TypeScript |
| Backend   | ASP.NET Core Web API |
| Database  | MySQL |
| Tooling   | pnpm workspaces |

---

## Development Setup

### Prerequisites

Ensure the following tools are installed before running the project:

- Node.js (LTS recommended)
- pnpm
- .NET SDK
- MySQL


Install pnpm if not yet available:

`npm install -g pnpm`

### 1. Clone the repository

`git clone https://github.com/Zekiroh/hris-system.git`

### 2. Install dependencies

Install workspace dependencies for web, mobile, and shared packages:

`pnpm install`

### 3. Run Web Application

`cd apps/web`

`pnpm dev`

### 4. Run Mobile Application

`cd apps/mobile`

`pnpm start`

### 5. Run Backend API

`cd apps/api`

`dotnet restore`

`dotnet run`


Ensure the database connection string is properly configured in `apps/api/appsettings.json` before running the API.

---

## Environment Configuration

Each application manages its own environment configuration:

- `apps/web` → `.env`
- `apps/mobile` → environment configuration based on its setup
- `apps/api` → `appsettings.json`

Sensitive credentials such as database connection strings must not be committed to the repository.

---

## Branching Strategy

The repository maintains two primary branches:

- `main`  
  Stable branch containing production-ready code.
  
- `dev`  
  Active development branch where completed features are merged and tested together.

- `feature/<short-description>` Used for individual tasks or modules. Examples:
  - `feature/authentication`
  - `feature/employee-management`
  - `feature/mobile-dashboard`

### Workflow

1. Create a feature branch from `dev`
2. Implement changes and commit regularly
3. Push the branch and open a pull request(PR) to `dev`
4. Merge to `main` once the changes are stable and reviewed

This keeps feature work isolated and reduces merge conflicts during collaboration.

---

## Collaboration Guidelines

- Use clear and meaningful commit messages.
- Do not push directly to `main`.
- Merge changes through pull requests(PR).
- Keep changes focused on a specific task or module.
- Maintain consistency in structure and naming conventions.

---

## Project Status

The system is currently under active development as part of internship program. 
The repository structure and core architecture have been established. Feature implementation and module integration are ongoing.
