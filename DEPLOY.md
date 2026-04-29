# Deploying MTS

Stack: docker compose with nginx reverse proxy + Let's Encrypt via certbot.
All TLS, routing, and renewal happens inside containers — nothing to install
on the host beyond Docker.

## Architecture

```
       :80,:443
          │
          ▼
     ┌─────────┐    ┌──────────┐
     │  proxy  │──▶│ frontend  │  (static SPA, internal :80)
     │ (nginx) │    └──────────┘
     │         │    ┌──────────┐
     │         │──▶│  backend  │  (NestJS, internal :3000)
     └─────────┘    └──────────┘
                        │
                        ▼
                    ┌──────┐
                    │  db  │  (postgres, internal :5432)
                    └──────┘

     ┌─────────┐
     │ certbot │  (renewal loop, writes to shared volume)
     └─────────┘
```

The proxy terminates TLS and routes:
- `/api/*` and `/uploads/*` → backend
- everything else → frontend
- `/.well-known/acme-challenge/*` → certbot webroot (HTTP only)

## Prerequisites

- A server with a public IPv4 address.
- A DNS A record pointing your domain at that IP.
- Ports 80 and 443 open.
- Docker + Docker Compose plugin.

## Setup

1. **Clone and configure**
   ```sh
   git clone <repo> mts && cd mts
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```
   Edit `.env`:
   ```
   DOMAIN=mts.yourdomain.com
   CERTBOT_EMAIL=you@yourdomain.com
   ```
   Edit `backend/.env`: rotate `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, set
   `GOOGLE_CLIENT_ID`. DB credentials there are ignored — compose injects them.

2. **Bootstrap certificates** (once)
   ```sh
   ./proxy/init-letsencrypt.sh           # production cert
   # or test the flow first to avoid hitting LE rate limits:
   ./proxy/init-letsencrypt.sh --staging
   ```
   The script creates a dummy cert so nginx can start, requests a real
   cert via the HTTP-01 challenge, then reloads nginx.

3. **Bring everything up**
   ```sh
   docker compose up -d --build
   ```

4. **Verify**
   ```sh
   curl -I https://$DOMAIN          # 200 from frontend
   curl -I https://$DOMAIN/api      # reaches backend
   ```

## Renewal

The `certbot` service runs a renewal check every 12h; the `proxy` service
reloads nginx every 6h to pick up rotated certs. Nothing manual.

## Updating

```sh
git pull
docker compose up -d --build
```

## Things to fix before serving real users

- **Migrations.** `src/app.module.ts:29` runs `synchronize: true`. Switch to
  TypeORM migrations before any schema you care about lands.
- **Backups.** The `db-data` volume is your whole world. Schedule
  `pg_dump` to S3/borg/whatever.
- **Secrets.** Don't commit the populated `.env` files.

## Local development

This compose is prod-shaped. For local dev keep using `yarn dev` in
`backend/` and `frontend/` against a locally running postgres (or just
`docker compose up db`).
