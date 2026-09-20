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
    "QUOTATION REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ======================================================
// GET ALL QUOTATIONS
// GET /api/quotations
// ======================================================

router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        q.id,
        q.quotation_number AS "quotationNumber",
        q.vendor_id AS "vendorId",
        v.vendor_name AS "vendorName",
        q.quotation_date AS "quotationDate",
        q.item_name AS "itemName",
        q.quantity,
        q.unit_price AS "unitPrice",
        q.total_amount AS "totalAmount",
        q.valid_until AS "validUntil",
        q.status,
        q.notes,
        q.created_at AS "createdAt"
      FROM quotations q
      JOIN vendors v
        ON q.vendor_id = v.id
      ORDER BY q.id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("GET /api/quotations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
    });
  }
});

// ======================================================
// CREATE QUOTATION
// POST /api/quotations
// ======================================================

router.post(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const {
        quotationNumber,
        vendorId,
        quotationDate,
        itemName,
        quantity,
        unitPrice,
        validUntil,
        status = "Pending",
        notes,
      } = req.body;

      if (
        !quotationNumber ||
        !vendorId ||
        !itemName ||
        quantity === undefined ||
        unitPrice === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quotation number, vendor, item name, quantity and unit price are required",
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
        "Rejected",
        "Expired",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid quotation status",
        });
      }

      // Check vendor inside the same PUBLIC/DEMO database
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
        INSERT INTO quotations
        (
          quotation_number,
          vendor_id,
          quotation_date,
          item_name,
          quantity,
          unit_price,
          valid_until,
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
          quotation_number AS "quotationNumber",
          vendor_id AS "vendorId",
          quotation_date AS "quotationDate",
          item_name AS "itemName",
          quantity,
          unit_price AS "unitPrice",
          total_amount AS "totalAmount",
          valid_until AS "validUntil",
          status,
          notes,
          created_at AS "createdAt"
        `,
        [
          quotationNumber.trim(),
          vendorId,
          quotationDate || null,
          itemName.trim(),
          Number(quantity),
          Number(unitPrice),
          validUntil || null,
          status,
          notes || null,
        ]
      );

      res.status(201).json(result.rows[0]);

    } catch (error) {
      console.error("POST /api/quotations error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Quotation number already exists",
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
        message: "Failed to create quotation",
      });
    }
  }
);

// ======================================================
// UPDATE QUOTATION
// PATCH /api/quotations/:id
// ======================================================

router.patch(
  "/:id",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;

      const {
        quotationNumber,
        vendorId,
        quotationDate,
        itemName,
        quantity,
        unitPrice,
        validUntil,
        status,
        notes,
      } = req.body;

      // --------------------------------------------------
      // STATUS-ONLY UPDATE
      // Used by Approve / Reject
      // --------------------------------------------------

      if (
        status !== undefined &&
        quotationNumber === undefined &&
        vendorId === undefined &&
        itemName === undefined &&
        quantity === undefined &&
        unitPrice === undefined
      ) {
        const allowedStatuses = [
          "Pending",
          "Approved",
          "Rejected",
          "Expired",
        ];

        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid quotation status",
          });
        }

        const result = await db.query(
          `
          UPDATE quotations
          SET status = $1
          WHERE id = $2
          RETURNING
            id,
            quotation_number AS "quotationNumber",
            vendor_id AS "vendorId",
            quotation_date AS "quotationDate",
            item_name AS "itemName",
            quantity,
            unit_price AS "unitPrice",
            total_amount AS "totalAmount",
            valid_until AS "validUntil",
            status,
            notes,
            created_at AS "createdAt"
          `,
          [status, id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Quotation not found",
          });
        }

        return res.json(result.rows[0]);
      }

      // --------------------------------------------------
      // FULL UPDATE
      // --------------------------------------------------

      if (
        !quotationNumber ||
        !vendorId ||
        !itemName ||
        quantity === undefined ||
        unitPrice === undefined ||
        !status
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quotation number, vendor, item name, quantity, unit price and status are required",
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
        "Rejected",
        "Expired",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid quotation status",
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
        UPDATE quotations
        SET
          quotation_number = $1,
          vendor_id = $2,
          quotation_date = COALESCE($3::date, quotation_date),
          item_name = $4,
          quantity = $5,
          unit_price = $6,
          valid_until = $7,
          status = $8,
          notes = $9
        WHERE id = $10
        RETURNING
          id,
          quotation_number AS "quotationNumber",
          vendor_id AS "vendorId",
          quotation_date AS "quotationDate",
          item_name AS "itemName",
          quantity,
          unit_price AS "unitPrice",
          total_amount AS "totalAmount",
          valid_until AS "validUntil",
          status,
          notes,
          created_at AS "createdAt"
        `,
        [
          quotationNumber.trim(),
          vendorId,
          quotationDate || null,
          itemName.trim(),
          Number(quantity),
          Number(unitPrice),
          validUntil || null,
          status,
          notes || null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Quotation not found",
        });
      }

      res.json(result.rows[0]);

    } catch (error) {
      console.error("PATCH /api/quotations/:id error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Quotation number already exists",
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
        message: "Failed to update quotation",
      });
    }
  }
);

// ======================================================
// DELETE QUOTATION
// DELETE /api/quotations/:id
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
        DELETE FROM quotations
        WHERE id = $1
        RETURNING
          id,
          quotation_number AS "quotationNumber",
          vendor_id AS "vendorId",
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
          message: "Quotation not found",
        });
      }

      res.json({
        success: true,
        message: "Quotation deleted successfully",
        data: result.rows[0],
      });

    } catch (error) {
      console.error("DELETE /api/quotations/:id error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete quotation",
      });
    }
  }
);

// ======================================================
// DELETE ALL QUOTATIONS
// DELETE /api/quotations
// ======================================================

router.delete(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
  try {
    const db = getDatabase(req);

    await db.query("DELETE FROM quotations");

    res.json({
      success: true,
      message: "All quotations deleted successfully",
    });

  } catch (error) {
    console.error("DELETE /api/quotations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete all quotations",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;