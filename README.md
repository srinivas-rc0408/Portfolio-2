# ⚡ Srinivas R C — Terminal Portfolio

The personal portfolio of **Srinivas R C**, an AI/ML Engineer from Bengaluru, India — built as a fully interactive terminal. Type commands, chat with a custom AI assistant, view and download documents in-page, and manage every word of content from a built-in admin panel.

_Developed and maintained solely by Srinivas R C._

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-e10098)](https://www.framer.com/motion/)

---

## ✨ What visitors get

- **Cinematic boot sequence** — a lightning-bolt logo traced in the site's theme color, then a terminal typing `Compiling Profile: Srinivas RC...` — 3.0 seconds, every reload.
- **A real terminal** — `help`, `about`, `projects`, `skills`, `cd <section>`, tab completion, command history, easter-egg commands, even a playable game (`play archman`).
- **Jerry, the AI assistant** — type `jerry` for a floating glassmorphism chat. Jerry answers questions about Srinivas from a resume-grounded knowledge base, summarizes projects/skills/experience, opens the resume viewer on request, and streams answers token-by-token from an edge runtime.
- **In-page document viewer** — resume, CV and certificates open in a frosted-glass popup with a branded download (`Srinivas RC's Resume.pdf`).
- **Details everywhere** — glossy R·G·B window dots, theme-accent scrollbars that auto-hide, a slide-up left-panel footer with social links, a floating Quote of the Day, and buttery framer-motion transitions throughout.

## 🛠️ Admin panel (`/admin`)

Everything a recruiter sees is editable without touching code:

| Area | What's editable |
|---|---|
| Global Settings | Display name, professional title, professional summary, profile photo (drag-and-drop), site-wide theme accent (presets + custom color) |
| Resume / CV | Drag-and-drop PDF upload — replaces the live document instantly |
| Projects / Certificates | Drag-and-drop uploads + full CRUD with per-entry **public/private** toggles |
| Education / Experience / Achievements / Connect | Full CRUD, same privacy controls |

Changes propagate to every open visitor session within ~10 seconds (visible-tab polling), and to new loads instantly (`no-store` APIs).

## 🔐 Security

- Signed httpOnly JWT sessions; **the app refuses to boot in production without `AUTH_SECRET`**
- bcrypt-hashed passwords, constant-time admin credential comparison
- Per-IP rate limiting on login, registration, and the AI endpoint (plus a 10/day client cap)
- Parameterized SQL everywhere (Neon serverless driver)
- Security headers: HSTS (preload), `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, COOP, `nosniff`; `X-Powered-By` disabled
- Upload size caps enforced client-side **and** server-side (HTTP 413)

## 🚀 Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Data | Neon Postgres (serverless), lazy schema + seed |
| AI | Three-tier fallback: NVIDIA (Llama) → NVIDIA → Google Gemini, streaming over an Edge route |
| Auth | jose (JWT), bcryptjs |

## 🏁 Getting started

```bash
git clone https://github.com/srinivas-rc0408/Portfolio-2.git
cd Portfolio-2
npm install
cp .env.example .env.local   # fill in every value
npm run dev                  # http://localhost:3000
```

### Required environment variables

All documented in [`.env.example`](.env.example):

- `DATABASE_URL` — Neon Postgres connection string (schema auto-creates + seeds on first run)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin panel credentials (server-side only)
- `AUTH_SECRET` — session signing secret (`openssl rand -base64 48`); **required in production**
- `NVIDIA_API_KEY_1` / `NVIDIA_API_KEY_2` / `GEMINI_API_KEY` — AI fallback tiers (any subset works)

### Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## ☁️ Deployment

Built for Vercel (or any Node host via `output: "standalone"`):

1. Import the repo into Vercel
2. Add the environment variables above
3. Deploy — the Neon schema creates and seeds itself on first request

The AI chat route runs on the **Edge runtime** for minimal cold-start latency; all content APIs send `Cache-Control: no-store` so admin edits are never stale behind a CDN.

## 🧾 License

MIT — see [LICENSE](LICENSE).

---

**© 2026 Srinivas R C — AI/ML Engineer, Bengaluru** · Developed and maintained solely by Srinivas R C · [srinivasrc01@gmail.com](mailto:srinivasrc01@gmail.com) · [github.com/srinivas-rc0408](https://github.com/srinivas-rc0408)
