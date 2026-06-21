/* =========================================================
   Zain Nawaz — Portfolio Contact Backend
   Express + Nodemailer API
   ========================================================= */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ---- middleware ---- */
app.use(express.json({ limit: '10kb' }));

// Allow requests only from your front-end origins (comma-separated in .env)
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow tools like curl/postman (no origin) and any whitelisted origin
      if (!origin || allowed.length === 0 || allowed.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
  })
);

// Limit each IP to 5 contact submissions per 10 minutes
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please try again later.' },
});

/* ---- mail transporter ---- */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password (NOT your normal password)
  },
});

/* ---- helpers ---- */
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean = (s = '') => String(s).trim();

/* ---- routes ---- */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'Server is running 🚀' });
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const subject = clean(req.body.subject) || 'New message from portfolio';
    const message = clean(req.body.message);

    // validation
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ ok: false, error: 'Name, email, and message are required.' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ ok: false, error: 'Message is too long.' });
    }

    // send the email to yourself
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO || process.env.MAIL_USER,
      replyTo: `"${name}" <${email}>`,
      subject: `📩 ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#00e5ff,#7c5cff);padding:20px 24px;color:#04060f">
            <h2 style="margin:0">New Portfolio Message</h2>
          </div>
          <div style="padding:24px;color:#222">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
            <p style="white-space:pre-wrap">${message}</p>
          </div>
        </div>
      `,
    });

    return res.json({ ok: true, message: "Thanks! Your message has been sent. I'll get back to you soon." });
  } catch (err) {
    console.error('Contact error:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
