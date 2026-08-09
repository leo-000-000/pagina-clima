/* ─── ESTADO ─────────────────────────────────────────────────────────────── */
let currentSection = 'forecasts';
let editingForecastId = null;
let editingHistoryId = null;
let pendingDeleteFn = null;
let currentImageUrl = null;

/* ─── TOAST ──────────────────────────────────────────────────────────────── */
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => { el.classList.remove('show'); }, 3200);
}

/* ─── API HELPER ─────────────────────────────────────────────────────────── */
async function api(url, opts = {}) {
  const res = await fetch(url, { ...opts, credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
}

/* ─── NAVEGACIÓN ─────────────────────────────────────────────────────────── */
const sectionMeta = {
  forecasts: { title: 'Pronósticos', sub: 'Gestioná los pronósticos del tiempo', btn: '+ Nuevo pronóstico' },
  history:   { title: 'Históricos', sub: 'Registros históricos de clima', btn: '+ Nuevo registro' },
  users:     { title: 'Usuarios', sub: 'Administradores del sistema', btn: '+ Nuevo admin' },
};

document.querySelectorAll('.snav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    currentSection = btn.dataset.section;
    document.querySelectorAll('.snav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${currentSection}`).classList.add('active');
    const meta = sectionMeta[currentSection];
    document.getElementById('pageTitle').textContent = meta.title;
    document.getElementById('pageSub').textContent = meta.sub;
    document.getElementById('btnCreate').textContent = meta.btn;
    loadSection(currentSection);
  });
});

document.getElementById('btnCreate').addEventListener('click', () => {
  if (currentSection === 'forecasts') openForecastModal();
  else if (currentSection === 'history') openHistoryModal();
  else if (currentSection === 'users') openUserModal();
});

function loadSection(s) {
  if (s === 'forecasts') loadForecasts();
  else if (s === 'history') loadHistory();
  else if (s === 'users') loadUsers();
}

/* ─── LOGOUT ─────────────────────────────────────────────────────────────── */
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

/* ═══════════════════════════════════════════════════════════════════════════
   PRONÓSTICOS
═══════════════════════════════════════════════════════════════════════════ */
async function loadForecasts() {
  try {
    const { data } = await api('/api/admin/forecasts');
    const tbody = document.getElementById('forecastsBody');
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-loading">Sin pronósticos. Creá el primero.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(f => `
      <tr>
        <td>${formatDate(f.forecast_date)}</td>
        <td style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.title}</td>
        <td>${f.weather_condition ? `<span class="badge badge-sun">${f.weather_condition}</span>` : '—'}</td>
        <td>${f.temperature != null ? `${parseFloat(f.temperature).toFixed(1)}°C` : '—'}</td>
        <td>${f.image_url
          ? `<img class="table-thumb" src="${f.image_url}" alt="img">`
          : `<span class="table-thumb-placeholder">🌤️</span>`}</td>
        <td style="color:var(--text-dim)">${f.author || '—'}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" onclick="editForecast(${f.id})">Editar</button>
            <button class="btn-icon danger" onclick="deleteForecast(${f.id}, '${escHtml(f.title)}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    toast('Error cargando pronósticos', 'error');
  }
}

function openForecastModal(data = null) {
  editingForecastId = data?.id || null;
  currentImageUrl = data?.image_url || null;
  document.getElementById('modalTitle').textContent = data ? 'Editar pronóstico' : 'Nuevo pronóstico';
  document.getElementById('fId').value = data?.id || '';
  document.getElementById('fTitle').value = data?.title || '';
  document.getElementById('fDate').value = data?.forecast_date || new Date().toISOString().split('T')[0];
  document.getElementById('fCondition').value = data?.weather_condition || '';
  document.getElementById('fDesc').value = data?.description || '';
  document.getElementById('fTemp').value = data?.temperature || '';
  document.getElementById('fFeels').value = data?.feels_like || '';
  document.getElementById('fTempMin').value = data?.temp_min || '';
  document.getElementById('fTempMax').value = data?.temp_max || '';
  document.getElementById('fHumidity').value = data?.humidity || '';
  document.getElementById('fWind').value = data?.wind_speed || '';
  document.getElementById('fWindDir').value = data?.wind_direction || '';
  document.getElementById('fPrecip').value = data?.precipitation || '';
  document.getElementById('fPressure').value = data?.pressure || '';
  document.getElementById('fUV').value = data?.uv_index || '';
  document.getElementById('fVisibility').value = data?.visibility || '';
  document.getElementById('fNotes').value = data?.additional_notes || '';
  document.getElementById('fFeatured').checked = !!data?.is_featured;

  // Preview imagen
  const uploadArea = document.getElementById('uploadArea');
  const previewWrap = document.getElementById('imgPreview');
  const previewImg = document.getElementById('previewImg');
  document.getElementById('fImage').value = '';
  if (data?.image_url) {
    previewImg.src = data.image_url;
    uploadArea.style.display = 'none';
    previewWrap.style.display = 'block';
  } else {
    uploadArea.style.display = 'block';
    previewWrap.style.display = 'none';
  }

  document.getElementById('forecastModal').classList.add('open');
}

async function editForecast(id) {
  try {
    const { data } = await api(`/api/admin/forecasts/${id}`);
    openForecastModal(data);
  } catch {
    toast('Error cargando datos del pronóstico', 'error');
  }
}

function deleteForecast(id, title) {
  pendingDeleteFn = async () => {
    try {
      await api(`/api/admin/forecasts/${id}`, { method: 'DELETE' });
      toast('Pronóstico eliminado');
      loadForecasts();
    } catch (err) {
      toast(err.message, 'error');
    }
  };
  document.getElementById('deleteMsg').textContent = `¿Eliminás el pronóstico "${title}"? Esta acción no se puede deshacer.`;
  document.getElementById('deleteModal').classList.add('open');
}

document.getElementById('saveForecast').addEventListener('click', async () => {
  const formData = new FormData();
  const fields = {
    title: 'fTitle', forecast_date: 'fDate', weather_condition: 'fCondition',
    description: 'fDesc', temperature: 'fTemp', feels_like: 'fFeels',
    temp_min: 'fTempMin', temp_max: 'fTempMax', humidity: 'fHumidity',
    wind_speed: 'fWind', wind_direction: 'fWindDir', precipitation: 'fPrecip',
    pressure: 'fPressure', uv_index: 'fUV', visibility: 'fVisibility',
    additional_notes: 'fNotes'
  };

  for (const [key, id] of Object.entries(fields)) {
    const val = document.getElementById(id).value;
    if (val !== '') formData.append(key, val);
  }
  formData.append('is_featured', document.getElementById('fFeatured').checked ? '1' : '0');

  const imageFile = document.getElementById('fImage').files[0];
  if (imageFile) formData.append('image', imageFile);

  try {
    const btn = document.getElementById('saveForecast');
    btn.disabled = true; btn.textContent = 'Guardando...';
    const method = editingForecastId ? 'PUT' : 'POST';
    const url = editingForecastId
      ? `/api/admin/forecasts/${editingForecastId}`
      : '/api/admin/forecasts';
    await fetch(url, { method, body: formData, credentials: 'include' });
    toast(editingForecastId ? 'Pronóstico actualizado' : 'Pronóstico creado');
    document.getElementById('forecastModal').classList.remove('open');
    loadForecasts();
  } catch (err) {
    toast('Error al guardar', 'error');
  } finally {
    const btn = document.getElementById('saveForecast');
    btn.disabled = false; btn.textContent = 'Guardar pronóstico';
  }
});

// Upload drag & drop
const uploadArea = document.getElementById('uploadArea');
const fImage = document.getElementById('fImage');
uploadArea.addEventListener('click', () => fImage.click());
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault(); uploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleImageFile(file);
});
fImage.addEventListener('change', () => {
  if (fImage.files[0]) handleImageFile(fImage.files[0]);
});
function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('imgPreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}
document.getElementById('removeImg').addEventListener('click', () => {
  fImage.value = '';
  currentImageUrl = null;
  document.getElementById('uploadArea').style.display = 'block';
  document.getElementById('imgPreview').style.display = 'none';
});

/* ═══════════════════════════════════════════════════════════════════════════
   HISTÓRICOS
═══════════════════════════════════════════════════════════════════════════ */
async function loadHistory() {
  try {
    const { data } = await api('/api/admin/history');
    const tbody = document.getElementById('historyBody');
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-loading">Sin registros históricos.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(h => `
      <tr>
        <td>${formatDate(h.record_date)}</td>
        <td>${h.temperature != null ? `${parseFloat(h.temperature).toFixed(1)}°C` : '—'}</td>
        <td style="color:var(--text-dim)">${h.temp_min != null ? `${parseFloat(h.temp_min).toFixed(1)}° / ` : ''}${h.temp_max != null ? `${parseFloat(h.temp_max).toFixed(1)}°` : '—'}</td>
        <td>${h.humidity != null ? `${h.humidity}%` : '—'}</td>
        <td>${h.wind_speed != null ? `${parseFloat(h.wind_speed).toFixed(0)} km/h` : '—'}</td>
        <td>${h.precipitation != null ? `${parseFloat(h.precipitation).toFixed(1)} mm` : '—'}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" onclick="editHistory(${h.id})">Editar</button>
            <button class="btn-icon danger" onclick="deleteHistory(${h.id}, '${formatDate(h.record_date)}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch {
    toast('Error cargando históricos', 'error');
  }
}

function openHistoryModal(data = null) {
  editingHistoryId = data?.id || null;
  document.getElementById('historyModalTitle').textContent = data ? 'Editar registro' : 'Nuevo registro histórico';
  document.getElementById('hId').value = data?.id || '';
  document.getElementById('hDate').value = data?.record_date || new Date().toISOString().split('T')[0];
  document.getElementById('hCondition').value = data?.weather_condition || '';
  document.getElementById('hTemp').value = data?.temperature || '';
  document.getElementById('hTempMin').value = data?.temp_min || '';
  document.getElementById('hTempMax').value = data?.temp_max || '';
  document.getElementById('hHumidity').value = data?.humidity || '';
  document.getElementById('hWind').value = data?.wind_speed || '';
  document.getElementById('hPrecip').value = data?.precipitation || '';
  document.getElementById('historyModal').classList.add('open');
}

async function editHistory(id) {
  try {
    const { data } = await api('/api/admin/history');
    const rec = data.find(h => h.id === id);
    openHistoryModal(rec);
  } catch {
    toast('Error cargando registro', 'error');
  }
}

function deleteHistory(id, label) {
  pendingDeleteFn = async () => {
    try {
      await api(`/api/admin/history/${id}`, { method: 'DELETE' });
      toast('Registro eliminado');
      loadHistory();
    } catch (err) { toast(err.message, 'error'); }
  };
  document.getElementById('deleteMsg').textContent = `¿Eliminás el registro del ${label}?`;
  document.getElementById('deleteModal').classList.add('open');
}

document.getElementById('saveHistory').addEventListener('click', async () => {
  const body = {
    record_date: document.getElementById('hDate').value,
    weather_condition: document.getElementById('hCondition').value,
    temperature: document.getElementById('hTemp').value,
    temp_min: document.getElementById('hTempMin').value,
    temp_max: document.getElementById('hTempMax').value,
    humidity: document.getElementById('hHumidity').value,
    wind_speed: document.getElementById('hWind').value,
    precipitation: document.getElementById('hPrecip').value,
  };
  try {
    const method = editingHistoryId ? 'PUT' : 'POST';
    const url = editingHistoryId ? `/api/admin/history/${editingHistoryId}` : '/api/admin/history';
    await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    toast(editingHistoryId ? 'Registro actualizado' : 'Registro creado');
    document.getElementById('historyModal').classList.remove('open');
    loadHistory();
  } catch (err) { toast(err.message, 'error'); }
});

/* ═══════════════════════════════════════════════════════════════════════════
   USUARIOS
═══════════════════════════════════════════════════════════════════════════ */
async function loadUsers() {
  try {
    const { data } = await api('/api/admin/users');
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = data.map(u => `
      <tr>
        <td><strong>${u.username}</strong></td>
        <td style="color:var(--text-dim)">${u.email}</td>
        <td><span class="badge badge-role">${u.role}</span></td>
        <td style="color:var(--text-dim)">${formatDate(u.created_at?.split('T')[0])}</td>
        <td>
          <button class="btn-icon danger" onclick="deleteUser(${u.id}, '${u.username}')">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch { toast('Error cargando usuarios', 'error'); }
}

function openUserModal() {
  document.getElementById('uUsername').value = '';
  document.getElementById('uEmail').value = '';
  document.getElementById('uPassword').value = '';
  document.getElementById('userModal').classList.add('open');
}

function deleteUser(id, username) {
  pendingDeleteFn = async () => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      toast('Usuario eliminado');
      loadUsers();
    } catch (err) { toast(err.message, 'error'); }
  };
  document.getElementById('deleteMsg').textContent = `¿Eliminás al usuario "${username}"? Perderá acceso al panel.`;
  document.getElementById('deleteModal').classList.add('open');
}

document.getElementById('saveUser').addEventListener('click', async () => {
  const body = {
    username: document.getElementById('uUsername').value.trim(),
    email: document.getElementById('uEmail').value.trim(),
    password: document.getElementById('uPassword').value,
  };
  try {
    await api('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    toast('Administrador creado');
    document.getElementById('userModal').classList.remove('open');
    loadUsers();
  } catch (err) { toast(err.message, 'error'); }
});

/* ─── MODALES: CERRAR ────────────────────────────────────────────────────── */
[
  ['closeForecastModal', 'forecastModal'],
  ['cancelForecast',     'forecastModal'],
  ['closeHistoryModal',  'historyModal'],
  ['cancelHistory',      'historyModal'],
  ['closeUserModal',     'userModal'],
  ['cancelUser',         'userModal'],
  ['closeDeleteModal',   'deleteModal'],
  ['cancelDelete',       'deleteModal'],
].forEach(([btnId, modalId]) => {
  document.getElementById(btnId)?.addEventListener('click', () => {
    document.getElementById(modalId).classList.remove('open');
  });
});

document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (pendingDeleteFn) {
    document.getElementById('deleteModal').classList.remove('open');
    await pendingDeleteFn();
    pendingDeleteFn = null;
  }
});

// Cerrar modal al hacer click en overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function escHtml(str) {
  return String(str).replace(/['"&<>]/g, c => ({'\'':'&#39;','"':'&quot;','&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

/* ─── INIT ───────────────────────────────────────────────────────────────── */
loadForecasts();
