/* =========================================================
   CAMPUSCONNECT
   EXPORT STUDENT DATA
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        students:
            "/admin/students",

        filters:
            "/admin/students/filters",

        exportStudentData:
            "/admin/students/export"

    }

};


/* =========================================================
   DOM
========================================================= */

const backButton =
    document.getElementById("backButton");

const refreshButton =
    document.getElementById("refreshButton");

const scopeInputs =
    document.querySelectorAll(
        'input[name="exportScope"]'
    );

const filterSection =
    document.getElementById(
        "filterSection"
    );

const selectedStudentsSection =
    document.getElementById(
        "selectedStudentsSection"
    );

const departmentFilter =
    document.getElementById(
        "departmentFilter"
    );

const branchFilter =
    document.getElementById(
        "branchFilter"
    );

const semesterFilter =
    document.getElementById(
        "semesterFilter"
    );

const sessionFilter =
    document.getElementById(
        "sessionFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const clearExportFilters =
    document.getElementById(
        "clearExportFilters"
    );

const selectStudentsButton =
    document.getElementById(
        "selectStudentsButton"
    );

const selectedStudentsSummary =
    document.getElementById(
        "selectedStudentsSummary"
    );

const selectedPreview =
    document.getElementById(
        "selectedPreview"
    );

const selectedPreviewList =
    document.getElementById(
        "selectedPreviewList"
    );

const clearSelectedStudents =
    document.getElementById(
        "clearSelectedStudents"
    );

const generateExport =
    document.getElementById(
        "generateExport"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


/* =========================================================
   MODAL DOM
========================================================= */

const studentModal =
    document.getElementById(
        "studentModal"
    );

const closeStudentModal =
    document.getElementById(
        "closeStudentModal"
    );

const cancelStudentSelection =
    document.getElementById(
        "cancelStudentSelection"
    );

const confirmStudentSelection =
    document.getElementById(
        "confirmStudentSelection"
    );

const modalStudentSearch =
    document.getElementById(
        "modalStudentSearch"
    );

const selectAllStudents =
    document.getElementById(
        "selectAllStudents"
    );

const clearAllStudents =
    document.getElementById(
        "clearAllStudents"
    );

const studentSelectionList =
    document.getElementById(
        "studentSelectionList"
    );

const modalStudentCount =
    document.getElementById(
        "modalStudentCount"
    );

const modalSelectedCount =
    document.getElementById(
        "modalSelectedCount"
    );


/* =========================================================
   STATE
========================================================= */

const state = {

    allStudents: [],

    selectedStudents: [],

    temporarySelectedIds: new Set(),

    filters: {

        department: "",

        branch: "",

        semester: "",

        session: "",

        status: ""

    },

    modalSearch: ""

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEvents();

        loadFilterOptions();

    }
);


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* ---------------------------------------------
       BACK
    --------------------------------------------- */

    backButton.addEventListener(
        "click",
        () => {

            if (
                window.history.length > 1
            ) {

                window.history.back();

            } else {

                window.location.href =
                    "student-statistics.html";

            }

        }
    );


    /* ---------------------------------------------
       REFRESH
    --------------------------------------------- */

    refreshButton.addEventListener(
        "click",
        () => {

            refreshButton.style.transform =
                "rotate(180deg)";

            setTimeout(
                () => {

                    window.location.reload();

                },
                250
            );

        }
    );


    /* ---------------------------------------------
       SCOPE
    --------------------------------------------- */

    scopeInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                handleScopeChange
            );

        }
    );


    /* ---------------------------------------------
       FILTER CLEAR
    --------------------------------------------- */

    clearExportFilters.addEventListener(
        "click",
        clearFilters
    );


    /* ---------------------------------------------
       SELECT STUDENTS
    --------------------------------------------- */

    selectStudentsButton.addEventListener(
        "click",
        openStudentSelector
    );


    /* ---------------------------------------------
       CLEAR SELECTED
    --------------------------------------------- */

    clearSelectedStudents.addEventListener(
        "click",
        () => {

            state.selectedStudents = [];

            updateSelectedSummary();

            showMessage(
                "Student selection cleared.",
                "info"
            );

        }
    );


    /* ---------------------------------------------
       MODAL CLOSE
    --------------------------------------------- */

    closeStudentModal.addEventListener(
        "click",
        closeStudentSelector
    );


    cancelStudentSelection.addEventListener(
        "click",
        closeStudentSelector
    );


    /* ---------------------------------------------
       MODAL SEARCH
    --------------------------------------------- */

    modalStudentSearch.addEventListener(
        "input",
        () => {

            state.modalSearch =
                modalStudentSearch.value
                    .trim()
                    .toLowerCase();

            renderStudentSelector();

        }
    );


    /* ---------------------------------------------
       SELECT ALL
    --------------------------------------------- */

    selectAllStudents.addEventListener(
        "click",
        () => {

            const visibleStudents =
                getVisibleModalStudents();

            visibleStudents.forEach(
                student => {

                    const id =
                        getStudentId(student);

                    if (id !== null) {

                        state.temporarySelectedIds.add(
                            String(id)
                        );

                    }

                }
            );

            renderStudentSelector();

        }
    );


    /* ---------------------------------------------
       CLEAR ALL
    --------------------------------------------- */

    clearAllStudents.addEventListener(
        "click",
        () => {

            state.temporarySelectedIds.clear();

            renderStudentSelector();

        }
    );


    /* ---------------------------------------------
       CONFIRM
    --------------------------------------------- */

    confirmStudentSelection.addEventListener(
        "click",
        confirmSelection
    );


    /* ---------------------------------------------
       GENERATE EXPORT
    --------------------------------------------- */

    generateExport.addEventListener(
        "click",
        generateSecureExport
    );


    /* ---------------------------------------------
       ESCAPE MODAL
    --------------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !studentModal.hidden
            ) {

                closeStudentSelector();

            }

        }
    );

}


/* =========================================================
   SCOPE CHANGE
========================================================= */

function handleScopeChange() {

    const scope =
        getSelectedScope();


    filterSection.hidden =
        scope !== "filtered";


    selectedStudentsSection.hidden =
        scope !== "selected";


    if (
        scope === "filtered"
    ) {

        loadFilterOptions();

    }


    if (
        scope === "selected"
    ) {

        updateSelectedSummary();

    }

}


/* =========================================================
   GET SCOPE
========================================================= */

function getSelectedScope() {

    const selected =
        document.querySelector(
            'input[name="exportScope"]:checked'
        );

    return selected
        ? selected.value
        : "all";

}


/* =========================================================
   LOAD FILTER OPTIONS
========================================================= */

async function loadFilterOptions() {

    if (!CONFIG.API_BASE_URL) {

        return;

    }


    try {

        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.filters,
                {

                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        populateFilterOptions(
            data
        );


    } catch (error) {

        console.error(
            "Filter options error:",
            error
        );

    }

}


/* =========================================================
   POPULATE FILTERS
========================================================= */

function populateFilterOptions(data) {

    if (!data) {
        return;
    }


    const options =
        data.filters ||
        data.filterOptions ||
        data;


    populateSelect(
        departmentFilter,
        options.departments
    );

    populateSelect(
        branchFilter,
        options.branches
    );

    populateSelect(
        semesterFilter,
        options.semesters
    );

    populateSelect(
        sessionFilter,
        options.sessions
    );

    populateSelect(
        statusFilter,
        options.statuses ||
        options.enrollmentStatuses
    );

}


/* =========================================================
   POPULATE SELECT
========================================================= */

function populateSelect(
    select,
    values
) {

    if (
        !select ||
        !Array.isArray(values)
    ) {

        return;

    }


    const firstOption =
        select.options[0];


    select.innerHTML = "";


    if (firstOption) {

        select.appendChild(
            firstOption
        );

    }


    values.forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );


            if (
                typeof value === "object"
            ) {

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

                option.value =
                    String(value);

                option.textContent =
                    String(value);

            }


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    departmentFilter.value = "";
    branchFilter.value = "";
    semesterFilter.value = "";
    sessionFilter.value = "";
    statusFilter.value = "";

    state.filters = {

        department: "",
        branch: "",
        semester: "",
        session: "",
        status: ""

    };

}


/* =========================================================
   OPEN STUDENT SELECTOR
========================================================= */

async function openStudentSelector() {

    state.temporarySelectedIds =
        new Set(
            state.selectedStudents
                .map(
                    student =>
                        String(
                            getStudentId(student)
                        )
                )
        );


    modalStudentSearch.value = "";

    state.modalSearch = "";


    studentModal.hidden = false;


    document.body.style.overflow =
        "hidden";


    renderModalLoading();


    if (
        state.allStudents.length === 0
    ) {

        await loadStudents();

    }


    renderStudentSelector();


    setTimeout(
        () => {

            modalStudentSearch.focus();

        },
        50
    );

}


/* =========================================================
   CLOSE STUDENT SELECTOR
========================================================= */

function closeStudentSelector() {

    studentModal.hidden = true;

    document.body.style.overflow = "";

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    if (!CONFIG.API_BASE_URL) {

        renderModalWaiting();

        return;

    }


    try {

        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.students,
                {

                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        state.allStudents =
            normalizeStudents(data);


    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );

        renderModalError();

    }

}


/* =========================================================
   NORMALIZE STUDENTS
========================================================= */

function normalizeStudents(data) {

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
   MODAL LOADING
========================================================= */

function renderModalLoading() {

    studentSelectionList.innerHTML = `

        <div class="modal-state">

            <i class="fa-solid fa-arrows-rotate"></i>

            <h3>
                Loading students
            </h3>

            <p>
                Retrieving student records from the database.
            </p>

        </div>

    `;

}


/* =========================================================
   MODAL WAITING
========================================================= */

function renderModalWaiting() {

    studentSelectionList.innerHTML = `

        <div class="modal-state">

            <i class="fa-solid fa-database"></i>

            <h3>
                Student database is not connected
            </h3>

            <p>
                Student records will appear here after
                the Admin Student API is connected.
            </p>

        </div>

    `;

}


/* =========================================================
   MODAL ERROR
========================================================= */

function renderModalError() {

    studentSelectionList.innerHTML = `

        <div class="modal-state">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Unable to load students
            </h3>

            <p>
                The student records could not be retrieved
                from the Admin Student API.
            </p>

        </div>

    `;

}


/* =========================================================
   RENDER SELECTOR
========================================================= */

function renderStudentSelector() {

    if (
        !Array.isArray(
            state.allStudents
        ) ||
        state.allStudents.length === 0
    ) {

        renderModalWaiting();

        updateModalCounts();

        return;

    }


    const visibleStudents =
        getVisibleModalStudents();


    if (
        visibleStudents.length === 0
    ) {

        studentSelectionList.innerHTML = `

            <div class="modal-state">

                <i class="fa-solid fa-user-slash"></i>

                <h3>
                    No matching students
                </h3>

                <p>
                    No student records match your search.
                </p>

            </div>

        `;

        updateModalCounts();

        return;

    }


    const sortedStudents =
        [...visibleStudents].sort(
            (a, b) => {

                return getStudentName(a)
                    .localeCompare(
                        getStudentName(b),
                        "en",
                        {
                            sensitivity:
                                "base"
                        }
                    );

            }
        );


    const groups = {};


    sortedStudents.forEach(
        student => {

            const name =
                getStudentName(student);


            const letter =
                name
                    .charAt(0)
                    .toUpperCase() ||
                "#";


            if (!groups[letter]) {

                groups[letter] = [];

            }


            groups[letter].push(
                student
            );

        }
    );


    studentSelectionList.innerHTML = "";


    Object.keys(groups)
        .sort()
        .forEach(
            letter => {

                const groupTitle =
                    document.createElement(
                        "div"
                    );

                groupTitle.className =
                    "student-group-title";

                groupTitle.textContent =
                    letter;


                studentSelectionList
                    .appendChild(
                        groupTitle
                    );


                groups[letter].forEach(
                    student => {

                        createStudentSelectionRow(
                            student
                        );

                    }
                );

            }
        );


    updateModalCounts();

}


/* =========================================================
   CREATE STUDENT ROW
========================================================= */

function createStudentSelectionRow(
    student
) {

    const id =
        getStudentId(student);


    if (id === null) {
        return;
    }


    const row =
        document.createElement(
            "label"
        );


    row.className =
        "student-select-row";


    const checkbox =
        document.createElement(
            "input"
        );


    checkbox.type =
        "checkbox";

    checkbox.value =
        String(id);

    checkbox.checked =
        state.temporarySelectedIds.has(
            String(id)
        );


    checkbox.addEventListener(
        "change",
        () => {

            if (checkbox.checked) {

                state.temporarySelectedIds.add(
                    String(id)
                );

            } else {

                state.temporarySelectedIds.delete(
                    String(id)
                );

            }

            updateModalCounts();

        }
    );


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "student-select-avatar";


    image.src =
        getStudentPhoto(student);


    image.alt =
        getStudentName(student);


    image.onerror =
        () => {

            image.src =
                getAvatarUrl(
                    getStudentName(student)
                );

        };


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "student-select-info";


    const name =
        document.createElement(
            "strong"
        );


    name.textContent =
        getStudentName(student);


    const details =
        document.createElement(
            "span"
        );


    details.textContent =
        getStudentMeta(student);


    info.appendChild(name);

    info.appendChild(details);


    row.appendChild(checkbox);

    row.appendChild(image);

    row.appendChild(info);


    studentSelectionList
        .appendChild(row);

}


/* =========================================================
   VISIBLE MODAL STUDENTS
========================================================= */

function getVisibleModalStudents() {

    const query =
        state.modalSearch;


    if (!query) {

        return [
            ...state.allStudents
        ];

    }


    return state.allStudents.filter(
        student => {

            const searchableText =
                [

                    getStudentName(student),

                    getStudentValue(
                        student,
                        [
                            "rollNumber",
                            "rollNo",
                            "roll_no",
                            "roll"
                        ]
                    ),

                    getStudentValue(
                        student,
                        [
                            "registrationNumber",
                            "registrationNo",
                            "registration_no",
                            "registration"
                        ]
                    )

                ]
                    .join(" ")
                    .toLowerCase();


            return searchableText.includes(
                query
            );

        }
    );

}


/* =========================================================
   CONFIRM SELECTION
========================================================= */

function confirmSelection() {

    const selectedIds =
        state.temporarySelectedIds;


    state.selectedStudents =
        state.allStudents.filter(
            student => {

                const id =
                    getStudentId(student);

                return (
                    id !== null &&
                    selectedIds.has(
                        String(id)
                    )
                );

            }
        );


    updateSelectedSummary();

    closeStudentSelector();


    showMessage(
        `${state.selectedStudents.length} student(s) selected for export.`,
        "success"
    );

}


/* =========================================================
   UPDATE SELECTED SUMMARY
========================================================= */

function updateSelectedSummary() {

    const count =
        state.selectedStudents.length;


    selectedStudentsSummary.textContent =
        `${count} student${count === 1 ? "" : "s"} selected`;


    if (count === 0) {

        selectedPreview.hidden = true;

        selectedPreviewList.innerHTML = "";

        return;

    }


    selectedPreview.hidden = false;

    selectedPreviewList.innerHTML = "";


    const sorted =
        [...state.selectedStudents].sort(
            (a, b) => {

                return getStudentName(a)
                    .localeCompare(
                        getStudentName(b),
                        "en",
                        {
                            sensitivity:
                                "base"
                        }
                    );

            }
        );


    sorted.forEach(
        student => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "selected-preview-item";


            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "preview-avatar";


            image.src =
                getStudentPhoto(student);


            image.alt =
                getStudentName(student);


            image.onerror =
                () => {

                    image.src =
                        getAvatarUrl(
                            getStudentName(student)
                        );

                };


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "preview-info";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                getStudentName(student);


            const details =
                document.createElement(
                    "span"
                );


            details.textContent =
                getStudentMeta(student);


            info.appendChild(name);

            info.appendChild(details);


            item.appendChild(image);

            item.appendChild(info);


            selectedPreviewList
                .appendChild(item);

        }
    );

}


/* =========================================================
   UPDATE MODAL COUNTS
========================================================= */

function updateModalCounts() {

    const count =
        state.temporarySelectedIds.size;


    modalStudentCount.textContent =
        `${count} student${count === 1 ? "" : "s"} selected`;


    modalSelectedCount.textContent =
        `${count} selected`;

}


/* =========================================================
   GENERATE SECURE EXPORT
========================================================= */

async function generateSecureExport() {

    clearMessage();


    const scope =
        getSelectedScope();


    const fields =
        getSelectedFields();


    const format =
        getSelectedFormat();


    if (fields.length === 0) {

        showMessage(
            "Select at least one information category to export.",
            "error"
        );

        return;

    }


    if (
        scope === "selected" &&
        state.selectedStudents.length === 0
    ) {

        showMessage(
            "Please select at least one student before generating the export.",
            "error"
        );

        return;

    }


    const filters =
        getFilters();


    const requestData = {

        scope: scope,

        filters: filters,

        studentIds:
            scope === "selected"
                ? state.selectedStudents.map(
                    student =>
                        getStudentId(student)
                )
                : [],

        fields: fields,

        format: format

    };


    /*
     * No fake export is generated.
     * The actual export and encryption must
     * be performed by the Java backend.
     */

    if (!CONFIG.API_BASE_URL) {

        showMessage(
            "The Export API is not connected yet. Connect the Java backend to generate the secure student export.",
            "info"
        );

        return;

    }


    generateExport.disabled = true;

    generateExport.innerHTML = `
        <i class="fa-solid fa-arrows-rotate"></i>
        Generating Secure Export...
    `;


    try {

        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.exportStudentData,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestData
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        handleExportResponse(
            data
        );


    } catch (error) {

        console.error(
            "Student export error:",
            error
        );


        showMessage(
            "The secure export could not be generated. Please try again.",
            "error"
        );

    } finally {

        generateExport.disabled = false;

        generateExport.innerHTML = `
            <i class="fa-solid fa-lock"></i>
            Generate Secure Export
        `;

    }

}


/* =========================================================
   GET SELECTED FIELDS
========================================================= */

function getSelectedFields() {

    return [
        ...document.querySelectorAll(
            'input[name="exportFields"]:checked'
        )
    ].map(
        input => input.value
    );

}


/* =========================================================
   GET FILE FORMAT
========================================================= */

function getSelectedFormat() {

    const selected =
        document.querySelector(
            'input[name="fileFormat"]:checked'
        );


    return selected
        ? selected.value
        : "xlsx";

}


/* =========================================================
   GET FILTERS
========================================================= */

function getFilters() {

    return {

        department:
            departmentFilter.value,

        branch:
            branchFilter.value,

        semester:
            semesterFilter.value,

        session:
            sessionFilter.value,

        status:
            statusFilter.value

    };

}


/* =========================================================
   HANDLE EXPORT RESPONSE
========================================================= */

function handleExportResponse(
    data
) {

    if (!data) {

        showMessage(
            "The backend returned an empty export response.",
            "error"
        );

        return;

    }


    const fileUrl =
        data.fileUrl ||
        data.downloadUrl ||
        data.url;


    const fileName =
        data.fileName ||
        "campusconnect-student-export";


    const password =
        data.password;


    if (password) {

        showMessage(
            `Export generated successfully. Keep this password separately: ${password}`,
            "success"
        );

    } else {

        showMessage(
            "Export generated successfully.",
            "success"
        );

    }


    if (fileUrl) {

        const link =
            document.createElement(
                "a"
            );


        link.href =
            fileUrl;

        link.download =
            fileName;

        link.target =
            "_blank";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

    }

}


/* =========================================================
   STUDENT ID
========================================================= */

function getStudentId(
    student
) {

    if (!student) {
        return null;
    }


    return (
        student.id ??
        student.studentId ??
        student.student_id ??
        student.registrationNumber ??
        student.registration_no ??
        student.registration ??
        null
    );

}


/* =========================================================
   STUDENT NAME
========================================================= */

function getStudentName(
    student
) {

    if (!student) {
        return "Unnamed Student";
    }


    return (
        student.fullName ??
        student.full_name ??
        student.name ??
        student.studentName ??
        student.student_name ??
        "Unnamed Student"
    );

}


/* =========================================================
   STUDENT VALUE
========================================================= */

function getStudentValue(
    student,
    keys
) {

    for (
        const key of keys
    ) {

        if (
            student &&
            student[key] !==
            undefined &&
            student[key] !== null
        ) {

            return student[key];

        }

    }


    return "";

}


/* =========================================================
   STUDENT META
========================================================= */

function getStudentMeta(
    student
) {

    const branch =
        getStudentValue(
            student,
            [
                "branch",
                "branchName",
                "branch_name"
            ]
        );


    const department =
        getStudentValue(
            student,
            [
                "department",
                "departmentName",
                "department_name"
            ]
        );


    const semester =
        getStudentValue(
            student,
            [
                "semester",
                "currentSemester",
                "current_semester"
            ]
        );


    const session =
        getStudentValue(
            student,
            [
                "academicSession",
                "academic_session",
                "session"
            ]
        );


    const parts = [];


    if (branch) {

        parts.push(
            String(branch)
        );

    } else if (department) {

        parts.push(
            String(department)
        );

    }


    if (semester) {

        parts.push(
            `Semester ${semester}`
        );

    }


    if (session) {

        parts.push(
            String(session)
        );

    }


    return parts.join(" • ") ||
        "Student record";

}


/* =========================================================
   STUDENT PHOTO
========================================================= */

function getStudentPhoto(
    student
) {

    return (
        student.profilePhoto ??
        student.profile_photo ??
        student.photo ??
        student.photoUrl ??
        student.photo_url ??
        student.profileImage ??
        student.profile_image ??
        getAvatarUrl(
            getStudentName(student)
        )
    );

}


/* =========================================================
   AVATAR
========================================================= */

function getAvatarUrl(
    name
) {

    return (
        "https://ui-avatars.com/api/" +
        "?name=" +
        encodeURIComponent(name) +
        "&size=128" +
        "&background=edf5ff" +
        "&color=0757c9" +
        "&bold=true"
    );

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    formMessage.hidden = false;

    formMessage.className =
        `form-message ${type}`;

    formMessage.textContent =
        message;

}


/* =========================================================
   CLEAR MESSAGE
========================================================= */

function clearMessage() {

    formMessage.hidden = true;

    formMessage.textContent = "";

    formMessage.className =
        "form-message";

}