/* =========================================================
   CAMPUSCONNECT ADMIN DASHBOARD
   Dynamic / API-Ready Architecture

   IMPORTANT:
   This file intentionally contains NO fake application data.

   Current state:
   Frontend dashboard is ready.

   Future:
   Java Backend + MySQL + REST API
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    /*
     * Replace this with the actual Java backend URL
     * when the backend is connected.
     *
     * Example:
     *
     * API_BASE_URL: "http://localhost:8080/api"
     */

    API_BASE_URL: "",

    ENDPOINTS: {

        dashboard: "/admin/dashboard",

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

        reports: "/reports"

    }

};


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    dashboard: null,

    isLoading: false,

    lastUpdated: null,

    currentPage: "dashboard"

};


/* =========================================================
   DOM REFERENCES
========================================================= */

const DOM = {

    sidebar:
        document.getElementById("sidebar"),

    sidebarOverlay:
        document.getElementById("sidebarOverlay"),

    mobileMenuButton:
        document.getElementById("mobileMenuButton"),

    globalSearch:
        document.getElementById("globalSearch"),

    currentDate:
        document.getElementById("currentDate"),

    currentTime:
        document.getElementById("currentTime"),

    totalStudents:
        document.getElementById("totalStudents"),

    totalFaculty:
        document.getElementById("totalFaculty"),

    activeCourses:
        document.getElementById("activeCourses"),

    totalDepartments:
        document.getElementById("totalDepartments"),

    attendanceRate:
        document.getElementById("attendanceRate"),

    passRate:
        document.getElementById("passRate"),

    newAdmissions:
        document.getElementById("newAdmissions"),

    pendingApprovals:
        document.getElementById("pendingApprovals"),

    recentNotices:
        document.getElementById("recentNotices"),

    recentAdmissions:
        document.getElementById("recentAdmissions"),

    recentActivities:
        document.getElementById("recentActivities"),

    upcomingEvents:
        document.getElementById("upcomingEvents"),

    attendanceChart:
        document.getElementById("attendanceChart"),

    departmentChart:
        document.getElementById("departmentChart"),

    attendanceEmptyState:
        document.getElementById("attendanceEmptyState"),

    departmentEmptyState:
        document.getElementById("departmentEmptyState")

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAdminDashboard
);


async function initializeAdminDashboard() {

    setupNavigation();

    setupMobileNavigation();

    setupSearch();

    setupDateTime();

    setupDashboardControls();

    setupQuickActions();
    
    setupStudentKPI();
    
    setupFacultyKPI();

    setupHeaderActions();

    renderEmptyDashboard();

    await loadDashboardData();

}


/* =========================================================
   DATE & TIME
========================================================= */

function setupDateTime() {

    updateDateTime();

    setInterval(
        updateDateTime,
        1000
    );

}


function updateDateTime() {

    const now = new Date();


    const dateFormatter =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    const timeFormatter =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );


    DOM.currentDate.textContent =
        dateFormatter.format(now);


    DOM.currentTime.textContent =
        timeFormatter.format(now);

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navigationItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    const page =
                        item.dataset.page;

                    if (!page) {
                        return;
                    }


                    setActiveNavigation(
                        page
                    );


                    handleNavigation(
                        page
                    );

                }
            );

        }
    );


    const viewButtons =
        document.querySelectorAll(
            "[data-page]"
        );


    viewButtons.forEach(
        button => {

            if (
                button.classList.contains(
                    "nav-item"
                )
            ) {
                return;
            }


            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    if (page) {

                        setActiveNavigation(
                            page
                        );

                        handleNavigation(
                            page
                        );

                    }

                }
            );

        }
    );

}


function setActiveNavigation(
    page
) {

    const navigationItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navigationItems.forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.page === page
            );

        }
    );


    state.currentPage =
        page;

}


function handleNavigation(
    page
) {

    if (page === "dashboard") {

        closeMobileSidebar();

        return;
    }
    if (page === "chat") {
    window.location.href = "../Chat/chat.html";
    return;
}
 if (page === "safespeak") {
     window.location.href = "../SafeSpeak/admin-safespeak.html";
     return;
 }


    if (page === "students") {

        window.location.href =
            "student-management.html";

        return;
    }
    
    if (page === "faculty") {
        window.location.href = "faculty-management.html";
        return;
    }
    
    if (page === "library") {

    window.location.href =
        "library.html";

    return;
}
if (page === "attendance") {

    window.location.href =
        "view-attendance.html";

    return;
}
if (page === "settings") {
    
    window.location.href =
        "system-settings.html";
    
    return;
}   
if (page === "reports") {
    
    window.location.href =
        "reports-analytics.html";
    
    return;    
}
if (page === "departments") {
    
    window.location.href =
        "departments.html";
    
    return;
}
if (page === "courses") {
    
    window.location.href =
        "courses-subjects.html";
    
    return;
}
if (page === "examinations") {
    
    window.location.href =
        "examinations.html";
}
if (page === "academics") {
    
    window.location.href =
        "academics.html";
} 
if (page === "results") {
    
    window.location.href =
        "results.html";
}
if (page === "fees") {
    
    window.location.href =
        "fees.html";
}
if (page === "hostel") {
    
    window.location.href =
        "hostel.html";
}
if (page === "admissions") {
    
    window.location.href =
        "admissions.html";
}
if (page === "events") {
    
    window.location.href =
        "events-notices.html";
}
if (page === "certificates") {
    
    window.location.href =
        "certificates.html";
}
if (page === "feedback") {
    
    window.location.href =
        "feedback.html";
}
    return;
    console.info(
        `CampusConnect navigation requested: ${page}`
    );

    closeMobileSidebar();

}

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function setupMobileNavigation() {

    DOM.mobileMenuButton.addEventListener(
        "click",
        openMobileSidebar
    );


    DOM.sidebarOverlay.addEventListener(
        "click",
        closeMobileSidebar
    );

}


function openMobileSidebar() {

    DOM.sidebar.classList.add(
        "mobile-open"
    );

    DOM.sidebarOverlay.classList.add(
        "active"
    );

}


function closeMobileSidebar() {

    DOM.sidebar.classList.remove(
        "mobile-open"
    );

    DOM.sidebarOverlay.classList.remove(
        "active"
    );

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    DOM.globalSearch.addEventListener(
        "input",
        event => {

            const searchTerm =
                event.target.value
                    .trim()
                    .toLowerCase();


            if (!searchTerm) {
                clearSearchHighlight();
                return;
            }


            performDashboardSearch(
                searchTerm
            );

        }
    );

}


function performDashboardSearch(
    searchTerm
) {

    /*
     * Search is intentionally limited
     * to data actually loaded from the API.
     *
     * It does not search fabricated records.
     */

    if (!state.dashboard) {
        return;
    }


    console.info(
        "Dashboard search:",
        searchTerm
    );

}


function clearSearchHighlight() {

    /*
     * Reserved for global search integration.
     */

}


/* =========================================================
   DASHBOARD CONTROLS
========================================================= */

function setupDashboardControls() {

    const attendancePeriod =
        document.getElementById(
            "attendancePeriod"
        );


    const performancePeriod =
        document.getElementById(
            "performancePeriod"
        );


    attendancePeriod.addEventListener(
        "change",
        () => {

            loadAttendanceData(
                attendancePeriod.value
            );

        }
    );


    performancePeriod.addEventListener(
        "change",
        () => {

            loadPerformanceData(
                performancePeriod.value
            );

        }
    );

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function setupQuickActions() {

    const actions =
        document.querySelectorAll(
            ".quick-action"
        );


    actions.forEach(
        action => {

            action.addEventListener(
                "click",
                () => {

                    const page =
                        action.dataset.page;

                    if (!page) {
                        return;
                    }


                    setActiveNavigation(
                        page
                    );


                    handleNavigation(
                        page
                    );

                }
            );

        }
    );

}

/* =========================================================
   TOTAL STUDENTS KPI
========================================================= */

function setupStudentKPI() {

    const totalStudentsCard =
        document.getElementById("totalStudentsCard");

    if (!totalStudentsCard) {
        return;
    }

    totalStudentsCard.addEventListener(
        "click",
        () => {

            window.location.href =
                "total-students.html";

        }
    );

}
function setupFacultyKPI() {
    const totalFacultyCard =
        document.getElementById("totalFacultyCard");

    if (!totalFacultyCard) {
        console.error("Total Faculty card not found.");
        return;
    }

    totalFacultyCard.addEventListener("click", function () {
        console.log("Total Faculty clicked.");
        window.location.href = "total-faculty.html";
    });

    totalFacultyCard.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            window.location.href = "total-faculty.html";
        }
    });
}

/* =========================================================
   HEADER ACTIONS
========================================================= */

function setupHeaderActions() {

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );


    notificationButton.addEventListener(
        "click",
        () => {

            /*
             * Global notification system
             * will be integrated here later.
             */

            console.info(
                "Global notifications requested."
            );

        }
    );


    const adminProfileButton =
        document.getElementById(
            "adminProfileButton"
        );


    adminProfileButton.addEventListener(
        "click",
        () => {

            /*
             * Reserved for admin profile menu.
             */

            window.location.href =
    "admin-profile.html";
        }

        );
}


/* =========================================================
   API
========================================================= */

async function loadDashboardData() {

    /*
     * No backend URL yet.
     *
     * Therefore the frontend stays in a
     * legitimate empty state.
     *
     * Once Java backend is ready:
     *
     * CONFIG.API_BASE_URL
     *
     * can be supplied and this method will
     * request actual database information.
     */

    if (!CONFIG.API_BASE_URL) {

        console.info(
            "CampusConnect Admin Dashboard: backend not connected yet."
        );

        return;

    }


    state.isLoading = true;


    try {

        const endpoint =
            CONFIG.API_BASE_URL +
            CONFIG.ENDPOINTS.dashboard;


        const response =
            await fetch(
                endpoint,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Dashboard API returned ${response.status}`
            );

        }


        const data =
            await response.json();


        state.dashboard =
            data;

        state.lastUpdated =
            new Date();


        renderDashboard(
            data
        );


    } catch (error) {

        console.error(
            "CampusConnect dashboard API error:",
            error
        );


        renderEmptyDashboard();


    } finally {

        state.isLoading = false;

    }

}


/* =========================================================
   DASHBOARD RENDERING
========================================================= */

function renderDashboard(
    data
) {

    if (!data) {

        renderEmptyDashboard();

        return;
    }


    /*
     * The following renderer expects
     * actual backend response fields.
     *
     * Nothing is created if the backend
     * does not supply the corresponding value.
     */


    renderStatistics(
        data.statistics
    );


    renderNotices(
        data.recentNotices
    );


    renderAdmissions(
        data.recentAdmissions
    );


    renderActivities(
        data.recentActivities
    );


    renderEvents(
        data.upcomingEvents
    );


    renderQuickStats(
        data.quickStats
    );


    renderAttendanceChart(
        data.attendance
    );


    renderDepartmentChart(
        data.departmentDistribution
    );


    renderPerformance(
        data.performance
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics(
    statistics
) {

    if (!statistics) {
        return;
    }


    setValueIfAvailable(
        DOM.totalStudents,
        statistics.totalStudents
    );


    setValueIfAvailable(
        DOM.totalFaculty,
        statistics.totalFaculty
    );


    setValueIfAvailable(
        DOM.activeCourses,
        statistics.activeCourses
    );


    setValueIfAvailable(
        DOM.totalDepartments,
        statistics.totalDepartments
    );

}


function setValueIfAvailable(
    element,
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return;
    }


    element.textContent =
        formatNumber(value);


    const parent =
        element.closest(
            ".stat-information"
        );


    if (parent) {

        const message =
            parent.querySelector(
                ".empty-stat-message"
            );


        if (message) {
            message.remove();
        }

    }

}


/* =========================================================
   QUICK STATS
========================================================= */

function renderQuickStats(
    quickStats
) {

    if (!quickStats) {
        return;
    }


    setPercentageIfAvailable(
        DOM.attendanceRate,
        quickStats.attendanceRate
    );


    setPercentageIfAvailable(
        DOM.passRate,
        quickStats.passRate
    );


    setValueIfAvailable(
        DOM.newAdmissions,
        quickStats.newAdmissions
    );


    setValueIfAvailable(
        DOM.pendingApprovals,
        quickStats.pendingApprovals
    );

}


function setPercentageIfAvailable(
    element,
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return;
    }


    element.textContent =
        `${value}%`;


    const parent =
        element.closest(
            ".quick-stat"
        );


    const small =
        parent?.querySelector(
            "small"
        );


    if (small) {
        small.textContent =
            "Current data";
    }

}


/* =========================================================
   NOTICES
========================================================= */

function renderNotices(
    notices
) {

    if (
        !Array.isArray(notices) ||
        notices.length === 0
    ) {

        renderNoticeEmpty();

        return;
    }


    DOM.recentNotices.innerHTML = "";


    notices.forEach(
        notice => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "dynamic-list-item";


            item.innerHTML = `

                <div class="dynamic-item-icon">
                    <i class="fa-regular fa-file-lines"></i>
                </div>

                <div class="dynamic-item-content">

                    <strong>
                        ${escapeHTML(
                            notice.title ?? ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            notice.date ?? ""
                        )}
                    </span>

                </div>

            `;


            DOM.recentNotices.appendChild(
                item
            );

        }
    );

}


function renderNoticeEmpty() {

    DOM.recentNotices.innerHTML = `

        <div class="list-empty-state">

            <i class="fa-regular fa-file-lines"></i>

            <strong>No notices available</strong>

            <span>
                Published notices will appear here.
            </span>

        </div>

    `;

}


/* =========================================================
   ADMISSIONS
========================================================= */

function renderAdmissions(
    admissions
) {

    if (
        !Array.isArray(admissions) ||
        admissions.length === 0
    ) {

        renderAdmissionEmpty();

        return;
    }


    DOM.recentAdmissions.innerHTML = "";


    admissions.forEach(
        admission => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        admission.studentName ?? ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        admission.course ?? ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        admission.date ?? ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        admission.status ?? ""
                    )}
                </td>

            `;


            DOM.recentAdmissions.appendChild(
                row
            );

        }
    );

}


function renderAdmissionEmpty() {

    DOM.recentAdmissions.innerHTML = `

        <tr class="table-empty-row">

            <td colspan="4">

                <div class="table-empty-state">

                    <i class="fa-solid fa-users"></i>

                    <span>
                        No admission records available
                    </span>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   ACTIVITIES
========================================================= */

function renderActivities(
    activities
) {

    if (
        !Array.isArray(activities) ||
        activities.length === 0
    ) {

        renderActivityEmpty();

        return;
    }


    DOM.recentActivities.innerHTML = "";


    activities.forEach(
        activity => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item";


            item.innerHTML = `

                <div class="activity-icon">
                    <i class="fa-solid fa-circle-info"></i>
                </div>

                <div class="activity-content">

                    <strong>
                        ${escapeHTML(
                            activity.title ?? ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            activity.description ?? ""
                        )}
                    </span>

                </div>

            `;


            DOM.recentActivities.appendChild(
                item
            );

        }
    );

}


function renderActivityEmpty() {

    DOM.recentActivities.innerHTML = `

        <div class="list-empty-state">

            <i class="fa-solid fa-clock-rotate-left"></i>

            <strong>No recent activity</strong>

            <span>
                System activity will appear here.
            </span>

        </div>

    `;

}


/* =========================================================
   EVENTS
========================================================= */

function renderEvents(
    events
) {

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        renderEventEmpty();

        return;
    }


    DOM.upcomingEvents.innerHTML = "";


    events.forEach(
        event => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "event-item";


            item.innerHTML = `

                <div class="event-date">

                    <strong>
                        ${escapeHTML(
                            event.day ?? ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            event.month ?? ""
                        )}
                    </span>

                </div>

                <div class="event-content">

                    <strong>
                        ${escapeHTML(
                            event.title ?? ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            event.time ?? ""
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            event.location ?? ""
                        )}
                    </span>

                </div>

            `;


            DOM.upcomingEvents.appendChild(
                item
            );

        }
    );

}


function renderEventEmpty() {

    DOM.upcomingEvents.innerHTML = `

        <div class="list-empty-state">

            <i class="fa-regular fa-calendar"></i>

            <strong>No upcoming events</strong>

            <span>
                Scheduled events will appear here.
            </span>

        </div>

    `;

}


/* =========================================================
   ATTENDANCE
========================================================= */

async function loadAttendanceData(
    period
) {

    /*
     * Future API integration point.
     */

    if (!CONFIG.API_BASE_URL) {

        console.info(
            `Attendance period selected: ${period}`
        );

        return;
    }


    try {

        const endpoint =
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.attendance}?period=${encodeURIComponent(period)}`;


        const response =
            await fetch(
                endpoint,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    },

                    credentials: "include"
                }
            );


        if (!response.ok) {
            throw new Error(
                `Attendance API returned ${response.status}`
            );
        }


        const data =
            await response.json();


        renderAttendanceChart(
            data
        );


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );

        renderAttendanceEmpty();

    }

}


function renderAttendanceChart(
    attendance
) {

    /*
     * Chart.js can be connected here when
     * actual backend data is available.
     *
     * This project currently does not inject
     * fake chart values.
     */

    if (
        !attendance ||
        !Array.isArray(
            attendance.labels
        ) ||
        !Array.isArray(
            attendance.studentData
        )
    ) {

        renderAttendanceEmpty();

        return;
    }


    /*
     * Chart rendering can be enabled after
     * Chart.js is included in the project.
     *
     * Data remains entirely API-driven.
     */

    console.info(
        "Attendance data received:",
        attendance
    );

}


function renderAttendanceEmpty() {

    if (DOM.attendanceEmptyState) {

        DOM.attendanceEmptyState.style.display =
            "flex";

    }

}


/* =========================================================
   PERFORMANCE
========================================================= */

async function loadPerformanceData(
    period
) {

    if (!CONFIG.API_BASE_URL) {

        console.info(
            `Performance period selected: ${period}`
        );

        return;
    }


    try {

        const endpoint =
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.results}?period=${encodeURIComponent(period)}`;


        const response =
            await fetch(
                endpoint,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    },

                    credentials: "include"
                }
            );


        if (!response.ok) {
            throw new Error(
                `Performance API returned ${response.status}`
            );
        }


        const data =
            await response.json();


        renderPerformance(
            data
        );


    } catch (error) {

        console.error(
            "Performance loading error:",
            error
        );

    }

}


function renderPerformance(
    performance
) {

    if (!performance) {
        return;
    }


    /*
     * Reserved for API-driven academic
     * performance visualization.
     */

    console.info(
        "Performance data received:",
        performance
    );

}


/* =========================================================
   DEPARTMENT DISTRIBUTION
========================================================= */

function renderDepartmentChart(
    departments
) {

    if (
        !Array.isArray(departments) ||
        departments.length === 0
    ) {

        renderDepartmentEmpty();

        return;
    }


    /*
     * Future Chart.js rendering point.
     *
     * Expected backend structure:
     *
     * [
     *   {
     *      department: "...",
     *      studentCount: ...
     *   }
     * ]
     *
     * No values are fabricated here.
     */

    console.info(
        "Department distribution received:",
        departments
    );

}


function renderDepartmentEmpty() {

    if (DOM.departmentEmptyState) {

        DOM.departmentEmptyState.style.display =
            "flex";

    }

}


/* =========================================================
   EMPTY DASHBOARD
========================================================= */

function renderEmptyDashboard() {

    DOM.totalStudents.textContent = "—";

    DOM.totalFaculty.textContent = "—";

    DOM.activeCourses.textContent = "—";

    DOM.totalDepartments.textContent = "—";

    DOM.attendanceRate.textContent = "—";

    DOM.passRate.textContent = "—";

    DOM.newAdmissions.textContent = "—";

    DOM.pendingApprovals.textContent = "—";


    renderNoticeEmpty();

    renderAdmissionEmpty();

    renderActivityEmpty();

    renderEventEmpty();

    renderAttendanceEmpty();

    renderDepartmentEmpty();

}


/* =========================================================
   NUMBER FORMATTING
========================================================= */

function formatNumber(
    value
) {

    if (
        typeof value !== "number" &&
        typeof value !== "string"
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


    return new Intl.NumberFormat(
        "en-IN"
    ).format(number);

}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   PUBLIC API HOOK
========================================================= */

/*
 * This function is intentionally exposed so
 * the future Java backend integration can
 * refresh the dashboard after login/session
 * initialization or another module updates data.
 */

window.CampusConnectAdmin = {

    refresh: loadDashboardData,

    getState: () => ({
        ...state
    }),

    config: CONFIG

};
// Dynamic admin name
async function loadAdminProfile() {
    const adminNameElement = document.getElementById("adminName");
    if (!adminNameElement) return;

    try {
        const headers = { "Content-Type": "application/json" };
        const sessionUser = sessionStorage.getItem("campusConnectUser");
        if (sessionUser) {
            try {
                const parsed = JSON.parse(sessionUser);
                if (parsed.email) headers["X-User-Email"] = parsed.email;
                if (parsed.role) headers["X-User-Role"] = parsed.role;
                if (parsed.uid) headers["X-User-Uid"] = parsed.uid;
            } catch (e) {}
        }
        if (window.CampusConnectFirebase && window.CampusConnectFirebase.auth?.currentUser) {
            try {
                const token = await window.CampusConnectFirebase.auth.currentUser.getIdToken();
                if (token) headers["Authorization"] = `Bearer ${token}`;
            } catch (e) {}
        }

        const response = await fetch("/api/admin/profile", { headers });

        if (!response.ok) {
            throw new Error(`Unable to load admin profile (HTTP ${response.status})`);
        }

        const admin = await response.json();

        if (admin && admin.name) {
            adminNameElement.textContent = admin.name;
        }

    } catch (error) {
        console.warn("Notice: Admin profile fetch requires admin privileges:", error.message || error);
    }
}

document.addEventListener("DOMContentLoaded", loadAdminProfile);