# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Smart Course Companion  
SOEN 287 – Web Programming  
Winter 2026  

## Overview

Smart Course Companion is a web-based application that helps university students manage:

- Courses
- Assessments (assignments, labs, quizzes, exams)
- Grades and averages
- Upcoming deadlines
- Academic progress visualization

It also provides basic tools for instructors/admins to manage course structures.


---

## Features (Deliverable #1)

### Student
- Register and login (frontend simulation)
- Add, edit, delete courses
- View and manage assessments
- Enter marks (earned/total)
- Automatic course average calculation
- Dashboard with upcoming assessments
- Mark assessments as completed/pending
- Visual progress indicators

### Instructor/Admin
- Create and manage courses
- Define assessment categories and weightings
- Enable/disable courses
- View basic usage summaries (UI simulation)

---

## Tech Stack

- React
- React Router
- CSS
- Node.js (required to run locally)

---

## Installation & Running Locally

### 1. Clone the project
```bash
git clone <repository-url>
cd smart-course-companion
```
### 2. Install Dependencies
Make sure Node.js is installed:

```bash
node -v
npm -v
```

Then install the project dependencies:
```bash
npm install
```

Install backend dependencies too:
```bash
cd backend
npm install
cd ..
```

### 3. Create the backend environment file
Inside the `backend` folder, create a file named `.env`.

You can copy the example file:
```bash
cp backend/.env.example backend/.env
```

The file should contain:
```env
MONGO_URI=
PORT=5000
```

### 4. Run the backend
Open a terminal and run:
```bash
cd backend
node server.js
```

You should see:
- `MongoDB connected`
- `Server running on http://127.0.0.1:5000`

### 5. Run the frontend
Open another terminal and run:
```bash
npm start
```
