import { ApiResponse, User } from "@/types";
import { Request, Response } from "express";
import { userService } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUsers();
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to get users",
        errors: Array.isArray(result.data)
          ? result.data.join(", ")
          : result.data,
      });
    }
    return res.status(200).json({
      success: true,
      message: result.message ?? "Users retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to get users",
      errors: error?.message || "Internal server error",
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, role } = req.body;
    const result = (await userService.updateUser(
      Number(userId),
      { name, email, phone, role },
      req.user as unknown as User
    )) as ApiResponse<User>;

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update user",
        errors: result.errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message ?? "User updated successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      errors: error?.message || "Internal server error",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await userService.deleteUser(Number(userId));
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete user",
        errors: result.errors,
      });
    }
    return res.status(200).json({
      success: true,
      message: result.message ?? "User deleted successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      errors: error?.message || "Internal server error",
    });
  }
};

export const userController = { getAllUsers, updateUser, deleteUser };
