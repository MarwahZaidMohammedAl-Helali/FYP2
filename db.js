   // server.js or a db.js file
   const mysql = require('mysql2');

   // Create a connection pool (recommended)
   const pool = mysql.createPool({
     host: '127.0.0.1',      // or your MySQL server host
     user: 'root',// e.g., 'root'
     password: 'Hasky221!',
     database: 'tradetalent',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   });

   // Test the connection and handle errors
   pool.getConnection((err, connection) => {
     if (err) {
       console.error('Error connecting to the MySQL database:', err.message);
     } else {
       console.log('Connected to the MySQL database.');
       connection.release();
     }
   });

   module.exports = pool;