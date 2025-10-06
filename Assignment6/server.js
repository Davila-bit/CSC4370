const path = require("path");
const express = require("express");
const app = express();

// Parse application/x-www-form-urlencoded and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// Serve root index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Provided example routes
app.get("/hello", function(req, res) {
  res.send("<h1>Hello, Express!</h1>");
});

app.get("/topfive", function(req, res) {
  let topFiveList = { list: ["Nas", "BIG", "Andre 3000", "Lauryn Hill", "Pac"] };
  res.json(topFiveList);
});

app.post("/goodbye", (req, res) => {
  res.send("<h1>Goodbye, Express!</h1>");
});

// Handle POST from newreview.html
app.post("/viewreview", (req, res) => {
  const {
    artist = "",
    albumTitle = "",
    songTitle = "",
    reviewerName = "",
    platform = "",
    rating = "",
    review = ""
  } = req.body || {};

  const safe = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);

  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Review Submitted</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
      :root { --bg:#0f172a; --card:#111827; --fg:#e5e7eb; --muted:#9ca3af; --accent:#60a5fa; }
      * { box-sizing: border-box; }
      body { margin:0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: radial-gradient(1200px 600px at 10% -10%, #1f2937 0, #0f172a 60%); color: var(--fg); }
      .wrap { min-height:100vh; display:grid; place-items:center; padding:24px; }
      .card { width:100%; max-width:720px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); border:1px solid rgba(255,255,255,0.08); border-radius:16px; backdrop-filter: blur(8px); box-shadow: 0 10px 30px rgba(0,0,0,0.45); overflow:hidden; }
      header { padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:12px; }
      header .dot { width:10px; height:10px; border-radius:50%; background: var(--accent); box-shadow:0 0 12px var(--accent); }
      header h1 { font-size:18px; margin:0; letter-spacing:0.2px; }
      main { padding:24px; }
      h2 { margin:0 0 12px; font-size:22px; }
      p.muted { color: var(--muted); margin:0 0 20px; }
      .grid { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
      .row { display:flex; flex-direction:column; gap:6px; padding:12px; background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; }
      .row b { color:#cbd5e1; font-weight:600; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; color:#f8fafc; }
      footer { padding:18px 24px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; }
      a.btn { color:#0b1220; background: var(--accent); padding:10px 14px; border-radius:8px; text-decoration:none; font-weight:600; }
      a.link { color: var(--fg); text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <section class="card" role="region" aria-label="Review confirmation">
        <header>
          <div class="dot"></div>
          <h1>Thank you for entering a review</h1>
        </header>
        <main>
          <h2>Submitted Details</h2>
          <p class="muted">Here is a copy of what you sent.</p>
          <div class="grid">
            <div class="row"><b>Artist</b><div class="mono">${safe(artist)}</div></div>
            <div class="row"><b>Album Title</b><div class="mono">${safe(albumTitle)}</div></div>
            <div class="row"><b>Song Title</b><div class="mono">${safe(songTitle)}</div></div>
            <div class="row"><b>Reviewer Name</b><div class="mono">${safe(reviewerName)}</div></div>
            <div class="row"><b>Streaming Platform</b><div class="mono">${safe(platform)}</div></div>
            <div class="row"><b>Rating</b><div class="mono">${safe(rating)}</div></div>
            <div class="row" style="grid-column:1/-1"><b>Review</b><div class="mono">${safe(review)}</div></div>
          </div>
        </main>
        <footer>
          <a class="link" href="/newreview.html">Submit another review</a>
          <a class="btn" href="/hello">Test Hello Route</a>
        </footer>
      </section>
    </div>
  </body>
  </html>`;

  res.type("html").send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}...`);
});


