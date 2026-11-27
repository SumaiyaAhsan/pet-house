# 🐾 Pet House - Online Pet Adoption & Care Platform

Pet House is a full-stack pet adoption and care platform that connects shelters with adopters, functioning as a marketplace. Shelters list pets, adopters browse, pay, and message owners directly, and admins moderate the platform. A built-in Pet Care module adds a public health knowledge base (diseases, symptoms, medicines, prevention) that shelters can publish and manage.

## Live Demo

**Live Website:** [https://pet-house-ojrd.onrender.com](https://pet-house-ojrd.onrender.com)

Hosted on Render's free tier with a MongoDB Atlas database. The free tier sleeps after about 15 minutes of idle time, so the first visit can take 30 to 60 seconds to load.

## Features

### For adopters (role: `user`)

- Browse approved pet listings with photos, breed, age, gender, location, and price.
- View pet detail pages and start a conversation with the owner.
- Pay adoption fees through SSLCommerz (bKash, Nagad, Rocket), the in-app wallet, or cash on delivery.
- Track orders and adoption history from the dashboard.
- Book services (Grooming, Boarding, Vet Visit).
- Read pet health care articles by category.

### For shelters (role: `shelter`)

- Add, edit, and manage pet listings.
- Receive and reply to messages from interested adopters.
- Manage incoming orders and confirm completions.
- Publish and manage health care suggestions in the Pet Care module (CRUD dashboard at `/pet-care/manage`).

### For admins (role: `admin`)

- Approve or reject new pet listings (`pending`, `approved`, `rejected`).
- Monitor platform activity from the admin overview.
- Manage users (including banning).

### Platform-wide

- **Adoption Marketplace:** shelters list pets, adopters browse, filter, and view details.
- **Chat:** real-time messaging between adopters and shelters, scoped per pet, with unread counts.
- **Secure Authentication:** JWT-based login and registration with bcrypt-hashed passwords, plus password reset by email (SMTP).
- **Care System:** pet health suggestions organized by category, with disease details, symptoms, causes, medicines, reference links, and public search.
- **Contact Form:** visitor messages are emailed to the admin, with the visitor's address as reply-to.
- Pet images stored as base64 data URLs in MongoDB, served through a cached image route (sharp).
- Responsive UI styled with Tailwind CSS, Poppins headings and Inter body text, toast notifications, and lucide icons.

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js API Routes (Node.js)
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT (`jsonwebtoken`), bcryptjs
- **Payments:** SSLCommerz hosted checkout (sandbox or live)
- **Email:** nodemailer over SMTP
- **Images:** sharp, base64 data URLs in MongoDB
- **Deployment:** Render (CI/CD connected to GitHub)

## Project Structure

```javascript
src/
├── app/
│   ├── page.js                  # Landing page
│   ├── pets/                    # Public listings and pet details
│   ├── pet-care/                # Health care module (public + shelter manage)
│   ├── payment/                 # Checkout, COD, and confirmation flows
│   ├── dashboard/               # Adopter dashboard
│   ├── shelter/                 # Shelter listing management
│   ├── admin/                   # Admin overview and listing moderation
│   ├── messages/                # Chat inbox
│   ├── login/ register/ forgot-password/
│   └── api/                     # Route handlers (see below)
├── components/                  # Navbar, Footer, HeroPetCarousel, chat UI, etc.
└── lib/
    ├── db.js                    # Mongoose connection
    ├── auth.js                  # JWT sign/verify, password hashing
    ├── chat.js                  # Chat participant rules
    ├── models/                  # User, Pet, Transaction, Application,
    │                            # Booking, Message, Review, Category,
    │                            # HealthSuggestion
    └── payments/                # SSLCommerz config and fee logic
```

### Key API routes

| Route | Purpose |
| --- | --- |
| `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/reset-password` | Authentication |
| `GET /api/pets/all`, `POST /api/pets`, `GET/PUT/DELETE /api/pets/[id]` | Pet listings. Note: `GET /api/pets` returns 405 by design; the public list is `/api/pets/all`. |
| `GET /api/pets/[id]/image` | Serves pet images with an in-memory cache keyed by `id` and `?v=updatedAt`. |
| `GET/POST /api/messages`, `GET /api/messages/conversations`, `GET /api/messages/unread-count` | Messaging |
| `POST /api/checkout`, `POST /api/payment/init`, `/api/payment/success`, `/api/payment/fail`, `/api/payment/cancel`, `/api/payment/ipn` | Payments |
| `GET/POST /api/health-suggestions`, `GET/PUT/DELETE /api/health-suggestions/[id]`, `POST /api/health-suggestions/seed` | Pet Care module |
| `GET /api/admin/overview`, `GET /api/admin/pets` | Admin |
| `POST /api/seed` | Seed sample data |

## Local Development

1. Clone the repository: `git clone https://github.com/SumaiyaAhsan/pet-house.git`
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the project root (see below).
4. Run the server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

To load sample data, call `POST /api/seed` once, and `POST /api/health-suggestions/seed` for Pet Care content.

### Environment variables

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>

# Auth
JWT_SECRET=<a long random string>

# Public URL of the app (required by the payment gateway)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Plus the payment and SMTP variables described in the sections below.

## Adoption Payments

Paid adoptions use the SSLCommerz hosted checkout; wallet PINs and OTPs are entered only on the gateway. Configure these server environment variables before testing:

```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_SANDBOX=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use the SSLCommerz sandbox credentials and enable bKash, Nagad, and Rocket for the merchant account while developing. Set `SSLCOMMERZ_IS_SANDBOX=false` only when deploying with live merchant credentials and an HTTPS `NEXT_PUBLIC_APP_URL`. Successful payment notifications are validated server-to-server and committed with MongoDB transactions, so use a MongoDB replica set (MongoDB Atlas supports this).

Besides the gateway, the platform also supports an in-app wallet and cash on delivery. A completed payment moves the pet's status toward `reserved` or `adopted`.

## Contact Form Email

Contact form messages are sent to the email address of the first active admin account. The visitor's email is set as the reply-to address. Configure SMTP credentials as server-only environment variables:

```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=verified_sender_address
```

`SMTP_FROM` is optional and defaults to `SMTP_USER`. Keep these values private and configure them in the deployment environment, not in client-side code.

## How the Pieces Fit Together

- A pet starts as `pending`. An admin approves it, which makes it visible in public listings and opens chat between adopters and the owner.
- When an adopter pays, a `Transaction` is created through wallet, SSLCommerz, or cash on delivery. The gateway's IPN callback finalizes the payment, which implies the pet's status moves toward `reserved` or `adopted`.
- Chat access is enforced server-side: an adopter can message the owner of an approved pet or a pet they have ordered; the owner can reply to anyone who bought or messaged about their pet.
- Health suggestions are public to read, but only the shelter that created one can edit or delete it.

## Deployment Notes

The app is deployed on Render with CI/CD connected to GitHub, using MongoDB Atlas as the database. Two practical points follow from the free tier setup:

1. **Cold starts.** The service sleeps after about 15 minutes of idle time, so the first request can take 30 to 60 seconds. A keep-alive ping (for example UptimeRobot or cron-job.org every 5 to 10 minutes) or a paid plan avoids this.
2. **Timeouts and caching.** Dashboard fetches use a 30 second timeout with one retry, and the pet image route caches resized images in memory. Both choices reduce visible slowness after a cold start.

