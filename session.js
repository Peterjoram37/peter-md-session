// session.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SESSIONS_DIR = path.join(__dirname, 'temp');

router.get('/:name?', (req, res) => {
  const name = req.params.name || 'session';
  const filePath = path.join(SESSIONS_DIR, `${name}.session`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, message: 'Session not found. Pair first.' });
  }
  const sessionId = fs.readFileSync(filePath, 'utf8');
  return res.json({ ok: true, sessionId });
});

module.exports = router;
