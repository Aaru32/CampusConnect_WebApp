"use strict";

/* =========================================================
   CAMPUSCONNECT HOSTEL MANAGEMENT
========================================================= */

const CONFIG = {
    API_BASE_URL: "",

    ENDPOINTS: {
        SUMMARY: "/admin/hostel/summary",
        BUILDINGS: "/admin/hostel/buildings",
        ROOMS: "/admin/hostel/rooms",
        ALLOTMENTS: "/admin/hostel/allotments",
        STUDENTS: "/admin/hostel/students",
        VACANCY: "/admin/hostel/vacancy",
        FEES: "/admin/hostel/fees",
        COMPLAINTS: "/admin/hostel/complaints",
        REPORTS: "/admin/hostel/reports"
    }
};


/* =========================================================
   STATE
========================================================= */

const state = {
    currentView: "",
    records: [],
    filteredRecords: []
};


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   VIEW CONFIGURATION
========================================================= */

const VIEW_CONFIG = {

    buildings: {
        label: "Hostel Buildings",
        title: "Hostel Buildings",
        description:
            "Manage hostel buildings, capacity and wardens.",
        endpoint: CONFIG.ENDPOINTS.BUILDINGS,
        addText: "Add Hostel",
        columns: [
            "Hostel",
            "Building",
            "Capacity",
            "Warden",
            "Status"
        ]
    },

    rooms: {
        label: "Room Management",
        title: "Rooms & Beds",
        description:
            "Manage hostel rooms, beds and occupancy.",
        endpoint: CONFIG.ENDPOINTS.ROOMS,
        addText: "Add Room",
        columns: [
            "Hostel",
            "Room",
            "Floor",
            "Beds",
            "Occupied",
            "Status"
        ]
    },

    allotments: {
        label: "Student Allotments",
        title: "Student Room Allotments",
        description:
            "Manage room allotments and student accommodation.",
        endpoint: CONFIG.ENDPOINTS.ALLOTMENTS,
        addText: "Add Allotment",
        columns: [
            "Student",
            "Student ID",
            "Hostel",
            "Room",
            "Allotted On",
            "Status"
        ]
    },

    students: {
        label: "Hostel Students",
        title: "Resident Students",
        description:
            "View students currently registered for hostel accommodation.",
        endpoint: CONFIG.ENDPOINTS.STUDENTS,
        addText: "Add Student",
        columns: [
            "Student",
            "Student ID",
            "Branch",
            "Semester",
            "Hostel",
            "Room",
            "Status"
        ]
    },

    vacancy: {
        label: "Vacancy",
        title: "Available Hostel Capacity",
        description:
            "View vacant rooms and available beds.",
        endpoint: CONFIG.ENDPOINTS.VACANCY,
        addText: "Manage Rooms",
        columns: [
            "Hostel",
            "Room",
            "Total Beds",
            "Occupied",
            "Available",
            "Status"
        ]
    },

    fees: {
        label: "Hostel Fees",
        title: "Hostel Fee Records",
        description:
            "Review hostel fee payments and outstanding balances.",
        endpoint: CONFIG.ENDPOINTS.FEES,
        addText: "Record Payment",
        columns: [
            "Student",
            "Student ID",
            "Session",
            "Fee",
            "Paid",
            "Outstanding",
            "Status"
        ]
    },

    complaints: {
        label: "Complaints & Maintenance",
        title: "Hostel Complaints & Maintenance",
        description:
            "Review accommodation complaints and maintenance requests.",
        endpoint: CONFIG.ENDPOINTS.COMPLAINTS,
        addText: "Add Complaint",
        columns: [
            "Complaint",
            "Student",
            "Hostel",
            "Room",
            "Date",
            "Status"
        ]
    },

    reports: {
        label: "Hostel Reports",
        title: "Hostel Reports",
        description:
            "Review hostel occupancy, allotment and fee reporting data.",
        endpoint: CONFIG.ENDPOINTS.REPORTS,
        addText: "Generate Report",
        columns: [
            "Report",
            "Category",
            "Period",
            "Records",
            "Status"
        ]
    }

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    bindEvents();

    const requestedView =
        new URLSearchParams(window.location.search).get("view");

    if (
        requestedView &&
        VIEW_CONFIG[requestedView]
    ) {
        openView(requestedView, false);
    } else {
        loadSummary();
    }

});


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    $("backBtn").addEventListener("click", handleBack);

    $("refreshBtn").addEventListener("click", () => {

        if (state.currentView) {
            loadCurrentView();
        } else {
            loadSummary();
        }

    });


    $("notificationBtn").addEventListener("click", () => {

        $("notificationPanel").hidden =
            !$("notificationPanel").hidden;

    });


    $("closeNotificationBtn").addEventListener("click", () => {

        $("notificationPanel").hidden = true;

    });


    document
        .querySelectorAll("[data-open-view]")
        .forEach((element) => {

            element.addEventListener("click", () => {

                openView(
                    element.dataset.openView,
                    true
                );

            });

        });


    $("detailSearch").addEventListener(
        "input",
        applyFilters
    );


    $("detailStatusFilter").addEventListener(
        "change",
        applyFilters
    );


    $("clearDetailFilters").addEventListener(
        "click",
        clearFilters
    );


    $("detailAddBtn").addEventListener(
        "click",
        handleAdd
    );


    $("detailEmptyAddBtn").addEventListener(
        "click",
        handleAdd
    );


    $("detailExportBtn").addEventListener(
        "click",
        exportCurrentView
    );

}


/* =========================================================
   BACK
========================================================= */

function handleBack() {

    if (state.currentView) {

        window.location.href = "hostel.html";

        return;
    }


    if (history.length > 1) {

        history.back();

    } else {

        window.location.href =
            "../admin-dashboard.html";

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
            ...options,

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
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
   SUMMARY
========================================================= */

async function loadSummary() {

    try {

        const data =
            await apiRequest(
                CONFIG.ENDPOINTS.SUMMARY
            );


        if (!data) {

            setSummaryEmpty();

            return;

        }


        $("totalHostels").textContent =
            formatNumber(data.totalHostels);

        $("totalRooms").textContent =
            formatNumber(data.totalRooms);

        $("hostelStudents").textContent =
            formatNumber(data.hostelStudents);

        $("vacantBeds").textContent =
            formatNumber(data.vacantBeds);

    }

    catch (error) {

        console.error(error);

        setSummaryEmpty();

    }

}


function setSummaryEmpty() {

    $("totalHostels").textContent = "—";
    $("totalRooms").textContent = "—";
    $("hostelStudents").textContent = "—";
    $("vacantBeds").textContent = "—";

}


/* =========================================================
   OPEN VIEW
========================================================= */

async function openView(view, pushHistory = true) {

    if (!VIEW_CONFIG[view]) {
        return;
    }


    state.currentView = view;


    if (pushHistory) {

        const url =
            `hostel.html?view=${encodeURIComponent(view)}`;

        window.history.pushState(
            { view },
            "",
            url
        );

    }


    $("dashboardView").hidden = true;
    $("detailView").hidden = false;


    configureView(view);


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    await loadCurrentView();

}


/* =========================================================
   POPSTATE
========================================================= */

window.addEventListener("popstate", () => {

    const view =
        new URLSearchParams(
            window.location.search
        ).get("view");


    if (view && VIEW_CONFIG[view]) {

        openView(view, false);

    } else {

        state.currentView = "";

        $("detailView").hidden = true;
        $("dashboardView").hidden = false;

        loadSummary();

    }

});


/* =========================================================
   CONFIGURE VIEW
========================================================= */

function configureView(view) {

    const config = VIEW_CONFIG[view];

    $("detailLabel").textContent =
        config.label;

    $("detailTitle").textContent =
        config.title;

    $("detailDescription").textContent =
        config.description;

    $("detailAddBtn").innerHTML = `
        <i class="fa-solid fa-plus"></i>
        ${config.addText}
    `;

    renderTableHeader(config.columns);

}


/* =========================================================
   LOAD CURRENT VIEW
========================================================= */

async function loadCurrentView() {

    if (!state.currentView) {
        return;
    }


    const config =
        VIEW_CONFIG[state.currentView];


    setLoading();


    try {

        const data =
            await apiRequest(config.endpoint);


        if (!data) {

            state.records = [];
            state.filteredRecords = [];

            renderRecords();

            return;

        }


        let records =
            Array.isArray(data)
                ? data
                : data.records ||
                  data.data ||
                  [];


        state.records = records;
        state.filteredRecords = records;


        renderRecords();

    }

    catch (error) {

        console.error(error);

        state.records = [];
        state.filteredRecords = [];

        renderRecords();

        showToast(
            "Unable to load hostel records.",
            "error"
        );

    }

}


/* =========================================================
   TABLE HEADER
========================================================= */

function renderTableHeader(columns) {

    const head =
        $("detailTableHead");

    head.innerHTML = "";


    const row =
        document.createElement("tr");


    columns.forEach((column) => {

        const th =
            document.createElement("th");

        th.textContent = column;

        row.appendChild(th);

    });


    head.appendChild(row);

}


/* =========================================================
   RECORD RENDERING
========================================================= */

function renderRecords() {

    const body =
        $("detailTableBody");

    const empty =
        $("detailEmpty");


    body.innerHTML = "";


    if (
        !state.filteredRecords ||
        state.filteredRecords.length === 0
    ) {

        empty.hidden = false;

        updateSummary([]);

        return;

    }


    empty.hidden = true;


    state.filteredRecords.forEach(
        (record) => {

            const row =
                document.createElement("tr");


            row.innerHTML =
                createRowHTML(record);


            body.appendChild(row);

        }
    );


    updateSummary(
        state.filteredRecords
    );

}


/* =========================================================
   ROW GENERATOR
========================================================= */

function createRowHTML(record) {

    switch (state.currentView) {

        case "buildings":

            return `
                <td>${safe(record.hostel || record.name)}</td>
                <td>${safe(record.building || "—")}</td>
                <td>${safe(record.capacity)}</td>
                <td>${safe(record.warden)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        case "rooms":

            return `
                <td>${safe(record.hostel)}</td>
                <td>${safe(record.room)}</td>
                <td>${safe(record.floor)}</td>
                <td>${safe(record.beds)}</td>
                <td>${safe(record.occupied)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        case "allotments":

            return `
                <td>${safe(record.studentName)}</td>
                <td>${safe(record.studentId)}</td>
                <td>${safe(record.hostel)}</td>
                <td>${safe(record.room)}</td>
                <td>${safe(record.allottedOn)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        case "students":

            return `
                <td>${safe(record.studentName)}</td>
                <td>${safe(record.studentId)}</td>
                <td>${safe(record.branch)}</td>
                <td>${safe(record.semester)}</td>
                <td>${safe(record.hostel)}</td>
                <td>${safe(record.room)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        case "vacancy":

            return `
                <td>${safe(record.hostel)}</td>
                <td>${safe(record.room)}</td>
                <td>${safe(record.totalBeds)}</td>
                <td>${safe(record.occupied)}</td>
                <td>${safe(record.available)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        case "fees":

            return `
                <td>${safe(record.studentName)}</td>
                <td>${safe(record.studentId)}</td>
                <td>${safe(record.session)}</td>
                <td>${formatCurrency(record.fee)}</td>
                <td>${formatCurrency(record.paid)}</td>
                <td>${formatCurrency(record.outstanding)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        case "complaints":

            return `
                <td>${safe(record.complaint || record.title)}</td>
                <td>${safe(record.studentName)}</td>
                <td>${safe(record.hostel)}</td>
                <td>${safe(record.room)}</td>
                <td>${safe(record.date)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        case "reports":

            return `
                <td>${safe(record.reportName || record.name)}</td>
                <td>${safe(record.category)}</td>
                <td>${safe(record.period)}</td>
                <td>${safe(record.records)}</td>
                <td>${statusBadge(record.status)}</td>
            `;


        default:

            return `
                <td colspan="10">
                    No supported view.
                </td>
            `;

    }

}


/* =========================================================
   FILTERING
========================================================= */

function applyFilters() {

    const search =
        $("detailSearch")
            .value
            .trim()
            .toLowerCase();


    const status =
        $("detailStatusFilter")
            .value
            .toLowerCase();


    state.filteredRecords =
        state.records.filter(
            (record) => {

                const searchable =
                    JSON.stringify(record)
                        .toLowerCase();


                const recordStatus =
                    String(
                        record.status || ""
                    ).toLowerCase();


                return (
                    (!search ||
                        searchable.includes(search)) &&

                    (!status ||
                        recordStatus === status)
                );

            }
        );


    renderRecords();

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    $("detailSearch").value = "";
    $("detailStatusFilter").value = "";

    state.filteredRecords =
        [...state.records];

    renderRecords();

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(records) {

    const total =
        records.length;


    const active =
        records.filter(
            (record) => {

                const status =
                    String(
                        record.status || ""
                    ).toLowerCase();

                return (
                    status === "active" ||
                    status === "occupied" ||
                    status === "resolved"
                );

            }
        ).length;


    const pending =
        records.filter(
            (record) => {

                return (
                    String(
                        record.status || ""
                    ).toLowerCase()
                    === "pending"
                );

            }
        ).length;


    $("detailRecordCount").textContent =
        formatNumber(total);

    $("detailActiveCount").textContent =
        formatNumber(active);

    $("detailPendingCount").textContent =
        formatNumber(pending);

}


/* =========================================================
   LOADING
========================================================= */

function setLoading() {

    $("detailEmpty").hidden = true;

    $("detailTableHead").innerHTML = `
        <tr>
            <th>Loading</th>
        </tr>
    `;


    $("detailTableBody").innerHTML = `
        <tr>
            <td>
                Loading hostel records...
            </td>
        </tr>
    `;

}


/* =========================================================
   ADD ACTION
========================================================= */

function handleAdd() {

    const view =
        state.currentView;


    const routes = {

        buildings:
            "hostel.html?view=buildings&action=add",

        rooms:
            "hostel.html?view=rooms&action=add",

        allotments:
            "hostel.html?view=allotments&action=add",

        students:
            "hostel.html?view=students&action=add",

        vacancy:
            "hostel.html?view=vacancy&action=add",

        fees:
            "hostel.html?view=fees&action=add",

        complaints:
            "hostel.html?view=complaints&action=add",

        reports:
            "hostel.html?view=reports&action=add"

    };


    const route =
        routes[view];


    if (route) {

        window.location.href = route;

    }

}


/* =========================================================
   EXPORT
========================================================= */

function exportCurrentView() {

    if (
        !state.filteredRecords ||
        state.filteredRecords.length === 0
    ) {

        showToast(
            "There are no records to export.",
            "error"
        );

        return;

    }


    const config =
        VIEW_CONFIG[state.currentView];


    const rows = [
        config.columns
    ];


    state.filteredRecords.forEach(
        (record) => {

            rows.push(
                buildExportRow(record)
            );

        }
    );


    const csv =
        rows
            .map(
                (row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(
                                    value ?? ""
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
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
        `hostel-${state.currentView}-report.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Report exported successfully.",
        "success"
    );

}


function buildExportRow(record) {

    switch (state.currentView) {

        case "buildings":

            return [
                record.hostel || record.name || "",
                record.building || "",
                record.capacity || "",
                record.warden || "",
                record.status || ""
            ];


        case "rooms":

            return [
                record.hostel || "",
                record.room || "",
                record.floor || "",
                record.beds || "",
                record.occupied || "",
                record.status || ""
            ];


        case "allotments":

            return [
                record.studentName || "",
                record.studentId || "",
                record.hostel || "",
                record.room || "",
                record.allottedOn || "",
                record.status || ""
            ];


        case "students":

            return [
                record.studentName || "",
                record.studentId || "",
                record.branch || "",
                record.semester || "",
                record.hostel || "",
                record.room || "",
                record.status || ""
            ];


        case "vacancy":

            return [
                record.hostel || "",
                record.room || "",
                record.totalBeds || "",
                record.occupied || "",
                record.available || "",
                record.status || ""
            ];


        case "fees":

            return [
                record.studentName || "",
                record.studentId || "",
                record.session || "",
                record.fee || "",
                record.paid || "",
                record.outstanding || "",
                record.status || ""
            ];


        case "complaints":

            return [
                record.complaint ||
                    record.title ||
                    "",
                record.studentName || "",
                record.hostel || "",
                record.room || "",
                record.date || "",
                record.status || ""
            ];


        case "reports":

            return [
                record.reportName ||
                    record.name ||
                    "",
                record.category || "",
                record.period || "",
                record.records || "",
                record.status || ""
            ];


        default:

            return [];

    }

}


/* =========================================================
   STATUS BADGE
========================================================= */

function statusBadge(status) {

    const value =
        String(status || "—")
            .toLowerCase();


    let className =
        "status";


    if (
        value === "active" ||
        value === "occupied" ||
        value === "resolved"
    ) {

        className +=
            ` status-${value}`;

    }

    else if (value === "vacant") {

        className +=
            " status-vacant";

    }

    else if (value === "pending") {

        className +=
            " status-pending";

    }


    return `
        <span class="${className}">
            ${safe(status || "—")}
        </span>
    `;

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


/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";

    }


    return new Intl.NumberFormat(
        "en-IN"
    ).format(number);

}


function formatCurrency(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";

    }


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(number);

}


function safe(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "—";

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