/* =========================================================
   CAMPUSCONNECT
   ADMIN RESULTS MODULE
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        SUMMARY: "/admin/results/summary",

        RESULTS: "/admin/results",

        RESULT_BY_ID: "/admin/results/{id}",

        SESSIONS: "/admin/academic-sessions",

        DEPARTMENTS: "/admin/departments",

        EXAMS: "/admin/examinations",

        ANALYTICS: "/admin/results/analytics"

    }

};


/* =========================================================
   STATE
========================================================= */

const state = {

    results: [],

    filteredResults: [],

    currentPage: 1,

    pageSize: 10,

    filters: {

        session: "",
        semester: "",
        examination: "",
        department: "",
        status: "",
        search: ""

    },

    selectedResult: null

};


/* =========================================================
   DOM REFERENCES
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

    sessionFilter:
        document.getElementById("sessionFilter"),

    semesterFilter:
        document.getElementById("semesterFilter"),

    examFilter:
        document.getElementById("examFilter"),

    departmentFilter:
        document.getElementById("departmentFilter"),

    statusFilter:
        document.getElementById("statusFilter"),

    clearFiltersBtn:
        document.getElementById("clearFiltersBtn"),

    resultSearch:
        document.getElementById("resultSearch"),

    resultsTableBody:
        document.getElementById("resultsTableBody"),

    resultsEmptyState:
        document.getElementById("resultsEmptyState"),

    resultCount:
        document.getElementById("resultCount"),

    previousPageBtn:
        document.getElementById("previousPageBtn"),

    nextPageBtn:
        document.getElementById("nextPageBtn"),

    pageNumber:
        document.getElementById("pageNumber"),

    publishedResults:
        document.getElementById("publishedResults"),

    pendingResults:
        document.getElementById("pendingResults"),

    studentsWithResults:
        document.getElementById("studentsWithResults"),

    examinationsCount:
        document.getElementById("examinationsCount"),

    passRate:
        document.getElementById("passRate"),

    passRateProgress:
        document.getElementById("passRateProgress"),

    averagePerformance:
        document.getElementById("averagePerformance"),

    subjectPerformance:
        document.getElementById("subjectPerformance"),

    attentionStudents:
        document.getElementById("attentionStudents"),

    addResultBtn:
        document.getElementById("addResultBtn"),

    emptyAddResultBtn:
        document.getElementById("emptyAddResultBtn"),

    addResultModal:
        document.getElementById("addResultModal"),

    closeAddResultBtn:
        document.getElementById("closeAddResultBtn"),

    cancelAddResultBtn:
        document.getElementById("cancelAddResultBtn"),

    addResultForm:
        document.getElementById("addResultForm"),

    resultDetailsModal:
        document.getElementById("resultDetailsModal"),

    closeDetailsBtn:
        document.getElementById("closeDetailsBtn"),

    resultDetailContent:
        document.getElementById("resultDetailContent"),

    resultDetailsTitle:
        document.getElementById("resultDetailsTitle"),

    exportBtn:
        document.getElementById("exportBtn"),

    semesterReportBtn:
        document.getElementById("semesterReportBtn"),

    departmentReportBtn:
        document.getElementById("departmentReportBtn"),

    performanceReportBtn:
        document.getElementById("performanceReportBtn"),

    toastContainer:
        document.getElementById("toastContainer")

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeEventListeners();

    loadResults();

});


/* =========================================================
   EVENT LISTENERS
========================================================= */

function initializeEventListeners() {


    /* Back */

    elements.backBtn.addEventListener(
        "click",
        handleBack
    );


    /* Refresh */

    elements.refreshBtn.addEventListener(
        "click",
        handleRefresh
    );


    /* Notifications */

    elements.notificationBtn.addEventListener(
        "click",
        toggleNotificationPanel
    );


    elements.closeNotificationBtn.addEventListener(
        "click",
        closeNotificationPanel
    );


    /* Filters */

    elements.sessionFilter.addEventListener(
        "change",
        handleFilterChange
    );


    elements.semesterFilter.addEventListener(
        "change",
        handleFilterChange
    );


    elements.examFilter.addEventListener(
        "change",
        handleFilterChange
    );


    elements.departmentFilter.addEventListener(
        "change",
        handleFilterChange
    );


    elements.statusFilter.addEventListener(
        "change",
        handleFilterChange
    );


    elements.resultSearch.addEventListener(
        "input",
        handleFilterChange
    );


    elements.clearFiltersBtn.addEventListener(
        "click",
        clearFilters
    );


    /* Pagination */

    elements.previousPageBtn.addEventListener(
        "click",
        () => {

            if (state.currentPage > 1) {

                state.currentPage--;

                renderResults();

            }

        }
    );


    elements.nextPageBtn.addEventListener(
        "click",
        () => {

            const totalPages =
                Math.ceil(
                    state.filteredResults.length /
                    state.pageSize
                );

            if (
                state.currentPage <
                totalPages
            ) {

                state.currentPage++;

                renderResults();

            }

        }
    );


    /* Add Result */

    elements.addResultBtn.addEventListener(
        "click",
        openAddResultModal
    );


    elements.emptyAddResultBtn.addEventListener(
        "click",
        openAddResultModal
    );


    elements.closeAddResultBtn.addEventListener(
        "click",
        closeAddResultModal
    );


    elements.cancelAddResultBtn.addEventListener(
        "click",
        closeAddResultModal
    );


    elements.addResultForm.addEventListener(
        "submit",
        handleAddResult
    );


    /* Result Details */

    elements.closeDetailsBtn.addEventListener(
        "click",
        closeResultDetails
    );


    /* Export */

    elements.exportBtn.addEventListener(
        "click",
        exportResults
    );


    /* Reports */

    elements.semesterReportBtn.addEventListener(
        "click",
        () => {

            showToast(
                "Semester result report will be generated from backend data."
            );

        }
    );


    elements.departmentReportBtn.addEventListener(
        "click",
        () => {

            showToast(
                "Department report will be generated from backend data."
            );

        }
    );


    elements.performanceReportBtn.addEventListener(
        "click",
        () => {

            showToast(
                "Performance report will be generated from backend data."
            );

        }
    );


    /* Escape */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    /* Click outside modal */

    elements.addResultModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.addResultModal
            ) {

                closeAddResultModal();

            }

        }
    );


    elements.resultDetailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.resultDetailsModal
            ) {

                closeResultDetails();

            }

        }
    );

}


/* =========================================================
   BACK
========================================================= */

function handleBack() {

    if (window.history.length > 1) {

        window.history.back();

    } else {

        window.location.href =
            "../admin-dashboard.html";

    }

}


/* =========================================================
   REFRESH
========================================================= */

async function handleRefresh() {

    const icon =
        elements.refreshBtn.querySelector("i");

    icon.classList.add("fa-spin");

    try {

        await loadResults();

        showToast(
            "Results refreshed."
        );

    } finally {

        setTimeout(() => {

            icon.classList.remove("fa-spin");

        }, 400);

    }

}


/* =========================================================
   LOAD RESULTS
========================================================= */

async function loadResults() {

    /*
        Backend integration point.

        When the Java/Spring backend is connected,
        fetch the following:

        GET /admin/results
        GET /admin/results/summary
        GET /admin/results/analytics

        Until then, the page intentionally remains
        empty instead of displaying fake records.
    */

    try {

        if (!CONFIG.API_BASE_URL) {

            state.results = [];

            state.filteredResults = [];

            renderResults();

            updateSummary(null);

            updateAnalytics(null);

            return;

        }


        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.RESULTS}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load results."
            );

        }


        const data =
            await response.json();


        state.results =
            Array.isArray(data)
                ? data
                : data.results || [];


        state.filteredResults =
            [...state.results];


        populateDynamicFilters();

        applyFilters();

    } catch (error) {

        console.error(
            "Results loading error:",
            error
        );

        state.results = [];

        state.filteredResults = [];

        renderResults();

        showToast(
            "Unable to load result data."
        );

    }

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults() {

    const total =
        state.filteredResults.length;


    elements.resultsTableBody.innerHTML = "";


    if (total === 0) {

        elements.resultsEmptyState.hidden = false;

        elements.resultCount.textContent =
            "No records";

        elements.pageNumber.textContent =
            "1";

        elements.previousPageBtn.disabled =
            true;

        elements.nextPageBtn.disabled =
            true;

        return;

    }


    elements.resultsEmptyState.hidden = true;


    const start =
        (state.currentPage - 1) *
        state.pageSize;


    const end =
        start + state.pageSize;


    const records =
        state.filteredResults.slice(
            start,
            end
        );


    records.forEach(result => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <div class="result-student">

                    ${escapeHTML(
                        result.studentName || "—"
                    )}

                </div>

            </td>


            <td>
                ${escapeHTML(
                    result.rollNumber || "—"
                )}
            </td>


            <td>
                ${escapeHTML(
                    result.department || "—"
                )}
            </td>


            <td>
                ${escapeHTML(
                    result.semester || "—"
                )}
            </td>


            <td>
                ${formatExamName(
                    result.examination
                )}
            </td>


            <td>
                ${createStatusBadge(
                    result.status
                )}
            </td>


            <td>

                <button
                    type="button"
                    class="table-action"
                    data-result-id="${escapeHTML(
                        String(result.id ?? "")
                    )}"
                >

                    <i class="fa-solid fa-eye"></i>

                    View

                </button>

            </td>

        `;


        const viewButton =
            row.querySelector(
                ".table-action"
            );


        viewButton.addEventListener(
            "click",
            () => {

                openResultDetails(
                    result
                );

            }
        );


        elements.resultsTableBody.appendChild(
            row
        );

    });


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                state.pageSize
            )
        );


    elements.resultCount.textContent =
        `${total} record${total === 1 ? "" : "s"}`;


    elements.pageNumber.textContent =
        state.currentPage;


    elements.previousPageBtn.disabled =
        state.currentPage <= 1;


    elements.nextPageBtn.disabled =
        state.currentPage >= totalPages;

}


/* =========================================================
   FILTERS
========================================================= */

function handleFilterChange() {

    state.filters.session =
        elements.sessionFilter.value;

    state.filters.semester =
        elements.semesterFilter.value;

    state.filters.examination =
        elements.examFilter.value;

    state.filters.department =
        elements.departmentFilter.value;

    state.filters.status =
        elements.statusFilter.value;

    state.filters.search =
        elements.resultSearch.value
            .trim()
            .toLowerCase();


    state.currentPage = 1;

    applyFilters();

}


function applyFilters() {

    state.filteredResults =
        state.results.filter(result => {

            const matchesSession =
                !state.filters.session ||
                String(result.session || "")
                    ===
                state.filters.session;


            const matchesSemester =
                !state.filters.semester ||
                String(result.semester || "")
                    ===
                state.filters.semester;


            const matchesExam =
                !state.filters.examination ||
                String(result.examination || "")
                    .toLowerCase()
                    ===
                state.filters.examination
                    .toLowerCase();


            const matchesDepartment =
                !state.filters.department ||
                String(result.department || "")
                    ===
                state.filters.department;


            const matchesStatus =
                !state.filters.status ||
                String(result.status || "")
                    .toLowerCase()
                    ===
                state.filters.status
                    .toLowerCase();


            const searchableText =
                [
                    result.studentName,
                    result.rollNumber,
                    result.department
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


            const matchesSearch =
                !state.filters.search ||
                searchableText.includes(
                    state.filters.search
                );


            return (
                matchesSession &&
                matchesSemester &&
                matchesExam &&
                matchesDepartment &&
                matchesStatus &&
                matchesSearch
            );

        });


    renderResults();

}


function clearFilters() {

    elements.sessionFilter.value = "";
    elements.semesterFilter.value = "";
    elements.examFilter.value = "";
    elements.departmentFilter.value = "";
    elements.statusFilter.value = "";
    elements.resultSearch.value = "";

    state.filters = {

        session: "",
        semester: "",
        examination: "",
        department: "",
        status: "",
        search: ""

    };


    state.currentPage = 1;

    applyFilters();

}


/* =========================================================
   DYNAMIC FILTERS
========================================================= */

function populateDynamicFilters() {

    const sessions =
        uniqueValues(
            state.results.map(
                result => result.session
            )
        );


    const departments =
        uniqueValues(
            state.results.map(
                result => result.department
            )
        );


    populateSelect(
        elements.sessionFilter,
        sessions,
        "All Sessions"
    );


    populateSelect(
        elements.departmentFilter,
        departments,
        "All Departments"
    );

}


function populateSelect(
    select,
    values,
    defaultText
) {

    const currentValue =
        select.value;


    select.innerHTML = "";


    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent =
        defaultText;

    select.appendChild(
        defaultOption
    );


    values.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });


    if (
        values.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


function uniqueValues(values) {

    return [
        ...new Set(
            values
                .filter(
                    value =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                )
                .map(
                    value =>
                        String(value)
                )
        )
    ].sort();

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(summary) {

    if (!summary) {

        elements.publishedResults.textContent = "—";
        elements.pendingResults.textContent = "—";
        elements.studentsWithResults.textContent = "—";
        elements.examinationsCount.textContent = "—";

        return;

    }


    elements.publishedResults.textContent =
        summary.publishedResults ?? "—";


    elements.pendingResults.textContent =
        summary.pendingResults ?? "—";


    elements.studentsWithResults.textContent =
        summary.studentsWithResults ?? "—";


    elements.examinationsCount.textContent =
        summary.examinationsCount ?? "—";

}


/* =========================================================
   ANALYTICS
========================================================= */

function updateAnalytics(analytics) {

    if (!analytics) {

        elements.passRate.textContent = "—";

        elements.passRateProgress.style.width =
            "0%";

        elements.averagePerformance.textContent =
            "—";

        elements.subjectPerformance.textContent =
            "—";

        elements.attentionStudents.textContent =
            "—";

        return;

    }


    const passRate =
        Number(
            analytics.passRate
        );


    elements.passRate.textContent =
        Number.isFinite(passRate)
            ? `${passRate}%`
            : "—";


    elements.passRateProgress.style.width =
        Number.isFinite(passRate)
            ? `${Math.max(
                0,
                Math.min(
                    100,
                    passRate
                )
            )}%`
            : "0%";


    elements.averagePerformance.textContent =
        analytics.averagePerformance ??
        "—";


    elements.subjectPerformance.textContent =
        analytics.subjectPerformance ??
        "—";


    elements.attentionStudents.textContent =
        analytics.attentionStudents ??
        "—";

}


/* =========================================================
   ADD RESULT MODAL
========================================================= */

function openAddResultModal() {

    elements.addResultModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";

}


function closeAddResultModal() {

    elements.addResultModal.hidden =
        true;

    document.body.style.overflow =
        "";

}


async function handleAddResult(event) {

    event.preventDefault();


    const studentId =
        document.getElementById(
            "studentId"
        ).value.trim();


    const session =
        document.getElementById(
            "resultSession"
        ).value.trim();


    const semester =
        document.getElementById(
            "resultSemester"
        ).value;


    const examination =
        document.getElementById(
            "resultExam"
        ).value;


    const status =
        document.getElementById(
            "resultStatus"
        ).value;


    if (
        !studentId ||
        !session ||
        !semester ||
        !examination
    ) {

        showToast(
            "Please complete all required fields."
        );

        return;

    }


    const payload = {

        studentId,

        session,

        semester,

        examination,

        status

    };


    /*
        Backend integration:

        POST /admin/results

        Body:
        {
            studentId,
            session,
            semester,
            examination,
            status
        }
    */


    if (!CONFIG.API_BASE_URL) {

        showToast(
            "Result form is ready. Connect the backend to save result records."
        );

        closeAddResultModal();

        return;

    }


    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.RESULTS}`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to save result."
            );

        }


        closeAddResultModal();

        elements.addResultForm.reset();

        await loadResults();

        showToast(
            "Result saved successfully."
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to save result."
        );

    }

}


/* =========================================================
   RESULT DETAILS
========================================================= */

function openResultDetails(result) {

    state.selectedResult =
        result;


    elements.resultDetailsTitle.textContent =
        result.studentName ||
        "Student Result";


    elements.resultDetailContent.innerHTML = `

        <div class="result-detail-header">


            <div class="detail-item">

                <span>
                    Student
                </span>

                <strong>
                    ${escapeHTML(
                        result.studentName || "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Roll Number
                </span>

                <strong>
                    ${escapeHTML(
                        result.rollNumber || "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Department
                </span>

                <strong>
                    ${escapeHTML(
                        result.department || "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Semester
                </span>

                <strong>
                    ${escapeHTML(
                        result.semester || "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Examination
                </span>

                <strong>
                    ${formatExamName(
                        result.examination
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Session
                </span>

                <strong>
                    ${escapeHTML(
                        result.session || "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Status
                </span>

                <strong>
                    ${createStatusBadge(
                        result.status
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    SGPA
                </span>

                <strong>
                    ${escapeHTML(
                        result.sgpa ?? "—"
                    )}
                </strong>

            </div>

        </div>

    `;


    elements.resultDetailsModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";

}


function closeResultDetails() {

    elements.resultDetailsModal.hidden =
        true;

    document.body.style.overflow =
        "";

}


/* =========================================================
   EXPORT
========================================================= */

function exportResults() {

    if (
        state.filteredResults.length === 0
    ) {

        showToast(
            "There are no result records to export."
        );

        return;

    }


    const headers = [

        "Student",
        "Roll Number",
        "Department",
        "Semester",
        "Examination",
        "Status"

    ];


    const rows =
        state.filteredResults.map(
            result => [

                result.studentName || "",

                result.rollNumber || "",

                result.department || "",

                result.semester || "",

                formatExamName(
                    result.examination
                ),

                result.status || ""

            ]
        );


    const csv = [

        headers,

        ...rows

    ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                    )
                    .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "campusconnect-results.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Result records exported."
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function toggleNotificationPanel() {

    elements.notificationPanel.hidden =
        !elements.notificationPanel.hidden;

}


function closeNotificationPanel() {

    elements.notificationPanel.hidden =
        true;

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(event) {

    if (event.key !== "Escape") {
        return;
    }


    if (
        !elements.addResultModal.hidden
    ) {

        closeAddResultModal();

    }


    if (
        !elements.resultDetailsModal.hidden
    ) {

        closeResultDetails();

    }


    if (
        !elements.notificationPanel.hidden
    ) {

        closeNotificationPanel();

    }

}


/* =========================================================
   STATUS BADGE
========================================================= */

function createStatusBadge(status) {

    const normalized =
        String(
            status || "draft"
        ).toLowerCase();


    const allowed = [
        "published",
        "pending",
        "draft"
    ];


    const safeStatus =
        allowed.includes(
            normalized
        )
            ? normalized
            : "draft";


    const label =
        safeStatus
            .charAt(0)
            .toUpperCase() +
        safeStatus.slice(1);


    return `
        <span class="status ${safeStatus}">
            ${label}
        </span>
    `;

}


/* =========================================================
   EXAMINATION LABEL
========================================================= */

function formatExamName(value) {

    if (!value) {
        return "—";
    }


    return String(value)
        .replace(
            /-/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.createElement("div");

    toast.className =
        "toast";

    toast.textContent =
        message;


    elements.toastContainer.appendChild(
        toast
    );


    setTimeout(() => {

        toast.remove();

    }, 3000);

}


/* =========================================================
   SECURITY / HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value)
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