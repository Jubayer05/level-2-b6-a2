import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import config from "./config";
import initDB from "./config/db";

const PORT: number = parseInt(config.port || "3000", 10);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
