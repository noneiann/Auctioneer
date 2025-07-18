# Auctioneer

Web Auction App

This is the Auctioneer fullstack monorepo, built with:

- Next.js for the frontend
- Express and TypeScript for the backend API
- Prisma for database ORM
- Turborepo for task orchestration
- npm workspaces for package management

## Project Structure

/
├── apps
│ ├── frontend # Next.js application
│ └── backend # Express API server
├── packages
│ ├── db # Prisma client and DB helpers
│ └── types # Shared TypeScript types
├── turbo.json # Turborepo pipeline config
└── package.json # Root package config with workspac

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/noneiann/auctioneer.git
cd auctioneer
```

### 2. Install dependencies

At the monorepo root, run:

```bash
npm install
```

### 3. Configure environment variables

In apps/backend, create a file named .env with:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/auctioneer"
PORT=4000
```

In apps/frontend, create a file named .env.local with:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 4. Prisma setup

From packages/db, run:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run development servers

At the monorepo root, start all apps with:

```bash
npm run dev
```

Frontend will be available at http://localhost:3000
Backend will be available at http://localhost:4000

Turborepo will orchestrate both servers concurrently.

### 6. Build all packages

To compile and bundle everything, run:

```bash
npm run build
```

### Useful Scripts

Command Description
npm run dev Run all development servers concurrently
npm run build Build all apps and shared packages
npx prisma generate Generate Prisma client (db package)
npx prisma migrate dev Run migrations locally (db package)
npx prisma studio Open Prisma database GUI

### Notes

    packages/types exports shared TypeScript interfaces and types for frontend and backend.

    packages/db exports the Prisma client for backend data access.

    The Turborepo pipeline in turbo.json defines how tasks (build, dev, lint, etc.) run across workspaces.


    Contributing

    Fork this repository

    Create a feature branch (git checkout -b feature/my-feature)

    Commit your changes (git commit -m "Add my feature")

    Push to your branch (git push origin feature/my-feature)

    Open a pull request

License

This project is licensed under the MIT License.
Contact

Maintained by Your Name.
For issues or questions, please open an issue on GitHub.
