# FinDash - Interactive Finance Dashboard

A modern, responsive finance dashboard built with vanilla Javascript, HTML, CSS, Bootstrap 5 (min js bundel included for utility functions).
Track transactions, visualize spending patterns, and manage your finances with an intuitive interface that adapts to your preferred theme.

![FinDash](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-yellow.svg)

---

## 📸 Features at a Glance

- ✅ **Dual Roles**: Viewer (read-only) and Admin (full CRUD)
- 🌙 **Dark Mode**: Seamless light/dark theme switching with persistence
- 📊 **Charts**: Balance trend visualization and spending by category
- 🔍 **Smart Filtering**: Filter by type, search by description/category
- 📈 **Sorting Options**: Multiple sort options (date, amount)
- 📄 **Pagination**: Efficient transaction list management
- 💾 **Local Storage**: Automatic data persistence
- ♿ **Accessible**: Semantic HTML with ARIA labels and Bootstrap Icons
- 📱 **Responsive**: Mobile-friendly design using Bootstrap Grid

---

## 🚀 Quick Start

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or server required
- File system access to serve HTML locally

### Setup Instructions

#### Option 1: Direct File Access (Easiest)

```bash
# 1. Clone or download the repository
git clone https://github.com/yashwanth2706/findash.git
cd findash

# 2. Open in your browser
# Double-click dashboard.html OR
# For better local development, use a local server (see Option 2)
```

#### Option 2: Using Python (Recommended for Development)

```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000

# Then open: http://localhost:8000/dashboard.html
```

#### Option 3: Using Node.js

```bash
# Install global http-server
npm install -g http-server

# Run server
http-server

# Then open: http://localhost:8080/dashboard.html
```

#### Option 4: VS Code Live Server

```bash
# Install Live Server extension in VS Code
# Right-click dashboard.html → "Open with Live Server"
```

### File Structure

```
findash/
├── dashboard.html              # Main HTML file
├── css/
│   └── style.css              # All styling + dark mode
├── js/
│   ├── data/
│   │   └── defaultTransactionData.js    # Seed data
│   ├── core/
│   │   ├── appState.js                  # Global state
│   │   ├── dispatcher.js                # Action dispatcher
│   │   └── reducer.js                   # State reducer
│   ├── helpers/
│   │   └── viewHelpers.js               # Utility functions
│   ├── ui/
│   │   ├── domdiffer.js                 # DOM patching
│   │   ├── modalHelper.js               # Modal management
│   │   └── render.js                    # Render logic
│   ├── charts/
│   │   └── chartInstances.js            # Chart.js setup
│   └── onBootEventListener.js           # Entry point
├── README.md                    # This file
└── vercel.json                 # Vercel deployment config
```

---

## 🏗️ Architecture & Approach

### Design Philosophy

FinDash follows a **Redux-inspired state management pattern** with a clear separation between data layer and UI layer:

```
User Action → Event Handler → Dispatcher → Reducer → New State → Render UI
```

### Core Architecture Layers

#### 1. **Data Layer** (`js/core/`)

- **appState.js**: Single source of truth containing all application state
- **reducer.js**: Pure function that processes actions and returns new state
- **dispatcher.js**: Central hub that routes actions through reducer and triggers re-render

```javascript
// Example state shape
{
  transactions: [],           // Array of transaction objects
  role: "viewer",            // User role: "viewer" or "admin"
  filterType: "all",         // Filter: "all", "income", "expense"
  searchTerm: "",            // Search query
  sortBy: "date_desc",       // Sort criteria
  darkMode: false,           // Theme preference
  currentPage: 1,            // Pagination
  itemsPerPage: 5,           // Transactions per page
  deleteConfirmRequired: true // User preference
}
```

#### 2. **Business Logic Layer** (`js/helpers/`)

- **viewHelpers.js**: Pure functions for:
  - `getFilteredSorted()` - Apply filters and sorting
  - `getPaginatedData()` - Apply pagination
  - `computeSummary()` - Calculate financial totals
  - `computeInsights()` - Generate spending insights
  - `computeTrend()` - Calculate monthly balance trends

#### 3. **UI Layer** (`js/ui/`)

- **domdiffer.js**: Efficient DOM patching

  - `patchText()` - Update text content
  - `patchClass()` - Toggle CSS classes
  - `patchStyle()` - Update inline styles
  - `patchTbody()` - Keyed diffing for table rows
- **render.js**: Pure render function

  - Single input: state
  - Output: Updated DOM
  - No side effects during rendering
- **modalHelper.js**: Encapsulate modal logic

  - Modal state management
  - Form validation

#### 4. **Entry Point** (`js/onBootEventListener.js`)

- Wires all components together
- Attaches event listeners
- Triggers initial render

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
│  (Dashboard, Tables, Charts, Forms, Modals)        │
└──────────────┬──────────────────────────────────────┘
               │ User Actions (click, input, change)
               ▼
┌─────────────────────────────────────────────────────┐
│                  Event Handlers                      │
│  (onBootEventListener.js)                           │
└──────────────┬──────────────────────────────────────┘
               │ dispatch({ type, payload })
               ▼
┌─────────────────────────────────────────────────────┐
│                   Dispatcher                         │
│  (dispatcher.js)                                     │
└──────────────┬──────────────────────────────────────┘
               │ reducer(state, action)
               ▼
┌─────────────────────────────────────────────────────┐
│                    Reducer                           │
│  (reducer.js - Pure Function)                       │
│  - ADD_TRANSACTION                                   │
│  - UPDATE_TRANSACTION                                │
│  - DELETE_TRANSACTION                                │
│  - SET_FILTER, SET_SEARCH, SET_SORT                 │
│  - TOGGLE_DARK_MODE, SET_ROLE, etc.                 │
└──────────────┬──────────────────────────────────────┘
               │ newState
               ▼
┌─────────────────────────────────────────────────────┐
│                   App State                          │
│  (appState.js - Single Source of Truth)             │
│  - Stored in memory                                  │
│  - Persisted to localStorage (transactions, prefs)   │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│                   Render Function                    │
│  (render.js - Pure Function)                        │
│  Calls derived state functions:                     │
│  - getFilteredSorted()                              │
│  - getPaginatedData()                               │
│  - computeSummary()                                 │
│  - computeInsights()                                │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│                    DOM Diffing                       │
│  (domdiffer.js - Minimal DOM Operations)            │
│  - Smart patching instead of blanket updates        │
│  - Keyed diffing for table rows                      │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
         Updated UI 🎉
```

### Key Design Decisions

| Decision                 | Reasoning                                                   |
| ------------------------ | ----------------------------------------------------------- |
| **Vanilla JS**     | Learn core concepts, smaller bundle, enough for this scope  |
| **Redux Pattern**  | Predictable state mutations, easy to debug, scalable        |
| **Pure Functions** | Testable, no side effects, reproducible results             |
| **DOM Diffing**    | Efficient rendering, preserves form state, good performance |
| **localStorage**   | Simple persistence without backend, good for MVP            |
| **Keyed Diffing**  | Fast updates for dynamic tables without re-rendering        |
| **CSS Cascade**    | Maintainable dark mode with single source of truth          |

---

## 🎯 Features Explained

### 1. **Transaction Management**

#### Add Transaction

```javascript
dispatch({
  type: "ADD_TRANSACTION",
  payload: {
    date: "2024-04-01",
    description: "Salary",
    category: "Income",
    amount: 5000,
    type: "income"
  }
})
```

- **Admin Only**: Only admins can add transactions
- **Auto ID**: Generated from timestamp (`Date.now()`)
- **Persistence**: Automatically saved to localStorage
- **Reset Pagination**: Moves to page 1 after adding

#### Edit Transaction

- **Admin Only**: Edit button only visible for admins
- **Modal Form**: Pre-populated with existing data
- **Validation**: Date, description, category, amount required
- **In-place Update**: Efficiently updates only changed transaction

#### Delete Transaction

- **Soft Confirmation**: User preference for confirmation dialog
- **Settings Accessible**: Toggle "Remember my choice"
- **Persistence**: Stored in localStorage as `skipDeleteConfirm`
- **Cascade Adjust**: Pagination adjusted if needed after delete

#### Clear All Transactions

- **Admin Only**: Dangerous operation requires admin role
- **Confirmation Modal**: Prevents accidental clearing
- **Complete Reset**: Removes all transactions from dashboard

### 2. **Filtering & Sorting**

#### Type Filter

```javascript
// Values: "all", "income", "expense"
Filter transactions by type (income or expense)
```

#### Search Filter

```javascript
// Searches both description and category
search("grocery") → Returns all transactions with "grocery" in description/category
```

#### Sorting Options

- **Newest First**: `date_desc` - Recent transactions first
- **Oldest First**: `date_asc` - Historical transactions first
- **High to Low**: `amount_desc` - Largest amounts first
- **Low to High**: `amount_asc` - Smallest amounts first

#### Combined Filtering

```javascript
// All filters work together
1. Apply type filter (income/expense)
2. Apply search term
3. Apply sort
4. Apply pagination
```

#### Smart Pagination Reset

```javascript
// When filters change, reset to page 1
if (filterChanged || searchChanged) {
  currentPage = 1;
}
```

### 3. **Dark Mode**

#### Implementation

```javascript
// Toggle dark mode
dispatch({ type: "TOGGLE_DARK_MODE" })

// CSS Application
patchClass(document.body, "dark-mode", state.darkMode)

// Persistence
localStorage.setItem("darkMode", state.darkMode)
```

#### Styling Approach

- **CSS Cascade**: All dark mode styles scoped under `body.dark-mode`
- **Coverage**:
  - Cards and backgrounds
  - Text and borders
  - Form elements (input, select, textarea)
  - Modals and offcanvas
  - Tables and pagination
  - Date picker (WebKit pseudo-elements)

#### Smooth Transitions

```css
* { transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
```

### 4. **Dashboard Summary**

#### Cards Display

- **Total Balance**: Income - Expenses
- **Total Income**: Sum of all income this month
- **Total Expenses**: Sum of all expenses this month

#### Calculation

```javascript
const { totalIncome, totalExpense, totalBalance } = computeSummary(transactions);
```

### 5. **Charts & Visualizations**

#### Balance Trend Chart

- **Type**: Line chart
- **Period**: Last 6 months
- **Data**: Monthly balance progression
- **Updates**: Recalculates when transactions change

```javascript
function computeTrend(transactions) {
  // For each of last 6 months:
  // - Sum income and expense transactions
  // - Calculate running balance
}
```

#### Spending by Category Chart

- **Type**: Doughnut chart
- **Data**: Expenses grouped by category
- **Filtering**: Only expense transactions
- **Colors**: 6 distinct colors for categories

```javascript
function renderCategoryChart(transactions) {
  // Group expenses by category
  // Create doughnut chart with Chart.js
}
```

### 6. **Smart Insights**

Auto-generated insights based on spending patterns:

- **Top Spending Category**: Where you spend most
- **Total Expense**: Overall spending amount
- **Month-over-Month Change**: Spending trend vs last month
- **Top Income Source**: Where you earn most
- **Total Income**: Overall income amount

```javascript
function computeInsights(transactions) {
  // Analyze spending patterns
  // Calculate trends
  // Return insights object
}
```

### 7. **Role-Based Access Control**

#### Viewer Role

- ✅ View transactions
- ✅ View charts and insights
- ✅ Filter and sort
- ✅ Use dark mode
- ❌ Add transactions
- ❌ Edit transactions
- ❌ Delete transactions
- ❌ Access settings

#### Admin Role

- ✅ All viewer permissions PLUS:
- ✅ Add transactions
- ✅ Edit transactions
- ✅ Delete transactions
- ✅ Clear all transactions
- ✅ Reset dashboard
- ✅ Access settings

#### Implementation

```javascript
const isAdmin = state.role === "admin";
addBtn.style.display = isAdmin ? "inline-block" : "none";
adminHeader.style.display = isAdmin ? "table-cell" : "none";
```

### 8. **Settings Panel**

#### Delete Confirmation Preference

- Toggle to enable/disable delete confirmation dialog
- Choice remembered in localStorage
- Applies to single and bulk deletes

### 9. **Empty States**

#### No Transactions (Empty Dashboard)

```
┌─────────────────────┐
│  No Transactions    │
└─────────────────────┘
```

#### No Matching Results (After Filtering)

```
┌──────────────────────────────────────────┐
│  No transactions match your filters. 🧾  │
└──────────────────────────────────────────┘
```

---

## 💾 Data Persistence

### localStorage Keys

| Key                   | Content                  | Type    |
| --------------------- | ------------------------ | ------- |
| `fintransactions`   | Array of transactions    | JSON    |
| `darkMode`          | Dark mode preference     | Boolean |
| `skipDeleteConfirm` | Delete confirmation pref | Boolean |

### Transaction Object Structure

```javascript
{
  id: "1712250123456",           // Unique identifier (timestamp)
  date: "2024-04-04",            // ISO date format
  description: "Salary",          // User-provided description
  category: "Work",               // User-provided category
  amount: 5000,                   // Number (always positive)
  type: "income" | "expense"      // Transaction type
}
```

### Data Loading Flow

```javascript
// 1. Initial app load
function initializeAppState() {
  // Load from localStorage
  const saved = localStorage.getItem("fintransactions");
  state.transactions = saved ? JSON.parse(saved) : defaultTransactions;
  
  // Load preferences
  state.darkMode = localStorage.getItem("darkMode") === "true";
  state.deleteConfirmRequired = localStorage.getItem("skipDeleteConfirm") !== "true";
}

// 2. On every transaction change
localStorage.setItem("fintransactions", JSON.stringify(state.transactions));
```

---

## 🔧 Technologies Used

### Frontend

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, transitions, media queries
- **JavaScript (ES6+)**: No frameworks or transpilers

### Libraries

- **Bootstrap 5.3.0**: CSS framework and grid system
- **Bootstrap Icons 1.11.3**: Icon library (50+ icons)
- **Chart.js 4.4.0**: Chart visualization library

### Tools & Services

- **Vercel**: Deployment platform (optional)
- **localStorage API**: Client-side data persistence

---

## 📊 Performance Characteristics

### Optimizations Implemented

- ✅ **Event Delegation**: Single listeners instead of per-element
- ✅ **DOM Diffing**: Minimal DOM mutations
- ✅ **Keyed Diffing**: Efficient table updates
- ✅ **CSS Transitions**: Hardware acceleration
- ✅ **Code Splitting**: Organized into logical modules
- ✅ **Lazy Loading**: Charts only render when needed

### Scalability Limits

- **Current**: Handles 1000+ transactions smoothly
- **Future**: Only fetch what's needed, process transactions block wise for 10k+ transactions
- **Backend**: Move to backend for 100k+ transactions

---

## 🐛 Browser Support

| Browser | Version | Status           |
| ------- | ------- | ---------------- |
| Chrome  | 90+     | ✅ Full Support  |
| Firefox | 88+     | ✅ Full Support  |
| Safari  | 14+     | ✅ Full Support  |
| Edge    | 90+     | ✅ Full Support  |
| IE 11   | -       | ❌ Not Supported |

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px (single column, stacked layout)
- **Tablet**: 768px - 1024px (two columns for charts)
- **Desktop**: > 1024px (full layout)

### Responsive Elements

- Summary cards stack on mobile
- Charts display side-by-side on desktop
- Table becomes scrollable on small screens
- Modals adapt to screen size
- Buttons reflow for mobile

---

## 🎓 Learning Resources

This project demonstrates:

- ✅ Vanilla JavaScript state management
- ✅ DOM manipulation and diffing
- ✅ Event delegation patterns
- ✅ CSS architecture and theming
- ✅ Responsive web design
- ✅ Data visualization with Chart.js
- ✅ localStorage persistence
- ✅ Accessibility best practices

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Prerequisites: Vercel CLI installed
npm install -g vercel

# Deploy
vercel

# Select your project directory
# Follow prompts to complete deployment
```

### Deploy to GitHub Pages

```bash
# Push to GitHub
git push origin main

# Enable GitHub Pages in Settings
# Visit: https://username.github.io/findash/
```

### Deploy to Netlify

```bash
# Via Netlify UI
# 1. Connect GitHub repo
# 2. Build command: (leave empty)
# 3. Publish directory: (leave empty, root)
# 4. Deploy
```

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support & Questions

For issues, questions, or suggestions:

- Open a GitHub issue
- Review code comments for implementation details

---

## 🎯 Future Enhancements

### Short Term

- [ ] Export transactions as CSV
- [ ] Monthly budget setting and tracking
- [ ] Transaction categories customization
- [ ] Recurring transactions

### Medium Term

- [ ] Backend API integration
- [ ] User authentication
- [ ] Multi-user support
- [ ] Advanced reporting

### Long Term

- [ ] Mobile app (React Native)
- [ ] AI-powered insights
- [ ] Integration with banking APIs
- [ ] Multi-currency support
- [ ] Investment tracking

---

## 📚 Project Statistics

```
Frontend Code: ~1000 lines
- JavaScript: ~600 lines
- HTML: ~250 lines
- CSS: ~150 lines

Features: 9
Components: 6
State Slices: 8
Actions: 12+
Helper Functions: 5+

Browser Support: 4 major browsers
Accessibility: WCAG 2.1 Level AA
```

---

## ✨ Credits

Built with attention to detail and best practices for frontend development.

- **Inspiration**: Modern finance apps and dashboards
- **Libraries**: Bootstrap, Chart.js, Bootstrap Icons
- **Design**: Clean, minimal, user-centric approach

---

**Made with ❤️ by Yashwanth** | [GitHub](https://github.com/yashwanth2706) | [Portfolio](#)
