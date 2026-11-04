# 🚗 Vehicle Inspection & Repair Advisory Web System

<div align="center">

![Vehicle Inspection](https://img.shields.io/badge/Project-Vehicle%20Inspection-1a237e?style=for-the-badge&logo=car&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flutter](https://img.shields.io/badge/Flutter-Mobile-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

**A full-stack web platform connecting vehicle buyers with certified inspectors across Sri Lanka**

*EAD2 Coursework Project — NIBM Higher National Diploma in Software Engineering*

[🌐 Live Demo](#) · [📱 Mobile App](#) · [📖 API Docs](#api-endpoints) · [🐛 Report Bug](https://github.com/kavindugayasiri/Madara_Motors_web_System/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Database Schema](#-database-schema)
- [Author](#-author)

---

## 🎯 About the Project

The **Vehicle Inspection & Repair Advisory Web System** is a comprehensive digital platform designed to solve a critical problem in Sri Lanka's used vehicle market — the lack of transparent, accessible, and reliable vehicle inspection services.

### 🔍 Problem Statement
When purchasing a used vehicle in Sri Lanka, buyers face significant risks due to hidden mechanical issues, lack of professional inspection services, and no centralized platform to find certified vehicle inspectors. This often leads to costly repairs after purchase.

### ✅ Solution
This platform bridges the gap between **vehicle buyers (customers)** and **certified vehicle inspectors**, providing:
- A searchable directory of verified inspectors across Sri Lanka
- Direct inspector hiring with appointment booking
- Repair cost advisory and estimates
- Ratings and reviews for inspectors
- Real-time request tracking for both customers and inspectors

---

## ✨ Features

### 👤 Customer Features
- 🔍 **Search & Browse Inspectors** — Filter by location, specialization, rating, and availability
- 📋 **Inspector Profiles** — View detailed profiles, certifications, and customer reviews
- 📅 **Hire Directly** — Send hiring requests with vehicle details and preferred date
- 📊 **Track Requests** — Real-time status updates (Pending → Accepted → Completed)
- ⭐ **Rate & Review** — Leave feedback for completed inspections
- 🔧 **Repair Info** — Browse repair cost estimates and advisory guides

### 🔧 Inspector Features
- 🗂️ **Professional Dashboard** — Manage all incoming hiring requests
- ✅ **Accept/Reject Requests** — Full control over workload and schedule
- 📈 **Job History** — Track completed inspections
- 👤 **Profile Management** — Update certifications, location, and specializations

### 🛡️ Admin Features
- 👥 **User Management** — View and manage all registered users
- ✔️ **Inspector Verification** — Approve/reject inspector registrations
- 🔧 **Repair Database** — Add, update, and delete repair information
- 📊 **Platform Analytics** — Monitor system activity

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17 | Core language |
| **Spring Boot** | 3.4.5 | REST API framework |
| **Spring Security** | 6.x | Authentication & authorization |
| **JWT (jjwt)** | 0.12.6 | Token-based authentication |
| **Spring Data JPA** | — | ORM and database layer |
| **Maven** | 3.x | Build and dependency management |

### Frontend (Web)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18 | UI framework |
| **Vite** | 5.x | Build tool and dev server |
| **React Router DOM** | v6 | Client-side routing |
| **Axios** | 1.x | HTTP client with JWT interceptor |
| **Context API** | — | Global auth state management |

### Mobile App
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Flutter** | 3.x | Cross-platform mobile framework |
| **Dart** | 3.x | Programming language |

### Database
| Technology | Purpose |
|-----------|---------|
| **MySQL 8.0** | Primary relational database |

---

## 🏗️ System Architecture

---

## 🚀 Getting Started

### Prerequisites
- ☕ Java 17
- 📦 Maven 3.6+
- 🗄️ MySQL 8.0
- 🌐 Node.js 18+
- 📱 Flutter SDK (for mobile)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/kavindugayasiri/Madara_Motors_web_System.git
cd Madara_Motors_web_System
```

### 2️⃣ Database Setup

```sql
CREATE DATABASE vehicle_inspection_db;
```

### 3️⃣ Backend Setup

```bash
cd Madara_Motos_WEBSysteme
mvn spring-boot:run
```
✅ Runs at **http://localhost:8080**

### 4️⃣ Frontend Setup

```bash
cd vehicle-inspection-frontend
npm install
npm run dev
```
✅ Runs at **http://localhost:5173**

### 5️⃣ Flutter Mobile Setup

```bash
cd vehicle-inspection-mobile
flutter pub get
flutter run
```

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & get JWT | ❌ |

### 👥 Inspectors
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/inspectors` | All verified inspectors | ❌ |
| `GET` | `/api/inspectors/{id}` | Inspector by ID | ❌ |

### 📋 Hiring
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/hiring/request` | Send hiring request | CUSTOMER |
| `GET` | `/api/hiring/my-requests` | Customer's requests | CUSTOMER |
| `GET` | `/api/hiring/inspector-requests` | Inspector's jobs | INSPECTOR |
| `PUT` | `/api/hiring/{id}/status` | Accept/Reject | INSPECTOR |

### 🛡️ Admin
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/admin/users` | All users | ADMIN |
| `PATCH` | `/api/admin/inspectors/{id}/verify` | Verify inspector | ADMIN |
| `POST` | `/api/admin/repairs` | Add repair info | ADMIN |
| `DELETE` | `/api/admin/repairs/{id}` | Delete repair info | ADMIN |

> 🔒 Protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| 🙋 **CUSTOMER** | Hire inspectors, track requests, rate inspectors |
| 🔧 **INSPECTOR** | Manage requests, update profile, view job history |
| 🛡️ **ADMIN** | Full platform management, user verification |

---

## 🗄️ Database Schema

```sql
users (id, full_name, email, password, role, phone, created_at)
inspector_profiles (id, user_id, location, specialization, experience, rating, is_verified)
hiring_requests (id, customer_id, inspector_id, vehicle_type, vehicle_reg, status, requested_at)
repair_info (id, vehicle_type, issue_type, description, estimated_cost_min, estimated_cost_max)
ratings (id, customer_id, inspector_id, rating, review, created_at)
```

---

## 📂 Project Structure

---

## 🎓 Academic Information

| Detail | Info |
|--------|------|
| **Student** | Kavidu Gayasiri Bandara |
| **Course** | HND in Software Engineering |
| **Institute** | NIBM — National Institute of Business Management |
| **Module** | Enterprise Application Development 2 (EAD2) |

---
---

## 🎓 Academic Information

| Detail | Info |
|--------|------|
| **Student** | Kavidu Gayasiri Bandara |
| **Course** | HND in Software Engineering |
| **Institute** | NIBM — National Institute of Business Management |
| **Module** | Enterprise Application Development 2 (EAD2) |

---


---

## 🎓 Academic Information

| Detail | Info |
|--------|------|
| **Student** | Kavidu Gayasiri Bandara |
| **Course** | HND in Software Engineering |
| **Institute** | NIBM — National Institute of Business Management |
| **Module** | Enterprise Application Development 2 (EAD2) |

---

## 👨‍💻 Author

<div align="center">

**Kavidu Gayasiri Bandara**

[![GitHub](https://img.shields.io/badge/GitHub-kavindugayasiri-181717?style=for-the-badge&logo=github)](https://github.com/kavindugayasiri)
[![Email](https://img.shields.io/badge/Email-kavindugayasiri%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kavindugayasiri@gmail.com)

*NIBM Software Engineering Student | Kurunegala, Sri Lanka* 🇱🇰

</div>

---

<div align="center">

Made with ❤️ by **Kavidu Gayasiri Bandara**

⭐ Star this repo if you found it helpful!

</div>

Made with ❤️ by **Kavidu Gayasiri Bandara** & **Oshadhi Harindya Senarathna**

⭐ Star this repo if you found it helpful!

</div>
