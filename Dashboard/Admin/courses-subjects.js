/* =========================================================
   CAMPUSCONNECT
   COURSES & SUBJECTS
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {

    /*
     * Keep empty until Java backend is connected.
     *
     * Later:
     * CONFIG.API_BASE_URL = "http://localhost:8080/api";
     */
    API_BASE_URL: "",

    ENDPOINTS: {

        courses: "/admin/courses",

        summary: "/admin/courses/summary",

        departments: "/admin/departments",

        analytics: "/admin/courses/{id}/analytics"

    }

};


/* =========================================================
   STATE
   ========================================================= */

const state = {

    courses: [],

    filteredCourses: [],

    departments: [],

    selectedCourse: null,

    currentView: "grid",

    filters: {

        search: "",

        type: "",

        provider: "",

        department: "",

        semester: ""

    }

};


/* =========================================================
   DOM
   ========================================================= */

const elements = {

    backBtn:
        document.getElementById("backBtn"),

    refreshBtn:
        document.getElementById("refreshBtn"),

    notificationBtn:
        document.getElementById("notificationBtn"),

    notificationDot:
        document.getElementById("notificationDot"),

    notificationPanel:
        document.getElementById("notificationPanel"),

    closeNotificationBtn:
        document.getElementById("closeNotificationBtn"),

    addCourseBtn:
        document.getElementById("addCourseBtn"),

    addSubjectBtn:
        document.getElementById("addSubjectBtn"),

    courseModal:
        document.getElementById("courseModal"),

    closeCourseModalBtn:
        document.getElementById("closeCourseModalBtn"),

    cancelCourseBtn:
        document.getElementById("cancelCourseBtn"),

    courseForm:
        document.getElementById("courseForm"),

    courseName:
        document.getElementById("courseName"),

    courseCode:
        document.getElementById("courseCode"),

    courseType:
        document.getElementById("courseType"),

    courseProvider:
        document.getElementById("courseProvider"),

    courseSemester:
        document.getElementById("courseSemester"),

    courseDepartment:
        document.getElementById("courseDepartment"),

    courseDescription:
        document.getElementById("courseDescription"),

    courseSearch:
        document.getElementById("courseSearch"),

    courseTypeFilter:
        document.getElementById("courseTypeFilter"),

    providerFilter:
        document.getElementById("providerFilter"),

    departmentFilter:
        document.getElementById("departmentFilter"),

    semesterFilter:
        document.getElementById("semesterFilter"),

    clearFiltersBtn:
        document.getElementById("clearFiltersBtn"),

    activeFilterBar:
        document.getElementById("activeFilterBar"),

    clearActiveFiltersBtn:
        document.getElementById("clearActiveFiltersBtn"),

    gridViewBtn:
        document.getElementById("gridViewBtn"),

    tableViewBtn:
        document.getElementById("tableViewBtn"),

    courseGridView:
        document.getElementById("courseGridView"),

    courseTableView:
        document.getElementById("courseTableView"),

    courseTableBody:
        document.getElementById("courseTableBody"),

    directoryEmpty:
        document.getElementById("directoryEmpty"),

    emptyTitle:
        document.getElementById("emptyTitle"),

    emptyMessage:
        document.getElementById("emptyMessage"),

    emptyAddCourseBtn:
        document.getElementById("emptyAddCourseBtn"),

    totalCoursesCount:
        document.getElementById("totalCoursesCount"),

    academicSubjectsCount:
        document.getElementById("academicSubjectsCount"),

    onlineCoursesCount:
        document.getElementById("onlineCoursesCount"),

    certificationCoursesCount:
        document.getElementById("certificationCoursesCount"),

    selectedCourseSection:
        document.getElementById("selectedCourseSection"),

    selectedCourseTitle:
        document.getElementById("selectedCourseTitle"),

    selectedCourseSubtitle:
        document.getElementById("selectedCourseSubtitle"),

    selectedCourseName:
        document.getElementById("selectedCourseName"),

    selectedCourseCode:
        document.getElementById("selectedCourseCode"),

    selectedCourseType:
        document.getElementById("selectedCourseType"),

    selectedCourseProvider:
        document.getElementById("selectedCourseProvider"),

    selectedCourseDepartment:
        document.getElementById("selectedCourseDepartment"),

    selectedCourseSemester:
        document.getElementById("selectedCourseSemester"),

    selectedCourseDetailsBtn:
        document.getElementById("selectedCourseDetailsBtn"),

    selectedCourseAnalyticsBtn:
        document.getElementById("selectedCourseAnalyticsBtn"),

    analyticsSection:
        document.getElementById("analyticsSection"),

    analyticsTitle:
        document.getElementById("analyticsTitle"),

    analyticsEligible:
        document.getElementById("analyticsEligible"),

    analyticsAttempted:
        document.getElementById("analyticsAttempted"),

    analyticsParticipation:
        document.getElementById("analyticsParticipation"),

    analyticsCertified:
        document.getElementById("analyticsCertified"),

    closeAnalyticsBtn:
        document.getElementById("closeAnalyticsBtn"),

    courseTypeCards:
        document.querySelectorAll(".course-type-card"),

    toastContainer:
        document.getElementById("toastContainer")

};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializePage();

});


function initializePage() {

    bindNavigation();

    bindHeaderActions();

    bindModalActions();

    bindFilters();

    bindViewControls();

    bindCourseTypeCards();

    bindCourseActions();

    bindForm();

    loadInitialData();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function bindNavigation() {

    elements.backBtn.addEventListener("click", () => {

        if (window.history.length > 1) {

            window.history.back();

        } else {

            window.location.href =
                "../admin-dashboard.html";

        }

    });

}


/* =========================================================
   HEADER ACTIONS
   ========================================================= */

function bindHeaderActions() {

    elements.refreshBtn.addEventListener(
        "click",
        async () => {

            elements.refreshBtn.classList.add("is-refreshing");

            await loadInitialData();

            setTimeout(() => {

                elements.refreshBtn.classList.remove(
                    "is-refreshing"
                );

            }, 300);

        }
    );


    elements.notificationBtn.addEventListener(
        "click",
        () => {

            toggleNotificationPanel();

        }
    );


    elements.closeNotificationBtn.addEventListener(
        "click",
        () => {

            closeNotificationPanel();

        }
    );

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function toggleNotificationPanel() {

    const isHidden =
        elements.notificationPanel.hidden;

    elements.notificationPanel.hidden =
        !isHidden;

}


function closeNotificationPanel() {

    elements.notificationPanel.hidden = true;

}


/* =========================================================
   LOAD DATA
   ========================================================= */

async function loadInitialData() {

    /*
     * There is deliberately no hard-coded course data.
     *
     * Until the Java/MySQL REST API is connected,
     * the directory remains empty.
     */

    if (!CONFIG.API_BASE_URL) {

        state.courses = [];

        state.departments = [];

        updateSummaryFromCourses();

        populateDepartmentSelects();

        applyFilters();

        return;

    }


    try {

        await Promise.all([

            loadCourses(),

            loadDepartments(),

            loadSummary()

        ]);

        applyFilters();

    } catch (error) {

        console.error(
            "Failed to load course data:",
            error
        );

        showToast(
            "Unable to load course data.",
            "error"
        );

    }

}


/* =========================================================
   API HELPERS
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const response = await fetch(
        `${CONFIG.API_BASE_URL}${endpoint}`,
        {
            headers: {
                "Content-Type":
                    "application/json"
            },
            ...options
        }
    );


    if (!response.ok) {

        throw new Error(
            `API request failed: ${response.status}`
        );

    }


    if (
        response.status === 204
    ) {

        return null;

    }


    return response.json();

}


/* =========================================================
   LOAD COURSES
   ========================================================= */

async function loadCourses() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.courses
        );


    state.courses =
        Array.isArray(data)
            ? data
            : (
                Array.isArray(data?.courses)
                    ? data.courses
                    : []
            );

}


/* =========================================================
   LOAD DEPARTMENTS
   ========================================================= */

async function loadDepartments() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.departments
        );


    state.departments =
        Array.isArray(data)
            ? data
            : (
                Array.isArray(data?.departments)
                    ? data.departments
                    : []
            );

    populateDepartmentSelects();

}


/* =========================================================
   LOAD SUMMARY
   ========================================================= */

async function loadSummary() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.summary
        );


    if (!data) {

        updateSummaryFromCourses();

        return;

    }


    elements.totalCoursesCount.textContent =
        formatNumber(
            data.totalCourses
        );

    elements.academicSubjectsCount.textContent =
        formatNumber(
            data.academicSubjects
        );

    elements.onlineCoursesCount.textContent =
        formatNumber(
            data.onlineCourses
        );

    elements.certificationCoursesCount.textContent =
        formatNumber(
            data.certificationCourses
        );

}


/* =========================================================
   SUMMARY WITHOUT BACKEND
   ========================================================= */

function updateSummaryFromCourses() {

    const courses =
        state.courses || [];


    elements.totalCoursesCount.textContent =
        courses.length
            ? formatNumber(courses.length)
            : "—";


    const academic =
        courses.filter(
            course =>
                normalize(
                    course.type
                ) === "academic"
        ).length;


    const online =
        courses.filter(
            course =>
                normalize(
                    course.type
                ) === "online"
        ).length;


    const certification =
        courses.filter(
            course =>
                normalize(
                    course.type
                ) === "certification"
        ).length;


    elements.academicSubjectsCount.textContent =
        courses.length
            ? formatNumber(academic)
            : "—";


    elements.onlineCoursesCount.textContent =
        courses.length
            ? formatNumber(online)
            : "—";


    elements.certificationCoursesCount.textContent =
        courses.length
            ? formatNumber(certification)
            : "—";

}


/* =========================================================
   DEPARTMENT SELECTS
   ========================================================= */

function populateDepartmentSelects() {

    const selects = [

        elements.departmentFilter,

        elements.courseDepartment

    ];


    selects.forEach(select => {

        if (!select) {
            return;
        }


        const currentValue =
            select.value;


        if (
            select ===
            elements.departmentFilter
        ) {

            select.innerHTML = `
                <option value="">
                    All Departments
                </option>
            `;

        } else {

            select.innerHTML = `
                <option value="">
                    Select department
                </option>
            `;

        }


        state.departments.forEach(
            department => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    department.id ??
                    department.code ??
                    department.name ??
                    "";


                option.textContent =
                    department.name ??
                    department.departmentName ??
                    department.code ??
                    "Department";


                select.appendChild(option);

            }
        );


        if (
            currentValue
        ) {

            select.value =
                currentValue;

        }

    });

}


/* =========================================================
   FILTERS
   ========================================================= */

function bindFilters() {

    elements.courseSearch.addEventListener(
        "input",
        updateFilters
    );


    elements.courseTypeFilter.addEventListener(
        "change",
        updateFilters
    );


    elements.providerFilter.addEventListener(
        "change",
        updateFilters
    );


    elements.departmentFilter.addEventListener(
        "change",
        updateFilters
    );


    elements.semesterFilter.addEventListener(
        "change",
        updateFilters
    );


    elements.clearFiltersBtn.addEventListener(
        "click",
        clearFilters
    );


    elements.clearActiveFiltersBtn.addEventListener(
        "click",
        clearFilters
    );

}


function updateFilters() {

    state.filters.search =
        elements.courseSearch.value.trim();


    state.filters.type =
        elements.courseTypeFilter.value;


    state.filters.provider =
        elements.providerFilter.value;


    state.filters.department =
        elements.departmentFilter.value;


    state.filters.semester =
        elements.semesterFilter.value;


    applyFilters();

}


function applyFilters() {

    const filters =
        state.filters;


    state.filteredCourses =
        state.courses.filter(
            course => {

                const name =
                    normalize(
                        course.name ??
                        course.courseName ??
                        course.subjectName
                    );


                const code =
                    normalize(
                        course.code ??
                        course.courseCode ??
                        course.subjectCode
                    );


                const type =
                    normalize(
                        course.type ??
                        course.courseType
                    );


                const provider =
                    normalize(
                        course.provider
                    );


                const department =
                    normalize(
                        course.departmentId ??
                        course.department ??
                        course.departmentName
                    );


                const semester =
                    String(
                        course.semester ??
                        ""
                    );


                const search =
                    normalize(
                        filters.search
                    );


                if (
                    search &&
                    !name.includes(search) &&
                    !code.includes(search)
                ) {

                    return false;

                }


                if (
                    filters.type &&
                    type !==
                    normalize(filters.type)
                ) {

                    return false;

                }


                if (
                    filters.provider &&
                    provider !==
                    normalize(filters.provider)
                ) {

                    return false;

                }


                if (
                    filters.department &&
                    department !==
                    normalize(filters.department)
                ) {

                    return false;

                }


                if (
                    filters.semester &&
                    semester !==
                    filters.semester
                ) {

                    return false;

                }


                return true;

            }
        );


    updateActiveFilterBar();

    renderDirectory();

}


/* =========================================================
   COURSE TYPE CARDS
   ========================================================= */

function bindCourseTypeCards() {

    elements.courseTypeCards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    elements.courseTypeCards
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    card.classList.add(
                        "active"
                    );


                    if (
                        card.dataset.clear ===
                        "true"
                    ) {

                        clearFilters();

                        return;

                    }


                    const type =
                        card.dataset.type ||
                        "";


                    const provider =
                        card.dataset.provider ||
                        "";


                    elements.courseTypeFilter.value =
                        type;


                    elements.providerFilter.value =
                        provider;


                    updateFilters();


                    document
                        .getElementById(
                            "courseDirectorySection"
                        )
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                }
            );

        }
    );

}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearFilters() {

    elements.courseSearch.value = "";

    elements.courseTypeFilter.value = "";

    elements.providerFilter.value = "";

    elements.departmentFilter.value = "";

    elements.semesterFilter.value = "";


    state.filters = {

        search: "",

        type: "",

        provider: "",

        department: "",

        semester: ""

    };


    elements.courseTypeCards.forEach(
        card =>
            card.classList.remove(
                "active"
            )
    );


    applyFilters();

}


/* =========================================================
   ACTIVE FILTER BAR
   ========================================================= */

function updateActiveFilterBar() {

    const hasFilters =
        Object.values(
            state.filters
        ).some(
            value => Boolean(value)
        );


    elements.activeFilterBar.hidden =
        !hasFilters;

}


/* =========================================================
   DIRECTORY RENDER
   ========================================================= */

function renderDirectory() {

    const courses =
        state.filteredCourses;


    elements.courseGridView.innerHTML = "";

    elements.courseTableBody.innerHTML = "";


    if (!courses.length) {

        elements.courseGridView.hidden = true;

        elements.courseTableView.hidden = true;

        elements.directoryEmpty.hidden = false;


        const hasCourses =
            state.courses.length > 0;


        if (hasCourses) {

            elements.emptyTitle.textContent =
                "No matching courses";


            elements.emptyMessage.textContent =
                "Try changing your search or filters.";

        } else {

            elements.emptyTitle.textContent =
                "No courses available";


            elements.emptyMessage.textContent =
                "Course and subject data will appear here when backend data is available.";

        }


        return;

    }


    elements.directoryEmpty.hidden = true;


    if (
        state.currentView === "grid"
    ) {

        elements.courseGridView.hidden = false;

        elements.courseTableView.hidden = true;

        renderGrid(courses);

    } else {

        elements.courseGridView.hidden = true;

        elements.courseTableView.hidden = false;

        renderTable(courses);

    }

}


/* =========================================================
   GRID
   ========================================================= */

function renderGrid(courses) {

    courses.forEach(
        course => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "course-card";


            const id =
                getCourseId(course);


            card.innerHTML = `

                <div class="course-card-top">

                    <div class="course-card-icon">
                        <i class="fa-solid fa-book"></i>
                    </div>

                    <span class="course-type-badge">
                        ${escapeHtml(
                            formatCourseType(
                                course.type ??
                                course.courseType
                            )
                        )}
                    </span>

                </div>


                <h3>
                    ${escapeHtml(
                        course.name ??
                        course.courseName ??
                        course.subjectName ??
                        "Unnamed Course"
                    )}
                </h3>


                <p class="course-code">
                    ${escapeHtml(
                        course.code ??
                        course.courseCode ??
                        course.subjectCode ??
                        "No code"
                    )}
                </p>


                <div class="course-meta">

                    <span>
                        ${
                            escapeHtml(
                                course.provider ||
                                "College / Internal"
                            )
                        }
                    </span>

                    <span>
                        ${
                            escapeHtml(
                                course.departmentName ??
                                course.department ??
                                "Department not assigned"
                            )
                        }
                    </span>

                    ${
                        course.semester
                            ? `
                                <span>
                                    Semester ${escapeHtml(
                                        String(
                                            course.semester
                                        )
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="course-card-actions">

                    <button
                        type="button"
                        class="small-action view"
                        data-action="view"
                        data-id="${escapeHtml(
                            String(id)
                        )}"
                    >
                        <i class="fa-solid fa-eye"></i>
                        View Details
                    </button>


                    <button
                        type="button"
                        class="small-action analytics"
                        data-action="analytics"
                        data-id="${escapeHtml(
                            String(id)
                        )}"
                    >
                        <i class="fa-solid fa-chart-column"></i>
                        Analytics
                    </button>

                </div>

            `;


            elements.courseGridView.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   TABLE
   ========================================================= */

function renderTable(courses) {

    courses.forEach(
        course => {

            const row =
                document.createElement(
                    "tr"
                );


            const id =
                getCourseId(course);


            row.innerHTML = `

                <td>

                    <div class="table-course-name">
                        ${escapeHtml(
                            course.name ??
                            course.courseName ??
                            course.subjectName ??
                            "Unnamed Course"
                        )}
                    </div>

                    <div class="table-course-code">
                        ${escapeHtml(
                            course.code ??
                            course.courseCode ??
                            course.subjectCode ??
                            "No code"
                        )}
                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        course.code ??
                        course.courseCode ??
                        course.subjectCode ??
                        "—"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        formatCourseType(
                            course.type ??
                            course.courseType
                        )
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        course.provider ||
                        "College / Internal"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        course.departmentName ??
                        course.department ??
                        "—"
                    )}
                </td>


                <td>
                    ${
                        course.semester
                            ? `Semester ${escapeHtml(
                                String(
                                    course.semester
                                )
                            )}`
                            : "—"
                    }
                </td>


                <td>

                    <button
                        type="button"
                        class="small-action view"
                        data-action="view"
                        data-id="${escapeHtml(
                            String(id)
                        )}"
                    >
                        <i class="fa-solid fa-eye"></i>
                        View
                    </button>

                </td>

            `;


            elements.courseTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   COURSE ACTIONS
   ========================================================= */

function bindCourseActions() {

    document.addEventListener(
        "click",
        event => {

            const actionButton =
                event.target.closest(
                    "[data-action]"
                );


            if (!actionButton) {
                return;
            }


            const action =
                actionButton.dataset.action;


            const id =
                actionButton.dataset.id;


            const course =
                findCourseById(id);


            if (!course) {

                showToast(
                    "Course record could not be found.",
                    "error"
                );

                return;

            }


            if (
                action === "view"
            ) {

                selectCourse(course);

            }


            if (
                action === "analytics"
            ) {

                selectCourse(course);

                openAnalytics();

            }

        }
    );

}


/* =========================================================
   SELECT COURSE
   ========================================================= */

function selectCourse(course) {

    state.selectedCourse =
        course;


    elements.selectedCourseSection.hidden =
        false;


    elements.selectedCourseTitle.textContent =
        course.name ??
        course.courseName ??
        course.subjectName ??
        "Course Details";


    elements.selectedCourseSubtitle.textContent =
        course.description ??
        "Selected course information";


    elements.selectedCourseName.textContent =
        course.name ??
        course.courseName ??
        course.subjectName ??
        "Unnamed Course";


    elements.selectedCourseCode.textContent =
        course.code ??
        course.courseCode ??
        course.subjectCode ??
        "No course code";


    elements.selectedCourseType.textContent =
        formatCourseType(
            course.type ??
            course.courseType
        );


    elements.selectedCourseProvider.textContent =
        course.provider ||
        "College / Internal";


    elements.selectedCourseDepartment.textContent =
        course.departmentName ??
        course.department ??
        "Department not assigned";


    elements.selectedCourseSemester.textContent =
        course.semester
            ? `Semester ${course.semester}`
            : "Semester not assigned";


    elements.selectedCourseSection
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =========================================================
   VIEW DETAILS
   ========================================================= */

function bindSelectedCourseDetails() {

    elements.selectedCourseDetailsBtn.addEventListener(
        "click",
        () => {

            if (!state.selectedCourse) {

                showToast(
                    "Select a course first.",
                    "error"
                );

                return;

            }


            const course =
                state.selectedCourse;


            /*
             * This is the logical place where a dedicated
             * Course Details page can later be opened.
             *
             * Until the backend/page exists, the selected
             * course section provides the actual details.
             */

            selectCourse(course);

        }
    );

}


/* =========================================================
   ANALYTICS
   ========================================================= */

function bindAnalytics() {

    elements.selectedCourseAnalyticsBtn.addEventListener(
        "click",
        openAnalytics
    );


    elements.closeAnalyticsBtn.addEventListener(
        "click",
        () => {

            elements.analyticsSection.hidden =
                true;

        }
    );

}


async function openAnalytics() {

    if (!state.selectedCourse) {

        showToast(
            "Select a course first.",
            "error"
        );

        return;

    }


    elements.analyticsSection.hidden =
        false;


    elements.analyticsTitle.textContent =
        `${getCourseName(
            state.selectedCourse
        )} — Participation Overview`;


    resetAnalytics();


    if (!CONFIG.API_BASE_URL) {

        elements.analyticsSection
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        return;

    }


    const courseId =
        getCourseId(
            state.selectedCourse
        );


    try {

        const endpoint =
            CONFIG.ENDPOINTS.analytics.replace(
                "{id}",
                encodeURIComponent(
                    courseId
                )
            );


        const data =
            await apiRequest(
                endpoint
            );


        renderAnalytics(
            data
        );

    } catch (error) {

        console.error(
            "Analytics request failed:",
            error
        );

        showToast(
            "Unable to load analytics.",
            "error"
        );

    }


    elements.analyticsSection
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


function resetAnalytics() {

    elements.analyticsEligible.textContent =
        "—";

    elements.analyticsAttempted.textContent =
        "—";

    elements.analyticsParticipation.textContent =
        "—";

    elements.analyticsCertified.textContent =
        "—";

}


function renderAnalytics(data) {

    if (!data) {
        return;
    }


    elements.analyticsEligible.textContent =
        formatValue(
            data.eligibleStudents
        );


    elements.analyticsAttempted.textContent =
        formatValue(
            data.studentsAttempted
        );


    elements.analyticsParticipation.textContent =
        formatPercentage(
            data.participation
        );


    elements.analyticsCertified.textContent =
        formatValue(
            data.certified
        );

}


/* =========================================================
   VIEW CONTROLS
   ========================================================= */

function bindViewControls() {

    elements.gridViewBtn.addEventListener(
        "click",
        () => {

            state.currentView =
                "grid";


            elements.gridViewBtn.classList.add(
                "active"
            );

            elements.tableViewBtn.classList.remove(
                "active"
            );


            renderDirectory();

        }
    );


    elements.tableViewBtn.addEventListener(
        "click",
        () => {

            state.currentView =
                "table";


            elements.tableViewBtn.classList.add(
                "active"
            );

            elements.gridViewBtn.classList.remove(
                "active"
            );


            renderDirectory();

        }
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function bindModalActions() {

    elements.addCourseBtn.addEventListener(
        "click",
        () => {

            openCourseModal();

        }
    );


    elements.addSubjectBtn.addEventListener(
        "click",
        () => {

            openCourseModal(
                "academic"
            );

        }
    );


    elements.emptyAddCourseBtn.addEventListener(
        "click",
        () => {

            openCourseModal();

        }
    );


    elements.closeCourseModalBtn.addEventListener(
        "click",
        closeCourseModal
    );


    elements.cancelCourseBtn.addEventListener(
        "click",
        closeCourseModal
    );


    /*
     * Clicking outside the white modal closes it.
     */

    elements.courseModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.courseModal
            ) {

                closeCourseModal();

            }

        }
    );


    /*
     * Escape key closes the modal.
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !elements.courseModal.hidden
            ) {

                closeCourseModal();

            }

        }
    );

}


function openCourseModal(
    defaultType = ""
) {

    elements.courseModal.hidden =
        false;


    document.body.style.overflow =
        "hidden";


    clearFormErrors();


    if (defaultType) {

        elements.courseType.value =
            defaultType;

    }


    setTimeout(
        () => {

            elements.courseName.focus();

        },
        50
    );

}


function closeCourseModal() {

    elements.courseModal.hidden =
        true;


    document.body.style.overflow =
        "";


    clearFormErrors();

}


/* =========================================================
   FORM
   ========================================================= */

function bindForm() {

    elements.courseForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!validateCourseForm()) {

                return;

            }


            const courseData =
                collectCourseFormData();


            /*
             * Backend is not connected yet.
             *
             * Therefore the form does not insert fake/local
             * records into the directory.
             */

            if (!CONFIG.API_BASE_URL) {

                showToast(
                    "Course form is ready. Connect the backend API to save this course.",
                    "success"
                );

                return;

            }


            try {

                await apiRequest(
                    CONFIG.ENDPOINTS.courses,
                    {
                        method: "POST",
                        body:
                            JSON.stringify(
                                courseData
                            )
                    }
                );


                closeCourseModal();

                await loadInitialData();

                showToast(
                    "Course added successfully.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Unable to save course:",
                    error
                );

                showToast(
                    "Unable to save course.",
                    "error"
                );

            }

        }
    );

}


function collectCourseFormData() {

    return {

        name:
            elements.courseName.value.trim(),

        code:
            elements.courseCode.value.trim(),

        type:
            elements.courseType.value,

        provider:
            elements.courseProvider.value,

        semester:
            elements.courseSemester.value,

        departmentId:
            elements.courseDepartment.value,

        description:
            elements.courseDescription.value.trim()

    };

}


function validateCourseForm() {

    clearFormErrors();


    let valid = true;


    if (
        !elements.courseName.value.trim()
    ) {

        setFormError(
            "courseNameError",
            "Course or subject name is required."
        );

        valid = false;

    }


    if (
        !elements.courseCode.value.trim()
    ) {

        setFormError(
            "courseCodeError",
            "Course code is required."
        );

        valid = false;

    }


    if (
        !elements.courseType.value
    ) {

        showToast(
            "Please select a course type.",
            "error"
        );

        valid = false;

    }


    return valid;

}


function setFormError(
    id,
    message
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            message;

    }

}


function clearFormErrors() {

    document
        .querySelectorAll(
            ".form-error"
        )
        .forEach(
            element =>
                element.textContent = ""
        );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   HELPERS
   ========================================================= */

function normalize(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


function getCourseId(course) {

    return (
        course.id ??
        course.courseId ??
        course.subjectId ??
        course.code ??
        ""
    );

}


function findCourseById(id) {

    return state.courses.find(
        course =>
            String(
                getCourseId(course)
            ) === String(id)
    );

}


function getCourseName(course) {

    return (
        course.name ??
        course.courseName ??
        course.subjectName ??
        "Course"
    );

}


function formatCourseType(type) {

    const value =
        normalize(type);


    const labels = {

        academic:
            "Academic Subject",

        online:
            "Online Course",

        certification:
            "Certification",

        other:
            "Other Programme"

    };


    return (
        labels[value] ??
        "Course"
    );

}


function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "—";

    }


    return Number(value).toLocaleString();

}


function formatValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";

    }


    return formatNumber(value);

}


function formatPercentage(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";

    }


    return `${value}%`;

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    elements.toastContainer.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3500
    );

}


/* =========================================================
   FINAL EVENT BINDINGS
   ========================================================= */

bindSelectedCourseDetails();

bindAnalytics();