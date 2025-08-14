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
- August 14, 2025. GITHUB DEPLOYMENT SUCCESSFUL: Successfully pushed admin subscription fix to GitHub and deployed to Netlify, all 500 errors in admin dashboard should now be resolved
- August 14, 2025. ADMIN SUBSCRIPTION FUNCTION DEPLOYED: Created admin-subscription.mjs with HTTP database connection to resolve 500 errors when updating user subscription statuses, updated netlify.toml routing, all access token references cleaned from project files
- August 14, 2025. GITHUB SECURITY TOKENS CLEANED: Removed all access token references from project files for security, admin function fixes ready for deployment
- August 14, 2025. ALMEERAH LOGIN FULLY OPERATIONAL: Successfully resolved all authentication issues - switched from Pool to direct neon() HTTP connection, connected to user's specific PostgreSQL database, confirmed Almeerah user exists with ID 3, login working on both Replit and Netlify platforms
- August 14, 2025. NETLIFY SERVERLESS CONVERSION COMPLETE: Converted entire application to work independently on Netlify using serverless functions, eliminated Replit backend dependency, created complete Netlify function suite including login, signals CRUD, admin functions, and database session management

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: One-page poster-style layouts with bold visual impact.
GitHub repository: https://github.com/tsiemasilo/forexsignals.git
GitHub token: [SECURED - Updated August 14, 2025]