/* =========================================================
   CAMPUSCONNECT
   FACULTY ATTENDANCE
   Dynamic / API-Ready Architecture
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        SUMMARY:
            "/faculty/attendance/summary",

        CLASSES:
            "/faculty/attendance/classes",

        CLASS_STUDENTS:
            "/faculty/attendance/classes/{classId}/students",

        HISTORY:
            "/faculty/attendance/classes/{classId}/history",

        STUDENT_ATTENDANCE:
            "/faculty/attendance/students/{studentId}",

        SAVE_ATTENDANCE:
            "/faculty/attendance",

        NOTIFICATIONS:
            "/notifications"

    }

};


/* =========================================================
   ROUTES
========================================================= */

const ROUTES = {

    DASHBOARD:
        "faculty-dashboard.html",

    NOTIFICATIONS:
        "notifications.html",

    PROFILE:
        "profile.html"

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
        document.getElementById("notificationButton"),

    notificationCount:
        document.getElementById("notificationCount"),

    facultyProfileButton:
        document.getElementById(
            "facultyProfileButton"
        ),

    headerFacultyName:
        document.getElementById(
            "headerFacultyName"
        ),

    headerProfileImage:
        document.getElementById(
            "headerProfileImage"
        ),

    myClassesCount:
        document.getElementById(
            "myClassesCount"
        ),

    todayClassesCount:
        document.getElementById(
            "todayClassesCount"
        ),

    studentsAssigned:
        document.getElementById(
            "studentsAssigned"
        ),

    averageAttendance:
        document.getElementById(
            "averageAttendance"
        ),

    subjectFilter:
        document.getElementById(
            "subjectFilter"
        ),

    classFilter:
        document.getElementById(
            "classFilter"
        ),

    studentSearch:
        document.getElementById(
            "studentSearch"
        ),

    classesContainer:
        document.getElementById(
            "classesContainer"
        ),

    classRecordCount:
        document.getElementById(
            "classRecordCount"
        ),

    historyContainer:
        document.getElementById(
            "historyContainer"
        ),

    studentTableContainer:
        document.getElementById(
            "studentTableContainer"
        ),

    analyticsContainer:
        document.getElementById(
            "analyticsContainer"
        ),

    viewHistoryButton:
        document.getElementById(
            "viewHistoryButton"
        ),

    attendanceModal:
        document.getElementById(
            "attendanceModal"
        ),

    closeAttendanceModal:
        document.getElementById(
            "closeAttendanceModal"
        ),

    cancelAttendance:
        document.getElementById(
            "cancelAttendance"
        ),

    saveAttendance:
        document.getElementById(
            "saveAttendance"
        ),

    modalClassTitle:
        document.getElementById(
            "modalClassTitle"
        ),

    attendanceDate:
        document.getElementById(
            "attendanceDate"
        ),

    lectureTopic:
        document.getElementById(
            "lectureTopic"
        ),

    attendanceStudentList:
        document.getElementById(
            "attendanceStudentList"
        ),

    markAllPresent:
        document.getElementById(
            "markAllPresent"
        ),

    clearAttendance:
        document.getElementById(
            "clearAttendance"
        )

};


/* =========================================================
   STATE
========================================================= */

const attendanceState = {

    profile: null,

    summary: null,

    classes: [],

    students: [],

    history: [],

    notifications: [],

    selectedClass: null,

    selectedSubject: "",

    selectedClassId: "",

    searchText: ""

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAttendance
);


function initializeAttendance() {

    setupHeader();

    setupFilters();

    setupModal();

    setupActionButtons();

    loadAttendancePage();

}


/* =========================================================
   LOAD PAGE
========================================================= */

async function loadAttendancePage() {

    if (!CONFIG.API_BASE_URL) {

        renderEmptyPage();

        return;

    }


    try {

        await Promise.all([

            loadSummary(),

            loadClasses(),

            loadNotifications()

        ]);

    }

    catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );

        renderEmptyPage();

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

                credentials: "include",

                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                }

            }
        );


    if (!response.ok) {

        throw new Error(
            `API request failed: ${response.status}`
        );

    }


    return response.json();

}


/* =========================================================
   SUMMARY
========================================================= */

async function loadSummary() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.SUMMARY
        );


    if (!data) {

        return;

    }


    attendanceState.summary =
        data;


    if (data.faculty) {

        attendanceState.profile =
            data.faculty;

        updateProfileHeader(
            data.faculty
        );

    }


    setText(
        DOM.myClassesCount,
        data.myClasses
    );


    setText(
        DOM.todayClassesCount,
        data.todayClasses
    );


    setText(
        DOM.studentsAssigned,
        data.studentsAssigned
    );


    setText(
        DOM.averageAttendance,
        formatPercentage(
            data.averageAttendance
        )
    );

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


    attendanceState.classes =
        data;


    populateFilters();

    renderClasses();

}


/* =========================================================
   PROFILE HEADER
========================================================= */

function updateProfileHeader(
    profile
) {

    const name =
        profile.name ||
        profile.fullName ||
        "Faculty";


    setText(
        DOM.headerFacultyName,
        name
    );


    if (
        profile.profileImage &&
        DOM.headerProfileImage
    ) {

        DOM.headerProfileImage.src =
            profile.profileImage;

    }

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    if (DOM.subjectFilter) {

        DOM.subjectFilter.addEventListener(
            "change",
            () => {

                attendanceState.selectedSubject =
                    DOM.subjectFilter.value;

                renderClasses();

            }
        );

    }


    if (DOM.classFilter) {

        DOM.classFilter.addEventListener(
            "change",
            () => {

                attendanceState.selectedClassId =
                    DOM.classFilter.value;

                renderClasses();

            }
        );

    }


    if (DOM.studentSearch) {

        DOM.studentSearch.addEventListener(
            "input",
            () => {

                attendanceState.searchText =
                    DOM.studentSearch.value
                        .trim()
                        .toLowerCase();

                renderClasses();

                renderStudentTable();

            }
        );

    }

}


/* =========================================================
   POPULATE FILTERS
========================================================= */

function populateFilters() {

    if (!DOM.subjectFilter ||
        !DOM.classFilter) {

        return;

    }


    const subjects = [
        ...new Map(
            attendanceState.classes.map(
                item => [

                    item.subjectId ||
                    item.subject ||
                    item.subjectName,

                    item.subject ||
                    item.subjectName ||
                    "Subject"

                ]
            )
        ).entries()
    ];


    DOM.subjectFilter.innerHTML = `

        <option value="">
            All My Subjects
        </option>

    `;


    subjects.forEach(
        ([value, label]) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value || "";

            option.textContent =
                label;

            DOM.subjectFilter.appendChild(
                option
            );

        }
    );


    DOM.classFilter.innerHTML = `

        <option value="">
            All My Classes
        </option>

    `;


    attendanceState.classes
        .forEach(classItem => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                classItem.id ||
                classItem.classId ||
                "";

            option.textContent =
                classItem.className ||
                classItem.semester ||
                "Class";

            DOM.classFilter.appendChild(
                option
            );

        });

}


/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses() {

    if (!DOM.classesContainer) {

        return;

    }


    let classes =
        [...attendanceState.classes];


    if (
        attendanceState.selectedSubject
    ) {

        classes =
            classes.filter(
                item =>
                    String(
                        item.subjectId ||
                        item.subject ||
                        item.subjectName ||
                        ""
                    ) ===
                    String(
                        attendanceState.selectedSubject
                    )
            );

    }


    if (
        attendanceState.selectedClassId
    ) {

        classes =
            classes.filter(
                item =>
                    String(
                        item.id ||
                        item.classId ||
                        ""
                    ) ===
                    String(
                        attendanceState.selectedClassId
                    )
            );

    }


    if (
        attendanceState.searchText
    ) {

        const search =
            attendanceState.searchText;


        classes =
            classes.filter(
                item => {

                    const text = [

                        item.subject,

                        item.subjectName,

                        item.className,

                        item.semester,

                        item.room

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );

                }
            );

    }


    if (DOM.classRecordCount) {

        DOM.classRecordCount.textContent =
            `${classes.length} ${
                classes.length === 1
                    ? "class"
                    : "classes"
            }`;

    }


    if (!classes.length) {

        DOM.classesContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-chalkboard"></i>
                </div>

                <h3>No matching classes</h3>

                <p>
                    No assigned class matches the
                    current filters.
                </p>

            </div>

        `;

        return;

    }


    const rows =
        classes
            .map(createClassRow)
            .join("");


    DOM.classesContainer.innerHTML = `

        <div class="classes-table-wrapper">

            <table class="data-table">

                <thead>

                    <tr>

                        <th>Subject</th>

                        <th>Class / Semester</th>

                        <th>Schedule</th>

                        <th>Students</th>

                        <th>Attendance</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

        </div>

    `;


    attachClassActions();

}


/* =========================================================
   CLASS ROW
========================================================= */

function createClassRow(
    classItem
) {

    const id =
        escapeHTML(
            classItem.id ||
            classItem.classId ||
            ""
        );


    const subject =
        escapeHTML(
            classItem.subject ||
            classItem.subjectName ||
            "—"
        );


    const className =
        escapeHTML(
            classItem.className ||
            classItem.semester ||
            "—"
        );


    const schedule =
        escapeHTML(
            classItem.schedule ||
            classItem.time ||
            "—"
        );


    const students =
        classItem.studentCount ??
        "—";


    const attendance =
        formatPercentage(
            classItem.attendance
        );


    return `

        <tr>

            <td>
                <span class="subject-badge">
                    ${subject}
                </span>
            </td>

            <td>
                <strong>
                    ${className}
                </strong>
            </td>

            <td>
                ${schedule}
            </td>

            <td>
                ${escapeHTML(students)}
            </td>

            <td>
                ${escapeHTML(attendance)}
            </td>

            <td>

                <button
                    type="button"
                    class="action-button"
                    data-action="mark"
                    data-class-id="${id}"
                >
                    Mark Attendance
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   CLASS ACTIONS
========================================================= */

function attachClassActions() {

    document
        .querySelectorAll(
            "[data-action='mark']"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openAttendanceModal(
                        button.dataset.classId
                    );

                }
            );

        });

}


/* =========================================================
   ATTENDANCE MODAL
========================================================= */

async function openAttendanceModal(
    classId
) {

    const selected =
        attendanceState.classes.find(
            item =>
                String(
                    item.id ||
                    item.classId ||
                    ""
                ) ===
                String(classId)
        );


    if (!selected) {

        return;

    }


    attendanceState.selectedClass =
        selected;


    if (DOM.modalClassTitle) {

        const subject =
            selected.subject ||
            selected.subjectName ||
            "Class";


        const className =
            selected.className ||
            selected.semester ||
            "";


        DOM.modalClassTitle.textContent =
            `${subject} ${
                className
                    ? "— " + className
                    : ""
            }`;

    }


    if (DOM.attendanceDate) {

        DOM.attendanceDate.value =
            getTodayDate();

    }


    if (DOM.lectureTopic) {

        DOM.lectureTopic.value = "";

    }


    DOM.attendanceModal.hidden =
        false;


    await loadClassStudents(
        classId
    );

}


async function loadClassStudents(
    classId
) {

    if (!DOM.attendanceStudentList) {

        return;

    }


    if (!CONFIG.API_BASE_URL) {

        renderModalEmptyStudents();

        return;

    }


    try {

        const endpoint =
            CONFIG.ENDPOINTS.CLASS_STUDENTS
                .replace(
                    "{classId}",
                    encodeURIComponent(classId)
                );


        const data =
            await apiRequest(
                endpoint
            );


        if (!Array.isArray(data)) {

            renderModalEmptyStudents();

            return;

        }


        attendanceState.students =
            data;


        renderModalStudents();

    }

    catch (error) {

        console.error(
            "Student loading error:",
            error
        );

        renderModalEmptyStudents();

    }

}


/* =========================================================
   MODAL STUDENTS
========================================================= */

function renderModalStudents() {

    if (!DOM.attendanceStudentList) {

        return;

    }


    if (
        !attendanceState.students.length
    ) {

        renderModalEmptyStudents();

        return;

    }


    DOM.attendanceStudentList.innerHTML =
        attendanceState.students
            .map(createAttendanceStudent)
            .join("");


    attachAttendanceStatusEvents();

}


function renderModalEmptyStudents() {

    DOM.attendanceStudentList.innerHTML = `

        <div class="empty-state compact">

            <i class="fa-solid fa-users"></i>

            <h3>No students available</h3>

            <p>
                No student records are currently
                available for this assigned class.
            </p>

        </div>

    `;

}


function createAttendanceStudent(
    student
) {

    const id =
        escapeHTML(
            student.id ||
            student.studentId ||
            ""
        );


    const name =
        escapeHTML(
            student.name ||
            student.fullName ||
            "Student"
        );


    const roll =
        escapeHTML(
            student.rollNumber ||
            student.rollNo ||
            "—"
        );


    return `

        <div
            class="attendance-student-row"
            data-student-id="${id}"
        >

            <div class="attendance-student-info">

                <strong>
                    ${name}
                </strong>

                <span>
                    Roll No. ${roll}
                </span>

            </div>


            <div class="attendance-status">

                <button
                    type="button"
                    class="status-button present"
                    data-status="present"
                >
                    Present
                </button>

                <button
                    type="button"
                    class="status-button absent"
                    data-status="absent"
                >
                    Absent
                </button>

                <button
                    type="button"
                    class="status-button late"
                    data-status="late"
                >
                    Late
                </button>

            </div>

        </div>

    `;

}


function attachAttendanceStatusEvents() {

    document
        .querySelectorAll(
            ".attendance-student-row"
        )
        .forEach(row => {

            row.querySelectorAll(
                ".status-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        row.querySelectorAll(
                            ".status-button"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                        button.classList.add(
                            "active"
                        );

                    }
                );

            });

        });

}


/* =========================================================
   MARK ALL PRESENT
========================================================= */

function markAllPresent() {

    document
        .querySelectorAll(
            ".attendance-student-row"
        )
        .forEach(row => {

            const present =
                row.querySelector(
                    ".status-button.present"
                );


            row.querySelectorAll(
                ".status-button"
            )
            .forEach(
                button =>
                    button.classList.remove(
                        "active"
                    )
            );


            if (present) {

                present.classList.add(
                    "active"
                );

            }

        });

}


function clearAttendance() {

    document
        .querySelectorAll(
            ".status-button"
        )
        .forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );

}


/* =========================================================
   SAVE ATTENDANCE
========================================================= */

async function saveAttendance() {

    if (
        !attendanceState.selectedClass
    ) {

        return;

    }


    const records = [];


    document
        .querySelectorAll(
            ".attendance-student-row"
        )
        .forEach(row => {

            const active =
                row.querySelector(
                    ".status-button.active"
                );


            if (!active) {

                return;

            }


            records.push({

                studentId:
                    row.dataset.studentId,

                status:
                    active.dataset.status

            });

        });


    if (!records.length) {

        alert(
            "Please mark attendance for at least one student."
        );

        return;

    }


    const payload = {

        classId:
            attendanceState.selectedClass.id ||
            attendanceState.selectedClass.classId,

        date:
            DOM.attendanceDate.value,

        topic:
            DOM.lectureTopic.value.trim(),

        records

    };


    if (!CONFIG.API_BASE_URL) {

        /*
         * Backend is not connected yet.
         * No fake data is saved.
         */

        alert(
            "Attendance API is not connected yet."
        );

        return;

    }


    try {

        DOM.saveAttendance.disabled =
            true;


        await apiRequest(
            CONFIG.ENDPOINTS.SAVE_ATTENDANCE,
            {

                method: "POST",

                body:
                    JSON.stringify(payload)

            }
        );


        closeAttendanceModal();


        await loadSummary();

        await loadClasses();

        await loadHistory(
            attendanceState.selectedClass.id ||
            attendanceState.selectedClass.classId
        );

    }

    catch (error) {

        console.error(
            "Attendance save error:",
            error
        );

        alert(
            "Unable to save attendance. Please try again."
        );

    }

    finally {

        DOM.saveAttendance.disabled =
            false;

    }

}


/* =========================================================
   HISTORY
========================================================= */

async function loadHistory(
    classId
) {

    if (!classId) {

        return;

    }


    if (!CONFIG.API_BASE_URL) {

        renderHistoryEmpty();

        return;

    }


    try {

        const endpoint =
            CONFIG.ENDPOINTS.HISTORY
                .replace(
                    "{classId}",
                    encodeURIComponent(classId)
                );


        const data =
            await apiRequest(
                endpoint
            );


        attendanceState.history =
            Array.isArray(data)
                ? data
                : [];


        renderHistory();

    }

    catch (error) {

        console.error(
            "History loading error:",
            error
        );

        renderHistoryEmpty();

    }

}


function renderHistory() {

    if (!DOM.historyContainer) {

        return;

    }


    if (
        !attendanceState.history.length
    ) {

        renderHistoryEmpty();

        return;

    }


    const rows =
        attendanceState.history
            .map(item => `

                <tr>

                    <td>
                        ${escapeHTML(
                            item.date || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.topic || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.present ?? "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.absent ?? "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            formatPercentage(
                                item.percentage
                            )
                        )}
                    </td>

                </tr>

            `)
            .join("");


    DOM.historyContainer.innerHTML = `

        <div class="classes-table-wrapper">

            <table class="data-table">

                <thead>

                    <tr>
                        <th>Date</th>
                        <th>Topic</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Attendance</th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;

}


function renderHistoryEmpty() {

    DOM.historyContainer.innerHTML = `

        <div class="empty-state compact">

            <div class="empty-icon">
                <i class="fa-regular fa-calendar-xmark"></i>
            </div>

            <h3>No attendance history</h3>

            <p>
                Previous attendance records will appear
                after attendance has been recorded.
            </p>

        </div>

    `;

}


/* =========================================================
   STUDENT TABLE
========================================================= */

function renderStudentTable() {

    if (!DOM.studentTableContainer) {

        return;

    }


    const students =
        attendanceState.students
            .filter(student => {

                if (
                    !attendanceState.searchText
                ) {

                    return true;

                }


                const text = [

                    student.name,

                    student.fullName,

                    student.rollNumber,

                    student.rollNo

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return text.includes(
                    attendanceState.searchText
                );

            });


    if (!students.length) {

        DOM.studentTableContainer.innerHTML = `

            <div class="empty-state compact">

                <div class="empty-icon">
                    <i class="fa-solid fa-users"></i>
                </div>

                <h3>No student attendance data</h3>

                <p>
                    Student attendance will appear here
                    when backend records are available.
                </p>

            </div>

        `;

        return;

    }


    DOM.studentTableContainer.innerHTML = `

        <div class="student-table-wrapper">

            <table class="data-table">

                <thead>

                    <tr>
                        <th>Student</th>
                        <th>Roll Number</th>
                        <th>Classes</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Attendance</th>
                    </tr>

                </thead>

                <tbody>

                    ${
                        students
                            .map(
                                student => `

                                <tr>

                                    <td>
                                        <strong>
                                            ${escapeHTML(
                                                student.name ||
                                                student.fullName ||
                                                "Student"
                                            )}
                                        </strong>
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            student.rollNumber ||
                                            student.rollNo ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            student.totalClasses ??
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            student.present ??
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            student.absent ??
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            formatPercentage(
                                                student.attendance
                                            )
                                        )}
                                    </td>

                                </tr>

                            `
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   EMPTY PAGE
========================================================= */

function renderEmptyPage() {

    setText(
        DOM.myClassesCount,
        "—"
    );

    setText(
        DOM.todayClassesCount,
        "—"
    );

    setText(
        DOM.studentsAssigned,
        "—"
    );

    setText(
        DOM.averageAttendance,
        "—"
    );


    attendanceState.classes = [];

    attendanceState.students = [];

    attendanceState.history = [];


    if (DOM.classesContainer) {

        DOM.classesContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-chalkboard"></i>
                </div>

                <h3>No classes assigned</h3>

                <p>
                    Your assigned classes will appear here
                    when faculty attendance data is available.
                </p>

            </div>

        `;

    }


    renderHistoryEmpty();

    renderStudentTable();

}


/* =========================================================
   HEADER
========================================================= */

function setupHeader() {

    if (DOM.backBtn) {

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
                        ROUTES.DASHBOARD;

                }

            }
        );

    }


    if (DOM.refreshButton) {

        DOM.refreshButton.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );

    }


    if (DOM.notificationButton) {

        DOM.notificationButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    ROUTES.NOTIFICATIONS;

            }
        );

    }


    if (DOM.facultyProfileButton) {

        DOM.facultyProfileButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    ROUTES.PROFILE;

            }
        );

    }

}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function setupActionButtons() {

    document
        .querySelectorAll(
            ".attendance-action"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    if (
                        action === "mark"
                    ) {

                        if (
                            attendanceState.classes.length
                        ) {

                            openAttendanceModal(
                                attendanceState.classes[0].id ||
                                attendanceState.classes[0].classId
                            );

                        }

                        else {

                            alert(
                                "No assigned class is available."
                            );

                        }

                    }


                    if (
                        action === "history"
                    ) {

                        DOM.historyContainer.scrollIntoView({
                            behavior: "smooth"
                        });

                    }


                    if (
                        action === "students"
                    ) {

                        DOM.studentTableContainer.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        });


    if (DOM.viewHistoryButton) {

        DOM.viewHistoryButton.addEventListener(
            "click",
            () => {

                DOM.historyContainer.scrollIntoView({
                    behavior: "smooth"
                });

            }
        );

    }

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

    if (DOM.closeAttendanceModal) {

        DOM.closeAttendanceModal.addEventListener(
            "click",
            closeAttendanceModal
        );

    }


    if (DOM.cancelAttendance) {

        DOM.cancelAttendance.addEventListener(
            "click",
            closeAttendanceModal
        );

    }


    if (DOM.attendanceModal) {

        DOM.attendanceModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    DOM.attendanceModal
                ) {

                    closeAttendanceModal();

                }

            }
        );

    }


    if (DOM.markAllPresent) {

        DOM.markAllPresent.addEventListener(
            "click",
            markAllPresent
        );

    }


    if (DOM.clearAttendance) {

        DOM.clearAttendance.addEventListener(
            "click",
            clearAttendance
        );

    }


    if (DOM.saveAttendance) {

        DOM.saveAttendance.addEventListener(
            "click",
            saveAttendance
        );

    }

}


function closeAttendanceModal() {

    if (DOM.attendanceModal) {

        DOM.attendanceModal.hidden =
            true;

    }


    attendanceState.selectedClass =
        null;

    attendanceState.students =
        [];

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


    attendanceState.notifications =
        data;


    const unread =
        data.filter(
            item =>
                item.read === false
        ).length;


    if (
        DOM.notificationCount
    ) {

        DOM.notificationCount.textContent =
            unread;


        DOM.notificationCount.hidden =
            unread === 0;

    }

}


/* =========================================================
   HELPERS
========================================================= */

function setText(
    element,
    value
) {

    if (!element) {

        return;

    }


    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "—"
            : value;

}


function formatPercentage(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "—";

    }


    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return String(value);

    }


    return `${number}%`;

}


function getTodayDate() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


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