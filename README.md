
# Ski School OS ⛷️

The complete operating system for modern ski schools. A multi-tenant platform managing instructors, parents, real-time tracking, and student progression.

## 🚀 Features

-   **Instructor Coaching:** Goal tracking, feedback, and AI-generated monthly reports.
-   **Parent Messaging Hub:** Real-time, role-aware messaging threads.
-   **Class Tracking:** Live status updates (On Lift, Skiing, Lunch) with geolocation.
-   **Student Portfolio:** Digital skill passports, badges, and media galleries.
-   **Role-Based Access:** Granular permissions for Admins, Instructors, and Parents.

## 🛠️ Tech Stack

-   **Framework:** Next.js 14 (App Router)
-   **Language:** TypeScript
-   **Database:** Supabase (PostgreSQL)
-   **Auth:** Supabase Auth
-   **Styling:** Tailwind CSS
-   **AI:** Gemini / OpenAI (Edge Functions)

## 🏃‍♂️ Getting Started

1.  **Clone the repo**
    ```bash
    git clone https://github.com/your-org/ski-school-os.git
    cd ski-school-os
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials.

4.  **Database Setup**
    Run the SQL scripts in your Supabase SQL Editor:
    1.  `ski_school_os.sql` (Schema)
    2.  `policies.sql` (RLS Policies - *See Audit Report*)
    3.  `triggers.sql` (Auth Triggers - *See Audit Report*)
    4.  `storage_setup.sql` (Storage Buckets)

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🌐 Deployment

Deployed on Vercel with Middleware for i18n routing.

- **Production URL:** [https://ski-school.vercel.app](https://ski-school.vercel.app)
- **Supported Languages:** English (`/en`), Chinese (`/zh`)

## 🔄 Recent Updates

- **Landing Page Redesign:** A modern, high-conversion landing page with 3D elements and improved UX.
- **Build Stabilization:** Fixed SSR crashes and environment variable handling for robust deployments.
- **Architecture Improvements:** Optimized middleware routing and layout structure for better performance and SEO.

## 🔒 Security

This project uses Row Level Security (RLS) to ensure data isolation.
-   **Instructors** can only modify their assigned classes.
-   **Parents** can only view their own children.
-   **Admins** have full school-level access.

## 📄 License

Proprietary. Copyright © 2024 Ski School OS.
