
require("dotenv").config();

const db = require("./db");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password || password === "CREATE_A_STRONG_ADMIN_PASSWORD") {
      throw new Error("Set ADMIN_USERNAME and a real ADMIN_PASSWORD in .env");
    }

    const hash = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO admins (username, password_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [username, hash]
    );

    console.log(`Admin account created/updated: ${username}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

createAdmin();
