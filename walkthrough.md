# Walkthrough - QuizGenius AI

QuizGenius AI is a complete, production-ready SaaS-quality full-stack application that leverages Google's Gemini API to dynamically generate educational multiple-choice quizzes from topics, raw text, or document uploads (PDF/DOCX).

---

## Technical Highlights

### 1. Clean Backend Architecture (Flask + SQLite)
- **Database Engine**: Powered by SQLite with structured foreign-key constraints and cascading deletes. It seeds a default admin user (`admin@quizgenius.ai` with password `admin123`) on startup.
- **JWT Authorization**: Custom decorators (`@token_required` and `@admin_required`) validate JWT signatures with automatic expiration (24h) and check user authorization on key REST endpoints.
- **Document Extractors**: Integrates PyMuPDF (`fitz`) and python-docx (`docx`) to parse raw text streams from file uploads with robust type validations and size limits (5MB).
- **Gemini API & Token Logs**: Utilizes Gemini's advanced JSON output support (`response_mime_type="application/json"`) to completely prevent parsing errors. Logs token usage and prompt statistics on successful generations to a platform audits table.

### 2. High-Fidelity Frontend Design System (Vite + React + Vanilla CSS)
- **Glassmorphic Theme**: Implements pure Vanilla CSS tokens (with custom light/dark color variables) to switch themes seamlessly. Uses background animated gradient blobs to provide depth and modern visual appeal.
- **Custom SVG Charts**: Implements interactive, lightweight SVGs for line and bar charts to display quiz performance statistics, accuracy histories, and weekly completions without third-party dependency issues.
- **Premium UX Flow**:
  - Auto-saves user responses inside `localStorage` during active play sessions to prevent loss of state on network disconnects or page reloads.
  - Features an active timer panel that auto-submits quizzes once time expires (60 seconds allocated per question).
  -celebrates passing scores (>=60% accuracy) with confetti explosions (`canvas-confetti`).
  - Allows users to copy individual questions/answers to the clipboard or export full quiz attempts to structured PDFs (`jspdf`).

---

## Verification Summary

A browser subagent was spawned to execute a manual end-to-end user and admin test flow:
1. Checked that the **Landing Page** loaded successfully.
2. Navigated to the **Registration Screen** and registered a new user, Jane Doe (`jane@quizgenius.ai` / `password123`).
3. Logged in as Jane Doe, checking automatic session mapping.
4. Verified that the **Dashboard** loaded with empty stats and placeholder widgets, and the **Profile Page** displayed locked badge achievements.
5. Logged out, and authenticated using the admin credentials (`admin@quizgenius.ai` / `admin123`).
6. Inspected the **Admin Panel**, confirming user tables showed both user records and that API log subtabs query active backend requests.

### Embedded Video Recording

Below is the complete walkthrough recording of the browser verification flow:

![1. Auth & Admin Panel Verification Flow](file:///C:/Users/bhara/.gemini/antigravity-ide/brain/2a9955bd-a25a-45cf-a353-25ea7b7bdc12/quizgenius_verification_1786123900925.webp)
<!-- slide -->
![2. Demo Mode Quiz Generation & Player Flow](file:///C:/Users/bhara/.gemini/antigravity-ide/brain/2a9955bd-a25a-45cf-a353-25ea7b7bdc12/demo_quiz_generation_1786126108511.webp)

---

## Folder Layout

The project files have been structured as follows:

- [backend/app.py](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/backend/app.py) - Main Flask routing & controller endpoints.
- [backend/requirements.txt](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/backend/requirements.txt) - Python package dependencies.
- [backend/database/schema.sql](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/backend/database/schema.sql) - SQLite schema definitions.
- [backend/database/db_manager.py](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/backend/database/db_manager.py) - Transaction and query wrapper.
- [backend/utils/auth.py](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/backend/utils/auth.py) - JWT helpers and route guards.
- [backend/utils/file_parser.py](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/backend/utils/file_parser.py) - PDF/DOCX text extractors.
- [backend/utils/gemini_client.py](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/backend/utils/gemini_client.py) - Google Gemini API orchestrator.
- [frontend/package.json](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/package.json) - Node package configurations.
- [frontend/index.html](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/index.html) - Main HTML document with SEO metadata.
- [frontend/src/main.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/main.jsx) - DOM mounting entrypoint.
- [frontend/src/App.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/App.jsx) - Main React controller and routing.
- [frontend/src/index.css](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/index.css) - Global CSS, glassmorphism styles, and animated variables.
- [frontend/src/components/Navbar.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/components/Navbar.jsx) - Responsive navbar header.
- [frontend/src/components/Button.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/components/Button.jsx) - Customized button variations.
- [frontend/src/components/GlassCard.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/components/GlassCard.jsx) - Structural card layout.
- [frontend/src/components/Toast.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/components/Toast.jsx) - Popup notification controller.
- [frontend/src/components/Skeleton.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/components/Skeleton.jsx) - Content placeholder loaders.
- [frontend/src/components/SVGCharts.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/components/SVGCharts.jsx) - Animated chart blocks.
- [frontend/src/hooks/useTheme.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/hooks/useTheme.jsx) - Theme management context hooks.
- [frontend/src/hooks/useAuth.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/hooks/useAuth.jsx) - Auth management context hooks.
- [frontend/src/services/api.js](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/services/api.js) - REST endpoint fetch client.
- [frontend/src/pages/LandingPage.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/LandingPage.jsx) - Marketing home screen.
- [frontend/src/pages/Login.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/Login.jsx) - Sign in credentials panel.
- [frontend/src/pages/Register.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/Register.jsx) - Registration panel.
- [frontend/src/pages/Dashboard.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/Dashboard.jsx) - User performance overview.
- [frontend/src/pages/QuizGenerate.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/QuizGenerate.jsx) - Multi-tab generator interface.
- [frontend/src/pages/QuizPlay.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/QuizPlay.jsx) - Active question taker panel.
- [frontend/src/pages/QuizResult.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/QuizResult.jsx) - Scored feedback & review.
- [frontend/src/pages/History.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/History.jsx) - Historical list of attempts.
- [frontend/src/pages/Profile.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/Profile.jsx) - Settings & gamified achievements.
- [frontend/src/pages/AdminPanel.jsx](file:///c:/Users/bhara/OneDrive/Documents/AI%20Quiz/frontend/src/pages/AdminPanel.jsx) - Platform management screen.
