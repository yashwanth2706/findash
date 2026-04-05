// ─────────────────────────────────────────────
// RENDER — pure function of state
// ─────────────────────────────────────────────
function render(state) {
  // --- dark mode ---
  patchClass(document.body, "dark-mode", state.darkMode);
  localStorage.setItem("darkMode", state.darkMode);

  // --- role label ---
  patchText("currentRoleLabel", state.role === "admin" ? "Admin" : "Viewer");

  // --- settings button ---
  const settingsBtn = document.getElementById("settingsToggle");
  patchStyle(settingsBtn, "display", state.role === "admin" ? "inline-block" : "none");

  // --- add + clear all + reset buttons ---
  const addBtn = document.getElementById("addTransactionBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const resetBtn = document.getElementById("resetDashboardBtn");
  const isAdmin = state.role === "admin";
  addBtn.style.display = isAdmin ? "inline-block" : "none";
  clearAllBtn.style.display = isAdmin ? "inline-block" : "none";
  resetBtn.style.display = isAdmin ? "inline-block" : "none";

  // --- summary cards ---
  const { totalIncome, totalExpense, totalBalance } = computeSummary(state.transactions);
  patchText("totalBalance", `$${totalBalance.toFixed(2)}`);
  patchText("totalIncome",  `$${totalIncome.toFixed(2)}`);
  patchText("totalExpense", `$${totalExpense.toFixed(2)}`);

  // --- charts ---
  renderTrendChart(state.transactions);
  renderCategoryChart(state.transactions);
  renderBarChart(state.transactions);
  renderSavingsChart(state.transactions);

  // --- admin header ---
  const adminHeader = document.getElementById("adminActionsHeader");
  patchStyle(adminHeader, "display", isAdmin ? "table-cell" : "none");

  // --- transactions table (keyed diff) ---
  renderTransactionsTable(state);

  // --- insights ---
  renderInsights(state.transactions);
}

// ─────────────────────────────────────────────────────
//  FinDash — Chart Instances
//  Charts: trendChart, categoryChart, barChart, savingsChart
// ─────────────────────────────────────────────────────

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

function renderTransactionsTable(state) {
  const pagination = getPaginatedData(state);
  const tbody    = document.getElementById("transactionsTableBody");
  const emptyDiv = document.getElementById("emptyStateMsg");

  // Case 1: Completely empty (0 transactions total)
  if (state.transactions.length === 0) {
    patchTbody(tbody, [{
      key: null,
      html: `<tr><td colspan="6" class="text-center text-muted py-3">No Transactions</td></tr>`
    }]);
    emptyDiv.classList.add("d-none");
    renderPagination(pagination);
    return;
  }

  // Case 2: Has transactions but filters eliminated all
  if (!pagination.items.length) {
    tbody.innerHTML = "";
    emptyDiv.classList.remove("d-none");
    renderPagination(pagination);
    return;
  }

  // Case 3: Has transactions that match
  emptyDiv.classList.add("d-none");
  tbody.innerHTML = ""; // Clear placeholder row from empty state

  const actionCol = state.role === "admin"
    ? tx => `<td>
        <button class="btn btn-sm btn-outline-secondary edit-tx me-1" data-id="${tx.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger delete-tx" data-id="${tx.id}"><i class="bi bi-trash"></i></button>
      </td>`
    : () => "";

  const newRows = pagination.items.map(tx => ({
    key: tx.id,
    html: `<tr class="transaction-row" data-id="${tx.id}">
      <td>${tx.date}</td>
      <td>${escapeHtml(tx.description)}</td>
      <td>${escapeHtml(tx.category)}</td>
      <td class="${tx.type === "income" ? "text-success" : "text-danger"} fw-semibold">
        ${tx.type === "income" ? "+" : "-"}$${Math.abs(tx.amount).toFixed(2)}
      </td>
      <td><span class="badge ${tx.type === "income" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}">${tx.type}</span></td>
      ${actionCol(tx)}
    </tr>`
  }));

  patchTbody(tbody, newRows);
  renderPagination(pagination);

  // Event delegation handles edit/delete in onBootEventListener; no per-render attachment here.
}

function renderPagination(pagination) {
  const container = document.getElementById("paginationContainer");
  const { currentPage, totalPages } = pagination;

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<nav aria-label="Transaction pagination">
    <ul class="pagination justify-content-center">
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <button class="page-link pagination-btn" data-page="${currentPage - 1}">Previous</button>
      </li>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
    } else {
      html += `<li class="page-item"><button class="page-link pagination-btn" data-page="${i}">${i}</button></li>`;
    }
  }

  html += `<li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
    <button class="page-link pagination-btn" data-page="${currentPage + 1}">Next</button>
  </li>
  </ul>
  </nav>
  <div class="text-center text-muted small">
    Page ${currentPage} of ${totalPages} | ${pagination.totalItems} total transactions
  </div>`;

  if (container.innerHTML !== html) container.innerHTML = html;
}

function renderInsights(transactions) {
  const data = computeInsights(transactions);
  const container = document.getElementById("insightsContainer");
  if (!data) {
    const html = `<div class="col-12"><div class="insight-bubble">✨ No data to show insights. Add transactions.</div></div>`;
    if (container.innerHTML !== html) container.innerHTML = html;
    return;
  }

  let html = '';

  if (data.topCategory) {
    html += `<div class="col-md-3"><div class="insight-bubble"><strong>Highest spend category</strong><br>${data.topCategory} : $${data.topAmount.toFixed(2)}</div></div>`;
  }

  if (data.topIncCategory) {
    html += `<div class="col-md-3"><div class="insight-bubble"><strong>Top income source</strong><br>${data.topIncCategory} : $${data.topIncAmount.toFixed(2)}</div></div>`;
  }

  if (data.thisMonthExp !== undefined) {
    html += `<div class="col-md-3"><div class="insight-bubble"><strong>Monthly expense change</strong><br>This month: $${data.thisMonthExp.toFixed(2)} vs last month: ${data.change}% ${data.change >= 0 ? "🔺" : "🔻"}</div></div>`;
  }

  if (data.topCategory && data.totalExp) {
    html += `<div class="col-md-3"><div class="insight-bubble"><strong>Expense insight</strong><br>${data.topCategory} represents ${((data.topAmount / data.totalExp) * 100).toFixed(0)}% of total expenses.</div></div>`;
  }

  if (container.innerHTML !== html) container.innerHTML = html;
}