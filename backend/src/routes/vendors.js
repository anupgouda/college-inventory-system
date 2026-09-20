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
    "VENDOR REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ======================================================
// GET ALL VENDORS
// GET /api/vendors
// ======================================================

router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        id,
        vendor_code AS "vendorCode",
        vendor_name AS "vendorName",
        contact_person AS "contactPerson",
        email,
        phone,
        gst_number AS "gstNumber",
        address,
        created_at AS "createdAt"
      FROM vendors
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("GET /api/vendors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
    });
  }
});

// ======================================================
// CREATE VENDOR
// POST /api/vendors
// ======================================================

router.post(
  "/",
  authorizeRoles("Admin", "Store Manager"),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const {
        vendorCode,
        vendorName,
        contactPerson,
        email,
        phone,
        gstNumber,
        address,
      } = req.body;

      if (!vendorCode || !vendorName) {
        return res.status(400).json({
          success: false,
          message: "Vendor code and vendor name are required",
        });
      }

      const result = await db.query(
        `
        INSERT INTO vendors
        (
          vendor_code,
          vendor_name,
          contact_person,
          email,
          phone,
          gst_number,
          address
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING
          id,
          vendor_code AS "vendorCode",
          vendor_name AS "vendorName",
          contact_person AS "contactPerson",
          email,
          phone,
          gst_number AS "gstNumber",
          address,
          created_at AS "createdAt"
        `,
        [
          vendorCode.trim(),
          vendorName.trim(),
          contactPerson || null,
          email || null,
          phone || null,
          gstNumber || null,
          address || null,
        ]
      );

      res.status(201).json(result.rows[0]);

    } catch (error) {
      console.error("POST /api/vendors error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Vendor code already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create vendor",
      });
    }
  }
);

// ======================================================
// UPDATE VENDOR
// PATCH /api/vendors/:id
// ======================================================

router.patch("/:id", async (req, res) => {
  try {
    const db = getDatabase(req);

    const { id } = req.params;

    const {
      vendorCode,
      vendorName,
      contactPerson,
      email,
      phone,
      gstNumber,
      address,
    } = req.body;

    if (!vendorCode || !vendorName) {
      return res.status(400).json({
        success: false,
        message: "Vendor code and vendor name are required",
      });
    }

    const result = await db.query(
      `
      UPDATE vendors
      SET
        vendor_code = $1,
        vendor_name = $2,
        contact_person = $3,
        email = $4,
        phone = $5,
        gst_number = $6,
        address = $7
      WHERE id = $8
      RETURNING
        id,
        vendor_code AS "vendorCode",
        vendor_name AS "vendorName",
        contact_person AS "contactPerson",
        email,
        phone,
        gst_number AS "gstNumber",
        address,
        created_at AS "createdAt"
      `,
      [
        vendorCode.trim(),
        vendorName.trim(),
        contactPerson || null,
        email || null,
        phone || null,
        gstNumber || null,
        address || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("PATCH /api/vendors/:id error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Vendor code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update vendor",
    });
  }
});

// ======================================================
// DELETE VENDOR
// DELETE /api/vendors/:id
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
        DELETE FROM vendors
        WHERE id = $1
        RETURNING
          id,
          vendor_code AS "vendorCode",
          vendor_name AS "vendorName"
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      res.json({
        success: true,
        message: "Vendor deleted successfully",
        data: result.rows[0],
      });

    } catch (error) {
      console.error("DELETE /api/vendors/:id error:", error);

      if (error.code === "23503") {
        return res.status(409).json({
          success: false,
          message:
            "Vendor cannot be deleted because it is being used by another record",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete vendor",
      });
    }
  }
);

// ======================================================
// DELETE ALL VENDORS
// DELETE /api/vendors
// ======================================================

router.delete("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    await db.query("DELETE FROM vendors");

    res.json({
      success: true,
      message: "All vendors deleted successfully",
    });

  } catch (error) {
    console.error("DELETE /api/vendors error:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message:
          "Vendors cannot be deleted because they are referenced by other records",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete all vendors",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;