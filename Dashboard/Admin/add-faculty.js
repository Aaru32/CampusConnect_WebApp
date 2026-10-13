/* =========================================================
   CAMPUSCONNECT
   ADD FACULTY
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {
        addFaculty: "/admin/faculty",
        filters: "/admin/faculty/filters"
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

const form =
    document.getElementById("facultyForm");

const backButton =
    document.getElementById("backButton");

const refreshButton =
    document.getElementById("refreshButton");

const cancelButton =
    document.getElementById("cancelButton");

const profilePhoto =
    document.getElementById("profilePhoto");

const photoPreview =
    document.getElementById("photoPreview");

const department =
    document.getElementById("department");

const designation =
    document.getElementById("designation");

const academicSession =
    document.getElementById("academicSession");

const saveFacultyButton =
    document.getElementById("saveFacultyButton");


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

    backButton.addEventListener(
        "click",
        goBack
    );


    refreshButton.addEventListener(
        "click",
        () => {
            window.location.reload();
        }
    );


    cancelButton.addEventListener(
        "click",
        goBack
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


    window.location.href =
        "faculty-management.html";

}


/* =========================================================
   PHOTO
========================================================= */

function handlePhotoChange(event) {

    const file =
        event.target.files[0];


    if (!file) {

        state.photoFile = null;

        photoPreview.innerHTML =
            '<i class="fa-solid fa-user"></i>';

        return;
    }


    state.photoFile = file;


    const reader =
        new FileReader();


    reader.onload = function () {

        photoPreview.innerHTML = `
            <img
                src="${reader.result}"
                alt="Faculty profile preview"
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


        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.filters}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load form options."
            );

        }


        const data =
            await response.json();


        populateSelect(
            department,
            data.departments ||
            data.department
        );


        populateSelect(
            designation,
            data.designations ||
            data.designation
        );


        populateSelect(
            academicSession,
            data.sessions ||
            data.academicSessions
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

function populateSelect(
    selectElement,
    values
) {

    if (
        !selectElement ||
        !Array.isArray(values)
    ) {

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

            selectElement.appendChild(
                option
            );

        }

    });

}


/* =========================================================
   FORM DATA
========================================================= */

function collectFormData() {

    const data = {};

    const formData =
        new FormData(form);


    formData.forEach((value, key) => {

        if (key === "profilePhoto") {
            return;
        }


        data[key] = value;

    });


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


    const facultyData =
        collectFormData();


    setSavingState(true);


    try {

        if (!CONFIG.API_BASE_URL) {

            /*
             * Backend is not connected yet.
             * No fake faculty record is created.
             */

            showMessage(
                "Faculty API is not connected yet. The form is ready for the Java backend.",
                "info"
            );


            setSavingState(false);

            return;
        }


        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.addFaculty}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body:
                        JSON.stringify(
                            facultyData
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to create faculty record."
            );

        }


        const result =
            await response.json();


        showMessage(
            "Faculty record created successfully.",
            "success"
        );


        /*
         * If backend returns the faculty ID,
         * open that faculty's profile.
         */

        const facultyId =
            result.id ??
            result.facultyId ??
            result.faculty_id ??
            result.faculty?.id ??
            result.data?.id;


        if (facultyId) {

            setTimeout(() => {

                window.location.href =
                    `faculty-profile.html?id=${encodeURIComponent(facultyId)}`;

            }, 900);

        }


    } catch (error) {

        console.error(
            "Add faculty error:",
            error
        );


        showMessage(
            "The faculty record could not be created. Please check the backend connection.",
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

    saveFacultyButton.disabled =
        isSaving;


    if (isSaving) {

        saveFacultyButton.innerHTML = `
            <i class="fa-solid fa-arrows-rotate fa-spin"></i>
            Saving...
        `;

    } else {

        saveFacultyButton.innerHTML = `
            <i class="fa-solid fa-user-plus"></i>
            Add Faculty
        `;

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    const existing =
        document.querySelector(
            ".form-message"
        );


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