/* =====================================================
   CAMPUSCONNECT
   CERTIFICATE MODULE
===================================================== */


/* =====================================================
   APPLICATION STATE
   -----------------------------------------------------
   These arrays are intentionally empty.

   Permanent certificate records will eventually
   come from the Java backend / MySQL database.
===================================================== */

let studentCertificates = [];

let collegeCertificates = [];


/* =====================================================
   CURRENT STATE
===================================================== */

let activeSection = "student";

let activeStudentFilter = "all";

let activeCollegeFilter = "all";

let studentSearchTerm = "";

let collegeSearchTerm = "";

let selectedCertificate = null;

let editingCertificateId = null;

let pendingDeleteId = null;

let selectedCertificateFile = null;


/* =====================================================
   DOM REFERENCES
===================================================== */

const studentSection =
    document.getElementById("studentSection");

const collegeSection =
    document.getElementById("collegeSection");

const sectionTabs =
    document.querySelectorAll(".section-tab");


const studentCertificateList =
    document.getElementById(
        "studentCertificateList"
    );

const collegeCertificateList =
    document.getElementById(
        "collegeCertificateList"
    );


const studentEmptyState =
    document.getElementById(
        "studentEmptyState"
    );

const collegeEmptyState =
    document.getElementById(
        "collegeEmptyState"
    );


const studentSearch =
    document.getElementById(
        "studentSearch"
    );

const collegeSearch =
    document.getElementById(
        "collegeSearch"
    );


const certificateFormModal =
    document.getElementById(
        "certificateFormModal"
    );

const certificateDetailsModal =
    document.getElementById(
        "certificateDetailsModal"
    );

const deleteModal =
    document.getElementById(
        "deleteModal"
    );


const certificateForm =
    document.getElementById(
        "certificateForm"
    );

const certificateFile =
    document.getElementById(
        "certificateFile"
    );


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeCertificateModule
);


function initializeCertificateModule() {

    setupEventListeners();

    renderStudentCertificates();

    renderCollegeCertificates();

    updateSummary();

    updateStudentFilters();

    updateCollegeFilters();
}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function setupEventListeners() {


    /* BACK BUTTON */

    document
        .getElementById("backBtn")
        .addEventListener(
            "click",
            goBack
        );


    /* SECTION TABS */

    sectionTabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    switchSection(
                        this.dataset.section
                    );
                }
            );
        }
    );


    /* ADD CERTIFICATE */

    document
        .getElementById(
            "addCertificateBtn"
        )
        .addEventListener(
            "click",
            openAddCertificateModal
        );


    document
        .getElementById(
            "emptyAddBtn"
        )
        .addEventListener(
            "click",
            openAddCertificateModal
        );


    /* SEARCH */

    studentSearch.addEventListener(
        "input",
        function () {

            studentSearchTerm =
                this.value
                    .trim()
                    .toLowerCase();

            renderStudentCertificates();
        }
    );


    collegeSearch.addEventListener(
        "input",
        function () {

            collegeSearchTerm =
                this.value
                    .trim()
                    .toLowerCase();

            renderCollegeCertificates();
        }
    );


    /* FORM */

    certificateForm.addEventListener(
        "submit",
        handleCertificateFormSubmit
    );


    certificateFile.addEventListener(
        "change",
        handleCertificateFile
    );


    /* FORM MODAL */

    document
        .getElementById(
            "formModalClose"
        )
        .addEventListener(
            "click",
            closeCertificateForm
        );


    document
        .getElementById(
            "cancelFormBtn"
        )
        .addEventListener(
            "click",
            closeCertificateForm
        );


    /* DETAILS MODAL */

    document
        .getElementById(
            "detailsModalClose"
        )
        .addEventListener(
            "click",
            closeCertificateDetails
        );


    /* EDIT */

    document
        .getElementById(
            "editCertificateBtn"
        )
        .addEventListener(
            "click",
            editSelectedCertificate
        );


    /* DELETE */

    document
        .getElementById(
            "deleteCertificateBtn"
        )
        .addEventListener(
            "click",
            openDeleteConfirmation
        );


    /* DOWNLOAD */

    document
        .getElementById(
            "downloadCertificateBtn"
        )
        .addEventListener(
            "click",
            downloadSelectedCertificate
        );


    document
        .getElementById(
            "collegeDownloadBtn"
        )
        .addEventListener(
            "click",
            downloadSelectedCertificate
        );


    /* DELETE CONFIRMATION */

    document
        .getElementById(
            "cancelDeleteBtn"
        )
        .addEventListener(
            "click",
            closeDeleteConfirmation
        );


    document
        .getElementById(
            "confirmDeleteBtn"
        )
        .addEventListener(
            "click",
            confirmDeleteCertificate
        );


    /* CLOSE MODALS BY BACKDROP */

    [certificateFormModal,
     certificateDetailsModal,
     deleteModal]
        .forEach(
            function (modalElement) {

                modalElement.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target ===
                            modalElement
                        ) {

                            closeModalByElement(
                                modalElement
                            );
                        }
                    }
                );
            }
        );


    /* ESCAPE */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeAllModals();
            }
        }
    );
}


/* =====================================================
   SECTION SWITCHING
===================================================== */

function switchSection(section) {

    activeSection = section;


    sectionTabs.forEach(
        function (tab) {

            tab.classList.toggle(
                "active",
                tab.dataset.section === section
            );
        }
    );


    if (section === "student") {

        studentSection.classList.remove(
            "hidden"
        );

        collegeSection.classList.add(
            "hidden"
        );

    } else {

        studentSection.classList.add(
            "hidden"
        );

        collegeSection.classList.remove(
            "hidden"
        );
    }
}


/* =====================================================
   STUDENT CERTIFICATES
===================================================== */

function renderStudentCertificates() {

    const filtered =
        filterCertificates(
            studentCertificates,
            activeStudentFilter,
            studentSearchTerm
        );


    studentCertificateList.innerHTML =
        "";


    if (filtered.length === 0) {

        studentEmptyState.style.display =
            "block";

        return;
    }


    studentEmptyState.style.display =
        "none";


    filtered.forEach(
        function (certificate) {

            studentCertificateList.appendChild(
                createCertificateCard(
                    certificate,
                    "student"
                )
            );
        }
    );
}


/* =====================================================
   COLLEGE CERTIFICATES
===================================================== */

function renderCollegeCertificates() {

    const filtered =
        filterCertificates(
            collegeCertificates,
            activeCollegeFilter,
            collegeSearchTerm
        );


    collegeCertificateList.innerHTML =
        "";


    if (filtered.length === 0) {

        collegeEmptyState.style.display =
            "block";

        return;
    }


    collegeEmptyState.style.display =
        "none";


    filtered.forEach(
        function (certificate) {

            collegeCertificateList.appendChild(
                createCertificateCard(
                    certificate,
                    "college"
                )
            );
        }
    );
}


/* =====================================================
   FILTER
===================================================== */

function filterCertificates(
    certificates,
    filter,
    searchTerm
) {

    return certificates.filter(
        function (certificate) {

            const categoryMatches =
                filter === "all" ||
                certificate.category === filter;


            if (!categoryMatches) {

                return false;
            }


            if (!searchTerm) {

                return true;
            }


            const searchableText = [

                certificate.title,

                certificate.issuer,

                certificate.category,

                certificate.certificateId,

                certificate.description

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            return searchableText.includes(
                searchTerm
            );
        }
    );
}


/* =====================================================
   CREATE CERTIFICATE CARD
===================================================== */

function createCertificateCard(
    certificate,
    source
) {

    const card =
        document.createElement("article");

    card.className =
        "certificate-card";


    const sourceLabel =
        source === "student"
            ? "Student Uploaded"
            : "College Issued";


    card.innerHTML = `

        <div class="certificate-card-top">

            <div class="certificate-card-icon">

                <i class="fa-solid fa-award"></i>

            </div>


            <div class="certificate-card-content">

                <span class="source-badge">
                    ${sourceLabel}
                </span>

                <h3 class="certificate-card-title">
                    ${escapeHTML(
                        certificate.title ||
                        "Certificate"
                    )}
                </h3>

                <p class="certificate-card-issuer">
                    ${escapeHTML(
                        certificate.issuer ||
                        "Issuing organization"
                    )}
                </p>

            </div>

        </div>


        <div class="certificate-card-bottom">

            <div class="card-meta">

                <span>Category</span>

                <strong>
                    ${escapeHTML(
                        certificate.category ||
                        "Other"
                    )}
                </strong>

            </div>


            <div class="card-meta">

                <span>Issue Date</span>

                <strong>
                    ${formatDate(
                        certificate.issueDate
                    )}
                </strong>

            </div>


            <button
                type="button"
                class="view-card-btn"
                aria-label="View certificate">

                <i class="fa-solid fa-eye"></i>

            </button>

        </div>
    `;


    card.addEventListener(
        "click",
        function () {

            openCertificateDetails(
                certificate,
                source
            );
        }
    );


    return card;
}


/* =====================================================
   FILTER BUTTONS
===================================================== */

function updateStudentFilters() {

    createFilterButtons(
        document.getElementById(
            "studentFilters"
        ),
        studentCertificates,
        "student"
    );
}


function updateCollegeFilters() {

    createFilterButtons(
        document.getElementById(
            "collegeFilters"
        ),
        collegeCertificates,
        "college"
    );
}


function createFilterButtons(
    container,
    certificates,
    source
) {

    const existingFilter =
        source === "student"
            ? activeStudentFilter
            : activeCollegeFilter;


    const categories =
        [
            ...new Set(
                certificates
                    .map(
                        certificate =>
                            certificate.category
                    )
                    .filter(Boolean)
            )
        ];


    container.innerHTML = "";


    const allButton =
        document.createElement("button");

    allButton.type = "button";

    allButton.className =
        "filter-btn";

    allButton.textContent =
        "All";


    if (existingFilter === "all") {

        allButton.classList.add(
            "active"
        );
    }


    allButton.addEventListener(
        "click",
        function () {

            setActiveFilter(
                source,
                "all"
            );
        }
    );


    container.appendChild(
        allButton
    );


    categories.forEach(
        function (category) {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "filter-btn";

            button.textContent =
                category;


            if (
                existingFilter === category
            ) {

                button.classList.add(
                    "active"
                );
            }


            button.addEventListener(
                "click",
                function () {

                    setActiveFilter(
                        source,
                        category
                    );
                }
            );


            container.appendChild(
                button
            );
        }
    );
}


/* =====================================================
   SET ACTIVE FILTER
===================================================== */

function setActiveFilter(
    source,
    filter
) {

    if (source === "student") {

        activeStudentFilter =
            filter;

        updateStudentFilters();

        renderStudentCertificates();

    } else {

        activeCollegeFilter =
            filter;

        updateCollegeFilters();

        renderCollegeCertificates();
    }
}


/* =====================================================
   ADD CERTIFICATE
===================================================== */

function openAddCertificateModal() {

    editingCertificateId =
        null;


    document.getElementById(
        "formModalTitle"
    ).textContent =
        "Add Certificate";


    document.getElementById(
        "certificateForm"
    ).reset();


    selectedCertificateFile =
        null;


    document.getElementById(
        "selectedCertificateFile"
    ).classList.add(
        "hidden"
    );


    openModal(
        certificateFormModal
    );
}


/* =====================================================
   FILE SELECTION
===================================================== */

function handleCertificateFile(event) {

    const file =
        event.target.files[0];


    if (!file) {

        selectedCertificateFile =
            null;

        document.getElementById(
            "selectedCertificateFile"
        ).classList.add(
            "hidden"
        );

        return;
    }


    const allowedTypes = [

        "application/pdf",

        "image/jpeg",

        "image/png"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Please select a PDF, JPG, JPEG or PNG file."
        );


        event.target.value =
            "";


        selectedCertificateFile =
            null;

        return;
    }


    selectedCertificateFile =
        file;


    document.getElementById(
        "selectedCertificateFileName"
    ).textContent =
        file.name;


    document.getElementById(
        "selectedCertificateFile"
    ).classList.remove(
        "hidden"
    );
}


/* =====================================================
   FORM SUBMISSION
===================================================== */

function handleCertificateFormSubmit(
    event
) {

    event.preventDefault();


    const title =
        document.getElementById(
            "certificateName"
        ).value.trim();


    const issuer =
        document.getElementById(
            "issuingOrganization"
        ).value.trim();


    const category =
        document.getElementById(
            "certificateCategory"
        ).value;


    const issueDate =
        document.getElementById(
            "issueDate"
        ).value;


    const certificateId =
        document.getElementById(
            "certificateId"
        ).value.trim();


    const description =
        document.getElementById(
            "certificateDescription"
        ).value.trim();


    if (
        !title ||
        !issuer ||
        !category ||
        !issueDate
    ) {

        alert(
            "Please fill in all required fields."
        );

        return;
    }


    if (
        !editingCertificateId &&
        !selectedCertificateFile
    ) {

        alert(
            "Please select your certificate file."
        );

        return;
    }


    /*
       This object is currently a frontend
       representation.

       Later the Java backend will receive
       the same information using FormData.
    */

    if (editingCertificateId) {

        updateStudentCertificate(
            editingCertificateId,
            {
                title,
                issuer,
                category,
                issueDate,
                certificateId,
                description
            }
        );

    } else {

        const newCertificate = {

            id:
                generateId(),

            source:
                "STUDENT",

            title,

            issuer,

            category,

            issueDate,

            certificateId,

            description,

            file:
                selectedCertificateFile,

            fileName:
                selectedCertificateFile
                    ? selectedCertificateFile.name
                    : "",

            createdAt:
                new Date().toISOString()
        };


        studentCertificates.push(
            newCertificate
        );
    }


    closeCertificateForm();

    updateStudentFilters();

    renderStudentCertificates();

    updateSummary();
}


/* =====================================================
   UPDATE STUDENT CERTIFICATE
===================================================== */

function updateStudentCertificate(
    id,
    updatedData
) {

    const certificate =
        studentCertificates.find(
            item =>
                item.id === id
        );


    if (!certificate) {

        return;
    }


    Object.assign(
        certificate,
        updatedData
    );


    if (selectedCertificateFile) {

        certificate.file =
            selectedCertificateFile;

        certificate.fileName =
            selectedCertificateFile.name;
    }
}


/* =====================================================
   OPEN DETAILS
===================================================== */

function openCertificateDetails(
    certificate,
    source
) {

    selectedCertificate =
        certificate;


    document.getElementById(
        "detailsTitle"
    ).textContent =
        certificate.title ||
        "Certificate";


    document.getElementById(
        "detailsIssuer"
    ).textContent =
        certificate.issuer ||
        "—";


    document.getElementById(
        "detailsCategory"
    ).textContent =
        certificate.category ||
        "—";


    document.getElementById(
        "detailsDate"
    ).textContent =
        formatDate(
            certificate.issueDate
        );


    document.getElementById(
        "detailsCertificateId"
    ).textContent =
        certificate.certificateId ||
        "Not provided";


    document.getElementById(
        "detailsDescription"
    ).textContent =
        certificate.description ||
        "No description provided.";


    const sourceElement =
        document.getElementById(
            "detailsSource"
        );


    const studentActions =
        document.getElementById(
            "studentCertificateActions"
        );


    const collegeActions =
        document.getElementById(
            "collegeCertificateActions"
        );


    const collegeIssuerDetail =
        document.getElementById(
            "collegeIssuerDetail"
        );


    if (source === "student") {

        sourceElement.textContent =
            "Student Uploaded";


        studentActions.classList.remove(
            "hidden"
        );


        collegeActions.classList.add(
            "hidden"
        );


        collegeIssuerDetail.classList.add(
            "hidden"
        );

    } else {

        sourceElement.textContent =
            "College Issued";


        studentActions.classList.add(
            "hidden"
        );


        collegeActions.classList.remove(
            "hidden"
        );


        collegeIssuerDetail.classList.remove(
            "hidden"
        );


        document.getElementById(
            "detailsIssuedBy"
        ).textContent =
            certificate.issuedBy ||
            "College";
    }


    renderCertificatePreview(
        certificate
    );


    openModal(
        certificateDetailsModal
    );
}


/* =====================================================
   PREVIEW
===================================================== */

function renderCertificatePreview(
    certificate
) {

    const preview =
        document.getElementById(
            "certificatePreview"
        );


    preview.innerHTML = "";


    if (!certificate.file) {

        preview.innerHTML = `

            <div class="preview-placeholder">

                <i class="fa-solid fa-file-circle-question"></i>

                <p>
                    Certificate preview will be
                    available after the file is connected
                    to the backend.
                </p>

            </div>
        `;

        return;
    }


    const file =
        certificate.file;


    const objectURL =
        URL.createObjectURL(file);


    if (
        file.type ===
        "application/pdf"
    ) {

        const iframe =
            document.createElement(
                "iframe"
            );

        iframe.src =
            objectURL;

        preview.appendChild(
            iframe
        );

    } else {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            objectURL;

        image.alt =
            certificate.title ||
            "Certificate";


        preview.appendChild(
            image
        );
    }
}


/* =====================================================
   EDIT
===================================================== */

function editSelectedCertificate() {

    if (!selectedCertificate) {

        return;
    }


    editingCertificateId =
        selectedCertificate.id;


    document.getElementById(
        "formModalTitle"
    ).textContent =
        "Edit Certificate";


    document.getElementById(
        "certificateName"
    ).value =
        selectedCertificate.title || "";


    document.getElementById(
        "issuingOrganization"
    ).value =
        selectedCertificate.issuer || "";


    document.getElementById(
        "certificateCategory"
    ).value =
        selectedCertificate.category || "";


    document.getElementById(
        "issueDate"
    ).value =
        selectedCertificate.issueDate || "";


    document.getElementById(
        "certificateId"
    ).value =
        selectedCertificate.certificateId || "";


    document.getElementById(
        "certificateDescription"
    ).value =
        selectedCertificate.description || "";


    selectedCertificateFile =
        null;


    certificateFile.value =
        "";


    if (
        selectedCertificate.fileName
    ) {

        document.getElementById(
            "selectedCertificateFileName"
        ).textContent =
            selectedCertificate.fileName;


        document.getElementById(
            "selectedCertificateFile"
        ).classList.remove(
            "hidden"
        );
    }


    closeCertificateDetails();

    openModal(
        certificateFormModal
    );
}


/* =====================================================
   DELETE CONFIRMATION
===================================================== */

function openDeleteConfirmation() {

    if (!selectedCertificate) {

        return;
    }


    pendingDeleteId =
        selectedCertificate.id;


    openModal(
        deleteModal
    );
}


function confirmDeleteCertificate() {

    if (!pendingDeleteId) {

        return;
    }


    studentCertificates =
        studentCertificates.filter(
            certificate =>
                certificate.id !==
                pendingDeleteId
        );


    pendingDeleteId =
        null;


    selectedCertificate =
        null;


    closeDeleteConfirmation();

    closeCertificateDetails();

    updateStudentFilters();

    renderStudentCertificates();

    updateSummary();
}


function closeDeleteConfirmation() {

    closeModalByElement(
        deleteModal
    );
}


/* =====================================================
   DOWNLOAD
===================================================== */

function downloadSelectedCertificate() {

    if (
        !selectedCertificate ||
        !selectedCertificate.file
    ) {

        alert(
            "The certificate file is not currently available for download."
        );

        return;
    }


    const url =
        URL.createObjectURL(
            selectedCertificate.file
        );


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        selectedCertificate.fileName ||
        "certificate";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}


/* =====================================================
   FORM CLOSE
===================================================== */

function closeCertificateForm() {

    closeModalByElement(
        certificateFormModal
    );


    editingCertificateId =
        null;


    selectedCertificateFile =
        null;
}


/* =====================================================
   DETAILS CLOSE
===================================================== */

function closeCertificateDetails() {

    closeModalByElement(
        certificateDetailsModal
    );


    selectedCertificate =
        null;
}


/* =====================================================
   MODAL HELPERS
===================================================== */

function openModal(
    modalElement
) {

    modalElement.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";
}


function closeModalByElement(
    modalElement
) {

    modalElement.classList.remove(
        "show"
    );


    if (
        !document.querySelector(
            ".modal-overlay.show"
        )
    ) {

        document.body.style.overflow =
            "";
    }
}


function closeAllModals() {

    document.querySelectorAll(
        ".modal-overlay"
    ).forEach(
        function (modalElement) {

            modalElement.classList.remove(
                "show"
            );
        }
    );


    document.body.style.overflow =
        "";
}


/* =====================================================
   SUMMARY
===================================================== */

function updateSummary() {

    const total =
        studentCertificates.length +
        collegeCertificates.length;


    const thisYear =
        new Date().getFullYear();


    const thisYearCount =
        [
            ...studentCertificates,
            ...collegeCertificates
        ]
        .filter(
            certificate => {

                if (
                    !certificate.issueDate
                ) {

                    return false;
                }


                const date =
                    new Date(
                        certificate.issueDate
                    );


                return (
                    date.getFullYear() ===
                    thisYear
                );
            }
        )
        .length;


    document.getElementById(
        "totalCertificates"
    ).textContent =
        total;


    document.getElementById(
        "studentCertificates"
    ).textContent =
        studentCertificates.length;


    document.getElementById(
        "collegeCertificates"
    ).textContent =
        collegeCertificates.length;


    document.getElementById(
        "thisYearCertificates"
    ).textContent =
        thisYearCount;
}


/* =====================================================
   BACK BUTTON
   -----------------------------------------------------
   IMPORTANT:
   Uses actual browser history.

   This means:
   Certificate page
        ↓
   Back
        ↓
   Exact previous page

   No fixed dashboard path is used as the
   normal navigation route.
===================================================== */

function goBack() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

        return;
    }


    /*
       Only used when there is no usable
       browser history.

       This fallback keeps the module from
       getting stuck on a blank navigation.
    */

    const fallbackPage =
        "student-dashboard.html";


    window.location.replace(
        fallbackPage
    );
}


/* =====================================================
   ID GENERATOR
===================================================== */

function generateId() {

    return (
        "CERT-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
    );
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "—";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";
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
   HTML ESCAPING
===================================================== */

function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        String(value ?? "");


    return element.innerHTML;
}


/* =====================================================
   BACKEND INTEGRATION
   -----------------------------------------------------
   These functions are intentionally prepared
   for the future Java + MySQL backend.

   Faculty/Admin can eventually provide
   college-issued certificates through the backend.
===================================================== */


/*
   Example structure expected from backend:

   {
       id: "...",
       source: "COLLEGE",
       title: "...",
       issuer: "...",
       category: "...",
       issueDate: "...",
       certificateId: "...",
       description: "...",
       issuedBy: "...",
       fileUrl: "..."
   }
*/


function loadCertificatesFromBackend(
    studentData,
    collegeData
) {

    if (
        Array.isArray(studentData)
    ) {

        studentCertificates =
            studentData;
    }


    if (
        Array.isArray(collegeData)
    ) {

        collegeCertificates =
            collegeData;
    }


    updateStudentFilters();

    updateCollegeFilters();

    renderStudentCertificates();

    renderCollegeCertificates();

    updateSummary();
}


/* =====================================================
   COLLEGE CERTIFICATE BACKEND HOOK
===================================================== */

function receiveCollegeCertificates(
    certificates
) {

    if (
        !Array.isArray(certificates)
    ) {

        return;
    }


    collegeCertificates =
        certificates;


    updateCollegeFilters();

    renderCollegeCertificates();

    updateSummary();
}


/* =====================================================
   STUDENT CERTIFICATE BACKEND HOOK
===================================================== */

function receiveStudentCertificates(
    certificates
) {

    if (
        !Array.isArray(certificates)
    ) {

        return;
    }


    studentCertificates =
        certificates;


    updateStudentFilters();

    renderStudentCertificates();

    updateSummary();
}