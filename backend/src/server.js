const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const db = require("./db");
const stockRoutes = require("./routes/stock");
const indentRoutes = require("./routes/indents");
const checkoutRoutes = require("./routes/checkouts");
const vendorRoutes = require("./routes/vendors");
const purchaseOrderRoutes = require("./routes/purchaseOrders");
const quotationRoutes = require("./routes/quotations");
const billRoutes = require("./routes/bills");
const assetRoutes = require("./routes/assets");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const {
  authenticateToken,
} = require("./middleware/authMiddleware");


const app = express();

const PORT = process.env.PORT || 5001;


// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
      : ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "College Inventory Management System API"
    });
});


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working"
    });
});


// ===============================
// DATABASE TEST
// ===============================

app.get("/api/db-test", async (req, res) => {

    try {

        const result = await db.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });

    }

});

app.get("/api/stock-db-test", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                current_database() AS database,
                current_user AS user,
                COUNT(*) AS stock_count
            FROM stock
        `);

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Stock DB test error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
// ===============================
// API ROUTES
// ===============================

app.use("/api/indents", indentRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/checkouts", checkoutRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.get("/api/auth/protected-test", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Protected route working",
    user: req.user,
  });
});

// ===============================
// 404
// ===============================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});