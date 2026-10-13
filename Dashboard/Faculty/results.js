/* =========================================================
   CAMPUSCONNECT
   FACULTY RESULTS
   Dynamic / API-Ready Architecture
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    API_BASE_URL: "",

    ENDPOINTS: {

        OVERVIEW:
            "/faculty/results/overview",

        FILTERS:
            "/faculty/results/filters",

        RESULTS:
            "/faculty/results",

        SAVE_DRAFT:
            "/faculty/results/draft",

        SUBMIT:
            "/faculty/results/submit",

        PUBLISH:
            "/faculty/results/publish",

        ANALYSIS:
            "/faculty/results/analysis",

        EXPORT:
            "/faculty/results/export"

    }

};


/* =========================================================
   STATE
========================================================= */

const resultState = {

    filters: {

        session: "",
        semester: "",
        branch: "",
        section: "",
        examType: "",
        subject: ""

    },

    results: [],

    overview: null,

    analysis: null,

    status: "Not Selected",

    editingStudentId: null

};


/* =========================================================
   DOM
========================================================= */

const DOM = {

    backButton:
        document.getElementById("backButton"),

    refreshButton:
        document.getElementById("refreshButton"),

    academicSession:
        document.getElementById("academicSession"),

    semester:
        document.getElementById("semester"),

    branch:
        document.getElementById("branch"),

    section:
        document.getElementById("section"),

    examType:
        document.getElementById("examType"),

    subject:
        document.getElementById("subject"),

    loadResultsButton:
        document.getElementById("loadResultsButton"),

    clearFiltersButton:
        document.getElementById("clearFiltersButton"),

    resultTableContainer:
        document.getElementById(
            "resultTableContainer"
        ),

    resultStatus:
        document.getElementById("resultStatus"),

    statusContent:
        document.getElementById("statusContent"),

    studentsEvaluated:
        document.getElementById(
            "studentsEvaluated"
        ),

    pendingEntries:
        document.getElementById(
            "pendingEntries"
        ),

    submittedResults:
        document.getElementById(
            "submittedResults"
        ),

    publishedResults:
        document.getElementById(
            "publishedResults"
        ),

    averageMarks:
        document.getElementById(
            "averageMarks"
        ),

    highestMarks:
        document.getElementById(
            "highestMarks"
        ),

    lowestMarks:
        document.getElementById(
            "lowestMarks"
        ),

    passCount:
        document.getElementById(
            "passCount"
        ),

    failCount:
        document.getElementById(
            "failCount"
        ),

    passPercentage:
        document.getElementById(
            "passPercentage"
        ),

    gradeDistribution:
        document.getElementById(
            "gradeDistribution"
        ),

    saveDraftButton:
        document.getElementById(
            "saveDraftButton"
        ),

    exportButton:
        document.getElementById(
            "exportButton"
        ),

    marksModal:
        document.getElementById(
            "marksModal"
        ),

    closeMarksModal:
        document.getElementById(
            "closeMarksModal"
        ),

    cancelMarksButton:
        document.getElementById(
            "cancelMarksButton"
        ),

    saveMarksButton:
        document.getElementById(
            "saveMarksButton"
        ),

    studentModalInfo:
        document.getElementById(
            "studentModalInfo"
        ),

    marksObtained:
        document.getElementById(
            "marksObtained"
        ),

    maximumMarks:
        document.getElementById(
            "maximumMarks"
        )

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeResults
);


function initializeResults() {

    setupBackButton();

    setupRefreshButton();

    setupFilters();

    setupResultActions();

    setupModal();

    loadInitialData();

}


/* =========================================================
   BACK BUTTON
========================================================= */

function setupBackButton() {

    if (!DOM.backButton) {
        return;
    }


    DOM.backButton.addEventListener(
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

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefreshButton() {

    if (!DOM.refreshButton) {
        return;
    }


    DOM.refreshButton.addEventListener(
        "click",
        refreshResults
    );

}


function refreshResults() {

    const icon =
        DOM.refreshButton.querySelector("i");


    if (icon) {

        icon.classList.add("fa-spin");

    }


    DOM.refreshButton.disabled = true;


    setTimeout(
        async function () {

            await loadInitialData();

            if (icon) {

                icon.classList.remove(
                    "fa-spin"
                );

            }

            DOM.refreshButton.disabled =
                false;

        },
        300
    );

}


/* =========================================================
   INITIAL DATA
========================================================= */

async function loadInitialData() {

    if (!CONFIG.API_BASE_URL) {

        renderEmptyOverview();

        loadEmptyFilterStates();

        renderEmptyResults();

        renderEmptyAnalysis();

        return;

    }


    try {

        await Promise.all([

            loadOverview(),

            loadFilters()

        ]);

    }

    catch (error) {

        console.error(
            "Results initialization error:",
            error
        );

        renderEmptyOverview();

        renderEmptyResults();

        renderEmptyAnalysis();

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
            CONFIG.API_BASE_URL +
            endpoint,
            {

                credentials:
                    "include",

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                },

                ...options

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
   OVERVIEW
========================================================= */

async function loadOverview() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.OVERVIEW
        );


    if (!data) {
        return;
    }


    resultState.overview =
        data;


    DOM.studentsEvaluated.textContent =
        data.studentsEvaluated ?? "—";


    DOM.pendingEntries.textContent =
        data.pendingEntries ?? "—";


    DOM.submittedResults.textContent =
        data.submittedResults ?? "—";


    DOM.publishedResults.textContent =
        data.publishedResults ?? "—";

}


function renderEmptyOverview() {

    DOM.studentsEvaluated.textContent =
        "—";

    DOM.pendingEntries.textContent =
        "—";

    DOM.submittedResults.textContent =
        "—";

    DOM.publishedResults.textContent =
        "—";

}


/* =========================================================
   FILTERS
========================================================= */

async function loadFilters() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.FILTERS
        );


    if (!data) {
        return;
    }


    populateSelect(
        DOM.academicSession,
        data.sessions || [],
        "Select Session"
    );


    populateSelect(
        DOM.semester,
        data.semesters || [],
        "Select Semester"
    );


    populateSelect(
        DOM.branch,
        data.branches || [],
        "Select Branch"
    );


    populateSelect(
        DOM.section,
        data.sections || [],
        "Select Class / Section"
    );


    populateSelect(
        DOM.examType,
        data.examTypes || [],
        "Select Examination"
    );


    populateSelect(
        DOM.subject,
        data.subjects || [],
        "Select Subject"
    );

}


function loadEmptyFilterStates() {

    /*
     * No fixed academic data is inserted here.
     *
     * The backend will populate these selects
     * once the API is connected.
     */

}


function populateSelect(
    select,
    items,
    placeholder
) {

    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            ${escapeHTML(placeholder)}
        </option>

    `;


    items.forEach(
        item => {

            const value =
                typeof item === "object"
                    ? item.id ??
                      item.value ??
                      ""
                    : item;


            const label =
                typeof item === "object"
                    ? item.name ??
                      item.label ??
                      item.value ??
                      ""
                    : item;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(value);


            option.textContent =
                String(label);


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   FILTER EVENTS
========================================================= */

function setupFilters() {

    const selects = [

        DOM.academicSession,

        DOM.semester,

        DOM.branch,

        DOM.section,

        DOM.examType,

        DOM.subject

    ];


    selects.forEach(
        select => {

            if (!select) {
                return;
            }


            select.addEventListener(
                "change",
                updateFilterState
            );

        }
    );


    DOM.loadResultsButton.addEventListener(
        "click",
        loadResults
    );


    DOM.clearFiltersButton.addEventListener(
        "click",
        clearFilters
    );

}


function updateFilterState() {

    resultState.filters = {

        session:
            DOM.academicSession.value,

        semester:
            DOM.semester.value,

        branch:
            DOM.branch.value,

        section:
            DOM.section.value,

        examType:
            DOM.examType.value,

        subject:
            DOM.subject.value

    };

}


/* =========================================================
   LOAD RESULTS
========================================================= */

async function loadResults() {

    updateFilterState();


    if (!hasRequiredSelection()) {

        showSelectionMessage();

        return;

    }


    if (!CONFIG.API_BASE_URL) {

        renderEmptyResults();

        renderEmptyAnalysis();

        updateResultStatus(
            "Not Available"
        );

        return;

    }


    try {

        const query =
            new URLSearchParams(
                resultState.filters
            );


        const data =
            await apiRequest(
                `${CONFIG.ENDPOINTS.RESULTS}?${query.toString()}`
            );


        resultState.results =
            Array.isArray(data?.students)
                ? data.students
                : [];


        resultState.status =
            data?.status ||
            "Not Selected";


        renderResults();

        updateResultStatus(
            resultState.status
        );


        await loadAnalysis();

    }

    catch (error) {

        console.error(
            "Unable to load results:",
            error
        );

        renderEmptyResults();

        renderEmptyAnalysis();

    }

}


function hasRequiredSelection() {

    return Boolean(

        resultState.filters.session &&
        resultState.filters.semester &&
        resultState.filters.branch &&
        resultState.filters.examType &&
        resultState.filters.subject

    );

}


function showSelectionMessage() {

    DOM.resultTableContainer.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-filter"></i>

            <h3>Selection required</h3>

            <p>
                Select the academic session, semester,
                branch, examination and subject before
                loading results.
            </p>

        </div>

    `;

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults() {

    if (
        !resultState.results ||
        resultState.results.length === 0
    ) {

        renderEmptyResults();

        return;

    }


    const rows =
        resultState.results
            .map(createResultRow)
            .join("");


    DOM.resultTableContainer.innerHTML = `

        <table class="results-table">

            <thead>

                <tr>

                    <th>Student</th>

                    <th>Roll No.</th>

                    <th>Marks</th>

                    <th>Maximum</th>

                    <th>Grade</th>

                    <th>Status</th>

                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;


    attachResultActions();

}


function renderEmptyResults() {

    DOM.resultTableContainer.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-table-list"></i>

            <h3>No result data available</h3>

            <p>
                Student result data will appear here
                when it is returned by the backend.
            </p>

        </div>

    `;

}


function createResultRow(student) {

    const id =
        student.id ||
        student.studentId ||
        "";


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


    const marks =
        student.marks ??
        "";


    const maximum =
        student.maximumMarks ??
        "";


    const grade =
        escapeHTML(
            student.grade ||
            "—"
        );


    const status =
        escapeHTML(
            student.status ||
            "Pending"
        );


    return `

        <tr>

            <td>
                <span class="student-name">
                    ${name}
                </span>
            </td>

            <td>
                ${roll}
            </td>

            <td>

                <input
                    class="result-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${escapeHTML(marks)}"
                    data-student-id="${escapeHTML(id)}"
                    data-field="marks"
                >

            </td>

            <td>

                <input
                    class="result-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${escapeHTML(maximum)}"
                    data-student-id="${escapeHTML(id)}"
                    data-field="maximumMarks"
                >

            </td>

            <td>
                ${grade}
            </td>

            <td>

                <span class="result-status">
                    ${status}
                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="table-action edit-result"
                    data-student-id="${escapeHTML(id)}"
                    data-student-name="${escapeHTML(name)}"
                    title="Edit result"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>

            </td>

        </tr>

    `;

}


function attachResultActions() {

    document
        .querySelectorAll(
            ".edit-result"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        openMarksModal(
                            button.dataset.studentId,
                            button.dataset.studentName
                        );

                    }
                );

            }
        );

}


/* =========================================================
   RESULT STATUS
========================================================= */

function updateResultStatus(
    status
) {

    const safeStatus =
        status || "Not Selected";


    DOM.resultStatus.textContent =
        safeStatus;


    DOM.statusContent.innerHTML = `

        <div class="status-content">

            <div class="empty-state small">

                <i class="fa-solid fa-circle-info"></i>

                <h3>
                    ${escapeHTML(safeStatus)}
                </h3>

                <p>
                    Result workflow information will be
                    displayed here from the backend.
                </p>

            </div>

        </div>

    `;

}


/* =========================================================
   ANALYSIS
========================================================= */

async function loadAnalysis() {

    if (!CONFIG.API_BASE_URL) {

        renderEmptyAnalysis();

        return;

    }


    try {

        const query =
            new URLSearchParams(
                resultState.filters
            );


        const data =
            await apiRequest(
                `${CONFIG.ENDPOINTS.ANALYSIS}?${query.toString()}`
            );


        resultState.analysis =
            data;


        renderAnalysis();

    }

    catch (error) {

        console.error(
            "Analysis loading error:",
            error
        );

        renderEmptyAnalysis();

    }

}


function renderAnalysis() {

    const data =
        resultState.analysis;


    if (!data) {

        renderEmptyAnalysis();

        return;

    }


    DOM.averageMarks.textContent =
        data.averageMarks ?? "—";


    DOM.highestMarks.textContent =
        data.highestMarks ?? "—";


    DOM.lowestMarks.textContent =
        data.lowestMarks ?? "—";


    DOM.passCount.textContent =
        data.passCount ?? "—";


    DOM.failCount.textContent =
        data.failCount ?? "—";


    DOM.passPercentage.textContent =
        data.passPercentage !== undefined
            ? `${data.passPercentage}%`
            : "—";


    renderGradeDistribution(
        data.gradeDistribution
    );

}


function renderEmptyAnalysis() {

    DOM.averageMarks.textContent =
        "—";

    DOM.highestMarks.textContent =
        "—";

    DOM.lowestMarks.textContent =
        "—";

    DOM.passCount.textContent =
        "—";

    DOM.failCount.textContent =
        "—";

    DOM.passPercentage.textContent =
        "—";


    DOM.gradeDistribution.innerHTML = `

        <div class="empty-state small">

            <i class="fa-solid fa-chart-pie"></i>

            <h3>No analysis available</h3>

            <p>
                Result analysis will appear when
                result data is available.
            </p>

        </div>

    `;

}


function renderGradeDistribution(
    distribution
) {

    if (
        !distribution ||
        !Array.isArray(distribution)
    ) {

        renderEmptyAnalysis();

        return;

    }


    if (distribution.length === 0) {

        renderEmptyAnalysis();

        return;

    }


    DOM.gradeDistribution.innerHTML = `

        <div class="analysis-grid">

            ${distribution
                .map(
                    item => `

                        <div class="analysis-card">

                            <span>
                                Grade ${escapeHTML(
                                    item.grade || "—"
                                )}
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.count ?? "—"
                                )}
                            </strong>

                        </div>

                    `
                )
                .join("")}

        </div>

    `;

}


/* =========================================================
   SAVE DRAFT
========================================================= */

function setupResultActions() {

    DOM.saveDraftButton.addEventListener(
        "click",
        saveDraft
    );


    DOM.exportButton.addEventListener(
        "click",
        exportResults
    );

}


async function saveDraft() {

    if (!hasRequiredSelection()) {

        showSelectionMessage();

        return;

    }


    if (!CONFIG.API_BASE_URL) {

        window.alert(
            "Result data is not connected to the backend yet."
        );

        return;

    }


    const inputs =
        document.querySelectorAll(
            ".result-input"
        );


    const students = [];


    inputs.forEach(
        input => {

            const studentId =
                input.dataset.studentId;


            let student =
                students.find(
                    item =>
                        item.studentId ===
                        studentId
                );


            if (!student) {

                student = {

                    studentId,

                    marks: null,

                    maximumMarks: null

                };


                students.push(
                    student
                );

            }


            student[
                input.dataset.field
            ] =
                input.value === ""
                    ? null
                    : Number(
                        input.value
                    );

        }
    );


    try {

        await apiRequest(
            CONFIG.ENDPOINTS.SAVE_DRAFT,
            {

                method: "POST",

                body:
                    JSON.stringify({

                        ...resultState.filters,

                        students

                    })

            }
        );


        window.alert(
            "Result draft saved successfully."
        );

    }

    catch (error) {

        console.error(
            "Save draft error:",
            error
        );

        window.alert(
            "Unable to save the result draft."
        );

    }

}


/* =========================================================
   EXPORT
========================================================= */

async function exportResults() {

    if (!hasRequiredSelection()) {

        showSelectionMessage();

        return;

    }


    if (!CONFIG.API_BASE_URL) {

        window.alert(
            "Export will be available after the backend is connected."
        );

        return;

    }


    const query =
        new URLSearchParams(
            resultState.filters
        );


    window.location.href =
        CONFIG.API_BASE_URL +
        `${CONFIG.ENDPOINTS.EXPORT}?${query.toString()}`;

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

    DOM.closeMarksModal.addEventListener(
        "click",
        closeMarksModal
    );


    DOM.cancelMarksButton.addEventListener(
        "click",
        closeMarksModal
    );


    DOM.saveMarksButton.addEventListener(
        "click",
        saveModalMarks
    );


    DOM.marksModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                DOM.marksModal
            ) {

                closeMarksModal();

            }

        }
    );

}


function openMarksModal(
    studentId,
    studentName
) {

    resultState.editingStudentId =
        studentId;


    DOM.studentModalInfo.textContent =
        studentName || "Student";


    const student =
        resultState.results.find(
            item =>
                String(
                    item.id ||
                    item.studentId
                ) ===
                String(studentId)
        );


    if (student) {

        DOM.marksObtained.value =
            student.marks ??
            "";

        DOM.maximumMarks.value =
            student.maximumMarks ??
            "";

    }


    DOM.marksModal.hidden =
        false;


    DOM.marksObtained.focus();

}


function closeMarksModal() {

    DOM.marksModal.hidden =
        true;

    resultState.editingStudentId =
        null;

}


function saveModalMarks() {

    const studentId =
        resultState.editingStudentId;


    const student =
        resultState.results.find(
            item =>
                String(
                    item.id ||
                    item.studentId
                ) ===
                String(studentId)
        );


    if (!student) {

        closeMarksModal();

        return;

    }


    const marks =
        DOM.marksObtained.value;


    const maximum =
        DOM.maximumMarks.value;


    if (
        marks !== "" &&
        maximum !== "" &&
        Number(marks) > Number(maximum)
    ) {

        window.alert(
            "Marks obtained cannot exceed maximum marks."
        );

        return;

    }


    student.marks =
        marks === ""
            ? null
            : Number(marks);


    student.maximumMarks =
        maximum === ""
            ? null
            : Number(maximum);


    renderResults();

    closeMarksModal();

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    [

        DOM.academicSession,

        DOM.semester,

        DOM.branch,

        DOM.section,

        DOM.examType,

        DOM.subject

    ]
        .forEach(
            select => {

                if (select) {

                    select.value = "";

                }

            }
        );


    resultState.filters = {

        session: "",
        semester: "",
        branch: "",
        section: "",
        examType: "",
        subject: ""

    };


    resultState.results = [];

    resultState.analysis = null;


    updateResultStatus(
        "Not Selected"
    );


    renderEmptyResults();

    renderEmptyAnalysis();

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