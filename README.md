
# Peter-MD Session

A simple **WhatsApp Session Generator** powered by **Baileys MD** and **Express.js**.  
This project helps you generate a **QR Code** or **Pairing Code** to get your WhatsApp **session ID** for deploying bots.
### Pair Code Page



---

## 🚀 Features
- Generate **WhatsApp QR Code** for login.
- Generate **Pairing Code** using your phone number.
- Get **base64 session ID** ready to use.
- Built with:
  - [Node.js](https://nodejs.org/)
  - [Express.js](https://expressjs.com/)
  - [Baileys MD](https://github.com/whiskeysockets/baileys)

---

## 🛠️ Installation (Local)

1. **Clone repo**
   ```bash
   git clone https://github.com/Peterjoram37/peter-md-session.git
   cd peter-md-session
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run app**

   ```bash
   npm start
   ```

4. App will run at:

   ```
   http://localhost:5000
   ```

---

## 🌐 Deployment on Render

1. Fork / push this repo to your own GitHub.

2. Connect repo to [Render](https://render.com).

3. Make sure you have a `render.yaml` file in root:

   ```yaml
   services:
     - type: web
       name: peter-md-session
       env: node
       plan: free
       buildCommand: "npm install"
       startCommand: "npm start"
   ```

4. Deploy 🚀

---

## 📸 Screenshots


---

## 📜 Credits

* **Peter Joram** – Maintainer
* **Baileys MD** – WhatsApp Web API
* Special thanks to open-source contributors ❤️

---

## ⭐ Support

If you like this project, please **give it a star ⭐** on GitHub!

```

---
