
# Blueprint: Project Phoenix

## 1. Overview

This document outlines the architecture, features, and implementation plan for Project Phoenix, a comprehensive platform for managing swim school operations.

### 1.1. Core Features

*   **Instructor Coaching System:** Track goals, feedback, and generate monthly AI-powered coaching reports.
*   **Credential Tracking:** Manage instructor credentials and training requirements.
*   **Parent Messaging Hub:** Secure messaging for parents, instructors, and admins.
*   **Real-time Class Tracking:** Monitor class status in real-time.
*   **Student Portfolio 2.0:** Track student skills, badges, and media.
*   **Document Library & LMS:** A centralized repository for documents and training modules.
*   **AI Search & Semantic Retrieval:** Hybrid search capabilities for the entire platform.
*   **Alerts Engine:** Automated notifications for important events.
*   **Accounting & Payroll:** Manage transactions, refunds, and payroll.
*   **Dynamic Pricing Engine:** Implement flexible pricing rules and overrides.
*   **Role-Based Portals:** Dedicated portals for Admin, Instructor, Parent, Support, and Accounting roles.

---

## 2. Core Technology Stack

*   **Framework:** Next.js (App Router)
*   **Database:** Supabase (PostgreSQL)
*   **Styling:** Tailwind CSS
*   **Authentication:** Supabase Auth
*   **Deployment:** Vercel

---

## 3. Architecture

### 3.1. Supabase Client Strategy

To ensure a clean separation of concerns and optimal performance, we use two separate Supabase client initializations:

*   **`lib/supabase/server.ts`**: For server-side logic (React Server Components, Route Handlers, Server Actions). This client is wrapped in `React.cache` to prevent re-creating the client on every server-side render, which is a Next.js best practice.

    ```typescript
    import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
    import { cookies } from 'next/headers';
    import { cache } from 'react';

    export const createServerSupabaseClient = cache(() => {
      const cookieStore = cookies();
      return createServerComponentClient({ cookies: () => cookieStore });
    });
    ```

*   **`lib/supabase/client.ts`**: For client-side logic (Client Components with interactivity).

    ```typescript
    import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

    export const createClient = () => createPagesBrowserClient();
    ```

### 3.2. Database Schema

#### `instructor_goals`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `instructor_id` | `uuid` | Foreign Key to `users` |
| `goal` | `text` | The goal for the instructor |
| `status` | `text` | e.g., 'active', 'completed' |
| `created_at` | `timestamp` | |

---

## 4. API & Data Layer

### 4.1. API Reference

*   **`GET /api/instructors/[instructorId]/goals`**
    *   Retrieves all goals for a specific instructor.
*   **`POST /api/instructors/[instructorId]/goals`**
    *   Creates a new goal for an instructor.

### 4.2. Server Actions

For data mutations, we will use Server Actions to provide a direct and secure way to call server-side functions from our components.

*   **`createInstructorGoal(instructorId: string, formData: FormData)`**
*   **`updateInstructorGoalStatus(goalId: string, status: string, instructorId: string)`**

---

## 5. Pages & Routes

### 5.1. Instructor Coaching

*   `/admin/instructors/[instructorId]/coaching`

---

## 6. Current Plan: Instructor Coaching MVP

1.  **DONE:** Refactor Supabase client initialization.
2.  **DONE:** Create API Routes for instructor goals.
3.  **DONE:** Create UI Components:
    *   `components/coaching/InstructorCoachingTab.tsx`: The main container for the coaching features.
    *   `components/coaching/GoalList.tsx`: To display the list of goals.
    *   `components/coaching/AddGoalForm.tsx`: A form to add new goals using a Server Action.
4.  **DONE:** Implement Server Action for creating goals.
5.  **DONE:** Integrate the components and Server Action into the main coaching page.

## 7. Feature: Parent Messaging Hub

1.  **DONE:** Create Directory: `app/parent/messages`
2.  **DONE:** Create Page: `app/parent/messages/page.tsx`
3.  **DONE:** Create Components:
    *   `components/ThreadList.tsx`
    *   `components/MessageThreadView.tsx`
    *   `components/MessageComposer.tsx`

## 8. Feature: Real-Time Class Tracking

1.  **DONE:** Create API Route: `app/api/classes/[occurrenceId]/status/route.ts`
2.  **DONE:** Create Instructor Page: `app/instructor/classes/[classOccurrenceId]/status/page.tsx`
3.  **DONE:** Create Parent Page: `app/parent/children/[studentId]/today/page.tsx`

## 9. Feature: Student Portfolio 2.0

1.  **DONE:** Create API Routes: `app/api/students/[id]/portfolio/route.ts` (GET, POST skills/badges)
2.  **DONE:** Create Parent Page: `app/parent/children/[studentId]/portfolio/page.tsx`
3.  **DONE:** Create Instructor Page: `app/instructor/students/[studentId]/portfolio/page.tsx`

## 10. System Completion

1.  **DONE:** Database Schema (`ski_school_os.sql`)
2.  **DONE:** Storage Policies (`storage_setup.sql`)
3.  **DONE:** Full Design Document (`DESIGN_DOCUMENT.md`)
