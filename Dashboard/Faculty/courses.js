/* =========================================================
   CAMPUSCONNECT
   FACULTY COURSES
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        COURSES:
            "/faculty/courses",

        NOTIFICATIONS:
            "/notifications"

    }

};


/* =========================================================
   ROUTES
========================================================= */

const ROUTES = {

    DASHBOARD:
        "faculty-dashboard.html",

    COURSE_DETAILS:
        "course-details.html",

    NOTIFICATIONS:
        "notifications.html"

};


/* =========================================================
   DOM
========================================================= */

const DOM = {

    backBtn:
        document.getElementById("backBtn"),

    refreshButton:
        document.getElementById("refreshButton"),

    notificationButton:
        document.getElementById("notificationButton"),

    notificationCount:
        document.getElementById("notificationCount"),

    courseSearch:
        document.getElementById("courseSearch"),

    filterButton:
        document.getElementById("filterButton"),

    filterPanel:
        document.getElementById("filterPanel"),

    closeFilterButton:
        document.getElementById("closeFilterButton"),

    resetFilterButton:
        document.getElementById("resetFilterButton"),

    applyFilterButton:
        document.getElementById("applyFilterButton"),

    departmentFilter:
        document.getElementById("departmentFilter"),

    semesterFilter:
        document.getElementById("semesterFilter"),

    sessionFilter:
        document.getElementById("sessionFilter"),

    courseTypeFilter:
        document.getElementById("courseTypeFilter"),

    courseGrid:
        document.getElementById("courseGrid"),

    emptyState:
        document.getElementById("emptyState"),

    emptyTitle:
        document.getElementById("emptyTitle"),

    emptyMessage:
        document.getElementById("emptyMessage"),

    courseResultCount:
        document.getElementById("courseResultCount"),

    activeFilterStatus:
        document.getElementById("activeFilterStatus")

};


/* =========================================================
   STATE
========================================================= */

const facultyState = {

    courses: [],

    notifications: [],

    filters: {

        department: "",

        semester: "",

        session: "",

        courseType: ""

    }

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeCoursesPage
);


function initializeCoursesPage() {

    setupHeader();

    setupFilters();

    setupSearch();

    /*
     * The filter panel is explicitly closed
     * when the page initializes.
     */

    closeFilterPanel();

    loadCourses();

    loadNotifications();

}


/* =========================================================
   HEADER
========================================================= */

function setupHeader() {

    if (DOM.backBtn) {

        DOM.backBtn.addEventListener(
            "click",
            () => {

                /*
                 * Browser history first.
                 * Dashboard fallback if there is
                 * no previous page.
                 */

                if (
                    window.history.length > 1
                ) {

                    window.history.back();

                }

                else {

                    navigateTo(
                        ROUTES.DASHBOARD
                    );

                }

            }
        );

    }


    if (DOM.refreshButton) {

        DOM.refreshButton.addEventListener(
            "click",
            refreshPage
        );

    }


    if (DOM.notificationButton) {

        DOM.notificationButton.addEventListener(
            "click",
            () => {

                navigateTo(
                    ROUTES.NOTIFICATIONS
                );

            }
        );

    }

}


/* =========================================================
   FILTER SETUP
========================================================= */

function setupFilters() {

    if (DOM.filterButton) {

        DOM.filterButton.addEventListener(
            "click",
            toggleFilterPanel
        );

    }


    if (DOM.closeFilterButton) {

        DOM.closeFilterButton.addEventListener(
            "click",
            closeFilterPanel
        );

    }


    if (DOM.applyFilterButton) {

        DOM.applyFilterButton.addEventListener(
            "click",
            applyFilters
        );

    }


    if (DOM.resetFilterButton) {

        DOM.resetFilterButton.addEventListener(
            "click",
            resetFilters
        );

    }

}


/* =========================================================
   FILTER PANEL
========================================================= */

function toggleFilterPanel() {

    if (!DOM.filterPanel) {
        return;
    }


    if (DOM.filterPanel.hidden) {

        openFilterPanel();

    }

    else {

        closeFilterPanel();

    }

}


function openFilterPanel() {

    DOM.filterPanel.hidden = false;

    if (DOM.filterButton) {

        DOM.filterButton.classList.add(
            "active"
        );

        DOM.filterButton.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


function closeFilterPanel() {

    if (DOM.filterPanel) {

        DOM.filterPanel.hidden = true;

    }


    if (DOM.filterButton) {

        DOM.filterButton.classList.remove(
            "active"
        );

        DOM.filterButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    facultyState.filters = {

        department:
            DOM.departmentFilter
                ? DOM.departmentFilter.value
                : "",

        semester:
            DOM.semesterFilter
                ? DOM.semesterFilter.value
                : "",

        session:
            DOM.sessionFilter
                ? DOM.sessionFilter.value
                : "",

        courseType:
            DOM.courseTypeFilter
                ? DOM.courseTypeFilter.value
                : ""

    };


    renderCourses();

    updateFilterStatus();

    /*
     * Important:
     * Once filters are applied,
     * close the panel.
     */

    closeFilterPanel();

}


/* =========================================================
   RESET FILTERS
========================================================= */

function resetFilters() {

    facultyState.filters = {

        department: "",

        semester: "",

        session: "",

        courseType: ""

    };


    if (DOM.departmentFilter) {

        DOM.departmentFilter.value = "";

    }


    if (DOM.semesterFilter) {

        DOM.semesterFilter.value = "";

    }


    if (DOM.sessionFilter) {

        DOM.sessionFilter.value = "";

    }


    if (DOM.courseTypeFilter) {

        DOM.courseTypeFilter.value = "";

    }


    renderCourses();

    updateFilterStatus();

}


/* =========================================================
   FILTER STATUS
========================================================= */

function updateFilterStatus() {

    if (!DOM.activeFilterStatus) {
        return;
    }


    const filters =
        facultyState.filters;


    const hasFilters =
        Boolean(
            filters.department ||
            filters.semester ||
            filters.session ||
            filters.courseType
        );


    DOM.activeFilterStatus.hidden =
        !hasFilters;

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    if (!DOM.courseSearch) {
        return;
    }


    DOM.courseSearch.addEventListener(
        "input",
        () => {

            renderCourses();

        }
    );

}


/* =========================================================
   LOAD COURSES
========================================================= */

async function loadCourses() {

    /*
     * No backend = empty state.
     *
     * No sample/fake courses are inserted.
     */

    if (!CONFIG.API_BASE_URL) {

        facultyState.courses = [];

        renderCourses();

        return;

    }


    try {

        const data =
            await apiRequest(
                CONFIG.ENDPOINTS.COURSES
            );


        facultyState.courses =
            Array.isArray(data)
                ? data
                : Array.isArray(data?.courses)
                    ? data.courses
                    : [];


        buildFilterOptions();

        renderCourses();

    }

    catch (error) {

        console.error(
            "Faculty courses loading error:",
            error
        );


        facultyState.courses = [];

        showEmptyState(
            "Courses could not be loaded",
            "Course data could not be retrieved from the backend. Please refresh and try again."
        );

    }

}


/* =========================================================
   API
========================================================= */

async function apiRequest(endpoint) {

    const response =
        await fetch(
            CONFIG.API_BASE_URL + endpoint,
            {

                method: "GET",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                credentials: "include"

            }
        );


    if (!response.ok) {

        throw new Error(
            `API request failed: ${response.status}`
        );

    }


    return await response.json();

}


/* =========================================================
   FILTER OPTIONS
========================================================= */

function buildFilterOptions() {

    const courses =
        facultyState.courses;


    fillSelect(
        DOM.departmentFilter,
        courses.map(
            course =>
                course.department ||
                course.departmentName
        )
    );


    fillSelect(
        DOM.semesterFilter,
        courses.map(
            course =>
                course.semester
        )
    );


    fillSelect(
        DOM.sessionFilter,
        courses.map(
            course =>
                course.session ||
                course.academicSession
        )
    );


    fillSelect(
        DOM.courseTypeFilter,
        courses.map(
            course =>
                course.courseType ||
                course.type
        )
    );

}


function fillSelect(
    select,
    values
) {

    if (!select) {
        return;
    }


    const uniqueValues =
        [
            ...new Set(
                values
                    .filter(Boolean)
                    .map(
                        value =>
                            String(value)
                    )
            )
        ];


    const currentValue =
        select.value;


    const firstOption =
        select.options[0];


    select.innerHTML = "";


    if (firstOption) {

        const defaultOption =
            document.createElement("option");

        defaultOption.value =
            firstOption.value;

        defaultOption.textContent =
            firstOption.textContent;

        select.appendChild(
            defaultOption
        );

    }


    uniqueValues
        .sort()
        .forEach(value => {

            const option =
                document.createElement("option");

            option.value =
                value;

            option.textContent =
                value;

            select.appendChild(
                option
            );

        });


    if (
        uniqueValues.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


/* =========================================================
   RENDER COURSES
========================================================= */

function renderCourses() {

    if (!DOM.courseGrid) {
        return;
    }


    const filteredCourses =
        getFilteredCourses();


    if (DOM.courseResultCount) {

        DOM.courseResultCount.textContent =
            filteredCourses.length;

    }


    if (
        facultyState.courses.length === 0
    ) {

        DOM.courseGrid.innerHTML = "";

        showEmptyState(
            "No courses assigned",
            "Courses assigned specifically to this faculty member will appear here when data is available."
        );

        return;

    }


    if (
        filteredCourses.length === 0
    ) {

        DOM.courseGrid.innerHTML = "";

        showEmptyState(
            "No matching courses",
            "No assigned course matches the current search or filter criteria."
        );

        return;

    }


    hideEmptyState();


    DOM.courseGrid.innerHTML =
        filteredCourses
            .map(createCourseCard)
            .join("");


    attachCourseEvents();

}


/* =========================================================
   FILTERED COURSES
========================================================= */

function getFilteredCourses() {

    const search =
        DOM.courseSearch
            ? DOM.courseSearch.value
                .trim()
                .toLowerCase()
            : "";


    const filters =
        facultyState.filters;


    return facultyState.courses.filter(
        course => {

            const searchableText = [

                course.code,

                course.courseCode,

                course.name,

                course.courseName,

                course.subject,

                course.subjectName,

                course.className,

                course.department,

                course.departmentName

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(
                    search
                );


            const department =
                course.department ||
                course.departmentName ||
                "";


            const semester =
                course.semester ||
                "";


            const session =
                course.session ||
                course.academicSession ||
                "";


            const courseType =
                course.courseType ||
                course.type ||
                "";


            const matchesDepartment =
                !filters.department ||
                String(department) ===
                    String(filters.department);


            const matchesSemester =
                !filters.semester ||
                String(semester) ===
                    String(filters.semester);


            const matchesSession =
                !filters.session ||
                String(session) ===
                    String(filters.session);


            const matchesCourseType =
                !filters.courseType ||
                String(courseType) ===
                    String(filters.courseType);


            return (
                matchesSearch &&
                matchesDepartment &&
                matchesSemester &&
                matchesSession &&
                matchesCourseType
            );

        }
    );

}


/* =========================================================
   COURSE CARD
========================================================= */

function createCourseCard(course) {

    const id =
        course.id ||
        course.courseId ||
        "";


    const code =
        escapeHTML(
            course.code ||
            course.courseCode ||
            "COURSE"
        );


    const name =
        escapeHTML(
            course.name ||
            course.courseName ||
            course.subjectName ||
            "Course"
        );


    const description =
        escapeHTML(
            course.description ||
            course.subject ||
            "Academic course assigned to this faculty member."
        );


    const department =
        escapeHTML(
            course.department ||
            course.departmentName ||
            "—"
        );


    const semester =
        escapeHTML(
            course.semester ||
            "—"
        );


    const session =
        escapeHTML(
            course.session ||
            course.academicSession ||
            "—"
        );


    const courseType =
        escapeHTML(
            course.courseType ||
            course.type ||
            "—"
        );


    const classes =
        escapeHTML(
            course.classesCount ??
            course.assignedClasses ??
            "—"
        );


    const status =
        escapeHTML(
            course.status ||
            "Assigned"
        );


    return `

        <article
            class="course-card"
            data-course-id="${escapeHTML(id)}"
        >

            <div class="course-card-top">

                <div class="course-icon">

                    <i class="fa-solid fa-book-open"></i>

                </div>


                <div class="course-main">

                    <span class="course-code">
                        ${code}
                    </span>

                    <h3>
                        ${name}
                    </h3>

                    <p>
                        ${description}
                    </p>

                </div>


                <span class="course-status">
                    ${status}
                </span>

            </div>


            <div class="course-details">

                <div class="course-detail">

                    <span>
                        Department
                    </span>

                    <strong>
                        ${department}
                    </strong>

                </div>


                <div class="course-detail">

                    <span>
                        Semester
                    </span>

                    <strong>
                        ${semester}
                    </strong>

                </div>


                <div class="course-detail">

                    <span>
                        Academic Session
                    </span>

                    <strong>
                        ${session}
                    </strong>

                </div>


                <div class="course-detail">

                    <span>
                        Course Type
                    </span>

                    <strong>
                        ${courseType}
                    </strong>

                </div>

            </div>


            <div class="course-footer">

                <span class="course-footer-info">
                    Assigned classes: ${classes}
                </span>


                <button
                    type="button"
                    class="course-view-btn"
                    data-course-id="${escapeHTML(id)}"
                >
                    View Details
                    <i class="fa-solid fa-arrow-right"></i>
                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   COURSE EVENTS
========================================================= */

function attachCourseEvents() {

    document
        .querySelectorAll(
            ".course-view-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.courseId;


                    if (!id) {

                        navigateTo(
                            ROUTES.COURSE_DETAILS
                        );

                        return;

                    }


                    navigateTo(
                        `${ROUTES.COURSE_DETAILS}?id=${encodeURIComponent(id)}`
                    );

                }
            );

        });

}


/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyState(
    title,
    message
) {

    if (!DOM.emptyState) {
        return;
    }


    if (DOM.emptyTitle) {

        DOM.emptyTitle.textContent =
            title;

    }


    if (DOM.emptyMessage) {

        DOM.emptyMessage.textContent =
            message;

    }


    DOM.emptyState.hidden =
        false;

}


function hideEmptyState() {

    if (DOM.emptyState) {

        DOM.emptyState.hidden =
            true;

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    if (!CONFIG.API_BASE_URL) {

        updateNotificationCount();

        return;

    }


    try {

        const data =
            await apiRequest(
                CONFIG.ENDPOINTS.NOTIFICATIONS
            );


        facultyState.notifications =
            Array.isArray(data)
                ? data
                : Array.isArray(data?.notifications)
                    ? data.notifications
                    : [];


        updateNotificationCount();

    }

    catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

    }

}


function updateNotificationCount() {

    if (!DOM.notificationCount) {
        return;
    }


    const unread =
        facultyState.notifications.filter(
            notification =>
                notification.read === false
        ).length;


    if (unread > 0) {

        DOM.notificationCount.textContent =
            unread;

        DOM.notificationCount.hidden =
            false;

    }

    else {

        DOM.notificationCount.hidden =
            true;

    }

}


/* =========================================================
   REFRESH
========================================================= */

function refreshPage() {

    if (DOM.refreshButton) {

        DOM.refreshButton.disabled =
            true;

        const icon =
            DOM.refreshButton.querySelector(
                "i"
            );


        if (icon) {

            icon.classList.add(
                "fa-spin"
            );

        }

    }


    setTimeout(
        () => {

            window.location.reload();

        },
        300
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(
    route
) {

    if (!route) {
        return;
    }


    window.location.href =
        route;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}