# Tangible Memories — Project Instructions

This file governs work on the **Tangible Memories** website only. It is a separate project
from the resume-match app tracked by `../accountability.md` and `../CLAUDE.md`. Do not mix the two.

## What this is
A one-page marketing + booking site for **Tangible Memories**, instant film photography by Calil.
Built from the design handoff (`Tangible Memories website.zip`). Visitors learn the pitch, see recent
session prints, build a print/sleeve order to see their total, and request a session (paying a $50 deposit).

## Business facts (use verbatim — do not invent)
- Name: **Tangible Memories** · tagline **"Instant moments. Real memories."**
- Photographer: **Calil** ("Instant photography by Calil")
- Pricing: **$10 per print**, **$5 per magnetic photo sleeve**. No package pricing published.
- Deposit: **$50** holds a slot (comes off the total).
- Instagram: **@TangibleMemories4U** · Cash App: **$calilhall** · Site: **TangibleMemories.shop**
- Sessions ~20 minutes; prints are one of a kind — **no digital files**.
- Copy stays generic about gear ("instant film", "instant camera") — never name a camera manufacturer.

## Files
- `index.html` — the entire site (self-contained: inline CSS tokens + vanilla JS). Authoritative deliverable.
- `assets/hero-poster.png` — client-supplied hero image (1024×1536), used uncropped.
- `assets/` — drop 4–8 square session photos here for the gallery when supplied.

## Stack decision
Single static HTML file, framework-free. Chosen because it's a small one-form marketing site — no build
step, hosts anywhere (Netlify, Vercel, GitHub Pages, any static host). Keep it that way unless the scope
grows (e.g. a CMS-backed gallery), in which case Astro or Next.js static export is the intended path.

## Design system (Organic tokens — do not drift)
- Ground `--color-bg` #f5ead8; text #201e1d; accent terracotta #c67139; second accent sage #7a8a5e.
- Full 100–900 ramps for neutral / accent / accent-2 are defined in `:root` in `index.html`.
- Fonts: headings **Caprasimo**, body **Figtree** (Google Fonts).
- Radii: containers 28px, cards ~32px, pills/circles 999px. No sharp corners. Shadows: sm/md/lg only.
- High-fidelity: colors, type, spacing, radii and copy are final. Recreate pixel-closely.

## Configuration (top of the `<script>` in index.html)
`printPrice=10`, `sleevePrice=5`, `deposit=50`, `handle`, `cashtag`, `website`, plus two integration hooks:
- `depositLink` — Stripe Payment Link for the $50 deposit (card/Apple Pay). Empty → falls back to Cash App.
- `formEndpoint` — form POST target (Formspree/Resend/webhook). Empty → falls back to clipboard copy.

## Rules for this project
1. **Verify before delivering.** Trace stepper/total/plural logic; render in a browser when possible.
   No headless browser exists in-session — flag any unrendered visual work as unverified.
2. **No unverifiable claims.** Don't invent prices, links, or business facts. The facts above are the source of truth.
3. **Keep copy gear-generic** — never name a camera brand in page copy.
4. **Don't break the single-file, no-build shape** without saying so and why.
5. **Gallery uses placeholders** until real photos are supplied; swap them in with descriptive alt text.

## Open items (need input from Calil)
1. Stripe (or other) account → a Payment Link for the $50 deposit, to put in `depositLink`.
2. Where form submissions should go (email, Formspree/Resend endpoint, or a Sheet) → `formEndpoint`.
3. Real session photos for the gallery, with alt text.
4. City/location and availability to state on the page.
5. Group/event pricing — quoted privately, or publish a range?

## Session log
### 2026-07-25 — initial build
- Built `index.html` from the handoff: all 10 sections, ported Organic tokens, vanilla-JS steppers/form/marquee, responsive under 900px.
- Verified: markup parses; stepper/total/plural logic traced in Node (default $25, floors at 0).
- Unverified: never rendered in a real browser; gallery is placeholders; depositLink/formEndpoint empty (Cash App + clipboard fallbacks active).
