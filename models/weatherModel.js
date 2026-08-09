const { query } = require('../config/database');

const ForecastModel = {
  getCurrent() {
    return query(`
      SELECT * FROM weather_forecasts
      WHERE forecast_date >= CURRENT_DATE - INTERVAL '1 day'
      ORDER BY is_featured DESC, forecast_date ASC
      LIMIT 1
    `).then(r => r.rows[0]);
  },
  getUpcoming(days = 7) {
    return query(`
      SELECT * FROM weather_forecasts
      WHERE forecast_date >= CURRENT_DATE
      ORDER BY forecast_date ASC LIMIT $1
    `, [days]).then(r => r.rows);
  },
  getAll() {
    return query(`
      SELECT wf.*, u.username as author
      FROM weather_forecasts wf
      LEFT JOIN users u ON wf.created_by = u.id
      ORDER BY wf.forecast_date DESC
    `).then(r => r.rows);
  },
  getById(id) {
    return query('SELECT * FROM weather_forecasts WHERE id = $1', [id]).then(r => r.rows[0]);
  },
  create(data) {
    const { title, description, forecast_date, location, temperature, feels_like, temp_min, temp_max, humidity, wind_speed, wind_direction, precipitation, pressure, uv_index, visibility, weather_condition, image_url, additional_notes, is_featured, created_by } = data;
    return query(`
      INSERT INTO weather_forecasts
      (title, description, forecast_date, location, temperature, feels_like, temp_min, temp_max,
       humidity, wind_speed, wind_direction, precipitation, pressure, uv_index, visibility,
       weather_condition, image_url, additional_notes, is_featured, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING id
    `, [title, description, forecast_date, location || 'Buenos Aires', temperature, feels_like, temp_min, temp_max, humidity, wind_speed, wind_direction, precipitation, pressure, uv_index, visibility, weather_condition, image_url, additional_notes, is_featured ? 1 : 0, created_by])
    .then(r => ({ lastID: r.rows[0].id }));
  },
  update(id, data) {
    const allowed = ['title','description','forecast_date','temperature','feels_like','temp_min','temp_max','humidity','wind_speed','wind_direction','precipitation','pressure','uv_index','visibility','weather_condition','image_url','additional_notes','is_featured'];
    const fields = [], values = [];
    allowed.forEach(f => { if (data[f] !== undefined) { fields.push(`${f} = $${fields.length + 1}`); values.push(data[f]); } });
    if (!fields.length) return Promise.resolve({ changes: 0 });
    fields.push(`updated_at = NOW()`);
    values.push(id);
    return query(`UPDATE weather_forecasts SET ${fields.join(', ')} WHERE id = $${values.length}`, values).then(r => ({ changes: r.rowCount }));
  },
  delete(id) {
    return query('DELETE FROM weather_forecasts WHERE id = $1', [id]).then(r => ({ changes: r.rowCount }));
  }
};

const HistoryModel = {
  getRecent(days = 30) {
    return query('SELECT * FROM weather_history ORDER BY record_date DESC LIMIT $1', [days]).then(r => r.rows);
  },
  getAll() {
    return query('SELECT * FROM weather_history ORDER BY record_date DESC').then(r => r.rows);
  },
  getById(id) {
    return query('SELECT * FROM weather_history WHERE id = $1', [id]).then(r => r.rows[0]);
  },
  create(data) {
    const { record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition } = data;
    return query(`
      INSERT INTO weather_history (record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
    `, [record_date, temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition])
    .then(r => ({ lastID: r.rows[0].id }));
  },
  update(id, data) {
    const { temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition } = data;
    return query(`
      UPDATE weather_history SET temperature=$1, temp_min=$2, temp_max=$3, humidity=$4, wind_speed=$5, precipitation=$6, weather_condition=$7 WHERE id=$8
    `, [temperature, temp_min, temp_max, humidity, wind_speed, precipitation, weather_condition, id]);
  },
  delete(id) {
    return query('DELETE FROM weather_history WHERE id = $1', [id]);
  }
};

const UserModel = {
  findByUsername: (username) => query('SELECT * FROM users WHERE username = $1', [username]).then(r => r.rows[0]),
  findById: (id) => query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]).then(r => r.rows[0]),
  getAll: () => query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC').then(r => r.rows),
  create: (username, email, hashedPassword, role = 'admin') =>
    query('INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id', [username, email, hashedPassword, role]).then(r => ({ lastID: r.rows[0].id })),
  delete: (id) => query('DELETE FROM users WHERE id = $1', [id])
};

module.exports = { ForecastModel, HistoryModel, UserModel };