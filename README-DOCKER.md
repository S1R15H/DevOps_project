# Docker Setup with Neon Database

This project is configured to use Docker for both Development and Production environments, utilizing Neon's branching features.

## 1. Development Environment (Neon Local)

In development, we use **Neon Local** via Docker. This runs a proxy container alongside your application.

When the `neon-local` container starts, it connects to your Neon Cloud account and automatically provisions an **ephemeral branch**. This gives you an isolated database environment containing production schema/data for testing, without affecting your main database. When you stop the container, the ephemeral branch is deleted.

### Setup Instructions:

1. Open `.env.development` and populate the required Neon Local variables:
   - `NEON_API_KEY`: Get this from your Neon account settings.
   - `NEON_PROJECT_ID`: The ID of your Neon project.
   - _(The `DATABASE_URL` is already configured to point to the local proxy container)._

2. Start the development environment:

   ```bash
   # Make sure your environment variables are loaded
   set -a && source .env.development && set +a

   # Run docker-compose for dev
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. The application will connect to the `neon-local` proxy container at `postgres://neon:npg@neon-local:5432/neondb`, which routes traffic securely to your new ephemeral branch in the cloud.

## 2. Production Environment (Neon Cloud)

In production, we **do not** use the Neon Local proxy. Instead, the application container connects directly to your actual Neon Serverless Postgres instance using the official connection string.

### Setup Instructions:

1. Open `.env.production` and populate your production secrets:
   - Set the `DATABASE_URL` to your actual Neon connection string (e.g., `postgres://user:password@ep-...neon.tech/neondb?sslmode=require`).

2. Start the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### How `DATABASE_URL` switches:

- **Dev:** In `docker-compose.dev.yml`, the app loads `.env.development` where `DATABASE_URL` points to `neon-local:5432`.
- **Prod:** In `docker-compose.prod.yml`, the app loads `.env.production` where `DATABASE_URL` points directly to your Neon `.tech` cloud database url.
