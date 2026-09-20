const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const pool = require("../db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ====================================================
// GET ALL USERS
// Admin only
// ====================================================
router.get(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          full_name,
          email,
          role,
          department,
          is_active,
          is_demo,
          created_at
        FROM users
        ORDER BY created_at DESC
        `
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("GET /api/users error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  }
);

// ====================================================
// CREATE USER
// Admin only
// ====================================================
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
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
          message:
            "Full name, email, password and role are required",
        });
      }

      const allowedRoles = [
        "Admin",
        "HOD",
        "IT",
        "Principal",
        "Faculty",
        "Store Manager",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role",
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
          is_demo,
          created_at
        `,
        [
          full_name,
          email,
          passwordHash,
          role,
          department || null,
        ]
      );

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("POST /api/users error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
    }
  }
);

// ====================================================
// ACTIVATE / DEACTIVATE USER
// Admin only
// ====================================================
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { is_active } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (typeof is_active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "is_active must be true or false",
        });
      }

      // Prevent Admin from changing their own status
      if (userId === Number(req.user.userId)) {
        return res.status(400).json({
          success: false,
          message: "You cannot change your own account status",
        });
      }

      const userResult = await pool.query(
        `
        SELECT
          id,
          full_name,
          email,
          role,
          is_active
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = userResult.rows[0];

      // Prevent deactivating the last active Admin
      if (!is_active && user.role === "Admin" && user.is_active) {
        const adminCount = await pool.query(
          `
          SELECT COUNT(*)::int AS count
          FROM users
          WHERE role = 'Admin'
            AND is_active = true
          `
        );

        if (adminCount.rows[0].count <= 1) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot deactivate the last active Admin account",
          });
        }
      }

      const result = await pool.query(
        `
        UPDATE users
        SET is_active = $1
        WHERE id = $2
        RETURNING
          id,
          full_name,
          email,
          role,
          department,
          is_active,
          is_demo,
          created_at
        `,
        [is_active, userId]
      );

      res.json({
        success: true,
        message: is_active
          ? "User activated successfully"
          : "User deactivated successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error(
        "PATCH /api/users/:id/status error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update user status",
        error: error.message,
      });
    }
  }
);

// ====================================================
// DELETE USER
// Admin only
// ====================================================
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // Prevent Admin from deleting themselves
      if (userId === Number(req.user.userId)) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      const userResult = await pool.query(
        `
        SELECT
          id,
          full_name,
          email,
          role,
          is_active
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = userResult.rows[0];

      // Prevent deleting the last active Admin
      if (user.role === "Admin" && user.is_active) {
        const adminCount = await pool.query(
          `
          SELECT COUNT(*)::int AS count
          FROM users
          WHERE role = 'Admin'
            AND is_active = true
          `
        );

        if (adminCount.rows[0].count <= 1) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot delete the last active Admin account",
          });
        }
      }

      await pool.query(
        "DELETE FROM users WHERE id = $1",
        [userId]
      );

      res.json({
        success: true,
        message: "User deleted successfully",
        deletedUser: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "DELETE /api/users/:id error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }
);

module.exports = router;