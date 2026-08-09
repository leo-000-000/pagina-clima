:root {
  --sky-deep: #0b1623; --sky-mid: #152238; --sky-accent: #1e3a5f;
  --ice: #c8dff5; --frost: #e8f2fc; --sun: #f0a500;
  --text-dim: rgba(200,223,245,0.55);
  --danger: #ef4444;
  --font-body: 'DM Sans', sans-serif;
  --font-display: 'DM Serif Display', serif;
  --radius: 14px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-body);
  background: var(--sky-deep); color: var(--frost);
  display: flex; min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 240px; min-height: 100vh;
  background: rgba(200,223,245,0.03);
  border-right: 1px solid rgba(200,223,245,0.08);
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0;
  z-index: 50;
}
.sidebar-logo {
  padding: 28px 24px; display: flex; align-items: center; gap: 10px;
  font-size: 1.05rem; font-weight: 500;
  border-bottom: 1px solid rgba(200,223,245,0.07);
}
.logo-icon { color: var(--sun); font-size: 1.3rem; }
.sidebar-badge {
  margin-left: auto; font-size: 0.65rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  background: rgba(240,165,0,0.12); color: var(--sun);
  border: 1px solid rgba(240,165,0,0.2);
  padding: 3px 8px; border-radius: 50px;
}
.sidebar-nav {
  flex: 1; padding: 20px 12px;
  display: flex; flex-direction: column; gap: 4px;
}
.snav-item {
  width: 100%; text-align: left;
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; border-radius: 10px;
  font-family: var(--font-body); font-size: 0.88rem; font-weight: 400;
  color: var(--text-dim); background: none; border: none; cursor: pointer;
  transition: all 0.2s;
}
.snav-item:hover { background: rgba(200,223,245,0.06); color: var(--frost); }
.snav-item.active {
  background: rgba(200,223,245,0.09);
  color: var(--frost); font-weight: 500;
  border: 1px solid rgba(200,223,245,0.10);
}
.snav-icon { font-size: 1.1rem; }
.sidebar-footer {
  padding: 20px 12px;
  border-top: 1px solid rgba(200,223,245,0.07);
  display: flex; flex-direction: column; gap: 8px;
}
.snav-external, .snav-logout {
  display: block; width: 100%; text-align: center;
  padding: 9px; border-radius: 10px; font-size: 0.83rem;
  cursor: pointer; transition: all 0.2s;
}
.snav-external {
  color: var(--text-dim); font-family: var(--font-body);
  border: 1px solid rgba(200,223,245,0.10); text-decoration: none;
}
.snav-external:hover { color: var(--frost); background: rgba(200,223,245,0.06); }
.snav-logout {
  color: #f87171; background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.15); font-family: var(--font-body);
}
.snav-logout:hover { background: rgba(239,68,68,0.14); }

/* ── MAIN ── */
.admin-main {
  flex: 1; margin-left: 240px; padding: 40px 48px;
  min-height: 100vh;
}
.admin-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 36px;
}
.admin-page-title {
  font-family: var(--font-display);
  font-size: 1.9rem; font-weight: 400;
  color: var(--frost); line-height: 1.2; margin-bottom: 6px;
}
.admin-page-sub { font-size: 0.85rem; color: var(--text-dim); }

/* ── BUTTONS ── */
.btn-primary {
  background: var(--sky-accent); color: var(--frost);
  border: 1px solid rgba(200,223,245,0.2);
  border-radius: 10px; padding: 11px 22px;
  font-family: var(--font-body); font-size: 0.88rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-primary:hover { background: #255a8f; }
.btn-secondary {
  background: rgba(200,223,245,0.07); color: var(--text-dim);
  border: 1px solid rgba(200,223,245,0.12);
  border-radius: 10px; padding: 11px 22px;
  font-family: var(--font-body); font-size: 0.88rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-secondary:hover { color: var(--frost); }
.btn-danger {
  background: rgba(239,68,68,0.12); color: #f87171;
  border: 1px solid rgba(239,68,68,0.22);
  border-radius: 10px; padding: 11px 22px;
  font-family: var(--font-body); font-size: 0.88rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-danger:hover { background: rgba(239,68,68,0.22); }
.btn-icon {
  background: none; border: 1px solid rgba(200,223,245,0.10);
  border-radius: 8px; padding: 6px 10px;
  font-size: 0.82rem; color: var(--text-dim); cursor: pointer; transition: all 0.2s;
}
.btn-icon:hover { border-color: rgba(200,223,245,0.25); color: var(--frost); }
.btn-icon.danger:hover { border-color: rgba(239,68,68,0.3); color: #f87171; }

/* ── SECTIONS ── */
.admin-section { display: none; }
.admin-section.active { display: block; }

/* ── TABLE ── */
.admin-table-wrap {
  background: rgba(200,223,245,0.04);
  border: 1px solid rgba(200,223,245,0.08);
  border-radius: 18px; overflow: hidden;
}
.admin-table {
  width: 100%; border-collapse: collapse;
}
.admin-table thead th {
  padding: 16px 20px; text-align: left;
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-dim);
  border-bottom: 1px solid rgba(200,223,245,0.07);
}
.admin-table tbody td {
  padding: 16px 20px; font-size: 0.875rem;
  border-bottom: 1px solid rgba(200,223,245,0.05);
  vertical-align: middle; color: rgba(232,242,252,0.85);
}
.admin-table tbody tr:last-child td { border-bottom: none; }
.admin-table tbody tr { transition: background 0.15s; }
.admin-table tbody tr:hover { background: rgba(200,223,245,0.04); }
.table-loading { text-align: center; color: var(--text-dim); padding: 40px !important; }
.table-thumb {
  width: 44px; height: 44px; object-fit: cover;
  border-radius: 8px;
}
.table-thumb-placeholder {
  width: 44px; height: 44px; border-radius: 8px;
  background: rgba(200,223,245,0.08);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.actions-cell { display: flex; gap: 6px; }
.badge {
  display: inline-block; padding: 3px 9px;
  border-radius: 50px; font-size: 0.72rem; font-weight: 500;
}
.badge-sun { background: rgba(240,165,0,0.12); color: var(--sun); }
.badge-role { background: rgba(200,223,245,0.08); color: var(--ice); }

/* ── MODAL ── */
.modal-overlay {
  display: none; position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  align-items: flex-start; justify-content: center;
  padding: 40px 24px; overflow-y: auto;
}
.modal-overlay.open { display: flex; }
.modal {
  width: 100%; max-width: 720px;
  background: #0e1d2e; border: 1px solid rgba(200,223,245,0.12);
  border-radius: 22px; overflow: hidden;
  animation: slideIn 0.25s cubic-bezier(0.22,1,0.36,1);
}
.modal-sm { max-width: 540px; }
.modal-xs { max-width: 420px; }
@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(200,223,245,0.08);
}
.modal-header h2 {
  font-family: var(--font-display); font-weight: 400;
  font-size: 1.35rem; color: var(--frost);
}
.modal-close {
  background: rgba(200,223,245,0.08); border: none;
  width: 32px; height: 32px; border-radius: 50%;
  color: var(--text-dim); cursor: pointer; font-size: 0.85rem;
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: rgba(200,223,245,0.16); color: var(--frost); }
.modal-body { padding: 28px 32px; max-height: 65vh; overflow-y: auto; }
.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid rgba(200,223,245,0.08);
  display: flex; justify-content: flex-end; gap: 12px;
}

/* ── FORMS ── */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-row.three-col { grid-template-columns: 1fr 1fr 1fr; }
.form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label {
  font-size: 0.73rem; font-weight: 600;
  letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--ice);
}
.form-group input,
.form-group select,
.form-group textarea {
  background: rgba(200,223,245,0.06);
  border: 1px solid rgba(200,223,245,0.12);
  border-radius: 10px; padding: 11px 14px;
  color: var(--frost); font-family: var(--font-body); font-size: 0.9rem;
  outline: none; transition: border-color 0.2s;
  resize: none;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: rgba(200,223,245,0.32);
}
.form-group select option { background: #0e1d2e; }
.form-group input::placeholder,
.form-group textarea::placeholder { color: var(--text-dim); }
.form-divider {
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--sun); padding: 20px 0 12px;
  border-bottom: 1px solid rgba(240,165,0,0.15); margin-bottom: 20px;
}
.checkbox-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.88rem; cursor: pointer;
  text-transform: none; letter-spacing: 0; color: var(--frost);
}
.checkbox-label input[type="checkbox"] { accent-color: var(--sun); width: 16px; height: 16px; }

/* Upload */
.upload-area {
  border: 2px dashed rgba(200,223,245,0.18); border-radius: 14px;
  padding: 40px 20px; text-align: center; cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
}
.upload-area:hover, .upload-area.dragover {
  border-color: rgba(200,223,245,0.4);
  background: rgba(200,223,245,0.04);
}
.upload-inner { pointer-events: none; }
.upload-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
.upload-inner p { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 4px; }
.upload-inner small { font-size: 0.78rem; color: rgba(200,223,245,0.35); }
.img-preview {
  position: relative; display: inline-block;
}
.img-preview img {
  width: 100%; max-height: 180px; object-fit: cover;
  border-radius: 12px;
}
.remove-img {
  position: absolute; top: 8px; right: 8px;
  background: rgba(11,22,35,0.8); border: none;
  color: var(--frost); border-radius: 50%;
  width: 28px; height: 28px; cursor: pointer;
  font-size: 0.8rem; display: flex; align-items: center; justify-content: center;
}
.remove-img:hover { background: rgba(239,68,68,0.6); }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 28px; right: 28px;
  background: #0e1d2e; border: 1px solid rgba(200,223,245,0.15);
  border-radius: 12px; padding: 14px 22px;
  font-size: 0.88rem; color: var(--frost);
  transform: translateY(80px); opacity: 0;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  z-index: 999; max-width: 320px;
}
.toast.show { transform: translateY(0); opacity: 1; }
.toast.success { border-color: rgba(34,197,94,0.3); color: #86efac; }
.toast.error   { border-color: rgba(239,68,68,0.3); color: #f87171; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
  .admin-main { margin-left: 0; padding: 24px; }
  .form-row, .form-row.three-col { grid-template-columns: 1fr; }
}
