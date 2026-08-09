const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const query = (text, params) => pool.query(text, params);

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_forecasts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        forecast_date DATE NOT NULL,
        location TEXT NOT NULL DEFAULT 'Buenos Aires',
        temperature REAL, feels_like REAL, temp_min REAL, temp_max REAL,
        humidity INTEGER, wind_speed REAL, wind_direction TEXT,
        precipitation REAL, pressure REAL, uv_index INTEGER, visibility REAL,
        weather_condition TEXT, image_url TEXT, additional_notes TEXT,
        is_featured INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_history (
        id SERIAL PRIMARY KEY,
        record_date DATE NOT NULL UNIQUE,
        temperature REAL, temp_min REAL, temp_max REAL,
        humidity INTEGER, wind_speed REAL, precipitation REAL,
        weather_condition TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const adminPass = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@clima.com', $1, 'superadmin')
      ON CONFLICT (username) DO NOTHING
    `, [adminPass]);

    const conditions = ['Despejado', 'Parcialmente nublado', 'Nublado', 'Lluvioso', 'Tormenta'];
    for (let i = 30; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const temp = (18 + Math.random() * 14).toFixed(1);
      const min = (parseFloat(temp) - 4 - Math.random() * 3).toFixed(1);
      const max = (parseFloat(temp) + 3 + Math.random() * 3).toFixed(1);
      const hum = Math.floor(40 + Math.random() * 50);
      const wind = (5 + Math.random() * 25).toFixed(1);
      const prec = (Math.random() > 0.7 ? Math.random() * 15 : 0).toFixed(1);
      const cond = conditions[Math.floor(Math.random() * conditions.length)];
      await client.query(`
        INSERT INTO weather_history (record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (record_date) DO NOTHING
      `, [dateStr, temp, min, max, hum, wind, prec, cond]);
    }

    await client.query('COMMIT');
    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inicializando DB:', err.message);
  } finally {
    client.release();
  }
}

module.exports = { pool, query, initializeDatabase };