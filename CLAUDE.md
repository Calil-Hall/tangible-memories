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
- `server.js` — zero-dependency Node static file server; binds to `$PORT` for hosting.
- `railway.json` — Railway deploy config (Nixpacks build, `node server.js` start command).
- `package.json` — `start` script + Node >=18 engine. No dependencies; nothing to `npm install`.
- `.gitignore` — ignores `node_modules/`, `.env*`, logs, OS cruft.
- `README.md` — run/deploy instructions.

## Stack decision
Single static HTML file, framework-free. Chosen because it's a small one-form marketing site — no build
step, hosts anywhere. Keep it that way unless the scope grows (e.g. a CMS-backed gallery), in which case
Astro or Next.js static export is the intended path.

## Hosting & deployment — LOCKED
**Host: Railway. Source of truth: a GitHub repo that Railway watches (push-to-deploy).**
- Local git repo initialized on branch `main`. First commit: `64cf203`.
- Railway builds with Nixpacks and runs `node server.js` (per `railway.json`); `server.js` reads
  `process.env.PORT`, which Railway sets — do not hardcode a port.
- `server.js` serves `index.html` at `/`, serves `/assets/*`, falls back to `index.html` for unknown
  routes, and normalizes paths to block traversal. Verified locally: `/` → 200 text/html,
  `/assets/hero-poster.png` → 200 image/png, unknown route → 200, traversal attempts contained.
- Custom domain: point **TangibleMemories.shop** at the Railway-provided domain via DNS after first deploy.
- Keep this deployable as a plain static site: no build step, no dependencies. If a dependency is ever
  added, say so explicitly — it changes the deploy story.

### Deploy steps (run by Calil in Terminal; cannot be done from inside a Claude session)
```bash
cd "/Users/calilhall/Downloads/Working folder/tangible-memories"
gh repo create tangible-memories --public --source=. --push     # or: git remote add origin <url> && git push -u origin main
```
Then in Railway: New Project → Deploy from GitHub repo → `tangible-memories`.

**Known constraint:** the GitHub connector is not authorized and its OAuth cannot run in a
non-interactive session, so Claude cannot create the remote, push, or trigger a deploy. All remote/git
push work is handed to the user with exact commands. Do not claim a push or deploy happened without
verifying `git remote -v` and `git log origin/main`.

**Sandbox constraint:** git commands run through the sandbox mount cannot unlink files in `.git`,
so they leave stale `.lock` / `tmp_obj_*` files behind that block the next git command on the Mac.
After any sandbox-side git write, tell the user to run:
`find .git \( -name "*.lock" -o -name "tmp_obj_*" \) -delete`

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
1. **Push to GitHub + connect Railway** — repo is local-only; no remote configured yet. Top blocker for going live.
2. Stripe (or other) account → a Payment Link for the $50 deposit, to put in `depositLink`.
3. Where form submissions should go (email, Formspree/Resend endpoint, or a Sheet) → `formEndpoint`.
4. Real session photos for the gallery, with alt text.
5. City/location and availability to state on the page.
6. Group/event pricing — quoted privately, or publish a range?

## Suggested connectors (not yet authorized)
- **Stripe** — create the $50 deposit Payment Link → `depositLink`.
- **Resend** — deliver session requests to Calil's inbox → `formEndpoint`.
- (Netlify/Vercel were suggested before hosting was decided; **Railway is the chosen host** — ignore those.)

## Session log
### 2026-07-25 — initial build
- Built `index.html` from the handoff: all 10 sections, ported Organic tokens, vanilla-JS steppers/form/marquee, responsive under 900px.
- Verified: markup parses; stepper/total/plural logic traced in Node (default $25, floors at 0).
- Unverified: never rendered in a real browser; gallery is placeholders; depositLink/formEndpoint empty (Cash App + clipboard fallbacks active).

### 2026-07-27 — git repo + Railway hosting decision
- Chose **Railway** as the host (user's call — Railway account already connected on their side).
- Added `server.js` (zero-dep Node static server on `$PORT`), `railway.json`, `package.json`, `.gitignore`, `README.md`.
- Initialized git on `main`, committed everything as `64cf203`. Tree clean, 8 files tracked.
- Verified: server returns 200 text/html at `/`, 200 image/png for the hero asset, falls back to index.html
  on unknown routes, and contains path-traversal attempts (raw and URL-encoded).
- Sandbox git left stale `.lock`/`tmp_obj_*` files it couldn't delete; user cleared them in Terminal — confirmed gone, repo healthy.
- **Not done:** no git remote, nothing pushed, nothing deployed. GitHub connector unauthorized and its OAuth
  can't run in-session, so `gh repo create` / `git push` were handed to the user as exact commands.
  Starting fresh — no pre-existing GitHub repo.

### 2026-07-27 — wireframe analysis + fidelity/accessibility fixes
- **Analyzed `design/Tangible Memories Wireframes.dc.html`** (4 low-fi directions, 1a–1d). Conclusion:
  the final design is already a synthesis of 1a (poster-faithful long scroll) + 1c (print picker with
  running total). Everything in 1a/1c that mattered is in the build. Deliberately NOT carried over:
  1b's above-the-fold inline form, 1c's cart counter, 1d's masonry gallery and draggable prints.
  The wireframes use an **outdated handle `@nstant.memeories`** — superseded by `@TangibleMemories4U`;
  never use the wireframe handle. Wireframes also floated a "bundle?" price tier — no package pricing
  is published, so it stays out.
- **Carried over from wireframe 1a (user-approved):** sticky bottom "Limited slots this month · Book"
  bar, **mobile only** (<=900px), since above that the sticky nav already keeps Book on screen.
  `.wrap` bottom padding raised to 104px at that breakpoint so the fixed bar never covers the footer.
- **Rejected (user-approved):** wireframe's Card/Apple Pay/Cash App chips. Final design's single text
  line is kept verbatim.
- **Bug fixed — tap targets violated the spec.** Spec requires >=44px; measured from CSS,
  `.stepper button` computed to ~19px tall (`padding:0 6px; min-height:auto; font-size:16px`) and
  `.btn-icon` was 36px. Added a mobile-breakpoint rule giving steppers, footer icons, and nav/hero
  buttons >=44px. Desktop sizing untouched to preserve high-fidelity.
- **Repo hygiene:** `.gitignore` now excludes `*.zip` and `Tangible Memories 2.png` — the latter is
  byte-identical to `assets/hero-poster.png` (md5 `11107ac4…` on both), so committing it would add
  ~2.4MB of duplicate. `.DS_Store` was already ignored.
- Verification: CSS braces balanced, inline JS parses via `new Function`, server returns 200 and the
  book-bar markup is served. Anchors (`#gallery`/`#prices`/`#book`) all resolve to defined ids.
  No camera-brand or old-handle leakage in copy (grepped).
- **STILL UNVERIFIED — the page has never been rendered.** Attempted a real headless render this
  session: installed Playwright + Chromium in the sandbox, but Chromium fails on missing system libs
  (`libXdamage.so.1`), `apt-get install` needs root (unavailable), and the package mirror returns 403
  through the proxy. **Rendering must be done by Calil locally** (`npm start` → open localhost:3000).
  Do not claim visual fidelity, font loading, marquee motion, or the mobile book bar look correct
  until someone has actually looked at them.
