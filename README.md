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

Private project - All rights reserved