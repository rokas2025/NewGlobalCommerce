# Global Commerce - Project Structure

## Overview
This document outlines the complete folder structure for the Global Commerce e-commerce platform, organized for scalability and maintainability.

## Root Structure
```
NewGlobalCommerce/
├── .cursor/                     # Cursor IDE configuration
├── .vscode/                     # VS Code settings and extensions
├── docs/                        # Project documentation
├── public/                      # Static assets
├── src/                         # Source code
├── tasks/                       # Project tasks and planning
├── components.json              # shadcn/ui configuration
├── drizzle.config.ts           # Database ORM configuration
├── env.example                  # Environment variables template
├── package.json                # Dependencies and scripts
├── README.md                   # Project overview
└── tsconfig.json               # TypeScript configuration
```

## Source Code Structure (`src/`)
```
src/
├── app/                        # Next.js 14 App Router
│   ├── account/               # User account management
│   ├── admin/                 # Admin dashboard and tools
│   ├── api/                   # API routes
│   ├── auth/                  # Authentication pages
│   ├── cart/                  # Shopping cart
│   ├── checkout/              # Checkout process
│   ├── orders/                # Order management
│   ├── products/              # Product catalog
│   ├── favicon.ico            # Site favicon
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Homepage
├── components/                # React components
│   ├── admin/                 # Admin-specific components
│   ├── auth/                  # Authentication components
│   ├── cart/                  # Shopping cart components
│   ├── dashboard/             # Dashboard components
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   ├── modals/                # Modal dialogs
│   ├── order/                 # Order-related components
│   ├── payment/               # Payment components
│   ├── product/               # Product components
│   ├── search/                # Search components
│   └── ui/                    # shadcn/ui components
├── config/                    # Application configuration
├── constants/                 # Application constants
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries
│   ├── db/                    # Database configuration
│   ├── supabase/              # Supabase client setup
│   ├── validations/           # Zod validation schemas
│   ├── providers.tsx          # React providers
│   └── utils.ts               # Utility functions
├── services/                  # API services and business logic
├── store/                     # State management
├── types/                     # TypeScript type definitions
│   └── env.d.ts              # Environment variable types
└── middleware.ts              # Next.js middleware
```

## Component Organization

### Core Components (`src/components/`)
- **ui/**: shadcn/ui base components (buttons, inputs, cards, etc.)
- **layout/**: Headers, footers, navigation, sidebars
- **forms/**: Reusable form components and validation
- **modals/**: Dialog components for various interactions

### Feature Components
- **auth/**: Login, register, password reset components
- **product/**: Product cards, listings, details, filters
- **cart/**: Cart items, summary, mini-cart
- **order/**: Order history, tracking, details
- **payment/**: Payment forms, checkout steps
- **search/**: Search bars, filters, results
- **admin/**: Admin dashboard, management tools
- **dashboard/**: User dashboard components

## App Router Structure (`src/app/`)
Following Next.js 14 App Router conventions:

- **auth/**: Authentication routes (`/auth/login`, `/auth/register`)
- **products/**: Product catalog (`/products`, `/products/[id]`)
- **cart/**: Shopping cart page (`/cart`)
- **checkout/**: Checkout process (`/checkout`)
- **orders/**: Order management (`/orders`, `/orders/[id]`)
- **account/**: User account pages (`/account/profile`, `/account/settings`)
- **admin/**: Admin dashboard (`/admin/dashboard`, `/admin/products`)
- **api/**: API routes for backend functionality

## Library Organization (`src/lib/`)
- **db/**: Database schema, connections, migrations
- **supabase/**: Supabase client configuration for browser/server
- **validations/**: Zod schemas for form and data validation
- **providers.tsx**: React Query and other providers
- **utils.ts**: Common utility functions

## Additional Directories

### Configuration (`src/config/`)
- Application settings
- Feature flags
- Environment-specific configurations

### Constants (`src/constants/`)
- Application constants
- API endpoints
- Static data

### Hooks (`src/hooks/`)
- Custom React hooks
- API hooks using TanStack Query
- Authentication hooks

### Services (`src/services/`)
- API service layers
- Business logic
- External service integrations

### Store (`src/store/`)
- State management (if needed beyond TanStack Query)
- Global application state

### Types (`src/types/`)
- TypeScript type definitions
- API response types
- Component prop types

## Public Assets (`public/`)
```
public/
├── images/                    # Product images, banners, etc.
├── icons/                     # Custom icons and logos
├── file.svg                   # Default Next.js assets
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg
```

## Documentation (`docs/`)
- **ui-specifications.md**: UI/UX design specifications
- **wireframes-and-screens.md**: Screen wireframes and layouts
- **database-schema.md**: Database structure documentation
- **roadmap.md**: Development roadmap and milestones
- **project-structure.md**: This file

## Development Guidelines

### File Naming Conventions
- Components: PascalCase (`ProductCard.tsx`)
- Hooks: camelCase with `use` prefix (`useCart.ts`)
- Utilities: camelCase (`formatCurrency.ts`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Import Organization
1. React and Next.js imports
2. Third-party library imports
3. Internal component imports
4. Utility and type imports

### Component Structure
- Use TypeScript for all components
- Implement proper prop typing
- Follow React best practices
- Use shadcn/ui components as base

This structure supports the full Global Commerce feature set including multilingual support, AI-powered features, and comprehensive e-commerce functionality. 