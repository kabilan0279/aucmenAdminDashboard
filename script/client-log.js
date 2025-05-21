let dataClog = [];
let currentPageClog = 1;
let rowsPerPageClog = 15;
let sortDirectionClog = [true, true, true, true, true, true]; // for 6 columns

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/clientlog.json')
        .then(res => res.json())
        .then(json => {
            dataClog = json;
            setTimeout(renderClogTable, 300);
        })
        .catch(err => {
            const tbody = document.getElementById('ClogTBody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error loading data: ${err.message}</td></tr>`;
            }
        });
});



function rowSelectClog() {
    const rowsInput = document.getElementById('rowsPerPageClog');
    if (rowsInput) {
        rowsPerPageClog = parseInt(rowsInput.value);
        currentPageClog = 1;
        renderClogTable();
    }
}


function renderClogTable() {
    const clientIdElement = document.getElementById("ClientIdClog");
    const clientId = clientIdElement ? clientIdElement.value.trim().toUpperCase() : '';

    const startDateElement = document.getElementById("startDateClog");
    const startDate = startDateElement ? startDateElement.value.trim() : '';

    const endDateElement = document.getElementById("endDateClog");
    const endDate = endDateElement ? endDateElement.value.trim() : '';


    // Collect checked response filters
    const checkedResponses = Array.from(document.querySelectorAll('#dropdownMenuClog input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.nextElementSibling.textContent.trim());

    let filteredData = dataClog.filter(row => {
        const matchesClientId = !clientId || row.clientId?.toUpperCase().includes(clientId);
        const matchesResponse = checkedResponses.length === 0 || checkedResponses.includes(row.loginStatus);
        const rowDate = new Date(row.date);
        const matchesDate = (!startDate || new Date(startDate) <= rowDate) &&
            (!endDate || rowDate <= new Date(endDate));
        return matchesClientId && matchesResponse && matchesDate;
    });

    const start = (currentPageClog - 1) * rowsPerPageClog;
    const end = start + rowsPerPageClog;
    const paginatedData = filteredData.slice(start, end);

    const tbody = document.getElementById('tbClog');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">No results found</td></tr>`;
        document.getElementById('pageInfoClog').textContent = '';
        return;
    }

    paginatedData.forEach(row => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 text-center">
                <td class="px-2 py-2">${row.clientId}</td>
                <td class="px-2 py-2">${row.otp || '-'}</td>
                <td class="px-2 py-2">${row.otpStatus || '-'}</td>
                <td class="px-2 py-2">${row.loginStatus || '-'}</td>
                <td class="px-2 py-2">${row.date || '-'}</td>
                <td class="px-2 py-2">${row.time || '-'}</td>
            </tr>`;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPageClog);
    const pageInfo = document.getElementById('pageInfoClog');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPageClog} of ${totalPages}`;
    }
}


function rowSelectClog() {
    const rowsInput = document.getElementById('rowsPerPageClog');
    if (rowsInput) {
        rowsPerPageClog = parseInt(rowsInput.value);
        currentPageClog = 1;
        renderClogTable();
    }
}


function prevPageClog() {
    if (currentPageClog > 1) {
        currentPageClog--;
        renderClogTable();
    }
}

function nextPageClog() {
    const clientIdElement = document.getElementById("ClientIdClog");
    const clientId = clientIdElement ? clientIdElement.value.trim().toUpperCase() : '';

    const startDateElement = document.getElementById("startDateClog");
    const startDate = startDateElement ? startDateElement.value.trim() : '';

    const endDateElement = document.getElementById("endDateClog");
    const endDate = endDateElement ? endDateElement.value.trim() : '';

    const checkedResponses = Array.from(document.querySelectorAll('#dropdownMenuClog input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.nextElementSibling.textContent.trim());

    const filteredData = dataClog.filter(row => {
        const matchesClientId = !clientId || row.clientId?.toUpperCase().includes(clientId);
        const matchesResponse = checkedResponses.length === 0 || checkedResponses.includes(row.loginStatus);
        const rowDate = new Date(row.date);
        const matchesDate = (!startDate || new Date(startDate) <= rowDate) &&
            (!endDate || rowDate <= new Date(endDate));
        return matchesClientId && matchesResponse && matchesDate;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPageClog);
    if (currentPageClog < totalPages) {
        currentPageClog++;
        renderClogTable();
    }
}



function sortClog(columnIndex) {
    const keys = ['clientId', 'otp', 'otpStatus', 'loginStatus', 'date', 'time'];
    const key = keys[columnIndex];

    const dir = sortDirectionClog[columnIndex] ? 1 : -1;
    dataClog.sort((a, b) => {
        const valA = (a[key] || '').toString().toUpperCase();
        const valB = (b[key] || '').toString().toUpperCase();
        return valA > valB ? dir : valA < valB ? -dir : 0;
    });

    sortDirectionClog[columnIndex] = !sortDirectionClog[columnIndex];
    renderClogTable();
}

function filterSearchFunctionClog() {
    currentPageClog = 1;
    renderClogTable();
}


function toggleDropdownClog() {
    const menu = document.getElementById('dropdownMenuClog');
    menu.classList.toggle('hidden');
}

function clearDropdownCheckboxesClog() {
    const checkboxes = document.querySelectorAll('#dropdownCheckboxesClog input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    filterSearchFunctionClog(); // Re-render the table on clear
}

function filterDropdownCheckboxesClog() {
    const input = document.getElementById('dropdownSearchClog').value.toLowerCase();
    const labels = document.querySelectorAll('#dropdownCheckboxesClog label');

    labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(input) ? '' : 'none';
    });
}
















