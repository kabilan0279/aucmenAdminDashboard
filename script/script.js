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
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page") || "content/client-details.html";
    loadPage(page);

    document.querySelectorAll(".load-page").forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const url = this.getAttribute("href");
            loadPage(url, true, this); // pass clicked link
        });
    });

    // Handle back/forward button navigation
    window.addEventListener("popstate", function () {
        const params = new URLSearchParams(window.location.search);
        const page = params.get("page") || "content/client-details.html";
        loadPage(page); // load content when URL changes
    });
});

// Single clean loadPage function
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
                window.location.reload()
                history.pushState(null, "", newUrl);
            }

            highlightActiveLink(clickedLink);
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.querySelector(".page-Content").innerHTML = "<p>Error loading content.</p>";
        });
}

// Optional: visually mark the active link
function highlightActiveLink(clickedLink) {
    document.querySelectorAll(".load-page").forEach(link => link.classList.remove("active"));
    if (clickedLink) {
        clickedLink.classList.add("active");
    }
}

function highlightActiveLink(activeLink) {
    const menuLinks = document.querySelectorAll(".load-page");

    menuLinks.forEach(link => {
        // Reset to default
        link.classList.remove("bg-slate-500", "text-white");
        link.classList.add("text-slate-800", "hover:bg-slate-400", "hover:text-white");

        const icon = link.querySelector("svg");
        if (icon) {
            icon.classList.remove("text-white");
            icon.classList.add("text-slate-400", "group-hover:text-white");
        }
    });

    if (activeLink) {
        // Apply active styles
        activeLink.classList.add("bg-slate-500", "text-white");
        activeLink.classList.remove("text-slate-800", "hover:bg-slate-400", "hover:text-white");

        const icon = activeLink.querySelector("svg");
        if (icon) {
            icon.classList.remove("text-slate-400", "group-hover:text-white");
            icon.classList.add("text-white");
        }
    }
}


document.querySelectorAll(".load-page").forEach(link => {
    link.addEventListener("click", function () {
        document.getElementById('mobileSidebar').style.display = 'none';

    });
});


// document.getElementById('closeSidebar').addEventListener('click', function () {
//     document.getElementById('mobileSidebar').style.display = 'none';
// });



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

