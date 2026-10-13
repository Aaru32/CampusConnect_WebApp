"use strict";

/* =========================================================
   CAMPUSCONNECT - ADMISSIONS
   ========================================================= */

const CONFIG = {
    API_BASE_URL: "",

    ENDPOINTS: {
        SUMMARY: "/admin/admissions/summary",
        APPLICATIONS: "/admin/admissions",
        CREATE: "/admin/admissions",
        UPDATE: "/admin/admissions",
        DELETE: "/admin/admissions"
    }
};


/* =========================================================
   STATE
   ========================================================= */

const state = {
    records: [],
    filteredRecords: [],
    currentView: "",
    selectedId: null,
    editingId: null
};


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    bindEvents();
    loadAdmissions();

});


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

    $("backBtn").addEventListener("click", handleBack);

    $("refreshBtn").addEventListener("click", () => {
        loadAdmissions();
    });


    $("notificationBtn").addEventListener("click", () => {
        $("notificationPanel").hidden =
            !$("notificationPanel").hidden;
    });


    $("closeNotificationBtn").addEventListener("click", () => {
        $("notificationPanel").hidden = true;
    });


    document.querySelectorAll(
        ".overview-card, .operation-card"
    ).forEach((card) => {

        card.addEventListener("click", () => {
            openApplications(card.dataset.view);
        });

    });


    $("addAdmissionBtn").addEventListener(
        "click",
        () => openForm()
    );


    $("emptyAddBtn").addEventListener(
        "click",
        () => openForm()
    );


    $("closeApplicationsBtn").addEventListener(
        "click",
        closeApplications
    );


    $("applicationSearch").addEventListener(
        "input",
        applyFilters
    );


    $("sessionFilter").addEventListener(
        "change",
        applyFilters
    );


    $("courseFilter").addEventListener(
        "change",
        applyFilters
    );


    $("statusFilter").addEventListener(
        "change",
        applyFilters
    );


    $("clearFiltersBtn").addEventListener(
        "click",
        clearFilters
    );


    $("exportBtn").addEventListener(
        "click",
        exportApplications
    );


    $("closeFormBtn").addEventListener(
        "click",
        closeForm
    );


    $("cancelFormBtn").addEventListener(
        "click",
        closeForm
    );


    $("admissionForm").addEventListener(
        "submit",
        saveAdmission
    );


    $("closeDetailsBtn").addEventListener(
        "click",
        closeDetails
    );


    $("editAdmissionBtn").addEventListener(
        "click",
        editSelectedAdmission
    );

}


/* =========================================================
   BACK
   ========================================================= */

function handleBack() {

    if (!$("detailsSection").hidden) {
        closeDetails();
        return;
    }

    if (!$("formSection").hidden) {
        closeForm();
        return;
    }

    if (!$("applicationSection").hidden) {
        closeApplications();
        return;
    }

    if (history.length > 1) {
        history.back();
    } else {
        window.location.href = "../admin-dashboard.html";
    }

}


/* =========================================================
   API
   ========================================================= */

async function apiRequest(endpoint, options = {}) {

    if (!CONFIG.API_BASE_URL) {
        return null;
    }

    const response = await fetch(
        CONFIG.API_BASE_URL + endpoint,
        {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        }
    );

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status}`
        );
    }

    return response.json();
}


/* =========================================================
   LOAD
   ========================================================= */

async function loadAdmissions() {

    try {

        const data = await apiRequest(
            CONFIG.ENDPOINTS.APPLICATIONS
        );

        if (!data) {
            state.records = [];
            state.filteredRecords = [];
            updateSummary();
            renderTable();
            return;
        }

        state.records = Array.isArray(data)
            ? data
            : data.records || data.data || [];

        state.filteredRecords = [...state.records];

        updateSummary();
        populateFilters();
        renderTable();

    } catch (error) {

        console.error(error);

        state.records = [];
        state.filteredRecords = [];

        updateSummary();
        renderTable();

        showToast(
            "Unable to load admission records.",
            "error"
        );

    }

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    const records = state.records;

    $("totalApplications").textContent =
        formatNumber(records.length);

    $("pendingApplications").textContent =
        formatNumber(
            records.filter(
                item => normalizeStatus(item.status) === "pending"
            ).length
        );

    $("approvedApplications").textContent =
        formatNumber(
            records.filter(
                item => normalizeStatus(item.status) === "approved"
            ).length
        );

    $("rejectedApplications").textContent =
        formatNumber(
            records.filter(
                item => normalizeStatus(item.status) === "rejected"
            ).length
        );

}


/* =========================================================
   FILTER OPTIONS
   ========================================================= */

function populateFilters() {

    const sessions = uniqueValues(
        state.records.map(
            item => item.session || item.academicSession
        )
    );

    const courses = uniqueValues(
        state.records.map(
            item => item.course || item.program
        )
    );


    fillSelect(
        $("sessionFilter"),
        sessions,
        "All Sessions"
    );

    fillSelect(
        $("courseFilter"),
        courses,
        "All Courses"
    );

}


function fillSelect(select, values, firstLabel) {

    const currentValue = select.value;

    select.innerHTML = "";

    const firstOption =
        document.createElement("option");

    firstOption.value = "";
    firstOption.textContent = firstLabel;

    select.appendChild(firstOption);


    values.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });


    if (
        values.includes(currentValue)
    ) {
        select.value = currentValue;
    }

}


/* =========================================================
   OPEN APPLICATIONS
   ========================================================= */

function openApplications(view) {

    state.currentView = view;

    $("applicationSection").hidden = false;

    $("formSection").hidden = true;
    $("detailsSection").hidden = true;


    const titles = {

        applications: {
            label: "Applications",
            title: "Admission Applications",
            description:
                "Search and manage all admission applications."
        },

        pending: {
            label: "Pending Review",
            title: "Pending Applications",
            description:
                "Review applications waiting for action."
        },

        approved: {
            label: "Approved",
            title: "Approved Admissions",
            description:
                "View applications that have been approved."
        },

        rejected: {
            label: "Rejected",
            title: "Rejected Applications",
            description:
                "View applications that were rejected."
        }

    };


    const config =
        titles[view] || titles.applications;


    $("applicationLabel").textContent =
        config.label;

    $("applicationTitle").textContent =
        config.title;

    $("applicationDescription").textContent =
        config.description;


    applyFilters();


    $("applicationSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   FILTER
   ========================================================= */

function applyFilters() {

    const search =
        $("applicationSearch")
            .value
            .trim()
            .toLowerCase();

    const session =
        $("sessionFilter")
            .value
            .toLowerCase();

    const course =
        $("courseFilter")
            .value
            .toLowerCase();

    const status =
        $("statusFilter")
            .value
            .toLowerCase();


    let records = [...state.records];


    if (state.currentView !== "applications") {

        records = records.filter(
            item =>
                normalizeStatus(item.status) ===
                state.currentView
        );

    }


    state.filteredRecords =
        records.filter(item => {

            const name =
                String(
                    item.applicantName ||
                    item.studentName ||
                    item.name ||
                    ""
                ).toLowerCase();

            const id =
                String(
                    item.applicationId ||
                    item.id ||
                    ""
                ).toLowerCase();

            const itemCourse =
                String(
                    item.course ||
                    item.program ||
                    ""
                ).toLowerCase();

            const itemSession =
                String(
                    item.session ||
                    item.academicSession ||
                    ""
                ).toLowerCase();

            const itemStatus =
                normalizeStatus(item.status);


            const matchesSearch =
                !search ||
                name.includes(search) ||
                id.includes(search) ||
                itemCourse.includes(search);

            const matchesSession =
                !session ||
                itemSession === session;

            const matchesCourse =
                !course ||
                itemCourse === course;

            const matchesStatus =
                !status ||
                itemStatus === status;


            return (
                matchesSearch &&
                matchesSession &&
                matchesCourse &&
                matchesStatus
            );

        });


    renderTable();

}


/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderTable() {

    const body =
        $("applicationTableBody");

    const empty =
        $("emptyState");

    body.innerHTML = "";


    if (
        !state.filteredRecords.length
    ) {

        empty.hidden = false;
        return;

    }


    empty.hidden = true;


    state.filteredRecords.forEach(record => {

        const row =
            document.createElement("tr");


        const applicant =
            record.applicantName ||
            record.studentName ||
            record.name ||
            "—";

        const applicationId =
            record.applicationId ||
            record.id ||
            "—";

        const course =
            record.course ||
            record.program ||
            "—";

        const session =
            record.session ||
            record.academicSession ||
            "—";

        const date =
            record.appliedOn ||
            record.appliedDate ||
            record.date ||
            "—";

        const status =
            normalizeStatus(
                record.status
            );


        row.innerHTML = `

            <td>
                <strong>${safe(applicationId)}</strong>
            </td>

            <td>
                ${safe(applicant)}
            </td>

            <td>
                ${safe(course)}
            </td>

            <td>
                ${safe(session)}
            </td>

            <td>
                ${safe(date)}
            </td>

            <td>
                ${statusBadge(status)}
            </td>

            <td>

                <div class="row-actions">

                    <button
                        type="button"
                        class="row-action"
                        title="View"
                        data-action="view"
                        data-id="${safeAttribute(getRecordId(record))}"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="row-action"
                        title="Edit"
                        data-action="edit"
                        data-id="${safeAttribute(getRecordId(record))}"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="row-action delete"
                        title="Delete"
                        data-action="delete"
                        data-id="${safeAttribute(getRecordId(record))}"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </td>
        `;


        body.appendChild(row);

    });


    body.querySelectorAll(
        ".row-action"
    ).forEach(button => {

        button.addEventListener(
            "click",
            handleRowAction
        );

    });

}


/* =========================================================
   ROW ACTION
   ========================================================= */

function handleRowAction(event) {

    const button =
        event.currentTarget;

    const id =
        button.dataset.id;

    const action =
        button.dataset.action;


    const record =
        findRecord(id);

    if (!record) {
        return;
    }


    if (action === "view") {
        openDetails(record);
    }

    else if (action === "edit") {
        openForm(record);
    }

    else if (action === "delete") {
        deleteAdmission(record);
    }

}


/* =========================================================
   DETAILS
   ========================================================= */

function openDetails(record) {

    state.selectedId =
        getRecordId(record);


    $("detailsName").textContent =
        record.applicantName ||
        record.studentName ||
        record.name ||
        "Applicant";


    $("detailsApplicationId").textContent =
        record.applicationId ||
        record.id ||
        "—";


    $("detailApplicant").textContent =
        record.applicantName ||
        record.studentName ||
        record.name ||
        "—";


    $("detailId").textContent =
        record.applicationId ||
        record.id ||
        "—";


    $("detailCourse").textContent =
        record.course ||
        record.program ||
        "—";


    $("detailSession").textContent =
        record.session ||
        record.academicSession ||
        "—";


    $("detailDate").textContent =
        record.appliedOn ||
        record.appliedDate ||
        record.date ||
        "—";


    $("detailStatus").innerHTML =
        statusBadge(
            normalizeStatus(record.status)
        );


    $("applicationSection").hidden = true;
    $("formSection").hidden = true;
    $("detailsSection").hidden = false;


    $("detailsSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   EDIT SELECTED
   ========================================================= */

function editSelectedAdmission() {

    const record =
        findRecord(state.selectedId);

    if (record) {
        openForm(record);
    }

}


/* =========================================================
   FORM
   ========================================================= */

function openForm(record = null) {

    $("applicationSection").hidden = true;
    $("detailsSection").hidden = true;
    $("formSection").hidden = false;


    state.editingId =
        record
            ? getRecordId(record)
            : null;


    $("editingId").value =
        state.editingId || "";


    $("formTitle").textContent =
        record
            ? "Edit Admission"
            : "Add Admission";


    $("saveButtonText").textContent =
        record
            ? "Update Admission"
            : "Save Admission";


    $("applicantName").value =
        record
            ? record.applicantName ||
              record.studentName ||
              record.name ||
              ""
            : "";


    $("applicationId").value =
        record
            ? record.applicationId ||
              record.id ||
              ""
            : "";


    $("course").value =
        record
            ? record.course ||
              record.program ||
              ""
            : "";


    $("session").value =
        record
            ? record.session ||
              record.academicSession ||
              ""
            : "";


    $("appliedDate").value =
        record
            ? normalizeDate(
                record.appliedOn ||
                record.appliedDate ||
                record.date
              )
            : "";


    $("admissionStatus").value =
        record
            ? normalizeStatus(record.status)
            : "pending";


    $("formSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   SAVE
   ========================================================= */

async function saveAdmission(event) {

    event.preventDefault();


    const payload = {

        applicantName:
            $("applicantName")
                .value
                .trim(),

        applicationId:
            $("applicationId")
                .value
                .trim(),

        course:
            $("course")
                .value
                .trim(),

        session:
            $("session")
                .value
                .trim(),

        appliedOn:
            $("appliedDate")
                .value,

        status:
            $("admissionStatus")
                .value

    };


    if (
        !payload.applicantName ||
        !payload.applicationId ||
        !payload.course ||
        !payload.session
    ) {

        showToast(
            "Please fill all required fields.",
            "error"
        );

        return;
    }


    const isEditing =
        Boolean(state.editingId);


    try {

        if (CONFIG.API_BASE_URL) {

            const endpoint =
                isEditing
                    ? `${CONFIG.ENDPOINTS.UPDATE}/${encodeURIComponent(state.editingId)}`
                    : CONFIG.ENDPOINTS.CREATE;


            const method =
                isEditing
                    ? "PUT"
                    : "POST";


            await apiRequest(
                endpoint,
                {
                    method,
                    body: JSON.stringify(payload)
                }
            );

        }


        if (isEditing) {

            const index =
                state.records.findIndex(
                    item =>
                        String(
                            getRecordId(item)
                        ) ===
                        String(state.editingId)
                );


            if (index !== -1) {

                state.records[index] = {
                    ...state.records[index],
                    ...payload
                };

            }

        }

        else {

            state.records.push({
                ...payload,
                id: payload.applicationId
            });

        }


        updateSummary();
        populateFilters();

        closeForm();

        openApplications(
            state.currentView || "applications"
        );


        showToast(
            isEditing
                ? "Admission updated successfully."
                : "Admission added successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to save admission.",
            "error"
        );

    }

}


/* =========================================================
   DELETE
   ========================================================= */

async function deleteAdmission(record) {

    const name =
        record.applicantName ||
        record.studentName ||
        record.name ||
        "this applicant";


    const confirmed =
        window.confirm(
            `Delete admission record for ${name}?`
        );


    if (!confirmed) {
        return;
    }


    const id =
        getRecordId(record);


    try {

        if (CONFIG.API_BASE_URL) {

            await apiRequest(
                `${CONFIG.ENDPOINTS.DELETE}/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );

        }


        state.records =
            state.records.filter(
                item =>
                    String(
                        getRecordId(item)
                    ) !== String(id)
            );


        updateSummary();
        populateFilters();
        applyFilters();


        showToast(
            "Admission deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to delete admission.",
            "error"
        );

    }

}


/* =========================================================
   CLOSE
   ========================================================= */

function closeApplications() {

    $("applicationSection").hidden = true;

    state.currentView = "";

    document.querySelectorAll(
        ".operation-card"
    ).forEach(card => {
        card.classList.remove("active");
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function closeForm() {

    $("formSection").hidden = true;

    $("admissionForm").reset();

    state.editingId = null;

    if (
        state.currentView
    ) {
        $("applicationSection").hidden = false;
    }

}


function closeDetails() {

    $("detailsSection").hidden = true;

    if (
        state.currentView
    ) {
        $("applicationSection").hidden = false;
    }

}


/* =========================================================
   CLEAR
   ========================================================= */

function clearFilters() {

    $("applicationSearch").value = "";
    $("sessionFilter").value = "";
    $("courseFilter").value = "";
    $("statusFilter").value = "";

    applyFilters();

}


/* =========================================================
   EXPORT
   ========================================================= */

function exportApplications() {

    if (
        !state.filteredRecords.length
    ) {

        showToast(
            "There are no records to export.",
            "error"
        );

        return;
    }


    const rows = [

        [
            "Application ID",
            "Applicant",
            "Course",
            "Session",
            "Applied On",
            "Status"
        ]

    ];


    state.filteredRecords.forEach(record => {

        rows.push([

            record.applicationId ||
            record.id ||
            "",

            record.applicantName ||
            record.studentName ||
            record.name ||
            "",

            record.course ||
            record.program ||
            "",

            record.session ||
            record.academicSession ||
            "",

            record.appliedOn ||
            record.appliedDate ||
            record.date ||
            "",

            normalizeStatus(
                record.status
            )

        ]);

    });


    const csv =
        rows
            .map(row =>
                row
                    .map(value =>
                        `"${String(value)
                            .replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "admission-applications.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Admission records exported successfully.",
        "success"
    );

}


/* =========================================================
   HELPERS
   ========================================================= */

function getRecordId(record) {

    return String(
        record.id ??
        record.applicationId ??
        ""
    );

}


function findRecord(id) {

    return state.records.find(
        record =>
            String(
                getRecordId(record)
            ) === String(id)
    );

}


function normalizeStatus(status) {

    const value =
        String(
            status || "pending"
        )
        .trim()
        .toLowerCase();


    if (value === "approved") {
        return "approved";
    }

    if (value === "rejected") {
        return "rejected";
    }

    return "pending";

}


function statusBadge(status) {

    const normalized =
        normalizeStatus(status);


    return `
        <span class="status status-${normalized}">
            ${safe(normalized)}
        </span>
    `;

}


function normalizeDate(value) {

    if (!value) {
        return "";
    }

    return String(value).slice(0, 10);

}


function uniqueValues(values) {

    return [
        ...new Set(
            values
                .filter(Boolean)
                .map(value => String(value))
        )
    ].sort();

}


function formatNumber(value) {

    return new Intl.NumberFormat(
        "en-IN"
    ).format(
        Number(value) || 0
    );

}


function safe(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function safeAttribute(value) {

    return safe(value)
        .replace(/`/g, "&#096;");
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = ""
) {

    const container =
        $("toastContainer");


    const toast =
        document.createElement("div");


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(toast);


    setTimeout(() => {
        toast.remove();
    }, 3000);

}