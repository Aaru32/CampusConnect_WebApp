/* =========================================================
   CAMPUSCONNECT
   ADMIN — DEPARTMENT MANAGEMENT
   JAVASCRIPT
========================================================= */


/* =========================================================
   01. CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        DASHBOARD:
            "/admin/departments/summary",

        DEPARTMENTS:
            "/admin/departments",

        DEPARTMENT:
            "/admin/departments/{id}",

        FACULTY:
            "/admin/faculty",

        COURSES:
            "/admin/courses",

        NOTIFICATIONS:
            "/notifications"

    },

    PAGINATION: {

        PAGE_SIZE: 10

    },

    REQUEST: {

        TIMEOUT: 15000

    }

};


/* =========================================================
   02. APPLICATION STATE
========================================================= */

const state = {

    departments: [],

    filteredDepartments: [],

    currentPage: 1,

    pageSize: CONFIG.PAGINATION.PAGE_SIZE,

    totalPages: 1,

    isLoading: false,

    isSubmitting: false,

    editingDepartmentId: null,

    searchQuery: "",

    statusFilter: "",

    sessionFilter: "",

    programFilter: "",

    hasBackend: false,

    dashboardSummary: null,

    faculty: [],

    courses: [],

    notifications: []

};


/* =========================================================
   03. DOM REFERENCES
========================================================= */

const elements = {};


/* =========================================================
   04. DOM INITIALIZATION
========================================================= */

function cacheElements() {

    elements.pageLoader =
        document.getElementById("pageLoader");

    elements.backButton =
        document.getElementById("backButton");

    elements.refreshButton =
        document.getElementById("refreshButton");

    elements.notificationButton =
        document.getElementById("notificationButton");

    elements.notificationDot =
        document.getElementById("notificationDot");

    elements.profileButton =
        document.getElementById("profileButton");

    elements.adminProfileImage =
        document.getElementById("adminProfileImage");


    /* Overview */

    elements.totalDepartments =
        document.getElementById("totalDepartments");

    elements.activeDepartments =
        document.getElementById("activeDepartments");

    elements.totalCourses =
        document.getElementById("totalCourses");

    elements.totalFaculty =
        document.getElementById("totalFaculty");


    /* Filters */

    elements.departmentSearch =
        document.getElementById("departmentSearch");

    elements.statusFilter =
        document.getElementById("statusFilter");

    elements.sessionFilter =
        document.getElementById("sessionFilter");

    elements.programFilter =
        document.getElementById("programFilter");

    elements.clearFiltersButton =
        document.getElementById("clearFiltersButton");


    /* Table */

    elements.departmentTableBody =
        document.getElementById("departmentTableBody");

    elements.departmentEmptyState =
        document.getElementById("departmentEmptyState");

    elements.departmentSearchEmpty =
        document.getElementById("departmentSearchEmpty");

    elements.departmentResultCount =
        document.getElementById("departmentResultCount");

    elements.previousPageButton =
        document.getElementById("previousPageButton");

    elements.currentPageNumber =
        document.getElementById("currentPageNumber");

    elements.nextPageButton =
        document.getElementById("nextPageButton");


    /* Add/Edit */

    elements.addDepartmentButton =
        document.getElementById("addDepartmentButton");

    elements.emptyStateAddButton =
        document.getElementById("emptyStateAddButton");

    elements.searchEmptyClearButton =
        document.getElementById(
            "searchEmptyClearButton"
        );

    elements.departmentModal =
        document.getElementById("departmentModal");

    elements.closeDepartmentModalButton =
        document.getElementById(
            "closeDepartmentModalButton"
        );

    elements.cancelDepartmentButton =
        document.getElementById(
            "cancelDepartmentButton"
        );

    elements.departmentForm =
        document.getElementById("departmentForm");

    elements.departmentModalTitle =
        document.getElementById(
            "departmentModalTitle"
        );

    elements.departmentName =
        document.getElementById("departmentName");

    elements.departmentCode =
        document.getElementById("departmentCode");

    elements.departmentDescription =
        document.getElementById(
            "departmentDescription"
        );

    elements.departmentHod =
        document.getElementById(
            "departmentHod"
        );

    elements.departmentPrograms =
        document.getElementById(
            "departmentPrograms"
        );

    elements.departmentStatus =
        document.getElementById(
            "departmentStatus"
        );

    elements.saveDepartmentButton =
        document.getElementById(
            "saveDepartmentButton"
        );


    /* Notifications */

    elements.notificationPanel =
        document.getElementById(
            "notificationPanel"
        );

    elements.closeNotificationPanel =
        document.getElementById(
            "closeNotificationPanel"
        );

    elements.notificationPanelBody =
        document.getElementById(
            "notificationPanelBody"
        );


    /* Toast */

    elements.toastContainer =
        document.getElementById(
            "toastContainer"
        );

}


/* =========================================================
   05. APPLICATION START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDepartmentPage
);


async function initializeDepartmentPage() {

    cacheElements();

    bindEvents();

    initializeFilters();

    showPageLoader();

    await loadDepartmentModule();

    hidePageLoader();

}


/* =========================================================
   06. EVENT BINDINGS
========================================================= */

function bindEvents() {


    /* Back */

    elements.backButton?.addEventListener(
        "click",
        handleBack
    );


    /* Refresh */

    elements.refreshButton?.addEventListener(
        "click",
        handleRefresh
    );


    /* Profile */

    elements.profileButton?.addEventListener(
        "click",
        handleProfile
    );


    /* Notifications */

    elements.notificationButton?.addEventListener(
        "click",
        toggleNotificationPanel
    );


    elements.closeNotificationPanel?.addEventListener(
        "click",
        closeNotificationPanel
    );


    /* Search */

    elements.departmentSearch?.addEventListener(
        "input",
        handleSearch
    );


    /* Filters */

    elements.statusFilter?.addEventListener(
        "change",
        handleFilterChange
    );

    elements.sessionFilter?.addEventListener(
        "change",
        handleFilterChange
    );

    elements.programFilter?.addEventListener(
        "change",
        handleFilterChange
    );


    /* Clear filters */

    elements.clearFiltersButton?.addEventListener(
        "click",
        clearFilters
    );

    elements.searchEmptyClearButton?.addEventListener(
        "click",
        clearFilters
    );


    /* Add */

    elements.addDepartmentButton?.addEventListener(
        "click",
        openAddDepartmentModal
    );


    elements.emptyStateAddButton?.addEventListener(
        "click",
        openAddDepartmentModal
    );


    /* Modal */

    elements.closeDepartmentModalButton?.addEventListener(
        "click",
        closeDepartmentModal
    );


    elements.cancelDepartmentButton?.addEventListener(
        "click",
        closeDepartmentModal
    );


    elements.departmentModal?.addEventListener(
        "click",
        handleModalBackdropClick
    );


    /* Form */

    elements.departmentForm?.addEventListener(
        "submit",
        handleDepartmentSubmit
    );


    /* Pagination */

    elements.previousPageButton?.addEventListener(
        "click",
        goToPreviousPage
    );


    elements.nextPageButton?.addEventListener(
        "click",
        goToNextPage
    );


    /* Keyboard */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );

}


/* =========================================================
   07. LOAD DEPARTMENT MODULE
========================================================= */

async function loadDepartmentModule() {

    state.hasBackend =
        Boolean(
            String(CONFIG.API_BASE_URL || "").trim()
        );

    if (!state.hasBackend) {

        state.departments = [];

        state.filteredDepartments = [];

        state.dashboardSummary = null;

        state.faculty = [];

        state.courses = [];

        renderOverview();

        renderDepartmentTable();

        return;

    }


    try {

        await Promise.all([

            loadDashboardSummary(),

            loadDepartments(),

            loadFaculty(),

            loadCourses(),

            loadNotifications()

        ]);

    } catch (error) {

        console.error(
            "Department module initialization failed:",
            error
        );

        showToast(
            "Unable to load department data.",
            "error"
        );

        state.departments = [];

        state.filteredDepartments = [];

        renderOverview();

        renderDepartmentTable();

    }

}


/* =========================================================
   08. LOAD DASHBOARD SUMMARY
========================================================= */

async function loadDashboardSummary() {

    const response =
        await apiRequest(
            CONFIG.ENDPOINTS.DASHBOARD,
            {
                method: "GET"
            }
        );


    if (!response.ok) {

        throw new Error(
            response.message ||
            "Unable to load department summary."
        );

    }


    state.dashboardSummary =
        normalizeSummary(
            response.data
        );


    renderOverview();

}


/* =========================================================
   09. LOAD DEPARTMENTS
========================================================= */

async function loadDepartments() {

    const response =
        await apiRequest(
            CONFIG.ENDPOINTS.DEPARTMENTS,
            {
                method: "GET"
            }
        );


    if (!response.ok) {

        throw new Error(
            response.message ||
            "Unable to load departments."
        );

    }


    state.departments =
        normalizeDepartmentCollection(
            response.data
        );


    populateDynamicFilters();

    applyFilters();

}


/* =========================================================
   10. LOAD FACULTY
========================================================= */

async function loadFaculty() {

    const response =
        await apiRequest(
            CONFIG.ENDPOINTS.FACULTY,
            {
                method: "GET"
            }
        );


    if (!response.ok) {

        state.faculty = [];

        return;

    }


    state.faculty =
        normalizeCollection(
            response.data
        );


    populateHodOptions();

}


/* =========================================================
   11. LOAD COURSES
========================================================= */

async function loadCourses() {

    const response =
        await apiRequest(
            CONFIG.ENDPOINTS.COURSES,
            {
                method: "GET"
            }
        );


    if (!response.ok) {

        state.courses = [];

        return;

    }


    state.courses =
        normalizeCollection(
            response.data
        );


    populateProgramOptions();

}


/* =========================================================
   12. LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    const response =
        await apiRequest(
            CONFIG.ENDPOINTS.NOTIFICATIONS,
            {
                method: "GET"
            }
        );


    if (!response.ok) {

        state.notifications = [];

        updateNotificationIndicator();

        return;

    }


    state.notifications =
        normalizeCollection(
            response.data
        );


    updateNotificationIndicator();

}


/* =========================================================
   13. NORMALIZE SUMMARY
========================================================= */

function normalizeSummary(data) {

    const source =
        data?.summary ||
        data?.data ||
        data ||
        {};


    return {

        totalDepartments:
            getNumberOrDash(
                source.totalDepartments ??
                source.total_departments
            ),

        activeDepartments:
            getNumberOrDash(
                source.activeDepartments ??
                source.active_departments
            ),

        totalCourses:
            getNumberOrDash(
                source.totalCourses ??
                source.total_courses ??
                source.totalPrograms ??
                source.total_programs
            ),

        totalFaculty:
            getNumberOrDash(
                source.totalFaculty ??
                source.total_faculty
            )

    };

}


/* =========================================================
   14. RENDER OVERVIEW
========================================================= */

function renderOverview() {

    const summary =
        state.dashboardSummary;


    if (!summary) {

        setText(
            elements.totalDepartments,
            "—"
        );

        setText(
            elements.activeDepartments,
            "—"
        );

        setText(
            elements.totalCourses,
            "—"
        );

        setText(
            elements.totalFaculty,
            "—"
        );

        return;

    }


    setText(
        elements.totalDepartments,
        summary.totalDepartments
    );

    setText(
        elements.activeDepartments,
        summary.activeDepartments
    );

    setText(
        elements.totalCourses,
        summary.totalCourses
    );

    setText(
        elements.totalFaculty,
        summary.totalFaculty
    );

}


/* =========================================================
   15. SEARCH
========================================================= */

function handleSearch(event) {

    state.searchQuery =
        String(
            event.target.value || ""
        )
        .trim()
        .toLowerCase();


    state.currentPage = 1;

    applyFilters();

}


/* =========================================================
   16. FILTER CHANGE
========================================================= */

function handleFilterChange() {

    state.statusFilter =
        elements.statusFilter?.value || "";

    state.sessionFilter =
        elements.sessionFilter?.value || "";

    state.programFilter =
        elements.programFilter?.value || "";

    state.currentPage = 1;

    applyFilters();

}


/* =========================================================
   17. APPLY FILTERS
========================================================= */

function applyFilters() {

    let result =
        Array.isArray(state.departments)
            ? [...state.departments]
            : [];


    /* Search */

    if (state.searchQuery) {

        result =
            result.filter(
                department => {

                    const searchableText =
                        [

                            department.name,

                            department.code,

                            department.description,

                            department.hodName,

                            department.headName

                        ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        state.searchQuery
                    );

                }
            );

    }


    /* Status */

    if (state.statusFilter) {

        result =
            result.filter(
                department =>
                    normalizeStatus(
                        department.status
                    ) ===
                    state.statusFilter
            );

    }


    /* Session */

    if (state.sessionFilter) {

        result =
            result.filter(
                department =>
                    String(
                        department.session || ""
                    ) ===
                    state.sessionFilter
            );

    }


    /* Program */

    if (state.programFilter) {

        result =
            result.filter(
                department => {

                    const programs =
                        normalizePrograms(
                            department
                        );


                    return programs.some(
                        program => {

                            const id =
                                String(
                                    program.id ?? ""
                                );

                            const code =
                                String(
                                    program.code ?? ""
                                );

                            const name =
                                String(
                                    program.name ?? ""
                                );


                            return (
                                id ===
                                    state.programFilter ||

                                code ===
                                    state.programFilter ||

                                name ===
                                    state.programFilter
                            );

                        }
                    );

                }
            );

    }


    state.filteredDepartments = result;

    updatePagination();

    renderDepartmentTable();

}


/* =========================================================
   18. RENDER DEPARTMENT TABLE
========================================================= */

function renderDepartmentTable() {

    const tableBody =
        elements.departmentTableBody;


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    const allDepartments =
        Array.isArray(
            state.departments
        )
            ? state.departments
            : [];


    const filteredDepartments =
        Array.isArray(
            state.filteredDepartments
        )
            ? state.filteredDepartments
            : [];


    /* No backend / no records */

    if (
        allDepartments.length === 0
    ) {

        showElement(
            elements.departmentEmptyState
        );

        hideElement(
            elements.departmentSearchEmpty
        );

        hideElement(
            tableBody
        );

        updateResultCount(0);

        updatePaginationControls();

        return;

    }


    /* Backend has records but filters match nothing */

    if (
        filteredDepartments.length === 0
    ) {

        hideElement(
            elements.departmentEmptyState
        );

        showElement(
            elements.departmentSearchEmpty
        );

        hideElement(
            tableBody
        );

        updateResultCount(0);

        updatePaginationControls();

        return;

    }


    hideElement(
        elements.departmentEmptyState
    );

    hideElement(
        elements.departmentSearchEmpty
    );

    showElement(
        tableBody
    );


    const pageItems =
        getCurrentPageItems();


    pageItems.forEach(
        department => {

            tableBody.appendChild(
                createDepartmentRow(
                    department
                )
            );

        }
    );


    updateResultCount(
        filteredDepartments.length
    );

    updatePaginationControls();

}


/* =========================================================
   19. CREATE DEPARTMENT TABLE ROW
========================================================= */

function createDepartmentRow(
    department
) {

    const row =
        document.createElement("tr");


    const nameCell =
        document.createElement("td");


    nameCell.innerHTML = `

        <div class="department-name-cell">

            <div class="department-table-icon">

                <i class="fa-solid fa-building"></i>

            </div>

            <div class="department-name-info">

                <span class="department-name">
                    ${escapeHTML(
                        department.name ||
                        "Unnamed Department"
                    )}
                </span>

                ${
                    department.description
                        ? `
                            <span class="department-description">
                                ${escapeHTML(
                                    department.description
                                )}
                            </span>
                          `
                        : ""
                }

            </div>

        </div>

    `;


    const codeCell =
        document.createElement("td");


    codeCell.innerHTML = `

        <span class="department-code">
            ${escapeHTML(
                department.code || "—"
            )}
        </span>

    `;


    const hodCell =
        document.createElement("td");


    hodCell.textContent =
        department.hodName ||
        department.headName ||
        "—";


    const coursesCell =
        document.createElement("td");


    coursesCell.textContent =
        formatCount(
            department.courseCount ??
            department.coursesCount ??
            countCollection(
                department.courses
            )
        );


    const facultyCell =
        document.createElement("td");


    facultyCell.textContent =
        formatCount(
            department.facultyCount ??
            department.totalFaculty
        );


    const statusCell =
        document.createElement("td");


    const status =
        normalizeStatus(
            department.status
        );


    statusCell.innerHTML = `

        <span class="status-badge ${status}">

            ${capitalize(
                status
            )}

        </span>

    `;


    const actionCell =
        document.createElement("td");


    actionCell.className =
        "action-column";


    actionCell.innerHTML = `

        <div class="table-actions">

            <button
                type="button"
                class="table-action-button"
                data-action="view"
                data-id="${escapeAttribute(
                    department.id
                )}"
                aria-label="View department"
                title="View department"
            >

                <i class="fa-solid fa-eye"></i>

            </button>


            <button
                type="button"
                class="table-action-button"
                data-action="edit"
                data-id="${escapeAttribute(
                    department.id
                )}"
                aria-label="Edit department"
                title="Edit department"
            >

                <i class="fa-solid fa-pen"></i>

            </button>

        </div>

    `;


    row.appendChild(nameCell);

    row.appendChild(codeCell);

    row.appendChild(hodCell);

    row.appendChild(coursesCell);

    row.appendChild(facultyCell);

    row.appendChild(statusCell);

    row.appendChild(actionCell);


    attachRowActions(
        row,
        department
    );


    return row;

}


/* =========================================================
   20. TABLE ROW ACTIONS
========================================================= */

function attachRowActions(
    row,
    department
) {

    const actionButtons =
        row.querySelectorAll(
            "[data-action]"
        );


    actionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    const action =
                        event.currentTarget
                            .dataset
                            .action;


                    if (
                        action === "view"
                    ) {

                        viewDepartment(
                            department
                        );

                    }


                    if (
                        action === "edit"
                    ) {

                        openEditDepartmentModal(
                            department
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   21. VIEW DEPARTMENT
========================================================= */

function viewDepartment(
    department
) {

    if (!department?.id) {

        showToast(
            "This department does not have a valid ID.",
            "error"
        );

        return;

    }


    const departmentId =
        encodeURIComponent(
            department.id
        );


    /*
        Future Department Details page.

        Expected location:

        Dashboard/Admin/department-details.html

        The ID is passed through the URL so the details
        page can request the correct department from API.
    */

    window.location.href =
        `department-details.html?id=${departmentId}`;

}


/* =========================================================
   22. OPEN ADD MODAL
========================================================= */

function openAddDepartmentModal() {

    state.editingDepartmentId = null;


    resetDepartmentForm();


    if (
        elements.departmentModalTitle
    ) {

        elements.departmentModalTitle.textContent =
            "Add Department";

    }


    if (
        elements.saveDepartmentButton
    ) {

        elements.saveDepartmentButton.innerHTML = `

            <i class="fa-solid fa-check"></i>

            <span>
                Save Department
            </span>

        `;

    }


    showModal();

    setTimeout(
        () => {

            elements.departmentName?.focus();

        },
        50
    );

}


/* =========================================================
   23. OPEN EDIT MODAL
========================================================= */

function openEditDepartmentModal(
    department
) {

    if (!department?.id) {

        showToast(
            "Unable to edit this department.",
            "error"
        );

        return;

    }


    state.editingDepartmentId =
        department.id;


    clearFormErrors();


    elements.departmentName.value =
        department.name || "";

    elements.departmentCode.value =
        department.code || "";

    elements.departmentDescription.value =
        department.description || "";

    elements.departmentStatus.value =
        normalizeStatus(
            department.status
        );


    if (
        department.hodId
    ) {

        elements.departmentHod.value =
            department.hodId;

    }


    if (
        department.courseId
    ) {

        elements.departmentPrograms.value =
            department.courseId;

    }


    if (
        elements.departmentModalTitle
    ) {

        elements.departmentModalTitle.textContent =
            "Edit Department";

    }


    if (
        elements.saveDepartmentButton
    ) {

        elements.saveDepartmentButton.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            <span>
                Save Changes
            </span>

        `;

    }


    showModal();

}


/* =========================================================
   24. RESET FORM
========================================================= */

function resetDepartmentForm() {

    elements.departmentForm?.reset();

    clearFormErrors();


    if (
        elements.departmentStatus
    ) {

        elements.departmentStatus.value =
            "active";

    }

}


/* =========================================================
   25. FORM SUBMIT
========================================================= */

async function handleDepartmentSubmit(
    event
) {

    event.preventDefault();


    if (state.isSubmitting) {

        return;

    }


    const formData =
        collectDepartmentFormData();


    if (
        !validateDepartmentForm(
            formData
        )
    ) {

        return;

    }


    if (!state.hasBackend) {

        showToast(
            "Backend is not connected yet. The department was not stored locally.",
            "info"
        );

        return;

    }


    state.isSubmitting = true;

    setSaveButtonLoading(true);


    try {

        const isEditing =
            Boolean(
                state.editingDepartmentId
            );


        const endpoint =
            isEditing
                ? buildEndpoint(
                    CONFIG.ENDPOINTS.DEPARTMENT,
                    state.editingDepartmentId
                )
                : CONFIG.ENDPOINTS.DEPARTMENTS;


        const response =
            await apiRequest(
                endpoint,
                {

                    method:
                        isEditing
                            ? "PUT"
                            : "POST",

                    body:
                        JSON.stringify(
                            formData
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                response.message ||
                "Unable to save department."
            );

        }


        closeDepartmentModal();


        showToast(
            isEditing
                ? "Department updated successfully."
                : "Department added successfully.",
            "success"
        );


        await loadDepartmentModule();

    } catch (error) {

        console.error(
            "Department save failed:",
            error
        );


        showToast(
            error.message ||
            "Unable to save department.",
            "error"
        );

    } finally {

        state.isSubmitting = false;

        setSaveButtonLoading(false);

    }

}


/* =========================================================
   26. COLLECT FORM DATA
========================================================= */

function collectDepartmentFormData() {

    return {

        name:
            elements.departmentName
                ?.value
                .trim() || "",

        code:
            elements.departmentCode
                ?.value
                .trim()
                .toUpperCase() || "",

        description:
            elements.departmentDescription
                ?.value
                .trim() || "",

        hodId:
            elements.departmentHod
                ?.value || null,

        courseId:
            elements.departmentPrograms
                ?.value || null,

        status:
            elements.departmentStatus
                ?.value || "active"

    };

}


/* =========================================================
   27. VALIDATE FORM
========================================================= */

function validateDepartmentForm(
    data
) {

    clearFormErrors();


    let valid = true;


    if (!data.name) {

        setFormError(
            "departmentNameError",
            "Department name is required."
        );

        valid = false;

    }


    if (!data.code) {

        setFormError(
            "departmentCodeError",
            "Department code is required."
        );

        valid = false;

    }


    if (!data.hodId) {

        setFormError(
            "departmentHodError",
            "Please select a Head of Department."
        );

        valid = false;

    }


    if (!data.courseId) {

        setFormError(
            "departmentProgramsError",
            "Please select a course or program."
        );

        valid = false;

    }


    return valid;

}


/* =========================================================
   28. FORM ERROR
========================================================= */

function setFormError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   29. CLEAR FORM ERRORS
========================================================= */

function clearFormErrors() {

    document
        .querySelectorAll(
            ".form-error"
        )
        .forEach(
            element => {

                element.textContent = "";

            }
        );

}


/* =========================================================
   30. SET SAVE BUTTON LOADING
========================================================= */

function setSaveButtonLoading(
    loading
) {

    if (
        !elements.saveDepartmentButton
    ) {

        return;

    }


    elements.saveDepartmentButton.disabled =
        loading;


    if (loading) {

        elements.saveDepartmentButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Saving...
            </span>

        `;

        return;

    }


    elements.saveDepartmentButton.innerHTML = `

        <i class="fa-solid fa-check"></i>

        <span>
            ${
                state.editingDepartmentId
                    ? "Save Changes"
                    : "Save Department"
            }
        </span>

    `;

}


/* =========================================================
   31. SHOW MODAL
========================================================= */

function showModal() {

    if (
        !elements.departmentModal
    ) {

        return;

    }


    elements.departmentModal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   32. CLOSE MODAL
========================================================= */

function closeDepartmentModal() {

    if (
        !elements.departmentModal
    ) {

        return;

    }


    elements.departmentModal.hidden =
        true;


    document.body.style.overflow =
        "";


    state.editingDepartmentId =
        null;


    resetDepartmentForm();

}


/* =========================================================
   33. MODAL BACKDROP CLICK
========================================================= */

function handleModalBackdropClick(
    event
) {

    if (
        event.target ===
        elements.departmentModal
    ) {

        closeDepartmentModal();

    }

}


/* =========================================================
   34. FILTER INITIALIZATION
========================================================= */

function initializeFilters() {

    if (
        elements.statusFilter
    ) {

        elements.statusFilter.value =
            "";

    }


    if (
        elements.sessionFilter
    ) {

        elements.sessionFilter.value =
            "";

    }


    if (
        elements.programFilter
    ) {

        elements.programFilter.value =
            "";

    }

}


/* =========================================================
   35. DYNAMIC FILTER OPTIONS
========================================================= */

function populateDynamicFilters() {

    const sessions =
        new Set();


    const programs =
        new Map();


    state.departments.forEach(
        department => {

            if (
                department.session
            ) {

                sessions.add(
                    String(
                        department.session
                    )
                );

            }


            normalizePrograms(
                department
            )
            .forEach(
                program => {

                    const key =
                        String(
                            program.id ??
                            program.code ??
                            program.name ??
                            ""
                        );


                    if (key) {

                        programs.set(
                            key,
                            program
                        );

                    }

                }
            );

        }
    );


    populateSelect(
        elements.sessionFilter,
        [...sessions]
            .sort(),
        value => value,
        value => value,
        "All Sessions"
    );


    populateSelect(
        elements.programFilter,
        [...programs.values()],
        program =>
            String(
                program.id ??
                program.code ??
                program.name ??
                ""
            ),
        program =>
            program.name ||
            program.code ||
            "Program",
        "All Programs"
    );

}


/* =========================================================
   36. POPULATE HOD OPTIONS
========================================================= */

function populateHodOptions() {

    if (
        !elements.departmentHod
    ) {

        return;

    }


    const currentValue =
        elements.departmentHod.value;


    elements.departmentHod.innerHTML = `

        <option value="">
            Select HOD
        </option>

    `;


    state.faculty
        .filter(
            faculty =>
                faculty.id !== undefined &&
                faculty.id !== null
        )
        .sort(
            (a, b) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                )
        )
        .forEach(
            faculty => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    faculty.id;


                option.textContent =
                    faculty.name ||
                    faculty.fullName ||
                    faculty.employeeName ||
                    "Faculty";


                elements.departmentHod
                    .appendChild(
                        option
                    );

            }
        );


    if (
        currentValue
    ) {

        elements.departmentHod.value =
            currentValue;

    }

}


/* =========================================================
   37. POPULATE PROGRAM OPTIONS
========================================================= */

function populateProgramOptions() {

    if (
        !elements.departmentPrograms
    ) {

        return;

    }


    const currentValue =
        elements.departmentPrograms.value;


    elements.departmentPrograms.innerHTML = `

        <option value="">
            Select course / program
        </option>

    `;


    state.courses
        .filter(
            course =>
                course.id !== undefined &&
                course.id !== null
        )
        .sort(
            (a, b) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                )
        )
        .forEach(
            course => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    course.id;


                option.textContent =
                    course.name ||
                    course.courseName ||
                    course.title ||
                    "Course";


                elements.departmentPrograms
                    .appendChild(
                        option
                    );

            }
        );


    if (
        currentValue
    ) {

        elements.departmentPrograms.value =
            currentValue;

    }

}


/* =========================================================
   38. GENERIC SELECT POPULATION
========================================================= */

function populateSelect(
    select,
    items,
    valueGetter,
    labelGetter,
    defaultLabel
) {

    if (!select) {

        return;

    }


    const previousValue =
        select.value;


    select.innerHTML = "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value = "";

    defaultOption.textContent =
        defaultLabel;


    select.appendChild(
        defaultOption
    );


    items.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                valueGetter(item);


            option.textContent =
                labelGetter(item);


            select.appendChild(
                option
            );

        }
    );


    if (
        previousValue &&
        [
            ...select.options
        ]
        .some(
            option =>
                option.value ===
                previousValue
        )
    ) {

        select.value =
            previousValue;

    }

}


/* =========================================================
   39. CLEAR FILTERS
========================================================= */

function clearFilters() {

    state.searchQuery = "";

    state.statusFilter = "";

    state.sessionFilter = "";

    state.programFilter = "";

    state.currentPage = 1;


    if (
        elements.departmentSearch
    ) {

        elements.departmentSearch.value =
            "";

    }


    if (
        elements.statusFilter
    ) {

        elements.statusFilter.value =
            "";

    }


    if (
        elements.sessionFilter
    ) {

        elements.sessionFilter.value =
            "";

    }


    if (
        elements.programFilter
    ) {

        elements.programFilter.value =
            "";

    }


    applyFilters();

}


/* =========================================================
   40. PAGINATION
========================================================= */

function updatePagination() {

    const total =
        state.filteredDepartments.length;


    state.totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                state.pageSize
            )
        );


    if (
        state.currentPage >
        state.totalPages
    ) {

        state.currentPage =
            state.totalPages;

    }

}


/* =========================================================
   41. GET CURRENT PAGE ITEMS
========================================================= */

function getCurrentPageItems() {

    const start =
        (
            state.currentPage -
            1
        ) *
        state.pageSize;


    return state.filteredDepartments.slice(
        start,
        start + state.pageSize
    );

}


/* =========================================================
   42. UPDATE PAGINATION CONTROLS
========================================================= */

function updatePaginationControls() {

    if (
        elements.currentPageNumber
    ) {

        elements.currentPageNumber.textContent =
            state.currentPage;

    }


    if (
        elements.previousPageButton
    ) {

        elements.previousPageButton.disabled =
            state.currentPage <= 1;

    }


    if (
        elements.nextPageButton
    ) {

        elements.nextPageButton.disabled =
            state.currentPage >=
            state.totalPages;

    }

}


/* =========================================================
   43. PREVIOUS PAGE
========================================================= */

function goToPreviousPage() {

    if (
        state.currentPage <= 1
    ) {

        return;

    }


    state.currentPage--;

    renderDepartmentTable();

}


/* =========================================================
   44. NEXT PAGE
========================================================= */

function goToNextPage() {

    if (
        state.currentPage >=
        state.totalPages
    ) {

        return;

    }


    state.currentPage++;

    renderDepartmentTable();

}


/* =========================================================
   45. RESULT COUNT
========================================================= */

function updateResultCount(
    count
) {

    if (
        !elements.departmentResultCount
    ) {

        return;

    }


    if (
        count === 0
    ) {

        elements.departmentResultCount.textContent =
            "No departments found";

        return;

    }


    const start =
        (
            state.currentPage -
            1
        ) *
        state.pageSize +
        1;


    const end =
        Math.min(
            state.currentPage *
                state.pageSize,
            count
        );


    elements.departmentResultCount.textContent =
        `Showing ${start}–${end} of ${count} department${
            count === 1
                ? ""
                : "s"
        }`;

}


/* =========================================================
   46. REFRESH
========================================================= */

async function handleRefresh() {

    if (
        state.isLoading
    ) {

        return;

    }


    state.isLoading = true;


    toggleRefreshButton(
        true
    );


    try {

        await loadDepartmentModule();

        showToast(
            "Department data refreshed.",
            "success"
        );

    } catch (error) {

        console.error(
            "Refresh failed:",
            error
        );

        showToast(
            "Unable to refresh department data.",
            "error"
        );

    } finally {

        state.isLoading = false;

        toggleRefreshButton(
            false
        );

    }

}


/* =========================================================
   47. REFRESH BUTTON STATE
========================================================= */

function toggleRefreshButton(
    loading
) {

    const icon =
        elements.refreshButton
            ?.querySelector(
                "i"
            );


    if (!icon) {

        return;

    }


    if (loading) {

        icon.classList.add(
            "fa-spin"
        );

        elements.refreshButton.disabled =
            true;

        return;

    }


    icon.classList.remove(
        "fa-spin"
    );

    elements.refreshButton.disabled =
        false;

}


/* =========================================================
   48. BACK BUTTON
========================================================= */

function handleBack() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

        return;

    }


    window.location.href =
        "admin-dashboard.html";

}


/* =========================================================
   49. PROFILE
========================================================= */

function handleProfile() {

    window.location.href =
        "profile.html";

}


/* =========================================================
   50. NOTIFICATION PANEL
========================================================= */

function toggleNotificationPanel() {

    if (
        !elements.notificationPanel
    ) {

        return;

    }


    elements.notificationPanel.hidden =
        !elements.notificationPanel.hidden;

}


function closeNotificationPanel() {

    if (
        elements.notificationPanel
    ) {

        elements.notificationPanel.hidden =
            true;

    }

}


/* =========================================================
   51. NOTIFICATION INDICATOR
========================================================= */

function updateNotificationIndicator() {

    const unread =
        state.notifications.filter(
            notification =>
                !Boolean(
                    notification.read ??
                    notification.isRead
                )
        );


    if (
        elements.notificationDot
    ) {

        elements.notificationDot.hidden =
            unread.length === 0;

    }


    renderNotifications(
        unread
    );

}


/* =========================================================
   52. RENDER NOTIFICATIONS
========================================================= */

function renderNotifications(
    notifications
) {

    if (
        !elements.notificationPanelBody
    ) {

        return;

    }


    if (
        !notifications.length
    ) {

        elements.notificationPanelBody.innerHTML = `

            <div class="notification-empty">

                <i class="fa-regular fa-bell-slash"></i>

                <p>
                    No new notifications
                </p>

            </div>

        `;

        return;

    }


    elements.notificationPanelBody.innerHTML =
        notifications
            .map(
                notification => `

                    <div class="notification-item">

                        <strong>
                            ${escapeHTML(
                                notification.title ||
                                "Notification"
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                notification.message ||
                                notification.body ||
                                ""
                            )}
                        </p>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   53. KEYBOARD HANDLING
========================================================= */

function handleKeyboard(
    event
) {

    if (
        event.key === "Escape"
    ) {

        if (
            elements.departmentModal &&
            !elements.departmentModal.hidden
        ) {

            closeDepartmentModal();

            return;

        }


        if (
            elements.notificationPanel &&
            !elements.notificationPanel.hidden
        ) {

            closeNotificationPanel();

        }

    }

}


/* =========================================================
   54. API REQUEST
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const url =
        buildApiUrl(
            endpoint
        );


    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            CONFIG.REQUEST.TIMEOUT
        );


    const requestOptions = {

        method:
            options.method ||
            "GET",

        headers: {

            "Accept":
                "application/json",

            ...(options.body
                ? {
                    "Content-Type":
                        "application/json"
                }
                : {}),

            ...(options.headers || {})

        },

        credentials:
            options.credentials ||
            "include",

        signal:
            controller.signal

    };


    if (
        options.body !== undefined
    ) {

        requestOptions.body =
            options.body;

    }


    try {

        const response =
            await fetch(
                url,
                requestOptions
            );


        const data =
            await parseResponse(
                response
            );


        if (!response.ok) {

            return {

                ok: false,

                status:
                    response.status,

                data,

                message:
                    extractApiMessage(
                        data
                    )

            };

        }


        return {

            ok: true,

            status:
                response.status,

            data,

            message:
                extractApiMessage(
                    data
                )

        };

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            return {

                ok: false,

                status: 408,

                data: null,

                message:
                    "The request timed out."

            };

        }


        return {

            ok: false,

            status: 0,

            data: null,

            message:
                error.message ||
                "Network request failed."

        };

    } finally {

        clearTimeout(
            timeout
        );

    }

}


/* =========================================================
   55. BUILD API URL
========================================================= */

function buildApiUrl(
    endpoint
) {

    const base =
        String(
            CONFIG.API_BASE_URL || ""
        )
        .trim()
        .replace(
            /\/$/,
            ""
        );


    const path =
        String(
            endpoint || ""
        )
        .trim();


    if (!base) {

        return path;

    }


    if (
        path.startsWith("/")
    ) {

        return (
            base +
            path
        );

    }


    return (
        base +
        "/" +
        path
    );

}


/* =========================================================
   56. BUILD ENDPOINT
========================================================= */

function buildEndpoint(
    template,
    id
) {

    return String(
        template
    )
    .replace(
        "{id}",
        encodeURIComponent(
            id
        )
    );

}


/* =========================================================
   57. PARSE API RESPONSE
========================================================= */

async function parseResponse(
    response
) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        try {

            return await response.json();

        } catch {

            return null;

        }

    }


    const text =
        await response.text();


    if (!text) {

        return null;

    }


    try {

        return JSON.parse(
            text
        );

    } catch {

        return {
            message: text
        };

    }

}


/* =========================================================
   58. EXTRACT API MESSAGE
========================================================= */

function extractApiMessage(
    data
) {

    if (!data) {

        return "";

    }


    return (
        data.message ||
        data.error ||
        data.detail ||
        ""
    );

}


/* =========================================================
   59. NORMALIZE DEPARTMENT COLLECTION
========================================================= */

function normalizeDepartmentCollection(
    data
) {

    const collection =
        extractCollection(
            data
        );


    return collection.map(
        normalizeDepartment
    );

}


/* =========================================================
   60. NORMALIZE DEPARTMENT
========================================================= */

function normalizeDepartment(
    department
) {

    const source =
        department || {};


    return {

        ...source,

        id:
            source.id ??
            source.departmentId ??
            source.department_id,

        name:
            source.name ??
            source.departmentName ??
            source.department_name ??
            "",

        code:
            source.code ??
            source.departmentCode ??
            source.department_code ??
            "",

        description:
            source.description ??
            "",

        hodId:
            source.hodId ??
            source.hod_id ??
            source.headId ??
            source.head_id ??
            null,

        hodName:
            source.hodName ??
            source.hod_name ??
            source.headName ??
            source.head_name ??
            "",

        status:
            source.status ??
            "active",

        session:
            source.session ??
            source.academicSession ??
            source.academic_session ??
            "",

        facultyCount:
            source.facultyCount ??
            source.faculty_count ??
            null,

        courseCount:
            source.courseCount ??
            source.course_count ??
            null,

        courses:
            source.courses ??
            []

    };

}


/* =========================================================
   61. NORMALIZE COLLECTION
========================================================= */

function normalizeCollection(
    data
) {

    return extractCollection(
        data
    );

}


/* =========================================================
   62. EXTRACT COLLECTION
========================================================= */

function extractCollection(
    data
) {

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    if (
        Array.isArray(
            data?.data
        )
    ) {

        return data.data;

    }


    if (
        Array.isArray(
            data?.content
        )
    ) {

        return data.content;

    }


    if (
        Array.isArray(
            data?.items
        )
    ) {

        return data.items;

    }


    if (
        Array.isArray(
            data?.departments
        )
    ) {

        return data.departments;

    }


    if (
        Array.isArray(
            data?.faculty
        )
    ) {

        return data.faculty;

    }


    if (
        Array.isArray(
            data?.courses
        )
    ) {

        return data.courses;

    }


    return [];

}


/* =========================================================
   63. NORMALIZE PROGRAMS
========================================================= */

function normalizePrograms(
    department
) {

    if (
        Array.isArray(
            department?.programs
        )
    ) {

        return department.programs;

    }


    if (
        Array.isArray(
            department?.courses
        )
    ) {

        return department.courses;

    }


    if (
        department?.courseId
    ) {

        return [

            {

                id:
                    department.courseId,

                name:
                    department.courseName ||
                    ""

            }

        ];

    }


    return [];

}


/* =========================================================
   64. NORMALIZE STATUS
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        [
            "inactive",
            "disabled",
            "deactivated",
            "false",
            "0"
        ]
        .includes(value)
    ) {

        return "inactive";

    }


    return "active";

}


/* =========================================================
   65. NUMBER HELPERS
========================================================= */

function getNumberOrDash(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "—";

    }


    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "—";

    }


    return number.toLocaleString();

}


function formatCount(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "—";

    }


    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "—";

    }


    return number.toLocaleString();

}


function countCollection(
    collection
) {

    return Array.isArray(
        collection
    )
        ? collection.length
        : null;

}


/* =========================================================
   66. TEXT HELPERS
========================================================= */

function capitalize(
    value
) {

    const text =
        String(
            value || ""
        );


    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function setText(
    element,
    value
) {

    if (
        element
    ) {

        element.textContent =
            value;

    }

}


/* =========================================================
   67. HTML ESCAPING
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   68. ELEMENT VISIBILITY
========================================================= */

function showElement(
    element
) {

    if (!element) {

        return;

    }


    element.hidden = false;

}


function hideElement(
    element
) {

    if (!element) {

        return;

    }


    element.hidden = true;

}


/* =========================================================
   69. PAGE LOADER
========================================================= */

function showPageLoader() {

    elements.pageLoader
        ?.classList
        .remove(
            "hidden"
        );

}


function hidePageLoader() {

    window.setTimeout(
        () => {

            elements.pageLoader
                ?.classList
                .add(
                    "hidden"
                );

        },
        150
    );

}


/* =========================================================
   70. TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    if (
        !elements.toastContainer
    ) {

        return;

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <i class="${
            type === "success"
                ? "fa-solid fa-circle-check"
                : type === "error"
                    ? "fa-solid fa-circle-exclamation"
                    : "fa-solid fa-circle-info"
        }"></i>

        <span>
            ${escapeHTML(
                message
            )}
        </span>

    `;


    elements.toastContainer
        .appendChild(
            toast
        );


    window.setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";

            window.setTimeout(
                () => {

                    toast.remove();

                },
                180
            );

        },
        3200
    );

}