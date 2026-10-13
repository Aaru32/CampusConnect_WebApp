/* =========================================================
   CAMPUSCONNECT
   ADMIN - ACADEMIC CALENDAR
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {
    API_BASE_URL: "",

    ENDPOINTS: {
        CALENDAR: "/admin/academic-calendar",
        SESSIONS: "/admin/academic-sessions"
    }
};


/* =========================================================
   STATE
========================================================= */

const state = {
    currentDate: new Date(),
    selectedSession: "",
    events: [],
    sessions: [],
    editingEventId: null,
    loading: false
};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {
    backButton: document.getElementById("backButton"),

    refreshButton: document.getElementById("refreshButton"),

    currentMonth: document.getElementById("currentMonth"),
    calendarGrid: document.getElementById("calendarGrid"),

    previousMonth: document.getElementById("previousMonth"),
    nextMonth: document.getElementById("nextMonth"),
    todayButton: document.getElementById("todayButton"),

    academicSession: document.getElementById("academicSession"),

    addEventButton: document.getElementById("addEventButton"),

    eventsEmptyState: document.getElementById("eventsEmptyState"),
    eventsList: document.getElementById("eventsList"),

    eventModal: document.getElementById("eventModal"),
    eventModalTitle: document.getElementById("eventModalTitle"),

    closeEventModal: document.getElementById("closeEventModal"),
    cancelEventButton: document.getElementById("cancelEventButton"),

    eventForm: document.getElementById("eventForm"),

    eventTitle: document.getElementById("eventTitle"),
    eventDate: document.getElementById("eventDate"),
    eventType: document.getElementById("eventType"),
    eventDescription: document.getElementById("eventDescription")
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});


function initializePage() {

    bindEvents();

    renderCalendar();

    renderEvents();

    loadAcademicSessions();

    loadAcademicEvents();
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function bindEvents() {

    /* Back */
    if (elements.backButton) {
        elements.backButton.addEventListener("click", goBack);
    }


    /* Refresh */
    if (elements.refreshButton) {
        elements.refreshButton.addEventListener("click", refreshCalendar);
    }


    /* Previous month */
    if (elements.previousMonth) {
        elements.previousMonth.addEventListener("click", () => {

            state.currentDate.setMonth(
                state.currentDate.getMonth() - 1
            );

            renderCalendar();
        });
    }


    /* Next month */
    if (elements.nextMonth) {
        elements.nextMonth.addEventListener("click", () => {

            state.currentDate.setMonth(
                state.currentDate.getMonth() + 1
            );

            renderCalendar();
        });
    }


    /* Today */
    if (elements.todayButton) {
        elements.todayButton.addEventListener("click", goToToday);
    }


    /* Academic session */
    if (elements.academicSession) {
        elements.academicSession.addEventListener("change", () => {

            state.selectedSession =
                elements.academicSession.value;

            loadAcademicEvents();
        });
    }


    /* Add event */
    if (elements.addEventButton) {
        elements.addEventButton.addEventListener(
            "click",
            () => openEventModal()
        );
    }


    /* Close modal */
    if (elements.closeEventModal) {
        elements.closeEventModal.addEventListener(
            "click",
            closeEventModal
        );
    }


    /* Cancel */
    if (elements.cancelEventButton) {
        elements.cancelEventButton.addEventListener(
            "click",
            closeEventModal
        );
    }


    /* Form */
    if (elements.eventForm) {
        elements.eventForm.addEventListener(
            "submit",
            handleEventSubmit
        );
    }


    /* Click outside modal */
    if (elements.eventModal) {

        elements.eventModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === elements.eventModal
                ) {
                    closeEventModal();
                }
            }
        );
    }


    /* Escape key */
    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            !elements.eventModal.hidden
        ) {
            closeEventModal();
        }
    });
}


/* =========================================================
   BACK BUTTON
========================================================= */

function goBack() {

    if (window.history.length > 1) {
        window.history.back();
        return;
    }

    window.location.href = "admin-dashboard.html";
}


/* =========================================================
   REFRESH
========================================================= */

async function refreshCalendar() {

    if (state.loading) {
        return;
    }

    const icon =
        elements.refreshButton?.querySelector("i");

    if (icon) {
        icon.classList.add("fa-spin");
    }

    try {

        await Promise.all([
            loadAcademicSessions(),
            loadAcademicEvents()
        ]);

        renderCalendar();
        renderEvents();

    } finally {

        setTimeout(() => {

            if (icon) {
                icon.classList.remove("fa-spin");
            }

        }, 400);
    }
}


/* =========================================================
   TODAY
========================================================= */

function goToToday() {

    state.currentDate = new Date();

    renderCalendar();
}


/* =========================================================
   CALENDAR RENDERING
========================================================= */

function renderCalendar() {

    if (!elements.calendarGrid) {
        return;
    }

    elements.calendarGrid.innerHTML = "";


    const year =
        state.currentDate.getFullYear();

    const month =
        state.currentDate.getMonth();


    updateMonthTitle(year, month);


    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    const previousMonthDays =
        new Date(year, month, 0).getDate();


    /*
       Previous month's visible dates
    */

    for (let i = firstDay - 1; i >= 0; i--) {

        const dayNumber =
            previousMonthDays - i;

        const date =
            new Date(year, month - 1, dayNumber);

        createCalendarDay(
            date,
            true
        );
    }


    /*
       Current month's dates
    */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(year, month, day);

        createCalendarDay(
            date,
            false
        );
    }


    /*
       Next month's visible dates
    */

    const totalCells =
        elements.calendarGrid.children.length;

    const remainingCells =
        42 - totalCells;

    const cellsToAdd =
        remainingCells >= 7
            ? remainingCells
            : remainingCells;


    for (
        let day = 1;
        day <= cellsToAdd;
        day++
    ) {

        const date =
            new Date(year, month + 1, day);

        createCalendarDay(
            date,
            true
        );
    }
}


/* =========================================================
   UPDATE MONTH TITLE
========================================================= */

function updateMonthTitle(year, month) {

    if (!elements.currentMonth) {
        return;
    }

    const formatted =
        new Intl.DateTimeFormat(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date(year, month, 1)
        );

    elements.currentMonth.textContent =
        formatted;
}


/* =========================================================
   CREATE CALENDAR DAY
========================================================= */

function createCalendarDay(
    date,
    isOtherMonth
) {

    const dayElement =
        document.createElement("div");

    dayElement.className =
        "calendar-day";


    if (isOtherMonth) {
        dayElement.classList.add(
            "other-month"
        );
    }


    if (isToday(date)) {
        dayElement.classList.add("today");
    }


    const numberElement =
        document.createElement("div");

    numberElement.className =
        "day-number";

    numberElement.textContent =
        date.getDate();


    const eventsElement =
        document.createElement("div");

    eventsElement.className =
        "day-events";


    const dayEvents =
        getEventsForDate(date);


    dayEvents.forEach((event) => {

        const eventElement =
            createCalendarEvent(event);

        eventsElement.appendChild(
            eventElement
        );
    });


    dayElement.appendChild(
        numberElement
    );

    dayElement.appendChild(
        eventsElement
    );


    elements.calendarGrid.appendChild(
        dayElement
    );
}


/* =========================================================
   CREATE CALENDAR EVENT
========================================================= */

function createCalendarEvent(event) {

    const eventElement =
        document.createElement("div");

    eventElement.className =
        "calendar-event";

    eventElement.textContent =
        event.title || "Untitled Event";

    eventElement.title =
        event.description ||
        event.title ||
        "Academic event";


    eventElement.addEventListener(
        "click",
        () => openEventModal(event)
    );


    return eventElement;
}


/* =========================================================
   CHECK TODAY
========================================================= */

function isToday(date) {

    const today =
        new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}


/* =========================================================
   GET EVENTS FOR DATE
========================================================= */

function getEventsForDate(date) {

    const dateString =
        formatDateForInput(date);

    return state.events.filter(
        (event) => event.date === dateString
    );
}


/* =========================================================
   RENDER EVENTS LIST
========================================================= */

function renderEvents() {

    if (
        !elements.eventsList ||
        !elements.eventsEmptyState
    ) {
        return;
    }


    elements.eventsList.innerHTML = "";


    if (state.events.length === 0) {

        elements.eventsEmptyState.hidden =
            false;

        elements.eventsList.hidden =
            true;

        return;
    }


    elements.eventsEmptyState.hidden =
        true;

    elements.eventsList.hidden =
        false;


    const sortedEvents =
        [...state.events].sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    sortedEvents.forEach((event) => {

        const item =
            createEventListItem(event);

        elements.eventsList.appendChild(
            item
        );
    });
}


/* =========================================================
   CREATE EVENT LIST ITEM
========================================================= */

function createEventListItem(event) {

    const item =
        document.createElement("div");

    item.className =
        "event-list-item";


    const info =
        document.createElement("div");

    info.className =
        "event-list-info";


    const title =
        document.createElement("div");

    title.className =
        "event-list-title";

    title.textContent =
        event.title || "Untitled Event";


    const description =
        document.createElement("div");

    description.className =
        "event-list-description";

    description.textContent =
        event.description ||
        "No description available.";


    info.appendChild(title);
    info.appendChild(description);


    const meta =
        document.createElement("div");

    meta.className =
        "event-list-meta";


    const date =
        document.createElement("span");

    date.className =
        "event-date";

    date.textContent =
        formatDisplayDate(event.date);


    const type =
        document.createElement("span");

    type.className =
        "event-type";

    type.textContent =
        formatEventType(event.type);


    meta.appendChild(date);
    meta.appendChild(type);


    item.appendChild(info);
    item.appendChild(meta);


    item.addEventListener(
        "click",
        () => openEventModal(event)
    );


    return item;
}


/* =========================================================
   EVENT MODAL
========================================================= */

function openEventModal(event = null) {

    if (!elements.eventModal) {
        return;
    }


    state.editingEventId =
        event?.id || null;


    if (event) {

        elements.eventModalTitle.textContent =
            "Edit Academic Event";

        elements.eventTitle.value =
            event.title || "";

        elements.eventDate.value =
            event.date || "";

        elements.eventType.value =
            event.type || "";

        elements.eventDescription.value =
            event.description || "";

    } else {

        elements.eventModalTitle.textContent =
            "Add Academic Event";

        elements.eventForm.reset();

        /*
           If the user opens Add Event after
           selecting a calendar date, the date
           can later be populated here.
        */

        elements.eventDate.value =
            formatDateForInput(
                state.currentDate
            );
    }


    elements.eventModal.hidden =
        false;


    document.body.style.overflow =
        "hidden";


    setTimeout(() => {

        elements.eventTitle?.focus();

    }, 50);
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeEventModal() {

    if (!elements.eventModal) {
        return;
    }

    elements.eventModal.hidden =
        true;

    state.editingEventId =
        null;

    if (elements.eventForm) {
        elements.eventForm.reset();
    }

    document.body.style.overflow =
        "";
}


/* =========================================================
   FORM SUBMISSION
========================================================= */

async function handleEventSubmit(event) {

    event.preventDefault();


    const eventData = {

        title:
            elements.eventTitle.value.trim(),

        date:
            elements.eventDate.value,

        type:
            elements.eventType.value,

        description:
            elements.eventDescription.value.trim(),

        academicSession:
            state.selectedSession
    };


    if (!eventData.title) {

        showMessage(
            "Please enter an event title."
        );

        return;
    }


    if (!eventData.date) {

        showMessage(
            "Please select an event date."
        );

        return;
    }


    if (!eventData.type) {

        showMessage(
            "Please select an event type."
        );

        return;
    }


    try {

        /*
           API-ready architecture.

           When backend is connected,
           POST/PUT requests will be sent here.
        */

        if (CONFIG.API_BASE_URL) {

            await saveEventToAPI(
                eventData
            );

        } else {

            /*
               No fake database data is inserted.
               The frontend simply informs the admin
               that backend connection is required.
            */

            showMessage(
                "The calendar is ready for backend integration. Connect the API to save academic events."
            );

            return;
        }


        closeEventModal();

        await loadAcademicEvents();

        renderCalendar();
        renderEvents();

    } catch (error) {

        console.error(
            "Unable to save academic event:",
            error
        );

        showMessage(
            "Unable to save the academic event."
        );
    }
}


/* =========================================================
   SAVE EVENT TO API
========================================================= */

async function saveEventToAPI(eventData) {

    const isEditing =
        Boolean(state.editingEventId);


    const url =
        isEditing
            ? `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CALENDAR}/${encodeURIComponent(state.editingEventId)}`
            : `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CALENDAR}`;


    const method =
        isEditing
            ? "PUT"
            : "POST";


    const response =
        await fetch(
            url,
            {
                method,
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(eventData)
            }
        );


    if (!response.ok) {

        throw new Error(
            `API request failed: ${response.status}`
        );
    }


    return response.json();
}


/* =========================================================
   LOAD ACADEMIC SESSIONS
========================================================= */

async function loadAcademicSessions() {

    /*
       Do not insert sample sessions.

       Once the backend is connected,
       this function will populate the
       dropdown from the database.
    */

    if (!CONFIG.API_BASE_URL) {

        state.sessions = [];

        populateSessionDropdown();

        return;
    }


    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SESSIONS}`
            );


        if (!response.ok) {
            throw new Error(
                `Session API failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        state.sessions =
            Array.isArray(data)
                ? data
                : data.sessions || [];


        populateSessionDropdown();

    } catch (error) {

        console.error(
            "Unable to load academic sessions:",
            error
        );

        state.sessions = [];

        populateSessionDropdown();
    }
}


/* =========================================================
   POPULATE SESSION DROPDOWN
========================================================= */

function populateSessionDropdown() {

    if (!elements.academicSession) {
        return;
    }


    const selectedValue =
        state.selectedSession;


    elements.academicSession.innerHTML =
        "";


    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "Select Academic Session";


    elements.academicSession.appendChild(
        defaultOption
    );


    state.sessions.forEach((session) => {

        const option =
            document.createElement("option");

        option.value =
            session.id ??
            session.value ??
            session.session ??
            "";

        option.textContent =
            session.name ??
            session.label ??
            session.session ??
            "Academic Session";


        elements.academicSession.appendChild(
            option
        );
    });


    if (selectedValue) {

        elements.academicSession.value =
            selectedValue;
    }
}


/* =========================================================
   LOAD ACADEMIC EVENTS
========================================================= */

async function loadAcademicEvents() {

    state.loading = true;


    try {

        /*
           IMPORTANT:
           No hardcoded/fake events are created.

           If API is empty, the page remains
           in a genuine empty state.
        */

        if (!CONFIG.API_BASE_URL) {

            state.events = [];

            renderCalendar();
            renderEvents();

            return;
        }


        let url =
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CALENDAR}`;


        if (state.selectedSession) {

            url +=
                `?academicSession=${encodeURIComponent(
                    state.selectedSession
                )}`;
        }


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Calendar API failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        state.events =
            Array.isArray(data)
                ? data
                : data.events || [];


        renderCalendar();
        renderEvents();

    } catch (error) {

        console.error(
            "Unable to load academic events:",
            error
        );


        state.events = [];

        renderCalendar();
        renderEvents();

    } finally {

        state.loading = false;
    }
}


/* =========================================================
   DATE HELPERS
========================================================= */

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function formatDisplayDate(dateString) {

    if (!dateString) {
        return "Date not available";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}


/* =========================================================
   EVENT TYPE
========================================================= */

function formatEventType(type) {

    if (!type) {
        return "Other";
    }


    const typeMap = {

        academic: "Academic",

        examination: "Examination",

        holiday: "Holiday",

        event: "College Event",

        deadline: "Deadline",

        other: "Other"
    };


    return (
        typeMap[type] ||
        type
    );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

    /*
       Temporary lightweight message system.

       This can later be replaced with the
       CampusConnect global notification/toast
       component without changing the calendar logic.
    */

    const existing =
        document.querySelector(
            ".calendar-message"
        );


    if (existing) {
        existing.remove();
    }


    const messageElement =
        document.createElement("div");

    messageElement.className =
        "calendar-message";


    messageElement.textContent =
        message;


    Object.assign(
        messageElement.style,
        {
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: "2000",
            maxWidth: "360px",
            padding: "13px 16px",
            background: "#ffffff",
            color: "#172b4d",
            border: "1px solid #e3eaf3",
            borderRadius: "8px",
            boxShadow:
                "0 5px 18px rgba(23, 43, 77, 0.12)",
            fontSize: "13px",
            lineHeight: "1.5"
        }
    );


    document.body.appendChild(
        messageElement
    );


    setTimeout(() => {

        messageElement.remove();

    }, 4000);
}