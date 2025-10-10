const express = require("express"); //imports the express module
const app = express(); //creates the express application object
app.use(express.json());//allows you to say req.body and get the data sent in the body of the msg
app.use(express.static("."));//register current directory as the directory for static files
app.use(express.urlencoded({extended:true}));////allows you to say req.body and get the data sent from a form
const mysql = require("mysql2");

// Create connection to music_reviews database
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see the music review system`);
});