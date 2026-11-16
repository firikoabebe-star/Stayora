# Stayora Production Deployment Guide

This guide covers the complete deployment process for the Stayora application in a production environment.

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended) or Windows Server 2019+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD
- **CPU**: 2+ cores recommended
- **Network**: Stable internet connection with public IP

### Required Software
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Git**: For code deployment
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

## Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/stayora.git
cd stayora

# Copy environment template
cp .env.production.example .env.production

# Edit environment variables
nano .env.production  # or use your preferred editor
```

### 2. Configure Environment
Update `.env.production` with your production values:

**Critical Settings:**
- `POSTGRES_PASSWORD`: Strong database password
- `JWT_SECRET` & `JWT_REFRESH_SECRET`: Generate with `openssl rand -base64 32`
- `CLOUDINARY_*`: Your Cloudinary credentials for image uploads
- `STRIPE_*`: Your Stripe keys for payments
- Domain URLs for your production environment

### 3. Deploy

**Linux/macOS:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy
```

**Windows:**
```powershell
.\scripts\deploy.ps1 deploy
```

### 4. Verify Deployment
```bash
# Check service health
./scripts/deploy.sh health

# View logs
./scripts/deploy.sh logs
```

## Detailed Configuration

### SSL/HTTPS Setup

#### Option 1: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option 2: Custom Certificate
Place your certificate files in `nginx/ssl/`:
- `cert.pem`: Your SSL certificate
- `private.key`: Your private key

### Database Configuration

#### Initial Setup
The database is automatically initialized with the required schema. For custom configurations:

```bash
# Access database container
docker exec -it stayora-postgres-prod psql -U stayora_user stayora_prod

# Run custom SQL
\i /path/to/your/script.sql
```

#### Backup Strategy
Automated backups are created before each deployment. Manual backup:

```bash
# Create backup
./scripts/deploy.sh backup

# Restore from backup (if needed)
./scripts/deploy.sh rollback
```

### Monitoring Setup

#### Grafana Dashboard
1. Access Grafana at `http://your-domain:3001`
2. Login with admin credentials from `.env.production`
3. Import pre-configured dashboards from `monitoring/grafana/dashboards/`

#### Prometheus Metrics
- Application metrics: `http://your-domain:9090`
- Custom metrics endpoint: `http://your-domain:5000/metrics`

### Performance Optimization

#### Nginx Configuration
The included `nginx/nginx.conf` is optimized for production with:
- Gzip compression
- Static file caching
- Rate limiting
- Security headers

#### Database Optimization
```sql
-- Recommended PostgreSQL settings for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

## Maintenance

### Regular Tasks

#### Daily
- Monitor application logs
- Check disk space usage
- Verify backup completion

#### Weekly
- Update Docker images
- Review security logs
- Performance analysis

#### Monthly
- Security updates
- Database maintenance
- Backup verification

### Commands Reference

```bash
# Deployment
./scripts/deploy.sh deploy          # Full deployment
./scripts/deploy.sh health          # Health check
./scripts/deploy.sh logs            # View logs
./scripts/deploy.sh backup          # Create backup
./scripts/deploy.sh rollback        # Rollback deployment
./scripts/deploy.sh cleanup         # Clean old resources

# Docker Management
docker-compose -f docker-compose.prod.yml ps     # List containers
docker-compose -f docker-compose.prod.yml logs   # View logs
docker-compose -f docker-compose.prod.yml exec backend bash  # Access backend

# Database Operations
docker exec -it stayora-postgres-prod psql -U stayora_user stayora_prod
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart [service-name]
```

#### 2. Database Connection Issues
```bash
# Verify database is running
docker exec stayora-postgres-prod pg_isready -U stayora_user

# Check connection from backend
docker exec stayora-backend-prod npm run db:test
```

#### 3. SSL Certificate Issues
```bash
# Test certificate
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt
sudo certbot renew --dry-run
```

#### 4. Performance Issues
```bash
# Monitor resources
docker stats
htop

# Check application metrics
curl http://localhost:5000/metrics
```

### Log Locations
- Application logs: `./logs/`
- Nginx logs: `./nginx/logs/`
- Container logs: `docker-compose logs`

## Security Considerations

### Network Security
- Use firewall to restrict access to necessary ports only
- Enable fail2ban for SSH protection
- Regular security updates

### Application Security
- Strong passwords for all services
- Regular JWT secret rotation
- Input validation and sanitization
- Rate limiting enabled

### Data Protection
- Encrypted database connections
- Secure file upload handling
- Regular security audits
- GDPR compliance measures

## Scaling

### Horizontal Scaling
For high-traffic scenarios:

1. **Load Balancer**: Add multiple frontend instances
2. **Database**: Consider read replicas
3. **Redis Cluster**: For session management
4. **CDN**: For static assets

### Vertical Scaling
- Increase container resource limits
- Optimize database configuration
- Enable Redis persistence

## Support

### Getting Help
- Check logs first: `./scripts/deploy.sh logs`
- Review this documentation
- Check GitHub issues
- Contact support team

### Reporting Issues
When reporting issues, include:
- Error logs
- System information
- Steps to reproduce
- Environment configuration (without secrets)

## Updates

### Application Updates
```bash
# Pull latest code
git pull origin main

# Deploy updates
./scripts/deploy.sh deploy
```

### Security Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
./scripts/deploy.sh deploy
```

---

**Note**: Always test deployments in a staging environment before production deployment.