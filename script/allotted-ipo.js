let dataAllotted = [];
let currentPageAllotted = 1;
let rowsPerPageAllotted = 25;
let sortDirectionAllotted = [true, true, true, true, true, true]; // for 6 columns

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/allotted.json')
        .then(res => res.json())
        .then(json => {
            dataAllotted = json;
            setTimeout(renderAllottedTable, 300);
        })
        .catch(err => {
            const tbody = document.getElementById('AllottedTBody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error loading data: ${err.message}</td></tr>`;
            }
        });
});

function getAllottedFilters() {
    return {
        clientId: document.getElementById('AllottedClientId')?.value.trim().toUpperCase() || '',
        symbol: document.getElementById('AllottedSymbolSearch')?.value.trim().toUpperCase() || '',
        pan: document.getElementById('AllottedPanSearch')?.value.trim().toUpperCase() || '',
        appNo: document.getElementById('AllottedAppNoSearch')?.value.trim().toUpperCase() || '',
    };
}

function filterAllottedSearch() {
    currentPageAllotted = 1;
    renderAllottedTable();
}

function renderAllottedTable() {
    const { clientId, symbol, pan, appNo } = getAllottedFilters();
    let filteredData = dataAllotted.filter(row =>
        (!clientId || row.clientId?.toUpperCase().includes(clientId)) &&
        (!symbol || row.symbol?.toUpperCase().includes(symbol)) &&
        (!pan || row.pan?.toUpperCase().includes(pan)) &&
        (!appNo || String(row.applicationNo)?.toUpperCase().includes(appNo))
    );

    const start = (currentPageAllotted - 1) * rowsPerPageAllotted;
    const end = start + rowsPerPageAllotted;
    const paginatedData = filteredData.slice(start, end);

    const tbody = document.getElementById('AllottedTBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">No results found</td></tr>`;
        document.getElementById('pageInfoAllotted').textContent = '';
        return;
    }

    paginatedData.forEach(row => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 text-center">
                <td class="px-2 py-2">${row.symbol}</td>
                <td class="px-2 py-2">${row.applicationNo}</td>
                <td class="px-2 py-2">${row.pan}</td>
                <td class="px-2 py-2">${row.clientId}</td>
                <td class="px-2 py-2">${row.appliedQuantity}</td>
                <td class="px-2 py-2">${row.allottedQuantity}</td>
            </tr>`;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPageAllotted);
    const pageInfo = document.getElementById('pageInfoAllotted');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPageAllotted} of ${totalPages}`;
    }
}

function setAllottedRowsPerPage() {
    const rowsInput = document.getElementById('AllottedRowsPerPage');
    if (rowsInput) {
        rowsPerPageAllotted = parseInt(rowsInput.value);
        currentPageAllotted = 1;
        renderAllottedTable();
    }
}

function prevAllottedPage() {
    if (currentPageAllotted > 1) {
        currentPageAllotted--;
        renderAllottedTable();
    }
}

function nextAllottedPage() {
    const { clientId, symbol, pan, appNo } = getAllottedFilters();
    const filteredData = dataAllotted.filter(row =>
        (!clientId || row.clientId?.toUpperCase().includes(clientId)) &&
        (!symbol || row.symbol?.toUpperCase().includes(symbol)) &&
        (!pan || row.pan?.toUpperCase().includes(pan)) &&
        (!appNo || String(row.applicationNo)?.toUpperCase().includes(appNo))
    );
    const totalPages = Math.ceil(filteredData.length / rowsPerPageAllotted);

    if (currentPageAllotted < totalPages) {
        currentPageAllotted++;
        renderAllottedTable();
    }
}

function SelectPageAllotted() {
    const query = document.getElementById('AllottedSearchPage')?.value.trim().toUpperCase() || '';
    const start = (currentPageAllotted - 1) * rowsPerPageAllotted;
    const end = start + rowsPerPageAllotted;

    const filteredData = dataAllotted.slice(start, end).filter(row =>
        (row.symbol || '').toUpperCase().includes(query) ||
        (row.applicationNo || '').toString().toUpperCase().includes(query) ||
        (row.pan || '').toUpperCase().includes(query) ||
        (row.clientId || '').toUpperCase().includes(query)
    );

    const tbody = document.getElementById('AllottedTBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">No matching data on this page</td></tr>`;
        return;
    }

    filteredData.forEach(row => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 text-center">
                <td class="px-2 py-2">${row.symbol}</td>
                <td class="px-2 py-2">${row.applicationNo}</td>
                <td class="px-2 py-2">${row.pan}</td>
                <td class="px-2 py-2">${row.clientId}</td>
                <td class="px-2 py-2">${row.appliedQuantity}</td>
                <td class="px-2 py-2">${row.allottedQuantity}</td>
            </tr>`;
    });
}

function sortAllotted(columnIndex) {
    const keys = ['symbol', 'applicationNo', 'pan', 'clientId', 'appliedQuantity', 'allottedQuantity'];
    const key = keys[columnIndex];

    dataAllotted.sort((a, b) => {
        const dir = sortDirectionAllotted[columnIndex] ? 1 : -1;
        const valA = (a[key] || '').toString().toUpperCase();
        const valB = (b[key] || '').toString().toUpperCase();
        return valA > valB ? dir : valA < valB ? -dir : 0;
    });

    sortDirectionAllotted[columnIndex] = !sortDirectionAllotted[columnIndex];
    renderAllottedTable();
}
