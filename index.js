const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

// Import routes
const pairRouter = require('./pair'); // backend session generation

// Set global path
const __path = process.cwd();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/paircode', pairRouter); // backend for pairing

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'pair.html')); // frontend for pairing
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'main.html')); // main homepage
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
