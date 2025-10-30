import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export async function getConnection() {
  if (!connection) {
    const url = process.env.DATABASE_URL!;
    
    // Parse MySQL URL: mysql://user:password@host:port/database
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, user, password, host, port, database] = match;
    
    connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
    });

    // Create table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS validaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        codigo_validado VARCHAR(255) NOT NULL,
        dispositivo_id VARCHAR(255) NOT NULL,
        UNIQUE KEY unique_scan (codigo_validado, dispositivo_id)
      )
    `);

    // Check if dispositivo_id column exists in case table was created before migration
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'validaciones' 
        AND COLUMN_NAME = 'dispositivo_id'
      `);

      const columnExists = Array.isArray(columns) && columns.length > 0;

      if (!columnExists) {
        console.log('Agregando columna dispositivo_id automáticamente...');
        await connection.execute(`
          ALTER TABLE validaciones 
          ADD COLUMN dispositivo_id VARCHAR(255) DEFAULT 'legacy' NOT NULL AFTER codigo_validado
        `);
        
        // Try to add unique constraint (may fail if it exists)
        try {
          await connection.execute(`
            ALTER TABLE validaciones 
            ADD UNIQUE KEY unique_scan (codigo_validado, dispositivo_id)
          `);
        } catch (e) {
          // Constraint might already exist, ignore
        }
      }
    } catch (error) {
      console.error('Error verificando/agregando columna dispositivo_id:', error);
    }
  }
  
  return connection;
}

export async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
  }
}
