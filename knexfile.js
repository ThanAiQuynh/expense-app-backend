require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'expense_tracker',
    },
    migrations: {
      directory: './src/core/database/migrations',
    },
    seeds: {
      directory: './src/core/database/seeds',
    },
  },
};