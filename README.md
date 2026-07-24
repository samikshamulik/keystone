# KEYSTONE — Field Service Management Platform

> **Project KEYSTONE** · Zidio Development · Java Full-Stack Engineering  
> Client: Meridian Facilities Management · Role: Full-Stack Engineer · Duration: 4 Weeks

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://keystone-wheat-three.vercel.app |
| **Backend API (Render)** | https://keystone-api-oobm.onrender.com |
| **Swagger UI** | https://keystone-api-oobm.onrender.com/swagger-ui/index.html |
| **GitHub** | https://github.com/IngolePrasad777/keystone |

> ⚠️ The backend runs on Render's free tier — the first request after inactivity may take 30–60 seconds (cold start). Subsequent requests are fast.

---

## 📋 Project Overview

KEYSTONE is a production-grade **Field Service Management Platform** built for Meridian Facilities Management — a commercial maintenance company servicing HVAC, electrical, and plumbing systems across multiple building sites.

The platform replaces spreadsheets and messaging apps with a single system of record. It covers the complete work-order lifecycle — from the moment a customer reports a problem to the moment the job is closed and billed.

**What each role can do:**

| Role | Capabilities |
|------|-------------|
| **Manager** | Full access: users, parts, dashboard, close jobs, all reports |
| **Dispatcher** | Create/assign work orders, manage customers & sites, view board |
| **Technician** | View own jobs, start/hold/complete, log parts used & time spent |
| **Customer** | Raise requests for their own sites, track status and history |

**Key features:**
- Governed work-order lifecycle with server-enforced state machine (7 states)
- Role-based access control — every endpoint checked server-side with `@PreAuthorize`
- Transactional parts logging — stock can never go negative
- SLA due dates by priority + scheduled breach detection (every 5 min)
- Real-time dashboard: status counts, overdue work, technician/site workload
- Append-only status history audit trail on every work order
- In-app notifications for assignments and SLA breaches
- Customer portal — data isolated at repository level (customers never see other orgs' data)

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Java | 21 (LTS) |
| Back-end framework | Spring Boot | 3.3.4 |
| Security | Spring Security + JWT (JJWT) | 6.3 / 0.12.6 |
| Persistence | Spring Data JPA / Hibernate | 6.5 |
| Database | PostgreSQL | 16 |
| Migrations | Flyway | 10.10 |
| API Documentation | springdoc-openapi (Swagger UI) | 2.6 |
| Front-end | React + TypeScript | 18 / 5 |
| Build tool (frontend) | Vite | 8 |
| Styling | Tailwind CSS | v4 |
| Data fetching | TanStack React Query | 5 |
| Build tool (backend) | Maven | 3.9 |
| Containerisation | Docker + docker-compose | — |

---

## 🔑 Seed Login Credentials

All seed accounts are created by Flyway migrations V6–V7.

| Role | Email | Password |
|------|-------|----------|
| Manager | `manager@keystone.dev` | `manager123` |
| Dispatcher | `dispatcher@keystone.dev` | `dispatcher123` |
| Dispatcher | `sunita.patel@keystone.dev` | `dispatcher123` |
| Technician | `technician@keystone.dev` | `technician123` |
| Technician | `rajesh.kumar@keystone.dev` | `technician123` |
| Technician | `priya.sharma@keystone.dev` | `technician123` |
| Technician | `amit.verma@keystone.dev` | `technician123` |
| Customer (Greenfield) | `customer@keystone.dev` | `customer123` |
| Customer (TCS) | `vikram.singh@keystone.dev` | `customer123` |
| Customer (Infosys) | `meera.nair@keystone.dev` | `customer123` |

---

## ⚙️ Environment Variables

| Variable | Default (dev) | Description |
|----------|--------------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5433/keystone` | Full JDBC connection URL |
| `DATABASE_USERNAME` | `keystone` | PostgreSQL username |
| `DATABASE_PASSWORD` | `keystone` | PostgreSQL password |
| `JWT_SECRET` | *(dev fallback)* | **Must be changed in production** — min 32 random chars |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime in ms (default 24 hours) |
| `SERVER_PORT` | `8081` | HTTP port for the backend |
| `VITE_API_URL` | *(not set — uses proxy)* | Production backend URL for Vercel (e.g. `https://keystone-api-ootm.onrender.com`) |

Copy `.env.example` to `.env` for local development — it is git-ignored and never committed.

---

## 🚀 Local Development Setup

**Prerequisites:** Java 21, Maven 3.9+, Node.js 22+, Docker Desktop

### Step 1 — Clone the repository

```bash
git clone https://github.com/IngolePrasad777/keystone.git
cd keystone
```

### Step 2 — Start PostgreSQL (Docker)

```bash
# Starts a fresh PostgreSQL 16 container on port 5433
docker-compose up postgres -d

# Verify it's healthy
docker exec keystone-postgres pg_isready -U keystone
```

### Step 3 — Run the Backend

```bash
cd backend

# Flyway migrations run automatically on startup (creates all tables + seeds data)
mvn spring-boot:run

# Backend available at: http://localhost:8081
# Swagger UI at:        http://localhost:8081/swagger-ui/index.html
```

**How migrations work:** Flyway detects the `db/migration/` folder and runs scripts V1–V10 in order on a clean database. No manual SQL needed.

### Step 4 — Run the Frontend

```bash
cd frontend
npm install
npm run dev

# Frontend at: http://localhost:5173
# /api requests are proxied to http://localhost:8081 via Vite config
```

---

## 🗄️ Running Migrations & Seed Data

Migrations are **fully automatic** — Flyway runs them on every application startup.

```bash
# To reset and re-run all migrations from scratch:
# 1. Stop the backend
# 2. Drop and recreate the database
docker exec keystone-postgres psql -U keystone -c "DROP DATABASE keystone; CREATE DATABASE keystone;"
# 3. Restart the backend — Flyway will re-run V1 through V10
mvn spring-boot:run -pl backend
```

**Migration files** (`backend/src/main/resources/db/migration/`):

| Migration | Description |
|-----------|-------------|
| V1 | Create users table |
| V2 | Create customers and sites |
| V3 | Create work orders |
| V4 | Create status history (append-only audit trail) |
| V5 | Create parts, part_usages, time_logs |
| V6 | Seed initial users, customer, sites, parts |
| V7 | Fix seed password hashes |
| V8 | Create notifications table |
| V9 | Rich Indian seed data (TCS, Infosys, Reliance + more users/parts) |
| V10 | Realistic work orders with full history, parts usage, time logs |

---

## 🏗️ Architecture

```
keystone/
├── backend/                          # Spring Boot 3 service
│   ├── src/main/java/com/meridian/keystone/
│   │   ├── controller/               # REST controllers — HTTP only, no business logic
│   │   ├── service/                  # Business logic, state machine, SLA, transactions
│   │   ├── repository/               # Spring Data JPA — queries scoped by role
│   │   ├── domain/                   # JPA entities + enums (WorkOrderStatus, Role, Priority)
│   │   ├── dto/                      # Request/response DTOs — entities never reach client
│   │   ├── security/                 # JWT filter, KeystonePrincipal, SecurityConfig
│   │   ├── exception/                # ApiException + GlobalExceptionHandler (@ControllerAdvice)
│   │   └── config/                   # JPA auditing, OpenAPI, WebConfig
│   └── src/main/resources/
│       ├── application.yml           # App config (all secrets via env vars)
│       └── db/migration/             # Flyway scripts V1–V10
├── frontend/                         # React 18 + TypeScript SPA
│   └── src/
│       ├── api/                      # Axios API modules per domain
│       ├── context/                  # AuthContext (JWT storage + role helpers)
│       ├── hooks/                    # TanStack Query hooks (useWorkOrders, etc.)
│       ├── pages/                    # Full page components (Login, Dashboard, Board…)
│       ├── components/               # Reusable UI (Layout, StatusBadge, NotificationBell…)
│       ├── types/                    # TypeScript interfaces for all domain objects
│       └── utils/                    # statusHelpers, transition rules
├── docker-compose.yml                # Full stack: postgres + backend + frontend
├── render.yaml                       # Render.com deployment config
├── .env.example                      # Template for local environment variables
└── README.md
```

### Layer Responsibilities

```
Browser → React SPA (Vercel)
              │ HTTPS / JWT
              ▼
         Controllers  ← thin: validate, auth check, map DTOs, delegate
              │
         Services     ← all business logic: state machine, SLA, transactions
              │
         Repositories ← Spring Data JPA, role-scoped queries
              │
         PostgreSQL   ← Render managed DB, Flyway-versioned schema
```

**Key design principles:**
1. **Thin controllers** — no `if/else` business logic, only HTTP concerns
2. **Rich services** — all rules live here, fully testable
3. **DTOs at the boundary** — JPA entities are never serialized to the client
4. **Transactions guard invariants** — parts usage + stock decrement in one atomic transaction
5. **Append-only audit** — `WorkOrderStatusHistory` rows are never edited or deleted
6. **Server-side security** — every endpoint has `@PreAuthorize`; hiding a button in React is not security

---

## 🔄 Work-Order Lifecycle

```
         ┌─────────────────────────────────────────┐
         │                                         │
  NEW ──► ASSIGNED ──► IN_PROGRESS ──► COMPLETED ──► CLOSED
                │           │↑              │
                └──────► ON_HOLD            │
                │                           │
                └───────────────────────────┴──► CANCELLED
```

**Rules (all enforced server-side in `WorkOrderService`):**
- Only transitions shown above are allowed — any other returns `409 Conflict`
- `CLOSED` — Manager only
- `IN_PROGRESS`, `ON_HOLD`, `COMPLETED` — assigned Technician or Manager
- `CANCELLED` — Manager or Dispatcher
- `CLOSED` and `CANCELLED` are terminal — no further transitions

---

## 🔒 Security

- **Passwords**: BCrypt (`$2a$10$...`) — never plain text or reversible
- **JWT**: HS256, signed with `JWT_SECRET`, expires after `JWT_EXPIRATION_MS` ms
- **Server-side role checks**: `@PreAuthorize("hasRole('MANAGER')")` on every protected endpoint
- **Customer isolation**: `CustomerRepository.findByUserId()` scopes all queries — a customer calling `/api/work-orders` only ever sees their organisation's data, even if they forge an ID
- **No secrets in repo**: All credentials come from environment variables; `.env` is in `.gitignore`
- **CORS**: All origins allowed (stateless JWT — CORS is not the security boundary)
- **Bean Validation**: All inputs validated server-side; errors return structured JSON, never stack traces

---

## 📊 SLA Tracking

| Priority | SLA Window |
|----------|-----------|
| CRITICAL | 4 hours |
| HIGH | 8 hours |
| MEDIUM | 24 hours |
| LOW | 72 hours |

`SlaBreachScheduler` runs every 5 minutes (`@Scheduled(fixedDelay = 300_000)`). It queries for non-terminal work orders past their `sla_due_at` and marks `sla_breached = true`. Breaches are visible on the Kanban board (pulsing badge), in work order detail, and in the dashboard overdue count.

---

## 🧪 Running Tests

```bash
cd backend
mvn test
```

**Test coverage:**
- `WorkOrderLifecycleTest` — 3 unit tests for the state machine (no Spring context needed)
  - All valid transitions pass
  - All invalid transitions are rejected
  - Terminal state detection

---

## 📡 API Reference

Full interactive docs at **Swagger UI**: https://keystone-api-oobm.onrender.com/swagger-ui/index.html

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | Public | Returns JWT + role |
| `/api/work-orders` | GET | All | Role-scoped, paginated, filterable |
| `/api/work-orders` | POST | Manager, Dispatcher, Customer | Create work order |
| `/api/work-orders/board` | GET | All | Kanban board — all open orders |
| `/api/work-orders/{id}` | GET | All (scoped) | Full detail with history |
| `/api/work-orders/{id}/assign` | POST | Manager, Dispatcher | Assign technician |
| `/api/work-orders/{id}/status` | POST | Role-dependent | Lifecycle transition |
| `/api/work-orders/{id}/parts` | POST | Manager, Technician | Log parts (transactional) |
| `/api/work-orders/{id}/time` | POST | Manager, Technician | Log labour time |
| `/api/customers` | GET/POST | Manager, Dispatcher | Customer management |
| `/api/customers/{id}/sites` | GET/POST | Manager, Dispatcher | Site management |
| `/api/parts` | GET/POST/PUT/DELETE | Manager | Parts inventory |
| `/api/users` | GET/POST | Manager | User management |
| `/api/users/technicians` | GET | Manager, Dispatcher | List available technicians |
| `/api/reports/summary` | GET | Manager, Dispatcher | Dashboard metrics |
| `/api/notifications` | GET | All | In-app notifications |
| `/actuator/health` | GET | Public | Health check |

**Error response format** (consistent across all endpoints):
```json
{
  "timestamp": "2026-07-24T00:00:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Illegal transition: CLOSED → IN_PROGRESS",
  "fieldErrors": null
}
```

---

## 🐳 Docker Deployment

```bash
# Full stack (postgres + backend + frontend with nginx)
cp .env.example .env      # edit JWT_SECRET and DATABASE_PASSWORD
docker-compose up --build -d

# Check status
docker-compose ps
docker-compose logs -f backend

# Access
# Frontend:  http://localhost
# API:       http://localhost:8081/api
# Swagger:   http://localhost:8081/swagger-ui/index.html
```

See `DEPLOYMENT.md` for Vercel + Render cloud deployment instructions.

---

*Built with ❤️ by Prasad Ingole — Zidio Development Java Full-Stack Engineering Programme*
