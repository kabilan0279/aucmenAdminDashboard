let dataOpen = [];
let currentPageOpen = 1;
let rowsPerPageOpen = 25;
let sortDirectionOpen = [true, true, true, true, true, true]; // for 6 columns

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/openIpo.json')
        .then(res => res.json())
        .then(json => {
            dataOpen = json;
            setTimeout(renderOpenTable, 300);
        })
        .catch(err => {
            const tbody = document.getElementById('OpenTBody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error loading data: ${err.message}</td></tr>`;
            }
        });
});



function SelectPageopen() {
    const searchValue = document.getElementById('openSearchPage').value.trim().toUpperCase();
    currentPageOpen = 1;
    renderOpenTable(searchValue);
}

function setopenRowsPerPage() {
    const rowsInput = document.getElementById('openRowsPerPage');
    if (rowsInput) {
        rowsPerPageOpen = parseInt(rowsInput.value);
        currentPageOpen = 1;
        renderOpenTable();
    }
}

function prevopenPage() {
    if (currentPageOpen > 1) {
        currentPageOpen--;
        renderOpenTable();
    }
}

function nextopenPage() {
    const totalPages = Math.ceil(filteredOpenData().length / rowsPerPageOpen);
    if (currentPageOpen < totalPages) {
        currentPageOpen++;
        renderOpenTable();
    }
}

function sortOpen(columnIndex) {
    const keys = ['name', 'issuePrice', 'issueSizeCrores', 'lotSize', 'openDate', 'closeDate'];
    const key = keys[columnIndex];
    const direction = sortDirectionOpen[columnIndex] ? 1 : -1;

    dataOpen.sort((a, b) => {
        const valA = (a[key] || '').toString().toUpperCase();
        const valB = (b[key] || '').toString().toUpperCase();
        return valA > valB ? direction : valA < valB ? -direction : 0;
    });

    sortDirectionOpen[columnIndex] = !sortDirectionOpen[columnIndex];
    renderOpenTable();
}

function filteredOpenData(searchTerm = '') {
    return dataOpen.filter(row => {
        const matchesSearch = !searchTerm || Object.values(row).some(val =>
            val?.toString().toUpperCase().includes(searchTerm)
        );
        return matchesSearch;
    });
}

function renderOpenTable(searchTerm = '') {
    const tbody = document.getElementById('openTBody');
    if (!tbody) return;

    const filteredData = filteredOpenData(searchTerm);
    const start = (currentPageOpen - 1) * rowsPerPageOpen;
    const paginatedData = filteredData.slice(start, start + rowsPerPageOpen);

    tbody.innerHTML = '';

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">No results found</td></tr>`;
        document.getElementById('pageInfoopen').textContent = '';
        return;
    }

    paginatedData.forEach(row => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 text-center">
                <td class="px-2 py-2">${row.name || '-'}</td>
                <td class="px-2 py-2">${row.issuePrice || '-'}</td>
                <td class="px-2 py-2">${row.issueSizeCrores || '-'}</td>
                <td class="px-2 py-2">${row.lotSize || '-'}</td>
                <td class="px-2 py-2">${row.openDate || '-'}</td>
                <td class="px-2 py-2">${row.closeDate || '-'}</td>
            </tr>`;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPageOpen);
    document.getElementById('pageInfoopen').textContent = `Page ${currentPageOpen} of ${totalPages}`;
}
