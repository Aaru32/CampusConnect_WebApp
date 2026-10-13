/* =========================================================
   CAMPUSCONNECT
   FACULTY - CLASSES
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        CLASSES:
            "/faculty/classes",

        TODAY_CLASSES:
            "/faculty/classes/today",

        SUBJECTS:
            "/faculty/subjects",

        SUMMARY:
            "/faculty/classes/summary",

        NOTIFICATIONS:
            "/notifications"

    }

};


/* =========================================================
   STATE
========================================================= */

const state = {

    todayClasses: [],

    weeklyClasses: [],

    subjects: [],

    summary: {

        todayClasses: null,

        subjects: null,

        students: null,

        weeklyClasses: null

    },

    notifications: [],

    selectedClass: null

};


/* =========================================================
   DOM
========================================================= */

const DOM = {

    backBtn:
        document.getElementById("backBtn"),

    refreshBtn:
        document.getElementById("refreshBtn"),

    notificationBtn:
        document.getElementById("notificationBtn"),

    notificationBadge:
        document.getElementById("notificationBadge"),

    todayDate:
        document.getElementById("todayDate"),

    todayClassesCount:
        document.getElementById("todayClassesCount"),

    subjectCount:
        document.getElementById("subjectCount"),

    studentCount:
        document.getElementById("studentCount"),

    weeklyClassesCount:
        document.getElementById("weeklyClassesCount"),

    todaySchedule:
        document.getElementById("todaySchedule"),

    weeklyScheduleBody:
        document.getElementById("weeklyScheduleBody"),

    subjectsGrid:
        document.getElementById("subjectsGrid"),

    fullScheduleBtn:
        document.getElementById("fullScheduleBtn"),

    classDetailsSection:
        document.getElementById("classDetailsSection"),

    classDetails:
        document.getElementById("classDetails"),

    closeDetailsBtn:
        document.getElementById("closeDetailsBtn")

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize() {

    setupHeader();

    setupKPIActions();

    setupScheduleActions();

    displayCurrentDate();

    loadClassesPage();

}


/* =========================================================
   HEADER
========================================================= */

function setupHeader() {

    if (DOM.backBtn) {

        DOM.backBtn.addEventListener(
            "click",
            () => {

                if (
                    window.history.length > 1
                ) {

                    window.history.back();

                }

                else {

                    window.location.href =
                        "faculty-dashboard.html";

                }

            }
        );

    }


    if (DOM.refreshBtn) {

        DOM.refreshBtn.addEventListener(
            "click",
            refreshPage
        );

    }


    if (DOM.notificationBtn) {

        DOM.notificationBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "notifications.html";

            }
        );

    }

}


/* =========================================================
   LOAD PAGE
========================================================= */

async function loadClassesPage() {

    if (!CONFIG.API_BASE_URL) {

        renderEmptyPage();

        return;

    }


    try {

        await Promise.all([

            loadSummary(),

            loadTodayClasses(),

            loadWeeklyClasses(),

            loadSubjects(),

            loadNotifications()

        ]);

    }

    catch (error) {

        console.error(
            "Classes page error:",
            error
        );

        renderEmptyPage();

    }

}


/* =========================================================
   SUMMARY
========================================================= */

async function loadSummary() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.SUMMARY
        );


    if (!data) {
        return;
    }


    state.summary = {

        todayClasses:
            data.todayClasses ?? null,

        subjects:
            data.subjects ?? null,

        students:
            data.students ?? null,

        weeklyClasses:
            data.weeklyClasses ?? null

    };


    updateSummary();

}


function updateSummary() {

    DOM.todayClassesCount.textContent =
        state.summary.todayClasses !== null
            ? state.summary.todayClasses
            : "—";


    DOM.subjectCount.textContent =
        state.summary.subjects !== null
            ? state.summary.subjects
            : "—";


    DOM.studentCount.textContent =
        state.summary.students !== null
            ? state.summary.students
            : "—";


    DOM.weeklyClassesCount.textContent =
        state.summary.weeklyClasses !== null
            ? state.summary.weeklyClasses
            : "—";

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


    state.todayClasses = data;

    renderTodayClasses();

}


/* =========================================================
   WEEKLY CLASSES
========================================================= */

async function loadWeeklyClasses() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.CLASSES
        );


    if (!Array.isArray(data)) {
        return;
    }


    state.weeklyClasses = data;

    renderWeeklyClasses();

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


    state.subjects = data;

    renderSubjects();

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


    state.notifications = data;


    const unread =
        data.filter(
            item =>
                item.read === false
        ).length;


    if (
        unread > 0 &&
        DOM.notificationBadge
    ) {

        DOM.notificationBadge.textContent =
            unread;

        DOM.notificationBadge.hidden =
            false;

    }

}


/* =========================================================
   TODAY SCHEDULE
========================================================= */

function renderTodayClasses() {

    if (
        !state.todayClasses ||
        state.todayClasses.length === 0
    ) {

        DOM.todaySchedule.innerHTML = emptyState(
            "fa-calendar-xmark",
            "No classes scheduled",
            "Your classes for today will appear here when timetable data is available."
        );

        return;

    }


    DOM.todaySchedule.innerHTML = `

        <div class="today-class-list">

            ${state.todayClasses
                .map(createTodayClass)
                .join("")}

        </div>

    `;


    attachViewButtons();

}


function createTodayClass(item) {

    const id =
        item.id ||
        item.classId ||
        "";


    return `

        <article class="today-class">

            <div class="class-time">

                ${escapeHTML(
                    item.time || "—"
                )}

            </div>


            <div class="class-info">

                <strong>

                    ${escapeHTML(
                        item.subject ||
                        item.subjectName ||
                        "—"
                    )}

                </strong>

                <span>

                    ${escapeHTML(
                        item.className ||
                        item.semester ||
                        "—"
                    )}

                </span>

            </div>


            <div class="class-room">

                <i class="fa-solid fa-location-dot"></i>

                ${escapeHTML(
                    item.room || "—"
                )}

            </div>


            <button
                type="button"
                class="view-class-btn"
                data-class-id="${escapeHTML(id)}"
                aria-label="View class"
            >

                <i class="fa-solid fa-chevron-right"></i>

            </button>

        </article>

    `;

}


/* =========================================================
   WEEKLY SCHEDULE
========================================================= */

function renderWeeklyClasses() {

    if (
        !state.weeklyClasses ||
        state.weeklyClasses.length === 0
    ) {

        DOM.weeklyScheduleBody.innerHTML = `

            <tr>

                <td colspan="7">

                    ${emptyState(
                        "fa-calendar-week",
                        "No timetable available",
                        "Your weekly teaching schedule will appear here when data is available."
                    )}

                </td>

            </tr>

        `;

        return;

    }


    DOM.weeklyScheduleBody.innerHTML =

        state.weeklyClasses
            .map(createWeeklyRow)
            .join("");


    attachViewButtons();

}


function createWeeklyRow(item) {

    const id =
        item.id ||
        item.classId ||
        "";


    return `

        <tr>

            <td>

                <strong>
                    ${escapeHTML(
                        item.day || "—"
                    )}
                </strong>

            </td>

            <td>
                ${escapeHTML(
                    item.time || "—"
                )}
            </td>

            <td>

                <strong>
                    ${escapeHTML(
                        item.subject ||
                        item.subjectName ||
                        "—"
                    )}
                </strong>

            </td>

            <td>

                ${escapeHTML(
                    item.className ||
                    item.semester ||
                    "—"
                )}

            </td>

            <td>

                ${escapeHTML(
                    item.room || "—"
                )}

            </td>

            <td>

                <span class="type-badge">

                    ${escapeHTML(
                        item.type ||
                        "Lecture"
                    )}

                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="table-view-btn"
                    data-class-id="${escapeHTML(id)}"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   SUBJECTS
========================================================= */

function renderSubjects() {

    if (
        !state.subjects ||
        state.subjects.length === 0
    ) {

        DOM.subjectsGrid.innerHTML =
            emptyState(
                "fa-book-open",
                "No subjects assigned",
                "Subjects assigned specifically to this faculty member will appear here."
            );

        return;

    }


    DOM.subjectsGrid.innerHTML =

        state.subjects
            .map(createSubjectCard)
            .join("");

}


function createSubjectCard(subject) {

    return `

        <article class="subject-card">

            <span class="subject-code">

                ${escapeHTML(
                    subject.code ||
                    subject.subjectCode ||
                    "SUBJECT"
                )}

            </span>


            <h3>

                ${escapeHTML(
                    subject.name ||
                    subject.subjectName ||
                    "Subject"
                )}

            </h3>


            <p>

                ${escapeHTML(
                    subject.description ||
                    "Assigned teaching subject."
                )}

            </p>


            <div class="subject-meta">

                <span>

                    <i class="fa-solid fa-users"></i>

                    ${escapeHTML(
                        subject.students ??
                        "—"
                    )}
                    students

                </span>


                <span>

                    <i class="fa-solid fa-chalkboard"></i>

                    ${escapeHTML(
                        subject.classes ??
                        "—"
                    )}
                    classes

                </span>

            </div>

        </article>

    `;

}


/* =========================================================
   CLASS DETAILS
========================================================= */

function attachViewButtons() {

    document
        .querySelectorAll(
            "[data-class-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.classId;


                    openClassDetails(id);

                }
            );

        });

}


function openClassDetails(id) {

    const allClasses = [

        ...state.todayClasses,

        ...state.weeklyClasses

    ];


    const classData =
        allClasses.find(
            item =>
                String(
                    item.id ||
                    item.classId ||
                    ""
                ) === String(id)
        );


    if (!classData) {
        return;
    }


    state.selectedClass =
        classData;


    DOM.classDetails.innerHTML = `

        <div class="detail-box">

            <span>Subject</span>

            <strong>
                ${escapeHTML(
                    classData.subject ||
                    classData.subjectName ||
                    "—"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Class / Semester</span>

            <strong>
                ${escapeHTML(
                    classData.className ||
                    classData.semester ||
                    "—"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Day</span>

            <strong>
                ${escapeHTML(
                    classData.day ||
                    "—"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Time</span>

            <strong>
                ${escapeHTML(
                    classData.time ||
                    "—"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Room</span>

            <strong>
                ${escapeHTML(
                    classData.room ||
                    "—"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Class Type</span>

            <strong>
                ${escapeHTML(
                    classData.type ||
                    "Lecture"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Students</span>

            <strong>
                ${escapeHTML(
                    classData.students ??
                    "—"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Duration</span>

            <strong>
                ${escapeHTML(
                    classData.duration ||
                    "—"
                )}
            </strong>

        </div>


        <div class="detail-box">

            <span>Status</span>

            <strong>
                ${escapeHTML(
                    classData.status ||
                    "Scheduled"
                )}
            </strong>

        </div>

    `;


    DOM.classDetailsSection.hidden =
        false;


    DOM.classDetailsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   KPI ACTIONS
========================================================= */

function setupKPIActions() {

    document
        .querySelectorAll(".kpi-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const type =
                        card.dataset.kpi;


                    if (
                        type === "today"
                    ) {

                        document
                            .querySelector(
                                ".content-card"
                            )
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                    }


                    if (
                        type === "subjects"
                    ) {

                        DOM.subjectsGrid
                            ?.closest(
                                ".content-card"
                            )
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                    }


                    if (
                        type === "students"
                    ) {

                        /*
                         * Students are faculty-specific.
                         * The actual student list can later be
                         * opened from the Students module.
                         */

                        window.location.href =
                            "students.html";

                    }


                    if (
                        type === "weekly"
                    ) {

                        document
                            .querySelector(
                                ".weekly-table-wrapper"
                            )
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                    }

                }
            );

        });

}


/* =========================================================
   SCHEDULE ACTIONS
========================================================= */

function setupScheduleActions() {

    if (DOM.fullScheduleBtn) {

        DOM.fullScheduleBtn.addEventListener(
            "click",
            () => {

                const schedule =
                    document.querySelector(
                        ".weekly-table-wrapper"
                    );


                if (schedule) {

                    schedule.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    }


    if (DOM.closeDetailsBtn) {

        DOM.closeDetailsBtn.addEventListener(
            "click",
            () => {

                DOM.classDetailsSection.hidden =
                    true;

            }
        );

    }

}


/* =========================================================
   REFRESH
========================================================= */

function refreshPage() {

    if (!DOM.refreshBtn) {

        window.location.reload();

        return;

    }


    const icon =
        DOM.refreshBtn.querySelector("i");


    DOM.refreshBtn.disabled =
        true;


    if (icon) {

        icon.classList.add("fa-spin");

    }


    if (CONFIG.API_BASE_URL) {

        loadClassesPage()
            .finally(() => {

                setTimeout(() => {

                    DOM.refreshBtn.disabled =
                        false;

                    if (icon) {

                        icon.classList.remove(
                            "fa-spin"
                        );

                    }

                }, 500);

            });

    }

    else {

        setTimeout(() => {

            window.location.reload();

        }, 350);

    }

}


/* =========================================================
   DATE
========================================================= */

function displayCurrentDate() {

    if (!DOM.todayDate) {
        return;
    }


    const date =
        new Date();


    DOM.todayDate.textContent =
        date.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* =========================================================
   EMPTY PAGE
========================================================= */

function renderEmptyPage() {

    state.todayClasses = [];

    state.weeklyClasses = [];

    state.subjects = [];


    state.summary = {

        todayClasses: null,

        subjects: null,

        students: null,

        weeklyClasses: null

    };


    updateSummary();

    renderTodayClasses();

    renderWeeklyClasses();

    renderSubjects();

}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(
    icon,
    title,
    message
) {

    return `

        <div class="empty-state">

            <i class="fa-regular ${icon}"></i>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   API
========================================================= */

async function apiRequest(endpoint) {

    if (!CONFIG.API_BASE_URL) {

        return null;

    }


    const response =
        await fetch(
            CONFIG.API_BASE_URL +
            endpoint,
            {

                method: "GET",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                credentials:
                    "include"

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
   SECURITY
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