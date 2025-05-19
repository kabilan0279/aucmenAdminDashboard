let dataTAL = [];
let currentPageTAL = 1;
var rowsPerPageTAL = 15;
let sortColumnTAL = null;
let sortAscTAL = true;

console.log("selected Rows:", rowsPerPageTAL);

document.addEventListener('DOMContentLoaded', () => {
  fetch('json/transaction-list.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(json => {
      dataTAL = json;
      console.log('DataTAL loaded:', dataTAL.length); // ✅ Add this

      setTimeout(function () {
        renderTableTAL();
      }, 300);
    })

    .catch(err => {
      console.error('Failed to load JSON:', err);
      const tbTAL = document.getElementById('tbTAL');
      if (tbTAL) {
        tbTAL.innerHTML = `
          <tr>
            <td colspan="9" class="text-center p-4 text-red-500">
              Error loading dataTAL: ${err.message}
            </td>
          </tr>`;
      }
    });

  const rowsSelect = document.getElementById('rowsPerPageTALTAL');
  if (rowsSelect) {
    rowsSelect.addEventListener('change', rowSelect);
  }
  // Inputs for filtering
  ['symbolSearchTAL', 'ClientIdTAL',  'bidQSearchTAL'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      let timeout;
      el.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          currentPageTAL = 1;
          renderTableTAL();
        }, 300);
      });
    }
  });

  ['startDateTAL', 'endDateTAL'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        currentPageTAL = 1;
        renderTableTAL();
      });
    }
  });

  // Add event listener for dropdown checkboxes for RESPONSE filter
  const dropdownCheckboxes = document.querySelectorAll('#dropdownMenuTAL input[type="checkbox"]');
  dropdownCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      currentPageTAL = 1;
      renderTableTAL();
    });
  });
});




function getFilters() {
  const selectedResponses = Array.from(document.querySelectorAll('#dropdownMenuTAL input[type="checkbox"]:checked'))
    .map(cb => cb.nextElementSibling?.textContent?.trim().toLowerCase() || '');

  return {
    symbol: (document.getElementById('symbolSearchTAL')?.value || '').toLowerCase(),
    clientId: (document.getElementById('ClientIdTAL')?.value || '').toUpperCase().trim(),
    uploadedBy: (document.getElementById('uploadedByTAL')?.value || '').toLowerCase(),
    bidQty: (document.getElementById('bidQSearchTAL')?.value || '').toString().trim(),
    startDate: document.getElementById('startDateTAL')?.value || '',
    endDate: document.getElementById('endDateTAL')?.value || '',
    responses: selectedResponses 
  };
}


function filterDataTAL(dataTAL, filters) {
  return dataTAL.filter(item => {
    const itemClientId = (item.clientId || '').toString();
    const itemSymbol = (item.symbol || '').toString().toLowerCase();
    const itemUploadedBy = (item.uploadedBy || '').toString().toLowerCase();
    const itemBidQty = (item.bidQty || '').toString();
    const itemDate = item.date || '';
    const itemResponse = (item.response || '').toLowerCase().trim();

    return (
      (filters.symbol === '' || itemSymbol.includes(filters.symbol)) &&
      (filters.clientId === '' || itemClientId.includes(filters.clientId)) &&
      (filters.uploadedBy === '' || itemUploadedBy.includes(filters.uploadedBy)) &&
      (filters.bidQty === '' || itemBidQty === filters.bidQty) &&
      (filters.startDate === '' || itemDate >= filters.startDate) &&
      (filters.endDate === '' || itemDate <= filters.endDate) &&
      (filters.responses.length === 0 || filters.responses.includes(itemResponse)) // ✅ response match
    );
  });
}


function sortDataTAL(dataTAL, colIndex, asc) {
  const keys = ["clientId", "symbol", "bidQty", "upiId", "uploadedBy", "response", "date", "time"];
  if (colIndex < 0 || colIndex >= keys.length) return dataTAL;

  const key = keys[colIndex];

  return dataTAL.slice().sort((a, b) => {
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

function renderTableTAL() {
  const filters = getFilters();
  let filteredDataTAL = filterDataTAL(dataTAL, filters);

  if (sortColumnTAL !== null) {
    filteredDataTAL = sortDataTAL(filteredDataTAL, sortColumnTAL, sortAscTAL);
  }

  const totalPages = Math.max(1, Math.ceil(filteredDataTAL.length / rowsPerPageTAL));
  currentPageTAL = Math.min(currentPageTAL, totalPages);
  const start = (currentPageTAL - 1) * rowsPerPageTAL;
  const paginatedDataTAL = filteredDataTAL.slice(start, start + rowsPerPageTAL);

  const tbTAL = document.getElementById('tbTAL');
  if (!tbTAL) return;
  if (paginatedDataTAL.length === 0) {
    tbTAL.innerHTML = `
    <tr>
      <td colspan="9" class="text-center p-4 font-sm text-center text-gray-700">
        No records found matching your criteria
      </td>
    </tr>`;
  } else {
    tbTAL.innerHTML = paginatedDataTAL.map(row => {
      const responseClass =
        row.response?.toLowerCase() === 'verified' ? 'text-green-600' :
          row.response?.toLowerCase() === 'success' ? 'text-green-600' :
            row.response?.toLowerCase() === 'failed' ? 'text-red-600' :
              row.response?.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-gray-600';

      return `
           <tr class="hover:bg-gray-50 divide-y divide-gray-200 bg-white">
  <td class="py-2 pr-3 pl-4 font-sm text-center text-gray-700 sm:pl-0">${row.clientId || ''}</td>
  <td class="px-2 py-2 text-sm font-sm text-center whitespace-nowrap text-gray-900">${row.symbol || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${row.bidQty || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${row.upiId || ''}</td>
  <td class="px-2 py-2 text-sm text-start whitespace-nowrap ${responseClass}">${row.response || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${row.date || ''}</td>
  <td class="px-2 py-2 font-sm text-center text-gray-700">${row.time || ''}</td>
  <td class="px-2 py-2 text-sm text-center whitespace-nowrap">
    <a href="${row.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded-sm">
      View<span class="sr-only">, ${row.clientId || 'record'}</span>
    </a>
  </td>
   <td class="px-2 py-2 text-sm text-center whitespace-nowrap">
        <a href="${row.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded-sm">
        Re Apply<span class="sr-only">, ${row.clientId || 'record'}</span>
        </a>
    </td>
</tr>   `;
    }).join('');
  }

  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPageTAL} of ${totalPages}`;
  }
}

function prevPage() {
  if (currentPageTAL > 1) {
    currentPageTAL--;
    renderTableTAL();
  }
}

function nextPage() {
  const filters = getFilters();
  const filteredLength = filterDataTAL(dataTAL, filters).length;
  const totalPages = Math.ceil(filteredLength / rowsPerPageTAL);

  if (currentPageTAL < totalPages) {
    currentPageTAL++;
    renderTableTAL();
  }
}

function sortTAL(colIndex) {
  if (colIndex === 8) return; // Ignore "View" column

  if (sortColumnTAL === colIndex) {
    sortAscTAL = !sortAscTAL;
  } else {
    sortColumnTAL = colIndex;
    sortAscTAL = true;
  }
  renderTableTAL();
}

function filterSearchFunction() {
  const symbol = (document.getElementById('symbolSearch')?.value || '').toLowerCase().trim();
  const clientId = (document.getElementById('ClientId')?.value || '').toUpperCase().trim();
  const uploadedBy = (document.getElementById('uploadedBy')?.value || '').toLowerCase().trim();
  const bidQty = (document.getElementById('bidQSearch')?.value || '').toString().trim();
  const startDate = (document.getElementById('startDate')?.value || '').trim();
  const endDate = (document.getElementById('endDate')?.value || '').trim();

   const checkedResponses = Array.from(document.querySelectorAll('#dropdownMenuTAL input[type="checkbox"]:checked'))
    .map(cb => cb.nextElementSibling?.textContent?.trim().toLowerCase() || '');


  if (symbol || clientId || uploadedBy || bidQty || startDate || endDate ||  checkedResponses ) {
    renderTableTAL();
  } else {
    alert("Please select At least one.");
  }
}


function rowSelectTAL() {
  const selectedValue = parseInt(document.getElementById('rowsPerPageTAL').value);
  rowsPerPageTAL = selectedValue;
  currentPageTAL = 1;
  renderTableTAL();
}

function SelectPageTAL() {
  const searchText = (document.getElementById('searchPageTAL')?.value || '').toLowerCase().trim();
  if (!searchText) {
    renderTableTAL(); // Reset if empty
    return;
  }

  const filters = getFilters();
  let filteredDataTAL = filterDataTAL(dataTAL, filters);

  if (sortColumnTAL !== null) {
    filteredDataTAL = sortDataTAL(filteredDataTAL, sortColumnTAL, sortAscTAL);
  }

  const start = (currentPageTAL - 1) * rowsPerPageTAL;
  const paginatedDataTAL = filteredDataTAL.slice(start, start + rowsPerPageTAL);

  const matchedDataTAL = paginatedDataTAL.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchText)
    )
  );

  const tbTAL = document.getElementById('tbTAL');
  if (!tbTAL) return;

  if (matchedDataTAL.length === 0) {
    tbTAL.innerHTML = `
      <tr>
        <td colspan="9" class="text-center p-4 text-sm text-gray-900">
          No matching record found on this page.
        </td>
      </tr>`;
    return;
  }

    tbTAL.innerHTML = matchedDataTAL.map(row => {
        const responseClass =
        row.response?.toLowerCase() === 'verified' ? 'text-green-600' :
            row.response?.toLowerCase() === 'success' ? 'text-green-600' :
            row.response?.toLowerCase() === 'failed' ? 'text-red-600' :
                row.response?.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-gray-600';

        return `
        <tr class="hover:bg-gray-50 divide-y divide-gray-200 bg-white">
    <td class="py-2 pr-3 pl-4 font-sm text-center text-gray-700 sm:pl-0">${row.clientId || ''}</td>
    <td class="px-2 py-2 text-sm font-sm text-center whitespace-nowrap text-gray-900">${row.symbol || ''}</td>
    <td class="px-2 py-2 font-sm text-center text-gray-700">${row.bidQty || ''}</td>
    <td class="px-2 py-2 font-sm text-center text-gray-700">${row.upiId || ''}</td>
    <td class="px-2 py-2  text-sm text-center whitespace-nowrap ${responseClass}">${row.response || ''}</td>
    <td class="px-2 py-2 font-sm text-center text-gray-700">${row.date || ''}</td>
    <td class="px-2 py-2 font-sm text-center text-gray-700">${row.time || ''}</td>
    <td class="px-2 py-2 text-sm text-center whitespace-nowrap">
        <a href="${row.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded-sm">
        View<span class="sr-only">, ${row.clientId || 'record'}</span>
        </a>
    </td>
    <td class="px-2 py-2 text-sm text-center whitespace-nowrap">
        <a href="${row.viewLink || '#'}" target="_blank" rel="noopener noreferrer" class="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded-sm">
        Re Apply<span class="sr-only">, ${row.clientId || 'record'}</span>
        </a>
    </td>
    </tr>  `;
    }).join('');

  // Update page info to indicate it's a filtered view
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Search result in page ${currentPageTAL}`;
  }


  
}





 function toggleDropdownTAL() {
    const dropdownMenuTAL = document.getElementById("dropdownMenuTAL");
    dropdownMenuTAL.classList.toggle("hidden");
  }

 

 function clearDropdownCheckboxesTAL() {
    const checkboxes = document.querySelectorAll('#dropdownMenuTAL input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
  }

  function toggleDropdownTAL() {
    const menu = document.getElementById('dropdownMenuTAL');
    menu.classList.toggle('hidden');
  }

