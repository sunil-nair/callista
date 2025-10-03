# Quick Deployment Guide - Callista Email Designer

## 🚀 Fast Track Deployment

### 1. Prerequisites Check
- ✅ VPS with Docker installed
- ✅ Caddy running
- ✅ Supabase at `dab.nesterli.co`
- ✅ Domain `callista.nesterli.co` DNS pointing to VPS

### 2. Database Setup (Already Done!)
✅ Migration completed - `callista` schema created
✅ Tables moved to callista schema
✅ RLS policies configured

### 3. Quick Deploy Commands

```bash
# SSH to VPS
ssh user@your-vps

# Clone/copy project
mkdir -p /opt/callista && cd /opt/callista
# Copy your project files here

# Configure environment
cp .env.production .env
nano .env  # Add your Supabase credentials

# Build and start
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### 4. Configure Caddy

Add to `/etc/caddy/Caddyfile`:
```caddyfile
callista.nesterli.co {
    reverse_proxy localhost:3050
    encode gzip
}
```

Then reload:
```bash
sudo caddy reload
```

### 5. Test

Visit: `https://callista.nesterli.co`

API Test:
```bash
curl "https://dab.nesterli.co/functions/v1/get-template?shortcode=YOUR_SHORTCODE"
```

## 📌 Key Information

### Application
- **URL**: https://callista.nesterli.co
- **Port**: 3050 (internal)
- **Container**: callista-email-designer

### Database
- **Schema**: callista
- **Table**: email_templates
- **Supabase URL**: https://dab.nesterli.co

### API Endpoint
- **URL**: https://dab.nesterli.co/functions/v1/get-template
- **Method**: GET
- **Param**: shortcode (required)
- **Returns**: HTML (text/html)
- **Public**: Yes (no auth required)

### Example API Usage
```javascript
// Fetch template HTML
const html = await fetch(
  'https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome'
).then(r => r.text());

// Use in email
sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: html
});
```

## 🔧 Common Tasks

### View logs
```bash
docker-compose logs -f
```

### Restart
```bash
docker-compose restart
```

### Update code
```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Stop
```bash
docker-compose down
```

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| App not loading | Check `docker-compose logs` |
| API 404 | Verify edge function deployed in Supabase |
| Database error | Check `.env` has correct Supabase credentials |
| SSL issues | Caddy auto-handles SSL, wait 2 minutes |

## 📝 Notes

- TypeScript warnings about callista schema are expected (handled with helper function)
- Edge functions must be deployed to your Supabase instance
- Set `LOVABLE_API_KEY` secret in Supabase for AI features
- API endpoint is public (no auth) - add rate limiting if needed

For detailed instructions, see `DEPLOYMENT.md`
