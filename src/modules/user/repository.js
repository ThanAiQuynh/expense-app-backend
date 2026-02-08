import db from "../../core/config/db.js";

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
