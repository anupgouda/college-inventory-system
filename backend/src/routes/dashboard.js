const express = require("express");
const router = express.Router();

const pool = require("../db");
const demoPool = pool.demoPool;

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

// ======================================================
// AUTHENTICATION
// All dashboard routes require a valid JWT
// ======================================================

router.use(authenticateToken);

// ======================================================
// DATABASE SELECTION
// Admin/normal users → public schema
// Demo user → demo schema
// ======================================================

function getDatabase(req) {
  return req.user?.isDemo === true ? demoPool : pool;
}

// ======================================================
// DASHBOARD SUMMARY
// GET /api/dashboard
// ======================================================

router.get("/", async (req, res) => {
  try {
    const db = getDatabase(req);

    const pendingApprovalsResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM indents
      WHERE status = 'Pending'
    `);

    const lowStockResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM stock
      WHERE quantity <= 10
    `);

    const openPurchaseOrdersResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM purchase_orders
      WHERE status = 'Open'
    `);

    const totalAssetsResult = await db.query(`
      SELECT COALESCE(SUM(quantity), 0) AS count
      FROM assets
    `);

    const totalVendorsResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM vendors
    `);

    const totalStockResult = await db.query(`
      SELECT COALESCE(SUM(quantity), 0) AS count
      FROM stock
    `);

    res.json({
      success: true,
      data: {
        pendingApprovals: Number(
          pendingApprovalsResult.rows[0].count
        ),

        lowStockItems: Number(
          lowStockResult.rows[0].count
        ),

        openPurchaseOrders: Number(
          openPurchaseOrdersResult.rows[0].count
        ),

        totalAssets: Number(
          totalAssetsResult.rows[0].count
        ),

        totalVendors: Number(
          totalVendorsResult.rows[0].count
        ),

        totalStock: Number(
          totalStockResult.rows[0].count
        ),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
});

// ======================================================
// PENDING APPROVALS
// GET /api/dashboard/pending-approvals
// ======================================================

router.get("/pending-approvals", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        id,
        date,
        branch,
        description,
        qty,
        status
      FROM indents
      WHERE status = 'Pending'
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Pending approvals error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending approvals",
    });
  }
});

// ======================================================
// OPEN PURCHASE ORDERS
// GET /api/dashboard/open-purchase-orders
// ======================================================

router.get("/open-purchase-orders", async (req, res) => {
  try {
    const db = getDatabase(req);

    const result = await db.query(`
      SELECT
        po.id,
        po.po_number,
        po.order_date,
        po.expected_delivery_date,
        po.item_name,
        po.quantity,
        po.unit_price,
        po.total_amount,
        po.status,
        po.notes,
        v.vendor_code,
        v.vendor_name
      FROM purchase_orders po
      JOIN vendors v
        ON po.vendor_id = v.id
      WHERE po.status = 'Open'
      ORDER BY po.id DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Open purchase orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch open purchase orders",
    });
  }
});

// ======================================================
// LOW STOCK
// GET /api/dashboard/low-stock
// ======================================================

router.get("/low-stock", async (req, res) => {
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
        purchase_order AS "purchaseOrder"
      FROM stock
      WHERE quantity <= 10
      ORDER BY quantity ASC, id DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Low stock error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock items",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;