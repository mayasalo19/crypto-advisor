# Crypto Advisor 🚀

Crypto Advisor is a full-stack web application designed to help users track cryptocurrency markets, manage investment preferences, read tailored news, and receive market insights and community sentiment updates.

---

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, Axios, Tailwind CSS
- **Backend:** FastAPI (Python), JWT Authentication
- **Database:** PostgreSQL 
- **Hosting & Deployment:**
  - Client: [Vercel](https://vercel.com)
  - Server: [Render](https://render.com)

---

## ✨ Features

- **User Authentication:** Secure JWT-based registration and login system.
- **Personalized Dashboard:** Tailored views based on investor type and favorite assets.
- **Market Data & News:** Live crypto price tracking and currency-specific news aggregation.
- **AI-Powered Market Insights:** Actionable sentiment analysis and recommendations based on investor profile.
- **Community Feed:** Daily crypto memes with an upvote/downvote feedback system.

---

## 📂 Project Structure

```text
crypto-advisor/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── services/       # API layer (Axios & Fetch wrappers)
│   │   ├── components/     # UI components
│   │   └── App.tsx         # Main application entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # FastAPI backend
│   ├── main.py             # API endpoints and middleware configuration
│   ├── database.py         # DB connection and models
│   └── requirements.txt    # Python dependencies
│
└── README.md