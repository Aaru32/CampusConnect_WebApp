/* =========================================================
   CAMPUSCONNECT - LOGIN PAGE JAVASCRIPT
   FRONTEND DEVELOPMENT VERSION
   API READY FOR FUTURE JAVA + MYSQL BACKEND
========================================================= */

"use strict";


document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const CONFIG = {

        /*
         * Keep empty until Java backend is connected.
         *
         * Later:
         *
         * API_BASE_URL: "http://localhost:7700/api"
         */

        API_BASE_URL: "",

        LOGIN_PAGE: "login.html",

        REGISTER_PAGE: "register.html",

        STORAGE_KEY: "campusConnectRegistration",

        ROLE_KEY: "campusConnectRole",

        SESSION_LOGIN_KEY: "campusConnectLoggedIn",

        SESSION_ROLE_KEY: "campusConnectRole",

        SESSION_USER_KEY: "campusConnectUser",

        REMEMBER_KEY: "campusConnectRemember",

        REMEMBER_EMAIL_KEY:
            "campusConnectRememberedEmail"

    };


    /* =====================================================
       LOGIN DOM
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const rememberMe =
        document.getElementById("rememberMe");

    const forgotPassword =
        document.getElementById("forgotPassword");

    const loginMessage =
        document.getElementById("loginMessage");

    const roleCards =
        document.querySelectorAll(".role-card");


    /* =====================================================
       FORGOT PASSWORD DOM
    ===================================================== */

    const forgotModal =
        document.getElementById(
            "forgotPasswordModal"
        );

    const closeForgotPassword =
        document.getElementById(
            "closeForgotPassword"
        );

    const forgotModalOverlay =
        forgotModal
            ? forgotModal.querySelector(
                ".forgot-modal-overlay"
            )
            : null;

    const forgotEmailStep =
        document.getElementById(
            "forgotEmailStep"
        );

    const forgotPasswordStep =
        document.getElementById(
            "forgotPasswordStep"
        );

    const forgotSuccessStep =
        document.getElementById(
            "forgotSuccessStep"
        );

    const forgotEmail =
        document.getElementById(
            "forgotEmail"
        );

    const verifyForgotEmail =
        document.getElementById(
            "verifyForgotEmail"
        );

    const verifiedForgotEmail =
        document.getElementById(
            "verifiedForgotEmail"
        );

    const newForgotPassword =
        document.getElementById(
            "newForgotPassword"
        );

    const confirmForgotPassword =
        document.getElementById(
            "confirmForgotPassword"
        );

    const resetPasswordButton =
        document.getElementById(
            "resetPasswordButton"
        );

    const continueToLogin =
        document.getElementById(
            "continueToLogin"
        );

    const forgotPasswordMessage =
        document.getElementById(
            "forgotPasswordMessage"
        );

    const forgotPasswordToggles =
        document.querySelectorAll(
            ".forgot-password-toggle"
        );


    /* =====================================================
       STATE
    ===================================================== */

    let selectedRole = "student";

    let forgotVerifiedEmail = "";


    /* =====================================================
       URL ROLE
    ===================================================== */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const urlRole =
        urlParams.get("role");


    if (
        urlRole === "student" ||
        urlRole === "faculty" ||
        urlRole === "admin"
    ) {

        selectedRole = urlRole;

    }


    /* =====================================================
       SET ACTIVE ROLE
    ===================================================== */

    function setActiveRole(role) {

        if (
            role !== "student" &&
            role !== "faculty" &&
            role !== "admin"
        ) {
            role = "student";
        }


        selectedRole = role;


        roleCards.forEach(function (card) {

            if (
                card.dataset.role ===
                selectedRole
            ) {

                card.classList.add("active");

            } else {

                card.classList.remove("active");

            }

        });


        /*
         * Keep role information available
         * for future backend integration.
         */

        try {

            sessionStorage.setItem(
                CONFIG.SESSION_ROLE_KEY,
                selectedRole
            );

        } catch (error) {
            console.warn("Unable to store selected role:", error);
        }

        /*
         * Auto-populate demo credentials for quick preview
         */
        const demoCreds = {
            student: { email: "student@gwpoly.ac.in", pass: "Student@123" },
            faculty: { email: "faculty@gwpoly.ac.in", pass: "Faculty@123" },
            admin: { email: "admin@gwpoly.ac.in", pass: "Admin@123" }
        };
        const demoEmails = ["student@gwpoly.ac.in", "faculty@gwpoly.ac.in", "admin@gwpoly.ac.in"];
        if (usernameInput && (!usernameInput.value || demoEmails.includes(usernameInput.value.trim().toLowerCase()))) {
            if (demoCreds[selectedRole]) {
                usernameInput.value = demoCreds[selectedRole].email;
                if (passwordInput && (!passwordInput.value || passwordInput.value.endsWith("@123"))) {
                    passwordInput.value = demoCreds[selectedRole].pass;
                }
            }
        }
    }


    setActiveRole(selectedRole);


    /* =====================================================
       ROLE CARD CLICK
    ===================================================== */

    roleCards.forEach(function (card) {

        card.addEventListener(
            "click",
            function () {

                setActiveRole(
                    card.dataset.role
                );

                clearErrors();

                clearMessage();

            }
        );

    });


    /* =====================================================
       LOGIN PASSWORD TOGGLE
    ===================================================== */

    if (
        togglePassword &&
        passwordInput
    ) {

        togglePassword.addEventListener(
            "click",
            function () {

                const isPassword =
                    passwordInput.type ===
                    "password";


                if (isPassword) {

                    passwordInput.type =
                        "text";

                    togglePassword.innerHTML =
                        '<i class="fa-regular fa-eye-slash"></i>';

                    togglePassword.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    passwordInput.type =
                        "password";

                    togglePassword.innerHTML =
                        '<i class="fa-regular fa-eye"></i>';

                    togglePassword.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }


    /* =====================================================
       REMEMBER ME
    ===================================================== */

    if (rememberMe) {

        const remembered =
            localStorage.getItem(
                CONFIG.REMEMBER_KEY
            );

        const rememberedEmail =
            localStorage.getItem(
                CONFIG.REMEMBER_EMAIL_KEY
            );


        if (
            remembered === "true"
        ) {

            rememberMe.checked = true;

        }


        if (
            rememberedEmail &&
            usernameInput
        ) {

            usernameInput.value =
                rememberedEmail;

        }


        rememberMe.addEventListener(
            "change",
            function () {

                if (
                    !rememberMe.checked
                ) {

                    localStorage.removeItem(
                        CONFIG.REMEMBER_KEY
                    );

                    localStorage.removeItem(
                        CONFIG.REMEMBER_EMAIL_KEY
                    );

                }

            }
        );

    }


    /* =====================================================
       LOGIN SUBMISSION
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                clearErrors();

                clearMessage();


                const username =
                    usernameInput
                        ? usernameInput.value
                            .trim()
                            .toLowerCase()
                        : "";


                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                /* =========================================
                   EMAIL VALIDATION
                ========================================= */

                if (username === "") {

                    showMessage(
                        "Please enter your email address.",
                        "error"
                    );

                    if (usernameInput) {
                        usernameInput.focus();
                    }

                    return;

                }


                if (
                    !isValidEmail(username)
                ) {

                    showMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    if (usernameInput) {
                        usernameInput.focus();
                    }

                    return;

                }


                /* =========================================
                   PASSWORD VALIDATION
                ========================================= */

                if (password === "") {

                    showMessage(
                        "Please enter your password.",
                        "error"
                    );

                    if (passwordInput) {
                        passwordInput.focus();
                    }

                    return;

                }


                /* =========================================
                   GET REGISTERED USERS
                ========================================= */

                const users =
                    getRegisteredUsers();


                if (
                    users.length === 0
                ) {

                    showMessage(
                        "No registered account found. Please create an account first.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   FIND ACCOUNT (FIREBASE + LOCAL)
                ========================================= */
                let registeredUser = null;

                if (window.CampusConnectFirebase && window.CampusConnectFirebase.loginWithEmail) {
                    try {
                        const fbResult = await window.CampusConnectFirebase.loginWithEmail(username, password);
                        if (fbResult && fbResult.profile) {
                            if (fbResult.profile.role !== selectedRole && fbResult.profile.role !== "admin") {
                                showMessage(`This account has role "${fbResult.profile.role}", not "${selectedRole}".`, "error");
                                return;
                            }
                            if (selectedRole === "admin" && fbResult.profile.authorizationStatus === "PENDING_APPROVAL") {
                                showMessage("Your Admin account is still pending authorization.", "error");
                                return;
                            }
                            registeredUser = fbResult.profile;
                        }
                    } catch (fbErr) {
                        console.warn("Firebase Auth response:", fbErr);
                        if (fbErr.code === "auth/wrong-password" || fbErr.code === "auth/invalid-credential") {
                            showMessage("Incorrect password. If you forgot your password, use Forgot Password.", "error");
                            return;
                        }
                    }
                }

                if (!registeredUser) {
                    registeredUser = users.find(
                        function (user) {
                            return (
                                user &&
                                user.email &&
                                String(user.email).toLowerCase() === username &&
                                user.role === selectedRole
                            );
                        }
                    );
                }

                if (!registeredUser) {
                    showMessage(
                        "No account was found for this email and selected role.",
                        "error"
                    );
                    return;
                }


                /* =========================================
                   ADMIN APPROVAL
                ========================================= */

                if (
                    selectedRole === "admin" &&
                    registeredUser.authorizationStatus ===
                        "PENDING_APPROVAL"
                ) {

                    showMessage(
                        "Your Admin account is still pending authorization.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   PASSWORD CHECK
                ========================================= */

                if (
                    registeredUser.password &&
                    registeredUser.password !== password
                ) {

                    showMessage(
                        "Incorrect password. If you forgot your password, use Forgot Password.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   SESSION LOGIN
                ========================================= */

                try {

                    sessionStorage.setItem(
                        CONFIG.SESSION_LOGIN_KEY,
                        "true"
                    );

                    sessionStorage.setItem(
                        CONFIG.SESSION_ROLE_KEY,
                        selectedRole
                    );

                    sessionStorage.setItem(
                        CONFIG.SESSION_USER_KEY,
                        JSON.stringify(
                            registeredUser
                        )
                    );

                } catch (error) {

                    console.error(
                        "Unable to create login session:",
                        error
                    );

                    showMessage(
                        "Unable to create your login session. Please try again.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   REMEMBER ME
                ========================================= */

                if (
                    rememberMe &&
                    rememberMe.checked
                ) {

                    localStorage.setItem(
                        CONFIG.REMEMBER_KEY,
                        "true"
                    );

                    localStorage.setItem(
                        CONFIG.REMEMBER_EMAIL_KEY,
                        username
                    );

                } else {

                    localStorage.removeItem(
                        CONFIG.REMEMBER_KEY
                    );

                    localStorage.removeItem(
                        CONFIG.REMEMBER_EMAIL_KEY
                    );

                }


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                showMessage(
                    "Login successful. Redirecting...",
                    "success"
                );


                /* =========================================
                   REDIRECT PAGES
                ========================================= */

                const redirectPages = {

                    student:
                        "../Dashboard/Student/student-dashboard.html",

                    faculty:
                        "../Dashboard/Faculty/faculty-dashboard.html",

                    admin:
                        "../Dashboard/Admin/admin-dashboard.html"

                };


                const redirectPage =
                    redirectPages[
                        selectedRole
                    ];


                if (!redirectPage) {

                    showMessage(
                        "Login role is not configured correctly.",
                        "error"
                    );

                    return;

                }


                setTimeout(
                    function () {

                        window.location.href =
                            redirectPage;

                    },
                    800
                );

            }
        );

    }


    /* =====================================================
       OPEN FORGOT PASSWORD
    ===================================================== */

    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openForgotPasswordModal();

            }
        );

    }


    /* =====================================================
       CLOSE FORGOT PASSWORD
    ===================================================== */

    if (closeForgotPassword) {

        closeForgotPassword.addEventListener(
            "click",
            closeForgotPasswordModal
        );

    }


    /* =====================================================
       CLOSE BY OVERLAY
    ===================================================== */

    if (forgotModalOverlay) {

        forgotModalOverlay.addEventListener(
            "click",
            closeForgotPasswordModal
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                forgotModal &&
                forgotModal.classList.contains(
                    "show"
                )
            ) {

                closeForgotPasswordModal();

            }

        }
    );


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openForgotPasswordModal() {

        if (!forgotModal) {
            return;
        }


        resetForgotPasswordModal();


        /*
         * Reuse the email from the login field
         * if the user has already entered one.
         */

        if (
            usernameInput &&
            usernameInput.value.trim() !== ""
        ) {

            const loginEmail =
                usernameInput.value
                    .trim()
                    .toLowerCase();


            if (isValidEmail(loginEmail)) {

                forgotEmail.value =
                    loginEmail;

            }

        }


        forgotModal.classList.add(
            "show"
        );


        forgotModal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            function () {

                if (forgotEmail) {

                    forgotEmail.focus();

                    /*
                     * Place cursor at the end
                     * when an email was reused.
                     */

                    if (
                        forgotEmail.value
                    ) {

                        const length =
                            forgotEmail.value.length;

                        forgotEmail.setSelectionRange(
                            length,
                            length
                        );

                    }

                }

            },
            50
        );

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeForgotPasswordModal() {

        if (!forgotModal) {
            return;
        }


        forgotModal.classList.remove(
            "show"
        );


        forgotModal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";


        resetForgotPasswordModal();

    }


    /* =====================================================
       RESET MODAL
    ===================================================== */

    function resetForgotPasswordModal() {

        forgotVerifiedEmail = "";


        if (forgotEmailStep) {

            forgotEmailStep.style.display =
                "block";

        }


        if (forgotPasswordStep) {

            forgotPasswordStep.style.display =
                "none";

        }


        if (forgotSuccessStep) {

            forgotSuccessStep.style.display =
                "none";

        }


        if (forgotEmail) {

            forgotEmail.value = "";

        }


        if (newForgotPassword) {

            newForgotPassword.value = "";

            newForgotPassword.type =
                "password";

        }


        if (confirmForgotPassword) {

            confirmForgotPassword.value = "";

            confirmForgotPassword.type =
                "password";

        }


        if (verifiedForgotEmail) {

            verifiedForgotEmail.textContent =
                "";

        }


        /*
         * Restore password-toggle icons.
         */

        forgotPasswordToggles.forEach(
            function (button) {

                const icon =
                    button.querySelector("i");


                if (icon) {

                    icon.classList.remove(
                        "fa-eye-slash"
                    );

                    icon.classList.add(
                        "fa-eye"
                    );

                }


                button.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }
        );


        clearForgotPasswordMessage();

    }


    /* =====================================================
       VERIFY FORGOT EMAIL
    ===================================================== */

    if (verifyForgotEmail) {

        verifyForgotEmail.addEventListener(
            "click",
            function () {

                clearForgotPasswordMessage();


                const email =
                    forgotEmail
                        ? forgotEmail.value
                            .trim()
                            .toLowerCase()
                        : "";


                /* =========================================
                   EMAIL REQUIRED
                ========================================= */

                if (email === "") {

                    showForgotPasswordMessage(
                        "Please enter your registered email address.",
                        "error"
                    );

                    if (forgotEmail) {
                        forgotEmail.focus();
                    }

                    return;

                }


                /* =========================================
                   EMAIL FORMAT
                ========================================= */

                if (
                    !isValidEmail(email)
                ) {

                    showForgotPasswordMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    if (forgotEmail) {
                        forgotEmail.focus();
                    }

                    return;

                }


                /* =========================================
                   GET USERS
                ========================================= */

                const users =
                    getRegisteredUsers();


                if (
                    users.length === 0
                ) {

                    showForgotPasswordMessage(
                        "No registered account was found. Please create an account first.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   FIND ACCOUNT
                ========================================= */

                const registeredUser =
                    users.find(
                        function (user) {

                            return (
                                user &&
                                user.email &&
                                String(
                                    user.email
                                )
                                    .toLowerCase() ===
                                    email
                            );

                        }
                    );


                if (!registeredUser) {

                    showForgotPasswordMessage(
                        "No CampusConnect account was found with this email address.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   STORE VERIFIED ACCOUNT
                ========================================= */

                forgotVerifiedEmail =
                    email;


                if (verifiedForgotEmail) {

                    verifiedForgotEmail.textContent =
                        email;

                }


                if (forgotEmailStep) {

                    forgotEmailStep.style.display =
                        "none";

                }


                if (forgotPasswordStep) {

                    forgotPasswordStep.style.display =
                        "block";

                }


                clearForgotPasswordMessage();


                setTimeout(
                    function () {

                        if (
                            newForgotPassword
                        ) {

                            newForgotPassword.focus();

                        }

                    },
                    50
                );

            }
        );

    }


    /* =====================================================
       RESET PASSWORD
    ===================================================== */

    if (resetPasswordButton) {

        resetPasswordButton.addEventListener(
            "click",
            function () {

                clearForgotPasswordMessage();


                const newPassword =
                    newForgotPassword
                        ? newForgotPassword.value
                        : "";


                const confirmPassword =
                    confirmForgotPassword
                        ? confirmForgotPassword.value
                        : "";


                /* =========================================
                   ACCOUNT VERIFICATION
                ========================================= */

                if (
                    !forgotVerifiedEmail
                ) {

                    showForgotPasswordMessage(
                        "Please verify your account first.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   PASSWORD LENGTH
                ========================================= */

                if (
                    newPassword.length < 8
                ) {

                    showForgotPasswordMessage(
                        "Password must contain at least 8 characters.",
                        "error"
                    );

                    if (newForgotPassword) {
                        newForgotPassword.focus();
                    }

                    return;

                }


                /* =========================================
                   PASSWORD MATCH
                ========================================= */

                if (
                    newPassword !==
                    confirmPassword
                ) {

                    showForgotPasswordMessage(
                        "New password and confirmation do not match.",
                        "error"
                    );

                    if (
                        confirmForgotPassword
                    ) {

                        confirmForgotPassword.focus();

                    }

                    return;

                }


                /* =========================================
                   GET USERS
                ========================================= */

                const users =
                    getRegisteredUsers();


                /* =========================================
                   FIND ACCOUNT
                ========================================= */

                const userIndex =
                    users.findIndex(
                        function (user) {

                            return (
                                user &&
                                user.email &&
                                String(
                                    user.email
                                )
                                    .toLowerCase() ===
                                    forgotVerifiedEmail
                            );

                        }
                    );


                if (
                    userIndex === -1
                ) {

                    showForgotPasswordMessage(
                        "The account could not be found. Please start the password reset again.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   UPDATE PASSWORD
                ========================================= */

                users[userIndex].password =
                    newPassword;


                users[userIndex].passwordUpdatedAt =
                    new Date().toISOString();


                try {

                    localStorage.setItem(
                        CONFIG.STORAGE_KEY,
                        JSON.stringify(users)
                    );

                } catch (error) {

                    console.error(
                        "Unable to save password:",
                        error
                    );

                    showForgotPasswordMessage(
                        "The password could not be saved. Please try again.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   UPDATE LOGIN FORM
                ========================================= */

                if (usernameInput) {

                    usernameInput.value =
                        forgotVerifiedEmail;

                }


                if (passwordInput) {

                    passwordInput.value =
                        "";

                }


                /*
                 * Select the role associated with
                 * the recovered account.
                 */

                const recoveredRole =
                    users[userIndex].role;


                if (
                    recoveredRole === "student" ||
                    recoveredRole === "faculty" ||
                    recoveredRole === "admin"
                ) {

                    setActiveRole(
                        recoveredRole
                    );

                }


                /* =========================================
                   SUCCESS SCREEN
                ========================================= */

                if (forgotPasswordStep) {

                    forgotPasswordStep.style.display =
                        "none";

                }


                if (forgotSuccessStep) {

                    forgotSuccessStep.style.display =
                        "block";

                }


                clearForgotPasswordMessage();

            }
        );

    }


    /* =====================================================
       CONTINUE TO LOGIN
    ===================================================== */

    if (continueToLogin) {

        continueToLogin.addEventListener(
            "click",
            function () {

                closeForgotPasswordModal();


                if (passwordInput) {

                    passwordInput.focus();

                }

            }
        );

    }


    /* =====================================================
       FORGOT PASSWORD SHOW / HIDE
    ===================================================== */

    forgotPasswordToggles.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        button.dataset.target;


                    const input =
                        document.getElementById(
                            targetId
                        );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (
                        !input ||
                        !icon
                    ) {
                        return;
                    }


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";


                        icon.classList.remove(
                            "fa-eye"
                        );


                        icon.classList.add(
                            "fa-eye-slash"
                        );


                        button.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        input.type =
                            "password";


                        icon.classList.remove(
                            "fa-eye-slash"
                        );


                        icon.classList.add(
                            "fa-eye"
                        );


                        button.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       GET REGISTERED USERS
    ===================================================== */

    function getRegisteredUsers() {

        const stored =
            localStorage.getItem(
                CONFIG.STORAGE_KEY
            );


        if (!stored) {
            const defaultDemoUsers = [
                {
                    role: "student",
                    name: "Aarti Kumari",
                    email: "student@gwpoly.ac.in",
                    mobile: "9876543210",
                    password: "Student@123",
                    rollNo: "101",
                    branch: "Computer Science",
                    registeredAt: new Date().toISOString()
                },
                {
                    role: "faculty",
                    name: "Dr. Neha Sharma",
                    email: "faculty@gwpoly.ac.in",
                    mobile: "9876543211",
                    password: "Faculty@123",
                    employeeId: "FAC204",
                    department: "Computer Science",
                    designation: "Associate Professor",
                    registeredAt: new Date().toISOString()
                },
                {
                    role: "admin",
                    name: "Administrative Officer",
                    email: "admin@gwpoly.ac.in",
                    mobile: "9876543212",
                    password: "Admin@123",
                    adminId: "ADM001",
                    designation: "Principal / Registrar",
                    authorizationStatus: "AUTHORIZED",
                    registeredAt: new Date().toISOString()
                }
            ];
            try {
                localStorage.setItem(
                    CONFIG.STORAGE_KEY,
                    JSON.stringify(defaultDemoUsers)
                );
            } catch (err) {}
            return defaultDemoUsers;
        }


        try {

            const parsed =
                JSON.parse(stored);


            /*
             * Current registration format:
             * Array of users.
             */

            if (
                Array.isArray(parsed)
            ) {

                return parsed;

            }


            /*
             * Compatibility with the
             * previous single-user format.
             */

            if (
                parsed &&
                typeof parsed === "object"
            ) {

                return [parsed];

            }


            return [];

        } catch (error) {

            console.error(
                "Unable to read registered accounts:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =====================================================
       LOGIN MESSAGE
    ===================================================== */

    function showMessage(
        message,
        type
    ) {

        if (!loginMessage) {

            return;

        }


        loginMessage.textContent =
            message;


        loginMessage.className =
            "login-message show " +
            type;

    }


    /* =====================================================
       CLEAR LOGIN MESSAGE
    ===================================================== */

    function clearMessage() {

        if (!loginMessage) {

            return;

        }


        loginMessage.textContent =
            "";


        loginMessage.className =
            "login-message";

    }


    /* =====================================================
       CLEAR LOGIN ERRORS
    ===================================================== */

    function clearErrors() {

        document
            .querySelectorAll(
                ".error-message"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        "";

                }
            );

    }


    /* =====================================================
       FORGOT PASSWORD MESSAGE
    ===================================================== */

    function showForgotPasswordMessage(
        message,
        type
    ) {

        if (
            !forgotPasswordMessage
        ) {

            return;

        }


        forgotPasswordMessage.textContent =
            message;


        forgotPasswordMessage.className =
            "forgot-password-message show " +
            type;

    }


    /* =====================================================
       CLEAR FORGOT PASSWORD MESSAGE
    ===================================================== */

    function clearForgotPasswordMessage() {

        if (
            !forgotPasswordMessage
        ) {

            return;

        }


        forgotPasswordMessage.textContent =
            "";


        forgotPasswordMessage.className =
            "forgot-password-message";

    }

    /* =====================================================
       GOOGLE SIGN-IN
    ===================================================== */
    const googleLoginBtn = document.getElementById("googleLoginBtn");
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", async function () {
            clearErrors();
            clearMessage();
            showMessage("Opening Google Sign-In...", "info");

            try {
                if (window.CampusConnectFirebase && window.CampusConnectFirebase.loginWithGoogle) {
                    const { user, profile } = await window.CampusConnectFirebase.loginWithGoogle(selectedRole);
                    if (profile) {
                        sessionStorage.setItem(CONFIG.SESSION_LOGIN_KEY, "true");
                        sessionStorage.setItem(CONFIG.SESSION_ROLE_KEY, profile.role || selectedRole);
                        sessionStorage.setItem(CONFIG.SESSION_USER_KEY, JSON.stringify(profile));

                        showMessage("Google Sign-In successful. Redirecting...", "success");

                        const redirectPages = {
                            student: "../Dashboard/Student/student-dashboard.html",
                            faculty: "../Dashboard/Faculty/faculty-dashboard.html",
                            admin: "../Dashboard/Admin/admin-dashboard.html"
                        };

                        setTimeout(function () {
                            window.location.href = redirectPages[profile.role] || redirectPages[selectedRole];
                        }, 600);
                    }
                } else {
                    showMessage("Firebase is initializing. Please try again in a moment.", "error");
                }
            } catch (googleError) {
                console.warn("Google Sign-In error:", googleError);
                if (googleError.code === "auth/popup-closed-by-user") {
                    showMessage("Google sign-in popup was closed.", "info");
                } else {
                    showMessage("Google sign-in encountered an error. Please try again.", "error");
                }
            }
        });
    }

});