document.getElementById('closeSidebar').addEventListener('click', function () {
    document.getElementById('mobileSidebar').style.display = 'none';
});

document.getElementById('mobile-menu-button').addEventListener('click', function () {
    var sidebar = document.getElementById('mobileSidebar');
    if (sidebar.style.display === 'none' || sidebar.style.display === '') {
        sidebar.style.display = 'block';
    } else {
        sidebar.style.display = 'none';
    }
}
);

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
document.addEventListener("DOMContentLoaded", function () {
    // Get page from URL query string or default to client-details.html
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page") || "content/client-details.html";

    loadPage(page);

    // Attach event listener to all .load-page links
    document.querySelectorAll(".load-page").forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const url = this.getAttribute("href");
            loadPage(url, true); // true = update URL
        });
    });
});

// Function to fetch and load page content
function loadPage(url, updateUrl = false) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(data => {
            document.querySelector(".page-Content").innerHTML = data;
            window.url = url; // Set global variable
            if (updateUrl) {
                // Update the URL query string without reloading the page
                const newUrl = `${window.location.pathname}?page=${encodeURIComponent(url)}`;
                history.pushState(null, "", newUrl);
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.querySelector(".page-Content").innerHTML = "<p>Error loading content.</p>";
        });
}




// Function to fetch and load page content
function loadPage(url, updateUrl = false, clickedLink = null) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(data => {
            document.querySelector(".page-Content").innerHTML = data;
            window.url = url;

            if (updateUrl) {
                const newUrl = `${window.location.pathname}?page=${encodeURIComponent(url)}`;
                history.pushState(null, "", newUrl);
            }

            // Highlight active menu link
            highlightActiveLink(clickedLink);
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.querySelector(".page-Content").innerHTML = "<p>Error loading content.</p>";
        });
}

// Function to highlight the clicked menu item
function highlightActiveLink(activeLink) {
    const menuLinks = document.querySelectorAll(".load-page");

    menuLinks.forEach(link => {
        link.classList.remove("bg-indigo-700", "text-white");
        link.classList.add("text-indigo-200", "hover:bg-indigo-700", "hover:text-white");

        const icon = link.querySelector("svg");
        if (icon) {
            icon.classList.remove("text-white");
            icon.classList.add("text-indigo-200", "group-hover:text-white");
        }
    });

    if (activeLink) {
        activeLink.classList.add("bg-indigo-700", "text-white");
        activeLink.classList.remove("text-indigo-200", "hover:bg-indigo-700", "hover:text-white");

        const icon = activeLink.querySelector("svg");
        if (icon) {
            icon.classList.remove("text-indigo-200", "group-hover:text-white");
            icon.classList.add("text-white");
        }
    }
}

// Add event listeners to menu items after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".load-page").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const url = this.getAttribute("href");
            loadPage(url, true, this);
        });
    });

    // Load default or bookmarked page on initial load
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    if (page) {
        // Try to find a matching link to highlight
        const activeLink = Array.from(document.querySelectorAll(".load-page"))
            .find(link => link.getAttribute("href") === page);
        loadPage(page, false, activeLink);
    }
});



// uploaded files

