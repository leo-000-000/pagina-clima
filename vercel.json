/* ─── GRÁFICOS HISTÓRICOS ────────────────────────────────────────────────── */

let mainChart = null;
let historyData = [];

const CHART_COLORS = {
  temp:     { line: '#f0a500', fill: 'rgba(240,165,0,0.08)' },
  humidity: { line: '#5b8fbf', fill: 'rgba(91,143,191,0.08)' },
  precip:   { line: '#c8dff5', fill: 'rgba(200,223,245,0.08)' },
};

const CHART_LABELS = {
  temp:     'Temperatura (°C)',
  humidity: 'Humedad (%)',
  precip:   'Precipitaciones (mm)',
};

const CHART_FIELDS = {
  temp:     'temperature',
  humidity: 'humidity',
  precip:   'precipitation',
};

async function loadHistory() {
  try {
    const res = await fetch('/api/weather/history?days=30');
    const { data } = await res.json();
    historyData = data || [];
    renderChart('temp');
  } catch (err) {
    console.error('Error cargando históricos:', err);
  }
}

function renderChart(type) {
  const canvas = document.getElementById('mainChart');
  if (!canvas) return;

  const labels = historyData.map(d => {
    const date = new Date(d.record_date + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  });

  const field = CHART_FIELDS[type];
  const values = historyData.map(d => d[field] != null ? parseFloat(d[field]) : null);
  const color = CHART_COLORS[type];

  if (mainChart) {
    mainChart.destroy();
    mainChart = null;
  }

  const ctx = canvas.getContext('2d');

  mainChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: CHART_LABELS[type],
        data: values,
        borderColor: color.line,
        backgroundColor: color.fill,
        pointBackgroundColor: color.line,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        spanGaps: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,22,35,0.92)',
          borderColor: 'rgba(200,223,245,0.12)',
          borderWidth: 1,
          titleColor: '#c8dff5',
          bodyColor: '#e8f2fc',
          padding: 12,
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              if (val == null) return 'Sin datos';
              const units = { temp: '°C', humidity: '%', precip: ' mm' };
              return ` ${val.toFixed(1)}${units[type] || ''}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(200,223,245,0.04)' },
          ticks: {
            color: 'rgba(200,223,245,0.45)',
            font: { size: 11, family: 'DM Sans' },
            maxTicksLimit: 10,
          }
        },
        y: {
          grid: { color: 'rgba(200,223,245,0.06)' },
          ticks: {
            color: 'rgba(200,223,245,0.45)',
            font: { size: 11, family: 'DM Sans' },
            callback: (val) => {
              const units = { temp: '°C', humidity: '%', precip: 'mm' };
              return `${val} ${units[type] || ''}`;
            }
          }
        }
      }
    }
  });
}

/* ─── TABS ───────────────────────────────────────────────────────────────── */
document.querySelectorAll('.chart-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderChart(btn.dataset.chart);
  });
});

document.addEventListener('DOMContentLoaded', loadHistory);
