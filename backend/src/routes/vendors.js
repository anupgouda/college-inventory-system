const express = require("express");
const router = express.Router();

const db = require("../db");

// ----------------------------------------------------
// GET ALL VENDORS
// ----------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                id,
                vendor_code AS "vendorCode",
                vendor_name AS "vendorName",
                contact_person AS "contactPerson",
                email,
                phone,
                gst_number AS "gstNumber",
                address,
                created_at AS "createdAt"
            FROM vendors
            ORDER BY id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Get vendors error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch vendors"
        });
    }
});

// ----------------------------------------------------
// CREATE VENDOR
// ----------------------------------------------------

router.post("/", async (req, res) => {
    try {
        const {
            vendorCode,
            vendorName,
            contactPerson,
            email,
            phone,
            gstNumber,
            address
        } = req.body;

        if (!vendorCode || !vendorName) {
            return res.status(400).json({
                success: false,
                message: "Vendor code and vendor name are required"
            });
        }

        const result = await db.query(
            `
            INSERT INTO vendors
                (
                    vendor_code,
                    vendor_name,
                    contact_person,
                    email,
                    phone,
                    gst_number,
                    address
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                vendor_code AS "vendorCode",
                vendor_name AS "vendorName",
                contact_person AS "contactPerson",
                email,
                phone,
                gst_number AS "gstNumber",
                address,
                created_at AS "createdAt"
            `,
            [
                vendorCode,
                vendorName,
                contactPerson || null,
                email || null,
                phone || null,
                gstNumber || null,
                address || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Create vendor error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Vendor code already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create vendor"
        });
    }
});

// ----------------------------------------------------
// DELETE VENDOR
// ----------------------------------------------------

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            DELETE FROM vendors
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        res.json({
            success: true,
            message: "Vendor deleted successfully"
        });

    } catch (error) {
        console.error("Delete vendor error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete vendor"
        });
    }
});

// ----------------------------------------------------
// DELETE ALL VENDORS
// ----------------------------------------------------

router.delete("/", async (req, res) => {
    try {
        await db.query("DELETE FROM vendors");

        res.json({
            success: true,
            message: "All vendors deleted successfully"
        });

    } catch (error) {
        console.error("Delete all vendors error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete vendors"
        });
    }
});

module.exports = router;