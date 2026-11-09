const MR_DIGITS = '०१२३४५६७८९';
export const toMrDigits = (v) => String(v ?? '').replace(/[0-9]/g, (d) => MR_DIGITS[d]);

export const money = (v) =>
  '₹ ' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null);

export const fmtDate = (v) => {
  const d = toDate(v);
  if (!d || isNaN(d)) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const fmtDateTime = (v) => {
  const d = toDate(v);
  if (!d || isNaN(d)) return '-';
  return fmtDate(d) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const MONTHS_MR = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];

export const PAY_MODES = ['रोख', 'UPI / PhonePe / GPay', 'बँक ट्रान्सफर', 'चेक'];

export const byText = (k) => (a, b) => String(a[k] || '').localeCompare(String(b[k] || ''), 'mr');
export const byTimeDesc = (k) => (a, b) => (toDate(b[k])?.getTime() || 0) - (toDate(a[k])?.getTime() || 0);
