// ─────────────────────────────────────────────
// MODAL HELPERS (not part of state, UI-only)
// ─────────────────────────────────────────────
function openEditModal(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  document.getElementById("modalTitle").innerText    = "Edit Transaction";
  document.getElementById("editId").value            = tx.id;
  document.getElementById("txDate").value            = tx.date;
  document.getElementById("txDesc").value            = tx.description;
  document.getElementById("txCategory").value        = tx.category;
  document.getElementById("txAmount").value          = tx.amount;
  document.getElementById("txType").value            = tx.type;
  new bootstrap.Modal(document.getElementById("transactionModal")).show();
}

function resetModalForAdd() {
  document.getElementById("modalTitle").innerText = "Add Transaction";
  document.getElementById("editId").value         = "";
  document.getElementById("txDate").value         = new Date().toISOString().slice(0, 10);
  document.getElementById("txDesc").value         = "";
  document.getElementById("txCategory").value     = "";
  document.getElementById("txAmount").value       = "";
  document.getElementById("txType").value         = "expense";
}

function handleSaveTransaction() {
  const id          = document.getElementById("editId").value;
  const date        = document.getElementById("txDate").value;
  const description = document.getElementById("txDesc").value.trim();
  const category    = document.getElementById("txCategory").value.trim();
  const amount      = parseFloat(document.getElementById("txAmount").value);
  const type        = document.getElementById("txType").value;

  if (!date || !description || !category || isNaN(amount) || amount <= 0) {
    alert("Please fill all fields correctly.");
    return;
  }

  const txData = { date, description, category, amount, type };
  if (id) dispatch({ type: "UPDATE_TRANSACTION", payload: { id, data: txData } });
  else     dispatch({ type: "ADD_TRANSACTION",    payload: txData });

  bootstrap.Modal.getInstance(document.getElementById("transactionModal")).hide();
}