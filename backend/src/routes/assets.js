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
// Demo user   -> demo.assets
// Normal user -> public.assets
// ======================================================

function getDatabase(req) {
  const isDemo = req.user?.isDemo === true;

  console.log(
    "ASSET REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ======================================================
// GET ALL ASSETS
// GET /api/assets
// ======================================================

router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        id,
        asset_code AS "assetCode",
        asset_name AS "assetName",
        category,
        department,
        location,
        quantity,
        assigned_to AS "assignedTo",
        purchase_date AS "purchaseDate",
        purchase_price AS "purchasePrice",
        condition,
        status,
        description,
        created_at AS "createdAt"
      FROM assets
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/assets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch assets",
    });
  }
});

// ======================================================
// GET SINGLE ASSET
// GET /api/assets/:id
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const db = getDatabase(req);

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        id,
        asset_code AS "assetCode",
        asset_name AS "assetName",
        category,
        department,
        location,
        quantity,
        assigned_to AS "assignedTo",
        purchase_date AS "purchaseDate",
        purchase_price AS "purchasePrice",
        condition,
        status,
        description,
        created_at AS "createdAt"
      FROM assets
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/assets/:id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch asset",
    });
  }
});

// ======================================================
// CREATE ASSET
// POST /api/assets
// ======================================================

router.post(
  "/",
  authorizeRoles(
  "Admin",
  "HOD",
  "IT",
  "Store Manager"
),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const {
        assetCode,
        assetName,
        category,
        department,
        location,
        quantity = 1,
        assignedTo,
        purchaseDate,
        purchasePrice,
        condition = "Good",
        status = "Available",
        description,
      } = req.body;

      if (
        !assetCode ||
        !assetName ||
        !category ||
        !department
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Asset code, asset name, category and department are required",
        });
      }

      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      if (
        purchasePrice !== undefined &&
        purchasePrice !== null &&
        Number(purchasePrice) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Purchase price cannot be negative",
        });
      }

      const allowedConditions = [
        "New",
        "Good",
        "Fair",
        "Damaged",
      ];

      if (!allowedConditions.includes(condition)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset condition",
        });
      }

      const allowedStatuses = [
        "Available",
        "Assigned",
        "Under Maintenance",
        "Disposed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset status",
        });
      }

      const result = await db.query(
        `
        INSERT INTO assets
        (
          asset_code,
          asset_name,
          category,
          department,
          location,
          quantity,
          assigned_to,
          purchase_date,
          purchase_price,
          condition,
          status,
          description
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12
        )
        RETURNING
          id,
          asset_code AS "assetCode",
          asset_name AS "assetName",
          category,
          department,
          location,
          quantity,
          assigned_to AS "assignedTo",
          purchase_date AS "purchaseDate",
          purchase_price AS "purchasePrice",
          condition,
          status,
          description,
          created_at AS "createdAt"
        `,
        [
          assetCode.trim(),
          assetName.trim(),
          category.trim(),
          department.trim(),
          location || null,
          Number(quantity),
          assignedTo || null,
          purchaseDate || null,
          purchasePrice ?? null,
          condition,
          status,
          description || null,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("POST /api/assets error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Asset code already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create asset",
      });
    }
  }
);

// ======================================================
// UPDATE ASSET
// PATCH /api/assets/:id
// ======================================================

router.patch(
  "/:id",
  authorizeRoles(
  "Admin",
  "HOD",
  "IT",
  "Store Manager"
),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;

      const {
        assetCode,
        assetName,
        category,
        department,
        location,
        quantity,
        assignedTo,
        purchaseDate,
        purchasePrice,
        condition,
        status,
        description,
      } = req.body;

      if (
        !assetCode ||
        !assetName ||
        !category ||
        !department ||
        quantity === undefined ||
        !condition ||
        !status
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Asset code, asset name, category, department, quantity, condition and status are required",
        });
      }

      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      if (
        purchasePrice !== undefined &&
        purchasePrice !== null &&
        Number(purchasePrice) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Purchase price cannot be negative",
        });
      }

      const allowedConditions = [
        "New",
        "Good",
        "Fair",
        "Damaged",
      ];

      if (!allowedConditions.includes(condition)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset condition",
        });
      }

      const allowedStatuses = [
        "Available",
        "Assigned",
        "Under Maintenance",
        "Disposed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset status",
        });
      }

      const result = await db.query(
        `
        UPDATE assets
        SET
          asset_code = $1,
          asset_name = $2,
          category = $3,
          department = $4,
          location = $5,
          quantity = $6,
          assigned_to = $7,
          purchase_date = $8,
          purchase_price = $9,
          condition = $10,
          status = $11,
          description = $12
        WHERE id = $13
        RETURNING
          id,
          asset_code AS "assetCode",
          asset_name AS "assetName",
          category,
          department,
          location,
          quantity,
          assigned_to AS "assignedTo",
          purchase_date AS "purchaseDate",
          purchase_price AS "purchasePrice",
          condition,
          status,
          description,
          created_at AS "createdAt"
        `,
        [
          assetCode.trim(),
          assetName.trim(),
          category.trim(),
          department.trim(),
          location || null,
          Number(quantity),
          assignedTo || null,
          purchaseDate || null,
          purchasePrice ?? null,
          condition,
          status,
          description || null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Asset not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("PATCH /api/assets/:id error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Asset code already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update asset",
      });
    }
  }
);

// ======================================================
// DELETE ASSET
// DELETE /api/assets/:id
// ======================================================

router.delete(
  "/:id",
  authorizeRoles(
  "Admin",
  "IT",
  "Store Manager"
),
  async (req, res) => {
    try {
      const db = getDatabase(req);

      const { id } = req.params;

      const result = await db.query(
        `
        DELETE FROM assets
        WHERE id = $1
        RETURNING
          id,
          asset_code AS "assetCode",
          asset_name AS "assetName"
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Asset not found",
        });
      }

      res.json({
        success: true,
        message: "Asset deleted successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("DELETE /api/assets/:id error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete asset",
      });
    }
  }
);

// ======================================================
// DELETE ALL ASSETS
// DELETE /api/assets
// ======================================================

router.delete(
  "/",
  authorizeRoles(
    "Admin",
    "IT",
    "Store Manager"
  ),
  async (req, res) => {
  try {
    const db = getDatabase(req);

    await db.query("DELETE FROM assets");

    res.json({
      success: true,
      message: "All assets deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/assets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete all assets",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;