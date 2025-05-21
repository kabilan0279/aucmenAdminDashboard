let dataupl = [];
let currentPageupl = 1;
var rowsPerPageupl = 15;
let sortColumnupl = null;
let sortAscupl = true;

console.log("selected Rows:", rowsPerPageupl);

document.addEventListener('DOMContentLoaded', () => {
  fetch('json/uploadedList.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(json => {
      dataupl = json;
      console.log('Dataupl loaded:', dataupl.length); // ✅ Add this

      setTimeout(function () {
        renderTableupl();
      }, 300);
    })

    .catch(err => {
      console.error('Failed to load JSON:', err);
      const tbupl = document.getElementById('tbupl');
      if (tbupl) {
        tbupl.innerHTML = `
          <tr>
            <td colspan="9" class="text-center p-4 text-red-500">
              Error loading dataupl: ${err.message}
            </td>
          </tr>`;
      }
    });

  const rowsSelect = document.getElementById('rowsPerPageuplupl');
  if (rowsSelect) {
    rowsSelect.addEventListener('change', rowSelect);
  }
  // Inputs for filtering
  ['symbolSearchupl', 'ClientIdupl',  'bidQSearchupl'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      let timeout;
      el.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          currentPageupl = 1;
          renderTableupl();
        }, 300);
      });
    }
  });

  ['startDateupl', 'endDateupl'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        currentPageupl = 1;
        renderTableupl();
      });
    }
  });

  // Add event listener for dropdown checkboxes for RESPONSE filter
  const dropdownCheckboxes = document.querySelectorAll('#dropdownMenuupl input[type="checkbox"]');
  dropdownCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      currentPageupl = 1;
      renderTableupl();
    });
  });
});



function renderTableupl() {
  const filters = getFiltersupl();
  let filteredDataupl = filterDataupl(dataupl, filters);

  if (sortColumnupl !== null) {
    filteredDataupl = sortDataupl(filteredDataupl, sortColumnupl, sortAscupl);
  }

  const touplPages = Math.max(1, Math.ceil(filteredDataupl.length / rowsPerPageupl));
  currentPageupl = Math.min(currentPageupl, touplPages);
  const start = (currentPageupl - 1) * rowsPerPageupl;
  const paginatedDataupl = filteredDataupl.slice(start, start + rowsPerPageupl);

  const tbupl = document.getElementById('tbupl');
  if (!tbupl) return;
  if (paginatedDataupl.length === 0) {
    tbupl.innerHTML = `
    <tr>
      <td colspan="9" class="text-center p-4 font-sm text-center text-gray-700">
        No records found matching your criteria
      </td>
    </tr>`;
  } else {
    tbupl.innerHTML = paginatedDataupl.map(row => {
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
 
</tr>   `;
    }).join('');
  }

  const pageInfoupl = document.getElementById('pageInfoupl');
  if (pageInfoupl) {
    pageInfoupl.textContent = `Page ${currentPageupl} of ${touplPages}`;
  }
}


function getFiltersupl() {
  const selectedResponses = Array.from(document.querySelectorAll('#dropdownMenuupl input[type="checkbox"]:checked'))
    .map(cb => cb.nextElementSibling?.textContent?.trim().toLowerCase() || '');

  return {
    symbol: (document.getElementById('symbolSearchupl')?.value || '').toLowerCase(),
    clientId: (document.getElementById('ClientIdupl')?.value || '').toUpperCase().trim(),
    uploadedBy: (document.getElementById('uploadedByupl')?.value || '').toLowerCase(),
    bidQty: (document.getElementById('bidQSearchupl')?.value || '').toString().trim(),
    startDate: document.getElementById('startDateupl')?.value || '',
    endDate: document.getElementById('endDateupl')?.value || '',
    responses: selectedResponses 
  };
}


function filterDataupl(dataupl, filters) {
  return dataupl.filter(item => {
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


function sortDataupl(dataupl, colIndex, asc) {
  const keys = ["clientId", "symbol", "bidQty", "upiId", "uploadedBy", "response", "date", "time"];
  if (colIndex < 0 || colIndex >= keys.length) return dataupl;

  const key = keys[colIndex];

  return dataupl.slice().sort((a, b) => {
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

function prevPageupl() {
  if (currentPageupl > 1) {
    currentPageupl--;
    renderTableupl();
  }
}

function nextPageupl() {
  const filters = getFiltersupl();
  const filteredLength = filterDataupl(dataupl, filters).length;
  const touplPages = Math.ceil(filteredLength / rowsPerPageupl);

  if (currentPageupl < touplPages) {
    currentPageupl++;
    renderTableupl();
  }
}

function sortupl(colIndex) {
  if (colIndex === 8) return; // Ignore "View" column

  if (sortColumnupl === colIndex) {
    sortAscupl = !sortAscupl;
  } else {
    sortColumnupl = colIndex;
    sortAscupl = true;
  }
  renderTableupl();
}
function filterupl() {
  const symbol = (document.getElementById('symbolSearchupl')?.value || '').toLowerCase().trim();
  const clientId = (document.getElementById('ClientIdupl')?.value || '').toUpperCase().trim();
  const bidQty = (document.getElementById('bidQSearchupl')?.value || '').toString().trim();
  const startDate = (document.getElementById('startDateupl')?.value || '').trim();
  const endDate = (document.getElementById('endDateupl')?.value || '').trim();



  const checkedResponses = Array.from(document.querySelectorAll('#dropdownMenuupl input[type="checkbox"]:checked'))
    .map(cb => cb.nextElementSibling?.textContent?.trim().toLowerCase())
    .filter(text => !!text); // Removes empty strings

  if (symbol || clientId || bidQty || startDate || endDate || checkedResponses.length > 0) {
    renderTableupl({ symbol, clientId, bidQty, startDate, endDate, checkedResponses });
    console.log(clientId)
  } else {
    alert("Please select at least one search or filter criteria.");
  }
}



function rowSelectupl() {
  const selectedValue = parseInt(document.getElementById('rowsPerPageupl').value);
  rowsPerPageupl = selectedValue;
  currentPageupl = 1;
  renderTableupl();
}

function SelectPageupl() {
  const searchText = (document.getElementById('searchPageupl')?.value || '').toLowerCase().trim();
  if (!searchText) {
    renderTableupl(); // Reset if empty
    return;
  }

  const filters = getFiltersupl();
  let filteredDataupl = filterDataupl(dataupl, filters);

  if (sortColumnupl !== null) {
    filteredDataupl = sortDataupl(filteredDataupl, sortColumnupl, sortAscupl);
  }

  const start = (currentPageupl - 1) * rowsPerPageupl;
  const paginatedDataupl = filteredDataupl.slice(start, start + rowsPerPageupl);

  const matchedDataupl = paginatedDataupl.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchText)
    )
  );

  const tbupl = document.getElementById('tbupl');
  if (!tbupl) return;

  if (matchedDataupl.length === 0) {
    tbupl.innerHTML = `
      <tr>
        <td colspan="9" class="text-center p-4 text-sm text-gray-900">
          No matching record found on this page.
        </td>
      </tr>`;
    return;
  }

    tbupl.innerHTML = matchedDataupl.map(row => {
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
   
    </tr>  `;
    }).join('');

  // Update page info to indicate it's a filtered view
  const pageInfoupl = document.getElementById('pageInfoupl');
  if (pageInfoupl) {
    pageInfoupl.textContent = `Search result in page ${currentPageupl}`;
  }


  
}





 function toggleDropdownupl() {
    const dropdownMenuupl = document.getElementById("dropdownMenuupl");
    dropdownMenuupl.classList.toggle("hidden");
  }

 

 function clearDropdownCheckboxesupl() {
    const checkboxes = document.querySelectorAll('#dropdownMenuupl input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
  }

  function toggleDropdownupl() {
    const menu = document.getElementById('dropdownMenuupl');
    menu.classList.toggle('hidden');
  }

