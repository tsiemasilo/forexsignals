# AutoParts Pro E-commerce Platform

## Overview

This is a full-stack e-commerce application for automotive parts built with a modern tech stack. The application features a React-based frontend with a Node.js/Express backend, PostgreSQL database using Drizzle ORM, and is designed for deployment on Replit with autoscaling capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom automotive theme
- **State Management**: React Context API for cart state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API endpoints with proper error handling
- **Development**: Hot reload with tsx for TypeScript execution

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: Users, brands, categories, products, cart items, orders, and order items
- **Relationships**: Foreign key constraints between entities
- **Data Types**: Support for decimals, timestamps, and text fields

## Key Components

### Core Entities
1. **Users**: Authentication and user management
2. **Brands**: Automotive part manufacturers
3. **Categories**: Product categorization system
4. **Products**: Core inventory with pricing, ratings, and stock status
5. **Cart Items**: Shopping cart functionality with session support
6. **Orders**: Order processing and history

### Frontend Features
- **Product Catalog**: Browse products with filtering by brand, category, and search
- **Shopping Cart**: Add, update, remove items with persistent storage
- **User Authentication**: Login and registration system
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Toast Notifications**: User feedback for actions
- **Loading States**: Proper loading indicators throughout the app

### Backend Features
- **RESTful API**: Well-structured endpoints for all operations
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Request Logging**: Detailed logging for API requests with performance metrics
- **Session Management**: Support for both authenticated and guest users
- **Data Validation**: Input validation using Zod schemas

## Data Flow

1. **Frontend Requests**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests and interact with storage layer
3. **Database Operations**: Drizzle ORM manages database interactions
4. **Response Handling**: Data flows back through the same path with proper error handling
5. **State Updates**: TanStack Query manages cache invalidation and updates

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component library
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Form Handling**: React Hook Form with Zod validation
- **Carousel**: Embla Carousel for product displays

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **ORM**: drizzle-orm and drizzle-zod for database operations
- **Development**: tsx for TypeScript execution in development

### Build and Development
- **Bundler**: Vite with React plugin
- **TypeScript**: Full TypeScript support with strict configuration
- **ESBuild**: For production server bundling
- **PostCSS**: For CSS processing with Tailwind

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Development Server**: Concurrent frontend and backend development
- **Hot Reload**: Vite HMR for frontend, tsx for backend

### Production Deployment
- **Build Process**: Vite builds frontend to `dist/public`, ESBuild bundles backend
- **Server**: Express serves both API and static files
- **Database**: Environment-based PostgreSQL connection
- **Scaling**: Replit autoscale deployment target
- **Port Configuration**: Port 5000 mapped to external port 80

### Environment Configuration
- **Database URL**: Environment variable for database connection
- **Session Secret**: Secure session management
- **CORS**: Configured for cross-origin requests
- **Static Files**: Efficient serving of built frontend assets

## Changelog

Changelog:
- August 14, 2025. Fixed session store database connection to use NETLIFY_DATABASE_URL - ensures consistent database connectivity across all platform components
- August 14, 2025. Updated database configuration for Netlify deployment - supports both NETLIFY_DATABASE_URL and DATABASE_URL environment variables for seamless deployment across platforms
- August 14, 2025. Migrated to new Neon PostgreSQL database with all authentic user data, signals, and subscriptions preserved
- August 14, 2025. Fixed all Netlify deployment issues by uploading missing components (queryClient, SubscriptionStatusBadge, UI components) - deployment ready
- August 14, 2025. Successfully deployed Watchlist Fx platform to GitHub repository with complete codebase upload including all critical files for Netlify deployment
- August 14, 2025. Implemented subscription extension functionality - purchasing new plans now extends existing subscriptions instead of replacing them, with proper trial-to-active upgrades
- August 14, 2025. Fixed trial user access to signals - users with free trial subscriptions can now properly view trading signals
- August 14, 2025. Added subscription status badge for logged-in users showing status (Free Trial/Active/Inactive/Expired) with remaining days and color coding
- August 14, 2025. Enhanced admin dashboard with comprehensive user subscription management - shows current status (Trial/Active/Inactive/Expired), remaining days with color coding, and allows status changes via dropdown
- August 14, 2025. Implemented automatic 7-day free trial for new user registrations - all new users now receive trial subscription upon signup
- August 14, 2025. Fixed payment gateway redirect behavior - both Yoco and Ozow now open in new tabs instead of replacing current page
- August 14, 2025. Added payment callback routes (/payment/success, /payment/cancel, /payment/error) with proper toast notifications to resolve payment page freezing issues
- August 13, 2025. Fixed Ozow payment integration DNS issue - switched from UAT server (uat.ozow.com) to production server (pay.ozow.com) due to UAT server being inaccessible
- August 13, 2025. Resolved Ozow HashCheck signature validation by correcting field order and concatenation logic
- August 13, 2025. Implemented PostgreSQL database storage to replace in-memory storage, ensuring persistent user accounts and sessions
- August 13, 2025. Replaced PayFast payment integration with Ozow for South African market
- August 13, 2025. Updated pricing to South African Rands (R49.99, R99.99, R179.99) and standardized all plans with same features but different durations (5, 14, 30 days)
- August 13, 2025. Redesigned home page as one-page poster-style website with bold typography, visual elements, and enhanced call-to-action design
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: One-page poster-style layouts with bold visual impact.