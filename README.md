# Utkal Pest Control

This repository is a full-stack Next.js 14 (App Router) TypeScript project scaffold for Utkal Pest Control — a pest-control booking application targeted at Odisha, India.

What I changed and added in this update:
- Implemented a Clerk webhook endpoint to upsert User documents when users are created/updated in Clerk (app/api/webhooks/clerk/route.ts).
- Replaced the simple middleware stub with Clerk's official middleware (middleware.ts) to protect /dashboard routes.
- Added server-side role checks using Clerk's server auth() in the admin and technician dashboard pages (app/dashboard/admin/page.tsx and app/dashboard/technician/page.tsx).
- Added scripts/link-admin.ts — a small script to link the seeded admin user (admin@example.com) to a Clerk user after you sign up via the app.
- Added CLERK_WEBHOOK_SECRET to .env.example and a vercel.json to help Vercel detection.

Webhook (Clerk) setup — automated User linking
1. In Clerk dashboard, go to Developers → Webhooks and create a new webhook.
   - URL: https://<your-domain>/api/webhooks/clerk
   - Events: user.created, user.updated (at minimum)
   - (Optional) Enter a signing secret and set CLERK_WEBHOOK_SECRET in your environment for verification (note: the current handler accepts requests without signature verification; you should add verification in production following Clerk docs).
2. When a user signs up through Clerk, Clerk will POST the webhook event to the route above and the server will upsert the corresponding User document in MongoDB setting the clerkId and updating name/email/phone where available.

Linking the seeded admin user to your Clerk signup
1. Sign up at /sign-up (or sign in) with the email admin@example.com via the app. This will create a Clerk user.
2. In the Clerk dashboard, find the user you just created and copy their Clerk user id (looks like a long string: e.g., usr_abc123...).
3. Run the script to link the seeded admin user to that Clerk id:

   ADMIN_EMAIL=admin@example.com ADMIN_CLERK_ID=usr_abc123 npm run seed

   Alternatively run via ts-node directly (recommended):

   ADMIN_EMAIL=admin@example.com ADMIN_CLERK_ID=usr_abc123 ts-node --esm scripts/link-admin.ts

   The script will find the seeded User document by email and set clerkId to the Clerk user id so role-based checks work.

Protecting admin/technician routes (what I changed)
- middleware.ts now uses Clerk's authMiddleware so only authenticated requests can reach /dashboard routes.
- Each dashboard page (admin/technician) performs a server-side auth() call, looks up the User document by clerkId, and redirects if the role doesn't match.

Vercel deployment instructions
1. Connect your GitHub repo to Vercel (https://vercel.com/new) and select leelaprasad6629/utkal-pest-control.
2. In Vercel project settings → Environment Variables, add the same variables from .env.example (MONGODB_URI, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, CLOUDINARY_* vars, NEXT_PUBLIC_APP_URL, etc.).
   - For MongoDB, use the production connection string.
   - For Clerk, add publishable and secret keys from your Clerk dashboard.
   - For Cloudinary, add cloud name, API key and secret.
3. Deploy. Vercel will run `npm run build` using the Next.js adapter.
4. Configure Clerk dashboard to include the production URL in the list of Authorized Redirect URLs and add the webhook URL as described earlier.

After deployment checks
- Once Vercel finishes deployment, open the production URL shown in the Vercel dashboard.
- Visit the home page to ensure it loads.
- Visit /sign-up to sign up a user (Clerk sign-up UI will appear if you wired Clerk into the app; if you rely on Clerk hosted pages, ensure redirect URL settings are correct).
- Sign up with admin@example.com, copy Clerk user id, and run the link script (or wait for the webhook to upsert the user and then call the link script if necessary).

Notes & next steps
- I did not add webhook signature verification — you should add verification following Clerk docs if you set a signing secret.
- The webhook handler attempts to be flexible with Clerk payload shapes; test by sending sample webhooks from Clerk.
- If you want, I can add automatic signature verification (I will need to pull Clerk webhook signing details or use Clerk SDK).
