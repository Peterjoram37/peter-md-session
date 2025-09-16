// pair.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { makeid } = require('./id');
const pino = require('pino');
const { default: Venocyber_Tech, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');

const router = express.Router();
const TEMP_DIR = path.join(__dirname, 'temp');

router.get('/:name?/:number?', async (req, res) => {
  const name = req.params.name || makeid(6);
  const numRaw = req.params.number || req.query.number;
  if (!numRaw) {
    return res.status(400).json({ error: 'Number is required' });
  }
  const num = numRaw.replace(/[^0-9]/g, '');

  const sessionPath = path.join(TEMP_DIR, name);
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const sock = Venocyber_Tech({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ["Chrome (Linux)", "", ""],
  });

  sock.ev.on('creds.update', saveCreds);

  try {
    if (!state.creds.registered) {
      await delay(1500);
      const code = await sock.requestPairingCode(num);
      res.json({ code });
    }

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        await delay(5000);
        const credsFile = path.join(sessionPath, 'creds.json');
        const data = fs.readFileSync(credsFile);
        const b64 = Buffer.from(data).toString('base64');
        const sessionIdPath = path.join(TEMP_DIR, `${name}.session`);
        fs.writeFileSync(sessionIdPath, b64, 'utf8');
        // you might send message inside if needed
        // close socket
        await delay(2000);
        sock.ws.close();
        // remove folder of that session if you want
      }
      if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
        console.log('Pair reconnecting ...');
        setTimeout(async () => {
          // optionally retry
        }, 10000);
      }
    });
  } catch (err) {
    console.error("Pair error:", err);
    if (!res.headersSent) {
      res.json({ error: "Service Unavailable" });
    }
  }
});

module.exports = router;
