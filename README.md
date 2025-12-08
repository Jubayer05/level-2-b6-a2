# Vehicle Rental System

**Live URL:** https://vehicle-rental-system-rosy.vercel.app/

## Admin Credentials

For testing purposes, use the following admin account:

```json
{
  "email": "jubayer.admin@gmail.com",
  "password": "123456"
}
```

A professional vehicle rental platform with comprehensive booking management, vehicle inventory control, and secure user authentication. Built with TypeScript, Express.js, and PostgreSQL for scalability and type safety.

## Features

### Core Functionality

- 🚗 **Vehicle Management**: Create, read, update, and delete vehicle inventory
- 📅 **Booking System**: Complete booking lifecycle with date validation and pricing calculation
- 🔐 **Authentication & Authorization**: JWT-based secure authentication with role-based access control
- 👤 **User Management**: Customer and admin profiles with secure password hashing
- ✅ **Availability Tracking**: Real-time vehicle availability status updates
- 💰 **Dynamic Pricing**: Automatic calculation of rental costs based on duration

### Technical Features

- **Type Safety**: Full TypeScript implementation for robust code
- **Modular Architecture**: Self-contained modules for scalability
- **RESTful API**: Clean and consistent API design
- **Database Auto-initialization**: Automatic table creation on first run
- **Error Handling**: Comprehensive error handling and validation
- **Serverless Ready**: Optimized connection pooling for Vercel deployment
- **Health Monitoring**: Built-in health check endpoint

## Technology Stack

**Backend:**

- Node.js & Express.js 5.x
- TypeScript 5.x
- PostgreSQL (Production database)

**Security:**

- JWT (JSON Web Tokens) for authentication
- bcryptjs for password hashing

**Development Tools:**

- tsx (TypeScript execution)
- dotenv (Environment configuration)
- pg (PostgreSQL client)

**Deployment:**

- Vercel (Serverless deployment)

## Project Structure

```
vehicle-rental-system/
├── api/
│   └── index.ts                    # Vercel serverless entry point
├── src/
│   ├── config/
│   │   ├── db.ts                   # Database configuration & initialization
│   │   └── index.ts                # Environment config loader
│   ├── middleware/
│   │   └── auth.ts                 # JWT authentication middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # Authentication handlers
│   │   │   ├── auth.route.ts       # Auth routes (login, register)
│   │   │   └── auth.service.ts     # Auth business logic
│   │   ├── booking/
│   │   │   ├── booking.controller.ts
│   │   │   ├── booking.routes.ts
│   │   │   └── booking.service.ts  # Booking operations & validation
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── users.routes.ts
│   │   └── vehicle/
│   │       ├── vehicle.controller.ts
│   │       ├── vehicle.routes.ts
│   │       └── vehicle.service.ts
│   ├── types/
│   │   ├── express/
│   │   │   └── index.d.ts          # Express type extensions
│   │   └── index.ts                # Shared TypeScript types
│   ├── app.ts                      # Express app configuration
│   └── server.ts                   # Server entry point
├── dist/                           # Compiled JavaScript (production)
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment template
├── package.json
├── tsconfig.json                   # TypeScript configuration
└── vercel.json                     # Vercel deployment config
```

## Database Schema

### Users Table

```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR UNIQUE)
- password (TEXT - hashed)
- role (VARCHAR - customer/admin)
- phone (VARCHAR UNIQUE)
- created_at, updated_at (TIMESTAMP)
```

### Vehicles Table

```sql
- id (SERIAL PRIMARY KEY)
- vehicle_name (VARCHAR)
- type (vehicle_type ENUM)
- registration_number (VARCHAR UNIQUE)
- daily_rent_price (INTEGER)
- availability_status (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

### Bookings Table

```sql
- id (SERIAL PRIMARY KEY)
- customer_id (FK → users.id)
- vehicle_id (FK → vehicles.id)
- rent_start_date (VARCHAR)
- rent_end_date (VARCHAR)
- total_price (INTEGER)
- status (booking_status ENUM - active/cancelled)
- created_at, updated_at (TIMESTAMP)
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd vehicle-rental-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
BASE_URL=/api/v1

# Database Configuration
CONNECTION_STR=postgresql://username:password@localhost:5432/vehicle_rental_db

# Security
JWT_SECRET=your_super_secret_jwt_key_here
```

4. **Database Setup**

- Ensure PostgreSQL is running
- Create a database (e.g., `vehicle_rental_db`)
- The application will automatically create tables on first run

5. **Run the application**

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Usage

### Development Mode

Run with hot-reload for development:

```bash
npm run dev
```

### Production Build

1. Compile TypeScript to JavaScript:

```bash
npm run build
```

2. Run the compiled application:

```bash
node dist/server.js
```

## API Endpoints

### Authentication Routes

**Base URL:** `/api/v1/auth`

- **POST** `/register` - Register a new user

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "1234567890"
  }
  ```

- **POST** `/login` - User login
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```

### User Routes

**Base URL:** `/api/v1/users`

- **GET** `/profile` - Get user profile (Protected)
- **PUT** `/profile` - Update user profile (Protected)

### Vehicle Routes

**Base URL:** `/api/v1/vehicle`

- **GET** `/` - Get all vehicles
- **GET** `/:id` - Get vehicle by ID
- **POST** `/` - Create new vehicle (Admin)
- **PUT** `/:id` - Update vehicle (Admin)
- **DELETE** `/:id` - Delete vehicle (Admin)

### Booking Routes

**Base URL:** `/api/v1/bookings`

- **GET** `/` - Get all bookings (Admin) / User's bookings (Customer)
- **GET** `/:id` - Get booking by ID
- **POST** `/` - Create new booking (Protected)
- **PUT** `/:id` - Update booking (Protected)
- **DELETE** `/:id` - Cancel booking (Protected)

### Health Check

- **GET** `/health` - Server health status

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login, include the token in requests:

```
Authorization: Bearer <your-jwt-token>
```

### Protected Routes

Routes marked as **(Protected)** require authentication. Include the JWT token in the Authorization header.

## Environment Variables

| Variable         | Description                  | Required | Default |
| ---------------- | ---------------------------- | -------- | ------- |
| `PORT`           | Server port                  | No       | 3000    |
| `BASE_URL`       | API base path                | No       | /api/v1 |
| `CONNECTION_STR` | PostgreSQL connection string | Yes      | -       |
| `JWT_SECRET`     | Secret key for JWT signing   | Yes      | -       |

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Request validation middleware
- **Role-Based Access Control**: Customer/Admin roles
- **Environment Variables**: Sensitive data protection

## Deployment

### Vercel Deployment

1. **Push to GitHub**

```bash
git push origin master
```

2. **Connect to Vercel**

- Import your repository in Vercel
- Configure environment variables in Vercel dashboard
- Deploy

3. **Environment Variables in Vercel**
   Set all required environment variables in your Vercel project settings.

4. **Database Connection**

- Use a PostgreSQL service (e.g., Neon, Supabase, Railway)
- Update `CONNECTION_STR` with your production database URL
- Ensure connection pooling is configured for serverless

### Important Notes for Serverless

- Connection pool is limited to 1 for serverless compatibility
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on GitHub.
