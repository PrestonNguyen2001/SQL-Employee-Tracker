const fs = require("fs");
const path = require("path");
const pool = require("./db/connection");

const schemaPath = path.join(__dirname, "db", "schema.sql");
const seedsPath = path.join(__dirname, "db", "seeds.sql");

const initDatabase = async () => {
  try {
    // Read schema.sql and execute it
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);

    // Read seeds.sql and execute it
    const seeds = fs.readFileSync(seedsPath, "utf8");
    await pool.query(seeds);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    pool.end(); // Close the connection pool
  }
};

initDatabase();
