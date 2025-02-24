import pg from 'pg';

const {Pool} = pg;
import dotenv from 'dotenv';
// TODO: Change to modern style: run with --env-file flag
dotenv.config();


export const pool = new Pool({
    user: `${process.env.DB_USER}`,
    host: `${process.env.DB_HOST}`,
    database: `${process.env.DB_NAME}`,
    password: `${process.env.DB_PASSWORD}`,
    port: process.env.DB_PORT,
});