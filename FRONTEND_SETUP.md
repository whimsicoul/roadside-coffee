# Frontend Setup Complete ✓

The Next.js frontend for Roadside Coffee has been successfully scaffolded and configured.

## What Was Created

### Project Structure
```
frontend/
├── app/                    # Pages (App Router)
│   ├── page.tsx           # Home → redirects to /menu
│   ├── menu/page.tsx      # Browse menu & manage cart
│   ├── checkout/page.tsx  # Checkout with order summary
│   ├── settings/page.tsx  # User profile & subscription management
│   ├── login/page.tsx     # Login page (with Suspense wrapper)
│   ├── register/page.tsx  # Registration page
│   ├── layout.tsx         # Root layout with Providers & Navbar
│   └── globals.css        # Tailwind CSS imports
├── components/
│   ├── Providers.tsx      # QueryClientProvider wrapper
│   ├── Navbar.tsx         # Navigation header (mobile-responsive)
│   ├── ProtectedRoute.tsx # Auth guard for protected pages
│   ├── LoginForm.tsx      # Login form component
│   ├── RegisterForm.tsx   # Registration form component
│   ├── MenuItemCard.tsx   # Reusable menu item card
│   └── OrderSummary.tsx   # Itemized order summary
├── lib/
│   ├── api.ts            # Axios client with JWT interceptors
│   ├── auth.ts           # localStorage helpers (token/user)
│   ├── queryClient.ts    # React Query configuration
│   └── hooks/
│       ├── useMenu.ts        # Fetch menu items
│       ├── useUser.ts        # Fetch/update user profile
│       ├── useOrders.ts      # Fetch/create orders
│       └── useSubscription.ts # Subscription CRUD operations
├── types/
│   └── index.ts          # Shared TypeScript interfaces
├── public/               # Static assets (placeholder)
├── .env.local           # Environment variables
├── next.config.ts       # Next.js configuration with API proxy
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Tech Stack Installed

- **Next.js 16.2.2** — App Router, TypeScript, Tailwind CSS
- **React Query v5** (@tanstack/react-query) — Server state management
- **Axios** — HTTP client with interceptors
- **React Hook Form + Zod** — Form validation
- **Tailwind CSS** — Utility-first styling (stone palette)

## Key Features Implemented

### Authentication
- Login/Register with JWT tokens
- Automatic token refresh on 401 responses
- localStorage-based token storage (SSR-safe)
- Protected routes redirect to login

### Pages
1. **Menu** (`/menu`) — Browse items, add to cart, place one-time orders
2. **Checkout** (`/checkout`) — Order summary, auto-filled user details, order confirmation
3. **Settings** (`/settings`) — Update profile (name, phone, license plate), manage subscriptions
4. **Login/Register** (`/login`, `/register`) — Auth forms with client-side validation

### Components
- **Navbar** — Responsive header with auth state-aware links & mobile menu
- **MenuItemCard** — Coffee items with quantity controls
- **OrderSummary** — Itemized order display with total
- **ProtectedRoute** — Auth guard for pages requiring login
- **Providers** — React Query + DevTools setup

### Data Fetching
- Query hooks for menu, user, orders, subscriptions
- Mutation hooks for creating orders, updating profile, managing subscriptions
- Automatic cache invalidation on mutations
- 5-minute stale time for data

## Environment Configuration

### `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Development Mode
- API proxy configured in `next.config.ts` to route `/api/v1/*` to backend
- Set `NEXT_PUBLIC_API_URL=` (empty) or `/api/v1` to use proxy

### Production Mode
- Set `NEXT_PUBLIC_API_URL` to deployed backend URL (e.g., `https://api.roadside-coffee.com/api/v1`)

## Running the App

### Start Dev Server
```bash
cd frontend
npm run dev
```
Server runs at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run start
```

### Type Checking
```bash
npm run typecheck  # or npx tsc --noEmit
```

## Testing Checklist

- [ ] Dev server starts without errors
- [ ] Home page (`/`) redirects to `/menu`
- [ ] Menu page loads and displays items (check Network tab for `/api/v1/menu`)
- [ ] Add items to cart, see cart summary update
- [ ] Login/Register forms validate client-side
- [ ] After login, token appears in localStorage under `rc_token`
- [ ] Settings page redirects to login when unauthenticated
- [ ] Authenticated settings page auto-fills user data
- [ ] Mobile navbar hamburger menu works
- [ ] Build completes with 0 TypeScript errors

## Backend Integration Points

The frontend expects these API endpoints (all under `/api/v1`):

- `POST /auth/login` — Returns `{ user, token }`
- `POST /auth/register` — Returns `{ user, token }`
- `GET /menu` — Public, returns `MenuItem[]`
- `GET /users/me` — Requires Bearer token, returns `User`
- `PUT /users/me` — Update profile fields
- `GET /orders` — List user's orders
- `POST /orders` — Create new order
- `GET /subscriptions/me` — Get active subscription (404 if none)
- `POST /subscriptions` — Create subscription
- `PUT /subscriptions/me` — Update subscription
- `DELETE /subscriptions/me` — Cancel subscription

## Notes

- All API requests automatically attach JWT Bearer token via axios interceptor
- 401 responses trigger logout and redirect to `/login`
- Cart state is ephemeral (cleared on checkout or page reload)
- Tailwind uses warm `stone` palette matching coffee brand
- Mobile-first responsive design with Tailwind breakpoints
