/* =========================================================
   CAMPUSCONNECT - REGISTER PAGE JAVASCRIPT
   FRONTEND DEVELOPMENT VERSION
   API READY FOR FUTURE JAVA + MYSQL BACKEND
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const roleCards = document.querySelectorAll(".role-card");

    const studentFields = document.getElementById("studentFields");
    const facultyFields = document.getElementById("facultyFields");
    const adminFields = document.getElementById("adminFields");

    const registerForm = document.getElementById("registerForm");
    const registerButton = document.getElementById("registerButton");

    const formMessage = document.getElementById("formMessage");

    const mobile = document.getElementById("mobile");

    const verifyAuthorization =
        document.getElementById("verifyAuthorization");

    const authorizationCode =
        document.getElementById("authorizationCode");

    const authorizationStatus =
        document.getElementById("authorizationStatus");


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

        STORAGE_KEY: "campusConnectRegistration",

        ROLE_KEY: "campusConnectRole"

    };


    /* =====================================================
       STATE
    ===================================================== */

    let selectedRole = "student";

    let authorizationVerified = false;


    /* =====================================================
       ROLE SWITCHING
    ===================================================== */

    roleCards.forEach(function (card) {

        card.addEventListener("click", function () {

            roleCards.forEach(function (item) {
                item.classList.remove("active");
            });

            card.classList.add("active");

            selectedRole = card.dataset.role;

            studentFields.style.display = "none";
            facultyFields.style.display = "none";
            adminFields.style.display = "none";

            authorizationVerified = false;


            if (selectedRole === "student") {

                studentFields.style.display = "block";

                registerButton.querySelector("span").textContent =
                    "Create Student Account";
            }


            if (selectedRole === "faculty") {

                facultyFields.style.display = "block";

                registerButton.querySelector("span").textContent =
                    "Create Faculty Account";
            }


            if (selectedRole === "admin") {

                adminFields.style.display = "block";

                registerButton.querySelector("span").textContent =
                    "Request Admin Authorization";

                if (authorizationStatus) {

                    authorizationStatus.textContent =
                        "Authorization verification required";

                    authorizationStatus.classList.remove("success");
                }
            }


            clearMessage();

        });

    });


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    document.querySelectorAll(".password-toggle")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const targetId = button.dataset.target;

                const input =
                    document.getElementById(targetId);

                const icon =
                    button.querySelector("i");


                if (!input || !icon) {
                    return;
                }


                if (input.type === "password") {

                    input.type = "text";

                    icon.classList.remove("fa-eye");

                    icon.classList.add("fa-eye-slash");

                } else {

                    input.type = "password";

                    icon.classList.remove("fa-eye-slash");

                    icon.classList.add("fa-eye");

                }

            });

        });


    /* =====================================================
       MOBILE NUMBER
    ===================================================== */

    if (mobile) {

        mobile.addEventListener("input", function () {

            mobile.value =
                mobile.value.replace(/\D/g, "");

            if (mobile.value.length > 10) {

                mobile.value =
                    mobile.value.slice(0, 10);
            }

        });

    }


    /* =====================================================
       ADMIN AUTHORIZATION
    ===================================================== */

    if (verifyAuthorization) {

        verifyAuthorization.addEventListener("click", function () {

            const code =
                authorizationCode.value.trim();


            if (code === "") {

                authorizationStatus.textContent =
                    "Please enter the authorization code.";

                authorizationStatus.classList.remove("success");

                authorizationCode.focus();

                authorizationVerified = false;

                return;
            }


            /*
             * IMPORTANT
             *
             * Frontend cannot securely verify an admin
             * authorization code.
             *
             * This only records that the user has entered
             * a code for the future backend verification flow.
             */

            authorizationVerified = true;

            authorizationStatus.textContent =
                "Authorization request submitted for verification.";

            authorizationStatus.classList.add("success");

        });

    }


    /* =====================================================
       FORM SUBMISSION
    ===================================================== */

    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {

            event.preventDefault();

            clearMessage();


            /* =================================================
               COMMON FIELDS
            ================================================= */

            const fullName =
                document.getElementById("fullName").value.trim();


            const email =
                document.getElementById("email").value
                    .trim()
                    .toLowerCase();


            const mobileNumber =
                document.getElementById("mobile").value.trim();


            const password =
                document.getElementById("password").value;


            const confirmPassword =
                document.getElementById("confirmPassword").value;


            const terms =
                document.getElementById("terms").checked;


            /* =================================================
               COMMON VALIDATION
            ================================================= */

            if (fullName === "") {

                showError(
                    "Please enter your full name."
                );

                return;
            }


            if (
                email === "" ||
                !isValidEmail(email)
            ) {

                showError(
                    "Please enter a valid email address."
                );

                return;
            }


            if (
                mobileNumber !== "" &&
                !/^[0-9]{10}$/.test(mobileNumber)
            ) {

                showError(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            /* =================================================
               STUDENT
            ================================================= */

            let rollNo = "";
            let branch = "";


            if (selectedRole === "student") {

                rollNo =
                    document.getElementById("rollNo")
                        .value
                        .trim();


                branch =
                    document.getElementById("studentBranch")
                        .value;


                if (rollNo === "") {

                    showError(
                        "Please enter your Roll Number / Student ID."
                    );

                    return;
                }


                if (branch === "") {

                    showError(
                        "Please select your branch."
                    );

                    return;
                }

            }


            /* =================================================
               FACULTY
            ================================================= */

            let employeeId = "";
            let department = "";
            let designation = "";


            if (selectedRole === "faculty") {

                employeeId =
                    document.getElementById("employeeId")
                        .value
                        .trim();


                department =
                    document.getElementById("facultyDepartment")
                        .value;


                designation =
                    document.getElementById("facultyDesignation")
                        .value;


                if (employeeId === "") {

                    showError(
                        "Please enter your Employee ID."
                    );

                    return;
                }


                if (department === "") {

                    showError(
                        "Please select your department."
                    );

                    return;
                }


                if (designation === "") {

                    showError(
                        "Please select your designation."
                    );

                    return;
                }

            }


            /* =================================================
               ADMIN
            ================================================= */

            let adminId = "";
            let adminDesignation = "";
            let adminAuthorizationCode = "";


            if (selectedRole === "admin") {

                adminId =
                    document.getElementById("adminId")
                        .value
                        .trim();


                adminDesignation =
                    document.getElementById("adminDesignation")
                        .value;


                adminAuthorizationCode =
                    document.getElementById("authorizationCode")
                        .value
                        .trim();


                if (adminId === "") {

                    showError(
                        "Please enter your Admin / Employee ID."
                    );

                    return;
                }


                if (adminDesignation === "") {

                    showError(
                        "Please select your designation."
                    );

                    return;
                }


                if (adminAuthorizationCode === "") {

                    showError(
                        "Please enter the authorization code."
                    );

                    return;
                }


                if (!authorizationVerified) {

                    showError(
                        "Please verify your authorization before submitting."
                    );

                    return;
                }

            }


            /* =================================================
               PASSWORD
            ================================================= */

            if (password.length < 8) {

                showError(
                    "Password must contain at least 8 characters."
                );

                return;
            }


            if (password !== confirmPassword) {

                showError(
                    "Password and Confirm Password do not match."
                );

                return;
            }


            /* =================================================
               TERMS
            ================================================= */

            if (!terms) {

                showError(
                    "Please accept the Terms & Conditions and Privacy Policy."
                );

                return;
            }


            /* =================================================
               USER OBJECT
            ================================================= */

            const user = {

                role: selectedRole,

                name: fullName,

                email: email,

                mobile: mobileNumber,

                password: password,

                registeredAt:
                    new Date().toISOString()

            };


            /* =================================================
               ROLE-SPECIFIC DATA
            ================================================= */

            if (selectedRole === "student") {

                user.rollNo = rollNo;

                user.branch = branch;

            }


            if (selectedRole === "faculty") {

                user.employeeId = employeeId;

                user.department = department;

                user.designation = designation;

            }


            if (selectedRole === "admin") {

                user.adminId = adminId;

                user.designation =
                    adminDesignation;

                user.authorizationStatus =
                    "PENDING_APPROVAL";

            }


            /* =================================================
               EXISTING USERS
            ================================================= */

            let users = getRegisteredUsers();


            /*
             * Prevent duplicate email registration.
             */

            const duplicateUser =
                users.find(function (existingUser) {

                    return (
                        existingUser.email &&
                        existingUser.email.toLowerCase() === email
                    );

                });


            if (duplicateUser) {

                showError(
                    "An account with this email already exists. Please use another email or use Forgot Password."
                );

                return;
            }


            /* =================================================
               SAVE ACCOUNT
            ================================================= */

            users.push(user);


            localStorage.setItem(
                CONFIG.STORAGE_KEY,
                JSON.stringify(users)
            );


            localStorage.setItem(
                CONFIG.ROLE_KEY,
                selectedRole
            );


            /* =================================================
               ADMIN SUCCESS
            ================================================= */

            if (selectedRole === "admin") {

                showSuccess(
                    "Admin registration request submitted. Your account will remain pending until authorized."
                );


                registerButton.disabled = true;


                registerButton.querySelector("span")
                    .textContent =
                    "Request Submitted";


                return;
            }


            /* =================================================
               NORMAL SUCCESS
            ================================================= */

            showSuccess(
                "Registration successful. Redirecting to Login..."
            );


            registerButton.disabled = true;


            setTimeout(function () {

                window.location.href =
                    CONFIG.LOGIN_PAGE +
                    "?role=" +
                    encodeURIComponent(selectedRole);

            }, 1200);

        });

    }


    /* =====================================================
       GET REGISTERED USERS
    ===================================================== */

    function getRegisteredUsers() {

        const stored =
            localStorage.getItem(
                CONFIG.STORAGE_KEY
            );


        if (!stored) {
            return [];
        }


        try {

            const parsed =
                JSON.parse(stored);


            /*
             * Support the previous version where
             * only one object was stored.
             */

            if (Array.isArray(parsed)) {

                return parsed;
            }


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
       ERROR
    ===================================================== */

    function showError(message) {

        formMessage.textContent =
            message;

        formMessage.className =
            "form-message show error";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    function showSuccess(message) {

        formMessage.textContent =
            message;

        formMessage.className =
            "form-message show success";

    }


    /* =====================================================
       CLEAR MESSAGE
    ===================================================== */

    function clearMessage() {

        formMessage.textContent = "";

        formMessage.className =
            "form-message";

    }

});