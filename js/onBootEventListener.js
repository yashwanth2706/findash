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

  // Settings offcanvas
  const settingsOffcanvas = document.getElementById("settingsOffcanvas");
  settingsOffcanvas.addEventListener("show.bs.offcanvas", () => {
    const skipConfirm = localStorage.getItem("skipDeleteConfirm") === "true";
    document.getElementById("deleteConfirmToggle").checked = !skipConfirm;
  });

  document.getElementById("deleteConfirmToggle").addEventListener("change", (e) => {
    if (e.target.checked) {
      localStorage.removeItem("skipDeleteConfirm");
    } else {
      localStorage.setItem("skipDeleteConfirm", "true");
    }
  });

  document.getElementById("darkModeToggle").addEventListener("click", () =>
    dispatch({ type: "TOGGLE_DARK_MODE" })
  );

  // Initial render
  render(state);
});
