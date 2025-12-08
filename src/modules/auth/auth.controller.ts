import { Request, Response } from "express";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authService.signup(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Array.isArray(result.errors)
          ? result.errors.join(", ")
          : result.errors,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: err?.message || "Unexpected error",
    });
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const result = await authService.signin(req.body);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: "Authentication failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: err?.message || "Unexpected error",
    });
  }
};

export const authController = { signin, signup };
