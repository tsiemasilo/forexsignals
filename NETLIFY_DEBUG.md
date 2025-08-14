# Netlify 502 Error Debugging Guide

## Current Issue
- 502 Bad Gateway error when calling `/api/login` on deployed site
- Error suggests Netlify function is failing to execute properly

## Immediate Fix Steps

### 1. Check Environment Variables in Netlify Dashboard

Go to: **Site settings → Environment variables**

**Required Variables:**
```
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

OZOW_SITE_CODE=your_ozow_site_code
OZOW_PRIVATE_KEY=your_ozow_private_key
```

### 2. Check Netlify Function Logs

1. Go to Netlify dashboard → Functions tab
2. Click on the failing function
3. Check the logs for error details

### 3. Possible Issues

**Database Connection:**
- Environment variable `NETLIFY_DATABASE_URL` not set
- Database connection timeout
- SSL/TLS connection issues

**Function Runtime:**
- Node.js modules not properly bundled
- Missing dependencies in serverless environment

### 4. Quick Test Commands

Test database connection:
```bash
# Test if database is accessible
curl -X POST https://your-database-url/test
```

### 5. Deployment Checklist

- [ ] `NETLIFY_DATABASE_URL` environment variable set
- [ ] Ozow payment variables configured
- [ ] Function deployment successful
- [ ] Build logs show no errors
- [ ] Database schema exists and accessible

## Next Steps

1. Set missing environment variables
2. Redeploy the site
3. Check function logs for specific error details
4. Test API endpoints individually