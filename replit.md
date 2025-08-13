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
- August 13, 2025. Redesigned home page as one-page poster-style website with bold typography, visual elements, and enhanced call-to-action design
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: One-page poster-style layouts with bold visual impact.