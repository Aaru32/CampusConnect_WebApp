/* =====================================================
   CAMPUSCONNECT
   ADMISSION MODULE
   API-DRIVEN FRONTEND
===================================================== */


/* =====================================================
   API CONFIGURATION
   -----------------------------------------------
   No student data is stored here.
   The Java backend determines the logged-in student.
===================================================== */

const API = {

    admission: "/api/admission",

    documents: "/api/admission/documents",

    fees: "/api/admission/fees",

    status: "/api/admission/status",

    dates: "/api/admission/dates",

    notices: "/api/admission/notices"

};


/* =====================================================
   DOM REFERENCES
===================================================== */

const elements = {

    pageLoading:
        document.getElementById("pageLoading"),

    pageError:
        document.getElementById("pageError"),

    pageErrorMessage:
        document.getElementById("pageErrorMessage"),

    retryButton:
        document.getElementById("retryButton"),

    admissionContent:
        document.getElementById("admissionContent"),

    applicationStatus:
        document.getElementById("applicationStatus"),

    applicationProgress:
        document.getElementById("applicationProgress"),

    progressFill:
        document.getElementById("progressFill"),

    applicationNumber:
        document.getElementById("applicationNumber"),

    academicSession:
        document.getElementById("academicSession"),

    program:
        document.getElementById("program"),

    semester:
        document.getElementById("semester"),

    applicationDetails:
        document.getElementById("applicationDetails"),

    documentsContainer:
        document.getElementById("documentsContainer"),

    feeContainer:
        document.getElementById("feeContainer"),

    datesContainer:
        document.getElementById("datesContainer"),

    noticesContainer:
        document.getElementById("noticesContainer"),

    viewDocumentsButton:
        document.getElementById("viewDocumentsButton"),

    backButton:
        document.getElementById("backButton"),

    serviceModal:
        document.getElementById("serviceModal"),

    modalClose:
        document.getElementById("modalClose"),

    modalOk:
        document.getElementById("modalOk"),

    modalTitle:
        document.getElementById("modalTitle"),

    modalMessage:
        document.getElementById("modalMessage")

};


/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(url) {

    const response = await fetch(
        url,
        {
            method: "GET",

            headers: {
                "Accept": "application/json"
            },

            credentials: "include"
        }
    );


    if (!response.ok) {

        let message =
            `Request failed with status ${response.status}.`;

        try {

            const errorData =
                await response.json();

            if (errorData.message) {

                message =
                    errorData.message;

            }

        } catch (error) {

            /*
                Response was not JSON.
                Keep the default error message.
            */

        }

        throw new Error(message);

    }


    return response.json();

}


/* =====================================================
   MAIN ADMISSION DATA
===================================================== */

async function loadAdmission() {

    const data =
        await apiRequest(API.admission);


    if (!data) {

        throw new Error(
            "Admission information is unavailable."
        );

    }


    renderAdmission(data);

}


/* =====================================================
   RENDER MAIN ADMISSION DATA
===================================================== */

function renderAdmission(data) {

    setText(
        elements.applicationNumber,
        data.applicationNumber
    );


    setText(
        elements.academicSession,
        data.academicSession
    );


    setText(
        elements.program,
        data.program
    );


    setText(
        elements.semester,
        data.semester
    );


    setText(
        elements.applicationStatus,
        data.status
    );


    const progress =
        normalizeProgress(data.progress);


    setText(
        elements.applicationProgress,
        progress !== null
            ? `${progress}%`
            : "—"
    );


    if (progress !== null) {

        elements.progressFill.style.width =
            `${progress}%`;

    } else {

        elements.progressFill.style.width =
            "0%";

    }


    renderApplicationDetails(data);

}


/* =====================================================
   APPLICATION DETAILS
===================================================== */

function renderApplicationDetails(data) {

    const fields = [];


    addDetail(
        fields,
        "Student Name",
        data.studentName
    );


    addDetail(
        fields,
        "Registration No.",
        data.registrationNumber
    );


    addDetail(
        fields,
        "Course",
        data.course
    );


    addDetail(
        fields,
        "College",
        data.college
    );


    addDetail(
        fields,
        "Application Date",
        formatDate(data.applicationDate)
    );


    addDetail(
        fields,
        "Admission Type",
        data.admissionType
    );


    if (fields.length === 0) {

        renderEmpty(
            elements.applicationDetails,
            "fa-file-circle-question",
            "No application information",
            "Application information is not available."
        );

        return;

    }


    elements.applicationDetails.innerHTML =
        fields.join("");

}


/* =====================================================
   DOCUMENTS
===================================================== */

async function loadDocuments() {

    try {

        const data =
            await apiRequest(API.documents);

        renderDocuments(
            extractArray(data, "documents")
        );

    } catch (error) {

        renderSectionError(
            elements.documentsContainer,
            "Unable to load documents."
        );

    }

}


/* =====================================================
   RENDER DOCUMENTS
===================================================== */

function renderDocuments(documents) {

    if (!documents.length) {

        renderEmpty(
            elements.documentsContainer,
            "fa-folder-open",
            "No documents available",
            "Document information will appear here when available."
        );

        return;

    }


    elements.documentsContainer.innerHTML =
        documents.map(
            function (document) {

                const status =
                    normalizeStatus(
                        document.status
                    );


                const statusClass =
                    getStatusClass(status);


                return `

                    <div class="verification-item">

                        <div class="verification-left">

                            <div class="document-icon">

                                <i class="${escapeAttribute(
                                    document.icon ||
                                    "fa-solid fa-file"
                                )}"></i>

                            </div>


                            <div>

                                <h3>
                                    ${escapeHTML(
                                        document.name ||
                                        "Document"
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        document.description ||
                                        ""
                                    )}
                                </p>

                            </div>

                        </div>


                        <span
                            class="status-badge ${statusClass}"
                        >

                            ${escapeHTML(
                                status ||
                                "Pending"
                            )}

                        </span>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   FEES
===================================================== */

async function loadFees() {

    try {

        const data =
            await apiRequest(API.fees);

        renderFees(data);

    } catch (error) {

        renderSectionError(
            elements.feeContainer,
            "Unable to load fee information."
        );

    }

}


/* =====================================================
   RENDER FEES
===================================================== */

function renderFees(data) {

    if (!data) {

        renderEmpty(
            elements.feeContainer,
            "fa-receipt",
            "No fee information",
            "Admission fee information is not available."
        );

        return;

    }


    const total =
        formatCurrency(
            data.totalFee
        );


    const paid =
        formatCurrency(
            data.paidFee
        );


    const pending =
        formatCurrency(
            data.pendingFee
        );


    const paymentStatus =
        data.paymentStatus || "";


    const isPaid =
        normalizeStatus(paymentStatus) === "paid";


    elements.feeContainer.innerHTML = `

        <div class="fee-summary">

            <div class="fee-icon">

                <i class="fa-solid fa-indian-rupee-sign"></i>

            </div>


            <div>

                <span>
                    Total Admission Fee
                </span>

                <strong>
                    ${escapeHTML(total)}
                </strong>

            </div>

        </div>


        <div class="fee-details">

            <div class="fee-detail">

                <span>
                    Total
                </span>

                <strong>
                    ${escapeHTML(total)}
                </strong>

            </div>


            <div class="fee-detail">

                <span>
                    Paid
                </span>

                <strong>
                    ${escapeHTML(paid)}
                </strong>

            </div>


            <div class="fee-detail">

                <span>
                    Pending
                </span>

                <strong>
                    ${escapeHTML(pending)}
                </strong>

            </div>

        </div>


        ${
            paymentStatus
                ? `
                    <div
                        class="fee-payment-status ${
                            isPaid ? "paid" : ""
                        }"
                    >

                        <i class="fa-solid fa-circle-info"></i>

                        ${escapeHTML(paymentStatus)}

                    </div>
                `
                : ""
        }

    `;

}


/* =====================================================
   STATUS
===================================================== */

async function loadStatus() {

    try {

        const data =
            await apiRequest(API.status);

        renderStatusTimeline(data);

    } catch (error) {

        /*
            Status is already represented by the main
            status card. Therefore an API failure here
            does not destroy the whole Admission page.
        */

    }

}


/* =====================================================
   STATUS TIMELINE
===================================================== */

function renderStatusTimeline(data) {

    if (!data) {

        return;

    }

    /*
        The detailed timeline can be rendered here
        when the Java API returns a timeline.

        Expected API structure:

        {
            "timeline": [
                {
                    "title": "...",
                    "status": "...",
                    "date": "..."
                }
            ]
        }

        The current page does not display a separate
        timeline section yet.
    */

}


/* =====================================================
   IMPORTANT DATES
===================================================== */

async function loadDates() {

    try {

        const data =
            await apiRequest(API.dates);

        renderDates(
            extractArray(data, "dates")
        );

    } catch (error) {

        renderSectionError(
            elements.datesContainer,
            "Unable to load admission dates."
        );

    }

}


/* =====================================================
   RENDER DATES
===================================================== */

function renderDates(dates) {

    if (!dates.length) {

        renderEmpty(
            elements.datesContainer,
            "fa-calendar",
            "No important dates",
            "Admission dates will appear here when published."
        );

        return;

    }


    elements.datesContainer.innerHTML =
        dates.map(
            function (item) {

                const date =
                    parseDate(item.date);


                const day =
                    date
                        ? date.toLocaleDateString(
                            undefined,
                            { day: "2-digit" }
                        )
                        : "—";


                const month =
                    date
                        ? date.toLocaleDateString(
                            undefined,
                            { month: "short" }
                        ).toUpperCase()
                        : "—";


                return `

                    <article class="date-card">

                        <div class="date-box">

                            <strong>
                                ${escapeHTML(day)}
                            </strong>

                            <span>
                                ${escapeHTML(month)}
                            </span>

                        </div>


                        <div class="date-content">

                            <h3>
                                ${escapeHTML(
                                    item.title ||
                                    "Admission Date"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    item.description ||
                                    ""
                                )}
                            </p>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


/* =====================================================
   NOTICES
===================================================== */

async function loadNotices() {

    try {

        const data =
            await apiRequest(API.notices);

        renderNotices(
            extractArray(data, "notices")
        );

    } catch (error) {

        renderSectionError(
            elements.noticesContainer,
            "Unable to load admission notices."
        );

    }

}


/* =====================================================
   RENDER NOTICES
===================================================== */

function renderNotices(notices) {

    if (!notices.length) {

        renderEmpty(
            elements.noticesContainer,
            "fa-bullhorn",
            "No admission notices",
            "Admission notices will appear here when published."
        );

        return;

    }


    elements.noticesContainer.innerHTML =
        notices.map(
            function (notice) {

                return `

                    <article class="notice-card">

                        <div class="notice-icon">

                            <i class="fa-solid fa-bullhorn"></i>

                        </div>


                        <div class="notice-content">

                            <h3>
                                ${escapeHTML(
                                    notice.title ||
                                    "Admission Notice"
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    notice.message ||
                                    notice.description ||
                                    ""
                                )}
                            </p>


                            <span class="notice-date">

                                ${escapeHTML(
                                    formatDate(
                                        notice.date ||
                                        notice.createdAt
                                    )
                                )}

                            </span>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


/* =====================================================
   SERVICE BUTTONS
===================================================== */

document
    .querySelectorAll(".service-card")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const service =
                        button.dataset.service;


                    handleService(service);

                }
            );

        }
    );


/* =====================================================
   SERVICE HANDLER
===================================================== */

function handleService(service) {

    switch (service) {

        case "application":

            scrollToSection(
                elements.applicationDetails
            );

            break;


        case "documents":

            scrollToSection(
                elements.documentsContainer
            );

            break;


        case "fees":

            scrollToSection(
                elements.feeContainer
            );

            break;


        case "status":

            scrollToSection(
                elements.applicationStatus
            );

            break;


        default:

            break;

    }

}


/* =====================================================
   VIEW ALL DOCUMENTS
===================================================== */

elements.viewDocumentsButton
    .addEventListener(
        "click",
        function () {

            scrollToSection(
                elements.documentsContainer
            );

        }
    );


/* =====================================================
   SCROLL
===================================================== */

function scrollToSection(element) {

    if (!element) {

        return;

    }


    element.scrollIntoView(
        {
            behavior: "smooth",
            block: "center"
        }
    );

}


/* =====================================================
   BACK BUTTON
===================================================== */

elements.backButton
    .addEventListener(
        "click",
        function () {

            if (window.history.length > 1) {

                window.history.back();

                return;

            }


            window.location.href =
                "../Dashboard/student-dashboard.html";

        }
    );


/* =====================================================
   MODAL
===================================================== */

function openModal(title, message) {

    elements.modalTitle.textContent =
        title;

    elements.modalMessage.textContent =
        message;

    elements.serviceModal.classList.remove(
        "hidden"
    );

    elements.serviceModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeModal() {

    elements.serviceModal.classList.add(
        "hidden"
    );

    elements.serviceModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


elements.modalClose
    .addEventListener(
        "click",
        closeModal
    );


elements.modalOk
    .addEventListener(
        "click",
        closeModal
    );


elements.serviceModal
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                elements.serviceModal
            ) {

                closeModal();

            }

        }
    );


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !elements.serviceModal.classList.contains(
                "hidden"
            )
        ) {

            closeModal();

        }

    }
);


/* =====================================================
   UTILITY FUNCTIONS
===================================================== */

function setText(element, value) {

    if (!element) {

        return;

    }


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        element.textContent = "—";

        return;

    }


    element.textContent =
        String(value);

}


/* =====================================================
   PROGRESS
===================================================== */

function normalizeProgress(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return null;

    }


    return Math.min(
        100,
        Math.max(
            0,
            number
        )
    );

}


/* =====================================================
   STATUS
===================================================== */

function normalizeStatus(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[_-]/g, " ");

}


function getStatusClass(status) {

    const normalized =
        normalizeStatus(status);


    if (
        normalized === "verified" ||
        normalized === "approved" ||
        normalized === "completed" ||
        normalized === "paid"
    ) {

        return "verified";

    }


    if (
        normalized === "rejected" ||
        normalized === "declined"
    ) {

        return "rejected";

    }


    return "pending";

}


/* =====================================================
   CURRENCY
===================================================== */

function formatCurrency(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "—";

    }


    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(value);

    }


    return String(value);

}


/* =====================================================
   DATE
===================================================== */

function parseDate(value) {

    if (!value) {

        return null;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


function formatDate(value) {

    const date =
        parseDate(value);


    if (!date) {

        return "Date unavailable";

    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   ARRAY EXTRACTION
===================================================== */

function extractArray(data, property) {

    if (Array.isArray(data)) {

        return data;

    }


    if (
        data &&
        Array.isArray(data[property])
    ) {

        return data[property];

    }


    return [];

}


/* =====================================================
   DETAIL BUILDER
===================================================== */

function addDetail(
    fields,
    label,
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return;

    }


    fields.push(`

        <div class="detail-row">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(
                    formatDetailValue(value)
                )}
            </strong>

        </div>

    `);

}


function formatDetailValue(value) {

    if (
        typeof value === "object"
    ) {

        return JSON.stringify(value);

    }


    return String(value);

}


/* =====================================================
   EMPTY STATE
===================================================== */

function renderEmpty(
    container,
    icon,
    title,
    message
) {

    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="state-icon">

                <i class="fa-solid ${escapeAttribute(icon)}"></i>

            </div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =====================================================
   SECTION ERROR
===================================================== */

function renderSectionError(
    container,
    message
) {

    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="state-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h3>
                Unable to load information
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =====================================================
   PAGE STATE
===================================================== */

function showLoading() {

    elements.pageLoading.classList.remove(
        "hidden"
    );

    elements.pageError.classList.add(
        "hidden"
    );

    elements.admissionContent.classList.add(
        "hidden"
    );

}


function showContent() {

    elements.pageLoading.classList.add(
        "hidden"
    );

    elements.pageError.classList.add(
        "hidden"
    );

    elements.admissionContent.classList.remove(
        "hidden"
    );

}


function showPageError(message) {

    elements.pageLoading.classList.add(
        "hidden"
    );

    elements.admissionContent.classList.add(
        "hidden"
    );

    elements.pageError.classList.remove(
        "hidden"
    );

    elements.pageErrorMessage.textContent =
        message ||
        "Unable to load admission information.";

}


/* =====================================================
   LOAD ALL ADMISSION DATA
===================================================== */

async function loadPage() {

    showLoading();


    try {

        /*
            Main admission information is required
            to display the page.

            The currently authenticated student is
            determined by the backend/session.
        */

        await loadAdmission();


        /*
            These sections are independent.
            One failure should not prevent the
            other sections from loading.
        */

        await Promise.allSettled(
            [
                loadDocuments(),
                loadFees(),
                loadStatus(),
                loadDates(),
                loadNotices()
            ]
        );


        showContent();

    } catch (error) {

        console.error(
            "Admission loading error:",
            error
        );


        showPageError(
            error.message ||
            "Unable to load admission information."
        );

    }

}


/* =====================================================
   RETRY
===================================================== */

elements.retryButton
    .addEventListener(
        "click",
        loadPage
    );


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPage();

    }
);