let dataNotAllotted = [];
let currentPageNotAllotted = 1;
let rowsPerPageNotAllotted = 15;
let sortColumnNotAllotted = null;
let sortAscNotAllotted = true;

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/not-allotted.json')
        .then(res => res.json())
        .then(json => {
            dataNotAllotted = json;
            setTimeout(() => {
                renderNotAllottedTable();
            }, 300);
        })
        .catch(err => {
            document.getElementById('notAllote-Body').innerHTML = `
        <tr><td colspan="5" class="text-center p-4 text-red-500">Error loading data: ${err.message}</td></tr>`;
        });
});

function getNotAllottedFilters() {
    return {
        clientId: document.getElementById('notAllottedClientId')?.value.trim().toUpperCase(),
        symbol: document.getElementById('notAllottedSymbolSearch')?.value.trim().toLowerCase(),
        pan: document.getElementById('notAllottedPanSearch')?.value.trim().toUpperCase(),
        appNo: document.getElementById('notAllottedAppNoSearch')?.value.trim()
    };
}

function filterNotAllottedData(data, filters) {
    return data.filter(item => {
        return (
            (!filters.clientId || (item.clientId || '').toUpperCase().includes(filters.clientId)) &&
            (!filters.symbol || (item.symbol || '').toLowerCase().includes(filters.symbol)) &&
            (!filters.pan || (item.pan || '').toUpperCase().includes(filters.pan)) &&
            (!filters.appNo || (item.applicationNo || '').includes(filters.appNo))
        );
    });
}

function renderNotAllottedTable() {
    const filters = getNotAllottedFilters();
    let filteredData = filterNotAllottedData(dataNotAllotted, filters);

    if (sortColumnNotAllotted !== null) {
        const keys = ['symbol', 'applicationNo', 'pan', 'clientId', 'appliedQuantity'];
        const key = keys[sortColumnNotAllotted];

        filteredData.sort((a, b) => {
            let valA = a[key] ?? '';
            let valB = b[key] ?? '';

            if (key === 'appliedQuantity') {
                valA = Number(valA);
                valB = Number(valB);
                return sortAscNotAllotted ? valA - valB : valB - valA;
            }

            return sortAscNotAllotted
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });
    }

    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPageNotAllotted));
    currentPageNotAllotted = Math.min(currentPageNotAllotted, totalPages);
    const startIndex = (currentPageNotAllotted - 1) * rowsPerPageNotAllotted;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPageNotAllotted);

    const tbody = document.getElementById('notAllote-Body');
    if (!tbody) return;

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">No matching records found.</td></tr>`;
        document.getElementById('notAllottedPageInfo').textContent = `Page 0 of ${totalPages}`;
        return;
    }

    tbody.innerHTML = paginatedData.map(item => `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="text-center py-2 px-4">${item.symbol || ''}</td>
            <td class="text-center py-2 px-4">${item.applicationNo || ''}</td>
            <td class="text-center py-2 px-4">${item.pan || ''}</td>
            <td class="text-center py-2 px-4">${item.clientId || ''}</td>
            <td class="text-center py-2 px-4">${item.appliedQuantity || ''}</td>
        </tr>
    `).join('');

    document.getElementById('notAllottedPageInfo').textContent = `Page ${currentPageNotAllotted} of ${totalPages}`;
}

function sortNotAllotted(colIndex) {
    if (sortColumnNotAllotted === colIndex) {
        sortAscNotAllotted = !sortAscNotAllotted;
    } else {
        sortColumnNotAllotted = colIndex;
        sortAscNotAllotted = true;
    }
    renderNotAllottedTable();
}

function filternotAllottedSearch() {
    currentPageNotAllotted = 1;
    renderNotAllottedTable();
}

function selectNotAllottedPage() {
    const searchText = (document.getElementById('NotAllottedSearchPage')?.value || '').toLowerCase().trim();
    const filters = getNotAllottedFilters();
    const filteredData = filterNotAllottedData(dataNotAllotted, filters);
    const startIndex = (currentPageNotAllotted - 1) * rowsPerPageNotAllotted;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPageNotAllotted);

    const matchedData = paginatedData.filter(item =>
        Object.values(item).some(val => String(val || '').toLowerCase().includes(searchText))
    );

    const tbody = document.getElementById('notAllote-Body');
    if (!tbody) return;

    if (matchedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">No matching record found on this page.</td></tr>`;
        return;
    }

    tbody.innerHTML = matchedData.map(item => `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="text-center py-2 px-4">${item.symbol || ''}</td>
            <td class="text-center py-2 px-4">${item.applicationNo || ''}</td>
            <td class="text-center py-2 px-4">${item.pan || ''}</td>
            <td class="text-center py-2 px-4">${item.clientId || ''}</td>
            <td class="text-center py-2 px-4">${item.appliedQuantity || ''}</td>
        </tr>
    `).join('');

    const pageInfo = document.getElementById('notAllottedPageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Search result on page ${currentPageNotAllotted}`;
    }
}

function prevnotAllottedPage() {
    if (currentPageNotAllotted > 1) {
        currentPageNotAllotted--;
        renderNotAllottedTable();
    }
}

function nextnotAllottedPage() {
    const totalPages = Math.ceil(filterNotAllottedData(dataNotAllotted, getNotAllottedFilters()).length / rowsPerPageNotAllotted);
    if (currentPageNotAllotted < totalPages) {
        currentPageNotAllotted++;
        renderNotAllottedTable();
    }
}

function setnotAllottedRowsPerPage() {
    const val = parseInt(document.getElementById('notAllottedRowsPerPage')?.value);
    if (!isNaN(val)) {
        rowsPerPageNotAllotted = val;
        currentPageNotAllotted = 1;
        renderNotAllottedTable();
    }
}

// Auto-uppercase inputs
['NotAllottedSearchPage', 'notAllottedSymbolSearch', 'notAllottedClientId', 'notAllottedPanSearch', 'notAllottedAppNoSearch'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();
        });
    }
});
