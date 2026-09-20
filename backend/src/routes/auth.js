const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const pool = require("../db");

// ====================================================
// REGISTER
// ====================================================
// Public registration
// Users are always registered as Faculty.
//
// IMPORTANT:
// The client cannot choose Admin, HOD, IT, Principal,
// or Store Manager through this endpoint.
// ====================================================
router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      department,
    } = req.body;

    // ------------------------------------------------
    // Validate required fields
    // ------------------------------------------------
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    // ------------------------------------------------
    // Check whether email already exists
    // ------------------------------------------------
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // ------------------------------------------------
    // Hash password
    // ------------------------------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    // ------------------------------------------------
    // SECURITY:
    // Public registration always creates Faculty.
    //
    // Even if somebody sends:
    //
    // "role": "Admin"
    //
    // or:
    //
    // "role": "Principal"
    //
    // the backend ignores it.
    // ------------------------------------------------
    const role = "Faculty";

    // ------------------------------------------------
    // Create user
    // ------------------------------------------------
    const result = await pool.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        department,
        is_active,
        is_demo
      )
      VALUES ($1, $2, $3, $4, $5, true, false)
      RETURNING
        id,
        full_name,
        email,
        role,
        department,
        is_active,
        is_demo
      `,
      [
        full_name,
        email,
        passwordHash,
        role,
        department || null,
      ]
    );

    const user = result.rows[0];

    // ------------------------------------------------
    // Registration response
    // ------------------------------------------------
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// ====================================================
// LOGIN
// ====================================================
router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // ------------------------------------------------
    // Validate login fields
    // ------------------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ------------------------------------------------
    // Find user
    // ------------------------------------------------
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        department,
        is_active,
        is_demo
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // ------------------------------------------------
    // Check account status
    // ------------------------------------------------
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // ------------------------------------------------
    // Compare password
    // ------------------------------------------------
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==================================================
    // CREATE JWT
    // ==================================================
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        isDemo: user.is_demo === true,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // ------------------------------------------------
    // Never send password hash to frontend
    // ------------------------------------------------
    delete user.password_hash;

    // ------------------------------------------------
    // Login response
    // ------------------------------------------------
    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

module.exports = router;