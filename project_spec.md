# Coffee Ordering Platform - Project Spec

---

## Part 1: Project Requirements

- Users can order coffee from a menu and submit personal details.
- Users can subscribe to a daily coffee plan with pickup time.
- Information stored: first/last name, license plate, email, pickup time.
- Users can update personal details and subscription preferences via a settings page.

---

## Part 2: Engineering Requirements

### Tech Stack Overview

Full-stack web application supporting online ordering, subscriptions, and recurring order automation.

#### Frontend
- **Framework:** Next.js (React + TypeScript)  
- **Styling:** Tailwind CSS  
- **State Management:** React Query + local state (Zustand/React)  
- **Responsibilities:** Render UI (menu, checkout, settings), handle authentication, communicate with backend REST API.

#### Backend
- **Framework:** FastAPI (Python)  
- **API Type:** REST  
- **ORM:** SQLAlchemy  
- **Authentication:** JWT (or third-party provider)  
- **Responsibilities:** Process orders, manage users/subscriptions, handle background jobs.

#### Database
- **Database:** PostgreSQL  
- **Hosting:** Neon  
- **Responsibilities:** Store users, orders, subscriptions, menu items; maintain relational integrity and efficient queries.

#### Background Jobs
- **Method:** Cron or Celery/Redis  
- **Responsibilities:** Auto-generate daily subscription orders and update order statuses.

#### Payments (Optional)
- **Provider:** Stripe  
- **Responsibilities:** Handle one-time and recurring payments securely.

#### Deployment
| Component       | Hosting / Deployment         |
|-----------------|-----------------------------|
| Frontend        | Vercel                      |
| Backend API     | Render / Railway / Fly.io   |
| Database        | Neon (serverless PostgreSQL)|
| Background Jobs | Hosted scheduler or Celery  |

---

### Architecture

```text
User → Frontend (Next.js) → Backend API (FastAPI) → PostgreSQL
                      ↓
                 Scheduler / Worker