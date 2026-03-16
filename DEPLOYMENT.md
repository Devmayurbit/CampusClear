# Deployment Guide

## Local Development Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd CampusClear
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start Development Server
```bash
npm run dev
```

The application will run on:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## Production Deployment

### Option 1: Deploy on Heroku

#### 1. Create Heroku App
```bash
heroku create your-app-name
heroku addons:create mongolab:sandbox
```

#### 2. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
```

#### 3. Deploy
```bash
git push heroku main
```

### Option 2: Deploy on AWS EC2

#### 1. Launch EC2 Instance
- Ubuntu 20.04 LTS
- t2.small or larger
- Security group: Allow ports 80, 443, 3000

#### 2. Install Dependencies
```bash
ssh -i key.pem ubuntu@your-instance-ip

sudo apt update
sudo apt install nodejs npm git

node --version  # Should be >= 16
```

#### 3. Clone & Setup
```bash
git clone <repo-url>
cd CampusClear
npm install

# Create .env
nano .env
# Add your production values
```

#### 4. Use PM2 for Process Management
```bash
sudo npm install -g pm2

pm2 start "npm run start" --name "cdgi-nodues"
pm2 startup
pm2 save
```

#### 5. Setup Nginx Reverse Proxy
```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/default
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

#### 6. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx

sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Option 3: Deploy on DigitalOcean

#### 1. Create App Platform
```bash
# Via DigitalOcean dashboard
# Choose Node.js runtime
# Connect GitHub repo
```

#### 2. Set Environment Variables
```
NODE_ENV: production
MONGO_URL: your-mongodb-uri
JWT_SECRET: your-production-secret
EMAIL_USER: your-email@gmail.com
EMAIL_PASS: your-app-password
FRONTEND_URL: https://your-domain.com
```

#### 3. Deploy
Push to main branch → Automatic deployment

### Option 4: Deploy with Docker

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGO_URL=${MONGO_URL}
      - JWT_SECRET=${JWT_SECRET}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASS=${EMAIL_PASS}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: always
```

#### 3. Deploy to Docker Hub or Registry
```bash
docker build -t your-registry/cdgi-nodues:latest .
docker push your-registry/cdgi-nodues:latest
```

---

## Database Setup

### MongoDB Atlas (Recommended)

#### 1. Create Account
- Go to mongodb.com
- Sign up for free tier
- Create organization and project

#### 2. Create Cluster
- Select cloud provider (AWS recommended)
- Choose region closest to users
- Create M0 (free) or larger cluster

#### 3. Get Connection String
- Click "Connect" button
- Choose "Connect your application"
- Copy connection string
- Add to .env as MONGO_URL

#### 4. Configure IP Whitelist
- Network Access → IP Whitelist
- Add your server's IP
- Or use 0.0.0.0/0 for development only

#### 5. Create Database User
- Database Access → Add Database User
- Use strong password
- Add to connection string

---

## Email Configuration

### Gmail Setup (Recommended)

#### 1. Enable 2-Factor Authentication
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification

#### 2. Generate App Password
- Security → App passwords
- Select "Mail" and "Windows Computer"
- Generate password
- Copy 16-character password

#### 3. Add to .env
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```

#### Note: Don't use your regular Gmail password!

---

## Monitoring & Maintenance

### Health Checks
```bash
curl http://localhost:3000/api/v1/health
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs

# Heroku logs
heroku logs --tail

# EC2/DigitalOcean
tail -f /var/log/syslog
```

### Database Backup
```bash
# MongoDB Atlas - Automatic backups (check dashboard)

# Manual backup
mongodump --uri="your-mongodb-uri"
```

### Performance Monitoring
- Use New Relic, DataDog, or Splunk
- Monitor: Response times, Error rates, Database queries
- Set up alerts for critical issues

---

## Security Checklist

- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS/SSL on production
- [ ] Whitelist MongoDB IP addresses
- [ ] Use environment variables for secrets
- [ ] Enable CORS for frontend domain only
- [ ] Set secure cookies (httpOnly, secure flags)
- [ ] Implement rate limiting
- [ ] Regular security updates (npm audit fix)
- [ ] Enable MongoDB authentication
- [ ] Use application-level encryption if needed

---

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error
- Check MONGO_URL format
- Verify IP whitelist
- Check username/password
- Ensure database exists

### Email Not Sending
- Verify EMAIL_PASS is App Password, not Gmail password
- Check spam folder
- Review server logs
- Test with curl: `npm run test:email`

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, Nginx)
- Sessions should use shared storage
- Database connection pooling

### Vertical Scaling
- Increase server RAM for larger databases
- Use CDN for static assets
- Optimize database indexes

### Performance Optimization
- Enable gzip compression
- Implement caching (Redis)
- Optimize API response times
- Monitor slow queries

---

## Continuous Integration/Deployment

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
      - name: Deploy
        run: |
          # Your deployment commands
```

---

## Cost Optimization

### MongoDB Atlas
- Use shared tier for development
- Upgrade to dedicated for production
- Enable auto-scaling

### Hosting
- Heroku: $0 (free tier) → $7+/month (production)
- DigitalOcean: $5/month (basic)
- AWS EC2: $10-30/month (depending on size)

### Email
- Gmail: Free (up to 500 emails/day)
- SendGrid: Free (100 emails/day) → $20+/month

---

## Support & Resources

- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Heroku Docs: https://devcenter.heroku.com

---

**Last Updated**: January 2024
**Status**: Production Ready
