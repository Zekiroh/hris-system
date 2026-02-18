# HRIS System

HRIS (Human Resource Information System) full-stack application developed during OJT.

This repository follows a monorepo structure that contains the web client, mobile client, and backend API in a single codebase to support organized and scalable team development.

---

## Overview

The system is designed to handle core human resource processes such as employee management, authentication, and administrative operations.

The repository structure allows:

- Centralized development
- Shared TypeScript modules between web and mobile
- Backend versioned alongside client applications
- Consistent collaboration workflow across the team

---

## Architecture

```
HRIS-SYSTEM/ 
├── apps/ 
│ ├── web/ # React web application 
│ ├── mobile/ # React Native mobile application 
│ ├── api/ # ASP.NET Core Web API 
│ 
├── packages/ 
│ └── shared/ # Shared TypeScript modules (web + mobile)
│ 
├── docs/ # Documentation and references
```

### Application Responsibilities

- **apps/web**  
  React + TypeScript web client.

- **apps/mobile**  
  React Native + TypeScript mobile client.

- **apps/api**  
  ASP.NET Core Web API connected to MySQL.

- **packages/shared**  
  Shared TypeScript modules consumed by both web and mobile applications.

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

### 1. Clone the repository

git clone https://github.com/Zekiroh/hris-system.git

### 2. Install dependencies

Install workspace dependencies for web, mobile, and shared packages:

pnpm install

### 3. Run Web Application

cd apps/web

pnpm dev

### 4. Run Mobile Application

cd apps/mobile

pnpm start

### 5. Run Backend API

cd apps/api

dotnet restore

dotnet run


Ensure the database connection string is properly configured before running the API.

---

## Environment Configuration

Each application manages its own environment configuration:

- `apps/web` → `.env`
- `apps/mobile` → environment configuration based on project setup
- `apps/api` → `appsettings.json`

Sensitive credentials such as database connection strings must not be committed to the repository.

---

## Branching Strategy

We follow a simple and structured branching approach to keep development organized.

- `main`  
  Contains stable and production-ready code.

- `dev`  
  Serves as the active development branch where completed features are merged and tested together.

- `feature/<short-description>`  
  Used for individual tasks or modules. Examples:
  - `feature/authentication`
  - `feature/employee-management`
  - `feature/mobile-dashboard`

### Workflow

1. Create a feature branch from `dev`
2. Implement changes and commit regularly
3. Push the branch and open a pull request to `dev`
4. Merge to `main` once the changes are stable and reviewed

This keeps feature work isolated and reduces merge conflicts during collaboration.

---

## Collaboration Guidelines

- Keep commits clear and descriptive.
- Avoid direct pushes to `main`.
- Submit pull requests for review before merging.
- Maintain consistency in structure and naming conventions.

---

## Project Status

The system is currently under active development as part of internship training. 
The repository structure and core architecture have been established. Feature implementation and module integration are ongoing.



