
require("dotenv").config();
const db = require("./db");

async function createCustomerTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        mobile VARCHAR(20) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        mobile_verified_at DATETIME NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255) NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        address_type ENUM('home', 'work', 'other') DEFAULT 'home',
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_customer_address
          FOREIGN KEY (customer_id)
          REFERENCES customers(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mobile VARCHAR(20) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        purpose ENUM('login', 'registration', 'verification')
          NOT NULL DEFAULT 'login',
        expires_at DATETIME NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        consumed_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_customer_otp_mobile (mobile)
      )
    `);

    console.log("Customer tables created successfully!");

  } catch (error) {
    console.error("Customer table setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

createCustomerTables();
