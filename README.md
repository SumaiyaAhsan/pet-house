# 🐾 Pet House - Online Pet Adoption & Care Platform

Pet House is a full-stack pet adoption and care platform that connects shelters with adopters, functioning as a marketplace. 

## Live Demo
**Live Website:** [https://pet-house-ojrd.onrender.com](https://pet-house-ojrd.onrender.com)

## Features
- **Adoption Marketplace:** Shelters can list pets, and adopters can browse, filter, and view details.
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