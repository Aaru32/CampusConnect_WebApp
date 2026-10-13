
"use strict";

/*
 * CAMPUSCONNECT — ADMIN SAFESPEAK
 * File: Dashboard/SafeSpeak/admin-safespeak.js
 *
 * API contract expected by this frontend:
 * GET   /api/safespeak/admin/reports
 * PATCH /api/safespeak/admin/reports/{id}
 *
 * These endpoints must be implemented and secured in Spring Boot.
 * No complaint data is stored in localStorage.
 */

const SAFESPEAK_CONFIG = {
    API_BASE_URL: "",

    ENDPOINTS: {
        REPORTS: "/api/safespeak/admin/reports",
        UPDATE_REPORT: "/api/safespeak/admin/reports"
    }
};

const state = {
    reports: [],
    selectedReport: null,
    loading: false,
    saving: false
};

const elements = {
    backBtn: document.getElementById("backBtn"),
    refreshBtn: document.getElementById("refreshBtn"),
    searchInput: document.getElementById("searchInput"),
    statusFilter: document.getElementById("statusFilter"),

    totalCount: document.getElementById("totalCount"),
    pendingCount: document.getElementById("pendingCount"),
    reviewCount: document.getElementById("reviewCount"),
    resolvedCount: document.getElementById("resolvedCount"),

    messageBox: document.getElementById("messageBox"),
    loadingState: document.getElementById("loadingState"),
    emptyState: document.getElementById("emptyState"),
    complaintsList: document.getElementById("complaintsList"),

    modal: document.getElementById("complaintModal"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    cancelModalBtn: document.getElementById("cancelModalBtn"),
    modalMessage: document.getElementById("modalMessage"),

    detailId: document.getElementById("detailId"),
    detailDate: document.getElementById("detailDate"),
    detailCategory: document.getElementById("detailCategory"),
    detailReporter: document.getElementById("detailReporter"),
    detailSubject: document.getElementById("detailSubject"),
    detailDescription: document.getElementById("detailDescription"),

    resolutionForm: document.getElementById("resolutionForm"),
    resolutionStatus: document.getElementById("resolutionStatus"),
    resolutionNote: document.getElementById("resolutionNote"),
    saveResolutionBtn: document.getElementById("saveResolutionBtn")
};


/* =========================
   UTILITIES
========================= */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function normalizeStatus(status) {
    const value = String(status || "pending")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

    const allowed = [
        "pending",
        "under_review",
        "resolved",
        "rejected"
    ];

    return allowed.includes(value) ? value : "pending";
}

function statusLabel(status) {
    const labels = {
        pending: "Pending",
        under_review: "Under Review",
        resolved: "Resolved",
        rejected: "Rejected"
    };

    return labels[normalizeStatus(status)];
}

function formatDate(value) {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function getReportId(report) {
    return report.id ?? report.reportId ?? report.complaintId ?? "";
}

function getSubject(report) {
    return report.subject ?? report.title ?? "Untitled complaint";
}

function getDescription(report) {
    return report.description ?? report.details ?? report.message ?? "";
}

function getCategory(report) {
    return report.category ?? "Not specified";
}

function isAnonymous(report) {
    return report.anonymous === true ||
        report.isAnonymous === true ||
        String(report.anonymous).toLowerCase() === "true" ||
        String(report.isAnonymous).toLowerCase() === "true";
}

function getReporter(report) {
    /*
     * The backend must not send reporter identity to this page
     * for anonymous reports. Frontend checks are not authorization.
     */
    if (isAnonymous(report)) {
        return "Anonymous report";
    }

    return report.reporterName ??
        report.studentName ??
        report.reporter?.name ??
        "Identity not provided";
}

function getReportsFromResponse(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.reports)) return data.reports;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.data)) return data.data;

    return null;
}

function showMessage(message, type = "error", target = elements.messageBox) {
    target.textContent = message;
    target.className = `message-box ${type}`;
    target.hidden = false;
}

function clearMessage(target = elements.messageBox) {
    target.textContent = "";
    target.hidden = true;
    target.className = "message-box";
}

function setLoading(loading) {
    state.loading = loading;
    elements.loadingState.hidden = !loading;
    elements.refreshBtn.disabled = loading;

    if (loading) {
        elements.complaintsList.replaceChildren();
        elements.emptyState.hidden = true;
    }
}

function apiUrl(path) {
    return `${SAFESPEAK_CONFIG.API_BASE_URL}${path}`;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(apiUrl(url), {
        credentials: "same-origin",
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    if (response.status === 401) {
        throw new Error(
            "Your session has expired. Sign in again to access SafeSpeak."
        );
    }

    if (response.status === 403) {
        throw new Error(
            "Access denied. Only the Principal or an authorized account can manage these complaints."
        );
    }

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const body = await response.json();
            message = body.message || body.error || message;
        } catch (_) {
            // Keep the HTTP error message if the response is not JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}


/* =========================
   COMPLAINT SUMMARY
========================= */

function updateSummary() {
    const reports = state.reports;

    elements.totalCount.textContent = reports.length;

    elements.pendingCount.textContent = reports.filter(
        report => normalizeStatus(report.status) === "pending"
    ).length;

    elements.reviewCount.textContent = reports.filter(
        report => normalizeStatus(report.status) === "under_review"
    ).length;

    elements.resolvedCount.textContent = reports.filter(
        report => normalizeStatus(report.status) === "resolved"
    ).length;
}


/* =========================
   LOAD COMPLAINTS
========================= */

async function loadComplaints() {
    setLoading(true);
    clearMessage();

    try {
        const response = await apiRequest(
            SAFESPEAK_CONFIG.ENDPOINTS.REPORTS
        );

        const reports = getReportsFromResponse(response);

        if (!reports) {
            throw new Error(
                "The API response format is not recognized. Please check the Spring Boot response."
            );
        }

        state.reports = reports;
        updateSummary();
        renderComplaints();

    } catch (error) {
        state.reports = [];
        updateSummary();
        elements.complaintsList.replaceChildren();
        elements.emptyState.hidden = true;

        showMessage(
            `${error.message} Check the SafeSpeak backend connection and API permissions.`
        );
    } finally {
        setLoading(false);
    }
}


/* =========================
   FILTER AND RENDER
========================= */

function getFilteredReports() {
    const search = elements.searchInput.value
        .trim()
        .toLowerCase();

    const selectedStatus = elements.statusFilter.value;

    return state.reports.filter(report => {
        const status = normalizeStatus(report.status);
        const id = String(getReportId(report)).toLowerCase();
        const subject = String(getSubject(report)).toLowerCase();

        const matchesSearch =
            !search ||
            id.includes(search) ||
            subject.includes(search);

        const matchesStatus =
            selectedStatus === "all" ||
            status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
}

function renderComplaints() {
    const reports = getFilteredReports();
    const fragment = document.createDocumentFragment();

    elements.complaintsList.replaceChildren();

    reports.forEach(report => {
        const id = getReportId(report);
        const status = normalizeStatus(report.status);

        const card = document.createElement("article");
        card.className = "complaint-card";

        const main = document.createElement("div");
        main.className = "complaint-main";

        const topline = document.createElement("div");
        topline.className = "complaint-topline";

        const idLabel = document.createElement("span");
        idLabel.className = "complaint-id";
        idLabel.textContent = `Complaint #${id || "Unavailable"}`;

        const badge = document.createElement("span");
        badge.className = `status-pill status-${status}`;
        badge.textContent = statusLabel(status);

        topline.append(idLabel, badge);

        const heading = document.createElement("h3");
        heading.textContent = getSubject(report);

        const meta = document.createElement("div");
        meta.className = "complaint-meta";

        const category = document.createElement("span");
        category.innerHTML = '<i class="fa-solid fa-tag"></i>';
        category.append(
            document.createTextNode(` ${getCategory(report)}`)
        );

        const date = document.createElement("span");
        date.innerHTML = '<i class="fa-regular fa-calendar"></i>';
        date.append(
            document.createTextNode(
                ` ${formatDate(report.createdAt ?? report.submittedAt ?? report.createdOn)}`
            )
        );

        const reporter = document.createElement("span");
        reporter.innerHTML = '<i class="fa-solid fa-lock"></i>';
        reporter.append(
            document.createTextNode(` ${getReporter(report)}`)
        );

        meta.append(category, date, reporter);

        const preview = document.createElement("p");
        preview.className = "complaint-description-preview";

        const description = getDescription(report);
        preview.textContent = description
            ? description.length > 180
                ? `${description.slice(0, 180)}…`
                : description
            : "No description provided.";

        main.append(topline, heading, meta, preview);

        const reviewButton = document.createElement("button");
        reviewButton.type = "button";
        reviewButton.className = "review-btn";
        reviewButton.textContent = "Review Complaint";
        reviewButton.addEventListener("click", () => openComplaint(report));

        card.append(main, reviewButton);
        fragment.appendChild(card);
    });

    elements.complaintsList.appendChild(fragment);

    const shouldShowEmpty =
        !state.loading && reports.length === 0;

    elements.emptyState.hidden = !shouldShowEmpty;

    if (shouldShowEmpty) {
        const heading = elements.emptyState.querySelector("h3");
        const paragraph = elements.emptyState.querySelector("p");

        if (state.reports.length === 0) {
            heading.textContent = "No complaints available";
            paragraph.textContent =
                "No complaints were returned by the server for your authorized account.";
        } else {
            heading.textContent = "No matching complaints";
            paragraph.textContent =
                "Try changing the search text or status filter.";
        }
    }
}


/* =========================
   OPEN COMPLAINT
========================= */

function openComplaint(report) {
    state.selectedReport = report;

    clearMessage(elements.modalMessage);

    elements.detailId.textContent =
        getReportId(report) || "Unavailable";

    elements.detailDate.textContent =
        formatDate(report.createdAt ?? report.submittedAt ?? report.createdOn);

    elements.detailCategory.textContent = getCategory(report);
    elements.detailReporter.textContent = getReporter(report);
    elements.detailSubject.textContent = getSubject(report);
    elements.detailDescription.textContent =
        getDescription(report) || "No description provided.";

    elements.resolutionStatus.value = normalizeStatus(report.status);

    elements.resolutionNote.value =
        report.resolutionNote ??
        report.adminResponse ??
        report.resolution ??
        "";

    elements.modal.hidden = false;
    document.body.style.overflow = "hidden";
    elements.closeModalBtn.focus();
}

function closeComplaintModal() {
    if (state.saving) return;

    elements.modal.hidden = true;
    document.body.style.overflow = "";
    state.selectedReport = null;
    clearMessage(elements.modalMessage);
}


/* =========================
   UPDATE COMPLAINT
========================= */

async function saveResolution(event) {
    event.preventDefault();

    if (state.saving || !state.selectedReport) return;

    const report = state.selectedReport;
    const id = getReportId(report);

    if (id === "" || id === null || id === undefined) {
        showMessage(
            "This complaint does not have a valid ID. The backend response must include an id or reportId."
        , "error", elements.modalMessage);
        return;
    }

    const status = normalizeStatus(elements.resolutionStatus.value);
    const resolutionNote = elements.resolutionNote.value.trim();

    if (!resolutionNote) {
        showMessage(
            "Please enter an official response or resolution note.",
            "error",
            elements.modalMessage
        );
        elements.resolutionNote.focus();
        return;
    }

    state.saving = true;
    elements.saveResolutionBtn.disabled = true;
    elements.saveResolutionBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    clearMessage(elements.modalMessage);

    try {
        const path =
            `${SAFESPEAK_CONFIG.ENDPOINTS.UPDATE_REPORT}/${encodeURIComponent(id)}`;

        await apiRequest(path, {
            method: "PATCH",
            body: JSON.stringify({
                status,
                resolutionNote
            })
        });

        showMessage(
            "Complaint update saved successfully.",
            "success",
            elements.modalMessage
        );

        /*
         * Reload from the server instead of assuming the update succeeded
         * in the local list. Keep the modal open for the confirmation.
         */
        await loadComplaints();

        const updatedReport = state.reports.find(
            item => String(getReportId(item)) === String(id)
        );

        if (updatedReport) {
            state.selectedReport = updatedReport;
            elements.resolutionStatus.value =
                normalizeStatus(updatedReport.status);

            elements.resolutionNote.value =
                updatedReport.resolutionNote ??
                updatedReport.adminResponse ??
                updatedReport.resolution ??
                resolutionNote;
        } else {
            elements.resolutionStatus.value = status;
            elements.resolutionNote.value = resolutionNote;
        }

        showMessage(
            "Complaint update saved successfully.",
            "success",
            elements.modalMessage
        );

    } catch (error) {
        showMessage(error.message, "error", elements.modalMessage);
    } finally {
        state.saving = false;
        elements.saveResolutionBtn.disabled = false;
        elements.saveResolutionBtn.innerHTML =
            '<i class="fa-solid fa-lock"></i> Save Update';
    }
}


/* =========================
   EVENT LISTENERS
========================= */

elements.backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "../Admin/admin-dashboard.html";
    }
});

elements.refreshBtn.addEventListener("click", loadComplaints);

elements.searchInput.addEventListener("input", renderComplaints);

elements.statusFilter.addEventListener("change", renderComplaints);

elements.closeModalBtn.addEventListener("click", closeComplaintModal);

elements.cancelModalBtn.addEventListener("click", closeComplaintModal);

elements.resolutionForm.addEventListener("submit", saveResolution);

elements.modal.addEventListener("click", event => {
    if (event.target === elements.modal) {
        closeComplaintModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !elements.modal.hidden) {
        closeComplaintModal();
    }
});


/* =========================
   INITIALIZE
========================= */

loadComplaints();
