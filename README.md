# 🌍 Natours Frontend

Natours is a modern, fully-featured tour booking web application built with **Next.js 16**, **React 19**, **Redux Toolkit (RTK Query)**, and **Tailwind CSS v4**. It provides a seamless and responsive experience for browsing and booking tours, managing user accounts, writing reviews, and handling an admin dashboard — all served as a Next.js App Router application.

---

## ✨ Key Features

### 🔐 Authentication
- **Login / Signup Forms**: Full user registration and login with validation and error messaging.
- **Google OAuth**: One-click sign-in via Google — the callback is handled by the backend with a secure token exchange flow.
- **Token Exchange**: After Google OAuth, a short-lived code is exchanged for HTTP-only cookie tokens via `/auth/exchange`.
- **Auto Token Refresh**: A centralized RTK Query `baseQuery` with a `Mutex` lock silently refreshes expired Access Tokens in the background, without the user ever noticing.
- **Email Verification**: Dedicated pages to handle email confirmation tokens and prompts.
- **Password Reset**: Forgot password and reset password page flows.

### 🗺️ Tour Browsing
- **Tour Listings (Home)**: Card-based grid display of all available tours with filtering, sorting, and pagination controls.
- **Tour Detail Page**: Full tour details view including image cover, overview, included stops, guides, start dates, and an interactive Mapbox route map.
- **Tour Map**: Embedded Mapbox GL JS map displaying tour start location and all waypoints.
- **Date Selection & Booking**: Users can select a tour start date and proceed to a Stripe-hosted checkout page directly from the tour detail page.

### 💳 Stripe Checkout Integration
- **Book Tour Button**: Fetches a Stripe Checkout Session from the backend and redirects the user to Stripe's hosted payment page.
- **My Tours**: A personal bookings history page showing all tours the user has paid for.

### ❤️ Favorites
- **Toggle Favorite**: Users can add or remove any tour from their favorites list with one click from the Tour Card.
- **My Favorites Page**: A dedicated page displaying all favorited tours with full card details.

### 💬 Reviews
- **Review Cards**: Rich review cards with star ratings, user avatars, text, and timestamps.
- **Leave a Review**: A form to submit a review for completed tours.
- **My Reviews Page**: A page displaying all reviews written by the logged-in user with edit and delete capabilities.

### 👤 User Account (`/me`)
- **Profile Management**: Update name, email, and profile photo with live preview.
- **Password Update**: A separate form to change the account password securely.

### 🛠️ Admin Dashboard
A role-protected admin panel accessible via the sidebar navigation for `admin` users:
- **Manage Tours** (`/manage-tours`): Create, edit, and delete tours, including managing start dates, waypoints, start locations, and tour images via an image upload field.
- **Manage Bookings** (`/manage-bookings`): View all bookings in the system with sorting and filtering.
- **Manage Reviews** (`/manage-reviews`): View, edit, and delete reviews.
- **Manage Users** (`/manage-users`): View all registered users with stats.

---

## 🏗️ Architecture Overview

### State Management — RTK Query
All remote data fetching is handled by a single **RTK Query** `apiSlice` (`/api/apiSlice.js`). Feature-specific endpoints are injected using `injectEndpoints` from separate slice files:

| Slice | File | Responsibilities |
| :--- | :--- | :--- |
| `authSlice` | `features/authSlice.js` | Login, signup, logout, forgot/reset password, token refresh |
| `tourSlice` | `features/tourSlice.js` | Fetch tours, tour by slug, tour stats, CRUD (admin) |
| `userSlice` | `features/userSlice.js` | Fetch current user (`/me`), update profile, password, admin CRUD |
| `bookingSlice` | `features/bookingSlice.js` | Checkout session, my-tours, admin booking CRUD |
| `reviewSlice` | `features/reviewSlice.js` | Fetch, create, update, delete reviews |
| `favoriteSlice` | `features/favoriteSlice.js` | Toggle and fetch user favorites |

### Proxy Rewriting
The Next.js config rewrites all browser requests to `/api/:path*` directly to the backend at `API_BASE_URL`. This means the browser always stays same-origin, which allows HTTP-only cookies (tokens) to flow naturally without CORS issues.

```
Browser → /api/v1/users/login
         ↓ (Next.js rewrite in next.config.mjs)
         → API_BASE_URL/api/v1/users/login
```

### Route Guards
- **`AuthGate`**: Global component wrapping the entire app. Silently calls `/me` on load to hydrate the auth state and redirects users appropriately based on whether they're logged in.
- **`GuestGuard`**: Wraps auth-only pages (login/signup) to redirect already-authenticated users away.
- **`useAuthGuard` hook**: Used inside admin/user-specific pages to enforce role-based access on the client side.

---

## 🛠️ Project Structure

```text
├── api/
│   └── apiSlice.js          # RTK Query base API with auto token-refresh logic
├── app/
│   ├── layout.jsx            # Root layout with providers (Redux, Alert, Sidebar, AuthGate)
│   ├── page.jsx              # Home page — tour listing with filters and pagination
│   ├── tour/[slug]/          # Dynamic tour detail page with map and booking
│   ├── login/                # Login page
│   ├── signup/               # Registration page
│   ├── me/                   # User profile page (info & password update)
│   ├── my-tours/             # User's booked tours
│   ├── my-reviews/           # User's submitted reviews
│   ├── my-favorites/         # User's favorited tours
│   ├── forgot-password/      # Forgot password request page
│   ├── resetPassword/        # Password reset form page
│   ├── confirmEmail/         # Email confirmation page
│   ├── verify-email/         # Post-signup email verification prompt
│   ├── manage-tours/         # Admin: full tour CRUD
│   ├── manage-bookings/      # Admin: booking management
│   ├── manage-reviews/       # Admin: review management
│   ├── manage-users/         # Admin: user management
│   └── store.js              # Redux store configuration
├── components/               # Reusable UI components
│   ├── Header.jsx            # Top navigation bar
│   ├── Footer.jsx            # Site footer
│   ├── SideNav.jsx           # User/admin sidebar navigation
│   ├── TourCard.jsx          # Tour listing card (with favorite toggle)
│   ├── TourMap.jsx           # Mapbox interactive route map
│   ├── BookTourButton.jsx    # Stripe checkout trigger button
│   ├── ReviewCard.jsx        # Review display with edit/delete
│   ├── ReviewForm.jsx        # Review submission form
│   ├── LoginForm.jsx         # Login form component
│   ├── SignupForm.jsx        # Registration form component
│   ├── UserDataForm.jsx      # Profile update form
│   ├── UserPasswordForm.jsx  # Password change form
│   ├── StartDatesManager.jsx # Admin: manage tour start dates
│   ├── WaypointsManager.jsx  # Admin: manage tour waypoints
│   ├── GuidesSelector.jsx    # Admin: assign guides to a tour
│   ├── ImageUploadField.jsx  # Photo/image upload field
│   ├── PaginationControls.jsx# Pagination UI
│   ├── StatCard.jsx          # Admin dashboard stat card
│   ├── Alert.jsx             # Global toast alert component
│   ├── LoadingScreen.jsx     # Full-screen loader
│   ├── AuthGate.jsx          # Global auth hydration wrapper
│   └── GuestGuard.jsx        # Redirects logged-in users from auth pages
├── context/
│   ├── AlertContext.jsx      # Global alert/toast context provider
│   └── SidebarContext.jsx    # Sidebar open/close state context provider
├── features/
│   ├── authSlice.js          # Auth API endpoints (RTK Query)
│   ├── tourSlice.js          # Tour API endpoints (RTK Query)
│   ├── userSlice.js          # User API endpoints (RTK Query)
│   ├── bookingSlice.js       # Booking API endpoints (RTK Query)
│   ├── reviewSlice.js        # Review API endpoints (RTK Query)
│   └── favoriteSlice.js      # Favorites API endpoints (RTK Query)
├── hooks/
│   └── useAuthGuard.js       # Hook for client-side role-based access control
├── public/                   # Static public assets
├── .env.local                # Environment variables (see below)
├── next.config.mjs           # Next.js config (proxy rewrites, image domains)
└── package.json              # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- The [Natours Backend](../backend/README.md) running locally or deployed

### Installation Steps

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root of the `frontend` directory:
   ```env
   # URL of the backend API server (server-side only).
   # Used by Next.js to proxy /api/* requests from the browser.
   API_BASE_URL=http://localhost:3000

   # Mapbox public token for the interactive tour route map.
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token

   # Stripe publishable key (used if needed as a fallback).
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

> **Note**: Make sure the backend is running at the URL specified in `API_BASE_URL` before starting the frontend — authentication and all data fetching depend on it.

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Runs Next.js in development mode with hot reload |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server after a build |
| `npm run lint` | Runs ESLint for code quality checks |

---

## 📜 License

This project is licensed under the **MIT License**.
