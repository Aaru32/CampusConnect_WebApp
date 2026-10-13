/* ==========================================
   CAMPUSCONNECT - MY ID
========================================== */


/* ==========================================
   LOAD CURRENT STUDENT
========================================== */

async function loadMyID() {

    try {

        /*
         * Java backend should identify the
         * currently logged-in student.
         *
         * Example response:
         *
         * {
         *   "idNo": "GWP/01",
         *   "name": "SHALINI KUMARI",
         *   "fatherName": "...",
         *   "dob": "...",
         *   "rollNumber": "...",
         *   "registrationNumber": "...",
         *   "branch": "Computer Science & Engineering",
         *   "address": "...",
         *   "mobile": "...",
         *   "session": "2025-2028",
         *   "bloodGroup": "B+",
         *   "photo": "../Assets/student-photo.jpg"
         * }
         */

        const response = await fetch(
            "http://localhost:8080/api/student/my-id",
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load student information."
            );

        }


        const student = await response.json();


        displayStudent(student);

    }

    catch (error) {

        console.error(
            "My ID Error:",
            error
        );


        /*
         * Temporary fallback for testing.
         *
         * If you have already stored the logged-in
         * student's data in localStorage, it will
         * be loaded from there.
         */

        const savedStudent =
            localStorage.getItem(
                "loggedInStudent"
            );


        if (savedStudent) {

            try {

                const student =
                    JSON.parse(savedStudent);

                displayStudent(student);

            }

            catch (error) {

                console.error(
                    "Invalid student data:",
                    error
                );

            }

        }

    }

}


/* ==========================================
   DISPLAY STUDENT DATA
========================================== */

function displayStudent(student) {


    /*
     * Student ID
     *
     * IMPORTANT:
     *
     * Do NOT generate a random number here.
     *
     * Backend/database should provide:
     *
     * GWP/01
     * GWP/02
     * GWP/03
     * GWP/04
     * ...
     */

    setValue(
        "studentId",
        student.idNo
    );


    /* Student name */

    setValue(
        "studentName",
        student.name
    );


    /* Father's name */

    setValue(
        "fatherName",
        student.fatherName
    );


    /* Date of birth */

    setValue(
        "dob",
        student.dob
    );


    /* Roll number */

    setValue(
        "rollNumber",
        student.rollNumber
    );


    /* Registration number */

    setValue(
        "registrationNumber",
        student.registrationNumber
    );


    /* Branch */

    setValue(
        "branch",
        student.branch
    );


    /* Address */

    setValue(
        "address",
        student.address
    );


    /* Mobile number */

    setValue(
        "mobile",
        student.mobile
    );


    /* Session */

    setValue(
        "session",
        student.session
    );


    /* Blood group */

    setValue(
        "bloodGroup",
        student.bloodGroup
    );


    /* ======================================
       STUDENT PHOTO
    ====================================== */

    const photo =
        document.getElementById(
            "studentPhoto"
        );


    if (
        photo &&
        student.photo &&
        student.photo.trim() !== ""
    ) {

        photo.src =
            student.photo;

    }

}


/* ==========================================
   SAFE VALUE SETTER
========================================== */

function setValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        element.textContent = "—";

        return;

    }


    element.textContent = value;

}


/* ==========================================
   DOWNLOAD ID CARD
========================================== */

async function downloadID() {

    const card =
        document.getElementById(
            "idCard"
        );


    const button =
        document.getElementById(
            "downloadBtn"
        );


    if (!card) {

        console.error(
            "ID card element not found."
        );

        return;

    }


    try {


        /* Disable button while generating */

        if (button) {

            button.disabled = true;

            button.textContent =
                "Preparing ID...";

        }


        /*
         * Wait briefly so that the student's
         * photo/data is completely rendered.
         */

        await new Promise(
            resolve =>
                setTimeout(resolve, 200)
        );


        /*
         * Convert the EXACT visible ID card
         * into an image.
         */

        const canvas =
            await html2canvas(
                card,
                {
                    scale: 3,

                    useCORS: true,

                    allowTaint: false,

                    backgroundColor:
                        "#ffffff",

                    logging: false
                }
            );


        /*
         * Create download link
         */

        const link =
            document.createElement("a");


        /*
         * Use student's ID as filename
         */

        const idElement =
            document.getElementById(
                "studentId"
            );


        const idNo =
            idElement
                ? idElement.textContent.trim()
                : "CampusConnect-ID";


        /*
         * Remove characters that are not
         * suitable for filenames.
         */

        const safeId =
            idNo.replace(
                /[^a-zA-Z0-9-_]/g,
                "_"
            );


        link.download =
            safeId + ".png";


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        link.click();


    }

    catch (error) {

        console.error(
            "ID download error:",
            error
        );


        alert(
            "Unable to download the ID card."
        );

    }


    finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                "↓ &nbsp; Download ID";

        }

    }

}


/* ==========================================
   BACK BUTTON
========================================== */

function goBack() {

    window.history.back();

}


/* ==========================================
   PAGE START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadMyID();

    }
);