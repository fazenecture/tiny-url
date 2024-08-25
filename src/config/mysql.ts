import mysql from "mysql2/promise";

/**
 * Create a connection pool to the database
 * @param host - The host of the database
 * @param user - The user of the database
 * @param password - The password of the database
 * @param database - The database name
 * @param waitForConnections - Determines the pool's action when no connections are available and the limit has been reached
 * @param connectionLimit - The maximum number of connections to create at once
 * @param queueLimit - The maximum number of connection requests the pool will queue before returning an error from getConnection
 */

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
