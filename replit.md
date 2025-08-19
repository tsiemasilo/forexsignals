# WatchlistFX - Forex Signals Platform

## Overview
WatchlistFX is a production-ready forex signals subscription platform for the South African market. It delivers real-time forex trading signals via an authentic iPhone-style mobile interface, integrated with local payment gateways for comprehensive subscription management. The platform aims to provide reliable, timely trading signals with seamless payment and subscription experiences to forex traders.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: React 18 with TypeScript, Tailwind CSS with Shadcn/UI component library.
- **Design Philosophy**: Mobile-first design, specifically optimized for iPhone-style mobile trading.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query for server state management with real-time updates.
- **Real-Time Features**: Auto-refresh mechanisms for live signal delivery.

### Backend Architecture
- **Technology Stack**: Node.js with Express for RESTful APIs.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Session Management**: Express-session with PostgreSQL store for user authentication.
- **Deployment**: Serverless architecture using Netlify Functions for scalability.
- **Database Schema**: Includes tables for Users, Subscription Plans, Subscriptions, and Forex Signals with defined relationships.

### Authentication System
- **Mechanism**: Session-based authentication with secure cookie handling.
- **Access Control**: Role-based access for Admin and customer users.
- **User Experience**: Email-only authentication for simplified login; auto-registration on first login.

### Subscription Management
- **Plan Tiers**: Supports Basic (5 days), Premium (14 days), and VIP (30 days) plans.
- **Status Tracking**: Manages Trial, active, expired, and cancelled subscription states with real-time status monitoring.
- **Activation**: Automatic subscription activation post-payment.

### Real-Time Signal Delivery
- **Updates**: Signals refresh every 5 seconds for active subscribers.
- **Signal Types**: Includes Buy, Sell, Hold, and Wait trading actions with visual indicators.
- **Content**: Supports text content with optional image attachments.
- **Management**: Full CRUD operations for signal creation and administration.

### Payment Integration
- **Gateway Support**: Integrates with Yoco and Ozow payment processors for the South African market.
- **Checkout Process**: Direct integration with hosted payment pages and handling of success/failure states.
- **Security**: SHA512 hash validation for Ozow transactions.
- **Workflow**: Automatic subscription linking and activation upon successful payment.

## External Dependencies

### Payment Gateways
- **Yoco**: For credit card payments.
- **Ozow**: For EFT payments, including SHA512 validation.

### Database and Infrastructure
- **Neon Database**: Provides PostgreSQL hosting with connection pooling.
- **Netlify**: Serverless hosting platform and build automation.

### Development and Build Tools
- **Vite**: Fast build tool.
- **Drizzle Kit**: For database migrations and schema management.
- **TypeScript**: For type safety across the codebase.

### UI and Styling
- **Radix UI**: Headless component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide Icons**: Icon library.

## Recent Changes (August 2025)

### 🎨 Professional Toast Notification System (August 19, 2025 - 10:00 AM)
- **Global State Management**: Implemented subscriber pattern for proper toast synchronization across components
- **Professional Red Design**: Red gradient background with white text, warning icons, and smooth animations
- **Enhanced UX**: Larger toast size (320px/384px), slide-in animations, auto-dismiss after 5 seconds
- **Glassmorphism Effects**: Semi-transparent backgrounds with backdrop blur for modern aesthetic
- **Responsive Design**: Optimized for both mobile and desktop with proper scaling
- **Production Ready**: Toast system fully functional on both Replit development and Netlify deployment

### 🌐 Social Media Link Preview Implementation (August 19, 2025 - 10:30 AM)
- **Open Graph Meta Tags**: Complete implementation for WhatsApp, Facebook, Twitter link previews
- **Professional Preview Image**: Generated custom 16:9 forex trading platform preview image
- **SEO Optimization**: Added comprehensive meta tags including geo-targeting for South Africa
- **Favicon System**: Created and implemented professional favicon and Apple touch icon
- **Social Media Ready**: Link previews show "WatchlistFX - Premium Forex Signals Platform" with custom image
- **WhatsApp Compatible**: Link sharing shows professional preview with title, description, and image

### 📱 Toast Notifications Fixed for Production (August 19, 2025 - 9:45 AM)
- **Added Toaster Component**: Imported and included in App.tsx for global toast display
- **Fixed TypeScript Errors**: Removed undefined action property from toast mapping
- **Positioned Outside Mobile**: Toast viewport positioned at top-right with fixed positioning and high z-index
- **Production Deployment**: Updated both Replit and Netlify with toast notification fixes
- **User Experience**: Toast now appears outside mobile interface with proper visibility

### ✅ Duplicate Email Validation Confirmed Working (August 19, 2025 - 9:35 AM)
- **Backend Validation**: Server properly checks for existing emails and returns 409 status
- **Frontend Handling**: LoginPage detects userExists flag and shows "Account Already Exists" message
- **User Experience**: Form automatically switches back to login mode when duplicate detected
- **API Testing**: Confirmed both new account creation and duplicate email rejection work correctly
- **Production Ready**: Complete email validation flow prevents duplicate registrations

### 🔴 Registration Required Toast Fix (August 19, 2025 - 11:00 AM)
- **Root Cause Identified**: PhoneSignalsPage.tsx missing destructive variant for registration toast
- **Dual Location Fix**: Updated both LoginPage.tsx and PhoneSignalsPage.tsx with red error styling
- **Consistent Error Handling**: All registration-required toasts now display in red color
- **User Experience**: Clear visual indication when registration is needed before login
- **Production Ready**: Fixed for both Replit development and Netlify deployment environments

### 🔧 Signal Creation Issue Resolved (August 19, 2025 - 9:23 AM)
- **Root Cause Identified**: PostgreSQL `image_urls` ARRAY column causing "malformed array literal" errors
- **Database Schema Analysis**: Used introspection to discover problematic ARRAY data type
- **Function Fix Applied**: Updated admin-signals.mjs to avoid problematic array column completely
- **Local Testing Confirmed**: Signal creation works when avoiding the `image_urls` array column
- **Production Solution**: Modified Netlify function to use only `image_url` (singular) column
- **Mobile Admin Dashboard**: Complete responsive design with touch-friendly interface
- **Ready for Deployment**: All admin signal creation issues resolved for production use

## Deployment Status

### Current Deployment Architecture
- **Development Environment**: Replit with live hot-reload and comprehensive logging
- **Production Environment**: Netlify with serverless functions and PostgreSQL database
- **Database**: Neon PostgreSQL with connection pooling for both environments
- **Build Process**: Automated Netlify builds with environment variable injection

### Key Production Features Working
- **User Authentication**: Session-based auth with email validation and duplicate checking
- **Toast Notifications**: Professional red-themed notifications with animations
- **Signal Management**: Admin can create/edit signals, users receive real-time updates
- **Payment Integration**: Yoco and Ozow payment gateways configured for South African market
- **Mobile Interface**: iPhone-style mobile-first design with proper touch interactions
- **Subscription Management**: Plan tiers (Basic/Premium/VIP) with status tracking

### Development vs Production Differences
- **Environment Variables**: Different database URLs and API keys between environments
- **Logging**: Enhanced console logging in development, production-optimized in deployment
- **Error Handling**: Development shows detailed errors, production shows user-friendly messages
- **Performance**: Production uses optimized builds with minification and compression