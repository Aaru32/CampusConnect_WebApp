/* =====================================================
   CAMPUSCONNECT
   ACADEMIC PLANNING
===================================================== */


/* =====================================================
   APPLICATION STATE
===================================================== */

const academicState = {

    currentView: "home",

    currentTool: null,

    selectedDay: null,

    courses: [],

    timetable: [],

    assignments: [],

    exams: [],

    leaveRequests: [],

    studyTasks: [],

    notifications: 0,

    progress: null

};


/* =====================================================
   DAYS
===================================================== */

const days = [

    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"

];


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeAcademicPlanning
);


async function initializeAcademicPlanning() {

    updateDate();

    await loadAcademicData();

    renderHome();

    renderCourses();

    renderLeaveRequests();

    renderDayTabs();

    renderAssignments();

    renderExams();

    renderStudyTasks();

    updateNotificationBadge();

    initializeLeaveForm();

}


/* =====================================================
   LOAD DATA
   -----------------------------------------------------
   FUTURE JAVA + MYSQL CONNECTION
===================================================== */

async function loadAcademicData() {

    /*
        REAL APPLICATION:

        Data will come from your Java backend.

        Example:

        const response = await fetch(
            "/api/student/academic-planning"
        );

        if (!response.ok) {
            throw new Error("Failed to load academic data");
        }

        const data = await response.json();

        academicState.courses =
            data.courses || [];

        academicState.timetable =
            data.timetable || [];

        academicState.assignments =
            data.assignments || [];

        academicState.exams =
            data.exams || [];

        academicState.leaveRequests =
            data.leaveRequests || [];

        academicState.studyTasks =
            data.studyTasks || [];

        academicState.notifications =
            data.notifications || 0;

        academicState.progress =
            data.progress ?? null;
    */


    /*
        Prototype:

        Empty collections are intentional.

        No student/course/timetable data
        is hardcoded here.
    */

    academicState.courses = [];

    academicState.timetable = [];

    academicState.assignments = [];

    academicState.exams = [];

    academicState.leaveRequests = [];

    academicState.studyTasks = [];

}


/* =====================================================
   VIEW SWITCHING
===================================================== */

function switchAcademicView(view) {

    academicState.currentView = view;


    document
        .querySelectorAll(".academic-view")
        .forEach(section => {

            section.classList.remove(
                "active-view"
            );

        });


    document
        .querySelectorAll(".bottom-nav-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const selectedView =
        document.getElementById(
            view + "View"
        );


    if (selectedView) {

        selectedView.classList.add(
            "active-view"
        );

    }


    const selectedNav =
        document.querySelector(
            `[data-view="${view}"]`
        );


    if (selectedNav) {

        selectedNav.classList.add(
            "active"
        );

    }


    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );


    if (subtitle) {

        if (view === "home") {

            subtitle.textContent =
                "Plan and manage your academic activities";

        }

        else if (view === "courses") {

            subtitle.textContent =
                "Your academic courses";

        }

        else if (view === "leave") {

            subtitle.textContent =
                "Manage your leave requests";

        }

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================================
   HOME
===================================================== */

function renderHome() {

    const courseCount =
        document.getElementById(
            "courseCount"
        );

    const assignmentCount =
        document.getElementById(
            "assignmentCount"
        );

    const examCount =
        document.getElementById(
            "examCount"
        );


    if (courseCount) {

        courseCount.textContent =
            academicState.courses.length;

    }


    if (assignmentCount) {

        assignmentCount.textContent =
            academicState.assignments.length;

    }


    if (examCount) {

        examCount.textContent =
            academicState.exams.length;

    }


    if (
        academicState.progress !== null &&
        academicState.progress !== undefined
    ) {

        const value =
            Number(
                academicState.progress
            );


        const progressValue =
            document.getElementById(
                "progressValue"
            );

        const overallProgress =
            document.getElementById(
                "overallProgress"
            );

        const progressBar =
            document.getElementById(
                "progressBar"
            );


        if (progressValue) {

            progressValue.textContent =
                value + "%";

        }


        if (overallProgress) {

            overallProgress.textContent =
                value + "%";

        }


        if (progressBar) {

            progressBar.style.width =
                value + "%";

        }

    }


    renderTodayClass();

}


/* =====================================================
   TODAY'S CLASS
===================================================== */

function renderTodayClass() {

    const container =
        document.getElementById(
            "todayClass"
        );


    if (!container) {

        return;

    }


    const today =
        new Date()
            .toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


    const classes =
        academicState.timetable.filter(
            item =>
                item.day === today &&
                item.approved === true
        );


    if (classes.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                No approved class information
                is available for today.

            </div>

        `;

        return;

    }


    const currentClass =
        classes[0];


    container.innerHTML = `

        <div class="today-class">

            <div class="class-time">

                ${escapeHTML(
                    currentClass.startTime
                )}

                <br>

                ${escapeHTML(
                    currentClass.endTime
                )}

            </div>


            <div class="class-details">

                <h3>

                    ${escapeHTML(
                        currentClass.title
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        currentClass.faculty || ""
                    )}

                    ${
                        currentClass.room
                            ? " • " +
                              escapeHTML(
                                  currentClass.room
                              )
                            : ""
                    }

                </p>

            </div>

        </div>

    `;

}


/* =====================================================
   COURSES
===================================================== */

function renderCourses(
    searchTerm = ""
) {

    const container =
        document.getElementById(
            "courseList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const search =
        String(
            searchTerm
        ).toLowerCase();


    const filtered =
        academicState.courses.filter(
            course => {

                const name =
                    String(
                        course.name || ""
                    ).toLowerCase();


                return name.includes(
                    search
                );

            }
        );


    if (filtered.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                Courses will be loaded
                from the CampusConnect
                academic database.

            </div>

        `;

        return;

    }


    filtered.forEach(course => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "course-card";


        card.onclick = () =>
            openCourse(
                course.id
            );


        card.innerHTML = `

            <div class="course-icon">

                <i class="fa-solid fa-book-open"></i>

            </div>


            <h3>

                ${escapeHTML(
                    course.name
                )}

            </h3>


            <p>

                ${escapeHTML(
                    course.faculty ||
                    "Faculty information unavailable"
                )}

            </p>


            <div class="course-meta">

                ${
                    course.type
                        ? `
                            <span class="course-tag">
                                ${escapeHTML(
                                    course.type
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    course.code
                        ? `
                            <span class="course-tag">
                                ${escapeHTML(
                                    course.code
                                )}
                            </span>
                          `
                        : ""
                }

            </div>

        `;


        container.appendChild(
            card
        );

    });

}


/* =====================================================
   COURSE SEARCH
===================================================== */

function searchCourses() {

    const input =
        document.getElementById(
            "courseSearch"
        );


    if (!input) {

        return;

    }


    renderCourses(
        input.value
    );

}


/* =====================================================
   OPEN COURSE
===================================================== */

function openCourse(courseId) {

    console.log(
        "Course selected:",
        courseId
    );


    /*
        FUTURE COURSE DETAIL VIEW:

        Faculty
        Theory
        Lab
        TW
        Syllabus
        Study Material
        Assignments
        Attendance
        Progress
    */

}


/* =====================================================
   LEAVE REQUEST
===================================================== */

function openLeaveModal() {

    const modal =
        document.getElementById(
            "leaveModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function closeLeaveModal() {

    const modal =
        document.getElementById(
            "leaveModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =====================================================
   LEAVE FORM
   -----------------------------------------------------
   FIXED:
   Event listener is initialized only
   after DOMContentLoaded.
===================================================== */

function initializeLeaveForm() {

    const leaveForm =
        document.getElementById(
            "leaveForm"
        );


    if (!leaveForm) {

        return;

    }


    leaveForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const fromDate =
                document.getElementById(
                    "leaveFrom"
                );

            const toDate =
                document.getElementById(
                    "leaveTo"
                );

            const reason =
                document.getElementById(
                    "leaveReason"
                );


            if (
                !fromDate ||
                !toDate ||
                !reason
            ) {

                console.error(
                    "Leave form fields are missing."
                );

                return;

            }


            if (
                !fromDate.value ||
                !toDate.value ||
                !reason.value.trim()
            ) {

                return;

            }


            const leaveRequest = {

                fromDate:
                    fromDate.value,

                toDate:
                    toDate.value,

                reason:
                    reason.value.trim(),

                status:
                    "pending"

            };


            /*
                FUTURE JAVA API:

                POST /api/leave-requests

                Backend should save:

                studentId
                fromDate
                toDate
                reason
                status

                Faculty/Admin can then
                approve or reject the request.
            */


            academicState.leaveRequests.unshift(
                leaveRequest
            );


            renderLeaveRequests();


            closeLeaveModal();


            leaveForm.reset();

        }
    );

}


/* =====================================================
   LEAVE REQUEST LIST
===================================================== */

function renderLeaveRequests() {

    const container =
        document.getElementById(
            "leaveList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    let pending = 0;

    let approved = 0;

    let rejected = 0;


    academicState.leaveRequests
        .forEach(request => {

            if (
                request.status === "pending"
            ) {

                pending++;

            }


            if (
                request.status === "approved"
            ) {

                approved++;

            }


            if (
                request.status === "rejected"
            ) {

                rejected++;

            }

        });


    const pendingElement =
        document.getElementById(
            "pendingLeaves"
        );

    const approvedElement =
        document.getElementById(
            "approvedLeaves"
        );

    const rejectedElement =
        document.getElementById(
            "rejectedLeaves"
        );


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (approvedElement) {

        approvedElement.textContent =
            approved;

    }


    if (rejectedElement) {

        rejectedElement.textContent =
            rejected;

    }


    if (
        academicState.leaveRequests.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                You have not submitted
                any leave requests yet.

            </div>

        `;

        return;

    }


    academicState.leaveRequests
        .forEach(request => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "leave-card";


            card.innerHTML = `

                <div class="leave-card-top">

                    <h3>

                        ${formatDate(
                            request.fromDate
                        )}

                        –

                        ${formatDate(
                            request.toDate
                        )}

                    </h3>


                    <span class="status ${escapeHTML(
                        request.status
                    )}">

                        ${formatStatus(
                            request.status
                        )}

                    </span>

                </div>


                <p>

                    ${escapeHTML(
                        request.reason
                    )}

                </p>

            `;


            container.appendChild(
                card
            );

        });

}


/* =====================================================
   ACADEMIC TOOLS
===================================================== */

function showAcademicTool(
    tool
) {

    const homeView =
        document.getElementById(
            "homeView"
        );

    const coursesView =
        document.getElementById(
            "coursesView"
        );

    const leaveView =
        document.getElementById(
            "leaveView"
        );

    const toolView =
        document.getElementById(
            "toolView"
        );


    if (homeView) {

        homeView.classList.remove(
            "active-view"
        );

    }


    if (coursesView) {

        coursesView.classList.remove(
            "active-view"
        );

    }


    if (leaveView) {

        leaveView.classList.remove(
            "active-view"
        );

    }


    if (toolView) {

        toolView.classList.add(
            "active-view"
        );

    }


    document
        .querySelectorAll(
            ".academic-view"
        )
        .forEach(section => {

            if (
                section.id !== "toolView"
            ) {

                section.classList.remove(
                    "active-view"
                );

            }

        });


    document
        .querySelectorAll(
            ".bottom-nav-item"
        )
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


    academicState.currentTool =
        tool;


    document
        .querySelectorAll(
            ".tool-content"
        )
        .forEach(
            content =>
                content.classList.remove(
                    "active-tool"
                )
        );


    if (tool === "timetable") {

        setToolHeader(
            "Timetable",
            "WEEKLY SCHEDULE"
        );


        const timetableTool =
            document.getElementById(
                "timetableTool"
            );


        if (timetableTool) {

            timetableTool.classList.add(
                "active-tool"
            );

        }


        renderDayTabs();


        selectDay(
            getCurrentDay()
        );

    }


    else if (tool === "assignments") {

        setToolHeader(
            "Assignments",
            "ACADEMIC WORK"
        );


        const assignmentsTool =
            document.getElementById(
                "assignmentsTool"
            );


        if (assignmentsTool) {

            assignmentsTool.classList.add(
                "active-tool"
            );

        }


        renderAssignments();

    }


    else if (tool === "exams") {

        setToolHeader(
            "Exams",
            "EXAMINATION PLANNER"
        );


        const examsTool =
            document.getElementById(
                "examsTool"
            );


        if (examsTool) {

            examsTool.classList.add(
                "active-tool"
            );

        }


        renderExams();

    }


    else if (tool === "planner") {

        setToolHeader(
            "Study Planner",
            "PERSONAL PLANNING"
        );


        const plannerTool =
            document.getElementById(
                "plannerTool"
            );


        if (plannerTool) {

            plannerTool.classList.add(
                "active-tool"
            );

        }


        renderStudyTasks();

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================================
   TOOL HEADER
===================================================== */

function setToolHeader(
    title,
    label
) {

    const toolTitle =
        document.getElementById(
            "toolTitle"
        );

    const toolLabel =
        document.getElementById(
            "toolLabel"
        );


    if (toolTitle) {

        toolTitle.textContent =
            title;

    }


    if (toolLabel) {

        toolLabel.textContent =
            label;

    }

}


/* =====================================================
   RETURN HOME
===================================================== */

function returnToHome() {

    const toolView =
        document.getElementById(
            "toolView"
        );


    if (toolView) {

        toolView.classList.remove(
            "active-view"
        );

    }


    switchAcademicView(
        "home"
    );

}


/* =====================================================
   TIMETABLE
===================================================== */

function renderDayTabs() {

    const container =
        document.getElementById(
            "dayTabs"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    days.forEach(day => {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "day-tab";


        button.type =
            "button";


        button.textContent =
            day;


        button.onclick = () =>
            selectDay(day);


        container.appendChild(
            button
        );

    });

}


function selectDay(day) {

    academicState.selectedDay =
        day;


    document
        .querySelectorAll(
            ".day-tab"
        )
        .forEach(button => {

            button.classList.toggle(

                "active",

                button.textContent === day

            );

        });


    renderTimetable(day);

}


function renderTimetable(day) {

    const container =
        document.getElementById(
            "timetableList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const schedule =
        academicState.timetable.filter(
            item =>
                item.day === day
        );


    if (schedule.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                Timetable information will
                appear here from the
                academic database.

            </div>

        `;

        return;

    }


    schedule.forEach(item => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "schedule-row";


        row.innerHTML = `

            <div class="schedule-time">

                ${escapeHTML(
                    item.startTime
                )}

                –

                ${escapeHTML(
                    item.endTime
                )}

            </div>


            <div class="schedule-main">

                <h3>

                    ${escapeHTML(
                        item.title
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        item.faculty || ""
                    )}

                    ${
                        item.room
                            ? " • " +
                              escapeHTML(
                                  item.room
                              )
                            : ""
                    }

                </p>

            </div>


            <span class="schedule-type">

                ${escapeHTML(
                    item.type || "Class"
                )}

            </span>

        `;


        container.appendChild(
            row
        );

    });

}


/* =====================================================
   ASSIGNMENTS
===================================================== */

function renderAssignments(
    filter = "all"
) {

    const container =
        document.getElementById(
            "assignmentList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    let assignments =
        academicState.assignments;


    if (filter !== "all") {

        assignments =
            assignments.filter(
                assignment =>
                    assignment.status === filter
            );

    }


    if (assignments.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                No assignments available.

            </div>

        `;

        return;

    }


    assignments.forEach(
        assignment => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "assignment-card";


            card.innerHTML = `

                <div class="assignment-top">

                    <h3>

                        ${escapeHTML(
                            assignment.title
                        )}

                    </h3>


                    <span class="status ${escapeHTML(
                        assignment.status
                    )}">

                        ${formatStatus(
                            assignment.status
                        )}

                    </span>

                </div>


                <p>

                    ${escapeHTML(
                        assignment.subject
                    )}

                </p>


                <p>

                    Due:

                    ${formatDate(
                        assignment.dueDate
                    )}

                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


function filterAssignments(
    filter,
    button
) {

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    renderAssignments(
        filter
    );

}


/* =====================================================
   EXAMS
===================================================== */

function renderExams() {

    const container =
        document.getElementById(
            "examList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        academicState.exams.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                No upcoming examinations
                are currently available.

            </div>

        `;

        return;

    }


    academicState.exams.forEach(
        exam => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "exam-card";


            card.innerHTML = `

                <h3>

                    ${escapeHTML(
                        exam.subject
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        exam.type || "Exam"
                    )}

                </p>


                <p>

                    Date:

                    ${formatDate(
                        exam.date
                    )}

                </p>


                <p>

                    Time:

                    ${escapeHTML(
                        exam.startTime || "--"
                    )}

                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   STUDY PLANNER
===================================================== */

function addStudyTask() {

    const title =
        prompt(
            "Enter study task:"
        );


    if (
        !title ||
        !title.trim()
    ) {

        return;

    }


    const task = {

        id:
            Date.now(),

        title:
            title.trim(),

        completed:
            false

    };


    academicState.studyTasks.push(
        task
    );


    renderStudyTasks();

}


function renderStudyTasks() {

    const container =
        document.getElementById(
            "studyTaskList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        academicState.studyTasks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                No study tasks yet.

            </div>

        `;

        return;

    }


    academicState.studyTasks.forEach(
        task => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "study-card";


            card.innerHTML = `

                <h3>

                    ${escapeHTML(
                        task.title
                    )}

                </h3>


                <p>

                    Personal study task

                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!badge) {

        return;

    }


    if (
        academicState.notifications > 0
    ) {

        badge.textContent =
            academicState.notifications;

        badge.style.display =
            "flex";

    }

    else {

        badge.textContent =
            "";

        badge.style.display =
            "none";

    }

}


function openNotifications() {

    console.log(
        "Open CampusConnect notifications"
    );

}


/* =====================================================
   BACK TO DASHBOARD
===================================================== */

function goBack() {

    window.location.href =
        "student-dashboard.html";

}


/* =====================================================
   CURRENT DAY
===================================================== */

function getCurrentDay() {

    return new Date()
        .toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );

}


/* =====================================================
   DATE
===================================================== */

function updateDate() {

    const element =
        document.getElementById(
            "todayDate"
        );


    if (!element) {

        return;

    }


    element.textContent =
        new Date()
            .toLocaleDateString(
                "en-IN",
                {

                    weekday: "short",

                    day: "numeric",

                    month: "short",

                    year: "numeric"

                }
            );

}


function formatDate(date) {

    if (!date) {

        return "--";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "--";

    }


    return parsedDate
        .toLocaleDateString(
            "en-IN",
            {

                day: "numeric",

                month: "short",

                year: "numeric"

            }
        );

}


/* =====================================================
   STATUS
===================================================== */

function formatStatus(status) {

    if (!status) {

        return "";

    }


    const value =
        String(
            status
        );


    return value
        .charAt(0)
        .toUpperCase()
        +
        value.slice(1);

}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}