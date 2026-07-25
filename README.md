# ⚡ NanoLink — Next-Generation URL Shortener & QR Code Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash%20%7C%20Cloud-DC382D?logo=redis&logoColor=white)](https://redis.io/)

**NanoLink** is a powerful, high-throughput URL shortening and dynamic QR code generation platform designed for modern marketing teams, developers, and creators. Built with a sleek glassmorphic UI and an enterprise-grade backend, NanoLink offers real-time click tracking, automated tiered quotas, Razorpay billing integration, and zero-configuration local development fallbacks.

---

## ✨ Key Features

### 🔗 High-Performance URL Shortening
- **Instant Redirect Engine**: Optimized redirect handler (`/r/:slug`) with sub-millisecond response times.
- **Custom Back-Halves**: Branded, memorable slugs tailored to your campaigns.
- **Bot & Scraper Protection**: Dedicated high-frequency redirect rate limiters to protect links from scraper abuse while keeping human traffic instant.

### 📱 Dynamic QR Code Studio
- **Custom Brand Aesthetics**: Personalize foreground/background colors and embed center logos.
- **Multi-Format Export**: Download high-resolution PNG or vector SVG files instantly.
- **Scan Tracking**: Integrated analytics to track scan volume alongside link clicks.

### 📊 Real-Time Analytics & Reporting
- **Comprehensive Click Metrics**: Track total clicks, unique visitors, and temporal trends.
- **Audience Insights**: Detailed breakdown of geographical locations, device types, operating systems, and referrers.
- **One-Click CSV Export**: Easily export campaign performance data for offline analysis and reporting.

### 🛡️ Enterprise Security & Multi-Tiered Rate Limiting
- **Brute-Force Protection**: Dedicated authentication rate limiters (20 attempts / 15 mins) on login and signup endpoints.
- **Global API Protection**: Standardized rate headers (`RateLimit-*`) preventing DDoS and API exhaustion.
- **JWT & OAuth Authentication**: Secure stateless JWT sessions combined with Google OAuth 2.0 integration.

### 💳 Tiered Subscriptions & Razorpay Billing
- **Dynamic Plan Quotas**: Support for Free, Pro, and Core tiers with configurable monthly limits on link creation, QR codes, and custom slugs.
- **Automated Quota Resets**: Intelligent monthly cycle validation and quota replenishment on authentication.
- **Seamless Checkout**: Integrated Razorpay payment gateway with HMAC-SHA256 signature verification for webhook events.

### 🛠️ Zero-Config Developer Fallbacks
- **Embedded MongoDB**: Automatically falls back to `mongodb-memory-server` if an external MongoDB URI is unreachable or set to `'memory'`.
- **In-Memory Redis Mock**: Automatically switches to `ioredis-mock` for caching and atomic click counting if Redis Cloud/Upstash is offline or unconfigured.

---

## 🏗️ System Architecture & Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Styling**: Vanilla CSS with modern custom properties, glassmorphism, smooth animations, and curated HSL palettes
- **State & HTTP**: React Context API (`AuthContext`) + Axios with automated token interception

### Backend
- **Runtime**: Node.js + [Express.js](https://expressjs.com/) (ES Modules)
- **Database**: [MongoDB](https://www.mongodb.com/) + Mongoose ODM
- **Caching & Counters**: [Redis](https://redis.io/) (`ioredis`) for high-speed click counter aggregation and caching
- **Authentication**: [Passport.js](https://www.passportjs.org/) (Google OAuth 2.0) + JSON Web Tokens (JWT)
- **Security**: `express-rate-limit`, `bcryptjs`, and CORS credential validation
- **Payments**: Razorpay Node SDK & Webhook Verification

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Saneajayy/NanoLink.git
cd NanoLink
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure environment variables:
```bash
cd backend
npm install
cp .env.example .env
```

*Note: You can run the backend immediately without configuring external MongoDB or Redis! If left blank or set to default in `.env`, NanoLink automatically spins up zero-config in-memory fallbacks.*

Start the backend development server:
```bash
npm run dev
```

The API server will launch on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

The web application will be available at `http://localhost:5173`.

---

## ⚙️ Environment Variables

An example `.env` file is provided in `backend/.env.example`. Key configuration options include:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend server listening port | `5000` |
| `CLIENT_URL` | Frontend application origin for CORS | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB Atlas or Local connection string | `mongodb+srv://...` (or `'memory'`) |
| `REDIS_URL` | Upstash / Redis Cloud connection string | `redis://default:...` (or `'mock'`) |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `supersecretnanolinkjwtkey2026` |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | `your_client_id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | `your_client_secret` |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID for billing | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret | `your_razorpay_secret` |

---

## 📈 API Overview

### Authentication & Users
- `POST /api/auth/signup` — Register a new user account (with password complexity validation)
- `POST /api/auth/login` — Authenticate user and return JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile and quota usage
- `GET /api/auth/google` — Initiate Google OAuth 2.0 authentication flow

### URL Shortening & Redirects
- `POST /api/links` — Create a new shortened link (supports custom slugs and expiration dates)
- `GET /api/links` — List all links created by the authenticated user
- `GET /r/:slug` — Public high-speed redirect endpoint

### QR Codes & Analytics
- `POST /api/qr/generate` — Generate custom QR code data and artwork
- `GET /api/analytics/:id` — Get detailed time-series and demographic click data for a link
- `GET /api/analytics/export` — Export campaign performance metrics to CSV

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

## 📄 License
This project is licensed under the MIT License.
