const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ForecastModel, HistoryModel, UserModel } = require('../models/weatherModel');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/uploads');

router.use(requireAuth);

// Convierte buffer de imagen a data URL base64 para guardar en DB
function bufferToDataUrl(file) {
  if (!file) return null;
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}

// ─── PRONÓSTICOS ─────────────────────────────────────────────────────────────

router.get('/forecasts', async (req, res) => {
  try { res.json({ data: await ForecastModel.getAll() }); }
  catch { res.status(500).json({ error: 'Error al obtener pronósticos' }); }
});

router.get('/forecasts/:id', async (req, res) => {
  try {
    const f = await ForecastModel.getById(req.params.id);
    if (!f) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: f });
  } catch { res.status(500).json({ error: 'Error' }); }
});

router.post('/forecasts', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.title || !data.forecast_date)
      return res.status(400).json({ error: 'Título y fecha son requeridos' });

    if (req.file) {
      data.image_url = bufferToDataUrl(req.file);
    }

    data.created_by = req.session.user.id;
    data.is_featured = data.is_featured === 'true' || data.is_featured === '1' ? 1 : 0;

    const result = await ForecastModel.create(data);
    res.status(201).json({ success: true, id: result.lastID });
  } catch (err) {
    console.error('Error crear pronóstico:', err);
    res.status(500).json({ error: 'Error al crear pronóstico' });
  }
});

router.put('/forecasts/:id', upload.single('image'), async (req, res) => {
  try {
    const existing = await ForecastModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'No encontrado' });

    const data = { ...req.body };
    data.is_featured = data.is_featured === 'true' || data.is_featured === '1' ? 1 : 0;

    if (req.file) {
      data.image_url = bufferToDataUrl(req.file);
    }

    await ForecastModel.update(req.params.id, data);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al actualizar' }); }
});

router.delete('/forecasts/:id', async (req, res) => {
  try {
    const existing = await ForecastModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'No encontrado' });
    await ForecastModel.delete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al eliminar' }); }
});

// ─── HISTÓRICOS ──────────────────────────────────────────────────────────────

router.get('/history', async (req, res) => {
  try { res.json({ data: await HistoryModel.getAll() }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

router.post('/history', async (req, res) => {
  try {
    if (!req.body.record_date) return res.status(400).json({ error: 'Fecha requerida' });
    const r = await HistoryModel.create(req.body);
    res.status(201).json({ success: true, id: r.lastID });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un registro para esa fecha' });
    res.status(500).json({ error: 'Error al crear' });
  }
});

router.put('/history/:id', async (req, res) => {
  try { await HistoryModel.update(req.params.id, req.body); res.json({ success: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

router.delete('/history/:id', async (req, res) => {
  try { await HistoryModel.delete(req.params.id); res.json({ success: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

// ─── USUARIOS ────────────────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  try { res.json({ data: await UserModel.getAll() }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

router.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Todos los campos son requeridos' });
    const hashed = await bcrypt.hash(password, 10);
    const r = await UserModel.create(username, email, hashed);
    res.status(201).json({ success: true, id: r.lastID });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Usuario o email ya existe' });
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.session.user.id)
      return res.status(400).json({ error: 'No podés eliminarte a vos mismo' });
    await UserModel.delete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error' }); }
});

module.exports = router;
