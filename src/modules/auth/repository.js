import db from '../../core/config/db.js';

export const existsByEmail = async (email, client = null) => {
    const sql = `SELECT 1 FROM users WHERE email = $1 LIMIT 1`;
    const { rows } = await (client || db).query(sql, [email]);
    return rows.length > 0;
};

export const create = async ({ email, passwordHash, fullName }, client = null) => {
    const sql = `
        INSERT INTO users (email, password_hash, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, full_name, created_at;
    `;
    const values = [email, passwordHash, fullName];
    const { rows } = await (client || db).query(sql, values);
    return rows[0] || null;
};

export const findByEmail = async (email, client = null) => {
    const sql = `
        SELECT * FROM users
        WHERE email = $1;
    `;
    const { rows } = await (client || db).query(sql, [email]);
    return rows[0] || null;
}

export const findRoleByName = async (roleName, client = null) => {
    const sql = `
        SELECT * FROM roles
        WHERE name = $1;
    `;
    const { rows } = await (client || db).query(sql, roleName);
    return rows[0] || null;
}

export const assignRole = async ({ userId, roleId }, client = null) => {
    const sql = `
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [userId, roleId]
    const { rows } = await (client || db).query(sql, values);
    return rows.length > 0;
}