import { pool } from "../../config/db";
import { User } from "../../types";

const markExpiredBookingsAsReturned = async () => {
  const expiredBookings = await pool.query(
    `UPDATE bookings 
     SET status = 'returned', updated_at = NOW()
     WHERE rent_end_date::date < CURRENT_DATE 
     AND status = 'active'
     RETURNING vehicle_id`
  );

  if (expiredBookings.rows.length > 0) {
    const vehicleIds = expiredBookings.rows.map((row) => row.vehicle_id);
    await pool.query(
      `UPDATE vehicles 
       SET availability_status = 'available', updated_at = NOW()
       WHERE id = ANY($1::int[])`,
      [vehicleIds]
    );
  }
};

const createBooking = async (payload: any, user: User) => {
  await markExpiredBookingsAsReturned();

  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  if (!rent_start_date || !rent_end_date) {
    return {
      success: false,
      errors: "Rent start date and end date are required",
    };
  }

  const vehicle = await pool.query(
    "SELECT daily_rent_price, vehicle_name, availability_status FROM vehicles WHERE id = $1",
    [vehicle_id]
  );

  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.rows[0].availability_status === "booked") {
    return {
      success: false,
      errors: "Vehicle is already booked. Please choose another vehicle.",
    };
  }

  const daily_rent_price = vehicle.rows[0].daily_rent_price;

  const startDate =
    typeof rent_start_date === "string"
      ? new Date(rent_start_date)
      : rent_start_date;
  const endDate =
    typeof rent_end_date === "string" ? new Date(rent_end_date) : rent_end_date;

  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const numberOfDays = daysDiff > 0 ? daysDiff : 1;

  const total_price = daily_rent_price * numberOfDays;

  if (!total_price || total_price <= 0) {
    return {
      success: false,
      errors: "Failed to calculate total price or invalid price",
    };
  }

  const result = await pool.query(
    "INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  await pool.query(
    "UPDATE vehicles SET availability_status = 'booked' WHERE id = $1",
    [vehicle_id]
  );

  return {
    success: true,
    message: "Booking created successfully",
    data: {
      ...result.rows[0],
      vehicle: {
        vehicle_name: vehicle.rows[0].vehicle_name,
        daily_rent_price: vehicle.rows[0].daily_rent_price,
      },
    },
  };
};

const getAllBookings = async (user: User) => {
  await markExpiredBookingsAsReturned();

  if (user.role === "admin") {
    const adminFetch = await pool.query(`
      SELECT 
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        u.name as user_name,
        u.email as user_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      INNER JOIN users u ON b.customer_id = u.id
      INNER JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.created_at DESC
    `);

    const transformedData = adminFetch.rows.map((row: any) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      customer: {
        name: row.user_name,
        email: row.user_email,
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    }));

    return {
      success: true,
      data: transformedData,
    };
  }

  const result = await pool.query(
    `SELECT 
      b.id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      v.vehicle_name,
      v.type as vehicle_type,
      v.registration_number
    FROM bookings b
    INNER JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.created_at DESC`,
    [user.id]
  );

  const transformedCustomerData = result.rows.map((row: any) => ({
    id: row.id,
    customer_id: row.customer_id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    vehicle: {
      vehicle_name: row.vehicle_name,
      type: row.vehicle_type,
      registration_number: row.registration_number,
    },
  }));

  return {
    success: true,
    data: transformedCustomerData,
  };
};

const updateBookingAdmin = async (id: number, payload: any, user: User) => {
  const validStatuses = ["cancelled", "returned"];
  if (!payload.status || !validStatuses.includes(payload.status)) {
    return {
      success: false,
      errors: "Invalid status. Must be one of: cancelled, returned",
    };
  }

  const booking = await pool.query(
    "SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE id = $1",
    [id]
  );

  if (booking.rows.length === 0) {
    return {
      success: false,
      errors: "Booking not found",
    };
  }

  if (user.role === "admin" && payload.status === "cancelled") {
    return {
      success: false,
      errors: "Admin can not mark a booking as cancelled",
    };
  }

  if (booking.rows[0].status === "returned") {
    return {
      success: false,
      errors: "Booking is already marked as returned",
    };
  }

  if (booking.rows[0].status === "cancelled") {
    return {
      success: false,
      errors: "Booking is already marked as cancelled",
    };
  }

  const adminUpdate = await pool.query(
    "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
    [payload.status, id]
  );

  await pool.query(
    "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
    [booking.rows[0].vehicle_id]
  );

  const vehicle = await pool.query(
    "SELECT availability_status FROM vehicles WHERE id = $1",
    [booking.rows[0].vehicle_id]
  );

  return {
    success: true,
    message: "Booking marked as returned. Vehicle is now available",
    data: {
      ...adminUpdate.rows[0],
      vehicle: {
        availability_status: vehicle.rows[0].availability_status,
      },
    },
  };
};

const updateBookingCustomer = async (id: number, payload: any, user: User) => {
  if (!payload.status || payload.status !== "cancelled") {
    return {
      success: false,
      errors: "Customers can only cancel bookings. Status must be 'cancelled'",
    };
  }

  const booking = await pool.query(
    "SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE id = $1 AND customer_id = $2",
    [id, user.id]
  );

  if (booking.rows.length === 0) {
    return {
      success: false,
      errors: "Booking not found or you don't have permission to update it",
    };
  }

  if (booking.rows[0].status === "cancelled") {
    return {
      success: false,
      errors: "Booking is already cancelled",
    };
  }

  if (booking.rows[0].status === "returned") {
    return {
      success: false,
      errors: "Cannot cancel a booking that has already been returned",
    };
  }

  const rentStartDate = new Date(booking.rows[0].rent_start_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  rentStartDate.setHours(0, 0, 0, 0);

  if (rentStartDate <= today) {
    return {
      success: false,
      errors: "Cannot cancel booking. Rent start date must be in the future",
    };
  }

  const customerUpdate = await pool.query(
    "UPDATE bookings SET status = $1 WHERE id = $2 AND customer_id = $3 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
    [payload.status, id, user.id]
  );

  await pool.query(
    "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
    [booking.rows[0].vehicle_id]
  );

  return {
    success: true,
    message: "Booking cancelled successfully",
    data: customerUpdate.rows[0],
  };
};

const updateBooking = async (id: number, payload: any, user: User) => {
  if (user.role === "admin") {
    return await updateBookingAdmin(id, payload, user);
  }
  return await updateBookingCustomer(id, payload, user);
};

export const bookingService = {
  createBooking,
  getAllBookings,
  updateBooking,
};
