const express = require("express");
const router = express.Router();

const pool = require("../db");
const demoPool = pool.demoPool;

const {
  authenticateToken,
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
    "REPORT REQUEST:",
    "userId =", req.user?.userId,
    "role =", req.user?.role,
    "isDemo =", req.user?.isDemo,
    "database =", isDemo ? "DEMO" : "PUBLIC"
  );

  return isDemo ? demoPool : pool;
}

// ======================================================
// GENERATE REPORT
// GET /api/reports
// ======================================================

router.get("/", async (req, res) => {
  try {
    const {
      type,
      startDate,
      endDate,
    } = req.query;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Report type, start date and end date are required",
      });
    }

    // --------------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------------

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be later than end date",
      });
    }

    let query = "";
    const values = [startDate, endDate];

    // ==================================================
    // INDENT MASTER / INDENT APPROVAL
    // ==================================================

    switch (type) {
      case "indentMaster":
      case "indentApproval":

        query = `
          SELECT
            id,
            date,
            branch,
            description,
            qty,
            status,
            created_at AS "createdAt"
          FROM indents
          WHERE date BETWEEN $1::date AND $2::date
          ORDER BY id DESC
        `;

        break;

      // ==================================================
      // STOCK ENTRY
      // ==================================================

      case "stockEntry":

        query = `
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
          WHERE entry_date BETWEEN $1::date AND $2::date
          ORDER BY id DESC
        `;

        break;

      // ==================================================
      // MATERIAL CHECKOUT
      // ==================================================

      case "materialCheckout":

        query = `
          SELECT
            id,
            item_name AS "itemName",
            department,
            quantity,
            checkout_date AS "checkoutDate",
            expected_return_date AS "expectedReturnDate",
            purpose,
            status
          FROM checkouts
          WHERE checkout_date BETWEEN $1::date AND $2::date
          ORDER BY id DESC
        `;

        break;

      // ==================================================
      // ASSETS
      // ==================================================

      case "assets":

        query = `
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
            description
          FROM assets
          WHERE purchase_date BETWEEN $1::date AND $2::date
          ORDER BY id DESC
        `;

        break;

      // ==================================================
      // VENDORS
      // ==================================================

      case "vendors":

        query = `
          SELECT
            id,
            vendor_code AS "vendorCode",
            vendor_name AS "vendorName",
            contact_person AS "contactPerson",
            email,
            phone,
            gst_number AS "gstNumber",
            address
          FROM vendors
          WHERE created_at::date
            BETWEEN $1::date AND $2::date
          ORDER BY id DESC
        `;

        break;

      // ==================================================
      // PURCHASE ORDERS
      // ==================================================

      case "purchaseOrders":

        query = `
          SELECT
            po.id,
            po.po_number AS "poNumber",
            po.order_date AS "orderDate",
            po.expected_delivery_date AS "expectedDeliveryDate",
            v.vendor_code AS "vendorCode",
            v.vendor_name AS "vendorName",
            po.item_name AS "itemName",
            po.quantity,
            po.unit_price AS "unitPrice",
            po.total_amount AS "totalAmount",
            po.status,
            po.notes
          FROM purchase_orders po
          JOIN vendors v
            ON po.vendor_id = v.id
          WHERE po.order_date
            BETWEEN $1::date AND $2::date
          ORDER BY po.id DESC
        `;

        break;

      // ==================================================
      // QUOTATIONS
      // ==================================================

      case "quotations":

        query = `
          SELECT
            q.id,
            q.quotation_number AS "quotationNumber",
            q.quotation_date AS "quotationDate",
            q.item_name AS "itemName",
            q.quantity,
            q.unit_price AS "unitPrice",
            q.total_amount AS "totalAmount",
            q.valid_until AS "validUntil",
            q.status,
            q.notes,
            v.vendor_code AS "vendorCode",
            v.vendor_name AS "vendorName"
          FROM quotations q
          JOIN vendors v
            ON q.vendor_id = v.id
          WHERE q.quotation_date
            BETWEEN $1::date AND $2::date
          ORDER BY q.id DESC
        `;

        break;

      // ==================================================
      // BILLS
      // ==================================================

      case "bills":

        query = `
          SELECT
            b.id,
            b.bill_number AS "billNumber",
            b.bill_date AS "billDate",
            b.due_date AS "dueDate",
            b.item_name AS "itemName",
            b.quantity,
            b.unit_price AS "unitPrice",
            b.total_amount AS "totalAmount",
            b.status,
            b.notes,
            v.vendor_code AS "vendorCode",
            v.vendor_name AS "vendorName",
            po.po_number AS "poNumber"
          FROM bills b
          JOIN vendors v
            ON b.vendor_id = v.id
          LEFT JOIN purchase_orders po
            ON b.purchase_order_id = po.id
          WHERE b.bill_date
            BETWEEN $1::date AND $2::date
          ORDER BY b.id DESC
        `;

        break;

      // ==================================================
      // INVALID REPORT TYPE
      // ==================================================

      default:

        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
    }

    // ==================================================
    // EXECUTE QUERY
    // ==================================================

    const db = getDatabase(req);

    const result = await db.query(
      query,
      values
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({
      success: true,
      type,
      startDate,
      endDate,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {

    console.error(
      "Generate report error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate report",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;