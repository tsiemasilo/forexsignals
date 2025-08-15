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

## Changelog

Changelog:
- August 15, 2025. FREE TRIAL LOGIC COMPLETELY FIXED: Resolved React hooks error by moving useQuery to component top level, enhanced frontend logic to properly handle trial users - users with active trial days see signals instead of upgrade prompt, only show upgrade when trial actually expires (0 days left), added subscription status validation to prevent immediate upgrade prompts for fresh trial users, fixed admin panel trial duration bug from 1-minute to proper 7-day periods
- August 15, 2025. REALTIME AUTO-REFRESH IMPLEMENTED: Complete real-time functionality with auto-refresh every 3s for users and 4s for admin, visual status indicators, background refresh, window focus triggers, manual refresh controls, and network detection - changes from admin appear on user dashboard automatically without manual refresh
- August 15, 2025. AUTHENTICATION FIXED: Resolved login 500 errors by removing non-existent password_hash column reference, subscription access control now working perfectly with expired users properly blocked and shown upgrade prompt
- August 14, 2025. SUBSCRIPTION ACCESS CONTROL ENHANCED: Improved upgrade messaging for inactive users with compelling UI, subscription blocking working perfectly as intended, enhanced signals page with premium features list and South African pricing
- August 14, 2025. ADMIN SUBSCRIPTION FUNCTION DEPLOYED: Created admin-subscription.mjs with HTTP database connection to resolve 500 errors when updating user subscription statuses, updated netlify.toml routing, all access token references cleaned from project files
- August 14, 2025. ALMEERAH LOGIN FULLY OPERATIONAL: Successfully resolved all authentication issues - switched from Pool to direct neon() HTTP connection, connected to user's specific PostgreSQL database, confirmed Almeerah user exists with ID 3, login working on both Replit and Netlify platforms
- August 14, 2025. NETLIFY SERVERLESS CONVERSION COMPLETE: Converted entire application to work independently on Netlify using serverless functions, eliminated Replit backend dependency, created complete Netlify function suite including login, signals CRUD, admin functions, and database session management

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: One-page poster-style layouts with bold visual impact.
Real-time experience: Automatic background refresh without manual intervention.
GitHub repository: https://github.com/tsiemasilo/forexsignals.git
GitHub token: [SECURED - Updated August 14, 2025]