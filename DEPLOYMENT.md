# Callista Email Template Designer - Complete Deployment Guide

This guide provides step-by-step instructions to deploy the Callista Email Template Designer to your VPS using Docker, Caddy, and self-hosted Supabase.

---

## Prerequisites

Before starting, ensure you have:

- ✅ **VPS Server** with root/sudo access
- ✅ **Docker** and **Docker Compose** installed
- ✅ **Caddy** web server installed and running
- ✅ **Self-hosted Supabase** at `dab.nesterli.co`
- ✅ **Domain** `callista.nesterli.co` with DNS pointing to your VPS IP
- ✅ **Supabase CLI** installed on your VPS
- ✅ **Git** (optional, for cloning the project)

---

## Step 1: Prepare Your VPS

### 1.1 Create Project Directory

SSH into your VPS and create a directory for the application:

```bash
ssh user@your-vps-ip
mkdir -p /opt/callista
cd /opt/callista
```

### 1.2 Transfer Project Files

Copy your project files to the VPS. You can use one of these methods:

**Option A: Git Clone (if you have a repository)**
```bash
git clone https://github.com/yourusername/callista.git .
```

**Option B: SCP from local machine**
```bash
# Run this from your local machine
scp -r /path/to/callista/* user@your-vps-ip:/opt/callista/
```

**Option C: Rsync**
```bash
# Run this from your local machine
rsync -avz /path/to/callista/ user@your-vps-ip:/opt/callista/
```

---

## Step 2: Configure Supabase Database

### 2.1 Apply Database Migrations

The project includes migration files in `supabase/migrations/` that create the database schema.

**Option A: Using Supabase Studio (Web UI)**

1. Open your Supabase instance at `https://dab.nesterli.co`
2. Navigate to **SQL Editor**
3. For each migration file in `supabase/migrations/` (in timestamp order):
   - Open the file
   - Copy its contents
   - Paste into SQL Editor
   - Click **Run**

**Option B: Using psql (Batch Apply)**

```bash
cd /opt/callista

# Apply all migrations in order
for migration in supabase/migrations/*.sql; do
  echo "Applying $migration..."
  psql "postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres" -f "$migration"
done
```

**What these migrations create:**
- Table: `public.email_templates`
  - `id` (UUID, primary key)
  - `name` (text, template name)
  - `api_shortcode` (text, unique shortcode for API access)
  - `html` (text, rendered HTML)
  - `json_template` (jsonb, template structure)
  - `created_at`, `updated_at` (timestamps)
- RLS policies for public access (SELECT, INSERT, UPDATE, DELETE)
- Trigger function `handle_updated_at()` with proper security settings
- Trigger `email_templates_updated_at` on the table

### 2.2 Verify Database Setup

Connect to your Supabase database and verify:

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'email_templates';

-- Check table structure
\d public.email_templates

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'email_templates';
```

Expected output:
- Table `public.email_templates` exists with all columns
- RLS is enabled (`rowsecurity` = true)

---

## Step 3: Deploy Edge Functions to Supabase

### 3.1 Copy Edge Functions

Copy the edge functions from your Callista project to your Supabase functions directory:

```bash
# Navigate to your Supabase installation directory
cd /path/to/your/supabase/installation

# Copy functions
cp -r /opt/callista/supabase/functions/get-template ./supabase/functions/
cp -r /opt/callista/supabase/functions/design-with-ai ./supabase/functions/

# Copy config
cp /opt/callista/supabase/config.toml ./supabase/config.toml
```

### 3.2 Set Supabase Secrets

Set the required secrets for the edge functions:

```bash
cd /path/to/your/supabase/installation

# Set Lovable AI API key (required for AI design generation)
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here

# Set LLM model (optional, defaults to gemini-2.5-flash)
supabase secrets set LLM_MODEL=google/gemini-2.5-flash
```

**Note:** The `LOVABLE_API_KEY` is provided by Lovable. If you don't have one, the AI design feature won't work, but the rest of the app will function normally.

### 3.3 Deploy Edge Functions

Deploy both edge functions:

```bash
cd /path/to/your/supabase/installation

# Deploy get-template function (public API for retrieving templates)
supabase functions deploy get-template

# Deploy design-with-ai function (AI-powered design generation)
supabase functions deploy design-with-ai
```

### 3.4 Verify Edge Functions

Test that the functions are deployed:

```bash
# Test get-template (should return 400 because no shortcode provided)
curl https://dab.nesterli.co/functions/v1/get-template

# Test design-with-ai (should return 400 because no prompt provided)
curl -X POST https://dab.nesterli.co/functions/v1/design-with-ai \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

---

## Step 4: Configure Application Environment

### 4.1 Get Supabase Credentials

You need three values from your self-hosted Supabase:

1. **Supabase URL**: `https://dab.nesterli.co`
2. **Supabase Anon Key**: Find in Supabase Studio → Settings → API → `anon` key
3. **Supabase Project ID**: Find in Supabase Studio → Settings → General → Reference ID

### 4.2 Create Environment File

Copy the production template and edit it:

```bash
cd /opt/callista
cp .env.production .env
nano .env
```

Update the `.env` file with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dab.nesterli.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_actual_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_actual_project_id_here
```

**Important:** Replace `your_actual_anon_key_here` and `your_actual_project_id_here` with the real values from your Supabase instance.

---

## Step 5: Build and Start Docker Container

### 5.1 Build Docker Image

Build the Docker image (this will take a few minutes):

```bash
cd /opt/callista
docker-compose build
```

The build process will:
- Install Node.js dependencies
- Build the React application
- Create an optimized production build
- Set up Nginx to serve the application

### 5.2 Start the Container

Start the application container:

```bash
docker-compose up -d
```

### 5.3 Verify Container is Running

Check the container status:

```bash
# Check if container is running
docker-compose ps

# View container logs
docker-compose logs -f

# Check if app is accessible internally
curl http://localhost:3050
```

Expected output:
- Container status: `Up`
- Logs show: Nginx started successfully
- Curl returns HTML content

---

## Step 6: Configure Caddy Web Server

### 6.1 Edit Caddy Configuration

Open your Caddy configuration file:

```bash
sudo nano /etc/caddy/Caddyfile
```

### 6.2 Add Callista Configuration

Add this configuration to your Caddyfile:

```caddyfile
callista.nesterli.co {
    # Reverse proxy to Docker container
    reverse_proxy localhost:3050
    
    # Enable gzip compression
    encode gzip
    
    # Security headers
    header {
        # HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        # XSS protection
        X-XSS-Protection "1; mode=block"
        # Referrer policy
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    
    # Access logging
    log {
        output file /var/log/caddy/callista.log {
            roll_size 100mb
            roll_keep 10
            roll_keep_for 720h
        }
        format json
    }
}
```

### 6.3 Test Caddy Configuration

Validate the Caddy configuration:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

If valid, you'll see: `Valid configuration`

### 6.4 Reload Caddy

Apply the new configuration:

```bash
# If using systemd
sudo systemctl reload caddy

# Or if running Caddy directly
sudo caddy reload --config /etc/caddy/Caddyfile
```

### 6.5 Check Caddy Status

Verify Caddy is running properly:

```bash
# Check Caddy service status
sudo systemctl status caddy

# View Caddy logs
sudo journalctl -u caddy -f
```

---

## Step 7: Test Your Deployment

### 7.1 Test Main Application

Open your browser and navigate to:

```
https://callista.nesterli.co
```

You should see the Callista Email Template Designer interface.

**Test checklist:**
- [ ] Page loads without errors
- [ ] You can create a new template
- [ ] You can edit template properties
- [ ] You can save a template
- [ ] Templates list displays correctly

### 7.2 Test Public API Endpoint

First, create a test template with an API shortcode:

1. Open `https://callista.nesterli.co`
2. Create a new template
3. Set the **API Shortcode** to `welcome`
4. Save the template

Now test the API:

```bash
# Test getting template by shortcode
curl https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome
```

Expected response: HTML content of your template

### 7.3 Test AI Design Generation

1. Open `https://callista.nesterli.co`
2. Click **"Design with AI"** button
3. Enter a prompt like: `Create a welcome email with a header image and call-to-action button`
4. Click **Generate**
5. Verify the design is generated

**Note:** This requires the `LOVABLE_API_KEY` to be set in Supabase secrets.

### 7.4 Test Error Scenarios

```bash
# Test missing shortcode
curl https://dab.nesterli.co/functions/v1/get-template
# Expected: {"error":"Missing shortcode parameter"}

# Test non-existent shortcode
curl https://dab.nesterli.co/functions/v1/get-template?shortcode=doesnotexist
# Expected: {"error":"Template not found"}
```

---

## Step 8: SSL Certificate Verification

Caddy automatically handles SSL certificates via Let's Encrypt.

### 8.1 Wait for Certificate Issuance

It may take 1-2 minutes for Caddy to obtain the certificate. Monitor the logs:

```bash
sudo journalctl -u caddy -f | grep certificate
```

### 8.2 Verify SSL Certificate

Check that SSL is working:

```bash
# Check SSL certificate
curl -I https://callista.nesterli.co

# Or use OpenSSL
openssl s_client -connect callista.nesterli.co:443 -servername callista.nesterli.co
```

### 8.3 Common SSL Issues

**Issue: Certificate not issued**

Check:
1. DNS is correctly pointing to your VPS
2. Ports 80 and 443 are open
3. No other service is using port 80/443

```bash
# Check DNS
dig callista.nesterli.co

# Check ports
sudo netstat -tulpn | grep -E ':(80|443)'

# Check firewall
sudo ufw status
```

---

## Maintenance and Operations

### View Application Logs

```bash
# Docker container logs
cd /opt/callista
docker-compose logs -f

# Caddy access logs
sudo tail -f /var/log/caddy/callista.log

# Caddy error logs
sudo journalctl -u caddy -f
```

### Restart Application

```bash
cd /opt/callista
docker-compose restart
```

### Stop Application

```bash
cd /opt/callista
docker-compose down
```

### Update Application

When you have new code changes:

```bash
cd /opt/callista

# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Database Backup

Regular backups are crucial:

```bash
# Create backup directory
mkdir -p /opt/backups/callista

# Backup callista schema
pg_dump -h localhost -U supabase_admin -d postgres \
  -n callista \
  -f /opt/backups/callista/backup_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip /opt/backups/callista/backup_*.sql
```

### Restore from Backup

```bash
# Uncompress backup
gunzip /opt/backups/callista/backup_YYYYMMDD_HHMMSS.sql.gz

# Restore
psql -h localhost -U supabase_admin -d postgres \
  -f /opt/backups/callista/backup_YYYYMMDD_HHMMSS.sql
```

### Monitor Disk Usage

```bash
# Check Docker disk usage
docker system df

# Clean up unused images
docker system prune -a

# Check logs disk usage
du -sh /var/log/caddy/
```

---

## API Documentation

### Public Template Retrieval Endpoint

**Endpoint:** `GET https://dab.nesterli.co/functions/v1/get-template`

**Query Parameters:**
- `shortcode` (required): The API shortcode of the template

**Response:**
- **Success (200)**: Returns HTML content with `Content-Type: text/html`
- **Error (400)**: `{"error":"Missing shortcode parameter"}`
- **Error (404)**: `{"error":"Template not found"}`
- **Error (500)**: `{"error":"Failed to fetch template"}`

**Example Usage:**

```bash
# cURL
curl "https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome"

# JavaScript
fetch('https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome')
  .then(res => res.text())
  .then(html => console.log(html));

# Python
import requests
response = requests.get('https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome')
html = response.text

# PHP
$html = file_get_contents('https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome');

# Use in email
$to = 'user@example.com';
$subject = 'Welcome!';
$message = file_get_contents('https://dab.nesterli.co/functions/v1/get-template?shortcode=welcome');
$headers = 'Content-Type: text/html; charset=UTF-8';
mail($to, $subject, $message, $headers);
```

---

## Security Considerations

### 1. CORS Configuration

The `get-template` edge function has CORS enabled with `Access-Control-Allow-Origin: *`. 

**For production, consider restricting CORS:**

Edit `supabase/functions/get-template/index.ts`:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Restrict to your domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### 2. Row Level Security (RLS)

The `email_templates` table currently has permissive RLS policies (`true` for all operations).

**To add authentication:**

```sql
-- Update policies to require authentication
DROP POLICY "Anyone can select email_templates" ON callista.email_templates;
DROP POLICY "Anyone can insert email_templates" ON callista.email_templates;
DROP POLICY "Anyone can update email_templates" ON callista.email_templates;
DROP POLICY "Anyone can delete email_templates" ON callista.email_templates;

-- Create user-specific policies
CREATE POLICY "Users can view their own templates" 
ON callista.email_templates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON callista.email_templates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON callista.email_templates FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON callista.email_templates FOR DELETE 
USING (auth.uid() = user_id);

-- Add user_id column if not exists
ALTER TABLE callista.email_templates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
```

### 3. Rate Limiting

Consider adding rate limiting to prevent abuse:

**Option A: Caddy Rate Limiting**

Add to your Caddyfile:

```caddyfile
callista.nesterli.co {
    # Rate limit: 100 requests per minute per IP
    rate_limit {
        zone callista {
            key {remote_host}
            events 100
            window 1m
        }
    }
    
    reverse_proxy localhost:3050
}
```

**Option B: Supabase Edge Function Rate Limiting**

Use Supabase's built-in rate limiting in the edge function.

### 4. Environment Variables Security

Ensure `.env` file has proper permissions:

```bash
cd /opt/callista
chmod 600 .env
chown root:root .env
```

### 5. Firewall Configuration

Ensure only necessary ports are open:

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

## Troubleshooting

### Application Not Loading

**Check Docker container:**
```bash
docker-compose ps
docker-compose logs
```

**Common fixes:**
```bash
# Restart container
docker-compose restart

# Rebuild if code changed
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Connection Issues

**Check Supabase URL and credentials:**
```bash
# Test Supabase connection
curl https://dab.nesterli.co/rest/v1/

# Check environment variables
cat /opt/callista/.env
```

**Verify database:**
```bash
psql -h localhost -U supabase_admin -d postgres -c "SELECT * FROM callista.email_templates LIMIT 1;"
```

### Edge Functions Not Working

**Check function deployment:**
```bash
cd /path/to/supabase
supabase functions list
```

**View function logs:**
Check Supabase Studio → Edge Functions → Logs

**Redeploy functions:**
```bash
supabase functions deploy get-template
supabase functions deploy design-with-ai
```

### SSL Certificate Issues

**Check DNS:**
```bash
dig callista.nesterli.co +short
# Should return your VPS IP
```

**Check Caddy logs:**
```bash
sudo journalctl -u caddy -n 100
```

**Force certificate renewal:**
```bash
sudo systemctl restart caddy
```

### Port Conflicts

**Check what's using ports:**
```bash
sudo netstat -tulpn | grep -E ':(3050|80|443)'
```

**If port 3050 is in use:**
```bash
# Stop conflicting service
sudo systemctl stop <service-name>

# Or change port in docker-compose.yml
nano /opt/callista/docker-compose.yml
# Change ports: "3050:80" to "3051:80"
# Update Caddyfile accordingly
```

---

## Performance Optimization

### Enable Caching

Add caching headers in Caddyfile:

```caddyfile
callista.nesterli.co {
    reverse_proxy localhost:3050
    
    # Cache static assets
    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"
    
    encode gzip
}
```

### Docker Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  callista-email-designer:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Database Indexing

Add indexes for better performance:

```sql
-- Index on api_shortcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_api_shortcode 
ON callista.email_templates(api_shortcode);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_email_templates_created_at 
ON callista.email_templates(created_at DESC);
```

---

## Monitoring Setup

### Health Check Script

Create a monitoring script:

```bash
sudo nano /opt/callista/health-check.sh
```

```bash
#!/bin/bash

# Health check script for Callista
APP_URL="https://callista.nesterli.co"
LOG_FILE="/var/log/callista-health.log"

# Check if app is responding
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")

if [ "$STATUS" -ne 200 ]; then
    echo "$(date): App is down! Status: $STATUS" >> "$LOG_FILE"
    
    # Attempt to restart
    cd /opt/callista
    docker-compose restart
    
    # Send notification (add your notification method here)
    # Example: curl -X POST https://hooks.slack.com/... 
else
    echo "$(date): App is healthy" >> "$LOG_FILE"
fi
```

Make it executable and add to crontab:

```bash
sudo chmod +x /opt/callista/health-check.sh

# Run every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/callista/health-check.sh") | crontab -
```

### Log Rotation

Configure log rotation:

```bash
sudo nano /etc/logrotate.d/callista
```

```
/var/log/caddy/callista.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 caddy caddy
    sharedscripts
    postrotate
        systemctl reload caddy > /dev/null 2>&1 || true
    endscript
}
```

---

## Appendix: File Structure

```
/opt/callista/
├── .env                          # Environment variables (created from .env.production)
├── .env.production               # Production environment template
├── Dockerfile                    # Docker build instructions
├── docker-compose.yml            # Docker Compose configuration
├── Caddyfile.example             # Example Caddy configuration
├── nginx.conf                    # Nginx configuration for Docker
├── DEPLOYMENT.md                 # This file
├── QUICK-DEPLOY.md               # Quick reference guide
├── src/                          # React application source
├── public/                       # Public assets
└── supabase/
    ├── config.toml               # Supabase configuration
    ├── functions/
    │   ├── get-template/         # Public API endpoint
    │   │   └── index.ts
    │   └── design-with-ai/       # AI design generation
    │       └── index.ts
    └── migrations/               # Database migrations
        └── 20251003183843_*.sql
```

---

## Support and Resources

### Documentation
- **Supabase Docs**: https://supabase.com/docs
- **Caddy Docs**: https://caddyserver.com/docs
- **Docker Docs**: https://docs.docker.com

### Logs Location
- **Application Logs**: `docker-compose logs`
- **Caddy Logs**: `/var/log/caddy/callista.log`
- **Caddy Service Logs**: `sudo journalctl -u caddy`
- **Health Check Logs**: `/var/log/callista-health.log`

### Common Commands Quick Reference

```bash
# Application Management
docker-compose up -d              # Start application
docker-compose down               # Stop application
docker-compose restart            # Restart application
docker-compose logs -f            # View logs
docker-compose ps                 # Check status
docker-compose build              # Rebuild image

# Caddy Management
sudo systemctl status caddy       # Check Caddy status
sudo systemctl reload caddy       # Reload Caddy config
sudo systemctl restart caddy      # Restart Caddy
sudo journalctl -u caddy -f       # View Caddy logs

# Supabase Management
supabase functions deploy         # Deploy all functions
supabase functions deploy <name>  # Deploy specific function
supabase secrets set KEY=value    # Set secret
supabase secrets list             # List secrets
supabase db push                  # Run migrations

# Database Management
psql -h localhost -U supabase_admin -d postgres  # Connect to database
pg_dump ... > backup.sql          # Backup database
psql ... < backup.sql             # Restore database
```

---

## Changelog

### Version 1.0.0 (2025-10-03)
- Initial deployment guide
- Docker containerization
- Caddy reverse proxy setup
- Self-hosted Supabase integration
- Public API endpoint for template retrieval
- AI-powered design generation

---

**End of Deployment Guide**

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
