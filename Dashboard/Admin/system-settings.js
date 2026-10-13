/* =========================================================
   CAMPUSCONNECT
   ADMIN SYSTEM SETTINGS
   SYSTEM SETTINGS JS — PART 1

   CORE
   CONFIGURATION
   DOM REFERENCES
   INITIALIZATION
   API HELPER
   COMMON UTILITIES
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    /*
     * Keep this empty while the frontend and backend
     * are running from the same server.
     *
     * Example for a separate Java backend later:
     * API_BASE_URL: "http://localhost:8080/api"
     */
    API_BASE_URL: "",

    ENDPOINTS: {

        general: "/admin/settings/general",

        academic: "/admin/settings/academic",

        users: "/admin/settings/users",

        notifications: "/admin/settings/notifications",

        security: "/admin/settings/security",

        backup: "/admin/settings/backup",

        appearance: "/admin/settings/appearance",

        system: "/admin/settings"

    },

    REQUEST_TIMEOUT: 10000

};


/* =========================================================
   DOM REFERENCES
========================================================= */

const DOM = {

    /* ---------- Main Navigation ---------- */

    backBtn:
        document.getElementById("backBtn"),

    refreshBtn:
        document.getElementById("refreshBtn"),

    profileBtn:
        document.getElementById("profileBtn"),

    notificationBtn:
        document.getElementById("notificationBtn"),

    notificationDot:
        document.getElementById("notificationDot"),

    globalNotificationPlaceholder:
        document.getElementById(
            "globalNotificationPlaceholder"
        ),


    /* ---------- Settings ---------- */

    settingsTabs:
        document.querySelectorAll(".settings-tab"),

    settingsSections:
        document.querySelectorAll(".settings-section"),


    /* ---------- General ---------- */

    collegeName:
        document.getElementById("collegeName"),

    collegeEmail:
        document.getElementById("collegeEmail"),

    collegePhone:
        document.getElementById("collegePhone"),

    collegeAddress:
        document.getElementById("collegeAddress"),

    systemName:
        document.getElementById("systemName"),

    academicSession:
        document.getElementById("academicSession"),

    timeZone:
        document.getElementById("timeZone"),

    dateFormat:
        document.getElementById("dateFormat"),


    /* ---------- Academic ---------- */

    activeSession:
        document.getElementById("activeSession"),

    sessionStart:
        document.getElementById("sessionStart"),

    sessionEnd:
        document.getElementById("sessionEnd"),

    semesterSystem:
        document.getElementById("semesterSystem"),

    totalSemesters:
        document.getElementById("totalSemesters"),

    minimumAttendance:
        document.getElementById("minimumAttendance"),

    workingDays:
        document.getElementById("workingDays"),

    gradingSystem:
        document.getElementById("gradingSystem"),

    passingPercentage:
        document.getElementById("passingPercentage"),


    /* ---------- Users ---------- */

    newUserRegistration:
        document.getElementById("newUserRegistration"),

    accountActivation:
        document.getElementById("accountActivation"),

    automaticDeactivation:
        document.getElementById("automaticDeactivation"),

    sessionTimeout:
        document.getElementById("sessionTimeout"),


    /* ---------- Notifications ---------- */

    globalNotifications:
        document.getElementById("globalNotifications"),

    emailNotifications:
        document.getElementById("emailNotifications"),


    /* ---------- Security ---------- */

    minimumPasswordLength:
        document.getElementById("minimumPasswordLength"),

    passwordExpiry:
        document.getElementById("passwordExpiry"),

    requireUppercase:
        document.getElementById("requireUppercase"),

    requireNumber:
        document.getElementById("requireNumber"),

    requireSpecialCharacter:
        document.getElementById("requireSpecialCharacter"),

    failedLoginProtection:
        document.getElementById("failedLoginProtection"),

    twoFactorAuthentication:
        document.getElementById("twoFactorAuthentication"),


    /* ---------- Backup ---------- */

    backupStatus:
        document.getElementById("backupStatus"),

    lastBackupText:
        document.getElementById("lastBackupText"),

    backupBadge:
        document.getElementById("backupBadge"),

    backupFrequency:
        document.getElementById("backupFrequency"),

    backupRetention:
        document.getElementById("backupRetention"),

    createBackupBtn:
        document.getElementById("createBackupBtn"),

    backupHistoryBtn:
        document.getElementById("backupHistoryBtn"),


    /* ---------- Appearance ---------- */

    portalTitle:
        document.getElementById("portalTitle"),

    primaryColor:
        document.getElementById("primaryColor"),

    primaryColorText:
        document.getElementById("primaryColorText"),

    collegeLogo:
        document.getElementById("collegeLogo"),

    interfaceTheme:
        document.getElementById("interfaceTheme"),

    sidebarDisplay:
        document.getElementById("sidebarDisplay"),


    /* ---------- System Information ---------- */

    backendStatus:
        document.getElementById("backendStatus"),

    databaseStatus:
        document.getElementById("databaseStatus"),

    apiStatus:
        document.getElementById("apiStatus"),

    storageStatus:
        document.getElementById("storageStatus"),

    infoSystemName:
        document.getElementById("infoSystemName"),

    systemVersion:
        document.getElementById("systemVersion"),

    infoBackend:
        document.getElementById("infoBackend"),

    infoDatabase:
        document.getElementById("infoDatabase"),

    infoApiStatus:
        document.getElementById("infoApiStatus"),

    lastSync:
        document.getElementById("lastSync"),

    clearSystemCacheBtn:
        document.getElementById("clearSystemCacheBtn"),

    runSystemCheckBtn:
        document.getElementById("runSystemCheckBtn"),


    /* ---------- Logout ---------- */

    logoutModal:
        document.getElementById("logoutModal"),

    cancelLogoutBtn:
        document.getElementById("cancelLogoutBtn"),

    confirmLogoutBtn:
        document.getElementById("confirmLogoutBtn")

};


/* =========================================================
   APPLICATION STATE
========================================================= */

const SETTINGS_STATE = {

    activeSection: "general",

    isLoading: false,

    backendAvailable: false,

    originalValuesCaptured: false

};


/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(

    endpoint,

    options = {}

) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            CONFIG.REQUEST_TIMEOUT
        );


    try {

        const response = await fetch(

            CONFIG.API_BASE_URL + endpoint,

            {

                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                },

                signal:
                    controller.signal

            }

        );


        clearTimeout(timeout);


        /*
         * Convert the response safely.
         * Some endpoints may return no JSON body.
         */

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data = null;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data = await response.json();

        } else {

            const text =
                await response.text();

            data = text || null;

        }


        if (!response.ok) {

            const error =
                new Error(
                    data?.message ||
                    `Request failed with status ${response.status}`
                );

            error.status =
                response.status;

            error.data =
                data;

            throw error;

        }


        return {

            success: true,

            status:
                response.status,

            data

        };

    } catch (error) {

        clearTimeout(timeout);


        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "The request timed out. Please try again."
            );

        }


        throw error;

    }

}


/* =========================================================
   SAFE JSON PARSER
========================================================= */

function safeJsonParse(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    if (
        typeof value === "object"
    ) {

        return value;

    }


    try {

        return JSON.parse(value);

    } catch {

        return null;

    }

}


/* =========================================================
   GET ELEMENT VALUE
========================================================= */

function getElementValue(element) {

    if (!element) {

        return null;

    }


    if (
        element.type === "checkbox" ||
        element.type === "radio"
    ) {

        return element.checked;

    }


    return element.value;

}


/* =========================================================
   SET ELEMENT VALUE
========================================================= */

function setElementValue(

    element,

    value

) {

    if (!element) {

        return;

    }


    if (
        element.type === "checkbox" ||
        element.type === "radio"
    ) {

        element.checked =
            Boolean(value);

        return;

    }


    if (
        value === null ||
        value === undefined
    ) {

        return;

    }


    element.value =
        String(value);

}


/* =========================================================
   GET SECTION
========================================================= */

function getSettingsSection(

    sectionId

) {

    if (!sectionId) {

        return null;

    }


    return document.getElementById(
        sectionId
    );

}


/* =========================================================
   SHOW SETTINGS SECTION
========================================================= */

function showSettingsSection(

    sectionId

) {

    const section =
        getSettingsSection(
            sectionId
        );


    if (!section) {

        return false;

    }


    DOM.settingsSections.forEach(

        currentSection => {

            currentSection.classList.toggle(

                "active",

                currentSection.id ===
                sectionId

            );

        }

    );


    DOM.settingsTabs.forEach(

        tab => {

            const target =
                tab.dataset.target;

            tab.classList.toggle(

                "active",

                target === sectionId

            );

        }

    );


    SETTINGS_STATE.activeSection =
        sectionId;


    return true;

}


/* =========================================================
   DISABLE BUTTON TEMPORARILY
========================================================= */

function setButtonLoading(

    button,

    loading = true

) {

    if (!button) {

        return;

    }


    if (loading) {

        button.classList.add(
            "is-loading"
        );

        button.disabled = true;

        button.dataset
            .originalText =
            button.innerHTML;

    } else {

        button.classList.remove(
            "is-loading"
        );

        button.disabled = false;


        if (
            button.dataset.originalText
        ) {

            button.innerHTML =
                button.dataset.originalText;

        }

    }

}


/* =========================================================
   CREATE SETTINGS MESSAGE
========================================================= */

function createSettingsMessage(

    section,

    message,

    type = "success"

) {

    if (!section) {

        return;

    }


    let messageElement =
        section.querySelector(
            ".settings-save-message"
        );


    /*
     * If the HTML already contains
     * the message element, reuse it.
     */

    if (!messageElement) {

        messageElement =
            document.createElement(
                "div"
            );

        messageElement.className =
            "settings-save-message";

        section.appendChild(
            messageElement
        );

    }


    const icon =
        type === "success"
            ? "fa-circle-check"
            : type === "warning"
                ? "fa-triangle-exclamation"
                : "fa-circle-exclamation";


    messageElement.innerHTML = `

        <i class="fa-solid ${icon}"></i>

        <span>
            ${escapeHtml(message)}
        </span>

    `;


    messageElement.classList.add(
        "show"
    );


    clearTimeout(
        messageElement._hideTimer
    );


    messageElement._hideTimer =
        setTimeout(() => {

            messageElement.classList.remove(
                "show"
            );

        }, 4000);

}


/* =========================================================
   HTML ESCAPE UTILITY
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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
   INITIALIZE SETTINGS PAGE
========================================================= */

function initializeSettings() {

    /*
     * Part 2 onward will attach:
     * - tab listeners
     * - navigation
     * - save/reset handlers
     * - appearance handlers
     * - backup handlers
     * - system handlers
     * - logout handlers
     */

    showSettingsSection(
        SETTINGS_STATE.activeSection
    );


    console.log(
        "CampusConnect System Settings initialized."
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializeSettings();

    }

);
/* =========================================================
   CAMPUSCONNECT
   ADMIN SYSTEM SETTINGS
   SYSTEM SETTINGS JS — PART 2

   SETTINGS TABS
   PAGE NAVIGATION
   BACK BUTTON
   REFRESH
   PROFILE
========================================================= */


/* =========================================================
   SETTINGS TAB SYSTEM
========================================================= */

function initializeSettingsTabs() {

    if (!DOM.settingsTabs.length) {

        return;

    }


    DOM.settingsTabs.forEach(

        tab => {

            tab.addEventListener(

                "click",

                function () {

                    const target =
                        this.dataset.target;


                    if (!target) {

                        return;

                    }


                    const sectionShown =
                        showSettingsSection(
                            target
                        );


                    if (!sectionShown) {

                        return;

                    }


                    /*
                     * Move the user to the
                     * beginning of the selected
                     * settings section.
                     */

                    const section =
                        document.getElementById(
                            target
                        );


                    if (section) {

                        const headerOffset = 90;

                        const sectionTop =
                            section.getBoundingClientRect()
                                .top
                            +
                            window.pageYOffset
                            -
                            headerOffset;


                        window.scrollTo({

                            top:
                                Math.max(
                                    0,
                                    sectionTop
                                ),

                            behavior:
                                "smooth"

                        });

                    }

                }

            );

        }

    );

}


/* =========================================================
   SET ACTIVE TAB FROM CURRENT SECTION
========================================================= */

function syncSettingsTabState() {

    const activeSection =
        SETTINGS_STATE.activeSection;


    DOM.settingsTabs.forEach(

        tab => {

            tab.classList.toggle(

                "active",

                tab.dataset.target ===
                activeSection

            );

        }

    );


    DOM.settingsSections.forEach(

        section => {

            section.classList.toggle(

                "active",

                section.id ===
                activeSection

            );

        }

    );

}


/* =========================================================
   BACK BUTTON
========================================================= */

function initializeBackButton() {

    if (!DOM.backBtn) {

        return;

    }


    DOM.backBtn.addEventListener(

        "click",

        function () {

            /*
             * Use browser history so the user
             * returns to the actual page they
             * came from instead of always going
             * to the admin dashboard.
             */

            if (
                window.history.length > 1
            ) {

                window.history.back();

            } else {

                /*
                 * Safe fallback if there is
                 * no useful browser history.
                 */

                window.location.href =
                    "admin-dashboard.html";

            }

        }

    );

}


/* =========================================================
   REFRESH BUTTON
========================================================= */

function initializeRefreshButton() {

    if (!DOM.refreshBtn) {

        return;

    }


    DOM.refreshBtn.addEventListener(

        "click",

        function () {

            if (
                this.classList.contains(
                    "is-loading"
                )
            ) {

                return;

            }


            this.classList.add(
                "is-loading"
            );

            this.disabled = true;


            /*
             * Small visual delay makes the
             * refresh interaction feel deliberate.
             */

            setTimeout(

                () => {

                    window.location.reload();

                },

                250

            );

        }

    );

}


/* =========================================================
   PROFILE BUTTON
========================================================= */

function initializeProfileButton() {

    if (!DOM.profileBtn) {

        return;

    }


    DOM.profileBtn.addEventListener(

        "click",

        function () {

            /*
             * Profile is a separate page.
             * Do not open a dropdown here.
             */

            window.location.href =
                "profile.html";

        }

    );

}


/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

function initializeNotificationButton() {

    if (!DOM.notificationBtn) {

        return;

    }


    DOM.notificationBtn.addEventListener(

        "click",

        function () {

            /*
             * The actual notification system
             * will remain global.
             *
             * Part 6 will connect this button
             * with the shared notification system.
             */

            document.dispatchEvent(

                new CustomEvent(
                    "campusconnect:openNotifications"
                )

            );

        }

    );

}


/* =========================================================
   SIDEBAR ACTIVE STATE
========================================================= */

function initializeSidebarState() {

    const sidebarLinks =
        document.querySelectorAll(
            ".sidebar-nav a"
        );


    if (!sidebarLinks.length) {

        return;

    }


    const currentFile =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    sidebarLinks.forEach(

        link => {

            const href =
                link.getAttribute("href");


            if (!href) {

                return;

            }


            const linkFile =
                href
                    .split("/")
                    .pop()
                    .toLowerCase();


            if (
                linkFile === currentFile
            ) {

                link.classList.add(
                    "active"
                );

            }

        }

    );

}


/* =========================================================
   SIDEBAR LINK CLICK FEEDBACK
========================================================= */

function initializeSidebarLinks() {

    const sidebarLinks =
        document.querySelectorAll(
            ".sidebar-nav a"
        );


    sidebarLinks.forEach(

        link => {

            link.addEventListener(

                "click",

                function () {

                    /*
                     * Do not interfere with normal
                     * browser navigation.
                     *
                     * This only gives immediate
                     * visual feedback.
                     */

                    sidebarLinks.forEach(

                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }

                    );


                    this.classList.add(
                        "active"
                    );

                }

            );

        }

    );

}


/* =========================================================
   SETTINGS URL STATE
========================================================= */

function getSectionFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const section =
        params.get("section");


    if (!section) {

        return null;

    }


    const sectionElement =
        document.getElementById(
            section
        );


    if (!sectionElement) {

        return null;

    }


    return section;

}


/* =========================================================
   OPEN SECTION FROM URL
========================================================= */

function initializeUrlSection() {

    const urlSection =
        getSectionFromUrl();


    if (!urlSection) {

        return;

    }


    showSettingsSection(
        urlSection
    );


    /*
     * Remove the section query from
     * browser history after reading it.
     *
     * This keeps the page URL clean.
     */

    const cleanUrl =
        window.location.pathname;


    window.history.replaceState(

        {},

        document.title,

        cleanUrl

    );

}


/* =========================================================
   SETTINGS SECTION KEYBOARD SUPPORT
========================================================= */

function initializeTabKeyboardSupport() {

    DOM.settingsTabs.forEach(

        (tab, index) => {

            tab.addEventListener(

                "keydown",

                function (event) {

                    if (
                        event.key !== "ArrowRight" &&
                        event.key !== "ArrowLeft"
                    ) {

                        return;

                    }


                    event.preventDefault();


                    const total =
                        DOM.settingsTabs.length;


                    let nextIndex;


                    if (
                        event.key === "ArrowRight"
                    ) {

                        nextIndex =
                            (index + 1) % total;

                    } else {

                        nextIndex =
                            (index - 1 + total) %
                            total;

                    }


                    const nextTab =
                        DOM.settingsTabs[
                            nextIndex
                        ];


                    if (!nextTab) {

                        return;

                    }


                    nextTab.focus();

                    nextTab.click();

                }

            );

        }

    );

}


/* =========================================================
   INITIALIZE ALL PART 2 FEATURES
========================================================= */

function initializePart2() {

    initializeSettingsTabs();

    initializeBackButton();

    initializeRefreshButton();

    initializeProfileButton();

    initializeNotificationButton();

    initializeSidebarState();

    initializeSidebarLinks();

    initializeUrlSection();

    initializeTabKeyboardSupport();

}


/* =========================================================
   EXTEND MAIN INITIALIZATION
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializePart2();

    }

);
/* =========================================================
   CAMPUSCONNECT
   ADMIN SYSTEM SETTINGS
   SYSTEM SETTINGS JS — PART 3

   SAVE SETTINGS
   RESET SETTINGS
   ORIGINAL VALUES
   PAYLOAD BUILDING
   SECTION SCROLLING
========================================================= */


/* =========================================================
   SECTION CONFIGURATION
========================================================= */

const SECTION_CONFIG = {

    general: {

        endpoint:
            CONFIG.ENDPOINTS.general,

        method: "PUT"

    },

    academic: {

        endpoint:
            CONFIG.ENDPOINTS.academic,

        method: "PUT"

    },

    users: {

        endpoint:
            CONFIG.ENDPOINTS.users,

        method: "PUT"

    },

    notifications: {

        endpoint:
            CONFIG.ENDPOINTS.notifications,

        method: "PUT"

    },

    security: {

        endpoint:
            CONFIG.ENDPOINTS.security,

        method: "PUT"

    },

    backup: {

        endpoint:
            CONFIG.ENDPOINTS.backup,

        method: "PUT"

    },

    appearance: {

        endpoint:
            CONFIG.ENDPOINTS.appearance,

        method: "PUT"

    },

    system: {

        endpoint:
            CONFIG.ENDPOINTS.system,

        method: "PUT"

    }

};


/* =========================================================
   CAPTURE ORIGINAL VALUES
========================================================= */

function captureOriginalValues() {

    if (
        SETTINGS_STATE.originalValuesCaptured
    ) {

        return;

    }


    DOM.settingsSections.forEach(

        section => {

            const controls =
                section.querySelectorAll(
                    "input, select, textarea"
                );


            controls.forEach(

                control => {

                    /*
                     * Store the original value
                     * that existed when the page
                     * was initially loaded.
                     */

                    if (
                        control.type === "checkbox" ||
                        control.type === "radio"
                    ) {

                        control.dataset
                            .originalChecked =
                            control.checked
                                ? "true"
                                : "false";

                    } else if (
                        control.type === "file"
                    ) {

                        control.dataset
                            .originalValue = "";

                    } else {

                        control.dataset
                            .originalValue =
                            control.value;

                    }

                }

            );

        }

    );


    SETTINGS_STATE.originalValuesCaptured =
        true;

}


/* =========================================================
   RESTORE ORIGINAL VALUES
========================================================= */

function restoreOriginalValues(

    section

) {

    if (!section) {

        return;

    }


    const controls =
        section.querySelectorAll(
            "input, select, textarea"
        );


    controls.forEach(

        control => {

            if (
                control.type === "checkbox" ||
                control.type === "radio"
            ) {

                control.checked =
                    control.dataset
                        .originalChecked ===
                    "true";

            } else if (
                control.type === "file"
            ) {

                /*
                 * Browsers do not allow us
                 * to restore a file input
                 * programmatically.
                 */

                control.value = "";

            } else if (
                control.dataset
                    .originalValue !==
                    undefined
            ) {

                control.value =
                    control.dataset
                        .originalValue;

            }

        }

    );

}


/* =========================================================
   GET FORM CONTROLS
========================================================= */

function getSectionControls(

    section

) {

    if (!section) {

        return [];

    }


    return Array.from(

        section.querySelectorAll(
            "input, select, textarea"
        )

    );

}


/* =========================================================
   BUILD SECTION PAYLOAD
========================================================= */

function buildSectionPayload(

    section

) {

    const payload = {};

    const controls =
        getSectionControls(
            section
        );


    controls.forEach(

        control => {

            const name =
                control.name ||
                control.id;


            /*
             * Ignore controls that have
             * neither name nor id.
             */

            if (!name) {

                return;

            }


            /*
             * Radio buttons:
             * only the selected radio
             * should be included.
             */

            if (
                control.type === "radio"
            ) {

                if (!control.checked) {

                    return;

                }


                payload[name] =
                    control.value;

                return;

            }


            /*
             * Checkboxes:
             * send a boolean.
             */

            if (
                control.type === "checkbox"
            ) {

                payload[name] =
                    control.checked;

                return;

            }


            /*
             * File inputs are handled
             * separately by the backend
             * upload workflow.
             */

            if (
                control.type === "file"
            ) {

                return;

            }


            payload[name] =
                control.value;

        }

    );


    /*
     * Notification types use multiple
     * checkboxes with the same name.
     */

    if (
        section.id === "notifications"
    ) {

        const notificationTypes =
            section.querySelectorAll(
                'input[name="notificationType"]:checked'
            );


        payload.notificationTypes =
            Array.from(
                notificationTypes
            ).map(
                checkbox =>
                    checkbox.value
            );


        /*
         * Remove the individual
         * notificationType boolean
         * fields if any were created.
         */

        delete payload.notificationType;

    }


    return payload;

}


/* =========================================================
   VALIDATE SECTION
========================================================= */

function validateSettingsSection(

    section

) {

    if (!section) {

        return false;

    }


    /*
     * Use the browser's native validation
     * rules from the HTML.
     */

    const controls =
        getSectionControls(
            section
        );


    for (const control of controls) {

        if (
            control.disabled ||
            control.type === "hidden" ||
            control.type === "file"
        ) {

            continue;

        }


        if (
            !control.checkValidity()
        ) {

            control.focus();


            showSettingsError(

                section,

                control.validationMessage ||
                "Please check the highlighted field."

            );


            return false;

        }

    }


    return true;

}


/* =========================================================
   SHOW SETTINGS ERROR
========================================================= */

function showSettingsError(

    section,

    message

) {

    createSettingsMessage(

        section,

        message,

        "error"

    );

}


/* =========================================================
   SHOW SETTINGS SUCCESS
========================================================= */

function showSettingsSuccess(

    section,

    message

) {

    createSettingsMessage(

        section,

        message,

        "success"

    );

}


/* =========================================================
   SAVE SETTINGS SECTION
========================================================= */

async function saveSettingsSection(

    sectionId,

    button

) {

    const section =
        getSettingsSection(
            sectionId
        );


    if (!section) {

        return;

    }


    /*
     * Validate before sending anything.
     */

    if (
        !validateSettingsSection(
            section
        )
    ) {

        return;

    }


    const sectionConfig =
        SECTION_CONFIG[
            sectionId
        ];


    if (!sectionConfig) {

        showSettingsError(

            section,

            "This settings section is not configured yet."

        );

        return;

    }


    const payload =
        buildSectionPayload(
            section
        );


    setButtonLoading(
        button,
        true
    );


    try {

        /*
         * Send the actual request.
         *
         * If the Java backend is not running,
         * this will fail normally and the UI
         * will NOT pretend that the server saved it.
         */

        const response =
            await apiRequest(

                sectionConfig.endpoint,

                {

                    method:
                        sectionConfig.method,

                    body:
                        JSON.stringify(
                            payload
                        )

                }

            );


        /*
         * Server accepted the settings.
         */

        showSettingsSuccess(

            section,

            response.data?.message ||
            "Settings saved successfully."

        );


        /*
         * The newly saved values become
         * the new reset baseline.
         */

        updateOriginalValuesForSection(
            section
        );


    } catch (error) {

        console.error(
            "CampusConnect settings save error:",
            error
        );


        /*
         * Important:
         * Do not display a fake success message.
         */

        showSettingsError(

            section,

            getApiErrorMessage(
                error
            )

        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


/* =========================================================
   UPDATE ORIGINAL VALUES AFTER SAVE
========================================================= */

function updateOriginalValuesForSection(

    section

) {

    if (!section) {

        return;

    }


    const controls =
        getSectionControls(
            section
        );


    controls.forEach(

        control => {

            if (
                control.type === "checkbox" ||
                control.type === "radio"
            ) {

                control.dataset
                    .originalChecked =
                    control.checked
                        ? "true"
                        : "false";

            } else if (
                control.type === "file"
            ) {

                control.dataset
                    .originalValue = "";

            } else {

                control.dataset
                    .originalValue =
                    control.value;

            }

        }

    );

}


/* =========================================================
   RESET SETTINGS SECTION
========================================================= */

function resetSettingsSection(

    sectionId,

    button

) {

    const section =
        getSettingsSection(
            sectionId
        );


    if (!section) {

        return;

    }


    if (button) {

        setButtonLoading(
            button,
            true
        );

    }


    /*
     * Restore the values that existed when
     * the current saved state was established.
     */

    restoreOriginalValues(
        section
    );


    /*
     * Appearance preview will be updated
     * again in Part 4.
     */

    document.dispatchEvent(

        new CustomEvent(
            "campusconnect:settingsReset",
            {
                detail: {
                    sectionId
                }
            }
        )

    );


    showSettingsSuccess(

        section,

        "Settings restored to their original values."

    );


    /*
     * Return the user smoothly to the
     * exact section that was reset.
     */

    setTimeout(

        () => {

            scrollToSectionTop(
                section
            );


            if (button) {

                setButtonLoading(
                    button,
                    false
                );

            }

        },

        120

    );

}


/* =========================================================
   SCROLL TO EXACT SECTION TOP
========================================================= */

function scrollToSectionTop(

    section

) {

    if (!section) {

        return;

    }


    const headerOffset = 90;


    const sectionTop =

        section.getBoundingClientRect().top

        +

        window.pageYOffset

        -

        headerOffset;


    window.scrollTo({

        top:
            Math.max(
                0,
                sectionTop
            ),

        behavior:
            "smooth"

    });

}


/* =========================================================
   GET API ERROR MESSAGE
========================================================= */

function getApiErrorMessage(

    error

) {

    if (!error) {

        return "Unable to save settings.";

    }


    if (
        error.message
    ) {

        /*
         * Avoid exposing raw browser
         * network errors directly when
         * possible.
         */

        if (
            error.message.includes(
                "Failed to fetch"
            )
        ) {

            return (
                "Backend is not connected. " +
                "The settings were not saved."
            );

        }


        if (
            error.message.includes(
                "NetworkError"
            )
        ) {

            return (
                "Backend is not connected. " +
                "The settings were not saved."
            );

        }


        return error.message;

    }


    return (
        "Unable to save settings. " +
        "Please try again."
    );

}


/* =========================================================
   CONNECT SAVE / RESET BUTTONS
========================================================= */

function initializeSaveResetButtons() {

    const saveButtons =
        document.querySelectorAll(
            '[data-action="save-settings"]'
        );


    const resetButtons =
        document.querySelectorAll(
            '[data-action="reset-settings"]'
        );


    /*
     * SAVE BUTTONS
     */

    saveButtons.forEach(

        button => {

            button.addEventListener(

                "click",

                function () {

                    const sectionId =
                        this.dataset.section;


                    if (!sectionId) {

                        return;

                    }


                    saveSettingsSection(

                        sectionId,

                        this

                    );

                }

            );

        }

    );


    /*
     * RESET BUTTONS
     */

    resetButtons.forEach(

        button => {

            button.addEventListener(

                "click",

                function () {

                    const sectionId =
                        this.dataset.section;


                    if (!sectionId) {

                        return;

                    }


                    resetSettingsSection(

                        sectionId,

                        this

                    );

                }

            );

        }

    );

}


/* =========================================================
   INITIALIZE PART 3
========================================================= */

function initializePart3() {

    captureOriginalValues();

    initializeSaveResetButtons();

}


/* =========================================================
   DOM READY — PART 3
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializePart3();

    }

);
/* =========================================================
   CAMPUSCONNECT
   ADMIN SYSTEM SETTINGS
   SYSTEM SETTINGS JS — PART 4

   APPEARANCE
   BRANDING PREVIEW
   PRIMARY COLOR
   PORTAL TITLE
   LOGO PREVIEW
   THEME PREVIEW
   SIDEBAR PREVIEW
   NOTIFICATION SETTINGS
========================================================= */


/* =========================================================
   APPEARANCE DEFAULTS
========================================================= */

const APPEARANCE_DEFAULTS = {

    portalTitle:
        "CampusConnect",

    primaryColor:
        "#0757c9",

    interfaceTheme:
        "light",

    sidebarDisplay:
        "expanded"

};


/* =========================================================
   GET APPEARANCE ELEMENTS
========================================================= */

function getAppearanceElements() {

    return {

        portalTitle:
            document.getElementById(
                "portalTitle"
            ),

        primaryColor:
            document.getElementById(
                "primaryColor"
            ),

        primaryColorText:
            document.getElementById(
                "primaryColorText"
            ),

        collegeLogo:
            document.getElementById(
                "collegeLogo"
            ),

        interfaceTheme:
            document.getElementById(
                "interfaceTheme"
            ),

        sidebarDisplay:
            document.getElementById(
                "sidebarDisplay"
            )

    };

}


/* =========================================================
   CHECK HEX COLOR
========================================================= */

function isValidHexColor(

    value

) {

    if (!value) {

        return false;

    }


    return /^#[0-9A-Fa-f]{6}$/.test(
        value
    );

}


/* =========================================================
   NORMALIZE COLOR
========================================================= */

function normalizeHexColor(

    value

) {

    if (!value) {

        return APPEARANCE_DEFAULTS.primaryColor;

    }


    let color =
        value.trim();


    /*
     * Convert #abc into #aabbcc.
     */

    if (
        /^#[0-9A-Fa-f]{3}$/.test(
            color
        )
    ) {

        color =
            "#" +

            color
                .substring(1)
                .split("")
                .map(
                    character =>
                        character + character
                )
                .join("");

    }


    /*
     * Add # when a user enters
     * a six-character hexadecimal value.
     */

    if (
        /^[0-9A-Fa-f]{6}$/.test(
            color
        )
    ) {

        color =
            "#" + color;

    }


    return isValidHexColor(
        color
    )

        ? color.toLowerCase()

        : APPEARANCE_DEFAULTS.primaryColor;

}


/* =========================================================
   UPDATE PRIMARY COLOR
========================================================= */

function updatePrimaryColor(

    color

) {

    const normalizedColor =
        normalizeHexColor(
            color
        );


    const appearance =
        getAppearanceElements();


    /*
     * Update color picker.
     */

    if (
        appearance.primaryColor
    ) {

        appearance.primaryColor.value =
            normalizedColor;

    }


    /*
     * Update text color field.
     */

    if (
        appearance.primaryColorText
    ) {

        appearance.primaryColorText.value =
            normalizedColor;

    }


    /*
     * Update the preview.
     */

    const preview =
        document.querySelector(
            ".appearance-preview"
        );


    if (preview) {

        preview.style.setProperty(
            "--preview-primary",
            normalizedColor
        );

    }


    /*
     * Also update the preview root
     * if the class is different.
     */

    document.documentElement.style
        .setProperty(
            "--settings-preview-primary",
            normalizedColor
        );

}


/* =========================================================
   UPDATE PORTAL TITLE PREVIEW
========================================================= */

function updatePortalTitlePreview(

    title

) {

    const preview =
        document.querySelector(
            ".preview-content h3"
        );


    if (!preview) {

        return;

    }


    const cleanTitle =
        String(
            title || ""
        ).trim();


    preview.textContent =
        cleanTitle ||
        APPEARANCE_DEFAULTS.portalTitle;

}


/* =========================================================
   UPDATE LOGO PREVIEW
========================================================= */

function updateLogoPreview(

    fileInput

) {

    if (!fileInput) {

        return;

    }


    const file =
        fileInput.files &&
        fileInput.files[0];


    if (!file) {

        return;

    }


    /*
     * Only image files are accepted.
     */

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        fileInput.value = "";


        const section =
            getSectionFromControl(
                fileInput
            );


        if (section) {

            showSettingsError(

                section,

                "Please select a valid image file."

            );

        }


        return;

    }


    const previewLogo =
        document.querySelector(
            ".preview-logo img"
        );


    if (!previewLogo) {

        return;

    }


    /*
     * FileReader creates a temporary
     * browser-side preview.
     *
     * It does NOT upload the image.
     */

    const reader =
        new FileReader();


    reader.onload = function (

        event

    ) {

        previewLogo.src =
            event.target.result;

    };


    reader.onerror = function () {

        console.error(
            "Unable to preview logo."
        );

    };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   GET SECTION FROM CONTROL
========================================================= */

function getSectionFromControl(

    control

) {

    if (!control) {

        return null;

    }


    return control.closest(
        ".settings-section"
    );

}


/* =========================================================
   RESET LOGO PREVIEW
========================================================= */

function resetLogoPreview() {

    const previewLogo =
        document.querySelector(
            ".preview-logo img"
        );


    if (!previewLogo) {

        return;

    }


    /*
     * Restore the original college logo
     * used by CampusConnect.
     */

    previewLogo.src =
        "../../Assets/college-logo.jpg";

}


/* =========================================================
   UPDATE BRANDING PREVIEW
========================================================= */

function updateBrandingPreview() {

    const appearance =
        getAppearanceElements();


    /*
     * Portal title
     */

    if (
        appearance.portalTitle
    ) {

        updatePortalTitlePreview(

            appearance.portalTitle.value

        );

    }


    /*
     * Primary color
     */

    if (
        appearance.primaryColor
    ) {

        updatePrimaryColor(

            appearance.primaryColor.value

        );

    }


    /*
     * Theme
     */

    if (
        appearance.interfaceTheme
    ) {

        updateInterfaceTheme(

            appearance.interfaceTheme.value

        );

    }


    /*
     * Sidebar
     */

    if (
        appearance.sidebarDisplay
    ) {

        updateSidebarPreview(

            appearance.sidebarDisplay.value

        );

    }

}


/* =========================================================
   UPDATE INTERFACE THEME
========================================================= */

function updateInterfaceTheme(theme) {
    
    if (!theme) {
        theme = "light";
    }
    
    
    /*
     * Save the selected theme globally.
     */
    
    localStorage.setItem(
        "campusconnect-theme",
        theme
    );
    
    
    /*
     * Use the global theme manager when
     * available.
     */
    
    if (
        window.CampusConnectTheme &&
        typeof window.CampusConnectTheme.setTheme === "function"
    ) {
        
        window.CampusConnectTheme.setTheme(
            theme
        );
        
        return;
        
    }
    
    
    /*
     * Fallback:
     * Apply the theme directly if theme.js
     * is unavailable.
     */
    
    let finalTheme = theme;
    
    
    if (theme === "system") {
        
        finalTheme =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches ?
            "dark" :
            "light";
        
    }
    
    
    if (
        finalTheme !== "dark" &&
        finalTheme !== "light"
    ) {
        
        finalTheme = "light";
        
    }
    
    
    document.documentElement.setAttribute(
        "data-theme",
        finalTheme
    );
    
}
/* =========================================================
   LOAD SAVED INTERFACE THEME
========================================================= */

function loadSavedInterfaceTheme() {
    
    const appearance =
        getAppearanceElements();
    
    
    if (!appearance.interfaceTheme) {
        
        return;
        
    }
    
    
    const savedTheme =
        localStorage.getItem(
            "campusconnect-theme"
        );
    
    
    /*
     * If a theme was already saved,
     * synchronize the dropdown with it.
     */
    
    if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "system"
    ) {
        
        appearance.interfaceTheme.value =
            savedTheme;
        
        return;
        
    }
    
    
    /*
     * No theme has been saved yet.
     *
     * Use the current dropdown value
     * and save it.
     */
    
    const currentTheme =
        appearance.interfaceTheme.value ||
        APPEARANCE_DEFAULTS.interfaceTheme;
    
    
    appearance.interfaceTheme.value =
        currentTheme;
    
    
    updateInterfaceTheme(
        currentTheme
    );
    
}
/* =========================================================
   UPDATE SIDEBAR PREVIEW
========================================================= */

function updateSidebarPreview(

    sidebarMode

) {

    const preview =
        document.querySelector(
            ".appearance-preview"
        );


    if (!preview) {

        return;

    }


    preview.classList.remove(
        "preview-sidebar-expanded",
        "preview-sidebar-collapsed",
        "preview-sidebar-hidden"
    );


    switch (sidebarMode) {

        case "collapsed":

            preview.classList.add(
                "preview-sidebar-collapsed"
            );

            break;


        case "hidden":

            preview.classList.add(
                "preview-sidebar-hidden"
            );

            break;


        case "expanded":

        default:

            preview.classList.add(
                "preview-sidebar-expanded"
            );

            break;

    }

}


/* =========================================================
   COLOR PICKER EVENTS
========================================================= */

function initializeColorPicker() {

    const appearance =
        getAppearanceElements();


    if (
        appearance.primaryColor
    ) {

        appearance.primaryColor.addEventListener(

            "input",

            function () {

                updatePrimaryColor(
                    this.value
                );

            }

        );


        appearance.primaryColor.addEventListener(

            "change",

            function () {

                updatePrimaryColor(
                    this.value
                );

            }

        );

    }


    if (
        appearance.primaryColorText
    ) {

        appearance.primaryColorText.addEventListener(

            "input",

            function () {

                const value =
                    this.value.trim();


                if (
                    isValidHexColor(
                        value
                    )
                ) {

                    updatePrimaryColor(
                        value
                    );

                }

            }

        );


        appearance.primaryColorText.addEventListener(

            "blur",

            function () {

                const normalized =
                    normalizeHexColor(
                        this.value
                    );


                updatePrimaryColor(
                    normalized
                );

            }

        );

    }

}


/* =========================================================
   PORTAL TITLE EVENTS
========================================================= */

function initializePortalTitlePreview() {

    const appearance =
        getAppearanceElements();


    if (
        !appearance.portalTitle
    ) {

        return;

    }


    appearance.portalTitle.addEventListener(

        "input",

        function () {

            updatePortalTitlePreview(
                this.value
            );

        }

    );

}


/* =========================================================
   LOGO INPUT EVENTS
========================================================= */

function initializeLogoPreview() {

    const appearance =
        getAppearanceElements();


    if (
        !appearance.collegeLogo
    ) {

        return;

    }


    appearance.collegeLogo.addEventListener(

        "change",

        function () {

            updateLogoPreview(
                this
            );

        }

    );

}


/* =========================================================
   THEME EVENTS
========================================================= */

function initializeThemePreview() {

    const appearance =
        getAppearanceElements();


    if (
        !appearance.interfaceTheme
    ) {

        return;

    }


    appearance.interfaceTheme.addEventListener(

        "change",

        function () {

            updateInterfaceTheme(
                this.value
            );

        }

    );

}


/* =========================================================
   SIDEBAR EVENTS
========================================================= */

function initializeSidebarPreview() {

    const appearance =
        getAppearanceElements();


    if (
        !appearance.sidebarDisplay
    ) {

        return;

    }


    appearance.sidebarDisplay.addEventListener(

        "change",

        function () {

            updateSidebarPreview(
                this.value
            );

        }

    );

}


/* =========================================================
   NOTIFICATION TYPE MANAGEMENT
========================================================= */

function getSelectedNotificationTypes() {

    const checkboxes =
        document.querySelectorAll(
            'input[name="notificationType"]:checked'
        );


    return Array.from(
        checkboxes
    ).map(

        checkbox =>
            checkbox.value

    );

}


/* =========================================================
   NOTIFICATION AUDIENCE
========================================================= */

function getSelectedNotificationAudience() {

    const selected =
        document.querySelector(
            'input[name="notificationAudience"]:checked'
        );


    return selected
        ? selected.value
        : "";

}


/* =========================================================
   NOTIFICATION SETTINGS PREVIEW
========================================================= */

function updateNotificationSettingsState() {

    const globalNotifications =
        document.getElementById(
            "globalNotifications"
        );


    const emailNotifications =
        document.getElementById(
            "emailNotifications"
        );


    /*
     * If global notifications are disabled,
     * notification types are visually disabled.
     */

    const notificationTypes =
        document.querySelectorAll(
            'input[name="notificationType"]'
        );


    if (
        globalNotifications
    ) {

        notificationTypes.forEach(

            checkbox => {

                checkbox.disabled =
                    !globalNotifications.checked;

            }

        );

    }


    /*
     * Email notifications can remain
     * independently configurable.
     */

    if (
        emailNotifications
    ) {

        emailNotifications
            .setAttribute(
                "aria-checked",
                emailNotifications.checked
                    ? "true"
                    : "false"
            );

    }

}


/* =========================================================
   NOTIFICATION EVENTS
========================================================= */

function initializeNotificationSettings() {

    const globalNotifications =
        document.getElementById(
            "globalNotifications"
        );


    const emailNotifications =
        document.getElementById(
            "emailNotifications"
        );


    if (
        globalNotifications
    ) {

        globalNotifications.addEventListener(

            "change",

            function () {

                updateNotificationSettingsState();

            }

        );

    }


    if (
        emailNotifications
    ) {

        emailNotifications.addEventListener(

            "change",

            function () {

                updateNotificationSettingsState();

            }

        );

    }


    document
        .querySelectorAll(
            'input[name="notificationType"]'
        )
        .forEach(

            checkbox => {

                checkbox.addEventListener(

                    "change",

                    function () {

                        /*
                         * Keep the notification
                         * selection available for
                         * the API payload.
                         */

                        const selectedTypes =
                            getSelectedNotificationTypes();


                        document.dispatchEvent(

                            new CustomEvent(
                                "campusconnect:notificationTypesChanged",
                                {
                                    detail: {
                                        types:
                                            selectedTypes
                                    }
                                }
                            )

                        );

                    }

                );

            }

        );


    document
        .querySelectorAll(
            'input[name="notificationAudience"]'
        )
        .forEach(

            radio => {

                radio.addEventListener(

                    "change",

                    function () {

                        document.dispatchEvent(

                            new CustomEvent(
                                "campusconnect:notificationAudienceChanged",
                                {
                                    detail: {
                                        audience:
                                            getSelectedNotificationAudience()
                                    }
                                }
                            )

                        );

                    }

                );

            }

        );


    updateNotificationSettingsState();

}


/* =========================================================
   HANDLE SETTINGS RESET
========================================================= */

function initializeAppearanceResetListener() {

    document.addEventListener(

        "campusconnect:settingsReset",

        function (event) {

            const sectionId =
                event.detail?.sectionId;


            if (
                sectionId !== "appearance"
            ) {

                if (
                    sectionId ===
                    "notifications"
                ) {

                    updateNotificationSettingsState();

                }

                return;

            }


            /*
             * Restore all appearance
             * previews after the controls
             * have been reset.
             */

            updateBrandingPreview();
            resetLogoPreview();
        }
    );
}
function initializeAppearanceSettings() {
    initializeColorPicker();
    initializePortalTitlePreview();
    initializeLogoPreview();
    initializeThemePreview();
    initializeSidebarPreview();
    initializeAppearanceResetListener();
    loadSavedInterfaceTheme();
    updateBrandingPreview();
}

/* =========================================================
   PART 4 INITIALIZATION
========================================================= */

function initializePart4() {

    initializeAppearanceSettings();

    initializeNotificationSettings();

}


/* =========================================================
   DOM READY — PART 4
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializePart4();

    }

);
/* =========================================================
   CAMPUSCONNECT
   ADMIN SYSTEM SETTINGS
   SYSTEM SETTINGS JS — PART 5

   BACKUP & DATA
   DATA EXPORT
   SYSTEM INFORMATION
   BACKEND / DATABASE / API / STORAGE STATUS
   SYSTEM CHECK
   CLEAR SYSTEM CACHE
========================================================= */


/* =========================================================
   BACKUP CONFIGURATION
========================================================= */

const BACKUP_CONFIG = {

    endpoint:
        CONFIG.ENDPOINTS.backup,

    createEndpoint:
        "/admin/settings/backup/create",

    historyEndpoint:
        "/admin/settings/backup/history",

    exportEndpoints: {

        students:
            "/admin/settings/export/students",

        faculty:
            "/admin/settings/export/faculty",

        academics:
            "/admin/settings/export/academics",

        reports:
            "/admin/settings/export/reports"

    }

};


/* =========================================================
   SYSTEM STATUS CONFIGURATION
========================================================= */

const SYSTEM_STATUS_CONFIG = {

    endpoint:
        CONFIG.ENDPOINTS.system,

    checkEndpoint:
        "/admin/settings/system-check",

    clearCacheEndpoint:
        "/admin/settings/cache/clear"

};


/* =========================================================
   STATUS ELEMENTS
========================================================= */

function getSystemStatusElements() {

    return {

        backend:
            document.getElementById(
                "backendStatus"
            ),

        database:
            document.getElementById(
                "databaseStatus"
            ),

        api:
            document.getElementById(
                "apiStatus"
            ),

        storage:
            document.getElementById(
                "storageStatus"
            ),

        systemName:
            document.getElementById(
                "infoSystemName"
            ),

        version:
            document.getElementById(
                "systemVersion"
            ),

        backendInfo:
            document.getElementById(
                "infoBackend"
            ),

        databaseInfo:
            document.getElementById(
                "infoDatabase"
            ),

        apiInfo:
            document.getElementById(
                "infoApiStatus"
            ),

        lastSync:
            document.getElementById(
                "lastSync"
            )

    };

}


/* =========================================================
   BACKUP ELEMENTS
========================================================= */

function getBackupElements() {

    return {

        status:
            document.getElementById(
                "backupStatus"
            ),

        lastBackup:
            document.getElementById(
                "lastBackupText"
            ),

        badge:
            document.getElementById(
                "backupBadge"
            ),

        frequency:
            document.getElementById(
                "backupFrequency"
            ),

        retention:
            document.getElementById(
                "backupRetention"
            ),

        createButton:
            document.getElementById(
                "createBackupBtn"
            ),

        historyButton:
            document.getElementById(
                "backupHistoryBtn"
            )

    };

}


/* =========================================================
   SET STATUS TEXT
========================================================= */

function setStatusText(

    element,

    text,

    state = "neutral"

) {

    if (!element) {

        return;

    }


    element.textContent =
        text;


    element.classList.remove(

        "status-success",
        "status-warning",
        "status-error",
        "status-neutral",
        "online",
        "offline",
        "pending"

    );


    element.classList.add(

        `status-${state}`

    );

}


/* =========================================================
   INITIAL SYSTEM STATUS
========================================================= */

function initializeSystemStatus() {

    const elements =
        getSystemStatusElements();


    /*
     * Do not display fake "Online" or
     * "Connected" values.
     *
     * Until the Java backend reports the
     * real state, the portal remains in
     * an awaiting state.
     */

    setStatusText(

        elements.backend,

        "Awaiting Backend",

        "neutral"

    );


    setStatusText(

        elements.database,

        "Awaiting Data",

        "neutral"

    );


    setStatusText(

        elements.api,

        "Not Connected",

        "warning"

    );


    setStatusText(

        elements.storage,

        "Awaiting Data",

        "neutral"

    );


    if (elements.backendInfo) {

        elements.backendInfo.textContent =
            "Awaiting Java backend";

    }


    if (elements.databaseInfo) {

        elements.databaseInfo.textContent =
            "Awaiting MySQL connection";

    }


    if (elements.apiInfo) {

        elements.apiInfo.textContent =
            "Awaiting REST API";

    }


    if (elements.lastSync) {

        elements.lastSync.textContent =
            "Not synchronized";

    }

}


/* =========================================================
   APPLY REAL SYSTEM STATUS
========================================================= */

function applySystemStatus(

    data

) {

    if (!data) {

        return;

    }


    const elements =
        getSystemStatusElements();


    /*
     * Backend
     */

    if (
        data.backend &&
        elements.backend
    ) {

        setStatusText(

            elements.backend,

            data.backend.status ||
            "Unknown",

            normalizeStatusState(
                data.backend.state
            )

        );

    }


    /*
     * Database
     */

    if (
        data.database &&
        elements.database
    ) {

        setStatusText(

            elements.database,

            data.database.status ||
            "Unknown",

            normalizeStatusState(
                data.database.state
            )

        );

    }


    /*
     * API
     */

    if (
        data.api &&
        elements.api
    ) {

        setStatusText(

            elements.api,

            data.api.status ||
            "Unknown",

            normalizeStatusState(
                data.api.state
            )

        );

    }


    /*
     * Storage
     */

    if (
        data.storage &&
        elements.storage
    ) {

        setStatusText(

            elements.storage,

            data.storage.status ||
            "Unknown",

            normalizeStatusState(
                data.storage.state
            )

        );

    }


    /*
     * Detailed platform information
     */

    if (
        elements.systemName &&
        data.systemName
    ) {

        elements.systemName.textContent =
            data.systemName;

    }


    if (
        elements.version &&
        data.version
    ) {

        elements.version.textContent =
            data.version;

    }


    if (
        elements.backendInfo &&
        data.backendInfo
    ) {

        elements.backendInfo.textContent =
            data.backendInfo;

    }


    if (
        elements.databaseInfo &&
        data.databaseInfo
    ) {

        elements.databaseInfo.textContent =
            data.databaseInfo;

    }


    if (
        elements.apiInfo &&
        data.apiInfo
    ) {

        elements.apiInfo.textContent =
            data.apiInfo;

    }


    if (
        elements.lastSync &&
        data.lastSync
    ) {

        elements.lastSync.textContent =
            data.lastSync;

    }


    SETTINGS_STATE.backendAvailable =
        Boolean(
            data.backendAvailable
        );

}


/* =========================================================
   NORMALIZE STATUS STATE
========================================================= */

function normalizeStatusState(

    state

) {

    if (!state) {

        return "neutral";

    }


    const normalized =
        String(
            state
        ).toLowerCase();


    if (
        normalized === "online" ||
        normalized === "connected" ||
        normalized === "healthy" ||
        normalized === "success" ||
        normalized === "available"
    ) {

        return "success";

    }


    if (
        normalized === "warning" ||
        normalized === "pending" ||
        normalized === "degraded"
    ) {

        return "warning";

    }


    if (
        normalized === "offline" ||
        normalized === "error" ||
        normalized === "failed" ||
        normalized === "unavailable"
    ) {

        return "error";

    }


    return "neutral";

}


/* =========================================================
   RUN SYSTEM CHECK
========================================================= */

async function runSystemCheck() {

    const button =
        document.getElementById(
            "runSystemCheckBtn"
        );


    const section =
        getSettingsSection(
            "system"
        );


    if (button) {

        setButtonLoading(
            button,
            true
        );

    }


    try {

        const response =
            await apiRequest(

                SYSTEM_STATUS_CONFIG.checkEndpoint,

                {

                    method:
                        "GET"

                }

            );


        /*
         * Only use status information
         * actually returned by the backend.
         */

        if (
            response.data
        ) {

            applySystemStatus(
                response.data
            );

        }


        if (section) {

            showSettingsSuccess(

                section,

                response.data?.message ||
                "System check completed."

            );

        }

    } catch (error) {

        console.error(
            "CampusConnect system check error:",
            error
        );


        SETTINGS_STATE.backendAvailable =
            false;


        /*
         * Explicitly show that the system
         * could not be verified.
         */

        initializeSystemStatus();


        if (section) {

            showSettingsError(

                section,

                "System check could not be completed because the backend is not connected."

            );

        }

    } finally {

        if (button) {

            setButtonLoading(
                button,
                false
            );

        }

    }

}


/* =========================================================
   CLEAR SYSTEM CACHE
========================================================= */

async function clearSystemCache() {

    const button =
        document.getElementById(
            "clearSystemCacheBtn"
        );


    const section =
        getSettingsSection(
            "system"
        );


    if (button) {

        setButtonLoading(
            button,
            true
        );

    }


    try {

        const response =
            await apiRequest(

                SYSTEM_STATUS_CONFIG
                    .clearCacheEndpoint,

                {

                    method:
                        "POST"

                }

            );


        if (section) {

            showSettingsSuccess(

                section,

                response.data?.message ||
                "System cache cleared successfully."

            );

        }

    } catch (error) {

        console.error(
            "CampusConnect cache clear error:",
            error
        );


        if (section) {

            showSettingsError(

                section,

                "Cache could not be cleared because the backend is not connected."

            );

        }

    } finally {

        if (button) {

            setButtonLoading(
                button,
                false
            );

        }

    }

}


/* =========================================================
   CREATE BACKUP
========================================================= */

async function createBackup() {

    const elements =
        getBackupElements();


    const section =
        getSettingsSection(
            "backup"
        );


    if (
        elements.createButton
    ) {

        setButtonLoading(

            elements.createButton,

            true

        );

    }


    try {

        const response =
            await apiRequest(

                BACKUP_CONFIG.createEndpoint,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            frequency:
                                elements.frequency
                                    ?.value || "",

                            retention:
                                elements.retention
                                    ?.value || ""

                        })

                }

            );


        /*
         * Update only with real server data.
         */

        if (
            response.data
        ) {

            updateBackupInformation(
                response.data
            );

        }


        if (section) {

            showSettingsSuccess(

                section,

                response.data?.message ||
                "Backup request completed successfully."

            );

        }

    } catch (error) {

        console.error(
            "CampusConnect backup error:",
            error
        );


        if (section) {

            showSettingsError(

                section,

                "Backup could not be created because the backend is not connected."

            );

        }

    } finally {

        if (
            elements.createButton
        ) {

            setButtonLoading(

                elements.createButton,

                false

            );

        }

    }

}


/* =========================================================
   UPDATE BACKUP INFORMATION
========================================================= */

function updateBackupInformation(

    data

) {

    const elements =
        getBackupElements();


    if (
        elements.status &&
        data.status
    ) {

        elements.status.textContent =
            data.status;

    }


    if (
        elements.lastBackup &&
        data.lastBackup
    ) {

        elements.lastBackup.textContent =
            data.lastBackup;

    }


    if (
        elements.badge &&
        data.badge
    ) {

        elements.badge.textContent =
            data.badge;

    }


    if (
        elements.frequency &&
        data.frequency
    ) {

        elements.frequency.value =
            data.frequency;

    }


    if (
        elements.retention &&
        data.retention
    ) {

        elements.retention.value =
            data.retention;

    }

}


/* =========================================================
   OPEN BACKUP HISTORY
========================================================= */

async function openBackupHistory() {

    const button =
        document.getElementById(
            "backupHistoryBtn"
        );


    const section =
        getSettingsSection(
            "backup"
        );


    if (button) {

        setButtonLoading(
            button,
            true
        );

    }


    try {

        const response =
            await apiRequest(

                BACKUP_CONFIG.historyEndpoint,

                {

                    method:
                        "GET"

                }

            );


        /*
         * Store server response for a
         * future backup-history interface.
         */

        document.dispatchEvent(

            new CustomEvent(

                "campusconnect:backupHistoryLoaded",

                {

                    detail: {

                        data:
                            response.data

                    }

                }

            )

        );


        if (section) {

            showSettingsSuccess(

                section,

                response.data?.message ||
                "Backup history loaded."

            );

        }

    } catch (error) {

        console.error(
            "CampusConnect backup history error:",
            error
        );


        if (section) {

            showSettingsError(

                section,

                "Backup history is unavailable because the backend is not connected."

            );

        }

    } finally {

        if (button) {

            setButtonLoading(
                button,
                false
            );

        }

    }

}
/* =========================================================
   INITIALIZE BACKUP BUTTONS
========================================================= */

function initializeBackupSettings() {

    const elements =
        getBackupElements();


    if (
        elements.createButton
    ) {

        elements.createButton.addEventListener(

            "click",

            function () {

                createBackup();

            }

        );

    }


    if (
        elements.historyButton
    ) {
        elements.historyButton.addEventListener(
            "click",
            function () {
                openBackupHistory();
            }
        );
    }
}


/* =========================================================
   INITIALIZE SYSTEM BUTTONS
========================================================= */

function initializeSystemButtons() {

    const systemCheckButton =
        document.getElementById(
            "runSystemCheckBtn"
        );


    const clearCacheButton =
        document.getElementById(
            "clearSystemCacheBtn"
        );


    if (
        systemCheckButton
    ) {

        systemCheckButton.addEventListener(

            "click",

            function () {

                runSystemCheck();

            }

        );

    }


    if (
        clearCacheButton
    ) {

        clearCacheButton.addEventListener(

            "click",

            function () {

                clearSystemCache();

            }

        );

    }

}


/* =========================================================
   PART 5 INITIALIZATION
========================================================= */

function initializePart5() {

    initializeSystemStatus();

    initializeBackupSettings();

    initializeSystemButtons();

}


/* =========================================================
   DOM READY — PART 5
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializePart5();

    }

);
/* =========================================================
   CAMPUSCONNECT
   ADMIN SYSTEM SETTINGS
   SYSTEM SETTINGS JS — PART 6 / FINAL

   LOGOUT
   GLOBAL NOTIFICATIONS
   EXPORT RESPONSE SUPPORT
   FINAL INITIALIZATION
========================================================= */


/* =========================================================
   IMPROVE API REQUEST FOR FILE EXPORTS
========================================================= */

async function apiRequestWithResponseType(

    endpoint,

    options = {}

) {

    const {

        responseType = "json",

        timeout =
            CONFIG.REQUEST_TIMEOUT || 10000,

        ...requestOptions

    } = options;


    const controller =
        new AbortController();


    const timeoutId =
        setTimeout(

            () => {

                controller.abort();

            },

            timeout

        );


    try {

        const url =
            `${CONFIG.API_BASE_URL || ""}${endpoint}`;


        const headers = {

            ...(requestOptions.headers || {})

        };


        /*
         * Only add JSON content type when
         * a JSON body is being sent.
         */

        if (
            requestOptions.body &&
            typeof requestOptions.body ===
                "string"
        ) {

            headers[
                "Content-Type"
            ] =
                "application/json";

        }


        const response =
            await fetch(

                url,

                {

                    ...requestOptions,

                    headers,

                    signal:
                        controller.signal

                }

            );


        if (!response.ok) {

            let errorMessage =
                `Request failed (${response.status}).`;


            try {

                const errorData =
                    await response.json();


                if (
                    errorData?.message
                ) {

                    errorMessage =
                        errorData.message;

                }

            } catch {

                /*
                 * Response was not JSON.
                 */

            }


            throw new Error(
                errorMessage
            );

        }


        if (
            responseType === "blob"
        ) {

            const blob =
                await response.blob();


            return {

                ok: true,

                status:
                    response.status,

                data:
                    blob

            };

        }


        /*
         * Some successful endpoints may
         * intentionally return no body.
         */

        if (
            response.status === 204
        ) {

            return {

                ok: true,

                status:
                    response.status,

                data:
                    null

            };

        }


        const text =
            await response.text();


        let data = null;


        if (text) {

            data =
                safeJsonParse(
                    text
                );

        }


        return {

            ok: true,

            status:
                response.status,

            data

        };

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "The request timed out."
            );

        }


        throw error;

    } finally {

        clearTimeout(
            timeoutId
        );

    }

}


/* =========================================================
   LOGOUT ELEMENTS
========================================================= */

function getLogoutElements() {

    return {

        modal:
            document.getElementById(
                "logoutModal"
            ),

        cancel:
            document.getElementById(
                "cancelLogoutBtn"
            ),

        confirm:
            document.getElementById(
                "confirmLogoutBtn"
            )

    };

}


/* =========================================================
   OPEN LOGOUT MODAL
========================================================= */

function openLogoutModal() {

    const elements =
        getLogoutElements();


    if (!elements.modal) {

        return;

    }


    elements.modal.classList.add(
        "show"
    );


    elements.modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );


    /*
     * Focus the safest action first.
     */

    if (elements.cancel) {

        setTimeout(

            () => {

                elements.cancel.focus();

            },

            50

        );

    }

}


/* =========================================================
   CLOSE LOGOUT MODAL
========================================================= */

function closeLogoutModal() {

    const elements =
        getLogoutElements();


    if (!elements.modal) {

        return;

    }


    elements.modal.classList.remove(
        "show"
    );


    elements.modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   CONFIRM LOGOUT
========================================================= */

function confirmLogout() {

    /*
     * Clear only authentication/session
     * information belonging to CampusConnect.
     *
     * Do not delete settings or application data.
     */

    try {

        sessionStorage.removeItem(
            "campusconnectAuth"
        );

        sessionStorage.removeItem(
            "campusconnectUser"
        );

        sessionStorage.removeItem(
            "campusconnectRole"
        );


        localStorage.removeItem(
            "campusconnectAuth"
        );

        localStorage.removeItem(
            "campusconnectUser"
        );

        localStorage.removeItem(
            "campusconnectRole"
        );

    } catch (error) {

        console.warn(
            "CampusConnect session cleanup warning:",
            error
        );

    }


    /*
     * Redirect to the existing login page.
     */

    window.location.href =
        "../../Login/login.html";

}


/* =========================================================
   INITIALIZE LOGOUT
========================================================= */

function initializeLogout() {

    const elements =
        getLogoutElements();


    /*
     * If the HTML contains a logout
     * button, support it automatically.
     */

    const logoutButtons =
        document.querySelectorAll(

            "#logoutBtn, " +
            '[data-action="logout"]'

        );


    logoutButtons.forEach(

        button => {

            button.addEventListener(

                "click",

                function (event) {

                    event.preventDefault();

                    openLogoutModal();

                }

            );

        }

    );


    if (
        elements.cancel
    ) {

        elements.cancel.addEventListener(

            "click",

            function () {

                closeLogoutModal();

            }

        );

    }


    if (
        elements.confirm
    ) {

        elements.confirm.addEventListener(

            "click",

            function () {

                confirmLogout();

            }

        );

    }


    /*
     * Clicking the modal background
     * closes the confirmation dialog.
     */

    if (
        elements.modal
    ) {

        elements.modal.addEventListener(

            "click",

            function (event) {

                if (
                    event.target ===
                    elements.modal
                ) {

                    closeLogoutModal();

                }

            }

        );

    }


    /*
     * Escape key closes the modal.
     */

    document.addEventListener(

        "keydown",

        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    elements.modal &&
                    elements.modal.classList.contains(
                        "show"
                    )
                ) {

                    closeLogoutModal();

                }

            }

        }

    );

}


/* =========================================================
   GLOBAL NOTIFICATION PLACEHOLDER
========================================================= */

function getGlobalNotificationPlaceholder() {

    return document.getElementById(
        "globalNotificationPlaceholder"
    );

}


/* =========================================================
   OPEN GLOBAL NOTIFICATIONS
========================================================= */

function openGlobalNotifications() {

    const placeholder =
        getGlobalNotificationPlaceholder();


    /*
     * The global notification component
     * belongs to CampusConnect as a whole.
     *
     * This page does not create another
     * notification system.
     */

    if (placeholder) {

        placeholder.classList.add(
            "notification-open"
        );

    }


    /*
     * Notify the existing global
     * notification component, if present.
     */

    document.dispatchEvent(

        new CustomEvent(
            "campusconnect:openNotifications"
        )

    );

}


/* =========================================================
   GLOBAL NOTIFICATION EVENT LISTENER
========================================================= */

function initializeGlobalNotifications() {

    const placeholder =
        getGlobalNotificationPlaceholder();


    if (!placeholder) {

        console.warn(
            "CampusConnect global notification placeholder was not found."
        );

    }


    /*
     * Listen for notification events
     * coming from the shared CampusConnect
     * notification system.
     */

    document.addEventListener(

        "campusconnect:notificationReceived",

        function (event) {

            const notification =
                event.detail;


            if (!notification) {

                return;

            }


            /*
             * Show the global notification
             * indicator without creating
             * a second bell.
             */

            const dot =
                document.getElementById(
                    "notificationDot"
                );


            if (dot) {

                dot.classList.add(
                    "visible"
                );

            }

        }

    );


    /*
     * Allow the shared notification
     * system to clear the indicator.
     */

    document.addEventListener(

        "campusconnect:notificationsRead",

        function () {

            const dot =
                document.getElementById(
                    "notificationDot"
                );


            if (dot) {

                dot.classList.remove(
                    "visible"
                );

            }

        }

    );

}


/* =========================================================
   NOTIFICATION DOT INITIAL STATE
========================================================= */

function initializeNotificationDot() {

    const dot =
        document.getElementById(
            "notificationDot"
        );


    if (!dot) {

        return;

    }


    /*
     * The initial state is neutral.
     *
     * Real unread notifications should
     * be supplied by the backend/global
     * notification component.
     */

    dot.classList.remove(
        "visible"
    );

}


/* =========================================================
   EXPORT FUNCTION PATCH
========================================================= */

async function exportSettingsDataFinal(

    exportType,

    button

) {

    if (!exportType) {

        return;

    }


    const endpoint =
        BACKUP_CONFIG
            .exportEndpoints[
                exportType
            ];


    if (!endpoint) {

        console.error(
            "Unknown export type:",
            exportType
        );

        return;

    }


    const section =
        getSettingsSection(
            "backup"
        );


    if (button) {

        setButtonLoading(
            button,
            true
        );

    }


    try {

        const response =
            await apiRequestWithResponseType(

                endpoint,

                {

                    method:
                        "GET",

                    responseType:
                        "blob"

                }

            );


        if (
            response.data instanceof Blob
        ) {

            const blob =
                response.data;


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                downloadUrl;


            /*
             * The backend may provide a
             * filename through Content-Disposition.
             *
             * If it does not, use a safe
             * CampusConnect filename.
             */

            const extension =
                getBlobExtension(
                    blob
                );


            link.download =
                `campusconnect-${exportType}-export${extension}`;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            setTimeout(

                () => {

                    URL.revokeObjectURL(
                        downloadUrl
                    );

                },

                500

            );

        }


        if (section) {

            showSettingsSuccess(

                section,

                "Data export completed."

            );

        }

    } catch (error) {

        console.error(
            "CampusConnect data export error:",
            error
        );


        if (section) {

            showSettingsError(

                section,

                "Data export could not be completed because the backend is not connected."

            );

        }

    } finally {

        if (button) {

            setButtonLoading(
                button,
                false
            );

        }

    }

}


/* =========================================================
   GET BLOB EXTENSION
========================================================= */

function getBlobExtension(

    blob

) {

    if (!blob) {

        return ".dat";

    }


    const type =
        String(
            blob.type || ""
        ).toLowerCase();


    if (
        type.includes(
            "spreadsheet"
        ) ||
        type.includes(
            "excel"
        )
    ) {

        return ".xlsx";

    }


    if (
        type.includes(
            "csv"
        )
    ) {

        return ".csv";

    }


    if (
        type.includes(
            "pdf"
        )
    ) {

        return ".pdf";

    }


    if (
        type.includes(
            "json"
        )
    ) {

        return ".json";

    }


    if (
        type.includes(
            "zip"
        )
    ) {

        return ".zip";

    }


    return ".dat";

}


/* =========================================================
   REPLACE EXPORT LISTENERS
========================================================= */

function initializeFinalExportButtons() {

    document
        .querySelectorAll(
            "[data-export]"
        )
        .forEach(

            button => {

                const replacement =
                    button.cloneNode(
                        true
                    );


                button.parentNode.replaceChild(

                    replacement,

                    button

                );


                replacement.addEventListener(

                    "click",

                    function () {

                        exportSettingsDataFinal(

                            this.dataset.export,

                            this

                        );

                    }

                );

            }

        );

}


/* =========================================================
   RESTORE APPEARANCE PREVIEW AFTER RESET
========================================================= */

function initializeFinalResetHandling() {

    document.addEventListener(

        "campusconnect:settingsReset",

        function (event) {

            const sectionId =
                event.detail?.sectionId;


            if (
                sectionId ===
                "appearance"
            ) {

                /*
                 * Part 4 already handles this,
                 * but running the preview update
                 * again ensures the final state
                 * is synchronized.
                 */

                if (
                    typeof updateBrandingPreview ===
                    "function"
                ) {

                    updateBrandingPreview();

                }


                if (
                    typeof resetLogoPreview ===
                    "function"
                ) {

                    resetLogoPreview();

                }

            }


            if (
                sectionId ===
                "notifications"
            ) {

                if (
                    typeof updateNotificationSettingsState ===
                    "function"
                ) {

                    updateNotificationSettingsState();

                }

            }

        }

    );

}


/* =========================================================
   INITIALIZE ALL FINAL FEATURES
========================================================= */

function initializePart6() {

    initializeLogout();

    initializeGlobalNotifications();

    initializeNotificationDot();

    initializeFinalExportButtons();

    initializeFinalResetHandling();

}


/* =========================================================
   DOM READY — PART 6
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializePart6();

    }

);