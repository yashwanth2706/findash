// ─────────────────────────────────────────────
// BOOT — attach events once, then render
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("[data-role]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      dispatch({ type: "SET_ROLE", payload: el.getAttribute("data-role") });
    });
  });

  document.getElementById("typeFilter").addEventListener("change", e =>
    dispatch({ type: "SET_FILTER", payload: e.target.value })
  );

  document.getElementById("searchInput").addEventListener("input", e =>
    dispatch({ type: "SET_SEARCH", payload: e.target.value })
  );

  document.getElementById("sortSelect").addEventListener("change", e =>
    dispatch({ type: "SET_SORT", payload: e.target.value })
  );

  document.getElementById("addTransactionBtn").addEventListener("click", () => {
    resetModalForAdd();
    new bootstrap.Modal(document.getElementById("transactionModal")).show();
  });

  document.getElementById("saveTransactionBtn").addEventListener("click", handleSaveTransaction);

  document.getElementById("confirmDeleteBtn").addEventListener("click", handleDeleteTransaction);

  document.getElementById("darkModeToggle").addEventListener("click", () =>
    dispatch({ type: "TOGGLE_DARK_MODE" })
  );

  // Initial render
  render(state);
});
