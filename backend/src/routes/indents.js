const express = require("express");
const db = require("../db");

const router = express.Router();

/*
    GET ALL INDENTS
    GET /api/indents
*/
router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                id AS "_id",
                TO_CHAR(date, 'YYYY-MM-DD') AS date,
                branch,
                description,
                qty,
                status
            FROM indents
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching indents:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch indents"
        });
    }
});


/*
    CREATE NEW INDENT
    POST /api/indents
*/
router.post("/", async (req, res) => {
    try {
        const { date, branch, description, qty, status } = req.body;

        if (!branch || !description || !qty) {
            return res.status(400).json({
                success: false,
                message: "Branch, description and quantity are required"
            });
        }

        const quantity = Number(qty);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const indentStatus = status || "Pending";

        if (!["Pending", "Approved", "Rejected"].includes(indentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid indent status"
            });
        }

        const result = await db.query(`
            INSERT INTO indents
                (date, branch, description, qty, status)
            VALUES
                (COALESCE($1::date, CURRENT_DATE), $2, $3, $4, $5)
            RETURNING
                id AS "_id",
                TO_CHAR(date, 'YYYY-MM-DD') AS date,
                branch,
                description,
                qty,
                status
        `, [
            date || null,
            branch,
            description,
            quantity,
            indentStatus
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating indent:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create indent"
        });
    }
});

/*
    UPDATE INDENT STATUS
    PATCH /api/indents/:id
*/
router.patch("/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const result = await db.query(`
            UPDATE indents
            SET status = $1
            WHERE id = $2
            RETURNING
                id AS "_id",
                TO_CHAR(date, 'YYYY-MM-DD') AS date,
                branch,
                description,
                qty,
                status
        `, [
            status,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Indent not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error updating indent:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update indent"
        });
    }
});


/*
    DELETE ONE INDENT
    DELETE /api/indents/:id
*/
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM indents WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Indent not found"
            });
        }

        res.json({
            success: true,
            message: "Indent deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting indent:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete indent"
        });
    }
});


/*
    DELETE ALL INDENTS
    DELETE /api/indents
*/
router.delete("/", async (req, res) => {
    try {
        await db.query("DELETE FROM indents");

        res.json({
            success: true,
            message: "All indents deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting all indents:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete indents"
        });
    }
});


module.exports = router;