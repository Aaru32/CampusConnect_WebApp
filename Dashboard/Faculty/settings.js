/* =========================================
CampusConnect Settings
Frontend + Backend Ready
========================================= */

/* =========================================
ELEMENTS
========================================= */

const backButton =
document.getElementById("backButton");

const refreshButton =
document.getElementById("refreshButton");

const logoutButton =
document.getElementById("logoutButton");

const settingsModal =
document.getElementById("settingsModal");

const modalClose =
document.getElementById("modalClose");

const modalContent =
document.getElementById("modalContent");

const emailNotifications =
document.getElementById("emailNotifications");

const pushNotifications =
document.getElementById("pushNotifications");

const themeValue =
document.getElementById("themeValue");

/* =========================================
BACK NAVIGATION
========================================= */

backButton.addEventListener(
"click",
function () {

    if (window.history.length > 1) {

        window.history.back();

    } else {

        /*
            Fallback only.

            Replace this with the actual
            previous-page/navigation system
            when the CampusConnect backend/
            global navigation system is connected.
        */

        window.location.href =
            "student-dashboard.html";
    }
}

);

/* =========================================
REFRESH
========================================= */

refreshButton.addEventListener(
"click",
function () {

    refreshButton.classList.add(
        "refreshing"
    );

    refreshButton.disabled = true;


    setTimeout(
        function () {

            window.location.reload();

        },
        250
    );

}

);

/* =========================================
SETTINGS DATA DEFINITIONS
========================================= */

const settingDefinitions = {

"change-password": {
    title: "Change Password",
    description:
        "Update the password associated with your CampusConnect account.",
    note:
        "The password update form and secure password API will be connected to the Java backend later."
},

"login-security": {
    title: "Login & Security",
    description:
        "Manage login security and account sessions.",
    note:
        "Future backend integration can provide active-session management, login history and secure logout controls."
},

"notification-preferences": {
    title: "Notification Preferences",
    description:
        "Choose which CampusConnect activities should generate notifications.",
    note:
        "Notification preferences will be stored per student in the database and connected to the global notification system."
},

"email-notifications": {
    title: "Email Notifications",
    description:
        "Control whether CampusConnect may send notification emails.",
    note:
        "This preference will later be stored for the authenticated student through the backend."
},

"push-notifications": {
    title: "Push Notifications",
    description:
        "Control notifications delivered to supported devices.",
    note:
        "Push notification registration and preference storage will be handled by the backend and notification service."
},

"privacy-controls": {
    title: "Privacy Controls",
    description:
        "Manage how your information is used and shared within CampusConnect.",
    note:
        "Privacy preferences will be retrieved and stored dynamically for the logged-in student."
},

"visibility": {
    title: "Profile Visibility",
    description:
        "Control which information may be visible to other CampusConnect users.",
    note:
        "Visibility settings will be stored dynamically and will not contain fixed student information."
},

"theme": {
    title: "Theme",
    description:
        "Choose the appearance of CampusConnect.",
    note:
        "Theme preference can later be synchronized with the student's account settings through the backend."
},

"accessibility": {
    title: "Accessibility",
    description:
        "Adjust available accessibility preferences.",
    note:
        "Accessibility preferences can be expanded later according to CampusConnect requirements."
},

"academic-preferences": {
    title: "Academic Preferences",
    description:
        "Manage learning-related preferences.",
    note:
        "Academic preferences will be loaded dynamically rather than being permanently written into the frontend."
},

"app-preferences": {
    title: "App Preferences",
    description:
        "Customize how CampusConnect behaves for you.",
    note:
        "These preferences can be stored against the authenticated student's account."
},

"help": {
    title: "Help & Support",
    description:
        "Find assistance for using CampusConnect.",
    note:
        "The final version can connect this section to the CampusConnect support system."
},

"report-problem": {
    title: "Report a Problem",
    description:
        "Submit an issue or technical problem.",
    note:
        "Problem reports can later be submitted through a backend API and stored in the support database."
},

"about": {
    title: "About CampusConnect",
    description:
        "Information about the CampusConnect application.",
    note:
        "Application information such as the version can later be loaded from the backend or deployment configuration."
},

"terms": {
    title: "Terms & Privacy",
    description:
        "Review CampusConnect terms and privacy information.",
    note:
        "The final legal documents can be connected here when they are available."
}

};

/* =========================================
OPEN SETTING
========================================= */

document
.querySelectorAll(".setting-row")
.forEach(function (row) {

    row.addEventListener(
        "click",
        function () {

            const settingName =
                row.dataset.setting;

            /*
                Toggle rows are handled separately.
            */

            if (
                settingName ===
                "email-notifications"
            ) {
                return;
            }


            if (
                settingName ===
                "push-notifications"
            ) {
                return;
            }


            openSetting(
                settingName
            );
        }
    );

});

/* =========================================
OPEN MODAL
========================================= */

function openSetting(settingName) {

const setting =
    settingDefinitions[settingName];


if (!setting) {
    return;
}


modalContent.innerHTML = `

    <h3 class="modal-title">
        ${setting.title}
    </h3>

    <p class="modal-description">
        ${setting.description}
    </p>

    <div class="modal-note">
        ${setting.note}
    </div>

`;


settingsModal.classList.add("active");

settingsModal.setAttribute(
    "aria-hidden",
    "false"
);

}

/* =========================================
CLOSE MODAL
========================================= */

function closeModal() {

settingsModal.classList.remove(
    "active"
);

settingsModal.setAttribute(
    "aria-hidden",
    "true"
);

}

modalClose.addEventListener(
"click",
closeModal
);

settingsModal.addEventListener(
"click",
function (event) {

    if (
        event.target ===
        settingsModal
    ) {
        closeModal();
    }

}

);

/* =========================================
EMAIL NOTIFICATION
========================================= */

emailNotifications.addEventListener(
"change",
function () {

    const enabled =
        emailNotifications.checked;

    /*
        BACKEND INTEGRATION POINT

        Later:

        sendPreferenceToBackend(
            "email_notifications",
            enabled
        );

        Do not hardcode a student ID here.
        The backend should identify the
        authenticated student from the
        login/session/token.
    */

    console.log(
        "Email notification preference changed:",
        enabled
    );
}

);

/* =========================================
PUSH NOTIFICATION
========================================= */

pushNotifications.addEventListener(
"change",
function () {

    const enabled =
        pushNotifications.checked;

    /*
        BACKEND INTEGRATION POINT

        Later this will communicate with
        the backend notification service.

        The authenticated user's identity
        must come from the backend session/
        authentication system.
    */

    console.log(
        "Push notification preference changed:",
        enabled
    );
}

);

/* =========================================
THEME
========================================= */

document
.querySelector(
'[data-setting="theme"]'
)
.addEventListener(
"click",
function () {

        const currentTheme =
            document.body.classList.contains(
                "dark-mode"
            )
                ? "Dark"
                : "System";


        const newTheme =
            currentTheme === "Dark"
                ? "System"
                : "Dark";


        if (newTheme === "Dark") {

            document.body.classList.add(
                "dark-mode"
            );

        } else {

            document.body.classList.remove(
                "dark-mode"
            );
        }


        themeValue.textContent =
            newTheme;


        /*
            BACKEND INTEGRATION POINT

            Later save:

            theme = newTheme

            for the authenticated student.
        */
    }
);

/* =========================================
LOGOUT
========================================= */

logoutButton.addEventListener(
"click",
function () {

    /*
        BACKEND INTEGRATION POINT

        Later this button should call the
        authentication/logout API.

        Example flow:

        CampusConnect frontend
                ↓
        Java backend
                ↓
        Session/token invalidation
                ↓
        Login page
    */

    const confirmLogout =
        window.confirm(
            "Are you sure you want to log out?"
        );


    if (!confirmLogout) {
        return;
    }


    /*
        Temporary navigation only.

        When the backend authentication system
        is implemented, replace this with the
        actual logout API call.
    */

    window.location.href =
        "../../Login/Login.html";
}

);