# 📘 School Vaccination Portal – FSAD Assignment 2025–26

A full-stack web application to manage school student vaccination drives, developed using **React (frontend)** and **Spring Boot (backend)**.

This portal allows the school coordinator to:
- Add/edit/search students
- Schedule and track vaccination drives
- Monitor vaccination status
- View analytics and generate reports
- Upload and export data via CSV
- Simulated Admin login 
---

## 🚀 Features

### 🔐 Authentication (Simulated)
- Hardcoded login (username: `admin`, password: `admin123`)
- JWT Token based support

### 👩‍🎓 Student Management
- Add individual students
- Bulk upload via CSV
- Search/filter student records

### 💉 Vaccination Drives
- Create/edit drives (with validation)
- Date must be 15+ days from today
- Filter by applicable classes

### ✅ Vaccination Status
- Mark students as vaccinated (only once per vaccine)
- Track drive and vaccine name

### 📊 Dashboard
- Total students
- Vaccinated count and %
- Drives scheduled in the next 30 days

### 📄 Reports
- View full vaccination history
- Downloadable as CSV, PDF, Excel

---

## 🛠️ Tech Stack

| Frontend               | Backend              |
|------------------------|----------------------|
| React + React Router   | Java + Spring Boot   |
| Fetch (API calls)      | Hibernate (ORM)      |
| CSS (Theme Styling)    | PostgreSQL (Database)|

---

## 📁 Folder Structure

```
Spring Boot App
src/
├── controller/
├── dto/
├── entity/
├── repository/
├── service/
├── util/
└── config/

React App
src/
├── components/
├── pages/
├── services/
├── context/
└── App.jsx

```

---

## ✅ Getting Started

### 1. Backend Setup (Flask)
```bash
   git clone https://github.com/mehrasamanyu1/Student-Vaccination-Portal-Backend.git
   cd school-vaccination-backend
```

### 2. Frontend Setup (React)
```bash
   git clone https://github.com/mehrasamanyu1/Student-Vaccination-Portal-Frontend.git
   cd school-vaccination-frontend
```

> Ensure React runs on `http://localhost:3000` by default

---

## 👤 Login Details (Simulated)
- **Username:** `admin`
- **Password:** `admin123`

---

## 📷 Screenshots

> Include screenshots of:
> - Dashboard
> - Student page
> - Drive form
> - Reports table

---

## 📦 Submission Notes
- All 5 user stories implemented ✅
- Full backend validations, CSV features ✅
- Rich UI, reusable components, responsive design ✅
