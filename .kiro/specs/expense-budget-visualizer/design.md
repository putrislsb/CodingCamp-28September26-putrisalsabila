# Design: Expense & Budget Visualizer

## 1. Overall Architecture

The application is a single-page web application (SPA) built entirely on the client side. There is no backend, no build tool, and no JavaScript framework. The application consists of three files that work together:

- `index.html` — defines the page structure and loads dependencies
- `css/style.css` — handles all visual styling and theming
- `js/script.js` — handles all application logic, data management, and DOM manipulation

The application follows a simple **data-driven rendering** pattern:

1. A single source-of-truth array (`transactions`) lives in memory during the session.
2. Every user action (add, delete, sort, set limit, change theme, add category) mutates that array or a related state variable.
3. After every mutation, a set of render functions re-draw the affected parts of the UI.
4. After every mutation that changes persistent data, the state is written back to Local Storage.

This keeps the logic linear and easy to follow without requiring a framework.

```
User Action
    │
    ▼
Mutate State (transactions[], categories[], theme, spendingLimit)
    │
    ▼
Persist to Local Storage
    │
    ▼
Re-render UI (list, total, chart, summary, limit indicator)
```

---

## 2. File Structure

```
project-root/
│
├── .kiro/
│   └── specs/
│       └── expense-budget-visualizer/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── css/
│   └── style.css          ← All styles, themes, responsive rules
│
├── js/
│   └── script.js          ← All application logic
│
├── index.html             ← Page structure and Chart.js CDN link
└── README.md
```

Only one CSS file and one JavaScript file are used. Chart.js is loaded from a CDN link in `index.html`.

---

## 3. HTML Structure

The page is divided into five logical sections inside a single `<main>` container:

```
<body>
  <header>
    App title + Dark/Light mode toggle button
  </header>

  <main>

    <!-- Section 1: Summary Bar -->
    <section id="summary-bar">
      Total spending display
      Spending limit input + set button
      Limit warning message (hidden by default)
    </section>

    <!-- Section 2: Input Form -->
    <section id="form-section">
      <form id="transaction-form">
        Item Name input + error message
        Amount input + error message
        Category select + error message
        Add Custom Category input + button
        Submit button
      </form>
    </section>

    <!-- Section 3: Controls (Sort + Monthly Summary toggle) -->
    <section id="controls-section">
      Sort dropdown
      Monthly Summary toggle button
    </section>

    <!-- Section 4: Transaction List -->
    <section id="list-section">
      <ul id="transaction-list">
        <!-- Transaction items rendered here by JS -->
      </ul>
      <p id="empty-state">No transactions yet.</p>  <!-- hidden when list has items -->
    </section>

    <!-- Section 5: Chart + Monthly Summary -->
    <section id="chart-section">
      <canvas id="expense-chart"></canvas>
      <p id="chart-empty-state">Add transactions to see the chart.</p>
    </section>

    <section id="monthly-summary-section" hidden>
      <h2>Monthly Summary</h2>
      <ul id="monthly-summary-list">
        <!-- Monthly summary items rendered here by JS -->
      </ul>
    </section>

  </main>
</body>
```

All interactive elements use semantic HTML tags: `<form>`, `<input>`, `<select>`, `<button>`, `<ul>`, `<li>`. Labels are explicitly connected to their inputs using `for`/`id` pairs.

---

## 4. CSS Organization

`style.css` is organized in this order:

```
1. CSS Custom Properties (variables)
   - Light theme colors (default)
   - Dark theme colors (on [data-theme="dark"])

2. Reset / Base styles
   - box-sizing, margin, padding, font-family

3. Layout
   - body, main container, section spacing
   - Two-column layout for wider screens (form left, chart right)

4. Header
   - App title, theme toggle button

5. Summary Bar
   - Total spending display
   - Spending limit input group
   - Limit warning styles

6. Form section
   - Input fields, labels, select, button
   - Validation error message styles

7. Controls section
   - Sort dropdown
   - Monthly summary toggle

8. Transaction list
   - List container, list items
   - Delete button
   - Scrollable list container

9. Chart section
   - Canvas wrapper

10. Monthly summary section
    - Month group items

11. Utility classes
    - .hidden, .warning, .over-limit

12. Responsive breakpoints
    - Mobile-first base, tablet (min-width: 600px), desktop (min-width: 960px)
```

### Theming Strategy

Theming is implemented entirely through CSS custom properties. The `:root` selector defines light mode defaults. When the `<html>` element has the attribute `data-theme="dark"`, a second block overrides only the color variables. No JavaScript color manipulation is needed.

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f5f5f5;
  --color-text: #1a1a1a;
  --color-primary: #4f46e5;
  --color-danger: #dc2626;
  --color-warning: #f59e0b;
  --color-border: #d1d5db;
}

[data-theme="dark"] {
  --color-bg: #1a1a2e;
  --color-surface: #16213e;
  --color-text: #e2e8f0;
  --color-primary: #818cf8;
  --color-danger: #f87171;
  --color-warning: #fbbf24;
  --color-border: #334155;
}
```

---

## 5. JavaScript Organization

`script.js` is organized into clearly commented sections in this order:

```
1. Constants & Configuration
   - Local Storage keys
   - Default categories list

2. Application State
   - transactions[]        — array of transaction objects
   - categories[]          — array of category name strings
   - currentSort           — current sort option string
   - spendingLimit         — number or null
   - theme                 — 'light' or 'dark'
   - chartInstance         — reference to the Chart.js instance

3. Local Storage Helpers
   - loadFromStorage()
   - saveTransactions()
   - saveCategories()
   - saveSpendingLimit()
   - saveTheme()

4. Initialization
   - init()               — loads state from LS, populates dropdowns, renders everything

5. Form & Validation
   - handleFormSubmit(event)
   - validateForm(itemName, amount, category) → boolean
   - showFieldError(fieldId, message)
   - clearAllErrors()

6. Transaction Operations
   - addTransaction(itemName, amount, category)
   - deleteTransaction(id)
   - generateId() → string

7. Rendering Functions
   - renderTransactionList()
   - renderTotalBalance()
   - renderChart()
   - renderMonthlySummary()
   - renderSpendingLimitIndicator()
   - renderCategoryOptions()

8. Sorting
   - getSortedTransactions() → sorted array (does not mutate state)

9. Custom Categories
   - handleAddCategory()
   - validateCategoryName(name) → boolean

10. Monthly Summary
    - groupByMonth(transactions) → object keyed by "YYYY-MM"
    - formatMonthLabel(yearMonth) → "Month YYYY" string

11. Spending Limit
    - handleSetSpendingLimit()
    - checkSpendingLimit()

12. Theme
    - handleThemeToggle()
    - applyTheme(theme)

13. Event Listener Bindings
    - All addEventListener calls in one place at the bottom
```

Functions are short and single-purpose. Each render function reads from the current application state and writes to the DOM. No function directly manipulates Local Storage — all LS writes go through the dedicated helper functions.

---

## 6. Transaction Data Model

Each transaction is a plain JavaScript object stored in an array:

```js
{
  id: "tx_1693000000000_4821",   // unique string ID
  itemName: "Lunch",             // string, trimmed
  amount: 25000,                 // number (positive)
  category: "Food",              // string, must match a category name
  date: "2026-10-01T14:30:00Z"  // ISO 8601 string, set at creation time
}
```

The `date` field enables the Monthly Summary feature. It is set to `new Date().toISOString()` when the transaction is created.

The `id` is generated by combining a prefix, the current timestamp, and a random 4-digit number to ensure uniqueness: `"tx_" + Date.now() + "_" + Math.floor(Math.random() * 10000)`.

The complete application state stored in Local Storage:

| Key                          | Value                                  |
|------------------------------|----------------------------------------|
| `expense_transactions`       | JSON array of transaction objects      |
| `expense_categories`         | JSON array of category name strings    |
| `expense_spending_limit`     | Number string or `null`                |
| `expense_theme`              | `"light"` or `"dark"`                 |

---

## 7. Local Storage Strategy

All reads happen once at application startup inside `init()`. All writes happen immediately after a state mutation.

**Read strategy (init):**
```js
function loadFromStorage() {
  try {
    const raw = localStorage.getItem('expense_transactions');
    transactions = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(transactions)) transactions = [];
  } catch (e) {
    transactions = [];  // handle malformed JSON safely
  }
  // same pattern for categories, spendingLimit, theme
}
```

**Write strategy (after every mutation):**
```js
function saveTransactions() {
  localStorage.setItem('expense_transactions', JSON.stringify(transactions));
}
```

Custom categories are stored separately from transactions so they survive even if all transactions are deleted:
```js
function saveCategories() {
  localStorage.setItem('expense_categories', JSON.stringify(categories));
}
```

This separation makes each storage concern independent and easy to debug.

---

## 8. Form Submission Flow

```
User fills form and clicks "Add Transaction"
    │
    ▼
handleFormSubmit(event) called
    │
    ├── event.preventDefault()
    ├── clearAllErrors()
    ├── Read itemName, amount, category from form fields
    │
    ▼
validateForm(itemName, amount, category)
    │
    ├── itemName empty or whitespace → showFieldError, return false
    ├── amount empty → showFieldError, return false
    ├── amount not a valid number → showFieldError, return false
    ├── amount <= 0 → showFieldError, return false
    ├── category not selected → showFieldError, return false
    └── all valid → return true
    │
    ▼ (if valid)
addTransaction(itemName.trim(), parseFloat(amount), category)
    │
    ├── Create transaction object with generated id and current date
    ├── Push to transactions[]
    └── saveTransactions()
    │
    ▼
Re-render:
    ├── renderTransactionList()
    ├── renderTotalBalance()
    ├── renderChart()
    ├── renderMonthlySummary()
    └── renderSpendingLimitIndicator()
    │
    ▼
Reset form fields
```

---

## 9. Transaction Rendering Flow

```
renderTransactionList() called
    │
    ├── Get sorted transactions from getSortedTransactions()
    │
    ├── If array is empty:
    │     └── Show #empty-state element, hide <ul>
    │
    └── If array has items:
          ├── Hide #empty-state element, show <ul>
          ├── Clear <ul> innerHTML
          └── For each transaction:
                ├── Create <li> element
                ├── Set innerHTML:
                │     ├── Span: itemName
                │     ├── Span: amount (formatted)
                │     ├── Span: category
                │     └── Button: "Delete" with data-id attribute
                └── Append <li> to <ul>
```

Each Delete button stores the transaction's ID in a `data-id` attribute. The event listener on the list uses event delegation — one listener on the `<ul>` catches all delete button clicks.

---

## 10. Delete Transaction Flow

```
User clicks Delete button on a transaction
    │
    ▼
Event delegation on #transaction-list catches click
    │
    ├── Check event.target matches delete button selector
    ├── Read transaction id from data-id attribute
    │
    ▼
deleteTransaction(id)
    │
    ├── Filter transactions[] to remove the item with matching id
    └── saveTransactions()
    │
    ▼
Re-render:
    ├── renderTransactionList()
    ├── renderTotalBalance()
    ├── renderChart()
    ├── renderMonthlySummary()
    └── renderSpendingLimitIndicator()
```

Using event delegation means the list does not need to re-bind listeners every time it re-renders. One listener on the parent `<ul>` handles all current and future delete buttons.

---

## 11. Total Balance Calculation

```js
function renderTotalBalance() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  document.getElementById('total-amount').textContent = formatCurrency(total);
}
```

The total is always recalculated from the live `transactions[]` array. It is never cached separately, which keeps it always in sync with the actual data. A `formatCurrency` helper formats the number for display (e.g., `"Rp 25,000"`).

---

## 12. Category Aggregation

For the pie chart and monthly summary, spending per category is calculated on demand:

```js
function getCategoryTotals() {
  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });
  return totals;  // e.g., { Food: 50000, Transport: 20000, Fun: 15000 }
}
```

This returns only categories that have at least one transaction. Categories with zero spending are omitted from the chart automatically.

---

## 13. Pie Chart Update Flow

Chart.js is loaded via CDN. A single `Chart` instance is created during `init()` and stored in `chartInstance`. It is updated (not recreated) on every render call to avoid canvas flickering.

```
renderChart() called
    │
    ├── Calculate category totals using getCategoryTotals()
    │
    ├── If no transactions:
    │     ├── Show #chart-empty-state message
    │     ├── Hide canvas
    │     └── If chartInstance exists, destroy it and set to null
    │
    └── If transactions exist:
          ├── Hide #chart-empty-state message, show canvas
          ├── Prepare labels[] and data[] arrays from category totals
          │
          ├── If chartInstance does not exist:
          │     └── Create new Chart(ctx, { type: 'pie', data: {...}, options: {...} })
          │
          └── If chartInstance exists:
                ├── Update chartInstance.data.labels
                ├── Update chartInstance.data.datasets[0].data
                └── chartInstance.update()
```

Chart colors are defined as a fixed palette array. Each category index maps to a color. When custom categories are added, they receive the next available color from the palette (cycling if needed).

---

## 14. Custom Category Implementation

Custom categories are stored as an array of strings in Local Storage alongside the three defaults. In memory, the `categories[]` array always starts with the three defaults and appends custom ones.

**Adding a custom category:**

```
User types a name in the custom category input and clicks "Add Category"
    │
    ▼
handleAddCategory()
    │
    ├── Read category name, trim whitespace
    ├── Validate: not empty, not duplicate (case-insensitive check against categories[])
    │
    ├── If invalid: show error message near the input
    │
    └── If valid:
          ├── Push name to categories[]
          ├── saveCategories()
          └── renderCategoryOptions()  — rebuilds the <select> dropdown
```

**Rendering category options:**

```js
function renderCategoryOptions() {
  const select = document.getElementById('category');
  select.innerHTML = '<option value="">-- Select Category --</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}
```

Default categories are always at the start of the `categories[]` array. Custom categories follow. On `init()`, the stored custom categories from Local Storage are merged after the defaults before calling `renderCategoryOptions()`.

---

## 15. Monthly Summary Implementation

Each transaction has a `date` field (ISO 8601 string). The monthly summary groups transactions by year-month.

```js
function groupByMonth(transactions) {
  const groups = {};
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = 0;
    groups[key] += tx.amount;
  });
  return groups;  // e.g., { "2026-10": 75000, "2026-09": 40000 }
}

function formatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-');
  const date = new Date(year, parseInt(month) - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  // e.g., "October 2026"
}
```

The monthly summary section is shown or hidden via a toggle button. When visible, `renderMonthlySummary()` writes a `<li>` for each month, sorted by most recent first. When there are no transactions, it shows an empty state message.

---

## 16. Sorting Implementation

Sorting never modifies the `transactions[]` array directly. Instead, `getSortedTransactions()` returns a new array sorted according to `currentSort`.

```js
function getSortedTransactions() {
  const sorted = [...transactions];  // shallow copy — original is untouched
  if (currentSort === 'amount-asc') {
    sorted.sort((a, b) => a.amount - b.amount);
  } else if (currentSort === 'amount-desc') {
    sorted.sort((a, b) => b.amount - a.amount);
  } else if (currentSort === 'category') {
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  }
  // default (none): return in insertion order
  return sorted;
}
```

`renderTransactionList()` always calls `getSortedTransactions()` to get its display array. The original `transactions[]` remains in insertion order, so the total and Local Storage are always based on the true unsorted data.

When the user changes the sort option:
```
User selects a sort option from the sort dropdown
    │
    ▼
currentSort is updated
renderTransactionList() is called
```

Deletion still uses the original transaction `id`, so it correctly removes the transaction regardless of the current display order.

---

## 17. Spending Limit Implementation

The spending limit is stored as a number in `spendingLimit` (or `null` if not set).

**Setting a limit:**
```
User enters a limit value and clicks "Set Limit"
    │
    ▼
handleSetSpendingLimit()
    │
    ├── Read value, parse as float
    ├── Validate: must be a positive number
    ├── If invalid: show error near limit input
    └── If valid:
          ├── spendingLimit = parsed value
          ├── saveSpendingLimit()
          └── renderSpendingLimitIndicator()
```

**Checking the limit (called after every add/delete):**
```js
function renderSpendingLimitIndicator() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const warningEl = document.getElementById('limit-warning');
  const totalEl = document.getElementById('total-amount');

  if (spendingLimit !== null && total >= spendingLimit) {
    warningEl.textContent = `Warning: You have reached your spending limit of ${formatCurrency(spendingLimit)}!`;
    warningEl.hidden = false;
    totalEl.classList.add('over-limit');
  } else {
    warningEl.hidden = true;
    totalEl.classList.remove('over-limit');
  }
}
```

The visual highlight is implemented with a CSS class (`.over-limit`) on the total amount element — this means it works in both light and dark themes without extra JavaScript.

---

## 18. Theme Implementation

Theme state is stored as the string `"light"` or `"dark"` in Local Storage and in the `theme` variable.

**Applying a theme:**
```js
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  btn.textContent = theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode';
}
```

By setting `data-theme` on the `<html>` element (which is `document.documentElement`), the CSS custom property overrides for `[data-theme="dark"]` cascade down to every element on the page automatically.

**Toggle handler:**
```js
function handleThemeToggle() {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  saveTheme();
}
```

**On init:**
```js
// In init(), after loading theme from LS:
applyTheme(theme);  // applies saved preference before rendering anything else
```

The Chart.js chart colors are defined as hardcoded hex values in the JS, so they are visible in both themes. If needed, the chart's background color can also be updated when `applyTheme` is called by checking `chartInstance` and calling `chartInstance.update()`.

---

## 19. Responsive Layout

The layout uses a **mobile-first** approach. Base styles target small screens (320px+). Media queries add layout complexity only for larger screens.

**Mobile (< 600px):**
- Single column layout
- Form, list, and chart stacked vertically
- Full-width inputs and buttons

**Tablet (600px – 959px):**
- Form inputs can be displayed in a two-column grid within the form
- Chart remains below the list

**Desktop (960px+):**
- Two-column layout: form and controls on the left, transaction list in the center, chart on the right
- Transaction list has a fixed max-height with overflow-y: scroll

This is achieved with CSS Flexbox and/or CSS Grid. No CSS framework is used.

---

## 20. Validation and Error Handling

**Form validation** happens entirely in `validateForm()` before any state mutation:

| Field      | Invalid Condition                           | Error Message                              |
|------------|---------------------------------------------|--------------------------------------------|
| Item Name  | Empty or whitespace only                    | "Item name is required."                   |
| Amount     | Empty                                       | "Amount is required."                      |
| Amount     | Not a valid number (NaN after parseFloat)   | "Please enter a valid number."             |
| Amount     | Zero or negative                            | "Amount must be greater than zero."        |
| Category   | No option selected (empty value)            | "Please select a category."                |

Each error message is placed in a `<span>` element with class `error-message` directly below its input. The span is hidden by default (`display: none`) and shown when an error occurs. All errors are cleared at the start of each form submission attempt.

**Local Storage error handling:**
```js
try {
  const raw = localStorage.getItem('expense_transactions');
  transactions = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(transactions)) transactions = [];
} catch (e) {
  transactions = [];
}
```

If `JSON.parse` throws (malformed data), the catch block silently resets to an empty array. The application continues normally.

**Custom category validation:**

| Condition                        | Error Message                          |
|----------------------------------|----------------------------------------|
| Empty name                       | "Category name is required."           |
| Duplicate (case-insensitive)     | "This category already exists."        |

**Spending limit validation:**

| Condition               | Error Message                             |
|-------------------------|-------------------------------------------|
| Empty or NaN            | "Please enter a valid limit amount."      |
| Zero or negative        | "Limit must be greater than zero."        |

---

## 21. Empty States

Every list-like UI region has an explicit empty state:

| Region                 | Empty State Behavior                                       |
|------------------------|------------------------------------------------------------|
| Transaction list       | Show `<p id="empty-state">No transactions yet.</p>`       |
| Pie chart              | Show text message, hide canvas element                     |
| Monthly summary        | Show `<p>No transactions to summarize.</p>`               |

Empty states use `hidden` attribute or `display: none` via class toggling. They are shown/hidden inside the relevant render function each time it runs.

---

## 22. Browser Compatibility

The application uses only web platform features that have wide cross-browser support:

| Feature                    | Support Notes                                              |
|----------------------------|------------------------------------------------------------|
| `localStorage`             | Supported in all modern browsers                           |
| `JSON.parse` / `stringify` | Universally supported                                      |
| `Array.forEach`, `filter`, `reduce`, `sort` | Universally supported              |
| CSS Custom Properties      | Supported in Chrome 49+, Firefox 31+, Edge 15+, Safari 9+ |
| CSS Flexbox                | Universally supported in modern browsers                   |
| CSS Grid                   | Universally supported in modern browsers                   |
| `<canvas>` element         | Universally supported                                      |
| Chart.js (CDN)             | Requires `<canvas>` support — fully compatible             |
| `data-*` attributes        | Universally supported                                      |
| `Date.toISOString()`       | Universally supported                                      |
| `toLocaleString()`         | Supported in all modern browsers (month formatting)        |

No polyfills are required. The application targets Chrome, Firefox, Edge, and Safari in their current modern versions.
