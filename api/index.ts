import app from "../src/app";
import initDB from "../src/config/db";

// Initialize database tables on cold start
let dbInitialized = false;

const handler = async (req: any, res: any) => {
  // Initialize DB only once (on cold start)
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
      console.log("Database initialized");
    } catch (error) {
      console.error("Database initialization error:", error);
      // Continue anyway - tables might already exist
    }
  }

  return app(req, res);
};

export default handler;


