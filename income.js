document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('transaction-form');
  const typeInput = document.getElementById('type');
  const descriptionInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const editIdInput = document.getElementById('edit-id');
  const resetBtn = document.getElementById('reset-btn');
  const submitBtn = document.getElementById('submit-btn');
  const transactionList = document.getElementById('transaction-list');
  const totalIncomeElement = document.getElementById('total-income');
  const totalExpensesElement = document.getElementById('total-expenses');
  const netBalanceElement = document.getElementById('net-balance');
  const filterInputs = document.querySelectorAll('input[name="filter"]');
  
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let currentFilter = 'all';
  
  function updateUI() {
    updateSummary();
    displayTransactions();
  }
  
  function updateSummary() {
    const { totalIncome, totalExpenses, netBalance } = calculateSummary();
    
    totalIncomeElement.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
    netBalanceElement.textContent = `$${netBalance.toFixed(2)}`;
    
    if (netBalance < 0) {
      netBalanceElement.style.color = '#e74c3c';
    } else {
      netBalanceElement.style.color = '#3498db';
    }
  }
  
  function calculateSummary() {
    const totalIncome = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
      
    const totalExpenses = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
      
    const netBalance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, netBalance };
  }
  
  function displayTransactions() {
    const filteredTransactions = filterTransactions();
    
    if (filteredTransactions.length === 0) {
      transactionList.innerHTML = '<p class="empty-message">No transactions found.</p>';
      return;
    }
    
    transactionList.innerHTML = '';
    
    filteredTransactions.forEach(transaction => {
      const transactionElement = document.createElement('div');
      transactionElement.classList.add('transaction-item');
      
      const amountClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';
      const typeClass = transaction.type === 'income' ? 'income-type' : 'expense-type';
      const prefix = transaction.type === 'income' ? '+' : '-';
      
      transactionElement.innerHTML = `
        <div class="transaction-info">
          <span class="transaction-type ${typeClass}">${transaction.type}</span>
          <p class="transaction-description">${transaction.description}</p>
        </div>
        <p class="transaction-amount ${amountClass}">${prefix}$${parseFloat(transaction.amount).toFixed(2)}</p>
        <div class="transaction-actions">
          <button class="action-btn edit-btn" data-id="${transaction.id}">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
          </button>
          <button class="action-btn delete-btn" data-id="${transaction.id}">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
          </button>
        </div>
      `;
      
      transactionList.appendChild(transactionElement);
    });
    
    addActionListeners();
  }
  
  function filterTransactions() {
    if (currentFilter === 'all') {
      return [...transactions].reverse();
    } else {
      return [...transactions].filter(transaction => transaction.type === currentFilter).reverse();
    }
  }
  
  function addActionListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEdit);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
  }
  
  function handleEdit(e) {
    const id = e.currentTarget.dataset.id;
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction) {
      typeInput.value = transaction.type;
      descriptionInput.value = transaction.description;
      amountInput.value = transaction.amount;
      editIdInput.value = transaction.id;
      submitBtn.textContent = 'Update Transaction';
    }
  }
  
  function handleDelete(e) {
    const id = e.currentTarget.dataset.id;
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
  }
  
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = typeInput.value;
    const description = descriptionInput.value;
    const amount = amountInput.value;
    const editId = editIdInput.value;
    
    if (!type || !description || !amount) {
      alert('Please fill out all fields');
      return;
    }
    
    if (editId) {
      updateTransaction(editId, type, description, amount);
      submitBtn.textContent = 'Add Transaction';
    } else {
      addTransaction(type, description, amount);
    }
    
    resetForm();
    saveTransactions();
    updateUI();
  }
  
  function updateTransaction(id, type, description, amount) {
    const index = transactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        type,
        description,
        amount,
        updatedAt: new Date().toISOString()
      };
    }
  }
  
  function addTransaction(type, description, amount) {
    const newTransaction = {
      id: generateId(),
      type,
      description,
      amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
  }
  
  function resetForm() {
    form.reset();
    editIdInput.value = '';
    submitBtn.textContent = 'Add Transaction';
  }
  
  function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }
  
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  function handleFilterChange(e) {
    currentFilter = e.target.value;
    displayTransactions();
  }
  
  form.addEventListener('submit', handleFormSubmit);
  resetBtn.addEventListener('click', resetForm);
  
  filterInputs.forEach(input => {
    input.addEventListener('change', handleFilterChange);
  });
  
  updateUI();
});
