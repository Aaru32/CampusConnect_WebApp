/* =========================================================
   CAMPUSCONNECT ADMIN - VIEW ATTENDANCE
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {
        ATTENDANCE: "/admin/attendance",
        DEPARTMENTS: "/admin/departments",
        COURSES: "/admin/courses",
        SESSIONS: "/admin/academic-sessions",
        PROFILE: "/admin/profile"
    },

    PAGE_SIZE: 20

};


/* =========================================================
   STATE
========================================================= */

const state = {

    currentPage: 1,

    totalPages: 1,

    attendanceData: [],

    loading: false

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {

    backButton:
        document.getElementById("backButton"),

    refreshButton:
        document.getElementById("refreshButton"),

    welcomeTitle:
        document.getElementById("welcomeTitle"),

    department:
        document.getElementById("department"),

    semester:
        document.getElementById("semester"),

    course:
        document.getElementById("course"),

    academicSession:
        document.getElementById("academicSession"),

    attendanceMonth:
        document.getElementById("attendanceMonth"),

    studentSearch:
        document.getElementById("studentSearch"),

    applyFilters:
        document.getElementById("applyFilters"),

    clearFilters:
        document.getElementById("clearFilters"),

    totalStudents:
        document.getElementById("totalStudents"),

    presentStudents:
        document.getElementById("presentStudents"),

    absentStudents:
        document.getElementById("absentStudents"),

    attendanceRate:
        document.getElementById("attendanceRate"),

    tableDescription:
        document.getElementById("tableDescription"),

    attendanceTableBody:
        document.getElementById("attendanceTableBody"),

    exportAttendance:
        document.getElementById("exportAttendance"),

    previousPage:
        document.getElementById("previousPage"),

    nextPage:
        document.getElementById("nextPage"),

    pageInfo:
        document.getElementById("pageInfo")

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializePage();

});


async function initializePage() {

    setupEventListeners();

    loadAdminProfile();

    await Promise.all([
        loadDepartments(),
        loadAcademicSessions()
    ]);

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    if (elements.backButton) {

        elements.backButton.addEventListener(
            "click",
            goBack
        );

    }


    if (elements.refreshButton) {

        elements.refreshButton.addEventListener(
            "click",
            refreshPage
        );

    }


    if (elements.applyFilters) {

        elements.applyFilters.addEventListener(
            "click",
            () => {

                state.currentPage = 1;

                loadAttendance();

            }
        );

    }


    if (elements.clearFilters) {

        elements.clearFilters.addEventListener(
            "click",
            clearFilters
        );

    }


    if (elements.department) {

        elements.department.addEventListener(
            "change",
            () => {

                loadCourses(
                    elements.department.value
                );

            }
        );

    }


    if (elements.previousPage) {

        elements.previousPage.addEventListener(
            "click",
            () => {

                if (state.currentPage > 1) {

                    state.currentPage--;

                    loadAttendance();

                }

            }
        );

    }


    if (elements.nextPage) {

        elements.nextPage.addEventListener(
            "click",
            () => {

                if (
                    state.currentPage <
                    state.totalPages
                ) {

                    state.currentPage++;

                    loadAttendance();

                }

            }
        );

    }


    if (elements.studentSearch) {

        elements.studentSearch.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    state.currentPage = 1;

                    loadAttendance();

                }

            }
        );

    }


    if (elements.exportAttendance) {

        elements.exportAttendance.addEventListener(
            "click",
            exportAttendance
        );

    }

}


/* =========================================================
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

    if (!CONFIG.API_BASE_URL) {
        return;
    }

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.PROFILE}`
        );

        if (!response.ok) {
            throw new Error("Unable to load admin profile.");
        }

        const data = await response.json();

        if (data && data.name) {

            elements.welcomeTitle.textContent =
                `Welcome, ${data.name}!`;

        }

    } catch (error) {

        console.error(
            "Admin profile error:",
            error
        );

    }

}


/* =========================================================
   LOAD DEPARTMENTS
========================================================= */

async function loadDepartments() {

    if (!CONFIG.API_BASE_URL) {
        return;
    }

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.DEPARTMENTS}`
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load departments."
            );
        }

        const data = await response.json();

        const departments =
            Array.isArray(data)
                ? data
                : data.departments || [];

        populateSelect(
            elements.department,
            departments,
            "id",
            "name"
        );

    } catch (error) {

        console.error(
            "Department loading error:",
            error
        );

    }

}


/* =========================================================
   LOAD COURSES
========================================================= */

async function loadCourses(departmentId) {

    resetSelect(
        elements.course,
        "Select Course"
    );

    if (!departmentId) {
        return;
    }

    if (!CONFIG.API_BASE_URL) {
        return;
    }

    try {

        const url =
            `${CONFIG.API_BASE_URL}` +
            `${CONFIG.ENDPOINTS.COURSES}` +
            `?departmentId=${encodeURIComponent(departmentId)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Unable to load courses."
            );
        }

        const data = await response.json();

        const courses =
            Array.isArray(data)
                ? data
                : data.courses || [];

        populateSelect(
            elements.course,
            courses,
            "id",
            "name"
        );

    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );

    }

}


/* =========================================================
   LOAD ACADEMIC SESSIONS
========================================================= */

async function loadAcademicSessions() {

    if (!CONFIG.API_BASE_URL) {
        return;
    }

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SESSIONS}`
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load academic sessions."
            );
        }

        const data = await response.json();

        const sessions =
            Array.isArray(data)
                ? data
                : data.sessions || [];

        populateSelect(
            elements.academicSession,
            sessions,
            "id",
            "name"
        );

    } catch (error) {

        console.error(
            "Session loading error:",
            error
        );

    }

}


/* =========================================================
   LOAD ATTENDANCE
========================================================= */

async function loadAttendance() {

    if (!CONFIG.API_BASE_URL) {

        showDatabaseEmptyState();

        return;

    }


    setLoadingState(true);


    try {

        const params = new URLSearchParams();


        if (elements.department.value) {

            params.set(
                "departmentId",
                elements.department.value
            );

        }


        if (elements.semester.value) {

            params.set(
                "semester",
                elements.semester.value
            );

        }


        if (elements.course.value) {

            params.set(
                "courseId",
                elements.course.value
            );

        }


        if (elements.academicSession.value) {

            params.set(
                "academicSessionId",
                elements.academicSession.value
            );

        }


        if (elements.attendanceMonth.value) {

            params.set(
                "month",
                elements.attendanceMonth.value
            );

        }


        if (elements.studentSearch.value.trim()) {

            params.set(
                "search",
                elements.studentSearch.value.trim()
            );

        }


        params.set(
            "page",
            state.currentPage
        );


        params.set(
            "pageSize",
            CONFIG.PAGE_SIZE
        );


        const url =
            `${CONFIG.API_BASE_URL}` +
            `${CONFIG.ENDPOINTS.ATTENDANCE}` +
            `?${params.toString()}`;


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Unable to load attendance."
            );

        }


        const data = await response.json();


        state.attendanceData =
            Array.isArray(data)
                ? data
                : data.records || data.attendance || [];


        state.totalPages =
            data.totalPages ||
            Math.max(
                1,
                Math.ceil(
                    (data.total || state.attendanceData.length) /
                    CONFIG.PAGE_SIZE
                )
            );


        updateSummary(data);

        renderAttendanceTable(
            state.attendanceData
        );

        updatePagination();

    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );

        showErrorState();

    } finally {

        setLoadingState(false);

    }

}


/* =========================================================
   EMPTY DATABASE STATE
========================================================= */

function showDatabaseEmptyState() {

    state.attendanceData = [];

    state.currentPage = 1;

    state.totalPages = 1;


    elements.totalStudents.textContent = "—";

    elements.presentStudents.textContent = "—";

    elements.absentStudents.textContent = "—";

    elements.attendanceRate.textContent = "—";


    elements.tableDescription.textContent =
        "Attendance records will appear here once database/API data is available.";


    elements.attendanceTableBody.innerHTML = `

        <tr class="empty-row">

            <td colspan="9">

                <div class="empty-state">

                    <div class="empty-icon">
                        <i class="fa-solid fa-database"></i>
                    </div>

                    <h3>No Attendance Data</h3>

                    <p>
                        Connect the attendance API to display
                        real student attendance records.
                    </p>

                </div>

            </td>

        </tr>

    `;


    updatePagination();

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(data) {

    elements.totalStudents.textContent =
        data.totalStudents ?? "—";

    elements.presentStudents.textContent =
        data.presentStudents ?? "—";

    elements.absentStudents.textContent =
        data.absentStudents ?? "—";


    if (
        data.attendanceRate !== undefined &&
        data.attendanceRate !== null
    ) {

        elements.attendanceRate.textContent =
            `${data.attendanceRate}%`;

    } else {

        elements.attendanceRate.textContent =
            "—";

    }


    elements.tableDescription.textContent =
        state.attendanceData.length
            ? "Showing attendance records based on the selected filters."
            : "No attendance records match the selected filters.";

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderAttendanceTable(records) {

    if (!records.length) {

        elements.attendanceTableBody.innerHTML = `

            <tr class="empty-row">

                <td colspan="9">

                    <div class="empty-state">

                        <div class="empty-icon">
                            <i class="fa-solid fa-calendar-xmark"></i>
                        </div>

                        <h3>No Attendance Records</h3>

                        <p>
                            No attendance records were found
                            for the selected filters.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    elements.attendanceTableBody.innerHTML =
        records.map(createAttendanceRow).join("");

}


/* =========================================================
   CREATE TABLE ROW
========================================================= */

function createAttendanceRow(record) {

    const percentage =
        Number(record.attendancePercentage);


    let statusClass = "status-good";

    let statusText = "Good";


    if (Number.isFinite(percentage)) {

        if (percentage < 75) {

            statusClass = "status-low";

            statusText = "Low";

        } else if (percentage < 85) {

            statusClass = "status-warning";

            statusText = "Needs Attention";

        }

    } else {

        statusClass = "status-warning";

        statusText = "Not Available";

    }


    const attendanceDisplay =
        Number.isFinite(percentage)
            ? `${percentage.toFixed(1)}%`
            : "—";


    return `

        <tr>

            <td>
                ${escapeHTML(record.studentId ?? "—")}
            </td>

            <td>
                ${escapeHTML(record.studentName ?? "—")}
            </td>

            <td>
                ${escapeHTML(record.course ?? "—")}
            </td>

            <td>
                ${escapeHTML(record.semester ?? "—")}
            </td>

            <td>
                ${escapeHTML(record.present ?? "—")}
            </td>

            <td>
                ${escapeHTML(record.absent ?? "—")}
            </td>

            <td>
                ${escapeHTML(record.totalClasses ?? "—")}
            </td>

            <td>
                <span class="attendance-percentage">
                    ${attendanceDisplay}
                </span>
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${statusText}
                </span>
            </td>

        </tr>

    `;

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    elements.department.value = "";

    resetSelect(
        elements.course,
        "Select Course"
    );

    elements.semester.value = "";

    elements.academicSession.value = "";

    elements.attendanceMonth.value = "";

    elements.studentSearch.value = "";


    state.currentPage = 1;


    showDatabaseEmptyState();

}


/* =========================================================
   REFRESH
========================================================= */

async function refreshPage() {

    if (!elements.refreshButton) {
        return;
    }


    elements.refreshButton.classList.add(
        "loading"
    );


    try {

        await loadAttendance();

    } finally {

        setTimeout(() => {

            elements.refreshButton.classList.remove(
                "loading"
            );

        }, 300);

    }

}


/* =========================================================
   BACK
========================================================= */

function goBack() {

    if (document.referrer) {

        history.back();

    } else {

        window.location.href =
            "admin-dashboard.html";

    }

}


/* =========================================================
   PAGINATION
========================================================= */

function updatePagination() {

    elements.pageInfo.textContent =
        `Page ${state.currentPage} of ${state.totalPages}`;


    elements.previousPage.disabled =
        state.currentPage <= 1;


    elements.nextPage.disabled =
        state.currentPage >= state.totalPages;

}


/* =========================================================
   LOADING STATE
========================================================= */

function setLoadingState(isLoading) {

    state.loading = isLoading;


    if (elements.applyFilters) {

        elements.applyFilters.disabled =
            isLoading;

    }


    if (isLoading) {

        elements.attendanceTableBody.innerHTML = `

            <tr class="empty-row">

                <td colspan="9">

                    <div class="empty-state">

                        <div class="empty-icon">
                            <i class="fa-solid fa-spinner fa-spin"></i>
                        </div>

                        <h3>Loading Attendance</h3>

                        <p>
                            Fetching attendance records...
                        </p>

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   ERROR STATE
========================================================= */

function showErrorState() {

    elements.totalStudents.textContent = "—";

    elements.presentStudents.textContent = "—";

    elements.absentStudents.textContent = "—";

    elements.attendanceRate.textContent = "—";


    elements.attendanceTableBody.innerHTML = `

        <tr class="empty-row">

            <td colspan="9">

                <div class="empty-state">

                    <div class="empty-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <h3>Unable to Load Attendance</h3>

                    <p>
                        Please check the server connection
                        and try again.
                    </p>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   SELECT HELPERS
========================================================= */

function populateSelect(
    select,
    items,
    valueKey,
    textKey
) {

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    const firstOption =
        select.options[0];


    select.innerHTML = "";


    if (firstOption) {

        select.appendChild(
            firstOption
        );

    }


    items.forEach(item => {

        const option =
            document.createElement("option");


        option.value =
            item[valueKey];


        option.textContent =
            item[textKey];


        select.appendChild(option);

    });


    if (
        currentValue &&
        [...select.options].some(
            option =>
                option.value === currentValue
        )
    ) {

        select.value = currentValue;

    }

}


function resetSelect(
    select,
    placeholder
) {

    if (!select) {
        return;
    }


    select.innerHTML = "";


    const option =
        document.createElement("option");


    option.value = "";

    option.textContent = placeholder;


    select.appendChild(option);


    select.value = "";

}


/* =========================================================
   EXPORT
========================================================= */

function exportAttendance() {

    if (!state.attendanceData.length) {

        return;

    }


    const headers = [

        "Student ID",
        "Student Name",
        "Course",
        "Semester",
        "Present",
        "Absent",
        "Total Classes",
        "Attendance"

    ];


    const rows =
        state.attendanceData.map(record => [

            record.studentId ?? "",
            record.studentName ?? "",
            record.course ?? "",
            record.semester ?? "",
            record.present ?? "",
            record.absent ?? "",
            record.totalClasses ?? "",
            record.attendancePercentage ?? ""

        ]);


    const csv = [

        headers,

        ...rows

    ].map(row =>

        row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(",")

    ).join("\n");


    const blob =
        new Blob(
            [csv],
            { type: "text/csv;charset=utf-8;" }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "campusconnect-attendance.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}