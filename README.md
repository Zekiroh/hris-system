# Enterprise Full-Stack Monorepo System

Full-stack enterprise application developed during an internship. The repository follows a monorepo structure that consolidates the web client, mobile client, and backend API into a single codebase to maintain consistency, structure, and organized team development.

---

## Overview

The system is designed to support common enterprise workflows and administrative processes. The monorepo structure enables:

- Centralized development
- Shared code between web and mobile applications
- Clear separation between frontend and backend layers
- Structured collaboration across the team

---

## Architecture

```
hris-system/ 
├── apps/ 
│ ├── web/ # Web client application 
│ ├── mobile/ # Mobile client application 
│ ├── api/ # Backend API service
│ 
├── packages/ 
│ └── shared/ # Shared code across clients
│ 
├── docs/ # Project documentation
```

### Application Responsibilities

- **apps/web**  
  Web client for administrative and management interfaces.

- **apps/mobile**  
  Mobile client application for end-user interactions.

- **apps/api**  
  Backend service handling business logic, data processing, and integrations.

- **packages/shared**  
  Reusable code shared across web and mobile applications to maintain consistency and reduce duplication.

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Web       | React + TypeScript + Vite |
| Mobile    | React Native + TypeScript + Expo|
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

`cd hris-system`

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

The project is currently under active development as part of an internship program. Core architecture and repository structure have been established, with ongoing feature development and module integration.
