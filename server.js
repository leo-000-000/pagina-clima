require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/database');
const { attachUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARES ─────────────────────────────────────────────────────────────

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones persistidas en SQLite
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './' }),
  secret: process.env.SESSION_SECRET || 'super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8 // 8 horas
  }
}));

app.use(attachUser);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ─── RUTAS API ───────────────────────────────────────────────────────────────

app.use('/api', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));

// Ruta admin protegida - redirige al panel si tiene sesión
app.get('/admin', (req, res) => {
  if (!req.session?.user) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Fallback: index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── INICIO ──────────────────────────────────────────────────────────────────

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
