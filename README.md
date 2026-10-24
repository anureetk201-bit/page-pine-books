# Page & Pine Books

A bookstore web app built with **TanStack Start** (React 19 + SSR), **Vite**, **Tailwind CSS v4**, and **Supabase** (auth + Postgres), with Drizzle for database migrations.

- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Run locally](#run-locally)
- [Deploy on AWS EC2](#deploy-on-aws-ec2)
- [Updating a deployment](#updating-a-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool    | Version              |
| ------- | -------------------- |
| Node.js | 22 LTS or newer (needs `--env-file` support, Node ≥ 20.6) |
| npm     | 10+ (ships with Node) |
| Git     | any recent version   |

A Supabase project (URL + publishable key) is required. The project is connected to Lovable, which already provides one.

---

## Environment variables

Create a `.env` file in the project root:

```env
# Used in the browser (baked into the client bundle at build time)
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-anon-key>
VITE_SUPABASE_PROJECT_ID=<project-id>

# Used by the server at runtime
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-anon-key>
SUPABASE_PROJECT_ID=<project-id>

# Optional – only needed for admin/server-side operations
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Optional – only needed to run Drizzle migrations
LOVABLE_DB_MIGRATION_URL=postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres
```

> Never commit `.env` or the service-role key. `VITE_*` values are public (they ship to the browser); everything else stays on the server.

---

## Run locally

### 1. Clone and install

```bash
git clone <your-repo-url> page-pine-books
cd page-pine-books
npm install
```

### 2. Add the `.env` file

Create `.env` as shown in [Environment variables](#environment-variables).

### 3. Start the dev server (hot reload)

```bash
npm run dev
```

Open <http://localhost:8080>.

### 4. (Optional) Run a production build locally

The default build targets Cloudflare Workers. To build a standalone Node.js server instead, set `NITRO_PRESET=node-server`.

**macOS / Linux / Git Bash:**

```bash
NITRO_PRESET=node-server npm run build
PORT=3000 node --env-file=.env .output/server/index.mjs
```

**Windows PowerShell:**

```powershell
$env:NITRO_PRESET="node-server"; npm run build
$env:PORT="3000"; node --env-file=.env .output/server/index.mjs
```

**Windows cmd:**

```cmd
set NITRO_PRESET=node-server && npm run build
set PORT=3000 && node --env-file=.env .output/server/index.mjs
```

Open <http://localhost:3000>.

### 5. (Optional) Database migrations

Migrations live in [drizzle/migrations](drizzle/migrations). With `LOVABLE_DB_MIGRATION_URL` set in `.env`:

```bash
npx drizzle-kit migrate
```

### Other scripts

```bash
npm run lint      # ESLint
npm run format    # Prettier
```

---

## Deploy on AWS EC2

This deploys the app as a Node.js server managed by **PM2**, behind **Nginx** as a reverse proxy, with optional free HTTPS from **Let's Encrypt**. Commands are for **Ubuntu 24.04 LTS**.

### 1. Launch the instance (AWS Console)

1. **EC2 → Launch instance**
2. **AMI:** Ubuntu Server 24.04 LTS (64-bit x86)
3. **Instance type:** `t3.small` or larger (`t2.micro`/`t3.micro` works but needs swap for the build — see step 3)
4. **Key pair:** create or select one, download the `.pem` file
5. **Network settings → Security group**, allow inbound:

   | Type  | Port | Source              |
   | ----- | ---- | ------------------- |
   | SSH   | 22   | My IP               |
   | HTTP  | 80   | 0.0.0.0/0, ::/0     |
   | HTTPS | 443  | 0.0.0.0/0, ::/0     |

6. **Storage:** 20 GB gp3
7. Launch, then (recommended) **Elastic IPs → Allocate → Associate** with the instance so the public IP doesn't change on restart.

### 2. Connect over SSH

**macOS / Linux / Git Bash:**

```bash
chmod 400 ~/Downloads/my-key.pem
ssh -i ~/Downloads/my-key.pem ubuntu@<EC2_PUBLIC_IP>
```

**Windows PowerShell:**

```powershell
icacls "$env:USERPROFILE\Downloads\my-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"
ssh -i "$env:USERPROFILE\Downloads\my-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

All remaining commands run **on the EC2 instance**.

### 3. Update the system (and add swap on small instances)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

Only on instances with ≤ 1 GB RAM — add 2 GB swap so `npm run build` doesn't run out of memory:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. Install Node.js 22 and PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
sudo npm install -g pm2
```

### 5. Clone the project

```bash
cd ~
git clone <your-repo-url> page-pine-books
cd page-pine-books
```

For a private GitHub repo, use a [personal access token](https://github.com/settings/tokens) as the password, or add an SSH deploy key (`ssh-keygen -t ed25519`, then add `~/.ssh/id_ed25519.pub` under the repo's **Settings → Deploy keys**).

### 6. Create the `.env` file

```bash
nano .env
```

Paste the variables from [Environment variables](#environment-variables), then save (`Ctrl+O`, `Enter`, `Ctrl+X`) and lock it down:

```bash
chmod 600 .env
```

### 7. Install dependencies and build

```bash
npm ci
NITRO_PRESET=node-server npm run build
```

The build output goes to `.output/`. Quick test (stop it with `Ctrl+C`):

```bash
PORT=3000 node --env-file=.env .output/server/index.mjs
```

### 8. Run it with PM2

```bash
PORT=3000 HOST=127.0.0.1 pm2 start .output/server/index.mjs \
  --name page-pine-books \
  --node-args="--env-file=.env"
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

`pm2 startup` prints a `sudo env PATH=...` command — **copy and run it** so the app restarts after a reboot. Then:

```bash
pm2 status
pm2 logs page-pine-books
curl -I http://127.0.0.1:3000
```

### 9. Install and configure Nginx

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/page-pine-books
```

Paste (replace `your-domain.com`, or use `_` if you only have an IP):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it and reload:

```bash
sudo ln -s /etc/nginx/sites-available/page-pine-books /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

The site is now live at `http://<EC2_PUBLIC_IP>`.

### 10. (Optional) Firewall

The security group already restricts traffic; UFW adds a second layer:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

### 11. (Optional) Custom domain + HTTPS

1. At your DNS provider, add an **A record** for `your-domain.com` (and `www`) pointing to the Elastic IP.
2. Wait for DNS to resolve (`dig +short your-domain.com` should return the IP), then:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot renew --dry-run
```

Certbot updates the Nginx config and auto-renews certificates.

3. In **Supabase → Authentication → URL Configuration**, set **Site URL** to `https://your-domain.com` and add it to **Redirect URLs**, so sign-in redirects work.

---

## Updating a deployment

SSH into the instance, then:

```bash
cd ~/page-pine-books
git pull
npm ci
NITRO_PRESET=node-server npm run build
pm2 restart page-pine-books --update-env
pm2 logs page-pine-books --lines 50
```

If you changed `.env`, `pm2 restart` picks it up because the file is re-read on start.

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `502 Bad Gateway` from Nginx | App isn't running: `pm2 status`, `pm2 logs page-pine-books`. Confirm `curl -I http://127.0.0.1:3000` works. |
| `Missing Supabase environment variable(s)` | `.env` is missing values or wasn't loaded — check the `--node-args="--env-file=.env"` flag and that you started PM2 from the project folder. |
| Build killed / `JavaScript heap out of memory` | Add swap (step 3) or build with `NODE_OPTIONS=--max-old-space-size=1536 NITRO_PRESET=node-server npm run build`. |
| `.output/server/index.mjs` exits immediately or mentions `wrangler` | You built without `NITRO_PRESET=node-server` (that produces a Cloudflare Worker). Rebuild with the preset. |
| Site unreachable from browser | Check the security group allows ports 80/443 and `sudo ufw status`. |
| Login redirects to `localhost` | Update Site URL / Redirect URLs in Supabase Auth settings. |
| `--env-file` is not a valid option | Node is too old — install Node 22 (step 4). |

Useful commands:

```bash
pm2 status                         # process list
pm2 logs page-pine-books           # live logs
pm2 restart page-pine-books        # restart
pm2 stop page-pine-books           # stop
sudo systemctl status nginx        # nginx status
sudo tail -f /var/log/nginx/error.log
```
