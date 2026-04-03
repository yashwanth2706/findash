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
  if (id) {
    dispatch({ type: "UPDATE_TRANSACTION", payload: { id, data: txData } });
    showFeedbackToast(`Transaction: ${category} Updated`);
  } else {
    dispatch({ type: "ADD_TRANSACTION",    payload: txData });
    showFeedbackToast(`Transaction: ${category} Added`);
  }

  bootstrap.Modal.getInstance(document.getElementById("transactionModal")).hide();
}

function openDeleteModal(id) {
  const skipConfirm = localStorage.getItem("skipDeleteConfirm") === "true";
  if (skipConfirm) {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
    return;
  }
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteModal"));
  document.getElementById("deleteModal").dataset.txId = id;
  document.getElementById("dontAskAgain").checked = false;
  modal.show();
}

function handleDeleteTransaction() {
  const modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
  const id = document.getElementById("deleteModal").dataset.txId;
  const transaction = state.transactions.find(t => t.id === id);
  const category = transaction ? transaction.category : "Unknown";
  const dontAskAgain = document.getElementById("dontAskAgain").checked;
  if (dontAskAgain) {
    localStorage.setItem("skipDeleteConfirm", "true");
  }
  dispatch({ type: "DELETE_TRANSACTION", payload: id });
  modal.hide();
  showFeedbackToast(`Transaction: ${category} Deleted`);
}

function showFeedbackToast(message, variant = "success") {
  const container = document.querySelector(".toast-container");
  const toastId = `feedbackToast-${Date.now()}`;
  const bgClass = variant === "warning" ? "bg-warning text-dark" : "bg-success text-white";
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="1500" data-bs-autohide="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close ${variant === "warning" ? "" : "btn-close-white"} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", toastHtml);
  const toastEl = document.getElementById(toastId);
  
  // Clean up listener and DOM after toast hides
  const removeToast = () => {
    toastEl.removeEventListener("hidden.bs.toast", removeToast);
    setTimeout(() => {
      toastEl.remove();
    }, 0);
  };
  
  toastEl.addEventListener("hidden.bs.toast", removeToast);
  const toast = new bootstrap.Toast(toastEl, { delay: 1500 });
  toast.show();
}