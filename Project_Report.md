# CJ Fitness - Comprehensive Project Overview

This document provides a detailed overview of the technical architecture, features, and technology stack used in the CJ Fitness web application.

## 1. Executive Summary
**CJ Fitness** is a full-stack web application designed for personal trainers and their clients. It streamlines the process of managing workout plans, meal plans, client progress tracking, and communication. The system features a dedicated Admin dashboard for the coach and a personalized interface for clients.

---

## 2. Technology Stack

### Frontend
- **Framework**: React (v18.2.0)
- **Build Tool**: Vite (v5.1.4)
- **Styling**: Tailwind CSS (v3.4.1) for modern, responsive UI.
- **Routing**: React Router DOM (v6.22.0)
- **Icons**: Lucide React
- **Progressive Web App (PWA)**: Implemented using `vite-plugin-pwa` for an app-like experience on mobile devices.
- **Animations**: Canvas Confetti for user engagement.

### Backend
- **Runtime**: Node.js
- **Framework**: Express (v5.2.1)
- **Database**: MongoDB Atlas (Cloud Database)
- **ORM/ODM**: Mongoose (v9.2.1)
- **Authentication**: Custom authentication logic with role-based access control (Admin/Client).
- **Environment Management**: Dotenv for secure configuration.

---

## 3. Core Features & Functional Modules

### Admin Dashboard (Coach Interface)
- **Client Management**: Full CRUD operations for managing client profiles, referral codes, and personal details.
- **Workout Plan Management**: Create, assign, and update customized workout routines with exercise videos/GIFs.
- **Meal Plan Designer**: Build comprehensive diet plans including macro breakdowns (Carbs, Protein, Fats, Calories).
- **Exercise Library**: A searchable database of exercises with categories (Chest, Back, Legs, etc.).
- **Progress Tracking & Analytics**: View client check-ins, weight trends, and activity logs.
- **Billing & Payments**: Track client payments, outstanding balances, and subscription statuses.
- **Real-time Messaging**: Direct communication channel with all clients.
- **Reminders & Alarms**: Set custom reminders for clients that trigger both in-app and via email.

### Client Interface
- **Personalized Dashboard**: High-level view of current workout/meal plans and daily goals.
- **Progressive Check-ins**: Submit weekly check-ins with weight, reflections, and progress photos.
- **Metric Tracking**: Log body metrics (Weight, Body Fat %, etc.) with visual chart representations.
- **Goal Tracker**: Set and monitor long-term fitness milestones.
- **BMR & Macro Calculator**: Built-in tools for clients to calculate their caloric needs.
- **Educational Resource**: Access to the exercise library to ensure proper form.

---

## 4. Advanced System Integrations

### Automated Tasks (Cron Jobs)
The system utilizes `node-cron` for automated background processing:
- **Weekly Check-in Reminders**: Automatically sends emails and in-app notifications to all clients every Monday at 9:00 AM.
- **Custom Alarms**: Monitors and triggers personalized reminders at scheduled times.

### Email Service
Integration with a dedicated email service (`emailService.js`) to ensure clients receive critical updates and reminders directly in their inbox.

### Database Architecture
The project uses a structured schema in MongoDB Atlas, covering:
- **Admins & Clients**
- **Workout & Meal Plans**
- **Messages & Notifications**
- **Payments & Metrics**
- **Tasks & Goals**

---

## 5. Deployment & Scalability
The application is designed for scalability and modern deployment workflows:
- **Frontend**: Optimized for deployment on platforms like Vercel.
- **Backend**: Scalable Node.js server capable of handling multiple concurrent connections.
- **Database**: MongoDB Atlas provides high availability and automated backups.

---

*Prepared by Antigravity AI for CJ Fitness.*
