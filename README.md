# Expense & Budget Visualizer

> CodingCamp Assignment — Putri Salsabila

A clean, modern, mobile-friendly web application for tracking daily expenses.

---

## Features

### MVP Features
- **Add Transactions** — Item name, amount, and category (Food / Transport / Fun)
- **Transaction History** — Scrollable list with delete per item
- **Total Balance** — Auto-updates on every add / delete, formatted as Rupiah
- **Pie Chart** — Spending distribution by category using Chart.js (auto-updates)
- **Local Storage** — All data persists after page refresh; invalid data handled gracefully
- **Form Validation** — Required fields, positive amount, category selection enforced
- **Empty States** — Friendly messages when no transactions or chart data exist

### Optional Features (Official — 3 of 5)
1. **Custom Categories** — Add new categories; stored in Local Storage; persist after refresh
2. **Sort Transactions** — Newest / Oldest / Amount Low→High / Amount High→Low
3. **Dark / Light Mode** — Toggle with one click; preference saved and restored on reload

### Additional Enhancements
4. **Spending Limit** — Set a budget limit; warning appears when total reaches or exceeds it
5. **Monthly Summary** — Toggle view of spending grouped and totalled by month

---

## Technology

- HTML5 (semantic markup)
- CSS3 (custom properties, Flexbox, responsive media queries)
- Vanilla JavaScript (ES6+, no frameworks)
- Browser Local Storage API
- [Chart.js 4.4.0](https://www.chartjs.org/) via CDN

No build tools, no npm, no backend required.

---

## File Structure

```
project-root/
├── index.html          ← Application shell
├── css/
│   └── style.css       ← All styles (single file)
├── js/
│   └── script.js       ← All logic (single file)
├── README.md
└── .kiro/
    └── specs/
        └── expense-budget-visualizer/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

---

## Running Locally

Open `index.html` directly in any modern browser — no server needed.

```
Chrome / Firefox / Edge / Safari
```

---

## Deployment

This project is deployable to **GitHub Pages** with zero configuration:

1. Push all files to the `main` branch.
2. Go to **Settings → Pages → Source: main / root**.
3. GitHub will publish the app at `https://<username>.github.io/<repo>/`.

Live URL: *(fill in after deployment)*

---

## Browser Compatibility

Chrome · Firefox · Edge · Safari (all modern versions)
