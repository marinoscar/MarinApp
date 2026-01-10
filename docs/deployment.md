# Deployment Guide (Docker Compose + NGINX + Let's Encrypt)

This document walks through **end-to-end deployment** of both the **web app** and **API** on a single Ubuntu VPS using **Docker Compose** for containers and **NGINX** as the reverse proxy with **Let's Encrypt** TLS certificates. It also includes **install** and **update** procedures for each app.

> **Assumptions**
> - You already have DNS records for `app.marin.cr` and `api2.marin.cr` pointing to your VPS.
> - You can connect to the server (e.g., via telnet/SSH) as root.
> - The server already has **PostgreSQL**, **Let's Encrypt**, **NGINX**, and **Git** installed.
> - You will deploy:
>   - **Web app** in `/var/www/marin2web` at `https://app.marin.cr`
>   - **API** in `/var/www/marin2api` at `https://api2.marin.cr`

---

## 1) Install Prerequisites (one-time)

These steps ensure Docker and the Compose plugin are available. You already have Docker installed, so only verification is needed.

1. **Update packages**:
   ```bash
   apt update
   apt upgrade -y
   ```

2. **Verify Docker is running**:
   ```bash
   docker --version
   docker compose version
   systemctl status docker --no-pager
   ```

---

## 2) Create base directories

We will place each app in its own directory under `/var/www`.

```bash
mkdir -p /var/www/marin2web
mkdir -p /var/www/marin2api
```

---

# Web App Deployment (`https://app.marin.cr`)

## A) Install the Web App (initial deployment)

### Step 1: Clone the repository

```bash
cd /var/www/marin2web
git clone --filter=blob:none --sparse https://github.com/marinoscar/MarinApp .
git sparse-checkout set apps/web
```

> Repository URL: https://github.com/marinoscar/MarinApp

### Step 2: Create environment files

Create a **runtime** env file for the web app (example file name: `.env.web`). Use `nano` as your editor:

```bash
nano /var/www/marin2web/.env.web
```

Then paste:

```
# Public frontend configuration (example values only)
VITE_API_BASE_URL=https://api2.marin.cr
```

> **Important:** Never commit real secrets to the repo. Store only environment-specific values in env files on the server.

### Step 3: Create a Docker Compose file for the web app

```bash
nano /var/www/marin2web/docker-compose.yml
```

Then paste:

```
services:
  marin-web:
    image: marin-web:latest
    build:
      context: apps/web
      dockerfile: Dockerfile
    container_name: marin-web
    restart: unless-stopped
    env_file:
      - .env.web
    ports:
      - "127.0.0.1:3000:3000"
```

> If your web container listens on a different port, adjust `3000` accordingly.

### Step 4: Build and start the web app

```bash
cd /var/www/marin2web
docker compose up -d --build
```

### Step 5: Configure NGINX for the web app

Create an NGINX site file:

```bash
nano /etc/nginx/sites-available/app.marin.cr
```

Then paste:

```
server {
    listen 80;
    server_name app.marin.cr;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site and reload NGINX:

```bash
ln -s /etc/nginx/sites-available/app.marin.cr /etc/nginx/sites-enabled/app.marin.cr
nginx -t
systemctl reload nginx
```

### Step 6: Obtain TLS certificates (Let’s Encrypt)

```bash
certbot --nginx -d app.marin.cr
```

This will:
- Obtain the certificate
- Update the NGINX configuration automatically
- Reload NGINX

### Step 7: Verify auto-renewal

```bash
systemctl status certbot.timer --no-pager
certbot renew --dry-run
```

---

## B) Update the Web App (later deployments)

1. **Pull latest changes**:
   ```bash
   cd /var/www/marin2web
   git pull
   ```

2. **Rebuild and restart containers**:
   ```bash
   docker compose up -d --build
   ```

3. **(Optional) Check logs**:
   ```bash
   docker compose logs -f --tail=200
   ```

---

# API Deployment (`https://api2.marin.cr`)

## A) Install the API (initial deployment)

### Step 1: Clone the repository

```bash
cd /var/www/marin2api
git clone --filter=blob:none --sparse https://github.com/marinoscar/MarinApp .
git sparse-checkout set apps/api
```

> Repository URL: https://github.com/marinoscar/MarinApp

### Step 2: Create environment files

Create a **runtime** env file for the API (example file name: `.env.api`). Use `nano` as your editor:

```bash
nano /var/www/marin2api/.env.api
```

Then paste:

```
# API environment configuration (example values only)
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:5000

# Database connection (use your actual DB values)
# Example: Host is the VPS itself; PostgreSQL is installed on the host
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=marin
DB_USER=marin
DB_PASSWORD=CHANGE_ME

# JWT / Auth settings (example placeholders)
JWT_ISSUER=https://api2.marin.cr
JWT_AUDIENCE=https://app.marin.cr
JWT_SIGNING_KEY=CHANGE_ME
```

> Replace placeholders (`CHANGE_ME`) with real values on the server. **Do not commit them to Git.**

### Step 3: Create a Docker Compose file for the API

```bash
nano /var/www/marin2api/docker-compose.yml
```

Then paste:

```
services:
  marin-api:
    image: marin-api:latest
    build:
      context: apps/api
      dockerfile: Dockerfile
    container_name: marin-api
    restart: unless-stopped
    env_file:
      - .env.api
    ports:
      - "127.0.0.1:5000:5000"
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

> If your API listens on a different port, adjust `5000` accordingly.

### Step 4: Build and start the API

```bash
cd /var/www/marin2api
docker compose up -d --build
```

### Step 5: Configure NGINX for the API

Create an NGINX site file:

```bash
nano /etc/nginx/sites-available/api2.marin.cr
```

Then paste:

```
server {
    listen 80;
    server_name api2.marin.cr;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and reload NGINX:

```bash
ln -s /etc/nginx/sites-available/api2.marin.cr /etc/nginx/sites-enabled/api2.marin.cr
nginx -t
systemctl reload nginx
```

### Step 6: Obtain TLS certificates (Let’s Encrypt)

```bash
certbot --nginx -d api2.marin.cr
```

### Step 7: Verify auto-renewal

```bash
systemctl status certbot.timer --no-pager
certbot renew --dry-run
```

---

## B) Update the API (later deployments)

1. **Pull latest changes**:
   ```bash
   cd /var/www/marin2api
   git pull
   ```

2. **Rebuild and restart containers**:
   ```bash
   docker compose up -d --build
   ```

3. **(Optional) Check logs**:
   ```bash
   docker compose logs -f --tail=200
   ```

---

## 3) Common Troubleshooting Commands

```bash
# Show running containers
docker ps

# Inspect container logs
docker compose logs -f --tail=200

# Test NGINX configuration
nginx -t

# Check certificate renewal status
systemctl status certbot.timer --no-pager
```
