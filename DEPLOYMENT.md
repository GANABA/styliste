# Deployment Guide - Styliste.com

This guide explains how to deploy the Styliste.com application to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Neon PostgreSQL database (already configured)

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `styliste-app` (or your preferred name)
3. Description: "Styliste.com - SaaS platform for African tailors"
4. Visibility: **Private** (recommended for MVP)
5. DO NOT initialize with README (we already have one)
6. Click "Create repository"

## Step 2: Push Code to GitHub

Run these commands from your project directory:

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/styliste-app.git

# Push code
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import" next to your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Step 4: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

### Production Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_jbpA7dBE2gVh@ep-billowing-pine-aizdhida-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require` | Your Neon database URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `NEXTAUTH_SECRET` | `1luLtOJfkoodO5N+2mMs7dQBWB9i+CH3FZShsu0VOFc=` | Keep this secret secure |
| `NODE_ENV` | `production` | Set to production |

**Important Notes:**
- Replace `your-app.vercel.app` with your actual Vercel URL (shown after first deployment)
- The `NEXTAUTH_SECRET` must be the same value used in development
- For production, consider generating a new secure secret: `openssl rand -base64 32`

## Step 5: Run Database Migrations

After deployment, Vercel will automatically run Prisma migrations during build.

If you need to seed the database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional - only if you need test data)
npx tsx prisma/seed-simple.ts
```

## Step 6: Verify Deployment

1. Open your Vercel deployment URL
2. Test the login page: `/login`
3. Try logging in with test credentials:
   - Email: `test@styliste.com`
   - Password: `test1234`
4. Verify dashboard loads correctly
5. Test responsive behavior on mobile

## Environment-Specific Configuration

### Development (.env.local)
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="1luLtOJfkoodO5N+2mMs7dQBWB9i+CH3FZShsu0VOFc="
```

### Production (Vercel)
- All environment variables set in Vercel Dashboard
- `NEXTAUTH_URL` points to production domain
- SSL/HTTPS automatically enabled by Vercel

## Auto-Deploy Configuration

Vercel automatically deploys when you push to GitHub:

- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches or pull requests

## Troubleshooting

### Build Fails

Check build logs in Vercel Dashboard:
- Ensure all environment variables are set
- Verify DATABASE_URL is accessible from Vercel
- Check for TypeScript errors

### Database Connection Issues

- Ensure Neon database allows connections from Vercel IPs
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon database is not paused (free tier auto-pauses after inactivity)

### Authentication Not Working

- Verify `NEXTAUTH_URL` matches your actual deployment URL
- Ensure `NEXTAUTH_SECRET` is set in Vercel
- Check cookies are not blocked (HTTPS required for production)

## Security Checklist

- [x] `.env` and `.env.local` in `.gitignore`
- [x] All secrets configured in Vercel (not in code)
- [x] HTTPS enabled (automatic on Vercel)
- [x] Secure cookies in production
- [ ] Custom domain configured (optional)
- [ ] Rate limiting enabled (Section 29)

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `app.styliste.com`)
3. Configure DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` to your custom domain

## Monitoring & Logs

- **Vercel Logs**: Dashboard → Your Project → Logs
- **Runtime Logs**: Real-time application logs
- **Build Logs**: Deployment and build output
- **Analytics**: Vercel Analytics (enable in settings)

## Next Steps

After successful deployment:

1. Test all authentication flows in production
2. Monitor error logs for issues
3. Set up error tracking (Sentry) - planned for Sprint 2
4. Configure custom domain (if applicable)
5. Share deployment URL with stakeholders

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Neon Documentation: https://neon.tech/docs
- NextAuth Documentation: https://next-auth.js.org
