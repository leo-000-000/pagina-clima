/* ─── NAVBAR SCROLL ─────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── REVEAL ON SCROLL ───────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      revealObserver.unobserve(el.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}
function tempStr(t) { return t != null ? `${parseFloat(t).toFixed(1)}°C` : '—'; }
function windStr(s, dir) {
  let str = s != null ? `${parseFloat(s).toFixed(0)} km/h` : '—';
  if (dir) str += ` ${dir}`;
  return str;
}

const conditionImages = {
  'Despejado':           'https://images.unsplash.com/photo-1504608524841-42584120d693?w=900&q=85',
  'Parcialmente nublado':'https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?w=900&q=85',
  'Nublado':             'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=900&q=85',
  'Lluvioso':            'https://images.unsplash.com/photo-1515694346937-94d85e41e93e?w=900&q=85',
  'Tormenta':            'https://images.unsplash.com/photo-1472145246862-b24cf25495bf?w=900&q=85',
};
function getFallbackImage(condition) {
  return conditionImages[condition] || conditionImages['Despejado'];
}

/* ─── CARGAR PRONÓSTICO ACTUAL ───────────────────────────────────────────── */
async function loadCurrent() {
  try {
    const res = await fetch('/api/weather/current');
    const { data } = await res.json();

    const today = new Date();
    document.getElementById('hero-date').textContent =
      today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (!data) {
      document.getElementById('hero-title').textContent = 'Sin pronóstico disponible por el momento.';
      return;
    }

    document.getElementById('hero-temp').textContent = data.temperature != null ? `${Math.round(data.temperature)}°` : '—';
    document.getElementById('hero-condition').textContent = data.weather_condition || '—';
    document.getElementById('hero-feels').textContent = data.feels_like != null ? `Sensación: ${tempStr(data.feels_like)}` : '';
    document.getElementById('hero-title').textContent = data.title || '';
    document.getElementById('hero-desc').textContent = data.description || '';

    document.getElementById('stat-humidity').textContent = data.humidity != null ? `${data.humidity}%` : '—';
    document.getElementById('stat-wind').textContent = windStr(data.wind_speed, data.wind_direction);
    document.getElementById('stat-precip').textContent = data.precipitation != null ? `${data.precipitation} mm` : '—';
    document.getElementById('stat-pressure').textContent = data.pressure != null ? `${data.pressure} hPa` : '—';

    document.getElementById('detail-uv').textContent = data.uv_index != null ? `${data.uv_index}` : '—';
    document.getElementById('detail-vis').textContent = data.visibility != null ? `${data.visibility} km` : '—';
    document.getElementById('detail-min').textContent = tempStr(data.temp_min);
    document.getElementById('detail-max').textContent = tempStr(data.temp_max);
    document.getElementById('detail-wind-dir').textContent = data.wind_direction || '—';

    // Imagen hero
    const heroImg = document.getElementById('hero-img');
    heroImg.src = data.image_url || getFallbackImage(data.weather_condition);
    heroImg.alt = data.title || 'Clima actual';

    // Notas adicionales
    if (data.additional_notes) {
      document.getElementById('notes-text').textContent = data.additional_notes;
      document.getElementById('notes-section').style.display = '';
    }

    // Aplicar gradiente según condición
    applyConditionTheme(data.weather_condition);

  } catch (err) {
    console.error('Error cargando pronóstico actual:', err);
  }
}

function applyConditionTheme(condition) {
  const heroEl = document.querySelector('.hero');
  const themes = {
    'Tormenta':  'linear-gradient(135deg, #0a1520 0%, #0e1e30 60%, #131e30 100%)',
    'Lluvioso':  'linear-gradient(135deg, #0c1825 0%, #132438 60%, #183050 100%)',
    'Despejado': 'linear-gradient(135deg, #0b1623 0%, #152238 60%, #1e3a5f 100%)',
  };
  if (themes[condition]) heroEl.style.background = themes[condition];
}

/* ─── CARGAR PRÓXIMOS DÍAS ───────────────────────────────────────────────── */
async function loadUpcoming() {
  try {
    const res = await fetch('/api/weather/upcoming?days=5');
    const { data } = await res.json();
    const grid = document.getElementById('forecast-grid');

    if (!data || data.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-dim); font-size:.9rem;">No hay pronósticos disponibles.</p>';
      return;
    }

    grid.innerHTML = data.map(f => `
      <div class="forecast-card">
        ${f.image_url
          ? `<img class="fc-image" src="${f.image_url}" alt="${f.title}" loading="lazy">`
          : `<img class="fc-image" src="${getFallbackImage(f.weather_condition)}" alt="${f.weather_condition || 'Clima'}" loading="lazy">`
        }
        <p class="fc-date">${formatShortDate(f.forecast_date)}</p>
        <p class="fc-condition">${f.weather_condition || '—'}</p>
        <div class="fc-temp">${f.temperature != null ? `${Math.round(f.temperature)}°` : '—'}</div>
        <p class="fc-title">${f.title}</p>
        <div class="fc-range">
          <span>⬇ ${tempStr(f.temp_min)}</span>
          <span>⬆ ${tempStr(f.temp_max)}</span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error cargando próximos días:', err);
  }
}

/* ─── INIT ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadCurrent();
  loadUpcoming();
});
