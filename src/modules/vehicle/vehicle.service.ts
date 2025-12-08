import { pool } from "../../config/db";
import { Vehicle } from "../../types";

const validateVehicle = (payload: Vehicle) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const errors: string[] = [];

  if (!vehicle_name || vehicle_name.trim().length === 0) {
    errors.push("Vehicle name is required");
  }

  if (!type || !["car", "bike", "van", "SUV"].includes(type)) {
    errors.push("Vehicle type must be either car, bike, van, or SUV");
  }

  if (!registration_number || registration_number.trim().length === 0) {
    errors.push("Registration number is required");
  }

  if (!daily_rent_price || daily_rent_price < 0) {
    errors.push("Daily rent price must be positive");
  }

  if (
    !availability_status ||
    !["available", "booked"].includes(availability_status)
  ) {
    errors.push("Availability status must be either available or booked");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.join(", "),
  };
};

const validateVehicleUpdate = (payload: Partial<Vehicle>) => {
  const errors: string[] = [];

  if (payload.vehicle_name !== undefined) {
    if (!payload.vehicle_name || payload.vehicle_name.trim().length === 0) {
      errors.push("Vehicle name cannot be empty");
    }
  }

  if (payload.type !== undefined) {
    if (!["car", "bike", "van", "SUV"].includes(payload.type)) {
      errors.push("Vehicle type must be either car, bike, van, or SUV");
    }
  }

  if (payload.registration_number !== undefined) {
    if (
      !payload.registration_number ||
      payload.registration_number.trim().length === 0
    ) {
      errors.push("Registration number cannot be empty");
    }
  }

  if (payload.daily_rent_price !== undefined) {
    if (payload.daily_rent_price < 0) {
      errors.push("Daily rent price must be positive");
    }
  }

  if (payload.availability_status !== undefined) {
    if (!["available", "booked"].includes(payload.availability_status)) {
      errors.push("Availability status must be either available or booked");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.join(", "),
  };
};

const createVehicle = async (payload: Vehicle) => {
  const validation = validateVehicle(payload);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const result = await pool.query(
    `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) 
     VALUES($1, $2, $3, $4, $5) 
     RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return {
    success: true,
    data: result.rows[0],
  };
};

const getAllVehicle = async () => {
  const result = await pool.query(
    `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status 
     FROM vehicles`
  );
  return {
    success: true,
    data: result.rows,
  };
};

const getSingleVehicle = async (id: number) => {
  const result = await pool.query(
    `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status 
     FROM vehicles WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) {
    return {
      success: false,
      errors: "Vehicle not found",
    };
  }
  return {
    success: true,
    data: result.rows[0],
  };
};

const updateVehicle = async (id: number, payload: Partial<Vehicle>) => {
  const validation = validateVehicleUpdate(payload);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  const vehicleCheck = await pool.query(
    "SELECT id FROM vehicles WHERE id = $1",
    [id]
  );

  if (vehicleCheck.rows.length === 0) {
    return {
      success: false,
      errors: "Vehicle not found",
    };
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramCount = 1;

  if (payload.vehicle_name !== undefined) {
    updateFields.push(`vehicle_name = $${paramCount}`);
    updateValues.push(payload.vehicle_name.trim());
    paramCount++;
  }

  if (payload.type !== undefined) {
    updateFields.push(`type = $${paramCount}`);
    updateValues.push(payload.type);
    paramCount++;
  }

  if (payload.registration_number !== undefined) {
    updateFields.push(`registration_number = $${paramCount}`);
    updateValues.push(payload.registration_number.trim());
    paramCount++;
  }

  if (payload.daily_rent_price !== undefined) {
    updateFields.push(`daily_rent_price = $${paramCount}`);
    updateValues.push(payload.daily_rent_price);
    paramCount++;
  }

  if (payload.availability_status !== undefined) {
    updateFields.push(`availability_status = $${paramCount}`);
    updateValues.push(payload.availability_status);
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
    `UPDATE vehicles 
     SET ${updateFields.join(", ")} 
     WHERE id = $${paramCount}
     RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
    updateValues
  );

  return {
    success: true,
    data: result.rows[0],
  };
};

const deleteVehicle = async (id: number) => {
  const result = await pool.query(`DELETE FROM vehicles WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    return {
      success: false,
      errors: "Vehicle not found",
    };
  }
  return {
    success: true,
    data: result.rowCount,
  };
};

export const vehicleService = {
  createVehicle,
  getAllVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
