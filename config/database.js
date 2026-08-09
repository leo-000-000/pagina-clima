const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error al conectar con SQLite:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a SQLite en:', DB_PATH);
});

// Activar foreign keys
db.run('PRAGMA foreign_keys = ON');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {

      // Tabla de administradores
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de pronósticos
      db.run(`
        CREATE TABLE IF NOT EXISTS weather_forecasts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          forecast_date DATE NOT NULL,
          location TEXT NOT NULL DEFAULT 'Buenos Aires',

          temperature REAL,
          feels_like REAL,
          temp_min REAL,
          temp_max REAL,
          humidity INTEGER,
          wind_speed REAL,
          wind_direction TEXT,
          precipitation REAL,
          pressure REAL,
          uv_index INTEGER,
          visibility REAL,
          weather_condition TEXT,

          image_url TEXT,
          additional_notes TEXT,
          is_featured INTEGER DEFAULT 0,

          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Tabla de datos históricos
      db.run(`
        CREATE TABLE IF NOT EXISTS weather_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          record_date DATE NOT NULL UNIQUE,
          temperature REAL,
          temp_min REAL,
          temp_max REAL,
          humidity INTEGER,
          wind_speed REAL,
          precipitation REAL,
          weather_condition TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear admin por defecto si no existe
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, email, password, role)
        VALUES ('admin', 'admin@clima.com', ?, 'superadmin')
      `, [defaultPassword]);

      // Insertar datos históricos de ejemplo (últimos 30 días)
      const now = new Date();
      const insertHistory = db.prepare(`
        INSERT OR IGNORE INTO weather_history
        (record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const conditions = ['Despejado', 'Parcialmente nublado', 'Nublado', 'Lluvioso', 'Tormenta'];
      for (let i = 30; i >= 1; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const temp = (18 + Math.random() * 14).toFixed(1);
        const min = (parseFloat(temp) - 4 - Math.random() * 3).toFixed(1);
        const max = (parseFloat(temp) + 3 + Math.random() * 3).toFixed(1);
        const humidity = Math.floor(40 + Math.random() * 50);
        const wind = (5 + Math.random() * 25).toFixed(1);
        const precip = (Math.random() > 0.7 ? Math.random() * 15 : 0).toFixed(1);
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        insertHistory.run(dateStr, temp, min, max, humidity, wind, precip, condition);
      }
      insertHistory.finalize();

      // Insertar pronósticos de ejemplo
      const exampleForecasts = [
        {
          title: 'Cielo despejado y temperaturas cálidas',
          description: 'Una jornada ideal para actividades al aire libre. El sol predominará durante todo el día con escasa nubosidad.',
          forecast_date: new Date().toISOString().split('T')[0],
          temperature: 24.5,
          feels_like: 26,
          temp_min: 17,
          temp_max: 28,
          humidity: 55,
          wind_speed: 12,
          wind_direction: 'NE',
          precipitation: 0,
          pressure: 1013,
          uv_index: 7,
          visibility: 10,
          weather_condition: 'Despejado',
          is_featured: 1,
          additional_notes: 'Se recomienda protector solar para actividades prolongadas al exterior.',
          created_by: 1
        },
        {
          title: 'Nublado con posibilidad de lluvias vespertinas',
          description: 'La mañana comenzará con cielos parcialmente cubiertos. Para la tarde se esperan chaparrones dispersos.',
          forecast_date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })(),
          temperature: 19,
          feels_like: 18,
          temp_min: 14,
          temp_max: 22,
          humidity: 75,
          wind_speed: 20,
          wind_direction: 'SO',
          precipitation: 8.5,
          pressure: 1005,
          uv_index: 3,
          visibility: 7,
          weather_condition: 'Lluvioso',
          is_featured: 0,
          additional_notes: 'Llevar paraguas. Las lluvias serán más intensas entre las 16 y las 20 hs.',
          created_by: 1
        },
        {
          title: 'Frente frío ingresa desde el sur',
          description: 'Un frente frío traerá una baja significativa de temperatura. Los vientos serán intensos por la noche.',
          forecast_date: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]; })(),
          temperature: 13,
          feels_like: 9,
          temp_min: 9,
          temp_max: 16,
          humidity: 80,
          wind_speed: 35,
          wind_direction: 'S',
          precipitation: 3,
          pressure: 998,
          uv_index: 2,
          visibility: 5,
          weather_condition: 'Tormenta',
          is_featured: 0,
          additional_notes: 'Precaución con las ráfagas de viento. Se esperan descensos de hasta 10°C.',
          created_by: 1
        }
      ];

      const insertForecast = db.prepare(`
        INSERT OR IGNORE INTO weather_forecasts
        (title, description, forecast_date, location, temperature, feels_like, temp_min, temp_max,
         humidity, wind_speed, wind_direction, precipitation, pressure, uv_index, visibility,
         weather_condition, is_featured, additional_notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      exampleForecasts.forEach(f => {
        insertForecast.run(
          f.title, f.description, f.forecast_date, 'Buenos Aires',
          f.temperature, f.feels_like, f.temp_min, f.temp_max,
          f.humidity, f.wind_speed, f.wind_direction, f.precipitation,
          f.pressure, f.uv_index, f.visibility, f.weather_condition,
          f.is_featured, f.additional_notes, f.created_by
        );
      });
      insertForecast.finalize(() => {
        console.log('✅ Base de datos inicializada con datos de ejemplo');
        resolve();
      });

    });
  });
}

module.exports = { db, initializeDatabase };
