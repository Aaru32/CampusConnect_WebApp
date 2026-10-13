/* =========================================================
   CAMPUSCONNECT GLOBAL NOTIFICATION SYSTEM
   notification.js

   ONE SHARED NOTIFICATION ENGINE

   Used by:
   Student + Faculty + Admin + Every CampusConnect Module

   Capabilities:
   - Receive notifications
   - Global notification bell
   - Unread count
   - Mark one as read
   - Mark all as read
   - Faculty/Admin create notifications
   - Role targeting
   - Individual-user notifications
   - Notification actions
   - Module-generated notifications
   - My Tasks reminders
   - Future Java + MySQL REST API

   IMPORTANT:
   - No fake notification records
   - No permanent localStorage notification database
   - API_BASE_URL remains empty until backend connection
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CAMPUSCONNECT_NOTIFICATION_CONFIG = {

    /*
     * Keep empty during frontend-only development.
     *
     * Future example:
     *
     * API_BASE_URL: "http://localhost:8080/api"
     */
    API_BASE_URL: "",

    ENDPOINTS: {

        /*
         * GET notifications for current user.
         */
        NOTIFICATIONS: "/notifications",

        /*
         * GET unread notification count.
         */
        UNREAD_COUNT: "/notifications/unread-count",

        /*
         * POST notification.
         */
        CREATE_NOTIFICATION: "/notifications",

        /*
         * PATCH one notification as read.
         */
        MARK_READ: "/notifications/read",

        /*
         * PATCH all notifications as read.
         */
        MARK_ALL_READ: "/notifications/read-all"
    },

    /*
     * Global CSS class used by existing/custom bells.
     */
    BELL_SELECTOR: ".notification-button"
};


/* =========================================================
   PRIVATE STATE
========================================================= */

const CampusConnectNotificationState = {

    initialized: false,

    mounted: false,

    currentUser: {
        id: null,
        role: null,
        name: null
    },

    notifications: [],

    unreadCount: 0,

    elements: {},

    /*
     * Other modules can register action handlers.
     *
     * Example:
     *
     * registerActionHandler(
     *     "my-task-completed",
     *     function(notification, action) {}
     * );
     */
    actionHandlers: {},

    /*
     * Temporary in-memory read state while backend
     * is not connected.
     *
     * This is NOT permanent storage.
     */
    sessionReadIds: new Set(),

    /*
     * Temporary in-memory module notifications.
     *
     * These are only useful during the current page
     * session and are NOT fake permanent data.
     */
    runtimeNotifications: []
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeCampusConnectNotifications
);


function initializeCampusConnectNotifications() {

    if (CampusConnectNotificationState.initialized) {
        return;
    }

    CampusConnectNotificationState.initialized = true;

    detectCurrentUser();

    mountGlobalNotificationSystem();

    setupGlobalNotificationEvents();

    connectExistingNotificationButtons();

    /*
     * Backend is only contacted when configured.
     */
    if (hasNotificationAPI()) {

        loadNotifications();

        loadUnreadCount();

    }

}


/* =========================================================
   API STATUS
========================================================= */

function hasNotificationAPI() {

    return Boolean(
        CAMPUSCONNECT_NOTIFICATION_CONFIG.API_BASE_URL &&
        String(
            CAMPUSCONNECT_NOTIFICATION_CONFIG.API_BASE_URL
        ).trim()
    );

}


/* =========================================================
   USER DETECTION
========================================================= */

function detectCurrentUser() {

    const role =
        sessionStorage.getItem(
            "campusconnect_user_role"
        ) ||
        localStorage.getItem(
            "campusconnect_user_role"
        );

    const userId =
        sessionStorage.getItem(
            "campusconnect_user_id"
        ) ||
        localStorage.getItem(
            "campusconnect_user_id"
        );

    const userName =
        sessionStorage.getItem(
            "campusconnect_user_name"
        ) ||
        localStorage.getItem(
            "campusconnect_user_name"
        );

    CampusConnectNotificationState.currentUser = {

        id:
            userId || null,

        role:
            normalizeRole(role),

        name:
            userName || null
    };

}


/* =========================================================
   ROLE NORMALIZATION
========================================================= */

function normalizeRole(role) {

    if (!role) {
        return null;
    }

    const normalized =
        String(role)
            .trim()
            .toLowerCase();

    if (
        normalized === "student" ||
        normalized === "students"
    ) {
        return "student";
    }

    if (
        normalized === "faculty" ||
        normalized === "faculties"
    ) {
        return "faculty";
    }

    if (
        normalized === "admin" ||
        normalized === "admins"
    ) {
        return "admin";
    }

    return null;

}


/* =========================================================
   MOUNT GLOBAL SYSTEM
========================================================= */

function mountGlobalNotificationSystem() {

    /*
     * Prefer the project's standard placeholder.
     */
    const placeholder =
        document.getElementById(
            "globalNotificationPlaceholder"
        );

    /*
     * If the page already contains our root,
     * do not create another one.
     */
    let root =
        document.getElementById(
            "campusConnectNotificationRoot"
        );

    if (!root) {

        root =
            document.createElement("div");

        root.id =
            "campusConnectNotificationRoot";

        root.className =
            "cc-notification-root";

    }

    /*
     * The notification system belongs to the
     * placeholder when one exists.
     */
    if (placeholder) {

        if (root.parentElement !== placeholder) {

            placeholder.appendChild(root);

        }

    } else {

        /*
         * Backward compatibility for pages that
         * have not yet added the placeholder.
         */
        if (!root.parentElement) {

            document.body.appendChild(root);

        }

    }

    /*
     * Never duplicate the UI.
     */
    if (
        root.querySelector(
            "#campusConnectNotificationPanel"
        )
    ) {

        cacheNotificationElements();

        configureCreateNotificationPermission();

        CampusConnectNotificationState.mounted = true;

        return;

    }


    root.innerHTML = createNotificationMarkup();

    cacheNotificationElements();

    configureCreateNotificationPermission();

    CampusConnectNotificationState.mounted = true;

}


/* =========================================================
   MARKUP
========================================================= */

function createNotificationMarkup() {

    return `

        <button
            type="button"
            class="cc-notification-bell"
            id="ccGlobalNotificationBell"
            aria-label="Open notifications"
            aria-expanded="false"
            aria-controls="campusConnectNotificationPanel"
        >

            <i
                class="fa-regular fa-bell"
                aria-hidden="true"
            ></i>

            <span
                class="cc-notification-badge"
                id="ccGlobalNotificationBadge"
                hidden
            >
                0
            </span>

        </button>


        <div
            class="cc-notification-panel"
            id="campusConnectNotificationPanel"
            aria-hidden="true"
            role="dialog"
            aria-label="CampusConnect notifications"
        >

            <div class="cc-notification-header">

                <div class="cc-notification-header-left">

                    <h2 class="cc-notification-title">
                        Notifications
                    </h2>

                    <p
                        class="cc-notification-summary"
                        id="ccNotificationSummary"
                    >
                        No notification data loaded
                    </p>

                </div>


                <div class="cc-notification-header-actions">

                    <button
                        type="button"
                        class="cc-notification-header-button"
                        id="ccMarkAllReadButton"
                    >
                        Mark all as read
                    </button>


                    <button
                        type="button"
                        class="cc-notification-close"
                        id="ccNotificationClose"
                        aria-label="Close notifications"
                    >
                        <i
                            class="fa-solid fa-xmark"
                            aria-hidden="true"
                        ></i>
                    </button>

                </div>

            </div>


            <div
                class="cc-notification-list"
                id="ccNotificationList"
            >

                ${createEmptyStateMarkup()}

            </div>


            <section
                class="cc-create-notification"
                id="ccCreateNotificationSection"
                hidden
            >

                <h3 class="cc-create-notification-title">
                    Create Notification
                </h3>


                <div
                    class="cc-notification-backend-status"
                    id="ccNotificationBackendStatus"
                >
                    Notification sending will become active when
                    the CampusConnect Java backend is connected.
                </div>


                <form
                    id="ccCreateNotificationForm"
                >

                    <div class="cc-notification-form-group">

                        <label
                            class="cc-notification-form-label"
                            for="ccNotificationTitle"
                        >
                            Title
                        </label>

                        <input
                            type="text"
                            id="ccNotificationTitle"
                            class="cc-notification-input"
                            maxlength="150"
                            autocomplete="off"
                            placeholder="Enter notification title"
                            required
                        >

                    </div>


                    <div class="cc-notification-form-group">

                        <label
                            class="cc-notification-form-label"
                            for="ccNotificationMessage"
                        >
                            Message
                        </label>

                        <textarea
                            id="ccNotificationMessage"
                            class="cc-notification-textarea"
                            maxlength="1000"
                            placeholder="Enter notification message"
                            required
                        ></textarea>

                    </div>


                    <div class="cc-notification-form-group">

                        <span class="cc-notification-form-label">
                            Send to
                        </span>


                        <div class="cc-notification-targets">

                            <div class="cc-notification-target">

                                <input
                                    type="checkbox"
                                    id="ccTargetAll"
                                    value="all"
                                    name="notificationTarget"
                                >

                                <label for="ccTargetAll">
                                    All
                                </label>

                            </div>


                            <div class="cc-notification-target">

                                <input
                                    type="checkbox"
                                    id="ccTargetStudents"
                                    value="student"
                                    name="notificationTarget"
                                >

                                <label for="ccTargetStudents">
                                    Students
                                </label>

                            </div>


                            <div class="cc-notification-target">

                                <input
                                    type="checkbox"
                                    id="ccTargetFaculty"
                                    value="faculty"
                                    name="notificationTarget"
                                >

                                <label for="ccTargetFaculty">
                                    Faculty
                                </label>

                            </div>


                            <div class="cc-notification-target">

                                <input
                                    type="checkbox"
                                    id="ccTargetAdmins"
                                    value="admin"
                                    name="notificationTarget"
                                >

                                <label for="ccTargetAdmins">
                                    Admins
                                </label>

                            </div>

                        </div>

                    </div>


                    <button
                        type="submit"
                        class="cc-notification-send"
                        id="ccSendNotificationButton"
                    >
                        Send Notification
                    </button>


                    <div
                        class="cc-notification-form-message"
                        id="ccNotificationFormMessage"
                        aria-live="polite"
                    ></div>

                </form>

            </section>

        </div>

    `;

}


/* =========================================================
   EMPTY STATE
========================================================= */

function createEmptyStateMarkup() {

    return `

        <div class="cc-notification-empty">

            <div class="cc-notification-empty-icon">

                <i
                    class="fa-regular fa-bell"
                    aria-hidden="true"
                ></i>

            </div>

            <p class="cc-notification-empty-title">
                No notifications
            </p>

            <p class="cc-notification-empty-text">
                New notifications will appear here.
            </p>

        </div>

    `;

}


/* =========================================================
   CACHE ELEMENTS
========================================================= */

function cacheNotificationElements() {

    CampusConnectNotificationState.elements = {

        root:
            document.getElementById(
                "campusConnectNotificationRoot"
            ),

        bell:
            document.getElementById(
                "ccGlobalNotificationBell"
            ),

        badge:
            document.getElementById(
                "ccGlobalNotificationBadge"
            ),

        panel:
            document.getElementById(
                "campusConnectNotificationPanel"
            ),

        list:
            document.getElementById(
                "ccNotificationList"
            ),

        summary:
            document.getElementById(
                "ccNotificationSummary"
            ),

        closeButton:
            document.getElementById(
                "ccNotificationClose"
            ),

        markAllReadButton:
            document.getElementById(
                "ccMarkAllReadButton"
            ),

        createSection:
            document.getElementById(
                "ccCreateNotificationSection"
            ),

        backendStatus:
            document.getElementById(
                "ccNotificationBackendStatus"
            ),

        createForm:
            document.getElementById(
                "ccCreateNotificationForm"
            ),

        titleInput:
            document.getElementById(
                "ccNotificationTitle"
            ),

        messageInput:
            document.getElementById(
                "ccNotificationMessage"
            ),

        sendButton:
            document.getElementById(
                "ccSendNotificationButton"
            ),

        formMessage:
            document.getElementById(
                "ccNotificationFormMessage"
            )
    };

}


/* =========================================================
   EVENT SETUP
========================================================= */

function setupGlobalNotificationEvents() {

    const elements =
        CampusConnectNotificationState.elements;


    if (elements.bell) {

        elements.bell.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                toggleNotificationPanel();

            }
        );

    }


    if (elements.closeButton) {

        elements.closeButton.addEventListener(
            "click",
            closeNotificationPanel
        );

    }


    if (elements.markAllReadButton) {

        elements.markAllReadButton.addEventListener(
            "click",
            markAllNotificationsAsRead
        );

    }


    if (elements.createForm) {

        elements.createForm.addEventListener(
            "submit",
            handleCreateNotification
        );

    }


    /*
     * Target "All" automatically controls other
     * target checkboxes.
     */
    document
        .querySelectorAll(
            'input[name="notificationTarget"]'
        )
        .forEach(function (input) {

            input.addEventListener(
                "change",
                handleTargetSelection
            );

        });


    /*
     * Close when clicking outside.
     */
    document.addEventListener(
        "click",
        function (event) {

            const panel =
                CampusConnectNotificationState
                    .elements
                    .panel;

            const bell =
                CampusConnectNotificationState
                    .elements
                    .bell;

            if (!panel) {
                return;
            }

            if (!panel.classList.contains("open")) {
                return;
            }

            if (
                panel.contains(event.target) ||
                (bell && bell.contains(event.target))
            ) {
                return;
            }

            closeNotificationPanel();

        }
    );


    /*
     * Escape closes panel.
     */
    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeNotificationPanel();

            }

        }
    );


    /*
     * Other CampusConnect code can request opening.
     */
    document.addEventListener(
        "campusconnect:open-notifications",
        openNotificationPanel
    );


    /*
     * Login/session code can provide user data.
     */
    document.addEventListener(
        "campusconnect:user-ready",
        function (event) {

            setCurrentUser(
                event.detail || {}
            );

        }
    );


    /*
     * Compatibility with existing external
     * notification-button elements.
     */
    document.addEventListener(
        "click",
        handleExternalNotificationButton
    );


    /*
     * Announce that the global system is ready.
     */
    document.dispatchEvent(
        new CustomEvent(
            "campusconnect:notification-ready",
            {
                detail: {
                    role:
                        CampusConnectNotificationState
                            .currentUser
                            .role
                }
            }
        )
    );

}


/* =========================================================
   TARGET SELECTION
========================================================= */

function handleTargetSelection(event) {

    const selected =
        event.target;

    const allTarget =
        document.getElementById(
            "ccTargetAll"
        );

    const otherTargets =
        document.querySelectorAll(
            'input[name="notificationTarget"]:not(#ccTargetAll)'
        );

    if (!allTarget) {
        return;
    }

    if (
        selected === allTarget &&
        allTarget.checked
    ) {

        otherTargets.forEach(function (input) {

            input.checked = false;

        });

    }

    if (
        selected !== allTarget &&
        selected.checked
    ) {

        allTarget.checked = false;

    }

}


/* =========================================================
   EXISTING BELL COMPATIBILITY
========================================================= */

function connectExistingNotificationButtons() {

    const buttons =
        document.querySelectorAll(
            CAMPUSCONNECT_NOTIFICATION_CONFIG
                .BELL_SELECTOR
        );


    buttons.forEach(function (button) {

        if (
            button.dataset
                .campusconnectNotificationConnected ===
            "true"
        ) {
            return;
        }

        /*
         * Do not connect our own bell twice.
         */
        if (
            button.id ===
            "ccGlobalNotificationBell"
        ) {
            return;
        }

        button.dataset
            .campusconnectNotificationConnected =
            "true";

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                toggleNotificationPanel();

            }
        );

    });

}


/* =========================================================
   EXTERNAL BUTTON HANDLER
========================================================= */

function handleExternalNotificationButton(event) {

    const button =
        event.target.closest(
            CAMPUSCONNECT_NOTIFICATION_CONFIG
                .BELL_SELECTOR
        );

    if (!button) {
        return;
    }

    if (
        button.id ===
        "ccGlobalNotificationBell"
    ) {
        return;
    }

    if (
        button.dataset
            .campusconnectNotificationConnected !==
        "true"
    ) {
        return;
    }

    event.preventDefault();

}


/* =========================================================
   OPEN / CLOSE / TOGGLE
========================================================= */

function toggleNotificationPanel() {

    const panel =
        CampusConnectNotificationState
            .elements
            .panel;

    if (!panel) {
        return;
    }

    if (panel.classList.contains("open")) {

        closeNotificationPanel();

    } else {

        openNotificationPanel();

    }

}


function openNotificationPanel() {

    const panel =
        CampusConnectNotificationState
            .elements
            .panel;

    const bell =
        CampusConnectNotificationState
            .elements
            .bell;

    if (!panel) {
        return;
    }

    panel.classList.add("open");

    panel.setAttribute(
        "aria-hidden",
        "false"
    );

    if (bell) {

        bell.setAttribute(
            "aria-expanded",
            "true"
        );

    }

    if (hasNotificationAPI()) {

        loadNotifications();

        loadUnreadCount();

    }

}


function closeNotificationPanel() {

    const panel =
        CampusConnectNotificationState
            .elements
            .panel;

    const bell =
        CampusConnectNotificationState
            .elements
            .bell;

    if (!panel) {
        return;
    }

    panel.classList.remove("open");

    panel.setAttribute(
        "aria-hidden",
        "true"
    );

    if (bell) {

        bell.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   USER PERMISSION
========================================================= */

function configureCreateNotificationPermission() {

    const role =
        CampusConnectNotificationState
            .currentUser
            .role;

    const section =
        CampusConnectNotificationState
            .elements
            .createSection;

    if (!section) {
        return;
    }

    const canCreate =
        role === "faculty" ||
        role === "admin";

    section.hidden =
        !canCreate;

    updateBackendStatus();

}


function updateBackendStatus() {

    const status =
        CampusConnectNotificationState
            .elements
            .backendStatus;

    if (!status) {
        return;
    }

    if (hasNotificationAPI()) {

        status.textContent =
            "Notifications are connected to the CampusConnect API.";

    } else {

        status.textContent =
            "Notification sending will become active when the CampusConnect Java backend is connected.";

    }

}


/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    if (!hasNotificationAPI()) {

        renderNotifications();

        return;

    }

    showNotificationLoading();

    try {

        const response =
            await notificationFetch(
                CAMPUSCONNECT_NOTIFICATION_CONFIG
                    .ENDPOINTS
                    .NOTIFICATIONS
            );

        if (!response.ok) {

            throw new Error(
                `Notification API returned ${response.status}`
            );

        }

        const data =
            await response.json();

        const serverNotifications =
            normalizeNotificationResponse(
                data
            );

        CampusConnectNotificationState
            .notifications =
            serverNotifications;

        renderNotifications();

    } catch (error) {

        console.error(
            "CampusConnect notification error:",
            error
        );

        showNotificationError(
            "Notifications could not be loaded."
        );

    }

}


/* =========================================================
   LOAD UNREAD COUNT
========================================================= */

async function loadUnreadCount() {

    if (!hasNotificationAPI()) {

        updateGlobalNotificationBadge(
            calculateLocalUnreadCount()
        );

        return;

    }

    try {

        const response =
            await notificationFetch(
                CAMPUSCONNECT_NOTIFICATION_CONFIG
                    .ENDPOINTS
                    .UNREAD_COUNT
            );

        if (!response.ok) {

            throw new Error(
                `Unread API returned ${response.status}`
            );

        }

        const data =
            await response.json();

        const count =
            typeof data === "number"
                ? data
                : Number(
                    data?.unreadCount ??
                    data?.count ??
                    0
                );

        updateGlobalNotificationBadge(
            count
        );

    } catch (error) {

        console.error(
            "CampusConnect unread count error:",
            error
        );

    }

}


/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

function normalizeNotificationResponse(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (
        Array.isArray(
            data?.notifications
        )
    ) {
        return data.notifications;
    }

    if (
        Array.isArray(
            data?.items
        )
    ) {
        return data.items;
    }

    return [];

}


/* =========================================================
   RENDER
========================================================= */

function renderNotifications() {

    const list =
        CampusConnectNotificationState
            .elements
            .list;

    const summary =
        CampusConnectNotificationState
            .elements
            .summary;

    if (!list) {
        return;
    }

    let notifications = [
        ...CampusConnectNotificationState
            .notifications
    ];

    /*
     * Runtime notifications are only session-level
     * notifications created by actual module actions.
     *
     * They are not fake default records.
     */
    notifications = [
        ...CampusConnectNotificationState
            .runtimeNotifications,
        ...notifications
    ];

    if (!notifications.length) {

        list.innerHTML =
            createEmptyStateMarkup();

        if (summary) {

            summary.textContent =
                "No notifications";

        }

        updateGlobalNotificationBadge(0);

        return;

    }

    list.innerHTML =
        notifications
            .map(createNotificationItem)
            .join("");

    if (summary) {

        summary.textContent =
            `${notifications.length} notification` +
            `${notifications.length === 1 ? "" : "s"}`;

    }

    bindNotificationItems();

    updateGlobalNotificationBadge(
        calculateUnreadCount(
            notifications
        )
    );

}


/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function createNotificationItem(
    notification
) {

    const id =
        notification.notificationId ??
        notification.id ??
        "";

    const title =
        notification.title ??
        "Notification";

    const message =
        notification.message ??
        notification.body ??
        "";

    const sender =
        notification.senderName ??
        notification.createdByName ??
        notification.sender ??
        notification.createdBy ??
        "CampusConnect";

    const createdAt =
        notification.createdAt ??
        notification.timestamp ??
        notification.date ??
        "";

    const category =
        notification.categoryName ??
        notification.category ??
        "";

    const isRead =
        isNotificationRead(
            notification
        );

    const unreadClass =
        isRead
            ? ""
            : "unread";

    const actions =
        Array.isArray(
            notification.actions
        )
            ? notification.actions
            : [];

    return `

        <article
            class="cc-notification-item ${unreadClass}"
            data-notification-id="${escapeHTML(id)}"
        >

            <div class="cc-notification-item-top">

                <h3 class="cc-notification-item-title">
                    ${escapeHTML(title)}
                </h3>

                <span class="cc-notification-time">
                    ${escapeHTML(
                        formatNotificationTime(
                            createdAt
                        )
                    )}
                </span>

            </div>


            <p class="cc-notification-message">
                ${escapeHTML(message)}
            </p>


            <div class="cc-notification-meta">

                ${
                    category
                        ? `
                            <span class="cc-notification-category">
                                ${escapeHTML(category)}
                            </span>
                          `
                        : ""
                }

                <span class="cc-notification-sender">
                    From: ${escapeHTML(sender)}
                </span>

            </div>


            ${
                actions.length
                    ? createNotificationActionsMarkup(
                        actions
                    )
                    : ""
            }

        </article>

    `;

}


/* =========================================================
   ACTION MARKUP
========================================================= */

function createNotificationActionsMarkup(
    actions
) {

    return `

        <div class="cc-notification-actions">

            ${
                actions
                    .map(function (action) {

                        const actionId =
                            action.id ??
                            action.actionId ??
                            "";

                        const label =
                            action.label ??
                            action.title ??
                            "Open";

                        return `

                            <button
                                type="button"
                                class="cc-notification-action"
                                data-notification-action="${escapeHTML(actionId)}"
                            >
                                ${escapeHTML(label)}
                            </button>

                        `;

                    })
                    .join("")
            }

        </div>

    `;

}


/* =========================================================
   BIND ITEMS
========================================================= */

function bindNotificationItems() {

    const list =
        CampusConnectNotificationState
            .elements
            .list;

    if (!list) {
        return;
    }

    list
        .querySelectorAll(
            ".cc-notification-item"
        )
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    const actionButton =
                        event.target.closest(
                            ".cc-notification-action"
                        );

                    if (actionButton) {

                        event.preventDefault();

                        event.stopPropagation();

                        handleNotificationAction(
                            item.dataset.notificationId,
                            actionButton.dataset
                                .notificationAction
                        );

                        return;

                    }

                    const notificationId =
                        item.dataset
                            .notificationId;

                    if (notificationId) {

                        markNotificationAsRead(
                            notificationId
                        );

                    }

                }
            );

        });

}


/* =========================================================
   READ STATUS
========================================================= */

function isNotificationRead(
    notification
) {

    const id =
        String(
            notification.notificationId ??
            notification.id ??
            ""
        );

    if (
        id &&
        CampusConnectNotificationState
            .sessionReadIds
            .has(id)
    ) {

        return true;

    }

    return (
        notification.read === true ||
        notification.isRead === true ||
        notification.readStatus === "READ"
    );

}


/* =========================================================
   CALCULATE UNREAD
========================================================= */

function calculateUnreadCount(
    notifications
) {

    if (!Array.isArray(notifications)) {
        return 0;
    }

    return notifications.filter(
        function (notification) {

            return !isNotificationRead(
                notification
            );

        }
    ).length;

}


function calculateLocalUnreadCount() {

    const allNotifications = [
        ...CampusConnectNotificationState
            .runtimeNotifications,
        ...CampusConnectNotificationState
            .notifications
    ];

    return calculateUnreadCount(
        allNotifications
    );

}


/* =========================================================
   MARK ONE AS READ
========================================================= */

async function markNotificationAsRead(
    notificationId
) {

    if (!notificationId) {
        return;
    }

    /*
     * Frontend-only session behavior.
     * No permanent localStorage storage.
     */
    if (!hasNotificationAPI()) {

        CampusConnectNotificationState
            .sessionReadIds
            .add(
                String(notificationId)
            );

        renderNotifications();

        dispatchNotificationEvent(
            "campusconnect:notification-read",
            {
                notificationId:
                    notificationId
            }
        );

        return;

    }


    try {

        const response =
            await notificationFetch(
                CAMPUSCONNECT_NOTIFICATION_CONFIG
                    .ENDPOINTS
                    .MARK_READ,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        notificationId:
                            notificationId

                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                `Mark-read API returned ${response.status}`
            );

        }

        await loadNotifications();

        await loadUnreadCount();

        dispatchNotificationEvent(
            "campusconnect:notification-read",
            {
                notificationId:
                    notificationId
            }
        );

    } catch (error) {

        console.error(
            "Unable to mark notification as read:",
            error
        );

    }

}


/* =========================================================
   MARK ALL AS READ
========================================================= */

async function markAllNotificationsAsRead() {

    if (!hasNotificationAPI()) {

        CampusConnectNotificationState
            .notifications
            .forEach(function (notification) {

                const id =
                    String(
                        notification.notificationId ??
                        notification.id ??
                        ""
                    );

                if (id) {

                    CampusConnectNotificationState
                        .sessionReadIds
                        .add(id);

                }

            });

        CampusConnectNotificationState
            .runtimeNotifications
            .forEach(function (notification) {

                const id =
                    String(
                        notification.id ?? ""
                    );

                if (id) {

                    CampusConnectNotificationState
                        .sessionReadIds
                        .add(id);

                }

            });

        renderNotifications();

        dispatchNotificationEvent(
            "campusconnect:notifications-all-read",
            {}
        );

        return;

    }


    try {

        const response =
            await notificationFetch(
                CAMPUSCONNECT_NOTIFICATION_CONFIG
                    .ENDPOINTS
                    .MARK_ALL_READ,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `Mark-all-read API returned ${response.status}`
            );

        }

        await loadNotifications();

        await loadUnreadCount();

        dispatchNotificationEvent(
            "campusconnect:notifications-all-read",
            {}
        );

    } catch (error) {

        console.error(
            "Unable to mark all notifications as read:",
            error
        );

    }

}


/* =========================================================
   CREATE NOTIFICATION FROM ADMIN/FACULTY FORM
========================================================= */

async function handleCreateNotification(
    event
) {

    event.preventDefault();

    const role =
        CampusConnectNotificationState
            .currentUser
            .role;

    if (
        role !== "faculty" &&
        role !== "admin"
    ) {

        showFormMessage(
            "You do not have permission to create notifications.",
            "error"
        );

        return;

    }

    const elements =
        CampusConnectNotificationState
            .elements;

    const title =
        elements.titleInput
            .value
            .trim();

    const message =
        elements.messageInput
            .value
            .trim();

    const targetInputs =
        document.querySelectorAll(
            'input[name="notificationTarget"]:checked'
        );

    const targets =
        Array.from(targetInputs)
            .map(function (input) {

                return input.value;

            });


    if (!title) {

        showFormMessage(
            "Please enter a notification title.",
            "error"
        );

        return;

    }


    if (!message) {

        showFormMessage(
            "Please enter a notification message.",
            "error"
        );

        return;

    }


    if (!targets.length) {

        showFormMessage(
            "Select at least one recipient group.",
            "error"
        );

        return;

    }


    /*
     * Backend is required for permanent
     * role-wide notifications.
     */
    if (!hasNotificationAPI()) {

        showFormMessage(
            "The Java backend is not connected yet. No notification was stored.",
            "error"
        );

        return;

    }


    elements.sendButton.disabled =
        true;

    elements.sendButton.textContent =
        "Sending...";


    try {

        const payload = {

            title:
                title,

            message:
                message,

            targets:
                targets,

            createdBy:
                CampusConnectNotificationState
                    .currentUser
                    .id,

            createdByRole:
                role

        };


        const response =
            await notificationFetch(
                CAMPUSCONNECT_NOTIFICATION_CONFIG
                    .ENDPOINTS
                    .CREATE_NOTIFICATION,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                `Create notification API returned ${response.status}`
            );

        }


        elements.createForm.reset();

        showFormMessage(
            "Notification sent successfully.",
            "success"
        );


        await loadNotifications();

        await loadUnreadCount();


        dispatchNotificationEvent(
            "campusconnect:notification-created",
            {
                title:
                    title,

                targets:
                    targets
            }
        );


    } catch (error) {

        console.error(
            "CampusConnect notification send error:",
            error
        );

        showFormMessage(
            "Notification could not be sent.",
            "error"
        );

    } finally {

        elements.sendButton.disabled =
            false;

        elements.sendButton.textContent =
            "Send Notification";

    }

}


/* =========================================================
   PUBLIC MODULE NOTIFICATION API
========================================================= */

/*
 * This is the important part for the whole project.
 *
 * Any CampusConnect module can call:
 *
 * CampusConnectNotifications.create({
 *
 *     title: "Attendance Alert",
 *
 *     message: "Your attendance requires attention.",
 *
 *     recipientUserId: "123",
 *
 *     category: "attendance"
 *
 * });
 *
 * When Java + MySQL is connected, it will POST
 * to the central notification endpoint.
 *
 * No module needs its own notification engine.
 */

async function createGlobalNotification(
    options
) {

    const config =
        options || {};

    const title =
        String(
            config.title || ""
        ).trim();

    const message =
        String(
            config.message || ""
        ).trim();


    if (!title) {

        throw new Error(
            "Notification title is required."
        );

    }


    if (!message) {

        throw new Error(
            "Notification message is required."
        );

    }


    const notification = {

        title:
            title,

        message:
            message,

        category:
            config.category ||
            "general",

        priority:
            config.priority ||
            "normal",

        audience:
            normalizeAudience(
                config.audience
            ),

        recipientUserId:
            config.recipientUserId ||
            config.userId ||
            null,

        recipientRole:
            normalizeRole(
                config.recipientRole
            ),

        actions:
            Array.isArray(
                config.actions
            )
                ? config.actions
                : [],

        metadata:
            config.metadata &&
            typeof config.metadata === "object"
                ? config.metadata
                : {},

        createdBy:
            CampusConnectNotificationState
                .currentUser
                .id,

        createdByRole:
            CampusConnectNotificationState
                .currentUser
                .role
    };


    /*
     * If backend exists, this becomes a real
     * persistent notification.
     */
    if (hasNotificationAPI()) {

        const response =
            await notificationFetch(
                CAMPUSCONNECT_NOTIFICATION_CONFIG
                    .ENDPOINTS
                    .CREATE_NOTIFICATION,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            notification
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                `Notification API returned ${response.status}`
            );

        }


        const result =
            await safeJSON(
                response
            );


        await loadNotifications();

        await loadUnreadCount();


        return result;

    }


    /*
     * Frontend-only runtime behavior.
     *
     * This is NOT permanent storage and does not
     * create fake default notifications.
     *
     * It represents a notification generated by
     * an actual module action during the current
     * page session.
     */
    const runtimeNotification = {

        ...notification,

        id:
            `runtime-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        createdAt:
            new Date().toISOString(),

        sender:
            CampusConnectNotificationState
                .currentUser
                .name ||
            "CampusConnect",

        isRead:
            false

    };


    CampusConnectNotificationState
        .runtimeNotifications
        .unshift(
            runtimeNotification
        );


    renderNotifications();

    /*
     * Automatically show the new global
     * notification to the current user only when
     * the notification targets this current user.
     */
    if (
        notificationBelongsToCurrentUser(
            runtimeNotification
        )
    ) {

        updateGlobalNotificationBadge(
            calculateLocalUnreadCount()
        );

    }


    dispatchNotificationEvent(
        "campusconnect:notification-created",
        {
            notification:
                runtimeNotification
        }
    );


    return runtimeNotification;

}


/* =========================================================
   AUDIENCE NORMALIZATION
========================================================= */

function normalizeAudience(
    audience
) {

    if (!audience) {
        return null;
    }

    const value =
        String(audience)
            .trim()
            .toLowerCase();

    if (
        value === "all" ||
        value === "all_users"
    ) {
        return "all";
    }

    if (
        value === "student" ||
        value === "students"
    ) {
        return "student";
    }

    if (
        value === "faculty" ||
        value === "faculties"
    ) {
        return "faculty";
    }

    if (
        value === "admin" ||
        value === "admins"
    ) {
        return "admin";
    }

    return value;

}


/* =========================================================
   CHECK CURRENT USER TARGET
========================================================= */

function notificationBelongsToCurrentUser(
    notification
) {

    const user =
        CampusConnectNotificationState
            .currentUser;

    if (!user.role && !user.id) {
        return false;
    }


    if (
        notification.recipientUserId &&
        user.id &&
        String(
            notification.recipientUserId
        ) === String(user.id)
    ) {

        return true;

    }


    if (
        notification.audience === "all"
    ) {

        return true;

    }


    if (
        notification.audience &&
        user.role &&
        notification.audience ===
            user.role
    ) {

        return true;

    }


    if (
        notification.recipientRole &&
        user.role &&
        notification.recipientRole ===
            user.role
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   NOTIFICATION ACTION SYSTEM
========================================================= */

/*
 * Modules can register an action.
 *
 * Example:
 *
 * CampusConnectNotifications.registerActionHandler(
 *     "my-task-completed",
 *     function(notification) {
 *         // update task
 *     }
 * );
 */

function registerNotificationActionHandler(
    actionId,
    handler
) {

    if (
        !actionId ||
        typeof handler !== "function"
    ) {
        return false;
    }

    CampusConnectNotificationState
        .actionHandlers[
            String(actionId)
        ] =
        handler;

    return true;

}


/* =========================================================
   HANDLE ACTION
========================================================= */

async function handleNotificationAction(
    notificationId,
    actionId
) {

    if (!actionId) {
        return;
    }


    const notification =
        findNotificationById(
            notificationId
        );


    const handler =
        CampusConnectNotificationState
            .actionHandlers[
                String(actionId)
            ];


    /*
     * Mark notification as read when an
     * action is selected.
     */
    if (notificationId) {

        await markNotificationAsRead(
            notificationId
        );

    }


    if (typeof handler === "function") {

        await handler(
            notification,
            {
                id:
                    actionId,

                notificationId:
                    notificationId
            }
        );

    }


    /*
     * Also broadcast a general event so a module
     * can listen without registering a handler.
     */
    dispatchNotificationEvent(
        "campusconnect:notification-action",
        {
            notification:
                notification,

            notificationId:
                notificationId,

            actionId:
                actionId
        }
    );

}


/* =========================================================
   FIND NOTIFICATION
========================================================= */

function findNotificationById(
    notificationId
) {

    const id =
        String(
            notificationId
        );


    const runtime =
        CampusConnectNotificationState
            .runtimeNotifications
            .find(function (notification) {

                return String(
                    notification.id
                ) === id;

            });


    if (runtime) {
        return runtime;
    }


    return CampusConnectNotificationState
        .notifications
        .find(function (notification) {

            return String(
                notification.notificationId ??
                notification.id ??
                ""
            ) === id;

        }) || null;

}


/* =========================================================
   REFRESH
========================================================= */

async function refreshGlobalNotifications() {

    if (!hasNotificationAPI()) {

        renderNotifications();

        updateGlobalNotificationBadge(
            calculateLocalUnreadCount()
        );

        return;

    }


    await Promise.allSettled([

        loadNotifications(),

        loadUnreadCount()

    ]);

}


/* =========================================================
   SET USER
========================================================= */

function setCurrentUser(
    user
) {

    const data =
        user || {};


    CampusConnectNotificationState
        .currentUser
        .id =
        data.id ||
        data.userId ||
        null;


    CampusConnectNotificationState
        .currentUser
        .name =
        data.name ||
        data.userName ||
        null;


    CampusConnectNotificationState
        .currentUser
        .role =
        normalizeRole(
            data.role
        );


    configureCreateNotificationPermission();


    if (hasNotificationAPI()) {

        loadNotifications();

        loadUnreadCount();

    }


    dispatchNotificationEvent(
        "campusconnect:notification-user-updated",
        {
            user:
                getCurrentUser()
        }
    );

}


/* =========================================================
   GET USER
========================================================= */

function getCurrentUser() {

    return {

        ...CampusConnectNotificationState
            .currentUser

    };

}


/* =========================================================
   BADGE
========================================================= */

function updateGlobalNotificationBadge(
    count
) {

    const safeCount =
        Math.max(
            0,
            Number(count) || 0
        );


    CampusConnectNotificationState
        .unreadCount =
        safeCount;


    /*
     * Our global bell.
     */
    const globalBadge =
        CampusConnectNotificationState
            .elements
            .badge;


    if (globalBadge) {

        if (safeCount <= 0) {

            globalBadge.hidden =
                true;

            globalBadge.textContent =
                "0";

        } else {

            globalBadge.hidden =
                false;

            globalBadge.textContent =
                safeCount > 99
                    ? "99+"
                    : String(safeCount);

        }

    }


    /*
     * Compatibility with existing project bells.
     */
    document
        .querySelectorAll(
            ".notification-badge"
        )
        .forEach(function (badge) {

            if (
                badge === globalBadge
            ) {
                return;
            }

            if (safeCount <= 0) {

                badge.hidden =
                    true;

                badge.textContent =
                    "0";

            } else {

                badge.hidden =
                    false;

                badge.textContent =
                    safeCount > 99
                        ? "99+"
                        : String(safeCount);

            }

        });


    dispatchNotificationEvent(
        "campusconnect:notification-count",
        {
            unreadCount:
                safeCount
        }
    );

}


/* =========================================================
   LOADING
========================================================= */

function showNotificationLoading() {

    const list =
        CampusConnectNotificationState
            .elements
            .list;

    if (!list) {
        return;
    }

    list.innerHTML = `

        <div class="cc-notification-loading">
            Loading notifications...
        </div>

    `;

}


/* =========================================================
   ERROR
========================================================= */

function showNotificationError(
    message
) {

    const list =
        CampusConnectNotificationState
            .elements
            .list;

    if (!list) {
        return;
    }

    list.innerHTML = `

        <div class="cc-notification-error">

            <div class="cc-notification-error-icon">

                <i
                    class="fa-solid fa-triangle-exclamation"
                    aria-hidden="true"
                ></i>

            </div>

            <p class="cc-notification-error-title">
                Unable to load notifications
            </p>

            <p class="cc-notification-error-text">
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   FORM MESSAGE
========================================================= */

function showFormMessage(
    message,
    type
) {

    const element =
        CampusConnectNotificationState
            .elements
            .formMessage;

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        "cc-notification-form-message";

    if (type) {

        element.classList.add(
            type
        );

    }

}


/* =========================================================
   API FETCH
========================================================= */

async function notificationFetch(
    endpoint,
    options = {}
) {

    const url =
        buildNotificationURL(
            endpoint
        );


    const requestOptions = {

        ...options,

        credentials:
            options.credentials ||
            "include",

        headers: {

            Accept:
                "application/json",

            ...(options.headers || {})

        }

    };


    return fetch(
        url,
        requestOptions
    );

}


/* =========================================================
   BUILD API URL
========================================================= */

function buildNotificationURL(
    endpoint
) {

    const base =
        String(
            CAMPUSCONNECT_NOTIFICATION_CONFIG
                .API_BASE_URL ||
            ""
        ).replace(
            /\/+$/,
            ""
        );


    const path =
        String(
            endpoint ||
            ""
        );


    if (!base) {
        return path;
    }


    if (path.startsWith("/")) {

        return (
            base +
            path
        );

    }


    return (
        base +
        "/" +
        path
    );

}


/* =========================================================
   SAFE JSON
========================================================= */

async function safeJSON(
    response
) {

    const text =
        await response.text();

    if (!text) {
        return null;
    }

    try {

        return JSON.parse(
            text
        );

    } catch {

        return null;

    }

}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatNotificationTime(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        [],
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CUSTOM EVENT HELPER
========================================================= */

function dispatchNotificationEvent(
    eventName,
    detail
) {

    document.dispatchEvent(
        new CustomEvent(
            eventName,
            {
                detail:
                    detail || {}
            }
        )
    );

}


/* =========================================================
   PUBLIC GLOBAL API
========================================================= */

window.CampusConnectNotifications = {

    /*
     * Open notification panel.
     */
    open:
        openNotificationPanel,

    /*
     * Close notification panel.
     */
    close:
        closeNotificationPanel,

    /*
     * Toggle notification panel.
     */
    toggle:
        toggleNotificationPanel,

    /*
     * Refresh notifications.
     */
    refresh:
        refreshGlobalNotifications,

    /*
     * Set logged-in user.
     */
    setUser:
        setCurrentUser,

    /*
     * Get logged-in user.
     */
    getUser:
        getCurrentUser,

    /*
     * Create notification from any CampusConnect
     * module.
     */
    create:
        createGlobalNotification,

    /*
     * Register action handlers.
     */
    registerActionHandler:
        registerNotificationActionHandler,

    /*
     * Get current unread count.
     */
    getUnreadCount:
        function () {

            return CampusConnectNotificationState
                .unreadCount;

        },

    /*
     * Check whether API is connected.
     */
    isAPIConnected:
        hasNotificationAPI

};


/* =========================================================
   BACKWARD-COMPATIBILITY ALIAS
========================================================= */

window.CampusConnectNotification =
    window.CampusConnectNotifications;