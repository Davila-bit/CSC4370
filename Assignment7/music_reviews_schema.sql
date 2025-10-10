-- Music Reviews Database Schema

CREATE DATABASE IF NOT EXISTS music_reviews;
USE music_reviews;

-- Artists table
CREATE TABLE artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    artist_name VARCHAR(255) NOT NULL,
    artist_description TEXT,
    artist_picture VARCHAR(500)
);

-- Albums table
CREATE TABLE albums (
    album_id INT AUTO_INCREMENT PRIMARY KEY,
    album_title VARCHAR(255) NOT NULL,
    artist_id INT,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id)
);

-- Tracks table
CREATE TABLE tracks (
    track_id INT AUTO_INCREMENT PRIMARY KEY,
    track_title VARCHAR(255) NOT NULL,
    track_length INT, -- in seconds
    track_artwork VARCHAR(500),
    album_id INT,
    artist_id INT,
    FOREIGN KEY (album_id) REFERENCES albums(album_id),
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id)
);

-- Reviewers table
CREATE TABLE reviewers (
    reviewer_id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_name VARCHAR(255) NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    review_title VARCHAR(255) NOT NULL,
    review_description TEXT,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    reviewer_id INT,
    track_id INT,
    artist_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES reviewers(reviewer_id),
    FOREIGN KEY (track_id) REFERENCES tracks(track_id),
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id)
);

-- Insert some sample data
INSERT INTO artists (artist_name, artist_description, artist_picture) VALUES
('Taylor Swift', 'American singer-songwriter known for her narrative songwriting', 'https://via.placeholder.com/300x300?text=Taylor+Swift'),
('The Weeknd', 'Canadian singer-songwriter and record producer', 'https://via.placeholder.com/300x300?text=The+Weeknd'),
('Billie Eilish', 'American singer-songwriter and musician', 'https://via.placeholder.com/300x300?text=Billie+Eilish');

INSERT INTO albums (album_title, artist_id) VALUES
('Midnights', 1),
('After Hours', 2),
('Happier Than Ever', 3);

INSERT INTO tracks (track_title, track_length, track_artwork, album_id, artist_id) VALUES
('Anti-Hero', 200, 'https://via.placeholder.com/200x200?text=Anti-Hero', 1, 1),
('Blinding Lights', 200, 'https://via.placeholder.com/200x200?text=Blinding+Lights', 2, 2),
('Bad Guy', 194, 'https://via.placeholder.com/200x200?text=Bad+Guy', 3, 3);

INSERT INTO reviewers (reviewer_name) VALUES
('Music Critic 1'),
('Music Critic 2'),
('Music Critic 3');
