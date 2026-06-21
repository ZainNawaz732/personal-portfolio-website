# Portfolio Contact Backend

A small Express + Nodemailer API that powers the contact form on Zain Nawaz's portfolio.

## What it does
- Exposes `POST /api/contact` — validates the form and emails the message to your inbox.
- Exposes `GET /api/health` — quick check that the server is alive.
- Rate-limited (5 submissions / 10 min per IP) and CORS-protected.

## Setup (local)

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Create your `.env`**
   - Copy `.env.example` to `.env`
   - Fill in your Gmail and a **Gmail App Password** (see below)

3. **Get a Gmail App Password** (required — your normal password won't work)
   - Enable 2-Step Verification: https://myaccount.google.com/security
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Copy the 16-character password into `MAIL_PASS` in `.env`

4. **Run the server**
   ```bash
   npm start      # or: npm run dev  (auto-restarts on change)
   ```
   You should see: `✅ Server running on http://localhost:5000`

5. **Test it** — open your portfolio (`index.html`) and submit the contact form.
   The message should arrive in your inbox.

## Deploying (so it works on your live site)

GitHub Pages can't run this server. Host it free on **Render** or **Railway**:

1. Push this `server/` folder to a repo (or the same repo).
2. On [render.com](https://render.com): New → Web Service → connect repo.
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add the same `.env` variables in Render's "Environment" tab.
3. After deploy you'll get a URL like `https://your-app.onrender.com`.
4. In `../main.js`, change `API_URL` to `https://your-app.onrender.com/api/contact`.

## Environment variables
| Var | Description |
|-----|-------------|
| `PORT` | Port to run on (default 5000) |
| `MAIL_USER` | Your Gmail address (sends the mail) |
| `MAIL_PASS` | Gmail **App Password** (16 chars) |
| `MAIL_TO` | Where messages are delivered (defaults to MAIL_USER) |
| `ALLOWED_ORIGINS` | Comma-separated front-end origins for CORS |
