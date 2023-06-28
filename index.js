// Import required modules
const express = require('express');
const mysql = require('mysql2/promise');

// Create an Express application
const app = express();
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'your_db_host',
  user: 'your_db_user',
  password: 'your_db_password',
  database: 'your_db_name',
});

// Add Customer API endpoint
app.post('/api/customers', async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    // Validate input parameters
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Name and phone number are required.' });
    }

    // Check for duplicates
    const connection = await pool.getConnection();
    const [existingCustomer] = await connection.execute('SELECT * FROM customers WHERE phoneNumber = ?', [phoneNumber]);
    connection.release();

    if (existingCustomer.length > 0) {
      return res.status(409).json({ error: 'Customer with the same phone number already exists.' });
    }

    // Insert customer into the database
    const insertQuery = 'INSERT INTO customers (name, phoneNumber) VALUES (?, ?)';
    const insertParams = [name, phoneNumber];

    const [inneres] = await pool.query(insertQuery, insertParams);

    console.log(`Customer added: ${name}`);

    return res.status(201).json({ success: true, customerId: insertResult.insertId });
  } catch (error) {
    console.error(`Error adding customer: ${error}`);
    return res.status(500).json({ error: 'An error occurred while adding the customer.' });
  }
});

