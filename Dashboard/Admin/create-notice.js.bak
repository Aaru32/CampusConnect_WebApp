/* =========================================================
CAMPUSCONNECT
ADMIN CREATE NOTICE
Dynamic / API-Ready
========================================================= */

/* =========================================================
CONFIGURATION
========================================================= */

const CONFIG = {

/*
 * Keep empty until Java + MySQL backend is connected.
 *
 * Example later:
 * API_BASE_URL: "http://localhost:8080/api"
 */

API_BASE_URL: "",

ENDPOINTS: {
    createNotice: "/admin/notices",
    draftNotice: "/admin/notices/drafts",
    filters: "/admin/notices/filters"
}

};

/* =========================================================
STATE
========================================================= */

const state = {

selectedFile: null,

publicationMode: "now"

};

/* =========================================================
DOM
========================================================= */

const elements = {

noticeForm:
    document.getElementById("noticeForm"),

backButton:
    document.getElementById("backButton"),

cancelButton:
    document.getElementById("cancelButton"),

noticeTitle:
    document.getElementById("noticeTitle"),

noticeType:
    document.getElementById("noticeType"),

referenceNumber:
    document.getElementById("referenceNumber"),

noticeDate:
    document.getElementById("noticeDate"),

noticeContent:
    document.getElementById("noticeContent"),

contentCounter:
    document.getElementById("contentCounter"),

audience:
    document.getElementById("audience"),

studentTargeting:
    document.getElementById("studentTargeting"),

studentDepartment:
    document.getElementById("studentDepartment"),

studentSemester:
    document.getElementById("studentSemester"),

studentSession:
    document.getElementById("studentSession"),

scheduledDateField:
    document.getElementById("scheduledDateField"),

scheduledTimeField:
    document.getElementById("scheduledTimeField"),

publishDate:
    document.getElementById("publishDate"),

publishTime:
    document.getElementById("publishTime"),

expiryDate:
    document.getElementById("expiryDate"),

isPinned:
    document.getElementById("isPinned"),

noticeAttachment:
    document.getElementById("noticeAttachment"),

selectedFile:
    document.getElementById("selectedFile"),

fileName:
    document.getElementById("fileName"),

fileSize:
    document.getElementById("fileSize"),

removeFile:
    document.getElementById("removeFile"),

priority:
    document.getElementById("priority"),

requiresAcknowledgement:
    document.getElementById("requiresAcknowledgement"),

allowComments:
    document.getElementById("allowComments"),

formMessage:
    document.getElementById("formMessage"),

previewButton:
    document.getElementById("previewButton"),

draftButton:
    document.getElementById("draftButton"),

publishButton:
    document.getElementById("publishButton"),

previewModal:
    document.getElementById("previewModal"),

closePreview:
    document.getElementById("closePreview"),

previewTitle:
    document.getElementById("previewTitle"),

previewType:
    document.getElementById("previewType"),

previewDate:
    document.getElementById("previewDate"),

previewPriority:
    document.getElementById("previewPriority"),

previewContent:
    document.getElementById("previewContent"),

previewAttachment:
    document.getElementById("previewAttachment"),

previewFileName:
    document.getElementById("previewFileName")

};

/* =========================================================
INITIALIZATION
========================================================= */

document.addEventListener(
"DOMContentLoaded",
initialize
);

async function initialize() {

initializeEvents();

setDefaultNoticeDate();

await loadNoticeFilters();

updateStudentTargeting();

updatePublicationFields();

}

/* =========================================================
EVENTS
========================================================= */

function initializeEvents() {

elements.backButton.addEventListener(
    "click",
    goBack
);


elements.cancelButton.addEventListener(
    "click",
    goBack
);


elements.noticeContent.addEventListener(
    "input",
    updateContentCounter
);


elements.audience.addEventListener(
    "change",
    updateStudentTargeting
);


document
    .querySelectorAll(
        'input[name="publicationMode"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            updatePublicationFields
        );

    });


elements.noticeAttachment.addEventListener(
    "change",
    handleFileSelection
);


elements.removeFile.addEventListener(
    "click",
    removeFile
);


elements.previewButton.addEventListener(
    "click",
    openPreview
);


elements.closePreview.addEventListener(
    "click",
    closePreview
);


elements.previewModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            elements.previewModal
        ) {

            closePreview();

        }

    }
);


elements.draftButton.addEventListener(
    "click",
    saveDraft
);


elements.noticeForm.addEventListener(
    "submit",
    publishNotice
);


elements.expiryDate.addEventListener(
    "change",
    validateDateRelationship
);


elements.publishDate.addEventListener(
    "change",
    validateDateRelationship
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


window.location.href =
    "admin-dashboard.html";

}

/* =========================================================
DEFAULT DATE
========================================================= */

function setDefaultNoticeDate() {

const today =
    new Date();


elements.noticeDate.value =
    formatDateForInput(
        today
    );

}

function formatDateForInput(
date
) {

const year =
    date.getFullYear();


const month =
    String(
        date.getMonth() + 1
    ).padStart(
        2,
        "0"
    );


const day =
    String(
        date.getDate()
    ).padStart(
        2,
        "0"
    );


return `${year}-${month}-${day}`;

}

/* =========================================================
NOTICE FILTERS
========================================================= */

async function loadNoticeFilters() {

try {

    const data =
        await request(
            CONFIG.ENDPOINTS.filters
        );


    if (!data) {

        return;

    }


    const filters =
        data.filters ||
        data.filterOptions ||
        data;


    populateSelect(
        elements.noticeType,
        filters.noticeTypes ||
        filters.types,
        "Select notice type"
    );


    populateSelect(
        elements.studentDepartment,
        filters.departments ||
        filters.branches,
        "All Departments / Branches"
    );


    populateSelect(
        elements.studentSession,
        filters.sessions,
        "All Sessions"
    );


} catch (error) {

    /*
     * No fake filter data is inserted.
     *
     * The backend can provide the values later.
     */

    console.info(
        "Notice filter API is not connected yet.",
        error.message
    );

}

}

/* =========================================================
SELECT HELPER
========================================================= */

function populateSelect(
select,
values,
defaultText
) {

select.innerHTML = "";


const defaultOption =
    document.createElement(
        "option"
    );


defaultOption.value = "";

defaultOption.textContent =
    defaultText;


select.appendChild(
    defaultOption
);


if (!Array.isArray(values)) {

    return;

}


[...new Set(values)]
    .filter(
        value =>
            value !== null &&
            value !== undefined
    )
    .sort(
        (a, b) =>
            String(a).localeCompare(
                String(b)
            )
    )
    .forEach(value => {

        const option =
            document.createElement(
                "option"
            );


        option.value = value;

        option.textContent = value;


        select.appendChild(
            option
        );

    });

}

/* =========================================================
STUDENT TARGETING
========================================================= */

function updateStudentTargeting() {

const audience =
    elements.audience.value;


const includesStudents =
    [
        "everyone",
        "students",
        "students_faculty",
        "students_admins",
        "students_faculty_admins"
    ].includes(
        audience
    );


elements.studentTargeting.hidden =
    !includesStudents;

}

/* =========================================================
PUBLICATION MODE
========================================================= */

function updatePublicationFields() {

const selected =
    document.querySelector(
        'input[name="publicationMode"]:checked'
    );


state.publicationMode =
    selected
        ? selected.value
        : "now";


const scheduled =
    state.publicationMode ===
    "schedule";


elements.scheduledDateField.hidden =
    !scheduled;


elements.scheduledTimeField.hidden =
    !scheduled;


elements.publishDate.required =
    scheduled;


elements.publishTime.required =
    scheduled;

}

/* =========================================================
CONTENT COUNTER
========================================================= */

function updateContentCounter() {

const length =
    elements.noticeContent.value.length;


elements.contentCounter.textContent =
    `${length} / 10000`;

}

/* =========================================================
FILE
========================================================= */

function handleFileSelection() {

const file =
    elements.noticeAttachment.files[0];


if (!file) {

    removeFile();

    return;

}


state.selectedFile =
    file;


elements.fileName.textContent =
    file.name;


elements.fileSize.textContent =
    formatFileSize(
        file.size
    );


elements.selectedFile.hidden =
    false;

}

function removeFile() {

state.selectedFile =
    null;


elements.noticeAttachment.value =
    "";


elements.selectedFile.hidden =
    true;

}

function formatFileSize(
bytes
) {

if (bytes < 1024) {

    return `${bytes} B`;

}


if (bytes < 1024 * 1024) {

    return `${(
        bytes / 1024
    ).toFixed(1)} KB`;

}


return `${(
    bytes /
    (1024 * 1024)
).toFixed(1)} MB`;

}

/* =========================================================
DATE VALIDATION
========================================================= */

function validateDateRelationship() {

if (
    !elements.expiryDate.value ||
    !elements.noticeDate.value
) {

    return true;

}


if (
    elements.expiryDate.value <
    elements.noticeDate.value
) {

    showMessage(
        "Expiry date cannot be earlier than the notice date."
    );

    return false;

}


if (
    state.publicationMode === "schedule" &&
    elements.publishDate.value &&
    elements.expiryDate.value <
    elements.publishDate.value
) {

    showMessage(
        "Expiry date cannot be earlier than the scheduled publish date."
    );

    return false;

}


hideMessage();

return true;

}

/* =========================================================
COLLECT FORM DATA
========================================================= */

function collectNoticeData() {

const audience =
    elements.audience.value;


const data = {

    title:
        elements.noticeTitle.value.trim(),

    type:
        elements.noticeType.value,

    referenceNumber:
        elements.referenceNumber.value.trim(),

    noticeDate:
        elements.noticeDate.value,

    content:
        elements.noticeContent.value.trim(),

    audience: {
        target:
            audience,

        students:
            includesAudience(
                audience,
                "students"
            ),

        faculty:
            includesAudience(
                audience,
                "faculty"
            ),

        admins:
            includesAudience(
                audience,
                "admins"
            )
    },

    studentTargeting: {

        department:
            elements.studentDepartment.value,

        semester:
            elements.studentSemester.value,

        session:
            elements.studentSession.value

    },

    publishing: {

        mode:
            state.publicationMode,

        publishDate:
            elements.publishDate.value,

        publishTime:
            elements.publishTime.value,

        expiryDate:
            elements.expiryDate.value,

        pinned:
            elements.isPinned.checked

    },

    priority:
        elements.priority.value,

    requiresAcknowledgement:
        elements.requiresAcknowledgement.checked,

    allowComments:
        elements.allowComments.checked

};


return data;

}

/* =========================================================
AUDIENCE HELPER
========================================================= */

function includesAudience(
audience,
target
) {

if (audience === "everyone") {

    return true;

}


const mapping = {

    students: [
        "students",
        "students_faculty",
        "students_admins",
        "students_faculty_admins"
    ],

    faculty: [
        "faculty",
        "students_faculty",
        "faculty_admins",
        "students_faculty_admins"
    ],

    admins: [
        "admins",
        "students_admins",
        "faculty_admins",
        "students_faculty_admins"
    ]

};


return (
    mapping[target] || []
).includes(
    audience
);

}

/* =========================================================
VALIDATION
========================================================= */

function validateForm() {

hideMessage();


if (
    !elements.noticeTitle.value.trim()
) {

    showMessage(
        "Please enter a notice title."
    );

    elements.noticeTitle.focus();

    return false;

}


if (
    !elements.noticeType.value
) {

    showMessage(
        "Please select a notice type."
    );

    elements.noticeType.focus();

    return false;

}


if (
    !elements.noticeDate.value
) {

    showMessage(
        "Please select the notice date."
    );

    elements.noticeDate.focus();

    return false;

}


if (
    !elements.noticeContent.value.trim()
) {

    showMessage(
        "Please enter the notice content."
    );

    elements.noticeContent.focus();

    return false;

}


if (
    !elements.audience.value
) {

    showMessage(
        "Please select the notice audience."
    );

    elements.audience.focus();

    return false;

}


if (
    state.publicationMode ===
    "schedule"
) {

    if (
        !elements.publishDate.value
    ) {

        showMessage(
            "Please select a publish date."
        );

        elements.publishDate.focus();

        return false;

    }


    if (
        !elements.publishTime.value
    ) {

        showMessage(
            "Please select a publish time."
        );

        elements.publishTime.focus();

        return false;

    }

}


if (
    !validateDateRelationship()
) {

    return false;

}


return true;

}

/* =========================================================
PUBLISH
========================================================= */

async function publishNotice(
event
) {

event.preventDefault();


if (!validateForm()) {

    return;

}


const data =
    collectNoticeData();


setPublishingState(
    true
);


try {

    const response =
        await submitNotice(
            CONFIG.ENDPOINTS.createNotice,
            data
        );


    console.log(
        "Notice created successfully:",
        response
    );


    /*
     * Backend response can later return:
     *
     * {
     *   id: 123,
     *   noticeId: 123
     * }
     *
     * The dashboard Recent Notices section
     * can then retrieve the same database record.
     */

    showMessage(
        "Notice submitted successfully."
    );


} catch (error) {

    console.error(
        "Unable to publish notice:",
        error
    );


    showMessage(
        "Notice could not be published because the Admin Notice API is not connected."
    );


} finally {

    setPublishingState(
        false
    );

}

}

/* =========================================================
SAVE DRAFT
========================================================= */

async function saveDraft() {

if (!elements.noticeTitle.value.trim()) {

    showMessage(
        "Enter a notice title before saving the draft."
    );

    elements.noticeTitle.focus();

    return;

}


const data =
    collectNoticeData();


try {

    await submitNotice(
        CONFIG.ENDPOINTS.draftNotice,
        data
    );


    showMessage(
        "Draft submitted successfully."
    );


} catch (error) {

    console.error(
        "Unable to save notice draft:",
        error
    );


    showMessage(
        "Draft could not be saved because the Admin Notice API is not connected."
    );

}

}

/* =========================================================
API
========================================================= */

async function request(
endpoint
) {

if (!CONFIG.API_BASE_URL) {

    throw new Error(
        "API_BASE_URL is not configured."
    );

}


const response =
    await fetch(
        `${CONFIG.API_BASE_URL}${endpoint}`,
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
        `Request failed with status ${response.status}`
    );

}


return response.json();

}

async function submitNotice(
endpoint,
data
) {

if (!CONFIG.API_BASE_URL) {

    throw new Error(
        "API_BASE_URL is not configured."
    );

}


const formData =
    new FormData();


formData.append(
    "notice",
    JSON.stringify(data)
);


if (state.selectedFile) {

    formData.append(
        "attachment",
        state.selectedFile
    );

}


const response =
    await fetch(
        `${CONFIG.API_BASE_URL}${endpoint}`,
        {
            method: "POST",
            body: formData
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
PREVIEW
========================================================= */

function openPreview() {

if (!validateForm()) {

    return;

}


const data =
    collectNoticeData();


elements.previewTitle.textContent =
    data.title;


elements.previewType.textContent =
    data.type ||
    "Notice";


elements.previewDate.textContent =
    data.noticeDate ||
    "—";


elements.previewPriority.textContent =
    capitalize(
        data.priority
    );


elements.previewContent.textContent =
    data.content;


if (state.selectedFile) {

    elements.previewAttachment.hidden =
        false;


    elements.previewFileName.textContent =
        state.selectedFile.name;

} else {

    elements.previewAttachment.hidden =
        true;

}


elements.previewModal.hidden =
    false;


document.body.style.overflow =
    "hidden";

}

function closePreview() {

elements.previewModal.hidden =
    true;


document.body.style.overflow =
    "";

}

function capitalize(
value
) {

if (!value) {

    return "";

}


return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
);

}

/* =========================================================
FORM MESSAGE
========================================================= */

function showMessage(
message
) {

elements.formMessage.textContent =
    message;


elements.formMessage.hidden =
    false;


elements.formMessage.scrollIntoView({
    behavior: "smooth",
    block: "center"
});

}

function hideMessage() {

elements.formMessage.hidden =
    true;


elements.formMessage.textContent =
    "";

}

/* =========================================================
PUBLISHING STATE
========================================================= */

function setPublishingState(
loading
) {

elements.publishButton.disabled =
    loading;


elements.draftButton.disabled =
    loading;


if (loading) {

    elements.publishButton.innerHTML =
        '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Publishing...';

} else {

    elements.publishButton.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> Publish Notice';

}

}