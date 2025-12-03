# Auctioneer System Design

## Overview

Auctioneer is a full-stack web application for online auctions, direct sales, and bartering. Built with a modern monorepo architecture using Next.js, Express, and PostgreSQL.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js Frontend (React)                    │  │
│  │  - Server Components & Client Components              │  │
│  │  - App Router (Auth, Main, Seller routes)            │  │
│  │  - Zustand State Management                           │  │
│  │  - TailwindCSS Styling                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Express.js Backend                         │  │
│  │  - RESTful API                                        │  │
│  │  - JWT Authentication                                 │  │
│  │  - CORS Middleware                                    │  │
│  │  - Route Controllers & Services                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  - User Management                                    │  │
│  │  - Items & Auctions                                   │  │
│  │  - Bids & Transactions                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend (`apps/frontend`)

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **State Management**: Zustand (with persist middleware)
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

### Backend (`apps/backend`)

- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **CORS**: cors middleware
- **Runtime**: Node.js
- **Environment**: dotenv

### Database (`packages/db`)

- **Database**: PostgreSQL
- **ORM**: Prisma 6.19.0
- **Schema Management**: Prisma Migrations
- **Client Generation**: Prisma Client

### Shared (`packages/types`)

- **Purpose**: Shared TypeScript interfaces and types
- **Exports**: API contracts, domain models, request/response types

---

## Project Structure

```
Auctioneer/
├── apps/
│   ├── frontend/                    # Next.js application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/         # Authentication routes
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (main)/         # Main application routes
│   │   │   │   │   ├── auctions/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── (seller)/       # Seller dashboard
│   │   │   │   │   └── seller/
│   │   │   │   │       ├── auctions/
│   │   │   │   │       ├── Components/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── layout.tsx      # Root layout
│   │   │   │   └── globals.css
│   │   │   ├── components/         # Shared UI components
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── lib/                # API clients
│   │   │   └── stores/             # Zustand stores
│   │   └── package.json
│   │
│   └── backend/                     # Express API
│       ├── src/
│       │   ├── index.ts            # Entry point
│       │   ├── controllers/        # Route handlers
│       │   ├── services/           # Business logic
│       │   ├── middleware/         # Auth, logging, etc.
│       │   └── routes/             # Route definitions
│       ├── .env                    # Environment variables
│       └── package.json
│
├── packages/
│   ├── db/                          # Database package
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema
│   │   │   ├── migrations/         # Migration history
│   │   │   └── .env                # DB connection string
│   │   ├── generated/              # Prisma Client
│   │   ├── src/
│   │   │   └── index.ts            # Export Prisma client
│   │   ├── prisma.config.ts        # Prisma 7 config
│   │   └── package.json
│   │
│   └── types/                       # Shared TypeScript types
│       ├── src/
│       │   └── index.ts            # Type definitions
│       └── package.json
│
├── .env                             # Root environment variables
├── package.json                     # Root package (workspace)
├── turbo.json                       # Turborepo configuration
└── prisma.config.ts                # Root Prisma config
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     User     │         │     Item     │         │   Auction    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │────────>│ id (PK)      │<────────│ id (PK)      │
│ email        │ owns    │ name         │ 1:1     │ startTime    │
│ password     │         │ description  │         │ endTime      │
│ firstName    │         │ imageUrl[]   │         │ startingBid  │
│ lastName     │         │ type         │         │ currentBid   │
│ username     │         │ price        │         │ ownerId (FK) │
│ permission   │         │ status       │         │ itemId (FK)  │
│ createdAt    │         │ ownerId (FK) │         │ category     │
│ updatedAt    │         │ createdAt    │         │ createdAt    │
└──────────────┘         │ updatedAt    │         │ updatedAt    │
       │                 └──────────────┘         └──────────────┘
       │                                                  │
       │ creates                                          │ has many
       │                                                  ▼
       │                                          ┌──────────────┐
       └─────────────────────────────────────────>│     Bid      │
                    places                        ├──────────────┤
                                                  │ id (PK)      │
                                                  │ amount       │
                                                  │ bidderId(FK) │
                                                  │ auctionId(FK)│
                                                  │ createdAt    │
                                                  └──────────────┘
```

### Models

#### User

- Stores user account information
- Relations: owns items, owns auctions, places bids
- Authentication: password hashed with bcrypt

#### Item

- Represents items for sale/auction/barter
- Types: AUCTION, DIRECT, BARTER
- Status: AVAILABLE, SOLD, EXPIRED, WITHDRAWN
- One-to-one with auction (if type is AUCTION)

#### Auction

- Manages auction-specific data
- Tracks bids and current highest bid
- Time-bound with start/end times
- One-to-one with item

#### Bid

- Records bid attempts on auctions
- Many-to-one with auction
- Many-to-one with user (bidder)

---

## API Design

### Base URL

```
http://localhost:4000
```

### Authentication

- **Method**: JWT (JSON Web Tokens)
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 2 days

### Endpoints

#### Authentication (`/auth`)

```
POST   /auth/register    - Register new user
POST   /auth/login       - Login user
GET    /auth/user/:id    - Get user by ID (protected)
```

#### Auctions (`/auctions`)

```
GET    /auctions         - List all auctions
GET    /auctions/:id     - Get auction by ID
POST   /auctions         - Create auction (protected)
PUT    /auctions/:id     - Update auction (protected, owner only)
DELETE /auctions/:id     - Delete auction (protected, owner only)
```

### Request/Response Format

**Standard Response**:

```typescript
interface ApiResponse<T> {
	success: boolean;
	data: T;
}
```

**Create Auction Request**:

```typescript
{
  title: string;
  description: string;
  imageUrl: string[];
  type: "AUCTION" | "DIRECT" | "BARTER";
  price?: number;
  startTime: string; // ISO date
  endTime: string;   // ISO date
  startingBid: number;
}
```

---

## Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌──────────┐
│ Client  │                    │  API    │                    │ Database │
└────┬────┘                    └────┬────┘                    └────┬─────┘
     │                              │                              │
     │ POST /auth/register          │                              │
     │ { email, password, ... }     │                              │
     ├─────────────────────────────>│                              │
     │                              │ Hash password (bcrypt)       │
     │                              │                              │
     │                              │ INSERT user                  │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │ Return user                  │
     │                              │<─────────────────────────────┤
     │                              │                              │
     │                              │ Login automatically          │
     │                              │ Generate JWT token           │
     │                              │                              │
     │ { success, data: {user,token}}                             │
     │<─────────────────────────────┤                              │
     │                              │                              │
     │ Store token in Zustand       │                              │
     │ (persisted to localStorage)  │                              │
     │                              │                              │
     │ Subsequent requests          │                              │
     │ Header: Authorization:       │                              │
     │ Bearer <token>               │                              │
     ├─────────────────────────────>│                              │
     │                              │ Verify JWT                   │
     │                              │ Decode user info             │
     │                              │                              │
```

---

## State Management

### Zustand Stores

#### AuthStore (`stores/AuthStore.ts`)

```typescript
interface AuthState {
	user: User | null;
	token: string | null;
	setAuth: (user: User, token: string) => void;
	logout: () => void;
}
```

**Persistence**:

- Stored in `localStorage` as `auth-storage`
- Survives page reloads
- Automatically hydrates on app load

**Usage**:

```typescript
const { user, token, setAuth, logout } = useAuth();
```

---

## Routing Strategy

### Frontend Routes

#### Route Groups

- `(auth)`: Authentication pages (no root layout)
- `(main)`: Public pages with header
- `(seller)`: Seller dashboard with sidebar

#### Protected Routes

- Client-side check via `useAuth` hook
- Redirects to `/login` if not authenticated
- Example: Create auction, seller dashboard

#### Route Structure

```
/                          → Home page
/login                     → Login page
/register                  → Registration page
/auctions                  → Browse auctions
/auctions/:id              → Auction details
/auctions/create           → Create auction (protected)
/seller                    → Seller dashboard (protected)
/seller/auctions           → Manage auctions (protected)
```

---

## Security Considerations

### Authentication

- **Password Security**: bcrypt with salt rounds
- **JWT Secret**: Stored in environment variables
- **Token Expiry**: 2 days to limit exposure
- **HTTPS**: Required in production

### Authorization

- **Ownership Checks**: Users can only modify their own auctions
- **Middleware**: `authenticateToken` verifies JWT on protected routes
- **Permission System**: User permission field for role-based access

### Input Validation

- **Frontend**: Form validation with required fields
- **Backend**: Request validation in controllers
- **Database**: Prisma schema constraints

### CORS

- **Development**: Allows `http://localhost:3000`
- **Production**: Configured for specific origins

---

## Data Flow

### Creating an Auction

```
1. User fills create auction form
   ↓
2. Frontend validates input
   ↓
3. API request to POST /auctions
   Headers: { Authorization: Bearer <token> }
   Body: { title, description, imageUrl, ... }
   ↓
4. Backend authenticates user via JWT
   ↓
5. Controller calls ItemServices.createItem()
   ↓
6. Item created in database
   ↓
7. Controller calls AuctionServices.createAuction()
   with itemId
   ↓
8. Auction created in database
   ↓
9. Response sent back with auction data
   ↓
10. Frontend updates local state
    ↓
11. User redirected to /auctions
```

### Fetching Auctions

```
1. Component mounts, useAuctions hook called
   ↓
2. API request to GET /auctions
   ↓
3. Backend queries database via Prisma
   Include: owner, item, bids
   ↓
4. Database returns auction list with relations
   ↓
5. Backend sends response
   ↓
6. Frontend updates state
   ↓
7. Component renders auction list
```

---

## Environment Variables

### Root (`.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/auctioneer
PORT=4000
JWT_SECRET=your_secret_key
```

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/auctioneer
PORT=4000
JWT_SECRET=your_secret_key
CLOUDINARY_URL=cloudinary://...
```

### Database (`packages/db/prisma/.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/auctioneer
```

---

## Build & Deployment

### Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Sync database schema
npm run db:sync

# Run development servers
npm run dev
```

### Production Build

```bash
# Build all packages
npm run build

# Start production server
npm start
```

### Database Migrations

```bash
# Create migration
npm run db:update

# Apply migrations
npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma

# Generate Prisma client
npm run db:setup
```

---

## Performance Considerations

### Frontend

- **Server Components**: Reduce client-side JavaScript
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Lazy Loading**: Dynamic imports for heavy components

### Backend

- **Connection Pooling**: Prisma manages PostgreSQL connections
- **Query Optimization**: Select only needed fields
- **Indexing**: Primary keys and foreign keys indexed

### Database

- **Relations**: Efficient with include/select
- **Pagination**: Implement for large datasets
- **Caching**: Consider Redis for frequent queries

---

## Scalability

### Horizontal Scaling

- **Stateless Backend**: JWT enables multi-instance deployment
- **Load Balancer**: Distribute traffic across instances
- **Database Replicas**: Read replicas for queries

### Vertical Scaling

- **Database**: Upgrade PostgreSQL resources
- **Server**: Increase Node.js instance memory

### Future Enhancements

- **CDN**: Serve static assets globally
- **WebSockets**: Real-time bid updates
- **Queue System**: Background job processing
- **Microservices**: Split auth, auction, payment services

---

## Monitoring & Logging

### Logging Strategy

- **Console Logs**: Development debugging
- **Structured Logs**: Production with Winston/Pino
- **Error Tracking**: Sentry integration recommended

### Metrics

- **API Response Times**: Track with middleware
- **Database Query Performance**: Prisma logging
- **User Activity**: Analytics integration

---

## Testing Strategy

### Unit Tests

- **Backend**: Controllers and services
- **Frontend**: Utility functions and hooks

### Integration Tests

- **API Tests**: Test endpoints with supertest
- **Database Tests**: Test Prisma queries

### E2E Tests

- **User Flows**: Registration, login, create auction
- **Tools**: Playwright or Cypress

---

## Future Roadmap

### Phase 1 (Current)

- [x] User authentication
- [x] Auction creation
- [x] Auction listing
- [x] Seller dashboard

### Phase 2

- [ ] Real-time bidding (WebSockets)
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Search and filtering

### Phase 3

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Admin panel
- [ ] Multi-language support

### Phase 4

- [ ] AI-powered pricing suggestions
- [ ] Fraud detection
- [ ] Social features (follow sellers)
- [ ] Auction recommendations

---

## Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier
- **Linting**: ESLint
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow

- **Branches**: feature/, bugfix/, hotfix/
- **Commits**: Conventional commits
- **PRs**: Require review before merge

---

## License

ISC

---

## Contact & Support

- **Repository**: https://github.com/noneiann/Auctioneer
- **Issues**: https://github.com/noneiann/Auctioneer/issues
