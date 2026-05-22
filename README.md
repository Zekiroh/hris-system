<<<<<<< HEAD
# HRIS System
<br>

```
hris-system/
├── apps/
│   ├── web/        # Web client application
│   ├── mobile/     # Mobile client application
│   ├── api/        # Backend API service
│
├── infra/
│   └── docker/     # Docker setup
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Web | React, TypeScript, Vite |
| Mobile | React Native, TypeScript, Expo |
| Backend | ASP.NET Core Web API (.NET 9) |
| Data Access | Entity Framework Core (EF Core) |
| Database | MySQL 8 |
| Containerization | Docker, Docker Compose |

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

`dotnet user-secrets set "ConnectionStrings:Default" "Server=127.0.0.1;Port=3307;Database=hris_db;User=hris_user;Password=hris_password;"`

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

## Branching Strategy

The repository maintains two primary branches:

- `main`  
  Stable branch containing production-ready code.
  
- `dev`  
  Active development branch where completed features are merged and tested together.

- `feature/<module>`
  Used for individual tasks or modules. Examples:
  - `feature/employee-management`
  - `feature/attendance-log`
  - `feature/leave-management`

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
=======
# HRIS-SYSTEM
Daily Accomplishment Report
>>>>>>> c4766543eed10950133eafa3b655c32993ec8a9e
