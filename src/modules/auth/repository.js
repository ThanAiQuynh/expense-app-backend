import db from '../../core/config/db.js';

export const existsByEmail = async (email) => {
    const sql = `SELECT 1 FROM users WHERE email = $1 LIMIT 1`;
    const { rows } = await db.query(sql, [email]);
    return rows.length > 0;
};

export const create = async ({ email, passwordHash, fullName }) => {
    const sql = `
        INSERT INTO users (email, password_hash, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, full_name, created_at;
    `;
    const values = [email, passwordHash, fullName];
    const { rows } = await db.query(sql, values);
    return rows[0];
};