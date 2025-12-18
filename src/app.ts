import express, { NextFunction, Request, Response } from "express";

import config from "./config";
import { authRoute } from "./modules/auth/auth.route";
import { bookingRoutes } from "./modules/booking/booking.routes";
import { userRoutes } from "./modules/users/users.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";

const app = express();
const BASE_URL = config.base_url || "/api/v1";

// Middleware
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes with base URL
app.use(`${BASE_URL}/users`, userRoutes);
app.use(`${BASE_URL}/auth`, authRoute);
app.use(`${BASE_URL}/vehicles`, vehicleRoutes);
app.use(`${BASE_URL}/bookings`, bookingRoutes);

// Health check route (usually outside base URL)
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const status = (err as any).status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
