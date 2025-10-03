# Callista Email Template Designer - Deployment Guide

## Prerequisites
- VPS server with Docker and Docker Compose installed
- Caddy web server running
- Self-hosted Supabase at `dab.nesterli.co`
- Domain `callista.nesterli.co` pointing to your VPS

## Step 1: Prepare Your Supabase Instance

### 1.1 Database Schema Setup
The migration has already created the `callista` schema and moved your tables. Verify in your Supabase instance:

```sql
-- Verify schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'callista';

-- Verify table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'callista' AND table_name = 'email_templates';
```

### 1.2 Configure Edge Functions
Make sure your Supabase instance has the edge functions deployed:
- `get-template` - Public API endpoint for retrieving templates
- `design-with-ai` - AI-powered design generation

Copy the edge functions to your self-hosted Supabase:
```bash
# On your VPS where Supabase is hosted
cd /path/to/your/supabase/project
cp -r /path/to/callista/supabase/functions/* ./supabase/functions/
supabase functions deploy get-template
supabase functions deploy design-with-ai
```

### 1.3 Set Environment Secrets
In your self-hosted Supabase, set these secrets:
```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key
supabase secrets set LLM_MODEL=google/gemini-2.5-flash
```

## Step 2: Build the Docker Image

### 2.1 Clone/Copy Project to VPS
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Create project directory
mkdir -p /opt/callista
cd /opt/callista

# Copy your project files here
# (use git clone, scp, or rsync)
```

### 2.2 Configure Environment Variables
```bash
# Copy and edit the production environment file
cp .env.production .env

# Edit with your Supabase credentials
nano .env
```

Update the `.env` file with your actual Supabase credentials:
```env
VITE_SUPABASE_URL=https://dab.nesterli.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_actual_anon_key
VITE_SUPABASE_PROJECT_ID=your_actual_project_id
```

### 2.3 Build and Start Docker Container
```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# Verify it's running
docker-compose ps
docker-compose logs -f
```

The app will be running on `http://localhost:3050` inside your VPS.

## Step 3: Configure Caddy

### 3.1 Add Caddy Configuration
```bash
# Edit your Caddy configuration
sudo nano /etc/caddy/Caddyfile
```

Add this configuration (or merge with existing):
```caddyfile
callista.nesterli.co {
    reverse_proxy localhost:3050
    
    encode gzip
    
    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
    }
    
    log {
        output file /var/log/caddy/callista.log
    }
}
```

### 3.2 Reload Caddy
```bash
# Test configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy

# Or if using Caddy directly
sudo caddy reload
```

## Step 4: Test Your Deployment

### 4.1 Test the Main Application
Visit: `https://callista.nesterli.co`

You should see the Email Template Designer interface.

### 4.2 Test the API Endpoint
The public API endpoint to retrieve templates by shortcode:

```bash
# Create a test template first via the UI with api_shortcode "welcome"
# Then test the API:
curl https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome
```

This should return the HTML of the template.

**API Endpoint URL Format:**
```
https://dab.nesterli.co/functions/v1/get-template?shortcode=YOUR_SHORTCODE
```

### 4.3 Test AI Design Generation
1. Open the app
2. Click "Design with AI"
3. Enter a prompt like "Create a welcome email with logo and button"
4. Verify it generates the design

## Step 5: Maintenance Commands

### View Logs
```bash
# Application logs
docker-compose logs -f

# Caddy logs
sudo tail -f /var/log/caddy/callista.log
```

### Restart Application
```bash
cd /opt/callista
docker-compose restart
```

### Update Application
```bash
cd /opt/callista

# Pull latest changes
git pull  # or however you update your code

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Stop Application
```bash
cd /opt/callista
docker-compose down
```

## Security Considerations

1. **CORS**: The `get-template` edge function has CORS enabled (`*`). Consider restricting this in production.

2. **RLS**: The `email_templates` table currently has permissive RLS (`true`). Consider adding proper authentication if needed.

3. **Rate Limiting**: Consider adding rate limiting in Caddy or at the Supabase level.

4. **Backups**: Set up regular backups of your Supabase database:
   ```bash
   # Example backup command
   pg_dump -h localhost -U supabase_admin -d postgres -n callista > backup.sql
   ```

## Troubleshooting

### App not loading
1. Check Docker logs: `docker-compose logs`
2. Verify port 3050 is open: `netstat -tulpn | grep 3050`
3. Check Caddy logs: `sudo journalctl -u caddy -f`

### Database connection issues
1. Verify Supabase URL is correct in `.env`
2. Test Supabase connection: `curl https://dab.nesterli.co/rest/v1/`
3. Check if API keys are correct

### API endpoint not working
1. Verify edge function is deployed in Supabase
2. Check edge function logs in Supabase dashboard
3. Verify `verify_jwt = false` in `supabase/config.toml`

### SSL certificate issues
Caddy automatically handles SSL. If issues occur:
1. Verify DNS is pointing to your VPS: `dig callista.nesterli.co`
2. Check Caddy logs: `sudo journalctl -u caddy`
3. Ensure ports 80 and 443 are open in firewall

## API Usage Examples

### Get Template HTML by Shortcode
```bash
# Using curl
curl https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome

# Using JavaScript fetch
fetch('https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome')
  .then(res => res.text())
  .then(html => console.log(html));
```

### Response Format
The endpoint returns raw HTML (Content-Type: text/html):
```html
<!DOCTYPE html>
<html>
  <head>...</head>
  <body>
    <!-- Your email template HTML -->
  </body>
</html>
```

### Error Responses
- **400**: Missing shortcode parameter (JSON)
- **404**: Template not found (JSON)
- **500**: Server error (JSON)

## Monitoring

Set up basic monitoring:
```bash
# Create monitoring script
cat > /opt/callista/health-check.sh << 'EOF'
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://callista.nesterli.co)
if [ $STATUS -ne 200 ]; then
    echo "App is down! Status: $STATUS"
    # Add notification logic here (email, Slack, etc.)
fi
EOF

chmod +x /opt/callista/health-check.sh

# Add to crontab (check every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/callista/health-check.sh") | crontab -
```

## Support
For issues, check:
1. Docker logs: `docker-compose logs`
2. Caddy logs: `/var/log/caddy/callista.log`
3. Supabase edge function logs in Supabase dashboard
