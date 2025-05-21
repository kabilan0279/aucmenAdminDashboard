let dataupcoming = [];
let currentPageupcoming = 1;
let rowsPerPageupcoming = 25;
let sortDirectionupcoming = [true, true, true, true, true, true]; // for 6 columns

document.addEventListener('DOMContentLoaded', () => {
    fetch('json/upcoming-ipo.json')
        .then(res => res.json())
        .then(json => {
            dataupcoming = json;
            setTimeout(renderupcomingTable, 300);
        })
        .catch(err => {
            const tbody = document.getElementById('upcomingTBody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error loading data: ${err.message}</td></tr>`;
            }
        });
});



function SelectPageupcoming() {
    const searchValue = document.getElementById('upcomingSearchPage').value.trim().toUpperCase();
    currentPageupcoming = 1;
    renderupcomingTable(searchValue);
}

function setupcomingRowsPerPage() {
    const rowsInput = document.getElementById('upcomingRowsPerPage');
    if (rowsInput) {
        rowsPerPageupcoming = parseInt(rowsInput.value);
        currentPageupcoming = 1;
        renderupcomingTable();
    }
}

function prevupcomingPage() {
    if (currentPageupcoming > 1) {
        currentPageupcoming--;
        renderupcomingTable();
    }
}

function nextupcomingPage() {
    const totalPages = Math.ceil(filteredupcomingData().length / rowsPerPageupcoming);
    if (currentPageupcoming < totalPages) {
        currentPageupcoming++;
        renderupcomingTable();
    }
}

function sortupcoming(columnIndex) {
    const keys = ['name', 'issuePrice', 'issueSizeCrores', 'lotSize', 'openDate', 'closeDate'];
    const key = keys[columnIndex];
    const direction = sortDirectionupcoming[columnIndex] ? 1 : -1;

    dataupcoming.sort((a, b) => {
        const valA = (a[key] || '').toString().toUpperCase();
        const valB = (b[key] || '').toString().toUpperCase();
        return valA > valB ? direction : valA < valB ? -direction : 0;
    });

    sortDirectionupcoming[columnIndex] = !sortDirectionupcoming[columnIndex];
    renderupcomingTable();
}

function filteredupcomingData(searchTerm = '') {
    return dataupcoming.filter(row => {
        const matchesSearch = !searchTerm || Object.values(row).some(val =>
            val?.toString().toUpperCase().includes(searchTerm)
        );
        return matchesSearch;
    });
}

function renderupcomingTable(searchTerm = '') {
    const tbody = document.getElementById('upcomingTBody');
    if (!tbody) return;

    const filteredData = filteredupcomingData(searchTerm);
    const start = (currentPageupcoming - 1) * rowsPerPageupcoming;
    const paginatedData = filteredData.slice(start, start + rowsPerPageupcoming);

    tbody.innerHTML = '';

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">No results found</td></tr>`;
        document.getElementById('pageInfoupcoming').textContent = '';
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

    const totalPages = Math.ceil(filteredData.length / rowsPerPageupcoming);
    document.getElementById('pageInfoupcoming').textContent = `Page ${currentPageupcoming} of ${totalPages}`;
}
