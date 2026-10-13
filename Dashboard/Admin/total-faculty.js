/* =========================================================
   CAMPUSCONNECT
   TOTAL FACULTY
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        statistics:
            "/admin/faculty/statistics",

        recentFaculty:
            "/admin/faculty/recent",

        searchFaculty:
            "/admin/faculty/search"

    }

};


/* =========================================================
   DOM
========================================================= */

const totalFaculty =
    document.getElementById("totalFaculty");

const totalStatus =
    document.getElementById("totalStatus");

const departmentCount =
    document.getElementById("departmentCount");

const designationCount =
    document.getElementById("designationCount");

const employmentCount =
    document.getElementById("employmentCount");

const sessionCount =
    document.getElementById("sessionCount");

const detailsPanel =
    document.getElementById("detailsPanel");

const detailsTitle =
    document.getElementById("detailsTitle");

const detailsBody =
    document.getElementById("detailsBody");

const closeDetails =
    document.getElementById("closeDetails");

const recordsCard =
    document.querySelector(".records-card");

const recordsToggle =
    document.getElementById("recordsToggle");

const refreshButton =
    document.getElementById("refreshButton");

const backButton =
    document.getElementById("backButton");

const facultySearch =
    document.getElementById("facultySearch");

const searchButton =
    document.getElementById("searchButton");

const searchResults =
    document.getElementById("searchResults");

const viewFaculty =
    document.getElementById("viewFaculty");

const addFaculty =
    document.getElementById("addFaculty");

const exportFaculty =
    document.getElementById("exportFaculty");


/* =========================================================
   STATE
========================================================= */

let currentSection =
    "departments";


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEvents();

        loadFacultyStatistics();

    }
);


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* ---------------------------------------------
       BACK BUTTON
    --------------------------------------------- */

    backButton.addEventListener(
        "click",
        () => {

            if (window.history.length > 1) {

                window.history.back();

            } else {

                window.location.href =
                    "admin-dashboard.html";

            }

        }
    );


    /* ---------------------------------------------
       REFRESH
    --------------------------------------------- */

    refreshButton.addEventListener(
        "click",
        () => {

            refreshButton.style.transform =
                "rotate(180deg)";

            setTimeout(
                () => {

                    window.location.reload();

                },
                250
            );

        }
    );


    /* ---------------------------------------------
       STATISTICS CARDS
    --------------------------------------------- */

    document
        .querySelectorAll(".stat-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const section =
                        card.dataset.section;

                    openDetails(section);

                }
            );

        });


    /* ---------------------------------------------
       DETAIL TABS
    --------------------------------------------- */

    document
        .querySelectorAll(".details-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    const section =
                        tab.dataset.tab;

                    currentSection =
                        section;

                    activateTab(section);

                    renderDetails(section);

                }
            );

        });


    /* ---------------------------------------------
       CLOSE DETAILS
    --------------------------------------------- */

    closeDetails.addEventListener(
        "click",
        () => {

            detailsPanel.classList.remove(
                "visible"
            );

        }
    );


    /* ---------------------------------------------
       RECENT RECORDS
    --------------------------------------------- */

    recordsToggle.addEventListener(
        "click",
        () => {

            recordsCard.classList.toggle(
                "open"
            );

            if (
                recordsCard.classList.contains(
                    "open"
                )
            ) {

                loadRecentFaculty();

            }

        }
    );


    /* ---------------------------------------------
       SEARCH
    --------------------------------------------- */

    searchButton.addEventListener(
        "click",
        searchFacultyRecords
    );


    facultySearch.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                searchFacultyRecords();

            }

        }
    );


    /* ---------------------------------------------
       VIEW ALL FACULTY
    --------------------------------------------- */

    viewFaculty.addEventListener(
        "click",
        () => {

            window.location.href =
                "faculty-management.html";

        }
    );


    /* ---------------------------------------------
       ADD FACULTY
    --------------------------------------------- */

    addFaculty.addEventListener(
        "click",
        () => {

            window.location.href =
                "add-faculty.html";

        }
    );


    /* ---------------------------------------------
       EXPORT FACULTY
    --------------------------------------------- */

    exportFaculty.addEventListener(
        "click",
        () => {

            window.location.href =
                "export-faculty-data.html";

        }
    );

}


/* =========================================================
   OPEN DETAILS
========================================================= */

function openDetails(section) {

    currentSection =
        section;

    activateTab(section);

    renderDetails(section);

    detailsPanel.classList.add(
        "visible"
    );


    setTimeout(
        () => {

            detailsPanel.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        },
        50
    );

}


/* =========================================================
   ACTIVATE TAB
========================================================= */

function activateTab(section) {

    document
        .querySelectorAll(".details-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.tab === section
            );

        });

}


/* =========================================================
   RENDER DETAILS
========================================================= */

function renderDetails(section) {

    const titles = {

        departments:
            "Department Distribution",

        designations:
            "Designation Distribution",

        employment:
            "Employment Status",

        sessions:
            "Academic Session Distribution"

    };


    const messages = {

        departments:
            "Department-wise faculty records will appear here after database integration.",

        designations:
            "Designation-wise faculty records will appear here after database integration.",

        employment:
            "Employment-status records will appear here after database integration.",

        sessions:
            "Academic-session faculty records will appear here after database integration."

    };


    detailsTitle.textContent =
        titles[section] ||
        "Faculty Distribution";


    detailsBody.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                <i class="fa-solid fa-chart-column"></i>
            </div>

            <h3>
                Awaiting database data
            </h3>

            <p>
                ${messages[section]}
            </p>

        </div>

    `;

}


/* =========================================================
   LOAD STATISTICS
========================================================= */

async function loadFacultyStatistics() {

    /*
     * No application data is invented
     * before the Java backend is connected.
     */

    if (!CONFIG.API_BASE_URL) {

        showWaitingState();

        return;

    }


    try {

        const response = await fetch(

            CONFIG.API_BASE_URL +
            CONFIG.ENDPOINTS.statistics,

            {

                method: "GET",

                headers: {

                    "Accept":
                        "application/json"

                }

            }

        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        updateStatistics(data);


    } catch (error) {

        console.error(
            "Faculty statistics error:",
            error
        );

        showWaitingState();

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics(data) {

    if (!data) {

        showWaitingState();

        return;

    }


    if (
        data.totalFaculty !==
        undefined
    ) {

        totalFaculty.textContent =
            formatNumber(
                data.totalFaculty
            );

        totalStatus.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            Live database data
        `;

    }


    if (
        data.departmentCount !==
        undefined
    ) {

        departmentCount.textContent =
            formatNumber(
                data.departmentCount
            );

    }


    if (
        data.designationCount !==
        undefined
    ) {

        designationCount.textContent =
            formatNumber(
                data.designationCount
            );

    }


    if (
        data.employmentCount !==
        undefined
    ) {

        employmentCount.textContent =
            formatNumber(
                data.employmentCount
            );

    }


    if (
        data.sessionCount !==
        undefined
    ) {

        sessionCount.textContent =
            formatNumber(
                data.sessionCount
            );

    }

}


/* =========================================================
   WAITING STATE
========================================================= */

function showWaitingState() {

    totalFaculty.textContent =
        "—";

    departmentCount.textContent =
        "—";

    designationCount.textContent =
        "—";

    employmentCount.textContent =
        "—";

    sessionCount.textContent =
        "—";


    totalStatus.innerHTML = `
        <i class="fa-solid fa-database"></i>
        Awaiting database data
    `;

}


/* =========================================================
   RECENT FACULTY
========================================================= */

async function loadRecentFaculty() {

    if (!CONFIG.API_BASE_URL) {

        return;

    }


    try {

        const response = await fetch(

            CONFIG.API_BASE_URL +
            CONFIG.ENDPOINTS.recentFaculty,

            {

                method: "GET",

                headers: {

                    "Accept":
                        "application/json"

                }

            }

        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const faculty =
            await response.json();


        renderRecentFaculty(
            faculty
        );


    } catch (error) {

        console.error(
            "Recent faculty error:",
            error
        );

    }

}


/* =========================================================
   RENDER RECENT FACULTY
========================================================= */

function renderRecentFaculty(faculty) {

    const recordsContent =
        document.getElementById(
            "recordsContent"
        );


    if (
        !Array.isArray(faculty) ||
        faculty.length === 0
    ) {

        return;

    }


    recordsContent.innerHTML = `

        <div class="records-empty">

            <div class="records-empty-icon">
                <i class="fa-solid fa-database"></i>
            </div>

            <h3>
                Database records received
            </h3>

            <p>
                ${faculty.length}
                faculty record(s) received from the backend.
            </p>

        </div>

    `;

}


/* =========================================================
   SEARCH FACULTY
========================================================= */

async function searchFacultyRecords() {

    const query =
        facultySearch.value.trim();


    if (!query) {

        searchResults.classList.remove(
            "visible"
        );

        return;

    }


    searchResults.classList.add(
        "visible"
    );


    if (!CONFIG.API_BASE_URL) {

        searchResults.innerHTML = `

            <div class="search-empty">

                <i class="fa-solid fa-database"></i>

                <span>
                    Faculty search will be available
                    after database integration.
                </span>

            </div>

        `;

        return;

    }


    try {

        const response = await fetch(

            CONFIG.API_BASE_URL +
            CONFIG.ENDPOINTS.searchFaculty +
            "?q=" +
            encodeURIComponent(query),

            {

                method: "GET",

                headers: {

                    "Accept":
                        "application/json"

                }

            }

        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        renderSearchResults(data);


    } catch (error) {

        console.error(
            "Faculty search error:",
            error
        );

    }

}


/* =========================================================
   SEARCH RESULTS
========================================================= */

function renderSearchResults(data) {

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        searchResults.innerHTML = `

            <div class="search-empty">

                <i class="fa-solid fa-user-slash"></i>

                <span>
                    No matching faculty records found.
                </span>

            </div>

        `;

        return;

    }


    searchResults.innerHTML = `

        <div class="search-empty">

            <i class="fa-solid fa-circle-check"></i>

            <span>
                ${data.length}
                matching faculty record(s) found.
            </span>

        </div>

    `;

}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "—";

    }


    const number =
        Number(value);


    if (Number.isNaN(number)) {

        return value;

    }


    return number.toLocaleString(
        "en-IN"
    );

}