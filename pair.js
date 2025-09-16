const express = require('express');
const fs = require('fs');
const { makeid } = require('./id');
const pino = require('pino');
const { default: Venocyber_Tech, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');

const router = express.Router();

// Remove temp session folder
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid(6);
    let number = req.query.number;
    if (!number) return res.json({ error: "Number is required" });

    async function generateSession() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const sock = Venocyber_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }),
                browser: ["Chrome (Node)", "", ""]
            });

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === "open") {
                    await delay(2000);
                    const credsPath = `./temp/${id}/creds.json`;
                    const data = fs.readFileSync(credsPath);
                    const sessionId = Buffer.from(data).toString('base64');

                    if (!res.headersSent) res.json({ sessionId });

                    await sock.ws.close();
                    await removeFile(`./temp/${id}`);
                }

                if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(5000);
                    generateSession();
                }
            });

            sock.ev.on('creds.update', saveCreds);

            number = number.replace(/[^0-9]/g, '');
            await sock.requestPairingCode(number);

        } catch (err) {
            console.log("Error generating session:", err);
            await removeFile(`./temp/${id}`);
            if (!res.headersSent) res.json({ error: "Service Unavailable" });
        }
    }

    return generateSession();
});

module.exports = router;
