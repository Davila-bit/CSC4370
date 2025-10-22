const express = require("express"); //imports the express module
const app = express(); //creates the express application object
const mysql = require("mysql2");
const conn = mysql.createConnection({host:"localhost",user:"root",password:"mysql",database:"review",port:3306});

// Test the connection
conn.connect(function(err) {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database successfully!');
});
const session = require('express-session');
const path = require('path');

app.use(express.json());//allows you to say req.body and get the data sent in the body of the msg
app.use(express.static(".")); // Serve static files from current directory
app.use(express.urlencoded({extended: true}));////allows you to say req.body and get the data from a form

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to false for development
}));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Check authentication status
app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.userId });
    } else {
        res.json({ loggedIn: false });
    }
});

//action for your form to be /login
app.post('/login', (req, res) => 
{
    const { userName, password } = req.body;
    let qry = `SELECT userName FROM user WHERE userName = ? AND password = MD5(?)`;
    console.log("in login post method");
    console.log(qry);
    
    conn.query(qry, [userName, password], function(err, rows)
    {	
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error occurred');
            return;
        }
        
        if (rows.length > 0)
        {
            req.session.userId = userName; 
            console.log('Login successful for:', userName);
            res.send(`Login Successful: ${userName}`);
        }	
        else 
        {	
            console.log('Login failed for:', userName);			
            res.send(`The username or password was incorrect! Login <a href="login.html"> HERE </a>`);
        }
    });
});

app.post('/signup', (req, res) =>
{
    const { userName, password } = req.body;
    let qry = `SELECT userName FROM user WHERE userName = ?`;
    console.log("Inside signup");
    console.log(qry);
    
    conn.query(qry, [userName], function(err, rows)
    {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error occurred');
            return;
        }
        
        console.log(rows);
        if (rows.length > 0)
        {
            res.send("<H6>the username is already taken. please choose another one <a href='signup.html'> HERE </a></H6>");	
        }	
        else 
        {	
            let insertQry = 'INSERT INTO user (userName, password) VALUES (?, MD5(?))';
            conn.query(insertQry, [userName, password], (err, result) =>
            {
                if(err)
                {
                    console.log("there was an error in your query", err);
                    res.status(500).send('Database error occurred');
                }
                else
                {
                    res.send(`Welcome to the site ${userName}! Login <a href="login.html"> HERE </a>`);
                }	
            }); 
        }
    });
});

app.get('/logout', (req, res) =>
{
    if(req.session.userId)
    {
        req.session.destroy((err) => 
        {
            if (err) 
            {
              // Handle any errors during session destruction
              console.error('Error destroying session:', err);
              return res.status(500).send('Error during logout');
            }
            else
            {
                res.send(`<p>Logout Successful</p>`);
            }
        });
    }
    else
    {
        res.send(`<p>You are not logged in</p>`);
    }
});

// Get all reviews
app.get('/reviews', (req, res) => {
    let qry = `SELECT r.id, r.title, r.content, r.rating, r.author, r.created_at 
               FROM reviews r 
               ORDER BY r.created_at DESC`;
    
    conn.query(qry, function(err, rows) {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error occurred' });
            return;
        }
        
        // Add delete button visibility based on current user
        const reviews = rows.map(review => ({
            ...review,
            canDelete: req.session.userId === review.author
        }));
        
        res.json(reviews);
    });
});

// Add a new review
app.post('/addreview', (req, res) => {
    if (!req.session.userId) {
        res.status(401).send('You must be logged in to add a review');
        return;
    }
    
    const { title, rating, content } = req.body;
    let qry = `INSERT INTO reviews (title, content, rating, author, created_at) 
               VALUES (?, ?, ?, ?, NOW())`;
    
    conn.query(qry, [title, content, rating, req.session.userId], function(err, result) {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error occurred');
            return;
        }
        
        res.send('Review added successfully!');
    });
});

// Delete a review (only if user is the author)
app.post("/deletereview", function(req, res)
{
    if (!req.session.userId) {
        res.status(401).send('You must be logged in to delete a review');
        return;
    }
    
    const { reviewId } = req.body;
    
    // First check if the review exists and if the user is the author
    let checkQry = `SELECT author FROM reviews WHERE id = ?`;
    conn.query(checkQry, [reviewId], function(err, rows) {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error occurred');
            return;
        }
        
        if (rows.length === 0) {
            res.status(404).send('Review not found');
            return;
        }
        
        if (rows[0].author !== req.session.userId) {
            res.status(403).send('You can only delete your own reviews');
            return;
        }
        
        // Delete the review
        let deleteQry = `DELETE FROM reviews WHERE id = ?`;
        conn.query(deleteQry, [reviewId], function(err, result) {
            if (err) {
                console.error('Database error:', err);
                res.status(500).send('Database error occurred');
                return;
            }
            
            res.send('Review deleted successfully!');
        });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});