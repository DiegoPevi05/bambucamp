<p align="center">
  <a href="https://bambucamp.com" target="_blank">
    <img src="https://github.com/DiegoPevi05/bambucamp-monorepo/blob/main/public/logo.png" width="150">
  </a>
</p>

# BAMBUCAMP Reservation System - Full Stack

<p align="center">
  <a href="https://github.com/DiegoPevi05/bambucamp-monorepo/releases">
    <img src="https://img.shields.io/github/v/release/DiegoPevi05/bambucamp-monorepo" alt="Version">
  </a>
  <a href="https://github.com/DiegoPevi05/bambucamp-monorepo">
    <img src="https://img.shields.io/badge/Monorepo-TypeScript-blue" alt="Monorepo">
  </a>
  <a href="https://opensource.org/licenses/ISC">
    <img src="https://img.shields.io/badge/License-ISC-blue" alt="License">
  </a>
</p>

A complete full-stack reservation system for BAMBUCAMP glamping resort. This monorepo contains the backend API, customer-facing website, and admin dashboard—all working together seamlessly.

## Quick Links

- **🌐 Client Website**: [https://bambucamp.com](https://bambucamp.com)
- **👨‍💼 Admin Dashboard**: [https://admin.bambucamp.com](https://admin.bambucamp.com)
- **🔌 API Server**: [https://api.bambucamp.com](https://api.bambucamp.com)
- **👤 Author**: [DigitalProcessIT](https://digitalprocessit.com/es/)
- **📧 Contact**: [DigitalProcessIT Contact](https://digitalprocessit.com/es/contacto)

## 📋 Overview

BAMBUCAMP is a comprehensive reservation system designed for managing glamping accommodations, products, and experiences. It provides a complete solution from customer-facing bookings to full administrative control.

### Key Features

- **🔐 Authentication & Authorization**: Secure login, registration, and role-based access control
- **📅 Reservations Management**: Create, update, and manage reservations for tents, products, and experiences
- **🏕️ Glamping Tents**: Full inventory management for glamping accommodations
- **🛍️ Products & Services**: Manage products, experiences, and add-on services
- **💳 Discount Codes**: Create and apply discount codes across reservations
- **🔔 Notifications System**: Real-time notifications for admins and users
- **📧 Email Confirmations**: Automated email notifications for reservations
- **🌍 Internationalization (i18n)**: Multi-language support across all apps
- **📱 Responsive Design**: Mobile-friendly interfaces for all platforms

## 📁 Repository Structure

```
bambucamp-monorepo/
├── .github/
│   └── workflows/
│       ├── deploy-client.yml      # Client deployment pipeline
│       ├── deploy-admin.yml       # Admin dashboard deployment
│       └── deploy-backend.yml     # Backend API deployment
├── apps/
│   ├── client/                    # Customer-facing website
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── db/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   ├── App.tsx
│   │   │   └── index.css
│   │   ├── public/locales/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   ├── admin/                     # Admin dashboard
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── db/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   ├── App.tsx
│   │   │   └── index.css
│   │   ├── public/locales/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── backend/                   # Express API Server
│       ├── src/
│       │   ├── config/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── controllers/
│       │   ├── middlewares/
│       │   ├── prisma/
│       │   ├── locales/
│       │   └── server.ts
│       ├── migrations/
│       ├── public/images/
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
├── packages/
│   └── shared-types/              # Shared TypeScript types (optional)
│       ├── src/
│       │   └── index.ts
│       └── package.json
├── docs/
│   ├── README.md                  # Main documentation
│   └── ARCHITECTURE.md            # System architecture
├── package.json                   # Root package (scripts only)
├── turbo.json                     # Turborepo configuration
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (18.x or later)
- **npm** (Node package manager)
- **TypeScript** (`npm install -g typescript`)
- **PostgreSQL** (for backend development)

### Installation

1. **Clone the Repository**:
```bash
git clone https://github.com/DiegoPevi05/bambucamp-monorepo.git
cd bambucamp-monorepo
```

2. **Install Dependencies**:
```bash
npm install
```

This will install dependencies for all apps in the monorepo.

3. **Setup Environment Variables**:

Create `.env` files for each app:

**Backend** (`apps/backend/.env`):
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/bambucamp_db"
ADMIN_HOSTNAME="http://localhost:5173"
ADMIN_HOSTNAME_2="http://your-admin-hostname"
CLIENT_HOSTNAME="http://localhost:5174"
CLIENT_HOSTNAME_2="http://your-client-hostname"
JWT_SECRET="your-secret-key"
PORT=3000
ADMIN_EMAIL="admin@bambucamp.com"
ADMIN_PASSWORD="secure-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Client** (`apps/client/.env`):
```bash
VITE_BACKEND_URL="http://localhost:3000"
VITE_BACKEND_PUBLIC_URL="http://your-server-hostname"
```

**Admin** (`apps/admin/.env`):
```bash
VITE_BACKEND_URL="http://localhost:3000"
VITE_BACKEND_PUBLIC_URL="http://your-server-hostname"
VITE_ENVIRONMENT="development"
```

4. **Setup Database (Backend)**:
```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev
cd ../..
```

5. **Create Images Directory** (Backend):
```bash
mkdir -p apps/backend/public/images
```

## 🏃 Running Applications

### Development Mode

Run all applications in development mode:

```bash
npm run dev
```

This will start:
- **Backend API**: http://localhost:3000
- **Client Website**: http://localhost:5174
- **Admin Dashboard**: http://localhost:5173

### Individual App Development

**Backend**:
```bash
cd apps/backend && npm run dev
```

**Client**:
```bash
cd apps/client && npm run dev
```

**Admin Dashboard**:
```bash
cd apps/admin && npm run dev
```

### Build for Production

Build all apps:
```bash
npm run build
```

Build individual apps:
```bash
cd apps/client && npm run build
cd apps/admin && npm run build
cd apps/backend && npm run build
```

## 🗄️ Database Migrations

Run migrations when you update your Prisma schema:

```bash
cd apps/backend
npx prisma migrate dev
```

To reset the database:
```bash
npx prisma migrate reset
```

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js**: REST API server
- **TypeScript**: Type safety
- **Prisma ORM**: Database management
- **PostgreSQL**: Database
- **bcryptjs**: Password hashing
- **jsonwebtoken**: Authentication tokens
- **Nodemailer**: Email notifications
- **Multer**: File uploads (images)
- **i18next**: Internationalization
- **CORS**: Cross-origin support

### Frontend (Client & Admin)
- **React.js**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling and components
- **Framer Motion**: Animations
- **React Three**: 3D animations
- **i18next**: Internationalization
- **Axios/Fetch**: API communication

## 📚 API Routes

The backend provides the following main routes:

- `/api/users` - User management
- `/api/auth` - Authentication (login, registration)
- `/api/categories` - Product/experience categories
- `/api/experiences` - Experiences management
- `/api/products` - Products management
- `/api/discounts` - Discount codes
- `/api/tents` - Glamping tents
- `/api/reserves` - Reservations management
- `/api/notifications` - Notifications system

## 🚢 Deployment

Each application deploys independently via GitHub Actions:

- **Client changes** → `apps/client/` → Triggers `deploy-client.yml`
- **Admin changes** → `apps/admin/` → Triggers `deploy-admin.yml`
- **Backend changes** → `apps/backend/` → Triggers `deploy-backend.yml`
- **Shared types changes** → All apps deploy

View workflows in `.github/workflows/`

## 📝 App-Specific Documentation

- **Backend**: See `apps/backend/README.md`
- **Client**: See `apps/client/README.md`
- **Admin**: See `apps/admin/README.md`

## 🌍 Internationalization

The system supports multiple languages through i18next:

- **Backend**: Translation files in `apps/backend/src/locales/`
- **Client**: Translation files in `apps/client/public/locales/`
- **Admin**: Translation files in `apps/admin/public/locales/`

Add new languages by creating new translation files in these directories.

## 🔐 Security Features

- JWT-based authentication with secure tokens
- Password hashing with bcryptjs
- CORS protection for cross-origin requests
- Role-based access control (RBAC)
- Environment variable management for sensitive data
- Secure email notifications with SMTP

## 📧 Environment Setup Notes

- Make sure your PostgreSQL database is running and accessible
- Configure SMTP credentials for email notifications
- Set appropriate CORS origins for your deployment
- Use strong JWT secrets in production
- Keep `.env` files secure and never commit them to version control

## 🤝 Development Workflow

1. **Make changes** in your preferred app (`apps/client`, `apps/admin`, or `apps/backend`)
2. **Commit and push** to the `main` branch
3. **GitHub Actions** automatically deploys changed apps
4. **Slack notifications** alert you of deployment status

## 📄 License

This project is licensed under the ISC License. See LICENSE file for details.

## 👨‍💻 Support & Contributing

For issues, feature requests, or contributions, please contact:

- **Organization**: [DigitalProcessIT](https://digitalprocessit.com/es/)
- **Contact**: [DigitalProcessIT Contact Form](https://digitalprocessit.com/es/contacto)

---

**Last Updated**: October 2025  
**Maintained by**: DigitalProcessIT
