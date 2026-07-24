# HRIS Web Application

The web application is the primary HRIS client for administrators and employees.

It provides role-based access to HR workflows while relying on the backend API for authentication, authorization, validation, calculations, and persistence.

## Tech Stack

| Area | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| Styling | Tailwind CSS |
| Charts | Chart.js and react-chartjs-2 |
| Notifications | Sonner |
| Icons | Lucide React |

## Prerequisites

Install the following before running the web application:

- Node.js
- pnpm
- Running HRIS backend API

Install all workspace dependencies once from the repository root:

```powershell
pnpm install
```

## Environment Configuration

The web application requires `VITE_API_BASE_URL`.

From `apps\web`, create a local `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5169
```

The API URL must:

- be a valid absolute HTTP or HTTPS URL;
- use HTTPS outside Development;
- not contain credentials;
- not contain query parameters;
- not contain a URL fragment.

Development supports local HTTP addresses such as:

```text
http://localhost:5169
http://127.0.0.1:5169
```

Production must provide an HTTPS API URL.

## Run Locally

From the repository root:

```powershell
pnpm dev:web
```

Or run directly from the web workspace:

```powershell
cd apps\web
pnpm dev
```

Vite normally starts on:

```text
http://localhost:5173
```

If the port is already in use, Vite may use another available port such as `5174`.

## Available Commands

Run these inside `apps\web`:

```powershell
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

`pnpm build` runs the TypeScript project build before generating the Vite production bundle.

## Application Flow

```text
main.tsx
→ AppProviders
→ App
→ AppRoutes
→ Route Guards
→ Dashboard Layout
→ Feature
```

The provider composition currently includes:

- `BrowserRouter`
- `AuthProvider`
- `LeaveProvider`
- global Sonner notifications

## Frontend Structure

```text
src/
├── app/        # Application bootstrap, routing, providers, auth, and guards
├── assets/     # Static assets
├── features/   # Business capability ownership
├── layouts/    # Application shell and dashboard layout
├── services/   # Backend integration and API configuration
├── shared/     # Genuinely reusable frontend code
├── App.tsx
├── index.css
└── main.tsx
```

Do not recreate removed top-level folders such as `components`, `context`, `hooks`, `lib`, or `pages`.

## Routes and Roles

The application separates routes into:

- guest-only routes;
- authenticated routes;
- admin-only routes;
- shared employee and admin routes;
- user-facing employee routes.

Current protected feature areas include:

- Dashboard
- Employee Management
- Attendance
- Daily Accomplishment Report
- Leave Management
- Payroll
- Government Compliance
- Asset Management
- Settings

Frontend route guards improve navigation behavior, but backend authorization remains authoritative.

## Development Rules

- The backend remains the source of truth.
- Do not duplicate backend business rules or calculations in the frontend.
- Keep API clients under `src/services`.
- Organize code by actual business capability.
- Preserve supported routes and API contracts.
- Avoid unrelated UI redesign during functional completion.
- Verify loading, empty, failure, refresh, direct-navigation, and role-based states.

## Verification

Before submitting web changes, run:

```powershell
pnpm lint
pnpm build
git diff --check
```

The repository uses pnpm for JavaScript workspace commands.