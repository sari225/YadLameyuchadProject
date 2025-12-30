# 🌟 Yad Lameyuchad Management System

A comprehensive management system for "Yad Lameyuchad" Center - providing multidisciplinary support and volunteer services for special needs populations in Beitar Illit.

## 🎯 About

Full-stack web application enabling families to manage children's registration for clubs and day camps, while providing administrators with tools to manage activities, volunteers, documents, and updates.

### ✨ Key Features

**For Parents:**
- Secure authentication (OTP, Google OAuth)
- Personal area with children's details
- Club & day camp registration
- Real-time application tracking
- Document access and updates

**For Admins:**
- Children & volunteer management
- Club & day camp administration
- Document & update publishing
- Contact message handling
- Automated email notifications
- Excel/Word export capabilities

---

## 🚀 Tech Stack

**Frontend:** React 19 • Redux Toolkit • Material-UI • React Router v7 • React Hook Form • Zod

**Backend:** Node.js • Express 5 • MongoDB • Mongoose 8 • JWT • Bcrypt

**Additional:** Nodemailer • Multer • Google OAuth • XLSX/DocX Export

---

## ⚡ Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/shoshi434/Yad_Lameyuchad.git
cd YadLameyuchadProject
```

2. **Install dependencies**
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

3. **Configure environment variables**

Create `.env` in `server/`:
```env
DATABASE_URL=mongodb://localhost:27017/yadlameyuchad
PORT=2500
ACCESS_TOKEN_SECRET=your_jwt_secret_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Create `.env` in `client/`:
```env
REACT_APP_API_URL=http://localhost:2500
```

4. **Run the application**
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm start
```

Visit `http://localhost:3000`

---

## 📁 Project Structure

```
YadLameyuchadProject/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── api/              # API service calls
│   │   ├── features/         # Feature modules (auth, user, admin)
│   │   ├── app/              # Redux store
│   │   ├── routs/            # Route configurations
│   │   └── pages/            # Main pages
│   └── public/               # Static assets
│
└── server/                    # Node.js Backend
    ├── controllers/          # Business logic
    ├── models/               # MongoDB schemas
    ├── routs/                # API endpoints
    ├── middleware/           # Auth & file upload
    ├── templates/emails/     # Email templates
    └── config/               # DB & CORS config
```

---

## 🔌 API Overview

### Main Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `/api/auth` | Registration, login, OTP, password reset |
| Children | `/api/child` | Child management & profiles |
| Clubs | `/api/club` | Club management & registration |
| Day Camps | `/api/daycamp` | Day camp management |
| Volunteers | `/api/volunteer` | Volunteer assignments |
| Documents | `/api/documents` | Document uploads & downloads |
| Updates | `/api/update` | News & announcements |
| Messages | `/api/messages` | Contact form handling |

**Authentication:** JWT tokens • Role-based access (Admin/User)

---

## 🔒 Security Features

- **Password Encryption** - Bcrypt hashing
- **JWT Authentication** - Access & refresh tokens
- **OTP Verification** - Email-based 2FA
- **Input Validation** - Server & client-side (Zod schemas)
- **CORS Protection** - Whitelisted origins
- **MongoDB Sanitization** - NoSQL injection prevention

---

## 🎨 Design Features

- RTL support (Hebrew interface)
- Material-UI themed components
- Responsive design (mobile-first)
- Smooth animations & transitions

---

## 📞 Contact

**Email:** yadlameyuchad.site@gmail.com

---

## 📄 License

Created for "Yad Lameyuchad" Center - All rights reserved © 2025

---

**Built with 💙 for the children and families of Yad Lameyuchad**
