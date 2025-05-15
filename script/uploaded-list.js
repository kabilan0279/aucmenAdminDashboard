let data = [];
let currentPage = 1;
let rowsPerPage = 300;
let sortColumn = null;
let sortAsc = true;

 

document.addEventListener('DOMContentLoaded', () => {
  // Load data
  fetch('json/uploadedList.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(json => {
      data = json;
      renderTable();
    })
    .catch(err => {
      console.error('Failed to load JSON:', err);
      const tableBody = document.getElementById('tableBody');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="9" class="text-center p-4 text-red-500">
              Error loading data: ${err.message}
            </td>
          </tr>`;
      }
    });

  // Add input filters debounce
  ['symbolSearch', 'ClientId', 'uploadedBy', 'bidQSearch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      let timeout;
      el.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          currentPage = 1;
          renderTable();
        }, 300);
      });
    }
  });

  // Add date filters change
  ['startDate', 'endDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      currentPage = 1;
      renderTable();
    });
  });

  // rowsPerPage select listener — **correctly inside DOMContentLoaded**
  const rowsSelect = document.getElementById('rowsPerPage');
  if (rowsSelect) {
    rowsSelect.addEventListener('change', () => {
      const val = parseInt(rowsSelect.value, 10);
      if (!isNaN(val) && val > 0) {
        rowsPerPage = val;
        currentPage = 1;
        renderTable();
      }
    });
  }
});

function getFilters() {
  return {
    symbol: (document.getElementById('symbolSearch')?.value || '').toLowerCase(),
    clientId: (document.getElementById('ClientId')?.value || '').toUpperCase().trim(),
    uploadedBy: (document.getElementById('uploadedBy')?.value || '').toLowerCase(),
    bidQty: (document.getElementById('bidQSearch')?.value || '').toString().trim(),
    startDate: document.getElementById('startDate')?.value || '',
    endDate: document.getElementById('endDate')?.value || ''
  };
}

function filterData(data, filters) {
  return data.filter(item => {
    const itemClientId = (item.clientId || '').toString();
    const itemSymbol = (item.symbol || '').toString().toLowerCase();
    const itemUploadedBy = (item.uploadedBy || '').toString().toLowerCase();
    const itemBidQty = (item.bidQty || '').toString();
    const itemDate = item.date || '';

    return (
      (filters.symbol === '' || itemSymbol.includes(filters.symbol)) &&
      (filters.clientId === '' || itemClientId.includes(filters.clientId)) &&
      (filters.uploadedBy === '' || itemUploadedBy.includes(filters.uploadedBy)) &&
      (filters.bidQty === '' || itemBidQty === filters.bidQty) &&
      (filters.startDate === '' || itemDate >= filters.startDate) &&
      (filters.endDate === '' || itemDate <= filters.endDate)
    );
  });
}

function sortData(data, colIndex, asc) {
  const keys = ["clientId", "symbol", "bidQty", "upiId", "uploadedBy", "response", "date", "time"];
  if (colIndex < 0 || colIndex >= keys.length) return data;

  const key = keys[colIndex];

  return data.slice().sort((a, b) => {
    let valA = a[key] || '';
    let valB = b[key] || '';

    if (key === 'bidQty') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return asc ? valA - valB : valB - valA;
    }

    if (key === 'date') {
      valA = new Date(valA);
      valB = new Date(valB);
      return asc ? valA - valB : valB - valA;
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });
}

function renderTable() {
  const filters = getFilters();
  let filteredData = filterData(data, filters);

  if (sortColumn !== null) {
    filteredData = sortData(filteredData, sortColumn, sortAsc);
  }

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(start, start + rowsPerPage);

  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  if (paginatedData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center p-4 text-gray-500">
          No records found matching your criteria
        </td>
      </tr>`;
  } else {
    tableBody.innerHTML = paginatedData.map(row => {
      const responseClass = 
        row.response?.toLowerCase() === 'verified' ? 'text-green-600' :
        row.response?.toLowerCase() === 'success' ? 'text-green-600' :
        row.response?.toLowerCase() === 'failed' ? 'text-red-600' :
        row.response?.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-gray-600';

      return `
        <tr class="hover:bg-gray-50">
          <td class="p-3 border-b">${row.clientId || ''}</td>
          <td class="p-3 border-b">${row.symbol || ''}</td>
          <td class="p-3 border-b">${row.bidQty || ''}</td>
          <td class="p-3 border-b">${row.upiId || ''}</td>
          <td class="p-3 border-b">${row.uploadedBy || ''}</td>
          <td class="p-3 border-b ${responseClass}">${row.response || ''}</td>
          <td class="p-3 border-b">${row.date || ''}</td>
          <td class="p-3 border-b">${row.time || ''}</td>
          <td class="p-3 border-b text-center">
            <a href="${row.viewLink || '#'}" target="_blank" rel="noopener noreferrer">
              <button class="bg-cyan-500 text-white px-3 py-1 rounded hover:bg-cyan-600 transition duration-150">
                View
              </button>
            </a>
          </td>
        </tr>`;
    }).join('');
  }

  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function nextPage() {
  const filters = getFilters();
  const filteredLength = filterData(data, filters).length;
  const totalPages = Math.ceil(filteredLength / rowsPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

function sortTable(colIndex) {
  if (colIndex === 8) return; // Ignore "View" button column

  if (sortColumn === colIndex) {
    sortAsc = !sortAsc;
  } else {
    sortColumn = colIndex;
    sortAsc = true;
  }
  renderTable();
}
