import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.createVehicle(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.errors,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
      errors: error?.message || "Internal server error",
    });
  }
};

const getAllVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicle();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to get all vehicles",
        errors: "Failed to get all vehicles",
      });
    }

    if (result.data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to get all vehicles",
      errors: error?.message || "Internal server error",
    });
  }
};

const getSingleVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getSingleVehicle(
      Number(req.params.vehicleId)
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: "Failed to get single vehicle",
        errors: result.errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to get single vehicle",
      errors: error?.message || "Internal server error",
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.updateVehicle(
      Number(req.params.vehicleId),
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update vehicle",
        errors: result.errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
      errors: error?.message || "Internal server error",
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.deleteVehicle(
      Number(req.params.vehicleId)
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete vehicle",
        errors: result.errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle",
      errors: error?.message || "Internal server error",
    });
  }
};

export const vehicleController = {
  createVehicle,
  getAllVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
