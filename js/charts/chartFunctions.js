// ── 1. Balance Trend (line) ───────────────────────────

function renderTrendChart(transactions) {
  const { monthNames, monthlyBalances } = computeTrend(transactions);
  if (trendChart) trendChart.destroy();

  const ctx = document.getElementById("trendChart").getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, "rgba(99, 102, 241, 0.18)");
  gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthNames,
      datasets: [{
        label: "Balance",
        data: monthlyBalances,
        borderColor: "#6366f1",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
        backgroundColor: gradient,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_DEFAULTS,
          callbacks: {
            label: ctx => ` ${fmtDollar(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: TICK_STYLE.x,
        },
        y: {
          position: "right",
          grid: { color: "rgba(0,0,0,0.05)" },
          border: { display: false, dash: [4, 4] },
          ticks: { ...TICK_STYLE.y, maxTicksLimit: 5, callback: fmtShort }
        }
      }
    }
  });
}

// ── 2. Spending by Category (doughnut) ───────────────

function renderCategoryChart(transactions) {
  const categoryMap = new Map();
  transactions
    .filter(t => t.type === "expense")
    .forEach(tx => categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount));

  if (categoryChart) categoryChart.destroy();

  const palette = ["#6366f1","#34d399","#f59e0b","#f87171","#a78bfa","#38bdf8","#fb923c","#e879f9"];
  const total = [...categoryMap.values()].reduce((a, b) => a + b, 0);

  categoryChart = new Chart(
    document.getElementById("categoryChart").getContext("2d"),
    {
      type: "doughnut",
      data: {
        labels: [...categoryMap.keys()],
        datasets: [{
          data: [...categoryMap.values()],
          backgroundColor: palette,
          borderWidth: 0,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "72%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#6b7280",
              font: { family: "'DM Sans', sans-serif", size: 11 },
              padding: 16,
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: "circle",
            }
          },
          tooltip: {
            ...TOOLTIP_DEFAULTS,
            callbacks: {
              label: ctx => {
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                return ` ${fmtDollar(ctx.parsed)}  (${pct}%)`;
              }
            }
          }
        }
      }
    }
  );
}

// ── 3. Income vs Expense — Monthly Bar Chart ─────────

function renderBarChart(transactions) {
  if (typeof barChart !== "undefined" && barChart) barChart.destroy();

  const months = getLast6Months();
  const labels = months.map(({ year, month }) => shortMonthLabel(year, month));

  const incomeData = months.map(({ year, month }) =>
    transactions
      .filter(t => t.type === "income"
        && new Date(t.date).getFullYear() === year
        && new Date(t.date).getMonth() === month)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const expenseData = months.map(({ year, month }) =>
    transactions
      .filter(t => t.type === "expense"
        && new Date(t.date).getFullYear() === year
        && new Date(t.date).getMonth() === month)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  barChart = new Chart(
    document.getElementById("barChart").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Income",
            data: incomeData,
            backgroundColor: "rgba(52, 211, 153, 0.85)",
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
          {
            label: "Expenses",
            data: expenseData,
            backgroundColor: "rgba(248, 113, 113, 0.85)",
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              color: "#6b7280",
              font: { family: "'DM Sans', sans-serif", size: 11 },
              padding: 16,
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: "circle",
            }
          },
          tooltip: {
            ...TOOLTIP_DEFAULTS,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}  ${fmtDollar(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: TICK_STYLE.x,
          },
          y: {
            position: "right",
            grid: { color: "rgba(0,0,0,0.05)" },
            border: { display: false, dash: [4, 4] },
            ticks: { ...TICK_STYLE.y, maxTicksLimit: 5, callback: fmtShort }
          }
        }
      }
    }
  );
}

// ── 4. Cumulative Savings Rate (area line) ───────────

function renderSavingsChart(transactions) {
  if (typeof savingsChart !== "undefined" && savingsChart) savingsChart.destroy();

  const months = getLast6Months();
  const labels = months.map(({ year, month }) => shortMonthLabel(year, month));

  const rateData = months.map(({ year, month }) => {
    const income = transactions
      .filter(t => t.type === "income"
        && new Date(t.date).getFullYear() === year
        && new Date(t.date).getMonth() === month)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === "expense"
        && new Date(t.date).getFullYear() === year
        && new Date(t.date).getMonth() === month)
      .reduce((sum, t) => sum + t.amount, 0);
    if (income === 0) return null;
    return parseFloat((((income - expense) / income) * 100).toFixed(1));
  });

  const ctx = document.getElementById("savingsChart").getContext("2d");

  const gradientGreen = ctx.createLinearGradient(0, 0, 0, 220);
  gradientGreen.addColorStop(0, "rgba(52, 211, 153, 0.18)");
  gradientGreen.addColorStop(1, "rgba(52, 211, 153, 0)");

  savingsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Savings Rate",
        data: rateData,
        borderColor: "#34d399",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#34d399",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
        backgroundColor: gradientGreen,
        spanGaps: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_DEFAULTS,
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (v === null) return " No data";
              return ` ${v >= 0 ? "+" : ""}${v}%  ${v >= 20 ? "🟢" : v >= 0 ? "🟡" : "🔴"}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: TICK_STYLE.x,
        },
        y: {
          position: "right",
          grid: { color: "rgba(0,0,0,0.05)" },
          border: { display: false, dash: [4, 4] },
          ticks: {
            ...TICK_STYLE.y,
            maxTicksLimit: 5,
            callback: v => v + "%"
          }
        }
      }
    }
  });
}
