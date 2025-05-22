function searchClient() {

    document.getElementById('errorMessage').classList.add('hidden');


    const clientSearch = document.getElementById('search-client').value.trim();

    if (clientSearch === '') {
        alert('Enter details');
        return;
    }

    fetch('https://ipo.acumengroup.in/newAdminIpo/php/client-details.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'searchValue=' + encodeURIComponent(clientSearch)
    })
        .then(res => res.json())
        .then(json => {
            if (json.data) {
                const client = json.data[0];

                const clientTab = document.getElementById('client-details');
                clientTab.classList.remove('hidden');
                clientTab.classList.add('block');

                setTimeout(function () {
                    document.getElementById('clientName').innerText = client.clientName || '-';
                    document.getElementById('mobileNo').innerText = client.mobile || '-';
                    document.getElementById('email').innerText = client.email || '-';
                    document.getElementById('pan').innerText = client.panNumber || '-';
                    document.getElementById('depositoryName').innerText = client.depository || '-';
                    document.getElementById('bankAC').innerText = client.bankAccNumber || '-';
                    document.getElementById('ifsc').innerText = (client.ifsc || '-').trim();

                    document.getElementById('city').innerText = client.city || '-';
                    document.getElementById('state').innerText = client.state || '-';
                    document.getElementById('resAddress').innerText =
                        [client.residenceAdd1, client.residenceAdd2, client.residenceAdd3];
                }, 300)


            } else {
                document.getElementById('errorMessage').classList.remove('hidden');

            }
        })
        .catch(error => {
            console.error('Error fetching client data:', error);
            document.getElementById('errorMessage').classList.remove('hidden');
        });

}


function emptyVAlue() {
    document.getElementById('search-client').value = '';
    const clientTab = document.getElementById('client-details');
    clientTab.classList.remove('block');
    clientTab.classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');

}


