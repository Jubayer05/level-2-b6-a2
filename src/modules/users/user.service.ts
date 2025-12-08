import { pool } from "../../config/db";
import { User } from "../../types";

const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users"
  );

  if (result.rows.length === 0) {
    return {
      success: true,
      message: "No users found",
      data: [],
      total: 0,
    };
  }

  return {
    success: true,
    data: result.rows,
    total: result.rowCount,
  };
};

const updateUser = async (
  id: number,
  payload: Partial<User>,
  userInfo: User
) => {
  const userCheck = await pool.query(
    "SELECT id, role FROM users WHERE id = $1",
    [id]
  );

  if (userCheck.rows.length === 0) {
    return {
      success: false,
      errors: "User not found in the database",
    };
  }

  const targetUser = userCheck.rows[0];

  const isAdmin = userInfo.role === "admin";
  const isUpdatingSelf = userInfo.id === id;

  if (!isAdmin && !isUpdatingSelf) {
    return {
      success: false,
      errors: "You are not authorized to update this user",
    };
  }

  if (!isAdmin && payload.role !== undefined) {
    return {
      success: false,
      errors: "You are not authorized to change user role",
    };
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramCount = 1;

  if (payload.name !== undefined) {
    updateFields.push(`name = $${paramCount}`);
    updateValues.push(payload.name.trim());
    paramCount++;
  }

  if (payload.email !== undefined) {
    updateFields.push(`email = $${paramCount}`);
    updateValues.push(payload.email.toLowerCase().trim());
    paramCount++;
  }

  if (payload.phone !== undefined) {
    updateFields.push(`phone = $${paramCount}`);
    updateValues.push(payload.phone.trim());
    paramCount++;
  }

  if (payload.role !== undefined && isAdmin) {
    updateFields.push(`role = $${paramCount}`);
    updateValues.push(payload.role);
    paramCount++;
  }

  if (updateFields.length === 0) {
    return {
      success: false,
      errors: "No fields to update",
    };
  }

  updateValues.push(id);

  const result = await pool.query(
    `UPDATE users 
     SET ${updateFields.join(", ")}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING id, name, email, phone, role`,
    updateValues
  );

  if (result.rows.length === 0) {
    return {
      success: false,
      errors: "Failed to update user",
    };
  }

  return {
    success: true,
    data: result.rows[0],
    message: "User updated successfully",
  };
};

const deleteUser = async (id: number) => {
  // Check if user has any active bookings
  const activeBookings = await pool.query(
    "SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'",
    [id]
  );

  if (activeBookings.rows.length > 0) {
    return {
      success: false,
      errors:
        "Cannot delete user with active bookings. Please cancel or complete all bookings first.",
    };
  }

  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return {
      success: false,
      errors: "User not found in the database",
    };
  }

  return {
    success: true,
    data: result.rows[0],
    message: "User deleted successfully",
  };
};

export const userService = {
  getAllUsers,
  updateUser,
  deleteUser,
};
