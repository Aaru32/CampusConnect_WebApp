/* =========================================================
   CAMPUSCONNECT
   FACULTY EXAMINATIONS
   Dynamic / API-Ready Architecture
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        SUMMARY:
            "/faculty/examinations/summary",

        UPCOMING:
            "/faculty/examinations/upcoming",

        DUTIES:
            "/faculty/examinations/duties",

        STUDENT_STATUS:
            "/faculty/examinations/student-status",

        PAST:
            "/faculty/examinations/past",

        SCHEDULE:
            "/faculty/examinations/schedule",

        EVALUATION:
            "/faculty/examinations/evaluation"

    }

};


/* =========================================================
   DOM
========================================================= */

const DOM = {

    backButton:
        document.getElementById("backButton"),

    refreshButton:
        document.getElementById("refreshButton"),

    totalExaminations:
        document.getElementById("totalExaminations"),

    upcomingExaminations:
        document.getElementById("upcomingExaminations"),

    ongoingExaminations:
        document.getElementById("ongoingExaminations"),

    completedExaminations:
        document.getElementById("completedExaminations"),

    upcomingContainer:
        document.getElementById(
            "upcomingExaminationsContainer"
        ),

    dutiesContainer:
        document.getElementById(
            "dutiesContainer"
        ),

    pastContainer:
        document.getElementById(
            "pastExaminationsContainer"
        ),

    eligibleStudents:
        document.getElementById("eligibleStudents"),

    appearedStudents:
        document.getElementById("appearedStudents"),

    absentStudents:
        document.getElementById("absentStudents"),

    examSearch:
        document.getElementById("examSearch"),

    semesterFilter:
        document.getElementById("semesterFilter"),

    statusFilter:
        document.getElementById("statusFilter"),

    examModal:
        document.getElementById("examModal"),

    modalClose:
        document.getElementById("modalClose"),

    modalContent:
        document.getElementById("modalContent")

};


/* =========================================================
   STATE
========================================================= */

const state = {

    summary: null,

    upcoming: [],

    duties: [],

    studentStatus: null,

    past: [],

    filteredPast: []

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize() {

    setupBackButton();

    setupRefresh();

    setupOverviewCards();

    setupQuickActions();

    setupStudentStatusCards();

    setupFilters();

    setupModal();

    loadExaminations();

}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadExaminations() {

    if (!CONFIG.API_BASE_URL) {

        renderEmptyPage();

        return;

    }


    try {

        await Promise.all([

            loadSummary(),

            loadUpcoming(),

            loadDuties(),

            loadStudentStatus(),

            loadPast()

        ]);

    }

    catch (error) {

        console.error(
            "Examination loading error:",
            error
        );

        renderEmptyPage();

    }

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


    state.summary = data;

    updateSummary();

}


function updateSummary() {

    const summary =
        state.summary || {};


    if (DOM.totalExaminations) {

        DOM.totalExaminations.textContent =
            summary.total ?? "—";

    }


    if (DOM.upcomingExaminations) {

        DOM.upcomingExaminations.textContent =
            summary.upcoming ?? "—";

    }


    if (DOM.ongoingExaminations) {

        DOM.ongoingExaminations.textContent =
            summary.ongoing ?? "—";

    }


    if (DOM.completedExaminations) {

        DOM.completedExaminations.textContent =
            summary.completed ?? "—";

    }

}


/* =========================================================
   UPCOMING
========================================================= */

async function loadUpcoming() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.UPCOMING
        );


    if (!Array.isArray(data)) {
        return;
    }


    state.upcoming = data;

    renderUpcoming();

}


function renderUpcoming() {

    if (!DOM.upcomingContainer) {
        return;
    }


    if (state.upcoming.length === 0) {

        DOM.upcomingContainer.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-calendar-xmark"></i>

                <h3>
                    No upcoming examinations
                </h3>

                <p>
                    Examination data will appear here
                    when available.
                </p>

            </div>

        `;

        return;

    }


    DOM.upcomingContainer.innerHTML = `

        <table class="examination-table">

            <thead>

                <tr>

                    <th>Examination</th>
                    <th>Subject</th>
                    <th>Class / Semester</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                ${state.upcoming
                    .map(createUpcomingRow)
                    .join("")}

            </tbody>

        </table>

    `;


    attachViewButtons();

}


function createUpcomingRow(exam) {

    const id =
        exam.id ||
        exam.examinationId ||
        "";


    const name =
        escapeHTML(
            exam.name ||
            exam.examinationName ||
            "—"
        );


    const subject =
        escapeHTML(
            exam.subject ||
            exam.subjectName ||
            "—"
        );


    const semester =
        escapeHTML(
            exam.semester ||
            exam.className ||
            "—"
        );


    const date =
        escapeHTML(
            exam.date ||
            "—"
        );


    const time =
        escapeHTML(
            exam.time ||
            "—"
        );


    const room =
        escapeHTML(
            exam.room ||
            "—"
        );


    const status =
        normalizeStatus(
            exam.status
        );


    return `

        <tr>

            <td>
                <strong>${name}</strong>
            </td>

            <td>
                ${subject}
            </td>

            <td>
                ${semester}
            </td>

            <td>
                ${date}
            </td>

            <td>
                ${time}
            </td>

            <td>
                ${room}
            </td>

            <td>
                ${createStatusBadge(status)}
            </td>

            <td>

                <button
                    type="button"
                    class="table-action view-exam"
                    data-id="${escapeHTML(id)}"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   DUTIES
========================================================= */

async function loadDuties() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.DUTIES
        );


    if (!Array.isArray(data)) {
        return;
    }


    state.duties = data;

    renderDuties();

}


function renderDuties() {

    if (!DOM.dutiesContainer) {
        return;
    }


    if (state.duties.length === 0) {

        DOM.dutiesContainer.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-user-check"></i>

                <h3>
                    No examination duties
                </h3>

                <p>
                    Assigned invigilation duties will appear here.
                </p>

            </div>

        `;

        return;

    }


    DOM.dutiesContainer.innerHTML = `

        <table class="examination-table">

            <thead>

                <tr>

                    <th>Examination</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                ${state.duties
                    .map(createDutyRow)
                    .join("")}

            </tbody>

        </table>

    `;


    attachViewButtons();

}


function createDutyRow(duty) {

    const id =
        duty.id ||
        duty.dutyId ||
        "";


    return `

        <tr>

            <td>
                <strong>
                    ${escapeHTML(
                        duty.examinationName ||
                        duty.name ||
                        "—"
                    )}
                </strong>
            </td>

            <td>
                ${escapeHTML(
                    duty.subject ||
                    duty.subjectName ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    duty.date ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    duty.time ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    duty.room ||
                    "—"
                )}
            </td>

            <td>
                ${createStatusBadge(
                    normalizeStatus(duty.status)
                )}
            </td>

            <td>

                <button
                    type="button"
                    class="table-action view-exam"
                    data-id="${escapeHTML(id)}"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   STUDENT STATUS
========================================================= */

async function loadStudentStatus() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.STUDENT_STATUS
        );


    if (!data) {
        return;
    }


    state.studentStatus = data;

    updateStudentStatus();

}


function updateStudentStatus() {

    const data =
        state.studentStatus || {};


    if (DOM.eligibleStudents) {

        DOM.eligibleStudents.textContent =
            data.eligible ?? "—";

    }


    if (DOM.appearedStudents) {

        DOM.appearedStudents.textContent =
            data.appeared ?? "—";

    }


    if (DOM.absentStudents) {

        DOM.absentStudents.textContent =
            data.absent ?? "—";

    }

}


/* =========================================================
   PAST EXAMINATIONS
========================================================= */

async function loadPast() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.PAST
        );


    if (!Array.isArray(data)) {
        return;
    }


    state.past = data;

    filterPastExaminations();

}


function filterPastExaminations() {

    const search =
        DOM.examSearch
            ? DOM.examSearch.value
                .trim()
                .toLowerCase()
            : "";


    const semester =
        DOM.semesterFilter
            ? DOM.semesterFilter.value
            : "";


    const status =
        DOM.statusFilter
            ? DOM.statusFilter.value
            : "";


    state.filteredPast =
        state.past.filter(
            exam => {

                const searchableText =
                    [

                        exam.name,
                        exam.examinationName,
                        exam.subject,
                        exam.subjectName,
                        exam.className,
                        exam.semester

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const matchesSemester =
                    !semester ||
                    String(
                        exam.semester || ""
                    ) === semester;


                const matchesStatus =
                    !status ||
                    normalizeStatus(
                        exam.status
                    ) === status;


                return (
                    matchesSearch &&
                    matchesSemester &&
                    matchesStatus
                );

            }
        );


    renderPast();

}


function renderPast() {

    if (!DOM.pastContainer) {
        return;
    }


    if (
        state.filteredPast.length === 0
    ) {

        DOM.pastContainer.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-folder-open"></i>

                <h3>
                    No past examinations
                </h3>

                <p>
                    Completed examination records will appear here.
                </p>

            </div>

        `;

        return;

    }


    DOM.pastContainer.innerHTML = `

        <table class="examination-table">

            <thead>

                <tr>

                    <th>Examination</th>
                    <th>Subject</th>
                    <th>Class / Semester</th>
                    <th>Date</th>
                    <th>Evaluation</th>
                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                ${state.filteredPast
                    .map(createPastRow)
                    .join("")}

            </tbody>

        </table>

    `;


    attachViewButtons();

}


function createPastRow(exam) {

    const id =
        exam.id ||
        exam.examinationId ||
        "";


    const evaluation =
        normalizeStatus(
            exam.status
        );


    return `

        <tr>

            <td>
                <strong>
                    ${escapeHTML(
                        exam.name ||
                        exam.examinationName ||
                        "—"
                    )}
                </strong>
            </td>

            <td>
                ${escapeHTML(
                    exam.subject ||
                    exam.subjectName ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    exam.className ||
                    exam.semester ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    exam.date ||
                    "—"
                )}
            </td>

            <td>
                ${createStatusBadge(evaluation)}
            </td>

            <td>

                <button
                    type="button"
                    class="table-action view-exam"
                    data-id="${escapeHTML(id)}"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   OVERVIEW FILTERS
========================================================= */

function setupOverviewCards() {

    document
        .querySelectorAll(
            ".overview-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const filter =
                        card.dataset.filter;

                    if (
                        filter === "all"
                    ) {

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                        return;

                    }


                    const section =
                        document.querySelector(
                            ".examinations-section"
                        );


                    if (section) {

                        section.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        });

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
                () => {

                    const action =
                        button.dataset.action;


                    if (
                        action === "schedule"
                    ) {

                        openInformationModal(
                            "Schedule Examination",
                            "The examination scheduling form will be connected to the faculty examination API. Faculty will be able to create examination schedules for their assigned classes and subjects."
                        );

                    }


                    if (
                        action === "duties"
                    ) {

                        document
                            .getElementById(
                                "dutiesContainer"
                            )
                            ?.scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                    }


                    if (
                        action === "evaluation"
                    ) {

                        openInformationModal(
                            "Marks & Evaluation",
                            "This section will allow faculty to enter, update and submit examination marks for students assigned to their subjects."
                        );

                    }

                }
            );

        });

}


/* =========================================================
   STUDENT STATUS CARDS
========================================================= */

function setupStudentStatusCards() {

    document
        .querySelectorAll(
            ".status-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const status =
                        card.dataset.status;


                    openInformationModal(
                        "Student Examination Status",
                        `Student ${status} records will be loaded dynamically from the examination database.`
                    );

                }
            );

        });

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    if (DOM.examSearch) {

        DOM.examSearch.addEventListener(
            "input",
            filterPastExaminations
        );

    }


    if (DOM.semesterFilter) {

        DOM.semesterFilter.addEventListener(
            "change",
            filterPastExaminations
        );

    }


    if (DOM.statusFilter) {

        DOM.statusFilter.addEventListener(
            "change",
            filterPastExaminations
        );

    }

}


/* =========================================================
   VIEW EXAMINATION
========================================================= */

function attachViewButtons() {

    document
        .querySelectorAll(
            ".view-exam"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    openExamDetails(id);

                }
            );

        });

}


function openExamDetails(id) {

    const allExams = [

        ...state.upcoming,
        ...state.duties,
        ...state.past

    ];


    const exam =
        allExams.find(
            item =>
                String(
                    item.id ||
                    item.examinationId ||
                    item.dutyId ||
                    ""
                ) === String(id)
        );


    if (!exam) {

        openInformationModal(
            "Examination Details",
            "The examination details will be loaded from the backend when examination data is available."
        );

        return;

    }


    const name =
        escapeHTML(
            exam.name ||
            exam.examinationName ||
            "Examination"
        );


    const subject =
        escapeHTML(
            exam.subject ||
            exam.subjectName ||
            "—"
        );


    const date =
        escapeHTML(
            exam.date ||
            "—"
        );


    const time =
        escapeHTML(
            exam.time ||
            "—"
        );


    const room =
        escapeHTML(
            exam.room ||
            "—"
        );


    DOM.modalContent.innerHTML = `

        <h2 class="modal-title">
            ${name}
        </h2>

        <p class="modal-description">
            Examination details
        </p>

        <div class="modal-note">

            <strong>Subject:</strong>
            ${subject}

            <br><br>

            <strong>Date:</strong>
            ${date}

            <br><br>

            <strong>Time:</strong>
            ${time}

            <br><br>

            <strong>Room:</strong>
            ${room}

        </div>

        <div class="modal-actions">

            <button
                type="button"
                class="modal-primary"
                id="modalStudentStatus"
            >
                Student Status
            </button>

            <button
                type="button"
                class="modal-secondary"
                id="modalCloseAction"
            >
                Close
            </button>

        </div>

    `;


    openModal();


    document
        .getElementById(
            "modalStudentStatus"
        )
        ?.addEventListener(
            "click",
            () => {

                openInformationModal(
                    "Student Examination Status",
                    "Student eligibility, attendance, appeared and absent records will be loaded dynamically from the backend."
                );

            }
        );


    document
        .getElementById(
            "modalCloseAction"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

    if (DOM.modalClose) {

        DOM.modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (DOM.examModal) {

        DOM.examModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    DOM.examModal
                ) {

                    closeModal();

                }

            }
        );

    }

}


function openModal() {

    DOM.examModal.hidden = false;

}


function closeModal() {

    DOM.examModal.hidden = true;

}


function openInformationModal(
    title,
    message
) {

    DOM.modalContent.innerHTML = `

        <h2 class="modal-title">
            ${escapeHTML(title)}
        </h2>

        <p class="modal-description">
            ${escapeHTML(message)}
        </p>

        <div class="modal-actions">

            <button
                type="button"
                class="modal-primary"
                id="informationClose"
            >
                Close
            </button>

        </div>

    `;


    openModal();


    document
        .getElementById(
            "informationClose"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

}


/* =========================================================
   BACK BUTTON
========================================================= */

function setupBackButton() {

    if (!DOM.backButton) {
        return;
    }


    DOM.backButton.addEventListener(
        "click",
        () => {

            if (
                window.history.length > 1
            ) {

                window.history.back();

            } else {

                window.location.href =
                    "faculty-dashboard.html";

            }

        }
    );

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

    if (!DOM.refreshButton) {
        return;
    }


    DOM.refreshButton.addEventListener(
        "click",
        () => {

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
    );

}


/* =========================================================
   EMPTY PAGE
========================================================= */

function renderEmptyPage() {

    state.summary = null;

    state.upcoming = [];

    state.duties = [];

    state.studentStatus = null;

    state.past = [];

    state.filteredPast = [];


    updateSummary();

    updateStudentStatus();

    renderUpcoming();

    renderDuties();

    renderPast();

}


/* =========================================================
   STATUS HELPERS
========================================================= */

function normalizeStatus(status) {

    return String(
        status || ""
    )
        .trim()
        .toLowerCase()
        .replaceAll(
            "_",
            "-"
        )
        .replaceAll(
            " ",
            "-"
        );

}


function createStatusBadge(status) {

    const safeStatus =
        escapeHTML(
            status || "—"
        );


    let className =
        "status-badge";


    if (
        status === "upcoming"
    ) {

        className +=
            " status-upcoming";

    }


    else if (
        status === "ongoing"
    ) {

        className +=
            " status-ongoing";

    }


    else if (
        status === "completed" ||
        status === "evaluation-completed"
    ) {

        className +=
            " status-completed";

    }


    else if (
        status === "evaluation-pending"
    ) {

        className +=
            " status-pending";

    }


    return `

        <span class="${className}">
            ${safeStatus || "—"}
        </span>

    `;

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