/* =====================================================
   CAMPUSCONNECT
   ASSIGNMENT MODULE
===================================================== */


/* =====================================================
   APPLICATION STATE
   -----------------------------------------------------
   Assignment data will eventually come from the
   Java backend / API.

   Keep this array empty for now.
===================================================== */

let assignments = [];


/* =====================================================
   CURRENT STATE
===================================================== */

let currentFilter = "all";
let searchTerm = "";
let selectedAssignment = null;
let selectedFile = null;


/* =====================================================
   DOM ELEMENTS
===================================================== */

const assignmentList =
    document.getElementById("assignmentList");

const emptyState =
    document.getElementById("emptyState");

const resultText =
    document.getElementById("resultText");

const searchInput =
    document.getElementById("searchInput");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const modal =
    document.getElementById("assignmentModal");

const closeModal =
    document.getElementById("closeModal");

const assignmentFile =
    document.getElementById("assignmentFile");

const selectedFileBox =
    document.getElementById("selectedFile");

const selectedFileName =
    document.getElementById("selectedFileName");

const submitAssignmentBtn =
    document.getElementById("submitAssignmentBtn");


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeAssignmentModule
);


function initializeAssignmentModule() {

    updateDashboardCounts();

    renderAssignments();

    setupEventListeners();
}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function setupEventListeners() {

    /* SEARCH */

    searchInput.addEventListener(
        "input",
        function () {

            searchTerm =
                this.value
                    .trim()
                    .toLowerCase();

            renderAssignments();
        }
    );


    /* FILTER */

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    filterButtons.forEach(
                        btn =>
                            btn.classList.remove("active")
                    );

                    this.classList.add("active");

                    currentFilter =
                        this.dataset.filter;

                    renderAssignments();
                }
            );
        }
    );


    /* FILE SELECTION */

    assignmentFile.addEventListener(
        "change",
        handleFileSelection
    );


    /* SUBMISSION */

    submitAssignmentBtn.addEventListener(
        "click",
        submitAssignment
    );


    /* MODAL */

    closeModal.addEventListener(
        "click",
        closeAssignmentModal
    );


    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {

                closeAssignmentModal();
            }
        }
    );


    /* ESCAPE KEY */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains("show")
            ) {

                closeAssignmentModal();
            }
        }
    );


    /* BACK BUTTON */

    document
        .getElementById("backBtn")
        .addEventListener(
            "click",
            goBack
        );
}


/* =====================================================
   RENDER ASSIGNMENTS
===================================================== */

function renderAssignments() {

    assignmentList.innerHTML = "";


    const filteredAssignments =
        assignments.filter(
            assignment => {

                const matchesFilter =
                    matchesCurrentFilter(
                        assignment
                    );

                const matchesSearch =
                    matchesSearchTerm(
                        assignment
                    );

                return (
                    matchesFilter &&
                    matchesSearch
                );
            }
        );


    if (filteredAssignments.length === 0) {

        assignmentList.innerHTML = "";

        emptyState.style.display =
            "block";

        resultText.textContent =
            "No assignments available";

        return;
    }


    emptyState.style.display =
        "none";


    resultText.textContent =
        `${filteredAssignments.length} assignment(s)`;


    filteredAssignments.forEach(
        assignment => {

            assignmentList.appendChild(
                createAssignmentCard(
                    assignment
                )
            );
        }
    );
}


/* =====================================================
   FILTER LOGIC
===================================================== */

function matchesCurrentFilter(assignment) {

    if (currentFilter === "all") {

        return true;
    }


    return assignment.status ===
        currentFilter;
}


/* =====================================================
   SEARCH LOGIC
===================================================== */

function matchesSearchTerm(assignment) {

    if (!searchTerm) {

        return true;
    }


    const searchableText = [

        assignment.title,

        assignment.subject,

        assignment.faculty,

        assignment.description

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


    return searchableText.includes(
        searchTerm
    );
}


/* =====================================================
   CREATE ASSIGNMENT CARD
===================================================== */

function createAssignmentCard(assignment) {

    const card =
        document.createElement("article");

    card.className =
        "assignment-card";


    const statusClass =
        getStatusClass(
            assignment.status
        );


    const statusLabel =
        getStatusLabel(
            assignment.status
        );


    card.innerHTML = `

        <div class="assignment-top">

            <div class="assignment-icon">
                <i class="fa-solid fa-file-lines"></i>
            </div>

            <div class="assignment-title-area">

                <div class="assignment-subject">
                    ${escapeHTML(
                        assignment.subject || "Subject"
                    )}
                </div>

                <h3 class="assignment-title">
                    ${escapeHTML(
                        assignment.title || "Assignment"
                    )}
                </h3>

            </div>

            <span class="status-badge ${statusClass}">
                ${statusLabel}
            </span>

        </div>


        <div class="assignment-meta">

            <div class="meta-item">

                <span>Faculty</span>

                <strong>
                    ${escapeHTML(
                        assignment.faculty || "—"
                    )}
                </strong>

            </div>


            <div class="meta-item">

                <span>Due Date</span>

                <strong class="deadline-text">
                    ${formatDateTime(
                        assignment.deadline
                    )}
                </strong>

            </div>

        </div>
    `;


    card.addEventListener(
        "click",
        function () {

            openAssignment(
                assignment
            );
        }
    );


    return card;
}


/* =====================================================
   OPEN ASSIGNMENT
===================================================== */

function openAssignment(assignment) {

    selectedAssignment =
        assignment;

    selectedFile = null;


    document.getElementById(
        "modalSubject"
    ).textContent =
        assignment.subject || "Subject";


    document.getElementById(
        "modalTitle"
    ).textContent =
        assignment.title || "Assignment";


    document.getElementById(
        "modalFaculty"
    ).textContent =
        assignment.faculty || "—";


    document.getElementById(
        "modalAssignedDate"
    ).textContent =
        formatDateTime(
            assignment.assignedDate
        );


    document.getElementById(
        "modalDeadline"
    ).textContent =
        formatDateTime(
            assignment.deadline
        );


    document.getElementById(
        "modalMaxMarks"
    ).textContent =
        assignment.maxMarks ??
        "—";


    document.getElementById(
        "modalDescription"
    ).textContent =
        assignment.description ||
        "No instructions have been provided.";


    const statusElement =
        document.getElementById(
            "modalStatus"
        );


    statusElement.textContent =
        getStatusLabel(
            assignment.status
        );


    statusElement.className =
        `status-badge ${
            getStatusClass(
                assignment.status
            )
        }`;


    resetSubmissionUI();


    /*
       If assignment has already been submitted,
       show submission information.
    */

    if (
        assignment.status === "submitted" ||
        assignment.status === "graded"
    ) {

        showSubmissionInformation(
            assignment
        );
    }


    /*
       If graded, show marks and feedback.
    */

    if (
        assignment.status === "graded"
    ) {

        showEvaluation(
            assignment
        );
    }


    /*
       Hide submission section after grading.
    */

    if (
        assignment.status === "graded"
    ) {

        document.getElementById(
            "submissionSection"
        ).classList.add("hidden");
    }


    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";
}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeAssignmentModal() {

    modal.classList.remove("show");

    document.body.style.overflow =
        "";
}


/* =====================================================
   FILE SELECTION
===================================================== */

function handleFileSelection(event) {

    const file =
        event.target.files[0];


    if (!file) {

        selectedFile = null;

        selectedFileBox.style.display =
            "none";

        submitAssignmentBtn.disabled =
            true;

        return;
    }


    selectedFile = file;


    selectedFileName.textContent =
        file.name;


    selectedFileBox.style.display =
        "flex";


    submitAssignmentBtn.disabled =
        false;
}


/* =====================================================
   SUBMIT ASSIGNMENT
   -----------------------------------------------------
   This currently prepares the submission state.

   The actual file upload will be connected to
   the Java backend/API later.
===================================================== */

function submitAssignment() {

    if (
        !selectedFile ||
        !selectedAssignment
    ) {

        return;
    }


    /*
       Backend integration point.

       Later this section will send:
       - assignment ID
       - student ID
       - uploaded file
       - submission timestamp

       to the Java backend using FormData.
    */


    const submissionTime =
        new Date().toISOString();


    selectedAssignment.status =
        "submitted";


    selectedAssignment.submission = {

        fileName:
            selectedFile.name,

        submittedAt:
            submissionTime
    };


    showSubmissionInformation(
        selectedAssignment
    );


    document.getElementById(
        "submissionSection"
    ).classList.add("hidden");


    updateDashboardCounts();

    renderAssignments();


    /*
       Refresh modal status.
    */

    const statusElement =
        document.getElementById(
            "modalStatus"
        );


    statusElement.textContent =
        "Submitted";


    statusElement.className =
        "status-badge status-submitted";


    selectedFile = null;


    /*
       This is intentionally a frontend
       preparation until the Java backend
       is connected.
    */
}


/* =====================================================
   SHOW SUBMISSION INFORMATION
===================================================== */

function showSubmissionInformation(
    assignment
) {

    const submission =
        assignment.submission;


    if (!submission) {

        return;
    }


    document.getElementById(
        "submissionInfo"
    ).classList.remove("hidden");


    document.getElementById(
        "submittedFileName"
    ).textContent =
        submission.fileName || "Submitted file";


    document.getElementById(
        "submittedDate"
    ).textContent =
        submission.submittedAt
            ? `Submitted ${formatDateTime(
                submission.submittedAt
            )}`
            : "Submission recorded";
}


/* =====================================================
   SHOW EVALUATION
===================================================== */

function showEvaluation(
    assignment
) {

    document.getElementById(
        "resultSection"
    ).classList.remove("hidden");


    document.getElementById(
        "modalMarks"
    ).textContent =
        assignment.marks !== undefined
            ? `${assignment.marks} / ${assignment.maxMarks}`
            : "—";


    document.getElementById(
        "modalFeedback"
    ).textContent =
        assignment.feedback ||
        "No feedback available.";
}


/* =====================================================
   RESET SUBMISSION UI
===================================================== */

function resetSubmissionUI() {

    selectedFile = null;

    assignmentFile.value = "";


    selectedFileBox.style.display =
        "none";


    selectedFileName.textContent =
        "No file selected";


    submitAssignmentBtn.disabled =
        true;


    document.getElementById(
        "submissionInfo"
    ).classList.add("hidden");


    document.getElementById(
        "resultSection"
    ).classList.add("hidden");


    document.getElementById(
        "submissionSection"
    ).classList.remove("hidden");
}


/* =====================================================
   DASHBOARD COUNTS
   -----------------------------------------------------
   These values are calculated from assignment data.

   Later the same data can come from the backend.
===================================================== */

function updateDashboardCounts() {

    const total =
        assignments.length;


    const pending =
        assignments.filter(
            item =>
                item.status === "pending"
        ).length;


    const submitted =
        assignments.filter(
            item =>
                item.status === "submitted"
        ).length;


    const graded =
        assignments.filter(
            item =>
                item.status === "graded"
        ).length;


    document.getElementById(
        "totalAssignments"
    ).textContent =
        total;


    document.getElementById(
        "pendingAssignments"
    ).textContent =
        pending;


    document.getElementById(
        "submittedAssignments"
    ).textContent =
        submitted;


    document.getElementById(
        "gradedAssignments"
    ).textContent =
        graded;


    /*
       Dashboard integration point.

       When your main Dashboard is connected,
       it can request these values from the
       backend instead of maintaining another
       assignment count.
    */
}


/* =====================================================
   STATUS HELPERS
===================================================== */

function getStatusLabel(status) {

    switch (status) {

        case "pending":
            return "Pending";

        case "submitted":
            return "Submitted";

        case "late":
            return "Late";

        case "graded":
            return "Graded";

        default:
            return "Pending";
    }
}


function getStatusClass(status) {

    switch (status) {

        case "pending":
            return "status-pending";

        case "submitted":
            return "status-submitted";

        case "late":
            return "status-late";

        case "graded":
            return "status-graded";

        default:
            return "status-pending";
    }
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDateTime(dateValue) {

    if (!dateValue) {

        return "—";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "—";
    }


    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* =====================================================
   HTML ESCAPING
===================================================== */

function escapeHTML(value) {

    const element =
        document.createElement("div");

    element.textContent =
        String(value ?? "");

    return element.innerHTML;
}


/* =====================================================
   BACK BUTTON
   -----------------------------------------------------
   Goes to the previous page in browser history.
===================================================== */

function goBack() {

    if (window.history.length > 1) {

        window.history.back();

        return;
    }


    /*
       Fallback only when there is no usable
       browser history.
    */

    const dashboardPath =
        "student-dashboard.html";


    window.location.href =
        dashboardPath;
}


/* =====================================================
   FUTURE BACKEND DATA API
   -----------------------------------------------------
   Your Java backend can eventually call this
   function after fetching assignments.

   Example expected structure:

   {
       id: "...",
       subject: "...",
       title: "...",
       faculty: "...",
       description: "...",
       assignedDate: "...",
       deadline: "...",
       maxMarks: 100,
       status: "pending",
       submission: null,
       marks: null,
       feedback: null
   }
===================================================== */

function loadAssignmentsFromBackend(
    backendAssignments
) {

    if (
        !Array.isArray(
            backendAssignments
        )
    ) {

        return;
    }


    assignments =
        backendAssignments;


    updateDashboardCounts();

    renderAssignments();
}