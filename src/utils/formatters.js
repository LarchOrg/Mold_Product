// ── Number formatters ─────────────────────────────────────────────────────────
export const formatNumber = (n) =>
  new Intl.NumberFormat('en-IN').format(n ?? 0);

export const formatPercent = (n, decimals = 0) =>
  `${Number(n ?? 0).toFixed(decimals)}%`;

// ── Date formatters ───────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

export const toInputDate = (dateStr) =>
  dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

// ── Shot life helpers ─────────────────────────────────────────────────────────
export function getShotLifePercent(mould) {
  const opening = Number(mould.openingShot || 0);
  const current = Number(mould.currentShot || 0);
  const life    = Number(mould.lifeShot || 0);

  const used  = current - opening;
  const total = life - opening;

  if (total <= 0) return 0;

  return Math.min(100, Math.round((used / total) * 100));
}

export function getShotLifeColor(pct) {
  if (pct >= 85) return 'var(--red)';
  if (pct >= 60) return 'var(--amber)';
  return 'var(--green)';
}

export function getShotLifeBarClass(pct) {
  if (pct >= 85) return 'red';
  if (pct >= 60) return 'amber';
  return 'green';
}

// ── Validators ────────────────────────────────────────────────────────────────
export const required = (v) => (v && String(v).trim() ? undefined : 'Required');

export const positiveNumber = (v) =>
  v > 0 ? undefined : 'Must be a positive number';

// ── Report number generator ───────────────────────────────────────────────────
export const genReportNo = (prefix, count) =>
  `${prefix}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

// ── Category labels ───────────────────────────────────────────────────────────
export const CATEGORY_LABELS = {
  A: 'A - Critical (High Risk)',
  B: 'B - Semi-Critical (Medium Risk)',
  C: 'C - Non-Critical (Low Risk)',
};

export const PM_FREQ_OPTIONS = ['Monthly', 'Quarterly', 'HalfYearly', 'Yearly'];
