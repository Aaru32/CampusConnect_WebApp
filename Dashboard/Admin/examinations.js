/* =========================================================
   CAMPUSCONNECT - ADMIN EXAMINATIONS
   ========================================================= */


/* ================= CONFIGURATION ================= */

const CONFIG = {
    API_BASE_URL: "",

    ENDPOINTS: {
        examinations: "/admin/examinations",
        summary: "/admin/examinations/summary",
        create: "/admin/examinations",
        update: "/admin/examinations/{id}"
    }
};


/* ================= STATE ================= */

const state = {
    examinations: [],
    filteredExaminations: [],
    selectedExamination: null,
    editingId: null
};


/* ================= DOM ================= */

const elements = {
    backButton: document.getElementById("backButton"),
    refreshButton: document.getElementById("refreshButton"),
    notificationButton: document.getElementById("notificationButton"),

    upcomingCount: document.getElementById("upcomingCount"),
    ongoingCount: document.getElementById("ongoingCount"),
    completedCount: document.getElementById("completedCount"),
    pendingResultsCount: document.getElementById("pendingResultsCount"),

    examinationSearch: document.getElementById("examinationSearch"),
    sessionFilter: document.getElementById("sessionFilter"),
    semesterFilter: document.getElementById("semesterFilter"),
    branchFilter: document.getElementById("branchFilter"),
    examTypeFilter: document.getElementById("examTypeFilter"),
    statusFilter: document.getElementById("statusFilter"),

    examinationTableBody: document.getElementById("examinationTableBody"),
    emptyState: document.getElementById("emptyState"),

    createExaminationButton:
        document.getElementById("createExaminationButton"),

    emptyCreateButton:
        document.getElementById("emptyCreateButton"),

    detailsSection:
        document.getElementById("detailsSection"),

    mainPanel:
        document.querySelector(".main-panel"),

    closeDetailsButton:
        document.getElementById("closeDetailsButton"),

    editDetailsButton:
        document.getElementById("editDetailsButton"),

    detailsTitle:
        document.getElementById("detailsTitle"),

    detailsSubtitle:
        document.getElementById("detailsSubtitle"),

    detailExamName:
        document.getElementById("detailExamName"),

    detailSession:
        document.getElementById("detailSession"),

    detailSemester:
        document.getElementById("detailSemester"),

    detailBranch:
        document.getElementById("detailBranch"),

    detailType:
        document.getElementById("detailType"),

    detailStatus:
        document.getElementById("detailStatus"),

    detailStartDate:
        document.getElementById("detailStartDate"),

    detailEndDate:
        document.getElementById("detailEndDate"),

    detailDeadline:
        document.getElementById("detailDeadline"),

    detailInstructions:
        document.getElementById("detailInstructions"),

    examinationModal:
        document.getElementById("examinationModal"),

    closeModalButton:
        document.getElementById("closeModalButton"),

    cancelModalButton:
        document.getElementById("cancelModalButton"),

    examinationForm:
        document.getElementById("examinationForm"),

    modalTitle:
        document.getElementById("modalTitle"),

    modalSubtitle:
        document.getElementById("modalSubtitle"),

    submitButtonText:
        document.getElementById("submitButtonText"),

    examName:
        document.getElementById("examName"),

    academicSession:
        document.getElementById("academicSession"),

    examSemester:
        document.getElementById("examSemester"),

    examBranch:
        document.getElementById("examBranch"),

    examType:
        document.getElementById("examType"),

    startDate:
        document.getElementById("startDate"),

    endDate:
        document.getElementById("endDate"),

    registrationDeadline:
        document.getElementById("registrationDeadline"),

    examStatus:
        document.getElementById("examStatus"),

    instructions:
        document.getElementById("instructions"),

    manageScheduleButton:
        document.getElementById("manageScheduleButton"),

    manageStudentsButton:
        document.getElementById("manageStudentsButton"),

    manageSubjectsButton:
        document.getElementById("manageSubjectsButton"),

    manageRoomsButton:
        document.getElementById("manageRoomsButton"),

    manageAttendanceButton:
        document.getElementById("manageAttendanceButton"),

    manageResultsButton:
        document.getElementById("manageResultsButton"),

    manageDocumentsButton:
        document.getElementById("manageDocumentsButton")
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeEvents();

    loadExaminations();

});


/* =========================================================
   EVENTS
   ========================================================= */

function initializeEvents() {

    /* ---------- Header ---------- */

    elements.backButton.addEventListener("click", goBack);

    elements.refreshButton.addEventListener("click", () => {
        loadExaminations();
    });

    elements.notificationButton.addEventListener("click", () => {
        showNotification("Global notifications will appear here.");
    });


    /* ---------- Create ---------- */

    elements.createExaminationButton.addEventListener(
        "click",
        () => openCreateModal()
    );

    elements.emptyCreateButton.addEventListener(
        "click",
        () => openCreateModal()
    );


    /* ---------- Search / Filters ---------- */

    elements.examinationSearch.addEventListener(
        "input",
        applyFilters
    );

    elements.sessionFilter.addEventListener(
        "change",
        applyFilters
    );

    elements.semesterFilter.addEventListener(
        "change",
        applyFilters
    );

    elements.branchFilter.addEventListener(
        "change",
        applyFilters
    );

    elements.examTypeFilter.addEventListener(
        "change",
        applyFilters
    );

    elements.statusFilter.addEventListener(
        "change",
        applyFilters
    );


    /* ---------- Details ---------- */

    elements.closeDetailsButton.addEventListener(
        "click",
        closeDetails
    );

    elements.editDetailsButton.addEventListener(
        "click",
        () => {

            if (!state.selectedExamination) {
                return;
            }

            openEditModal(state.selectedExamination);
        }
    );


    /* ---------- Detail Tabs ---------- */

    document.querySelectorAll(".detail-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            const target = tab.dataset.tab;

            switchDetailTab(target);
        });

    });


    /* ---------- Detail Actions ---------- */

    elements.manageScheduleButton.addEventListener(
        "click",
        () => openDetailAction("schedule")
    );

    elements.manageStudentsButton.addEventListener(
        "click",
        () => openDetailAction("students")
    );

    elements.manageSubjectsButton.addEventListener(
        "click",
        () => openDetailAction("subjects")
    );

    elements.manageRoomsButton.addEventListener(
        "click",
        () => openDetailAction("rooms")
    );

    elements.manageAttendanceButton.addEventListener(
        "click",
        () => openDetailAction("attendance")
    );

    elements.manageResultsButton.addEventListener(
        "click",
        () => openDetailAction("results")
    );

    elements.manageDocumentsButton.addEventListener(
        "click",
        () => openDetailAction("documents")
    );


    /* ---------- Modal ---------- */

    elements.closeModalButton.addEventListener(
        "click",
        closeModal
    );

    elements.cancelModalButton.addEventListener(
        "click",
        closeModal
    );

    elements.examinationForm.addEventListener(
        "submit",
        handleFormSubmit
    );


    /* ---------- Outside Modal ---------- */

    elements.examinationModal.addEventListener(
        "click",
        event => {

            if (event.target === elements.examinationModal) {
                closeModal();
            }

        }
    );


    /* ---------- Keyboard ---------- */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            if (!elements.examinationModal.classList.contains("hidden")) {
                closeModal();
            }

        }

    });

}


/* =========================================================
   LOAD EXAMINATIONS
   ========================================================= */

async function loadExaminations() {

    showTableLoading();

    try {

        /*
         * Backend-ready:
         *
         * When Java REST API is connected:
         *
         * const response = await fetch(
         *     CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.examinations
         * );
         *
         * state.examinations = await response.json();
         *
         * For now, no local/sample records are inserted.
         */

        if (!CONFIG.API_BASE_URL) {

            state.examinations = [];

            updateOverview();

            populateFilters();

            applyFilters();

            return;
        }


        const response = await fetch(
            CONFIG.API_BASE_URL +
            CONFIG.ENDPOINTS.examinations
        );


        if (!response.ok) {
            throw new Error(
                `Request failed: ${response.status}`
            );
        }


        const data = await response.json();

        state.examinations = normalizeExaminationResponse(data);

        updateOverview();

        populateFilters();

        applyFilters();

    } catch (error) {

        console.error(
            "Unable to load examinations:",
            error
        );

        state.examinations = [];

        updateOverview();

        renderExaminations([]);

        showNotification(
            "Unable to load examination data."
        );

    }

}


/* =========================================================
   NORMALIZE API RESPONSE
   ========================================================= */

function normalizeExaminationResponse(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.content)) {
        return data.content;
    }

    if (Array.isArray(data.examinations)) {
        return data.examinations;
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}


/* =========================================================
   OVERVIEW
   ========================================================= */

function updateOverview() {

    const examinations = state.examinations;

    const upcoming = examinations.filter(
        item => normalizeStatus(item.status) === "upcoming"
    ).length;

    const ongoing = examinations.filter(
        item => normalizeStatus(item.status) === "ongoing"
    ).length;

    const completed = examinations.filter(
        item => normalizeStatus(item.status) === "completed"
    ).length;


    /*
     * Pending result count should eventually come from
     * the examination/result API.
     *
     * It is deliberately not calculated from fake data.
     */

    elements.upcomingCount.textContent =
        examinations.length ? upcoming : "—";

    elements.ongoingCount.textContent =
        examinations.length ? ongoing : "—";

    elements.completedCount.textContent =
        examinations.length ? completed : "—";

    elements.pendingResultsCount.textContent = "—";
}


/* =========================================================
   FILTER OPTIONS
   ========================================================= */

function populateFilters() {

    populateSelect(
        elements.sessionFilter,
        state.examinations.map(
            item => item.academicSession || item.session
        )
    );

    populateSelect(
        elements.semesterFilter,
        state.examinations.map(
            item => item.semester
        )
    );

    populateSelect(
        elements.branchFilter,
        state.examinations.map(
            item =>
                item.branch ||
                item.department
        )
    );

    populateSelect(
        elements.examTypeFilter,
        state.examinations.map(
            item =>
                item.type ||
                item.examType
        )
    );

}


function populateSelect(select, values) {

    const currentValue = select.value;

    const firstOption = select.options[0];

    select.innerHTML = "";

    select.appendChild(firstOption);


    const uniqueValues = [
        ...new Set(
            values
                .filter(value => value !== null && value !== undefined)
                .map(value => String(value).trim())
                .filter(Boolean)
        )
    ];


    uniqueValues.sort(
        (a, b) =>
            a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: "base"
            })
    );


    uniqueValues.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = value;

        select.appendChild(option);

    });


    if (
        uniqueValues.includes(currentValue)
    ) {
        select.value = currentValue;
    }

}


/* =========================================================
   FILTERING
   ========================================================= */

function applyFilters() {

    const search =
        elements.examinationSearch.value
            .trim()
            .toLowerCase();

    const session =
        elements.sessionFilter.value
            .toLowerCase();

    const semester =
        elements.semesterFilter.value
            .toLowerCase();

    const branch =
        elements.branchFilter.value
            .toLowerCase();

    const type =
        elements.examTypeFilter.value
            .toLowerCase();

    const status =
        elements.statusFilter.value
            .toLowerCase();


    state.filteredExaminations =
        state.examinations.filter(exam => {

            const name =
                String(
                    exam.name ||
                    exam.examinationName ||
                    ""
                ).toLowerCase();

            const examSession =
                String(
                    exam.academicSession ||
                    exam.session ||
                    ""
                ).toLowerCase();

            const examSemester =
                String(
                    exam.semester ||
                    ""
                ).toLowerCase();

            const examBranch =
                String(
                    exam.branch ||
                    exam.department ||
                    ""
                ).toLowerCase();

            const examType =
                String(
                    exam.type ||
                    exam.examType ||
                    ""
                ).toLowerCase();

            const examStatus =
                normalizeStatus(
                    exam.status
                );


            const matchesSearch =
                !search ||
                name.includes(search) ||
                examSession.includes(search) ||
                examBranch.includes(search) ||
                examType.includes(search);


            const matchesSession =
                !session ||
                examSession === session;

            const matchesSemester =
                !semester ||
                examSemester === semester;

            const matchesBranch =
                !branch ||
                examBranch === branch;

            const matchesType =
                !type ||
                examType === type;

            const matchesStatus =
                !status ||
                examStatus === status;


            return (
                matchesSearch &&
                matchesSession &&
                matchesSemester &&
                matchesBranch &&
                matchesType &&
                matchesStatus
            );

        });


    renderExaminations(
        state.filteredExaminations
    );

}


/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderExaminations(examinations) {

    elements.examinationTableBody.innerHTML = "";


    if (!examinations.length) {

        elements.emptyState.classList.remove("hidden");

        return;
    }


    elements.emptyState.classList.add("hidden");


    examinations.forEach(exam => {

        const row =
            document.createElement("tr");


        const id =
            exam.id ??
            exam.examinationId ??
            "";


        const name =
            escapeHTML(
                exam.name ||
                exam.examinationName ||
                "Unnamed Examination"
            );


        const type =
            escapeHTML(
                exam.type ||
                exam.examType ||
                "—"
            );


        const semester =
            escapeHTML(
                exam.semester ||
                "—"
            );


        const branch =
            escapeHTML(
                exam.branch ||
                exam.department ||
                "—"
            );


        const startDate =
            formatDate(
                exam.startDate
            );


        const endDate =
            formatDate(
                exam.endDate
            );


        const status =
            normalizeStatus(
                exam.status
            );


        row.innerHTML = `

            <td>
                <div class="exam-name">
                    ${name}
                </div>

                ${
                    exam.academicSession
                    ?
                    `<span class="exam-secondary">
                        ${escapeHTML(
                            exam.academicSession
                        )}
                    </span>`
                    :
                    ""
                }
            </td>

            <td>${type}</td>

            <td>${semester}</td>

            <td>${branch}</td>

            <td>${escapeHTML(startDate)}</td>

            <td>${escapeHTML(endDate)}</td>

            <td>
                ${createStatusBadge(status)}
            </td>

            <td>

                <div class="action-menu">

                    <button
                        class="table-action"
                        title="View Examination"
                        data-action="view"
                        data-id="${escapeHTML(String(id))}">
                        <i class="fa-regular fa-eye"></i>
                    </button>

                    <button
                        class="table-action"
                        title="Edit Examination"
                        data-action="edit"
                        data-id="${escapeHTML(String(id))}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                </div>

            </td>
        `;


        elements.examinationTableBody.appendChild(row);

    });


    attachTableActions();
}


/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function attachTableActions() {

    document
        .querySelectorAll(".table-action")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;

                    const exam =
                        findExamination(id);


                    if (!exam) {
                        showNotification(
                            "Examination record could not be found."
                        );

                        return;
                    }


                    if (action === "view") {

                        openDetails(exam);

                    } else if (action === "edit") {

                        openEditModal(exam);

                    }

                }
            );

        });

}


/* =========================================================
   FIND EXAMINATION
   ========================================================= */

function findExamination(id) {

    return state.examinations.find(
        exam =>
            String(
                exam.id ??
                exam.examinationId ??
                ""
            ) === String(id)
    );

}


/* =========================================================
   OPEN DETAILS
   ========================================================= */

function openDetails(exam) {

    state.selectedExamination = exam;


    const name =
        exam.name ||
        exam.examinationName ||
        "Examination";


    elements.detailsTitle.textContent =
        name;

    elements.detailsSubtitle.textContent =
        "Examination details and management";


    elements.detailExamName.textContent =
        name;

    elements.detailSession.textContent =
        exam.academicSession ||
        exam.session ||
        "—";

    elements.detailSemester.textContent =
        exam.semester ||
        "—";

    elements.detailBranch.textContent =
        exam.branch ||
        exam.department ||
        "—";

    elements.detailType.textContent =
        exam.type ||
        exam.examType ||
        "—";

    elements.detailStatus.textContent =
        formatStatus(
            normalizeStatus(exam.status)
        );

    elements.detailStartDate.textContent =
        formatDate(exam.startDate);

    elements.detailEndDate.textContent =
        formatDate(exam.endDate);

    elements.detailDeadline.textContent =
        formatDate(
            exam.registrationDeadline
        );

    elements.detailInstructions.textContent =
        exam.instructions ||
        "No instructions available.";


    elements.mainPanel.classList.add(
        "hidden"
    );

    elements.detailsSection.classList.remove(
        "hidden"
    );


    switchDetailTab("overview");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CLOSE DETAILS
   ========================================================= */

function closeDetails() {

    elements.detailsSection.classList.add(
        "hidden"
    );

    elements.mainPanel.classList.remove(
        "hidden"
    );

    state.selectedExamination = null;

}


/* =========================================================
   DETAIL TABS
   ========================================================= */

function switchDetailTab(tabName) {

    document
        .querySelectorAll(".detail-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.tab === tabName
            );

        });


    document
        .querySelectorAll(".tab-panel")
        .forEach(panel => {

            panel.classList.toggle(
                "active",
                panel.id === `tab-${tabName}`
            );

        });

}


/* =========================================================
   DETAIL ACTION
   ========================================================= */

function openDetailAction(action) {

    if (!state.selectedExamination) {
        return;
    }


    const labels = {
        schedule: "Examination Schedule",
        students: "Examination Students",
        subjects: "Examination Subjects",
        rooms: "Examination Rooms",
        attendance: "Examination Attendance",
        results: "Examination Results",
        documents: "Examination Documents"
    };


    switchDetailTab(action);


    showNotification(
        `${labels[action]} section opened.`
    );

}


/* =========================================================
   CREATE MODAL
   ========================================================= */

function openCreateModal() {

    state.editingId = null;

    elements.modalTitle.textContent =
        "Create Examination";

    elements.modalSubtitle.textContent =
        "Add a new examination to CampusConnect.";

    elements.submitButtonText.textContent =
        "Create Examination";


    elements.examinationForm.reset();

    elements.examStatus.value =
        "upcoming";


    elements.examinationModal.classList.remove(
        "hidden"
    );


    setTimeout(() => {
        elements.examName.focus();
    }, 50);

}


/* =========================================================
   EDIT MODAL
   ========================================================= */

function openEditModal(exam) {

    state.editingId =
        exam.id ??
        exam.examinationId;


    elements.modalTitle.textContent =
        "Edit Examination";

    elements.modalSubtitle.textContent =
        "Update examination information.";

    elements.submitButtonText.textContent =
        "Save Changes";


    elements.examName.value =
        exam.name ||
        exam.examinationName ||
        "";

    elements.academicSession.value =
        exam.academicSession ||
        exam.session ||
        "";

    elements.examSemester.value =
        exam.semester ||
        "";

    elements.examBranch.value =
        exam.branch ||
        exam.department ||
        "";

    elements.examType.value =
        exam.type ||
        exam.examType ||
        "";

    elements.startDate.value =
        normalizeInputDate(
            exam.startDate
        );

    elements.endDate.value =
        normalizeInputDate(
            exam.endDate
        );

    elements.registrationDeadline.value =
        normalizeInputDate(
            exam.registrationDeadline
        );

    elements.examStatus.value =
        normalizeStatus(
            exam.status
        ) ||
        "upcoming";

    elements.instructions.value =
        exam.instructions ||
        "";


    elements.examinationModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    elements.examinationModal.classList.add(
        "hidden"
    );

    state.editingId = null;

}


/* =========================================================
   FORM SUBMIT
   ========================================================= */

async function handleFormSubmit(event) {

    event.preventDefault();


    const payload = {

        name:
            elements.examName.value.trim(),

        academicSession:
            elements.academicSession.value.trim(),

        semester:
            elements.examSemester.value,

        branch:
            elements.examBranch.value.trim(),

        examType:
            elements.examType.value,

        startDate:
            elements.startDate.value,

        endDate:
            elements.endDate.value,

        registrationDeadline:
            elements.registrationDeadline.value,

        status:
            elements.examStatus.value,

        instructions:
            elements.instructions.value.trim()

    };


    if (!payload.name) {

        showNotification(
            "Examination name is required."
        );

        elements.examName.focus();

        return;
    }


    try {

        /*
         * Backend connection will be used when:
         *
         * CONFIG.API_BASE_URL !== ""
         */

        if (!CONFIG.API_BASE_URL) {

            /*
             * We deliberately do not insert fake/local
             * examination records into the table.
             *
             * The form is already ready for the REST API.
             */

            showNotification(
                "Examination form is ready for backend connection."
            );

            closeModal();

            return;
        }


        const isEditing =
            Boolean(state.editingId);


        const endpoint =
            isEditing
                ? CONFIG.ENDPOINTS.update.replace(
                    "{id}",
                    encodeURIComponent(
                        state.editingId
                    )
                )
                : CONFIG.ENDPOINTS.create;


        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                endpoint,
                {
                    method:
                        isEditing
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {
            throw new Error(
                `Request failed: ${response.status}`
            );
        }


        closeModal();

        await loadExaminations();


        showNotification(
            isEditing
                ? "Examination updated successfully."
                : "Examination created successfully."
        );


    } catch (error) {

        console.error(
            "Unable to save examination:",
            error
        );

        showNotification(
            "Unable to save examination."
        );

    }

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showTableLoading() {

    elements.emptyState.classList.add(
        "hidden"
    );

    elements.examinationTableBody.innerHTML = `

        <tr>

            <td colspan="8"
                style="
                    text-align:center;
                    padding:50px 20px;
                    color:#687386;
                ">

                Loading examination data...

            </td>

        </tr>

    `;

}


/* =========================================================
   STATUS HELPERS
   ========================================================= */

function normalizeStatus(status) {

    if (!status) {
        return "";
    }

    return String(status)
        .trim()
        .toLowerCase()
        .replace(/_/g, "-")
        .replace(/\s+/g, "-");

}


function formatStatus(status) {

    if (!status) {
        return "—";
    }

    return status
        .split("-")
        .map(
            word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");

}


function createStatusBadge(status) {

    if (!status) {
        return "—";
    }


    const safeStatus =
        ["upcoming", "ongoing", "completed"]
            .includes(status)
            ? status
            : "upcoming";


    return `
        <span class="status-badge status-${safeStatus}">
            ${escapeHTML(
                formatStatus(status)
            )}
        </span>
    `;

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return String(value);
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function normalizeInputDate(value) {

    if (!value) {
        return "";
    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(value)
        )
    ) {
        return value;
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return date.toISOString()
        .split("T")[0];

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function goBack() {

    if (
        elements.detailsSection &&
        !elements.detailsSection.classList.contains(
            "hidden"
        )
    ) {
        closeDetails();
        return;
    }


    if (window.history.length > 1) {

        window.history.back();

    } else {

        window.location.href =
            "../admin-dashboard.html";

    }

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotification(message) {

    let container =
        document.getElementById(
            "globalNotificationPlaceholder"
        );


    if (!container) {
        return;
    }


    const notification =
        document.createElement("div");


    notification.style.cssText = `
        position:fixed;
        right:24px;
        bottom:24px;
        z-index:1000;
        max-width:360px;
        padding:13px 16px;
        background:#172033;
        color:#ffffff;
        border-radius:9px;
        box-shadow:0 8px 25px rgba(0,0,0,.18);
        font-size:13px;
        line-height:1.45;
    `;


    notification.textContent =
        message;


    container.appendChild(
        notification
    );


    setTimeout(() => {

        notification.remove();

    }, 3000);

}


/* =========================================================
   SECURITY / HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}