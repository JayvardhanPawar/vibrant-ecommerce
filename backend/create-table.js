
require("dotenv").config();
const db = require("./db");

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_data MEDIUMBLOB,
        image_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Products table created successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await db.end();
  }
}

createTable();
