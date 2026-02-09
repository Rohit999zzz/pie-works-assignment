# Pieworks Project Documentation

**Project Name**: Pieworks Referral Engine
**Version**: 1.0.0
**Date**: February 9, 2026

---

## 1. Project Overview
Pieworks is a full-stack web application designed to intelligently match employees ("Members") with open job opportunities ("Jobs") at their company or partner companies. It facilitates the referral process by generating "Nudges" — smart recommendations based on skill overlaps, location, and alumni status.

### Demo Video
https://github.com/user-attachments/assets/2d344140-833c-4e71-8942-7c5c7edaa4e8
<video width="640" height="360" controls>
  <source src="https://github.com/user-attachments/assets/2d344140-833c-4e71-8942-7c5c7edaa4e8" type="video/mp4">
</video>


## 2. System Architecture & Design

### 2.1 Backend Design (Node.js + Express)
The backend follows a **Layered Architecture** to ensure separation of concerns:
-   **Routes Layer**: Defines API endpoints (e.g., `POST /api/auth/login`).
-   **Controller Layer**: Handles HTTP requests, input validation, and sends responses.
-   **Service Layer**: Contains core business logic (e.g., `MatchingService`).
-   **Data Access Layer**: Direct interactions with PostgreSQL using `pg` pool.

### 2.2 Database Design (PostgreSQL)
The database uses a normalized schema with Many-to-Many relationships for skills:
-   **Members**: Users of the platform (`id`, `email`, `password_hash`, `location`).
-   **Jobs**: Open positions (`id`, `title`, `company`, `location`).
-   **Skills**: A central catalog of skills (`id`, `name`).
-   **Member_Skills / Job_Skills**: Junction tables linking Members and Jobs to Skills.
-   **Nudges**: Recommendations linking a Member to a Job (`member_id`, `job_id`, `score`, `status`).

### 2.3 Frontend Design (React + Tailwind)
-   **Component-Based**: Reusable UI components like `NudgeCard`.
-   **Responsive Layout**: Uses CSS Grid (`grid-cols-1 md:grid-cols-3`) to adapt from mobile to desktop.
-   **Utilities**: TailwindCSS is used for rapid, consistent styling without writing custom CSS files.
-   **State Management**: `AuthContext` provides global access to the logged-in user state.

### 2.4 Database Schema (ERD)
```mermaid
erDiagram
    MEMBERS ||--o{ MEMBER_SKILLS : has
    MEMBERS ||--o{ NUDGES : receives
    JOBS ||--o{ JOB_SKILLS : requires
    JOBS ||--o{ NUDGES : generates
    SKILLS ||--o{ MEMBER_SKILLS : "used in"
    SKILLS ||--o{ JOB_SKILLS : "used in"
    
    MEMBERS {
        int id PK
        string email
        string password_hash
        string name
        string location
        string current_company
        int experience_years
    }
    
    JOBS {
        int id PK
        string title
        string company
        string location
        int min_experience
        text description
    }
    
    SKILLS {
        int id PK
        string name
    }
    
    MEMBER_SKILLS {
        int member_id FK
        int skill_id FK
    }
    
    JOB_SKILLS {
        int job_id FK
        int skill_id FK
    }
    
    NUDGES {
        int id PK
        int member_id FK
        int job_id FK
        int score
        string reason
        string status
    }
```

### 2.5 System Architecture Diagram
```mermaid
graph TB
    subgraph "Frontend (React)"
        A[Browser] --> B[Dashboard]
        A --> C[Profile Page]
        A --> D[Login/Signup]
        B --> E[AuthContext]
        C --> E
        D --> E
    end
    
    subgraph "Backend (Node.js + Express)"
        E --> F[API Routes]
        F --> G[Auth Controller]
        F --> H[Member Controller]
        F --> I[Job Controller]
        F --> J[Nudge Controller]
        H --> K[Matching Service]
        I --> K
    end
    
    subgraph "Database (PostgreSQL)"
        G --> L[(Members Table)]
        H --> L
        H --> M[(Skills Tables)]
        I --> N[(Jobs Table)]
        J --> O[(Nudges Table)]
        K --> L
        K --> M
        K --> N
        K --> O
    end
```

---

## 3. Core Logic & Algorithms

### 3.1 The Matching Engine (`matchingService.js`)
The core value proposition is the "Nudge" generation. This logic runs efficiently in the backend.

**Scoring Algorithm**:
Each Member-Job pair is assigned a score (0-100) based on weighted criteria:
1.  **Skills Match (50%)**:
    -   *Logic*: `(Matching Skills / Total Job Skills) * 50`
    -   *Example*: If a job needs [React, Node] and user has [React], score = (1/2)*50 = 25 points.
2.  **Location Match (20%)**:
    -   *Logic*: Exact string match (case-insensitive) between Member City and Job City.
    -   *Why*: Proximity increases the likelihood of a successful hire.
3.  **Company/Alumni Match (30%)**:
    -   *Logic*: Match between Member's `current_company` and Job's `company`.
    -   *Why*: Referrals are most effective when verifying someone you've worked with.

**Threshold**: Only pairs with a **Score >= 20** are saved as "Nudges".

### 3.2 Matching Workflow Diagram
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant MatchingService
    participant Database
    
    User->>Frontend: Update Profile (Skills/Location)
    Frontend->>API: PUT /api/members/:id
    API->>Database: Update member data
    API->>MatchingService: matchMemberToJobs(memberId)
    
    MatchingService->>Database: Fetch member + skills
    MatchingService->>Database: Fetch all jobs + skills
    
    loop For each job
        MatchingService->>MatchingService: Calculate score (Skills + Location + Company)
        alt Score >= 20
            MatchingService->>Database: Insert/Update Nudge
        end
    end
    
    MatchingService->>Database: Delete invalid pending nudges
    MatchingService-->>API: Return success
    API-->>Frontend: 200 OK
    Frontend->>API: GET /api/members/:id/nudges
    API->>Database: Fetch updated nudges
    Database-->>Frontend: Return nudge list
    Frontend->>User: Display updated Dashboard
```

### 3.3 Real-time Recalculation & Cleanup
To ensure the dashboard is always accurate, the matching logic is event-driven:
-   **Trigger**: Whenever a User updates their Profile (PUT `/api/members/:id`).
-   **Step 1 (Cleanup)**: The system executing a *Cleanup Routine* to delete 'pending' Nudges that no longer meet the matching criteria (e.g., user moved cities).
-   **Step 2 (Recalculate)**: The system re-runs the scoring algorithm against *all* active jobs.
-   **Step 3 (Update)**: New valid Nudges are inserted/updated in the database.

### 3.3 Security Logic
-   **Stateless Authentication**: Uses JSON Web Tokens (JWT). The server does not store session state.
-   **Password Hashing**: Uses `bcryptjs` with Salt Rounds = 10. Passwords are never stored in plain text.
-   **Protected Routes**: Middleware verifies the `Authorization: Bearer <token>` header before allowing access to private data.

---

## 4. Setup Instructions

### Prerequisites
-   Docker Desktop installed and running.

### Running the Application
1.  **Start Services**:
    ```bash
    docker-compose up --build
    ```
    -   Backend runs on `http://localhost:5000`
    -   Frontend runs on `http://localhost:5173`
    -   Database runs on `localhost:5432`

2.  **Access App**: Open your browser to `http://localhost:5173`.
3.  **Login Credentials** (Pre-seeded):
    -   User: `alice@example.com` / `password123`
    -   User: `bob@example.com` / `password123`

## 5. Directory Structure
```
pie-works/
├── backend/
│   ├── src/controllers/    # API Handlers
│   ├── src/services/       # Matching Logic
│   └── database/           # SQL Schema
├── frontend/
│   ├── src/pages/          # React Views
│   └── src/context/        # Global State
└── docker-compose.yml      # Deployment Config
```
