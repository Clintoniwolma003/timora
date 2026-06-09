# TIMORA MVP Setup & Deployment Guide

**Version:** 1.0.0  
**Status:** Production Ready MVP  
**Last Updated:** June 2024

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [MVP Feature Checklist](#mvp-feature-checklist)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MySQL 8.0+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Clintoniwoloma001/timora.git
cd timora

# Install dependencies
pnpm install

# Generate database migrations
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

---

## 🏗️ System Architecture

### Multi-Tenant Architecture

TIMORA is built as a true multi-tenant SaaS platform:

- **Complete Data Isolation** – Every query includes `company_id` verification
- **Role-Based Access Control** – Super Admin, Company Admin, Staff roles
- **Subscription Gating** – Feature access controlled by subscription status
- **Tenant-Safe Database Helpers** – All DB operations verify company ownership

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, tRPC |
| Database | MySQL 8.0+ |
| ORM | Drizzle ORM |
| Authentication | Manus OAuth + JWT |
| Payments | Stripe, Paystack (ready for integration) |

---

## 🗄️ Database Setup

### Schema Overview

The database includes 7 core tables:

1. **companies** – Organization records
2. **subscriptions** – Billing & SaaS monetization
3. **users** – Staff, admins, super admins
4. **locations** – Multi-location support
5. **departments** – Team organization
6. **attendance** – Clock in/out records with GPS
7. **reports** – Daily/weekly/monthly reporting

### Generate Migrations

```bash
# Generate new migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:push

# View migration history
pnpm db:status
```

### Database Connection

Set `DATABASE_URL` in `.env`:

```
DATABASE_URL=mysql://user:password@localhost:3306/timora
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/timora

# OAuth & Authentication
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id
COOKIE_SECRET=your_secret_key

# Payments (Optional for MVP)
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYSTACK_API_KEY=pk_test_...

# Storage
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_key
```

### Development Environment

Create `.env.local`:

```bash
DATABASE_URL=mysql://root:password@localhost:3306/timora_dev
VITE_APP_ID=dev-app-id
COOKIE_SECRET=dev-secret-key
```

---

## 🎯 Running the Application

### Development Mode

```bash
# Start dev server with hot reload
pnpm dev

# Server runs on http://localhost:5173
# Backend API on http://localhost:5173/api/trpc
```

### Production Build

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

---

## ✅ MVP Feature Checklist

### Company Management
- [x] Company registration
- [x] Company profile management
- [x] Multi-tenant data isolation
- [x] Subscription status tracking

### User Management
- [x] Staff creation (Admin only)
- [x] Staff update (Admin only)
- [x] Staff deletion (Admin only)
- [x] Role assignment (staff/admin)
- [x] Location assignment
- [x] User authentication & authorization

### Attendance Tracking
- [x] Clock in with GPS capture
- [x] Clock out with GPS capture
- [x] Automatic hours calculation
- [x] Attendance history
- [x] Today's status check
- [x] Company attendance logs

### Reporting System
- [x] Create reports (draft)
- [x] Submit reports
- [x] Review reports (Admin only)
- [x] Approve reports (Admin only)
- [x] Report history
- [x] Report statistics

### Location Management
- [x] Create locations
- [x] Update locations
- [x] Delete locations
- [x] Multi-location support
- [x] Location assignment to staff

### Analytics & Dashboards
- [x] Staff dashboard (personal view)
- [x] Admin dashboard (company overview)
- [x] Attendance analytics
- [x] Report statistics
- [x] Staff performance metrics
- [x] KPI cards

### Security & Compliance
- [x] Multi-tenant isolation
- [x] Role-based access control
- [x] Subscription enforcement
- [x] Company data verification
- [x] Tenant-safe database queries
- [x] JWT authentication

### Frontend Features
- [x] Protected routes by role
- [x] Subscription gating
- [x] Dark/light theme support
- [x] Responsive design
- [x] Error handling
- [x] Loading states

---

## 📡 API Documentation

### Authentication

```typescript
// Get current user
trpc.auth.me.useQuery()

// Logout
trpc.auth.logout.useMutation()
```

### Staff Management

```typescript
// List staff
trpc.staff.list.useQuery()

// Get staff member
trpc.staff.get.useQuery({ id: 1 })

// Create staff (Admin only)
trpc.staff.create.useMutation({
  name: "John Doe",
  email: "john@example.com",
  role: "staff",
  locationId: 1
})

// Update staff (Admin only)
trpc.staff.update.useMutation({
  id: 1,
  name: "Jane Doe",
  status: "active"
})

// Delete staff (Admin only)
trpc.staff.delete.useMutation({ id: 1 })

// Get staff statistics
trpc.staff.stats.useQuery()
```

### Attendance

```typescript
// Clock in
trpc.attendance.clockIn.useMutation({
  locationId: 1,
  gpsLat: 40.7128,
  gpsLng: -74.0060
})

// Clock out
trpc.attendance.clockOut.useMutation({
  gpsLat: 40.7128,
  gpsLng: -74.0060
})

// Get today's status
trpc.attendance.todayStatus.useQuery()

// Get attendance history
trpc.attendance.history.useQuery({ limit: 30 })

// Get company logs (Admin only)
trpc.attendance.companyLogs.useQuery({ limit: 100 })

// Get attendance statistics (Admin only)
trpc.attendance.stats.useQuery()
```

### Reports

```typescript
// Create report
trpc.reports.create.useMutation({
  type: "daily",
  title: "Daily Report",
  content: "Report content here"
})

// Submit report
trpc.reports.submit.useMutation({ id: 1 })

// Review report (Admin only)
trpc.reports.review.useMutation({
  id: 1,
  status: "approved",
  notes: "Looks good"
})

// Get my reports
trpc.reports.listMy.useQuery({ limit: 30 })

// Get company reports (Admin only)
trpc.reports.listCompany.useQuery({ limit: 100 })

// Get report statistics (Admin only)
trpc.reports.stats.useQuery()
```

### Locations

```typescript
// List locations
trpc.locations.list.useQuery()

// Get location
trpc.locations.get.useQuery({ id: 1 })

// Create location (Admin only)
trpc.locations.create.useMutation({
  name: "Main Office",
  address: "123 Main St",
  city: "New York",
  timezone: "America/New_York"
})

// Update location (Admin only)
trpc.locations.update.useMutation({
  id: 1,
  name: "Headquarters"
})

// Delete location (Admin only)
trpc.locations.delete.useMutation({ id: 1 })
```

### Dashboard

```typescript
// Admin dashboard overview
trpc.dashboard.overview.useQuery()

// Staff performance metrics (Admin only)
trpc.dashboard.staffPerformance.useQuery()

// Attendance analytics (Admin only)
trpc.dashboard.attendanceAnalytics.useQuery()

// Reports summary (Admin only)
trpc.dashboard.reportsSummary.useQuery()

// Staff personal summary
trpc.dashboard.staffSummary.useQuery()
```

---

## 🚀 Deployment

### Vercel (Frontend)

```bash
# Deploy frontend to Vercel
vercel deploy
```

### Render (Backend)

```bash
# Deploy backend to Render
# Set DATABASE_URL and other env vars in Render dashboard
# Connect GitHub repo and deploy
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u user -p -h localhost -D timora

# Check DATABASE_URL format
# mysql://user:password@host:port/database
```

### Authentication Issues

- Ensure `OAUTH_SERVER_URL` is correct
- Verify `VITE_APP_ID` matches your Manus app ID
- Check `COOKIE_SECRET` is set and consistent

### Migration Issues

```bash
# Reset migrations (dev only)
pnpm db:drop
pnpm db:push

# View migration status
pnpm db:status
```

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [tRPC Documentation](https://trpc.io)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check GitHub issues
4. Contact support team

---

## 📝 License

TIMORA is proprietary software. All rights reserved.

---

**Last Updated:** June 2024  
**Version:** 1.0.0 MVP  
**Status:** ✅ Production Ready
