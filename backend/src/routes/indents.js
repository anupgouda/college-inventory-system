const express = require("express");
const router = express.Router();

const pool = require("../db");
const demoPool = pool.demoPool;

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
router.use(authenticateToken);

// ----------------------------------------------------
// DATABASE SELECTOR
// Demo user  -> demo schema
// Normal user -> public schema
// ----------------------------------------------------
function getDatabase(req) {
  const isDemo = req.user?.isDemo === true;

  console.log(
    "INDENT REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ====================================================
// GET ALL INDENTS
// ====================================================
router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        id,
        date,
        branch,
        description,
        qty,
        status,
        created_at
      FROM indents
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/indents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch indents",
      error: error.message,
    });
  }
});

// ====================================================
// CREATE INDENT
// ====================================================
router.post(
  "/",
  authorizeRoles(
    "Admin",
    "HOD",
    "Faculty",
    "Store Manager"
  ),
  async (req, res) => {
  try {
    const db = getDatabase(req);

    const {
      branch,
      description,
      qty,
    } = req.body;

    if (!branch || !description || qty === undefined) {
      return res.status(400).json({
        success: false,
        message: "Branch, description and quantity are required",
      });
    }

    if (Number(qty) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const result = await db.query(
      `
      INSERT INTO indents (
        date,
        branch,
        description,
        qty,
        status
      )
      VALUES (
        CURRENT_DATE,
        $1,
        $2,
        $3,
        'Pending'
      )
      RETURNING
        id,
        date,
        branch,
        description,
        qty,
        status,
        created_at
      `,
      [
        branch,
        description,
        Number(qty),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /api/indents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create indent",
      error: error.message,
    });
  }
});

// ====================================================
// UPDATE INDENT STATUS
// ADMIN / HOD ONLY
// ====================================================
router.patch(
  "/:id",
  authorizeRoles(
  "Admin",
  "HOD",
  "Principal",
  "Store Manager"
),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Approved",
        "Rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const result = await db.query(
        `
        UPDATE indents
        SET status = $1
        WHERE id = $2
        RETURNING
          id,
          date,
          branch,
          description,
          qty,
          status,
          created_at
        `,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Indent not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("PATCH /api/indents/:id error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update indent",
        error: error.message,
      });
    }
  }
);

// ====================================================
// DELETE ONE INDENT
// ====================================================
router.delete(
  "/:id",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const db = getDatabase(req);

    const { id } = req.params;

    const result = await db.query(
      `
      DELETE FROM indents
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Indent not found",
      });
    }

    res.json({
      success: true,
      message: "Indent deleted successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("DELETE /api/indents/:id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete indent",
      error: error.message,
    });
  }
});

// ====================================================
// DELETE ALL INDENTS
// ====================================================
router.delete(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const db = getDatabase(req);

    await db.query("DELETE FROM indents");

    res.json({
      success: true,
      message: "All indents deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/indents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete all indents",
      error: error.message,
    });
  }
});

module.exports = router;