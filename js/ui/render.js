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

  // --- admin header ---
  const adminHeader = document.getElementById("adminActionsHeader");
  patchStyle(adminHeader, "display", "table-cell");

  // --- transactions table (keyed diff) ---
  renderTransactionsTable(state);

  // --- insights ---
  renderInsights(state.transactions);
}

function renderTrendChart(transactions) {
  const { monthNames, monthlyBalances } = computeTrend(transactions);
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(
    document.getElementById("trendChart").getContext("2d"),
    {
      type: "line",
      data: {
        labels: monthNames,
        datasets: [{ label: "Balance ($)", data: monthlyBalances, borderColor: "#3b82f6", tension: 0.3, fill: false }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    }
  );
}

function renderCategoryChart(transactions) {
  const categoryMap = new Map();
  transactions.filter(t => t.type === "expense").forEach(tx => {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
  });
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(
    document.getElementById("categoryChart").getContext("2d"),
    {
      type: "doughnut",
      data: {
        labels: [...categoryMap.keys()],
        datasets: [{
          data: [...categoryMap.values()],
          backgroundColor: ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec489a"]
        }]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: "bottom" } } }
    }
  );
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