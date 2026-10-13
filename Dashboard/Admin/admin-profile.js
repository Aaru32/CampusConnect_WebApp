/* =========================================================
   CAMPUSCONNECT
   ADMIN PROFILE
   JavaScript — PART 1
========================================================= */


/* =========================================================
   01. CONFIGURATION
========================================================= */

const CONFIG = {

    /*
     * Keep this empty until the Java backend is connected.
     *
     * Example later:
     * API_BASE_URL: "http://localhost:8080/api"
     */
    API_BASE_URL: "",

    PROFILE_ENDPOINT:
        "/admin/profile",

    UPDATE_PROFILE_ENDPOINT:
        "/admin/profile",

    CHANGE_PASSWORD_ENDPOINT:
        "/auth/change-password",

    LOGIN_ACTIVITY_ENDPOINT:
        "/admin/profile/login-activity",

    CURRENT_SESSION_ENDPOINT:
        "/auth/session",

    NOTIFICATION_PREFERENCES_ENDPOINT:
        "/admin/profile/notification-preferences",

    LOGOUT_ENDPOINT:
        "/auth/logout",

    SETTINGS_PAGE:
        "settings.html",

    LOGIN_PAGE:
        "../../Login/login.html"
};


/* =========================================================
   02. GLOBAL STATE
========================================================= */

const state = {

    profile: null,

    profileLoaded: false,

    profileImageUrl: "",

    notificationPreferences: null,

    loginActivity: [],

    currentSession: null,

    activePanel: null,

    isLoadingProfile: false,

    isSavingProfile: false,

    isChangingPassword: false,

    isSavingPreferences: false,

    isLoggingOut: false
};


/* =========================================================
   03. DOM REFERENCES
========================================================= */

const elements = {

    /* Header */
    backButton:
        document.getElementById("backButton"),

    notificationButton:
        document.getElementById("notificationButton"),

    headerAdminIdentity:
        document.getElementById("headerAdminIdentity"),

    headerAdminProfileImage:
        document.getElementById("headerAdminProfileImage"),

    accountDropdown:
        document.getElementById("accountDropdown"),

    profileMenuButton:
        document.getElementById("profileMenuButton"),

    logoutMenuButton:
        document.getElementById("logoutMenuButton"),


    /* Main profile */
    adminProfileImage:
        document.getElementById("adminProfileImage"),

    profileImageEmpty:
        document.getElementById("profileImageEmpty"),

    editProfileImageButton:
        document.getElementById("editProfileImageButton"),

    editProfileButton:
        document.getElementById("editProfileButton"),


    /* Account information */
    editAccountInformationButton:
        document.getElementById(
            "editAccountInformationButton"
        ),

    adminId:
        document.getElementById("adminId"),

    adminFullName:
        document.getElementById("adminFullName"),

    adminEmail:
        document.getElementById("adminEmail"),

    adminPhone:
        document.getElementById("adminPhone"),

    adminDepartment:
        document.getElementById("adminDepartment"),

    adminDesignation:
        document.getElementById("adminDesignation"),

    adminAccountType:
        document.getElementById("adminAccountType"),

    adminDateJoined:
        document.getElementById("adminDateJoined"),

    adminLastLogin:
        document.getElementById("adminLastLogin"),

    adminAccountStatus:
        document.getElementById("adminAccountStatus"),


    /* Security */
    changePasswordButton:
        document.getElementById(
            "changePasswordButton"
        ),

    loginActivityButton:
        document.getElementById(
            "loginActivityButton"
        ),

    currentSessionButton:
        document.getElementById(
            "currentSessionButton"
        ),


    /* Activity */
    viewAllActivityButton:
        document.getElementById(
            "viewAllActivityButton"
        ),

    activityCard:
        document.getElementById("activityCard"),


    /* Preferences */
    notificationPreferencesButton:
        document.getElementById(
            "notificationPreferencesButton"
        ),

    systemSettingsButton:
        document.getElementById(
            "systemSettingsButton"
        ),

    accountInformationButton:
        document.getElementById(
            "accountInformationButton"
        ),


    /* Edit profile panel */
    editProfilePanel:
        document.getElementById(
            "editProfilePanel"
        ),

    editProfileForm:
        document.getElementById(
            "editProfileForm"
        ),

    editFullName:
        document.getElementById(
            "editFullName"
        ),

    editEmail:
        document.getElementById(
            "editEmail"
        ),

    editPhone:
        document.getElementById(
            "editPhone"
        ),

    editDepartment:
        document.getElementById(
            "editDepartment"
        ),

    editDesignation:
        document.getElementById(
            "editDesignation"
        ),

    editProfileError:
        document.getElementById(
            "editProfileError"
        ),

    saveProfileButton:
        document.getElementById(
            "saveProfileButton"
        ),


    /* Change password panel */
    changePasswordPanel:
        document.getElementById(
            "changePasswordPanel"
        ),

    changePasswordForm:
        document.getElementById(
            "changePasswordForm"
        ),

    currentPassword:
        document.getElementById(
            "currentPassword"
        ),

    newPassword:
        document.getElementById(
            "newPassword"
        ),

    confirmPassword:
        document.getElementById(
            "confirmPassword"
        ),

    changePasswordError:
        document.getElementById(
            "changePasswordError"
        ),

    updatePasswordButton:
        document.getElementById(
            "updatePasswordButton"
        ),


    /* Login activity */
    loginActivityPanel:
        document.getElementById(
            "loginActivityPanel"
        ),

    loginActivityContent:
        document.getElementById(
            "loginActivityContent"
        ),


    /* Current session */
    currentSessionPanel:
        document.getElementById(
            "currentSessionPanel"
        ),

    currentSessionContent:
        document.getElementById(
            "currentSessionContent"
        ),


    /* Notification preferences */
    notificationPreferencesPanel:
        document.getElementById(
            "notificationPreferencesPanel"
        ),

    systemNotificationsToggle:
        document.getElementById(
            "systemNotificationsToggle"
        ),

    securityAlertsToggle:
        document.getElementById(
            "securityAlertsToggle"
        ),

    administrativeUpdatesToggle:
        document.getElementById(
            "administrativeUpdatesToggle"
        ),

    saveNotificationPreferencesButton:
        document.getElementById(
            "saveNotificationPreferencesButton"
        ),


    /* Account information panel */
    accountInformationPanel:
        document.getElementById(
            "accountInformationPanel"
        ),

    panelAdminId:
        document.getElementById(
            "panelAdminId"
        ),

    panelAccountType:
        document.getElementById(
            "panelAccountType"
        ),

    panelDepartment:
        document.getElementById(
            "panelDepartment"
        ),

    panelDesignation:
        document.getElementById(
            "panelDesignation"
        ),

    panelAccountStatus:
        document.getElementById(
            "panelAccountStatus"
        ),

    panelDateJoined:
        document.getElementById(
            "panelDateJoined"
        ),

    panelLastLogin:
        document.getElementById(
            "panelLastLogin"
        ),


    /* Logout */
    logoutButton:
        document.getElementById(
            "logoutButton"
        ),

    logoutModal:
        document.getElementById(
            "logoutModal"
        ),

    cancelLogoutButton:
        document.getElementById(
            "cancelLogoutButton"
        ),

    confirmLogoutButton:
        document.getElementById(
            "confirmLogoutButton"
        ),

    logoutDialogMessage:
        document.getElementById(
            "logoutDialogMessage"
        ),


    /* Toast */
    globalToast:
        document.getElementById(
            "globalToast"
        ),

    globalToastIcon:
        document.getElementById(
            "globalToastIcon"
        ),

    globalToastMessage:
        document.getElementById(
            "globalToastMessage"
        )
};


/* =========================================================
   04. INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAdminProfile
);


function initializeAdminProfile() {

    bindEvents();

    initializeInitialStates();

    loadAdminProfile();

    loadNotificationPreferences();
}


/* =========================================================
   05. EVENT BINDING
========================================================= */

function bindEvents() {

    /* -------------------------
       Header
    ------------------------- */

    if (elements.backButton) {

        elements.backButton.addEventListener(
            "click",
            handleBackButton
        );
    }


    if (elements.headerAdminIdentity) {

        elements.headerAdminIdentity.addEventListener(
            "click",
            toggleAccountDropdown
        );
    }


    if (elements.profileMenuButton) {

        elements.profileMenuButton.addEventListener(
            "click",
            handleProfileMenu
        );
    }


    if (elements.logoutMenuButton) {

        elements.logoutMenuButton.addEventListener(
            "click",
            openLogoutModal
        );
    }


    /* -------------------------
       Main profile
    ------------------------- */

    if (elements.editProfileButton) {

        elements.editProfileButton.addEventListener(
            "click",
            openEditProfilePanel
        );
    }


    if (elements.editProfileImageButton) {

        elements.editProfileImageButton.addEventListener(
            "click",
            handleProfileImageEdit
        );
    }


    /* -------------------------
       Account information
    ------------------------- */

    if (elements.editAccountInformationButton) {

        elements.editAccountInformationButton.addEventListener(
            "click",
            openEditProfilePanel
        );
    }


    /* -------------------------
       Security
    ------------------------- */

    if (elements.changePasswordButton) {

        elements.changePasswordButton.addEventListener(
            "click",
            openChangePasswordPanel
        );
    }


    if (elements.loginActivityButton) {

        elements.loginActivityButton.addEventListener(
            "click",
            openLoginActivityPanel
        );
    }


    if (elements.currentSessionButton) {

        elements.currentSessionButton.addEventListener(
            "click",
            openCurrentSessionPanel
        );
    }


    /* -------------------------
       Activity
    ------------------------- */

    if (elements.viewAllActivityButton) {

        elements.viewAllActivityButton.addEventListener(
            "click",
            openLoginActivityPanel
        );
    }


    /* -------------------------
       Preferences
    ------------------------- */

    if (elements.notificationPreferencesButton) {

        elements.notificationPreferencesButton.addEventListener(
            "click",
            openNotificationPreferencesPanel
        );
    }


    if (elements.systemSettingsButton) {

        elements.systemSettingsButton.addEventListener(
            "click",
            openSystemSettings
        );
    }


    if (elements.accountInformationButton) {

        elements.accountInformationButton.addEventListener(
            "click",
            openAccountInformationPanel
        );
    }


    /* -------------------------
       Forms
    ------------------------- */

    if (elements.editProfileForm) {

        elements.editProfileForm.addEventListener(
            "submit",
            handleProfileSubmit
        );
    }


    if (elements.changePasswordForm) {

        elements.changePasswordForm.addEventListener(
            "submit",
            handlePasswordSubmit
        );
    }


    if (
        elements.saveNotificationPreferencesButton
    ) {

        elements.saveNotificationPreferencesButton
            .addEventListener(
                "click",
                handleNotificationPreferencesSave
            );
    }


    /* -------------------------
       Logout
    ------------------------- */

    if (elements.logoutButton) {

        elements.logoutButton.addEventListener(
            "click",
            openLogoutModal
        );
    }


    if (elements.cancelLogoutButton) {

        elements.cancelLogoutButton.addEventListener(
            "click",
            closeLogoutModal
        );
    }


    if (elements.confirmLogoutButton) {

        elements.confirmLogoutButton.addEventListener(
            "click",
            handleLogout
        );
    }


    /* -------------------------
       Password visibility
    ------------------------- */

    document
        .querySelectorAll(
            "[data-password-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                togglePasswordVisibility
            );
        });


    /* -------------------------
       Overlay close buttons
    ------------------------- */

    document
        .querySelectorAll(
            "[data-close-panel]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const panelId =
                        button.dataset.closePanel;

                    closePanel(panelId);
                }
            );
        });


    /* -------------------------
       Logout backdrop
    ------------------------- */

    document
        .querySelectorAll(
            "[data-close-logout]"
        )
        .forEach(element => {

            element.addEventListener(
                "click",
                closeLogoutModal
            );
        });


    /* -------------------------
       Keyboard controls
    ------------------------- */

    document.addEventListener(
        "keydown",
        handleKeyboardControls
    );


    /* -------------------------
       Outside dropdown click
    ------------------------- */

    document.addEventListener(
        "click",
        handleOutsideDropdownClick
    );
}


/* =========================================================
   06. INITIAL STATES
========================================================= */

function initializeInitialStates() {

    closeAllPanels();

    closeAccountDropdown();

    closeLogoutModal();

    setProfileImage("");

    setText(
        elements.adminId,
        "Awaiting account data"
    );

    setText(
        elements.adminFullName,
        "Awaiting account data"
    );

    setText(
        elements.adminEmail,
        "Awaiting account data"
    );

    setText(
        elements.adminPhone,
        "Awaiting account data"
    );

    setText(
        elements.adminDepartment,
        "Awaiting account data"
    );

    setText(
        elements.adminDesignation,
        "Awaiting account data"
    );

    setText(
        elements.adminAccountType,
        "Awaiting account data"
    );

    setText(
        elements.adminDateJoined,
        "Awaiting account data"
    );

    setText(
        elements.adminLastLogin,
        "Awaiting account data"
    );

    setText(
        elements.adminAccountStatus,
        "Awaiting account data"
    );


    if (elements.editProfileError) {

        elements.editProfileError.hidden = true;
        elements.editProfileError.textContent = "";
    }


    if (elements.changePasswordError) {

        elements.changePasswordError.hidden = true;
        elements.changePasswordError.textContent = "";
    }
}


/* =========================================================
   07. BACK BUTTON
========================================================= */

function handleBackButton() {

    /*
     * Return to the actual previous page.
     * If there is no usable history, return to Admin Dashboard.
     */

    if (
        window.history.length > 1 &&
        document.referrer
    ) {

        window.history.back();

        return;
    }

    window.location.href =
        "admin-dashboard.html";
}


/* =========================================================
   08. ACCOUNT DROPDOWN
========================================================= */

function toggleAccountDropdown(event) {

    event.stopPropagation();

    if (!elements.accountDropdown) {
        return;
    }

    const isHidden =
        elements.accountDropdown.hidden;

    elements.accountDropdown.hidden =
        !isHidden;

    if (
        elements.headerAdminIdentity
    ) {

        elements.headerAdminIdentity
            .setAttribute(
                "aria-expanded",
                String(isHidden)
            );
    }
}


function closeAccountDropdown() {

    if (elements.accountDropdown) {

        elements.accountDropdown.hidden = true;
    }

    if (
        elements.headerAdminIdentity
    ) {

        elements.headerAdminIdentity
            .setAttribute(
                "aria-expanded",
                "false"
            );
    }
}


function handleOutsideDropdownClick(event) {

    if (!elements.accountDropdown) {
        return;
    }

    if (
        elements.accountDropdown.hidden
    ) {
        return;
    }

    const clickedInsideHeader =
        elements.headerAdminIdentity &&
        elements.headerAdminIdentity.contains(
            event.target
        );

    const clickedInsideDropdown =
        elements.accountDropdown.contains(
            event.target
        );

    if (
        !clickedInsideHeader &&
        !clickedInsideDropdown
    ) {

        closeAccountDropdown();
    }
}


function handleProfileMenu() {

    closeAccountDropdown();

    closeAllPanels();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   09. PROFILE IMAGE
========================================================= */

function setProfileImage(imageUrl) {

    const validUrl =
        typeof imageUrl === "string" &&
        imageUrl.trim() !== "";

    state.profileImageUrl =
        validUrl
            ? imageUrl.trim()
            : "";


    if (elements.adminProfileImage) {

        elements.adminProfileImage.hidden =
            !validUrl;

        if (validUrl) {

            elements.adminProfileImage.src =
                imageUrl;

        } else {

            elements.adminProfileImage.removeAttribute(
                "src"
            );
        }
    }


    if (elements.headerAdminProfileImage) {

        elements.headerAdminProfileImage.hidden =
            !validUrl;

        if (validUrl) {

            elements.headerAdminProfileImage.src =
                imageUrl;

        } else {

            elements.headerAdminProfileImage
                .removeAttribute("src");
        }
    }


    if (elements.profileImageEmpty) {

        elements.profileImageEmpty.hidden =
            validUrl;
    }
}


function handleProfileImageEdit() {

    /*
     * Image upload is intentionally not faked here.
     *
     * Once the backend/profile-image endpoint is connected,
     * this action can open the real upload/crop workflow.
     */

    showToast(
        "Profile image editing will be connected to the account image service.",
        "info"
    );
}


/* =========================================================
   10. PANEL MANAGEMENT
========================================================= */

function openPanel(panelId) {

    closeAllPanels();

    const panel =
        document.getElementById(panelId);

    if (!panel) {
        return;
    }

    panel.hidden = false;

    state.activePanel = panelId;

    document.body.classList.add(
        "panel-open"
    );


    const firstFocusable =
        panel.querySelector(
            "input, select, textarea, button"
        );

    if (firstFocusable) {

        window.setTimeout(
            () => firstFocusable.focus(),
            50
        );
    }
}


function closePanel(panelId) {

    const panel =
        document.getElementById(panelId);

    if (!panel) {
        return;
    }

    panel.hidden = true;

    if (
        state.activePanel === panelId
    ) {

        state.activePanel = null;
    }

    if (!document.querySelector(
        ".overlay-panel:not([hidden])"
    )) {

        document.body.classList.remove(
            "panel-open"
        );
    }
}


function closeAllPanels() {

    document
        .querySelectorAll(
            ".overlay-panel"
        )
        .forEach(panel => {

            panel.hidden = true;
        });

    state.activePanel = null;

    document.body.classList.remove(
        "panel-open"
    );
}


/* =========================================================
   11. EDIT PROFILE PANEL
========================================================= */

function openEditProfilePanel() {

    closeAccountDropdown();

    populateEditProfileForm();

    clearProfileFormError();

    openPanel(
        "editProfilePanel"
    );
}


function populateEditProfileForm() {

    const profile =
        state.profile || {};


    setInputValue(
        elements.editFullName,
        getProfileValue(
            profile,
            [
                "fullName",
                "name",
                "adminName"
            ]
        )
    );


    setInputValue(
        elements.editEmail,
        getProfileValue(
            profile,
            [
                "email",
                "emailAddress"
            ]
        )
    );


    setInputValue(
        elements.editPhone,
        getProfileValue(
            profile,
            [
                "phone",
                "phoneNumber",
                "mobile"
            ]
        )
    );


    setInputValue(
        elements.editDepartment,
        getProfileValue(
            profile,
            [
                "department",
                "departmentName"
            ]
        )
    );


    setInputValue(
        elements.editDesignation,
        getProfileValue(
            profile,
            [
                "designation",
                "roleTitle"
            ]
        )
    );
}


/* =========================================================
   12. CHANGE PASSWORD PANEL
========================================================= */

function openChangePasswordPanel() {

    closeAccountDropdown();

    clearPasswordForm();

    openPanel(
        "changePasswordPanel"
    );
}


function clearPasswordForm() {

    if (elements.changePasswordForm) {

        elements.changePasswordForm.reset();
    }

    clearPasswordFormError();
}


/* =========================================================
   13. LOGIN ACTIVITY PANEL
========================================================= */

function openLoginActivityPanel() {

    closeAccountDropdown();

    openPanel(
        "loginActivityPanel"
    );

    loadLoginActivity();
}


/* =========================================================
   14. CURRENT SESSION PANEL
========================================================= */

function openCurrentSessionPanel() {

    closeAccountDropdown();

    openPanel(
        "currentSessionPanel"
    );

    loadCurrentSession();
}


/* =========================================================
   15. NOTIFICATION PREFERENCES PANEL
========================================================= */

function openNotificationPreferencesPanel() {

    closeAccountDropdown();

    openPanel(
        "notificationPreferencesPanel"
    );

    applyNotificationPreferences();
}


/* =========================================================
   16. ACCOUNT INFORMATION PANEL
========================================================= */

function openAccountInformationPanel() {

    closeAccountDropdown();

    populateAccountInformationPanel();

    openPanel(
        "accountInformationPanel"
    );
}


/* =========================================================
   17. SYSTEM SETTINGS
========================================================= */

function openSystemSettings() {

    closeAccountDropdown();

    window.location.href =
        CONFIG.SETTINGS_PAGE;
}


/* =========================================================
   18. KEYBOARD CONTROLS
========================================================= */

function handleKeyboardControls(event) {

    if (event.key !== "Escape") {
        return;
    }


    closeAccountDropdown();

    if (state.activePanel) {

        closePanel(
            state.activePanel
        );
    }

    if (
        elements.logoutModal &&
        !elements.logoutModal.hidden
    ) {

        closeLogoutModal();
    }
}


/* =========================================================
   PART 1 COMPLETE
   Continue with PART 2 below this line.
========================================================= */
/* =========================================================
   CAMPUSCONNECT
   ADMIN PROFILE
   JavaScript — PART 2
========================================================= */


/* =========================================================
   19. API HELPERS
========================================================= */

function isBackendConnected() {

    return (
        typeof CONFIG.API_BASE_URL === "string" &&
        CONFIG.API_BASE_URL.trim() !== ""
    );
}


function buildApiUrl(endpoint) {

    const base =
        CONFIG.API_BASE_URL.trim();

    const path =
        endpoint.startsWith("/")
            ? endpoint
            : `/${endpoint}`;

    return `${base}${path}`;
}


async function apiRequest(
    endpoint,
    options = {}
) {

    if (!isBackendConnected()) {

        return {
            connected: false,
            success: false,
            data: null
        };
    }


    const requestOptions = {
        method: options.method || "GET",
        credentials: "include",
        headers: {
            "Accept": "application/json",
            ...(options.headers || {})
        }
    };


    if (options.body !== undefined) {

        requestOptions.headers[
            "Content-Type"
        ] = "application/json";

        requestOptions.body =
            JSON.stringify(options.body);
    }


    const response =
        await fetch(
            buildApiUrl(endpoint),
            requestOptions
        );


    let data = null;

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data = await response.json();

    } else {

        const text =
            await response.text();

        data = text
            ? { message: text }
            : null;
    }


    if (!response.ok) {

        const error =
            new Error(
                data?.message ||
                data?.error ||
                `Request failed with status ${response.status}.`
            );

        error.status =
            response.status;

        error.data =
            data;

        throw error;
    }


    return {
        connected: true,
        success: true,
        data
    };
}


/* =========================================================
   20. LOAD ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

    if (state.isLoadingProfile) {
        return;
    }

    state.isLoadingProfile = true;


    /*
     * No backend means there is no real account data
     * available yet. Nothing fake is inserted.
     */

    if (!isBackendConnected()) {

        state.isLoadingProfile = false;

        renderBackendUnavailableProfile();

        return;
    }


    try {

        const result =
            await apiRequest(
                CONFIG.PROFILE_ENDPOINT
            );


        const profile =
            normalizeProfileResponse(
                result.data
            );


        if (!profile) {

            throw new Error(
                "The profile response did not contain account data."
            );
        }


        state.profile =
            profile;

        state.profileLoaded =
            true;


        renderAdminProfile(
            profile
        );


    } catch (error) {

        console.error(
            "Failed to load admin profile:",
            error
        );


        state.profileLoaded =
            false;


        renderProfileLoadError(
            error
        );


        showToast(
            "Unable to load administrator account data.",
            "error"
        );

    } finally {

        state.isLoadingProfile =
            false;
    }
}


/* =========================================================
   21. PROFILE RESPONSE NORMALIZATION
========================================================= */

function normalizeProfileResponse(response) {

    if (!response) {
        return null;
    }


    /*
     * Supports common backend response structures:
     *
     * {
     *   "id": "...",
     *   "fullName": "...",
     *   ...
     * }
     *
     * OR
     *
     * {
     *   "data": {
     *      ...
     *   }
     * }
     */


    let profile =
        response;


    if (
        response.data &&
        typeof response.data === "object"
    ) {

        profile =
            response.data;
    }


    if (
        profile.profile &&
        typeof profile.profile === "object"
    ) {

        profile =
            profile.profile;
    }


    return profile;
}


/* =========================================================
   22. RENDER ADMIN PROFILE
========================================================= */

function renderAdminProfile(profile) {

    const fullName =
        getProfileValue(
            profile,
            [
                "fullName",
                "name",
                "adminName"
            ]
        );


    const designation =
        getProfileValue(
            profile,
            [
                "designation",
                "roleTitle",
                "position"
            ]
        );


    const department =
        getProfileValue(
            profile,
            [
                "department",
                "departmentName"
            ]
        );


    const email =
        getProfileValue(
            profile,
            [
                "email",
                "emailAddress"
            ]
        );


    const phone =
        getProfileValue(
            profile,
            [
                "phone",
                "phoneNumber",
                "mobile"
            ]
        );


    const adminId =
        getProfileValue(
            profile,
            [
                "adminId",
                "id",
                "userId"
            ]
        );


    const accountType =
        getProfileValue(
            profile,
            [
                "accountType",
                "role",
                "userRole"
            ]
        );


    const dateJoined =
        getProfileValue(
            profile,
            [
                "dateJoined",
                "joinedDate",
                "createdAt"
            ]
        );


    const lastLogin =
        getProfileValue(
            profile,
            [
                "lastLogin",
                "lastLoginAt"
            ]
        );


    const accountStatus =
        getProfileValue(
            profile,
            [
                "accountStatus",
                "status"
            ]
        );


    setText(
        elements.adminId,
        formatValue(adminId)
    );


    setText(
        elements.adminFullName,
        formatValue(fullName)
    );


    setText(
        elements.adminEmail,
        formatValue(email)
    );


    setText(
        elements.adminPhone,
        formatValue(phone)
    );


    setText(
        elements.adminDepartment,
        formatValue(department)
    );


    setText(
        elements.adminDesignation,
        formatValue(designation)
    );


    setText(
        elements.adminAccountType,
        formatValue(accountType)
    );


    setText(
        elements.adminDateJoined,
        formatDateValue(dateJoined)
    );


    setText(
        elements.adminLastLogin,
        formatDateValue(lastLogin)
    );


    setText(
        elements.adminAccountStatus,
        formatValue(accountStatus)
    );


    /*
     * Update visible profile heading.
     * These IDs/classes are checked before changing anything
     * so the script remains safe if the markup is adjusted.
     */

    const profileName =
        document.getElementById(
            "profileDisplayName"
        );


    const profileRole =
        document.getElementById(
            "profileDisplayRole"
        );


    const profileDescription =
        document.getElementById(
            "profileDescription"
        );


    if (profileName) {

        setText(
            profileName,
            formatValue(fullName)
        );
    }


    if (profileRole) {

        setText(
            profileRole,
            formatValue(designation)
        );
    }


    if (profileDescription) {

        const description =
            getProfileValue(
                profile,
                [
                    "description",
                    "profileDescription"
                ]
            );


        if (description) {

            setText(
                profileDescription,
                description
            );

        } else {

            profileDescription.textContent =
                "";
        }
    }


    /*
     * IMPORTANT:
     * Only use an image URL actually returned by the backend.
     * No generic/default avatar is created.
     */

    const imageUrl =
        getProfileValue(
            profile,
            [
                "profileImageUrl",
                "profilePicture",
                "profileImage",
                "imageUrl"
            ]
        );


    setProfileImage(
        imageUrl
    );
}


/* =========================================================
   23. BACKEND UNAVAILABLE STATE
========================================================= */

function renderBackendUnavailableProfile() {

    const unavailableText =
        "Awaiting backend account data";


    setText(
        elements.adminId,
        unavailableText
    );


    setText(
        elements.adminFullName,
        unavailableText
    );


    setText(
        elements.adminEmail,
        unavailableText
    );


    setText(
        elements.adminPhone,
        unavailableText
    );


    setText(
        elements.adminDepartment,
        unavailableText
    );


    setText(
        elements.adminDesignation,
        unavailableText
    );


    setText(
        elements.adminAccountType,
        unavailableText
    );


    setText(
        elements.adminDateJoined,
        unavailableText
    );


    setText(
        elements.adminLastLogin,
        unavailableText
    );


    setText(
        elements.adminAccountStatus,
        unavailableText
    );


    setProfileImage("");


    showToast(
        "Administrator account data will appear after the backend is connected.",
        "info"
    );
}


/* =========================================================
   24. PROFILE LOAD ERROR
========================================================= */

function renderProfileLoadError(error) {

    const message =
        error?.message ||
        "Account data could not be loaded.";


    const errorText =
        `Unable to load account data: ${message}`;


    setText(
        elements.adminId,
        errorText
    );


    setText(
        elements.adminFullName,
        errorText
    );


    setProfileImage("");
}


/* =========================================================
   25. PROFILE FORM SUBMISSION
========================================================= */

async function handleProfileSubmit(event) {

    event.preventDefault();


    if (state.isSavingProfile) {
        return;
    }


    clearProfileFormError();


    const formData =
        collectProfileFormData();


    const validationError =
        validateProfileForm(
            formData
        );


    if (validationError) {

        showProfileFormError(
            validationError
        );

        return;
    }


    /*
     * Do not pretend to save account data when
     * the Java backend is not connected.
     */

    if (!isBackendConnected()) {

        showProfileFormError(
            "The backend account service is not connected yet. No server-side profile data was changed."
        );

        return;
    }


    state.isSavingProfile =
        true;


    setButtonLoading(
        elements.saveProfileButton,
        true,
        "Saving..."
    );


    try {

        const result =
            await apiRequest(
                CONFIG.UPDATE_PROFILE_ENDPOINT,
                {
                    method: "PUT",
                    body: formData
                }
            );


        const updatedProfile =
            normalizeProfileResponse(
                result.data
            );


        if (updatedProfile) {

            state.profile =
                updatedProfile;

            state.profileLoaded =
                true;

            renderAdminProfile(
                updatedProfile
            );

        } else {

            /*
             * If the server does not return the complete
             * profile, reload it from the backend.
             */

            await loadAdminProfile();
        }


        closePanel(
            "editProfilePanel"
        );


        showToast(
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Profile update failed:",
            error
        );


        showProfileFormError(
            error?.message ||
            "The profile could not be updated."
        );


    } finally {

        state.isSavingProfile =
            false;

        setButtonLoading(
            elements.saveProfileButton,
            false
        );
    }
}


/* =========================================================
   26. COLLECT PROFILE FORM DATA
========================================================= */

function collectProfileFormData() {

    return {

        fullName:
            getInputValue(
                elements.editFullName
            ),

        email:
            getInputValue(
                elements.editEmail
            ),

        phone:
            getInputValue(
                elements.editPhone
            ),

        department:
            getInputValue(
                elements.editDepartment
            ),

        designation:
            getInputValue(
                elements.editDesignation
            )
    };
}


/* =========================================================
   27. VALIDATE PROFILE FORM
========================================================= */

function validateProfileForm(data) {

    if (!data.fullName) {

        return "Full name is required.";
    }


    if (
        data.email &&
        !isValidEmail(data.email)
    ) {

        return "Please enter a valid email address.";
    }


    if (
        data.phone &&
        !isValidPhone(data.phone)
    ) {

        return "Please enter a valid phone number.";
    }


    return "";
}


/* =========================================================
   28. ACCOUNT INFORMATION PANEL
========================================================= */

function populateAccountInformationPanel() {

    const profile =
        state.profile || {};


    setText(
        elements.panelAdminId,
        formatValue(
            getProfileValue(
                profile,
                [
                    "adminId",
                    "id",
                    "userId"
                ]
            )
        )
    );


    setText(
        elements.panelAccountType,
        formatValue(
            getProfileValue(
                profile,
                [
                    "accountType",
                    "role",
                    "userRole"
                ]
            )
        )
    );


    setText(
        elements.panelDepartment,
        formatValue(
            getProfileValue(
                profile,
                [
                    "department",
                    "departmentName"
                ]
            )
        )
    );


    setText(
        elements.panelDesignation,
        formatValue(
            getProfileValue(
                profile,
                [
                    "designation",
                    "roleTitle"
                ]
            )
        )
    );


    setText(
        elements.panelAccountStatus,
        formatValue(
            getProfileValue(
                profile,
                [
                    "accountStatus",
                    "status"
                ]
            )
        )
    );


    setText(
        elements.panelDateJoined,
        formatDateValue(
            getProfileValue(
                profile,
                [
                    "dateJoined",
                    "joinedDate",
                    "createdAt"
                ]
            )
        )
    );


    setText(
        elements.panelLastLogin,
        formatDateValue(
            getProfileValue(
                profile,
                [
                    "lastLogin",
                    "lastLoginAt"
                ]
            )
        )
    );
}


/* =========================================================
   29. LOAD LOGIN ACTIVITY
========================================================= */

async function loadLoginActivity() {

    if (
        !elements.loginActivityContent
    ) {
        return;
    }


    if (!isBackendConnected()) {

        renderUnavailablePanel(
            elements.loginActivityContent,
            "Login activity is unavailable until the backend authentication service is connected."
        );

        return;
    }


    renderPanelLoading(
        elements.loginActivityContent,
        "Loading login activity..."
    );


    try {

        const result =
            await apiRequest(
                CONFIG.LOGIN_ACTIVITY_ENDPOINT
            );


        const records =
            normalizeArrayResponse(
                result.data
            );


        state.loginActivity =
            records;


        renderLoginActivity(
            records
        );


    } catch (error) {

        console.error(
            "Login activity error:",
            error
        );


        renderPanelError(
            elements.loginActivityContent,
            error?.message ||
            "Login activity could not be loaded."
        );
    }
}


/* =========================================================
   30. NORMALIZE ARRAY RESPONSE
========================================================= */

function normalizeArrayResponse(response) {

    if (Array.isArray(response)) {

        return response;
    }


    if (
        response &&
        Array.isArray(response.data)
    ) {

        return response.data;
    }


    if (
        response &&
        Array.isArray(response.records)
    ) {

        return response.records;
    }


    if (
        response &&
        Array.isArray(response.items)
    ) {

        return response.items;
    }


    return [];
}


/* =========================================================
   31. RENDER LOGIN ACTIVITY
========================================================= */

function renderLoginActivity(records) {

    if (
        !elements.loginActivityContent
    ) {
        return;
    }


    if (!records.length) {

        renderUnavailablePanel(
            elements.loginActivityContent,
            "No login activity records are available."
        );

        return;
    }


    const fragment =
        document.createDocumentFragment();


    records.forEach(record => {

        const item =
            document.createElement("div");


        item.className =
            "login-activity-item";


        const location =
            getRecordValue(
                record,
                [
                    "location",
                    "city",
                    "ipLocation"
                ]
            );


        const device =
            getRecordValue(
                record,
                [
                    "device",
                    "deviceName"
                ]
            );


        const browser =
            getRecordValue(
                record,
                [
                    "browser",
                    "browserName"
                ]
            );


        const ipAddress =
            getRecordValue(
                record,
                [
                    "ipAddress",
                    "ip"
                ]
            );


        const loginTime =
            getRecordValue(
                record,
                [
                    "loginAt",
                    "timestamp",
                    "date"
                ]
            );


        item.innerHTML = `
            <div class="login-activity-icon">
                <i class="fa-solid fa-right-to-bracket"></i>
            </div>

            <div class="login-activity-details">

                <strong>
                    ${escapeHtml(
                        formatValue(
                            device
                        )
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        formatValue(
                            browser
                        )
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        formatValue(
                            location
                        )
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        formatValue(
                            ipAddress
                        )
                    )}
                </span>

                <time>
                    ${escapeHtml(
                        formatDateValue(
                            loginTime
                        )
                    )}
                </time>

            </div>
        `;


        fragment.appendChild(item);
    });


    elements.loginActivityContent
        .replaceChildren(fragment);
}


/* =========================================================
   PART 2 CONTINUES IN PART 3
========================================================= */
/* =========================================================
   CAMPUSCONNECT
   ADMIN PROFILE
   JavaScript — PART 3
========================================================= */


/* =========================================================
   32. LOAD CURRENT SESSION
========================================================= */

async function loadCurrentSession() {

    if (!elements.currentSessionContent) {
        return;
    }


    if (!isBackendConnected()) {

        renderUnavailablePanel(
            elements.currentSessionContent,
            "Current session information is unavailable until the authentication backend is connected."
        );

        return;
    }


    renderPanelLoading(
        elements.currentSessionContent,
        "Loading current session..."
    );


    try {

        const result =
            await apiRequest(
                CONFIG.CURRENT_SESSION_ENDPOINT
            );


        const session =
            normalizeSessionResponse(
                result.data
            );


        state.currentSession =
            session;


        renderCurrentSession(
            session
        );


    } catch (error) {

        console.error(
            "Current session error:",
            error
        );


        renderPanelError(
            elements.currentSessionContent,
            error?.message ||
            "Current session information could not be loaded."
        );
    }
}


/* =========================================================
   33. NORMALIZE SESSION RESPONSE
========================================================= */

function normalizeSessionResponse(response) {

    if (!response) {
        return null;
    }


    if (
        response.data &&
        typeof response.data === "object"
    ) {

        return response.data;
    }


    if (
        response.session &&
        typeof response.session === "object"
    ) {

        return response.session;
    }


    return response;
}


/* =========================================================
   34. RENDER CURRENT SESSION
========================================================= */

function renderCurrentSession(session) {

    if (!elements.currentSessionContent) {
        return;
    }


    if (
        !session ||
        typeof session !== "object"
    ) {

        renderUnavailablePanel(
            elements.currentSessionContent,
            "No current session information was returned by the server."
        );

        return;
    }


    const sessionId =
        getRecordValue(
            session,
            [
                "sessionId",
                "id"
            ]
        );


    const device =
        getRecordValue(
            session,
            [
                "device",
                "deviceName"
            ]
        );


    const browser =
        getRecordValue(
            session,
            [
                "browser",
                "browserName"
            ]
        );


    const operatingSystem =
        getRecordValue(
            session,
            [
                "operatingSystem",
                "os"
            ]
        );


    const ipAddress =
        getRecordValue(
            session,
            [
                "ipAddress",
                "ip"
            ]
        );


    const location =
        getRecordValue(
            session,
            [
                "location",
                "city"
            ]
        );


    const loginTime =
        getRecordValue(
            session,
            [
                "loginAt",
                "createdAt",
                "startedAt"
            ]
        );


    const lastActivity =
        getRecordValue(
            session,
            [
                "lastActivity",
                "lastActivityAt"
            ]
        );


    const content =
        document.createElement("div");


    content.className =
        "current-session-details";


    content.innerHTML = `
        <div class="session-status-row">
            <span class="session-status-dot"></span>

            <strong>
                Current Session
            </strong>
        </div>

        <div class="session-info-grid">

            <div class="session-info-item">
                <span>Session ID</span>
                <strong>
                    ${escapeHtml(
                        formatValue(sessionId)
                    )}
                </strong>
            </div>

            <div class="session-info-item">
                <span>Device</span>
                <strong>
                    ${escapeHtml(
                        formatValue(device)
                    )}
                </strong>
            </div>

            <div class="session-info-item">
                <span>Browser</span>
                <strong>
                    ${escapeHtml(
                        formatValue(browser)
                    )}
                </strong>
            </div>

            <div class="session-info-item">
                <span>Operating System</span>
                <strong>
                    ${escapeHtml(
                        formatValue(operatingSystem)
                    )}
                </strong>
            </div>

            <div class="session-info-item">
                <span>IP Address</span>
                <strong>
                    ${escapeHtml(
                        formatValue(ipAddress)
                    )}
                </strong>
            </div>

            <div class="session-info-item">
                <span>Location</span>
                <strong>
                    ${escapeHtml(
                        formatValue(location)
                    )}
                </strong>
            </div>

            <div class="session-info-item">
                <span>Login Time</span>
                <strong>
                    ${escapeHtml(
                        formatDateValue(loginTime)
                    )}
                </strong>
            </div>

            <div class="session-info-item">
                <span>Last Activity</span>
                <strong>
                    ${escapeHtml(
                        formatDateValue(lastActivity)
                    )}
                </strong>
            </div>

        </div>
    `;


    elements.currentSessionContent
        .replaceChildren(content);
}


/* =========================================================
   35. LOAD NOTIFICATION PREFERENCES
========================================================= */

async function loadNotificationPreferences() {

    if (!isBackendConnected()) {

        state.notificationPreferences =
            null;

        return;
    }


    try {

        const result =
            await apiRequest(
                CONFIG.NOTIFICATION_PREFERENCES_ENDPOINT
            );


        const preferences =
            normalizeNotificationPreferences(
                result.data
            );


        state.notificationPreferences =
            preferences;


        applyNotificationPreferences();


    } catch (error) {

        console.error(
            "Notification preference error:",
            error
        );
    }
}


/* =========================================================
   36. NORMALIZE NOTIFICATION PREFERENCES
========================================================= */

function normalizeNotificationPreferences(
    response
) {

    if (!response) {
        return null;
    }


    if (
        response.data &&
        typeof response.data === "object"
    ) {

        return response.data;
    }


    if (
        response.preferences &&
        typeof response.preferences === "object"
    ) {

        return response.preferences;
    }


    return response;
}


/* =========================================================
   37. APPLY NOTIFICATION PREFERENCES
========================================================= */

function applyNotificationPreferences() {

    const preferences =
        state.notificationPreferences;


    if (!preferences) {
        return;
    }


    if (
        elements.systemNotificationsToggle
    ) {

        elements.systemNotificationsToggle.checked =
            Boolean(
                getRecordValue(
                    preferences,
                    [
                        "systemNotifications",
                        "system",
                        "systemAlerts"
                    ]
                )
            );
    }


    if (
        elements.securityAlertsToggle
    ) {

        elements.securityAlertsToggle.checked =
            Boolean(
                getRecordValue(
                    preferences,
                    [
                        "securityAlerts",
                        "security"
                    ]
                )
            );
    }


    if (
        elements.administrativeUpdatesToggle
    ) {

        elements.administrativeUpdatesToggle.checked =
            Boolean(
                getRecordValue(
                    preferences,
                    [
                        "administrativeUpdates",
                        "administrative",
                        "adminUpdates"
                    ]
                )
            );
    }
}


/* =========================================================
   38. SAVE NOTIFICATION PREFERENCES
========================================================= */

async function handleNotificationPreferencesSave() {

    if (state.isSavingPreferences) {
        return;
    }


    const preferences = {

        systemNotifications:
            Boolean(
                elements
                    .systemNotificationsToggle
                    ?.checked
            ),

        securityAlerts:
            Boolean(
                elements
                    .securityAlertsToggle
                    ?.checked
            ),

        administrativeUpdates:
            Boolean(
                elements
                    .administrativeUpdatesToggle
                    ?.checked
            )
    };


    /*
     * Never claim that preferences were saved to the
     * database when the backend does not exist yet.
     */

    if (!isBackendConnected()) {

        showToast(
            "Preferences are not saved because the backend service is not connected yet.",
            "info"
        );

        return;
    }


    state.isSavingPreferences =
        true;


    setButtonLoading(
        elements.saveNotificationPreferencesButton,
        true,
        "Saving..."
    );


    try {

        const result =
            await apiRequest(
                CONFIG.NOTIFICATION_PREFERENCES_ENDPOINT,
                {
                    method: "PUT",
                    body: preferences
                }
            );


        state.notificationPreferences =
            normalizeNotificationPreferences(
                result.data
            ) || preferences;


        applyNotificationPreferences();


        showToast(
            "Notification preferences saved successfully.",
            "success"
        );


        closePanel(
            "notificationPreferencesPanel"
        );


    } catch (error) {

        console.error(
            "Notification preference save error:",
            error
        );


        showToast(
            error?.message ||
            "Notification preferences could not be saved.",
            "error"
        );


    } finally {

        state.isSavingPreferences =
            false;

        setButtonLoading(
            elements.saveNotificationPreferencesButton,
            false
        );
    }
}


/* =========================================================
   39. CHANGE PASSWORD
========================================================= */

async function handlePasswordSubmit(event) {

    event.preventDefault();


    if (state.isChangingPassword) {
        return;
    }


    clearPasswordFormError();


    const currentPassword =
        getInputValue(
            elements.currentPassword
        );


    const newPassword =
        getInputValue(
            elements.newPassword
        );


    const confirmPassword =
        getInputValue(
            elements.confirmPassword
        );


    const validationError =
        validatePasswordForm(
            currentPassword,
            newPassword,
            confirmPassword
        );


    if (validationError) {

        showPasswordFormError(
            validationError
        );

        return;
    }


    /*
     * The password must NEVER be stored in localStorage,
     * sessionStorage, the profile object, or any frontend
     * account data.
     */

    if (!isBackendConnected()) {

        showPasswordFormError(
            "The authentication backend is not connected yet. No password was changed."
        );

        return;
    }


    state.isChangingPassword =
        true;


    setButtonLoading(
        elements.updatePasswordButton,
        true,
        "Updating..."
    );


    try {

        await apiRequest(
            CONFIG.CHANGE_PASSWORD_ENDPOINT,
            {
                method: "POST",

                body: {
                    currentPassword:
                        currentPassword,

                    newPassword:
                        newPassword
                }
            }
        );


        clearPasswordForm();


        closePanel(
            "changePasswordPanel"
        );


        showToast(
            "Password changed successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Password change error:",
            error
        );


        showPasswordFormError(
            error?.message ||
            "The password could not be changed."
        );


    } finally {

        state.isChangingPassword =
            false;


        setButtonLoading(
            elements.updatePasswordButton,
            false
        );
    }
}


/* =========================================================
   40. PASSWORD VALIDATION
========================================================= */

function validatePasswordForm(
    currentPassword,
    newPassword,
    confirmPassword
) {

    if (!currentPassword) {

        return "Current password is required.";
    }


    if (!newPassword) {

        return "New password is required.";
    }


    if (newPassword.length < 8) {

        return "New password must contain at least 8 characters.";
    }


    if (
        newPassword ===
        currentPassword
    ) {

        return "New password must be different from the current password.";
    }


    if (!confirmPassword) {

        return "Please confirm the new password.";
    }


    if (
        newPassword !==
        confirmPassword
    ) {

        return "New password and confirmation do not match.";
    }


    return "";
}


/* =========================================================
   41. LOGOUT MODAL
========================================================= */

function openLogoutModal() {

    closeAccountDropdown();

    closeAllPanels();


    if (!elements.logoutModal) {
        return;
    }


    if (elements.logoutDialogMessage) {

        elements.logoutDialogMessage.textContent =
            "Are you sure you want to log out of your administrator account?";
    }


    elements.logoutModal.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );


    if (elements.cancelLogoutButton) {

        window.setTimeout(
            () => {
                elements.cancelLogoutButton.focus();
            },
            50
        );
    }
}


function closeLogoutModal() {

    if (!elements.logoutModal) {
        return;
    }


    elements.logoutModal.hidden =
        true;


    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   42. LOGOUT
========================================================= */

async function handleLogout() {

    if (state.isLoggingOut) {
        return;
    }


    state.isLoggingOut =
        true;


    setButtonLoading(
        elements.confirmLogoutButton,
        true,
        "Logging out..."
    );


    /*
     * Backend-connected logout
     */

    if (isBackendConnected()) {

        try {

            await apiRequest(
                CONFIG.LOGOUT_ENDPOINT,
                {
                    method: "POST"
                }
            );


            clearSafeClientSession();


            window.location.href =
                CONFIG.LOGIN_PAGE;


            return;


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            state.isLoggingOut =
                false;


            setButtonLoading(
                elements.confirmLogoutButton,
                false
            );


            if (elements.logoutDialogMessage) {

                elements.logoutDialogMessage.textContent =
                    error?.message ||
                    "Logout could not be completed. Please try again.";
            }


            return;
        }
    }


    /*
     * Backend is not connected.
     *
     * We can only clear frontend authentication/session
     * keys that this application explicitly uses.
     */

    clearSafeClientSession();


    window.location.href =
        CONFIG.LOGIN_PAGE;
}


/* =========================================================
   43. SAFE CLIENT SESSION CLEANUP
========================================================= */

function clearSafeClientSession() {

    /*
     * Do NOT use localStorage.clear().
     *
     * That could delete unrelated application settings
     * or user data.
     *
     * Only remove keys explicitly intended for authentication.
     */

    const authenticationKeys = [

        "authToken",

        "accessToken",

        "refreshToken",

        "sessionToken",

        "campusconnectAuth",

        "campusConnectAuth",

        "adminAuth"

    ];


    authenticationKeys.forEach(
        key => {

            try {

                localStorage.removeItem(
                    key
                );

            } catch (error) {

                console.warn(
                    `Unable to remove localStorage key: ${key}`,
                    error
                );
            }


            try {

                sessionStorage.removeItem(
                    key
                );

            } catch (error) {

                console.warn(
                    `Unable to remove sessionStorage key: ${key}`,
                    error
                );
            }
        }
    );
}


/* =========================================================
   44. PROFILE FORM ERROR
========================================================= */

function showProfileFormError(message) {

    if (!elements.editProfileError) {
        return;
    }


    elements.editProfileError.textContent =
        message;


    elements.editProfileError.hidden =
        false;
}


function clearProfileFormError() {

    if (!elements.editProfileError) {
        return;
    }


    elements.editProfileError.textContent =
        "";


    elements.editProfileError.hidden =
        true;
}


/* =========================================================
   45. PASSWORD FORM ERROR
========================================================= */

function showPasswordFormError(message) {

    if (!elements.changePasswordError) {
        return;
    }


    elements.changePasswordError.textContent =
        message;


    elements.changePasswordError.hidden =
        false;
}


function clearPasswordFormError() {

    if (!elements.changePasswordError) {
        return;
    }


    elements.changePasswordError.textContent =
        "";


    elements.changePasswordError.hidden =
        true;
}


/* =========================================================
   46. PASSWORD VISIBILITY
========================================================= */

function togglePasswordVisibility(event) {

    const button =
        event.currentTarget;


    const targetId =
        button.dataset.passwordTarget;


    if (!targetId) {
        return;
    }


    const input =
        document.getElementById(
            targetId
        );


    if (!input) {
        return;
    }


    const isPassword =
        input.type === "password";


    input.type =
        isPassword
            ? "text"
            : "password";


    const icon =
        button.querySelector("i");


    if (icon) {

        icon.classList.toggle(
            "fa-eye",
            !isPassword
        );

        icon.classList.toggle(
            "fa-eye-slash",
            isPassword
        );
    }


    button.setAttribute(
        "aria-label",
        isPassword
            ? "Hide password"
            : "Show password"
    );
}


/* =========================================================
   47. PANEL LOADING STATE
========================================================= */

function renderPanelLoading(
    container,
    message
) {

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="panel-state panel-loading-state">

            <div class="panel-state-icon">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>

            <strong>
                ${escapeHtml(message)}
            </strong>

        </div>
    `;
}


/* =========================================================
   48. PANEL UNAVAILABLE STATE
========================================================= */

function renderUnavailablePanel(
    container,
    message
) {

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="panel-state panel-empty-state">

            <div class="panel-state-icon">
                <i class="fa-solid fa-database"></i>
            </div>

            <strong>
                Data unavailable
            </strong>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>
    `;
}


/* =========================================================
   49. PANEL ERROR STATE
========================================================= */

function renderPanelError(
    container,
    message
) {

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="panel-state panel-error-state">

            <div class="panel-state-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>

            <strong>
                Unable to load data
            </strong>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>
    `;
}


/* =========================================================
   50. BUTTON LOADING STATE
========================================================= */

function setButtonLoading(
    button,
    loading,
    loadingText = "Loading..."
) {

    if (!button) {
        return;
    }


    if (loading) {

        if (
            !button.dataset.originalText
        ) {

            button.dataset.originalText =
                button.textContent.trim();
        }


        button.disabled =
            true;


        button.setAttribute(
            "aria-busy",
            "true"
        );


        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>
                ${escapeHtml(loadingText)}
            </span>
        `;


    } else {

        button.disabled =
            false;


        button.removeAttribute(
            "aria-busy"
        );


        if (
            button.dataset.originalText
        ) {

            button.textContent =
                button.dataset.originalText;
        }
    }
}


/* =========================================================
   51. GENERIC DOM HELPERS
========================================================= */

function setText(
    element,
    value
) {

    if (!element) {
        return;
    }


    element.textContent =
        value ?? "";
}


function setInputValue(
    element,
    value
) {

    if (!element) {
        return;
    }


    element.value =
        value ?? "";
}


function getInputValue(element) {

    if (!element) {
        return "";
    }


    return element.value
        .trim();
}


/* =========================================================
   52. PROFILE VALUE HELPER
========================================================= */

function getProfileValue(
    object,
    possibleKeys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return "";
    }


    for (
        const key of possibleKeys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            String(object[key]).trim() !== ""
        ) {

            return object[key];
        }
    }


    return "";
}


/* =========================================================
   53. RECORD VALUE HELPER
========================================================= */

function getRecordValue(
    object,
    possibleKeys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return "";
    }


    for (
        const key of possibleKeys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];
        }
    }


    return "";
}


/* =========================================================
   54. DISPLAY VALUE
========================================================= */

function formatValue(value) {

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {

        return "Not available";
    }


    return String(value);
}


/* =========================================================
   55. DATE FORMATTER
========================================================= */

function formatDateValue(value) {

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {

        return "Not available";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        /*
         * If the backend already sends a formatted
         * human-readable value, preserve it.
         */

        return String(value);
    }


    return new Intl.DateTimeFormat(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}


/* =========================================================
   56. EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailPattern.test(
        email
    );
}


/* =========================================================
   57. PHONE VALIDATION
========================================================= */

function isValidPhone(phone) {

    /*
     * Allows international and Indian-style phone
     * formats without forcing one country format.
     */

    const digits =
        phone.replace(
            /\D/g,
            ""
        );


    return (
        digits.length >= 7 &&
        digits.length <= 15
    );
}


/* =========================================================
   58. HTML ESCAPING
========================================================= */

function escapeHtml(value) {

    if (
        value === undefined ||
        value === null
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
   59. CLEAR PASSWORD FORM
========================================================= */

function clearPasswordForm() {

    if (elements.currentPassword) {

        elements.currentPassword.value =
            "";
    }


    if (elements.newPassword) {

        elements.newPassword.value =
            "";
    }


    if (elements.confirmPassword) {

        elements.confirmPassword.value =
            "";
    }


    clearPasswordFormError();
}


/* =========================================================
   60. TOAST SYSTEM
========================================================= */

function showToast(
    message,
    type = "info"
) {

    if (
        !elements.globalToast ||
        !elements.globalToastMessage
    ) {

        return;
    }


    const iconMap = {

        success:
            "fa-circle-check",

        error:
            "fa-circle-exclamation",

        warning:
            "fa-triangle-exclamation",

        info:
            "fa-circle-info"
    };


    const iconClass =
        iconMap[type] ||
        iconMap.info;


    if (elements.globalToastIcon) {

        elements.globalToastIcon.className =
            `fa-solid ${iconClass}`;
    }


    elements.globalToastMessage.textContent =
        message;


    elements.globalToast.classList.remove(
        "toast-success",
        "toast-error",
        "toast-warning",
        "toast-info"
    );


    elements.globalToast.classList.add(
        `toast-${type}`
    );


    elements.globalToast.hidden =
        false;


    /*
     * Restart animation if the toast is triggered
     * repeatedly.
     */

    elements.globalToast.classList.remove(
        "toast-visible"
    );


    window.requestAnimationFrame(
        () => {

            elements.globalToast.classList.add(
                "toast-visible"
            );
        }
    );


    window.clearTimeout(
        showToast.timeoutId
    );


    showToast.timeoutId =
        window.setTimeout(
            () => {

                if (
                    elements.globalToast
                ) {

                    elements.globalToast.classList.remove(
                        "toast-visible"
                    );


                    window.setTimeout(
                        () => {

                            if (
                                elements.globalToast
                            ) {

                                elements.globalToast.hidden =
                                    true;
                            }

                        },
                        250
                    );
                }

            },
            4000
        );
}


/* =========================================================
   61. PROFILE ACTIVITY PREVIEW
========================================================= */

async function loadRecentActivity() {

    /*
     * Activity is intentionally backend-driven.
     * No fake activity entries are created.
     */

    if (!elements.activityCard) {
        return;
    }


    if (!isBackendConnected()) {

        elements.activityCard.innerHTML = `
            <div class="activity-empty-state">

                <div class="activity-empty-icon">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </div>

                <strong>
                    No account activity available
                </strong>

                <p>
                    Recent activity will appear here after the backend is connected.
                </p>

            </div>
        `;

        return;
    }


    /*
     * The complete activity history is loaded by the
     * Login Activity panel. This preview remains clean
     * until the backend supplies activity data.
     */

    if (
        state.loginActivity &&
        state.loginActivity.length
    ) {

        const latest =
            state.loginActivity[0];


        const latestTime =
            getRecordValue(
                latest,
                [
                    "loginAt",
                    "timestamp",
                    "date"
                ]
            );


        elements.activityCard.innerHTML = `
            <div class="activity-preview-item">

                <div class="activity-preview-icon">
                    <i class="fa-solid fa-right-to-bracket"></i>
                </div>

                <div>
                    <strong>
                        Latest login activity
                    </strong>

                    <span>
                        ${escapeHtml(
                            formatDateValue(
                                latestTime
                            )
                        )}
                    </span>
                </div>

            </div>
        `;

        return;
    }


    elements.activityCard.innerHTML = `
        <div class="activity-empty-state">

            <div class="activity-empty-icon">
                <i class="fa-solid fa-clock-rotate-left"></i>
            </div>

            <strong>
                No recent activity available
            </strong>

            <p>
                Login activity records will appear here when provided by the backend.
            </p>

        </div>
    `;
}


/* =========================================================
   62. FINAL INITIALIZATION HOOK
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Activity preview is deliberately separate from
         * profile loading so it never creates fake records.
         */

        loadRecentActivity();
    }
);


/* =========================================================
   ADMIN PROFILE JAVASCRIPT COMPLETE
========================================================= */