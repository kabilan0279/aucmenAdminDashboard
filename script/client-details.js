document.addEventListener('DOMContentLoaded', () => {
    fetch('https://ipo.acumengroup.in/newAdmin/client-details.php')
        .then(res => res.json())
        .then(json => {
            dataClog = json;

        })
        .catch(err => {
            console.log('errorShowing');
        });
});


function searchClient(){
    clientSearch = document.getElementById('')
}