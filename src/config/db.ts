import { Pool } from "pg";
import config from "./index";

// DB connection pool - configured for serverless
export const pool = new Pool({
  connectionString: config.connection_str,
  // Serverless-friendly settings
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

const initDB = async () => {
  // Create users table
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(100) NOT NULL DEFAULT 'customer',
        phone VARCHAR(15) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

  // Create vehicles table
  await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles(
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(200) NOT NULL,
        type vehicle_type NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        daily_rent_price INTEGER NOT NULL,
        availability_status VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

  // Create bookings table
  await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings(
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        rent_start_date VARCHAR(100) NOT NULL,
        rent_end_date VARCHAR(100) NOT NULL,
        total_price INTEGER NOT NULL,
        status booking_status NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
};

export default initDB;
