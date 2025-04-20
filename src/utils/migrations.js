import fs from 'fs';
import path from 'path';
import { openConnection, closeConnection } from '../../config/databases/mysql.js';
import logger from './errorHandler.js';

const migrationsDir = path.resolve(process.cwd(), 'migrations');
const migrationsTable = `
  CREATE TABLE IF NOT EXISTS Migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    run_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;
`;

export function ensureMigrationsDir() {
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    logger.info(`Carpeta de migraciones creada en: ${migrationsDir}`);
  }
}

export async function runMigrations() {
  const conn = await openConnection();
  try {
    //! 1) Crear tabla de control si no existe
    await conn.query(migrationsTable);

    //! 2) Obtener ya aplicadas
    const [rows] = await conn.query('SELECT name FROM Migrations');
    const applied = new Set(rows.map(r => r.name));

    //! 3) Leer archivos .sql ordenados
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    //! 4) Ejecutar pendientes
    for (const file of files) {
      if (!applied.has(file)) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        logger.info(`Ejecutando migración ${file}`);
        await conn.query(sql);
        await conn.query('INSERT INTO Migrations (name) VALUES (?)', [file]);
        logger.info(`Migración aplicada: ${file}`);
      }
    }
  } catch (err) {
    logger.error(`Error en migraciones: ${err.stack || err}`);
    throw err;
  } finally {
    closeConnection(conn);
  }
}
