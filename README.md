# Express PostgreSQL Authentication App

A modular Express.js application with TypeScript, PostgreSQL database and authentication module.

## Features

- Express.js REST API with TypeScript
- PostgreSQL database integration
- JWT-based authentication
- Modular architecture - each module is self-contained
- Input validation
- Password hashing with bcrypt
- Type-safe code with TypeScript

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection and initialization
│   ├── modules/
│   │   └── auth/                # Auth module (self-contained)
│   │       ├── auth.routes.ts   # Auth routes
│   │       ├── auth.service.ts  # Auth business logic
│   │       ├── auth.middleware.ts # Auth middleware (JWT, validation)
│   │       └── index.ts         # Module exports
│   ├── types/
│   │   ├── index.ts             # TypeScript type definitions
│   │   └── express.d.ts         # Express type extensions
│   └── server.ts                # Main application entry point
├── dist/                        # Compiled JavaScript output
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
└── package.json
```

## TypeScript & Import Aliases

This project uses TypeScript with path aliases. The `@` alias points to the `src/` directory:

- `@/config/database` → `src/config/database.ts`
- `@/modules/auth` → `src/modules/auth`
- `@/types` → `src/types`
- etc.

Path aliases are configured in `tsconfig.json` and resolved during compilation.

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up PostgreSQL database:

   - Create a database named `express_auth_db` (or update DB_NAME in .env)
   - Update database credentials in `.env` file

3. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` with your database credentials and JWT secret.

## Running the Application

### Build the project

First, compile TypeScript to JavaScript:

```bash
npm run build
```

This will compile all TypeScript files from `src/` to `dist/`.

### Development mode

Watch mode - automatically recompiles on file changes:

```bash
npm run dev
```

This runs `tsc --watch` which will recompile TypeScript files whenever you make changes.

### Production mode

After building, run the compiled JavaScript:

```bash
npm start
```

**Note:** Make sure to run `npm run build` before `npm start` in production, or set up a build pipeline.

## API Endpoints

### Public Routes

- `POST /api/auth/register` - Register a new user

  - Body: `{ "username": "string", "email": "string", "password": "string" }`

- `POST /api/auth/login` - Login user
  - Body: `{ "email": "string", "password": "string" }`

### Protected Routes (Require JWT Token)

- `GET /api/auth/profile` - Get user profile

  - Headers: `Authorization: Bearer <token>`

- `PUT /api/auth/profile` - Update user profile
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "username": "string", "email": "string" }` (both optional)

### Health Check

- `GET /health` - Server health check

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT signing

## Password Requirements

- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
# level-2-b6-a2
