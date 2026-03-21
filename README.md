# HRIS System

Full-stack enterprise application developed during an internship. The repository follows a structure that consolidates the web client, mobile client, and backend API into a single codebase to maintain consistency, structure, and organized team development.

## Overview

The system is designed to support common enterprise workflows and administrative processes. The structure enables:

- Centralized development
- Shared code between web and mobile applications
- Clear separation between frontend and backend layers
- Structured collaboration across the team

## Architecture

```
hris-system/
├── apps/
│   ├── web/        # Web client application
│   ├── mobile/     # Mobile client application
│   ├── api/        # Backend API service
│
├── packages/
│   └── shared/     # Shared code across clients
│
├── infra/
│   └── docker/     # Docker infrastructure (MySQL)
│
├── docs/           # Project documentation
```

### Application Responsibilities

- **apps/web**  
  Web client for administrative and management interfaces.

- **apps/mobile**  
  Mobile client application for end-user interactions.

- **apps/api**  
  Backend service handling business logic, data processing, and integrations.

- **infra/docker**
  Local development infrastructure, currently used for the dockerized database.

- **packages/shared**  
  Reusable code shared across web and mobile applications to maintain consistency and reduce duplication.

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Web       | React + TypeScript + Vite |
| Mobile    | React Native + TypeScript + Expo |
| Backend   | ASP.NET Core Web API |
| Database  | MySQL 8 (Docker) |
| Tooling   | pnpm workspaces |

---

## Development Setup

### Prerequisites

Ensure the following tools are installed before running the project:

- Node.js (LTS recommended)
- pnpm
- .NET SDK
- Docker Desktop

Install pnpm if not yet available:

`npm install -g pnpm`

### Clone the repository

`git clone https://github.com/Zekiroh/hris-system.git`

`cd hris-system`

### Install dependencies

Install dependencies **once from the root of the repository**.

`pnpm install`

---

## Local Development Setup

**Follow this order exactly for first-time setup**


### 1. Start the database (Docker)

Navigate to the docker infrastructure:

`cd infra\docker`

Start the MySQL container:

`docker compose up -d`

MySQL will be available at port 3307. 


### 2. Configure backend secrets

Navigate to the API project:

`cd apps\api\HRIS.Api`

Set the local database connection string:

`dotnet user-secrets set "ConnectionStrings:Default" "Server=127.0.0.1;Port=3307;Database=hris_db;User=hris-user;Password=hris-password;"`

Set the JWT key:

`dotnet user-secrets set "Jwt:Key" "REPLACE_WITH_YOUR_LOCAL_DEVELOPMENT_JWT_KEY"`

Verify the stored secrets:

`dotnet user-secrets list`

### 3. Apply database migrations

Run EF Core migrations:

`dotnet ef database update`

This will create the required tables in the database.

### 4. Run the Backend API

Still inside the API project:

`dotnet restore`

`dotnet run`

The API will run on port 5169. Swagger will be available at 5169/swagger

### 5. Run the Web Application

Open a new terminal and navigate to the web app:

`cd apps\web`

Create the local environment file if needed.

Start the development server:

`pnpm dev`

The web application will run on port 5173 or 5174 if in use.

### 6. Run the Mobile Application

Open another terminal:

`cd apps\mobile`

Start the Expo development server:

`pnpm start`

---

## Environment Configuration

Each application manages its own environment configuration:

- `apps/web` → `.env`
- `apps/mobile` → environment configuration based on its setup
- `apps/api` → `appsettings.json + .NET user-secrets`

Sensitive credentials such as database connection strings must not be committed to the repository.

---

## Branching Strategy

The repository maintains two primary branches:

- `main`  
  Stable branch containing production-ready code.
  
- `dev`  
  Active development branch where completed features are merged and tested together.

- `feature/<short-description>`
  Used for individual tasks or modules. Examples:
  - `feature/authentication`
  - `feature/employee-management`
  - `feature/mobile-dashboard`

### Workflow

1. Create a feature branch from `dev`
2. Implement changes and commit regularly
3. Push the branch and open a pull request(PR) to `dev`
4. Merge to `main` once the changes are stable and reviewed

This keeps feature work isolated and reduces merge conflicts during collaboration.

### Collaboration Guidelines

- Use clear and meaningful commit messages.
- Do not push directly to `main`.
- Merge changes through pull requests.
- Keep changes focused on a specific task or module.
- Maintain consistency in structure and naming conventions.

---

## Project Status

The project is currently under active development as part of an internship program. Core architecture and repository structure have been established, with ongoing feature development and module integration.
