# 🚀 OmniBot SaaS: 100% Free & Unlimited Multi-Tenant AI Chatbot & WhatsApp Platform

A production-ready, self-service SaaS platform (similar to Chatzy, ManyChat, and Wati) where any business or client can register, create custom AI bots, train them on their business knowledge, embed a lightweight Shadow DOM widget on any website with 1 line of code, and connect WhatsApp automation — with **₹0 infrastructure cost** from development to global deployment.

---

## 🏗️ 100% Free Technology Stack

| Layer | Technology | Free Tier Capacity | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend & Client Dashboard** | React + Vite + Tailwind CSS / Vanilla CSS | Unlimited bandwidth, global CDN (Vercel / Cloudflare Pages) | **₹0 Free** |
| **Universal Embed Widget** | Vanilla JS + Encapsulated Shadow DOM (`widget.js` < 15KB) | Hosted on Vercel / Cloudflare Global Edge | **₹0 Free** |
| **Backend & Webhook API** | Node.js (Express) | Render.com Web Service / Koyeb Free Container | **₹0 Free** |
| **Database & Storage** | Supabase (PostgreSQL + Auth) + Local JSON Fallback | 500MB DB, 50,000 monthly active users, Realtime | **₹0 Free** |
| **AI Intelligence (LLM)** | Google Gemini API (`gemini-2.0-flash` / `1.5-flash`) | 1,500 free requests/day per key, high token limit | **₹0 Free** |
| **WhatsApp Automation** | Meta Cloud API (1k free convos) + Baileys QR Engine | Unlimited QR connections via open-source Node.js | **₹0 Free** |

---

## 🧩 Architecture & Key Features

- **Multi-Tenant AI Bot Builder:** Create unlimited chatbots with custom avatars, theme colors, greetings, and system instructions.
- **RAG Knowledge Base Trainer:** Train bots on markdown/text business FAQs, pricing matrices, return policies, and service catalogs.
- **Live AI Sandbox Playground:** Test chatbot responses in real time with prompt engineering guardrails.
- **1-Click Universal Embed Code:** Generates script tags for HTML/PHP, React, Next.js, WordPress, Shopify, and Webflow.
- **Dual WhatsApp Integration:**
  - **Baileys QR Engine:** 100% free unlimited personal/business WhatsApp QR pairing.
  - **Meta Cloud API Webhook:** Official business API with 1,000 free conversations/month.
- **Autonomous Lead Extraction (CRM):** Automatically parses visitor names, phone numbers, and email addresses from chat messages and logs them into a lead management pipeline.
- **CSV / Excel Export:** 1-click export of captured leads.
- **Direct 1-Click WhatsApp Reply:** Message qualified leads instantly via `https://wa.me/PHONE`.

---

## 🛠️ Quick Start & Local Development

### 1. Clone & Setup Backend
```bash
cd backend
npm install
node server.js
```
The backend will start at `http://localhost:5000`.

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The dashboard will open at `http://localhost:3000`.

---

## 🌐 1-Line Embed Widget Usage

Add the following snippet right before your closing `</body>` tag on any website:

```html
<script 
  src="https://your-domain.com/widget.js" 
  data-bot-id="YOUR_BOT_ID" 
  async>
</script>
```

---

## 🚀 Free Production Deployment Guide

1. **AI Brain:** Get your free API key at [Google AI Studio](https://aistudio.google.com/).
2. **Database:** Create a free project at [Supabase](https://supabase.com/) and run `backend/config/schema.sql`.
3. **Backend:** Deploy `backend/` to [Render.com](https://render.com/) as a free Web Service.
4. **Frontend:** Deploy `frontend/` to [Vercel](https://vercel.com/) by connecting your GitHub repo.
