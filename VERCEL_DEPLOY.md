# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dev-orko/sanvitv)

## Environment Variables

Add these environment variables in your Vercel project settings:

```
VITE_TMDB_API_KEY=3ccf3bbfa9b25213ac74c50f96d238d0
VITE_TMDB_READ_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzY2NmM2JiZmE5YjI1MjEzYWM3NGM1MGY5NmQyMzhkMCIsIm5iZiI6MTczMjk3NDAwMy4wNjIsInN1YiI6IjY3NGIxNWIzMDExNzg1MWNkMDFjMjQ4OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._aQY-s2iBoSka9Sc7Iry4EpXgPjBWm__HSIvnrxNtZ4
```

## Manual Deployment Steps

1. **Import Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import `Dev-orko/sanvitv` from GitHub

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the variables listed above
   - Make sure they're available for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live!

## Troubleshooting

### "Unable to load content" Error
- Ensure environment variables are set in Vercel dashboard
- Check that the build completed successfully
- Verify the output directory is set to `dist`

### API Errors
- Confirm TMDB API key is valid
- Check browser console for specific error messages
- Ensure CORS settings allow API requests

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`
