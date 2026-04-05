// ─────────────────────────────────────────────────────
//  FinDash — Chart Instances (outside state — Chart.js manages its own canvas state)
//  Charts: trendChart, categoryChart, barChart, savingsChart
// ─────────────────────────────────────────────────────

let trendChart;
let categoryChart;
let barChart = null;
let savingsChart = null;

// Shared tooltip style — single source of truth
const TOOLTIP_DEFAULTS = {
  backgroundColor: "#13161d",
  titleColor: "#8b93a5",
  bodyColor: "#f0f2f7",
  borderColor: "#252932",
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  titleFont: { family: "'DM Sans', sans-serif", size: 11 },
  bodyFont: { family: "'DM Mono', monospace", size: 13, weight: "500" },
};

const TICK_STYLE = {
  x: { color: "#9ca3af", font: { family: "'DM Sans', sans-serif", size: 11 } },
  y: { color: "#9ca3af", font: { family: "'DM Mono', monospace", size: 11 } },
};
