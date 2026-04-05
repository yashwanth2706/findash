// ── Helpers ──────────────────────────────────────────

function getLast6Months() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

function shortMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleString("default", { month: "short", year: "2-digit" });
}

function fmtDollar(v) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function fmtShort(v) {
  return "$" + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + "k" : v);
}
