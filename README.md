
<div align="center">

<img src="Frontend/public/logo.png" alt="NobatYar Logo" width="120" />

# 🏥 NobatYar | نوبت‌یار

### Your Health, Your Time, Your Appointment.

**A Modern & Multilingual Healthcare Appointment Booking Platform**

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

<br/>

![Status](https://img.shields.io/badge/Status-In_Development-orange?style=flat-square)
![Languages](https://img.shields.io/badge/Languages-English%20%7C%20Dari%20%7C%20Pashto-blue?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Web-green?style=flat-square)

---

### 🌐 English | دری | پښتو

**Connecting Patients with Doctors, Hospitals & Clinics**

</div>

## 📖 About NobatYar

**NobatYar (نوبت‌یار)** is a modern healthcare appointment booking platform designed to make finding doctors, exploring hospitals and clinics, and booking medical appointments easier and more convenient.

The platform aims to connect patients with healthcare providers through a simple, responsive, and multilingual experience.

NobatYar is designed with accessibility, usability, and convenience in mind.

> 💙 Better Healthcare Starts with Better Access.

---

## ✨ Key Features

### 👨‍⚕️ For Patients

- 🔍 Search and explore doctors by specialty
- 🏥 Discover hospitals and clinics
- 📅 Book medical appointments online
- 📋 View and manage appointments
- 👤 Manage personal profile information
- 🌍 Switch between English, Dari, and Pashto
- 📱 Enjoy a responsive experience across devices

### 🩺 For Healthcare Providers

- 📝 Apply to join as a doctor, hospital, or clinic
- 📊 Access a dedicated provider dashboard
- 🕒 Manage working hours and availability
- 📅 View appointment requests
- 🏥 Manage provider information and services
- 📄 Submit verification documents

### 🛡️ For Administrators

- 📊 Administrative dashboard
- ✅ Review provider registration requests
- ❌ Approve or reject requests with explanations
- 👨‍⚕️ Manage healthcare providers
- 📅 Manage appointments
- 📩 Review contact messages
- 🔐 Role-based access controls

> **Development Note:** Some integrations, security checks, and production features are still being completed and tested.

---

## 🌍 Multilingual Experience

NobatYar supports three languages to make healthcare services more accessible.

| Language | Support |
|:---:|:---:|
| 🇬🇧 English | ✅ |
| 🇦🇫 دری (Dari) | ✅ |
| 🇦🇫 پښتو (Pashto) | ✅ |

The platform includes multilingual navigation, forms, and user interface content.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | User interface |
| Vite | Development and build |
| Tailwind CSS | Responsive styling |
| JavaScript | Application functionality |
| React Router | Page navigation |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | REST API |
| PostgreSQL | Database |
| JWT | Authentication |
| bcrypt | Password hashing |

### Development Tools

![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)

---

## 📂 Project Structure

```text
NobatYar/
│
├── Frontend/
│   ├── public/
│   │   ├── Doctors/
│   │   ├── Hospitals/
│   │   ├── specialties/
│   │   ├── logo.png
│   │   └── fardin.JPG
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   │
│   └── package.json
│
├── Backend/
│   ├── src/
│   ├── sql/
│   ├── scripts/
│   ├── Dockerfile
│   └── package.json
│
├── README.md
├── .gitignore
└── DEPLOYMENT-GUIDE.md
```

---

## 🚀 Getting Started

Follow these steps to run NobatYar locally.

### 1. Clone the Repository

```bash
git clone https://github.com/fardinme6/NobatYar.git
cd NobatYar
```

### 2. Install Frontend Dependencies

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### 3. Install Backend Dependencies

Open a new terminal:

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend` and configure the required environment variables:

```env
PORT=5001
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_random_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
```

Initialize the database:

```bash
npm run db:setup
```

Start the Backend:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5001
```

**Important:** Never commit `.env` files, passwords, API keys, or private patient documents to GitHub.

---

## 🔐 User Roles

| Role | Access |
|---|---|
| Patient | Search doctors and book appointments |
| Doctor | Provider dashboard and appointment management |
| Hospital | Healthcare provider management |
| Clinic | Healthcare provider management |
| Admin | Platform administration |

Provider access requires registration and approval.

---

## 🗺️ Project Roadmap

- [x] Responsive React frontend
- [x] Doctor and hospital listing
- [x] Multilingual interface
- [x] Node.js and Express backend
- [x] PostgreSQL integration
- [x] Email and password authentication
- [x] Appointment booking interface
- [x] Admin and provider dashboards
- [ ] Google and Apple authentication
- [ ] Complete email verification and recovery configuration
- [ ] Production-ready private document storage
- [ ] Complete security and booking tests
- [ ] Production deployment and custom domain

---

## 👨‍💻 Meet the Developer

<div align="center">

<img src="Frontend/public/fardin.JPG" alt="Fardin Mehry" width="170" style="border-radius:50%;" />

### Fardin Mehry

**Founder & Developer of NobatYar**

💻 Frontend Developer | Computer Science Student

Passionate about building modern, responsive, and user-friendly web applications.

NobatYar is one of my projects focused on using technology to make healthcare services more accessible and convenient.

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-fardinme6-181717?style=for-the-badge&logo=github)](https://github.com/fardinme6)

</div>

---

## 🤝 Contributions

NobatYar is currently under active development.

Suggestions, feedback, and ideas for improvement are welcome.

---

## 📬 Contact

For questions, feedback, or collaboration opportunities, please reach out through GitHub.

**Developer:** Fardin Mehry

**GitHub:** [@fardinme6](https://github.com/fardinme6)

---

<div align="center">

### 🏥 NobatYar — نوبت‌یار

**Making Healthcare Appointments Easier, One Click at a Time.**

Made with ❤️ by **Fardin Mehry**

© 2026 NobatYar. All Rights Reserved.

</div>
