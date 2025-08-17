# WatchlistFX - Forex Signals Platform

## Overview

WatchlistFX is a production-ready forex signals subscription platform designed for the South African market. The platform delivers real-time forex trading signals with an authentic iPhone-style mobile interface, integrated payment processing through local gateways, and comprehensive subscription management. The application targets forex traders who need reliable, timely trading signals with seamless payment and subscription experiences.

## Recent Changes (August 2025)

### ✅ Critical Production Issues Resolved (August 17, 2025)
- **API Errors Fixed**: Resolved all 404/500 errors in production deployment
- **Database Column Consistency**: Fixed snake_case column naming across all Netlify functions
- **Signal Loading**: User dashboard now properly displays forex signals without errors
- **Auto-refresh Restored**: Re-enabled 5-second signal updates for active subscribers
- **Route Handlers**: Added missing /api/admin/signals handler for admin functionality

### ✅ Project Cleanup Completed
- **Codebase Optimization**: Removed all debugging files, unused components, and temporary artifacts
- **Component Structure**: Streamlined from 15+ pages to 8 essential production pages
- **Build Process**: Optimized for Netlify deployment with clean function architecture
- **Authentication**: Fixed registration/login separation with proper trial activation flow
- **Payment Integration**: Resolved Ozow payment 500 errors and registration 404 issues
- **Database**: Corrected column naming consistency (snake_case) across all Netlify functions

### 🚀 Production Ready Status
- All Netlify functions properly configured and tested
- Clean routing configuration in netlify.toml
- Optimized React component structure
- Removed development artifacts and unused dependencies
- Updated documentation for deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18 with TypeScript**: Component-based architecture with type safety
- **Mobile-First Design**: iPhone-style interface optimized for mobile trading
- **Styling Framework**: Tailwind CSS with Shadcn/UI component library for consistent design
- **Client-Side Routing**: Wouter for lightweight, declarative routing
- **State Management**: TanStack Query for server state with real-time updates every 5 seconds
- **Real-Time Features**: Auto-refresh mechanisms for live signal delivery

### Backend Architecture
- **Node.js with Express**: RESTful API server with session-based authentication
- **Database Layer**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express-session with PostgreSQL store for user authentication
- **Serverless Deployment**: Netlify Functions architecture for scalable deployment
- **Database Schema**: Users, subscription plans, subscriptions, and forex signals tables with foreign key relationships

### Authentication System
- **Session-Based Auth**: Server-side sessions with secure cookie handling
- **Role-Based Access**: Admin and customer user roles with different permissions
- **Simplified Login**: Email-only authentication for streamlined user experience
- **Auto-Registration**: Seamless user creation during first login attempt

### Subscription Management
- **Multi-Tier Plans**: Basic (5 days), Premium (14 days), VIP (30 days)
- **Status Tracking**: Trial, active, expired, and cancelled subscription states
- **Real-Time Status**: Live subscription status monitoring with countdown displays
- **Automatic Activation**: Post-payment subscription activation workflow

### Real-Time Signal Delivery
- **Live Updates**: 5-second auto-refresh for active subscribers
- **Signal Types**: Buy, Sell, Hold, and Wait trading actions with visual indicators
- **Rich Content**: Text content with optional image attachments
- **Admin Management**: Full CRUD operations for signal creation and management

### Payment Integration
- **Dual Gateway Support**: Yoco and Ozow payment processors for local market coverage
- **Direct Checkout**: External payment gateway integration with success/failure handling
- **Payment Validation**: SHA512 hash validation for Ozow transactions
- **Subscription Linking**: Automatic subscription activation post-payment

## External Dependencies

### Payment Gateways
- **Yoco**: Primary credit card payment processor for South African market
- **Ozow**: EFT payment solution with SHA512 security validation
- **Checkout URLs**: Direct integration with hosted payment pages

### Database and Infrastructure
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Netlify**: Serverless hosting platform with build automation
- **WebSocket Support**: For real-time database connections via Neon

### Development and Build Tools
- **Vite**: Fast build tool for development and production builds
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type safety across frontend and backend
- **Replit Integration**: Development environment support with runtime error handling

### UI and Styling
- **Radix UI**: Headless component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Consistent icon library for visual elements
- **PostCSS**: CSS processing with autoprefixer support