const express = require("express");
const router = express.Router();

const pool = require("../db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ======================================================
// AUTHENTICATION
// All indent routes require a valid JWT token
// ======================================================

router.use(authenticateToken);


// ======================================================
// GET ALL INDENTS
// GET /api/indents
// ======================================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
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
    });
  }
});


// ======================================================
// CREATE INDENT
// POST /api/indents
// ======================================================

router.post("/", async (req, res) => {
  try {
    const {
      date,
      branch,
      description,
      qty,
      status = "Pending",
    } = req.body;

    // Validation
    if (!branch || !description || !qty) {
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

    const result = await pool.query(
      `
      INSERT INTO indents
        (
          date,
          branch,
          description,
          qty,
          status
        )
      VALUES
        (
          COALESCE($1::date, CURRENT_DATE),
          $2,
          $3,
          $4,
          $5
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
        date || null,
        branch,
        description,
        Number(qty),
        status,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("POST /api/indents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create indent",
    });
  }
});


// ======================================================
// UPDATE INDENT
// PATCH /api/indents/:id
// ======================================================

router.patch(
  "/:id",
  authorizeRoles("Admin", "HOD"),
  async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const result = await pool.query(
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
      [
        status,
        id,
      ]
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
    });
  }
});


// ======================================================
// DELETE SINGLE INDENT
// DELETE /api/indents/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM indents
      WHERE id = $1
      RETURNING
        id,
        date,
        branch,
        description,
        qty,
        status,
        created_at
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
      data: result.rows[0],
    });

  } catch (error) {
    console.error("DELETE /api/indents/:id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete indent",
    });
  }
});


// ======================================================
// DELETE ALL INDENTS
// DELETE /api/indents
// ======================================================

router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM indents");

    res.json({
      success: true,
      message: "All indents deleted successfully",
    });

  } catch (error) {
    console.error("DELETE /api/indents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete all indents",
    });
  }
});


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;