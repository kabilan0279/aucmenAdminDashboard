let dataOffline = [];
let currentPageOffline = 1;
let rowsPerPageOffline = 15;
let sortColumnOffline = null;
let sortAscOffline = true;

document.addEventListener('DOMContentLoaded', () => {
  fetch('json/uploadedList.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(json => {
      dataOffline = json;

      setTimeout(function () {
        renderOfflineTable();
      }, 300);

    })
    .catch(err => {
      const tableBody = document.getElementById('offlineTableBody');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center  p-4 text-red-500">
              Error loading data: ${err.message}
            </td>
          </tr>`;
      }
    });
});

function getOfflineFilters() {
  return {
    symbol: (document.getElementById('offlineSymbolSearch')?.value || '').toLowerCase(),
    clientId: (document.getElementById('offlineClientId')?.value || '').toUpperCase().trim(),
    startDate: document.getElementById('offlineStartDate')?.value || '',
    endDate: document.getElementById('offlineEndDate')?.value || ''
  };
}

function filterOfflineData(data, filters) {
  return data.filter(item => {
    const itemClientId = (item.clientId || '').toUpperCase();
    const itemSymbol = (item.symbol || '').toLowerCase();
    const itemDate = item.date || '';

    return (
      (filters.symbol === '' || itemSymbol.includes(filters.symbol)) &&
      (filters.clientId === '' || itemClientId.includes(filters.clientId)) &&
      (filters.startDate === '' || itemDate >= filters.startDate) &&
      (filters.endDate === '' || itemDate <= filters.endDate)
    );
  });
}

function sortOfflineTable(colIndex) {
  if (sortColumnOffline === colIndex) {
    sortAscOffline = !sortAscOffline;
  } else {
    sortColumnOffline = colIndex;
    sortAscOffline = true;
  }
  renderOfflineTable();
}

function sortOfflineData(data, colIndex, asc) {
  const keys = ['clientId', 'symbol', 'bidQty', 'upiId', 'date', 'time'];
  const key = keys[colIndex];
  return data.slice().sort((a, b) => {
    let valA = a[key] || '';
    let valB = b[key] || '';

    if (key === 'bidQty') {
      valA = Number(valA);
      valB = Number(valB);
      return asc ? valA - valB : valB - valA;
    }

    if (key === 'date') {
      valA = new Date(valA);
      valB = new Date(valB);
      return asc ? valA - valB : valB - valA;
    }

    return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });
}

function renderOfflineTable() {
  const filters = getOfflineFilters();
  let filteredData = filterOfflineData(dataOffline, filters);

  if (sortColumnOffline !== null) {
    filteredData = sortOfflineData(filteredData, sortColumnOffline, sortAscOffline);
  }

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPageOffline));
  currentPageOffline = Math.min(currentPageOffline, totalPages);
  const start = (currentPageOffline - 1) * rowsPerPageOffline;
  const paginatedData = filteredData.slice(start, start + rowsPerPageOffline);

  const tableBody = document.getElementById('offlineTableBody');
  if (!tableBody) return;

  if (paginatedData.length === 0) {
    tableBody.innerHTML = `
      <tr><td colspan="7" class="text-center  p-4 text-gray-500">No matching records found.</td></tr>`;
    document.getElementById('offlinePageInfo').textContent = `Page 0 of ${totalPages}`;
    return;
  }

  tableBody.innerHTML = paginatedData.map(item => `
 <tr class="hover:bg-gray-50 divide-y divide-gray-200 bg-white">
  <td class="py-2 pr-3 pl-4 font-sm text-center text-gray-700 sm:pl-0">${item.clientId || ''}</td>
  <td class="px-2 py-2 text-sm font-sm text-center whitespace-nowrap text-gray-900">${item.symbol || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.bidQty || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.upiId || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.date || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.time || ''}</td>
 <td class="px-2 py-2 text-sm text-center whitespace-nowrap">
    <a href="${item.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded-sm">
      View<span class="sr-only">, ${item.clientId || 'record'}</span>
    </a>
  </td>
  </tr>


    `).join('');

  document.getElementById('offlinePageInfo').textContent = `Page ${currentPageOffline} of ${totalPages}`;
}

function prevOfflinePage() {
  if (currentPageOffline > 1) {
    currentPageOffline--;
    renderOfflineTable();
  }
}

function nextOfflinePage() {
  const totalPages = Math.ceil(filterOfflineData(dataOffline, getOfflineFilters()).length / rowsPerPageOffline);
  if (currentPageOffline < totalPages) {
    currentPageOffline++;
    renderOfflineTable();
  }
}

function setOfflineRowsPerPage() {
  const val = parseInt(document.getElementById('offlineRowsPerPage')?.value);
  if (!isNaN(val)) {
    rowsPerPageOffline = val;
    currentPageOffline = 1;
    renderOfflineTable();
  }
}

function filterOfflineSearch() {
  currentPageOffline = 1;
  renderOfflineTable();
}
function selectOfflinePage() {
  const searchText = (document.getElementById('offlineSearchPage')?.value || '').toLowerCase().trim();

  // Get filters & filter data (all data filtered globally)
  const filters = getOfflineFilters();
  let filteredData = filterOfflineData(dataOffline, filters);

  // Sort filtered data if applicable
  if (sortColumnOffline !== null) {
    filteredData = sortOfflineData(filteredData, sortColumnOffline, sortAscOffline);
  }

  // Get current page slice of data (pagination)
  const start = (currentPageOffline - 1) * rowsPerPageOffline;
  const paginatedData = filteredData.slice(start, start + rowsPerPageOffline);

  // Filter the current page data based on search text across any cell
  const matchedData = paginatedData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchText)
    )
  );

  // Get table body element
  const tableBody = document.getElementById('offlineTableBody');
  if (!tableBody) return;

  if (matchedData.length === 0) {
    tableBody.innerHTML = `
      <tr><td colspan="7" class="text-center  p-4 text-gray-500">No matching record found on this page.</td></tr>`;
    return;
  }

  // Render matched rows inside the current page
  tableBody.innerHTML = matchedData.map(item => `
   <tr class="hover:bg-gray-50 divide-y divide-gray-200 bg-white">
  <td class="py-2 pr-3 pl-4 font-sm text-center text-gray-700 sm:pl-0">${item.clientId || ''}</td>
  <td class="px-2 py-2 text-sm font-sm text-center whitespace-nowrap text-gray-900">${item.symbol || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.bidQty || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.upiId || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.date || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${item.time || ''}</td>
 <td class="px-2 py-2 text-sm text-center whitespace-nowrap">
    <a href="${item.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded-sm">
      View<span class="sr-only">, ${item.clientId || 'record'}</span>
    </a>
  </td></tr>


  `).join('');

  // Optionally update page info or show filtered status
  const pageInfo = document.getElementById('offlinePageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Search result on page ${currentPageOffline}`;
  }
}

