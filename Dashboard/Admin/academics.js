"use strict";

/*

* CampusConnect
* Academic Management
* 
* Backend-ready architecture.
* No fake college/session data is loaded automatically.
* 
* Later API integration can replace the local session state with:
* 
* GET    /admin/academic/sessions
* POST   /admin/academic/sessions
* PUT    /admin/academic/sessions/{id}
* DELETE /admin/academic/sessions/{id}
* 

*/

const CONFIG = {
API_BASE_URL: "",
ENDPOINTS: {
sessions: "/admin/academic/sessions"
}
};

/* =========================================================
STATE
========================================================= */

const state = {
sessions: [],
filteredSessions: [],
editingSessionId: null
};

/* =========================================================
DOM
========================================================= */

const elements = {
backBtn: document.getElementById("backBtn"),
refreshBtn: document.getElementById("refreshBtn"),

notificationBtn: document.getElementById("notificationBtn"),
notificationDot: document.getElementById("notificationDot"),
notificationPanel: document.getElementById("notificationPanel"),
closeNotificationBtn: document.getElementById("closeNotificationBtn"),

currentSession: document.getElementById("currentSession"),
currentSessionStatus: document.getElementById("currentSessionStatus"),
totalSessions: document.getElementById("totalSessions"),
calendarStatus: document.getElementById("calendarStatus"),
reportStatus: document.getElementById("reportStatus"),

addSessionBtn: document.getElementById("addSessionBtn"),
sessionAddButton: document.getElementById("sessionAddButton"),

calendarCard: document.getElementById("calendarCard"),
reportsCard: document.getElementById("reportsCard"),
sessionManagementCard: document.getElementById("sessionManagementCard"),
academicStructureCard: document.getElementById("academicStructureCard"),

sessionSection: document.getElementById("sessionSection"),
sessionSearch: document.getElementById("sessionSearch"),
sessionStatusFilter: document.getElementById("sessionStatusFilter"),
sessionTableBody: document.getElementById("sessionTableBody"),
sessionEmptyState: document.getElementById("sessionEmptyState"),
sessionSearchEmpty: document.getElementById("sessionSearchEmpty"),
clearSessionSearchBtn: document.getElementById("clearSessionSearchBtn"),
emptyAddSessionBtn: document.getElementById("emptyAddSessionBtn"),

calendarResourceBtn: document.getElementById("calendarResourceBtn"),
reportsResourceBtn: document.getElementById("reportsResourceBtn"),
dashboardResourceBtn: document.getElementById("dashboardResourceBtn"),

sessionModal: document.getElementById("sessionModal"),
sessionModalTitle: document.getElementById("sessionModalTitle"),
closeSessionModalBtn: document.getElementById("closeSessionModalBtn"),
cancelSessionBtn: document.getElementById("cancelSessionBtn"),

sessionForm: document.getElementById("sessionForm"),
editingSessionId: document.getElementById("editingSessionId"),

sessionName: document.getElementById("sessionName"),
sessionNameError: document.getElementById("sessionNameError"),

sessionStartDate: document.getElementById("sessionStartDate"),
sessionEndDate: document.getElementById("sessionEndDate"),
sessionStatus: document.getElementById("sessionStatus"),
sessionCurrent: document.getElementById("sessionCurrent"),

toastContainer: document.getElementById("toastContainer")

};

/* =========================================================
INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {

bindEvents();

/*
 * Keep this empty until the backend is connected.
 * This prevents fake/default academic sessions.
 */
state.sessions = [];

renderSessions();
updateOverview();

}

/* =========================================================
EVENT BINDING
========================================================= */

function bindEvents() {

elements.backBtn.addEventListener("click", goBack);

elements.refreshBtn.addEventListener("click", refreshPage);

elements.notificationBtn.addEventListener(
    "click",
    toggleNotificationPanel
);

elements.closeNotificationBtn.addEventListener(
    "click",
    closeNotificationPanel
);


/* Session */

elements.addSessionBtn.addEventListener(
    "click",
    () => openSessionModal()
);

elements.sessionAddButton.addEventListener(
    "click",
    () => openSessionModal()
);

elements.emptyAddSessionBtn.addEventListener(
    "click",
    () => openSessionModal()
);


/* Session filters */

elements.sessionSearch.addEventListener(
    "input",
    applySessionFilters
);

elements.sessionStatusFilter.addEventListener(
    "change",
    applySessionFilters
);

elements.clearSessionSearchBtn.addEventListener(
    "click",
    clearSessionFilters
);


/* Operations */

elements.calendarCard.addEventListener(
    "click",
    openAcademicCalendar
);

elements.reportsCard.addEventListener(
    "click",
    openReports
);

elements.sessionManagementCard.addEventListener(
    "click",
    scrollToSessions
);

elements.academicStructureCard.addEventListener(
    "click",
    openAcademicStructure
);


/* Resources */

elements.calendarResourceBtn.addEventListener(
    "click",
    openAcademicCalendar
);

elements.reportsResourceBtn.addEventListener(
    "click",
    openReports
);

elements.dashboardResourceBtn.addEventListener(
    "click",
    openDashboard
);


/* Modal */

elements.closeSessionModalBtn.addEventListener(
    "click",
    closeSessionModal
);

elements.cancelSessionBtn.addEventListener(
    "click",
    closeSessionModal
);

elements.sessionModal.addEventListener(
    "click",
    handleModalBackdropClick
);

elements.sessionForm.addEventListener(
    "submit",
    handleSessionSubmit
);


document.addEventListener(
    "keydown",
    handleKeyboard
);

}

/* =========================================================
NAVIGATION
========================================================= */

function goBack() {

if (window.history.length > 1) {
    window.history.back();
} else {
    openDashboard();
}

}

function openDashboard() {

window.location.href = "../admin-dashboard.html";

}

function openAcademicCalendar() {

window.location.href = "academic-calendar.html";

}

function openReports() {

window.location.href = "reports-analytics.html";

}

function openAcademicStructure() {

/*
 * Department Management is the existing academic
 * structure page in the CampusConnect Admin section.
 */
window.location.href = "admin-departments.html";

}

function scrollToSessions() {

elements.sessionSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
});

}

/* =========================================================
REFRESH
========================================================= */

function refreshPage() {

/*
 * Once backend integration is enabled,
 * this is where loadSessionsFromAPI() should run.
 */

showToast(
    "Academic management refreshed.",
    "success"
);

renderSessions();
updateOverview();

}

/* =========================================================
SESSION MODAL
========================================================= */

function openSessionModal(session = null) {

clearFormErrors();

elements.sessionForm.reset();

if (session) {

    state.editingSessionId = session.id;

    elements.sessionModalTitle.textContent =
        "Edit Academic Session";

    elements.editingSessionId.value =
        session.id;

    elements.sessionName.value =
        session.name || "";

    elements.sessionStartDate.value =
        session.startDate || "";

    elements.sessionEndDate.value =
        session.endDate || "";

    elements.sessionStatus.value =
        session.status || "upcoming";

    elements.sessionCurrent.checked =
        Boolean(session.current);

} else {

    state.editingSessionId = null;

    elements.sessionModalTitle.textContent =
        "Add Session";

    elements.editingSessionId.value = "";
}

elements.sessionModal.hidden = false;

document.body.style.overflow = "hidden";

setTimeout(() => {
    elements.sessionName.focus();
}, 50);

}

function closeSessionModal() {

elements.sessionModal.hidden = true;

document.body.style.overflow = "";

state.editingSessionId = null;

elements.sessionForm.reset();

clearFormErrors();

}

function handleModalBackdropClick(event) {

if (event.target === elements.sessionModal) {
    closeSessionModal();
}

}

/* =========================================================
SESSION FORM
========================================================= */

function handleSessionSubmit(event) {

event.preventDefault();

clearFormErrors();

const name =
    elements.sessionName.value.trim();

const startDate =
    elements.sessionStartDate.value;

const endDate =
    elements.sessionEndDate.value;

const status =
    elements.sessionStatus.value;

const current =
    elements.sessionCurrent.checked;


let valid = true;


if (!name) {

    elements.sessionNameError.textContent =
        "Academic session is required.";

    valid = false;
}


if (!startDate || !endDate) {

    showToast(
        "Please enter both start and end dates.",
        "error"
    );

    valid = false;
}


if (startDate && endDate) {

    if (new Date(startDate) > new Date(endDate)) {

        showToast(
            "End date cannot be earlier than start date.",
            "error"
        );

        valid = false;
    }
}


if (!valid) {
    return;
}


/*
 * Prevent duplicate session names when creating.
 */
const duplicate = state.sessions.some(session => {

    return (
        session.name.toLowerCase() === name.toLowerCase() &&
        session.id !== state.editingSessionId
    );

});


if (duplicate) {

    elements.sessionNameError.textContent =
        "This academic session already exists.";

    return;
}


if (state.editingSessionId) {

    updateExistingSession({
        id: state.editingSessionId,
        name,
        startDate,
        endDate,
        status,
        current
    });

} else {

    createSession({
        name,
        startDate,
        endDate,
        status,
        current
    });
}


closeSessionModal();

renderSessions();

updateOverview();

}

/* =========================================================
CREATE SESSION
========================================================= */

function createSession(data) {

/*
 * Temporary client-side state only.
 *
 * Replace this function with POST API integration
 * when the Java/MySQL backend is connected.
 */

const session = {
    id: createId(),
    ...data
};


if (session.current) {

    state.sessions.forEach(item => {
        item.current = false;
    });
}


state.sessions.push(session);

showToast(
    "Academic session added successfully.",
    "success"
);

}

/* =========================================================
UPDATE SESSION
========================================================= */

function updateExistingSession(data) {

const index = state.sessions.findIndex(
    session => session.id === data.id
);

if (index === -1) {
    return;
}


if (data.current) {

    state.sessions.forEach(session => {
        session.current = false;
    });
}


state.sessions[index] = {
    ...state.sessions[index],
    ...data
};


showToast(
    "Academic session updated successfully.",
    "success"
);

}

/* =========================================================
DELETE SESSION
========================================================= */

function deleteSession(id) {

const session =
    state.sessions.find(item => item.id === id);

if (!session) {
    return;
}


const confirmed = window.confirm(
    `Delete academic session "${session.name}"?`
);

if (!confirmed) {
    return;
}


state.sessions =
    state.sessions.filter(
        item => item.id !== id
    );


renderSessions();

updateOverview();

showToast(
    "Academic session deleted.",
    "success"
);

}

/* =========================================================
SET CURRENT SESSION
========================================================= */

function setCurrentSession(id) {

const selected =
    state.sessions.find(
        session => session.id === id
    );

if (!selected) {
    return;
}


state.sessions.forEach(session => {

    session.current =
        session.id === id;

});


renderSessions();

updateOverview();

showToast(
    `${selected.name} is now the current session.`,
    "success"
);

}

/* =========================================================
RENDER
========================================================= */

function renderSessions() {

applySessionFilters();

}

function applySessionFilters() {

const search =
    elements.sessionSearch.value
        .trim()
        .toLowerCase();

const status =
    elements.sessionStatusFilter.value;


state.filteredSessions =
    state.sessions.filter(session => {

        const matchesSearch =
            !search ||
            session.name
                .toLowerCase()
                .includes(search);


        const matchesStatus =
            !status ||
            session.status === status;


        return matchesSearch && matchesStatus;
    });


renderSessionTable();

updateSessionEmptyStates();

}

/* =========================================================
SESSION TABLE
========================================================= */

function renderSessionTable() {

elements.sessionTableBody.innerHTML = "";


state.filteredSessions.forEach(session => {

    const row =
        document.createElement("tr");


    const statusClass =
        `status-${session.status}`;


    row.innerHTML = `
        <td>
            <span class="session-name">
                ${escapeHtml(session.name)}
            </span>
        </td>

        <td>
            ${formatDate(session.startDate)}
        </td>

        <td>
            ${formatDate(session.endDate)}
        </td>

        <td>
            <span class="status-badge ${statusClass}">
                ${capitalize(session.status)}
            </span>
        </td>

        <td>
            ${
                session.current
                ? `
                    <span class="current-badge">
                        Current
                    </span>
                `
                : `
                    <button
                        type="button"
                        class="table-action"
                        data-action="set-current"
                        data-id="${session.id}"
                        title="Set as current"
                        aria-label="Set as current"
                    >
                        <i class="fa-solid fa-check"></i>
                    </button>
                `
            }
        </td>

        <td>
            <div class="action-buttons">

                <button
                    type="button"
                    class="table-action"
                    data-action="edit"
                    data-id="${session.id}"
                    title="Edit session"
                    aria-label="Edit session"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    type="button"
                    class="table-action delete"
                    data-action="delete"
                    data-id="${session.id}"
                    title="Delete session"
                    aria-label="Delete session"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>
        </td>
    `;


    elements.sessionTableBody.appendChild(row);
});


elements.sessionTableBody
    .querySelectorAll("[data-action]")
    .forEach(button => {

        button.addEventListener(
            "click",
            handleSessionAction
        );

    });

}

/* =========================================================
SESSION ACTIONS
========================================================= */

function handleSessionAction(event) {

const button =
    event.currentTarget;

const action =
    button.dataset.action;

const id =
    button.dataset.id;


const session =
    state.sessions.find(
        item => item.id === id
    );


if (!session) {
    return;
}


if (action === "edit") {

    openSessionModal(session);

    return;
}


if (action === "delete") {

    deleteSession(id);

    return;
}


if (action === "set-current") {

    setCurrentSession(id);
}

}

/* =========================================================
EMPTY STATES
========================================================= */

function updateSessionEmptyStates() {

const hasSessions =
    state.sessions.length > 0;

const hasFilteredResults =
    state.filteredSessions.length > 0;


elements.sessionEmptyState.hidden =
    hasSessions;

elements.sessionSearchEmpty.hidden =
    !hasSessions || hasFilteredResults;


elements.sessionTableBody.parentElement.style.display =
    hasFilteredResults ? "" : "none";

}

/* =========================================================
OVERVIEW
========================================================= */

function updateOverview() {

const current =
    state.sessions.find(
        session => session.current
    );


elements.totalSessions.textContent =
    state.sessions.length;


if (current) {

    elements.currentSession.textContent =
        current.name;

    elements.currentSessionStatus.textContent =
        `${capitalize(current.status)} session`;

} else {

    elements.currentSession.textContent =
        "—";

    elements.currentSessionStatus.textContent =
        "No current session";
}


/*
 * These values indicate page availability rather than
 * fake academic statistics.
 */

elements.calendarStatus.textContent =
    "Available";

elements.reportStatus.textContent =
    "Available";

}

/* =========================================================
FILTER CLEAR
========================================================= */

function clearSessionFilters() {

elements.sessionSearch.value = "";

elements.sessionStatusFilter.value = "";

applySessionFilters();

}

/* =========================================================
NOTIFICATIONS
========================================================= */

function toggleNotificationPanel() {

elements.notificationPanel.hidden =
    !elements.notificationPanel.hidden;

}

function closeNotificationPanel() {

elements.notificationPanel.hidden = true;

}

/* =========================================================
KEYBOARD
========================================================= */

function handleKeyboard(event) {

if (event.key === "Escape") {

    if (!elements.sessionModal.hidden) {
        closeSessionModal();
    }

    if (!elements.notificationPanel.hidden) {
        closeNotificationPanel();
    }
}

}

/* =========================================================
FORM HELPERS
========================================================= */

function clearFormErrors() {

elements.sessionNameError.textContent = "";

}

/* =========================================================
TOAST
========================================================= */

function showToast(message, type = "success") {

const toast =
    document.createElement("div");

toast.className =
    `toast ${type}`;

toast.textContent =
    message;


elements.toastContainer.appendChild(toast);


setTimeout(() => {

    toast.remove();

}, 3200);

}

/* =========================================================
UTILITIES
========================================================= */

function createId() {

return (
    Date.now().toString(36) +
    Math.random()
        .toString(36)
        .slice(2, 8)
);

}

function capitalize(value) {

if (!value) {
    return "";
}

return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
);

}

function formatDate(value) {

if (!value) {
    return "—";
}

const date =
    new Date(`${value}T00:00:00`);

if (Number.isNaN(date.getTime())) {
    return value;
}

return date.toLocaleDateString(
    "en-IN",
    {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }
);

}

function escapeHtml(value) {

return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

/* =========================================================
FUTURE API PLACEHOLDER
========================================================= */

/*
async function loadSessionsFromAPI() {

if (!CONFIG.API_BASE_URL) {
    return;
}

const response = await fetch(
    CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.sessions
);

if (!response.ok) {
    throw new Error("Unable to load academic sessions.");
}

const data = await response.json();

state.sessions = data;

renderSessions();
updateOverview();

}
*/