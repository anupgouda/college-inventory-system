const express = require("express");
const db = require("../db");

const router = express.Router();


// =====================================================
// GET ALL STOCK
// =====================================================

router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                id,
                item_name AS "itemName",
                category,
                quantity,
                unit_price AS "unitPrice",
                total_price AS "totalPrice",
                storage_location AS "storageLocation",
                TO_CHAR(entry_date, 'YYYY-MM-DD') AS "entryDate",
                invoice_number AS "invoiceNumber",
                purchase_order AS "purchaseOrder"
            FROM stock
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching stock:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock"
        });
    }
});


// =====================================================
// CREATE STOCK ENTRY
// =====================================================

router.post("/", async (req, res) => {
    try {
        const {
            itemName,
            category,
            quantity,
            unitPrice,
            storageLocation,
            entryDate,
            invoiceNumber,
            purchaseOrder
        } = req.body;


        // -------------------------------
        // Required fields
        // -------------------------------

        if (
            !itemName ||
            !quantity ||
            unitPrice === undefined ||
            unitPrice === null ||
            !storageLocation
        ) {
            return res.status(400).json({
                success: false,
                message: "Item name, quantity, unit price and storage location are required"
            });
        }


        // -------------------------------
        // Validate quantity
        // -------------------------------

        const parsedQuantity = Number(quantity);

        if (
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }


        // -------------------------------
        // Validate unit price
        // -------------------------------

        const parsedUnitPrice = Number(unitPrice);

        if (
            !Number.isFinite(parsedUnitPrice) ||
            parsedUnitPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Unit price must be a valid non-negative number"
            });
        }


        // -------------------------------
        // Insert
        // -------------------------------

        const result = await db.query(`
            INSERT INTO stock (
                item_name,
                category,
                quantity,
                unit_price,
                storage_location,
                entry_date,
                invoice_number,
                purchase_order
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                COALESCE($6::date, CURRENT_DATE),
                $7,
                $8
            )
            RETURNING
                id,
                item_name AS "itemName",
                category,
                quantity,
                unit_price AS "unitPrice",
                total_price AS "totalPrice",
                storage_location AS "storageLocation",
                TO_CHAR(entry_date, 'YYYY-MM-DD') AS "entryDate",
                invoice_number AS "invoiceNumber",
                purchase_order AS "purchaseOrder"
        `, [
            itemName,
            category || null,
            parsedQuantity,
            parsedUnitPrice,
            storageLocation,
            entryDate || null,
            invoiceNumber || null,
            purchaseOrder || null
        ]);


        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating stock entry:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create stock entry"
        });
    }
});


// =====================================================
// DELETE STOCK ENTRY
// =====================================================

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM stock WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Stock entry not found"
            });
        }

        res.json({
            success: true,
            message: "Stock entry deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting stock entry:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete stock entry"
        });
    }
});


// =====================================================
// DELETE ALL STOCK
// =====================================================

router.delete("/", async (req, res) => {
    try {
        await db.query("DELETE FROM stock");

        res.json({
            success: true,
            message: "All stock entries deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting stock:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete stock"
        });
    }
});


module.exports = router;