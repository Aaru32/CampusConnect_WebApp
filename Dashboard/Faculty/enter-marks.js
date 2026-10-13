/* =========================================
CAMPUSCONNECT
FACULTY ENTER MARKS
FRONTEND + BACKEND READY
========================================= */

/* =========================================
ELEMENTS
========================================= */

const backButton =
document.getElementById("backButton");

const refreshButton =
document.getElementById("refreshButton");

const academicSession =
document.getElementById("academicSession");

const semester =
document.getElementById("semester");

const branch =
document.getElementById("branch");

const subject =
document.getElementById("subject");

const assessment =
document.getElementById("assessment");

const maximumMarks =
document.getElementById("maximumMarks");

const loadStudentsButton =
document.getElementById("loadStudentsButton");

const clearSelectionButton =
document.getElementById("clearSelectionButton");

const statusBar =
document.getElementById("statusBar");

const marksPanel =
document.getElementById("marksPanel");

const marksTableBody =
document.getElementById("marksTableBody");

const tableEmptyState =
document.getElementById("tableEmptyState");

const studentCount =
document.getElementById("studentCount");

const maximumMarksDisplay =
document.getElementById(
"maximumMarksDisplay"
);

const enteredCount =
document.getElementById("enteredCount");

const pendingCount =
document.getElementById("pendingCount");

const tableSubtitle =
document.getElementById("tableSubtitle");

const saveDraftButton =
document.getElementById("saveDraftButton");

const submitMarksButton =
document.getElementById("submitMarksButton");

const saveDraftButtonBottom =
document.getElementById(
"saveDraftButtonBottom"
);

const submitMarksButtonBottom =
document.getElementById(
"submitMarksButtonBottom"
);

const confirmationModal =
document.getElementById(
"confirmationModal"
);

const modalClose =
document.getElementById("modalClose");

const modalCancel =
document.getElementById("modalCancel");

const modalConfirm =
document.getElementById("modalConfirm");

const modalTitle =
document.getElementById("modalTitle");

const modalMessage =
document.getElementById(
"modalMessage"
);

/* =========================================
CONFIGURATION
========================================= */

const CONFIG = {

/*
    Keep empty until Java backend is connected.
*/

API_BASE_URL: "",

endpoints: {

    assignedSessions:
        "/faculty/marks/sessions",

    assignedSemesters:
        "/faculty/marks/semesters",

    assignedClasses:
        "/faculty/marks/classes",

    assignedSubjects:
        "/faculty/marks/subjects",

    students:
        "/faculty/marks/students",

    saveDraft:
        "/faculty/marks/draft",

    submit:
        "/faculty/marks/submit"

}

};

/* =========================================
BACK NAVIGATION
========================================= */

backButton.addEventListener(
"click",
function () {

    if (window.history.length > 1) {

        window.history.back();

    } else {

        window.location.href =
            "faculty-dashboard.html";

    }

}

);

/* =========================================
REFRESH
========================================= */

refreshButton.addEventListener(
"click",
function () {

    refreshButton.disabled = true;

    refreshButton
        .querySelector("i")
        .classList.add("fa-spin");


    setTimeout(
        function () {

            refreshButton.disabled = false;

            refreshButton
                .querySelector("i")
                .classList.remove(
                    "fa-spin"
                );

            /*
                When backend is connected,
                reload the assigned data here.
            */

            loadInitialData();

        },
        500
    );

}

);

/* =========================================
INITIAL DATA
========================================= */

function loadInitialData() {

/*
    BACKEND INTEGRATION

    Later load only the academic data
    assigned to the authenticated faculty.

    Example:

    GET /faculty/marks/sessions
    GET /faculty/marks/semesters
    GET /faculty/marks/classes
    GET /faculty/marks/subjects

    No student or faculty identity should
    be hard-coded in this frontend.
*/

/*
    Empty dropdowns are intentional until
    backend data is available.
*/

}

/* =========================================
LOAD STUDENTS
========================================= */

loadStudentsButton.addEventListener(
"click",
function () {

    const session =
        academicSession.value;

    const selectedSemester =
        semester.value;

    const selectedBranch =
        branch.value;

    const selectedSubject =
        subject.value;

    const selectedAssessment =
        assessment.value;

    const maxMarks =
        Number(maximumMarks.value);


    if (
        !session ||
        !selectedSemester ||
        !selectedBranch ||
        !selectedSubject ||
        !selectedAssessment ||
        !maxMarks
    ) {

        alert(
            "Please select all academic details and enter the maximum marks."
        );

        return;
    }


    if (maxMarks <= 0) {

        alert(
            "Maximum marks must be greater than zero."
        );

        return;
    }


    /*
        BACKEND INTEGRATION

        Later request:

        GET /faculty/marks/students

        with the selected academic parameters.

        The backend should return only students
        belonging to the faculty's authorized
        class/subject.
    */


    /*
        Do not insert fake students here.

        Until the API is connected, the page
        intentionally displays an empty state.
    */

    marksPanel.hidden = false;

    statusBar.hidden = false;

    marksTableBody.innerHTML = "";

    tableEmptyState.hidden = false;

    studentCount.textContent = "0";

    enteredCount.textContent = "0";

    pendingCount.textContent = "0";

    maximumMarksDisplay.textContent =
        maxMarks;

    tableSubtitle.textContent =
        "No student records are currently available. Connect the faculty marks API to load assigned students.";

}

);

/* =========================================
CLEAR SELECTION
========================================= */

clearSelectionButton.addEventListener(
"click",
function () {

    academicSession.value = "";

    semester.value = "";

    branch.value = "";

    subject.value = "";

    assessment.value = "";

    maximumMarks.value = "";

    marksPanel.hidden = true;

    statusBar.hidden = true;

    marksTableBody.innerHTML = "";

}

);

/* =========================================
MARK INPUT VALIDATION
========================================= */

function validateMarksInput(input) {

const value =
    input.value.trim();

const max =
    Number(maximumMarks.value);


input.classList.remove(
    "invalid"
);


if (value === "") {
    return true;
}


const marks =
    Number(value);


if (
    Number.isNaN(marks) ||
    marks < 0 ||
    marks > max
) {

    input.classList.add(
        "invalid"
    );

    return false;
}


return true;

}

/* =========================================
UPDATE STATUS COUNTS
========================================= */

function updateCounts() {

const inputs =
    document.querySelectorAll(
        ".marks-input"
    );


let entered = 0;

let pending = 0;


inputs.forEach(
    function (input) {

        if (
            input.value.trim() !== ""
        ) {

            entered++;

        } else {

            pending++;

        }

    }
);


enteredCount.textContent =
    entered;

pendingCount.textContent =
    pending;

studentCount.textContent =
    inputs.length;


document
    .querySelectorAll(
        ".result-status"
    )
    .forEach(
        function (status) {

            const input =
                status
                    .closest("tr")
                    .querySelector(
                        ".marks-input"
                    );


            if (
                input &&
                input.value.trim() !== ""
            ) {

                status.textContent =
                    "Entered";

                status.classList.add(
                    "entered"
                );

            } else {

                status.textContent =
                    "Pending";

                status.classList.remove(
                    "entered"
                );

            }

        }
    );

}

/* =========================================
MARK INPUT EVENTS
========================================= */

marksTableBody.addEventListener(
"input",
function (event) {

    if (
        event.target.classList.contains(
            "marks-input"
        )
    ) {

        validateMarksInput(
            event.target
        );

        updateCounts();

    }

}

);

/* =========================================
SAVE DRAFT
========================================= */

function saveDraft() {

const inputs =
    document.querySelectorAll(
        ".marks-input"
    );


if (inputs.length === 0) {

    alert(
        "There are no student records to save."
    );

    return;
}


let valid = true;


inputs.forEach(
    function (input) {

        if (
            !validateMarksInput(input)
        ) {

            valid = false;

        }

    }
);


if (!valid) {

    alert(
        "Please correct the invalid marks before saving."
    );

    return;
}


/*
    BACKEND INTEGRATION

    Later send:

    POST /faculty/marks/draft

    Payload should contain the selected
    assessment and student marks.

    Faculty identity must come from
    authenticated backend session/token.
*/


alert(
    "Marks draft is ready to be saved through the backend."
);

}

saveDraftButton.addEventListener(
"click",
saveDraft
);

saveDraftButtonBottom.addEventListener(
"click",
saveDraft
);

/* =========================================
OPEN SUBMIT CONFIRMATION
========================================= */

function openSubmitConfirmation() {

const inputs =
    document.querySelectorAll(
        ".marks-input"
    );


if (inputs.length === 0) {

    alert(
        "There are no student records to submit."
    );

    return;
}


let valid = true;


inputs.forEach(
    function (input) {

        if (
            !validateMarksInput(input)
        ) {

            valid = false;

        }

    }
);


if (!valid) {

    alert(
        "Please correct the invalid marks before submitting."
    );

    return;
}


modalTitle.textContent =
    "Submit Marks";


modalMessage.textContent =
    "Are you sure you want to submit the entered marks? Please verify the marks before final submission.";


confirmationModal.hidden = false;

}

/* =========================================
SUBMIT BUTTONS
========================================= */

submitMarksButton.addEventListener(
"click",
openSubmitConfirmation
);

submitMarksButtonBottom.addEventListener(
"click",
openSubmitConfirmation
);

/* =========================================
CONFIRM SUBMISSION
========================================= */

modalConfirm.addEventListener(
"click",
function () {

    /*
        BACKEND INTEGRATION

        Later:

        POST /faculty/marks/submit

        The backend should verify:

        1. Authenticated faculty
        2. Faculty's assigned subject
        3. Faculty's assigned class
        4. Valid student records
        5. Valid marks range
        6. Submission permissions
    */


    confirmationModal.hidden = true;


    alert(
        "Marks are ready for backend submission."
    );

}

);

/* =========================================
CLOSE MODAL
========================================= */

function closeModal() {

confirmationModal.hidden = true;

}

modalClose.addEventListener(
"click",
closeModal
);

modalCancel.addEventListener(
"click",
closeModal
);

confirmationModal.addEventListener(
"click",
function (event) {

    if (
        event.target ===
        confirmationModal
    ) {

        closeModal();

    }

}

);

/* =========================================
INITIALIZATION
========================================= */

loadInitialData();