* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

body {
  background: #f3f7fb;
  color: #1d2a39;
}

.hidden {
  display: none !important;
}

.auth-view {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #101d36, #2b4d7a);
}

.login-card {
  width: min(420px, 90vw);
  background: #fff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.brand-block {
  text-align: center;
  margin-bottom: 1.2rem;
}

.brand-block h1 {
  color: #1d4f91;
  font-size: 2rem;
}

.brand-block p {
  color: #5d6b7e;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.field-group label {
  font-weight: bold;
}

input, select, button {
  border-radius: 10px;
  border: 1px solid #d6dce5;
  padding: 0.8rem 0.9rem;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: 2px solid rgba(29, 79, 145, 0.18);
  border-color: #1d4f91;
}

.primary-btn, .secondary-btn {
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary-btn {
  background: #1d4f91;
  color: white;
  width: 100%;
  font-weight: bold;
}

.secondary-btn {
  background: #eef3f9;
  color: #1d2a39;
  font-weight: bold;
}

.primary-btn:hover, .secondary-btn:hover {
  opacity: 0.96;
}

.message {
  min-height: 1.5rem;
  margin-top: 1rem;
  color: #b42318;
  font-size: 0.95rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0e1d32;
  color: white;
  padding: 1rem 1.5rem;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-tabs {
  background: #ffffff;
  border-bottom: 1px solid #dde5ef;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  padding: 0.9rem 1.5rem;
}

.nav-btn {
  background: #edf3fb;
  color: #1d2a39;
  border: 1px solid #dfe8f5;
  padding: 0.7rem 1rem;
  cursor: pointer;
  font-weight: 600;
}

.nav-btn.active {
  background: #1d4f91;
  color: white;
}

.content {
  padding: 1.5rem;
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border: 1px solid #dfe8f5;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 8px 20px rgba(26, 51, 87, 0.05);
}

.stat-card span {
  display: block;
  color: #5d6b7e;
  margin-bottom: 0.6rem;
}

.stat-card strong {
  font-size: 2rem;
  color: #0d1b2a;
}

.panel-header {
  margin: 0.5rem 0 1rem;
}

.entry-form {
  background: white;
  border: 1px solid #dde5ef;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.table-wrap {
  background: white;
  border: 1px solid #dde5ef;
  border-radius: 12px;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid #edf1f5;
  text-align: left;
  vertical-align: top;
}

th {
  background: #f5f8fc;
  color: #27364a;
}

tr:last-child td {
  border-bottom: none;
}

.action-btn {
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  margin-right: 0.4rem;
  font-weight: 600;
}

.edit-btn {
  background: #e7f0ff;
  color: #1d4f91;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
}

.status-label {
  display: inline-block;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-paid,
.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-pending,
.status-inactive {
  background: #fef3c7;
  color: #92400e;
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .nav-tabs {
    gap: 0.5rem;
  }
}
