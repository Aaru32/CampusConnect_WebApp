/* =========================================================
   CAMPUSCONNECT
   TRAINING & PLACEMENT
   BACKEND-READY JAVASCRIPT
   ========================================================= */


/*
    ========================================================
    ARCHITECTURE
    ========================================================

        HTML + CSS + JavaScript
                    |
                    | REST API
                    v
              Java Backend
                    |
                    | JDBC / JPA
                    v
                  MySQL


    This file does NOT connect directly to MySQL.

    It communicates with the future Java backend.

    No company records, job records, student records,
    applications, training records or placement statistics
    are stored in this JavaScript file.
*/


// =========================================================
// API CONFIGURATION
// =========================================================

const API_BASE_URL = "/api";


const API_ENDPOINTS = {

    overview:
        `${API_BASE_URL}/placement/overview`,

    drives:
        `${API_BASE_URL}/placement/drives`,

    trainings:
        `${API_BASE_URL}/placement/trainings`,

    applications:
        `${API_BASE_URL}/placement/applications`,

    events:
        `${API_BASE_URL}/placement/events`,

    preparation:
        `${API_BASE_URL}/placement/preparation`,

    documents:
        `${API_BASE_URL}/placement/documents`,

    departments:
        `${API_BASE_URL}/departments`,

    locations:
        `${API_BASE_URL}/placement/locations`,

    jobTypes:
        `${API_BASE_URL}/placement/job-types`,

    eligibility:
        `${API_BASE_URL}/placement/eligibility`

};


// =========================================================
// DOM ELEMENTS
// =========================================================

const driveSearch =
    document.getElementById(
        "driveSearch"
    );


const driveDepartmentFilter =
    document.getElementById(
        "driveDepartmentFilter"
    );


const driveLocationFilter =
    document.getElementById(
        "driveLocationFilter"
    );


const driveTypeFilter =
    document.getElementById(
        "driveTypeFilter"
    );


const driveEligibilityFilter =
    document.getElementById(
        "driveEligibilityFilter"
    );


const driveGrid =
    document.getElementById(
        "driveGrid"
    );


const driveResultCount =
    document.getElementById(
        "driveResultCount"
    );


const driveLoading =
    document.getElementById(
        "driveLoading"
    );


const driveEmptyState =
    document.getElementById(
        "driveEmptyState"
    );


const driveErrorState =
    document.getElementById(
        "driveErrorState"
    );


const overviewGrid =
    document.getElementById(
        "overviewGrid"
    );


const overviewLoading =
    document.getElementById(
        "overviewLoading"
    );


const overviewEmptyState =
    document.getElementById(
        "overviewEmptyState"
    );


const trainingGrid =
    document.getElementById(
        "trainingGrid"
    );


const trainingLoading =
    document.getElementById(
        "trainingLoading"
    );


const trainingEmptyState =
    document.getElementById(
        "trainingEmptyState"
    );


const applicationList =
    document.getElementById(
        "applicationList"
    );


const applicationLoading =
    document.getElementById(
        "applicationLoading"
    );


const applicationEmptyState =
    document.getElementById(
        "applicationEmptyState"
    );


const eventGrid =
    document.getElementById(
        "eventGrid"
    );


const eventLoading =
    document.getElementById(
        "eventLoading"
    );


const eventEmptyState =
    document.getElementById(
        "eventEmptyState"
    );


const preparationGrid =
    document.getElementById(
        "preparationGrid"
    );


const preparationLoading =
    document.getElementById(
        "preparationLoading"
    );


const preparationEmptyState =
    document.getElementById(
        "preparationEmptyState"
    );


const documentGrid =
    document.getElementById(
        "documentGrid"
    );


const documentLoading =
    document.getElementById(
        "documentLoading"
    );


const documentEmptyState =
    document.getElementById(
        "documentEmptyState"
    );


const modalOverlay =
    document.getElementById(
        "modalOverlay"
    );


const modalContent =
    document.getElementById(
        "modalContent"
    );


const modalClose =
    document.getElementById(
        "modalClose"
    );


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeTrainingPlacement
);


async function initializeTrainingPlacement() {

    setupEventListeners();


    await Promise.allSettled([

        loadFilterOptions(),

        loadOverview(),

        loadDrives(),

        loadTrainings(),

        loadApplications(),

        loadEvents(),

        loadPreparation(),

        loadDocuments()

    ]);

}


// =========================================================
// GENERIC API REQUEST
// =========================================================

async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
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


    const contentType =
        response.headers.get(
            "content-type"
        );


    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        return await response.json();

    }


    return null;

}


// =========================================================
// FILTER OPTIONS
// =========================================================

async function loadFilterOptions() {

    const results =
        await Promise.allSettled([

            apiRequest(
                API_ENDPOINTS.departments
            ),

            apiRequest(
                API_ENDPOINTS.locations
            ),

            apiRequest(
                API_ENDPOINTS.jobTypes
            ),

            apiRequest(
                API_ENDPOINTS.eligibility
            )

        ]);


    if (
        results[0].status ===
        "fulfilled"
    ) {

        populateSelect(
            driveDepartmentFilter,
            normalizeListResponse(
                results[0].value
            )
        );

    }


    if (
        results[1].status ===
        "fulfilled"
    ) {

        populateSelect(
            driveLocationFilter,
            normalizeListResponse(
                results[1].value
            )
        );

    }


    if (
        results[2].status ===
        "fulfilled"
    ) {

        populateSelect(
            driveTypeFilter,
            normalizeListResponse(
                results[2].value
            )
        );

    }


    if (
        results[3].status ===
        "fulfilled"
    ) {

        populateSelect(
            driveEligibilityFilter,
            normalizeListResponse(
                results[3].value
            )
        );

    }

}


// =========================================================
// LOAD OVERVIEW
// =========================================================

async function loadOverview() {

    showLoading(
        overviewLoading,
        true
    );


    hideElement(
        overviewEmptyState
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.overview
            );


        renderOverview(
            data
        );

    }

    catch (error) {

        console.error(
            "Overview error:",
            error
        );


        showElement(
            overviewEmptyState
        );

    }

    finally {

        showLoading(
            overviewLoading,
            false
        );

    }

}


// =========================================================
// RENDER OVERVIEW
// =========================================================

function renderOverview(
    overview
) {

    if (
        !overview ||
        typeof overview !== "object"
    ) {

        showElement(
            overviewEmptyState
        );

        return;

    }


    const items = [

        {

            icon:
                "fa-briefcase",

            value:
                overview.eligibleDrives ??
                0,

            label:
                "Eligible Drives"

        },


        {

            icon:
                "fa-file-circle-check",

            value:
                overview.applications ??
                0,

            label:
                "Applications"

        },


        {

            icon:
                "fa-calendar-check",

            value:
                overview.upcomingDrives ??
                0,

            label:
                "Upcoming Drives"

        },


        {

            icon:
                "fa-trophy",

            value:
                overview.selected ??
                0,

            label:
                "Selections"

        }

    ];


    overviewGrid.innerHTML = "";


    items.forEach(
        item => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "overview-card";


            card.innerHTML = `

                <div class="overview-icon">

                    <i class="fa-solid ${escapeHTML(
                        item.icon
                    )}"></i>

                </div>


                <strong>

                    ${escapeHTML(
                        item.value
                    )}

                </strong>


                <span>

                    ${escapeHTML(
                        item.label
                    )}

                </span>

            `;


            overviewGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD DRIVES
// =========================================================

async function loadDrives() {

    showLoading(
        driveLoading,
        true
    );


    hideElement(
        driveEmptyState
    );


    hideElement(
        driveErrorState
    );


    try {

        const params =
            new URLSearchParams();


        const search =
            driveSearch.value.trim();


        const department =
            driveDepartmentFilter.value;


        const location =
            driveLocationFilter.value;


        const jobType =
            driveTypeFilter.value;


        const eligibility =
            driveEligibilityFilter.value;


        if (search) {

            params.set(
                "search",
                search
            );

        }


        if (department) {

            params.set(
                "department",
                department
            );

        }


        if (location) {

            params.set(
                "location",
                location
            );

        }


        if (jobType) {

            params.set(
                "jobType",
                jobType
            );

        }


        if (eligibility) {

            params.set(
                "eligibility",
                eligibility
            );

        }


        const url =
            params.toString()
                ? `${API_ENDPOINTS.drives}?${params}`
                : API_ENDPOINTS.drives;


        const data =
            await apiRequest(
                url
            );


        renderDrives(
            normalizeListResponse(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Drive loading error:",
            error
        );


        showElement(
            driveErrorState
        );

    }

    finally {

        showLoading(
            driveLoading,
            false
        );

    }

}


// =========================================================
// RENDER DRIVES
// =========================================================

function renderDrives(
    drives
) {

    driveGrid.innerHTML = "";


    driveResultCount.textContent =
        `${drives.length} drive${drives.length === 1 ? "" : "s"}`;


    if (!drives.length) {

        showElement(
            driveEmptyState
        );

        return;

    }


    hideElement(
        driveEmptyState
    );


    drives.forEach(
        drive => {

            driveGrid.appendChild(
                createDriveCard(
                    drive
                )
            );

        }
    );

}


// =========================================================
// CREATE DRIVE CARD
// =========================================================

function createDriveCard(
    drive
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "drive-card";


    const company =
        drive.companyName ??
        drive.company ??
        "";


    const role =
        drive.jobRole ??
        drive.role ??
        "";


    const companyInitial =
        getInitials(
            company
        );


    card.innerHTML = `

        <div class="company-header">

            <div class="company-logo">

                ${escapeHTML(
                    companyInitial
                )}

            </div>


            <div>

                <h3>

                    ${escapeHTML(
                        company
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        drive.department ??
                        drive.departmentName ??
                        ""
                    )}

                </p>

            </div>

        </div>


        <div class="drive-role">

            ${escapeHTML(
                role
            )}

        </div>


        <div class="drive-details">


            <div class="detail-item">

                <span>
                    Package
                </span>

                <strong>

                    ${escapeHTML(
                        drive.package ??
                        drive.salary ??
                        ""
                    )}

                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Location
                </span>

                <strong>

                    ${escapeHTML(
                        drive.location ??
                        ""
                    )}

                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Job Type
                </span>

                <strong>

                    ${escapeHTML(
                        drive.jobType ??
                        ""
                    )}

                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Eligibility
                </span>

                <strong>

                    ${escapeHTML(
                        drive.eligibility ??
                        ""
                    )}

                </strong>

            </div>

        </div>


        <div class="drive-deadline">

            <i class="fa-regular fa-clock"></i>

            Deadline:

            ${escapeHTML(
                drive.applicationDeadline ??
                drive.deadline ??
                ""
            )}

        </div>


        <div class="drive-actions">

            <button
                type="button"
                class="primary-btn apply-drive"
                data-id="${escapeHTML(
                    drive.id ??
                    drive.driveId ??
                    ""
                )}">

                View & Apply

            </button>


            <button
                type="button"
                class="secondary-btn view-drive"
                data-id="${escapeHTML(
                    drive.id ??
                    drive.driveId ??
                    ""
                )}">

                Details

            </button>

        </div>

    `;


    return card;

}


// =========================================================
// LOAD TRAININGS
// =========================================================

async function loadTrainings() {

    showLoading(
        trainingLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.trainings
            );


        renderTrainings(
            normalizeListResponse(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Training loading error:",
            error
        );


        showElement(
            trainingEmptyState
        );

    }

    finally {

        showLoading(
            trainingLoading,
            false
        );

    }

}


// =========================================================
// RENDER TRAININGS
// =========================================================

function renderTrainings(
    trainings
) {

    trainingGrid.innerHTML = "";


    if (!trainings.length) {

        showElement(
            trainingEmptyState
        );

        return;

    }


    hideElement(
        trainingEmptyState
    );


    trainings.forEach(
        training => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "training-card";


            const skills =
                normalizeArray(
                    training.skills
                );


            card.innerHTML = `

                <div class="training-icon">

                    <i class="fa-solid fa-chalkboard-user"></i>

                </div>


                <h3>

                    ${escapeHTML(
                        training.title ??
                        training.name ??
                        ""
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        training.description ??
                        ""
                    )}

                </p>


                <div class="training-meta">


                    <span class="meta-tag">

                        ${escapeHTML(
                            training.mode ??
                            ""
                        )}

                    </span>


                    <span class="meta-tag">

                        ${escapeHTML(
                            training.duration ??
                            ""
                        )}

                    </span>


                    ${skills
                        .map(
                            skill => `

                                <span class="meta-tag">

                                    ${escapeHTML(
                                        getDisplayValue(
                                            skill
                                        )
                                    )}

                                </span>

                            `
                        )
                        .join("")}

                </div>


                <div class="drive-actions">

                    <button
                        type="button"
                        class="primary-btn training-details"
                        data-id="${escapeHTML(
                            training.id ??
                            training.trainingId ??
                            ""
                        )}">

                        View Training

                    </button>

                </div>

            `;


            trainingGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD APPLICATIONS
// =========================================================

async function loadApplications() {

    showLoading(
        applicationLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.applications
            );


        renderApplications(
            normalizeListResponse(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Application loading error:",
            error
        );


        showElement(
            applicationEmptyState
        );

    }

    finally {

        showLoading(
            applicationLoading,
            false
        );

    }

}


// =========================================================
// RENDER APPLICATIONS
// =========================================================

function renderApplications(
    applications
) {

    applicationList.innerHTML = "";


    if (!applications.length) {

        showElement(
            applicationEmptyState
        );

        return;

    }


    hideElement(
        applicationEmptyState
    );


    applications.forEach(
        application => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "application-card";


            const status =
                String(
                    application.status ??
                    ""
                ).toLowerCase();


            card.innerHTML = `

                <div class="application-icon">

                    <i class="fa-solid fa-file-circle-check"></i>

                </div>


                <div class="application-content">

                    <h3>

                        ${escapeHTML(
                            application.companyName ??
                            application.company ??
                            ""
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            application.jobRole ??
                            application.role ??
                            ""
                        )}

                    </p>


                    <p>

                        Applied:

                        ${escapeHTML(
                            application.appliedDate ??
                            ""
                        )}

                    </p>

                </div>


                <span class="status ${escapeHTML(status)}">

                    ${escapeHTML(
                        application.status ??
                        ""
                    )}

                </span>

            `;


            applicationList.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD EVENTS
// =========================================================

async function loadEvents() {

    showLoading(
        eventLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.events
            );


        renderEvents(
            normalizeListResponse(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Event loading error:",
            error
        );


        showElement(
            eventEmptyState
        );

    }

    finally {

        showLoading(
            eventLoading,
            false
        );

    }

}


// =========================================================
// RENDER EVENTS
// =========================================================

function renderEvents(
    events
) {

    eventGrid.innerHTML = "";


    if (!events.length) {

        showElement(
            eventEmptyState
        );

        return;

    }


    hideElement(
        eventEmptyState
    );


    events.forEach(
        event => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "event-card";


            card.innerHTML = `

                <div class="event-date">

                    <strong>

                        ${escapeHTML(
                            event.day ??
                            ""
                        )}

                    </strong>


                    <span>

                        ${escapeHTML(
                            event.month ??
                            ""
                        )}

                    </span>

                </div>


                <h3>

                    ${escapeHTML(
                        event.title ??
                        event.name ??
                        ""
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        event.description ??
                        ""
                    )}

                </p>


                <p>

                    ${escapeHTML(
                        event.time ??
                        ""
                    )}

                </p>


                <p>

                    ${escapeHTML(
                        event.mode ??
                        ""
                    )}

                </p>

            `;


            eventGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD PREPARATION
// =========================================================

async function loadPreparation() {

    showLoading(
        preparationLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.preparation
            );


        renderPreparation(
            normalizeListResponse(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Preparation loading error:",
            error
        );


        showElement(
            preparationEmptyState
        );

    }

    finally {

        showLoading(
            preparationLoading,
            false
        );

    }

}


// =========================================================
// RENDER PREPARATION
// =========================================================

function renderPreparation(
    resources
) {

    preparationGrid.innerHTML = "";


    if (!resources.length) {

        showElement(
            preparationEmptyState
        );

        return;

    }


    hideElement(
        preparationEmptyState
    );


    resources.forEach(
        resource => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "preparation-card";


            card.innerHTML = `

                <div class="preparation-icon">

                    <i class="fa-solid fa-book-open"></i>

                </div>


                <h3>

                    ${escapeHTML(
                        resource.title ??
                        resource.name ??
                        ""
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        resource.description ??
                        ""
                    )}

                </p>


                <div class="drive-actions">

                    <button
                        type="button"
                        class="primary-btn open-resource"
                        data-url="${escapeHTML(
                            resource.url ??
                            resource.fileUrl ??
                            ""
                        )}">

                        Open Resource

                    </button>

                </div>

            `;


            preparationGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD DOCUMENTS
// =========================================================

async function loadDocuments() {

    showLoading(
        documentLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.documents
            );


        renderDocuments(
            normalizeListResponse(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Document loading error:",
            error
        );


        showElement(
            documentEmptyState
        );

    }

    finally {

        showLoading(
            documentLoading,
            false
        );

    }

}


// =========================================================
// RENDER DOCUMENTS
// =========================================================

function renderDocuments(
    documents
) {

    documentGrid.innerHTML = "";


    if (!documents.length) {

        showElement(
            documentEmptyState
        );

        return;

    }


    hideElement(
        documentEmptyState
    );


    documents.forEach(
        documentItem => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "document-card";


            card.innerHTML = `

                <div class="document-icon">

                    <i class="fa-solid fa-file-lines"></i>

                </div>


                <h3>

                    ${escapeHTML(
                        documentItem.title ??
                        documentItem.name ??
                        ""
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        documentItem.description ??
                        ""
                    )}

                </p>


                <div class="drive-actions">

                    <button
                        type="button"
                        class="primary-btn open-resource"
                        data-url="${escapeHTML(
                            documentItem.url ??
                            documentItem.fileUrl ??
                            ""
                        )}">

                        Open

                    </button>

                </div>

            `;


            documentGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// EVENT LISTENERS
// =========================================================

function setupEventListeners() {


    driveSearch.addEventListener(
        "input",
        debounce(
            loadDrives,
            350
        )
    );


    driveDepartmentFilter.addEventListener(
        "change",
        loadDrives
    );


    driveLocationFilter.addEventListener(
        "change",
        loadDrives
    );


    driveTypeFilter.addEventListener(
        "change",
        loadDrives
    );


    driveEligibilityFilter.addEventListener(
        "change",
        loadDrives
    );


    document
        .querySelectorAll(
            ".quick-action"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            document.getElementById(
                                button.dataset.target
                            );


                        if (target) {

                            target.scrollIntoView({

                                behavior:
                                    "smooth",

                                block:
                                    "start"

                            });

                        }

                    }
                );

            }
        );


    driveGrid.addEventListener(
        "click",
        handleDriveActions
    );


    trainingGrid.addEventListener(
        "click",
        handleTrainingActions
    );


    preparationGrid.addEventListener(
        "click",
        handleResourceActions
    );


    documentGrid.addEventListener(
        "click",
        handleResourceActions
    );


    document
        .getElementById(
            "retryDrivesButton"
        )
        .addEventListener(
            "click",
            loadDrives
        );


    modalClose.addEventListener(
        "click",
        closeModal
    );


    modalOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modalOverlay
            ) {

                closeModal();

            }

        }
    );


    document
        .getElementById(
            "backButton"
        )
        .addEventListener(
            "click",
            handleBackNavigation
        );

}


// =========================================================
// DRIVE ACTIONS
// =========================================================

function handleDriveActions(
    event
) {

    const applyButton =
        event.target.closest(
            ".apply-drive"
        );


    const viewButton =
        event.target.closest(
            ".view-drive"
        );


    if (applyButton) {

        openDriveDetails(
            applyButton.dataset.id,
            true
        );

    }


    if (viewButton) {

        openDriveDetails(
            viewButton.dataset.id,
            false
        );

    }

}


// =========================================================
// DRIVE DETAILS
// =========================================================

async function openDriveDetails(
    driveId,
    allowApply
) {

    try {

        const drive =
            await apiRequest(
                `${API_ENDPOINTS.drives}/${encodeURIComponent(driveId)}`
            );


        modalContent.innerHTML = `

            <h2>

                ${escapeHTML(
                    drive.companyName ??
                    drive.company ??
                    ""
                )}

            </h2>


            <p>

                ${escapeHTML(
                    drive.jobRole ??
                    drive.role ??
                    ""
                )}

            </p>


            <p>

                ${escapeHTML(
                    drive.description ??
                    ""
                )}

            </p>


            <p>

                Eligibility:

                ${escapeHTML(
                    drive.eligibility ??
                    ""
                )}

            </p>


            <p>

                Package:

                ${escapeHTML(
                    drive.package ??
                    drive.salary ??
                    ""
                )}

            </p>


            <p>

                Application Deadline:

                ${escapeHTML(
                    drive.applicationDeadline ??
                    drive.deadline ??
                    ""
                )}

            </p>


            ${
                allowApply
                ? `

                    <button
                        type="button"
                        class="form-submit"
                        id="confirmApplyButton">

                        Apply for this Drive

                    </button>

                `
                : ""
            }

        `;


        openModal();


        if (allowApply) {

            document
                .getElementById(
                    "confirmApplyButton"
                )
                .addEventListener(
                    "click",
                    () =>
                        applyForDrive(
                            driveId
                        )
                );

        }

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to load placement drive details."
        );

    }

}


// =========================================================
// APPLY FOR DRIVE
// =========================================================

async function applyForDrive(
    driveId
) {

    try {

        await apiRequest(
            `${API_ENDPOINTS.drives}/${encodeURIComponent(driveId)}/apply`,
            {

                method:
                    "POST"

            }
        );


        closeModal();


        await Promise.all([

            loadApplications(),

            loadOverview()

        ]);


        showSuccess(
            "Your application has been submitted."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to submit your application."
        );

    }

}


// =========================================================
// TRAINING ACTIONS
// =========================================================

function handleTrainingActions(
    event
) {

    const button =
        event.target.closest(
            ".training-details"
        );


    if (!button) {

        return;

    }


    openTrainingDetails(
        button.dataset.id
    );

}


// =========================================================
// TRAINING DETAILS
// =========================================================

async function openTrainingDetails(
    trainingId
) {

    try {

        const training =
            await apiRequest(
                `${API_ENDPOINTS.trainings}/${encodeURIComponent(trainingId)}`
            );


        modalContent.innerHTML = `

            <h2>

                ${escapeHTML(
                    training.title ??
                    training.name ??
                    ""
                )}

            </h2>


            <p>

                ${escapeHTML(
                    training.description ??
                    ""
                )}

            </p>


            <p>

                Trainer:

                ${escapeHTML(
                    training.trainer ??
                    ""
                )}

            </p>


            <p>

                Mode:

                ${escapeHTML(
                    training.mode ??
                    ""
                )}

            </p>


            <p>

                Duration:

                ${escapeHTML(
                    training.duration ??
                    ""
                )}

            </p>


            <button
                type="button"
                class="form-submit"
                id="enrollTrainingButton">

                Enroll in Training

            </button>

        `;


        openModal();


        document
            .getElementById(
                "enrollTrainingButton"
            )
            .addEventListener(
                "click",
                () =>
                    enrollTraining(
                        trainingId
                    )
            );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to load training details."
        );

    }

}


// =========================================================
// ENROLL TRAINING
// =========================================================

async function enrollTraining(
    trainingId
) {

    try {

        await apiRequest(
            `${API_ENDPOINTS.trainings}/${encodeURIComponent(trainingId)}/enroll`,
            {

                method:
                    "POST"

            }
        );


        closeModal();


        await loadTrainings();


        showSuccess(
            "Your training enrollment has been submitted."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to enroll in this training."
        );

    }

}


// =========================================================
// RESOURCE ACTIONS
// =========================================================

function handleResourceActions(
    event
) {

    const button =
        event.target.closest(
            ".open-resource"
        );


    if (!button) {

        return;

    }


    const url =
        button.dataset.url;


    if (!url) {

        showError(
            "Resource link is not available."
        );

        return;

    }


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


// =========================================================
// MODAL
// =========================================================

function openModal() {

    modalOverlay.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal() {

    modalOverlay.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


// =========================================================
// SUCCESS
// =========================================================

function showSuccess(
    message
) {

    modalContent.innerHTML = `

        <div style="text-align:center;">

            <i
                class="fa-solid fa-circle-check"
                style="
                    color:#238b5a;
                    font-size:32px;
                ">
            </i>


            <h2 style="margin-top:15px;">
                Success
            </h2>


            <p>

                ${escapeHTML(
                    message
                )}

            </p>


            <button
                type="button"
                class="form-submit"
                id="successClose">

                Done

            </button>

        </div>

    `;


    openModal();


    document
        .getElementById(
            "successClose"
        )
        .addEventListener(
            "click",
            closeModal
        );

}


// =========================================================
// ERROR
// =========================================================

function showError(
    message
) {

    modalContent.innerHTML = `

        <div style="text-align:center;">

            <i
                class="fa-solid fa-triangle-exclamation"
                style="
                    color:#c43d3d;
                    font-size:32px;
                ">
            </i>


            <h2 style="margin-top:15px;">
                Something went wrong
            </h2>


            <p>

                ${escapeHTML(
                    message
                )}

            </p>


            <button
                type="button"
                class="form-submit"
                id="errorClose">

                Close

            </button>

        </div>

    `;


    openModal();


    document
        .getElementById(
            "errorClose"
        )
        .addEventListener(
            "click",
            closeModal
        );

}


// =========================================================
// BACK NAVIGATION
// =========================================================

function handleBackNavigation() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

        return;

    }


    window.location.href =
        "student-dashboard.html";

}


// =========================================================
// HELPERS
// =========================================================

function populateSelect(
    selectElement,
    options
) {

    if (
        !selectElement ||
        !Array.isArray(options)
    ) {

        return;

    }


    const firstOption =
        selectElement.querySelector(
            "option"
        );


    selectElement.innerHTML = "";


    if (firstOption) {

        selectElement.appendChild(
            firstOption
        );

    }


    options.forEach(
        option => {

            const element =
                document.createElement(
                    "option"
                );


            if (
                typeof option ===
                "object"
            ) {

                element.value =
                    option.id ??
                    option.value ??
                    "";

                element.textContent =
                    option.name ??
                    option.label ??
                    option.title ??
                    "";

            }

            else {

                element.value =
                    option;

                element.textContent =
                    option;

            }


            selectElement.appendChild(
                element
            );

        }
    );

}


function normalizeListResponse(
    response
) {

    if (
        Array.isArray(response)
    ) {

        return response;

    }


    if (
        response &&
        Array.isArray(response.data)
    ) {

        return response.data;

    }


    if (
        response &&
        Array.isArray(response.content)
    ) {

        return response.content;

    }


    if (
        response &&
        Array.isArray(response.items)
    ) {

        return response.items;

    }


    return [];

}


function normalizeArray(
    value
) {

    if (
        Array.isArray(value)
    ) {

        return value;

    }


    if (
        typeof value === "string" &&
        value.trim()
    ) {

        return value
            .split(",")
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);

    }


    return [];

}


function getDisplayValue(
    value
) {

    if (
        value &&
        typeof value === "object"
    ) {

        return (
            value.name ??
            value.label ??
            value.title ??
            ""
        );

    }


    return String(
        value ?? ""
    );

}


function getInitials(
    name
) {

    return String(name)
        .trim()
        .split(/\s+/)
        .map(
            part =>
                part.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


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


function showElement(
    element
) {

    if (element) {

        element.classList.remove(
            "hidden"
        );

    }

}


function hideElement(
    element
) {

    if (element) {

        element.classList.add(
            "hidden"
        );

    }

}


function showLoading(
    element,
    show
) {

    if (!element) {

        return;

    }


    if (show) {

        element.classList.remove(
            "hidden"
        );

    }

    else {

        element.classList.add(
            "hidden"
        );

    }

}


function debounce(
    callback,
    delay
) {

    let timer;


    return function (...args) {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                () =>
                    callback(...args),
                delay
            );

    };

}