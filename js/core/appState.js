// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let state = loadInitialState();

function loadInitialState() {
  const stored = localStorage.getItem("fintransactions");
  const transactions = stored ? JSON.parse(stored) : [...defaultTransactions];
  if (!stored) localStorage.setItem("fintransactions", JSON.stringify(transactions));
  return {
    transactions,
    role:       "viewer",
    filterType: "all",
    searchTerm: "",
    sortBy:     "date_desc",
    darkMode:   localStorage.getItem("darkMode") === "true",
  };
}
