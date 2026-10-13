/* =========================================================
   CAMPUSCONNECT
   FACULTY DASHBOARD
   Dynamic / API-Ready Architecture
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        FACULTY_PROFILE: "/faculty/profile",

        DASHBOARD: "/faculty/dashboard",

        TODAY_CLASSES: "/faculty/classes/today",

        SUBJECTS: "/faculty/subjects",

        STUDENTS: "/faculty/students",

        ATTENDANCE: "/faculty/attendance/summary",

        ASSIGNMENTS: "/faculty/assignments/pending",

        EXAMS: "/faculty/exams/upcoming",

        NOTIFICATIONS: "/notifications"

    }

};


/* =========================================================
   PAGE ROUTES
========================================================= */

const ROUTES = {

    dashboard:
        "faculty-dashboard.html",
    roomStatus:
    "room-status.html",    
        

    classes:
        "classes.html",
        doubts:
    "faculty-doubts.html",
    
   chat:
    "../Chat/chat.html?source=faculty",
    
    safespeak:
    "../SafeSpeak/safespeak.html?source=faculty",

    courses:
        "courses.html",

    students:
        "students.html",

    attendance:
        "attendance.html",

    assignments:
        "assignments.html",

    examinations:
        "examinations.html",

    results:
        "results.html",

    events:
        "events.html",

    notifications:
        "notifications.html",

    profile:
        "profile.html",

    settings:
        "settings.html",

    help:
        "help.html",

    /* Faculty quick-action pages */

    enterMarks:
        "enter-marks.html",

    notices:
        "notices.html"

};


/* =========================================================
   DOM REFERENCES
========================================================= */

const DOM = {

    welcomeFacultyName:
        document.getElementById("welcomeFacultyName"),

    headerFacultyName:
        document.getElementById("headerFacultyName"),

    headerProfileImage:
        document.getElementById("headerProfileImage"),

    todayClassesContainer:
        document.getElementById("todayClassesContainer"),

    subjectsContainer:
        document.getElementById("subjectsContainer"),

    upcomingContainer:
        document.getElementById("upcomingContainer"),

    recentNotificationsContainer:
        document.getElementById(
            "recentNotificationsContainer"
        ),

    assignedStudents:
        document.getElementById("assignedStudents"),

    attendanceOverview:
        document.getElementById("attendanceOverview"),

    pendingAssignments:
        document.getElementById("pendingAssignments"),

    upcomingExams:
        document.getElementById("upcomingExams"),

    notificationCount:
        document.getElementById("notificationCount"),

    refreshButton:
        document.getElementById("refreshButton"),

    notificationButton:
        document.getElementById("notificationButton"),

    facultyProfileButton:
        document.getElementById("facultyProfileButton"),

    logoutButton:
        document.getElementById("logoutButton"),

    logoutModal:
        document.getElementById("logoutModal"),

    cancelLogout:
        document.getElementById("cancelLogout"),

    confirmLogout:
        document.getElementById("confirmLogout"),

    mobileMenuBtn:
        document.getElementById("mobileMenuBtn"),

    sidebar:
        document.getElementById("sidebar"),

    sidebarOverlay:
        document.getElementById("sidebarOverlay"),

    globalSearch:
        document.getElementById("globalSearch"),

    currentDate:
        document.getElementById("currentDate"),

    currentTime:
        document.getElementById("currentTime")

};


/* =========================================================
   FACULTY STATE
========================================================= */

const facultyState = {

    profile: null,

    todayClasses: [],

    subjects: [],

    students: null,

    attendance: null,

    pendingAssignments: null,

    upcomingExams: null,

    notifications: [],

    activeUpcomingTab: "classes"

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeFacultyDashboard
);


function initializeFacultyDashboard() {

    setupNavigation();

    setupQuickActions();

    setupStatistics();

    setupUpcomingTabs();

    setupHeaderActions();

    setupLogout();

    setupMobileSidebar();

    setupSearch();

    setupDateTime();

    loadFacultyDashboard();

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

    const now =
        new Date();


    const dateOptions = {

        weekday: "long",

        day: "numeric",

        month: "long",

        year: "numeric"

    };


    const timeOptions = {

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit",

        hour12: true

    };


    if (DOM.currentDate) {

        DOM.currentDate.textContent =
            now.toLocaleDateString(
                "en-IN",
                dateOptions
            );

    }


    if (DOM.currentTime) {

        DOM.currentTime.textContent =
            now.toLocaleTimeString(
                "en-IN",
                timeOptions
            );

    }

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadFacultyDashboard() {

    if (!CONFIG.API_BASE_URL) {

        renderEmptyDashboard();

        return;

    }


    try {

        await Promise.all([

            loadFacultyProfile(),

            loadTodayClasses(),

            loadSubjects(),

            loadStatistics(),

            loadNotifications()

        ]);

    }

    catch (error) {

        console.error(
            "Faculty dashboard loading error:",
            error
        );

        renderEmptyDashboard();

    }

}


/* =========================================================
   FACULTY PROFILE
========================================================= */

async function loadFacultyProfile() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.FACULTY_PROFILE
        );


    if (!data) {
        return;
    }


    facultyState.profile =
        data;


    const name =
        data.name ||
        data.fullName ||
        "Faculty";


    if (DOM.welcomeFacultyName) {

        DOM.welcomeFacultyName.textContent =
            name;

    }


    if (DOM.headerFacultyName) {

        DOM.headerFacultyName.textContent =
            name;

    }


    if (
        data.profileImage &&
        DOM.headerProfileImage
    ) {

        DOM.headerProfileImage.src =
            data.profileImage;

    }

}


/* =========================================================
   TODAY'S CLASSES
========================================================= */

async function loadTodayClasses() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.TODAY_CLASSES
        );


    if (!Array.isArray(data)) {
        return;
    }


    facultyState.todayClasses =
        data;


    renderTodayClasses();

}


function renderTodayClasses() {

    if (!DOM.todayClassesContainer) {
        return;
    }


    if (
        !facultyState.todayClasses ||
        facultyState.todayClasses.length === 0
    ) {

        DOM.todayClassesContainer.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-calendar-xmark"></i>

                <h3>No classes available</h3>

                <p>
                    Your timetable will appear here
                    when class data is available.
                </p>

            </div>

        `;

        return;

    }


    const rows =
        facultyState.todayClasses
            .map(createClassRow)
            .join("");


    DOM.todayClassesContainer.innerHTML = `

        <table class="classes-table">

            <thead>

                <tr>

                    <th>Time</th>

                    <th>Subject</th>

                    <th>Class / Semester</th>

                    <th>Room</th>

                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;


    attachClassActionEvents();

}


function createClassRow(classData) {

    const id =
        classData.id ||
        classData.classId ||
        "";


    const time =
        escapeHTML(
            classData.time || "—"
        );


    const subject =
        escapeHTML(
            classData.subject ||
            classData.subjectName ||
            "—"
        );


    const className =
        escapeHTML(
            classData.className ||
            classData.semester ||
            "—"
        );


    const room =
        escapeHTML(
            classData.room || "—"
        );


    return `

        <tr>

            <td>${time}</td>

            <td>
                <strong>${subject}</strong>
            </td>

            <td>${className}</td>

            <td>${room}</td>

            <td>

                <button
                    class="class-action-btn"
                    data-class-id="${escapeHTML(id)}"
                    type="button"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


function attachClassActionEvents() {

    document
        .querySelectorAll(
            ".class-action-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    navigateTo(
                        ROUTES.classes
                    );

                }
            );

        });

}


/* =========================================================
   SUBJECTS
========================================================= */

async function loadSubjects() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.SUBJECTS
        );


    if (!Array.isArray(data)) {
        return;
    }


    facultyState.subjects =
        data;


    renderSubjects();

}


function renderSubjects() {

    if (!DOM.subjectsContainer) {
        return;
    }


    if (
        !facultyState.subjects ||
        facultyState.subjects.length === 0
    ) {

        DOM.subjectsContainer.innerHTML = `

            <div class="empty-state small">

                <i class="fa-solid fa-book-open"></i>

                <h3>No subjects assigned</h3>

                <p>
                    Assigned subjects will appear here.
                </p>

            </div>

        `;

        return;

    }


    DOM.subjectsContainer.innerHTML =
        facultyState.subjects
            .map(createSubjectItem)
            .join("");


    attachSubjectEvents();

}


function createSubjectItem(subject) {

    const id =
        subject.id ||
        subject.subjectId ||
        "";


    const name =
        escapeHTML(
            subject.name ||
            subject.subjectName ||
            "Subject"
        );


    const semester =
        escapeHTML(
            subject.semester ||
            subject.className ||
            "—"
        );


    return `

        <button
            class="subject-item"
            data-subject-id="${escapeHTML(id)}"
            type="button"
        >

            <span class="subject-dot"></span>

            <span class="subject-information">

                <strong>
                    ${name}
                </strong>

                <span>
                    ${semester}
                </span>

            </span>

            <i class="fa-solid fa-chevron-right"></i>

        </button>

    `;

}


function attachSubjectEvents() {

    document
        .querySelectorAll(
            ".subject-item"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    navigateTo(
                        ROUTES.courses
                    );

                }
            );

        });

}


/* =========================================================
   STATISTICS
========================================================= */

async function loadStatistics() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.DASHBOARD
        );


    if (!data) {
        return;
    }


    facultyState.students =
        data.assignedStudents ?? null;


    facultyState.attendance =
        data.attendanceOverview ?? null;


    facultyState.pendingAssignments =
        data.pendingAssignments ?? null;


    facultyState.upcomingExams =
        data.upcomingExams ?? null;


    updateStatistics();

}


function updateStatistics() {

    if (DOM.assignedStudents) {

        DOM.assignedStudents.textContent =
            facultyState.students !== null
                ? facultyState.students
                : "—";

    }


    if (DOM.attendanceOverview) {

        DOM.attendanceOverview.textContent =
            facultyState.attendance !== null
                ? facultyState.attendance
                : "—";

    }


    if (DOM.pendingAssignments) {

        DOM.pendingAssignments.textContent =
            facultyState.pendingAssignments !== null
                ? facultyState.pendingAssignments
                : "—";

    }


    if (DOM.upcomingExams) {

        DOM.upcomingExams.textContent =
            facultyState.upcomingExams !== null
                ? facultyState.upcomingExams
                : "—";

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.NOTIFICATIONS
        );


    if (!Array.isArray(data)) {
        return;
    }


    facultyState.notifications =
        data;


    renderNotifications();

}


function renderNotifications() {

    if (!DOM.recentNotificationsContainer) {
        return;
    }


    const notifications =
        facultyState.notifications;


    if (
        !notifications ||
        notifications.length === 0
    ) {

        DOM.recentNotificationsContainer.innerHTML = `

            <div class="empty-state small">

                <i class="fa-regular fa-bell-slash"></i>

                <h3>No notifications</h3>

                <p>
                    New notifications will appear here.
                </p>

            </div>

        `;


        if (DOM.notificationCount) {

            DOM.notificationCount.hidden =
                true;

        }

        return;

    }


    DOM.recentNotificationsContainer.innerHTML =
        notifications
            .slice(0, 5)
            .map(createNotification)
            .join("");


    const unreadCount =
        notifications.filter(
            notification =>
                notification.read === false
        ).length;


    if (DOM.notificationCount) {

        if (unreadCount > 0) {

            DOM.notificationCount.textContent =
                unreadCount;

            DOM.notificationCount.hidden =
                false;

        }

        else {

            DOM.notificationCount.hidden =
                true;

        }

    }


    attachNotificationEvents();

}


function createNotification(notification) {

    const id =
        notification.id ||
        "";


    const title =
        escapeHTML(
            notification.title ||
            "Notification"
        );


    const message =
        escapeHTML(
            notification.message ||
            ""
        );


    const time =
        escapeHTML(
            notification.time ||
            ""
        );


    return `

        <button
            class="notification-item"
            data-notification-id="${escapeHTML(id)}"
            type="button"
        >

            <span class="notification-icon">

                <i class="fa-regular fa-bell"></i>

            </span>

            <span class="notification-information">

                <strong>
                    ${title}
                </strong>

                <p>
                    ${message}
                </p>

            </span>

            <span class="notification-time">
                ${time}
            </span>

        </button>

    `;

}


function attachNotificationEvents() {

    document
        .querySelectorAll(
            ".notification-item"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    navigateTo(
                        ROUTES.notifications
                    );

                }
            );

        });

}


/* =========================================================
   UPCOMING TABS
========================================================= */

function setupUpcomingTabs() {

    document
        .querySelectorAll(
            ".upcoming-tab"
        )
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".upcoming-tab"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    tab.classList.add(
                        "active"
                    );


                    facultyState.activeUpcomingTab =
                        tab.dataset.tab ||
                        "classes";


                    renderUpcoming();

                }
            );

        });

}


function renderUpcoming() {

    if (!DOM.upcomingContainer) {
        return;
    }


    const message =
        getUpcomingEmptyMessage();


    let icon =
        "fa-clock";


    if (
        facultyState.activeUpcomingTab ===
        "exams"
    ) {

        icon =
            "fa-file-lines";

    }


    if (
        facultyState.activeUpcomingTab ===
        "assignments"
    ) {

        icon =
            "fa-clipboard-list";

    }


    if (
        facultyState.activeUpcomingTab ===
        "events"
    ) {

        icon =
            "fa-calendar-days";

    }


    DOM.upcomingContainer.innerHTML = `

        <div class="empty-state small">

            <i class="fa-regular ${icon}"></i>

            <h3>No upcoming items</h3>

            <p>
                ${message}
            </p>

        </div>

    `;

}


function getUpcomingEmptyMessage() {

    const messages = {

        classes:
            "Upcoming classes will appear here.",

        exams:
            "Upcoming examinations will appear here.",

        assignments:
            "Upcoming assignment deadlines will appear here.",

        events:
            "Upcoming events will appear here."

    };


    return (
        messages[
            facultyState.activeUpcomingTab
        ] ||
        messages.classes
    );

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function setupQuickActions() {

    document
        .querySelectorAll(
            ".quick-action"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    const action =
                        button.dataset.action;


                    const handled =
                        handleQuickAction(
                            action
                        );


                    if (handled) {

                        event.preventDefault();

                    }

                }
            );

        });

}


function handleQuickAction(action) {

    const routes = {

        attendance:
            ROUTES.attendance,
            
        "room-status":
ROUTES.roomStatus,

        assignment:
            ROUTES.assignments,

        assignments:
            ROUTES.assignments,

        marks:
            ROUTES.enterMarks,

        "enter-marks":
            ROUTES.enterMarks,

        notice:
            ROUTES.notices,

        notices:
            ROUTES.notices,

        "create-notice":
            ROUTES.notices,

        classes:
            ROUTES.classes,

        courses:
            ROUTES.courses,

        students:
            ROUTES.students,

        examinations:
            ROUTES.examinations,

        exams:
            ROUTES.examinations,

        results:
            ROUTES.results,

        events:
            ROUTES.events,

        profile:
            ROUTES.profile,

        settings:
            ROUTES.settings,

        help:
            ROUTES.help

    };


    const route =
        routes[action];


    if (!route) {
        return false;
    }


    navigateTo(route);

    return true;

}


/* =========================================================
   STATISTIC CARDS
========================================================= */

function setupStatistics() {

    document
        .querySelectorAll(
            ".stat-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const stat =
                        card.dataset.stat;


                    const routes = {

                        students:
                            ROUTES.students,

                        assignedStudents:
                            ROUTES.students,

                        attendance:
                            ROUTES.attendance,

                        attendanceOverview:
                            ROUTES.attendance,

                        assignments:
                            ROUTES.assignments,

                        pendingAssignments:
                            ROUTES.assignments,

                        exams:
                            ROUTES.examinations,

                        upcomingExams:
                            ROUTES.examinations,

                        courses:
                            ROUTES.courses,

                        results:
                            ROUTES.results

                    };


                    if (routes[stat]) {

                        navigateTo(
                            routes[stat]
                        );

                    }

                }
            );

        });

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    const page =
                        item.dataset.page;


                    const href =
                        item.getAttribute(
                            "href"
                        );


                    if (
                        href &&
                        href !== "#"
                    ) {

                        setActiveNavigation(
                            item
                        );

                        closeMobileSidebar();

                        return;

                    }


                    if (page) {

                        event.preventDefault();


                        const route =
                            getRouteForPage(
                                page
                            );


                        if (route) {

                            setActiveNavigation(
                                item
                            );

                            navigateTo(
                                route
                            );

                        }

                    }

                }
            );

        });

}


function getRouteForPage(page) {

    const normalized =
        String(
            page || ""
        )
            .trim()
            .toLowerCase();


    const routes = {

        dashboard:
            ROUTES.dashboard,

        home:
            ROUTES.dashboard,
            
        "room-status":
ROUTES.roomStatus,

        classes:
            ROUTES.classes,

        class:
            ROUTES.classes,
        doubts:
    ROUTES.doubts,
    
    "doubt-desk":
    ROUTES.doubts,
    
    "student-doubts":
    ROUTES.doubts,
    chat:
    ROUTES.chat,
    safespeak:
    ROUTES.safespeak,
    
    "safe-speak":
    ROUTES.safespeak,

        courses:
            ROUTES.courses,

        course:
            ROUTES.courses,

        students:
            ROUTES.students,

        student:
            ROUTES.students,

        attendance:
            ROUTES.attendance,

        assignments:
            ROUTES.assignments,

        assignment:
            ROUTES.assignments,

        examinations:
            ROUTES.examinations,

        examination:
            ROUTES.examinations,

        exams:
            ROUTES.examinations,

        results:
            ROUTES.results,

        result:
            ROUTES.results,

        events:
            ROUTES.events,

        event:
            ROUTES.events,

        notifications:
            ROUTES.notifications,

        notification:
            ROUTES.notifications,

        profile:
            ROUTES.profile,

        settings:
            ROUTES.settings,

        help:
            ROUTES.help,

        "enter-marks":
            ROUTES.enterMarks,

        marks:
            ROUTES.enterMarks,

        notices:
            ROUTES.notices,

        notice:
            ROUTES.notices,

        "create-notice":
            ROUTES.notices

    };


    return routes[normalized] || null;

}


/* =========================================================
   NAVIGATE
========================================================= */

function navigateTo(route) {

    if (!route) {
        return;
    }


    window.location.href =
        route;

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function setActiveNavigation(item) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(nav =>
            nav.classList.remove(
                "active"
            )
        );


    item.classList.add(
        "active"
    );

}


/* =========================================================
   HEADER ACTIONS
========================================================= */

function setupHeaderActions() {

    if (DOM.refreshButton) {

        DOM.refreshButton.addEventListener(
            "click",
            refreshDashboard
        );

    }


    if (DOM.notificationButton) {

        DOM.notificationButton.addEventListener(
            "click",
            () => {

                navigateTo(
                    ROUTES.notifications
                );

            }
        );

    }


    if (DOM.facultyProfileButton) {

        DOM.facultyProfileButton.addEventListener(
            "click",
            () => {

                navigateTo(
                    ROUTES.profile
                );

            }
        );

    }

}


/* =========================================================
   REFRESH
========================================================= */

function refreshDashboard() {

    if (!DOM.refreshButton) {

        window.location.reload();

        return;

    }


    const icon =
        DOM.refreshButton.querySelector(
            "i"
        );


    if (icon) {

        icon.classList.add(
            "fa-spin"
        );

    }


    DOM.refreshButton.disabled =
        true;


    setTimeout(
        () => {

            window.location.reload();

        },
        300
    );

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    if (!DOM.globalSearch) {
        return;
    }


    DOM.globalSearch.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            const searchText =
                DOM.globalSearch.value
                    .trim()
                    .toLowerCase();


            if (!searchText) {
                return;
            }


            navigateTo(
                ROUTES.students
            );

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function setupMobileSidebar() {

    if (
        !DOM.mobileMenuBtn ||
        !DOM.sidebar ||
        !DOM.sidebarOverlay
    ) {

        return;

    }


    DOM.mobileMenuBtn.addEventListener(
        "click",
        () => {

            DOM.sidebar.classList.add(
                "open"
            );

            DOM.sidebarOverlay.classList.add(
                "active"
            );

        }
    );


    DOM.sidebarOverlay.addEventListener(
        "click",
        closeMobileSidebar
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                closeMobileSidebar
            );

        });

}


function closeMobileSidebar() {

    if (DOM.sidebar) {

        DOM.sidebar.classList.remove(
            "open"
        );

    }


    if (DOM.sidebarOverlay) {

        DOM.sidebarOverlay.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    if (
        !DOM.logoutButton ||
        !DOM.logoutModal
    ) {

        return;

    }


    DOM.logoutButton.addEventListener(
        "click",
        () => {

            DOM.logoutModal.hidden =
                false;

        }
    );


    if (DOM.cancelLogout) {

        DOM.cancelLogout.addEventListener(
            "click",
            () => {

                DOM.logoutModal.hidden =
                    true;

            }
        );

    }


    if (DOM.confirmLogout) {

        DOM.confirmLogout.addEventListener(
            "click",
            async () => {

                if (
                    CONFIG.API_BASE_URL
                ) {

                    try {

                        await fetch(
                            `${CONFIG.API_BASE_URL}/auth/logout`,
                            {
                                method: "POST",
                                credentials: "include"
                            }
                        );

                    }

                    catch (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                    }

                }


                window.location.href =
                    "../../Login/login.html";

            }
        );

    }


    DOM.logoutModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                DOM.logoutModal
            ) {

                DOM.logoutModal.hidden =
                    true;

            }

        }
    );

}


/* =========================================================
   EMPTY DASHBOARD
========================================================= */

function renderEmptyDashboard() {

    if (DOM.welcomeFacultyName) {

        DOM.welcomeFacultyName.textContent =
            "Faculty";

    }


    if (DOM.headerFacultyName) {

        DOM.headerFacultyName.textContent =
            "Faculty";

    }


    facultyState.todayClasses = [];

    facultyState.subjects = [];

    facultyState.notifications = [];

    facultyState.students = null;

    facultyState.attendance = null;

    facultyState.pendingAssignments = null;

    facultyState.upcomingExams = null;


    renderTodayClasses();

    renderSubjects();

    renderNotifications();

    renderUpcoming();

    updateStatistics();

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

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