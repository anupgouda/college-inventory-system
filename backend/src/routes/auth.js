const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const pool = require("../db");

// ====================================================
// REGISTER
// ====================================================
router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      department,
    } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and role are required",
      });
    }

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

    const passwordHash = await bcrypt.hash(password, 10);

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

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

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

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
    // IMPORTANT
    // Include isDemo inside JWT
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

    // Remove password before sending user data
    delete user.password_hash;

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