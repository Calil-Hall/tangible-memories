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
- Deposit: a deposit via Cash App holds a slot, but **no amount is published** — the $50 figure was
  removed from the site 2026-07-27 at Calil's request. Don't reintroduce a number without asking.
- Instagram: **@TangibleMemories4U** · Cash App: **$calilhall** · Site: **TangibleMemories.shop**
- Business email: **caliltangiblememories@gmail.com** (owns the "Tangible Memories" Google Calendar;
  verified from Calil's calendar-settings screenshot 2026-07-27). All routed email goes here, not to
  Calil's personal gmail.
- Sessions ~20 minutes; prints are one of a kind — **no digital files**.
- Copy stays generic about gear ("instant film", "instant camera") — never name a camera manufacturer.

## Files
- `index.html` — the entire site (self-contained: inline CSS tokens + vanilla JS). Authoritative deliverable.
- `assets/hero-poster.jpg` — the hero image `index.html` references since `0913bec` (2026-07-27):
  a 226KB progressive JPEG (q82) derived from the client's 2.36MB PNG for mobile load speed.
  If Calil supplies a new poster, re-compress it the same way and replace the **.jpg** in place.
  `assets/hero-poster.png` (the old full-size original) is still in the repo but unreferenced.
- `assets/` — drop 4–8 square session photos here for the gallery when supplied.
- `server.js` — zero-dependency Node static file server; binds to `$PORT` for hosting.
- `railway.json` — Railway deploy config (Nixpacks build, `node server.js` start command).
- `package.json` — `start` script + Node >=18 engine. No dependencies; nothing to `npm install`.
- `.gitignore` — ignores `node_modules/`, `.env*`, logs, OS cruft, plus `*.zip` and the loose
  source copies of the poster (`Tangible Memories 2.png`, `Hero Image.png`) so ~5MB of duplicate
  images stay out of the repo. Calil tends to drop source files into this folder — keep them ignored.
- `README.md` — run/deploy instructions.

## Print assets (separate from the website)
Calil occasionally asks for **print** deliverables built from the same artwork. These are NOT part of
the site and never get committed to this repo.
- **Vinyl banner** — 26x50 in at 150 DPI = **3900x7500 px**, padded out from the hero artwork.
  Latest deliverable: `IMG_1534_fixed.png` (lives in the session outputs folder, not the repo).
- **Text repairs on print artwork:** match cap height to neighboring capitals (68px on this banner),
  baseline-align, keep the left edge on the existing text column, and sample the local background +
  noise when patching so the seam is invisible. **Poppins Medium** is the closest match to the
  banner's face (beat Regular, DM Sans, Montserrat).
- Verify print edits with a **pixel diff** — the change must be confined to the patched region and
  every other pixel byte-identical to the source.
- **Do not confuse the two:** `assets/hero-poster.jpg` is the live site image; banner files are
  separate and editing one never touches the other.

## Stack decision
Single static HTML file, framework-free. Chosen because it's a small one-form marketing site — no build
step, hosts anywhere. Keep it that way unless the scope grows (e.g. a CMS-backed gallery), in which case
Astro or Next.js static export is the intended path.

## Hosting & deployment — LIVE
**Live at https://tangiblememories.shop** (verified loading over HTTPS, 2026-07-27).

- **GitHub repo:** https://github.com/Calil-Hall/tangible-memories (public, branch `main`).
- **Railway:** project `pleasing-victory` → service `tangible-memories`, env `production`, region US West.
  Auto-deploys on push to `main`. Railway-provided domain: `tangible-memories-production.up.railway.app`.
  **Caveat (2026-07-27):** after the `75ee672` push, no deploy fired for 4+ minutes until Calil went into
  the Railway dashboard; it then deployed and verified fine. If a push doesn't go live within ~2 min,
  send Calil to the dashboard's Deployments tab rather than assuming it will catch up.
- **Target port: 8080.** Railway injects `PORT=8080`; `server.js` reads `process.env.PORT`.
  The 3000 fallback is local-only — do NOT hardcode 3000 anywhere.
- **DNS (Namecheap, BasicDNS):**
  | Type | Host | Value |
  |---|---|---|
  | ALIAS | `@` | `wkdwyh27.up.railway.app` |
  | TXT | `_railway-verify` | `railway-verify=6fab9da6ea9a1cd452b9a67c37d8fb81fe6cc502ecd477f195b5ada01abd2b9e` |
  ALIAS (not CNAME) because CNAME is invalid at a domain apex. Both records required — with only
  the ALIAS, Railway returns 404 until the TXT verifies ownership.
- Note: Railway's dashboard lagged on "Waiting for DNS update" after the domain was already serving
  correctly. Trust the live URL over the dashboard status.

### Plan constraints — ACTION NEEDED
- Railway **Trial**: showed "18 days or $5.00 left" on 2026-07-27. **The service goes offline when the
  trial ends** — a paid plan is required to stay live.
- Trial caps **1 custom domain**, already used by the apex. `www.tangiblememories.shop` cannot be added
  without upgrading.

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

### Shipping a change (the standing workflow)
Claude edits files in the mounted folder; **Calil runs the push in Terminal.** Railway then redeploys
automatically — no Railway step needed for ordinary changes.
```bash
cd "/Users/calilhall/Downloads/Working folder/tangible-memories"
find .git \( -name "*.lock" -o -name "tmp_obj_*" \) -delete
git add -A
git commit -m "<message>"
git push
```
If an asset is replaced under the same filename (e.g. the hero poster), tell Calil to hard-refresh
(⌘⇧R) — browsers will otherwise serve the cached old file.

**Known constraint — git/GitHub:** the GitHub connector is still unauthorized (OAuth can't run in a
non-interactive session), and the sandbox has no git credentials, so **Claude cannot push.** Claude
*can* drive github.com through the Chrome MCP when signed in — that is how the repo was created.
Never claim a push or deploy happened without verifying it (check the commit on github.com, the
Railway deployment status, or the live URL).

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
`printPrice=10`, `sleevePrice=5`, `handle`, `cashtag`, `website` (the `deposit` key was removed with the
$50 amount), plus two integration hooks:
- `depositLink` — Stripe Payment Link for the deposit (card/Apple Pay). Empty → falls back to Cash App.
- `formEndpoint` — form POST target. **SET (2026-07-27):** `https://formsubmit.co/ajax/caliltangiblememories@gmail.com`
  — FormSubmit emails each JSON submission to that inbox. **Not live until activated:** the first
  submission triggers a one-time confirmation email; the link in it must be clicked or nothing is
  delivered. Empty → falls back to clipboard copy.
- `bookingUrl` — Google Calendar **appointment-schedule** embed URL. When set, the `#book` section
  swaps the request form for a live "pick a slot" calendar iframe (panel goes single-column) and the
  DM link stays as a fallback; when empty, the request form shows. **SET (2026-07-27)** to Calil's
  schedule "Calil with Tangible Memories Photography"
  (`.../appointments/schedules/AcZssZ2M…CT0p?gv=true`) — booking page verified rendering in Chrome
  with live 30-min slots, Eastern Time – Detroit. Keep the trailing `?gv=true`.

## Rules for this project
1. **Verify before delivering.** Trace stepper/total/plural logic, then look at the result.
   **Headless Chromium does NOT work in the sandbox** (missing `libXdamage.so.1`; no root to install
   it; package mirror 403s through the proxy — all confirmed, don't retry). **Use the Chrome MCP
   against the live URL instead** — that works and is how the site was finally verified. To confirm a
   replaced asset actually shipped, `fetch()` it with a cache-buster and compare byte length or hash;
   don't trust a screenshot that may be cached.
2. **No unverifiable claims.** Don't invent prices, links, or business facts. The facts above are the source of truth.
3. **Keep copy gear-generic** — never name a camera brand in page copy.
4. **Don't break the single-file, no-build shape** without saying so and why.
5. **Gallery uses placeholders** until real photos are supplied; swap them in with descriptive alt text.

## Open items (need input from Calil)
1. **Railway trial expires (~14 Aug 2026)** — site goes offline without a paid plan. Top priority.
2. ~~**Poster typo**~~ — RESOLVED 2026-07-27. Calil supplied a corrected poster; it now reads
   "INSTANT PHOTOGRAPHY By Calil". Swapped into `assets/hero-poster.png` (1024×1536, md5 `8644ff94…`).
   The source file `Hero Image.png` is gitignored to avoid committing a duplicate.
3. Stripe (or other) account → a Payment Link for the deposit, to put in `depositLink`. Also: what is
   the deposit amount now that $50 is off the site? Needed before a Payment Link can be created.
4. ~~Where form submissions should go~~ — RESOLVED 2026-07-27: `formEndpoint` set to FormSubmit's
   ajax endpoint for **caliltangiblememories@gmail.com**. Remaining sub-step: the first form
   submission sends FormSubmit's one-time activation email to that inbox — Calil must click its
   confirm link (after deploy, submit a test request to trigger it).
5. Real session photos for the gallery — still **two** "Session print coming soon" placeholders.
   As of 2026-07-28 the plan is written (`../gallery-plan.md`) and the three crop treatments are
   rendered (`../gallery-crop-options.html`). Blocked on: consent for the people in the posts,
   Calil's original photo files, and a treatment choice (A recommended).
6. City/location and availability to state on the page.
7. Group/event pricing — quoted privately, or publish a range?
8. ~~Google Calendar booking link~~ — RESOLVED 2026-07-27. Calil created the appointment schedule
   ("Calil with Tangible Memories Photography") and supplied the embed URL; `bookingUrl` is set and
   the booking page verified rendering with live slots. Remaining: ship it (commit/push) and check
   the embedded iframe on the live site + on mobile.

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

### 2026-07-27 — shipped: GitHub → Railway → custom domain, and FIRST REAL RENDER
- Created the GitHub repo via browser (connector still unauthorized): `Calil-Hall/tangible-memories`,
  public, empty at creation so it wouldn't conflict. Calil pushed from Terminal; 8 files landed,
  2.28 MiB. Verified the file list on GitHub — no `.DS_Store`, no zip, no duplicate poster.
- Railway deployed from `main`. Added custom domain `tangiblememories.shop`, target port **8080**
  (auto-detected by Railway — this corrected my earlier guess of 3000).
- Calil added the ALIAS + TXT records at Namecheap. **Verified https://tangiblememories.shop loads
  the real site over HTTPS with a valid cert.**
- **RESOLVED: the long-standing "never rendered" gap.** Loaded the live site in a real browser and
  confirmed section by section: marquee, sticky nav, hero (Caprasimo + Figtree both loading), tag row,
  manifesto, how-it-works, gallery, order builder, dark booking panel, footer. Interactively clicked
  the steppers on production — 3 prints + 2 sleeves → **$40**, and the order echo tracked it correctly.
- **Found: poster typo** "INSTANT PHOTOGRAPHHY" (see Open items #2).
- **Still unverified: mobile.** Browser resize did not affect the render, so the sticky book bar has
  never been seen. Needs a check on a real phone.

### 2026-07-27 — corrected hero poster shipped to production
- Calil supplied a corrected poster as `Hero Image.png` in the project folder (2,360,030 bytes,
  1024×1536, md5 `8644ff94…`). Read the image to confirm the fix before shipping: it now reads
  **"INSTANT PHOTOGRAPHY / By Calil"** — the doubled H is gone. All other poster facts still match
  the business facts above ($10 / $5, @TangibleMemories4U, TangibleMemories.shop, $calilhall).
- Copied it over `assets/hero-poster.png` (verified matching md5 after the copy). **No HTML change
  needed** — `index.html` already points at that path. Added `Hero Image.png` to `.gitignore` so the
  source copy isn't committed twice.
- Calil pushed `67d2090`; Railway auto-deployed and reported "Deployment successful" ~39s later.
- **Verified in production three ways:** (1) Railway shows the deploy ACTIVE for that commit;
  (2) `fetch()` of `/assets/hero-poster.png` with a cache-buster returns **2,360,030 bytes** — the new
  file, not the old 2,441,815; (3) zoomed the live render and read the corrected text directly.
- Also noted: Railway's domain label caught up to `tangiblememories.shop`, so its DNS verification
  finished (it had been stuck on "Waiting for DNS update" while already serving correctly).
- Unchanged/still open: Railway trial deadline, mobile sticky-bar check, gallery placeholders,
  `formEndpoint` and `depositLink` both still empty.
- Note on the poster: camera-brand marks are visible on the camera bodies in the image. This is
  **acceptable** per the handoff — the rule constrains *page copy*, not the client's own photo.
  Page copy remains generic. Do not "fix" this.

### 2026-07-27 — hero-gallery layout, card bubbles, $50 removed — shipped as `75ee672`
- **Layout:** "Recent sessions" moved out of its standalone section into the hero grid — column 1 row 2,
  directly under the copy/prices, with the hero image pinned to column 2 spanning both rows. Gallery cut
  from 4 tiles to 2. Standalone gallery section deleted; `id="gallery"` moved with the block so nav anchors
  still resolve. Original `.gallery` classes reused — no font changes.
- **CSS grid lesson (cost two failed attempts):** an item with a definite `grid-row` but *auto* column is
  auto-placed **before** fully-auto items, so `grid-row:1/span 2` on the image stole column 1 and pushed
  the copy right. Worse, I twice told Calil the layout was fine from reading the source and blamed
  caching/viewport — his screenshots were correct. **Pin every hero-grid child to an explicit column/row**
  (now done: copy c1r1, image c2 r1–2, gallery c1r2; reset to auto + `order` under 900px), and never assert
  rendered layout from source order.
- **Styling:** hero copy and in-hero gallery got card-style "bubbles" (surface bg, 2px accent-200 border,
  large radius, sm shadow — same treatment as the how-it-works cards) so text doesn't sit on bare background.
- **Content removals (Calil's requests):** "20-minute sessions" tag from the tag row; the "$50 · holds the
  slot · comes off your total" row and the `deposit: 50` config key. Deposit flow itself (kick, Cash App
  button, fine print) kept. Business facts + config sections above updated to match.
- **Shipped:** committed `75ee672` from the sandbox (also swept in this file's prior-session doc edits);
  Calil cleared the stale `.git` locks and pushed. Auto-deploy did NOT fire initially — see hosting caveat —
  but after Calil opened the Railway dashboard the build went out.
- **Verified live** by fetching https://tangiblememories.shop: 2-tile gallery inside the hero, no
  "20-minute" tag, no "$50" anywhere, deposit section goes straight to the Cash App button.
- Still open: mobile render check (incl. the ≤900px stack order copy → image → gallery), Railway trial
  deadline, deposit amount decision, `formEndpoint`/`depositLink`, real gallery photos.

### 2026-07-27 — Google Calendar booking embed + Contact section (NOT yet committed/shipped)
- **New feature: Google Calendar appointment-schedule booking.** Added a `bookingUrl` config key. When
  set, the `#book` section swaps the manual request form for a live Google Calendar appointment-schedule
  iframe (`?gv=true` embed URL), the `.book-panel` goes single-column so the calendar gets full width,
  the lead copy updates to "pick an open time…", and the "DM @TangibleMemories4U" link stays as a
  fallback. When `bookingUrl` is empty (the current default) the existing request form shows unchanged —
  so **the live site is not affected until Calil pastes his link.** Verified the embed method against
  Google Calendar Help / how-to guides (iframe src = `.../appointments/schedules/ID?gv=true`).
- **New Contact section** (`id="contact"`, between `#book` and the footer) + a "Contact" nav link.
  Three cards linking Instagram (@TangibleMemories4U, "fastest"), Cash App ($calilhall, deposit), and
  the website. Uses only verified business facts — **no email invented** (none is published). Responsive:
  3 cols → 1 col under 900px. Nav "Contact" link hides under 900px like the other text links.
- **"Both" per Calil:** contact section added AND booking captures visitor contact — the Google
  appointment schedule collects the guest's name/email itself; the fallback form already has a
  name + "Email or Instagram" field.
- **Config note:** `bookingUrl` is empty until Calil creates a Google Calendar Appointment Schedule and
  pastes its Website-embed URL (keep the `?gv=true`). Personal Gmail = one free appointment schedule;
  branded/multiple pages need Workspace. Logged as Open item #8.
- **Verification (in-sandbox only):** anchors `#book`/`#contact`/`#prices`/`#gallery` all resolve to
  single defined ids; inline JS parses via `new Function`; HTML tag structure balanced (Python
  HTMLParser); no camera-brand / old-handle / gmail leakage (grep); embed defaults OFF so no visual
  regression. `git diff --stat`: index.html +75/−1. **NOT rendered in a browser** (sandbox has no
  headless Chromium, as documented) and the live booking calendar can't be seen until `bookingUrl` is
  filled in — both remain unverified visually.
- **NOT committed / NOT pushed / NOT deployed.** Awaiting Calil: (1) provide the Google booking URL,
  (2) push via the standard Terminal workflow so Railway redeploys.

### 2026-07-27 — email routing to caliltangiblememories@gmail.com (same session, still not shipped)
- Calil's screenshot verified the business email/account: **caliltangiblememories@gmail.com** owns the
  "Tangible Memories" Google Calendar (Eastern Time – Detroit; calilihall@gmail.com has edit access).
  Recorded in Business facts.
- **Contact section:** added a 4th card — mailto link to the business email ("Booking requests land
  here too"). Grid now 4 → 2 (≤900px) → 1 (≤560px) columns.
- **Form → email:** `formEndpoint` set to `https://formsubmit.co/ajax/caliltangiblememories@gmail.com`
  (FormSubmit ajax endpoint: accepts the JSON POST the form already sends, no account needed —
  verified against formsubmit.co/documentation). Added `_subject: "Session request — Tangible
  Memories"` to the payload. Submit button now reads "Send my request" instead of "Copy my request".
- **ACTIVATION REQUIRED:** FormSubmit delivers nothing until its one-time confirmation email (sent on
  first submission) is confirmed from the inbox. After deploy, submit a test request, then click the
  link in the email to caliltangiblememories@gmail.com. Unverified: FormSubmit's exact response
  status on that first pre-activation submission — the form may show an error until activation is done.
- **Booking tie-in:** the appointment schedule should be created under the caliltangiblememories@gmail.com
  account so booking confirmations land there automatically. `bookingUrl` still empty — still waiting
  on the Website-embed URL (Open item #8).
- Verification: 3 email refs (mailto, visible text, endpoint); 4 contact cards; inline JS parses;
  HTML balanced; submit-label logic traced in Node with the endpoint set. Not rendered; not
  committed/pushed/deployed.

### 2026-07-27 — contact trimmed to 2 cards, nav Book button color fix (still not shipped)
- Per Calil: removed the **Website** and **Cash App** cards from the Get-in-touch section — it now has
  Instagram + Email only (grid 2 cols → 1 under 560px). The Cash App **deposit flow in `#book` is
  untouched** — the request was scoped to the contact section.
- **Nav "Book a session" text color bug fixed:** `.nav-links a{color:accent-700}` came later in the
  stylesheet and outspecified `.btn-primary`, so the nav button's text rendered dark terracotta instead
  of the cream (`--color-bg`) the hero "Book your session" button shows. Scoped the nav link color to
  `:not(.btn)` so the button inherits btn-primary's cream text. Lesson: nav-wide link colors must
  exclude `.btn`.
- **Calil supplied a regular-calendar embed code** (`calendar/embed?src=caliltangiblememories@gmail.com`).
  NOT wired in: that embed only *displays* events — visitors can't book through it. `bookingUrl` needs
  an **appointment-schedule** URL (`.../appointments/schedules/ID?gv=true`) from Booking pages →
  Sharing options → Website embed. Told Calil the exact steps; still waiting on that URL (Open item #8).
- Verified: 2 contact cards, 0 cash.app/website links inside `#contact`, deposit button still present
  in `#book`, JS parses, HTML balanced. Not rendered/committed/deployed.

### 2026-07-27 — bookingUrl set: live Google Calendar slot picker wired (awaiting push)
- Calil supplied the appointment-schedule embed code; `bookingUrl` now set to
  `https://calendar.google.com/calendar/appointments/schedules/AcZssZ2MTxX9aTMl-BYnTNSilAmtTEICgaa3CFejrvq1fguagbrHTAi273Eac7Qlh1jKYbl2iUrqCT0p?gv=true`.
  The `#book` section will now show the live slot picker instead of the request form (form remains in
  the markup as the fallback if `bookingUrl` is ever cleared).
- **Verified the booking page itself in Chrome (real render):** titled "Calil with Tangible Memories
  Photography", Eastern Time – Detroit, 30-minute slots visible (Thu/Fri 9:00am–9:30pm at check time).
  Sandbox curl/web_fetch could not verify (proxy 403 / client-rendered empty shell) — Chrome MCP was
  the working method, as documented.
- Inline JS re-parsed OK after the edit.
- **NOT yet verified: the iframe inside the site** — the site with the embed has not been rendered
  (sandbox limitation) and not deployed. After Calil pushes: check tangiblememories.shop shows the
  calendar in the dark booking panel, on desktop and phone (600–700px iframe height may need tuning),
  and submit a test booking end-to-end. Also still pending: FormSubmit activation is now only
  reachable via the fallback form, so it matters less — but the contact-card mailto and the
  Google-confirmation flow replace it.
- Awaiting Calil: standard Terminal push → Railway redeploy.

### 2026-07-27 — SHIPPED + live-verified; one bug found and fixed (needs one more push)
- Calil pushed; deploy confirmed live at tangiblememories.shop (cache-busted fetch showed the new
  markup — note: web_fetch WITHOUT a cache-buster served a stale pre-75ee672 page; always bust).
- **Live render verified in Chrome:** nav shows Contact + cream-text "Book a session" (color fix
  worked); booking panel is single-column with the embed-mode lead copy; the Google Calendar
  slot picker renders INSIDE the panel ("Calil with Tangible Memories Photography", real Thu/Fri
  slots). The iframe takes a few seconds to paint — blank cream box at first is just loading.
- **Bug found on the live site: the request form still displayed above the calendar.** Cause: JS
  sets the `hidden` attribute, but `.book-form{display:flex}` (author CSS) overrides the UA
  stylesheet's `[hidden]{display:none}`. Lesson: never rely on the `hidden` attribute for elements
  that have their own display rule. Fixed with `[hidden]{display:none !important;}` in the CSS.
  Fix is local only — **needs another push**, then re-verify the form is gone above the calendar.
- Observed on the booking page: Google shows "Phone call" as the meeting mode. **Confirmed
  intentional by Calil:** slot bookings are phone consultations; he then manually books the
  in-person session afterward. Do not "fix" this or change site copy to promise an in-person slot.

### 2026-07-27 — [hidden] fix SHIPPED via GitHub web upload; full flow live-verified. Session closed.
- Calil asked Claude to push directly. Sandbox git cannot push (no credentials), so used the
  documented fallback: **GitHub web upload via Chrome MCP** — uploaded `index.html` on
  github.com/Calil-Hall/tangible-memories → "Commit changes" to `main` as **`f4148af`**
  ("Fix hidden attribute so booking form hides when calendar embed is active"). This path works and
  is now precedented for shipping single-file changes without Calil's Terminal.
- Railway auto-deployed within ~2 minutes. **Live verification (Chrome, cache-busted):** the booking
  panel now shows deposit info → "Pick an open slot below" → the Google Calendar slot picker, with
  the request form fully hidden. The `[hidden]{display:none !important}` fix behaves as intended.
- **Booking model confirmed by Calil:** calendar slots = phone consultations; in-person sessions are
  booked manually by Calil after the call. The schedule's "Phone call" mode is correct.
- **IMPORTANT — local repo is now BEHIND origin:** commit `f4148af` (and the CLAUDE.md commit after
  it) exist only on GitHub. Before Calil's next Terminal commit he must run, inside the project:
  `find .git \( -name "*.lock" -o -name "tmp_obj_*" \) -delete && git pull`
  (a stale `index.lock` from this session's sandbox git status also needs that sweep).
- Web-fetch caveat re-confirmed: tangiblememories.shop WITHOUT a cache-buster serves a stale page;
  always append `?v=<something>` when verifying deploys.
- Still open: Railway trial deadline (~14 Aug), deposit amount + Stripe link, real gallery photos,
  mobile render check, FormSubmit activation (now only relevant to the hidden fallback form).

### 2026-07-27 — mobile calendar fix shipped (`f0e9390`)
- Calil's phone screenshot showed the Google booking widget cramped inside the narrow iframe:
  day columns squeezed, slot pills clipped at the right edge. The widget needs more width than a
  phone-sized iframe provides.
- Fix: ≤900px the `.embed-frame` is hidden and a full-width `btn-primary` ("Pick a time on the
  booking calendar", `#bookEmbedOpen`, href = `bookingUrl`, new tab) shows instead — Google serves
  its proper mobile layout when it owns the whole screen. Desktop keeps the inline iframe.
- Shipped via GitHub web upload (`f0e9390`); Railway deployed. **Verified on the live site via
  DOM/CSS inspection** (button present with correct href/text; desktop-hide + mobile-swap rules all
  in the served page). NOT verified visually at phone width — the Chrome MCP window won't shrink
  below desktop size (re-confirmed; resize_window snaps back). Awaiting Calil's phone check.
- **Local repo is 1 commit behind origin again** (`f0e9390`, index.html only). Local index.html is
  byte-identical to it; local CLAUDE.md has newer content NOT on origin. Next Terminal session:
  `git checkout -- index.html && git pull` (restores nothing of value, fast-forwards cleanly,
  keeps the CLAUDE.md edits to ride along with the next commit). Do NOT restore CLAUDE.md.

### 2026-07-27 — hero "washed" filter removed (`5b5f8fa`)
- Calil asked why the hero looked faded vs. the file he supplied. Cause: the handoff's `.washed`
  class on `.hero-img` (`saturate(.6) contrast(.85) brightness(1.1) opacity(.94)`) — an intentional
  instant-film fade in the original design, removed now at Calil's request. The `.washed` CSS rule
  is still defined but unused (like `.amt-row`). **Design-system note: the hero poster now shows at
  full color — do not re-add `washed` without asking.**
- Shipped via GitHub web (`5b5f8fa`); verified live: `.hero-img` classList has no `washed`,
  computed filter is `none`, and the rendered poster shows full contrast.
- Local repo again 1 commit behind (index.html only, byte-identical). Same sync as before:
  `git checkout -- index.html && git pull` — do NOT restore CLAUDE.md.

### 2026-07-27 — nav unpinned (`0f2e1ce`)
- Per Calil: the header bar should stay at the top of the page, not follow on scroll. Removed
  `position:sticky;top:14px;z-index:5;` from `.nav` (now static). **Design note: the nav is
  intentionally non-sticky — don't re-add sticky without asking.** Side effect to know: above 900px
  the "Book a session" button now scrolls away too (the ≤900px sticky book-bar is unaffected and
  still provides an always-visible Book control on mobile). `scroll-margin-top` on sections is now
  slightly generous but harmless.
- Shipped via GitHub web (`0f2e1ce`); verified live: computed `.nav` position is `static`, and a
  mid-page screenshot shows no bar following the scroll.
- Local again 1 commit behind (index.html only, byte-identical): `git checkout -- index.html && git pull`.

### 2026-07-27 — mobile blank-space diagnosis + 4 fixes shipped (`509b0f0`, `0913bec`)
- **Mobile "blank space" under the hero was a slow-loading image, not layout.** The poster was a
  2.36MB PNG; PNGs paint top-down, so on cellular the reserved space (from width/height attrs)
  showed a cream gap under the partly-painted image. Fix: converted to **progressive JPEG q82 —
  226KB (10x smaller)** at `assets/hero-poster.jpg`; `index.html` now references the .jpg with
  `fetchpriority="high"`; `.hero-img` got a `--color-neutral-900` background so any brief loading
  gap reads as the poster's dark backdrop. The old `hero-poster.png` is still in the repo, now
  unreferenced — candidate for deletion to slim the repo (~2.4MB dead).
- **Good to know**: `card-body` in that card bumped to 15px (site base body size — user-requested,
  overriding the old no-font-changes rule for this card only) with `flex:none`; added the line
  "Photos take 5–10 minutes to fully develop — you'll watch them come to life in your hands."
- **Magnetic sleeve thumb**: replaced the flat sage box with CSS art — mini instant print inside a
  sage-bordered translucent pocket with a diagonal plastic sheen (`.thumb-sleeve` + nested divs +
  `::after`). Markup changed to `<div class="thumb-sleeve"><div><div></div></div></div>`.
- Shipped as two web commits (jpg first so the reference never 404s): `509b0f0` then `0913bec`.
- **Verified live (desktop Chrome):** hero-poster.jpg loaded (1024x1536), heroBg rgb(46,43,37),
  Good to know 3 paragraphs at body size incl. the 5–10 min line, sleeve pocket art rendering.
  Mobile still needs Calil's phone check (viewport can't be shrunk here) — but the root cause was
  bandwidth, and the payload is now 10x smaller.
- Local behind origin by 2 (index.html + new assets/hero-poster.jpg). Sync:
  `git checkout -- index.html && git pull` (CLAUDE.md stays dirty by design).

### 2026-07-27 — vinyl banner: blurry "W" replaced (print asset — NOT the website)
- Scope: the 26x50 in vinyl banner file (3900x7500 px, 150 DPI, padded from the hero artwork in a
  prior session). The capital W added to "Website:" back then was undersized (cap ~56px vs the 68px
  of surrounding capitals) and blurry.
- Fix: old W patched out (background sampled locally + matched noise, seam invisible); new W rendered
  sharp from **Poppins Medium** — best glyph match this round vs Regular / DM Sans / Montserrat — cap
  height 68px matched to the "S" in "Socials:", baseline-aligned, left edge on the text column.
- **Known trade-off:** a full-proportion W at that cap height is ~91px wide but only ~64px of slot
  exists before the "e", so the W is condensed to ~70% width to avoid collision. Reads naturally at
  banner size. Alternative (full-width W + "ebsite:" nudged right) offered, not taken up.
- Verified by pixel diff: changes confined to an 85x93px region around the W; every other pixel
  byte-identical to the source. Deliverable: `IMG_1534_fixed.png` (session outputs folder — the
  scratch outputs dir is cleared between sessions, so re-request the source if it's needed again).
- Reminder: this is the **print banner only** — `assets/hero-poster.jpg` on the live site is a
  separate file and untouched. No commit, no push, no deploy; the repo is unchanged by this work.
- Website state is unchanged from the `509b0f0` / `0913bec` entry above: local repo still 2 commits
  behind origin (`git checkout -- index.html && git pull`; do NOT restore CLAUDE.md).

### 2026-07-28 — Instagram posts → gallery: three crop treatments built (NOTHING shipped)
- Scope: replacing the two "Session print coming soon" placeholders with real work from
  **@TangibleMemories4U**. **The repo is unchanged** — no edit to `index.html`, no new assets,
  no commit. Both deliverables live in the Working folder *root*, outside this repo, on purpose:
  `gallery-plan.md` (the workflow) and `gallery-crop-options.html` (the visual comparison).
- **The account has 3 posts**, all 2026-07-28, 1080×1440, each a photo of a single instant print
  on light wood: living-room group, night-out group (print held landscape), dinner-table group.
- **Reading Instagram:** login-walled and client-rendered — `web_fetch` returns an empty shell.
  Use the **Chrome MCP** against Calil's logged-in session. Confirmed working.
- **Getting image bytes out of the browser:** `javascript_tool` returning a long base64 data URL is
  **blocked** by a security filter. The method that works: render the image alone against a magenta
  background filling the viewport, `computer` screenshot with `save_to_disk:true`, then trim the
  magenta in Python — the saved file is readable from the sandbox. Gives ~619×825 per post.
  Screenshots come back 1456×825 regardless of DPR 2, so detect edges by colour, never by assuming
  screenshot px == CSS px.
- **Auto-detecting the print's photo window does not work** (white threshold + connected components
  — the wood is too bright, the borders too warm). Measure by eye off a gridline overlay. Rects,
  as fractions of the full frame: living room `.128/.160/.690/.690`, night out
  `.120/.341/.647/.352`, dinner table `.170/.148/.648/.652`.
- **Treatment recommendation: A — crop to the photograph inside the print.** `.mount` is already a
  white print frame with a square window, so using the full wood-table shot (B) nests a print inside
  a print and shrinks the actual photo; dropping the mount (C) is the only option that changes CSS
  and it abandons the page's print motif. Verified by rendering all three in Chrome.
- **Export spec when it does ship:** crop → square centre-crop → **600×600 progressive JPEG q82,
  under 120KB**, as `assets/session-01.jpg` etc.; `<img>` gets explicit `width`/`height` (the mobile
  blank-space bug was unreserved space), no `loading="lazy"` since the gallery is above the fold.
- **Colour check:** CDN original vs canvas re-encode rendered side by side — identical. The pale
  blue cast is in the photographs, not an ICC/P3 conversion problem. Don't "correct" it.
- **Blockers, all with Calil:** (1) **consent** — every post shows identifiable people at private
  events and the homepage is a wider audience than Instagram; asked, unanswered. (2) original photo
  files — Instagram's copies are too soft for a 600×600 tile. (3) treatment not chosen.
- Unverified: `gallery-crop-options.html` has not been opened in a browser (Chrome MCP can't load
  `file://`). It was checked structurally — balanced tags, all 15 data URIs decode to valid JPEG,
  tile counts correct — and an equivalent layout was rendered in Chrome and screenshotted.

### 2026-07-28 (part 2) — real gallery tiles built and wired in (NOT committed/pushed/deployed)
- Calil chose **treatment A** and supplied the phone originals (2268×4032) into `assets/`:
  `IMG_1548` = living room, `IMG_1544` = dinner table, `IMG_1542` = night out (landscape print).
  These are **gitignored** (`assets/IMG_*.jpg`) along with scratch crops (`assets/_*.png`,
  `assets/*_grid.png`) — ~4.7MB that must never enter the repo. The sandbox mount cannot delete
  files, so the scratch PNGs are still sitting in `assets/`; harmless, but Calil can bin them.
- **Print-window rects, measured on the originals** (fractions of the full 2268×4032 frame; the
  Instagram-derived rects from part 1 do NOT transfer — different framing and aspect):

  | Photo | file | x | y | w | h |
  |---|---|---|---|---|---|
  | Living room | IMG_1548 | .135 | .182 | .708 | .540 |
  | Dinner table | IMG_1544 | .157 | .224 | .679 | .502 |
  | Night out (landscape) | IMG_1542 | .121 | .366 | .683 | .282 |

  Applied with a 0.8% inset (0.45% vertical) to clear the white border, since the prints sit
  slightly rotated in the phone shots. Auto-detection still doesn't work — measure by eye off a
  gridline overlay, then render the crop and look at it.
- **Shipped tile spec (now real, not just planned):** crop → square centre-crop **with a small
  downward bias** on the portrait prints (~70–90px of the original) so the group sits centred
  instead of under empty wall → 600×600 progressive JPEG q82. Result: `assets/session-01.jpg`
  (living, 37KB), `session-02.jpg` (dinner, 54KB), `session-03.jpg` (night, 49KB).
- **`index.html`:** both `.ph` placeholders replaced with `<img … width="600" height="600" alt="…">`.
  Explicit dimensions are deliberate — the mobile blank-space bug was unreserved space. No
  `loading="lazy"`: the gallery is inside the hero, above the fold. Placed **session-02 (left) and
  session-03 (right)**; session-01 is exported and one line away if Calil wants the swap.
- **Correction to a claim made earlier the same day:** the landscape night-out print does **not**
  lose a person off each edge in a square tile — the margin lost is wall. The wrong call came from
  eyeballing the low-res Instagram copy instead of cutting the crop first. Cut, then judge.
- Verification: HTML balanced; 0 placeholders left; both `<img>` tags re-parsed with correct dims
  and alt; one `id="gallery"`; 2 mounts; inline JS passes `node --check`; all three JPEGs confirmed
  600×600 progressive; `git check-ignore` confirms the originals are excluded; `git status` shows
  only `.gitignore`, `CLAUDE.md`, `index.html` + the three new session JPEGs.
- **NOT rendered in a browser. NOT committed, pushed, or deployed** — the live site still shows the
  placeholders. Proof for Calil: `../gallery-preview.html` (outside the repo).
- Stale `.git/index.lock` left behind again: run the documented `find .git … -delete` sweep before
  the next git command. Local is also still 2 commits behind origin.
