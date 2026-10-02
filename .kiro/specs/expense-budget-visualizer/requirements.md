# Requirements: Expense & Budget Visualizer

## Overview

A simple, clean, mobile-friendly web application that helps users track their daily spending. Built using only HTML, CSS, and Vanilla JavaScript. All data is stored client-side using the browser's Local Storage API. No backend or framework is used.

---

## R1 — Input Form (MVP)

**User Story:**
As a user, I want to fill in a form to add a new expense transaction, so that I can record what I spent money on.

**Functional Requirements:**

- FR1.1 — The form must include three fields: Item Name, Amount, and Category.
- FR1.2 — The Category field must include exactly three default options: Food, Transport, and Fun.
- FR1.3 — All fields are required. The user cannot submit the form if any field is empty.
- FR1.4 — Amount must be a valid positive number (greater than zero). Decimal values are allowed.
- FR1.5 — Amount must not be zero or negative.
- FR1.6 — On successful submission, a new transaction is added to the transaction list immediately without a page reload.
- FR1.7 — After successful submission, the form fields must be reset to their empty/default state.
- FR1.8 — The new transaction must be saved to Local Storage immediately after submission.
- FR1.9 — Validation error messages must be shown clearly near the relevant field when the user submits an invalid form.
- FR1.10 — Error messages must disappear when the form is successfully submitted or when the user corrects the input.

**Acceptance Criteria:**

- [ ] Form renders with Item Name input, Amount input, and Category dropdown.
- [ ] Submitting an empty form shows a validation error for each empty field.
- [ ] Submitting with Amount = 0 shows a validation error.
- [ ] Submitting with a negative Amount shows a validation error.
- [ ] Submitting with non-numeric Amount shows a validation error.
- [ ] Submitting a valid, complete form adds the transaction to the list instantly.
- [ ] The form is cleared after successful submission.
- [ ] The transaction appears in Local Storage after submission.

**Edge Cases:**

- EC1.1 — Amount field contains only spaces: treat as empty, show required error.
- EC1.2 — Amount field contains letters (e.g., "abc"): show invalid number error.
- EC1.3 — Amount field contains a valid decimal (e.g., "12.50"): accept it.
- EC1.4 — Item Name contains only spaces: treat as empty, show required error.

---

## R2 — Transaction List (MVP)

**User Story:**
As a user, I want to see all my expense transactions in a list, so that I know what I have recorded.

**Functional Requirements:**

- FR2.1 — Every transaction in the list must display: Item Name, Amount, and Category.
- FR2.2 — Each transaction must have a Delete button that removes only that transaction.
- FR2.3 — The transaction list must be scrollable if there are many transactions.
- FR2.4 — When a transaction is deleted, the list must update immediately without a page reload.
- FR2.5 — When a transaction is deleted, the total balance must update immediately.
- FR2.6 — When a transaction is deleted, the pie chart must update immediately.
- FR2.7 — When a transaction is deleted, Local Storage must be updated immediately.
- FR2.8 — If there are no transactions, an empty-state message must be displayed clearly.
- FR2.9 — Transactions must be loaded from Local Storage when the application starts.

**Acceptance Criteria:**

- [ ] All transactions are displayed in the list after being added.
- [ ] Each transaction shows its Item Name, Amount, and Category.
- [ ] Each transaction has a visible Delete button.
- [ ] Clicking Delete removes the transaction from the list instantly.
- [ ] Deleting a transaction updates the total and chart.
- [ ] Deleting a transaction updates Local Storage.
- [ ] An empty-state message is shown when no transactions exist.
- [ ] On page reload, all previously added transactions are restored.

**Edge Cases:**

- EC2.1 — User deletes the only transaction: list shows empty-state message, total resets to zero, chart is cleared.
- EC2.2 — User adds many transactions (e.g., 50+): list scrolls, no layout break.
- EC2.3 — Page is refreshed with existing data: transactions are restored correctly.

---

## R3 — Total Balance (MVP)

**User Story:**
As a user, I want to see my total spending prominently at the top of the application, so that I always know how much I have spent.

**Functional Requirements:**

- FR3.1 — The total spending is calculated by summing the Amount of all transactions.
- FR3.2 — The total must be displayed prominently, near the top of the application.
- FR3.3 — The total must update automatically when a transaction is added.
- FR3.4 — The total must update automatically when a transaction is deleted.
- FR3.5 — The total must be correctly restored from Local Storage after a page refresh.
- FR3.6 — When there are no transactions, the total must display as zero (or a clear equivalent like "Rp 0").

**Acceptance Criteria:**

- [ ] Total spending is displayed near the top of the page.
- [ ] Total increases correctly when a transaction is added.
- [ ] Total decreases correctly when a transaction is deleted.
- [ ] Total is 0 when there are no transactions.
- [ ] Total is correctly calculated after page refresh.

**Edge Cases:**

- EC3.1 — All transactions are deleted: total resets to zero.
- EC3.2 — Page is refreshed: total is recalculated from Local Storage data, matches the transaction list.

---

## R4 — Pie Chart (MVP)

**User Story:**
As a user, I want to see a pie chart showing how much I spent in each category, so that I can understand my spending patterns.

**Functional Requirements:**

- FR4.1 — The pie chart shows the spending distribution across the defined categories.
- FR4.2 — The default categories on the chart are Food, Transport, and Fun (plus any custom categories once added).
- FR4.3 — The chart updates automatically when a transaction is added.
- FR4.4 — The chart updates automatically when a transaction is deleted.
- FR4.5 — The chart must represent the actual transaction data accurately.
- FR4.6 — When there are no transactions, the chart must handle the empty state gracefully (e.g., show a placeholder or a message instead of a broken chart).
- FR4.7 — Chart.js may be used to render the pie chart.

**Acceptance Criteria:**

- [ ] A pie chart is visible on the page.
- [ ] The chart shows segments for categories that have spending.
- [ ] Adding a transaction updates the chart segment for the correct category.
- [ ] Deleting a transaction reduces or removes the corresponding category segment.
- [ ] An empty state is handled gracefully when there are no transactions.
- [ ] Chart data matches the actual transaction totals per category.

**Edge Cases:**

- EC4.1 — All transactions in one category: chart shows a single full segment.
- EC4.2 — No transactions: chart shows an empty state, not a broken/empty pie.
- EC4.3 — Only one category has transactions and others are empty: only the populated segment appears.

---

## R5 — Local Storage (MVP)

**User Story:**
As a user, I want my data to be saved in the browser, so that my transactions are not lost when I refresh the page.

**Functional Requirements:**

- FR5.1 — All transaction data must be stored in Local Storage using a consistent key.
- FR5.2 — Each transaction stored must have at minimum: id, itemName, amount, category.
- FR5.3 — Transactions are loaded from Local Storage when the application initializes.
- FR5.4 — Adding a transaction must update Local Storage immediately.
- FR5.5 — Deleting a transaction must update Local Storage immediately.
- FR5.6 — If Local Storage contains no transaction data, the application initializes with an empty list.
- FR5.7 — If Local Storage contains invalid or corrupted data, the application must handle it safely (e.g., fall back to an empty list without crashing).
- FR5.8 — Transaction IDs must be unique so individual transactions can be deleted reliably.

**Acceptance Criteria:**

- [ ] After adding a transaction, it appears in Local Storage.
- [ ] After deleting a transaction, it is removed from Local Storage.
- [ ] After refreshing the page, all transactions are restored from Local Storage.
- [ ] Application does not crash if Local Storage is empty.
- [ ] Application does not crash if Local Storage contains invalid JSON.
- [ ] Each transaction has a unique ID.

**Edge Cases:**

- EC5.1 — Local Storage key does not exist: initialize with empty array.
- EC5.2 — Local Storage contains malformed JSON: catch the parse error, use empty array.
- EC5.3 — Local Storage contains an array with missing fields: handle gracefully.

---

## R6 — Custom Categories (Official Optional Feature #1)

**User Story:**
As a user, I want to create my own spending categories in addition to the default ones, so that I can track expenses that do not fit the defaults.

**Functional Requirements:**

- FR6.1 — The default categories (Food, Transport, Fun) must always remain available and cannot be deleted.
- FR6.2 — Users can add new custom categories by entering a category name.
- FR6.3 — Custom categories must appear in the Category dropdown in the input form.
- FR6.4 — Custom categories must be stored in Local Storage.
- FR6.5 — Custom categories must persist after a page refresh.
- FR6.6 — Custom categories must be available for use when adding new transactions.
- FR6.7 — Existing transactions that use a custom category must not break if the application is reloaded.

**Acceptance Criteria:**

- [ ] User can add a custom category name.
- [ ] The new category appears in the Category dropdown.
- [ ] Transactions can be created using a custom category.
- [ ] Custom categories appear in Local Storage.
- [ ] After refresh, custom categories are still available in the dropdown.
- [ ] Default categories are never removed.

**Edge Cases:**

- EC6.1 — User tries to add an empty category name: show validation error, do not add.
- EC6.2 — User tries to add a duplicate category name: do not add, optionally show a message.
- EC6.3 — Custom category name matches a default category name (case-insensitive): treat as duplicate, do not add.

---

## R7 — Monthly Summary (Official Optional Feature #2)

**User Story:**
As a user, I want to see a summary of my spending grouped by month, so that I can compare my spending over time.

**Functional Requirements:**

- FR7.1 — Transactions are grouped by the month and year they were recorded.
- FR7.2 — The monthly summary shows the total spending for each month.
- FR7.3 — The user can view monthly totals.
- FR7.4 — The monthly summary must use actual transaction data.
- FR7.5 — The summary must update automatically when transactions are added or deleted.
- FR7.6 — The monthly summary must work with data restored from Local Storage.
- FR7.7 — Each transaction must store the date it was created so it can be grouped by month.

**Acceptance Criteria:**

- [ ] Each transaction has a timestamp or date recorded at the time of creation.
- [ ] Monthly summary groups transactions by month and year.
- [ ] Monthly totals are calculated correctly.
- [ ] Summary updates when transactions are added or deleted.
- [ ] Summary is correctly restored after page refresh.

**Edge Cases:**

- EC7.1 — All transactions are in the same month: only one month group appears.
- EC7.2 — No transactions exist: summary shows an empty state message.
- EC7.3 — Transactions span multiple months: each month is listed separately.

---

## R8 — Sort Transactions (Official Optional Feature #3)

**User Story:**
As a user, I want to sort my transaction list by amount or category, so that I can find and review transactions more easily.

**Functional Requirements:**

- FR8.1 — Users can select a sorting option from a dropdown or similar control.
- FR8.2 — Supported sort options must include: by Amount (ascending or descending) and by Category (alphabetical).
- FR8.3 — Sorting updates the visible transaction list immediately.
- FR8.4 — Sorting must not modify the underlying stored transaction data.
- FR8.5 — Sorting must not affect the total balance calculation.
- FR8.6 — Sorting must not break the Delete functionality — deleting a sorted transaction must still work correctly.
- FR8.7 — Sorting must not affect the stored transaction values in Local Storage.

**Acceptance Criteria:**

- [ ] A sort control is visible to the user.
- [ ] Selecting "Amount" sorts the list by amount.
- [ ] Selecting "Category" sorts the list alphabetically by category name.
- [ ] Deleting a transaction from a sorted list works correctly.
- [ ] Total balance is unaffected by sorting.
- [ ] Local Storage data is unaffected by sorting.

**Edge Cases:**

- EC8.1 — Only one transaction: sorting has no visible effect, no error.
- EC8.2 — No transactions: sort control is visible but no list to sort.
- EC8.3 — Two transactions with the same amount: order between them can be stable or arbitrary, no error.
- EC8.4 — User adds a new transaction while a sort is active: the list re-renders in the current sort order.

---

## R9 — Spending Limit Highlight (Additional Enhancement #1)

**User Story:**
As a user, I want to set a spending limit and be clearly notified when I reach or exceed it, so that I can manage my budget.

**Functional Requirements:**

- FR9.1 — The user can input a spending limit value.
- FR9.2 — The spending limit must be stored in Local Storage.
- FR9.3 — The spending limit persists after a page refresh.
- FR9.4 — The application compares the total spending against the limit after every add or delete.
- FR9.5 — When total spending reaches or exceeds the limit, the interface clearly highlights the relevant spending information (e.g., color change, warning message, or both).
- FR9.6 — The highlight must be removed when spending drops below the limit (e.g., after a deletion).
- FR9.7 — The feature must not break any MVP feature.

**Acceptance Criteria:**

- [ ] User can enter a spending limit.
- [ ] Limit is saved in Local Storage and restored after refresh.
- [ ] A clear visual indication appears when total spending >= limit.
- [ ] The visual indication is removed when spending falls below the limit.
- [ ] MVP features continue to work normally.

**Edge Cases:**

- EC9.1 — User sets a limit of zero or a negative number: show validation error, do not save.
- EC9.2 — User sets a limit but has no transactions: no warning shown.
- EC9.3 — User deletes a transaction that brings spending below the limit: warning is removed.

---

## R10 — Dark/Light Mode Toggle (Additional Enhancement #2)

**User Story:**
As a user, I want to switch between dark and light mode, so that I can use the application comfortably in different lighting conditions.

**Functional Requirements:**

- FR10.1 — A toggle control must be visible and accessible on the page.
- FR10.2 — Activating the toggle switches the application between dark and light themes.
- FR10.3 — The selected theme must be stored in Local Storage.
- FR10.4 — The theme preference must persist after a page refresh.
- FR10.5 — Both themes must be readable and maintain sufficient color contrast.
- FR10.6 — The toggle must not break the application layout or any functionality.
- FR10.7 — The theme must be applied when the application loads (restoring saved preference).

**Acceptance Criteria:**

- [ ] A theme toggle button is visible.
- [ ] Clicking the toggle switches between dark and light mode.
- [ ] After refresh, the previously selected theme is restored.
- [ ] Both themes render all UI elements correctly.
- [ ] No layout breaks occur when switching themes.

**Edge Cases:**

- EC10.1 — No theme saved in Local Storage: default to light mode.
- EC10.2 — Switching themes while a transaction list is populated: layout and data remain intact.
- EC10.3 — Switching themes while the chart is displayed: chart remains readable in both modes.

---

## Non-Functional Requirements

- NFR1 — The application must be built using only HTML, CSS, and Vanilla JavaScript.
- NFR2 — No JavaScript frameworks (React, Vue, Angular, etc.) are permitted.
- NFR3 — No backend server is required or permitted.
- NFR4 — The application must work in Chrome, Firefox, Edge, and Safari.
- NFR5 — The application must be responsive and usable on mobile, tablet, and desktop.
- NFR6 — The application must load quickly and have no noticeable lag during interactions.
- NFR7 — Only one CSS file (`css/style.css`) and one JavaScript file (`js/script.js`) are permitted.
- NFR8 — Semantic HTML must be used where appropriate.
- NFR9 — Form inputs must be keyboard-navigable.
- NFR10 — Important information must not rely on color alone to communicate meaning.
