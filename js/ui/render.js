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

  // --- add button ---
  const addBtn = document.getElementById("addTransactionBtn");
  addBtn.disabled = false; // both roles can open the modal per original logic

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
  const filtered = getFilteredSorted(state);
  const tbody    = document.getElementById("transactionsTableBody");
  const emptyDiv = document.getElementById("emptyStateMsg");

  if (!filtered.length) {
    patchTbody(tbody, [{
      key: null,
      html: `<tr><td colspan="6" class="text-center text-muted py-3">No transactions match</td></tr>`
    }]);
    emptyDiv.classList.remove("d-none");
    return;
  }

  emptyDiv.classList.add("d-none");

  const actionCol = state.role === "admin"
    ? tx => `<td>
        <button class="btn btn-sm btn-outline-secondary edit-tx me-1" data-id="${tx.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger delete-tx" data-id="${tx.id}"><i class="bi bi-trash"></i></button>
      </td>`
    : () => "";

  const newRows = filtered.map(tx => ({
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

  // Re-attach event listeners only on rows that are admin-controlled
  if (state.role === "admin") {
    tbody.querySelectorAll(".edit-tx").forEach(btn => {
      btn.addEventListener("click", e => { e.stopPropagation(); openEditModal(btn.dataset.id); });
    });
    tbody.querySelectorAll(".delete-tx").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        openDeleteModal(btn.dataset.id);
      });
    });
  }
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