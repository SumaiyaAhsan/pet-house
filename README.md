# 🐾 Pet House - Online Pet Adoption & Care Platform

Pet House is a full-stack pet adoption and care platform that connects shelters with adopters, functioning as a marketplace. 

## Live Demo
**Live Website:** [https://pet-house-ojrd.onrender.com](https://pet-house-ojrd.onrender.com)

## Features
- **Adoption Marketplace:** Shelters can list pets, and adopters can browse, filter, and view details.
- **Adoption Payments:** Secure hosted checkout with bKash, Nagad, and Rocket when enabled for the SSLCommerz merchant account.
- **Chat:** Real-time messaging between adopters and shelters.
- **Secure Authentication:** JWT-based login and registration with hashed passwords.
- **Admin Dashboard:** Approve or reject pet listings.
- **Care System:** Find nearby vet clinics and search pet medicine references.

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js API Routes (Node.js)
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT, bcryptjs
- **Deployment:** Render (CI/CD connected to GitHub)

## Local Development
1. Clone the repository: `git clone https://github.com/SumaiyaAhsan/pet-house.git`
2. Install dependencies: `npm install`
3. Create a `.env.local` file and add your database credentials.
4. Run the server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

## Adoption Payments
Paid adoptions use the SSLCommerz hosted checkout; wallet PINs and OTPs are entered only on the gateway. Configure these server environment variables before testing:

```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_SANDBOX=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use the SSLCommerz sandbox credentials and enable bKash, Nagad, and Rocket for the merchant account while developing. Set `SSLCOMMERZ_IS_SANDBOX=false` only when deploying with live merchant credentials and an HTTPS `NEXT_PUBLIC_APP_URL`. Successful payment notifications are validated server-to-server and committed with MongoDB transactions, so use a MongoDB replica set (MongoDB Atlas supports this).

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