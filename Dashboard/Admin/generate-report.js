/* =========================================================
   CAMPUSCONNECT ADMIN
   GENERATE REPORT
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        /*
         * Returns available report/filter options.
         */
        filters: "/admin/reports/filters",

        /*
         * Returns the number of records matching
         * the selected report and filters.
         */
        count: "/admin/reports/count",

        /*
         * Generates the final report.
         */
        generate: "/admin/reports/generate",

        /*
         * Returns previously generated reports.
         */
        recent: "/admin/reports/recent"
    }
};


/* =========================================================
   REPORT TYPE LABELS
========================================================= */

const REPORT_TYPE_LABELS = {

    students: "Student Report",

    faculty: "Faculty Report",

    attendance: "Attendance Report",

    "academic-performance":
        "Academic Performance Report",

    examinations: "Examination Report",

    results: "Result Report",

    admissions: "Admission Report",

    fees: "Fee Report",

    library: "Library Report",

    hostel: "Hostel Report",

    events: "Event Report",

    certificates: "Certificate Report",

    notices: "Notice Report"
};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {

    backButton:
        document.getElementById("backButton"),

    reportType:
        document.getElementById("reportType"),

    academicSession:
        document.getElementById("academicSession"),

    department:
        document.getElementById("department"),

    semester:
        document.getElementById("semester"),

    subject:
        document.getElementById("subject"),

    status:
        document.getElementById("status"),

    dateFrom:
        document.getElementById("dateFrom"),

    dateTo:
        document.getElementById("dateTo"),

    recordCount:
        document.getElementById("recordCount"),

    summaryReportType:
        document.getElementById("summaryReportType"),

    summarySession:
        document.getElementById("summarySession"),

    summaryDepartment:
        document.getElementById("summaryDepartment"),

    summarySemester:
        document.getElementById("summarySemester"),

    summaryDateRange:
        document.getElementById("summaryDateRange"),

    summaryFormat:
        document.getElementById("summaryFormat"),

    resetButton:
        document.getElementById("resetButton"),

    previewButton:
        document.getElementById("previewButton"),

    generateButton:
        document.getElementById("generateButton"),

    reportMessage:
        document.getElementById("reportMessage"),

    recentReports:
        document.getElementById("recentReports"),

    previewModal:
        document.getElementById("previewModal"),

    previewContent:
        document.getElementById("previewContent"),

    closePreview:
        document.getElementById("closePreview"),

    cancelPreview:
        document.getElementById("cancelPreview"),

    generateFromPreview:
        document.getElementById("generateFromPreview")
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializePage();

});


async function initializePage() {

    setupEvents();

    updateFilterVisibility();

    updateSummary();

    await loadFilterOptions();

    await loadRecentReports();
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    elements.backButton.addEventListener(
        "click",
        handleBack
    );


    elements.reportType.addEventListener(
        "change",
        async () => {

            updateFilterVisibility();

            updateSummary();

            await updateRecordCount();
        }
    );


    [
        elements.academicSession,
        elements.department,
        elements.semester,
        elements.subject,
        elements.status,
        elements.dateFrom,
        elements.dateTo
    ].forEach(element => {

        element.addEventListener(
            "change",
            async () => {

                updateSummary();

                await updateRecordCount();
            }
        );

    });


    document
        .querySelectorAll('input[name="format"]')
        .forEach(input => {

            input.addEventListener(
                "change",
                updateSummary
            );

        });


    elements.resetButton.addEventListener(
        "click",
        resetFilters
    );


    elements.previewButton.addEventListener(
        "click",
        openPreview
    );


    elements.closePreview.addEventListener(
        "click",
        closePreview
    );


    elements.cancelPreview.addEventListener(
        "click",
        closePreview
    );


    elements.generateButton.addEventListener(
        "click",
        generateReport
    );


    elements.generateFromPreview.addEventListener(
        "click",
        async () => {

            closePreview();

            await generateReport();
        }
    );


    elements.previewModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.previewModal
            ) {
                closePreview();
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
            "admin-dashboard.html";

    }

}


/* =========================================================
   FILTER VISIBILITY
========================================================= */

function updateFilterVisibility() {

    const type =
        elements.reportType.value;


    const allFields =
        document.querySelectorAll(
            ".filter-field"
        );


    allFields.forEach(field => {

        field.classList.remove("hidden");

    });


    /*
     * No report selected:
     * show the basic filter area.
     */

    if (!type) {
        return;
    }


    /*
     * Fields that do not apply to
     * certain report categories.
     */

    const hiddenFor = {

        students: [
            "subject",
            "date-range"
        ],

        faculty: [
            "semester",
            "subject"
        ],

        attendance: [],

        "academic-performance": [],

        examinations: [
            "status"
        ],

        results: [
            "subject",
            "date-range"
        ],

        admissions: [
            "semester",
            "subject"
        ],

        fees: [
            "subject"
        ],

        library: [
            "semester",
            "subject"
        ],

        hostel: [
            "semester",
            "subject"
        ],

        events: [
            "semester",
            "subject",
            "academic-session"
        ],

        certificates: [
            "subject",
            "date-range"
        ],

        notices: [
            "semester",
            "subject"
        ]
    };


    const fieldsToHide =
        hiddenFor[type] || [];


    fieldsToHide.forEach(
        filterName => {

            const field =
                document.querySelector(
                    `[data-filter="${filterName}"]`
                );

            if (field) {
                field.classList.add("hidden");
            }

        }
    );

}


/* =========================================================
   LOAD FILTER OPTIONS
========================================================= */

async function loadFilterOptions() {

    try {

        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.filters
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        populateSelect(
            elements.academicSession,
            data.academicSessions ||
            data.sessions
        );


        populateSelect(
            elements.department,
            data.departments ||
            data.branches
        );


        populateSelect(
            elements.subject,
            data.subjects
        );


        populateSelect(
            elements.status,
            data.statuses
        );

    }

    catch (error) {

        /*
         * No fallback/fake data is inserted.
         *
         * The page remains usable and the backend
         * can provide the real options later.
         */

        console.warn(
            "Report filter options unavailable.",
            error
        );

    }

}


/* =========================================================
   POPULATE SELECT
========================================================= */

function populateSelect(
    select,
    options
) {

    if (
        !select ||
        !Array.isArray(options)
    ) {
        return;
    }


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


    options.forEach(option => {

        const optionElement =
            document.createElement("option");


        if (
            typeof option === "object"
        ) {

            optionElement.value =
                option.value ??
                option.id ??
                option.code ??
                "";

            optionElement.textContent =
                option.label ??
                option.name ??
                option.title ??
                option.value ??
                "";

        } else {

            optionElement.value =
                option;

            optionElement.textContent =
                option;

        }


        select.appendChild(
            optionElement
        );

    });

}


/* =========================================================
   GET SELECTED FORMAT
========================================================= */

function getSelectedFormat() {

    const selected =
        document.querySelector(
            'input[name="format"]:checked'
        );

    return selected
        ? selected.value
        : "pdf";
}


/* =========================================================
   GET FILTER VALUES
========================================================= */

function getFilters() {

    return {

        reportType:
            elements.reportType.value,

        academicSession:
            elements.academicSession.value,

        department:
            elements.department.value,

        semester:
            elements.semester.value,

        subject:
            elements.subject.value,

        status:
            elements.status.value,

        dateFrom:
            elements.dateFrom.value,

        dateTo:
            elements.dateTo.value,

        format:
            getSelectedFormat()
    };

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    const filters =
        getFilters();


    elements.summaryReportType.textContent =
        REPORT_TYPE_LABELS[
            filters.reportType
        ] || "Not selected";


    elements.summarySession.textContent =
        getSelectedText(
            elements.academicSession,
            "All Sessions"
        );


    elements.summaryDepartment.textContent =
        getSelectedText(
            elements.department,
            "All Departments"
        );


    elements.summarySemester.textContent =
        getSelectedText(
            elements.semester,
            "All Semesters"
        );


    elements.summaryDateRange.textContent =
        formatDateRange(
            filters.dateFrom,
            filters.dateTo
        );


    elements.summaryFormat.textContent =
        filters.format.toUpperCase();

}


/* =========================================================
   SELECT TEXT
========================================================= */

function getSelectedText(
    select,
    fallback
) {

    if (!select.value) {
        return fallback;
    }

    const selected =
        select.options[
            select.selectedIndex
        ];

    return selected
        ? selected.textContent
        : fallback;

}


/* =========================================================
   DATE RANGE
========================================================= */

function formatDateRange(
    from,
    to
) {

    if (!from && !to) {
        return "All Dates";
    }

    if (from && to) {

        return `${formatDate(from)}
                – ${formatDate(to)}`;

    }

    if (from) {
        return `From ${formatDate(from)}`;
    }

    return `Until ${formatDate(to)}`;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   RECORD COUNT
========================================================= */

async function updateRecordCount() {

    const filters =
        getFilters();


    if (!filters.reportType) {

        elements.recordCount.textContent =
            "—";

        return;
    }


    try {

        const query =
            new URLSearchParams();


        Object.entries(filters)
            .forEach(
                ([key, value]) => {

                    if (
                        key !== "format" &&
                        value
                    ) {

                        query.set(
                            key,
                            value
                        );

                    }

                }
            );


        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.count +
                "?" +
                query.toString()
            );


        if (!response.ok) {
            throw new Error(
                "Unable to fetch report count."
            );
        }


        const data =
            await response.json();


        const count =
            data.count ??
            data.total ??
            data.recordsFound;


        elements.recordCount.textContent =
            count !== undefined
                ? Number(count).toLocaleString()
                : "—";

    }

    catch (error) {

        /*
         * No fake number is shown.
         */

        elements.recordCount.textContent =
            "—";

        console.warn(
            "Report count unavailable.",
            error
        );

    }

}


/* =========================================================
   VALIDATION
========================================================= */

function validateReport() {

    if (!elements.reportType.value) {

        showMessage(
            "Please select a report type.",
            "error"
        );

        elements.reportType.focus();

        return false;
    }


    const from =
        elements.dateFrom.value;

    const to =
        elements.dateTo.value;


    if (from && to && from > to) {

        showMessage(
            "The From Date cannot be later than the To Date.",
            "error"
        );

        elements.dateFrom.focus();

        return false;
    }


    return true;
}


/* =========================================================
   PREVIEW
========================================================= */

function openPreview() {

    if (!validateReport()) {
        return;
    }


    const filters =
        getFilters();


    elements.previewContent.innerHTML = `

        <div class="preview-item">
            <span>Report Type</span>
            <strong>
                ${
                    escapeHtml(
                        REPORT_TYPE_LABELS[
                            filters.reportType
                        ]
                    )
                }
            </strong>
        </div>

        <div class="preview-item">
            <span>Academic Session</span>
            <strong>
                ${
                    escapeHtml(
                        getSelectedText(
                            elements.academicSession,
                            "All Sessions"
                        )
                    )
                }
            </strong>
        </div>

        <div class="preview-item">
            <span>Department</span>
            <strong>
                ${
                    escapeHtml(
                        getSelectedText(
                            elements.department,
                            "All Departments"
                        )
                    )
                }
            </strong>
        </div>

        <div class="preview-item">
            <span>Semester</span>
            <strong>
                ${
                    escapeHtml(
                        getSelectedText(
                            elements.semester,
                            "All Semesters"
                        )
                    )
                }
            </strong>
        </div>

        <div class="preview-item">
            <span>Subject</span>
            <strong>
                ${
                    escapeHtml(
                        getSelectedText(
                            elements.subject,
                            "All Subjects"
                        )
                    )
                }
            </strong>
        </div>

        <div class="preview-item">
            <span>Status</span>
            <strong>
                ${
                    escapeHtml(
                        getSelectedText(
                            elements.status,
                            "All Statuses"
                        )
                    )
                }
            </strong>
        </div>

        <div class="preview-item">
            <span>Date Range</span>
            <strong>
                ${
                    escapeHtml(
                        formatDateRange(
                            filters.dateFrom,
                            filters.dateTo
                        )
                    )
                }
            </strong>
        </div>

        <div class="preview-item">
            <span>Output Format</span>
            <strong>
                ${escapeHtml(
                    filters.format.toUpperCase()
                )}
            </strong>
        </div>

    `;


    elements.previewModal.classList.add(
        "show"
    );

    elements.previewModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   CLOSE PREVIEW
========================================================= */

function closePreview() {

    elements.previewModal.classList.remove(
        "show"
    );

    elements.previewModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   GENERATE REPORT
========================================================= */

async function generateReport() {

    if (!validateReport()) {
        return;
    }


    const filters =
        getFilters();


    const originalText =
        elements.generateButton.innerHTML;


    elements.generateButton.disabled =
        true;

    elements.generateButton.innerHTML =
        `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Generating...
        `;


    try {

        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.generate,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        filters
                    )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Report generation failed."
            );

        }


        /*
         * Backend may return either:
         *
         * 1. A downloadable file
         * 2. A JSON response containing
         *    a download URL
         */

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            const data =
                await response.json();


            if (data.downloadUrl) {

                window.location.href =
                    data.downloadUrl;

            }


            else if (data.url) {

                window.location.href =
                    data.url;

            }


            showMessage(
                data.message ||
                "Report generated successfully.",
                "success"
            );

        }

        else {

            const blob =
                await response.blob();


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;


            link.download =
                createFileName(
                    filters
                );


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );


            showMessage(
                "Report generated successfully.",
                "success"
            );

        }


        await loadRecentReports();

    }

    catch (error) {

        showMessage(
            "The report could not be generated. Please try again.",
            "error"
        );

        console.error(
            "Generate report error:",
            error
        );

    }

    finally {

        elements.generateButton.disabled =
            false;

        elements.generateButton.innerHTML =
            originalText;

    }

}


/* =========================================================
   FILE NAME
========================================================= */

function createFileName(
    filters
) {

    const type =
        filters.reportType ||
        "report";


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    return `CampusConnect_${type}_${date}.${filters.format}`;

}


/* =========================================================
   RECENT REPORTS
========================================================= */

async function loadRecentReports() {

    try {

        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.recent
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const reports =
            Array.isArray(data)
                ? data
                : (
                    data.reports ||
                    data.items ||
                    []
                );


        renderRecentReports(
            reports
        );

    }

    catch (error) {

        /*
         * Keep the empty state.
         * No fake report history is inserted.
         */

        console.warn(
            "Recent reports unavailable.",
            error
        );

    }

}


/* =========================================================
   RENDER RECENT REPORTS
========================================================= */

function renderRecentReports(
    reports
) {

    if (!reports.length) {

        elements.recentReports.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-file-circle-xmark"></i>

                <h3>No Reports Available</h3>

                <p>
                    Recently generated reports will appear
                    here when report history is available.
                </p>

            </div>

        `;

        return;
    }


    elements.recentReports.innerHTML =
        reports.map(
            report => {

                const name =
                    report.name ||
                    report.reportName ||
                    report.title ||
                    "Generated Report";


                const format =
                    report.format ||
                    "";


                const createdAt =
                    report.createdAt ||
                    report.generatedAt ||
                    "";


                const downloadUrl =
                    report.downloadUrl ||
                    report.url ||
                    "";


                return `

                    <div class="report-row">

                        <div class="report-info">

                            <strong>
                                ${escapeHtml(name)}
                            </strong>

                            <span>
                                ${
                                    escapeHtml(
                                        format
                                            ? format.toUpperCase()
                                            : ""
                                    )
                                }

                                ${
                                    createdAt
                                        ? " • " +
                                          escapeHtml(
                                              formatDateTime(
                                                  createdAt
                                              )
                                          )
                                        : ""
                                }
                            </span>

                        </div>

                        ${
                            downloadUrl
                                ? `
                                    <button
                                        type="button"
                                        class="report-row-action"
                                        title="Open Report"
                                        data-url="${escapeHtml(
                                            downloadUrl
                                        )}"
                                    >
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    </button>
                                `
                                : ""
                        }

                    </div>

                `;

            }
        ).join("");


    elements.recentReports
        .querySelectorAll(
            ".report-row-action"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const url =
                        button.dataset.url;

                    if (url) {
                        window.open(
                            url,
                            "_blank"
                        );
                    }

                }
            );

        });

}


/* =========================================================
   RESET
========================================================= */

async function resetFilters() {

    elements.reportType.value = "";

    elements.academicSession.value = "";

    elements.department.value = "";

    elements.semester.value = "";

    elements.subject.value = "";

    elements.status.value = "";

    elements.dateFrom.value = "";

    elements.dateTo.value = "";


    document
        .querySelectorAll(
            'input[name="format"]'
        )
        .forEach(input => {

            input.checked =
                input.value === "pdf";

        });


    updateFilterVisibility();

    updateSummary();

    elements.recordCount.textContent =
        "—";


    clearMessage();

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    elements.reportMessage.textContent =
        message;

    elements.reportMessage.className =
        `report-message show ${type}`;

}


function clearMessage() {

    elements.reportMessage.textContent =
        "";

    elements.reportMessage.className =
        "report-message";

}


/* =========================================================
   DATE + TIME
========================================================= */

function formatDateTime(
    value
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }


    return date.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}