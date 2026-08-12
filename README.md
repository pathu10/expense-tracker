# Expense Tracker — Docker Workshop Project

A simple, beginner-friendly full-stack Expense Tracker used as the reference
project for a Docker workshop. The application itself is intentionally
simple — the point of this repo is to practice Docker concepts, not to build
production software.

## 1. Project Overview

The Expense Tracker lets a (single demo) user record and manage daily
expenses. You can:

- Add, edit, delete and view expenses
- Categorize expenses (Food, Transport, Shopping, etc.)
- Filter expenses by category, date range, or title search
- See a dashboard with total spend, current-month spend, number of
  expenses, and the highest single expense
- See a simple category-wise spending summary

There is no login system — every expense belongs to a single seeded "Demo
User" so the workshop can focus on CRUD + Docker instead of authentication.

## 2. Technology Stack

| Layer      | Technology                                   |
| ---------- | --------------------------------------------- |
| Frontend   | React + TypeScript + Vite, served by Nginx    |
| Backend    | Node.js + Express + TypeScript                |
| Database   | PostgreSQL 16 (official Docker image)         |
| API style  | REST (JSON)                                   |
| Containers | Docker + Docker Compose (3 services)          |

## 3. Project Structure

```text
expense-tracker/
├── frontend/            # React + TypeScript + Vite app
│   ├── src/
│   ├── Dockerfile       # multi-stage build: Node -> Nginx
│   └── nginx.conf
├── backend/             # Express + TypeScript API
│   ├── src/
│   └── Dockerfile
├── db/
│   └── init.sql         # schema + seed data, run once by Postgres
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 4. Architecture

```text
Browser
   ↓
Frontend Container (Nginx serving the built React app)
   ↓  (REST API calls, e.g. http://localhost:5000/api/...)
Backend Container (Node.js + Express API)
   ↓  (SQL over the Docker network, hostname "database")
PostgreSQL Container (official postgres:16 image)
```

All three containers run on the same Docker Compose network
(`expense-tracker-network`) and talk to each other using their **service
names** as hostnames — never `localhost`.

## 5. Running Locally WITHOUT Docker (optional)

Useful for backend/frontend development, but Docker Compose (section 6) is
the primary way to run this project.

### 5.1 Start PostgreSQL

You need a local PostgreSQL 16 instance with a database matching your `.env`
values, and the schema from [db/init.sql](db/init.sql) applied to it.

### 5.2 Backend

```bash
cd backend
npm install
# create backend/.env or export the DB_* vars from .env.example,
# but use DB_HOST=localhost when NOT running in Docker
npm run dev
```

The API starts on `http://localhost:5000`.

### 5.3 Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173` and expects the API at the URL in
`VITE_API_URL` (defaults to `http://localhost:5000`).

## 6. Running With Docker (recommended)

### 6.1 Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)

### 6.2 Setup

```bash
cp .env.example .env
```

Edit `.env` if you want to change credentials or ports. The defaults work
out of the box for the workshop.

### 6.3 Build and start everything

```bash
docker compose up --build
```

This builds the `frontend` and `backend` images and starts all three
services: `frontend`, `backend`, `database`.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- PostgreSQL: localhost:5432 (for connecting with a DB client)

### 6.4 Common Docker Compose commands

```bash
docker compose build        # build/rebuild images without starting them
docker compose up           # start containers (foreground, shows logs)
docker compose up -d        # start containers in the background
docker compose down         # stop and remove containers (keeps the volume)
docker compose down -v      # stop and remove containers AND the database volume
docker compose logs         # view logs from all services
docker compose logs backend # view logs from just the backend
docker compose ps           # list running services and their status
```

## 7. Environment Variables

All configuration lives in `.env` (copy from `.env.example`, never commit
the real `.env`):

```env
PORT=5000

DB_HOST=database
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=admin
DB_PASSWORD=password

VITE_API_URL=http://localhost:5000
```

The backend reads `DB_*` variables to connect to PostgreSQL — no
credentials are hardcoded anywhere in the source code. The frontend reads
`VITE_API_URL` **at build time** (Vite bakes `VITE_*` variables into the
compiled JavaScript), which is why `docker-compose.yml` passes it in as a
Docker build argument rather than a runtime environment variable.

## 8. Docker Networking — Why `DB_HOST=database`

Each container gets its own isolated network namespace. Inside the backend
container, `localhost` refers to the **backend container itself**, not the
database container — so `DB_HOST=localhost` would fail to connect.

Docker Compose creates a private network (`expense-tracker-network`) shared
by all three services and automatically sets up DNS so that each service
can reach the others **by service name**. That's why the backend connects
to PostgreSQL using the hostname `database` — the name of the service in
`docker-compose.yml` — instead of `localhost` or an IP address.

The same idea applies to `frontend → backend`, except the frontend runs in
the user's **browser**, not inside the container network, so it uses the
host-published URL (`http://localhost:5000`) via `VITE_API_URL` instead of
the internal service name.

## 9. Docker Volumes — Why the Database Needs One

The `database` service mounts a named volume:

```yaml
volumes:
  db_data:/var/lib/postgresql/data
```

Containers are ephemeral — when a container is removed, everything written
inside its writable layer is lost. A **named volume** stores PostgreSQL's
data files outside the container's lifecycle, on the Docker host, so the
data survives container recreation.

Demonstrate this in the workshop:

```bash
docker compose up -d
# add a few expenses in the UI
docker compose down      # containers removed, volume kept
docker compose up -d     # data is still there!
```

Removing the volume too:

```bash
docker compose down -v   # containers AND the db_data volume are removed
docker compose up -d     # database starts empty again, init.sql re-seeds it
```

## 10. Troubleshooting

**Port already in use**
Another process is using 3000, 5000, or 5432. Either stop that process or
change the published port on the left side of the mapping in
`docker-compose.yml` (e.g. `"3001:80"`).

**Database connection failure / backend cannot connect to database**
- Make sure the `database` service is healthy: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Confirm `DB_HOST=database` (not `localhost`) is what the backend actually
  sees — it's forced in `docker-compose.yml`'s `environment:` block.
- The backend automatically retries the database connection a few times on
  startup in case Postgres is still initializing.

**Frontend cannot reach the backend**
- Confirm the backend is running and healthy: `curl http://localhost:5000/api/health`
- Check that `VITE_API_URL` was correct at the time the frontend image was
  built (Vite bakes it in at build time — changing `.env` afterwards
  requires `docker compose build frontend` again).

**A container isn't starting**
- Check its logs: `docker compose logs <service-name>`
- Check its status: `docker compose ps`
- Try a clean rebuild: `docker compose down` then `docker compose up --build`

## 11. Docker Concepts Covered by This Project

Working through this project (building, running, and modifying it) touches
on:

1. Dockerfiles (backend, frontend)
2. Docker images vs. containers
3. Building images (`docker compose build`)
4. Running containers (`docker compose up`)
5. Container-to-container communication
6. Docker networking and service-name DNS resolution
7. Environment variables and `.env` files
8. Docker volumes and data persistence
9. Docker Compose multi-service orchestration
10. Service names as hostnames
11. Container logs (`docker compose logs`)
12. Container lifecycle (`up`, `down`, `down -v`, restarts)
13. Multi-stage Docker builds (frontend: Node build stage → Nginx runtime stage)

## 12. REST API Reference

| Method | Endpoint                 | Description                     |
| ------ | ------------------------- | -------------------------------- |
| GET    | /api/expenses             | List expenses (supports filters) |
| GET    | /api/expenses/:id         | Get a single expense             |
| POST   | /api/expenses             | Create an expense                |
| PUT    | /api/expenses/:id         | Update an expense                |
| DELETE | /api/expenses/:id         | Delete an expense                |
| GET    | /api/categories           | List categories                  |
| POST   | /api/categories           | Create a category                |
| PUT    | /api/categories/:id       | Rename a category                |
| DELETE | /api/categories/:id       | Delete a category                |
| GET    | /api/dashboard/summary    | Totals, current-month, category breakdown |
| GET    | /api/health               | Health check                     |

Filter query params for `GET /api/expenses`: `category_id`, `from`, `to`, `search`.
