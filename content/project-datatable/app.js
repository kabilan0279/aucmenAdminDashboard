// Global state variables
let currentPage = 1;
const itemsPerPage = 10;
let currentSort = {
  column: 'name',
  direction: 'asc'
};
let filters = [];
let filteredData = [...portfolioData];
let activeFilterColumn = null;
let globalSearchTerm = '';
let columnVisibility = {
  name: true,
  isin: true,
  qty: true,
  value: true,
  invested: true,
  poa: true,
  status: true
};

// DOM elements
const portfolioBody = document.getElementById('portfolio-body');
const pageNumbers = document.getElementById('page-numbers');
const firstPageBtn = document.getElementById('first-page');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const lastPageBtn = document.getElementById('last-page');
const rowCountElement = document.getElementById('row-count');
const filterButtons = document.querySelectorAll('.filter-button');
const filterPopup = document.getElementById('filter-popup');
const matchTypeSelect = document.getElementById('match-type');
const filterTypeSelect = document.getElementById('filter-type');
const filterValueInput = document.getElementById('filter-value');
const clearFilterBtn = document.getElementById('clear-filter');
const applyFilterBtn = document.getElementById('apply-filter');
const sortButtons = document.querySelectorAll('[data-sort]');
const globalSearchInput = document.getElementById('global-search');
const columnVisibilityToggle = document.getElementById('column-visibility-toggle');
const columnVisibilityPopup = document.getElementById('column-visibility-popup');
const columnToggles = document.querySelectorAll('.column-toggle');
const resetColumnsBtn = document.getElementById('reset-columns');
const slidingPanel = document.getElementById('sliding-panel');
const closePanel = document.getElementById('close-panel');
const panelContent = document.getElementById('panel-content');
const overlay = document.getElementById('overlay');
const downloadCsvBtn = document.getElementById('download-csv');

// Initialize the table
function initializeTable() {
  // Set up column visibility toggle
  columnVisibilityToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    columnVisibilityPopup.classList.toggle('hidden');
    
    // Position the popup relative to the toggle button
    const toggleRect = columnVisibilityToggle.getBoundingClientRect();
    columnVisibilityPopup.style.top = `${toggleRect.bottom + window.scrollY + 5}px`;
    columnVisibilityPopup.style.right = `${window.innerWidth - toggleRect.right}px`;
  });

  // Close column visibility popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!columnVisibilityPopup.contains(e.target) && e.target !== columnVisibilityToggle) {
      columnVisibilityPopup.classList.add('hidden');
    }
  });

  // Handle column toggle changes
  columnToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const column = toggle.dataset.column;
      columnVisibility[column] = toggle.checked;
      updateColumnVisibility();
      renderTable();
    });
  });

  // Reset columns button
  resetColumnsBtn.addEventListener('click', () => {
    columnToggles.forEach(toggle => {
      toggle.checked = true;
      columnVisibility[toggle.dataset.column] = true;
    });
    updateColumnVisibility();
    renderTable();
  });

  // Set up global search
  globalSearchInput.addEventListener('input', (e) => {
    globalSearchTerm = e.target.value.toLowerCase();
    currentPage = 1; // Reset to first page when searching
    applyFilters();
    renderTable();
  });

  // Set up sort button event listeners
  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      const column = button.dataset.sort;
      if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
      }
      
      // Update sort icons
      updateSortIcons();
      renderTable();
    });
  });

  // Set up filter button event listeners
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const column = button.dataset.column;
      
      // If clicking the same filter button, toggle popup
      if (activeFilterColumn === column && !filterPopup.classList.contains('hidden')) {
        filterPopup.classList.add('hidden');
        button.classList.remove('active');
        activeFilterColumn = null;
        return;
      }
      
      // Toggle active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Position and show popup
      const rect = button.getBoundingClientRect();
      filterPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
      filterPopup.style.left = `${rect.left + window.scrollX - 200}px`;
      filterPopup.classList.remove('hidden');
      
      activeFilterColumn = column;
      
      // Update filter value input placeholder
      filterValueInput.placeholder = `Search by ${column}...`;
    });
  });
  
  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!filterPopup.contains(e.target) && !e.target.classList.contains('filter-button')) {
      filterPopup.classList.add('hidden');
      filterButtons.forEach(btn => btn.classList.remove('active'));
      activeFilterColumn = null;
    }
  });
  
  // Clear filter button
  clearFilterBtn.addEventListener('click', () => {
    filters = filters.filter(f => f.column !== activeFilterColumn);
    filterValueInput.value = '';
    applyFilters();
    renderTable();
    filterPopup.classList.add('hidden');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeFilterColumn = null;
  });
  
  // Apply filter button
  applyFilterBtn.addEventListener('click', () => {
    const value = filterValueInput.value.trim();
    if (value) {
      filters = filters.filter(f => f.column !== activeFilterColumn);
      filters.push({
        column: activeFilterColumn,
        type: filterTypeSelect.value,
        value: value.toLowerCase(),
        matchType: matchTypeSelect.value
      });
      applyFilters();
      renderTable();
    }
    filterPopup.classList.add('hidden');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeFilterColumn = null;
  });
  
  // Set up pagination event listeners
  firstPageBtn.addEventListener('click', () => goToPage(1));
  prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
  lastPageBtn.addEventListener('click', () => goToPage(Math.ceil(filteredData.length / itemsPerPage)));
  
  // Close panel button
  closePanel.addEventListener('click', () => {
    slidingPanel.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0', 'pointer-events-none');
  });

  // Download CSV button
  downloadCsvBtn.addEventListener('click', downloadCSV);

  // Initial render
  updateColumnVisibility();
  renderTable();
}

// Download CSV function
function downloadCSV() {
  const sortedData = getSortedData();
  const visibleColumns = Object.entries(columnVisibility)
    .filter(([_, isVisible]) => isVisible)
    .map(([column]) => column);

  // Create CSV header
  const header = visibleColumns.join(',');

  // Create CSV rows
  const rows = sortedData.map(item => {
    return visibleColumns.map(column => {
      const value = item[column];
      // Handle values that might contain commas
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'portfolio_data.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Update column visibility
function updateColumnVisibility() {
  const table = document.getElementById('portfolio-table');
  Object.entries(columnVisibility).forEach(([column, isVisible]) => {
    const columnIndex = getColumnIndex(column);
    const cells = table.querySelectorAll(`th:nth-child(${columnIndex + 1}), td:nth-child(${columnIndex + 1})`);
    cells.forEach(cell => {
      cell.style.display = isVisible ? '' : 'none';
    });
  });
}

// Get column index by name
function getColumnIndex(columnName) {
  const columns = ['name', 'isin', 'qty', 'value', 'invested', 'poa', 'status'];
  return columns.indexOf(columnName);
}

// Update sort icons based on current sort state
function updateSortIcons() {
  sortButtons.forEach(button => {
    const chevronIcon = button.querySelector('svg');
    if (button.dataset.sort === currentSort.column) {
      chevronIcon.style.transform = currentSort.direction === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)';
      chevronIcon.classList.add('text-blue-500');
    } else {
      chevronIcon.style.transform = '';
      chevronIcon.classList.remove('text-blue-500');
    }
  });
}

// Get status badge class
function getStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'status-approved';
    case 'rejected':
      return 'status-rejected';
    case 'waiting':
      return 'status-waiting';
    case 'inprogress':
      return 'status-inprogress';
    default:
      return '';
  }
}

// Apply filters to data
function applyFilters() {
  let tempData = [...portfolioData];

  // Apply global search first
  if (globalSearchTerm) {
    tempData = tempData.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(globalSearchTerm)
      );
    });
  }
  
  // Then apply column filters
  if (filters.length === 0) {
    filteredData = tempData;
    return;
  }
  
  filteredData = tempData.filter(item => {
    return filters.every(filter => {
      const itemValue = String(item[filter.column]).toLowerCase();
      const filterValue = filter.value.toLowerCase();
      
      switch (filter.type) {
        case 'startsWith':
          return itemValue.startsWith(filterValue);
        case 'contains':
          return itemValue.includes(filterValue);
        case 'equals':
          return itemValue === filterValue;
        case 'endsWith':
          return itemValue.endsWith(filterValue);
        default:
          return true;
      }
    });
  });
}

// Show details panel for a row
function showDetailsPanel(item) {
  panelContent.innerHTML = `
    <div class="space-y-6">
      <div>
        <div class="panel-label">Script Name</div>
        <div class="panel-value">${item.name}</div>
      </div>
      <div>
        <div class="panel-label">ISIN</div>
        <div class="panel-value">${item.isin}</div>
      </div>
      <div>
        <div class="panel-label">Free QTY</div>
        <div class="panel-value">${item.qty}</div>
      </div>
      <div>
        <div class="panel-label">Script Value</div>
        <div class="panel-value">₹${item.value.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</div>
      </div>
      <div>
        <div class="panel-label">Amount Invested</div>
        <div class="panel-value">₹${item.invested.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</div>
      </div>
      <div>
        <div class="panel-label">POA</div>
        <div class="panel-value">${item.poa}</div>
      </div>
      <div>
        <div class="panel-label">Status</div>
        <div class="panel-value">
          <span class="status-badge ${getStatusBadgeClass(item.status)}">${item.status}</span>
        </div>
      </div>
      <div>
        <div class="panel-label">Total Value</div>
        <div class="panel-value">₹${(item.qty * item.value).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</div>
      </div>
      <div>
        <div class="panel-label">Profit/Loss</div>
        <div class="panel-value ${(item.qty * item.value - item.invested) >= 0 ? 'text-green-600' : 'text-red-600'}">
          ₹${(item.qty * item.value - item.invested).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      </div>
    </div>
  `;
  
  slidingPanel.classList.remove('translate-x-full');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100');
}

// Sort and filter data based on current state
function getSortedData() {
  return [...filteredData].sort((a, b) => {
    let valueA = a[currentSort.column];
    let valueB = b[currentSort.column];
    
    // Handle numeric sorting
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return currentSort.direction === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    // Handle string sorting
    valueA = String(valueA).toLowerCase();
    valueB = String(valueB).toLowerCase();
    
    if (valueA < valueB) return currentSort.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Render the table with current data and state
function renderTable() {
  const sortedData = getSortedData();
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  if (currentPage > totalPages) {
    currentPage = totalPages || 1;
  }
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = sortedData.slice(startIndex, endIndex);
  
  rowCountElement.textContent = `No of Rows ${sortedData.length}`;
  
  portfolioBody.innerHTML = '';
  
  currentPageData.forEach(item => {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50 transition-colors';
    
    const formattedValue = item.value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    const formattedInvested = item.invested.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    row.innerHTML = `
      <td class="px-6 py-4 text-sm text-gray-900" style="display: ${columnVisibility.name ? '' : 'none'}">${item.name}</td>
      <td class="px-6 py-4 text-sm text-gray-900" style="display: ${columnVisibility.isin ? '' : 'none'}">${item.isin}</td>
      <td class="px-6 py-4 text-sm text-gray-900" style="display: ${columnVisibility.qty ? '' : 'none'}">${item.qty}</td>
      <td class="px-6 py-4 text-sm text-gray-900" style="display: ${columnVisibility.value ? '' : 'none'}">${formattedValue}</td>
      <td class="px-6 py-4 text-sm text-gray-900" style="display: ${columnVisibility.invested ? '' : 'none'}">${formattedInvested}</td>
      <td class="px-6 py-4 text-sm text-gray-900" style="display: ${columnVisibility.poa ? '' : 'none'}">${item.poa}</td>
      <td class="px-6 py-4 text-sm" style="display: ${columnVisibility.status ? '' : 'none'}">
        <span class="status-badge ${getStatusBadgeClass(item.status)}">${item.status}</span>
      </td>
    `;
    
    row.addEventListener('click', () => showDetailsPanel(item));
    
    portfolioBody.appendChild(row);
  });
  
  updatePagination(totalPages);
  updateSortIcons();
}

// Update pagination buttons and numbers
function updatePagination(totalPages) {
  // Enable/disable navigation buttons
  firstPageBtn.disabled = currentPage === 1;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  lastPageBtn.disabled = currentPage === totalPages;
  
  // Update button styles based on disabled state
  [firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn].forEach(btn => {
    if (btn.disabled) {
      btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });
  
  // Generate page number buttons
  pageNumbers.innerHTML = '';
  
  // Determine which page numbers to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust start if we're near the end
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // Create page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = `page-number px-3 py-1 rounded transition-colors ${
      i === currentPage ? 'active bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
    }`;
    pageBtn.addEventListener('click', () => goToPage(i));
    pageNumbers.appendChild(pageBtn);
  }
}

// Navigate to specific page
function goToPage(page) {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Validate page number
  if (page < 1 || page > totalPages) {
    return;
  }
  
  currentPage = page;
  renderTable();
  
  // Add subtle animation to table
  portfolioBody.classList.add('highlight');
  setTimeout(() => {
    portfolioBody.classList.remove('highlight');
  }, 1000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeTable);