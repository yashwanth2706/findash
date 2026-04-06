# FinDash - Interactive Finance Dashboard

A responsive finance dashboard built with vanilla JavaScript, HTML, CSS, and Bootstrap 5. Track transactions, visualize spending patterns, and manage finances with role-based access and theme persistence.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-yellow.svg)

 **Live Demo** : [findash-liart.vercel.app](https://findash-liart.vercel.app/)

---

## Features

* **Dual Roles** : Viewer (read-only) and Admin (full CRUD)
* **Dark Mode** : Light/dark theme switching with localStorage persistence
* **Charts** : Balance trend (line) and spending by category (doughnut)
* **Filtering** : Filter by type, search by description or category
* **Sorting** : Sort by date or amount, ascending or descending
* **Pagination** : Configurable transactions per page
* **Responsive** : Mobile-friendly layout using Bootstrap Grid

---

## Quick Start

 **Prerequisites** : Any modern web browser. No build tools required.

```bash
git clone https://github.com/yashwanth2706/findash.git
cd findash
```

Open `dashboard.html` directly in a browser, or serve it locally:

```bash
# Python
python -m http.server 8000
# Then open: http://localhost:8000/dashboard.html
```

---

## File Structure

```
findash/
├── dashboard.html                        # Main HTML entry point
├── css/
│   ├── style.css                         # Base styles, layout, components
│   └── darkmode.css                      # Dark mode overrides
├── js/
│   ├── core/
│   │   ├── appState.js                   # Single source of truth
│   │   ├── dispatcher.js                 # Routes actions through reducer
│   │   └── reducer.js                    # Pure function: state + action → new state
│   ├── data/
│   │   └── defaultTransactionData.js     # Seed data
│   ├── helpers/
│   │   └── viewHelpers.js                # Pure derived-state functions
│   ├── ui/
│   │   ├── domdiffer.js                  # DOM patching utilities
│   │   ├── modalHelper.js                # Modal state and form validation
│   │   └── render.js                     # Pure render function (state → DOM)
│   ├── charts/
│   │   ├── chartFunctions.js             # Chart computation logic
│   │   ├── chartHelpers.js               # Chart utility functions
│   │   └── chartInstances.js             # Chart.js instance setup
│   └── onBootEventListener.js            # Entry point, event wiring
├── vercel.json                           # Vercel deployment config
└── README.md
```

---

## Architecture

FinDash follows a Redux-inspired unidirectional data flow pattern with a strict separation between state and UI.

```
User Action → Event Handler → Dispatcher → Reducer → New State → Render → DOM Diffing → Updated UI
```

### Layers

**Core (`js/core/`)**

* `appState.js` — Global state object, single source of truth
* `reducer.js` — Pure function that returns new state for each action type
* `dispatcher.js` — Calls reducer, updates state, triggers re-render

**Helpers (`js/helpers/`)**

`viewHelpers.js` contains pure derived-state functions:

* `getFilteredSorted()` — Applies type filter, search term, and sort order
* `getPaginatedData()` — Slices filtered results for current page
* `computeSummary()` — Calculates total income, expenses, and balance
* `computeInsights()` — Derives top spending category, income source, month-over-month change
* `computeTrend()` — Builds monthly balance data for the trend chart

**UI (`js/ui/`)**

* `render.js` — Pure function: takes state, updates DOM via domdiffer
* `domdiffer.js` — Targeted patching: `patchText()`, `patchClass()`, `patchStyle()`, `patchTbody()` (keyed diffing for table rows)
* `modalHelper.js` — Modal open/close state and form validation

**Charts (`js/charts/`)**

* `chartFunctions.js` — Data computation for chart datasets
* `chartHelpers.js` — Shared chart utilities
* `chartInstances.js` — Chart.js instance creation and updates

**Entry Point**

* `onBootEventListener.js` — Initializes state, attaches all event listeners, triggers first render

### State Shape

```javascript
{
  transactions: [],             // Array of transaction objects
  role: "viewer",               // "viewer" | "admin"
  filterType: "all",            // "all" | "income" | "expense"
  searchTerm: "",               // Search query string
  sortBy: "date_desc",          // "date_desc" | "date_asc" | "amount_desc" | "amount_asc"
  darkMode: false,              // Theme preference
  currentPage: 1,               // Active pagination page
  itemsPerPage: 5,              // Transactions per page
  deleteConfirmRequired: true   // User preference for delete confirmation
}
```

### Data Flow

```
┌──────────────────────────────────────────────────┐
│                   User Interface                  │
│  (Dashboard, Tables, Charts, Forms, Modals)      │
└─────────────────────┬────────────────────────────┘
                      │ User Actions (click, input, change)
                      ▼
┌──────────────────────────────────────────────────┐
│                  Event Handlers                   │
│  (onBootEventListener.js)                        │
└─────────────────────┬────────────────────────────┘
                      │ dispatch({ type, payload })
                      ▼
┌──────────────────────────────────────────────────┐
│                   Dispatcher                      │
│  (dispatcher.js)                                 │
└─────────────────────┬────────────────────────────┘
                      │ reducer(state, action)
                      ▼
┌──────────────────────────────────────────────────┐
│                    Reducer                        │
│  (reducer.js — Pure Function)                    │
│  ADD_TRANSACTION, UPDATE_TRANSACTION,            │
│  DELETE_TRANSACTION, SET_FILTER,                 │
│  SET_SEARCH, SET_SORT, TOGGLE_DARK_MODE, ...     │
└─────────────────────┬────────────────────────────┘
                      │ newState
                      ▼
┌──────────────────────────────────────────────────┐
│                   App State                       │
│  (appState.js — Single Source of Truth)          │
│  Persisted to localStorage (transactions, prefs) │
└─────────────────────┬────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│                 Render Function                   │
│  (render.js — Pure Function)                     │
│  Calls: getFilteredSorted(), getPaginatedData(), │
│  computeSummary(), computeInsights()             │
└─────────────────────┬────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────┐
│                  DOM Diffing                      │
│  (domdiffer.js)                                  │
│  Targeted patching, keyed diffing for table rows │
└─────────────────────┬────────────────────────────┘
                      ▼
                 Updated UI
```

### Key Design Decisions

| Decision                         | Reasoning                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **Vanilla JS**             | No transpiler overhead; sufficient for this scope; deliberate learning choice |
| **Redux Pattern**          | Predictable state mutations; easy to trace and debug                          |
| **Pure Functions**         | No side effects in reducer or render; reproducible output                     |
| **DOM Diffing**            | Avoids full re-renders; preserves form input state                            |
| **Keyed Diffing**          | Efficient table row updates without rebuilding the list                       |
| **Separate Dark Mode CSS** | Scoped overrides in `darkmode.css`keep base styles clean                    |
| **localStorage**           | Simple client-side persistence without a backend                              |

---

## Role-Based Access

| Permission               | Viewer | Admin |
| ------------------------ | ------ | ----- |
| View transactions        | Yes    | Yes   |
| View charts and insights | Yes    | Yes   |
| Filter, search, sort     | Yes    | Yes   |
| Toggle dark mode         | Yes    | Yes   |
| Add transaction          | No     | Yes   |
| Edit transaction         | No     | Yes   |
| Delete transaction       | No     | Yes   |
| Clear all transactions   | No     | Yes   |
| Access settings          | No     | Yes   |

---

## Data Persistence

| localStorage Key      | Content                        | Type    |
| --------------------- | ------------------------------ | ------- |
| `fintransactions`   | Array of transactions          | JSON    |
| `darkMode`          | Theme preference               | Boolean |
| `skipDeleteConfirm` | Delete confirmation preference | Boolean |

### Transaction Object

```javascript
{
  id: "1712250123456",       // Timestamp-based unique ID
  date: "2024-04-04",        // ISO date string
  description: "Salary",     // User-provided
  category: "Work",          // User-provided
  amount: 5000,              // Always positive number
  type: "income" | "expense"
}
```

---

## Technologies

| Layer       | Technology                         |
| ----------- | ---------------------------------- |
| Markup      | HTML5                              |
| Styling     | CSS3, Bootstrap 5.3.0              |
| Icons       | Bootstrap Icons 1.11.3             |
| Scripting   | JavaScript ES6+ (no JS frameworks) |
| Charts      | Chart.js 4.4.0                     |
| Persistence | localStorage API                   |
| Deployment  | Vercel                             |

---

## Deployment

The project is a static site with no build step. Any static host works.

**Vercel** (current):

```bash
npm install -g vercel
vercel
```

 **GitHub Pages** : Push to `main`, enable Pages in repository settings.

 **Netlify** : Connect the repository; leave build command and publish directory empty.

---

## License

MIT
