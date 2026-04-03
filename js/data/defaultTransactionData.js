// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────
const defaultTransactions = [
  // October 2025
  { id: "1",  date: "2025-10-03", description: "Monthly Salary",        category: "Salary",        amount: 3800,   type: "income"  },
  { id: "2",  date: "2025-10-05", description: "Rent",                  category: "Housing",       amount: 1200,   type: "expense" },
  { id: "3",  date: "2025-10-08", description: "Electricity bill",      category: "Utilities",     amount: 84.50,  type: "expense" },
  { id: "4",  date: "2025-10-12", description: "Weekly groceries",      category: "Food",          amount: 138.20, type: "expense" },
  { id: "5",  date: "2025-10-18", description: "Freelance – UI audit",  category: "Freelance",     amount: 650,    type: "income"  },
  { id: "6",  date: "2025-10-22", description: "Gym membership",        category: "Health",        amount: 45,     type: "expense" },
  { id: "7",  date: "2025-10-27", description: "Netflix + Spotify",     category: "Entertainment", amount: 28.98,  type: "expense" },

  // November 2025
  { id: "8",  date: "2025-11-01", description: "Monthly Salary",        category: "Salary",        amount: 3800,   type: "income"  },
  { id: "9",  date: "2025-11-03", description: "Rent",                  category: "Housing",       amount: 1200,   type: "expense" },
  { id: "10", date: "2025-11-07", description: "Grocery run",           category: "Food",          amount: 162.75, type: "expense" },
  { id: "11", date: "2025-11-11", description: "Doctor visit",          category: "Health",        amount: 120,    type: "expense" },
  { id: "12", date: "2025-11-15", description: "Part-time tutoring",    category: "Freelance",     amount: 300,    type: "income"  },
  { id: "13", date: "2025-11-20", description: "Winter jacket",         category: "Shopping",      amount: 189.99, type: "expense" },
  { id: "14", date: "2025-11-26", description: "Dinner out",            category: "Food",          amount: 74.50,  type: "expense" },

  // December 2025
  { id: "15", date: "2025-12-01", description: "Monthly Salary",        category: "Salary",        amount: 3800,   type: "income"  },
  { id: "16", date: "2025-12-02", description: "Rent",                  category: "Housing",       amount: 1200,   type: "expense" },
  { id: "17", date: "2025-12-05", description: "Year-end bonus",        category: "Salary",        amount: 1200,   type: "income"  },
  { id: "18", date: "2025-12-10", description: "Christmas shopping",    category: "Shopping",      amount: 340,    type: "expense" },
  { id: "19", date: "2025-12-14", description: "Grocery run",           category: "Food",          amount: 195.60, type: "expense" },
  { id: "20", date: "2025-12-20", description: "Flight tickets home",   category: "Travel",        amount: 420,    type: "expense" },
  { id: "21", date: "2025-12-28", description: "Investment dividend",   category: "Investment",    amount: 110,    type: "income"  },

  // January 2026
  { id: "22", date: "2026-01-01", description: "Monthly Salary",        category: "Salary",        amount: 3800,   type: "income"  },
  { id: "23", date: "2026-01-03", description: "Rent",                  category: "Housing",       amount: 1200,   type: "expense" },
  { id: "24", date: "2026-01-06", description: "Water + internet bill", category: "Utilities",     amount: 97.30,  type: "expense" },
  { id: "25", date: "2026-01-10", description: "Grocery run",           category: "Food",          amount: 148.90, type: "expense" },
  { id: "26", date: "2026-01-15", description: "Freelance – web app",   category: "Freelance",     amount: 950,    type: "income"  },
  { id: "27", date: "2026-01-22", description: "Pharmacy",              category: "Health",        amount: 38.50,  type: "expense" },
  { id: "28", date: "2026-01-28", description: "Gym membership",        category: "Health",        amount: 45,     type: "expense" },

  // February 2026
  { id: "29", date: "2026-02-01", description: "Monthly Salary",        category: "Salary",        amount: 3800,   type: "income"  },
  { id: "30", date: "2026-02-03", description: "Rent",                  category: "Housing",       amount: 1200,   type: "expense" },
  { id: "31", date: "2026-02-08", description: "Grocery run",           category: "Food",          amount: 154.40, type: "expense" },
  { id: "32", date: "2026-02-14", description: "Valentine's dinner",    category: "Food",          amount: 112,    type: "expense" },
  { id: "33", date: "2026-02-18", description: "Online course",         category: "Education",     amount: 79,     type: "expense" },
  { id: "34", date: "2026-02-22", description: "Investment dividend",   category: "Investment",    amount: 110,    type: "income"  },
  { id: "35", date: "2026-02-26", description: "Streaming services",    category: "Entertainment", amount: 28.98,  type: "expense" },

  // March 2026
  { id: "36", date: "2026-03-01", description: "Monthly Salary",        category: "Salary",        amount: 3800,   type: "income"  },
  { id: "37", date: "2026-03-03", description: "Rent",                  category: "Housing",       amount: 1200,   type: "expense" },
  { id: "38", date: "2026-03-07", description: "Grocery run",           category: "Food",          amount: 167.80, type: "expense" },
  { id: "39", date: "2026-03-12", description: "Freelance – dashboard", category: "Freelance",     amount: 1100,   type: "income"  },
  { id: "40", date: "2026-03-18", description: "Electricity bill",      category: "Utilities",     amount: 76.20,  type: "expense" },
  { id: "41", date: "2026-03-22", description: "New running shoes",     category: "Shopping",      amount: 134.99, type: "expense" },
  { id: "42", date: "2026-03-28", description: "Weekend trip",          category: "Travel",        amount: 280,    type: "expense" },
];