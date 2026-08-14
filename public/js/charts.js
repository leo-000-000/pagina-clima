/* ─── GRÁFICOS HISTÓRICOS ────────────────────────────────────────────────── */

let mainChart = null;
let historyData = [];

const CHART_COLORS = {
  temp:     { line: '#e67e22', fill: 'rgba(230,126,34,0.12)' },
  humidity: { line: '#2980b9', fill: 'rgba(41,128,185,0.12)' },
  precip:   { line: '#27ae60', fill: 'rgba(39,174,96,0.12)' },
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
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderColor: 'rgba(74,144,196,0.3)',
          borderWidth: 1,
          titleColor: '#1a3a52',
          bodyColor: '#1a5276',
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
          grid: { color: 'rgba(74,144,196,0.1)' },
          ticks: {
            color: 'rgba(30,80,120,0.6)',
            font: { size: 11, family: 'DM Sans' },
            maxTicksLimit: 10,
          }
        },
        y: {
          grid: { color: 'rgba(74,144,196,0.1)' },
          ticks: {
            color: 'rgba(30,80,120,0.6)',
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
