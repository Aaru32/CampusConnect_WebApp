/* =========================================================
   CAMPUSCONNECT
   ADMIN — REPORTS & ANALYTICS
   JAVASCRIPT PART 1
========================================================= */


/* =========================================================
   01. GLOBAL CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {
        dashboard: "/admin/dashboard",
        reports: "/admin/reports",
        students: "/students",
        faculty: "/faculty",
        departments: "/departments",
        courses: "/courses",
        attendance: "/attendance",
        examinations: "/examinations",
        results: "/results",
        admissions: "/admissions",
        fees: "/fees",
        library: "/library",
        hostel: "/hostel",
        events: "/events",
        certificates: "/certificates",
        feedback: "/feedback",
        settings: "/settings"
    },

    REQUEST_TIMEOUT: 15000,

    STORAGE_KEYS: {
        FILTERS: "campusconnect_reports_filters"
    }

};


/* =========================================================
   02. PAGE STATE
========================================================= */

const ReportsState = {

    filters: {
        session: "",
        semester: "",
        department: "",
        reportType: ""
    },

    generatedReports: [],

    activeModal: null,

    isLoading: false

};


/* =========================================================
   03. DOM REFERENCES
========================================================= */

const ReportsDOM = {};


/* =========================================================
   04. INITIALIZE DOM REFERENCES
========================================================= */

function initializeDOMReferences() {

    ReportsDOM.pageLoader =
        document.querySelector(".page-loader");

    ReportsDOM.reportsApp =
        document.querySelector(".reports-app");

    ReportsDOM.backButton =
        document.querySelector(".back-button");

    ReportsDOM.refreshButton =
        document.querySelector(
            '[data-report-action="refresh"]'
        );

    ReportsDOM.notificationButton =
        document.querySelector(
            '[data-report-action="notifications"]'
        );

    ReportsDOM.notificationPanel =
        document.querySelector(".notification-panel");

    ReportsDOM.profileButton =
        document.querySelector(".profile-button");

    ReportsDOM.profileDropdown =
        document.querySelector(".profile-dropdown");

    ReportsDOM.applyFiltersButton =
        document.querySelector(".filter-apply-button");

    ReportsDOM.resetFiltersButton =
        document.querySelector(".filter-reset-button");

    ReportsDOM.filterSession =
        document.querySelector("#reportSession");

    ReportsDOM.filterSemester =
        document.querySelector("#reportSemester");

    ReportsDOM.filterDepartment =
        document.querySelector("#reportDepartment");

    ReportsDOM.filterType =
        document.querySelector("#reportType");

    ReportsDOM.generateReportButton =
        document.querySelector(
            '[data-report-action="generate"]'
        );

    ReportsDOM.searchInput =
        document.querySelector(
            ".search-box input"
        );

    ReportsDOM.scrollTopButton =
        document.querySelector(".scroll-top-button");

    ReportsDOM.toastContainer =
        document.querySelector(".toast-container");

    ReportsDOM.modalOverlays =
        document.querySelectorAll(".modal-overlay");

}


/* =========================================================
   05. APPLICATION INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeDOMReferences();

    loadSavedFilters();

    bindGlobalEvents();

    initializeReportInteractions();

    initializeGeneratedReports();

    initializeScrollButton();

    hidePageLoader();

});


/* =========================================================
   06. GLOBAL EVENT BINDINGS
========================================================= */

function bindGlobalEvents() {

    if (ReportsDOM.backButton) {

        ReportsDOM.backButton.addEventListener(
            "click",
            handleBack
        );

    }


    if (ReportsDOM.refreshButton) {

        ReportsDOM.refreshButton.addEventListener(
            "click",
            handleRefresh
        );

    }


    if (ReportsDOM.notificationButton) {

        ReportsDOM.notificationButton.addEventListener(
            "click",
            toggleNotificationPanel
        );

    }


    if (ReportsDOM.profileButton) {

        ReportsDOM.profileButton.addEventListener(
            "click",
            toggleProfileDropdown
        );

    }


    if (ReportsDOM.applyFiltersButton) {

        ReportsDOM.applyFiltersButton.addEventListener(
            "click",
            applyReportFilters
        );

    }


    if (ReportsDOM.resetFiltersButton) {

        ReportsDOM.resetFiltersButton.addEventListener(
            "click",
            resetReportFilters
        );

    }


    if (ReportsDOM.generateReportButton) {

        ReportsDOM.generateReportButton.addEventListener(
            "click",
            handleGenerateReport
        );

    }


    if (ReportsDOM.searchInput) {

        ReportsDOM.searchInput.addEventListener(
            "input",
            handleReportSearch
        );

    }


    document.addEventListener(
        "click",
        handleDocumentClick
    );


    document.addEventListener(
        "keydown",
        handleKeyboardEvents
    );

}


/* =========================================================
   07. BACK BUTTON
========================================================= */

function handleBack() {

    if (window.history.length > 1) {

        window.history.back();

        return;
    }

    /*
     * Fallback only when there is no usable browser history.
     * Change this path if your actual Admin Dashboard
     * filename differs.
     */

    window.location.href =
        "../admin-dashboard.html";

}


/* =========================================================
   08. REFRESH
========================================================= */

function handleRefresh() {

    const button =
        ReportsDOM.refreshButton;

    if (!button) {
        window.location.reload();
        return;
    }

    if (button.classList.contains("is-loading")) {
        return;
    }

    button.classList.add("is-loading");

    const icon =
        button.querySelector("i");

    if (icon) {

        icon.classList.add(
            "fa-spin"
        );

    }

    setTimeout(() => {

        window.location.reload();

    }, 350);

}


/* =========================================================
   09. NOTIFICATION PANEL
========================================================= */

function toggleNotificationPanel(event) {

    if (event) {
        event.stopPropagation();
    }

    if (!ReportsDOM.notificationPanel) {
        return;
    }

    closeProfileDropdown();

    ReportsDOM.notificationPanel.classList.toggle(
        "is-active"
    );

}


function closeNotificationPanel() {

    if (!ReportsDOM.notificationPanel) {
        return;
    }

    ReportsDOM.notificationPanel.classList.remove(
        "is-active"
    );

}


/* =========================================================
   10. PROFILE DROPDOWN
========================================================= */

function toggleProfileDropdown(event) {

    if (event) {
        event.stopPropagation();
    }

    if (!ReportsDOM.profileDropdown) {
        return;
    }

    closeNotificationPanel();

    const isOpen =
        ReportsDOM.profileDropdown.classList.contains(
            "is-active"
        );

    ReportsDOM.profileDropdown.classList.toggle(
        "is-active",
        !isOpen
    );

    if (ReportsDOM.profileButton) {

        ReportsDOM.profileButton.classList.toggle(
            "is-open",
            !isOpen
        );

    }

}


function closeProfileDropdown() {

    if (ReportsDOM.profileDropdown) {

        ReportsDOM.profileDropdown.classList.remove(
            "is-active"
        );

    }

    if (ReportsDOM.profileButton) {

        ReportsDOM.profileButton.classList.remove(
            "is-open"
        );

    }

}


/* =========================================================
   11. OUTSIDE CLICK
========================================================= */

function handleDocumentClick(event) {

    const target =
        event.target;

    if (
        ReportsDOM.notificationPanel &&
        ReportsDOM.notificationButton &&
        !ReportsDOM.notificationPanel.contains(target) &&
        !ReportsDOM.notificationButton.contains(target)
    ) {

        closeNotificationPanel();

    }


    if (
        ReportsDOM.profileDropdown &&
        ReportsDOM.profileButton &&
        !ReportsDOM.profileDropdown.contains(target) &&
        !ReportsDOM.profileButton.contains(target)
    ) {

        closeProfileDropdown();

    }

}


/* =========================================================
   12. KEYBOARD CONTROLS
========================================================= */

function handleKeyboardEvents(event) {

    if (event.key === "Escape") {

        closeNotificationPanel();

        closeProfileDropdown();

        closeAllModals();

    }

}


/* =========================================================
   13. REPORT INTERACTIONS
========================================================= */

function initializeReportInteractions() {

    /*
     * Generic clickable report elements.
     */

    document.querySelectorAll(
        "[data-report]"
    ).forEach(element => {

        element.addEventListener(
            "click",
            handleReportClick
        );

    });


    /*
     * Specific action buttons.
     */

    document.querySelectorAll(
        "[data-report-action]"
    ).forEach(element => {

        const action =
            element.dataset.reportAction;

        if (!action) {
            return;
        }

        if (
            action === "refresh" ||
            action === "notifications" ||
            action === "generate"
        ) {
            return;
        }

        element.addEventListener(
            "click",
            () => handleReportAction(
                action,
                element
            )
        );

    });


    /*
     * Modal close controls.
     */

    document.querySelectorAll(
        ".modal-close-button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            closeAllModals
        );

    });


    /*
     * Clicking the dark overlay closes
     * the modal.
     */

    document.querySelectorAll(
        ".modal-overlay"
    ).forEach(overlay => {

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target === overlay
                ) {

                    closeModal(overlay);

                }

            }
        );

    });

}


/* =========================================================
   14. REPORT CARD CLICK
========================================================= */

function handleReportClick(event) {

    const element =
        event.currentTarget;

    const reportName =
        element.dataset.report;

    if (!reportName) {
        return;
    }

    openReportPreview(
        reportName
    );

}


/* =========================================================
   15. REPORT ACTION HANDLER
========================================================= */

function handleReportAction(
    action,
    element
) {

    switch (action) {

        case "view":
            handleViewReport(element);
            break;

        case "download":
            handleDownloadReport(element);
            break;

        case "delete":
            handleDeleteReport(element);
            break;

        case "profile":
            navigateToProfile();
            break;

        case "settings":
            navigateToSettings();
            break;

        case "logout":
            openLogoutConfirmation();
            break;

        case "clear-notifications":
            clearNotifications();
            break;

        case "scroll-top":
            scrollToTop();
            break;

        case "close-modal":
            closeAllModals();
            break;

        default:
            console.warn(
                "Unknown report action:",
                action
            );

    }

}


/* =========================================================
   16. REPORT FILTERS
========================================================= */

function readFiltersFromDOM() {

    ReportsState.filters.session =
        ReportsDOM.filterSession
            ? ReportsDOM.filterSession.value
            : "";

    ReportsState.filters.semester =
        ReportsDOM.filterSemester
            ? ReportsDOM.filterSemester.value
            : "";

    ReportsState.filters.department =
        ReportsDOM.filterDepartment
            ? ReportsDOM.filterDepartment.value
            : "";

    ReportsState.filters.reportType =
        ReportsDOM.filterType
            ? ReportsDOM.filterType.value
            : "";

}


/* =========================================================
   17. APPLY FILTERS
========================================================= */

function applyReportFilters() {

    readFiltersFromDOM();

    saveFilters();

    updateFilterDependentUI();

    showToast(
        "Report filters applied.",
        "success"
    );

}


/* =========================================================
   18. RESET FILTERS
========================================================= */

function resetReportFilters() {

    if (ReportsDOM.filterSession) {
        ReportsDOM.filterSession.value = "";
    }

    if (ReportsDOM.filterSemester) {
        ReportsDOM.filterSemester.value = "";
    }

    if (ReportsDOM.filterDepartment) {
        ReportsDOM.filterDepartment.value = "";
    }

    if (ReportsDOM.filterType) {
        ReportsDOM.filterType.value = "";
    }

    ReportsState.filters = {
        session: "",
        semester: "",
        department: "",
        reportType: ""
    };

    removeSavedFilters();

    updateFilterDependentUI();

    showToast(
        "Report filters reset.",
        "success"
    );

}


/* =========================================================
   19. FILTER DEPENDENT UI
========================================================= */

function updateFilterDependentUI() {

    /*
     * Important:
     * No statistics are fabricated here.
     *
     * The selected filters are only stored and
     * displayed until the backend API provides
     * actual report data.
     */

    const filterSummary =
        document.querySelector(
            "[data-filter-summary]"
        );

    if (!filterSummary) {
        return;
    }

    const activeFilters = [];

    if (ReportsState.filters.session) {

        activeFilters.push(
            `Session: ${ReportsState.filters.session}`
        );

    }

    if (ReportsState.filters.semester) {

        activeFilters.push(
            `Semester: ${ReportsState.filters.semester}`
        );

    }

    if (ReportsState.filters.department) {

        activeFilters.push(
            `Department: ${ReportsState.filters.department}`
        );

    }

    if (ReportsState.filters.reportType) {

        activeFilters.push(
            `Type: ${ReportsState.filters.reportType}`
        );

    }

    filterSummary.textContent =
        activeFilters.length
            ? activeFilters.join(" • ")
            : "All available data";


}


/* =========================================================
   20. SAVE FILTERS
========================================================= */

function saveFilters() {

    try {

        localStorage.setItem(
            CONFIG.STORAGE_KEYS.FILTERS,
            JSON.stringify(
                ReportsState.filters
            )
        );

    } catch (error) {

        console.warn(
            "Unable to save report filters.",
            error
        );

    }

}


/* =========================================================
   21. LOAD FILTERS
========================================================= */

function loadSavedFilters() {

    try {

        const saved =
            localStorage.getItem(
                CONFIG.STORAGE_KEYS.FILTERS
            );

        if (!saved) {
            return;
        }

        const filters =
            JSON.parse(saved);

        if (!filters) {
            return;
        }

        ReportsState.filters = {
            ...ReportsState.filters,
            ...filters
        };

        applyFiltersToDOM();

    } catch (error) {

        console.warn(
            "Unable to load saved report filters.",
            error
        );

    }

}


/* =========================================================
   22. APPLY SAVED FILTERS TO DOM
========================================================= */

function applyFiltersToDOM() {

    if (ReportsDOM.filterSession) {

        ReportsDOM.filterSession.value =
            ReportsState.filters.session || "";

    }

    if (ReportsDOM.filterSemester) {

        ReportsDOM.filterSemester.value =
            ReportsState.filters.semester || "";

    }

    if (ReportsDOM.filterDepartment) {

        ReportsDOM.filterDepartment.value =
            ReportsState.filters.department || "";

    }

    if (ReportsDOM.filterType) {

        ReportsDOM.filterType.value =
            ReportsState.filters.reportType || "";

    }

}


/* =========================================================
   23. REMOVE SAVED FILTERS
========================================================= */

function removeSavedFilters() {

    try {

        localStorage.removeItem(
            CONFIG.STORAGE_KEYS.FILTERS
        );

    } catch (error) {

        console.warn(
            "Unable to remove saved filters.",
            error
        );

    }

}


/* =========================================================
   24. REPORT PREVIEW
========================================================= */

function openReportPreview(
    reportName
) {

    const overlay =
        document.querySelector(
            '[data-modal="report-preview"]'
        );

    if (!overlay) {

        showToast(
            `${formatReportName(reportName)} selected.`,
            "success"
        );

        return;

    }

    const title =
        overlay.querySelector(
            "[data-modal-title]"
        );

    const body =
        overlay.querySelector(
            "[data-modal-body]"
        );

    if (title) {

        title.textContent =
            formatReportName(reportName);

    }

    if (body) {

        body.innerHTML = `
            <div class="modal-empty-state">
                <i class="fa-solid fa-chart-column"></i>

                <h4>
                    Report data is not available yet
                </h4>

                <p>
                    This report is connected to the
                    CampusConnect reporting system and
                    will display live data after the
                    backend API is connected.
                </p>
            </div>
        `;

    }

    openModal(overlay);

}


/* =========================================================
   25. FORMAT REPORT NAME
========================================================= */

function formatReportName(
    value
) {

    if (!value) {
        return "Report";
    }

    return value
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


/* =========================================================
   26. MODAL OPEN
========================================================= */

function openModal(
    overlay
) {

    if (!overlay) {
        return;
    }

    ReportsDOM.modalOverlays =
        document.querySelectorAll(
            ".modal-overlay"
        );

    ReportsDOM.modalOverlays.forEach(
        modal => {

            if (modal !== overlay) {

                modal.classList.remove(
                    "is-active"
                );

            }

        }
    );

    overlay.classList.add(
        "is-active"
    );

    ReportsState.activeModal =
        overlay;

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   27. MODAL CLOSE
========================================================= */

function closeModal(
    overlay
) {

    if (!overlay) {
        return;
    }

    overlay.classList.remove(
        "is-active"
    );

    if (
        ReportsState.activeModal === overlay
    ) {

        ReportsState.activeModal =
            null;

    }

    const anyActiveModal =
        document.querySelector(
            ".modal-overlay.is-active"
        );

    if (!anyActiveModal) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   28. CLOSE ALL MODALS
========================================================= */

function closeAllModals() {

    document.querySelectorAll(
        ".modal-overlay"
    ).forEach(modal => {

        modal.classList.remove(
            "is-active"
        );

    });

    ReportsState.activeModal =
        null;

    document.body.style.overflow =
        "";

}


/* =========================================================
   29. GENERATED REPORTS INITIALIZATION
========================================================= */

function initializeGeneratedReports() {

    /*
     * Reports will eventually come from:
     *
     * GET /admin/reports
     *
     * Until the API is connected, the interface
     * intentionally remains empty.
     */

    ReportsState.generatedReports = [];

    renderGeneratedReports(
        ReportsState.generatedReports
    );

}


/* =========================================================
   30. RENDER GENERATED REPORTS
========================================================= */

function renderGeneratedReports(
    reports
) {

    const container =
        document.querySelector(
            "[data-generated-reports]"
        );

    if (!container) {
        return;
    }

    if (
        !Array.isArray(reports) ||
        reports.length === 0
    ) {

        container.innerHTML = `
            <div class="table-empty-state">
                <i class="fa-regular fa-file-lines"></i>

                <strong>
                    No reports generated
                </strong>

                <span>
                    Generated reports will appear here
                    after the reporting API is connected.
                </span>
            </div>
        `;

        return;

    }

    container.innerHTML =
        reports.map(
            report => createReportRow(report)
        ).join("");

    bindGeneratedReportActions();

}


/* =========================================================
   31. CREATE REPORT ROW
========================================================= */

function createReportRow(
    report
) {

    const reportId =
        escapeHTML(
            report.id || ""
        );

    const reportName =
        escapeHTML(
            report.name || "Untitled Report"
        );

    const reportDate =
        escapeHTML(
            report.date || "—"
        );

    const status =
        escapeHTML(
            report.status || "Pending"
        );

    return `
        <tr data-report-row="${reportId}">

            <td>
                <div class="generated-report-name">

                    <span class="generated-report-icon">
                        <i class="fa-regular fa-file-lines"></i>
                    </span>

                    <span>
                        ${reportName}
                    </span>

                </div>
            </td>

            <td>
                ${reportDate}
            </td>

            <td>
                <span class="report-status">
                    ${status}
                </span>
            </td>

            <td>

                <div class="table-action-group">

                    <button
                        type="button"
                        class="table-action-button"
                        data-report-action="view"
                        data-report-id="${reportId}"
                        title="View report"
                        aria-label="View report"
                    >
                        <i class="fa-regular fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="table-action-button"
                        data-report-action="download"
                        data-report-id="${reportId}"
                        title="Download report"
                        aria-label="Download report"
                    >
                        <i class="fa-solid fa-download"></i>
                    </button>

                    <button
                        type="button"
                        class="table-action-button danger"
                        data-report-action="delete"
                        data-report-id="${reportId}"
                        title="Delete report"
                        aria-label="Delete report"
                    >
                        <i class="fa-regular fa-trash-can"></i>
                    </button>

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   32. BIND GENERATED REPORT ACTIONS
========================================================= */

function bindGeneratedReportActions() {

    document.querySelectorAll(
        "[data-report-action='view'], " +
        "[data-report-action='download'], " +
        "[data-report-action='delete']"
    ).forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                handleReportAction(
                    button.dataset.reportAction,
                    button
                );

            }
        );

    });

}


/* =========================================================
   33. HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}

/* =========================================================
   CAMPUSCONNECT
   ADMIN — REPORTS & ANALYTICS
   JAVASCRIPT PART 2
   CONTINUE DIRECTLY AFTER JS PART 1
========================================================= */


/* =========================================================
   34. GENERATE REPORT
========================================================= */

async function handleGenerateReport() {

    const button =
        ReportsDOM.generateReportButton;

    if (button && button.classList.contains("is-loading")) {
        return;
    }

    readFiltersFromDOM();

    const reportName =
        ReportsState.filters.reportType ||
        getCustomReportType();

    if (!reportName) {

        showToast(
            "Please select a report type first.",
            "warning"
        );

        return;
    }

    setButtonLoading(
        button,
        true
    );

    try {

        /*
         * The backend is not connected yet.
         *
         * We intentionally DO NOT create fake report
         * data here.
         *
         * When the Java backend is ready, this function
         * will send the selected filters to:
         *
         * POST /admin/reports
         */

        const apiAvailable =
            Boolean(CONFIG.API_BASE_URL);

        if (!apiAvailable) {

            showToast(
                "Report generation is ready for API connection.",
                "success"
            );

            return;
        }

        const payload = {
            reportType:
                ReportsState.filters.reportType,

            session:
                ReportsState.filters.session,

            semester:
                ReportsState.filters.semester,

            department:
                ReportsState.filters.department
        };

        const response =
            await apiRequest(
                CONFIG.ENDPOINTS.reports,
                {
                    method: "POST",
                    body: payload
                }
            );

        if (!response) {
            return;
        }

        await loadGeneratedReports();

        showToast(
            "Report generated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Generate report error:",
            error
        );

        showToast(
            "Unable to generate the report.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


/* =========================================================
   35. CUSTOM REPORT TYPE
========================================================= */

function getCustomReportType() {

    const customReportSelect =
        document.querySelector(
            '[name="customReportType"]'
        );

    if (!customReportSelect) {
        return "";
    }

    return customReportSelect.value || "";

}


/* =========================================================
   36. LOAD GENERATED REPORTS
========================================================= */

async function loadGeneratedReports() {

    try {

        const response =
            await apiRequest(
                CONFIG.ENDPOINTS.reports,
                {
                    method: "GET"
                }
            );

        if (!Array.isArray(response)) {

            renderGeneratedReports([]);

            return;

        }

        ReportsState.generatedReports =
            response;

        renderGeneratedReports(
            ReportsState.generatedReports
        );

    } catch (error) {

        console.error(
            "Unable to load generated reports:",
            error
        );

        /*
         * Do not display fake report entries.
         */

        ReportsState.generatedReports = [];

        renderGeneratedReports([]);

    }

}


/* =========================================================
   37. VIEW REPORT
========================================================= */

function handleViewReport(
    element
) {

    const reportId =
        element?.dataset?.reportId;

    if (!reportId) {

        showToast(
            "Report ID is unavailable.",
            "warning"
        );

        return;
    }

    const report =
        ReportsState.generatedReports.find(
            item =>
                String(item.id) ===
                String(reportId)
        );

    if (!report) {

        showToast(
            "This report is no longer available.",
            "warning"
        );

        return;
    }

    openGeneratedReportPreview(
        report
    );

}


/* =========================================================
   38. GENERATED REPORT PREVIEW
========================================================= */

function openGeneratedReportPreview(
    report
) {

    const overlay =
        document.querySelector(
            '[data-modal="report-preview"]'
        );

    if (!overlay) {

        showToast(
            "Report preview window is unavailable.",
            "warning"
        );

        return;
    }

    const title =
        overlay.querySelector(
            "[data-modal-title]"
        );

    const body =
        overlay.querySelector(
            "[data-modal-body]"
        );

    if (title) {

        title.textContent =
            report.name ||
            "Report Preview";

    }

    if (body) {

        body.innerHTML = `
            <div class="modal-empty-state">

                <i class="fa-regular fa-file-lines"></i>

                <h4>
                    Report preview
                </h4>

                <p>
                    The report record has been received
                    from the CampusConnect API. Connect
                    the report file or generated dataset
                    endpoint here to display its contents.
                </p>

            </div>
        `;

    }

    openModal(overlay);

}


/* =========================================================
   39. DOWNLOAD REPORT
========================================================= */

async function handleDownloadReport(
    element
) {

    const reportId =
        element?.dataset?.reportId;

    if (!reportId) {

        showToast(
            "Report ID is unavailable.",
            "warning"
        );

        return;
    }

    const report =
        ReportsState.generatedReports.find(
            item =>
                String(item.id) ===
                String(reportId)
        );

    if (!report) {

        showToast(
            "This report is no longer available.",
            "warning"
        );

        return;
    }

    /*
     * The frontend does not create a fake file.
     *
     * The backend should eventually return either:
     *
     * 1. A downloadable URL
     * 2. A file response
     * 3. A generated report identifier
     */

    if (report.downloadUrl) {

        window.open(
            report.downloadUrl,
            "_blank",
            "noopener,noreferrer"
        );

        return;
    }

    if (!CONFIG.API_BASE_URL) {

        showToast(
            "Download will be available after the report API is connected.",
            "warning"
        );

        return;
    }

    try {

        const endpoint =
            `${CONFIG.ENDPOINTS.reports}/${encodeURIComponent(reportId)}/download`;

        const response =
            await apiRequest(
                endpoint,
                {
                    method: "GET",
                    rawResponse: true
                }
            );

        if (!response) {
            return;
        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const anchor =
            document.createElement("a");

        anchor.href = url;

        anchor.download =
            report.fileName ||
            `${report.name || "report"}.pdf`;

        document.body.appendChild(
            anchor
        );

        anchor.click();

        anchor.remove();

        window.URL.revokeObjectURL(
            url
        );

        showToast(
            "Report download started.",
            "success"
        );

    } catch (error) {

        console.error(
            "Report download error:",
            error
        );

        showToast(
            "Unable to download this report.",
            "error"
        );

    }

}


/* =========================================================
   40. DELETE REPORT
========================================================= */

function handleDeleteReport(
    element
) {

    const reportId =
        element?.dataset?.reportId;

    if (!reportId) {

        showToast(
            "Report ID is unavailable.",
            "warning"
        );

        return;
    }

    const report =
        ReportsState.generatedReports.find(
            item =>
                String(item.id) ===
                String(reportId)
        );

    if (!report) {

        showToast(
            "This report is no longer available.",
            "warning"
        );

        return;
    }

    openDeleteConfirmation(
        report
    );

}


/* =========================================================
   41. DELETE CONFIRMATION
========================================================= */

function openDeleteConfirmation(
    report
) {

    const overlay =
        document.querySelector(
            '[data-modal="delete-report"]'
        );

    if (!overlay) {

        showToast(
            "Delete confirmation window is unavailable.",
            "warning"
        );

        return;
    }

    const title =
        overlay.querySelector(
            "[data-confirmation-title]"
        );

    const message =
        overlay.querySelector(
            "[data-confirmation-message]"
        );

    const confirmButton =
        overlay.querySelector(
            '[data-report-action="confirm-delete"]'
        );

    if (title) {

        title.textContent =
            "Delete Report";

    }

    if (message) {

        message.textContent =
            `Are you sure you want to delete "${report.name || "this report"}"?`;

    }

    if (confirmButton) {

        confirmButton.dataset.reportId =
            report.id;

    }

    openModal(overlay);

}


/* =========================================================
   42. CONFIRM DELETE
========================================================= */

async function confirmDeleteReport(
    element
) {

    const reportId =
        element?.dataset?.reportId;

    if (!reportId) {
        return;
    }

    if (!CONFIG.API_BASE_URL) {

        showToast(
            "Delete will be available after the report API is connected.",
            "warning"
        );

        closeAllModals();

        return;
    }

    try {

        setButtonLoading(
            element,
            true
        );

        await apiRequest(
            `${CONFIG.ENDPOINTS.reports}/${encodeURIComponent(reportId)}`,
            {
                method: "DELETE"
            }
        );

        ReportsState.generatedReports =
            ReportsState.generatedReports.filter(
                report =>
                    String(report.id) !==
                    String(reportId)
            );

        renderGeneratedReports(
            ReportsState.generatedReports
        );

        closeAllModals();

        showToast(
            "Report deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Delete report error:",
            error
        );

        showToast(
            "Unable to delete the report.",
            "error"
        );

    } finally {

        setButtonLoading(
            element,
            false
        );

    }

}


/* =========================================================
   43. BIND DELETE CONFIRMATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const confirmDeleteButton =
            document.querySelector(
                '[data-report-action="confirm-delete"]'
            );

        if (confirmDeleteButton) {

            confirmDeleteButton.addEventListener(
                "click",
                () =>
                    confirmDeleteReport(
                        confirmDeleteButton
                    )
            );

        }

    }
);


/* =========================================================
   44. REPORT SEARCH
========================================================= */

function handleReportSearch(
    event
) {

    const searchTerm =
        event.target.value
            .trim()
            .toLowerCase();

    const rows =
        document.querySelectorAll(
            "[data-report-row]"
        );

    rows.forEach(row => {

        const text =
            row.textContent
                .toLowerCase();

        row.hidden =
            searchTerm &&
            !text.includes(searchTerm);

    });

    updateSearchEmptyState(
        searchTerm,
        rows
    );

}


/* =========================================================
   45. SEARCH EMPTY STATE
========================================================= */

function updateSearchEmptyState(
    searchTerm,
    rows
) {

    const tableBody =
        document.querySelector(
            "[data-generated-reports]"
        );

    if (!tableBody) {
        return;
    }

    const visibleRows =
        Array.from(rows)
            .filter(row => !row.hidden);

    const existingMessage =
        tableBody.querySelector(
            "[data-search-empty]"
        );

    if (!searchTerm) {

        if (existingMessage) {
            existingMessage.remove();
        }

        return;
    }

    if (visibleRows.length > 0) {

        if (existingMessage) {
            existingMessage.remove();
        }

        return;
    }

    if (existingMessage) {
        return;
    }

    const emptyRow =
        document.createElement("tr");

    emptyRow.dataset.searchEmpty =
        "true";

    emptyRow.innerHTML = `
        <td colspan="10">

            <div class="table-empty-state">

                <i class="fa-solid fa-magnifying-glass"></i>

                <strong>
                    No matching reports
                </strong>

                <span>
                    Try another report name or search term.
                </span>

            </div>

        </td>
    `;

    tableBody.appendChild(
        emptyRow
    );

}


/* =========================================================
   46. LOGOUT CONFIRMATION
========================================================= */

function openLogoutConfirmation() {

    closeProfileDropdown();

    const overlay =
        document.querySelector(
            '[data-modal="logout"]'
        );

    if (!overlay) {

        showToast(
            "Logout confirmation is unavailable.",
            "warning"
        );

        return;
    }

    openModal(
        overlay
    );

}


/* =========================================================
   47. CONFIRM LOGOUT
========================================================= */

function confirmLogout() {

    /*
     * Clear only authentication/session information.
     *
     * Do not remove CampusConnect report filters
     * unless the authentication architecture requires it.
     */

    try {

        localStorage.removeItem(
            "campusconnect_auth"
        );

        sessionStorage.removeItem(
            "campusconnect_auth"
        );

        localStorage.removeItem(
            "campusconnect_user"
        );

        sessionStorage.removeItem(
            "campusconnect_user"
        );

    } catch (error) {

        console.warn(
            "Unable to clear authentication storage.",
            error
        );

    }

    /*
     * Update this path if your login file is located
     * at a different relative location.
     */

    window.location.href =
        "../../Login/login.html";

}


/* =========================================================
   48. NAVIGATION — PROFILE
========================================================= */

function navigateToProfile() {

    closeProfileDropdown();

    /*
     * Change this path if the Admin profile page
     * is stored elsewhere.
     */

    window.location.href =
        "../profile.html";

}


/* =========================================================
   49. NAVIGATION — SETTINGS
========================================================= */

function navigateToSettings() {

    closeProfileDropdown();

    /*
     * Admin Settings is expected to be inside
     * the Admin dashboard module.
     */

    window.location.href =
        "settings.html";

}


/* =========================================================
   50. CLEAR NOTIFICATIONS
========================================================= */

function clearNotifications() {

    const list =
        document.querySelector(
            ".notification-list"
        );

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="notification-empty-state">

            <i class="fa-regular fa-bell-slash"></i>

            <strong>
                No notifications
            </strong>

            <span>
                You're all caught up.
            </span>

        </div>
    `;

    const badge =
        document.querySelector(
            ".notification-badge"
        );

    if (badge) {

        badge.textContent =
            "0";

        badge.hidden =
            true;

    }

    showToast(
        "Notifications cleared.",
        "success"
    );

}


/* =========================================================
   51. SCROLL BUTTON
========================================================= */

function initializeScrollButton() {

    if (!ReportsDOM.scrollTopButton) {
        return;
    }

    window.addEventListener(
        "scroll",
        updateScrollButton,
        {
            passive: true
        }
    );

    ReportsDOM.scrollTopButton.addEventListener(
        "click",
        scrollToTop
    );

    updateScrollButton();

}


/* =========================================================
   52. UPDATE SCROLL BUTTON
========================================================= */

function updateScrollButton() {

    if (!ReportsDOM.scrollTopButton) {
        return;
    }

    ReportsDOM.scrollTopButton.classList.toggle(
        "is-active",
        window.scrollY > 350
    );

}


/* =========================================================
   53. SCROLL TO TOP
========================================================= */

function scrollToTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   54. TOAST MESSAGE
========================================================= */

function showToast(
    message,
    type = "success"
) {

    let container =
        ReportsDOM.toastContainer;

    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );

        ReportsDOM.toastContainer =
            container;

    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `toast ${getToastClass(type)}`;

    const icon =
        getToastIcon(type);

    toast.innerHTML = `
        <i class="${icon}"></i>
        <span></span>
    `;

    const text =
        toast.querySelector("span");

    if (text) {

        text.textContent =
            message;

    }

    container.appendChild(
        toast
    );

    window.setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";

            window.setTimeout(
                () => toast.remove(),
                220
            );

        },
        3200
    );

}


/* =========================================================
   55. TOAST CLASS
========================================================= */

function getToastClass(
    type
) {

    switch (type) {

        case "success":
            return "success";

        case "warning":
            return "warning";

        case "error":
            return "error";

        default:
            return "";

    }

}


/* =========================================================
   56. TOAST ICON
========================================================= */

function getToastIcon(
    type
) {

    switch (type) {

        case "success":
            return "fa-solid fa-circle-check";

        case "warning":
            return "fa-solid fa-triangle-exclamation";

        case "error":
            return "fa-solid fa-circle-xmark";

        default:
            return "fa-solid fa-circle-info";

    }

}


/* =========================================================
   57. BUTTON LOADING STATE
========================================================= */

function setButtonLoading(
    button,
    isLoading
) {

    if (!button) {
        return;
    }

    button.classList.toggle(
        "is-loading",
        isLoading
    );

    button.disabled =
        isLoading;

    const icon =
        button.querySelector("i");

    if (!icon) {
        return;
    }

    if (isLoading) {

        button.dataset.originalIcon =
            icon.className;

        icon.className =
            "fa-solid fa-spinner fa-spin";

    } else {

        icon.className =
            button.dataset.originalIcon ||
            icon.className
                .replace(
                    "fa-spinner",
                    ""
                )
                .replace(
                    "fa-spin",
                    ""
                )
                .trim();

    }

}


/* =========================================================
   58. PAGE LOADER
========================================================= */

function hidePageLoader() {

    const loader =
        ReportsDOM.pageLoader;

    if (!loader) {
        return;
    }

    window.setTimeout(
        () => {

            loader.classList.add(
                "is-hidden"
            );

        },
        250
    );

}


/* =========================================================
   59. API REQUEST HELPER
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const {

        method = "GET",

        body = null,

        rawResponse = false,

        headers = {}

    } = options;


    if (!endpoint) {

        throw new Error(
            "API endpoint is required."
        );

    }


    const baseURL =
        CONFIG.API_BASE_URL || "";


    const requestURL =
        `${baseURL}${endpoint}`;


    const controller =
        new AbortController();


    const timeout =
        window.setTimeout(
            () =>
                controller.abort(),
            CONFIG.REQUEST_TIMEOUT
        );


    const requestHeaders = {
        "Accept":
            "application/json",
        ...headers
    };


    const requestOptions = {

        method,

        headers:
            requestHeaders,

        signal:
            controller.signal,

        credentials:
            "include"

    };


    if (
        body !== null &&
        method !== "GET" &&
        method !== "HEAD"
    ) {

        requestHeaders[
            "Content-Type"
        ] =
            "application/json";

        requestOptions.body =
            JSON.stringify(body);

    }


    try {

        const response =
            await fetch(
                requestURL,
                requestOptions
            );


        if (rawResponse) {

            if (!response.ok) {

                throw new Error(
                    `API request failed: ${response.status}`
                );

            }

            return response;

        }


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (!response.ok) {

            let errorMessage =
                `API request failed: ${response.status}`;

            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                const errorData =
                    await response.json();

                errorMessage =
                    errorData.message ||
                    errorMessage;

            }

            throw new Error(
                errorMessage
            );

        }


        if (
            response.status === 204
        ) {

            return null;

        }


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            return await response.json();

        }


        return await response.text();

    } finally {

        window.clearTimeout(
            timeout
        );

    }

}


/* =========================================================
   60. API INITIALIZATION HOOK
========================================================= */

async function initializeReportsAPI() {

    /*
     * The current frontend intentionally does not
     * request data when API_BASE_URL is empty.
     *
     * Once the Java REST API is available, set:
     *
     * CONFIG.API_BASE_URL = "http://localhost:8080/api";
     *
     * or your deployed API URL.
     */

    if (!CONFIG.API_BASE_URL) {
        return;
    }

    try {

        await loadGeneratedReports();

    } catch (error) {

        console.error(
            "Reports API initialization failed:",
            error
        );

    }

}


/* =========================================================
   61. OPTIONAL API INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeReportsAPI();

    }
);


/* =========================================================
   62. GLOBAL NOTIFICATION PLACEHOLDER
========================================================= */

function initializeGlobalNotificationPlaceholder() {

    const placeholder =
        document.getElementById(
            "globalNotificationPlaceholder"
        );

    if (!placeholder) {
        return;
    }

    /*
     * CampusConnect uses ONE global notification
     * system across Student, Faculty and Admin.
     *
     * This page does not create a separate notification
     * system or separate module-specific bell.
     *
     * The existing notification panel can later be
     * populated from the global notification API.
     */

}


/* =========================================================
   63. INITIALIZE GLOBAL NOTIFICATIONS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeGlobalNotificationPlaceholder();

    }
);


/* =========================================================
   64. REPORT DATA REFRESH HOOK
========================================================= */

async function refreshReportData() {

    if (!CONFIG.API_BASE_URL) {

        showToast(
            "Live report data will appear after the backend API is connected.",
            "warning"
        );

        return;

    }

    try {

        ReportsState.isLoading =
            true;

        await loadGeneratedReports();

        ReportsState.isLoading =
            false;

        showToast(
            "Report data refreshed.",
            "success"
        );

    } catch (error) {

        ReportsState.isLoading =
            false;

        console.error(
            "Report refresh error:",
            error
        );

        showToast(
            "Unable to refresh report data.",
            "error"
        );

    }

}


/* =========================================================
   65. FINAL INITIALIZATION
========================================================= */

window.CampusConnectReports = {

    state:
        ReportsState,

    config:
        CONFIG,

    refresh:
        refreshReportData,

    applyFilters:
        applyReportFilters,

    resetFilters:
        resetReportFilters,

    generateReport:
        handleGenerateReport,

    openReport:
        openReportPreview,

    closeModals:
        closeAllModals

};


/* =========================================================
   END OF REPORTS & ANALYTICS JAVASCRIPT
========================================================= */