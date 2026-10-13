/* =========================================================
   CAMPUSCONNECT
   ADMIN STUDENT MANAGEMENT
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    /*
     * Keep this empty while frontend and backend
     * are not connected.
     *
     * Example later:
     * API_BASE_URL: "http://localhost:8080/api"
     */

    API_BASE_URL: "",

    ENDPOINTS: {
        students: "/admin/students",
        filters: "/admin/students/filters"
    }

};


/* =========================================================
   STATE
========================================================= */

const state = {

    allStudents: [],

    filteredStudents: [],

    filters: {
        branch: "",
        semester: "",
        session: "",
        status: "",
        department: ""
    },

    search: ""

};


/* =========================================================
   DOM
========================================================= */

const elements = {

    backButton: document.getElementById("backButton"),

    searchButton: document.getElementById("searchButton"),
    searchContainer: document.getElementById("searchContainer"),
    studentSearch: document.getElementById("studentSearch"),
    clearSearch: document.getElementById("clearSearch"),

    filterButton: document.getElementById("filterButton"),
    filterPanel: document.getElementById("filterPanel"),
    closeFilter: document.getElementById("closeFilter"),

    branchFilter: document.getElementById("branchFilter"),
    semesterFilter: document.getElementById("semesterFilter"),
    sessionFilter: document.getElementById("sessionFilter"),
    statusFilter: document.getElementById("statusFilter"),
    departmentFilter: document.getElementById("departmentFilter"),

    clearFilters: document.getElementById("clearFilters"),
    applyFilters: document.getElementById("applyFilters"),

    refreshButton: document.getElementById("refreshButton"),

    studentCount: document.getElementById("studentCount"),
    activeFilterBadge: document.getElementById("activeFilterBadge"),
    listDescription: document.getElementById("listDescription"),

    studentList: document.getElementById("studentList"),

    loadingState: document.getElementById("loadingState"),
    emptyState: document.getElementById("emptyState"),
    emptyTitle: document.getElementById("emptyTitle"),
    emptyMessage: document.getElementById("emptyMessage")

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeEvents();

    loadStudents();

});


/* =========================================================
   EVENTS
========================================================= */

function initializeEvents() {

    elements.backButton.addEventListener(
        "click",
        goBack
    );


    elements.searchButton.addEventListener(
        "click",
        toggleSearch
    );


    elements.studentSearch.addEventListener(
        "input",
        handleSearch
    );


    elements.clearSearch.addEventListener(
        "click",
        clearSearch
    );


    elements.filterButton.addEventListener(
        "click",
        toggleFilters
    );


    elements.closeFilter.addEventListener(
        "click",
        closeFilters
    );


    elements.applyFilters.addEventListener(
        "click",
        applyFilters
    );


    elements.clearFilters.addEventListener(
        "click",
        clearFilters
    );


    elements.refreshButton.addEventListener(
        "click",
        loadStudents
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function goBack() {

    if (window.history.length > 1) {

        window.history.back();

        return;

    }

    window.location.href = "admin-dashboard.html";

}


/* =========================================================
   SEARCH
========================================================= */

function toggleSearch() {

    elements.searchContainer.classList.toggle("open");

    if (
        elements.searchContainer.classList.contains("open")
    ) {

        setTimeout(() => {
            elements.studentSearch.focus();
        }, 100);

    }

}


function handleSearch(event) {

    state.search = event.target.value.trim();

    renderStudents();

}


function clearSearch() {

    elements.studentSearch.value = "";

    state.search = "";

    renderStudents();

    elements.studentSearch.focus();

}


/* =========================================================
   FILTER PANEL
========================================================= */

function toggleFilters() {

    elements.filterPanel.classList.toggle("open");

}


function closeFilters() {

    elements.filterPanel.classList.remove("open");

}


function applyFilters() {

    state.filters.branch =
        elements.branchFilter.value;

    state.filters.semester =
        elements.semesterFilter.value;

    state.filters.session =
        elements.sessionFilter.value;

    state.filters.status =
        elements.statusFilter.value;

    state.filters.department =
        elements.departmentFilter.value;

    updateFilterBadge();

    closeFilters();

    renderStudents();

}


function clearFilters() {

    elements.branchFilter.value = "";
    elements.semesterFilter.value = "";
    elements.sessionFilter.value = "";
    elements.statusFilter.value = "";
    elements.departmentFilter.value = "";

    state.filters = {
        branch: "",
        semester: "",
        session: "",
        status: "",
        department: ""
    };

    updateFilterBadge();

    renderStudents();

}


/* =========================================================
   FILTER BADGE
========================================================= */

function updateFilterBadge() {

    const count =
        Object.values(state.filters)
            .filter(value => value !== "")
            .length;

    elements.activeFilterBadge.textContent =
        `${count} filter${count === 1 ? "" : "s"}`;

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    showLoading();

    try {

        const data = await request(
            CONFIG.ENDPOINTS.students
        );

        state.allStudents =
            normalizeStudentResponse(data);

        populateFilters(data);

        renderStudents();

    } catch (error) {

        console.error(
            "Unable to load student records:",
            error
        );

        state.allStudents = [];

        showEmpty(
            "Student database is not connected",
            "Student records will appear here when the Admin Student API is connected."
        );

    }

}


/* =========================================================
   API REQUEST
========================================================= */

async function request(endpoint) {

    if (!CONFIG.API_BASE_URL) {

        throw new Error(
            "API_BASE_URL is not configured."
        );

    }

    const response = await fetch(
        `${CONFIG.API_BASE_URL}${endpoint}`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }
    );


    if (!response.ok) {

        throw new Error(
            `Request failed with status ${response.status}`
        );

    }


    return response.json();

}


/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

function normalizeStudentResponse(data) {

    /*
     * Supports common backend response formats:
     *
     * [
     *   {...},
     *   {...}
     * ]
     *
     * or
     *
     * {
     *   students: [...]
     * }
     *
     * or
     *
     * {
     *   data: [...]
     * }
     */

    if (Array.isArray(data)) {
        return data;
    }


    if (
        data &&
        Array.isArray(data.students)
    ) {
        return data.students;
    }


    if (
        data &&
        Array.isArray(data.data)
    ) {
        return data.data;
    }


    return [];

}


/* =========================================================
   POPULATE FILTERS
========================================================= */

function populateFilters(data) {

    const filterData =
        data?.filters || data?.filterOptions;


    if (!filterData) {

        /*
         * If the backend sends only the student list,
         * filter values are generated from the actual
         * returned records.
         */

        populateSelectFromStudents(
            elements.branchFilter,
            "branch"
        );

        populateSelectFromStudents(
            elements.semesterFilter,
            "semester"
        );

        populateSelectFromStudents(
            elements.sessionFilter,
            "session"
        );

        populateSelectFromStudents(
            elements.statusFilter,
            "status"
        );

        populateSelectFromStudents(
            elements.departmentFilter,
            "department"
        );

        return;

    }


    populateSelect(
        elements.branchFilter,
        filterData.branches,
        "All Branches"
    );


    populateSelect(
        elements.semesterFilter,
        filterData.semesters,
        "All Semesters"
    );


    populateSelect(
        elements.sessionFilter,
        filterData.sessions,
        "All Sessions"
    );


    populateSelect(
        elements.statusFilter,
        filterData.statuses,
        "All Status"
    );


    populateSelect(
        elements.departmentFilter,
        filterData.departments,
        "All Departments"
    );

}


/* =========================================================
   SELECT HELPERS
========================================================= */

function populateSelect(
    select,
    values,
    defaultText
) {

    select.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = defaultText;

    select.appendChild(defaultOption);


    if (!Array.isArray(values)) {
        return;
    }


    [...new Set(values)]
        .filter(value => value !== null && value !== undefined)
        .sort((a, b) =>
            String(a).localeCompare(String(b))
        )
        .forEach(value => {

            const option =
                document.createElement("option");

            option.value = value;
            option.textContent = value;

            select.appendChild(option);

        });

}


function populateSelectFromStudents(
    select,
    field
) {

    const values =
        state.allStudents
            .map(student =>
                getStudentField(student, field)
            )
            .filter(value =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            );

    let defaultText = "All";


    if (field === "branch") {
        defaultText = "All Branches";
    }

    if (field === "semester") {
        defaultText = "All Semesters";
    }

    if (field === "session") {
        defaultText = "All Sessions";
    }

    if (field === "status") {
        defaultText = "All Status";
    }

    if (field === "department") {
        defaultText = "All Departments";
    }


    populateSelect(
        select,
        values,
        defaultText
    );

}


/* =========================================================
   FILTER + SEARCH
========================================================= */

function getVisibleStudents() {

    let students =
        [...state.allStudents];


    /* SEARCH */

    if (state.search) {

        const search =
            state.search.toLowerCase();

        students =
            students.filter(student => {

                const name =
                    getStudentField(
                        student,
                        "name"
                    );

                const roll =
                    getStudentField(
                        student,
                        "rollNumber"
                    );

                const registration =
                    getStudentField(
                        student,
                        "registrationNumber"
                    );


                return [

                    name,
                    roll,
                    registration

                ]
                    .filter(Boolean)
                    .some(value =>
                        String(value)
                            .toLowerCase()
                            .includes(search)
                    );

            });

    }


    /* BRANCH */

    if (state.filters.branch) {

        students =
            students.filter(student =>
                matches(
                    getStudentField(
                        student,
                        "branch"
                    ),
                    state.filters.branch
                )
            );

    }


    /* SEMESTER */

    if (state.filters.semester) {

        students =
            students.filter(student =>
                matches(
                    getStudentField(
                        student,
                        "semester"
                    ),
                    state.filters.semester
                )
            );

    }


    /* SESSION */

    if (state.filters.session) {

        students =
            students.filter(student =>
                matches(
                    getStudentField(
                        student,
                        "session"
                    ),
                    state.filters.session
                )
            );

    }


    /* STATUS */

    if (state.filters.status) {

        students =
            students.filter(student =>
                matches(
                    getStudentField(
                        student,
                        "status"
                    ),
                    state.filters.status
                )
            );

    }


    /* DEPARTMENT */

    if (state.filters.department) {

        students =
            students.filter(student =>
                matches(
                    getStudentField(
                        student,
                        "department"
                    ),
                    state.filters.department
                )
            );

    }


    return students;

}


/* =========================================================
   RENDER
========================================================= */

function renderStudents() {

    const students =
        getVisibleStudents();


    state.filteredStudents =
        students;


    elements.studentList.innerHTML = "";


    updateStudentCount(
        students.length
    );


    if (!students.length) {

        if (
            state.search ||
            Object.values(state.filters)
                .some(Boolean)
        ) {

            showEmpty(
                "No matching students",
                "Try changing the search text or selected filters."
            );

        } else {

            showEmpty(
                "No student records available",
                "Student records will appear here when they are available from the database."
            );

        }

        return;

    }


    hideStates();


    students.sort(
        compareStudentNames
    );


    const groups =
        groupAlphabetically(students);


    Object.keys(groups)
        .sort()
        .forEach(letter => {

            const group =
                document.createElement("section");

            group.className =
                "letter-group";


            const heading =
                document.createElement("div");

            heading.className =
                "letter-heading";

            heading.textContent =
                letter;


            group.appendChild(heading);


            groups[letter].forEach(student => {

                group.appendChild(
                    createStudentRow(student)
                );

            });


            elements.studentList.appendChild(group);

        });


    elements.listDescription.textContent =
        state.search ||
        Object.values(state.filters).some(Boolean)

            ? "Showing students matching your search or filters."

            : "Students are arranged alphabetically by name.";

}


/* =========================================================
   STUDENT ROW
========================================================= */

function createStudentRow(student) {

    const row =
        document.createElement("article");

    row.className =
        "student-row";


    const name =
        getStudentField(
            student,
            "name"
        ) || "Unnamed Student";


    const session =
        getStudentField(
            student,
            "session"
        );


    const branch =
        getStudentField(
            student,
            "branch"
        );


    const department =
        getStudentField(
            student,
            "department"
        );


    const semester =
        getStudentField(
            student,
            "semester"
        );


    const avatar =
        document.createElement("img");

    avatar.className =
        "student-avatar";

    avatar.alt =
        `${name} profile photo`;

    avatar.src =
        getProfileImage(
            student,
            name
        );


    avatar.addEventListener(
        "error",
        () => {
            avatar.src =
                createInitialAvatar(name);
        },
        { once: true }
    );


    const info =
        document.createElement("div");

    info.className =
        "student-info";


    const nameElement =
        document.createElement("div");

    nameElement.className =
        "student-name";

    nameElement.textContent =
        name;


    const meta =
        document.createElement("div");

    meta.className =
        "student-meta";


    const values = [];


    if (session) {
        values.push(session);
    }


    if (branch) {
        values.push(branch);
    } else if (department) {
        values.push(department);
    }


    if (semester) {
        values.push(
            `Semester ${semester}`
        );
    }


    values.forEach(
        (value, index) => {

            if (index > 0) {

                const separator =
                    document.createElement("span");

                separator.className =
                    "separator";

                separator.textContent =
                    "•";

                meta.appendChild(
                    separator
                );

            }


            const span =
                document.createElement("span");

            span.textContent =
                value;

            meta.appendChild(span);

        }
    );


    info.appendChild(nameElement);
    info.appendChild(meta);


    const arrow =
        document.createElement("div");

    arrow.className =
        "student-arrow";

    arrow.innerHTML =
        '<i class="fa-solid fa-chevron-right"></i>';


    row.appendChild(avatar);
    row.appendChild(info);
    row.appendChild(arrow);


    row.addEventListener(
        "click",
        () => openStudentProfile(student)
    );


    return row;

}


/* =========================================================
   OPEN PROFILE
========================================================= */

function openStudentProfile(student) {

    const id =
        student.id ??
        student.studentId ??
        student.student_id ??
        student.registrationNumber ??
        student.registration_no;


    if (
        id === null ||
        id === undefined ||
        String(id).trim() === ""
    ) {

        console.error(
            "Student record does not contain a usable identifier.",
            student
        );

        return;

    }


    window.location.href =
        `student-profile.html?id=${encodeURIComponent(id)}`;

}


/* =========================================================
   ALPHABETICAL GROUPING
========================================================= */

function groupAlphabetically(students) {

    const groups = {};


    students.forEach(student => {

        const name =
            getStudentField(
                student,
                "name"
            ) || "";


        const firstCharacter =
            name
                .trim()
                .charAt(0)
                .toUpperCase();


        const letter =
            /^[A-Z]$/.test(firstCharacter)
                ? firstCharacter
                : "#";


        if (!groups[letter]) {
            groups[letter] = [];
        }


        groups[letter].push(student);

    });


    return groups;

}


/* =========================================================
   SORT
========================================================= */

function compareStudentNames(a, b) {

    const nameA =
        String(
            getStudentField(a, "name") || ""
        );


    const nameB =
        String(
            getStudentField(b, "name") || ""
        );


    return nameA.localeCompare(
        nameB,
        undefined,
        {
            sensitivity: "base"
        }
    );

}


/* =========================================================
   FIELD RESOLUTION
========================================================= */

function getStudentField(
    student,
    field
) {

    const mappings = {

        name: [
            "name",
            "fullName",
            "full_name",
            "studentName",
            "student_name"
        ],

        profilePhoto: [
            "profilePhoto",
            "profile_photo",
            "photo",
            "photoUrl",
            "photo_url",
            "profileImage",
            "profile_image"
        ],

        session: [
            "session",
            "academicSession",
            "academic_session"
        ],

        branch: [
            "branch",
            "branchName",
            "branch_name"
        ],

        department: [
            "department",
            "departmentName",
            "department_name"
        ],

        semester: [
            "semester",
            "currentSemester",
            "current_semester"
        ],

        rollNumber: [
            "rollNumber",
            "roll_number",
            "rollNo",
            "roll_no"
        ],

        registrationNumber: [
            "registrationNumber",
            "registration_number",
            "registrationNo",
            "registration_no"
        ],

        status: [
            "status",
            "enrollmentStatus",
            "enrollment_status"
        ]

    };


    const possibleKeys =
        mappings[field] || [field];


    for (const key of possibleKeys) {

        if (
            student &&
            student[key] !== undefined &&
            student[key] !== null
        ) {

            return student[key];

        }

    }


    return "";

}


/* =========================================================
   IMAGE
========================================================= */

function getProfileImage(
    student,
    name
) {

    const suppliedImage =
        getStudentField(
            student,
            "profilePhoto"
        );


    if (suppliedImage) {
        return suppliedImage;
    }


    return createInitialAvatar(name);

}


function createInitialAvatar(name) {

    return (
        "https://ui-avatars.com/api/?" +
        `name=${encodeURIComponent(name)}` +
        "&size=128" +
        "&background=edf5ff" +
        "&color=0757c9" +
        "&bold=true"
    );

}


/* =========================================================
   MATCH
========================================================= */

function matches(value, filter) {

    return String(value)
        .toLowerCase()
        ===
        String(filter)
            .toLowerCase();

}


/* =========================================================
   COUNT
========================================================= */

function updateStudentCount(count) {

    elements.studentCount.textContent =
        `${count} Student${count === 1 ? "" : "s"}`;

}


/* =========================================================
   UI STATES
========================================================= */

function showLoading() {

    elements.loadingState.hidden = false;

    elements.emptyState.hidden = true;

    elements.studentList.innerHTML = "";

}


function showEmpty(
    title,
    message
) {

    elements.loadingState.hidden = true;

    elements.emptyState.hidden = false;

    elements.emptyTitle.textContent =
        title;

    elements.emptyMessage.textContent =
        message;

}


function hideStates() {

    elements.loadingState.hidden = true;

    elements.emptyState.hidden = true;

}