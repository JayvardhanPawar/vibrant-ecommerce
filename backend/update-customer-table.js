require("dotenv").config();
const db = require("./db");

async function updateTable() {
  try {
    await db.query(`
      ALTER TABLE customers
      MODIFY mobile VARCHAR(20) NULL
    `);

    console.log("Customer table updated successfully!");
  } catch (error) {
    console.error(error.message);
  } finally {
    await db.end();
  }
}

updateTable();