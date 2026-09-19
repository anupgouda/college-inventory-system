const express = require("express");
const db = require("../db");

const router = express.Router();


// =====================================================
// GET ALL CHECKOUTS
// =====================================================

router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                id,
                item_name AS "itemName",
                department,
                quantity,
                TO_CHAR(checkout_date, 'YYYY-MM-DD') AS "checkoutDate",
                TO_CHAR(expected_return_date, 'YYYY-MM-DD') AS "expectedReturnDate",
                purpose,
                status
            FROM checkouts
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching checkouts:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch checkout records"
        });
    }
});


// =====================================================
// CREATE CHECKOUT
// =====================================================

router.post("/", async (req, res) => {
    try {
        const {
            itemName,
            department,
            quantity,
            checkoutDate,
            expectedReturnDate,
            purpose
        } = req.body;


        // -----------------------------------------------
        // Validate required fields
        // -----------------------------------------------

        if (
            !itemName ||
            !department ||
            !quantity ||
            !expectedReturnDate ||
            !purpose
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Item name, department, quantity, expected return date and purpose are required"
            });
        }


        // -----------------------------------------------
        // Validate quantity
        // -----------------------------------------------

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


        // -----------------------------------------------
        // Insert checkout
        // -----------------------------------------------

        const result = await db.query(`
            INSERT INTO checkouts (
                item_name,
                department,
                quantity,
                checkout_date,
                expected_return_date,
                purpose
            )
            VALUES (
                $1,
                $2,
                $3,
                COALESCE($4::date, CURRENT_DATE),
                $5::date,
                $6
            )
            RETURNING
                id,
                item_name AS "itemName",
                department,
                quantity,
                TO_CHAR(checkout_date, 'YYYY-MM-DD') AS "checkoutDate",
                TO_CHAR(expected_return_date, 'YYYY-MM-DD') AS "expectedReturnDate",
                purpose,
                status
        `, [
            itemName.trim(),
            department,
            parsedQuantity,
            checkoutDate || null,
            expectedReturnDate,
            purpose.trim()
        ]);


        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating checkout:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create checkout record"
        });
    }
});


// =====================================================
// UPDATE CHECKOUT STATUS
// =====================================================

router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "Checked Out",
            "Returned",
            "Overdue"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid checkout status"
            });
        }

        const result = await db.query(`
            UPDATE checkouts
            SET status = $1
            WHERE id = $2
            RETURNING
                id,
                item_name AS "itemName",
                department,
                quantity,
                TO_CHAR(checkout_date, 'YYYY-MM-DD') AS "checkoutDate",
                TO_CHAR(expected_return_date, 'YYYY-MM-DD') AS "expectedReturnDate",
                purpose,
                status
        `, [status, id]);


        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Checkout record not found"
            });
        }


        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error updating checkout:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update checkout status"
        });
    }
});


// =====================================================
// DELETE CHECKOUT
// =====================================================

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM checkouts WHERE id = $1 RETURNING id",
            [id]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Checkout record not found"
            });
        }


        res.json({
            success: true,
            message: "Checkout record deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting checkout:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete checkout record"
        });
    }
});


// =====================================================
// DELETE ALL CHECKOUTS
// =====================================================

router.delete("/", async (req, res) => {
    try {
        await db.query("DELETE FROM checkouts");

        res.json({
            success: true,
            message: "All checkout records deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting checkouts:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete checkout records"
        });
    }
});


module.exports = router;