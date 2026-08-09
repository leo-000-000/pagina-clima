const { db } = require('../config/database');

// Helper para convertir callbacks de sqlite3 a Promises
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

// ─── PRONÓSTICOS ─────────────────────────────────────────────────────────────

const ForecastModel = {

  // Pronóstico destacado / actual (el más cercano a hoy)
  getCurrent() {
    return get(`
      SELECT * FROM weather_forecasts
      WHERE forecast_date >= date('now', '-1 day')
      ORDER BY is_featured DESC, forecast_date ASC
      LIMIT 1
    `);
  },

  // Próximos N días
  getUpcoming(days = 7) {
    return all(`
      SELECT * FROM weather_forecasts
      WHERE forecast_date >= date('now')
      ORDER BY forecast_date ASC
      LIMIT ?
    `, [days]);
  },

  // Todos los pronósticos (para el admin)
  getAll() {
    return all(`
      SELECT wf.*, u.username as author
      FROM weather_forecasts wf
      LEFT JOIN users u ON wf.created_by = u.id
      ORDER BY wf.forecast_date DESC
    `);
  },

  // Un pronóstico por ID
  getById(id) {
    return get('SELECT * FROM weather_forecasts WHERE id = ?', [id]);
  },

  // Crear nuevo pronóstico
  create(data) {
    const {
      title, description, forecast_date, location,
      temperature, feels_like, temp_min, temp_max,
      humidity, wind_speed, wind_direction, precipitation,
      pressure, uv_index, visibility, weather_condition,
      image_url, additional_notes, is_featured, created_by
    } = data;

    return run(`
      INSERT INTO weather_forecasts
      (title, description, forecast_date, location,
       temperature, feels_like, temp_min, temp_max,
       humidity, wind_speed, wind_direction, precipitation,
       pressure, uv_index, visibility, weather_condition,
       image_url, additional_notes, is_featured, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, forecast_date, location || process.env.LOCATION_NAME || 'Buenos Aires',
      temperature, feels_like, temp_min, temp_max,
      humidity, wind_speed, wind_direction, precipitation,
      pressure, uv_index, visibility, weather_condition,
      image_url, additional_notes, is_featured ? 1 : 0, created_by
    ]);
  },

  // Actualizar pronóstico
  update(id, data) {
    const fields = [];
    const values = [];

    const allowed = [
      'title', 'description', 'forecast_date', 'temperature', 'feels_like',
      'temp_min', 'temp_max', 'humidity', 'wind_speed', 'wind_direction',
      'precipitation', 'pressure', 'uv_index', 'visibility', 'weather_condition',
      'image_url', 'additional_notes', 'is_featured'
    ];

    allowed.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (fields.length === 0) return Promise.resolve({ changes: 0 });

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    return run(
      `UPDATE weather_forecasts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  // Eliminar pronóstico
  delete(id) {
    return run('DELETE FROM weather_forecasts WHERE id = ?', [id]);
  }
};

// ─── HISTÓRICOS ──────────────────────────────────────────────────────────────

const HistoryModel = {

  // Últimos N días de históricos
  getRecent(days = 30) {
    return all(`
      SELECT * FROM weather_history
      ORDER BY record_date DESC
      LIMIT ?
    `, [days]);
  },

  getAll() {
    return all('SELECT * FROM weather_history ORDER BY record_date DESC');
  },

  getById(id) {
    return get('SELECT * FROM weather_history WHERE id = ?', [id]);
  },

  create(data) {
    const { record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition } = data;
    return run(`
      INSERT INTO weather_history (record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition]);
  },

  update(id, data) {
    const { temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition } = data;
    return run(`
      UPDATE weather_history
      SET temperature=?, temp_min=?, temp_max=?, humidity=?, wind_speed=?, precipitation=?, weather_condition=?
      WHERE id=?
    `, [temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition, id]);
  },

  delete(id) {
    return run('DELETE FROM weather_history WHERE id = ?', [id]);
  }
};

// ─── USUARIOS ────────────────────────────────────────────────────────────────

const UserModel = {
  findByUsername(username) {
    return get('SELECT * FROM users WHERE username = ?', [username]);
  },
  findByEmail(email) {
    return get('SELECT * FROM users WHERE email = ?', [email]);
  },
  findById(id) {
    return get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
  },
  getAll() {
    return all('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
  },
  create(username, email, hashedPassword, role = 'admin') {
    return run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
  },
  delete(id) {
    return run('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = { ForecastModel, HistoryModel, UserModel };
