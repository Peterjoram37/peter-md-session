// qr.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const pino = require('pino');
const { default: Venocyber_Tech, useMultiFileAuthState, Browsers, delay } = require('@whiskeysockets/baileys');

const router = express.Router();
const TEMP_DIR = path.join(__dirname, 'temp');

function removeFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}

router.get('/:name?', async (req, res) => {
  const name = req.params.name || makeid(6);
  const sessionPath = path.join(TEMP_DIR, name);
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const sock = Venocyber_Tech({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS("Desktop"),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !res.headersSent) {
      res.setHeader("Content-Type", "image/png");
      const qrBuffer = await QRCode.toBuffer(qr);
      return res.end(qrBuffer);
    }

    if (connection === 'open') {
      try {
        await delay(5000);
        const credsFile = path.join(sessionPath, 'creds.json');
        const data = fs.readFileSync(credsFile);
        const b64 = Buffer.from(data).toString('base64');
        // Save the base64 as session file
        const sessionIdPath = path.join(TEMP_DIR, `${name}.session`);
        fs.writeFileSync(sessionIdPath, b64, 'utf8');

      } catch (err) {
        console.error('Error generating session after open:', err);
      }
      // close after some delay
      await delay(2000);
      sock.ws.close();
      removeFolder(sessionPath);
    }

    if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
      console.log('Reconnecting QR session in 10s...');
      setTimeout(async () => {
        // recall same route
        // you may want to spawn new sock
      }, 10000);
    }
  });
});

module.exports = router;
