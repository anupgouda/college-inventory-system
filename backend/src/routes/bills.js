const express = require("express");
const router = express.Router();

const pool = require("../db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authenticateToken);


// ======================================================
// GET ALL BILLS
// GET /api/bills
// ======================================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.id,
        b.bill_number AS "billNumber",
        b.vendor_id AS "vendorId",
        v.vendor_name AS "vendorName",
        b.purchase_order_id AS "purchaseOrderId",
        b.bill_date AS "billDate",
        b.due_date AS "dueDate",
        b.item_name AS "itemName",
        b.quantity,
        b.unit_price AS "unitPrice",
        b.total_amount AS "totalAmount",
        b.status,
        b.notes,
        b.created_at AS "createdAt"
      FROM bills b
      JOIN vendors v
        ON b.vendor_id = v.id
      ORDER BY b.id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("GET /api/bills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
    });
  }
});


// ======================================================
// CREATE BILL
// POST /api/bills
// ======================================================

router.post(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const {
      billNumber,
      vendorId,
      purchaseOrderId,
      billDate,
      dueDate,
      itemName,
      quantity,
      unitPrice,
      status = "Pending",
      notes,
    } = req.body;

    if (
      !billNumber ||
      !vendorId ||
      !itemName ||
      quantity === undefined ||
      unitPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bill number, vendor, item name, quantity and unit price are required",
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
      "Pending",
      "Approved",
      "Paid",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill status",
      });
    }

    // Check vendor
    const vendorCheck = await pool.query(
      `SELECT id FROM vendors WHERE id = $1`,
      [vendorId]
    );

    if (vendorCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Check purchase order if provided
    if (purchaseOrderId) {
      const poCheck = await pool.query(
        `SELECT id FROM purchase_orders WHERE id = $1`,
        [purchaseOrderId]
      );

      if (poCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO bills
      (
        bill_number,
        vendor_id,
        purchase_order_id,
        bill_date,
        due_date,
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
        $3,
        COALESCE($4::date, CURRENT_DATE),
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING
        id,
        bill_number AS "billNumber",
        vendor_id AS "vendorId",
        purchase_order_id AS "purchaseOrderId",
        bill_date AS "billDate",
        due_date AS "dueDate",
        item_name AS "itemName",
        quantity,
        unit_price AS "unitPrice",
        total_amount AS "totalAmount",
        status,
        notes,
        created_at AS "createdAt"
      `,
      [
        billNumber.trim(),
        vendorId,
        purchaseOrderId || null,
        billDate || null,
        dueDate || null,
        itemName.trim(),
        Number(quantity),
        Number(unitPrice),
        status,
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("POST /api/bills error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Bill number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create bill",
    });
  }
});


// ======================================================
// UPDATE BILL
// PATCH /api/bills/:id
// ======================================================

router.patch(
  "/:id",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const { id } = req.params;

    const {
      billNumber,
      vendorId,
      purchaseOrderId,
      billDate,
      dueDate,
      itemName,
      quantity,
      unitPrice,
      status,
      notes,
    } = req.body;

    // --------------------------------------------------
// STATUS-ONLY UPDATE
// Used by Approve / Reject / Pay / Cancel
// --------------------------------------------------

if (
  status !== undefined &&
  billNumber === undefined &&
  vendorId === undefined &&
  itemName === undefined &&
  quantity === undefined &&
  unitPrice === undefined
) {
  const allowedStatuses = [
    "Pending",
    "Approved",
    "Paid",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bill status",
    });
  }

  const result = await pool.query(
    `
    UPDATE bills
    SET status = $1
    WHERE id = $2
    RETURNING
      id,
      bill_number AS "billNumber",
      vendor_id AS "vendorId",
      purchase_order_id AS "purchaseOrderId",
      bill_date AS "billDate",
      due_date AS "dueDate",
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
      message: "Bill not found",
    });
  }

  return res.json(result.rows[0]);
}

    if (
      !billNumber ||
      !vendorId ||
      !itemName ||
      quantity === undefined ||
      unitPrice === undefined ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bill number, vendor, item name, quantity, unit price and status are required",
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
      "Pending",
      "Approved",
      "Paid",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill status",
      });
    }

    const result = await pool.query(
      `
      UPDATE bills
      SET
        bill_number = $1,
        vendor_id = $2,
        purchase_order_id = $3,
        bill_date = COALESCE($4::date, bill_date),
        due_date = $5,
        item_name = $6,
        quantity = $7,
        unit_price = $8,
        status = $9,
        notes = $10
      WHERE id = $11
      RETURNING
        id,
        bill_number AS "billNumber",
        vendor_id AS "vendorId",
        purchase_order_id AS "purchaseOrderId",
        bill_date AS "billDate",
        due_date AS "dueDate",
        item_name AS "itemName",
        quantity,
        unit_price AS "unitPrice",
        total_amount AS "totalAmount",
        status,
        notes,
        created_at AS "createdAt"
      `,
      [
        billNumber.trim(),
        vendorId,
        purchaseOrderId || null,
        billDate || null,
        dueDate || null,
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
        message: "Bill not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("PATCH /api/bills/:id error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Bill number already exists",
      });
    }

    if (error.code === "23503") {
      return res.status(404).json({
        success: false,
        message: "Vendor or purchase order not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update bill",
    });
  }
});


// ======================================================
// DELETE BILL
// DELETE /api/bills/:id
// ======================================================

router.delete(
  "/:id",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM bills
      WHERE id = $1
      RETURNING
        id,
        bill_number AS "billNumber",
        vendor_id AS "vendorId",
        purchase_order_id AS "purchaseOrderId",
        item_name AS "itemName",
        quantity,
        unit_price AS "unitPrice",
        total_amount AS "totalAmount",
        status
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.json({
      success: true,
      message: "Bill deleted successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("DELETE /api/bills/:id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete bill",
    });
  }
});


// ======================================================
// DELETE ALL BILLS
// DELETE /api/bills
// ======================================================

router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM bills");

    res.json({
      success: true,
      message: "All bills deleted successfully",
    });

  } catch (error) {
    console.error("DELETE /api/bills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete all bills",
    });
  }
});


// ======================================================
// EXPORT
// ======================================================

module.exports = router;