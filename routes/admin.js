const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { ForecastModel, HistoryModel, UserModel } = require('../models/weatherModel');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/uploads');

// Todos los endpoints requieren autenticación
router.use(requireAuth);

// ─── PRONÓSTICOS ─────────────────────────────────────────────────────────────

// Listar todos
router.get('/forecasts', async (req, res) => {
  try {
    const forecasts = await ForecastModel.getAll();
    res.json({ data: forecasts });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pronósticos' });
  }
});

// Obtener uno por ID
router.get('/forecasts/:id', async (req, res) => {
  try {
    const forecast = await ForecastModel.getById(req.params.id);
    if (!forecast) return res.status(404).json({ error: 'Pronóstico no encontrado' });
    res.json({ data: forecast });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pronóstico' });
  }
});

// Crear nuevo
router.post('/forecasts', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };

    // Validaciones básicas
    if (!data.title || !data.forecast_date) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Título y fecha son requeridos' });
    }

    if (req.file) {
      data.image_url = '/uploads/' + req.file.filename;
    }

    data.created_by = req.session.user.id;
    data.is_featured = data.is_featured === 'true' || data.is_featured === '1' ? 1 : 0;

    const result = await ForecastModel.create(data);
    res.status(201).json({ success: true, id: result.lastID });
  } catch (err) {
    console.error('Error crear pronóstico:', err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error al crear pronóstico' });
  }
});

// Actualizar
router.put('/forecasts/:id', upload.single('image'), async (req, res) => {
  try {
    const existing = await ForecastModel.getById(req.params.id);
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Pronóstico no encontrado' });
    }

    const data = { ...req.body };
    data.is_featured = data.is_featured === 'true' || data.is_featured === '1' ? 1 : 0;

    if (req.file) {
      // Eliminar imagen anterior si existe
      if (existing.image_url) {
        const oldPath = path.join(__dirname, '..', 'public', existing.image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image_url = '/uploads/' + req.file.filename;
    }

    await ForecastModel.update(req.params.id, data);
    res.json({ success: true });
  } catch (err) {
    console.error('Error actualizar pronóstico:', err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error al actualizar pronóstico' });
  }
});

// Eliminar
router.delete('/forecasts/:id', async (req, res) => {
  try {
    const existing = await ForecastModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Pronóstico no encontrado' });

    // Eliminar imagen si existe
    if (existing.image_url) {
      const imgPath = path.join(__dirname, '..', 'public', existing.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await ForecastModel.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar pronóstico' });
  }
});

// ─── HISTÓRICOS ──────────────────────────────────────────────────────────────

router.get('/history', async (req, res) => {
  try {
    const history = await HistoryModel.getAll();
    res.json({ data: history });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener históricos' });
  }
});

router.post('/history', async (req, res) => {
  try {
    if (!req.body.record_date) return res.status(400).json({ error: 'Fecha requerida' });
    const result = await HistoryModel.create(req.body);
    res.status(201).json({ success: true, id: result.lastID });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe un registro para esa fecha' });
    }
    res.status(500).json({ error: 'Error al crear registro histórico' });
  }
});

router.put('/history/:id', async (req, res) => {
  try {
    await HistoryModel.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar registro' });
  }
});

router.delete('/history/:id', async (req, res) => {
  try {
    await HistoryModel.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

// ─── USUARIOS ────────────────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await UserModel.create(username, email, hashed);
    res.status(201).json({ success: true, id: result.lastID });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Usuario o email ya existe' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    // No puede eliminarse a sí mismo
    if (parseInt(req.params.id) === req.session.user.id) {
      return res.status(400).json({ error: 'No podés eliminar tu propio usuario' });
    }
    await UserModel.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
