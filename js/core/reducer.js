// ─────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case "SET_ROLE":
      return { ...state, role: action.payload };

    case "SET_FILTER":
      return { ...state, filterType: action.payload, currentPage: 1 };

    case "SET_SEARCH":
      return { ...state, searchTerm: action.payload, currentPage: 1 };

    case "SET_SORT":
      return { ...state, sortBy: action.payload };

    case "SET_PAGE":
      return { ...state, currentPage: action.payload };

    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };

    case "ADD_TRANSACTION": {
      const newTx = { ...action.payload, id: Date.now().toString() };
      const transactions = [...state.transactions, newTx];
      localStorage.setItem("fintransactions", JSON.stringify(transactions));
      return { ...state, transactions, currentPage: 1 };
    }

    case "UPDATE_TRANSACTION": {
      const transactions = state.transactions.map(tx =>
        tx.id === action.payload.id ? { ...tx, ...action.payload.data, id: tx.id } : tx
      );
      localStorage.setItem("fintransactions", JSON.stringify(transactions));
      return { ...state, transactions };
    }

    case "DELETE_TRANSACTION": {
      const transactions = state.transactions.filter(tx => tx.id !== action.payload);
      localStorage.setItem("fintransactions", JSON.stringify(transactions));
      const pagination = getPaginatedData({ ...state, transactions, currentPage: state.currentPage });
      const currentPage = pagination.currentPage;
      return { ...state, transactions, currentPage };
    }

    case "CLEAR_TRANSACTIONS": {
      localStorage.setItem("fintransactions", JSON.stringify([]));
      return { ...state, transactions: [] };
    }

    case "RESET_DASHBOARD": {
      localStorage.removeItem("fintransactions");
      localStorage.removeItem("skipDeleteConfirm");
      localStorage.removeItem("darkMode");
      localStorage.setItem("fintransactions", JSON.stringify(defaultTransactions));
      return {
        ...state,
        transactions: [...defaultTransactions],
        role: "viewer",
        filterType: "all",
        searchTerm: "",
        sortBy: "date_desc",
        darkMode: false,
        currentPage: 1,
      };
    }

    default:
      return state;
  }
}