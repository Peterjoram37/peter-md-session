const express = require('express');
const path = require('path');
const pairRouter = require('./pair');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname));
app.use('/pair', pairRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
