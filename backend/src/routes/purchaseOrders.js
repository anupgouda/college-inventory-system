const express = require("express");
const router = express.Router();

const db = require("../db");

// ----------------------------------------------------
// GET ALL PURCHASE ORDERS
// ----------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                po.id,
                po.po_number AS "poNumber",
                po.vendor_id AS "vendorId",
                v.vendor_code AS "vendorCode",
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
        console.error("Get purchase orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch purchase orders"
        });
    }
});

// ----------------------------------------------------
// CREATE PURCHASE ORDER
// ----------------------------------------------------

router.post("/", async (req, res) => {
    try {
        const {
            poNumber,
            vendorId,
            orderDate,
            expectedDeliveryDate,
            itemName,
            quantity,
            unitPrice,
            notes
        } = req.body;

        if (
            !poNumber ||
            !vendorId ||
            !itemName ||
            !quantity ||
            unitPrice === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "PO number, vendor, item name, quantity and unit price are required"
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
                    notes
                )
            VALUES
                (
                    $1,
                    $2,
                    COALESCE($3::date, CURRENT_DATE),
                    $4::date,
                    $5,
                    $6,
                    $7,
                    $8
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
                poNumber,
                vendorId,
                orderDate || null,
                expectedDeliveryDate || null,
                itemName,
                quantity,
                unitPrice,
                notes || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Create purchase order error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "PO number already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create purchase order"
        });
    }
});

// ----------------------------------------------------
// UPDATE PURCHASE ORDER STATUS
// ----------------------------------------------------

router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Open",
            "Approved",
            "Received",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid purchase order status"
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
                message: "Purchase order not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Update PO status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update purchase order status"
        });
    }
});

// ----------------------------------------------------
// DELETE PURCHASE ORDER
// ----------------------------------------------------

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            DELETE FROM purchase_orders
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Purchase order not found"
            });
        }

        res.json({
            success: true,
            message: "Purchase order deleted successfully"
        });

    } catch (error) {
        console.error("Delete purchase order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete purchase order"
        });
    }
});

module.exports = router;