/* =========================================================
   CAMPUSCONNECT
   ADD STUDENT
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {
        addStudent: "/admin/students",
        filters: "/admin/students/filters"
    }

};


/* =========================================================
   STATE
========================================================= */

const state = {
    photoFile: null
};


/* =========================================================
   DOM
========================================================= */

const form = document.getElementById("studentForm");

const backButton = document.getElementById("backButton");
const refreshButton = document.getElementById("refreshButton");
const cancelButton = document.getElementById("cancelButton");

const profilePhoto = document.getElementById("profilePhoto");
const photoPreview = document.getElementById("photoPreview");

const accommodationStatus =
    document.getElementById("accommodationStatus");

const hostelDetails =
    document.getElementById("hostelDetails");

const department =
    document.getElementById("department");

const branch =
    document.getElementById("branch");

const academicSession =
    document.getElementById("academicSession");

const saveStudentButton =
    document.getElementById("saveStudentButton");


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeEvents();

    loadFormOptions();

});


/* =========================================================
   EVENTS
========================================================= */

function initializeEvents() {

    backButton.addEventListener("click", goBack);

    refreshButton.addEventListener("click", () => {
        window.location.reload();
    });

    cancelButton.addEventListener("click", goBack);

    accommodationStatus.addEventListener(
        "change",
        handleAccommodationChange
    );

    profilePhoto.addEventListener(
        "change",
        handlePhotoChange
    );

    form.addEventListener(
        "submit",
        handleSubmit
    );

}


/* =========================================================
   BACK
========================================================= */

function goBack() {

    if (window.history.length > 1) {
        window.history.back();
        return;
    }

    window.location.href = "student-management.html";

}


/* =========================================================
   HOSTEL LOGIC
========================================================= */

function handleAccommodationChange() {

    const isHosteller =
        accommodationStatus.value === "Hosteller";

    hostelDetails.hidden = !isHosteller;

    if (!isHosteller) {

        document.getElementById("hostelName").value = "";
        document.getElementById("roomNumber").value = "";
        document.getElementById("hostelBlock").value = "";
        document.getElementById("bedNumber").value = "";
        document.getElementById("hostelAdmissionDate").value = "";

    }

}


/* =========================================================
   PHOTO
========================================================= */

function handlePhotoChange(event) {

    const file = event.target.files[0];

    if (!file) {
        state.photoFile = null;

        photoPreview.innerHTML =
            '<i class="fa-solid fa-user"></i>';

        return;
    }

    state.photoFile = file;

    const reader = new FileReader();

    reader.onload = function () {

        photoPreview.innerHTML = `
            <img
                src="${reader.result}"
                alt="Student profile preview"
            >
        `;

    };

    reader.readAsDataURL(file);

}


/* =========================================================
   LOAD FORM OPTIONS
========================================================= */

async function loadFormOptions() {

    try {

        if (!CONFIG.API_BASE_URL) {
            return;
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.filters}`
        );

        if (!response.ok) {
            throw new Error("Unable to load form options.");
        }

        const data = await response.json();

        populateSelect(
            department,
            data.departments || data.department
        );

        populateSelect(
            branch,
            data.branches || data.branch
        );

        populateSelect(
            academicSession,
            data.sessions || data.academicSessions
        );

    } catch (error) {

        console.error(
            "Form options error:",
            error
        );

    }

}


/* =========================================================
   SELECT POPULATION
========================================================= */

function populateSelect(selectElement, values) {

    if (!selectElement || !Array.isArray(values)) {
        return;
    }

    values.forEach(value => {

        const option =
            document.createElement("option");

        if (typeof value === "object") {

            option.value =
                value.value ??
                value.id ??
                value.name ??
                "";

            option.textContent =
                value.label ??
                value.name ??
                value.value ??
                "";

        } else {

            option.value = value;
            option.textContent = value;

        }

        if (option.value) {
            selectElement.appendChild(option);
        }

    });

}


/* =========================================================
   FORM DATA
========================================================= */

function collectFormData() {

    const data = {};

    const formData = new FormData(form);

    formData.forEach((value, key) => {

        if (key === "profilePhoto") {
            return;
        }

        data[key] = value;

    });


    /*
     * Hostel fields are only sent when
     * the student is a hosteller.
     */

    if (
        data.accommodationStatus !==
        "Hosteller"
    ) {

        delete data.hostelName;
        delete data.roomNumber;
        delete data.hostelBlock;
        delete data.bedNumber;
        delete data.hostelAdmissionDate;

    }


    return data;

}


/* =========================================================
   SUBMIT
========================================================= */

async function handleSubmit(event) {

    event.preventDefault();

    if (!form.checkValidity()) {

        form.reportValidity();

        return;
    }


    const studentData =
        collectFormData();


    setSavingState(true);


    try {

        if (!CONFIG.API_BASE_URL) {

            /*
             * Backend is not connected yet.
             * No fake student record is created.
             */

            showMessage(
                "Student API is not connected yet. The form is ready for the Java backend.",
                "info"
            );

            setSavingState(false);

            return;
        }


        const response = await fetch(
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.addStudent}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(studentData)
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to create student record."
            );

        }


        const result =
            await response.json();


        showMessage(
            "Student record created successfully.",
            "success"
        );


        /*
         * If backend returns the student ID,
         * open that student's profile.
         */

        const studentId =
            result.id ??
            result.studentId ??
            result.student_id ??
            result.student?.id ??
            result.data?.id;


        if (studentId) {

            setTimeout(() => {

                window.location.href =
                    `student-profile.html?id=${encodeURIComponent(studentId)}`;

            }, 900);

        }


    } catch (error) {

        console.error(
            "Add student error:",
            error
        );

        showMessage(
            "The student record could not be created. Please check the backend connection.",
            "error"
        );

    } finally {

        setSavingState(false);

    }

}


/* =========================================================
   BUTTON STATE
========================================================= */

function setSavingState(isSaving) {

    saveStudentButton.disabled =
        isSaving;

    if (isSaving) {

        saveStudentButton.innerHTML = `
            <i class="fa-solid fa-arrows-rotate fa-spin"></i>
            Saving...
        `;

    } else {

        saveStudentButton.innerHTML = `
            <i class="fa-solid fa-user-plus"></i>
            Add Student
        `;

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message, type) {

    const existing =
        document.querySelector(".form-message");

    if (existing) {
        existing.remove();
    }


    const messageBox =
        document.createElement("div");

    messageBox.className =
        `form-message ${type}`;

    messageBox.textContent =
        message;


    form.prepend(messageBox);


    setTimeout(() => {

        messageBox.remove();

    }, 5000);

}