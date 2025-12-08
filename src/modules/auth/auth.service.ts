import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../config/db";
import { SigninRequest, SignupRequest, User, UserRole } from "../../types";

const validateSignup = (payload: SignupRequest) => {
  const errors: string[] = [];

  if (!payload.name || payload.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (payload.name.length > 100) {
    errors.push("Name must be 100 characters or less");
  }

  if (!payload.email || payload.email.trim().length === 0) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      errors.push("Invalid email format");
    }
    if (payload.email !== payload.email.toLowerCase()) {
      errors.push("Email must be lowercase");
    }
    if (payload.email.length > 150) {
      errors.push("Email must be 150 characters or less");
    }
  }

  if (!payload.password) {
    errors.push("Password is required");
  } else if (payload.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (payload.role && payload.role !== "admin" && payload.role !== "customer") {
    errors.push("Role must be either 'admin' or 'customer'");
  }

  if (!payload.phone || payload.phone.trim().length === 0) {
    errors.push("Phone is required");
  } else if (payload.phone.length > 15) {
    errors.push("Phone must be 15 characters or less");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const signup = async (payload: SignupRequest) => {
  const validation = validateSignup(payload);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors.join(", "),
    };
  }

  const normalizedEmail = payload.email.toLowerCase().trim();
  const normalizedName = payload.name.trim();
  const normalizedPhone = payload.phone.trim();
  const defaultRole: UserRole = payload.role || "customer";

  const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [
    normalizedEmail,
  ]);
  if (emailCheck.rows.length > 0) {
    return {
      success: false,
      errors: "Email already exists",
    };
  }

  const phoneCheck = await pool.query("SELECT id FROM users WHERE phone = $1", [
    normalizedPhone,
  ]);
  if (phoneCheck.rows.length > 0) {
    return {
      success: false,
      errors: "Phone number already exists",
    };
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(payload.password, salt);

  const result = await pool.query<User>(
    `INSERT INTO users(name, email, password, role, phone) 
     VALUES($1, $2, $3, $4, $5) 
     RETURNING id, name, email, phone, role`,
    [
      normalizedName,
      normalizedEmail,
      passwordHash,
      defaultRole,
      normalizedPhone,
    ]
  );

  const user = result.rows[0];
  if (!user) {
    return {
      success: false,
      errors: "Failed to create user",
    };
  }

  return {
    success: true,
    data: user,
  };
};

const signin = async (payload: SigninRequest) => {
  const { email, password } = payload;

  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return null;
  }

  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
      id: user.id,
      name: user.name,
    },
    `${config.jwt_secret}`,
    { expiresIn: "1d" }
  );

  const { id, name, phone, role } = user;
  return {
    token,
    user: {
      id,
      name,
      email,
      phone,
      role,
    },
  };
};

export const authService = {
  signup,
  signin,
};
