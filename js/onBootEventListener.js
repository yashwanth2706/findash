// ─────────────────────────────────────────────
// BOOT — attach events once, then render
// ─────────────────────────────────────────────
let eventsAttached = false;

document.addEventListener("DOMContentLoaded", () => {
  // Guard: prevent double-attaching listeners
  if (eventsAttached) return;
  eventsAttached = true;

  document.querySelectorAll("[data-role]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      const role = el.getAttribute("data-role");
      dispatch({ type: "SET_ROLE", payload: role });
      showFeedbackToast(`Switched to ${role === "admin" ? "Admin" : "Viewer"}`);
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

  document.getElementById("confirmResetBtn").addEventListener("click", () => {
    dispatch({ type: "RESET_DASHBOARD" });
    showFeedbackToast("Dashboard reset to initial state");
    bootstrap.Modal.getInstance(document.getElementById("resetDashboardModal")).hide();
  });

  // Single delegated listener at table body level
  document.getElementById("transactionsTableBody").addEventListener("click", (e) => {
    const btn = e.target.closest("button.edit-tx, button.delete-tx");
    if (!btn) return;

    e.stopPropagation();
    const txId = btn.dataset.id;
    
    if (btn.classList.contains("edit-tx")) {
      openEditModal(txId);
    } else if (btn.classList.contains("delete-tx")) {
      openDeleteModal(txId);
    }
  });

  document.getElementById("paginationContainer").addEventListener("click", (e) => {
    const btn = e.target.closest("button.pagination-btn");
    if (!btn) return;
    const page = parseInt(btn.dataset.page, 10);
    if (page >= 1) {
      dispatch({ type: "SET_PAGE", payload: page });
      document.querySelector(".table-responsive").scrollIntoView({ behavior: "smooth" });
    }
  });

  document.getElementById("confirmClearAllBtn").addEventListener("click", () => {
    if (!state.transactions.length) {
      showFeedbackToast("Nothing to delete", "warning");
      bootstrap.Modal.getInstance(document.getElementById("clearAllModal")).hide();
      return;
    }

    dispatch({ type: "CLEAR_TRANSACTIONS" });
    showFeedbackToast("Done, all transactions in your dashboard has been zapped!");
    bootstrap.Modal.getInstance(document.getElementById("clearAllModal")).hide();
  });

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

  const insightsCollapse = document.getElementById("insightsCollapse");
  const insightsToggleBtn = document.getElementById("insightsToggleBtn");
  if (insightsCollapse && insightsToggleBtn) {
    insightsCollapse.addEventListener("shown.bs.collapse", () => {
      insightsToggleBtn.innerHTML = '<i class="bi bi-chevron-up"></i> Collapse Insight';
      insightsToggleBtn.setAttribute("aria-expanded", "true");
    });
    insightsCollapse.addEventListener("hidden.bs.collapse", () => {
      insightsToggleBtn.innerHTML = '<i class="bi bi-chevron-down"></i> Show Insight';
      insightsToggleBtn.setAttribute("aria-expanded", "false");
    });
  }

  // Initial render
  render(state);
});
