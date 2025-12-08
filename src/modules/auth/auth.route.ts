import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// signin
router.post("/signin", authController.signin);

// signup
router.post("/signup", authController.signup);

export const authRoute = router;
