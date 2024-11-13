document.addEventListener('DOMContentLoaded', loadBudgetAndExpenses);

// Variables for DOM elements
const budgetInput = document.getElementById('budget');
const expenseInput = document.getElementById('expense');
const setBudgetButton = document.getElementById('setBudget');
const addExpenseButton = document.getElementById('addExpense');
const budgetMeterFill = document.getElementById('fill');
const expenseGraphCanvas = document.getElementById('expenseGraph');
const totalBudgetDisplay = document.getElementById('totalBudget');
const leftBudgetDisplay = document.getElementById('leftBudget');

// Store user data in Local Storage
const BUDGET_KEY = 'budget';
const EXPENSES_KEY = 'expenses';
let expenseChart;  // Chart instance

// Set Budget
setBudgetButton.addEventListener('click', function () {
  const budget = parseFloat(budgetInput.value);
  if (isNaN(budget) || budget <= 0) {
    alert('Please enter a valid budget amount.');
    return;
  }
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  updateBudgetMeter(budget);
  budgetInput.value = '';
  updateBudgetInfo();
  renderExpenseGraph();  // Refresh graph after setting budget
});

// Add Daily Expense
addExpenseButton.addEventListener('click', function () {
  const expense = parseFloat(expenseInput.value);
  if (isNaN(expense) || expense <= 0) {
    alert('Please enter a valid expense amount.');
    return;
  }

  const expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
  const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  expenses.push({ date, expense });
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));

  expenseInput.value = '';
  updateBudgetMeter(getBudget());
  updateBudgetInfo();
  renderExpenseGraph();  // Refresh graph after adding expense
});

// Update Budget Meter
function updateBudgetMeter(budget) {
  const expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.expense, 0);
  const percentage = (totalExpense / budget) * 100;

  budgetMeterFill.style.width = `${Math.min(percentage, 100)}%`;
}

// Update Budget Info (Total Budget and Left Budget)
function updateBudgetInfo() {
  const budget = getBudget();
  const expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.expense, 0);
  const leftBudget = budget - totalExpense;

  totalBudgetDisplay.textContent = budget.toFixed(2);
  leftBudgetDisplay.textContent = leftBudget.toFixed(2);
}

// Load Budget and Expenses from Local Storage
function loadBudgetAndExpenses() {
  const budget = getBudget();
  if (budget) {
    updateBudgetMeter(budget);
    updateBudgetInfo();
  }
  renderExpenseGraph(); // Refresh graph on load
}

// Get the Budget from Local Storage
function getBudget() {
  const budget = localStorage.getItem(BUDGET_KEY);
  return budget ? JSON.parse(budget) : 0;
}

// Render Expense Graph (Chart.js)
function renderExpenseGraph() {
  const expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
  const labels = [];
  const data = [];

  // Get the expenses for the last 7 days
  const lastWeekExpenses = expenses.slice(-7).reverse();

  lastWeekExpenses.forEach((entry) => {
    labels.push(entry.date);
    data.push(entry.expense);
  });

  // Clear any existing chart instance before creating a new one
  if (expenseChart) {
    expenseChart.destroy();
  }

  // Create the graph with Chart.js
  expenseChart = new Chart(expenseGraphCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Expenses',
        data: data,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: { labels: { color: 'white' } }
      }
    }
  });
}
