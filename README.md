# Utkal Pest Control

This repository is a full-stack Next.js 14 (App Router) TypeScript project scaffold for Utkal Pest Control — a pest-control booking application targeted at Odisha, India.

What I created:
- Next.js 14 App Router + TypeScript scaffold
- Tailwind CSS setup
- Mongoose models for User, Service, Booking, Technician, Review, Payment
- API route examples for services and bookings (server routes)
- Database seed script that inserts sample services, customers, technicians, bookings and reviews
- Clerk integration scaffold (ClerkProvider in RootLayout)
- Cloudinary and environment variable placeholders
- Middleware placeholder to protect /dashboard routes — replace with Clerk middleware per docs for robust protection

How to run locally

1. Install dependencies

   npm install

2. Create a .env.local file based on .env.example

3. Run the seed script to populate the database:

   npm run seed

4. Start the dev server:

   npm run dev

Environment variables (.env.example lists each variable and where to obtain them)

See .env.example for the full list.

Notes & next steps
- The UI is minimal to get started. Expand the pages in the app/ directory to add the full pages (Pricing, About, Contact, multi-step booking flow, dashboards for customer/technician/admin).
- Replace middleware with Clerk's official middleware for robust session and role checks. See Clerk docs: https://docs.clerk.com
- Configure Cloudinary for before/after image uploads in the technician job page.
- Add server actions for forms and implement react-hook-form + zod validation in forms.
