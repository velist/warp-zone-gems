# Cloudflare Pages Deployment Guide for aigame.lol

## Overview
This guide covers the complete setup process for deploying the Warp Zone Gems gaming site to Cloudflare Pages using the custom domain `aigame.lol`.

## Prerequisites
- Domain `aigame.lol` purchased on Spaceship
- Cloudflare account (free tier is sufficient)
- Project ready at `D:\1-AI三号\游戏网站\warp-zone-gems\`
- Cloudflare CLI (wrangler) installed ✓

## Part 1: Spaceship DNS Configuration

### Step 1: Get Cloudflare Nameservers
1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click "Add site" and enter `aigame.lol`
3. Select the "Free" plan
4. Cloudflare will scan your DNS records
5. **Copy the two nameservers** provided (they look like):
   ```
   [name].ns.cloudflare.com
   [name].ns.cloudflare.com
   ```

### Step 2: Update Spaceship DNS Settings
1. Log into your [Spaceship account](https://spaceship.com/)
2. Go to "Domains" → Find `aigame.lol` → Click "Manage"
3. Navigate to "DNS" or "Nameservers" section
4. **Replace the current nameservers** with the Cloudflare nameservers
5. Save changes

**⚠️ Important**: DNS propagation can take 24-48 hours, but usually completes within 2-6 hours.

## Part 2: Cloudflare API Token Setup

### Step 1: Create API Token
1. In Cloudflare Dashboard, go to "My Profile" → "API Tokens"
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template or "Custom token"
4. Set permissions:
   - **Zone:Zone Settings:Edit**
   - **Zone:Zone:Read**  
   - **Account:Cloudflare Pages:Edit**
5. Set Zone Resources: `Include - All zones from account`
6. Click "Continue to summary" → "Create Token"
7. **Copy and save the token** - you'll need it for authentication

### Step 2: Authenticate Wrangler
Open command prompt in the project directory and run:
```bash
cd "D:\1-AI三号\游戏网站\warp-zone-gems"
wrangler auth login
```
Or use the API token:
```bash
wrangler auth login --api-token YOUR_API_TOKEN
```

## Part 3: Environment Variables Configuration

### Required Environment Variables
Your project needs these environment variables:

1. **VITE_SUPABASE_URL**: `https://oiatqeymovnyubrnlmlu.supabase.co`
2. **VITE_SUPABASE_ANON_KEY**: (from your Supabase project)
3. **VITE_IMGBB_API_KEY**: (from your ImgBB account)

### Set Environment Variables in Cloudflare
1. In Cloudflare Dashboard → "Workers & Pages"
2. Find your site (after deployment) → "Settings" → "Environment variables"
3. Add production variables:
   ```
   VITE_SUPABASE_URL = https://oiatqeymovnyubrnlmlu.supabase.co
   VITE_SUPABASE_ANON_KEY = [your-supabase-anon-key]
   VITE_IMGBB_API_KEY = [your-imgbb-api-key]
   ```

## Part 4: Deploy to Cloudflare Pages

### Method 1: Using Wrangler CLI
```bash
cd "D:\1-AI三号\游戏网站\warp-zone-gems"
wrangler pages project create warp-zone-gems
wrangler pages deploy dist --project-name=warp-zone-gems
```

### Method 2: GitHub Integration (Recommended)
1. Push your code to GitHub repository
2. In Cloudflare Dashboard → "Workers & Pages" → "Create application"
3. Click "Pages" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 18 or 20

### Build Configuration
The project is configured with:
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node.js compatibility**: Latest LTS
- **SPA routing**: Configured via `_redirects` file

## Part 5: Custom Domain Setup

### After Deployment
1. Go to your Cloudflare Pages project
2. Navigate to "Custom domains"
3. Click "Set up a custom domain"
4. Enter `aigame.lol`
5. Cloudflare will automatically configure DNS

### DNS Records (Auto-created)
Cloudflare will create these DNS records:
```
Type: CNAME
Name: aigame.lol
Content: warp-zone-gems.pages.dev
```

## Part 6: SSL/Security Configuration

### Enable Security Features
1. In Cloudflare Dashboard → your domain → "SSL/TLS"
2. Set encryption mode to "Full" or "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### Performance Optimization
1. Go to "Speed" → "Optimization"
2. Enable "Auto Minify" for CSS, JS, HTML
3. Enable "Brotli" compression
4. Set "Browser Cache TTL" to appropriate value

## Part 7: Testing and Verification

### Pre-deployment Testing
```bash
# Test build locally
cd "D:\1-AI三号\游戏网站\warp-zone-gems"
npm run build
npm run preview

# Check for build errors
npm run lint
```

### Post-deployment Verification
1. Visit `https://aigame.lol` (wait for DNS propagation)
2. Test all major functionality:
   - Game loading and display
   - User authentication
   - Admin panel access
   - Image uploads
   - Database connectivity

### Debug Common Issues
1. **Build failures**: Check environment variables
2. **404 errors**: Verify `_redirects` file is in `public/`
3. **API errors**: Check Supabase CORS settings
4. **DNS issues**: Use tools like `nslookup aigame.lol`

## Security Considerations

### Environment Variables
- Never commit API keys to version control
- Use Cloudflare's environment variables for production
- Consider different keys for development/production

### CORS Configuration
Update Supabase CORS settings to include:
```
https://aigame.lol
https://warp-zone-gems.pages.dev
```

## Monitoring and Maintenance

### Cloudflare Analytics
- Monitor site performance via Cloudflare Analytics
- Set up alerts for downtime or performance issues
- Review security events regularly

### Automated Deployments
Set up GitHub Actions or use Cloudflare's Git integration for automatic deployments on code changes.

## Troubleshooting

### Common Issues
1. **DNS not resolving**: Wait 24-48 hours for full propagation
2. **SSL certificate issues**: Check Cloudflare SSL settings
3. **Build failures**: Verify all dependencies and environment variables
4. **404 on refresh**: Ensure `_redirects` file is properly configured

### Support Resources
- Cloudflare Documentation: https://developers.cloudflare.com/pages/
- Spaceship Support: Contact via their dashboard
- Supabase Documentation: https://supabase.com/docs

## Cost Estimation

### Cloudflare Pages (Free Tier)
- 500 builds per month
- 100 GB bandwidth per month
- 20,000 requests per day

### Domain Cost
- aigame.lol renewal: ~$10-15/year on Spaceship

---

**Next Steps**: Follow the deployment commands below to get started immediately.