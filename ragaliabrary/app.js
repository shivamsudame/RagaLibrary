require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const expressLayouts = require('express-ejs-layouts');
const path = require('path'); // Ensure 'path' is required

const app = express();
const PORT = process.env.PORT || 3000;
console.log('=======================================>Current directory:', __dirname);

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure the path is set correctly
app.set('view cache', false); // Disable EJS caching

// Use express-ejs-layouts
app.use(expressLayouts); // This should come before the routes
app.set('layout', 'layout'); // Set the default layout
console.log('=======================================>Layout path:', path.join(__dirname, 'views', 'layout.ejs'));

// Middleware to log requested URL
app.use((req, res, next) => {
    console.log("=======================================>Request URL:", req.originalUrl); // Log the requested URL
    next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Create MySQL connection
// Create MySQL connection using promises
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // your MySQL username
    password: 'Shivam123!', // your MySQL password
    database: 'ragalibrary',
}); // Add .promise() here to use the promise-based API


// Session Middleware
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
}));

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('MySQL Connected');
    }
});

// Pass the database connection to routes
app.use('/', routes(db));

// Add favorite/unfavorite routes
app.post('/raga/favorite/:id', async (req, res) => {
    const ragaId = req.params.id;
    const userId = req.session.userId;

    try {
        const query = 'INSERT INTO favorites (user_id, raga_id) VALUES (?, ?)';
        await db.query(query, [userId, ragaId]);
        res.redirect('/raga');
    } catch (err) {
        console.error('Error adding favorite:', err);
        return res.status(500).send('Error adding favorite');
    }
});

app.post('/raga/unfavorite/:id', async (req, res) => {
    const ragaId = req.params.id;
    const userId = req.session.userId;

    try {
        const query = 'DELETE FROM favorites WHERE user_id = ? AND raga_id = ?';
        await db.query(query, [userId, ragaId]);
        res.redirect('/raga');
    } catch (err) {
        console.error('Error removing favorite:', err);
        return res.status(500).send('Error removing favorite');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
