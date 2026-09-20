const { Pool } = require("pg");

require("dotenv").config();

// ======================================================
// MAIN / PRODUCTION DATABASE
// ======================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ======================================================
// DEMO DATABASE
// Same PostgreSQL database, but uses demo schema
// ======================================================

const demoPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: "-c search_path=demo",
});

// ======================================================
// PRODUCTION DATABASE EVENTS
// ======================================================

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully");
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error);
});

// ======================================================
// DEMO DATABASE EVENTS
// ======================================================

demoPool.on("connect", () => {
  console.log("Demo PostgreSQL pool connected successfully");
});

demoPool.on("error", (error) => {
  console.error("Demo PostgreSQL pool error:", error);
});

// ======================================================
// EXPORT
//
// IMPORTANT:
// Export the main pool directly so all existing routes
// continue working:
//
// const pool = require("../db");
// pool.query(...)
//
// Attach demoPool as an additional property.
// ======================================================

module.exports = pool;
module.exports.demoPool = demoPool;