document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('closeSidebar').addEventListener('click', function () {
        document.getElementById('mobileSidebar').style.display = 'none';
    });

    document.getElementById('mobile-menu-button').addEventListener('click', function () {
        const sidebar = document.getElementById('mobileSidebar');
        sidebar.style.display = (sidebar.style.display === 'none' || sidebar.style.display === '') ? 'block' : 'none';
    });

    const menuButton = document.getElementById('user-menu-button');
    const dropdown = document.getElementById('userDropdown');
    menuButton.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
        if (!menuButton.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });

    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get("page") || "content/client-details.html";
    loadPage(initialPage, false);

    document.querySelectorAll(".load-page").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const url = this.getAttribute("href");
            loadPage(url, true);
            document.getElementById('mobileSidebar').style.display = 'none';
        });
    });

    window.addEventListener("popstate", function () {
        const params = new URLSearchParams(window.location.search);
        const page = params.get("page") || "content/client-details.html";
        loadPage(page, false);
    });
});

function loadPage(url, updateUrl = false) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(data => {
            document.querySelector(".page-Content").innerHTML = data;
            if (updateUrl) {
                const newUrl = `${window.location.pathname}?page=${url}`;
                history.pushState(null, "", newUrl);
                window.location.reload()
            }
            highlightActiveLink(url);
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.querySelector(".page-Content").innerHTML = "<p>Error loading content.</p>";
        });
}

function highlightActiveLink(currentPage) {
    const menuLinks = document.querySelectorAll(".load-page");

    menuLinks.forEach(link => {
        const href = link.getAttribute("href");
        const isActive = href === currentPage;

        link.classList.toggle("bg-slate-500", isActive);
        link.classList.toggle("text-white", isActive);
        link.classList.toggle("text-slate-800", !isActive);
        link.classList.toggle("hover:bg-slate-400", !isActive);
        link.classList.toggle("hover:text-white", !isActive);

        const icon = link.querySelector("svg");
        if (icon) {
            icon.classList.toggle("text-white", isActive);
            icon.classList.toggle("text-slate-400", !isActive);
            icon.classList.toggle("group-hover:text-white", !isActive);
        }
    });
}
