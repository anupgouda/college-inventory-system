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
// ======================================================

function getDatabase(req) {
  const isDemo = req.user?.isDemo === true;

  console.log(
    "PURCHASE ORDER REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ======================================================
// GET ALL PURCHASE ORDERS
// GET /api/purchase-orders
// ======================================================

router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        po.id,
        po.po_number AS "poNumber",
        po.vendor_id AS "vendorId",
        v.vendor_name AS "vendorName",
        po.order_date AS "orderDate",
        po.expected_delivery_date AS "expectedDeliveryDate",
        po.item_name AS "itemName",
        po.quantity,
        po.unit_price AS "unitPrice",
        po.total_amount AS "totalAmount",
        po.status,
        po.notes,
        po.created_at AS "createdAt"
      FROM purchase_orders po
      JOIN vendors v
        ON po.vendor_id = v.id
      ORDER BY po.id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("GET /api/purchase-orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
    });
  }
});

// ======================================================
// CREATE PURCHASE ORDER
// POST /api/purchase-orders
// ======================================================

router.post(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const {
        poNumber,
        vendorId,
        orderDate,
        expectedDeliveryDate,
        itemName,
        quantity,
        unitPrice,
        status = "Open",
        notes,
      } = req.body;

      // Validation
      if (
        !poNumber ||
        !vendorId ||
        !itemName ||
        quantity === undefined ||
        unitPrice === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "PO number, vendor, item name, quantity and unit price are required",
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

      const allowedStatuses = [
        "Open",
        "Approved",
        "Received",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid purchase order status",
        });
      }

      // Check vendor in the same PUBLIC/DEMO database
      const vendorCheck = await db.query(
        `SELECT id FROM vendors WHERE id = $1`,
        [vendorId]
      );

      if (vendorCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      const result = await db.query(
        `
        INSERT INTO purchase_orders
        (
          po_number,
          vendor_id,
          order_date,
          expected_delivery_date,
          item_name,
          quantity,
          unit_price,
          status,
          notes
        )
        VALUES
        (
          $1,
          $2,
          COALESCE($3::date, CURRENT_DATE),
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )
        RETURNING
          id,
          po_number AS "poNumber",
          vendor_id AS "vendorId",
          order_date AS "orderDate",
          expected_delivery_date AS "expectedDeliveryDate",
          item_name AS "itemName",
          quantity,
          unit_price AS "unitPrice",
          total_amount AS "totalAmount",
          status,
          notes,
          created_at AS "createdAt"
        `,
        [
          poNumber.trim(),
          vendorId,
          orderDate || null,
          expectedDeliveryDate || null,
          itemName.trim(),
          Number(quantity),
          Number(unitPrice),
          status,
          notes || null,
        ]
      );

      res.status(201).json(result.rows[0]);

    } catch (error) {
      console.error("POST /api/purchase-orders error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Purchase order number already exists",
        });
      }

      if (error.code === "23503") {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create purchase order",
      });
    }
  }
);

// ======================================================
// UPDATE PURCHASE ORDER
// PATCH /api/purchase-orders/:id
// ======================================================

router.patch(
  "/:id",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;

      const {
        poNumber,
        vendorId,
        orderDate,
        expectedDeliveryDate,
        itemName,
        quantity,
        unitPrice,
        status,
        notes,
      } = req.body;

      // --------------------------------------------------
      // STATUS-ONLY UPDATE
      // Used by Approve / Receive / Cancel
      // --------------------------------------------------

      if (
        status !== undefined &&
        poNumber === undefined &&
        vendorId === undefined &&
        itemName === undefined &&
        quantity === undefined &&
        unitPrice === undefined
      ) {
        const allowedStatuses = [
          "Open",
          "Approved",
          "Received",
          "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid purchase order status",
          });
        }

        const result = await db.query(
          `
          UPDATE purchase_orders
          SET status = $1
          WHERE id = $2
          RETURNING
            id,
            po_number AS "poNumber",
            vendor_id AS "vendorId",
            order_date AS "orderDate",
            expected_delivery_date AS "expectedDeliveryDate",
            item_name AS "itemName",
            quantity,
            unit_price AS "unitPrice",
            total_amount AS "totalAmount",
            status,
            notes,
            created_at AS "createdAt"
          `,
          [status, id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Purchase order not found",
          });
        }

        return res.json(result.rows[0]);
      }

      // --------------------------------------------------
      // FULL PURCHASE ORDER UPDATE
      // Used when editing PO details
      // --------------------------------------------------

      if (
        !poNumber ||
        !vendorId ||
        !itemName ||
        quantity === undefined ||
        unitPrice === undefined ||
        !status
      ) {
        return res.status(400).json({
          success: false,
          message:
            "PO number, vendor, item name, quantity, unit price and status are required",
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

      const allowedStatuses = [
        "Open",
        "Approved",
        "Received",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid purchase order status",
        });
      }

      // Make sure vendor belongs to the same PUBLIC/DEMO database
      const vendorCheck = await db.query(
        `SELECT id FROM vendors WHERE id = $1`,
        [vendorId]
      );

      if (vendorCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      const result = await db.query(
        `
        UPDATE purchase_orders
        SET
          po_number = $1,
          vendor_id = $2,
          order_date = COALESCE($3::date, order_date),
          expected_delivery_date = $4,
          item_name = $5,
          quantity = $6,
          unit_price = $7,
          status = $8,
          notes = $9
        WHERE id = $10
        RETURNING
          id,
          po_number AS "poNumber",
          vendor_id AS "vendorId",
          order_date AS "orderDate",
          expected_delivery_date AS "expectedDeliveryDate",
          item_name AS "itemName",
          quantity,
          unit_price AS "unitPrice",
          total_amount AS "totalAmount",
          status,
          notes,
          created_at AS "createdAt"
        `,
        [
          poNumber.trim(),
          vendorId,
          orderDate || null,
          expectedDeliveryDate || null,
          itemName.trim(),
          Number(quantity),
          Number(unitPrice),
          status,
          notes || null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      res.json(result.rows[0]);

    } catch (error) {
      console.error(
        "PATCH /api/purchase-orders/:id error:",
        error
      );

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Purchase order number already exists",
        });
      }

      if (error.code === "23503") {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update purchase order",
      });
    }
  }
);

// ======================================================
// DELETE ALL PURCHASE ORDERS
// DELETE /api/purchase-orders
// ======================================================

router.delete(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const db = getDatabase(req);

    await db.query("DELETE FROM purchase_orders");

    res.json({
      success: true,
      message: "All purchase orders deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE /api/purchase-orders error:",
      error
    );

    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message:
          "Purchase orders cannot be deleted because they are referenced by another record",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete all purchase orders",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;