document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-icon");
  const navItems = document.querySelectorAll(".main-nav li");
  const contentSections = document.querySelectorAll(".content-section");
  const transactionModal = document.getElementById("transaction-modal");
  const categoryModal = document.getElementById("category-modal");
  const goalModal = document.getElementById("goal-modal");
  const addTransactionBtn = document.getElementById("add-transaction");
  const addCategoryBtn = document.getElementById("add-category");
  const addGoalBtn = document.getElementById("add-goal");
  const closeModalBtns = document.querySelectorAll(".close-modal");
  const transactionForm = document.getElementById("transaction-form");
  const categoryForm = document.getElementById("category-form");
  const goalForm = document.getElementById("goal-form");
  let categoryChart, monthlyChart, incomeExpenseChart, trendsChart;
  let state = {
    transactions: [],
    categories: [
      {
        id: 1,
        name: "Food",
        budget: 300,
        icon: "fa-utensils",
        color: "#FF6384",
      },
      {
        id: 2,
        name: "Transportation",
        budget: 150,
        icon: "fa-car",
        color: "#36A2EB",
      },
      {
        id: 3,
        name: "Housing",
        budget: 1000,
        icon: "fa-home",
        color: "#FFCE56",
      },
      {
        id: 4,
        name: "Entertainment",
        budget: 100,
        icon: "fa-film",
        color: "#4BC0C0",
      },
      {
        id: 5,
        name: "Shopping",
        budget: 200,
        icon: "fa-shopping-cart",
        color: "#9966FF",
      },
      {
        id: 6,
        name: "Income",
        budget: 0,
        icon: "fa-money-bill-wave",
        color: "#00CC99",
      },
    ],
    goals: [],
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
  };
  function init() {
    loadData();
    setupEventListeners();
    renderDashboard();
    renderCategories();
    updateSummaryCards();
    renderRecentTransactions();
    renderTransactionsTable();
    renderCharts();
    setCurrentMonthYear();
  }
  function loadData() {
    const savedState = localStorage.getItem("budgetPlannerState");
    if (savedState) {
      state = JSON.parse(savedState);
      state.transactions.forEach((trans) => {
        trans.date = new Date(trans.date);
      });
      state.goals.forEach((goal) => {
        goal.date = new Date(goal.date);
      });
    }
  }
  function saveData() {
    const transactionsWithStringDates = state.transactions.map((trans) => ({
      ...trans,
      date: trans.date.toISOString(),
    }));
    const goalsWithStringDates = state.goals.map((goal) => ({
      ...goal,
      date: goal.date.toISOString(),
    }));
    const stateToSave = {
      ...state,
      transactions: transactionsWithStringDates,
      goals: goalsWithStringDates,
    };
    localStorage.setItem("budgetPlannerState", JSON.stringify(stateToSave));
  }
  function setupEventListeners() {
    themeToggle.addEventListener("click", toggleTheme);
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        navItems.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");
        const section = item.getAttribute("data-section");
        contentSections.forEach((sec) => sec.classList.remove("active"));
        document.getElementById(section).classList.add("active");
        if (section === "transactions") {
          renderTransactionsTable();
        } else if (section === "budgets") {
          renderCategories();
        } else if (section === "reports") {
          renderCharts();
        } else if (section === "goals") {
          renderGoals();
        }
      });
    });
    addTransactionBtn.addEventListener("click", () => openModal("transaction"));
    addCategoryBtn.addEventListener("click", () => openModal("category"));
    addGoalBtn.addEventListener("click", () => openModal("goal"));
    closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        closeModal();
      }
    });
    transactionForm.addEventListener("submit", handleTransactionSubmit);
    categoryForm.addEventListener("submit", handleCategorySubmit);
    goalForm.addEventListener("submit", handleGoalSubmit);
    document.getElementById("prev-month").addEventListener("click", () => {
      if (state.currentMonth === 0) {
        state.currentMonth = 11;
        state.currentYear--;
      } else {
        state.currentMonth--;
      }
      setCurrentMonthYear();
      renderCharts();
    });
    document.getElementById("next-month").addEventListener("click", () => {
      if (state.currentMonth === 11) {
        state.currentMonth = 0;
        state.currentYear++;
      } else {
        state.currentMonth++;
      }
      setCurrentMonthYear();
      renderCharts();
    });
    document
      .getElementById("transaction-type")
      .addEventListener("change", renderTransactionsTable);
    document
      .getElementById("transaction-category")
      .addEventListener("change", renderTransactionsTable);
    document
      .getElementById("transaction-month")
      .addEventListener("change", renderTransactionsTable);
  }
  function toggleTheme() {
    const body = document.body;
    if (body.getAttribute("data-theme") === "dark") {
      body.removeAttribute("data-theme");
      themeToggle.classList.remove("fa-sun");
      themeToggle.classList.add("fa-moon");
    } else {
      body.setAttribute("data-theme", "dark");
      themeToggle.classList.remove("fa-moon");
      themeToggle.classList.add("fa-sun");
    }
  }
  function openModal(type) {
    closeModal();
    if (type === "transaction") {
      prepareTransactionModal();
      transactionModal.classList.add("active");
    } else if (type === "category") {
      prepareCategoryModal();
      categoryModal.classList.add("active");
    } else if (type === "goal") {
      prepareGoalModal();
      goalModal.classList.add("active");
    }
  }
  function closeModal() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active");
    });
  }
  function prepareTransactionModal() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("trans-date").value = today;
    const categorySelect = document.getElementById("trans-category");
    categorySelect.innerHTML = "";
    state.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
  function prepareCategoryModal() {
    document.getElementById("category-name").value = "";
    document.getElementById("category-budget").value = "";
    document.getElementById("category-icon").value = "fa-utensils";
  }
  function prepareGoalModal() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthFormatted = nextMonth.toISOString().split("T")[0];
    document.getElementById("goal-name").value = "";
    document.getElementById("goal-target").value = "";
    document.getElementById("goal-saved").value = "0";
    document.getElementById("goal-date").value = nextMonthFormatted;
  }
  function handleTransactionSubmit(e) {
    e.preventDefault();
    const type = document.getElementById("trans-type").value;
    const amount = parseFloat(document.getElementById("trans-amount").value);
    const description = document.getElementById("trans-description").value;
    const categoryId = parseInt(
      document.getElementById("trans-category").value
    );
    const date = new Date(document.getElementById("trans-date").value);
    const category = state.categories.find((cat) => cat.id === categoryId);
    const newTransaction = {
      id: Date.now(),
      type,
      amount,
      description,
      category: category.name,
      categoryId,
      date,
      icon: category.icon,
    };
    state.transactions.push(newTransaction);
    saveData();
    closeModal();
    updateSummaryCards();
    renderRecentTransactions();
    renderTransactionsTable();
    renderCharts();
    transactionForm.reset();
  }
  function handleCategorySubmit(e) {
    e.preventDefault();
    const name = document.getElementById("category-name").value;
    const budget = parseFloat(document.getElementById("category-budget").value);
    const icon = document.getElementById("category-icon").value;
    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#00CC99",
      "#FF9F40",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newCategory = {
      id: Date.now(),
      name,
      budget,
      icon,
      color,
    };
    state.categories.push(newCategory);
    saveData();
    closeModal();
    renderCategories();
    renderCharts();
    categoryForm.reset();
  }
  function handleGoalSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("goal-name").value;
    const target = parseFloat(document.getElementById("goal-target").value);
    const saved = parseFloat(document.getElementById("goal-saved").value);
    const date = new Date(document.getElementById("goal-date").value);
    const newGoal = {
      id: Date.now(),
      name,
      target,
      saved,
      date,
    };
    state.goals.push(newGoal);
    saveData();
    closeModal();
    renderGoals();
    goalForm.reset();
  }
  function updateSummaryCards() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyTransactions = state.transactions.filter((trans) => {
      return (
        trans.date.getMonth() === currentMonth &&
        trans.date.getFullYear() === currentYear
      );
    });
    const income = monthlyTransactions
      .filter((trans) => trans.type === "income")
      .reduce((sum, trans) => sum + trans.amount, 0);
    const expenses = monthlyTransactions
      .filter((trans) => trans.type === "expense")
      .reduce((sum, trans) => sum + trans.amount, 0);
    const balance = income - expenses;
    const savingsRate =
      income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0;
    document.getElementById("total-balance").textContent = `$${balance.toFixed(
      2
    )}`;
    document.getElementById("monthly-income").textContent = `$${income.toFixed(
      2
    )}`;
    document.getElementById(
      "monthly-expenses"
    ).textContent = `$${expenses.toFixed(2)}`;
    document.getElementById("savings-rate").textContent = `${savingsRate}%`;
    const changeElement = document.querySelector("#total-balance + .change");
    if (balance > 0) {
      changeElement.classList.add("positive");
      changeElement.classList.remove("negative");
    } else if (balance < 0) {
      changeElement.classList.add("negative");
      changeElement.classList.remove("positive");
    } else {
      changeElement.classList.remove("positive", "negative");
    }
  }
  function renderRecentTransactions() {
    const container = document.getElementById("recent-transactions");
    container.innerHTML = "";
    const recentTransactions = [...state.transactions]
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
    if (recentTransactions.length === 0) {
      container.innerHTML =
        '<p class="no-transactions">No transactions yet. Add your first transaction!</p>';
      return;
    }
    recentTransactions.forEach((trans) => {
      const transactionEl = document.createElement("div");
      transactionEl.className = "transaction-item";
      const category = state.categories.find(
        (cat) => cat.id === trans.categoryId
      );
      transactionEl.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="fas ${
                          trans.icon || "fa-money-bill-wave"
                        }"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${trans.description}</h4>
                        <p>${category?.name || trans.category} • ${formatDate(
        trans.date
      )}</p>
                    </div>
                </div>
                <div class="transaction-amount ${trans.type}">
                    ${
                      trans.type === "income" ? "+" : "-"
                    }$${trans.amount.toFixed(2)}
                </div>
            `;
      container.appendChild(transactionEl);
    });
  }
  function renderTransactionsTable() {
    const container = document.getElementById("transactions-list");
    container.innerHTML = "";
    const typeFilter = document.getElementById("transaction-type").value;
    const categoryFilter = document.getElementById(
      "transaction-category"
    ).value;
    const monthFilter = document.getElementById("transaction-month").value;
    const categorySelect = document.getElementById("transaction-category");
    if (categorySelect.options.length <= 1) {
      state.categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
    const monthSelect = document.getElementById("transaction-month");
    if (monthSelect.options.length <= 1) {
      const months = [];
      state.transactions.forEach((trans) => {
        const monthYear = `${trans.date.getFullYear()}-${trans.date.getMonth()}`;
        if (!months.includes(monthYear)) {
          months.push(monthYear);
          const option = document.createElement("option");
          option.value = monthYear;
          option.textContent = `${getMonthName(
            trans.date.getMonth()
          )} ${trans.date.getFullYear()}`;
          monthSelect.appendChild(option);
        }
      });
    }
    let filteredTransactions = [...state.transactions];
    if (typeFilter !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (trans) => trans.type === typeFilter
      );
    }
    if (categoryFilter !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (trans) => trans.categoryId === parseInt(categoryFilter)
      );
    }
    if (monthFilter !== "all") {
      const [year, month] = monthFilter.split("-").map(Number);
      filteredTransactions = filteredTransactions.filter((trans) => {
        return (
          trans.date.getFullYear() === year && trans.date.getMonth() === month
        );
      });
    }
    filteredTransactions.sort((a, b) => b.date - a.date);
    if (filteredTransactions.length === 0) {
      container.innerHTML = `
                <tr>
                    <td colspan="6" class="no-transactions">No transactions found matching your filters.</td>
                </tr>
            `;
      return;
    }
    filteredTransactions.forEach((trans) => {
      const row = document.createElement("tr");
      const category = state.categories.find(
        (cat) => cat.id === trans.categoryId
      );
      row.innerHTML = `
                <td>${formatDate(trans.date)}</td>
                <td>${trans.description}</td>
                <td>
                    <i class="fas ${trans.icon || "fa-money-bill-wave"}"></i>
                    ${category?.name || trans.category}
                </td>
                <td>
                    <span class="badge ${
                      trans.type === "income" ? "income" : "expense"
                    }">
                        ${trans.type === "income" ? "Income" : "Expense"}
                    </span>
                </td>
                <td class="${trans.type === "income" ? "income" : "expense"}">
                    ${
                      trans.type === "income" ? "+" : "-"
                    }$${trans.amount.toFixed(2)}
                </td>
                <td class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${trans.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${trans.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      container.appendChild(row);
    });
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(btn.getAttribute("data-id"));
        editTransaction(id);
      });
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(btn.getAttribute("data-id"));
        deleteTransaction(id);
      });
    });
  }
  function editTransaction(id) {
    const transaction = state.transactions.find((trans) => trans.id === id);
    if (!transaction) return;
    openModal("transaction");
    document.getElementById("trans-type").value = transaction.type;
    document.getElementById("trans-amount").value = transaction.amount;
    document.getElementById("trans-description").value =
      transaction.description;
    document.getElementById("trans-category").value = transaction.categoryId;
    document.getElementById("trans-date").value = transaction.date
      .toISOString()
      .split("T")[0];
    transactionForm.removeEventListener("submit", handleTransactionSubmit);
    transactionForm.addEventListener("submit", function handleEditSubmit(e) {
      e.preventDefault();
      transaction.type = document.getElementById("trans-type").value;
      transaction.amount = parseFloat(
        document.getElementById("trans-amount").value
      );
      transaction.description =
        document.getElementById("trans-description").value;
      transaction.categoryId = parseInt(
        document.getElementById("trans-category").value
      );
      transaction.date = new Date(document.getElementById("trans-date").value);
      const category = state.categories.find(
        (cat) => cat.id === transaction.categoryId
      );
      if (category) {
        transaction.category = category.name;
        transaction.icon = category.icon;
      }
      saveData();
      closeModal();
      updateSummaryCards();
      renderRecentTransactions();
      renderTransactionsTable();
      renderCharts();
      transactionForm.reset();
      transactionForm.removeEventListener("submit", handleEditSubmit);
      transactionForm.addEventListener("submit", handleTransactionSubmit);
    });
  }
  function deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      state.transactions = state.transactions.filter(
        (trans) => trans.id !== id
      );
      saveData();
      updateSummaryCards();
      renderRecentTransactions();
      renderTransactionsTable();
      renderCharts();
    }
  }
  function renderCategories() {
    const container = document.getElementById("budget-categories");
    container.innerHTML = "";

    if (state.categories.length === 0) {
      container.innerHTML =
        '<p class="no-categories">No categories yet. Add your first category!</p>';
      return;
    }
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const categorySpending = {};
    state.transactions
      .filter(
        (trans) =>
          trans.type === "expense" &&
          trans.date.getMonth() === currentMonth &&
          trans.date.getFullYear() === currentYear
      )
      .forEach((trans) => {
        if (!categorySpending[trans.categoryId]) {
          categorySpending[trans.categoryId] = 0;
        }
        categorySpending[trans.categoryId] += trans.amount;
      });
    state.categories.forEach((category) => {
      if (category.name === "Income") return;
      const spent = categorySpending[category.id] || 0;
      const percentage =
        category.budget > 0
          ? Math.min((spent / category.budget) * 100, 100)
          : 0;
      const remaining = category.budget - spent;
      const categoryEl = document.createElement("div");
      categoryEl.className = "budget-category";
      categoryEl.innerHTML = `
                <div class="budget-category-header">
                    <div class="budget-icon" style="background-color: ${
                      category.color || "#4361ee"
                    }">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <div class="budget-title">
                        <h3>${category.name}</h3>
                        <p>Budget: $${category.budget.toFixed(2)}</p>
                    </div>
                </div>
                <div class="budget-amount">
                    Spent: $${spent.toFixed(
                      2
                    )} / Remaining: $${remaining.toFixed(2)}
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar" style="width: ${percentage}%; background-color: ${
        category.color || "#4361ee"
      }"></div>
                </div>
                <div class="budget-stats">
                    <span>${percentage.toFixed(0)}% of budget</span>
                    <span>$${remaining.toFixed(2)} left</span>
                </div>
            `;
      container.appendChild(categoryEl);
    });
  }
  function renderGoals() {
    const container = document.getElementById("savings-goals");
    container.innerHTML = "";
    if (state.goals.length === 0) {
      container.innerHTML =
        '<p class="no-goals">No savings goals yet. Add your first goal!</p>';
      return;
    }
    state.goals.forEach((goal) => {
      const percentage = (goal.saved / goal.target) * 100;
      const daysLeft = Math.ceil(
        (goal.date - new Date()) / (1000 * 60 * 60 * 24)
      );
      const goalEl = document.createElement("div");
      goalEl.className = "goal-card";
      goalEl.innerHTML = `
                <div class="goal-header">
                    <div class="goal-title">
                        <h3>${goal.name}</h3>
                        <p>Target: $${goal.target.toFixed(2)}</p>
                    </div>
                    <span>${
                      daysLeft > 0 ? `${daysLeft} days left` : "Completed"
                    }</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${Math.min(
                      percentage,
                      100
                    )}%"></div>
                </div>
                <div class="goal-details">
                    <span class="goal-amount">Saved: $${goal.saved.toFixed(
                      2
                    )} (${percentage.toFixed(1)}%)</span>
                    <span class="goal-date">${formatDate(goal.date)}</span>
                </div>
            `;
      container.appendChild(goalEl);
    });
  }
  function renderCharts() {
    renderCategoryChart();
    renderMonthlyChart();
    renderIncomeExpenseChart();
    renderTrendsChart();
    renderTopExpenses();
    renderCategoryBreakdown();
  }
  function renderCategoryChart() {
    const ctx = document.getElementById("categoryChart").getContext("2d");
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const categorySpending = {};
    state.transactions
      .filter(
        (trans) =>
          trans.type === "expense" &&
          trans.date.getMonth() === currentMonth &&
          trans.date.getFullYear() === currentYear
      )
      .forEach((trans) => {
        if (!categorySpending[trans.categoryId]) {
          categorySpending[trans.categoryId] = 0;
        }
        categorySpending[trans.categoryId] += trans.amount;
      });
    const categories = state.categories.filter((cat) => cat.name !== "Income");
    const labels = categories.map((cat) => cat.name);
    const data = categories.map((cat) => categorySpending[cat.id] || 0);
    const backgroundColors = categories.map((cat) => cat.color || "#4361ee");
    if (categoryChart) {
      categoryChart.destroy();
    }
    categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }
  function renderMonthlyChart() {
    const ctx = document.getElementById("monthlyChart").getContext("2d");
    const monthlyData = {};
    state.transactions.forEach((trans) => {
      const monthYear = `${trans.date.getFullYear()}-${trans.date.getMonth()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          income: 0,
          expenses: 0,
          month: trans.date.getMonth(),
          year: trans.date.getFullYear(),
        };
      }
      if (trans.type === "income") {
        monthlyData[monthYear].income += trans.amount;
      } else {
        monthlyData[monthYear].expenses += trans.amount;
      }
    });
    const sortedMonths = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const last6Months = sortedMonths.slice(-6);
    const labels = last6Months.map(
      (month) =>
        `${getMonthName(month.month)} ${month.year.toString().slice(2)}`
    );
    const incomeData = last6Months.map((month) => month.income);
    const expensesData = last6Months.map((month) => month.expenses);
    if (monthlyChart) {
      monthlyChart.destroy();
    }
    monthlyChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Income",
            data: incomeData,
            backgroundColor: "#4cc9f0",
            borderColor: "#4cc9f0",
            borderWidth: 1,
          },
          {
            label: "Expenses",
            data: expensesData,
            backgroundColor: "#f94144",
            borderColor: "#f94144",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || "";
                const value = context.raw || 0;
                return `${label}: $${value.toFixed(2)}`;
              },
            },
          },
        },
      },
    });
  }
  function renderIncomeExpenseChart() {
    const ctx = document.getElementById("incomeExpenseChart").getContext("2d");
    const monthTransactions = state.transactions.filter((trans) => {
      return (
        trans.date.getMonth() === state.currentMonth &&
        trans.date.getFullYear() === state.currentYear
      );
    });
    const income = monthTransactions
      .filter((trans) => trans.type === "income")
      .reduce((sum, trans) => sum + trans.amount, 0);
    const expenses = monthTransactions
      .filter((trans) => trans.type === "expense")
      .reduce((sum, trans) => sum + trans.amount, 0);
    if (incomeExpenseChart) {
      incomeExpenseChart.destroy();
    }
    incomeExpenseChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Income", "Expenses"],
        datasets: [
          {
            data: [income, expenses],
            backgroundColor: ["#4cc9f0", "#f94144"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }
  function renderTrendsChart() {
    const ctx = document.getElementById("trendsChart").getContext("2d");
    const monthlyTrends = Array(12)
      .fill()
      .map((_, i) => {
        const date = new Date(state.currentYear, state.currentMonth - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthTransactions = state.transactions.filter((trans) => {
          return (
            trans.date.getMonth() === month && trans.date.getFullYear() === year
          );
        });
        const income = monthTransactions
          .filter((trans) => trans.type === "income")
          .reduce((sum, trans) => sum + trans.amount, 0);
        const expenses = monthTransactions
          .filter((trans) => trans.type === "expense")
          .reduce((sum, trans) => sum + trans.amount, 0);
        return {
          month,
          year,
          income,
          expenses,
          balance: income - expenses,
          label: `${getMonthName(month)} ${year.toString().slice(2)}`,
        };
      })
      .reverse();
    const labels = monthlyTrends.map((month) => month.label);
    const incomeData = monthlyTrends.map((month) => month.income);
    const expensesData = monthlyTrends.map((month) => month.expenses);
    const balanceData = monthlyTrends.map((month) => month.balance);
    if (trendsChart) {
      trendsChart.destroy();
    }
    trendsChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Income",
            data: incomeData,
            backgroundColor: "rgba(76, 201, 240, 0.2)",
            borderColor: "#4cc9f0",
            borderWidth: 2,
            tension: 0.3,
          },
          {
            label: "Expenses",
            data: expensesData,
            backgroundColor: "rgba(249, 65, 68, 0.2)",
            borderColor: "#f94144",
            borderWidth: 2,
            tension: 0.3,
          },
          {
            label: "Balance",
            data: balanceData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "#4bc0c0",
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || "";
                const value = context.raw || 0;
                return `${label}: $${value.toFixed(2)}`;
              },
            },
          },
        },
      },
    });
  }
  function renderTopExpenses() {
    const container = document.getElementById("top-expenses");
    container.innerHTML = "";
    const monthExpenses = state.transactions.filter((trans) => {
      return (
        trans.type === "expense" &&
        trans.date.getMonth() === state.currentMonth &&
        trans.date.getFullYear() === state.currentYear
      );
    });
    const sortedExpenses = [...monthExpenses].sort(
      (a, b) => b.amount - a.amount
    );
    const topExpenses = sortedExpenses.slice(0, 5);
    if (topExpenses.length === 0) {
      container.innerHTML = "<li>No expenses this month</li>";
      return;
    }
    topExpenses.forEach((expense) => {
      const li = document.createElement("li");
      const category = state.categories.find(
        (cat) => cat.id === expense.categoryId
      );
      li.innerHTML = `
                <span>
                    <i class="fas ${expense.icon || "fa-money-bill-wave"}"></i>
                    ${expense.description}
                </span>
                <span class="expense">$${expense.amount.toFixed(2)}</span>
            `;
      container.appendChild(li);
    });
  }
  function renderCategoryBreakdown() {
    const container = document.getElementById("category-breakdown");
    container.innerHTML = "";
    const monthExpenses = state.transactions.filter((trans) => {
      return (
        trans.type === "expense" &&
        trans.date.getMonth() === state.currentMonth &&
        trans.date.getFullYear() === state.currentYear
      );
    });
    const totalExpenses = monthExpenses.reduce(
      (sum, trans) => sum + trans.amount,
      0
    );
    const categoryTotals = {};
    monthExpenses.forEach((expense) => {
      if (!categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] = 0;
      }
      categoryTotals[expense.categoryId] += expense.amount;
    });
    const categoryArray = Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = state.categories.find(
          (cat) => cat.id === parseInt(categoryId)
        );
        return {
          name: category?.name || "Unknown",
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
          color: category?.color || "#4361ee",
        };
      })
      .sort((a, b) => b.amount - a.amount);
    if (categoryArray.length === 0) {
      container.innerHTML = "<li>No expenses this month</li>";
      return;
    }
    categoryArray.forEach((category) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <span>
                    <span class="color-indicator" style="background-color: ${
                      category.color
                    }"></span>
                    ${category.name}
                </span>
                <span>${category.percentage.toFixed(
                  1
                )}% ($${category.amount.toFixed(2)})</span>
            `;
      container.appendChild(li);
    });
  }
  function setCurrentMonthYear() {
    const monthName = getMonthName(state.currentMonth);
    document.getElementById(
      "current-month"
    ).textContent = `${monthName} ${state.currentYear}`;
  }
  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  function getMonthName(monthIndex) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  }
  init();
});
