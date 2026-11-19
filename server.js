// Minimal zero-dependency static file server for Railway.
// Serves index.html and assets from this folder. Binds to Railway's $PORT.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

// ── Gallery: built from the images in assets/gallery/ ──────────────────
// Every .jpg/.png in that folder appears on /gallery, newest first (highest
// filename first — names are dates like 2026-11-18-230715.jpg). The newest
// HOME_COUNT also fill the scrolling strip on the homepage. A same-named file
// in assets/gallery/thumb/ is used as the small version if it exists.
const GALLERY_DIR = path.join(ROOT, "assets", "gallery");
const THUMB_DIR = path.join(GALLERY_DIR, "thumb");
const HOME_COUNT = 12;

// ── Hidden prints (managed from /admin) ────────────────────────────────
// Hidden files stay on disk but vanish from every page and their public URLs
// 404. The list must live on a Railway Volume to survive redeploys: Railway
// sets RAILWAY_VOLUME_MOUNT_PATH when one is attached. Without it the list is
// kept in ./data and is WIPED on the next deploy (the admin page says so).
const crypto = require("crypto");
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(ROOT, "data");
const PERSISTENT = !!process.env.RAILWAY_VOLUME_MOUNT_PATH;
const HIDDEN_FILE = path.join(DATA_DIR, "hidden.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""; // empty = /admin switched off
let HIDDEN = new Set();
try { HIDDEN = new Set(JSON.parse(fs.readFileSync(HIDDEN_FILE, "utf8"))); } catch (e) {}
function saveHidden() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(HIDDEN_FILE, JSON.stringify([...HIDDEN].sort(), null, 1));
}
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function imageSize(file) {
  // Reads just the header. Returns {w,h} or null. JPEG (SOF markers) and PNG.
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(256 * 1024);
    const n = fs.readSync(fd, buf, 0, buf.length, 0);
    if (n > 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < n) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        }
        if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch (e) { /* unreadable file: skip it */ }
  finally { if (fd !== undefined) fs.closeSync(fd); }
  return null;
}

const esc = (t) => t.replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function describe(file) {
  const base = file.replace(/\.[^.]+$/, "");
  const d = base.match(/^(\d{4})-(\d\d)-(\d\d)/);
  if (d) return "Instant print from an event, " + MONTHS[+d[2] - 1] + " " + (+d[3]) + ", " + d[1];
  return "Instant print: " + (base.replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ").trim() || "event photo");
}

function loadGallery() {
  let names = [];
  try { names = fs.readdirSync(GALLERY_DIR); } catch (e) { return []; }
  return names
    .filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith("."))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    .map((f) => {
      const thumbPath = path.join(THUMB_DIR, f);
      const hasThumb = fs.existsSync(thumbPath);
      const size = imageSize(hasThumb ? thumbPath : path.join(GALLERY_DIR, f));
      if (!size) return null;
      const enc = encodeURIComponent(f);
      return {
        name: f,
        full: "assets/gallery/" + enc,
        thumb: hasThumb ? "assets/gallery/thumb/" + enc : "assets/gallery/" + enc,
        w: size.w, h: size.h, alt: esc(describe(f)),
      };
    })
    .filter(Boolean);
}

function img(p, i, eager) {
  return '<img src="' + p.thumb + '" width="' + p.w + '" height="' + p.h + '" alt="' + p.alt + '"' +
    (i < eager ? "" : ' loading="lazy"') + ' decoding="async">';
}

// Built at startup (Railway restarts on every deploy) and again after each
// change made on /admin.
const PAGES = {};
let ALL_PHOTOS = [];
function buildPages() {
try {
  ALL_PHOTOS = loadGallery();
  const photos = ALL_PHOTOS.filter((p) => !HIDDEN.has(p.name));
  const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  const strip = photos.slice(0, HOME_COUNT)
    .map((p, i) => '<figure class="reel-item">' + img(p, i, 3) + "</figure>");
  if (photos.length > HOME_COUNT) {
    strip.push('<a class="reel-item reel-more" href="/gallery"><span class="reel-more-n">' +
      photos.length + '</span><span>prints in the gallery</span><span class="reel-more-go">See all &#8594;</span></a>');
  }
  PAGES["index.html"] = index.replace("<!-- GALLERY:ITEMS -->", strip.join("\n          "));

  const tpl = fs.readFileSync(path.join(ROOT, "gallery.html"), "utf8");
  const style = (index.match(/<style>[\s\S]*?<\/style>/) || [""])[0];
  const grid = photos.map((p, i) =>
    '<a class="g-item" href="' + p.full + '" style="--r:' + (p.w / p.h).toFixed(3) + '">' + img(p, i, 8) + "</a>").join("\n      ");
  PAGES["gallery.html"] = tpl
    .replace("<!-- SITE:STYLE -->", style)
    .replace("<!-- GALLERY:COUNT -->", String(photos.length))
    .replace("<!-- GALLERY:ALL -->", grid);
} catch (e) {
  console.error("Gallery build failed, serving files as-is:", e.message);
}
}
buildPages();

// ── /admin ──────────────────────────────────────────────────────────────
function authorized(req) {
  if (!ADMIN_PASSWORD) return false;
  const m = /^Basic (.+)$/.exec(req.headers.authorization || "");
  if (!m) return false;
  const pass = Buffer.from(m[1], "base64").toString().split(":").slice(1).join(":");
  const a = crypto.createHash("sha256").update(pass).digest();
  const b = crypto.createHash("sha256").update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

function adminPage() {
  const tiles = ALL_PHOTOS.map((p) => {
    const off = HIDDEN.has(p.name);
    return '<figure class="a-item' + (off ? " is-hidden" : "") + '" data-name="' + esc(p.name) + '">' +
      '<img src="' + p.thumb.replace("assets/", "/admin/img/") + '" width="' + p.w + '" height="' + p.h + '" alt="" loading="lazy">' +
      '<figcaption><span class="a-date">' + esc(p.name.replace(/\.[^.]+$/, "")) + '</span>' +
      '<button type="button">' + (off ? "Show" : "Hide") + "</button></figcaption></figure>";
  }).join("");
  const warn = PERSISTENT ? "" :
    '<p class="a-warn"><b>Not saved permanently yet.</b> Changes here are wiped the next time the site ' +
    "is deployed. Attach a Volume to this service in Railway to make them stick.</p>";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Gallery admin — Tangible Memories</title>
<style>
body{margin:0;font:15px/1.4 system-ui,sans-serif;background:#f5ead8;color:#201e1d;}
header{position:sticky;top:0;z-index:2;background:#2e2b25;color:#f9f4ed;padding:14px 20px;
  display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;}
header h1{font-size:18px;margin:0;} header a{color:#ffc6a5;} .a-count{opacity:.8;}
.a-filter{margin-left:auto;display:flex;gap:6px;}
.a-filter button{border:1px solid #645c50;background:transparent;color:#f9f4ed;border-radius:99px;padding:6px 12px;cursor:pointer;}
.a-filter button[aria-pressed=true]{background:#c67139;border-color:#c67139;}
.a-warn{margin:14px 20px 0;padding:12px 14px;background:#fff2eb;border:2px solid #f6a06b;border-radius:10px;}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;padding:20px;}
.a-item{margin:0;background:#f9f4ed;border-radius:8px;padding:8px;box-shadow:0 1px 3px rgba(0,0,0,.15);}
.a-item img{width:100%;height:190px;object-fit:contain;display:block;}
figcaption{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:8px;}
.a-date{font-size:11px;color:#645c50;}
figcaption button{min-height:36px;padding:0 14px;border-radius:99px;border:2px solid #c67139;
  background:#c67139;color:#fff;font-weight:600;cursor:pointer;}
.is-hidden img{opacity:.25;filter:grayscale(1);}
.is-hidden figcaption button{background:transparent;color:#8c491a;}
.a-item.busy{pointer-events:none;opacity:.6;}
body[data-show=visible] .is-hidden,body[data-show=hidden] .a-item:not(.is-hidden){display:none;}
</style></head><body data-show="all">
<header><h1>Gallery admin</h1><span class="a-count" id="count"></span>
<a href="/gallery" target="_blank">View gallery &#8599;</a>
<div class="a-filter"><button data-f="all" aria-pressed="true">All</button>
<button data-f="visible" aria-pressed="false">Showing</button>
<button data-f="hidden" aria-pressed="false">Hidden</button></div></header>
${warn}<main id="grid">${tiles}</main>
<script>
var grid=document.getElementById("grid");
function count(){var all=grid.children.length,h=grid.querySelectorAll(".is-hidden").length;
  document.getElementById("count").textContent=(all-h)+" showing · "+h+" hidden";}
count();
document.querySelectorAll(".a-filter button").forEach(function(b){b.onclick=function(){
  document.body.dataset.show=b.dataset.f;
  document.querySelectorAll(".a-filter button").forEach(function(x){x.setAttribute("aria-pressed",x===b);});};});
grid.addEventListener("click",function(e){
  var btn=e.target.closest("figcaption button"); if(!btn) return;
  var item=btn.closest(".a-item"), hide=!item.classList.contains("is-hidden");
  item.classList.add("busy");
  fetch("/admin/hide",{method:"POST",headers:{"Content-Type":"application/json","X-Admin":"1"},
    body:JSON.stringify({name:item.dataset.name,hidden:hide})})
  .then(function(r){if(!r.ok) throw r.status;
    item.classList.toggle("is-hidden",hide); btn.textContent=hide?"Show":"Hide"; count();})
  .catch(function(s){alert("Couldn't save that change ("+s+"). Try again.");})
  .then(function(){item.classList.remove("busy");});
});
</script></body></html>`;
}

function handleAdmin(req, res, urlPath) {
  if (!ADMIN_PASSWORD) { res.writeHead(404); return res.end("Not found"); }
  if (!authorized(req)) {
    // Slow down password guessing a little.
    return setTimeout(() => {
      res.writeHead(401, { "WWW-Authenticate": 'Basic realm="Tangible Memories admin", charset="UTF-8"' });
      res.end("Password required");
    }, 800);
  }
  // Thumbnails for the admin page, including hidden ones (public URLs 404 once hidden).
  const im = /^\/admin\/img\/gallery\/(thumb\/)?([^/]+)$/.exec(urlPath);
  if (im) {
    const file = path.join(GALLERY_DIR, im[1] ? "thumb" : "", path.basename(im[2]));
    if (!ALL_PHOTOS.some((p) => p.name === path.basename(file))) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" });
    return fs.createReadStream(file).on("error", () => res.end()).pipe(res);
  }
  if (urlPath === "/admin/hide" && req.method === "POST") {
    // The custom header forces a CORS preflight, so other websites can't
    // make a logged-in browser send this request.
    if (req.headers["x-admin"] !== "1") { res.writeHead(403); return res.end("Forbidden"); }
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 2000) req.destroy(); });
    req.on("end", () => {
      let msg;
      try { msg = JSON.parse(body); } catch (e) { res.writeHead(400); return res.end("Bad request"); }
      if (!ALL_PHOTOS.some((p) => p.name === msg.name)) { res.writeHead(404); return res.end("No such print"); }
      if (msg.hidden) HIDDEN.add(msg.name); else HIDDEN.delete(msg.name);
      try { saveHidden(); } catch (e) { res.writeHead(500); return res.end("Could not save"); }
      buildPages();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, hidden: HIDDEN.size }));
    });
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end(adminPage());
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((req, res) => {
  // Decode, strip query string, and normalize to prevent path traversal.
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  if (urlPath === "/gallery" || urlPath === "/gallery/") urlPath = "/gallery.html";
  if (urlPath === "/admin" || urlPath.startsWith("/admin/")) return handleAdmin(req, res, urlPath);

  const safePath = path
    .normalize(urlPath)
    .replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(ROOT, safePath);
  const rel = path.relative(ROOT, filePath).split(path.sep).join("/");
  const gm = /^assets\/gallery\/(?:thumb\/)?([^/]+)$/.exec(rel);
  if ((gm && HIDDEN.has(gm[1])) || rel === "data" || rel.startsWith("data/")) {
    res.writeHead(404); return res.end("Not found");
  }

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Single-page site: fall back to index.html for unknown routes.
      filePath = path.join(ROOT, "index.html");
    }
    const page = PAGES[path.relative(ROOT, filePath)];
    if (page) {
      res.writeHead(200, { "Content-Type": TYPES[".html"] });
      return res.end(page);
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Tangible Memories site running on port ${PORT}`);
});
