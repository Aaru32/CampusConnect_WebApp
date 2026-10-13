/* =========================================================
CAMPUSCONNECT
FACULTY - STUDENTS
Dynamic / API-Ready Architecture
========================================================= */

/* =========================================================
CONFIGURATION
========================================================= */

const CONFIG = {

API_BASE_URL: "",

ENDPOINTS: {

    STUDENTS:
        "/faculty/students",

    SUMMARY:
        "/faculty/students/summary"

}

};

/* =========================================================
DOM REFERENCES
========================================================= */

const DOM = {

backButton:
    document.getElementById("backButton"),

refreshButton:
    document.getElementById("refreshButton"),

assignedStudents:
    document.getElementById("assignedStudents"),

activeClasses:
    document.getElementById("activeClasses"),

studentsAttention:
    document.getElementById("studentsAttention"),

averageAttendance:
    document.getElementById("averageAttendance"),

studentSearch:
    document.getElementById("studentSearch"),

branchFilter:
    document.getElementById("branchFilter"),

semesterFilter:
    document.getElementById("semesterFilter"),

sectionFilter:
    document.getElementById("sectionFilter"),

attendanceFilter:
    document.getElementById("attendanceFilter"),

clearFilters:
    document.getElementById("clearFilters"),

studentsTable:
    document.getElementById("studentsTable"),

studentsTableBody:
    document.getElementById("studentsTableBody"),

tableEmptyState:
    document.getElementById("tableEmptyState"),

resultInformation:
    document.getElementById("resultInformation"),

resultCount:
    document.getElementById("resultCount"),

studentModal:
    document.getElementById("studentModal"),

modalClose:
    document.getElementById("modalClose"),

studentDetailsContent:
    document.getElementById(
        "studentDetailsContent"
    )

};

/* =========================================================
STATE
========================================================= */

const studentState = {

students: [],

summary: null,

filteredStudents: []

};

/* =========================================================
INITIALIZATION
========================================================= */

document.addEventListener(
"DOMContentLoaded",
initializeStudentsPage
);

function initializeStudentsPage() {

setupBackButton();

setupRefreshButton();

setupSearch();

setupFilters();

setupClearFilters();

setupModal();

setupOverviewCards();

loadStudentsPage();

}

/* =========================================================
LOAD PAGE
========================================================= */

async function loadStudentsPage() {

if (!CONFIG.API_BASE_URL) {

    renderEmptyPage();

    return;

}


try {

    await Promise.all([

        loadStudentSummary(),

        loadStudents()

    ]);

}

catch (error) {

    console.error(
        "Students page loading error:",
        error
    );

    renderEmptyPage();

}

}

/* =========================================================
SUMMARY
========================================================= */

async function loadStudentSummary() {

const data =
    await apiRequest(
        CONFIG.ENDPOINTS.SUMMARY
    );


if (!data) {

    return;

}


studentState.summary =
    data;


updateSummary();

}

/* =========================================================
STUDENTS
========================================================= */

async function loadStudents() {

const data =
    await apiRequest(
        CONFIG.ENDPOINTS.STUDENTS
    );


if (!Array.isArray(data)) {

    return;

}


studentState.students =
    data;


populateFilters();

applyFilters();

}

/* =========================================================
EMPTY PAGE
========================================================= */

function renderEmptyPage() {

studentState.students = [];

studentState.filteredStudents = [];

studentState.summary = null;


updateSummary();

populateFilters();

renderStudents();

}

/* =========================================================
SUMMARY UPDATE
========================================================= */

function updateSummary() {

const summary =
    studentState.summary;


if (!summary) {

    DOM.assignedStudents.textContent =
        "—";

    DOM.activeClasses.textContent =
        "—";

    DOM.studentsAttention.textContent =
        "—";

    DOM.averageAttendance.textContent =
        "—";

    return;

}


DOM.assignedStudents.textContent =
    summary.assignedStudents ??
    "—";


DOM.activeClasses.textContent =
    summary.activeClasses ??
    "—";


DOM.studentsAttention.textContent =
    summary.studentsRequiringAttention ??
    summary.studentsAttention ??
    "—";


DOM.averageAttendance.textContent =
    summary.averageAttendance !== undefined &&
    summary.averageAttendance !== null
        ? `${summary.averageAttendance}%`
        : "—";

}

/* =========================================================
FILTER OPTIONS
========================================================= */

function populateFilters() {

populateSelect(
    DOM.branchFilter,
    getUniqueValues(
        "branch"
    ),
    "All Branches"
);


populateSelect(
    DOM.semesterFilter,
    getUniqueValues(
        "semester"
    ),
    "All Semesters"
);


populateSelect(
    DOM.sectionFilter,
    getUniqueValues(
        "section"
    ),
    "All Sections"
);

}

function getUniqueValues(
property
) {

return [
    ...new Set(

        studentState.students

            .map(
                student =>
                    student[property]
            )

            .filter(
                value =>
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
            )

            .map(
                value =>
                    String(value).trim()
            )

    )
]
    .sort(
        (a, b) =>
            a.localeCompare(
                b,
                undefined,
                {
                    numeric: true
                }
            )
    );

}

function populateSelect(
select,
values,
defaultText
) {

if (!select) {

    return;

}


select.innerHTML = "";


const defaultOption =
    document.createElement(
        "option"
    );


defaultOption.value = "";

defaultOption.textContent =
    defaultText;


select.appendChild(
    defaultOption
);


values.forEach(
    value => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;


        option.textContent =
            value;


        select.appendChild(
            option
        );

    }
);

}

/* =========================================================
SEARCH
========================================================= */

function setupSearch() {

if (!DOM.studentSearch) {

    return;

}


DOM.studentSearch.addEventListener(
    "input",
    applyFilters
);

}

/* =========================================================
FILTERS
========================================================= */

function setupFilters() {

[

    DOM.branchFilter,

    DOM.semesterFilter,

    DOM.sectionFilter,

    DOM.attendanceFilter

]
    .forEach(
        select => {

            if (select) {

                select.addEventListener(
                    "change",
                    applyFilters
                );

            }

        }
    );

}

function applyFilters() {

const search =
    (
        DOM.studentSearch.value ||
        ""
    )
        .trim()
        .toLowerCase();


const branch =
    DOM.branchFilter.value;


const semester =
    DOM.semesterFilter.value;


const section =
    DOM.sectionFilter.value;


const attendance =
    DOM.attendanceFilter.value;


studentState.filteredStudents =

    studentState.students.filter(
        student => {

            const name =
                String(
                    student.name ||
                    student.fullName ||
                    ""
                )
                    .toLowerCase();


            const enrollment =
                String(
                    student.enrollmentNo ||
                    student.enrollmentNumber ||
                    student.registrationNo ||
                    ""
                )
                    .toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                enrollment.includes(search);


            const matchesBranch =
                !branch ||
                String(
                    student.branch ||
                    ""
                ) === branch;


            const matchesSemester =
                !semester ||
                String(
                    student.semester ||
                    ""
                ) === semester;


            const matchesSection =
                !section ||
                String(
                    student.section ||
                    ""
                ) === section;


            const attendanceValue =
                getAttendanceNumber(
                    student
                );


            let matchesAttendance =
                true;


            if (
                attendance ===
                "good"
            ) {

                matchesAttendance =
                    attendanceValue !== null &&
                    attendanceValue >= 75;

            }


            if (
                attendance ===
                "low"
            ) {

                matchesAttendance =
                    attendanceValue !== null &&
                    attendanceValue < 75;

            }


            return (

                matchesSearch &&

                matchesBranch &&

                matchesSemester &&

                matchesSection &&

                matchesAttendance

            );

        }
    );


renderStudents();

}

/* =========================================================
CLEAR FILTERS
========================================================= */

function setupClearFilters() {

DOM.clearFilters.addEventListener(
    "click",
    function () {

        DOM.studentSearch.value =
            "";

        DOM.branchFilter.value =
            "";

        DOM.semesterFilter.value =
            "";

        DOM.sectionFilter.value =
            "";

        DOM.attendanceFilter.value =
            "";


        applyFilters();

    }
);

}

/* =========================================================
RENDER STUDENTS
========================================================= */

function renderStudents() {

const students =
    studentState.filteredStudents;


if (
    !students ||
    students.length === 0
) {

    DOM.studentsTable.hidden =
        true;

    DOM.tableEmptyState.hidden =
        false;

    DOM.resultInformation.hidden =
        true;

    return;

}


DOM.studentsTable.hidden =
    false;

DOM.tableEmptyState.hidden =
    true;

DOM.resultInformation.hidden =
    false;


DOM.resultCount.textContent =
    students.length;


DOM.studentsTableBody.innerHTML =

    students
        .map(
            createStudentRow
        )
        .join("");


attachStudentActions();

}

/* =========================================================
CREATE STUDENT ROW
========================================================= */

function createStudentRow(
student
) {

const id =
    student.id ||
    student.studentId ||
    student.enrollmentNo ||
    "";


const name =
    student.name ||
    student.fullName ||
    "Student";


const enrollment =
    student.enrollmentNo ||
    student.enrollmentNumber ||
    student.registrationNo ||
    "—";


const semester =
    student.semester ||
    "—";


const className =
    student.className ||
    student.class ||
    student.section ||
    "—";


const attendance =
    getAttendanceNumber(
        student
    );


const status =
    student.status ||
    "Active";


const image =
    student.profileImage ||
    student.image ||
    "";


const attendanceHTML =
    attendance === null

        ? `<span class="attendance-value">—</span>`

        : `

            <span class="
                attendance-value
                ${
                    attendance < 75
                        ? "attendance-low"
                        : "attendance-good"
                }
            ">
                ${escapeHTML(
                    attendance
                )}%
            </span>

        `;


const statusClass =
    String(status)
        .toLowerCase() ===
    "active"

        ? "status-active"

        : "status-inactive";


const avatarHTML =
    image

        ? `

            <img
                class="student-avatar"
                src="${escapeHTML(image)}"
                alt=""
            >

        `

        : `

            <span class="student-avatar">
                <i class="fa-solid fa-user"></i>
            </span>

        `;


return `

    <tr>

        <td>

            <div class="student-name">

                ${avatarHTML}

                <span>

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <span>
                        ${escapeHTML(
                            student.branch ||
                            "—"
                        )}
                    </span>

                </span>

            </div>

        </td>


        <td>
            ${escapeHTML(enrollment)}
        </td>


        <td>
            ${escapeHTML(semester)}
        </td>


        <td>
            ${escapeHTML(className)}
        </td>


        <td>
            ${attendanceHTML}
        </td>


        <td>

            <span class="
                status-badge
                ${statusClass}
            ">

                ${escapeHTML(status)}

            </span>

        </td>


        <td>

            <button
                type="button"
                class="view-student-button"
                data-student-id="${escapeHTML(id)}"
            >

                <i class="fa-regular fa-eye"></i>

                View

            </button>

        </td>

    </tr>

`;

}

/* =========================================================
ATTENDANCE VALUE
========================================================= */

function getAttendanceNumber(
student
) {

const value =
    student.attendance ??
    student.attendancePercentage ??
    student.attendancePercent;


if (
    value === undefined ||
    value === null ||
    value === ""
) {

    return null;

}


const number =
    Number(value);


return Number.isFinite(number)
    ? number
    : null;

}

/* =========================================================
STUDENT ACTIONS
========================================================= */

function attachStudentActions() {

document
    .querySelectorAll(
        ".view-student-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        button.dataset.studentId;


                    openStudentDetails(id);

                }
            );

        }
    );

}

/* =========================================================
STUDENT DETAILS
========================================================= */

function openStudentDetails(
id
) {

const student =
    studentState.students.find(
        item =>
            String(
                item.id ||
                item.studentId ||
                item.enrollmentNo ||
                ""
            ) === String(id)
    );


if (!student) {

    return;

}


const name =
    student.name ||
    student.fullName ||
    "Student";


const enrollment =
    student.enrollmentNo ||
    student.enrollmentNumber ||
    student.registrationNo ||
    "—";


const image =
    student.profileImage ||
    student.image ||
    "";


const avatar =
    image

        ? `

            <img
                class="details-avatar"
                src="${escapeHTML(image)}"
                alt=""
            >

        `

        : `

            <span class="details-avatar">
                <i class="fa-solid fa-user"></i>
            </span>

        `;


DOM.studentDetailsContent.innerHTML = `

    <div class="student-details-header">

        ${avatar}

        <div>

            <h3>
                ${escapeHTML(name)}
            </h3>

            <p>
                ${escapeHTML(enrollment)}
            </p>

        </div>

    </div>


    <div class="details-grid">

        ${createDetailItem(
            "Branch",
            student.branch
        )}

        ${createDetailItem(
            "Semester",
            student.semester
        )}

        ${createDetailItem(
            "Section",
            student.section
        )}

        ${createDetailItem(
            "Class",
            student.className ||
            student.class
        )}

        ${createDetailItem(
            "Academic Session",
            student.session ||
            student.academicSession
        )}

        ${createDetailItem(
            "Attendance",
            getAttendanceNumber(student) !== null
                ? `${getAttendanceNumber(student)}%`
                : null
        )}

    </div>


    <div class="details-section">

        <h4>Academic Information</h4>

        <div class="detail-note">

            Academic performance, assignments,
            examination information and other
            faculty-accessible records will be
            loaded from the backend.

        </div>

    </div>


    <div class="details-section">

        <h4>Attendance</h4>

        <div class="detail-note">

            Subject-wise attendance and attendance
            history will appear here when available.

        </div>

    </div>


    <div class="details-section">

        <h4>Faculty Information</h4>

        <div class="detail-note">

            Faculty remarks and relevant student
            interactions will appear here according
            to the permissions provided by the
            backend.

        </div>

    </div>

`;


DOM.studentModal.classList.add(
    "active"
);


DOM.studentModal.setAttribute(
    "aria-hidden",
    "false"
);

}

function createDetailItem(
label,
value
) {

return `

    <div class="detail-item">

        <small>
            ${escapeHTML(label)}
        </small>

        <strong>
            ${escapeHTML(
                value || "—"
            )}
        </strong>

    </div>

`;

}

/* =========================================================
MODAL
========================================================= */

function setupModal() {

DOM.modalClose.addEventListener(
    "click",
    closeStudentModal
);


DOM.studentModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            DOM.studentModal
        ) {

            closeStudentModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            DOM.studentModal.classList.contains(
                "active"
            )
        ) {

            closeStudentModal();

        }

    }
);

}

function closeStudentModal() {

DOM.studentModal.classList.remove(
    "active"
);


DOM.studentModal.setAttribute(
    "aria-hidden",
    "true"
);

}

/* =========================================================
OVERVIEW CARD ACTIONS
========================================================= */

function setupOverviewCards() {

document
    .querySelectorAll(
        ".overview-card"
    )
    .forEach(
        card => {

            card.addEventListener(
                "click",
                function () {

                    const stat =
                        card.dataset.stat;


                    if (
                        stat ===
                        "assignedStudents"
                    ) {

                        DOM.studentSearch.focus();

                        return;

                    }


                    if (
                        stat ===
                        "attendance"
                    ) {

                        DOM.attendanceFilter.value =
                            "low";

                        applyFilters();

                        return;

                    }

                }
            );

        }
    );

}

/* =========================================================
BACK BUTTON
========================================================= */

function setupBackButton() {

DOM.backButton.addEventListener(
    "click",
    function () {

        if (
            window.history.length > 1
        ) {

            window.history.back();

        }

    }
);

}

/* =========================================================
REFRESH
========================================================= */

function setupRefreshButton() {

DOM.refreshButton.addEventListener(
    "click",
    refreshStudents
);

}

async function refreshStudents() {

DOM.refreshButton.disabled =
    true;


const icon =
    DOM.refreshButton.querySelector(
        "i"
    );


if (icon) {

    icon.classList.add(
        "fa-spin"
    );

}


try {

    if (
        CONFIG.API_BASE_URL
    ) {

        await loadStudentsPage();

    }

    else {

        renderEmptyPage();

    }

}

finally {

    setTimeout(
        () => {

            DOM.refreshButton.disabled =
                false;

            if (icon) {

                icon.classList.remove(
                    "fa-spin"
                );

            }

        },
        300
    );

}

}

/* =========================================================
API REQUEST
========================================================= */

async function apiRequest(
endpoint
) {

if (
    !CONFIG.API_BASE_URL
) {

    return null;

}


const response =
    await fetch(
        CONFIG.API_BASE_URL +
        endpoint,
        {

            method: "GET",

            headers: {

                "Content-Type":
                    "application/json"

            },

            credentials:
                "include"

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
HTML ESCAPE
========================================================= */

function escapeHTML(
value
) {

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