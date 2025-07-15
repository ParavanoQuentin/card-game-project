# Docker Setup for Aether Beasts Card Game

This project uses Docker Compose to run the complete application stack.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Build and start the entire application:**

   ```bash
   docker compose up --build
   ```

2. **Start in detached mode (background):**

   ```bash
   docker compose up -d --build
   ```

3. **Stop the application:**

   ```bash
   docker compose down
   ```

4. **Remove all containers and volumes:**

   ```bash
   docker compose down -v
   ```

## Services

- **Frontend**: React application running on <http://localhost:3000>
- **Backend**: Node.js/Express API with Prisma ORM running on <http://localhost:3001>

## Database

The application uses SQLite database with Prisma ORM. The database file is persisted in a Docker volume (`backend_data`).

## Environment Variables

The Docker setup uses environment variables defined in the `compose.yml` file. For local development, you can still use the `.env` files in each service directory.

## Health Checks

Both services include health checks:

- Backend: Checks `/api/health` endpoint
- Frontend: Checks if the server is responding

## Logs

View logs for all services:

```bash
docker compose logs
```

View logs for a specific service:

```bash
docker compose logs backend
docker compose logs frontend
```

## Development

For active development, you might prefer running services individually:

1. **Backend only:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend only:**

   ```bash
   cd frontend
   npm start
   ```

This allows for faster rebuilds and hot-reloading during development.
