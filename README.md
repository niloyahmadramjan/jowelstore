JowelStore — Modern Full-Stack E-commerce (Next.js 16)

Live Demo: https://jowelstore.vercel.app/
Repository: https://github.com/niloyahmadramjan/jowelstore


---

Overview

JowelStore is a modern full-stack e-commerce application built with the latest Next.js App Router architecture.
The project focuses on authentication, product management, media uploads, and a scalable MongoDB backend.

This project demonstrates production-style architecture, secure authentication, API design, and responsive UI development.


---

Tech Stack

Frontend

Next.js 16 (App Router)

React 19

TailwindCSS 4

Framer Motion

Lucide Icons

Axios


Backend / Auth / Database

NextAuth v5 (Auth.js)

MongoDB + Mongoose

JWT Authentication

Bcrypt Password Hashing

Cloudinary Image Upload



---

Features

Authentication

Credentials login/signup

Secure password hashing (bcrypt)

JWT session handling

Protected routes


Product System

Create / Read products

SEO-friendly slug generation

Image upload via Cloudinary

REST API structure


UI / UX

Fully responsive design

Animated UI using Framer Motion

Clean component structure

Modern Tailwind styling


Developer Experience

TypeScript support

ESLint configured

Environment variable support

Faker data support for testing



---

Project Structure

app/
  api/
  (auth)/
  (shop)/
components/
lib/
models/
public/

Architecture follows a modular structure for scalability and maintainability.


---

Getting Started

1. Clone Repository

git clone https://github.com/niloyahmadramjan/jowelstore.git
cd jowelstore

2. Install Dependencies

npm install

3. Setup Environment Variables

Create .env.local

MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

4. Run Development Server

npm run dev

Open:

http://localhost:3000


---

Available Scripts

npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint


---

Key Dependencies

Package	Purpose

next-auth	Authentication
mongoose	MongoDB ORM
cloudinary	Image hosting
bcryptjs	Password hashing
jsonwebtoken	Token management
framer-motion	Animations



---

Learning Goals

This project was built to practice:

Full-stack Next.js architecture

Secure authentication flows

API route design

MongoDB data modeling

Production deployment on Vercel



---

Deployment

The app is deployed on Vercel and connected with MongoDB Atlas and Cloudinary.
