# Quick Deployment Guide - Callista Email Designer

⚡ **Quick Reference** - For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Prerequisites Checklist
- [ ] VPS with Docker and Docker Compose installed
- [ ] Caddy web server running
- [ ] Self-hosted Supabase at `dab.nesterli.co`
- [ ] Domain `callista.nesterli.co` DNS pointing to VPS
- [ ] Supabase CLI installed
- [ ] Project files on VPS

---

## Deployment Steps (Sequential)

### 1️⃣ Setup Database (5 mins)

```bash
# Copy migration SQL to your Supabase
# Run via Supabase Studio SQL Editor or:
psql "postgresql://postgres:PASSWORD@localhost:5432/postgres" \
  -f supabase/migrations/20251003183843_*.sql

# Verify
psql ... -c "SELECT * FROM callista.email_templates LIMIT 1;"
```

---

### 2️⃣ Deploy Edge Functions (5 mins)

```bash
# Navigate to Supabase installation
cd /path/to/your/supabase/installation

# Copy functions
cp -r /opt/callista/supabase/functions/get-template ./supabase/functions/
cp -r /opt/callista/supabase/functions/design-with-ai ./supabase/functions/

# Set secrets
supabase secrets set LOVABLE_API_KEY=your_key_here
supabase secrets set LLM_MODEL=google/gemini-2.5-flash

# Deploy
supabase functions deploy get-template
supabase functions deploy design-with-ai

# Verify
curl https://dab.nesterli.co/functions/v1/get-template
```

---

### 3️⃣ Configure Application (2 mins)

```bash
cd /opt/callista

# Create .env file
cp .env.production .env
nano .env
```

Update these values in `.env`:
```env
VITE_SUPABASE_URL=https://dab.nesterli.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_from_supabase
VITE_SUPABASE_PROJECT_ID=your_project_id_from_supabase
```

---

### 4️⃣ Build & Start Docker (5 mins)

```bash
cd /opt/callista

# Build
docker-compose build

# Start
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f
curl http://localhost:3050  # Should return HTML
```

---

### 5️⃣ Configure Caddy (2 mins)

```bash
sudo nano /etc/caddy/Caddyfile
```

Add:
```caddyfile
callista.nesterli.co {
    reverse_proxy localhost:3050
    encode gzip
    
    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
    
    log {
        output file /var/log/caddy/callista.log
    }
}
```

Reload:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

---

### 6️⃣ Test Everything (5 mins)

**Test main app:**
```bash
curl -I https://callista.nesterli.co
# Should return 200 OK
```

**Test in browser:**
- Visit `https://callista.nesterli.co`
- Create a template with api_shortcode `test`
- Save it

**Test API:**
```bash
curl "https://dab.nesterli.co/functions/v1/get-template?shortcode=test"
# Should return HTML
```

**Test AI (optional):**
- Click "Design with AI"
- Enter prompt: "Create a welcome email"
- Verify it generates

---

## 📋 Complete Commands Copy-Paste

```bash
# === 1. Database ===
# Run in Supabase Studio SQL Editor or via psql
# Copy contents of: supabase/migrations/20251003183843_*.sql

# === 2. Edge Functions ===
cd /path/to/supabase
cp -r /opt/callista/supabase/functions/* ./supabase/functions/
supabase secrets set LOVABLE_API_KEY=your_key
supabase secrets set LLM_MODEL=google/gemini-2.5-flash
supabase functions deploy get-template
supabase functions deploy design-with-ai

# === 3. Application ===
cd /opt/callista
cp .env.production .env
nano .env  # Edit with your Supabase credentials
docker-compose build
docker-compose up -d

# === 4. Caddy ===
sudo nano /etc/caddy/Caddyfile  # Add config above
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

# === 5. Test ===
curl -I https://callista.nesterli.co
curl "https://dab.nesterli.co/functions/v1/get-template?shortcode=test"
```

---

## 📌 Key Information

### URLs
- **App**: https://callista.nesterli.co
- **API**: https://dab.nesterli.co/functions/v1/get-template?shortcode=SHORTCODE
- **Supabase**: https://dab.nesterli.co

### Ports
- **App (internal)**: 3050
- **Caddy**: 80, 443

### Directories
- **App**: `/opt/callista`
- **Supabase**: `/path/to/your/supabase/installation`
- **Logs**: `/var/log/caddy/callista.log`

### Files
- **Env**: `/opt/callista/.env`
- **Caddy Config**: `/etc/caddy/Caddyfile`
- **Docker Config**: `/opt/callista/docker-compose.yml`

---

## 🔧 Common Operations

### View Logs
```bash
# App logs
cd /opt/callista && docker-compose logs -f

# Caddy logs
sudo tail -f /var/log/caddy/callista.log
sudo journalctl -u caddy -f
```

### Restart Services
```bash
# Restart app
cd /opt/callista && docker-compose restart

# Restart Caddy
sudo systemctl restart caddy
```

### Update Code
```bash
cd /opt/callista
git pull  # or copy new files
docker-compose down
docker-compose build
docker-compose up -d
```

### Stop Services
```bash
# Stop app
cd /opt/callista && docker-compose down

# Stop Caddy (not recommended)
sudo systemctl stop caddy
```

---

## 🆘 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| App won't start | `docker-compose logs` - check for errors |
| Port 3050 in use | `docker-compose down` then `docker-compose up -d` |
| Can't access app | Check DNS: `dig callista.nesterli.co +short` |
| SSL not working | Wait 2 mins, check: `sudo journalctl -u caddy -f` |
| API returns 404 | Verify edge function: `supabase functions list` |
| DB connection error | Check `.env` has correct credentials |
| Docker build fails | Clear cache: `docker system prune -a` then rebuild |

---

## 💡 Pro Tips

1. **Monitor health**: Set up cron job for health checks (see DEPLOYMENT.md)
2. **Backup database**: Schedule daily backups with pg_dump
3. **Log rotation**: Configure logrotate for Caddy logs
4. **Resource limits**: Add Docker resource limits for stability
5. **Security**: Review RLS policies before production use

---

## 📚 Resources

- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Supabase Docs**: https://supabase.com/docs
- **Caddy Docs**: https://caddyserver.com/docs
- **Docker Docs**: https://docs.docker.com

---

## ✅ Post-Deployment Checklist

- [ ] App loads at https://callista.nesterli.co
- [ ] SSL certificate is valid (check with browser)
- [ ] Can create and save templates
- [ ] API returns HTML: `curl "https://dab.nesterli.co/functions/v1/get-template?shortcode=test"`
- [ ] AI design generation works (if LOVABLE_API_KEY set)
- [ ] Docker container is running: `docker-compose ps`
- [ ] Caddy is running: `sudo systemctl status caddy`
- [ ] Logs are accessible: `docker-compose logs` and `sudo tail -f /var/log/caddy/callista.log`
- [ ] Database has `callista` schema: Check in Supabase Studio
- [ ] Edge functions are deployed: `supabase functions list`

---

**Total Time: ~25 minutes** ⏱️

For detailed explanations, security hardening, monitoring setup, and advanced configuration, see [DEPLOYMENT.md](./DEPLOYMENT.md)
