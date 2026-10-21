# NexaPrime Ratings — Store Rating Platform

A full-stack web application where users discover and rate stores, store owners monitor their rating metrics, and the platform runs on a clean role-based architecture.

---

## 🗂️ Project Structure

```
Store-Rating/
├── backend/          # Express.js REST API (Node.js + MongoDB)
│   ├── src/
│   │   ├── config/         # Database connection (Mongoose)
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # Auth & role guards, error handler
│   │   ├── models/         # Mongoose schemas (User, Store, Rating)
│   │   ├── routes/         # Express route definitions
│   │   └── utils/          # JWT generator, input validators
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   └── src/server.js       # Entry point
│
└── frontend/         # React 18 + Vite SPA
    ├── src/
    │   ├── components/     # Navbar, DashboardLayout, StarRating, etc.
    │   ├── context/        # AuthContext (JWT + user state)
    │   ├── pages/          # Login, Register, UserDashboard, OwnerDashboard
    │   ├── services/       # Axios API client
    │   └── utils/          # Client-side validators, error helpers
    ├── index.html
    └── vite.config.js
```

---

## ⚙️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, React Router v6   |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB Atlas (Mongoose ODM)      |
| Auth      | JWT (JSON Web Tokens) + bcryptjs  |
| Styling   | Vanilla CSS (custom design system)|

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/roshanikadam3113/Store-Rating.git
cd Store-Rating
```

### 2. Configure the backend
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your values
```

**Backend `.env` variables:**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_minimum_32_chars
CLIENT_URL=http://localhost:5173
```

### 3. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the application
```bash
# Terminal 1 — Backend
cd backend
npm run dev        # Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # Starts on http://localhost:5173
```

---

## 🔑 Demo Credentials

> All accounts are pre-loaded in the database. No registration needed to test.

### Store Owners

| Email | Password | Stores Owned |
|-------|----------|--------------|
| `owner@nexaprime.com` | `Owner@1234` | NexaPrime Electronics Hub, NexaPrime Mobile World |
| `rohan.owner@nexaprime.com` | `Rohan@5678` | Rohan's Grocery Mart, ShopEasy Supermarket, TechZone Gadgets Pune |
| `priya.owner@nexaprime.com` | `Priya@9012` | Priya's Fashion Studio, Kolhapur Home Essentials, FreshMart Organics |

### Normal Users (can browse & rate stores)

| Email | Password |
|-------|----------|
| `ananya@nexaprime.com` | `Ananya@111` |
| `karan@nexaprime.com` | `Karan@222` |

> **Note:** There is no public-facing admin role in this application. New user accounts created via `/register` are always assigned the `user` role. Store Owner accounts must be created directly in the database.

---

## 🏪 Stores in the Database (8 stores across 4 cities)

| Store Name | Location |
|------------|----------|
| NexaPrime Electronics Hub | Mumbai |
| NexaPrime Mobile World | Mumbai |
| Rohan's Grocery Mart | Pune |
| ShopEasy Supermarket | Pune |
| TechZone Gadgets Pune | Pune |
| Priya's Fashion Studio | Satara |
| Kolhapur Home Essentials | Kolhapur |
| FreshMart Organics | Kolhapur |

---

## 🔐 Role-Based Access

| Feature | Normal User | Store Owner |
|---------|-------------|-------------|
| Browse all stores | ✅ | ✅ |
| Submit 1–5 star rating | ✅ | ❌ |
| Update own rating | ✅ | ❌ |
| View own dashboard (avg rating, reviews) | ❌ | ✅ |
| Register new account | ✅ (role: user) | ❌ (DB only) |

---

## 🛡️ Security Features

- **JWT authentication** — tokens expire after 7 days
- **Role escalation prevention** — `/register` always creates `user` role regardless of request body
- **Password hashing** — bcrypt with 12 salt rounds
- **Password hidden by default** — Mongoose `select: false` on password field
- **Generic auth errors** — same message for wrong password and unknown email (no email enumeration)
- **Input validation** — server-side validators on all routes

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user (role forced to `user`) |
| POST | `/api/auth/login` | Public | Login, returns JWT token |
| GET  | `/api/auth/me` | Protected | Get current user profile |

### Stores
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/stores` | Any authenticated | List all stores (with avg rating + your rating) |
| GET | `/api/stores?search=name` | Any authenticated | Search stores by name |
| GET | `/api/stores/:storeId` | Any authenticated | Get single store details |

### Ratings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/ratings/:storeId` | `user` role only | Submit or update rating (1–5, integers only) |
| GET  | `/api/ratings/my` | `user` role only | Get all ratings submitted by current user |

### Owner Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/owner/dashboard` | `owner` role only | Store info, avg rating, all reviews |

---

## 📝 Password Requirements

All passwords must meet the following rules:
- **8 to 16 characters**
- **At least 1 uppercase letter** (A–Z)
- **At least 1 special character** (!@#$%^&* etc.)

---

## 📄 License

This project is for educational and demonstration purposes.
