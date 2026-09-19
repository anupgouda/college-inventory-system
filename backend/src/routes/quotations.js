const express = require("express");
const router = express.Router();

const db = require("../db");

// ----------------------------------------------------
// GET ALL QUOTATIONS
// ----------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                q.id,
                q.quotation_number AS "quotationNumber",
                q.vendor_id AS "vendorId",
                v.vendor_code AS "vendorCode",
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
        console.error("Get quotations error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch quotations"
        });
    }
});

// ----------------------------------------------------
// CREATE QUOTATION
// ----------------------------------------------------

router.post("/", async (req, res) => {
    try {
        const {
            quotationNumber,
            vendorId,
            quotationDate,
            itemName,
            quantity,
            unitPrice,
            validUntil,
            notes
        } = req.body;

        if (
            !quotationNumber ||
            !vendorId ||
            !itemName ||
            !quantity ||
            unitPrice === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quotation number, vendor, item name, quantity and unit price are required"
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
                    $7::date,
                    $8
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
                quotationNumber,
                vendorId,
                quotationDate || null,
                itemName,
                quantity,
                unitPrice,
                validUntil || null,
                notes || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Create quotation error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Quotation number already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create quotation"
        });
    }
});

// ----------------------------------------------------
// UPDATE QUOTATION STATUS
// ----------------------------------------------------

router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected",
            "Expired"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quotation status"
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
                message: "Quotation not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Update quotation status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update quotation status"
        });
    }
});

// ----------------------------------------------------
// DELETE QUOTATION
// ----------------------------------------------------

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            DELETE FROM quotations
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });
        }

        res.json({
            success: true,
            message: "Quotation deleted successfully"
        });

    } catch (error) {
        console.error("Delete quotation error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete quotation"
        });
    }
});

module.exports = router;