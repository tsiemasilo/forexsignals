# WatchlistFX - Forex Signals Platform

A modern forex signals subscription platform with advanced payment integration and real-time signal delivery.

## Features

- **iPhone-Style Signal Interface**: Authentic mobile experience with iOS design elements
- **Dual Payment Gateway**: Yoco and Ozow payment integration for South African market
- **Real-time Signals**: Live forex signal delivery with trade actions and analysis
- **Subscription Management**: Multi-tier plans (Basic, Premium, VIP) with automatic activation
- **Admin Dashboard**: Complete signal management and user administration
- **Responsive Design**: Mobile-first approach with desktop compatibility

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Advanced Debugging Hooks** for real-time monitoring

### Backend
- **Node.js** with Express
- **PostgreSQL** with Drizzle ORM
- **Session-based authentication**
- **Serverless functions** for Netlify deployment

### Payment Gateways
- **Yoco**: South African payment processing
- **Ozow**: EFT payment solution with SHA512 hash validation

## Deployment

### Netlify Configuration

The project is configured for Netlify deployment with:
- Serverless functions in `/netlify/functions/`
- Build configuration in `netlify.toml`
- Environment variables for payment gateways

### Required Environment Variables

```
DATABASE_URL=your_postgresql_connection_string
YOCO_PUBLIC_KEY=your_yoco_public_key
YOCO_SECRET_KEY=your_yoco_secret_key
OZOW_API_KEY=your_ozow_api_key
OZOW_SECRET_KEY=your_ozow_secret_key
SESSION_SECRET=your_session_secret
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to Netlify
vite build
```

## Project Status

### ✅ Completed Features
- iPhone-style signal interface with notification design
- Complete authentication flow (register/login separation)
- Dual payment gateway integration (Yoco + Ozow)
- Real-time signal delivery with auto-refresh
- Admin dashboard for signal and user management
- Responsive mobile-first design
- PostgreSQL database with Drizzle ORM

### 🚀 Advanced Debugging & Monitoring (August 18, 2025)
- **Real-time Debug Dashboard**: Live monitoring of subscription changes and cache updates
- **Advanced Testing Suite**: Comprehensive validation of days calculations across multiple methods
- **Subscription Change Detection**: Automatic tracking of plan changes with before/after comparison
- **Days Calculation Monitoring**: Continuous monitoring with discrepancy alerts and validation
- **Live Update Indicators**: Real-time status badges showing cache updates and query invalidations
- **Enhanced Console Debugging**: Structured logging with grouped output for analysis
- Netlify serverless function architecture

### 🧹 Clean Codebase
- Removed all debugging artifacts and unused files
- Optimized component structure for production
- Clean Netlify function organization
- Proper error handling and validation
- Production-ready configuration files

## Architecture

### Database Schema
- **Users**: Authentication and profile management
- **Subscription Plans**: Basic (R49.99/5d), Premium (R99.99/14d), VIP (R179.99/30d)
- **Subscriptions**: User subscription tracking with trial support
- **Forex Signals**: Real-time trading signals with actions

### Authentication Flow
- Separate registration and login processes
- Free trial activation on first login only
- Session-based authentication for serverless compatibility
- Role-based access control (admin/customer)

### Payment Integration
- **Yoco**: Credit card processing with hosted checkout
- **Ozow**: EFT payments with SHA512 hash validation
- Automatic subscription activation post-payment
- Webhook handling for payment notifications

The project is production-ready for Netlify deployment!

## Build Status
- Latest deployment: August 18, 2025 - 5:06 PM UTC
- Comprehensive cache invalidation solution deployed
- Multi-layer cache busting system active
- Server-side cache headers implemented
- Manual cache invalidation tools available
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/pages/         # Page components
│   ├── src/components/    # Reusable components
│   └── src/lib/          # Utilities and configuration
├── server/                # Express backend
│   ├── routes.ts         # API routes and payment handlers
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database configuration
├── shared/                # Shared types and schemas
│   └── schema.ts         # Drizzle database schema
├── netlify/               # Netlify serverless functions
│   └── functions/        # API endpoints for production
└── netlify.toml          # Netlify configuration
```

## License

Private project - All rights reserved# Build timestamp: Mon Aug 18 02:16:26 PM UTC 2025
Force rebuild: Mon Aug 18 05:22:49 PM UTC 2025
