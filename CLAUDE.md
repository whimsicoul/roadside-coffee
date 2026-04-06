# Claude.md - Coffee Ordering Platform

## Project Overview
This project is an online coffee ordering platform with both one-time orders and subscription-based daily coffee plans. Users can:

- Browse the menu and place orders
- Subscribe to daily coffee
- Save and update personal details (first name, last name, license plate, email, pickup time)
- Update subscription preferences on a settings page

The platform uses a **full-stack architecture** with a Next.js frontend, Node.js/Express backend, and PostgreSQL database.

---

## Tech Stack

- **Frontend:** Next.js (React + TypeScript), Tailwind CSS, React Query
- **Backend:** Node.js + Express (TypeScript), Prisma ORM, JWT-based authentication
- **Database:** PostgreSQL (Neon hosting)
- **Background Jobs:** node-cron for subscription order automation
- **Optional Payments:** Stripe API
- **Deployment:** Frontend on Vercel, Backend on Render/Railway/Fly.io

---

## Project Structure
roadside-coffee/
├── frontend/
│ ├── app/ # Pages & layouts (menu, checkout, settings)
│ ├── components/ # Reusable UI components
│ ├── lib/ # API client, hooks, utils
│ ├── styles/ # Tailwind globals
│ ├── public/ # Static assets
│ └── types/ # TypeScript types
├── backend/
│ ├── prisma/
│ │ ├── schema.prisma # Database schema & ORM
│ │ ├── migrations/ # DB migrations
│ │ └── seed.ts # Database seeding
│ ├── src/
│ │ ├── routes/ # Express route handlers
│ │ ├── controllers/ # HTTP layer
│ │ ├── services/ # Business logic
│ │ ├── middleware/ # Auth, validation, error handling
│ │ ├── lib/ # Utilities (Prisma client)
│ │ ├── config/ # Environment config
│ │ ├── types/ # TypeScript definitions
│ │ └── workers/ # Background jobs (cron)
│ ├── package.json
│ ├── tsconfig.json
│ └── .env
├── .env
└── README.md

---

## Coding Guidelines for Claude

### Frontend
- Use **Next.js App Router** and TypeScript
- All UI elements should be **modular, reusable, and styled with Tailwind**
- Use **React Query** for server-state management
- Communicate with the backend via **REST API**
- Forms should validate inputs client-side before submission
- Auto-fill previously saved user data if authenticated

### Backend
- Follow **Express + Node.js conventions**:
  - `routes/` → API endpoints (mounted at `/api/v1`)
  - `controllers/` → HTTP request handling
  - `services/` → Business logic and database calls via Prisma
  - `middleware/` → Auth, validation, error handling
  - `prisma/schema.prisma` → Database schema and ORM
- Use **JWT** with `jsonwebtoken` for authentication
- Hash passwords with `bcryptjs` (cost factor: 12)
- Validate all incoming data with **Zod** schemas
- Include **clear error handling** with proper HTTP status codes
- Use **node-cron** to generate daily subscription orders automatically

### Database
- Design tables for:
  - `users`
  - `orders`
  - `subscriptions`
  - `menu_items`
- Relationships:
  - User → Orders (1:M)
  - User → Subscription (1:1 active)
  - Subscription → Orders (1:M)
- Queries should be **efficient and optimized for recurring orders**

### API Design
- Follow **RESTful conventions** with predictable endpoints
- Base URL: `/api/v1`
- Include **examples for requests and responses**
- Return proper HTTP status codes:
  - 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error

---

## Claude Instructions

1. **Generate code in small, testable modules.**
2. **Never write secrets directly**; use `.env` variables.
3. **Always separate frontend from backend logic.**
4. **Keep code DRY** (Don’t Repeat Yourself); reuse components and services.
5. **Comment code clearly** for maintainability.
6. **Follow project structure strictly**.
7. **Ask clarifying questions** if requirements are ambiguous.
8. **Validate all input** on frontend and backend.
9. **Generate subscription handling as background jobs**.
10. **Provide optional payment integration using Stripe** but modular enough to remove if not needed.

---

## Environment Variables

- `DATABASE_URL` → PostgreSQL connection string (Neon pooled URL recommended)
- `JWT_SECRET` → Authentication token secret (min 16 chars)
- `SECRET_KEY` → App secret (min 16 chars)
- `STRIPE_SECRET_KEY` → Stripe secret key (starts with `sk_`)
- `SMTP_SERVER` → Email server (e.g., smtp.gmail.com)
- `SMTP_PORT` → Email port (e.g., 587)
- `SMTP_USER` → Email account
- `SMTP_PASSWORD` → Email password or app-specific token
- `ADMIN_EMAIL` → Admin notification email
- `PORT` → Server port (default: 8000)
- `NODE_ENV` → Environment (development/production/test)
- `DAILY_ORDER_GENERATION_TIME` → Cron time for subscriptions (e.g., 06:00)
- `SCHEDULER_TIMEZONE` → Timezone for scheduling (e.g., UTC)

---

## Data Flow Summary

1. **User interaction** → Frontend form submission
2. **Frontend request** → REST API call (with JWT)
3. **Backend processing** → Validate → Save to DB → Return response
4. **Subscription automation** → Scheduler generates daily orders
5. **Frontend updates UI** with current orders, auto-filled preferences

---

## Key Design Principles

- Separation of concerns
- Modular and reusable code
- Scalable architecture for future features
- Reliable subscription automation
- Secure handling of user data
- Easy onboarding for new developers

---

**Claude should follow this file strictly to generate, update, and maintain the coffee ordering platform efficiently, cleanly, and modularly.**