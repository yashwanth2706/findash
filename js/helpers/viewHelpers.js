// ─────────────────────────────────────────────
// DERIVED / VIEW HELPERS
// ─────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
}

function getFilteredSorted(state) {
  let list = [...state.transactions];
  if (state.filterType !== "all") list = list.filter(t => t.type === state.filterType);
  if (state.searchTerm.trim()) {
    const st = state.searchTerm.toLowerCase();
    list = list.filter(t =>
      t.description.toLowerCase().includes(st) || t.category.toLowerCase().includes(st)
    );
  }
  const sorters = {
    date_desc:   (a, b) => new Date(b.date) - new Date(a.date),
    date_asc:    (a, b) => new Date(a.date) - new Date(b.date),
    amount_desc: (a, b) => b.amount - a.amount,
    amount_asc:  (a, b) => a.amount - b.amount,
  };
  list.sort(sorters[state.sortBy] || sorters.date_desc);
  return list;
}

function computeSummary(transactions) {
  let totalIncome = 0, totalExpense = 0;
  transactions.forEach(tx => {
    if (tx.type === "income") totalIncome += tx.amount;
    else totalExpense += tx.amount;
  });
  return { totalIncome, totalExpense, totalBalance: totalIncome - totalExpense };
}

function computeTrend(transactions) {
  const now = new Date();
  const monthNames = [], monthlyBalances = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthNames.push(d.toLocaleString("default", { month: "short" }));
    let balance = 0;
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const sameMonth = txDate.getFullYear() === d.getFullYear() && txDate.getMonth() === d.getMonth();
      const before    = txDate < d;
      if (sameMonth || before) balance += tx.type === "income" ? tx.amount : -tx.amount;
    });
    monthlyBalances.push(balance);
  }
  return { monthNames, monthlyBalances };
}

function computeInsights(transactions) {
  const expenses = transactions.filter(t => t.type === "expense");
  if (!expenses.length) return null;

  const catSpending = {};
  expenses.forEach(e => { catSpending[e.category] = (catSpending[e.category] || 0) + e.amount; });
  const topCategory = Object.keys(catSpending).reduce((a, b) => catSpending[a] > catSpending[b] ? a : b);
  const topAmount   = catSpending[topCategory];
  const totalExp    = expenses.reduce((s, e) => s + e.amount, 0);

  const now = new Date();
  const cm  = now.getMonth(), cy = now.getFullYear();
  let thisMonthExp = 0, lastMonthExp = 0;
  transactions.forEach(tx => {
    if (tx.type !== "expense") return;
    const d = new Date(tx.date);
    if (d.getMonth() === cm && d.getFullYear() === cy) thisMonthExp += tx.amount;
    else if (
      (cm > 0 && d.getMonth() === cm - 1 && d.getFullYear() === cy) ||
      (cm === 0 && d.getMonth() === 11 && d.getFullYear() === cy - 1)
    ) lastMonthExp += tx.amount;
  });
  const change = lastMonthExp
    ? ((thisMonthExp - lastMonthExp) / lastMonthExp * 100).toFixed(1)
    : (thisMonthExp ? 100 : 0);

  return { topCategory, topAmount, totalExp, thisMonthExp, lastMonthExp, change };
}
