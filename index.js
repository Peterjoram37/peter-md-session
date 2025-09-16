const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pairRouter = require('./pair');

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
app.use('/paircode', pairRouter); // backend for sessionId
app.get('/pair', (req,res)=> res.sendFile(path.join(__dirname,'pair.html')));
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'main.html')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
