// index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const qrRouter = require('./qr');
const pairRouter = require('./pair');
const sessionRouter = require('./session');

const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/qr', qrRouter);
app.use('/paircode', pairRouter);
app.use('/session', sessionRouter);

app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
