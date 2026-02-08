import db from "../../core/config/db.js";

export const existsByEmail = async (email, client = null) => {
  const sql = `SELECT 1 FROM users WHERE email = $1 LIMIT 1`;
  const { rows } = await (client || db).query(sql, [email]);
  return rows.length > 0;
};

export const create = async (
  { email, passwordHash, fullName },
  client = null,
) => {
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
};

export const findRoleByName = async (roleName, client = null) => {
  const sql = `
        SELECT * FROM roles
        WHERE name = $1;
    `;
  const { rows } = await (client || db).query(sql, roleName);
  return rows[0] || null;
};

export const assignRole = async ({ userId, roleId }, client = null) => {
  const sql = `
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
  const values = [userId, roleId];
  const { rows } = await (client || db).query(sql, values);
  return rows.length > 0;
};

export const createSession = async (
  { userId, jti, refreshToken, deviceInfo, ipAddress, expiresAt },
  client = null,
) => {
  const sql = `
        INSERT INTO user_sessions (user_id, jti, refresh_token, device_info, ip_address, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
  const values = [userId, jti, refreshToken, deviceInfo, ipAddress, expiresAt];
  const { rows } = await (client || db).query(sql, values);
  return rows.length > 0;
};

export const setLastLogin = async ({ userId }, client = null) => {
  const sql = `
        UPDATE users
        SET last_login_at = NOW() AT TIME ZONE 'UTC'
        WHERE id = $1
        RETURNING *;
    `;

  const { rows } = await (client || db).query(sql, [userId]);
  return rows.length > 0;
};

export const findById = async (userId, client = null) => {
  const sql = `
        SELECT * FROM users
        WHERE id = $1;
    `;

  const { rows } = await (client, db).query(sql, [userId]);
  return rows[0] || null;
};

export const findUserRoleName = async(userId, client = null) => {
    const sql = `
        SELECT r.name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1;
    `;
    const { rows } = await (client || db).query(sql, [userId]);
    return rows[0] || null;
}
