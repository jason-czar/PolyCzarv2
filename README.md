# PolyCzar - Options Pricing for Prediction Markets

A clean implementation of PolyCzar, an advanced options pricing and trading application for prediction markets.

## Features

- **Options Pricing Engine**: Implementation of the Modified Black-Scholes model for binary options
- **Automated Market Maker (AMM)**: Liquidity management and trade execution
- **Historical Data Storage**: Local storage for market data and volatility calculations
- **Interactive UI**: Modern, responsive design with dark mode support
- **Options Chain**: Real-time display of options prices and trading interface
- **User Authentication**: Secure authentication powered by Clerk
- **Database Integration**: User profile and data storage with Supabase

## Technology Stack

- **Frontend**: React 18 with React Router
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Data Visualization**: Chart.js and Recharts
- **Local Storage**: IndexedDB for historical data
- **Package Manager**: pnpm (required for deployment)
- **Authentication**: Clerk
- **Database**: Supabase

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8.12.0 or higher (recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/PolyCzarUI.git
cd PolyCzarUI
```

2. Install dependencies
```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Clerk authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Supabase configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
pnpm dev
```

5. Build for production
```bash
pnpm build
```

## Deployment to Netlify

### Setup

1. Push your code to GitHub (PolyCzarUI repository)

2. Log in to Netlify and create a new site from GitHub

3. Configure build settings:
   - Repository: PolyCzarUI
   - Base directory: (leave blank)
   - Build command: `pnpm build`
   - Publish directory: `dist`

4. Add environment variables in Netlify:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Important Notes

- Client-side routing is already configured with the `_redirects` file in the public directory
- The `netlify.toml` file contains configuration for build settings and redirects
- Dark theme styling (#191B1C) is consistently applied throughout the application

## Authentication Flow

1. User signs up or logs in through the Clerk-powered authentication pages
2. On successful authentication, user is redirected to the main application
3. Protected routes (Portfolio, Database Setup) require authentication
4. Database Setup page allows users to configure their Supabase connection

## Development Notes

- The application uses a dark theme (#191B1C) throughout
- Authentication components are styled to match the overall application design
- The Clerk authentication flow is integrated with the React Router setup

## Project Structure

- `/src/components`: UI components
- `/src/utils`: Core utilities including options pricing model and AMM
- `/src/hooks`: Custom React hooks
- `/src/context`: Context providers
- `/src/pages`: Page components
- `/src/assets`: Static assets
- `/public`: Static files including _redirects for Netlify

## Core Components

### OptionsPricingEngine

Central component for calculating option prices using the Modified Black-Scholes model.

### Automated Market Maker (AMM)

Manages liquidity pools and handles trade execution with price impact calculations.

### OptionChain

Interactive component displaying options and providing buy/sell functionality.

## Theming

PolyCzar uses a custom dark theme with the following specifications:

- **Primary Dark Color**: #191B1C
- **Secondary Dark Colors**: 
  - Lighter: #21262A
  - Darker: #141618
- **Accent Color**: Indigo (#6366F1)
- **Font**: Inter (with various weights)

## License

[MIT](LICENSE)
