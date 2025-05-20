let dataNotAllotted = [];
let currentPageNotAllotted = 1;
let rowsPerPageNotAllotted = 15;
let sortDirectionNotAllotted = [true, true, true, true, true]; // Ascending by default for 5 columns

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/not-allotted.json')
        .then(res => res.json())
        .then(json => {
            dataNotAllotted = json;
            setTimeout(function () {
                renderNotAllottedTable();
            }, 300);

        })
        .catch(err => {
            document.getElementById('notAlloteBody').innerHTML = `
                <tr><td colspan="5" class="text-center p-4 text-red-500">Error loading data: ${err.message}</td></tr>`;
        });
});

function getNotAllottedFilters() {
    return {
        clientId: document.getElementById('notAllottedClientId')?.value.trim().toUpperCase() || '',
        symbol: document.getElementById('notAllottedSymbolSearch')?.value.trim().toUpperCase() || '',
        pan: document.getElementById('notAllottedPanSearch')?.value.trim().toUpperCase() || '',
        appNo: document.getElementById('notAllottedAppNoSearch')?.value.trim().toUpperCase() || '',
    };
}

function filternotAllottedSearch() {
    currentPageNotAllotted = 1;
    renderNotAllottedTable();
}
function renderNotAllottedTable() {
    const { clientId, symbol, pan, appNo } = getNotAllottedFilters();

    let filteredData = dataNotAllotted.filter(row =>
        (!clientId || row.clientId.toUpperCase().includes(clientId)) &&
        (!symbol || row.symbol.toUpperCase().includes(symbol)) &&
        (!pan || row.pan.toUpperCase().includes(pan)) &&
        (!appNo || String(row.applicationNo).toUpperCase().includes(appNo))
    );

    const start = (currentPageNotAllotted - 1) * rowsPerPageNotAllotted;
    const end = start + rowsPerPageNotAllotted;
    const paginatedData = filteredData.slice(start, end);

    const tbody = document.getElementById('notAlloteBody');
    if (!tbody) {
        console.error("Element with id 'notAlloteBody' not found!");
        return;
    }

    // Clear previous rows
    tbody.innerHTML = '';

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 py-4">No results found</td></tr>`;
        const pageInfo = document.getElementById('notAllottedPageInfo');
        if (pageInfo) pageInfo.textContent = '';
        return;
    }

    // Append rows
    paginatedData.forEach(row => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 text-center">
                <td class="px-2 py-2">${row.symbol}</td>
                <td class="px-2 py-2">${row.applicationNo}</td>
                <td class="px-2 py-2">${row.pan}</td>
                <td class="px-2 py-2">${row.clientId}</td>
                <td class="px-2 py-2">${row.appliedQuantity}</td>
            </tr>`;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPageNotAllotted);
    const pageInfo = document.getElementById('notAllottedPageInfo');
    if (pageInfo) pageInfo.textContent = `Page ${currentPageNotAllotted} of ${totalPages}`;
}



function setnotAllottedRowsPerPage() {
    rowsPerPageNotAllotted = parseInt(document.getElementById('notAllottedRowsPerPage').value);
    currentPageNotAllotted = 1;
    renderNotAllottedTable();
}

function prevnotAllottedPage() {
    if (currentPageNotAllotted > 1) {
        currentPageNotAllotted--;
        renderNotAllottedTable();
    }
}

function nextnotAllottedPage() {
    const { clientId, symbol, pan, appNo } = getNotAllottedFilters();
    const filteredData = dataNotAllotted.filter(row =>
        (!clientId || row.clientId.toUpperCase().includes(clientId)) &&
        (!symbol || row.symbol.toUpperCase().includes(symbol)) &&
        (!pan || row.pan.toUpperCase().includes(pan)) &&
        (!appNo || row.appNo.tolowerCase().includes(appNo))
    );
    const totalPages = Math.ceil(filteredData.length / rowsPerPageNotAllotted);

    if (currentPageNotAllotted < totalPages) {
        currentPageNotAllotted++;
        renderNotAllottedTable();
    }
}

function selectNotAllottedPage() {
    const query = document.getElementById('NotAllottedSearchPage')?.value.trim().toUpperCase() || '';
    const start = (currentPageNotAllotted - 1) * rowsPerPageNotAllotted;
    const end = start + rowsPerPageNotAllotted;

    const filteredData = dataNotAllotted.slice(start, end).filter(row =>
    (row.symbol || '').toUpperCase().includes(query) ||
    (row.applicationNo || '').toString().toUpperCase().includes(query) ||
    (row.pan || '').toUpperCase().includes(query) ||
    (row.clientId || '').toUpperCase().includes(query)
);


    const tbody = document.getElementById('notAlloteBody');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 py-4">No matching data on this page</td></tr>`;
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
            </tr>`;
    });
}

function sortNotAllotted(columnIndex) {
    const keys = ['symbol', 'appNo', 'pan', 'clientId', 'appliedQty'];
    const key = keys[columnIndex];

    dataNotAllotted.sort((a, b) => {
        const dir = sortDirectionNotAllotted[columnIndex] ? 1 : -1;
        const valA = a[key].toUpperCase ? a[key].toUpperCase() : a[key];
        const valB = b[key].toUpperCase ? b[key].toUpperCase() : b[key];
        return valA > valB ? dir : valA < valB ? -dir : 0;
    });

    sortDirectionNotAllotted[columnIndex] = !sortDirectionNotAllotted[columnIndex];
    renderNotAllottedTable();
}
