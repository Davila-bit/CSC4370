-- Database schema for Review Website
-- Run this SQL to create the required tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS review;
USE review;

-- Create user table for authentication
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    author VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author) REFERENCES user(userName) ON DELETE CASCADE
);

-- Insert some sample data for testing
INSERT INTO user (userName, password) VALUES 
('admin', MD5('password123')),
('reviewer1', MD5('review123')),
('testuser', MD5('test123'));

INSERT INTO reviews (title, content, rating, author) VALUES 
('Great Product!', 'This product exceeded my expectations. Highly recommended!', 5, 'admin'),
('Good Value', 'Good quality for the price. Would buy again.', 4, 'reviewer1'),
('Average Experience', 'It was okay, nothing special but not bad either.', 3, 'testuser'),
('Amazing Service', 'The customer service was outstanding. Very helpful staff.', 5, 'admin');
