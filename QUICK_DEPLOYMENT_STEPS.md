# Quick Cloudflare Deployment Steps

## Immediate Actions Required

### 1. Get Cloudflare API Token (5 minutes)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Add domain: `aigame.lol` (Free plan)
3. **Copy the 2 nameservers** Cloudflare provides
4. Create API token: My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template

### 2. Update Spaceship DNS (5 minutes)
1. Login to [Spaceship](https://spaceship.com/)
2. Domains → aigame.lol → Manage → DNS/Nameservers
3. **Replace nameservers** with the ones from Cloudflare
4. Save (DNS propagation: 2-48 hours)

### 3. Authenticate and Deploy (5 minutes)
```bash
cd "D:\1-AI三号\游戏网站\warp-zone-gems"

# Authenticate (choose one method):
wrangler auth login
# OR
wrangler auth login --api-token YOUR_API_TOKEN

# Deploy (automated script):
deploy-to-cloudflare.bat
```

### 4. Configure Environment Variables (5 minutes)
1. After deployment, go to Cloudflare Dashboard → Workers & Pages
2. Find "warp-zone-gems" → Settings → Environment variables
3. Add these **Production** variables:
   ```
   VITE_SUPABASE_URL = https://oiatqeymovnyubrnlmlu.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM
   VITE_IMGBB_API_KEY = 7c9e2e7a5c5f5e8a9d0e4f1c6b3a8b7c
   ```
4. Redeploy the site

### 5. Set up Custom Domain (2 minutes)
1. In your Cloudflare Pages project → Custom domains
2. Add domain: `aigame.lol`
3. Cloudflare auto-configures DNS

## Expected Timeline
- **Immediate**: Site available at `https://warp-zone-gems.pages.dev`
- **2-6 hours**: DNS propagation (aigame.lol works)
- **24-48 hours**: Full DNS propagation globally

## Files Created
✅ `wrangler.toml` - Cloudflare configuration  
✅ `public/_redirects` - SPA routing  
✅ `.env.cloudflare.example` - Environment variables reference  
✅ `deploy-to-cloudflare.bat` - One-click deployment  
✅ `CLOUDFLARE_DEPLOYMENT_GUIDE.md` - Comprehensive guide  

## Verification
Test these after deployment:
- [ ] Site loads: https://warp-zone-gems.pages.dev
- [ ] Games display correctly
- [ ] Login/register works
- [ ] Admin panel accessible
- [ ] Image uploads function
- [ ] Custom domain: https://aigame.lol (after DNS propagation)

## Troubleshooting
- **Build fails**: Check `npm run build` locally first
- **Auth issues**: Verify API token has correct permissions
- **DNS not working**: Wait 24-48 hours for full propagation
- **Environment variables**: Must be set in Cloudflare dashboard, not local files

---

**Ready to deploy? Run: `deploy-to-cloudflare.bat`**