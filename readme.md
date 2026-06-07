# Ikonex Academy – Student Management System

A full‑stack web application for managing class streams, students, subjects, scores, and performance reporting – built as a practical assessment for Ikonex Academy.

**Live Demo:** [Click to view](https://student-management-system-8428.onrender.com/student-performance)  


## Features

- **Class Stream Management** – Create, view, edit, delete streams (e.g., Form 1A).  
- **Subject Management** – Create, edit, delete subjects, and assign them to class streams.  
- **Student Management** – Register, edit, delete students; filter by class stream.  
- **Score Entry** – Record exam and continuous assessment scores per student/subject/term.  
- **Duplicate Prevention** – Cannot enter multiple scores for the same student/subject/term (updates instead).  
- **Score Validation** – Ensures scores are between 0 and 100.  
- **Results Processing** – Automatic calculation of total marks, average, grade, subject position, and overall class rank.  
- **Student Performance View** – See a student’s full report (per subject with positions).  
- **Class Performance View** – Rank students within a stream for a chosen subject or overall.  
- **PDF Report Card** – Download individual student report card as PDF.  
- **PDF Class Report** – Download class performance report as PDF.  
- **Responsive Design** – Works on mobile, tablet, and desktop (Tailwind CSS + custom sidebar).

## Usage
Once you access the platform using the demo link provided above, you can access the various features from a sidepanel displayed on the left.
1. Create a class stream then check if it is displayed in the table below. Once created you can use the various buttons to view, edit, or delete details.
2. Add a new subject then assign it to a specific class stream.
3. Using the 'students' option on the sidepanel, you can check all available students in all streams or filter by stream. You can also add a new student.
4. Record the scores for a student.
5. You can check both student and class performance and also be able to filter by subject. Use the button displayed below the records to download a pdf report.

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React + Vite + Tailwind CSS           |
| Backend     | Node.js + Express                        |
| Database    | PostgreSQL (hosted on Supabase)          |
| PDF Gen     | jsPDF + html2canvas                      |
| Testing     | Jest + Supertest (backend)               |
| Deployment  | Render (single service)                  |
| Version Control | Git + GitHub                           |

---

## Project Structure

```bash
ikonex-academy/
├── backend/
│ ├── db/
│ │ ├── pool.js
│ │ └── schema.sql
│ ├── routes/
│ │ ├── streams.js
│ │ ├── subjects.js
│ │ ├── students.js
│ │ ├── assessments.js
│ │ └── results.js
│ ├── tests/
│ │ ├── streams.test.js
│ │ ├── subjects.test.js
│ │ ├── students.test.js
│ │ ├── assessments.test.js
│ │ └── results.test.js
│ ├── server.js
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── pages/ (Streams, Subjects, Students, Scores, StudentPerformance, ClassPerformance)
│ │ ├── components/ (ReportCardTemplate, ClassReportTemplate)
│ │ ├── utils/ (pdfGenerator.js)
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
├── .gitignore
├── package.json (root)
└── README.md
```


## Getting Started (Local Development)

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL (local or Supabase account)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Rabinnnn/student-management-system.git
cd student-management-system
```
### 2. Set up environment variables
- Create a backend/.env file:
```bash
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres?sslmode=require
```
(If using local PostgreSQL, use postgresql://postgres:password@localhost:5432/yourdb)

### 3. Install dependencies
From the project root:
```bash
npm install                 # installs concurrently (root only)
cd backend && npm install
cd ../frontend && npm install
```
### 4. Set up the database schema
```
cd backend
npm run init-db            # runs scripts/initDb.js to create tables
```
(Or run the SQL in backend/db/schema.sql manually in your database.)

### 5. Run the development servers
From the project root:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
The frontend proxies /api requests to the backend automatically.

### 6. Run tests
```bash
cd backend
npm test
```
## Deployment (Render)
The project is configured for single‑service deployment on Render. Both frontend and backend run from the same domain.

### Steps
1. Push your code to a GitHub repository.

2. On Render.com, create a New Web Service.

3. Connect your GitHub repo.

4. Configure:

**Root Directory** -	.
**Build Command** -	npm run build
**Start Command** -	npm run start
**Environment Variables** - NODE_ENV=production
                            DATABASE_URL=your_supabase_connection_string
5. Click Create Web Service.

After deployment, your app will be live at https://your-app.onrender.com.

Note: The free tier spins down after 15 minutes of inactivity. The first request after a break may take ~30‑45 seconds to wake up.