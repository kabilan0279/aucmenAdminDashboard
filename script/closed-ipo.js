let dataclosed = [];
let currentPageclosed = 1;
let rowsPerPageclosed = 25;
let sortDirectionclosed = [true, true, true, true, true, true]; // for 6 columns

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/closed-ipo.json')
        .then(res => res.json())
        .then(json => {
            dataclosed = json;
            setTimeout(renderclosedTable, 300);
        })
        .catch(err => {
            const tbody = document.getElementById('closedTBody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error loading data: ${err.message}</td></tr>`;
            }
        });
});



function SelectPageclosed() {
    const searchValue = document.getElementById('closedSearchPage').value.trim().toUpperCase();
    currentPageclosed = 1;
    renderclosedTable(searchValue);
}

function setclosedRowsPerPage() {
    const rowsInput = document.getElementById('closedRowsPerPage');
    if (rowsInput) {
        rowsPerPageclosed = parseInt(rowsInput.value);
        currentPageclosed = 1;
        renderclosedTable();
    }
}

function prevclosedPage() {
    if (currentPageclosed > 1) {
        currentPageclosed--;
        renderclosedTable();
    }
}

function nextclosedPage() {
    const totalPages = Math.ceil(filteredclosedData().length / rowsPerPageclosed);
    if (currentPageclosed < totalPages) {
        currentPageclosed++;
        renderclosedTable();
    }
}

function sortclosed(columnIndex) {
    const keys = ['name', 'issuePrice', 'issueSizeCrores', 'lotSize', 'closedDate', 'closeDate'];
    const key = keys[columnIndex];
    const direction = sortDirectionclosed[columnIndex] ? 1 : -1;

    dataclosed.sort((a, b) => {
        const valA = (a[key] || '').toString().toUpperCase();
        const valB = (b[key] || '').toString().toUpperCase();
        return valA > valB ? direction : valA < valB ? -direction : 0;
    });

    sortDirectionclosed[columnIndex] = !sortDirectionclosed[columnIndex];
    renderclosedTable();
}

function filteredclosedData(searchTerm = '') {
    return dataclosed.filter(row => {
        const matchesSearch = !searchTerm || Object.values(row).some(val =>
            val?.toString().toUpperCase().includes(searchTerm)
        );
        return matchesSearch;
    });
}

function renderclosedTable(searchTerm = '') {
    const tbody = document.getElementById('closedTBody');
    if (!tbody) return;

    const filteredData = filteredclosedData(searchTerm);
    const start = (currentPageclosed - 1) * rowsPerPageclosed;
    const paginatedData = filteredData.slice(start, start + rowsPerPageclosed);

    tbody.innerHTML = '';

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">No results found</td></tr>`;
        document.getElementById('pageInfoclosed').textContent = '';
        return;
    }

    paginatedData.forEach(row => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 text-center">
                <td class="px-2 py-2">${row.name || '-'}</td>
                <td class="px-2 py-2">${row.issuePrice || '-'}</td>
                <td class="px-2 py-2">${row.issueSizeCrores || '-'}</td>
                <td class="px-2 py-2">${row.lotSize || '-'}</td>
                <td class="px-2 py-2">${row.closedDate || '-'}</td>
                <td class="px-2 py-2">${row.closeDate || '-'}</td>
            </tr>`;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPageclosed);
    document.getElementById('pageInfoclosed').textContent = `Page ${currentPageclosed} of ${totalPages}`;
}
