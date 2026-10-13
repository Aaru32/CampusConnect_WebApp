
"use strict";

/* =========================================================
   CAMPUSCONNECT — SAFESPEAK
   Frontend for Spring Boot REST API
   Location: Dashboard/SafeSpeak/
========================================================= */

const SAFESPEAK_CONFIG = {
    API_BASE_URL: "/api",

    ENDPOINTS: {
        CURRENT_USER: "/auth/me",
        CREATE_REPORT: "/safespeak/reports",
        MY_REPORTS: "/safespeak/my-reports",
        ADMIN_REPORTS: "/safespeak/admin/reports",
        UPDATE_REPORT: "/safespeak/admin/reports"
    }
};

const $ = (selector) => document.querySelector(selector);

const reportForm = $("#reportForm");
const submitBtn = $("#submitBtn");
const descriptionInput = $("#description");
const characterCount = $("#characterCount");
const pageMessage = $("#pageMessage");
const myReportsList = $("#myReportsList");
const myReportsMessage = $("#myReportsMessage");
const adminSection = $("#adminSection");
const adminReportsList = $("#adminReportsList");
const adminReportsMessage = $("#adminReportsMessage");
const statusFilter = $("#statusFilter");

let currentUser = null;
let adminReportsCache = [];

/* ================= API HELPERS ================= */

function apiUrl(path) {
    return SAFESPEAK_CONFIG.API_BASE_URL.replace(/\/$/, "") + path;
}

function setMessage(element, message, type = "info") {
    if (!element) return;

    element.textContent = message;
    element.className = element.id === "pageMessage"
        ? `message-box ${type}`
        : `inline-message ${type}`;

    element.hidden = !message;
}

function clearMessage(element) {
    if (!element) return;
    element.textContent = "";
    element.hidden = true;
}

async function apiRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    headers.set("Accept", "application/json");

    const response = await fetch(apiUrl(path), {
        ...options,
        headers,
        credentials: "include"
    });

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";

    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const serverMessage =
            payload && typeof payload === "object"
                ? (payload.message || payload.error || payload.detail)
                : payload;

        if (response.status === 401) {
            throw new Error(
                "Please sign in to CampusConnect before using SafeSpeak."
            );
        }

        if (response.status === 403) {
            throw new Error(
                "You do not have permission to perform this action."
            );
        }

        throw new Error(
            serverMessage || `Request failed (${response.status}).`
        );
    }

    return payload;
}

/* ================= USER AND ROLE ================= */

function normaliseUser(payload) {
    if (!payload || typeof payload !== "object") return null;
    return payload.user || payload.data || payload;
}

function getRole(user) {
    const role = String(
        user?.role || user?.userRole || user?.authority || ""
    ).toUpperCase();

    if (role.includes("PRINCIPAL") || role.includes("ADMIN")) {
        return "ADMIN";
    }

    if (role.includes("FACULTY") || role.includes("TEACHER")) {
        return "FACULTY";
    }

    if (role.includes("STUDENT")) {
        return "STUDENT";
    }

    return role;
}

async function loadCurrentUser() {
    const payload = await apiRequest(
        SAFESPEAK_CONFIG.ENDPOINTS.CURRENT_USER
    );

    currentUser = normaliseUser(payload);

    if (!currentUser) {
        throw new Error(
            "Unable to identify your signed-in CampusConnect account."
        );
    }

    const role = getRole(currentUser);

    if (!["STUDENT", "FACULTY", "ADMIN"].includes(role)) {
        throw new Error(
            "SafeSpeak is available to signed-in students, faculty, and authorized administrators."
        );
    }

    // This controls visibility only. The backend must enforce authorization.
    adminSection.hidden = role !== "ADMIN";

    return role;
}

/* ================= REPORT HELPERS ================= */

function safeText(value, fallback = "—") {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return fallback;
    }

    return String(value);
}

function formatDate(value) {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return safeText(value);
    }

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
}

function normaliseStatus(value) {
    const status = String(value || "SUBMITTED")
        .toUpperCase()
        .replaceAll(" ", "_");

    const allowed = [
        "SUBMITTED",
        "UNDER_REVIEW",
        "RESOLVED",
        "CLOSED"
    ];

    return allowed.includes(status) ? status : "SUBMITTED";
}

function statusLabel(status) {
    return ({
        SUBMITTED: "Submitted",
        UNDER_REVIEW: "Under review",
        RESOLVED: "Resolved",
        CLOSED: "Closed"
    })[status] || status;
}

function makeStatusBadge(statusValue) {
    const status = normaliseStatus(statusValue);
    const badge = document.createElement("span");

    badge.className = `status-badge status-${status.toLowerCase()}`;
    badge.textContent = statusLabel(status);

    return badge;
}

function makeEmptyState(title, description, icon = "fa-folder-open") {
    const wrapper = document.createElement("div");
    wrapper.className = "empty-state";

    const iconElement = document.createElement("i");

    iconElement.className = icon === "fa-shield-halved"
        ? "fa-solid fa-shield-halved"
        : `fa-regular ${icon}`;

    const heading = document.createElement("h3");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = description;

    wrapper.append(iconElement, heading, paragraph);

    return wrapper;
}

function getReportArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.reports)) return payload.reports;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.reports)) {
        return payload.data.reports;
    }

    return [];
}

/* ================= REPORT CARD ================= */

function makeReportCard(report, isAdmin = false) {
    const card = document.createElement("article");
    card.className = "report-card";

    const top = document.createElement("div");
    top.className = "report-card-top";

    const titleArea = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = safeText(
        report.subject || report.title,
        "Untitled report"
    );

    const meta = document.createElement("div");
    meta.className = "report-meta";

    const category = document.createElement("span");
    category.textContent = `Category: ${safeText(report.category)}`;

    const created = document.createElement("span");
    created.textContent =
        `Submitted: ${formatDate(
            report.createdAt || report.submittedAt || report.createdDate
        )}`;

    const incident = document.createElement("span");
    incident.textContent = `Incident: ${formatDate(report.incidentDate)}`;

    meta.append(category, created, incident);
    titleArea.append(heading, meta);

    top.append(titleArea, makeStatusBadge(report.status));
    card.append(top);

    const description = document.createElement("p");
    description.className = "report-description";
    description.textContent = safeText(
        report.description,
        "No description provided."
    );

    card.append(description);

    if (report.location) {
        const location = document.createElement("div");
        location.className = "report-meta";
        location.textContent = `Location: ${report.location}`;
        card.append(location);
    }

    if (report.anonymous === true || report.isAnonymous === true) {
        const anonymity = document.createElement("div");
        anonymity.className = "report-meta";
        anonymity.style.marginTop = "8px";
        anonymity.textContent = "Submitted anonymously";
        card.append(anonymity);
    }

    if (!isAdmin) return card;

    const id = report.id ?? report.reportId;

    if (id === undefined || id === null) {
        const note = document.createElement("p");
        note.className = "report-meta";
        note.textContent =
            "This report has no identifier, so its status cannot be updated.";
        card.append(note);
        return card;
    }

    const actions = document.createElement("div");
    actions.className = "admin-report-actions";

    const label = document.createElement("label");
    label.textContent = "Update status";

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Report status");

    [
        "SUBMITTED",
        "UNDER_REVIEW",
        "RESOLVED",
        "CLOSED"
    ].forEach((statusValue) => {
        const option = document.createElement("option");
        option.value = statusValue;
        option.textContent = statusLabel(statusValue);
        select.append(option);
    });

    select.value = normaliseStatus(report.status);

    const save = document.createElement("button");
    save.type = "button";
    save.className = "button button-primary";
    save.innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Save status';

    save.addEventListener("click", async () => {
        save.disabled = true;
        clearMessage(adminReportsMessage);

        try {
            await apiRequest(
                `${SAFESPEAK_CONFIG.ENDPOINTS.UPDATE_REPORT}/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: select.value
                    })
                }
            );

            setMessage(
                adminReportsMessage,
                "Report status updated.",
                "success"
            );

            await loadAdminReports();
        } catch (error) {
            setMessage(adminReportsMessage, error.message, "error");
        } finally {
            save.disabled = false;
        }
    });

    actions.append(label, select, save);
    card.append(actions);

    return card;
}

/* ================= MY REPORTS ================= */

async function loadMyReports() {
    clearMessage(myReportsMessage);

    myReportsList.replaceChildren(
        makeEmptyState(
            "Loading your reports",
            "Please wait while your report history loads."
        )
    );

    try {
        const payload = await apiRequest(
            SAFESPEAK_CONFIG.ENDPOINTS.MY_REPORTS
        );

        const reports = getReportArray(payload);

        myReportsList.replaceChildren();

        if (!reports.length) {
            myReportsList.append(
                makeEmptyState(
                    "No reports to display",
                    "Your submitted reports will appear here."
                )
            );
            return;
        }

        reports.forEach((report) => {
            myReportsList.append(makeReportCard(report));
        });
    } catch (error) {
        myReportsList.replaceChildren(
            makeEmptyState(
                "Report history unavailable",
                "We could not load your reports. Check your connection and try again."
            )
        );

        setMessage(myReportsMessage, error.message, "error");
    }
}

/* ================= PRINCIPAL MANAGEMENT ================= */

async function loadAdminReports() {
    if (!currentUser || getRole(currentUser) !== "ADMIN") return;

    clearMessage(adminReportsMessage);

    adminReportsList.replaceChildren(
        makeEmptyState(
            "Loading grievance reports",
            "Please wait while authorized reports load."
        )
    );

    try {
        const payload = await apiRequest(
            SAFESPEAK_CONFIG.ENDPOINTS.ADMIN_REPORTS
        );

        adminReportsCache = getReportArray(payload);
        renderAdminReports();
    } catch (error) {
        adminReportsList.replaceChildren(
            makeEmptyState(
                "Unable to load reports",
                "Grievance reports could not be retrieved."
            )
        );

        setMessage(adminReportsMessage, error.message, "error");
    }
}

function renderAdminReports() {
    const filter = statusFilter.value;

    const reports = filter === "ALL"
        ? adminReportsCache
        : adminReportsCache.filter(
            (report) => normaliseStatus(report.status) === filter
        );

    adminReportsList.replaceChildren();

    if (!reports.length) {
        adminReportsList.append(
            makeEmptyState(
                "No reports found",
                "No reports match the selected status."
            )
        );
        return;
    }

    reports.forEach((report) => {
        adminReportsList.append(makeReportCard(report, true));
    });
}

/* ================= SUBMIT REPORT ================= */

async function handleReportSubmit(event) {
    event.preventDefault();
    clearMessage(pageMessage);

    if (!reportForm.reportValidity()) return;

    const submitLabel = submitBtn.querySelector("span");
    const originalLabel = submitLabel.textContent;

    submitBtn.disabled = true;
    submitLabel.textContent = "Submitting…";

    const formData = new FormData(reportForm);

    const body = {
        category: String(formData.get("category") || ""),
        subject: String(formData.get("subject") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        incidentDate: String(formData.get("incidentDate") || "") || null,
        location: String(formData.get("location") || "").trim() || null,
        anonymous: $("#anonymous").checked
    };

    try {
        await apiRequest(
            SAFESPEAK_CONFIG.ENDPOINTS.CREATE_REPORT,
            {
                method: "POST",
                body: JSON.stringify(body)
            }
        );

        reportForm.reset();
        updateCharacterCount();

        setMessage(
            pageMessage,
            "Your report was submitted successfully.",
            "success"
        );

        await loadMyReports();

        $("#myReportsSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        setMessage(pageMessage, error.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitLabel.textContent = originalLabel;
    }
}

/* ================= PAGE INITIALISATION ================= */

function updateCharacterCount() {
    characterCount.textContent =
        `${descriptionInput.value.length} / 5000`;
}

function initialiseBackButton() {
    $("#backBtn").addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            setMessage(
                pageMessage,
                "Use your CampusConnect dashboard navigation to return.",
                "info"
            );
        }
    });
}

async function initialiseSafeSpeak() {
    initialiseBackButton();

    descriptionInput.addEventListener("input", updateCharacterCount);
    reportForm.addEventListener("submit", handleReportSubmit);

    reportForm.addEventListener("reset", () => {
        window.setTimeout(updateCharacterCount, 0);
        clearMessage(pageMessage);
    });

    statusFilter.addEventListener("change", renderAdminReports);
    $("#refreshAdminBtn").addEventListener("click", loadAdminReports);

    try {
        const role = await loadCurrentUser();

        await loadMyReports();

        if (role === "ADMIN") {
            await loadAdminReports();
        }
    } catch (error) {
        setMessage(pageMessage, error.message, "error");

        myReportsList.replaceChildren(
            makeEmptyState(
                "Sign-in or connection required",
                "Sign in to CampusConnect and make sure the SafeSpeak API is available."
            )
        );

        adminSection.hidden = true;
    }
}

document.addEventListener("DOMContentLoaded", initialiseSafeSpeak);
