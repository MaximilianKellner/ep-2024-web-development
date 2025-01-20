import pg from 'pg';
const { Pool } = pg;


export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'demo_db',
  password: 'admin1986',
  port: 5432,
});