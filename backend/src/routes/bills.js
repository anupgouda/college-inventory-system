const express = require("express");
const router = express.Router();

const db = require("../db");

// ----------------------------------------------------
// GET ALL BILLS
// ----------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                b.id,
                b.bill_number AS "billNumber",
                b.vendor_id AS "vendorId",
                v.vendor_code AS "vendorCode",
                v.vendor_name AS "vendorName",
                b.purchase_order_id AS "purchaseOrderId",
                po.po_number AS "poNumber",
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
            LEFT JOIN purchase_orders po
                ON b.purchase_order_id = po.id
            ORDER BY b.id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Get bills error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bills"
        });
    }
});

// ----------------------------------------------------
// CREATE BILL
// ----------------------------------------------------

router.post("/", async (req, res) => {
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
            notes
        } = req.body;

        if (
            !billNumber ||
            !vendorId ||
            !itemName ||
            !quantity ||
            unitPrice === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Bill number, vendor, item name, quantity and unit price are required"
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        if (Number(unitPrice) < 0) {
            return res.status(400).json({
                success: false,
                message: "Unit price cannot be negative"
            });
        }

        // Check vendor exists
        const vendorCheck = await db.query(
            `SELECT id FROM vendors WHERE id = $1`,
            [vendorId]
        );

        if (vendorCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        // Check purchase order if provided
        if (purchaseOrderId) {
            const poCheck = await db.query(
                `SELECT id FROM purchase_orders WHERE id = $1`,
                [purchaseOrderId]
            );

            if (poCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Purchase order not found"
                });
            }
        }

        const result = await db.query(
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
                    notes
                )
            VALUES
                (
                    $1,
                    $2,
                    $3,
                    COALESCE($4::date, CURRENT_DATE),
                    $5::date,
                    $6,
                    $7,
                    $8,
                    $9
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
                billNumber,
                vendorId,
                purchaseOrderId || null,
                billDate || null,
                dueDate || null,
                itemName,
                quantity,
                unitPrice,
                notes || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Create bill error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Bill number already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create bill"
        });
    }
});

// ----------------------------------------------------
// UPDATE BILL STATUS
// ----------------------------------------------------

router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Paid",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bill status"
            });
        }

        const result = await db.query(
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
                message: "Bill not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Update bill status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update bill status"
        });
    }
});

// ----------------------------------------------------
// DELETE BILL
// ----------------------------------------------------

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            DELETE FROM bills
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.json({
            success: true,
            message: "Bill deleted successfully"
        });

    } catch (error) {
        console.error("Delete bill error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete bill"
        });
    }
});

module.exports = router;