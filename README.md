# 🚀 Talora - Complete HR Management System

A modern, full-stack HR Management System built with Next.js, Node.js, and MongoDB. Talora provides a comprehensive platform for managing recruitment, employees, payroll, performance tracking, and more.



## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

### 🎯 For Candidates
- **Job Search & Discovery**: Advanced search with filters
- **Application Tracking**: Real-time application status updates
- **Profile Management**: Skills, resume, and portfolio
- **Salary Insights**: Location and role-based salary data
- **Job Recommendations**: AI-powered job matching

### 👔 For HR Managers
- **Job Posting**: Create and manage job listings
- **Candidate Management**: Review applications and shortlist candidates
- **Interview Scheduling**: Organize and track interviews
- **Employee Onboarding**: Streamlined onboarding process
- **Performance Tracking**: Monitor employee performance and OKRs
- **Payroll Management**: Generate and manage payslips

### 🤝 For Employees
- **Dashboard**: Personal performance metrics
- **Project Management**: Track assigned projects
- **Performance & OKRs**: Set and monitor objectives
- **Feedback System**: Give and receive feedback
- **Learning & Development**: Access training resources
- **Payroll Access**: View payslips and salary history

### ⚙️ For Admins
- **Platform Management**: Complete system control
- **User Management**: Manage all user roles
- **Analytics Dashboard**: Comprehensive insights
- **Job Approval**: Review and approve job postings
- **HR Verification**: Approve HR registrations
- **System Configuration**: Platform settings and permissions

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React Context API
- **Authentication**: JWT with Google OAuth 2.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (Google OAuth)
- **Security**: JWT, bcrypt, helmet

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## 📁 Project Structure

```
talora/
├── hr-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   │   ├── admin/    # Admin dashboard
│   │   │   ├── hr/       # HR dashboard
│   │   │   ├── employee/ # Employee dashboard
│   │   │   └── candidate/# Candidate dashboard
│   │   ├── components/   # Reusable components
│   │   └── lib/          # Utilities and helpers
│   └── public/           # Static assets
│
└── hr-backend/           # Express.js backend API
    ├── src/
    │   ├── routes/       # API routes
    │   ├── models/       # Mongoose models
    │   ├── controllers/  # Business logic
    │   ├── middleware/   # Auth & validation
    │   └── config/       # Configuration files
    └── .env              # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/talora.git
cd talora
```

2. **Install Backend Dependencies**
```bash
cd hr-backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../hr-frontend
npm install
```

4. **Set up Environment Variables**

Create `.env` files in both frontend and backend directories (see [Environment Variables](#environment-variables))

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

6. **Run Backend**
```bash
cd hr-backend
npm run dev
# Backend runs on http://localhost:8080
```

7. **Run Frontend**
```bash
cd hr-frontend
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend (`hr-backend/.env`)

```env
# Server
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb-url

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs
BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
```

### Frontend (`hr-frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/api/auth/google/callback`
   - `https://your-backend-url.com/api/auth/google/callback`

---

## 👥 User Roles

### 1. **Candidate**
- Search and apply for jobs
- Track application status
- Manage profile and resume
- View salary insights

### 2. **HR Manager**
- Post and manage jobs
- Review applications
- Schedule interviews
- Manage employees
- Handle payroll

### 3. **Employee**
- View personal dashboard
- Track projects and tasks
- Manage OKRs
- Access payroll information
- Participate in feedback

### 4. **Admin**
- Full platform access
- User management
- System configuration
- Analytics and reports
- Approve HR registrations

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
cd hr-frontend
vercel
```

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `cd hr-backend && npm install`
4. Set start command: `cd hr-backend && npm start`
5. Add environment variables
6. Deploy

### Database (MongoDB Atlas)

1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update `MONGODB_URI` in backend `.env`

---

## 📱 Key Features Breakdown

### Authentication & Authorization
- Google OAuth 2.0 integration
- JWT-based session management
- Role-based access control (RBAC)
- Secure password hashing

### Job Management
- Create, edit, and delete job postings
- Advanced search and filtering
- Application tracking
- Interview scheduling

### Employee Management
- Employee profiles and records
- Department and role management
- Performance tracking
- Attendance and leave management

### Payroll System
- Salary management
- Payslip generation
- Tax calculations
- Payment history

### Performance Management
- OKR (Objectives and Key Results)
- Performance reviews
- Feedback system
- Achievement tracking

### Analytics & Reporting
- Dashboard metrics
- Custom reports
- Data visualization
- Export functionality

---

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd hr-backend
npm test

# Frontend tests
cd hr-frontend
npm test
```

### Code Formatting
```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Database Seeding
```bash
cd hr-backend
npm run seed
```

---

## 📝 API Documentation

### Base URL
```
Development: http://localhost:8080/api
Production: https://your-backend-url.com/api
```

### Key Endpoints

#### Authentication
- `POST /auth/google` - Google OAuth login
- `POST /auth/set-role` - Set user role
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

#### Jobs
- `GET /jobs` - Get all jobs
- `POST /jobs` - Create job (HR/Admin)
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job

#### Applications
- `POST /applications` - Apply for job
- `GET /applications` - Get user applications
- `PUT /applications/:id` - Update application status

#### Employees
- `GET /hr/employees` - Get all employees (HR/Admin)
- `POST /hr/employees` - Create employee
- `PUT /hr/employees/:id` - Update employee
- `GET /employees/me` - Get current employee profile

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database
- Vercel and Render for hosting
- All contributors and supporters

---

## 📞 Support

For support, email support@talora.com or join our Slack channel.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered resume screening
- [ ] Video interview integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Email notifications
- [ ] Calendar integration

---

**Made with ❤️ by the Talora Team**
