let data = [];
let currentPage = 1;
var rowsPerPage = 10;
let sortColumn = null;
let sortAsc = true;

console.log("selected Rows:",rowsPerPage);

document.addEventListener('DOMContentLoaded', () => {
  fetch('json/uploadedList.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(json => {
      data = json;
      console.log('Data loaded:', data.length); // ✅ Add this

      setTimeout(function () {
        renderTable();
      }, 300);
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

  const rowsSelect = document.getElementById('rowsPerPage');
  if (rowsSelect) {
    rowsSelect.addEventListener('change', rowSelect);
  }

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

  ['startDate', 'endDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        currentPage = 1;
        renderTable();
      });
    }
  });



  function rowSelect() {
    const selectedValue = parseInt(document.getElementById('rowsPerPage').value);
    rowsPerPage = selectedValue;
    currentPage = 1;
    renderTable();
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
      <td colspan="9" class="text-center p-4 text-sm text-gray-900">
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
        <td class="border-b border-gray-200 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 lg:pl-8">${row.clientId || ''}</td>
        <td class="hidden border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900 sm:table-cell">${row.symbol || ''}</td>
        <td class="hidden border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900 lg:table-cell">${row.bidQty || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.upiId || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.uploadedBy || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap ${responseClass}">${row.response || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.date || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.time || ''}</td>
        <td class="relative border-b border-gray-200 py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-8 lg:pr-8">
          <a href="${row.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-900">
            View<span class="sr-only">, ${row.clientId || 'record'}</span>
          </a>
        </td>
      </tr>`;
  }).join('');
}

  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
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
  if (colIndex === 8) return; // Ignore "View" column

  if (sortColumn === colIndex) {
    sortAsc = !sortAsc;
  } else {
    sortColumn = colIndex;
    sortAsc = true;
  }
  renderTable();
}

function filterSearchFunction() {
  const symbol = (document.getElementById('symbolSearch')?.value || '').toLowerCase().trim();
  const clientId = (document.getElementById('ClientId')?.value || '').toUpperCase().trim();
  const uploadedBy = (document.getElementById('uploadedBy')?.value || '').toLowerCase().trim();
  const bidQty = (document.getElementById('bidQSearch')?.value || '').toString().trim();
  const startDate = (document.getElementById('startDate')?.value || '').trim();
  const endDate = (document.getElementById('endDate')?.value || '').trim();

  if (symbol || clientId || uploadedBy || bidQty || startDate || endDate) {
    renderTable();
  } else {
    alert("Please select At least one.");
  }
}


function rowSelect() {
  const selectedValue = parseInt(document.getElementById('rowsPerPage').value);
  rowsPerPage = selectedValue;
  currentPage = 1;
  renderTable();
}

function SelectPage() {
  const searchText = (document.getElementById('searchPage')?.value || '').toLowerCase().trim();
  if (!searchText) {
    renderTable(); // Reset if empty
    return;
  }

  const filters = getFilters();
  let filteredData = filterData(data, filters);

  if (sortColumn !== null) {
    filteredData = sortData(filteredData, sortColumn, sortAsc);
  }

  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(start, start + rowsPerPage);

  const matchedData = paginatedData.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchText)
    )
  );

  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  if (matchedData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center p-4 text-sm text-gray-900">
          No matching record found on this page.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = matchedData.map(row => {
    const responseClass =
      row.response?.toLowerCase() === 'verified' ? 'text-green-600' :
      row.response?.toLowerCase() === 'success' ? 'text-green-600' :
      row.response?.toLowerCase() === 'failed' ? 'text-red-600' :
      row.response?.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-gray-600';

    return `
      <tr class="hover:bg-gray-50">
        <td class="border-b border-gray-200 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 lg:pl-8">${row.clientId || ''}</td>
        <td class="hidden border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900 sm:table-cell">${row.symbol || ''}</td>
        <td class="hidden border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900 lg:table-cell">${row.bidQty || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.upiId || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.uploadedBy || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap ${responseClass}">${row.response || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.date || ''}</td>
        <td class="border-b border-gray-200 px-3 py-4 text-sm whitespace-nowrap text-gray-900">${row.time || ''}</td>
        <td class="relative border-b border-gray-200 py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-8 lg:pr-8">
          <a href="${row.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-900">
            View<span class="sr-only">, ${row.clientId || 'record'}</span>
          </a>
        </td>
      </tr>`;
  }).join('');

  // Update page info to indicate it's a filtered view
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Search result in page ${currentPage}`;
  }
}



