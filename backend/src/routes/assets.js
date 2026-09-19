const express = require("express");
const router = express.Router();

const db = require("../db");

// GET all assets
router.get("/", async (req, res) => {
    try {
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
        console.error("Get assets error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch assets"
        });
    }
});


// GET single asset
router.get("/:id", async (req, res) => {
    try {
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
            WHERE id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Get asset error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch asset"
        });
    }
});


// CREATE asset
router.post("/", async (req, res) => {
    try {
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
            description
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
                    "Asset code, asset name, category and department are required"
            });
        }

        const result = await db.query(`
            INSERT INTO assets (
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
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                COALESCE($6, 1),
                $7,
                $8::date,
                $9,
                COALESCE($10, 'Good'),
                COALESCE($11, 'Available'),
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
        `, [
            assetCode,
            assetName,
            category,
            department,
            location || null,
            quantity ? Number(quantity) : null,
            assignedTo || null,
            purchaseDate || null,
            purchasePrice !== "" && purchasePrice != null
                ? Number(purchasePrice)
                : null,
            condition || null,
            status || null,
            description || null
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Create asset error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Asset code already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create asset"
        });
    }
});


// UPDATE asset
router.put("/:id", async (req, res) => {
    try {
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
            description
        } = req.body;

        const result = await db.query(`
            UPDATE assets
            SET
                asset_code = $1,
                asset_name = $2,
                category = $3,
                department = $4,
                location = $5,
                quantity = $6,
                assigned_to = $7,
                purchase_date = $8::date,
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
        `, [
            assetCode,
            assetName,
            category,
            department,
            location || null,
            Number(quantity),
            assignedTo || null,
            purchaseDate || null,
            purchasePrice !== "" && purchasePrice != null
                ? Number(purchasePrice)
                : null,
            condition,
            status,
            description || null,
            req.params.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Update asset error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update asset"
        });
    }
});


// DELETE asset
router.delete("/:id", async (req, res) => {
    try {
        const result = await db.query(
            "DELETE FROM assets WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            message: "Asset deleted successfully"
        });

    } catch (error) {
        console.error("Delete asset error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete asset"
        });
    }
});


// DELETE all assets
router.delete("/", async (req, res) => {
    try {
        await db.query("DELETE FROM assets");

        res.json({
            success: true,
            message: "All assets deleted successfully"
        });

    } catch (error) {
        console.error("Delete all assets error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete assets"
        });
    }
});


module.exports = router;