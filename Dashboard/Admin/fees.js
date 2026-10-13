"use strict";

/* =========================================================
CAMPUSCONNECT FEES MODULE
========================================================= */

const CONFIG = {
API_BASE_URL: "",
ENDPOINTS: {
SUMMARY: "/admin/fees/summary",
TRANSACTIONS: "/admin/fees/transactions",
DUES: "/admin/fees/dues",
COLLECTION: "/admin/fees/collection",
FEE_TYPES: "/admin/fees/types",
SESSIONS: "/admin/academic/sessions",
CREATE_PAYMENT: "/admin/fees/payments"
}
};

/* =========================================================
STATE
========================================================= */

const state = {
currentView: "",
transactions: [],
dues: [],
collection: [],
feeTypes: [],
sessions: [],
filteredData: []
};

/* =========================================================
DOM
========================================================= */

const $ = (id) => document.getElementById(id);

/* =========================================================
INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

bindEvents();

loadFeeOptions();

loadSummary();

});

/* =========================================================
EVENTS
========================================================= */

function bindEvents() {

$("backBtn").addEventListener("click", () => {
    if (state.currentView) {
        closeReport();
        return;
    }

    if (history.length > 1) {
        history.back();
    } else {
        window.location.href = "../admin-dashboard.html";
    }
});


$("refreshBtn").addEventListener("click", () => {

    if (state.currentView) {
        loadCurrentReport();
    } else {
        loadSummary();
    }

});


$("notificationBtn").addEventListener("click", () => {
    toggleNotificationPanel();
});


$("closeNotificationBtn").addEventListener("click", () => {
    $("notificationPanel").hidden = true;
});


document.querySelectorAll(".operation-card").forEach((button) => {

    button.addEventListener("click", () => {
        openReport(button.dataset.view);
    });

});


$("totalCollectedCard").addEventListener("click", () => {
    openReport("collection");
});


$("outstandingCard").addEventListener("click", () => {
    openReport("dues");
});


$("transactionCard").addEventListener("click", () => {
    openReport("transactions");
});


$("pendingCard").addEventListener("click", () => {
    openReport("pending");
});


$("closeReportBtn").addEventListener("click", () => {
    closeReport();
});


$("clearFiltersBtn").addEventListener("click", () => {
    clearFilters();
});


$("reportSearch").addEventListener("input", () => {
    applyFilters();
});


$("sessionFilter").addEventListener("change", () => {
    applyFilters();
});


$("feeTypeFilter").addEventListener("change", () => {
    applyFilters();
});


$("statusFilter").addEventListener("change", () => {
    applyFilters();
});


$("exportBtn").addEventListener("click", () => {
    exportCurrentReport();
});


$("recordPaymentBtn").addEventListener("click", () => {
    openPaymentModal();
});


$("closePaymentModal").addEventListener("click", () => {
    closePaymentModal();
});


$("cancelPaymentBtn").addEventListener("click", () => {
    closePaymentModal();
});


$("paymentModal").addEventListener("click", (event) => {

    if (event.target === $("paymentModal")) {
        closePaymentModal();
    }

});


$("paymentForm").addEventListener("submit", handlePaymentSubmit);

}

/* =========================================================
API HELPER
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
    throw new Error(`Request failed: ${response.status}`);
}

return response.json();

}

/* =========================================================
SUMMARY
========================================================= */

async function loadSummary() {

try {

    const data = await apiRequest(
        CONFIG.ENDPOINTS.SUMMARY
    );

    if (!data) {
        setSummaryEmpty();
        return;
    }

    $("totalCollected").textContent =
        formatCurrency(data.totalCollected);

    $("outstandingAmount").textContent =
        formatCurrency(data.outstandingAmount);

    $("transactionCount").textContent =
        formatNumber(data.transactionCount);

    $("pendingPayments").textContent =
        formatNumber(data.pendingPayments);

} catch (error) {

    console.error(error);
    setSummaryEmpty();

}

}

function setSummaryEmpty() {

$("totalCollected").textContent = "—";
$("outstandingAmount").textContent = "—";
$("transactionCount").textContent = "—";
$("pendingPayments").textContent = "—";

}

/* =========================================================
FEE OPTIONS
========================================================= */

async function loadFeeOptions() {

try {

    const data = await apiRequest(
        CONFIG.ENDPOINTS.FEE_TYPES
    );

    if (data && Array.isArray(data)) {

        state.feeTypes = data;

        populateFeeTypes(data);

    }

} catch (error) {

    console.error(error);

}


try {

    const data = await apiRequest(
        CONFIG.ENDPOINTS.SESSIONS
    );

    if (data && Array.isArray(data)) {

        state.sessions = data;

        populateSessions(data);

    }

} catch (error) {

    console.error(error);

}

}

/* =========================================================
OPTIONS
========================================================= */

function populateFeeTypes(types) {

const filter = $("feeTypeFilter");
const payment = $("paymentFeeType");

types.forEach((type) => {

    const value =
        typeof type === "string"
            ? type
            : type.name || type.code;

    if (!value) {
        return;
    }

    const option1 = document.createElement("option");
    option1.value = value;
    option1.textContent = value;

    filter.appendChild(option1);


    const option2 = document.createElement("option");
    option2.value = value;
    option2.textContent = value;

    payment.appendChild(option2);

});

}

function populateSessions(sessions) {

const filter = $("sessionFilter");

sessions.forEach((session) => {

    const value =
        typeof session === "string"
            ? session
            : session.name || session.session;

    if (!value) {
        return;
    }

    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    filter.appendChild(option);

});

}

/* =========================================================
REPORT OPENING
========================================================= */

async function openReport(view) {

state.currentView = view;

$("reportSection").hidden = false;

document.querySelectorAll(".operation-card").forEach((card) => {
    card.classList.remove("active");
});

const activeCard = document.querySelector(
    `.operation-card[data-view="${view}"]`
);

if (activeCard) {
    activeCard.classList.add("active");
}


configureReport(view);

$("reportSection").scrollIntoView({
    behavior: "smooth",
    block: "start"
});

await loadCurrentReport();

}

/* =========================================================
REPORT CONFIGURATION
========================================================= */

function configureReport(view) {

const configs = {

    collection: {
        label: "Collection Reports",
        title: "Fee Collection Reports",
        description:
            "Review collected fee amounts and collection activity.",
        tableTitle: "Collection Records"
    },

    dues: {
        label: "Outstanding Dues",
        title: "Outstanding Fee Dues",
        description:
            "Review student-wise outstanding fee balances.",
        tableTitle: "Outstanding Dues"
    },

    transactions: {
        label: "Transaction Reports",
        title: "Fee Transaction Reports",
        description:
            "Search and review individual fee transactions.",
        tableTitle: "Transactions"
    },

    pending: {
        label: "Pending Payments",
        title: "Pending Fee Payments",
        description:
            "Review payments that are still pending.",
        tableTitle: "Pending Payments"
    }

};

const config = configs[view];

if (!config) {
    return;
}

$("reportLabel").textContent = config.label;
$("reportTitle").textContent = config.title;
$("reportDescription").textContent = config.description;
$("tableTitle").textContent = config.tableTitle;

}

/* =========================================================
LOAD REPORT
========================================================= */

async function loadCurrentReport() {

if (!state.currentView) {
    return;
}

setLoadingState();

try {

    let endpoint;

    if (state.currentView === "collection") {
        endpoint = CONFIG.ENDPOINTS.COLLECTION;
    }

    else if (
        state.currentView === "dues"
    ) {
        endpoint = CONFIG.ENDPOINTS.DUES;
    }

    else {
        endpoint = CONFIG.ENDPOINTS.TRANSACTIONS;
    }


    const data = await apiRequest(endpoint);

    if (!data) {

        state.filteredData = [];

        renderReport();

        return;
    }


    let records = Array.isArray(data)
        ? data
        : data.records || data.data || [];


    if (state.currentView === "pending") {

        records = records.filter((item) => {

            const status =
                String(item.status || "").toLowerCase();

            return status === "pending";

        });

    }


    state.filteredData = records;

    renderReport();

} catch (error) {

    console.error(error);

    state.filteredData = [];

    renderReport();

}

}

/* =========================================================
FILTERING
========================================================= */

function applyFilters() {

const search =
    $("reportSearch").value
        .trim()
        .toLowerCase();

const session =
    $("sessionFilter").value
        .toLowerCase();

const feeType =
    $("feeTypeFilter").value
        .toLowerCase();

const status =
    $("statusFilter").value
        .toLowerCase();


let source = getCurrentSourceData();


state.filteredData = source.filter((record) => {

    const searchable = JSON.stringify(record)
        .toLowerCase();

    const recordSession =
        String(
            record.session ||
            record.academicSession ||
            ""
        ).toLowerCase();

    const recordFeeType =
        String(
            record.feeType ||
            record.type ||
            ""
        ).toLowerCase();

    const recordStatus =
        String(
            record.status ||
            ""
        ).toLowerCase();


    const matchesSearch =
        !search ||
        searchable.includes(search);

    const matchesSession =
        !session ||
        recordSession === session;

    const matchesFee =
        !feeType ||
        recordFeeType === feeType;

    const matchesStatus =
        !status ||
        recordStatus === status;


    return (
        matchesSearch &&
        matchesSession &&
        matchesFee &&
        matchesStatus
    );

});


renderReport();

}

function getCurrentSourceData() {

if (state.currentView === "collection") {
    return state.collection;
}

if (state.currentView === "dues") {
    return state.dues;
}

return state.transactions;

}

/* =========================================================
RENDER REPORT
========================================================= */

function renderReport() {

const head = $("reportTableHead");
const body = $("reportTableBody");
const empty = $("reportEmptyState");

head.innerHTML = "";
body.innerHTML = "";


if (
    !state.filteredData ||
    state.filteredData.length === 0
) {

    empty.hidden = false;

    updateReportSummary([]);

    renderTableHeader();

    return;

}


empty.hidden = true;

renderTableHeader();


state.filteredData.forEach((record) => {

    const row = document.createElement("tr");

    if (state.currentView === "dues") {

        row.innerHTML = `
            <td>${safe(record.studentName)}</td>
            <td>${safe(record.studentId)}</td>
            <td>${safe(record.session || "—")}</td>
            <td>${safe(record.feeType || "—")}</td>
            <td>${formatCurrency(record.amountDue)}</td>
            <td>${formatCurrency(record.amountPaid)}</td>
            <td>${formatCurrency(record.outstanding)}</td>
            <td>
                ${statusBadge(record.status)}
            </td>
        `;

    }

    else if (state.currentView === "collection") {

        row.innerHTML = `
            <td>${safe(record.date || "—")}</td>
            <td>${safe(record.feeType || "—")}</td>
            <td>${safe(record.paymentMode || "—")}</td>
            <td>${formatCurrency(record.amount)}</td>
            <td>${statusBadge(record.status)}</td>
        `;

    }

    else {

        row.innerHTML = `
            <td>${safe(record.transactionId || "—")}</td>
            <td>${safe(record.studentName || "—")}</td>
            <td>${safe(record.studentId || "—")}</td>
            <td>${safe(record.feeType || "—")}</td>
            <td>${formatCurrency(record.amount)}</td>
            <td>${safe(record.paymentMode || "—")}</td>
            <td>${safe(record.date || "—")}</td>
            <td>${statusBadge(record.status)}</td>
        `;

    }

    body.appendChild(row);

});


updateReportSummary(state.filteredData);

}

/* =========================================================
TABLE HEAD
========================================================= */

function renderTableHeader() {

const head = $("reportTableHead");

let columns = [];


if (state.currentView === "dues") {

    columns = [
        "Student",
        "Student ID",
        "Session",
        "Fee Type",
        "Due",
        "Paid",
        "Outstanding",
        "Status"
    ];

}

else if (state.currentView === "collection") {

    columns = [
        "Date",
        "Fee Type",
        "Payment Mode",
        "Amount",
        "Status"
    ];

}

else {

    columns = [
        "Transaction ID",
        "Student",
        "Student ID",
        "Fee Type",
        "Amount",
        "Payment Mode",
        "Date",
        "Status"
    ];

}


const row = document.createElement("tr");

columns.forEach((column) => {

    const th = document.createElement("th");

    th.textContent = column;

    row.appendChild(th);

});

head.appendChild(row);

}

/* =========================================================
SUMMARY
========================================================= */

function updateReportSummary(records) {

$("reportRecordCount").textContent =
    formatNumber(records.length);


let collected = 0;
let outstanding = 0;


records.forEach((record) => {

    collected += Number(
        record.amountPaid ??
        record.amount ??
        0
    );

    outstanding += Number(
        record.outstanding ??
        record.amountDue ??
        0
    );

});


$("reportCollected").textContent =
    formatCurrency(collected);

$("reportOutstanding").textContent =
    formatCurrency(outstanding);

}

/* =========================================================
LOADING STATE
========================================================= */

function setLoadingState() {

$("reportEmptyState").hidden = true;

$("reportTableHead").innerHTML = `
    <tr>
        <th>Loading</th>
    </tr>
`;

$("reportTableBody").innerHTML = `
    <tr>
        <td>Loading financial records...</td>
    </tr>
`;

}

/* =========================================================
CLEAR FILTERS
========================================================= */

function clearFilters() {

$("reportSearch").value = "";
$("sessionFilter").value = "";
$("feeTypeFilter").value = "";
$("statusFilter").value = "";

loadCurrentReport();

}

/* =========================================================
CLOSE REPORT
========================================================= */

function closeReport() {

state.currentView = "";

$("reportSection").hidden = true;

document.querySelectorAll(".operation-card").forEach((card) => {
    card.classList.remove("active");
});

window.scrollTo({
    top: 0,
    behavior: "smooth"
});

}

/* =========================================================
PAYMENT MODAL
========================================================= */

function openPaymentModal() {

$("paymentModal").hidden = false;

document.body.style.overflow = "hidden";

}

function closePaymentModal() {

$("paymentModal").hidden = true;

document.body.style.overflow = "";

$("paymentForm").reset();

}

async function handlePaymentSubmit(event) {

event.preventDefault();


const payload = {

    studentId: $("studentId").value.trim(),

    amount: Number(
        $("paymentAmount").value
    ),

    feeType: $("paymentFeeType").value,

    paymentMode: $("paymentMode").value

};


try {

    const response = await apiRequest(
        CONFIG.ENDPOINTS.CREATE_PAYMENT,
        {
            method: "POST",
            body: JSON.stringify(payload)
        }
    );


    if (!response) {

        showToast(
            "Payment API is not connected yet.",
            "error"
        );

        return;

    }


    closePaymentModal();

    showToast(
        "Payment recorded successfully.",
        "success"
    );

    loadSummary();

    if (state.currentView) {
        loadCurrentReport();
    }

} catch (error) {

    console.error(error);

    showToast(
        "Unable to record payment.",
        "error"
    );

}

}

/* =========================================================
EXPORT
========================================================= */

function exportCurrentReport() {

if (
    !state.filteredData ||
    state.filteredData.length === 0
) {

    showToast(
        "There are no records to export.",
        "error"
    );

    return;
}


const rows = [];


if (state.currentView === "dues") {

    rows.push([
        "Student",
        "Student ID",
        "Session",
        "Fee Type",
        "Due",
        "Paid",
        "Outstanding",
        "Status"
    ]);

    state.filteredData.forEach((item) => {

        rows.push([
            item.studentName || "",
            item.studentId || "",
            item.session || "",
            item.feeType || "",
            item.amountDue || "",
            item.amountPaid || "",
            item.outstanding || "",
            item.status || ""
        ]);

    });

}

else {

    rows.push([
        "Transaction ID",
        "Student",
        "Student ID",
        "Fee Type",
        "Amount",
        "Payment Mode",
        "Date",
        "Status"
    ]);

    state.filteredData.forEach((item) => {

        rows.push([
            item.transactionId || "",
            item.studentName || "",
            item.studentId || "",
            item.feeType || "",
            item.amount || "",
            item.paymentMode || "",
            item.date || "",
            item.status || ""
        ]);

    });

}


const csv = rows
    .map(row =>
        row
            .map(value =>
                `"${String(value).replace(/"/g, '""')}"`
            )
            .join(",")
    )
    .join("\n");


const blob = new Blob(
    [csv],
    { type: "text/csv;charset=utf-8;" }
);


const url = URL.createObjectURL(blob);

const link = document.createElement("a");

link.href = url;

link.download =
    `${state.currentView || "fees"}-report.csv`;

document.body.appendChild(link);

link.click();

link.remove();

URL.revokeObjectURL(url);

}

/* =========================================================
NOTIFICATIONS
========================================================= */

function toggleNotificationPanel() {

const panel = $("notificationPanel");

panel.hidden = !panel.hidden;

}

/* =========================================================
TOAST
========================================================= */

function showToast(message, type = "") {

const container = $("toastContainer");

const toast = document.createElement("div");

toast.className =
    `toast ${type}`;

toast.textContent = message;

container.appendChild(toast);


setTimeout(() => {

    toast.remove();

}, 3000);

}

/* =========================================================
HELPERS
========================================================= */

function formatCurrency(value) {

const number = Number(value);

if (!Number.isFinite(number)) {
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

function formatNumber(value) {

const number = Number(value);

if (!Number.isFinite(number)) {
    return "—";
}

return new Intl.NumberFormat("en-IN")
    .format(number);

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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function statusBadge(status) {

const value =
    String(status || "—")
        .toLowerCase();

let className = "status";

if (value === "paid") {
    className += " status-paid";
}

else if (value === "pending") {
    className += " status-pending";
}

else if (value === "partial") {
    className += " status-partial";
}

else if (value === "failed") {
    className += " status-failed";
}

return `
    <span class="${className}">
        ${safe(status || "—")}
    </span>
`;

}