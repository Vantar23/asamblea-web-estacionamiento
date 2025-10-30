import dotenv from 'dotenv';
import { getConnection, closeConnection } from './db';

dotenv.config({ path: '.env.local' });

export async function migrate() {
  const connection = await getConnection();
  
  try {
    // Check if dispositivo_id column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'validaciones' 
      AND COLUMN_NAME = 'dispositivo_id'
    `);

    const columnExists = Array.isArray(columns) && columns.length > 0;

    if (!columnExists) {
      console.log('Agregando columna dispositivo_id...');
      
      // Add dispositivo_id column
      await connection.execute(`
        ALTER TABLE validaciones 
        ADD COLUMN dispositivo_id VARCHAR(255) DEFAULT 'legacy' NOT NULL AFTER codigo_validado
      `);

      console.log('Columna dispositivo_id agregada exitosamente');
    } else {
      console.log('Columna dispositivo_id ya existe');
    }

    // Drop unique constraint to allow multiple scans from same device
    try {
      await connection.execute(`
        ALTER TABLE validaciones 
        DROP INDEX unique_scan
      `);
      console.log('Restricción única eliminada - ahora se permiten múltiples escaneos desde el mismo dispositivo');
    } catch (e: any) {
      if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('La restricción única ya no existe');
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error('Error en migración:', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en migración:', error);
      process.exit(1);
    });
}
