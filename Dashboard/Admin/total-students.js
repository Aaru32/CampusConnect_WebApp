/* =========================================================
   CAMPUSCONNECT
   STUDENT STATISTICS
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        statistics:
            "/admin/students/statistics",

        recentStudents:
            "/admin/students/recent",

        searchStudents:
            "/admin/students/search"

    }

};


/* =========================================================
   DOM
========================================================= */

const totalStudents =
    document.getElementById("totalStudents");

const totalStatus =
    document.getElementById("totalStatus");

const departmentCount =
    document.getElementById("departmentCount");

const semesterCount =
    document.getElementById("semesterCount");

const sessionCount =
    document.getElementById("sessionCount");

const enrollmentCount =
    document.getElementById("enrollmentCount");

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

const studentSearch =
    document.getElementById("studentSearch");

const searchButton =
    document.getElementById("searchButton");

const searchResults =
    document.getElementById("searchResults");

const viewStudents =
    document.getElementById("viewStudents");

const addStudent =
    document.getElementById("addStudent");

const exportStudents =
    document.getElementById("exportStudents");


/* =========================================================
   STATE
========================================================= */

let currentSection = "departments";


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEvents();

        loadStudentStatistics();

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
                recordsCard.classList.contains("open")
            ) {

                loadRecentStudents();

            }

        }
    );


    /* ---------------------------------------------
       SEARCH
    --------------------------------------------- */

    searchButton.addEventListener(
        "click",
        searchStudents
    );


    studentSearch.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                searchStudents();

            }

        }
    );


    /* ---------------------------------------------
       VIEW ALL STUDENTS
    --------------------------------------------- */

    viewStudents.addEventListener(
        "click",
        () => {

            window.location.href =
                "student-management.html";

        }
    );


    /* ---------------------------------------------
       ADD STUDENT
    --------------------------------------------- */

    addStudent.addEventListener(
        "click",
        () => {

            window.location.href =
                "add-student.html";

        }
    );


    /* ---------------------------------------------
       EXPORT
    --------------------------------------------- */

    exportStudents.addEventListener(
        "click",
        exportStudentData
    );

}


/* =========================================================
   OPEN DETAILS
========================================================= */

function openDetails(section) {

    currentSection = section;

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

        semesters:
            "Semester Distribution",

        sessions:
            "Academic Session Distribution",

        enrollment:
            "Enrollment Status"

    };


    const messages = {

        departments:
            "Department-wise student records will appear here after database integration.",

        semesters:
            "Semester-wise student records will appear here after database integration.",

        sessions:
            "Academic-session student records will appear here after database integration.",

        enrollment:
            "Enrollment-status records will appear here after database integration."

    };


    detailsTitle.textContent =
        titles[section] ||
        "Student Distribution";


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

async function loadStudentStatistics() {

    /*
     * Until the Java backend is connected,
     * no application data is invented.
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
            "Student statistics error:",
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
        data.totalStudents !==
        undefined
    ) {

        totalStudents.textContent =
            formatNumber(
                data.totalStudents
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
        data.semesterCount !==
        undefined
    ) {

        semesterCount.textContent =
            formatNumber(
                data.semesterCount
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


    if (
        data.enrollmentCount !==
        undefined
    ) {

        enrollmentCount.textContent =
            formatNumber(
                data.enrollmentCount
            );

    }

}


/* =========================================================
   WAITING STATE
========================================================= */

function showWaitingState() {

    totalStudents.textContent =
        "—";

    departmentCount.textContent =
        "—";

    semesterCount.textContent =
        "—";

    sessionCount.textContent =
        "—";

    enrollmentCount.textContent =
        "—";


    totalStatus.innerHTML = `
        <i class="fa-solid fa-database"></i>
        Awaiting database data
    `;

}


/* =========================================================
   RECENT STUDENTS
========================================================= */

async function loadRecentStudents() {

    if (!CONFIG.API_BASE_URL) {

        return;

    }


    try {

        const response = await fetch(

            CONFIG.API_BASE_URL +
            CONFIG.ENDPOINTS.recentStudents,

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


        const students =
            await response.json();


        renderRecentStudents(
            students
        );


    } catch (error) {

        console.error(
            "Recent students error:",
            error
        );

    }

}


/* =========================================================
   RENDER RECENT STUDENTS
========================================================= */

function renderRecentStudents(students) {

    const recordsContent =
        document.getElementById(
            "recordsContent"
        );


    if (
        !Array.isArray(students) ||
        students.length === 0
    ) {

        return;

    }


    /*
     * Backend records can be rendered here
     * once the final Java API response format
     * is decided.
     */

    recordsContent.innerHTML = `

        <div class="records-empty">

            <div class="records-empty-icon">
                <i class="fa-solid fa-database"></i>
            </div>

            <h3>
                Database records received
            </h3>

            <p>
                ${students.length}
                student record(s) received from the backend.
            </p>

        </div>

    `;

}


/* =========================================================
   SEARCH STUDENTS
========================================================= */

async function searchStudents() {

    const query =
        studentSearch.value.trim();


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
                    Student search will be available
                    after database integration.
                </span>

            </div>

        `;

        return;

    }


    try {

        const response = await fetch(

            CONFIG.API_BASE_URL +
            CONFIG.ENDPOINTS.searchStudents +
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
            "Student search error:",
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
                    No matching student records found.
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
                matching student record(s) found.
            </span>

        </div>

    `;

}
function exportStudentData() {

    window.location.href =
        "export-student-data.html";

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