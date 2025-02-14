import pg from 'pg';
const { Pool } = pg;


export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'omnimize_db',
  password: 'admin123',
  port: 5432,
});