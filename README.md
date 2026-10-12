# QuizGenius AI 🧠✨
### AI-Powered Multi-Format Quiz Generation Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19.0%2B-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0%2B-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini%20API-Enabled-orange.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite3-Database-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**QuizGenius AI** is a production-ready, SaaS-quality quiz generation application that automatically generates comprehensive multiple-choice assessments from **topics**, **study notes**, **PDFs**, and **DOCX files** using Google's Gemini API. 

Designed for educators, students, and self-directed learners, the platform turns unstructured material into structured quizzes with explanations, active timers, detailed result analytics, and gamified progress tracking.

---

## 🌟 Key Features

- **Multi-Input Generation**:
  - **Topic-Based**: Enter any topic (e.g., *Quantum Computing*, *JavaScript Closures*, *World War II*) and select question count and difficulty.
  - **Text / Notes**: Paste lectures, articles, or notes; QuizGenius analyzes key concepts and extracts targeted questions.
  - **Document Uploads**: Upload **PDF** or **DOCX** files (up to 5MB) for automatic text extraction and quiz synthesis.
- **Intelligent Demo Mode**:
  - Works out of the box even without a `GEMINI_API_KEY` configured! A built-in local knowledge engine extracts concise concepts and questions for testing.
- **Interactive Quiz Player**:
  - Real-time countdown timer with auto-submit.
  - Local storage autosave to prevent loss of progress during accidental page refreshes.
  - Question flagging and live question pagination.
- **Detailed Results & Analytics**:
  - Instant score feedback with percentage accuracy and completion time.
  - Question-by-question review showing selected answer, correct answer, and detailed rationale.
  - Export completed quizzes to formatted **PDF** documents (`jsPDF`) or copy questions to clipboard.
  - Celebration animations (`canvas-confetti`) for passing scores.
- **Dashboard & Performance Tracking**:
  - Lightweight custom **SVG interactive charts** (weekly accuracy trends and volume).
  - Quick statistics: total quizzes attempted, overall accuracy, questions answered, and study time.
- **Gamified Achievements**:
  - Unlockable badges (e.g., *Novice Quizzer*, *Einstein Status*, *Perfectionist*, *Speed Demon*).
- **Admin Control Panel**:
  - User management, quiz attempt monitoring, and Gemini API token usage logs.
- **Unified Single-File Runner**:
  - Launch both backend and frontend servers with a single click or command.

---

## 🏗️ Architecture & Tech Stack

```
AI-Quiz-Generator/
├── backend/
│   ├── database/
│   │   ├── db_manager.py     # SQLite thread-safe wrapper
│   │   └── schema.sql        # Tables for users, quizzes, attempts, logs
│   ├── uploads/              # Temporary document storage
│   ├── utils/
│   │   ├── auth.py           # JWT token generation & verification decorators
│   │   ├── file_parser.py    # PyMuPDF & python-docx extractors
│   │   └── gemini_client.py  # Gemini API orchestrator & Demo Mode fallback
│   ├── app.py                # Flask REST API endpoints & CORS configuration
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar, GlassCard, SVGCharts, Modal, Toast)
│   │   ├── hooks/            # useAuth, useTheme contexts
│   │   ├── pages/            # LandingPage, Dashboard, QuizGenerate, QuizPlay, History, Admin
│   │   ├── services/         # Axios/Fetch API client
│   │   ├── App.jsx           # Routing & layout wrapper
│   │   └── index.css         # Glassmorphism tokens & dark/light theme variables
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite build configuration
├── run.bat                   # Double-click Windows launcher
├── start.bat                 # Windows launcher alias
├── run.py                    # Cross-platform Python unified runner
├── run.ps1                   # PowerShell unified runner
├── .gitignore                # Production git ignore configuration
└── README.md                 # Project documentation
```

### Technologies:
- **Backend**: Python 3.10+, Flask, SQLite, PyMuPDF (`fitz`), `python-docx`, `google-generativeai`, `PyJWT`, `werkzeug`.
- **Frontend**: React 19, Vite, Vanilla CSS Design System (Glassmorphic dark/light themes), Lucide Icons, Canvas Confetti, jsPDF.

---

## 🚀 Quick Start (Single Command)

### 1. Clone the Repository
```bash
git clone https://github.com/BlackVenom7405/AI-Quiz-Generator.git
cd AI-Quiz-Generator
```

### 2. Configure Environment (Optional for Gemini API)
Copy the example environment file and add your Google Gemini API key:
```bash
cp backend/.env.example backend/.env
```
In `backend/.env`:
```env
SECRET_KEY=your_custom_secret_key_12345
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> **Note**: If you don't provide an API key, the system automatically runs in **Demo Mode**, generating mock quizzes with topic analysis so all features remain testable.

### 3. Run with a Single File!

#### Windows (Double-Click):
Double-click **`run.bat`** (or **`start.bat`**) in the project folder.

#### Via Terminal / Command Line:
```bash
python run.py
```
*Or on PowerShell:*
```powershell
.\run.ps1
```

The runner automatically starts:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`
- Opens your default web browser to the app!

---

## 🛠️ Manual Setup

If you prefer starting backend and frontend in separate terminal windows:

### Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

### Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

---

## 🔑 Default Credentials

The SQLite database seeds a default administrator account upon first launch:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@quizgenius.ai` | `admin123` |
| **New User** | Register any new account on `/register` |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Create a new user account | No |
| `POST` | `/login` | Authenticate and obtain JWT token | No |
| `GET` | `/dashboard` | User quiz statistics & recent activity | Yes |
| `POST` | `/generate-topic` | Generate quiz from a topic prompt | Yes |
| `POST` | `/generate-text` | Generate quiz from raw text/notes | Yes |
| `POST` | `/generate-file` | Generate quiz from PDF/DOCX file | Yes |
| `POST` | `/submit-quiz` | Save attempt answers & compute score | Yes |
| `GET` | `/history` | List user attempt history | Yes |
| `GET` | `/attempt/<id>` | Retrieve detailed attempt breakdown | Yes |
| `GET` | `/admin/metrics` | System-wide statistics & token usage | Admin Only |
| `GET` | `/admin/users` | List all platform users | Admin Only |
| `GET` | `/admin/quizzes` | List all generated quizzes | Admin Only |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
