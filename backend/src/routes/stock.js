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
// Demo user      -> demo.stock
// Normal user    -> public.stock
// ======================================================

function getDatabase(req) {
  const isDemo = req.user?.isDemo === true;

  console.log(
    "STOCK REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ======================================================
// GET ALL STOCK
// GET /api/stock
//
// All authenticated users can view stock.
// ======================================================

router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        id,
        item_name AS "itemName",
        category,
        quantity,
        unit_price AS "unitPrice",
        total_price AS "totalPrice",
        storage_location AS "storageLocation",
        entry_date AS "entryDate",
        invoice_number AS "invoiceNumber",
        purchase_order AS "purchaseOrder",
        created_at AS "createdAt"
      FROM stock
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock",
    });
  }
});

// ======================================================
// ADD STOCK
// POST /api/stock
//
// Allowed:
// Admin
// IT
// Store Manager
// ======================================================

router.post(
  "/",
  authorizeRoles(
    "Admin",
    "IT",
    "Store Manager"
  ),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const {
        itemName,
        category,
        quantity,
        unitPrice,
        storageLocation,
        entryDate,
        invoiceNumber,
        purchaseOrder,
      } = req.body;

      // ----------------------------------------------
      // Required field validation
      // ----------------------------------------------

      if (
        !itemName ||
        quantity === undefined ||
        unitPrice === undefined ||
        !storageLocation
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Item name, quantity, unit price and storage location are required",
        });
      }

      // ----------------------------------------------
      // Quantity validation
      // ----------------------------------------------

      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      // ----------------------------------------------
      // Unit price validation
      // ----------------------------------------------

      if (Number(unitPrice) < 0) {
        return res.status(400).json({
          success: false,
          message: "Unit price cannot be negative",
        });
      }

      // ----------------------------------------------
      // Insert stock
      // ----------------------------------------------

      const result = await db.query(
        `
        INSERT INTO stock
        (
          item_name,
          category,
          quantity,
          unit_price,
          storage_location,
          entry_date,
          invoice_number,
          purchase_order
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          COALESCE($6::date, CURRENT_DATE),
          $7,
          $8
        )
        RETURNING
          id,
          item_name AS "itemName",
          category,
          quantity,
          unit_price AS "unitPrice",
          total_price AS "totalPrice",
          storage_location AS "storageLocation",
          entry_date AS "entryDate",
          invoice_number AS "invoiceNumber",
          purchase_order AS "purchaseOrder",
          created_at AS "createdAt"
        `,
        [
          itemName,
          category || null,
          Number(quantity),
          Number(unitPrice),
          storageLocation,
          entryDate || null,
          invoiceNumber || null,
          purchaseOrder || null,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("POST /api/stock error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to add stock",
      });
    }
  }
);

// ======================================================
// DELETE SINGLE STOCK
// DELETE /api/stock/:id
//
// Allowed:
// Admin
// Store Manager
//
// IT cannot delete stock.
// ======================================================

router.delete(
  "/:id",
  authorizeRoles(
    "Admin",
    "Store Manager"
  ),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;

      const result = await db.query(
        `
        DELETE FROM stock
        WHERE id = $1
        RETURNING
          id,
          item_name AS "itemName",
          category,
          quantity,
          unit_price AS "unitPrice",
          total_price AS "totalPrice",
          storage_location AS "storageLocation",
          entry_date AS "entryDate",
          invoice_number AS "invoiceNumber",
          purchase_order AS "purchaseOrder"
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Stock item not found",
        });
      }

      res.json({
        success: true,
        message: "Stock item deleted successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "DELETE /api/stock/:id error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete stock item",
      });
    }
  }
);

// ======================================================
// DELETE ALL STOCK
// DELETE /api/stock
//
// Allowed:
// Admin
// Store Manager
//
// IT cannot delete all stock.
// ======================================================

router.delete(
  "/",
  authorizeRoles(
    "Admin",
    "Store Manager"
  ),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      await db.query("DELETE FROM stock");

      res.json({
        success: true,
        message: "All stock deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE /api/stock error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete all stock",
      });
    }
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;