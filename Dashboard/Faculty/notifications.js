/* =========================================================
   CAMPUSCONNECT
   FACULTY NOTIFICATIONS
   Dynamic / API-Ready Architecture
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        NOTIFICATIONS:
            "/notifications",

        MARK_READ:
            "/notifications/{id}/read",

        MARK_ALL_READ:
            "/notifications/read-all",

        CREATE_NOTIFICATION:
            "/notifications",

        TARGET_OPTIONS:
            "/faculty/notifications/targets"

    }

};


/* =========================================================
   ROUTES
========================================================= */

const ROUTES = {

    dashboard:
        "faculty-dashboard.html"

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

    createNotificationButton:
        document.getElementById(
            "createNotificationButton"
        ),

    notificationsList:
        document.getElementById(
            "notificationsList"
        ),

    notificationSummary:
        document.getElementById(
            "notificationSummary"
        ),

    markAllReadButton:
        document.getElementById(
            "markAllReadButton"
        ),

    filterTabs:
        document.querySelectorAll(
            ".filter-tab"
        ),

    createModal:
        document.getElementById(
            "createNotificationModal"
        ),

    closeCreateModal:
        document.getElementById(
            "closeCreateModal"
        ),

    cancelCreateNotification:
        document.getElementById(
            "cancelCreateNotification"
        ),

    createForm:
        document.getElementById(
            "createNotificationForm"
        ),

    targetType:
        document.getElementById(
            "targetType"
        ),

    targetSelection:
        document.getElementById(
            "targetSelection"
        ),

    targetDepartment:
        document.getElementById(
            "targetDepartment"
        ),

    targetSemester:
        document.getElementById(
            "targetSemester"
        ),

    targetClass:
        document.getElementById(
            "targetClass"
        ),

    targetSubject:
        document.getElementById(
            "targetSubject"
        ),

    deliveryType:
        document.getElementById(
            "deliveryType"
        ),

    scheduleGroup:
        document.getElementById(
            "scheduleGroup"
        ),

    scheduledAt:
        document.getElementById(
            "scheduledAt"
        ),

    formMessage:
        document.getElementById(
            "formMessage"
        ),

    publishButton:
        document.getElementById(
            "publishNotificationButton"
        ),

    detailsModal:
        document.getElementById(
            "notificationDetailsModal"
        ),

    closeDetailsModal:
        document.getElementById(
            "closeDetailsModal"
        ),

    detailCategory:
        document.getElementById(
            "detailCategory"
        ),

    detailTitle:
        document.getElementById(
            "detailTitle"
        ),

    detailTime:
        document.getElementById(
            "detailTime"
        ),

    detailPriority:
        document.getElementById(
            "detailPriority"
        ),

    detailMessage:
        document.getElementById(
            "detailMessage"
        ),

    detailAudience:
        document.getElementById(
            "detailAudience"
        )

};


/* =========================================================
   STATE
========================================================= */

const notificationState = {

    notifications: [],

    activeFilter: "all",

    targetOptions: {

        departments: [],

        semesters: [],

        classes: [],

        subjects: []

    }

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeNotifications
);


function initializeNotifications() {

    setupBackButton();

    setupRefresh();

    setupHeaderNotification();

    setupFilters();

    setupCreateNotification();

    setupCreateModal();

    setupTargetAudience();

    setupDeliveryType();

    setupDetailsModal();

    setupMarkAllRead();

    loadNotifications();

    loadTargetOptions();

}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    if (!CONFIG.API_BASE_URL) {

        return null;

    }


    const response =
        await fetch(
            CONFIG.API_BASE_URL + endpoint,
            {

                method:
                    options.method || "GET",

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                },

                credentials:
                    "include",

                body:
                    options.body
                        ? JSON.stringify(options.body)
                        : undefined

            }
        );


    if (!response.ok) {

        throw new Error(
            `API request failed: ${response.status}`
        );

    }


    const contentType =
        response.headers.get(
            "content-type"
        );


    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        return await response.json();

    }


    return null;

}


/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    showLoadingState();


    if (!CONFIG.API_BASE_URL) {

        renderEmptyState(
            "No notifications available",
            "Notifications from your faculty account will appear here when backend data is connected."
        );

        updateNotificationCount([]);

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
                : Array.isArray(data?.notifications)
                    ? data.notifications
                    : [];


        notificationState.notifications =
            notifications;


        renderNotifications();

        updateNotificationCount(
            notifications
        );

    }

    catch (error) {

        console.error(
            "Notification loading error:",
            error
        );


        renderEmptyState(
            "Unable to load notifications",
            "Please refresh the page or try again later."
        );

    }

}


/* =========================================================
   RENDER
========================================================= */

function renderNotifications() {

    const filtered =
        getFilteredNotifications();


    if (
        notificationState.notifications.length ===
        0
    ) {

        renderEmptyState(
            "No notifications",
            "New notifications relevant to your faculty account will appear here."
        );

        updateSummary(0);

        return;

    }


    if (
        filtered.length === 0
    ) {

        renderEmptyState(
            "No notifications in this category",
            "There are no notifications matching the selected filter."
        );

        updateSummary(0);

        return;

    }


    DOM.notificationsList.innerHTML =
        filtered
            .map(createNotificationHTML)
            .join("");


    updateSummary(
        filtered.length
    );


    attachNotificationEvents();

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredNotifications() {

    const filter =
        notificationState.activeFilter;


    if (filter === "all") {

        return notificationState.notifications;

    }


    if (filter === "unread") {

        return notificationState.notifications
            .filter(
                notification =>
                    notification.read === false ||
                    notification.isRead === false
            );

    }


    return notificationState.notifications
        .filter(
            notification =>
                String(
                    notification.category || ""
                ).toLowerCase() === filter
        );

}


function setupFilters() {

    DOM.filterTabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    DOM.filterTabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    notificationState.activeFilter =
                        tab.dataset.filter ||
                        "all";


                    renderNotifications();

                }
            );

        }
    );

}


/* =========================================================
   NOTIFICATION HTML
========================================================= */

function createNotificationHTML(
    notification
) {

    const id =
        notification.id ||
        notification.notificationId ||
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


    const category =
        String(
            notification.category ||
            "general"
        ).toLowerCase();


    const categoryLabel =
        escapeHTML(
            formatCategory(category)
        );


    const time =
        escapeHTML(
            notification.time ||
            formatDate(
                notification.createdAt
            )
        );


    const read =
        notification.read === true ||
        notification.isRead === true;


    const icon =
        getNotificationIcon(
            category
        );


    return `

        <button
            type="button"
            class="notification-item ${read ? "" : "unread"}"
            data-notification-id="${escapeHTML(id)}"
            data-category="${escapeHTML(category)}"
        >

            <span class="notification-icon">

                <i class="${icon}"></i>

            </span>


            <span class="notification-information">

                <span class="notification-top-line">

                    <strong>
                        ${title}
                    </strong>

                    ${
                        !read
                            ? `
                                <span
                                    class="unread-dot"
                                    aria-label="Unread"
                                ></span>
                              `
                            : ""
                    }

                </span>


                <p>
                    ${message}
                </p>


                <span class="notification-meta">

                    <span class="notification-category">
                        ${categoryLabel}
                    </span>

                    <span class="notification-time">
                        ${time}
                    </span>

                </span>

            </span>


            <i
                class="fa-solid fa-chevron-right notification-arrow"
            ></i>

        </button>

    `;

}


/* =========================================================
   NOTIFICATION EVENTS
========================================================= */

function attachNotificationEvents() {

    document
        .querySelectorAll(
            ".notification-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        const id =
                            item.dataset.notificationId;


                        const notification =
                            notificationState.notifications
                                .find(
                                    itemData =>
                                        String(
                                            itemData.id ||
                                            itemData.notificationId ||
                                            ""
                                        ) ===
                                        String(id)
                                );


                        if (!notification) {
                            return;
                        }


                        openNotificationDetails(
                            notification
                        );


                        if (
                            !isNotificationRead(
                                notification
                            )
                        ) {

                            markNotificationAsRead(
                                notification
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   OPEN DETAILS
========================================================= */

function openNotificationDetails(
    notification
) {

    const category =
        String(
            notification.category ||
            "general"
        );


    DOM.detailCategory.textContent =
        formatCategory(
            category
        ).toUpperCase();


    DOM.detailTitle.textContent =
        notification.title ||
        "Notification";


    DOM.detailTime.textContent =
        notification.time ||
        formatDate(
            notification.createdAt
        ) ||
        "—";


    DOM.detailPriority.textContent =
        formatPriority(
            notification.priority
        );


    DOM.detailMessage.textContent =
        notification.message ||
        "";


    DOM.detailAudience.textContent =
        notification.targetAudience ||
        notification.audience ||
        "Authorized recipients";


    DOM.detailsModal.hidden =
        false;

}


/* =========================================================
   MARK READ
========================================================= */

async function markNotificationAsRead(
    notification
) {

    const id =
        notification.id ||
        notification.notificationId;


    if (!id) {
        return;
    }


    notification.read = true;

    notification.isRead = true;


    updateNotificationCount(
        notificationState.notifications
    );


    renderNotifications();


    if (!CONFIG.API_BASE_URL) {
        return;
    }


    try {

        await apiRequest(
            CONFIG.ENDPOINTS.MARK_READ
                .replace(
                    "{id}",
                    encodeURIComponent(id)
                ),
            {
                method: "PATCH"
            }
        );

    }

    catch (error) {

        console.error(
            "Mark notification read error:",
            error
        );

    }

}


/* =========================================================
   MARK ALL READ
========================================================= */

function setupMarkAllRead() {

    if (!DOM.markAllReadButton) {
        return;
    }


    DOM.markAllReadButton.addEventListener(
        "click",
        markAllNotificationsAsRead
    );

}


async function markAllNotificationsAsRead() {

    const unread =
        notificationState.notifications
            .filter(
                notification =>
                    !isNotificationRead(
                        notification
                    )
            );


    if (unread.length === 0) {
        return;
    }


    unread.forEach(
        notification => {

            notification.read = true;

            notification.isRead = true;

        }
    );


    updateNotificationCount(
        notificationState.notifications
    );


    renderNotifications();


    if (!CONFIG.API_BASE_URL) {
        return;
    }


    try {

        await apiRequest(
            CONFIG.ENDPOINTS.MARK_ALL_READ,
            {
                method: "PATCH"
            }
        );

    }

    catch (error) {

        console.error(
            "Mark all read error:",
            error
        );

    }

}


/* =========================================================
   CREATE NOTIFICATION
========================================================= */

function setupCreateNotification() {

    DOM.createNotificationButton.addEventListener(
        "click",
        openCreateModal
    );


    DOM.createForm.addEventListener(
        "submit",
        submitNotification
    );

}


function openCreateModal() {

    clearFormMessage();

    DOM.createForm.reset();

    DOM.targetSelection.hidden =
        true;

    DOM.scheduleGroup.hidden =
        true;

    DOM.createModal.hidden =
        false;


    document
        .getElementById(
            "notificationTitle"
        )
        ?.focus();

}


function closeCreateNotificationModal() {

    DOM.createModal.hidden =
        true;

}


function setupCreateModal() {

    DOM.closeCreateModal.addEventListener(
        "click",
        closeCreateNotificationModal
    );


    DOM.cancelCreateNotification.addEventListener(
        "click",
        closeCreateNotificationModal
    );


    DOM.createModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                DOM.createModal
            ) {

                closeCreateNotificationModal();

            }

        }
    );

}


/* =========================================================
   TARGET AUDIENCE
========================================================= */

function setupTargetAudience() {

    DOM.targetType.addEventListener(
        "change",
        handleTargetTypeChange
    );

}


function handleTargetTypeChange() {

    const value =
        DOM.targetType.value;


    const needsSelection =
        [
            "class_students",
            "subject_students",
            "department_faculty",
            "department_students"
        ].includes(value);


    DOM.targetSelection.hidden =
        !needsSelection;


    if (!needsSelection) {
        return;
    }


    populateTargetOptions();

}


/* =========================================================
   TARGET OPTIONS
========================================================= */

async function loadTargetOptions() {

    if (!CONFIG.API_BASE_URL) {

        /*
         * No local fallback data is created.
         * Backend remains the source of truth.
         */

        return;

    }


    try {

        const data =
            await apiRequest(
                CONFIG.ENDPOINTS.TARGET_OPTIONS
            );


        if (!data) {
            return;
        }


        notificationState.targetOptions =
            data;


        populateTargetOptions();

    }

    catch (error) {

        console.error(
            "Target options loading error:",
            error
        );

    }

}


function populateTargetOptions() {

    populateSelect(
        DOM.targetDepartment,
        notificationState.targetOptions.departments,
        "Select department"
    );


    populateSelect(
        DOM.targetSemester,
        notificationState.targetOptions.semesters,
        "Select semester"
    );


    populateSelect(
        DOM.targetClass,
        notificationState.targetOptions.classes,
        "Select class"
    );


    populateSelect(
        DOM.targetSubject,
        notificationState.targetOptions.subjects,
        "Select subject"
    );

}


function populateSelect(
    select,
    items,
    placeholder
) {

    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">
            ${escapeHTML(placeholder)}
        </option>`;


    if (!Array.isArray(items)) {
        return;
    }


    items.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.id ||
                item.value ||
                "";


            option.textContent =
                item.name ||
                item.label ||
                "";


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   DELIVERY TYPE
========================================================= */

function setupDeliveryType() {

    DOM.deliveryType.addEventListener(
        "change",
        () => {

            DOM.scheduleGroup.hidden =
                DOM.deliveryType.value !==
                "scheduled";

        }
    );

}


/* =========================================================
   SUBMIT NOTIFICATION
========================================================= */

async function submitNotification(
    event
) {

    event.preventDefault();

    clearFormMessage();


    if (!CONFIG.API_BASE_URL) {

        showFormMessage(
            "Backend connection is not configured yet. No notification was created.",
            false
        );

        return;

    }


    const formData =
        new FormData(
            DOM.createForm
        );


    const payload = {

        title:
            String(
                formData.get("title") || ""
            ).trim(),

        message:
            String(
                formData.get("message") || ""
            ).trim(),

        category:
            formData.get("category"),

        priority:
            formData.get("priority"),

        targetType:
            formData.get("targetType"),

        departmentId:
            formData.get("departmentId") ||
            null,

        semesterId:
            formData.get("semesterId") ||
            null,

        classId:
            formData.get("classId") ||
            null,

        subjectId:
            formData.get("subjectId") ||
            null,

        deliveryType:
            formData.get("deliveryType"),

        scheduledAt:
            formData.get("scheduledAt") ||
            null

    };


    if (
        !payload.title ||
        !payload.message ||
        !payload.category ||
        !payload.targetType
    ) {

        showFormMessage(
            "Please complete all required fields.",
            false
        );

        return;

    }


    setPublishLoading(true);


    try {

        await apiRequest(
            CONFIG.ENDPOINTS.CREATE_NOTIFICATION,
            {
                method: "POST",
                body: payload
            }
        );


        showFormMessage(
            "Notification created successfully.",
            true
        );


        setTimeout(
            async () => {

                closeCreateNotificationModal();

                await loadNotifications();

            },
            700
        );

    }

    catch (error) {

        console.error(
            "Create notification error:",
            error
        );


        showFormMessage(
            "The notification could not be created. Please try again.",
            false
        );

    }

    finally {

        setPublishLoading(false);

    }

}


/* =========================================================
   PUBLISH BUTTON STATE
========================================================= */

function setPublishLoading(
    loading
) {

    DOM.publishButton.disabled =
        loading;


    if (loading) {

        DOM.publishButton.innerHTML =
            `
                <i class="fa-solid fa-rotate fa-spin"></i>
                Publishing...
            `;

    }

    else {

        DOM.publishButton.innerHTML =
            `
                <i class="fa-solid fa-paper-plane"></i>
                Publish Notification
            `;

    }

}


/* =========================================================
   DETAILS MODAL
========================================================= */

function setupDetailsModal() {

    DOM.closeDetailsModal.addEventListener(
        "click",
        closeDetailsModal
    );


    DOM.detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                DOM.detailsModal
            ) {

                closeDetailsModal();

            }

        }
    );

}


function closeDetailsModal() {

    DOM.detailsModal.hidden =
        true;

}


/* =========================================================
   BACK
========================================================= */

function setupBackButton() {

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
                    ROUTES.dashboard;

            }

        }
    );

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

    DOM.refreshButton.addEventListener(
        "click",
        async () => {

            if (
                DOM.refreshButton.classList.contains(
                    "loading"
                )
            ) {

                return;

            }


            DOM.refreshButton.classList.add(
                "loading"
            );


            DOM.refreshButton.disabled =
                true;


            try {

                await loadNotifications();

                await loadTargetOptions();

            }

            finally {

                DOM.refreshButton.classList.remove(
                    "loading"
                );

                DOM.refreshButton.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   HEADER NOTIFICATION
========================================================= */

function setupHeaderNotification() {

    DOM.notificationButton.addEventListener(
        "click",
        () => {

            /*
             * Already on notification center.
             * Scroll to notification list.
             */

            DOM.notificationsList.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "start"
                }
            );

        }
    );

}


/* =========================================================
   NOTIFICATION COUNT
========================================================= */

function updateNotificationCount(
    notifications
) {

    const unread =
        notifications.filter(
            notification =>
                !isNotificationRead(
                    notification
                )
        ).length;


    if (unread <= 0) {

        DOM.notificationCount.hidden =
            true;

        return;

    }


    DOM.notificationCount.textContent =
        unread > 99
            ? "99+"
            : unread;


    DOM.notificationCount.hidden =
        false;

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(
    visibleCount
) {

    const total =
        notificationState.notifications.length;


    if (!total) {

        DOM.notificationSummary.textContent =
            "No notifications";

        return;

    }


    DOM.notificationSummary.textContent =
        `${visibleCount} of ${total} notification${total === 1 ? "" : "s"}`;

}


/* =========================================================
   LOADING
========================================================= */

function showLoadingState() {

    DOM.notificationsList.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-bell"></i>

            </div>

            <h3>
                Loading notifications
            </h3>

            <p>
                Retrieving notifications for your faculty account.
            </p>

        </div>

    `;

}


/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmptyState(
    title,
    message
) {

    DOM.notificationsList.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-regular fa-bell-slash"></i>

            </div>

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
   HELPERS
========================================================= */

function isNotificationRead(
    notification
) {

    return (
        notification.read === true ||
        notification.isRead === true
    );

}


function formatCategory(
    category
) {

    const categories = {

        academic:
            "Academic",

        classes:
            "Classes",

        assignments:
            "Assignments",

        examinations:
            "Examinations",

        attendance:
            "Attendance",

        events:
            "Events",

        general:
            "General"

    };


    return (
        categories[category] ||
        "General"
    );

}


function formatPriority(
    priority
) {

    const value =
        String(
            priority ||
            "normal"
        ).toLowerCase();


    if (value === "urgent") {
        return "Urgent";
    }


    if (value === "important") {
        return "Important";
    }


    return "Normal";

}


function getNotificationIcon(
    category
) {

    const icons = {

        academic:
            "fa-solid fa-graduation-cap",

        classes:
            "fa-solid fa-chalkboard",

        assignments:
            "fa-solid fa-clipboard-list",

        examinations:
            "fa-solid fa-file-lines",

        attendance:
            "fa-solid fa-user-check",

        events:
            "fa-solid fa-calendar-days",

        general:
            "fa-regular fa-bell"

    };


    return (
        icons[category] ||
        icons.general
    );

}


function formatDate(
    date
) {

    if (!date) {
        return "";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "";

    }


    return parsed.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


function showFormMessage(
    message,
    success
) {

    DOM.formMessage.textContent =
        message;


    DOM.formMessage.classList.toggle(
        "success",
        success
    );

}


function clearFormMessage() {

    DOM.formMessage.textContent =
        "";

    DOM.formMessage.classList.remove(
        "success"
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


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        if (
            !DOM.createModal.hidden
        ) {

            closeCreateNotificationModal();

        }


        if (
            !DOM.detailsModal.hidden
        ) {

            closeDetailsModal();

        }

    }
);