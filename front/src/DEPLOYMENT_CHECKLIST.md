# Deployment Checklist

## Frontend (React) Setup

### 1. Environment Configuration

- [ ] Create `.env` file in React app root:
  ```bash
  REACT_APP_API_URL=https://your-api-domain.com/api
  ```

- [ ] Update `/lib/apiConfig.ts`:
  ```typescript
  export const API_CONFIG = {
    USE_MOCK_DATA: false,  // ← Set to false
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    // ...
  };
  ```

### 2. Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to your hosting provider
# (Vercel, Netlify, AWS S3 + CloudFront, etc.)
```

---

## Backend (Django) Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt:**
```
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
Pillow>=10.0
psycopg2-binary>=2.9  # For PostgreSQL
gunicorn>=21.0  # For production
python-decouple>=3.8  # For environment variables
```

### 2. Environment Variables

Create `.env` file in Django root:
```bash
# Security
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Media Storage (if using AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Email (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password
```

### 3. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create initial data (services, addons)
python manage.py loaddata initial_data.json
```

### 4. Static & Media Files

**For development:**
```python
# settings.py
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

**For production (with AWS S3):**
```python
# settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
```

### 5. Security Settings

```python
# settings.py

# Production security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
CORS_ALLOW_CREDENTIALS = True

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### 6. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

---

## Testing

### Backend Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test your_app
```

### Frontend Tests

```bash
# Run tests
npm test

# Test API integration
npm run test:integration
```

### Manual Testing Checklist

- [ ] User registration (broker)
- [ ] User registration (photographer)
- [ ] User login
- [ ] User logout
- [ ] Create property
- [ ] Edit property
- [ ] Delete property
- [ ] Create job with services
- [ ] Photographer views jobs
- [ ] Upload media files
- [ ] Create invoice
- [ ] View invoice
- [ ] Update order status
- [ ] Public property landing page

---

## Production Deployment

### Option 1: AWS (Recommended)

**Frontend (S3 + CloudFront):**
1. Create S3 bucket
2. Upload build files
3. Configure CloudFront distribution
4. Point domain to CloudFront

**Backend (EC2 + RDS):**
1. Launch EC2 instance
2. Create RDS PostgreSQL database
3. Install dependencies
4. Configure Nginx
5. Set up Gunicorn
6. Configure SSL with Let's Encrypt
7. Set up environment variables

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /media/ {
        alias /path/to/media/;
    }

    location /static/ {
        alias /path/to/static/;
    }
}
```

**Gunicorn Service:**
```ini
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/path/to/project
ExecStart=/path/to/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    project.wsgi:application

[Install]
WantedBy=multi-user.target
```

### Option 2: Heroku

**Frontend:**
```bash
# Install Heroku CLI
# Deploy to Heroku or use Vercel/Netlify instead
```

**Backend:**
```bash
# Install Heroku CLI
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SECRET_KEY=your-secret-key
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

**Procfile:**
```
web: gunicorn project.wsgi --log-file -
release: python manage.py migrate
```

### Option 3: DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

---

## Monitoring & Logging

### Django Logging

```python
# settings.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### Monitoring Tools

- [ ] Set up Sentry for error tracking
- [ ] Configure CloudWatch (AWS) or similar
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure database backups

---

## Performance Optimization

### Frontend

- [ ] Enable compression (gzip/brotli)
- [ ] Optimize images
- [ ] Lazy load components
- [ ] Code splitting
- [ ] CDN for static assets

### Backend

- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching (Redis)
- [ ] API response compression
- [ ] Connection pooling

---

## Post-Deployment

### 1. SSL Certificate
```bash
# Using Let's Encrypt
sudo certbot --nginx -d api.your-domain.com
```

### 2. Database Backups
```bash
# PostgreSQL backup script
pg_dump dbname > backup.sql

# Restore
psql dbname < backup.sql
```

### 3. Monitoring Setup
- Set up error alerts
- Configure performance monitoring
- Set up log aggregation

### 4. Documentation
- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Create runbooks for common issues

---

## Rollback Plan

1. Keep previous build artifacts
2. Database migration rollback plan:
   ```bash
   python manage.py migrate app_name migration_name
   ```
3. Quick revert to previous deployment
4. Communication plan for downtime

---

## Final Checks

- [ ] All environment variables set
- [ ] SSL certificates installed
- [ ] CORS configured correctly
- [ ] Database backups automated
- [ ] Error monitoring active
- [ ] Health check endpoints working
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] DNS configured
- [ ] CDN configured
- [ ] Email service configured
- [ ] Payment processing tested (if applicable)

---

## Support & Maintenance

### Regular Tasks

- Weekly: Review error logs
- Monthly: Security updates
- Quarterly: Performance review
- As needed: Scale resources

### Emergency Contacts

- Infrastructure: [Contact info]
- Database: [Contact info]
- Security: [Contact info]

---

## Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [AWS Best Practices](https://aws.amazon.com/architecture/well-architected/)
