
# Ski School OS — Complete Platform Design Document
## Unified Architecture • Data Models • UX • AI • Operations • Enhancements

## 0. Executive Summary

**Ski School OS** is a multi-tenant, AI-powered operational platform for ski schools, racing teams, and multi-resort organizations. It unifies operations into a single, cohesive system.

**Core Unified Modules:**
*   Instructor management
*   Parent communication
*   Real-time class tracking
*   Student progression
*   Document library + LMS
*   Accounting + payroll
*   Dynamic pricing
*   AI search + insights
*   Monthly coaching reports
*   Multi-school instructor marketplace

**Technology Stack:**
*   **Frontend:** Next.js App Router (TypeScript, RSC)
*   **Backend:** Supabase (Postgres + RLS + Storage + Auth)
*   **Styling:** Tailwind CSS
*   **AI:** Gemini / OpenAI / Claude
*   **PDF Generation:** Playwright/Puppeteer

---

## 1. High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Ski School OS                         │
├──────────────────────────────────────────────────────────────┤
│  Next.js App Router (UI + API)                               │
│  ├── Admin Portal                                            │
│  ├── Instructor Portal                                       │
│  ├── Parent Portal                                           │
│  ├── Support/Front Desk Portal                               │
│  └── Public Marketing Site                                   │
│                                                              │
│  Supabase Backend                                            │
│  ├── Postgres (Data + RLS)                                   │
│  ├── Storage (PDFs, media, documents)                        │
│  ├── Auth (multi-tenant RBAC)                                │
│  ├── Edge Functions (AI, cron, workers)                      │
│  └── Vector Search (pgvector)                                │
│                                                              │
│  AI Layer                                                    │
│  ├── Coaching summaries                                      │
│  ├── Messaging tone rewrite                                  │
│  ├── Translation                                             │
│  ├── Conversation summaries                                  │
│  ├── Lesson plan generation                                  │
│  ├── Document cleanup + SOP rewriting                        │
│  ├── AI search (hybrid retrieval)                            │
│  └── Risk detection                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenant RBAC Model

**Roles & Permissions:**

| Role | Permissions |
| :--- | :--- |
| `OWNER` | Full access to all schools |
| `ADMIN` | Full access to one school |
| `PROGRAM_DIRECTOR` | Instructor management, coaching, credentials |
| `FRONT_DESK` | Messaging, class management |
| `SUPPORT` | Messaging, parent support |
| `INSTRUCTOR` | Classes, messaging, portfolio updates |
| `ACCOUNTING` | Payroll, refunds, payouts |
| `PARENT` | Messaging, portfolio, real-time tracking |
| `STUDENT` | Portfolio (optional) |
| `HR` | Credentials, training, compliance |

**RLS Strategy:**
*   Every table includes `school_id`.
*   **Parents:** Only their children.
*   **Instructors:** Only their classes + their own coaching data.
*   **Directors/Admin:** All instructors in their school.
*   **Support:** All messaging.
*   **Accounting:** Financial tables only.

---

## 3. Complete Data Model

### 3.1. Messaging Hub
*   **`message_threads`**: `id`, `school_id`, `student_id`, `class_occurrence_id`, `created_by`
*   **`messages`**: `id`, `thread_id`, `sender_id`, `body`, `translated_bodies` (JSONB), `created_at`, `read_at`
*   **`thread_participants`**: `thread_id`, `user_id`

### 3.2. Instructor Coaching
*   **`instructor_goals`**: `instructor_id`, `created_by`, `status`, `target_date`
*   **`instructor_coaching_sessions`**: `instructor_id`, `coach_user_id`, `notes`, `ai_summary`
*   **`instructor_feedback`**: `instructor_id`, `source_type` (PARENT/PEER/DIRECTOR), `rating`, `comment`
*   **`instructor_monthly_summaries`**: `instructor_id`, `period_start`, `period_end`, `summary`, `strengths[]`, `improvements[]`, `actions[]`, `pdf_storage_path`

### 3.3. Credential Tracking
*   **`credential_types`**: `name`, `category`, `validity_years`
*   **`instructor_credentials`**: `instructor_id`, `credential_type_id`, `issued_date`, `expiry_date`, `document_id`
*   **`credential_training_requirements`**: `credential_type_id`, `training_module_id`

### 3.4. Real-Time Class Tracking
*   **`class_status_events`**: `class_occurrence_id`, `instructor_id`, `status` (ENUM), `latitude`, `longitude`, `created_at`

### 3.5. Student Portfolio 2.0
*   **`student_skill_events`**: `student_id`, `skill_category`, `level`, `note`
*   **`badges`**: `id`, `name`, `image_url`
*   **`student_badges`**: `student_id`, `badge_id`
*   **`student_media`**: `student_id`, `class_occurrence_id`, `is_in_portfolio`

### 3.6. Document Library + LMS
*   **`documents`**
*   **`document_shares`**
*   **`training_modules`**
*   **`training_module_items`**
*   **`training_assignments`**
*   **`training_progress`**
*   **`training_item_progress`**

### 3.7. AI Search
*   **`search_index`**: `document_id`, `content_tsv` (tsvector), `embedding` (vector 1536)

### 3.8. Accounting + Pricing
*   **`payroll_summary`**
*   **`refunds`**
*   **`transactions`**
*   **`pricing_rules`**
*   **`pricing_overrides`**

---

## 4. Complete Feature Modules

### 4.1. Parent Messaging Hub
*   **Features:** Threaded messaging, real-time updates, AI tone rewrite, AI translation, conversation summary.
*   **UI:** Parent inbox, Instructor inbox, Support inbox, Thread view, Composer with AI buttons.
*   **Enhancements:** Voice messages, Image attachments, Auto-tagging.

### 4.2. Instructor Coaching System
*   **Features:** Goals, Coaching sessions, Feedback, Credential tracking, Monthly AI reports.
*   **AI:** Monthly coaching summary, Strengths/improvements, Action items.
*   **Cron:** Monthly report generator, Credential expiry checker.

### 4.3. Real-Time Class Tracking
*   **Features:** Instructor check-ins ("On lift", "On snow", "Returning"), Parent live status feed.
*   **Enhancements:** GPS tracking, Terrain difficulty detection, ETA prediction.

### 4.4. Student Portfolio 2.0
*   **Features:** Skill timeline, Badges, Media gallery, AI "End of Season Report".
*   **Enhancements:** Skill heatmap, Level prediction, Personalized training plan.

### 4.5. Document Library + LMS
*   **Features:** Uploads, Sharing, Required reading, Training modules, Quizzes, AI SOP rewriting.
*   **Enhancements:** Video lessons, Auto-generated quizzes, AI "explain this document".

### 4.6. AI Search
*   **Features:** Hybrid retrieval (BM25 + vector), Document embeddings, AI answers with citations.
*   **Enhancements:** Semantic filters, Role-aware search results.

### 4.7. Accounting + Pricing
*   **Features:** Payroll, Refunds, Transactions, Dynamic pricing engine, A/B testing.
*   **Enhancements:** Revenue forecasting, Instructor cost modeling, Weather-based pricing.

---

## 5. Navigation Structure

*   **Admin:** Dashboard, Messages, Instructors (Performance, Credentials, Coaching), Reports, Training, Documents, Accounting, Settings.
*   **Instructor:** My Schedule, Messages, My Performance, My Credentials, My Reports.
*   **Parent:** Dashboard, Messages, My Children (Portfolio, Today’s Class).

---

## 6. AI Workflows

*   Coaching Summary
*   Tone Rewrite
*   Translation
*   Conversation Summary
*   Lesson Plan Generation
*   SOP Cleanup
*   AI Search Retrieval

---

## 7. Cron Jobs

*   Monthly Coaching Report Generator
*   Credential Expiry Checker
*   Pricing Engine Evaluator
*   Refund Risk Detector
*   AI Search Re-indexer

---

## 8. Storage Policies

*   **Buckets:** `reports`, `documents`, `media`
*   **Access Policies:**
    *   **Instructors:** Their own reports, class media.
    *   **Directors/Admin:** All reports.
    *   **Parents:** Only their children’s media.

---

## 9. Enhancements & Improvements

*   **AI-Powered Risk Dashboard:** Instructor shortages, refund spikes, weather impact.
*   **Instructor Marketplace:** Multi-school shift bidding.
*   **Racing Team Module:** Athlete analytics, video breakdown.
*   **Plugin System:** Custom fields, workflows.
*   **Public API:** Integrations for rentals, POS, etc.
