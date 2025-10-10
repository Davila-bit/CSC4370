<<<<<<< HEAD
const express = require("express"); //imports the express module
const app = express(); //creates the express application object
app.use(express.json());//allows you to say req.body and get the data sent in the body of the msg
app.use(express.static("."));//register current directory as the directory for static files
app.use(express.urlencoded({extended:true}));////allows you to say req.body and get the data sent from a form
const mysql = require("mysql2");

// Create connection to music_reviews database
// Update the password below to match your MySQL root password
const conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"mysql",
    database:"music_reviews",
    port:3306
});

conn.connect(function(err)
{
    if(err)
        console.log("Couldn't connect to MySQL",err);
    else
        console.log("Database connection established");
});

// Serve static HTML files
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/selectreview.html");
});

app.get("/musicreview.html", function(req, res) {
    res.sendFile(__dirname + "/musicreview.html");
});

app.get("/selectreview.html", function(req, res) {
    res.sendFile(__dirname + "/selectreview.html");
});

app.get("/view_reviews.html", function(req, res) {
    res.sendFile(__dirname + "/view_reviews.html");
});

// API Routes

// Get all artists for dropdown
app.get("/api/artists", function(req, res) {
    const sql = "SELECT DISTINCT artist_id, artist_name FROM artists ORDER BY artist_name ASC";
    conn.query(sql, function(err, rows) {
        if(err) {
            console.log("Error fetching artists:", err);
            res.status(500).json({error: "Failed to fetch artists"});
        } else {
            res.json(rows);
        }
    });
});

// Get artist information by ID
app.get("/api/artist/:id", function(req, res) {
    const artistId = req.params.id;
    const sql = "SELECT * FROM artists WHERE artist_id = ?";
    conn.query(sql, [artistId], function(err, rows) {
        if(err) {
            console.log("Error fetching artist:", err);
            res.status(500).json({error: "Failed to fetch artist"});
        } else if(rows.length === 0) {
            res.status(404).json({error: "Artist not found"});
        } else {
            res.json(rows[0]);
        }
    });
});

// Get all reviews for a specific artist
app.get("/api/reviews/:artistId", function(req, res) {
    const artistId = req.params.artistId;
    const sql = `
        SELECT 
            r.review_id,
            r.review_title,
            r.review_description,
            r.star_rating,
            r.created_at,
            rev.reviewer_name,
            t.track_title,
            t.track_length,
            t.track_artwork,
            a.artist_name,
            a.artist_picture
        FROM reviews r
        JOIN reviewers rev ON r.reviewer_id = rev.reviewer_id
        JOIN tracks t ON r.track_id = t.track_id
        JOIN artists a ON r.artist_id = a.artist_id
        WHERE r.artist_id = ?
        ORDER BY r.created_at DESC
    `;
    
    conn.query(sql, [artistId], function(err, rows) {
        if(err) {
            console.log("Error fetching reviews:", err);
            res.status(500).json({error: "Failed to fetch reviews"});
        } else {
            res.json(rows);
        }
    });
});

// Submit a new review
app.post("/submit-review", function(req, res) {
    const {
        artistId, artistName, artistDescription, artistPicture,
        albumId, albumTitle,
        trackTitle, trackLength, trackArtwork,
        reviewerId, reviewerName,
        reviewTitle, reviewDescription, starRating
    } = req.body;

    // Start a transaction
    conn.beginTransaction(function(err) {
        if(err) {
            console.log("Error starting transaction:", err);
            return res.status(500).json({error: "Database error"});
        }

        // Insert or update artist
        const artistSql = `
            INSERT INTO artists (artist_id, artist_name, artist_description, artist_picture) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            artist_name = VALUES(artist_name),
            artist_description = VALUES(artist_description),
            artist_picture = VALUES(artist_picture)
        `;
        
        conn.query(artistSql, [artistId, artistName, artistDescription, artistPicture], function(err) {
            if(err) {
                console.log("Error inserting artist:", err);
                return conn.rollback(function() {
                    res.status(500).json({error: "Failed to save artist information"});
                });
            }

            // Insert or update album
            const albumSql = `
                INSERT INTO albums (album_id, album_title, artist_id) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                album_title = VALUES(album_title),
                artist_id = VALUES(artist_id)
            `;
            
            conn.query(albumSql, [albumId, albumTitle, artistId], function(err) {
                if(err) {
                    console.log("Error inserting album:", err);
                    return conn.rollback(function() {
                        res.status(500).json({error: "Failed to save album information"});
                    });
                }

                // Insert or update track
                const trackSql = `
                    INSERT INTO tracks (track_title, track_length, track_artwork, album_id, artist_id) 
                    VALUES (?, ?, ?, ?, ?) 
                    ON DUPLICATE KEY UPDATE 
                    track_title = VALUES(track_title),
                    track_length = VALUES(track_length),
                    track_artwork = VALUES(track_artwork),
                    album_id = VALUES(album_id),
                    artist_id = VALUES(artist_id)
                `;
                
                conn.query(trackSql, [trackTitle, trackLength, trackArtwork, albumId, artistId], function(err, result) {
                    if(err) {
                        console.log("Error inserting track:", err);
                        return conn.rollback(function() {
                            res.status(500).json({error: "Failed to save track information"});
                        });
                    }

                    const trackId = result.insertId || req.body.trackId;

                    // Insert or update reviewer
                    const reviewerSql = `
                        INSERT INTO reviewers (reviewer_id, reviewer_name) 
                        VALUES (?, ?) 
                        ON DUPLICATE KEY UPDATE 
                        reviewer_name = VALUES(reviewer_name)
                    `;
                    
                    conn.query(reviewerSql, [reviewerId, reviewerName], function(err) {
                        if(err) {
                            console.log("Error inserting reviewer:", err);
                            return conn.rollback(function() {
                                res.status(500).json({error: "Failed to save reviewer information"});
                            });
                        }

                        // Insert review
                        const reviewSql = `
                            INSERT INTO reviews (review_title, review_description, star_rating, reviewer_id, track_id, artist_id) 
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;
                        
                        conn.query(reviewSql, [reviewTitle, reviewDescription, starRating, reviewerId, trackId, artistId], function(err, result) {
                            if(err) {
                                console.log("Error inserting review:", err);
                                return conn.rollback(function() {
                                    res.status(500).json({error: "Failed to save review"});
                                });
                            }

                            // Commit transaction
                            conn.commit(function(err) {
                                if(err) {
                                    console.log("Error committing transaction:", err);
                                    return conn.rollback(function() {
                                        res.status(500).json({error: "Database error"});
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: "Review submitted successfully!",
                                    reviewId: result.insertId
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Handle view reviews route
app.get("/view-reviews", function(req, res) {
    const artistId = req.query.artistId;
    if(!artistId) {
        return res.status(400).send("Artist ID is required");
    }
    res.redirect(`/view_reviews.html?artistId=${artistId}`);
});

// Error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({error: "Something went wrong!"});
});

// 404 handler
app.use(function(req, res) {
    res.status(404).send("Page not found");
=======
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
>>>>>>> e7e4a00436e5f9e7bb9f580151c458e98d218b6e
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
<<<<<<< HEAD
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see the music review system`);
});
=======
  console.log(`Listening on port ${PORT}...`);
});


>>>>>>> e7e4a00436e5f9e7bb9f580151c458e98d218b6e
