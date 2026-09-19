const express = require("express");
const router = express.Router();

const pool = require("../db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ======================================================
// AUTHENTICATION
// All stock routes require a valid JWT
// ======================================================

router.use(authenticateToken);


// ======================================================
// GET ALL STOCK
// GET /api/stock
// ======================================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
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
// ======================================================

router.post(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
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

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    if (Number(unitPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Unit price cannot be negative",
      });
    }

    const result = await pool.query(
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
});


// ======================================================
// DELETE SINGLE STOCK
// DELETE /api/stock/:id
// ======================================================

router.delete(
  "/:id",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
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
    console.error("DELETE /api/stock/:id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete stock item",
    });
  }
});


// ======================================================
// DELETE ALL STOCK
// DELETE /api/stock
// ======================================================

router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM stock");

    res.json({
      success: true,
      message: "All stock deleted successfully",
    });

  } catch (error) {
    console.error("DELETE /api/stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete all stock",
    });
  }
});


// ======================================================
// EXPORT
// ======================================================

module.exports = router;