const express = require('express');
const fs = require('fs-extra');
const { makeid } = require('./id');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require('@sampandey001/baileys');

const router = express.Router();

function removeFolder(folderPath) {
  if (fs.existsSync(folderPath)) fs.rmSync(folderPath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const number = req.query.number;
  if (!number) return res.json({ error: "Number is required" });

  const id = makeid();
  const sessionFolder = `./temp/${id}`;
  await fs.ensureDir(sessionFolder);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
      },
      printQRInTerminal: false,
      logger: pino({ level: 'fatal' }),
      browser: ["Chrome (Node)", "", ""]
    });

    sock.ev.on('connection.update', async update => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        await delay(2000);
        const creds = fs.readFileSync(`${sessionFolder}/creds.json`);
        const sessionId = Buffer.from(creds).toString('base64');

        if (!res.headersSent) res.json({ sessionId });

        await sock.ws.close();
        removeFolder(sessionFolder);
      }

      if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
        await delay(5000);
        router.handle(req, res);
      }
    });

    sock.ev.on('creds.update', saveCreds);
    await sock.requestPairingCode(number.replace(/[^0-9]/g, ''));

  } catch (err) {
    console.log(err);
    removeFolder(sessionFolder);
    if (!res.headersSent) res.json({ error: "Service Unavailable" });
  }
});

module.exports = router;
