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