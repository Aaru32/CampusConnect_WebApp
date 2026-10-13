/* =========================================================
CAMPUSCONNECT
FACULTY ASSIGNMENTS
Dynamic / API-Ready Architecture
========================================================= */

/* =========================================================
CONFIGURATION
========================================================= */

const CONFIG = {

API_BASE_URL: "",

ENDPOINTS: {

    ASSIGNMENTS:
        "/faculty/assignments",

    SUMMARY:
        "/faculty/assignments/summary",

    SUBJECTS:
        "/faculty/subjects",

    CLASSES:
        "/faculty/classes",

    ASSIGNMENT_DETAILS:
        "/faculty/assignments/{id}",

    CREATE_ASSIGNMENT:
        "/faculty/assignments",

    SUBMISSIONS:
        "/faculty/assignments/{id}/submissions",

    NOTIFICATIONS:
        "/notifications"

}

};

/* =========================================================
STATE
========================================================= */

const assignmentState = {

assignments: [],

subjects: [],

classes: [],

notifications: [],

selectedAssignment: null,

summary: {

    total: null,

    active: null,

    pending: null,

    completed: null

}

};

/* =========================================================
DOM
========================================================= */

const DOM = {

backBtn:
    document.getElementById("backBtn"),

refreshButton:
    document.getElementById("refreshButton"),

notificationButton:
    document.getElementById(
        "notificationButton"
    ),

notificationCount:
    document.getElementById(
        "notificationCount"
    ),

createAssignmentButton:
    document.getElementById(
        "createAssignmentButton"
    ),

assignmentSearch:
    document.getElementById(
        "assignmentSearch"
    ),

subjectFilter:
    document.getElementById(
        "subjectFilter"
    ),

semesterFilter:
    document.getElementById(
        "semesterFilter"
    ),

statusFilter:
    document.getElementById(
        "statusFilter"
    ),

assignmentTableBody:
    document.getElementById(
        "assignmentTableBody"
    ),

totalAssignments:
    document.getElementById(
        "totalAssignments"
    ),

activeAssignments:
    document.getElementById(
        "activeAssignments"
    ),

pendingEvaluation:
    document.getElementById(
        "pendingEvaluation"
    ),

completedAssignments:
    document.getElementById(
        "completedAssignments"
    ),

assignmentModal:
    document.getElementById(
        "assignmentModal"
    ),

closeAssignmentModal:
    document.getElementById(
        "closeAssignmentModal"
    ),

cancelAssignment:
    document.getElementById(
        "cancelAssignment"
    ),

assignmentForm:
    document.getElementById(
        "assignmentForm"
    ),

assignmentSubject:
    document.getElementById(
        "assignmentSubject"
    ),

assignmentClass:
    document.getElementById(
        "assignmentClass"
    ),

assignmentSemester:
    document.getElementById(
        "assignmentSemester"
    ),

detailsModal:
    document.getElementById(
        "detailsModal"
    ),

closeDetailsModal:
    document.getElementById(
        "closeDetailsModal"
    ),

closeDetailsButton:
    document.getElementById(
        "closeDetailsButton"
    ),

openSubmissionsButton:
    document.getElementById(
        "openSubmissionsButton"
    ),

detailsTitle:
    document.getElementById(
        "detailsTitle"
    ),

detailsSubject:
    document.getElementById(
        "detailsSubject"
    ),

detailsClass:
    document.getElementById(
        "detailsClass"
    ),

detailsAssigned:
    document.getElementById(
        "detailsAssigned"
    ),

detailsDeadline:
    document.getElementById(
        "detailsDeadline"
    ),

detailsMarks:
    document.getElementById(
        "detailsMarks"
    ),

detailsStatus:
    document.getElementById(
        "detailsStatus"
    ),

detailTotalStudents:
    document.getElementById(
        "detailTotalStudents"
    ),

detailSubmitted:
    document.getElementById(
        "detailSubmitted"
    ),

detailNotSubmitted:
    document.getElementById(
        "detailNotSubmitted"
    ),

detailEvaluated:
    document.getElementById(
        "detailEvaluated"
    ),

detailPending:
    document.getElementById(
        "detailPending"
    ),

detailsDescription:
    document.getElementById(
        "detailsDescription"
    ),

toast:
    document.getElementById("toast"),

toastMessage:
    document.getElementById(
        "toastMessage"
    )

};

/* =========================================================
INITIALIZATION
========================================================= */

document.addEventListener(
"DOMContentLoaded",
initializeAssignments
);

function initializeAssignments() {

setupHeader();

setupFilters();

setupModals();

setupForm();

loadAssignments();

}

/* =========================================================
LOAD
========================================================= */

async function loadAssignments() {

if (!CONFIG.API_BASE_URL) {

    renderEmptyState();

    return;

}


try {

    await Promise.all([

        loadAssignmentSummary(),

        loadAssignmentsData(),

        loadSubjects(),

        loadClasses(),

        loadNotifications()

    ]);

}

catch (error) {

    console.error(
        "Assignment module loading error:",
        error
    );

    renderEmptyState();

}

}

/* =========================================================
API
========================================================= */

async function apiRequest(
endpoint,
options = {}
) {

if (!CONFIG.API_BASE_URL) {

    return null;

}


const response =
    await fetch(
        CONFIG.API_BASE_URL + endpoint,
        {

            method:
                options.method || "GET",

            headers: {

                "Content-Type":
                    "application/json",

                ...(options.headers || {})

            },

            credentials:
                "include",

            body:
                options.body
                    ? JSON.stringify(
                        options.body
                    )
                    : undefined

        }
    );


if (!response.ok) {

    throw new Error(
        `API request failed: ${response.status}`
    );

}


return await response.json();

}

/* =========================================================
SUMMARY
========================================================= */

async function loadAssignmentSummary() {

const data =
    await apiRequest(
        CONFIG.ENDPOINTS.SUMMARY
    );


if (!data) {
    return;
}


assignmentState.summary.total =
    data.total ?? null;

assignmentState.summary.active =
    data.active ?? null;

assignmentState.summary.pending =
    data.pendingEvaluation ?? null;

assignmentState.summary.completed =
    data.completed ?? null;


updateSummary();

}

function updateSummary() {

DOM.totalAssignments.textContent =
    formatValue(
        assignmentState.summary.total
    );

DOM.activeAssignments.textContent =
    formatValue(
        assignmentState.summary.active
    );

DOM.pendingEvaluation.textContent =
    formatValue(
        assignmentState.summary.pending
    );

DOM.completedAssignments.textContent =
    formatValue(
        assignmentState.summary.completed
    );

}

/* =========================================================
ASSIGNMENTS
========================================================= */

async function loadAssignmentsData() {

const data =
    await apiRequest(
        CONFIG.ENDPOINTS.ASSIGNMENTS
    );


if (!Array.isArray(data)) {
    return;
}


assignmentState.assignments =
    data;


populateFilters();

renderAssignments();

}

function renderAssignments() {

if (!DOM.assignmentTableBody) {
    return;
}


const assignments =
    getFilteredAssignments();


if (
    assignments.length === 0
) {

    DOM.assignmentTableBody.innerHTML = `

        <tr>

            <td colspan="8">

                <div class="empty-state">

                    <i class="fa-regular fa-folder-open"></i>

                    <h3>
                        No assignments available
                    </h3>

                    <p>
                        No assignments match the
                        selected filters.
                    </p>

                </div>

            </td>

        </tr>

    `;

    return;

}


DOM.assignmentTableBody.innerHTML =
    assignments
        .map(createAssignmentRow)
        .join("");


attachAssignmentEvents();

}

/* =========================================================
ASSIGNMENT ROW
========================================================= */

function createAssignmentRow(
assignment
) {

const id =
    assignment.id ||
    assignment.assignmentId ||
    "";


const title =
    escapeHTML(
        assignment.title ||
        assignment.name ||
        "Assignment"
    );


const subject =
    escapeHTML(
        assignment.subjectName ||
        assignment.subject ||
        "—"
    );


const className =
    escapeHTML(
        assignment.className ||
        assignment.class ||
        assignment.semester ||
        "—"
    );


const assigned =
    escapeHTML(
        formatDate(
            assignment.assignedDate ||
            assignment.createdAt
        )
    );


const deadline =
    escapeHTML(
        formatDate(
            assignment.deadline
        )
    );


const submitted =
    assignment.submitted ?? "—";


const totalStudents =
    assignment.totalStudents ?? "—";


const status =
    String(
        assignment.status ||
        ""
    )
        .toLowerCase();


const statusText =
    escapeHTML(
        assignment.status ||
        "—"
    );


return `

    <tr>

        <td>

            <div class="assignment-title">

                <strong>
                    ${title}
                </strong>

                <span>
                    ${escapeHTML(
                        assignment.type || ""
                    )}
                </span>

            </div>

        </td>


        <td>
            ${subject}
        </td>


        <td>
            ${className}
        </td>


        <td>
            ${assigned}
        </td>


        <td>
            ${deadline}
        </td>


        <td>

            <span class="submission-count">
                ${escapeHTML(submitted)}
            </span>

            /
            ${escapeHTML(totalStudents)}

        </td>


        <td>

            <span
                class="status-badge ${escapeHTML(status)}"
            >
                ${statusText}
            </span>

        </td>


        <td>

            <button
                type="button"
                class="table-action view-assignment"
                data-id="${escapeHTML(id)}"
                title="View assignment"
                aria-label="View assignment"
            >
                <i class="fa-solid fa-eye"></i>
            </button>

        </td>

    </tr>

`;

}

/* =========================================================
FILTERING
========================================================= */

function getFilteredAssignments() {

const search =
    DOM.assignmentSearch.value
        .trim()
        .toLowerCase();


const subject =
    DOM.subjectFilter.value;


const semester =
    DOM.semesterFilter.value;


const status =
    DOM.statusFilter.value
        .toLowerCase();


return assignmentState.assignments
    .filter(assignment => {

        const title =
            String(
                assignment.title ||
                assignment.name ||
                ""
            )
                .toLowerCase();


        const subjectName =
            String(
                assignment.subjectName ||
                assignment.subject ||
                ""
            )
                .toLowerCase();


        const className =
            String(
                assignment.className ||
                assignment.class ||
                ""
            )
                .toLowerCase();


        const assignmentStatus =
            String(
                assignment.status ||
                ""
            )
                .toLowerCase();


        const matchesSearch =
            !search ||
            title.includes(search) ||
            subjectName.includes(search) ||
            className.includes(search);


        const matchesSubject =
            !subject ||
            String(
                assignment.subjectId ||
                ""
            ) === subject;


        const matchesSemester =
            !semester ||
            String(
                assignment.semesterId ||
                assignment.semester ||
                ""
            ) === semester;


        const matchesStatus =
            !status ||
            assignmentStatus === status;


        return (
            matchesSearch &&
            matchesSubject &&
            matchesSemester &&
            matchesStatus
        );

    });

}

/* =========================================================
FILTER EVENTS
========================================================= */

function setupFilters() {

[
    DOM.assignmentSearch,
    DOM.subjectFilter,
    DOM.semesterFilter,
    DOM.statusFilter

].forEach(element => {

    if (!element) {
        return;
    }


    element.addEventListener(
        "input",
        renderAssignments
    );


    element.addEventListener(
        "change",
        renderAssignments
    );

});

}

/* =========================================================
POPULATE FILTERS
========================================================= */

function populateFilters() {

const subjectMap =
    new Map();


const semesterMap =
    new Map();


assignmentState.assignments
    .forEach(assignment => {

        const subjectId =
            assignment.subjectId;

        const subjectName =
            assignment.subjectName ||
            assignment.subject;


        if (
            subjectId &&
            subjectName
        ) {

            subjectMap.set(
                String(subjectId),
                subjectName
            );

        }


        const semester =
            assignment.semesterId ||
            assignment.semester;


        if (semester) {

            semesterMap.set(
                String(semester),
                assignment.semesterName ||
                assignment.semester
            );

        }

    });


DOM.subjectFilter.innerHTML = `
    <option value="">
        All Subjects
    </option>
`;


subjectMap.forEach(
    (name, id) => {

        const option =
            document.createElement(
                "option"
            );

        option.value = id;

        option.textContent = name;

        DOM.subjectFilter.appendChild(
            option
        );

    }
);


DOM.semesterFilter.innerHTML = `
    <option value="">
        All Semesters
    </option>
`;


semesterMap.forEach(
    (name, id) => {

        const option =
            document.createElement(
                "option"
            );

        option.value = id;

        option.textContent = name;

        DOM.semesterFilter.appendChild(
            option
        );

    }
);

}

/* =========================================================
SUBJECTS
========================================================= */

async function loadSubjects() {

const data =
    await apiRequest(
        CONFIG.ENDPOINTS.SUBJECTS
    );


if (!Array.isArray(data)) {
    return;
}


assignmentState.subjects =
    data;


populateSubjectSelect();

}

function populateSubjectSelect() {

DOM.assignmentSubject.innerHTML = `

    <option value="">
        Select Subject
    </option>

`;


assignmentState.subjects
    .forEach(subject => {

        const id =
            subject.id ||
            subject.subjectId;


        const name =
            subject.name ||
            subject.subjectName;


        if (!id || !name) {
            return;
        }


        const option =
            document.createElement(
                "option"
            );

        option.value = id;

        option.textContent = name;

        DOM.assignmentSubject.appendChild(
            option
        );

    });

}

/* =========================================================
CLASSES
========================================================= */

async function loadClasses() {

const data =
    await apiRequest(
        CONFIG.ENDPOINTS.CLASSES
    );


if (!Array.isArray(data)) {
    return;
}


assignmentState.classes =
    data;


DOM.assignmentClass.innerHTML = `

    <option value="">
        Select Class
    </option>

`;


DOM.assignmentSemester.innerHTML = `

    <option value="">
        Select Semester
    </option>

`;


data.forEach(classData => {

    const id =
        classData.id ||
        classData.classId;


    const name =
        classData.name ||
        classData.className;


    if (id && name) {

        const option =
            document.createElement(
                "option"
            );

        option.value = id;

        option.textContent = name;

        DOM.assignmentClass.appendChild(
            option
        );

    }


    const semesterId =
        classData.semesterId;


    const semesterName =
        classData.semesterName ||
        classData.semester;


    if (
        semesterId &&
        semesterName
    ) {

        const exists =
            Array.from(
                DOM.assignmentSemester.options
            )
                .some(
                    option =>
                        option.value ===
                        String(semesterId)
                );


        if (!exists) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                semesterId;

            option.textContent =
                semesterName;

            DOM.assignmentSemester
                .appendChild(option);

        }

    }

});

}

/* =========================================================
ASSIGNMENT EVENTS
========================================================= */

function attachAssignmentEvents() {

document
    .querySelectorAll(
        ".view-assignment"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openAssignmentDetails(
                    button.dataset.id
                );

            }
        );

    });

}

/* =========================================================
DETAILS
========================================================= */

async function openAssignmentDetails(
id
) {

if (!id) {
    return;
}


let assignment =
    assignmentState.assignments
        .find(
            item =>
                String(
                    item.id ||
                    item.assignmentId
                ) === String(id)
        );


if (CONFIG.API_BASE_URL) {

    try {

        const endpoint =
            CONFIG.ENDPOINTS
                .ASSIGNMENT_DETAILS
                .replace(
                    "{id}",
                    encodeURIComponent(id)
                );


        const data =
            await apiRequest(
                endpoint
            );


        if (data) {

            assignment = data;

        }

    }

    catch (error) {

        console.error(
            "Assignment details error:",
            error
        );

    }

}


if (!assignment) {
    return;
}


assignmentState.selectedAssignment =
    assignment;


DOM.detailsTitle.textContent =
    assignment.title ||
    assignment.name ||
    "Assignment";


DOM.detailsSubject.textContent =
    assignment.subjectName ||
    assignment.subject ||
    "—";


DOM.detailsClass.textContent =
    assignment.className ||
    assignment.class ||
    assignment.semester ||
    "—";


DOM.detailsAssigned.textContent =
    formatDate(
        assignment.assignedDate ||
        assignment.createdAt
    );


DOM.detailsDeadline.textContent =
    formatDate(
        assignment.deadline
    );


DOM.detailsMarks.textContent =
    assignment.maximumMarks ??
    "—";


DOM.detailsStatus.textContent =
    assignment.status ||
    "—";


DOM.detailTotalStudents.textContent =
    assignment.totalStudents ??
    "—";


DOM.detailSubmitted.textContent =
    assignment.submitted ??
    "—";


DOM.detailNotSubmitted.textContent =
    assignment.notSubmitted ??
    "—";


DOM.detailEvaluated.textContent =
    assignment.evaluated ??
    "—";


DOM.detailPending.textContent =
    assignment.pendingEvaluation ??
    "—";


DOM.detailsDescription.textContent =
    assignment.description ||
    "No instructions available.";


DOM.detailsModal.hidden =
    false;

}

/* =========================================================
MODALS
========================================================= */

function setupModals() {

DOM.createAssignmentButton
    .addEventListener(
        "click",
        openCreateModal
    );


DOM.closeAssignmentModal
    .addEventListener(
        "click",
        closeCreateModal
    );


DOM.cancelAssignment
    .addEventListener(
        "click",
        closeCreateModal
    );


DOM.closeDetailsModal
    .addEventListener(
        "click",
        closeDetailsModal
    );


DOM.closeDetailsButton
    .addEventListener(
        "click",
        closeDetailsModal
    );


DOM.openSubmissionsButton
    .addEventListener(
        "click",
        openSubmissions
    );


DOM.assignmentModal
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                DOM.assignmentModal
            ) {

                closeCreateModal();

            }

        }
    );


DOM.detailsModal
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                DOM.detailsModal
            ) {

                closeDetailsModal();

            }

        }
    );

}

function openCreateModal() {

DOM.assignmentModal.hidden =
    false;

}

function closeCreateModal() {

DOM.assignmentModal.hidden =
    true;

}

function closeDetailsModal() {

DOM.detailsModal.hidden =
    true;

}

/* =========================================================
CREATE ASSIGNMENT
========================================================= */

function setupForm() {

DOM.assignmentForm
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const formData =
                new FormData(
                    DOM.assignmentForm
                );


            const payload = {

                title:
                    formData.get("title"),

                subjectId:
                    formData.get("subjectId"),

                classId:
                    formData.get("classId"),

                semesterId:
                    formData.get("semesterId"),

                type:
                    formData.get("type"),

                maximumMarks:
                    formData.get(
                        "maximumMarks"
                    ),

                issueDate:
                    formData.get(
                        "issueDate"
                    ),

                deadline:
                    formData.get(
                        "deadline"
                    ),

                description:
                    formData.get(
                        "description"
                    ),

                allowLateSubmission:
                    formData.get(
                        "allowLateSubmission"
                    ) === "on"

            };


            if (!CONFIG.API_BASE_URL) {

                showToast(
                    "Backend connection is required to create an assignment."
                );

                return;

            }


            try {

                await apiRequest(
                    CONFIG.ENDPOINTS
                        .CREATE_ASSIGNMENT,
                    {
                        method: "POST",
                        body: payload
                    }
                );


                closeCreateModal();

                DOM.assignmentForm.reset();

                showToast(
                    "Assignment created successfully."
                );


                await loadAssignments();

            }

            catch (error) {

                console.error(
                    "Create assignment error:",
                    error
                );

                showToast(
                    "Unable to create assignment."
                );

            }

        }
    );

}

/* =========================================================
SUBMISSIONS
========================================================= */

function openSubmissions() {

const assignment =
    assignmentState.selectedAssignment;


if (!assignment) {
    return;
}


/*
 * The complete submission/evaluation page
 * can be opened when the Submissions module
 * is implemented.
 */

const id =
    assignment.id ||
    assignment.assignmentId;


if (!id) {
    return;
}


window.location.href =
    `assignment-submissions.html?id=${encodeURIComponent(id)}`;

}

/* =========================================================
HEADER
========================================================= */

function setupHeader() {

DOM.backBtn.addEventListener(
    "click",
    () => {

        if (
            window.history.length > 1
        ) {

            window.history.back();

        }

        else {

            window.location.href =
                "faculty-dashboard.html";

        }

    }
);


DOM.refreshButton.addEventListener(
    "click",
    refreshPage
);


DOM.notificationButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "notifications.html";

    }
);

}

/* =========================================================
REFRESH
========================================================= */

function refreshPage() {

const icon =
    DOM.refreshButton.querySelector(
        "i"
    );


if (icon) {

    icon.classList.add(
        "fa-spin"
    );

}


DOM.refreshButton.disabled =
    true;


setTimeout(
    () => {

        window.location.reload();

    },
    300
);

}

/* =========================================================
NOTIFICATIONS
========================================================= */

async function loadNotifications() {

const data =
    await apiRequest(
        CONFIG.ENDPOINTS.NOTIFICATIONS
    );


if (!Array.isArray(data)) {
    return;
}


assignmentState.notifications =
    data;


const unread =
    data.filter(
        notification =>
            notification.read === false
    ).length;


if (unread > 0) {

    DOM.notificationCount.textContent =
        unread;

    DOM.notificationCount.hidden =
        false;

}

else {

    DOM.notificationCount.hidden =
        true;

}

}

/* =========================================================
EMPTY STATE
========================================================= */

function renderEmptyState() {

assignmentState.assignments = [];

assignmentState.subjects = [];

assignmentState.classes = [];


updateSummary();

populateSubjectSelect();


DOM.assignmentTableBody.innerHTML = `

    <tr>

        <td colspan="8">

            <div class="empty-state">

                <i class="fa-regular fa-folder-open"></i>

                <h3>
                    No assignments available
                </h3>

                <p>
                    Assignments created or assigned
                    to you will appear here when
                    backend data is available.
                </p>

            </div>

        </td>

    </tr>

`;

}

/* =========================================================
HELPERS
========================================================= */

function formatValue(value) {

return value !== null &&
    value !== undefined
    ? value
    : "—";

}

function formatDate(value) {

if (!value) {
    return "—";
}


const date =
    new Date(value);


if (
    Number.isNaN(
        date.getTime()
    )
) {

    return String(value);

}


return date.toLocaleDateString(
    undefined,
    {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }
);

}

function showToast(message) {

if (
    !DOM.toast ||
    !DOM.toastMessage
) {

    return;

}


DOM.toastMessage.textContent =
    message;


DOM.toast.hidden =
    false;


setTimeout(
    () => {

        DOM.toast.hidden =
            true;

    },
    3000
);

}

function escapeHTML(value) {

return String(
    value ?? ""
)
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}