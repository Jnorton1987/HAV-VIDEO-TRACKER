# Headlight AV — Project Intake & Tracker

A lightweight web portal for managing AV recording projects. Ready for Vercel.

## Quickstart
```bash
npm install
npm run dev
```
Visit http://localhost:5173

## Deploy to Vercel
1. Push this folder to GitHub (e.g., `headlight-av-portal`).
2. Go to https://vercel.com/new and import the repo.
3. Use defaults. Vercel will build & give you a live URL.

### Custom Domain
- In Vercel → Settings → Domains → add `projects.headlightav.com`.
- In your DNS: CNAME `projects` → `cname.vercel-dns.com`.

## Notes
- Data is stored in browser `localStorage` for now.
- Use **Export CSV** to share with teammates.
- Swap to Supabase/Airtable later for multi-user sync.