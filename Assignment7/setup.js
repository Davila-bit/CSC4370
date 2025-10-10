const mysql = require("mysql2");
const fs = require("fs");

// Create connection to MySQL (without specifying database first)
// Update the password below to match your MySQL root password
const conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"mysql",
    port:3306
});

console.log("Setting up Music Review System Database...");

conn.connect(function(err) {
    if(err) {
        console.log("Couldn't connect to MySQL:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL");
    
    // Read and execute the SQL schema
    const sqlSchema = fs.readFileSync('music_reviews_schema.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlSchema.split(';').filter(stmt => stmt.trim().length > 0);
    
    let completed = 0;
    const total = statements.length;
    
    statements.forEach((statement, index) => {
        conn.query(statement, function(err) {
            if(err) {
                console.log(`Error executing statement ${index + 1}:`, err.message);
            } else {
                console.log(`✓ Executed statement ${index + 1}/${total}`);
            }
            
            completed++;
            if(completed === total) {
                console.log("\n🎉 Database setup complete!");
                console.log("You can now run: npm start");
                conn.end();
            }
        });
    });
});
