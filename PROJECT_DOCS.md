# Pieworks Referral Engine 🥧

A full-stack web application designed to intelligently match employees with open job roles and facilitate referrals.

> 🎥 **Watch Demo**: [Click here to watch the demo video](./demo.mp4)
> 
> 📘 **Full Documentation**: See [PROJECT_DOCS.md](./PROJECT_DOCS.md) for detailed architecture, workflows, and setup instructions.

## 🚀 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (with `pg` library)
- **Authentication**: JWT & bcryptjs
- **Containerization**: Docker & Docker Compose

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## 📂 Project Structure

```
pid-works/
├── backend/                # Node.js API Service
│   ├── src/
│   │   ├── controllers/    # Request handlers (Auth, Jobs, Nudges)
│   │   ├── services/       # Business logic (Matching Algorithm)
│   │   ├── middleware/     # Auth & Validation
│   │   └── config/         # Database connection
│   └── database/           # SQL Schema & Seed scripts
│
├── frontend/               # React Client
│   ├── src/
│   │   ├── pages/          # Dashboard, Profile, Login, Signup
│   │   ├── components/     # Reusable UI (NudgeCard)
│   │   └── context/        # Auth State Management
│   └── public/
│
└── docker-compose.yml      # Orchestration config
```

## 🛠️ Setup & Installation

**Prerequisites**: Docker & Docker Compose.

1.  **Start Services**:
    ```bash
    docker-compose up --build
    ```
    This will start:
    -   PostgreSQL Database (`localhost:5433`)
    -   Backend API (`localhost:5000`)

2.  **Start Frontend**:
    Open a new terminal:
    ```bash
    cd frontend
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

## 🧪 Testing
- **Backend**: Pre-seeded with mock users (e.g., `alice@example.com` / `password123`).
- **Matching**: The system automatically matches members to jobs based on **Skills (50%)**, **Location (20%)**, and **Company (30%)**.

## ✨ Features
1.  **Smart Nudges**: Automatically identifies potential referrals.
2.  **Authentication**: Secure Login/Signup with protected routes.
3.  **Profile Management**: Update skills and details.
4.  **Fallback Jobs**: Browse all open roles if no specific nudges are found.
# pie-works-assignment
