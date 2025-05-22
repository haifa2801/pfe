import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'digital_book_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Call the test connection function
testConnection();

export default pool;