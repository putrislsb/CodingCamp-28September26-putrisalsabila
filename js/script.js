/* ================================================================
   EXPENSE & BUDGET VISUALIZER — script.js
   Single JavaScript file for the entire application.

   Sections:
   1.  Constants & Storage Keys
   2.  Application State
   3.  Local Storage Helpers
   4.  ID & Date Utilities
   5.  Currency Formatter
   6.  Validation
   7.  Transaction Operations (add / delete)
   8.  Render — Transaction List
   9.  Render — Total Balance
   10. Render — Pie Chart
   11. Render — Monthly Summary
   12. Render — Spending Limit Indicator
   13. Category Helpers (custom categories)
   14. Sorting
   15. Theme (dark / light)
   16. Event Handlers
   17. Initialisation
================================================================ */

'use strict';

/* ================================================================
   1. CONSTANTS & STORAGE KEYS
================================================================ */

const STORAGE_KEYS = {
  TRANSACTIONS:   'ebv_transactions',
  CATEGORIES:     'ebv_categories',
  SORT:           'ebv_sort',
  THEME:          'ebv_theme',
  SPENDING_LIMIT: 'ebv_spending_limit',
};

/** Default categories — always present, never removed. */
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

/**
 * Chart colours per category (index matches category order).
 * Extra colours for custom categories cycle through this palette.
 */
const CHART_PALETTE = [
  '#f97316', // Food      — orange
  '#3b82f6', // Transport — blue
  '#a855f7', // Fun       — purple
  '#10b981', // custom 1  — emerald
  '#ef4444', // custom 2  — red
  '#eab308', // custom 3  — yellow
  '#06b6d4', // custom 4  — cyan
  '#ec4899', // custom 5  — pink
  '#84cc16', // custom 6  — lime
  '#f59e0b', // custom 7  — amber
];

/* ================================================================
   2. APPLICATION STATE
================================================================ */

let transactions   = [];   // array of transaction objects
let categories     = [...DEFAULT_CATEGORIES]; // full category list
let currentSort    = 'newest';
let spendingLimit  = null; // number | null
let theme          = 'light';
let chartInstance  = null; // single Chart.js instance, reused

/* ================================================================
   3. LOCAL STORAGE HELPERS
================================================================ */

/** Load all persisted state from Local Storage into memory. */
function loadFromStorage() {
  // ── Transactions ──
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const parsed = raw ? JSON.parse(raw) : [];
    transactions = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    transactions = [];
  }

  // ── Categories ──
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const parsed = raw ? JSON.parse(raw) : [];
    const saved = Array.isArray(parsed) ? parsed : [];
    // Always start with defaults, then append any saved custom ones
    categories = [...DEFAULT_CATEGORIES];
    saved.forEach(cat => {
      if (typeof cat === 'string' && cat.trim() && !categories.includes(cat)) {
        categories.push(cat);
      }
    });
  } catch (_) {
    categories = [...DEFAULT_CATEGORIES];
  }

  // ── Sort preference ──
  const savedSort = localStorage.getItem(STORAGE_KEYS.SORT);
  const validSorts = ['newest', 'oldest', 'amount-asc', 'amount-desc'];
  currentSort = validSorts.includes(savedSort) ? savedSort : 'newest';

  // ── Theme ──
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  theme = savedTheme === 'dark' ? 'dark' : 'light';

  // ── Spending limit ──
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPENDING_LIMIT);
    const parsed = raw !== null ? parseFloat(raw) : null;
    spendingLimit = (parsed !== null && !isNaN(parsed) && parsed > 0) ? parsed : null;
  } catch (_) {
    spendingLimit = null;
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

function saveCategories() {
  // Only persist custom (non-default) categories
  const custom = categories.filter(c => !DEFAULT_CATEGORIES.includes(c));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(custom));
}

function saveSort() {
  localStorage.setItem(STORAGE_KEYS.SORT, currentSort);
}

function saveTheme() {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function saveSpendingLimit() {
  if (spendingLimit !== null) {
    localStorage.setItem(STORAGE_KEYS.SPENDING_LIMIT, String(spendingLimit));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SPENDING_LIMIT);
  }
}

/* ================================================================
   4. ID & DATE UTILITIES
================================================================ */

/** Generate a unique ID for a new transaction. */
function generateId() {
  return 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
}

/**
 * Return a sortable "YYYY-MM" key from an ISO date string.
 */
function getMonthKey(isoString) {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/* ================================================================
   5. CURRENCY FORMATTER
================================================================ */

/**
 * Format a number as Indonesian Rupiah.
 * e.g. 25000 → "Rp 25.000"
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ================================================================
   6. VALIDATION
================================================================ */

/**
 * Show a field-level error message.
 * @param {string} elementId - The ID of the <span> error element.
 * @param {string} message   - The error text to show.
 */
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.removeAttribute('hidden');
}

/**
 * Hide a field-level error message.
 * @param {string} elementId
 */
function clearError(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = '';
  el.setAttribute('hidden', '');
}

/** Clear all form validation errors at once. */
function clearAllErrors() {
  ['item-name-error', 'amount-error', 'category-error'].forEach(clearError);
}

/**
 * Validate the add-transaction form fields.
 * Returns true if valid, false if any field fails.
 */
function validateTransactionForm(name, amountRaw, category) {
  let valid = true;

  // Item Name
  if (!name || !name.trim()) {
    showError('item-name-error', 'Item name is required.');
    valid = false;
  }

  // Amount
  if (amountRaw === '' || amountRaw === null || amountRaw === undefined) {
    showError('amount-error', 'Amount is required.');
    valid = false;
  } else {
    const num = parseFloat(amountRaw);
    if (isNaN(num)) {
      showError('amount-error', 'Please enter a valid number.');
      valid = false;
    } else if (num <= 0) {
      showError('amount-error', 'Amount must be greater than zero.');
      valid = false;
    }
  }

  // Category
  if (!category) {
    showError('category-error', 'Please select a category.');
    valid = false;
  }

  return valid;
}

/* ================================================================
   7. TRANSACTION OPERATIONS
================================================================ */

/**
 * Create a new transaction object and add it to the array.
 * Then persist and re-render everything.
 */
function addTransaction(name, amount, category) {
  const tx = {
    id:        generateId(),
    name:      name.trim(),
    amount:    parseFloat(amount),
    category:  category,
    createdAt: new Date().toISOString(),
  };
  transactions.push(tx);
  saveTransactions();
  renderAll();
}

/**
 * Remove a transaction by its ID.
 * Then persist and re-render everything.
 */
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

/* ================================================================
   8. RENDER — TRANSACTION LIST
================================================================ */

/**
 * Return a sorted copy of the transactions array based on
 * `currentSort`. Never mutates the original array.
 */
function getSortedTransactions() {
  const copy = [...transactions];
  switch (currentSort) {
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount);
    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount);
    default:
      return copy;
  }
}

/**
 * Determine which colour dot to show for a category.
 * Defaults to the "custom" green for user-added categories.
 */
function getCategoryDotAttr(category) {
  const known = ['Food', 'Transport', 'Fun'];
  return known.includes(category) ? category : 'custom';
}

/**
 * Re-render the full transaction list.
 * Shows/hides the empty state as appropriate.
 */
function renderTransactions() {
  const listEl     = document.getElementById('transaction-list');
  const emptyEl    = document.getElementById('empty-state');
  const sorted     = getSortedTransactions();

  if (sorted.length === 0) {
    listEl.setAttribute('hidden', '');
    emptyEl.removeAttribute('hidden');
    return;
  }

  emptyEl.setAttribute('hidden', '');
  listEl.removeAttribute('hidden');

  listEl.innerHTML = '';

  sorted.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.dataset.id = tx.id;

    li.innerHTML = `
      <div class="tx-info">
        <span class="tx-dot" data-cat="${escapeHtml(getCategoryDotAttr(tx.category))}" aria-hidden="true"></span>
        <div class="tx-details">
          <span class="tx-name" title="${escapeHtml(tx.name)}">${escapeHtml(tx.name)}</span>
          <span class="tx-category">${escapeHtml(tx.category)}</span>
        </div>
      </div>
      <div class="tx-right">
        <span class="tx-amount">${formatRupiah(tx.amount)}</span>
        <button
          class="btn btn-danger"
          data-delete-id="${escapeHtml(tx.id)}"
          aria-label="Delete transaction: ${escapeHtml(tx.name)}"
        >Delete</button>
      </div>
    `;

    listEl.appendChild(li);
  });
}

/** Minimal HTML escaping to prevent XSS when inserting user data. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ================================================================
   9. RENDER — TOTAL BALANCE
================================================================ */

function calculateTotal() {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

function renderBalance() {
  const totalEl = document.getElementById('total-balance');
  const total   = calculateTotal();
  totalEl.textContent = formatRupiah(total);

  // Highlight in yellow if over the spending limit
  if (spendingLimit !== null && total >= spendingLimit) {
    totalEl.classList.add('over-limit');
  } else {
    totalEl.classList.remove('over-limit');
  }
}

/* ================================================================
   10. RENDER — PIE CHART
================================================================ */

/**
 * Aggregate total spending per category from the transactions array.
 * Returns an object: { Food: 50000, Transport: 20000, … }
 */
function getCategoryTotals() {
  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });
  return totals;
}

/**
 * Map a category name to its chart colour.
 * Known categories get fixed colours; custom categories cycle through the palette.
 */
function getCategoryColor(category, allCategories) {
  const idx = allCategories.indexOf(category);
  return CHART_PALETTE[idx % CHART_PALETTE.length] || CHART_PALETTE[0];
}

/**
 * Create or update the Chart.js pie chart.
 * If no transactions exist, destroy any existing chart and show the empty state.
 */
function renderChart() {
  const containerEl = document.getElementById('chart-container');
  const emptyEl     = document.getElementById('chart-empty');
  const canvasEl    = document.getElementById('expense-chart');

  const totals = getCategoryTotals();
  const labels = Object.keys(totals);

  if (labels.length === 0) {
    // No data — hide chart, show empty state
    containerEl.setAttribute('hidden', '');
    emptyEl.removeAttribute('hidden');

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  // Has data — show chart, hide empty state
  emptyEl.setAttribute('hidden', '');
  containerEl.removeAttribute('hidden');

  const data   = labels.map(l => totals[l]);
  const colors = labels.map(l => getCategoryColor(l, categories));

  if (chartInstance) {
    // Update existing instance — no memory leak, no flicker
    chartInstance.data.labels                       = labels;
    chartInstance.data.datasets[0].data             = data;
    chartInstance.data.datasets[0].backgroundColor  = colors;
    chartInstance.data.datasets[0].borderColor       = colors.map(() =>
      theme === 'dark' ? '#1e293b' : '#ffffff'
    );
    chartInstance.update();
  } else {
    // Create fresh instance
    const ctx = canvasEl.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(() => theme === 'dark' ? '#1e293b' : '#ffffff'),
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 13, family: "'Segoe UI', system-ui, sans-serif" },
              color: theme === 'dark' ? '#94a3b8' : '#6b7280',
              usePointStyle: true,
              pointStyleWidth: 10,
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                const val = context.parsed;
                const total = context.dataset.data.reduce((s, v) => s + v, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${formatRupiah(val)}  (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}

/**
 * Update chart text colours when theme changes, without rebuilding.
 */
function updateChartTheme() {
  if (!chartInstance) return;
  const labelColor = theme === 'dark' ? '#94a3b8' : '#6b7280';
  const borderColor = theme === 'dark' ? '#1e293b' : '#ffffff';

  chartInstance.options.plugins.legend.labels.color = labelColor;
  chartInstance.data.datasets[0].borderColor =
    chartInstance.data.datasets[0].data.map(() => borderColor);
  chartInstance.update();
}

/* ================================================================
   11. RENDER — MONTHLY SUMMARY
================================================================ */

function renderMonthlySummary() {
  const listEl  = document.getElementById('monthly-summary-list');
  const emptyEl = document.getElementById('monthly-empty');

  if (transactions.length === 0) {
    listEl.innerHTML = '';
    emptyEl.removeAttribute('hidden');
    return;
  }

  emptyEl.setAttribute('hidden', '');

  // Group by "YYYY-MM"
  const groups = {};
  transactions.forEach(tx => {
    const key = getMonthKey(tx.createdAt);
    groups[key] = (groups[key] || 0) + tx.amount;
  });

  // Sort months descending (most recent first)
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  listEl.innerHTML = '';
  sortedKeys.forEach(key => {
    const li = document.createElement('li');
    li.className = 'monthly-item';
    // Convert "YYYY-MM" → "Month YYYY" label
    const labelDate = new Date(key + '-01T00:00:00');
    const label = labelDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    li.innerHTML = `
      <span class="monthly-label">${escapeHtml(label)}</span>
      <span class="monthly-amount">${formatRupiah(groups[key])}</span>
    `;
    listEl.appendChild(li);
  });
}

/* ================================================================
   12. RENDER — SPENDING LIMIT INDICATOR
================================================================ */

function renderSpendingLimit() {
  const warningEl  = document.getElementById('limit-warning');
  const warningTxt = document.getElementById('limit-warning-text');
  const total      = calculateTotal();

  if (spendingLimit !== null && total >= spendingLimit) {
    warningTxt.textContent =
      `Spending limit of ${formatRupiah(spendingLimit)} reached! Current: ${formatRupiah(total)}`;
    warningEl.removeAttribute('hidden');
  } else {
    warningEl.setAttribute('hidden', '');
  }
}

/* ================================================================
   13. CATEGORY HELPERS
================================================================ */

/**
 * Re-populate the #category <select> with the current categories list.
 * Preserves the currently selected value if still valid.
 */
function renderCategoryOptions() {
  const select = document.getElementById('category');
  const current = select.value;

  // Remove all options except the placeholder
  select.innerHTML = '<option value="">— Select a category —</option>';

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  // Restore previous selection if it's still valid
  if (categories.includes(current)) {
    select.value = current;
  }
}

/**
 * Validate and add a new custom category from the input field.
 */
function handleAddCategory() {
  const input = document.getElementById('custom-category-input');
  const name  = input.value.trim();

  clearError('custom-category-error');

  if (!name) {
    showError('custom-category-error', 'Category name is required.');
    return;
  }

  // Case-insensitive duplicate check
  const exists = categories.some(c => c.toLowerCase() === name.toLowerCase());
  if (exists) {
    showError('custom-category-error', 'This category already exists.');
    return;
  }

  categories.push(name);
  saveCategories();
  renderCategoryOptions();
  input.value = '';
}

/* ================================================================
   14. SORTING
================================================================ */

function handleSortChange(value) {
  currentSort = value;
  saveSort();
  renderTransactions(); // only list re-renders; total/chart unaffected
}

/* ================================================================
   15. THEME
================================================================ */

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('theme-toggle');
  if (t === 'dark') {
    btn.textContent = '☀️ Light Mode';
  } else {
    btn.textContent = '🌙 Dark Mode';
  }
  updateChartTheme();
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  saveTheme();
}

/* ================================================================
   16. MASTER RENDER — call after every data mutation
================================================================ */

/**
 * Re-render every UI region that depends on transaction data.
 * Called after add, delete, or init.
 */
function renderAll() {
  renderTransactions();
  renderBalance();
  renderChart();
  renderSpendingLimit();

  // Monthly summary only re-renders if the section is currently visible
  const summarySection = document.getElementById('monthly-summary-section');
  if (!summarySection.hidden) {
    renderMonthlySummary();
  }
}

/* ================================================================
   17. EVENT HANDLERS
================================================================ */

/** Handle the Add Transaction form submission. */
function handleFormSubmit(event) {
  event.preventDefault();
  clearAllErrors();

  const nameInput     = document.getElementById('item-name');
  const amountInput   = document.getElementById('amount');
  const categoryInput = document.getElementById('category');

  const name     = nameInput.value;
  const amount   = amountInput.value;
  const category = categoryInput.value;

  if (!validateTransactionForm(name, amount, category)) {
    return; // errors already shown
  }

  addTransaction(name, amount, category);

  // Reset the form
  event.target.reset();
}

/** Handle clicks anywhere inside the transaction list (event delegation). */
function handleListClick(event) {
  const btn = event.target.closest('[data-delete-id]');
  if (!btn) return;
  const id = btn.dataset.deleteId;
  if (id) {
    deleteTransaction(id);
  }
}

/** Handle the Set Limit button. */
function handleSetLimit() {
  const input = document.getElementById('spending-limit');
  const raw   = input.value;
  clearError('limit-error');

  if (raw === '' || raw === null) {
    // Clearing the limit — allow empty to reset it
    spendingLimit = null;
    saveSpendingLimit();
    renderBalance();
    renderSpendingLimit();
    return;
  }

  const val = parseFloat(raw);
  if (isNaN(val) || val <= 0) {
    showError('limit-error', 'Please enter a valid positive amount.');
    return;
  }

  spendingLimit = val;
  saveSpendingLimit();
  renderBalance();
  renderSpendingLimit();
}

/** Handle the Monthly Summary toggle button. */
function handleToggleSummary() {
  const section = document.getElementById('monthly-summary-section');
  const btn     = document.getElementById('toggle-summary-btn');
  const isHidden = section.hidden;

  if (isHidden) {
    section.removeAttribute('hidden');
    btn.textContent = '📅 Hide Monthly Summary';
    renderMonthlySummary();
  } else {
    section.setAttribute('hidden', '');
    btn.textContent = '📅 Show Monthly Summary';
  }
}

/* ================================================================
   18. BIND ALL EVENT LISTENERS
================================================================ */

function bindEvents() {
  // Add transaction form
  document.getElementById('transaction-form')
    .addEventListener('submit', handleFormSubmit);

  // Delete transactions — event delegation on the list
  document.getElementById('transaction-list')
    .addEventListener('click', handleListClick);

  // Sort dropdown
  document.getElementById('sort-select')
    .addEventListener('change', function () {
      handleSortChange(this.value);
    });

  // Add custom category
  document.getElementById('add-category-btn')
    .addEventListener('click', handleAddCategory);

  // Allow Enter key in custom category input
  document.getElementById('custom-category-input')
    .addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCategory();
      }
    });

  // Theme toggle
  document.getElementById('theme-toggle')
    .addEventListener('click', toggleTheme);

  // Spending limit
  document.getElementById('set-limit-btn')
    .addEventListener('click', handleSetLimit);

  // Monthly summary toggle
  document.getElementById('toggle-summary-btn')
    .addEventListener('click', handleToggleSummary);
}

/* ================================================================
   19. INITIALISATION
================================================================ */

function init() {
  // 1. Load all persisted state
  loadFromStorage();

  // 2. Apply saved theme before anything renders (avoids flash)
  applyTheme(theme);

  // 3. Populate sort dropdown with saved preference
  const sortSelect = document.getElementById('sort-select');
  sortSelect.value = currentSort;

  // 4. Populate category dropdown
  renderCategoryOptions();

  // 5. Restore spending limit input value if one is saved
  if (spendingLimit !== null) {
    document.getElementById('spending-limit').value = spendingLimit;
  }

  // 6. Render all UI regions
  renderAll();

  // 7. Bind all DOM event listeners
  bindEvents();
}

// ── Kick off the app ──
init();
