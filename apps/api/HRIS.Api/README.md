# HRIS Backend API

The HRIS backend is the source of truth for authentication, authorization, HR records, business validation, calculations, and database persistence.

It exposes DTO-based API contracts for the web and mobile clients while keeping Entity Framework models internal to the API.

## Tech Stack

| Area | Technology |
|---|---|
| Framework | ASP.NET Core Web API (.NET 9) |
| Data Access | Entity Framework Core 9 |
| Database | MySQL 8 |
| EF Provider | Pomelo Entity Framework Core for MySQL |
| Authentication | JWT Bearer |
| API Documentation | Swagger / OpenAPI |
| PDF Generation | QuestPDF |
| Password Hashing | BCrypt |

## Project Structure

```text
HRIS.Api/
├── Configuration/   # Validated runtime configuration
├── Data/            # EF Core database context and persistence setup
├── Features/        # Business capability ownership
├── Middleware/      # Cross-cutting request pipeline behavior
├── Models/          # Internal persistence models
├── Migrations/      # EF Core migration history
├── Properties/      # Local launch profiles
├── SwaggerAssets/   # Development Swagger customization
├── Program.cs       # Application startup and service registration
└── HRIS.Api.csproj
```

## Business Modules

The API currently contains the following feature areas:

- IAM
- Employees
- Attendance
- Leave Management
- Payroll
- Government Compliance
- Asset Management
- Clearance Management
- Performance Management
- Announcement Management
- Daily Accomplishment Report
- Dashboard

The presence of a module does not necessarily mean every workflow is already final. Functional completion and runtime verification are handled per module.

## Prerequisites

Install the following tools before running the API:

- .NET 9 SDK
- Docker Desktop
- EF Core CLI compatible with .NET 9

Install or update the EF Core CLI when needed:

```powershell
dotnet tool update --global dotnet-ef --version 9.0.0 --allow-downgrade
```

## Local Configuration

The API requires a database connection string and JWT signing key.

Navigate to the API project:

```powershell
cd apps\api\HRIS.Api
```

Set the local database connection string:

```powershell
dotnet user-secrets set "ConnectionStrings:Default" "Server=127.0.0.1;Port=3307;Database=hris_db;User=hris_user;Password=hris_password;"
```

Set a local JWT signing key:

```powershell
dotnet user-secrets set "Jwt:Key" "REPLACE_WITH_A_STRONG_LOCAL_DEVELOPMENT_KEY"
```

Review the stored values:

```powershell
dotnet user-secrets list
```

Do not commit credentials, signing keys, or production connection strings.

### Configuration behavior

The committed base configuration intentionally leaves the JWT signing key empty and does not define production CORS origins.

Development CORS currently allows:

```text
http://localhost:5173
http://localhost:5174
```

Production environments must provide their own secure configuration values.

## Run Locally

From the repository root, start MySQL:

```powershell
cd infra\docker
docker compose up -d
```

Return to the API project:

```powershell
cd ..\..\apps\api\HRIS.Api
```

Restore dependencies and apply migrations:

```powershell
dotnet restore
dotnet ef database update
```

Run the API:

```powershell
dotnet run
```

Development endpoints:

```text
API:     http://localhost:5169
Swagger: http://localhost:5169/swagger
```

Swagger is enabled only in the Development environment.

## Common Commands

```powershell
dotnet restore
dotnet build
dotnet ef database update
dotnet ef migrations list
```

Schema changes must be justified and reviewed before new migrations are created.

## Authentication and Authorization

The API uses JWT bearer authentication with:

- signing-key validation;
- issuer validation;
- audience validation;
- expiration and lifetime validation;
- zero clock skew;
- HTTPS metadata required outside Development.

Authorization must be enforced by the backend for every protected workflow. Client-side guards are not a replacement for server-side authorization.

## Development Rules

- The backend remains the source of truth.
- Expose DTOs only; do not return EF entities from API contracts.
- Keep business rules and calculations in backend services.
- Preserve supported API contracts unless a verified fix requires an intentional change.
- Do not commit secrets, credentials, or environment-specific production values.
- Avoid schema changes unless they are proven necessary.
- Add functionality under the correct feature ownership.
- Verify validation, authorization, persistence, and failure handling for every workflow.