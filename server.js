require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const path = require('path');
const { initializeDatabase, pool } = require('./config/database');
const { attachUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(attachUser);
app.use(express.static(path.join(__dirname, 'public')));

// Setup ANTES de las rutas API
app.get('/api/setup', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ success: true, message: 'Base de datos inicializada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/public'));
app.use('/auth', require('./routes/auth'));

app.get('/admin', (req, res) => {
  if (!req.session?.user) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🌤️  Clima Web corriendo en http://localhost:${PORT}`);
      console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
      console.log(`🔑 Login: admin / admin123\n`);
    });
  }).catch(err => {
    console.error('Error inicializando DB:', err);
    process.exit(1);
  });
}

module.exports = app;