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
│  │  - Socket.IO Client (Real-time)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              ↓ HTTP/REST              ↓ WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Express.js Backend                         │  │
│  │  - RESTful API                                        │  │
│  │  - JWT Authentication                                 │  │
│  │  - CORS Middleware                                    │  │
│  │  - Route Controllers & Services                       │  │
│  │  - Socket.IO Server (Real-time)                       │  │
│  │    • Auction Bidding Events                           │  │
│  │    • Chat Messaging                                   │  │
│  │    • Live Updates                                     │  │
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
│  │  - Chat Messages                                      │  │
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
- **WebSocket Client**: Socket.IO Client

### Backend (`apps/backend`)

- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **CORS**: cors middleware
- **Runtime**: Node.js
- **Environment**: dotenv
- **WebSocket Server**: Socket.IO

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

## WebSocket Architecture (Real-time Features)

### Overview

The application uses **Socket.IO** for bidirectional, event-based communication between clients and server. This enables real-time features for live auction bidding and chat messaging.

### WebSocket Server Setup

**Technology**: Socket.IO v4.x
**Port**: Same as Express server (4000)
**Transport**: WebSocket with HTTP long-polling fallback

### Architecture Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Browser 1 │  │  Browser 2 │  │  Browser N │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
└─────────┼────────────────┼────────────────┼──────────────────┘
          │                │                │
          │ Socket.IO      │ Socket.IO      │ Socket.IO
          │ Connection     │ Connection     │ Connection
          │                │                │
┌─────────▼────────────────▼────────────────▼──────────────────┐
│               Socket.IO Server (Port 4000)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Connection Manager                          │   │
│  │  - Authentication verification                        │   │
│  │  - User session management                            │   │
│  │  - Room management (auction rooms, chat rooms)        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Event Handlers                              │   │
│  │  ┌────────────────┐    ┌─────────────────┐          │   │
│  │  │ Auction Events │    │  Chat Events    │          │   │
│  │  │ - join_auction │    │  - join_chat    │          │   │
│  │  │ - place_bid    │    │  - send_message │          │   │
│  │  │ - leave_auction│    │  - typing       │          │   │
│  │  └────────────────┘    └─────────────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  PostgreSQL DB   │
                  │  - Bids          │
                  │  - Messages      │
                  │  - Auctions      │
                  └──────────────────┘
```

### Event Architecture

#### 1. Live Auction Bidding

**Use Case**: Real-time bid updates across all users viewing an auction

**Events Flow**:

```
Client A                   Server                      All Clients
   │                         │                              │
   │ place_bid              │                              │
   ├────────────────────────>│                              │
   │ {auctionId, amount}    │                              │
   │                         │ Validate bid                 │
   │                         │ Check user auth              │
   │                         │ Verify amount > currentBid   │
   │                         │ Check auction active         │
   │                         │                              │
   │                         │ Save to DB                   │
   │                         ├─────────────┐                │
   │                         │             │                │
   │                         │<────────────┘                │
   │                         │                              │
   │                         │ bid_placed                   │
   │                         ├─────────────────────────────>│
   │                         │ {bid, auction, bidder}       │
   │                         │                              │
   │ bid_success            │                              │
   │<────────────────────────┤                              │
   │                         │                              │
```

**Events**:

- `join_auction` - Client joins auction room
- `leave_auction` - Client leaves auction room
- `place_bid` - Client places new bid
- `bid_placed` - Broadcast new bid to all room members
- `bid_error` - Send error to bidder
- `auction_ended` - Broadcast when auction time expires

**Room Strategy**:

- Room ID: `auction:${auctionId}`
- All clients viewing an auction join the room
- Broadcasts only sent to room members

#### 2. Chat System

**Use Case**: Real-time messaging between buyers and sellers

**Events Flow**:

```
Client A                   Server                      Client B
   │                         │                              │
   │ send_message           │                              │
   ├────────────────────────>│                              │
   │ {chatId, message}      │                              │
   │                         │ Validate message             │
   │                         │ Check user auth              │
   │                         │ Check chat permissions       │
   │                         │                              │
   │                         │ Save to DB                   │
   │                         ├─────────────┐                │
   │                         │             │                │
   │                         │<────────────┘                │
   │                         │                              │
   │                         │ new_message                  │
   │                         ├─────────────────────────────>│
   │                         │ {message, sender, timestamp} │
   │                         │                              │
   │ message_sent           │                              │
   │<────────────────────────┤                              │
   │                         │                              │
```

**Events**:

- `join_chat` - Join chat room
- `leave_chat` - Leave chat room
- `send_message` - Send chat message
- `new_message` - Broadcast message to chat participants
- `typing` - User is typing indicator
- `stop_typing` - User stopped typing
- `message_read` - Mark message as read

**Room Strategy**:

- Room ID: `chat:${chatId}` or `auction-chat:${auctionId}`
- Only chat participants can join
- Private 1-on-1 or auction-specific group chats

### Authentication Strategy

**Method**: JWT Token Verification

```typescript
// On connection
socket.on("connection", async (socket) => {
	const token = socket.handshake.auth.token;

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		socket.data.user = decoded;
	} catch (error) {
		socket.disconnect();
		return;
	}

	// User authenticated, proceed with event listeners
});
```

**Security**:

- Token sent in handshake auth
- Verified on connection
- User data stored in `socket.data`
- Re-verified for sensitive operations

### Room Management

**Auction Rooms**:

```typescript
// Join auction
socket.join(`auction:${auctionId}`);

// Leave auction
socket.leave(`auction:${auctionId}`);

// Broadcast to auction
io.to(`auction:${auctionId}`).emit("bid_placed", bidData);
```

**Chat Rooms**:

```typescript
// Join chat
socket.join(`chat:${chatId}`);

// Private message in chat
io.to(`chat:${chatId}`).emit("new_message", messageData);
```

### Scaling Considerations

#### Single Server (Current)

- In-memory room management
- Direct socket connections
- Suitable for up to 10,000 concurrent users

#### Multi-Server (Future)

**Challenge**: Rooms are server-specific
**Solution**: Redis Adapter

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

**Benefits**:

- Shared room state across servers
- Broadcast across all server instances
- Horizontal scaling enabled

### Error Handling

**Connection Errors**:

- Invalid token → Disconnect immediately
- Network issues → Automatic reconnection
- Server overload → Queue or reject new connections

**Event Errors**:

- Invalid bid → Send `bid_error` event
- Permission denied → Send `error` event
- Data validation → Send specific error messages

**Reconnection Strategy**:

```typescript
const socket = io({
	reconnection: true,
	reconnectionDelay: 1000,
	reconnectionAttempts: 5,
});
```

### Performance Optimizations

1. **Event Throttling**: Limit typing indicators to 500ms intervals
2. **Payload Compression**: Enable WebSocket compression
3. **Selective Broadcasting**: Only send to relevant room members
4. **Connection Pooling**: Reuse database connections
5. **Caching**: Cache auction data in memory for active auctions

### Monitoring

**Metrics to Track**:

- Active connections count
- Messages per second
- Room sizes
- Latency measurements
- Error rates

**Tools**:

- Socket.IO Admin UI
- Custom metrics emitter
- Logging with Winston

### Database Schema Updates

**Chat Messages Table**:

```prisma
model Message {
  id        String   @id @default(cuid())
  chatId    String
  senderId  String
  content   String
  createdAt DateTime @default(now())
  read      Boolean  @default(false)

  sender User @relation(fields: [senderId], references: [id])
  chat   Chat @relation(fields: [chatId], references: [id])
}

model Chat {
  id        String    @id @default(cuid())
  type      ChatType  @default(AUCTION) // AUCTION or DIRECT
  auctionId String?   @unique
  createdAt DateTime  @default(now())

  auction   Auction?  @relation(fields: [auctionId], references: [id])
  messages  Message[]
  participants ChatParticipant[]
}

model ChatParticipant {
  id        String   @id @default(cuid())
  chatId    String
  userId    String
  joinedAt  DateTime @default(now())

  chat Chat @relation(fields: [chatId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@unique([chatId, userId])
}

enum ChatType {
  AUCTION
  DIRECT
}
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
