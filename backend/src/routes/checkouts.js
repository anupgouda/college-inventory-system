const express = require("express");
const router = express.Router();

const pool = require("../db");
const demoPool = pool.demoPool;

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authenticateToken);

// ======================================================
// DATABASE SELECTOR
//
// Demo user   -> demo.checkouts
// Normal user -> public.checkouts
// ======================================================

function getDatabase(req) {
  const isDemo = req.user?.isDemo === true;

  console.log(
    "CHECKOUT REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ======================================================
// GET ALL CHECKOUTS
// GET /api/checkouts
// ======================================================

router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        id,
        item_name AS "itemName",
        department,
        quantity,
        checkout_date AS "checkoutDate",
        expected_return_date AS "expectedReturnDate",
        purpose,
        status,
        created_at AS "createdAt"
      FROM checkouts
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/checkouts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch checkouts",
    });
  }
});

// ======================================================
// CREATE CHECKOUT
// POST /api/checkouts
// ======================================================

router.post(
  "/",
  authorizeRoles(
    "Admin",
    "Faculty",
    "HOD",
    "IT",
    "Store Manager"
  ),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const {
        itemName,
        department,
        quantity,
        checkoutDate,
        expectedReturnDate,
        purpose,
        status = "Checked Out",
      } = req.body;

      if (
        !itemName ||
        !department ||
        quantity === undefined ||
        !expectedReturnDate ||
        !purpose
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Item name, department, quantity, expected return date and purpose are required",
        });
      }

      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      const allowedStatuses = [
        "Checked Out",
        "Returned",
        "Overdue",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid checkout status",
        });
      }

      const result = await db.query(
        `
        INSERT INTO checkouts
        (
          item_name,
          department,
          quantity,
          checkout_date,
          expected_return_date,
          purpose,
          status
        )
        VALUES
        (
          $1,
          $2,
          $3,
          COALESCE($4::date, CURRENT_DATE),
          $5,
          $6,
          $7
        )
        RETURNING
          id,
          item_name AS "itemName",
          department,
          quantity,
          checkout_date AS "checkoutDate",
          expected_return_date AS "expectedReturnDate",
          purpose,
          status,
          created_at AS "createdAt"
        `,
        [
          itemName,
          department,
          Number(quantity),
          checkoutDate || null,
          expectedReturnDate,
          purpose,
          status,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("POST /api/checkouts error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create checkout",
      });
    }
  }
);

// ======================================================
// UPDATE CHECKOUT STATUS
// PATCH /api/checkouts/:id
// ======================================================

router.patch(
  "/:id",
  authorizeRoles(
    "Admin",
    "Faculty",
    "HOD",
    "IT",
    "Store Manager"
  ),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Checked Out",
        "Returned",
        "Overdue",
      ];

      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid checkout status",
        });
      }

      const result = await db.query(
        `
        UPDATE checkouts
        SET status = $1
        WHERE id = $2
        RETURNING
          id,
          item_name AS "itemName",
          department,
          quantity,
          checkout_date AS "checkoutDate",
          expected_return_date AS "expectedReturnDate",
          purpose,
          status,
          created_at AS "createdAt"
        `,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Checkout record not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("PATCH /api/checkouts/:id error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update checkout",
      });
    }
  }
);

// ======================================================
// DELETE CHECKOUT
// DELETE /api/checkouts/:id
// ======================================================

router.delete(
  "/:id",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;

      const result = await db.query(
        `
        DELETE FROM checkouts
        WHERE id = $1
        RETURNING
          id,
          item_name AS "itemName",
          department,
          quantity,
          checkout_date AS "checkoutDate",
          expected_return_date AS "expectedReturnDate",
          purpose,
          status
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Checkout record not found",
        });
      }

      res.json({
        success: true,
        message: "Checkout deleted successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("DELETE /api/checkouts/:id error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete checkout",
      });
    }
  }
);

// ======================================================
// DELETE ALL CHECKOUTS
// DELETE /api/checkouts
// ======================================================

router.delete("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    await db.query("DELETE FROM checkouts");

    res.json({
      success: true,
      message: "All checkout records deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/checkouts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete all checkout records",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;