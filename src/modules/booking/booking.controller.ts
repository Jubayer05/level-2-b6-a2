import { Request, Response } from "express";
import { ApiResponse, User } from "../../types";
import { bookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = (await bookingService.createBooking(
      req.body,
      req.user as User
    )) as ApiResponse<any>;

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to create booking",
        errors: result.errors,
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message ?? "Booking created successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
      errors: error?.message || "Internal server error",
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = (await bookingService.getAllBookings(
      req.user as User
    )) as ApiResponse<any>;

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to get all bookings",
        errors: "Failed to get all bookings",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get all bookings",
      errors: error?.message || "Internal server error",
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const result = (await bookingService.updateBooking(
      Number(req.params.bookingId || 0),
      req.body,
      req.user as User
    )) as ApiResponse<any>;

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update booking",
        errors: result.errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message ?? "Booking updated successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking",
      errors: error?.message || "Internal server error",
    });
  }
};

export const bookingController = {
  createBooking,
  getAllBookings,
  updateBooking,
};
