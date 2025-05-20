let dataClog = [];
let currentPageClog = 1;
var rowsPerPageClog = 15;
let sortColumnClog = null;
let sortAscClog = true;

console.log("selected Rows client-log:", rowsPerPageClog);

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/client-log.json')
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(json => {
            dataClog = json;
            console.log('DataClog loaded:', dataClog.length); // ✅ Add this

            setTimeout(function () {
                renderTableClog();
            }, 300);
        })

        .catch(err => {
            console.error('Failed to load JSON:', err);
            const tbClog = document.getElementById('tbClog');
            if (tbClog) {
                tbClog.innerHTML = `
          <tr>
            <td colspan="9" class="text-center p-4 text-red-500">
              Error loading dataClog: ${err.message}
            </td>
          </tr>`;
            }
        });

    const rowsSelect = document.getElementById('rowsPerPageClog');
    if (rowsSelect) {
        rowsSelect.addEventListener('change', rowSelect);
    }
    // Inputs for filtering
    ['symbolSearch', 'ClientId', 'uploadedBy', 'bidQSearch'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let timeout;
            el.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    currentPageClog = 1;
                    renderTableClog();
                }, 300);
            });
        }
    });

    ['startDateClog', 'endDateClog'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                currentPageClog = 1;
                renderTableClog();
            });
        }
    });

    // Add event listener for dropdown checkboxes for RESPONSE filter
    const dropdownCheckboxes = document.querySelectorAll('#dropdownMenuClog input[type="checkbox"]');
    dropdownCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            currentPageClog = 1;
            renderTableClog();
        });
    });
});




function getFilters() {
    const selectedResponses = Array.from(document.querySelectorAll('#dropdownMenuClog input[type="checkbox"]:checked'))
        .map(cb => cb.nextElementSibling?.textContent?.trim().toLowerCase() || '');

    return {
        symbol: (document.getElementById('symbolSearch')?.value || '').toLowerCase(),
        clientId: (document.getElementById('ClientId')?.value || '').toUpperCase().trim(),
        uploadedBy: (document.getElementById('uploadedBy')?.value || '').toLowerCase(),
        bidQty: (document.getElementById('bidQSearch')?.value || '').toString().trim(),
        startDateClog: document.getElementById('startDateClog')?.value || '',
        endDateClog: document.getElementById('endDateClog')?.value || '',
        responses: selectedResponses // ✅ add this line
    };
}


function filterDataClog(dataClog, filters) {
    return dataClog.filter(item => {
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
            (filters.startDateClog === '' || itemDate >= filters.startDateClog) &&
            (filters.endDateClog === '' || itemDate <= filters.endDateClog) &&
            (filters.responses.length === 0 || filters.responses.includes(itemResponse)) // ✅ response match
        );
    });
}


function sortDataClog(dataClog, colIndex, asc) {
    const keys = ["clientId", "otp", "otpStatus", "loginStatus", "date", "time"];
    if (colIndex < 0 || colIndex >= keys.length) return dataClog;

    const key = keys[colIndex];

    return dataClog.slice().sort((a, b) => {
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

function renderTableClog() {
    const filters = getFilters();
    let filteredDataClog = filterDataClog(dataClog, filters);

    if (sortColumnClog !== null) {
        filteredDataClog = sortDataClog(filteredDataClog, sortColumnClog, sortAscClog);
    }

    const totalPages = Math.max(1, Math.ceil(filteredDataClog.length / rowsPerPageClog));
    currentPageClog = Math.min(currentPageClog, totalPages);
    const start = (currentPageClog - 1) * rowsPerPageClog;
    const paginatedDataClog = filteredDataClog.slice(start, start + rowsPerPageClog);

    const tbClog = document.getElementById('tbClog');
    if (!tbClog) return;
    if (paginatedDataClog.length === 0) {
        tbClog.innerHTML = `
    <tr>
      <td colspan="9" class="text-center p-4 font-sm text-center text-gray-700">
        No records found matching your criteria
      </td>
    </tr>`;
    } else {
        tbClog.innerHTML = paginatedDataClog.map(row => {
            const responseClass =
                row.response?.toLowerCase() === 'verified' ? 'text-green-600' :
                    row.response?.toLowerCase() === 'success' ? 'text-green-600' :
                        row.response?.toLowerCase() === 'failed' ? 'text-red-600' :
                            row.response?.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-gray-600';

            return `
                    <tr class="hover:bg-gray-50 divide-y divide-gray-200 bg-white">
            <td class="py-2 pr-3 pl-4 font-sm text-center text-gray-700 sm:pl-0">${row.clientId || ''}</td>
            <td class="px-2 py-2 text-sm font-sm text-center whitespace-nowrap text-gray-900">${row.otp || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.otpStatus || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.loginStatus || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.date || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.time || ''}</td>
            
            </tr>   `;
        }).join('');
    }

    const pageInfoClog = document.getElementById('pageInfoClog');
    if (pageInfoClog) {
        pageInfoClog.textContent = `Page ${currentPageClog} of ${totalPages}`;
    }
}

function prevPageClog() {
    if (currentPageClog > 1) {
        currentPageClog--;
        renderTableClog();
    }
}

function nextPageClog() {
    const filters = getFilters();
    const filteredLength = filterDataClog(dataClog, filters).length;
    const totalPages = Math.ceil(filteredLength / rowsPerPageClog);

    if (currentPageClog < totalPages) {
        currentPageClog++;
        renderTableClog();
    }
}

function sortClog(colIndex) {
    if (colIndex === 8) return; // Ignore "View" column

    if (sortColumnClog === colIndex) {
        sortAscClog = !sortAscClog;
    } else {
        sortColumnClog = colIndex;
        sortAscClog = true;
    }
    renderTableClog();
}
function filterSearchFunctionClog() {
    
    const clientId = (document.getElementById('ClientIdClog')?.value || '').toLowerCase().trim();
    const startDateClog = (document.getElementById('startDateClog')?.value || '').trim();
    const endDateClog = (document.getElementById('endDateClog')?.value || '').trim();

    console.log(clientId);
    console.log(startDateClog);
    console.log(endDateClog)

    // const checkedResponses = Array.from(document.querySelectorAll('#dropdownMenuClog input[type="checkbox"]:checked'))
    //     .map(cb => cb.nextElementSibling?.textContent?.trim().toLowerCase() || '');

    if (clientId || startDateClog || endDateClog || checkedResponses.length > 0) {
        renderTableClog();
    } else {
        alert("Please select at least one.");
    }
}

function rowSelectClog() {
    const selectedValue = parseInt(document.getElementById('rowsPerPageClog').value);
    rowsPerPageClog = selectedValue;
    currentPageClog = 1;
    renderTableClog();
}

function SelectPage() {
    const searchText = (document.getElementById('searchPage')?.value || '').toLowerCase().trim();
    if (!searchText) {
        renderTableClog(); // Reset if empty
        return;
    }

    const filters = getFilters();
    let filteredDataClog = filterDataClog(dataClog, filters);

    if (sortColumnClog !== null) {
        filteredDataClog = sortDataClog(filteredDataClog, sortColumnClog, sortAscClog);
    }

    const start = (currentPageClog - 1) * rowsPerPageClog;
    const paginatedDataClog = filteredDataClog.slice(start, start + rowsPerPageClog);

    const matchedDataClog = paginatedDataClog.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchText)
        )
    );

    const tbClog = document.getElementById('tbClog');
    if (!tbClog) return;

    if (matchedDataClog.length === 0) {
        tbClog.innerHTML = `
      <tr>
        <td colspan="9" class="text-center p-4 text-sm text-gray-900">
          No matching record found on this page.
        </td>
      </tr>`;
        return;
    }

    tbClog.innerHTML = matchedDataClog.map(row => {
        const responseClass =
            row.response?.toLowerCase() === 'verified' ? 'text-green-600' :
                row.response?.toLowerCase() === 'success' ? 'text-green-600' :
                    row.response?.toLowerCase() === 'failed' ? 'text-red-600' :
                        row.response?.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-gray-600';

        return `
     <tr class="hover:bg-gray-50 divide-y divide-gray-200 bg-white">
            <td class="py-2 pr-3 pl-4 font-sm text-center text-gray-700 sm:pl-0">${row.clientId || ''}</td>
            <td class="px-2 py-2 text-sm font-sm text-center whitespace-nowrap text-gray-900">${row.otp || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.otpStatus || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.loginStatus || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.date || ''}</td>
            <td class="px-2 py-2 font-sm text-center text-gray-700">${row.time || ''}</td>
            
            </tr> `;
    }).join('');

    // Update page info to indicate it's a filtered view
    const pageInfo = document.getElementById('pageInfoClog');
    if (pageInfoClog) {
        pageInfoClog.textContent = `Search result in page ${currentPageClog}`;
    }
}


function toggleDropdownClog() {
    const dropdownMenuClog = document.getElementById("dropdownMenuClog");
    dropdownMenuClog.classList.toggle("hidden");
}


function clearDropdownCheckboxesClog() {
    const checkboxes = document.querySelectorAll('#dropdownMenuClog input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}

function toggleDropdownClog() {
    const menu = document.getElementById('dropdownMenuClog');
    menu.classList.toggle('hidden');
}
