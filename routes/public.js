const express = require('express');
const router = express.Router();
const { ForecastModel, HistoryModel } = require('../models/weatherModel');

// Pronóstico actual (más cercano a hoy, o el destacado)
router.get('/weather/current', async (req, res) => {
  try {
    const forecast = await ForecastModel.getCurrent();
    if (!forecast) return res.json({ data: null });
    res.json({ data: forecast });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pronóstico actual' });
  }
});

// Próximos días
router.get('/weather/upcoming', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 5;
    const forecasts = await ForecastModel.getUpcoming(days);
    res.json({ data: forecasts });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pronósticos' });
  }
});

// Datos históricos para gráficos
router.get('/weather/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await HistoryModel.getRecent(days);
    res.json({ data: history.reverse() }); // cronológico
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener históricos' });
  }
});

module.exports = router;
