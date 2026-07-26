# Tangible Memories

One-page marketing + booking site for **Tangible Memories** — instant film photography by Calil.

## Run locally
```bash
npm start        # serves on http://localhost:3000
```
No dependencies to install — `server.js` is a plain Node static file server.

## Deploy (Railway)
This repo is Railway-ready:
- `railway.json` sets the build (Nixpacks) and start command (`node server.js`).
- `package.json` `start` script + `server.js` bind to Railway's `$PORT` automatically.

Push to the connected repo and Railway builds and serves it. Point `TangibleMemories.shop`
at the Railway domain in your DNS settings once deployed.

## Files
- `index.html` — the entire site (inline CSS + vanilla JS). Authoritative.
- `assets/hero-poster.png` — hero image. Add 4–8 square session photos here for the gallery.
- `server.js` — zero-dependency static server for hosting.
- `railway.json`, `package.json` — deploy config.
- `CLAUDE.md` — project instructions, business facts, and open items.

## Configuration
Edit the `config` block at the top of the `<script>` in `index.html`:
- `depositLink` — Stripe Payment Link for the $50 deposit (empty → Cash App fallback).
- `formEndpoint` — form POST target, e.g. Formspree/Resend (empty → clipboard-copy fallback).
