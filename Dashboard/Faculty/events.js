/* =========================================================
   CAMPUSCONNECT
   FACULTY EVENTS
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        EVENTS:
            "/faculty/events",

        NOTIFICATIONS:
            "/notifications"

    }

};


/* =========================================================
   ROUTES
========================================================= */

const ROUTES = {

    NOTIFICATIONS:
        "notifications.html"

};


/* =========================================================
   DOM
========================================================= */

const DOM = {

    backBtn:
        document.getElementById("backBtn"),

    refreshButton:
        document.getElementById("refreshButton"),

    notificationButton:
        document.getElementById("notificationButton"),

    notificationCount:
        document.getElementById("notificationCount"),

    eventSearch:
        document.getElementById("eventSearch"),

    eventType:
        document.getElementById("eventType"),

    eventStatus:
        document.getElementById("eventStatus"),

    eventMonth:
        document.getElementById("eventMonth"),

    clearFilters:
        document.getElementById("clearFilters"),

    eventsContainer:
        document.getElementById("eventsContainer"),

    resultCount:
        document.getElementById("resultCount"),

    totalEvents:
        document.getElementById("totalEvents"),

    upcomingEvents:
        document.getElementById("upcomingEvents"),

    assignedEvents:
        document.getElementById("assignedEvents"),

    departmentEvents:
        document.getElementById("departmentEvents"),

    eventDetailsModal:
        document.getElementById("eventDetailsModal"),

    closeEventDetails:
        document.getElementById("closeEventDetails"),

    modalCloseButton:
        document.getElementById("modalCloseButton"),

    detailsTitle:
        document.getElementById("eventDetailsTitle"),

    detailsStatus:
        document.getElementById("detailsStatus"),

    detailsType:
        document.getElementById("detailsType"),

    detailsDate:
        document.getElementById("detailsDate"),

    detailsTime:
        document.getElementById("detailsTime"),

    detailsVenue:
        document.getElementById("detailsVenue"),

    detailsDepartment:
        document.getElementById("detailsDepartment"),

    detailsOrganizer:
        document.getElementById("detailsOrganizer"),

    detailsFacultyRole:
        document.getElementById("detailsFacultyRole"),

    detailsDescription:
        document.getElementById("detailsDescription"),

    detailsAudience:
        document.getElementById("detailsAudience"),

    detailsInstructions:
        document.getElementById("detailsInstructions"),

    detailsContact:
        document.getElementById("detailsContact"),

    audienceSection:
        document.getElementById("audienceSection"),

    instructionsSection:
        document.getElementById("instructionsSection"),

    contactSection:
        document.getElementById("contactSection"),

    attachmentSection:
        document.getElementById("attachmentSection"),

    detailsAttachments:
        document.getElementById("detailsAttachments")

};


/* =========================================================
   STATE
========================================================= */

const state = {

    events: [],

    filteredEvents: [],

    notifications: []

};


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeEventsPage
);


function initializeEventsPage() {

    setupBackButton();

    setupRefresh();

    setupNotifications();

    setupFilters();

    setupModal();

    loadEvents();

    loadNotifications();

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
   LOAD EVENTS
========================================================= */

async function loadEvents() {

    if (!CONFIG.API_BASE_URL) {

        state.events = [];

        populateEventTypes();

        applyFilters();

        return;

    }

    try {

        const data =
            await apiRequest(
                CONFIG.ENDPOINTS.EVENTS
            );

        /*
         * Backend may return either:
         *
         * [
         *   {...}
         * ]
         *
         * or
         *
         * {
         *   events: [...]
         * }
         */

        const events =
            Array.isArray(data)
                ? data
                : data?.events;

        state.events =
            Array.isArray(events)
                ? events
                : [];

        populateEventTypes();

        applyFilters();

    }

    catch (error) {

        console.error(
            "Faculty events loading error:",
            error
        );

        state.events = [];

        renderEmptyState(
            "Unable to load events",
            "Event information could not be retrieved from the server."
        );

    }

}


/* =========================================================
   EVENT TYPES
========================================================= */

function populateEventTypes() {

    if (!DOM.eventType) {
        return;
    }

    const types =
        [
            ...new Set(
                state.events
                    .map(event =>
                        event.type ||
                        event.eventType ||
                        event.category
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (a, b) =>
                    String(a)
                        .localeCompare(
                            String(b)
                        )
            );

    DOM.eventType.innerHTML = `

        <option value="">
            All Types
        </option>

        ${
            types
                .map(type => `
                    <option value="${escapeHTML(type)}">
                        ${escapeHTML(type)}
                    </option>
                `)
                .join("")
        }

    `;

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    [
        DOM.eventSearch,
        DOM.eventType,
        DOM.eventStatus,
        DOM.eventMonth

    ].forEach(element => {

        if (!element) {
            return;
        }

        element.addEventListener(
            "input",
            applyFilters
        );

        element.addEventListener(
            "change",
            applyFilters
        );

    });


    if (DOM.clearFilters) {

        DOM.clearFilters.addEventListener(
            "click",
            clearFilters
        );

    }

}


function clearFilters() {

    if (DOM.eventSearch) {

        DOM.eventSearch.value = "";

    }

    if (DOM.eventType) {

        DOM.eventType.value = "";

    }

    if (DOM.eventStatus) {

        DOM.eventStatus.value = "";

    }

    if (DOM.eventMonth) {

        DOM.eventMonth.value = "";

    }

    applyFilters();

}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    const search =
        DOM.eventSearch
            ? DOM.eventSearch.value
                .trim()
                .toLowerCase()
            : "";

    const type =
        DOM.eventType
            ? DOM.eventType.value
            : "";

    const status =
        DOM.eventStatus
            ? DOM.eventStatus.value
            : "";

    const month =
        DOM.eventMonth
            ? DOM.eventMonth.value
            : "";


    state.filteredEvents =
        state.events.filter(
            event => {

                const title =
                    String(
                        event.title ||
                        event.name ||
                        ""
                    )
                        .toLowerCase();

                const description =
                    String(
                        event.description ||
                        ""
                    )
                        .toLowerCase();

                const department =
                    String(
                        event.department ||
                        event.departmentName ||
                        ""
                    )
                        .toLowerCase();

                const organizer =
                    String(
                        event.organizer ||
                        event.organizerName ||
                        ""
                    )
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    description.includes(search) ||
                    department.includes(search) ||
                    organizer.includes(search);


                const eventType =
                    String(
                        event.type ||
                        event.eventType ||
                        event.category ||
                        ""
                    );


                const matchesType =
                    !type ||
                    eventType === type;


                const eventStatus =
                    normalizeStatus(
                        event.status
                    );


                const matchesStatus =
                    !status ||
                    eventStatus === status;


                const eventDate =
                    getEventDate(event);


                const matchesMonth =
                    !month ||
                    (
                        eventDate &&
                        String(
                            eventDate.getMonth() + 1
                        ) === month
                    );


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesStatus &&
                    matchesMonth
                );

            }
        );


    renderEvents();

    updateSummary();

}


/* =========================================================
   RENDER EVENTS
========================================================= */

function renderEvents() {

    if (!DOM.eventsContainer) {
        return;
    }


    const events =
        state.filteredEvents;


    if (!events.length) {

        renderEmptyState(
            "No events available",
            "Events relevant to your faculty account will appear here when data is available."
        );

        updateResultCount(0);

        return;

    }


    DOM.eventsContainer.innerHTML =
        events
            .map(
                createEventCard
            )
            .join("");


    updateResultCount(
        events.length
    );


    attachEventDetailsButtons();

}


/* =========================================================
   EVENT CARD
========================================================= */

function createEventCard(event) {

    const id =
        event.id ||
        event.eventId ||
        "";


    const title =
        escapeHTML(
            event.title ||
            event.name ||
            "Event"
        );


    const type =
        escapeHTML(
            event.type ||
            event.eventType ||
            event.category ||
            "Event"
        );


    const date =
        escapeHTML(
            formatDate(event)
        );


    const time =
        escapeHTML(
            formatTime(event)
        );


    const venue =
        escapeHTML(
            event.venue ||
            event.location ||
            "—"
        );


    const department =
        escapeHTML(
            event.department ||
            event.departmentName ||
            "—"
        );


    const facultyRole =
        escapeHTML(
            event.facultyRole ||
            event.role ||
            "Faculty"
        );


    const status =
        normalizeStatus(
            event.status
        );


    const statusLabel =
        formatStatus(
            status
        );


    const statusClass =
        getStatusClass(
            status
        );


    const icon =
        getEventIcon(
            type
        );


    return `

        <article class="event-card">

            <div class="event-card-top">

                <div class="event-type-icon">

                    <i class="${icon}"></i>

                </div>

                <div class="event-card-title">

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        ${type}
                    </p>

                </div>

                <span
                    class="status-badge ${statusClass}"
                >
                    ${statusLabel}
                </span>

            </div>


            <div class="event-card-body">

                <div class="event-meta">

                    <div class="event-meta-item">

                        <i class="fa-regular fa-calendar"></i>

                        <div>

                            <span>Date</span>

                            <strong>
                                ${date}
                            </strong>

                        </div>

                    </div>


                    <div class="event-meta-item">

                        <i class="fa-regular fa-clock"></i>

                        <div>

                            <span>Time</span>

                            <strong>
                                ${time}
                            </strong>

                        </div>

                    </div>


                    <div class="event-meta-item">

                        <i class="fa-solid fa-location-dot"></i>

                        <div>

                            <span>Venue</span>

                            <strong>
                                ${venue}
                            </strong>

                        </div>

                    </div>


                    <div class="event-meta-item">

                        <i class="fa-solid fa-building"></i>

                        <div>

                            <span>Department</span>

                            <strong>
                                ${department}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            <div class="event-card-footer">

                <div class="event-role">

                    Your role:

                    <strong>
                        ${facultyRole}
                    </strong>

                </div>


                <button
                    type="button"
                    class="view-event-btn"
                    data-event-id="${escapeHTML(id)}"
                >

                    View Details

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   EVENT DETAILS BUTTONS
========================================================= */

function attachEventDetailsButtons() {

    document
        .querySelectorAll(
            ".view-event-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.eventId;


                    const event =
                        state.events.find(
                            item =>
                                String(
                                    item.id ||
                                    item.eventId ||
                                    ""
                                ) ===
                                String(id)
                        );


                    if (event) {

                        openEventDetails(
                            event
                        );

                    }

                }
            );

        });

}


/* =========================================================
   OPEN EVENT DETAILS
========================================================= */

function openEventDetails(event) {

    if (!DOM.eventDetailsModal) {
        return;
    }


    setText(
        DOM.detailsTitle,
        event.title ||
        event.name ||
        "Event"
    );


    const status =
        normalizeStatus(
            event.status
        );


    setText(
        DOM.detailsStatus,
        formatStatus(status)
    );


    DOM.detailsStatus.className =
        `status-badge ${getStatusClass(status)}`;


    setText(
        DOM.detailsType,
        event.type ||
        event.eventType ||
        event.category ||
        "Event"
    );


    setText(
        DOM.detailsDate,
        formatDate(event)
    );


    setText(
        DOM.detailsTime,
        formatTime(event)
    );


    setText(
        DOM.detailsVenue,
        event.venue ||
        event.location ||
        "—"
    );


    setText(
        DOM.detailsDepartment,
        event.department ||
        event.departmentName ||
        "—"
    );


    setText(
        DOM.detailsOrganizer,
        event.organizer ||
        event.organizerName ||
        "—"
    );


    setText(
        DOM.detailsFacultyRole,
        event.facultyRole ||
        event.role ||
        "Faculty"
    );


    setText(
        DOM.detailsDescription,
        event.description ||
        "No description provided."
    );


    setOptionalSection(
        DOM.audienceSection,
        DOM.detailsAudience,
        event.targetAudience ||
        event.audience
    );


    setOptionalSection(
        DOM.instructionsSection,
        DOM.detailsInstructions,
        event.instructions ||
        event.importantInstructions
    );


    setOptionalSection(
        DOM.contactSection,
        DOM.detailsContact,
        event.contact ||
        event.contactPerson ||
        event.contactDetails
    );


    renderAttachments(
        event.attachments ||
        event.documents ||
        []
    );


    DOM.eventDetailsModal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeEventDetails() {

    if (!DOM.eventDetailsModal) {
        return;
    }

    DOM.eventDetailsModal.hidden =
        true;

    document.body.style.overflow =
        "";

}


function setupModal() {

    if (DOM.closeEventDetails) {

        DOM.closeEventDetails.addEventListener(
            "click",
            closeEventDetails
        );

    }


    if (DOM.modalCloseButton) {

        DOM.modalCloseButton.addEventListener(
            "click",
            closeEventDetails
        );

    }


    if (DOM.eventDetailsModal) {

        DOM.eventDetailsModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    DOM.eventDetailsModal
                ) {

                    closeEventDetails();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                DOM.eventDetailsModal &&
                !DOM.eventDetailsModal.hidden
            ) {

                closeEventDetails();

            }

        }
    );

}


/* =========================================================
   OPTIONAL SECTIONS
========================================================= */

function setOptionalSection(
    section,
    element,
    value
) {

    if (!section || !element) {
        return;
    }


    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        section.hidden = true;

        return;

    }


    section.hidden = false;

    element.textContent =
        String(value);

}


/* =========================================================
   ATTACHMENTS
========================================================= */

function renderAttachments(
    attachments
) {

    if (
        !DOM.attachmentSection ||
        !DOM.detailsAttachments
    ) {

        return;

    }


    if (
        !Array.isArray(attachments) ||
        attachments.length === 0
    ) {

        DOM.attachmentSection.hidden =
            true;

        DOM.detailsAttachments.innerHTML =
            "";

        return;

    }


    DOM.attachmentSection.hidden =
        false;


    DOM.detailsAttachments.innerHTML =
        attachments
            .map(
                attachment => {

                    const name =
                        escapeHTML(
                            attachment.name ||
                            attachment.fileName ||
                            "Document"
                        );


                    const url =
                        attachment.url ||
                        attachment.fileUrl ||
                        "";


                    if (!url) {

                        return `

                            <div class="attachment-link">

                                <i class="fa-regular fa-file"></i>

                                ${name}

                            </div>

                        `;

                    }


                    return `

                        <a
                            class="attachment-link"
                            href="${escapeHTML(url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >

                            <i class="fa-regular fa-file-lines"></i>

                            ${name}

                        </a>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const events =
        state.events;


    if (DOM.totalEvents) {

        DOM.totalEvents.textContent =
            events.length || "0";

    }


    const upcoming =
        events.filter(
            event =>
                normalizeStatus(
                    event.status
                ) === "upcoming"
        );


    if (DOM.upcomingEvents) {

        DOM.upcomingEvents.textContent =
            upcoming.length || "0";

    }


    const assigned =
        events.filter(
            event =>
                Boolean(
                    event.assignedToFaculty ??
                    event.isAssigned ??
                    event.facultyRole
                )
        );


    if (DOM.assignedEvents) {

        DOM.assignedEvents.textContent =
            assigned.length || "0";

    }


    const departmentEvents =
        events.filter(
            event =>
                Boolean(
                    event.department ||
                    event.departmentName
                )
        );


    if (DOM.departmentEvents) {

        DOM.departmentEvents.textContent =
            departmentEvents.length || "0";

    }

}


function updateResultCount(
    count
) {

    if (!DOM.resultCount) {
        return;
    }

    DOM.resultCount.textContent =
        `${count} ${
            count === 1
                ? "event"
                : "events"
        }`;

}


/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmptyState(
    title,
    message
) {

    if (!DOM.eventsContainer) {
        return;
    }


    DOM.eventsContainer.innerHTML = `

        <div class="empty-state">

            <i class="fa-regular fa-calendar-xmark"></i>

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
   NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    if (!CONFIG.API_BASE_URL) {

        updateNotificationBadge([]);

        return;

    }


    try {

        const data =
            await apiRequest(
                CONFIG.ENDPOINTS.NOTIFICATIONS
            );


        const notifications =
            Array.isArray(data)
                ? data
                : data?.notifications;


        state.notifications =
            Array.isArray(notifications)
                ? notifications
                : [];


        updateNotificationBadge(
            state.notifications
        );

    }

    catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

        updateNotificationBadge([]);

    }

}


function updateNotificationBadge(
    notifications
) {

    if (!DOM.notificationCount) {
        return;
    }


    const unread =
        notifications.filter(
            item =>
                item.read === false ||
                item.isRead === false
        ).length;


    if (unread > 0) {

        DOM.notificationCount.textContent =
            unread;

        DOM.notificationCount.hidden =
            false;

    }

    else {

        DOM.notificationCount.hidden =
            true;

    }

}


/* =========================================================
   HEADER
========================================================= */

function setupBackButton() {

    if (!DOM.backBtn) {
        return;
    }


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


            Promise.all([
                loadEvents(),
                loadNotifications()
            ])
                .finally(
                    () => {

                        if (icon) {

                            icon.classList.remove(
                                "fa-spin"
                            );

                        }


                        DOM.refreshButton.disabled =
                            false;

                    }
                );

        }
    );

}


function setupNotifications() {

    if (!DOM.notificationButton) {
        return;
    }


    DOM.notificationButton.addEventListener(
        "click",
        () => {

            window.location.href =
                ROUTES.NOTIFICATIONS;

        }
    );

}


/* =========================================================
   UTILITIES
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
        value.includes("ongoing") ||
        value.includes("running")
    ) {

        return "ongoing";

    }


    if (
        value.includes("complete") ||
        value.includes("finished")
    ) {

        return "completed";

    }


    if (
        value.includes("upcoming") ||
        value.includes("scheduled")
    ) {

        return "upcoming";

    }


    return value || "upcoming";

}


function formatStatus(
    status
) {

    const labels = {

        upcoming:
            "Upcoming",

        ongoing:
            "Ongoing",

        completed:
            "Completed"

    };


    return (
        labels[status] ||
        capitalize(status) ||
        "Upcoming"
    );

}


function getStatusClass(
    status
) {

    const classes = {

        upcoming:
            "status-upcoming",

        ongoing:
            "status-ongoing",

        completed:
            "status-completed"

    };


    return (
        classes[status] ||
        "status-default"
    );

}


function getEventIcon(
    type
) {

    const value =
        String(type)
            .toLowerCase();


    if (
        value.includes("seminar") ||
        value.includes("workshop")
    ) {

        return "fa-solid fa-chalkboard-user";

    }


    if (
        value.includes("exam") ||
        value.includes("academic")
    ) {

        return "fa-solid fa-book-open";

    }


    if (
        value.includes("meeting")
    ) {

        return "fa-solid fa-users";

    }


    if (
        value.includes("training")
    ) {

        return "fa-solid fa-graduation-cap";

    }


    if (
        value.includes("cultural")
    ) {

        return "fa-solid fa-masks-theater";

    }


    return "fa-regular fa-calendar-days";

}


function getEventDate(
    event
) {

    const value =
        event.date ||
        event.startDate ||
        event.eventDate;


    if (!value) {
        return null;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


function formatDate(
    event
) {

    const date =
        getEventDate(event);


    if (!date) {

        return (
            event.date ||
            event.startDate ||
            "—"
        );

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


function formatTime(
    event
) {

    if (
        event.time
    ) {

        return String(
            event.time
        );

    }


    if (
        event.startTime &&
        event.endTime
    ) {

        return `${event.startTime} – ${event.endTime}`;

    }


    return (
        event.startTime ||
        "—"
    );

}


function setText(
    element,
    value
) {

    if (!element) {
        return;
    }


    element.textContent =
        value === null ||
        value === undefined ||
        String(value).trim() === ""
            ? "—"
            : String(value);

}


function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


function escapeHTML(
    value
) {

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