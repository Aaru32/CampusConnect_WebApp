/* =========================================================
   CAMPUSCONNECT
   MENTORING
   BACKEND-READY JAVASCRIPT
   ========================================================= */


/*
    ========================================================
    FINAL ARCHITECTURE
    ========================================================

              Mentoring Frontend
             HTML + CSS + JavaScript
                       |
                       | REST API
                       v
                 Java Backend
                       |
                       | JDBC / JPA
                       v
                   MySQL


    This JavaScript file DOES NOT connect directly to MySQL.

    It communicates with the future Java REST API.

    No mentor names, student names, appointment records,
    requests, resources or progress values are hardcoded.
*/


// =========================================================
// API CONFIGURATION
// =========================================================

const API_BASE_URL = "/api";


// =========================================================
// API ENDPOINTS
// =========================================================

const API_ENDPOINTS = {

    mentors:
        `${API_BASE_URL}/mentoring/mentors`,

    currentMentor:
        `${API_BASE_URL}/mentoring/my-mentor`,

    requests:
        `${API_BASE_URL}/mentoring/requests`,

    appointments:
        `${API_BASE_URL}/mentoring/appointments`,

    resources:
        `${API_BASE_URL}/mentoring/resources`,

    progress:
        `${API_BASE_URL}/mentoring/my-progress`,

    subjects:
        `${API_BASE_URL}/subjects`,

    departments:
        `${API_BASE_URL}/departments`,

    availability:
        `${API_BASE_URL}/mentoring/availability`,

    requestMentoring:
        `${API_BASE_URL}/mentoring/requests`

};


// =========================================================
// DOM ELEMENTS
// =========================================================

const mentorSearch =
    document.getElementById(
        "mentorSearch"
    );


const mentorSubjectFilter =
    document.getElementById(
        "mentorSubjectFilter"
    );


const mentorDepartmentFilter =
    document.getElementById(
        "mentorDepartmentFilter"
    );


const mentorAvailabilityFilter =
    document.getElementById(
        "mentorAvailabilityFilter"
    );


const mentorGrid =
    document.getElementById(
        "mentorGrid"
    );


const mentorResultCount =
    document.getElementById(
        "mentorResultCount"
    );


const mentorLoading =
    document.getElementById(
        "mentorLoading"
    );


const mentorEmptyState =
    document.getElementById(
        "mentorEmptyState"
    );


const mentorErrorState =
    document.getElementById(
        "mentorErrorState"
    );


const currentMentorContainer =
    document.getElementById(
        "currentMentorContainer"
    );


const currentMentorLoading =
    document.getElementById(
        "currentMentorLoading"
    );


const currentMentorEmptyState =
    document.getElementById(
        "currentMentorEmptyState"
    );


const requestList =
    document.getElementById(
        "requestList"
    );


const requestLoading =
    document.getElementById(
        "requestLoading"
    );


const requestEmptyState =
    document.getElementById(
        "requestEmptyState"
    );


const appointmentList =
    document.getElementById(
        "appointmentList"
    );


const appointmentLoading =
    document.getElementById(
        "appointmentLoading"
    );


const appointmentEmptyState =
    document.getElementById(
        "appointmentEmptyState"
    );


const resourceGrid =
    document.getElementById(
        "resourceGrid"
    );


const resourceLoading =
    document.getElementById(
        "resourceLoading"
    );


const resourceEmptyState =
    document.getElementById(
        "resourceEmptyState"
    );


const progressGrid =
    document.getElementById(
        "progressGrid"
    );


const progressLoading =
    document.getElementById(
        "progressLoading"
    );


const progressEmptyState =
    document.getElementById(
        "progressEmptyState"
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
    initializeMentoring
);


async function initializeMentoring() {

    setupEventListeners();


    await Promise.allSettled([

        loadFilterOptions(),

        loadMentors(),

        loadCurrentMentor(),

        loadRequests(),

        loadAppointments(),

        loadResources(),

        loadProgress()

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
                API_ENDPOINTS.subjects
            ),

            apiRequest(
                API_ENDPOINTS.departments
            ),

            apiRequest(
                API_ENDPOINTS.availability
            )

        ]);


    if (
        results[0].status ===
        "fulfilled"
    ) {

        populateSelect(
            mentorSubjectFilter,
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
            mentorDepartmentFilter,
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
            mentorAvailabilityFilter,
            normalizeListResponse(
                results[2].value
            )
        );

    }

}


// =========================================================
// POPULATE SELECT
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


// =========================================================
// LOAD MENTORS
// =========================================================

async function loadMentors() {

    showLoading(
        mentorLoading,
        true
    );


    hideElement(
        mentorEmptyState
    );


    hideElement(
        mentorErrorState
    );


    try {

        const params =
            new URLSearchParams();


        const search =
            mentorSearch.value.trim();


        const subject =
            mentorSubjectFilter.value;


        const department =
            mentorDepartmentFilter.value;


        const availability =
            mentorAvailabilityFilter.value;


        if (search) {

            params.set(
                "search",
                search
            );

        }


        if (subject) {

            params.set(
                "subject",
                subject
            );

        }


        if (department) {

            params.set(
                "department",
                department
            );

        }


        if (availability) {

            params.set(
                "availability",
                availability
            );

        }


        const url =
            params.toString()
                ? `${API_ENDPOINTS.mentors}?${params}`
                : API_ENDPOINTS.mentors;


        const data =
            await apiRequest(url);


        renderMentors(
            normalizeListResponse(data)
        );

    }

    catch (error) {

        console.error(
            "Mentor loading error:",
            error
        );


        showElement(
            mentorErrorState
        );

    }

    finally {

        showLoading(
            mentorLoading,
            false
        );

    }

}


// =========================================================
// RENDER MENTORS
// =========================================================

function renderMentors(
    mentors
) {

    mentorGrid.innerHTML = "";


    mentorResultCount.textContent =
        `${mentors.length} mentor${mentors.length === 1 ? "" : "s"}`;


    if (!mentors.length) {

        showElement(
            mentorEmptyState
        );

        return;

    }


    mentors.forEach(
        mentor => {

            mentorGrid.appendChild(
                createMentorCard(
                    mentor
                )
            );

        }
    );

}


// =========================================================
// CREATE MENTOR CARD
// =========================================================

function createMentorCard(
    mentor
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "mentor-card";


    const name =
        mentor.name ??
        mentor.fullName ??
        "";


    const role =
        mentor.designation ??
        mentor.role ??
        "";


    const department =
        mentor.department ??
        mentor.departmentName ??
        "";


    const expertise =
        normalizeArray(
            mentor.expertise
        );


    const subjects =
        normalizeArray(
            mentor.subjects
        );


    const availability =
        mentor.availability ??
        "";


    card.innerHTML = `

        <div class="mentor-top">

            <div class="avatar">

                ${escapeHTML(
                    getInitials(name)
                )}

            </div>


            <div class="mentor-info">

                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(role)}
                </p>


                <p>
                    ${escapeHTML(department)}
                </p>

            </div>

        </div>


        <p class="mentor-description">

            ${escapeHTML(
                mentor.description ??
                ""
            )}

        </p>


        <div class="info-label">
            EXPERTISE
        </div>


        <div class="tags">

            ${expertise
                .map(
                    item => `

                        <span class="tag">

                            ${escapeHTML(
                                getDisplayValue(
                                    item
                                )
                            )}

                        </span>

                    `
                )
                .join("")}

        </div>


        <div class="info-label">
            SUBJECTS
        </div>


        <div class="tags">

            ${subjects
                .map(
                    item => `

                        <span class="tag">

                            ${escapeHTML(
                                getDisplayValue(
                                    item
                                )
                            )}

                        </span>

                    `
                )
                .join("")}

        </div>


        <div class="mentor-availability">

            <i class="fa-regular fa-clock"></i>

            ${escapeHTML(
                availability
            )}

        </div>


        <div class="card-actions">

            <button
                type="button"
                class="primary-btn request-mentor"
                data-id="${escapeHTML(
                    mentor.id ??
                    mentor.mentorId ??
                    ""
                )}">

                Request Mentoring

            </button>


            <button
                type="button"
                class="secondary-btn view-mentor"
                data-id="${escapeHTML(
                    mentor.id ??
                    mentor.mentorId ??
                    ""
                )}">

                View

            </button>

        </div>

    `;


    return card;

}


// =========================================================
// LOAD CURRENT MENTOR
// =========================================================

async function loadCurrentMentor() {

    showLoading(
        currentMentorLoading,
        true
    );


    hideElement(
        currentMentorEmptyState
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.currentMentor
            );


        if (!data) {

            showElement(
                currentMentorEmptyState
            );

            return;

        }


        renderCurrentMentor(
            data
        );

    }

    catch (error) {

        console.error(
            "Current mentor loading error:",
            error
        );


        showElement(
            currentMentorEmptyState
        );

    }

    finally {

        showLoading(
            currentMentorLoading,
            false
        );

    }

}


// =========================================================
// CURRENT MENTOR
// =========================================================

function renderCurrentMentor(
    mentor
) {

    currentMentorContainer.innerHTML = `

        <article
            class="current-mentor-card">


            <div class="avatar">

                ${escapeHTML(
                    getInitials(
                        mentor.name ??
                        mentor.fullName ??
                        ""
                    )
                )}

            </div>


            <div class="current-mentor-content">

                <h3>

                    ${escapeHTML(
                        mentor.name ??
                        mentor.fullName ??
                        ""
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        mentor.designation ??
                        mentor.role ??
                        ""
                    )}

                </p>


                <p>

                    ${escapeHTML(
                        mentor.department ??
                        mentor.departmentName ??
                        ""
                    )}

                </p>

            </div>


            <button
                type="button"
                class="secondary-btn"
                id="currentMentorDetails">

                View Details

            </button>


        </article>

    `;


    document
        .getElementById(
            "currentMentorDetails"
        )
        .addEventListener(
            "click",
            () => {

                openMentorDetails(
                    mentor.id ??
                    mentor.mentorId
                );

            }
        );

}


// =========================================================
// LOAD REQUESTS
// =========================================================

async function loadRequests() {

    showLoading(
        requestLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.requests
            );


        renderRequests(
            normalizeListResponse(data)
        );

    }

    catch (error) {

        console.error(
            "Request loading error:",
            error
        );


        showElement(
            requestEmptyState
        );

    }

    finally {

        showLoading(
            requestLoading,
            false
        );

    }

}


// =========================================================
// RENDER REQUESTS
// =========================================================

function renderRequests(
    requests
) {

    requestList.innerHTML = "";


    if (!requests.length) {

        showElement(
            requestEmptyState
        );

        return;

    }


    hideElement(
        requestEmptyState
    );


    requests.forEach(
        request => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "request-card";


            const status =
                String(
                    request.status ??
                    ""
                ).toLowerCase();


            card.innerHTML = `

                <div class="request-icon">

                    <i class="fa-solid fa-handshake"></i>

                </div>


                <div class="request-content">

                    <h3>

                        ${escapeHTML(
                            request.mentorName ??
                            request.mentor ??
                            ""
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            request.reason ??
                            request.message ??
                            ""
                        )}

                    </p>

                </div>


                <span
                    class="status ${escapeHTML(status)}">

                    ${escapeHTML(
                        request.status ??
                        ""
                    )}

                </span>

            `;


            requestList.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD APPOINTMENTS
// =========================================================

async function loadAppointments() {

    showLoading(
        appointmentLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.appointments
            );


        renderAppointments(
            normalizeListResponse(data)
        );

    }

    catch (error) {

        console.error(
            "Appointment loading error:",
            error
        );


        showElement(
            appointmentEmptyState
        );

    }

    finally {

        showLoading(
            appointmentLoading,
            false
        );

    }

}


// =========================================================
// RENDER APPOINTMENTS
// =========================================================

function renderAppointments(
    appointments
) {

    appointmentList.innerHTML = "";


    if (!appointments.length) {

        showElement(
            appointmentEmptyState
        );

        return;

    }


    hideElement(
        appointmentEmptyState
    );


    appointments.forEach(
        appointment => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "appointment-card";


            card.innerHTML = `

                <div class="appointment-date">

                    <strong>

                        ${escapeHTML(
                            appointment.day ??
                            ""
                        )}

                    </strong>


                    <span>

                        ${escapeHTML(
                            appointment.month ??
                            ""
                        )}

                    </span>

                </div>


                <div class="appointment-content">

                    <h3>

                        ${escapeHTML(
                            appointment.title ??
                            appointment.topic ??
                            ""
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            appointment.mentorName ??
                            appointment.mentor ??
                            ""
                        )}

                    </p>


                    <p>

                        ${escapeHTML(
                            appointment.time ??
                            ""
                        )}

                    </p>


                    <p>

                        ${escapeHTML(
                            appointment.mode ??
                            ""
                        )}

                    </p>

                </div>

            `;


            appointmentList.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD RESOURCES
// =========================================================

async function loadResources() {

    showLoading(
        resourceLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.resources
            );


        renderResources(
            normalizeListResponse(data)
        );

    }

    catch (error) {

        console.error(
            "Resource loading error:",
            error
        );


        showElement(
            resourceEmptyState
        );

    }

    finally {

        showLoading(
            resourceLoading,
            false
        );

    }

}


// =========================================================
// RENDER RESOURCES
// =========================================================

function renderResources(
    resources
) {

    resourceGrid.innerHTML = "";


    if (!resources.length) {

        showElement(
            resourceEmptyState
        );

        return;

    }


    hideElement(
        resourceEmptyState
    );


    resources.forEach(
        resource => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "resource-card";


            card.innerHTML = `

                <div class="resource-icon">

                    <i class="fa-solid fa-file-lines"></i>

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


                <div class="card-actions">

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


            resourceGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD PROGRESS
// =========================================================

async function loadProgress() {

    showLoading(
        progressLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.progress
            );


        renderProgress(
            data
        );

    }

    catch (error) {

        console.error(
            "Progress loading error:",
            error
        );


        showElement(
            progressEmptyState
        );

    }

    finally {

        showLoading(
            progressLoading,
            false
        );

    }

}


// =========================================================
// RENDER PROGRESS
// =========================================================

function renderProgress(
    progress
) {

    if (
        !progress ||
        typeof progress !== "object"
    ) {

        showElement(
            progressEmptyState
        );

        return;

    }


    const items = [

        {
            icon:
                "fa-calendar-check",

            value:
                progress.sessionsCompleted ??
                0,

            label:
                "Sessions Completed"
        },


        {
            icon:
                "fa-bullseye",

            value:
                progress.goalsCompleted ??
                0,

            label:
                "Goals Completed"
        },


        {
            icon:
                "fa-file-lines",

            value:
                progress.resourcesUsed ??
                0,

            label:
                "Resources Used"
        },


        {
            icon:
                "fa-clock",

            value:
                progress.hours ??
                0,

            label:
                "Mentoring Hours"
        }

    ];


    progressGrid.innerHTML = "";


    items.forEach(
        item => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "progress-card";


            card.innerHTML = `

                <div class="progress-icon">

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


            progressGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// EVENT LISTENERS
// =========================================================

function setupEventListeners() {


    mentorSearch.addEventListener(
        "input",
        debounce(
            loadMentors,
            350
        )
    );


    mentorSubjectFilter.addEventListener(
        "change",
        loadMentors
    );


    mentorDepartmentFilter.addEventListener(
        "change",
        loadMentors
    );


    mentorAvailabilityFilter.addEventListener(
        "change",
        loadMentors
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


    document
        .getElementById(
            "newRequestButton"
        )
        .addEventListener(
            "click",
            openMentoringRequestModal
        );


    document
        .getElementById(
            "retryMentorsButton"
        )
        .addEventListener(
            "click",
            loadMentors
        );


    mentorGrid.addEventListener(
        "click",
        handleMentorActions
    );


    resourceGrid.addEventListener(
        "click",
        handleResourceActions
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
// MENTOR ACTIONS
// =========================================================

function handleMentorActions(
    event
) {

    const requestButton =
        event.target.closest(
            ".request-mentor"
        );


    const viewButton =
        event.target.closest(
            ".view-mentor"
        );


    if (requestButton) {

        openMentoringRequestModal(
            requestButton.dataset.id
        );

    }


    if (viewButton) {

        openMentorDetails(
            viewButton.dataset.id
        );

    }

}


// =========================================================
// RESOURCE ACTION
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
// MENTORING REQUEST MODAL
// =========================================================

function openMentoringRequestModal(
    mentorId = ""
) {

    modalContent.innerHTML = `

        <h2>
            Request Mentoring
        </h2>


        <p>
            Submit your mentoring requirement to the
            mentoring system.
        </p>


        <form
            id="mentoringRequestForm">


            <div class="form-group">

                <label>
                    Mentor
                </label>


                <select
                    id="requestMentor"
                    required>

                    <option value="">
                        Select Mentor
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Subject / Area
                </label>


                <select
                    id="requestSubject"
                    required>

                    <option value="">
                        Select Subject
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Reason for Mentoring
                </label>


                <textarea
                    id="requestReason"
                    placeholder="Describe what you need guidance with..."
                    required>
                </textarea>

            </div>


            <button
                type="submit"
                class="form-submit">

                Submit Request

            </button>

        </form>

    `;


    openModal();


    loadRequestMentorOptions(
        mentorId
    );


    loadRequestSubjectOptions();


    document
        .getElementById(
            "mentoringRequestForm"
        )
        .addEventListener(
            "submit",
            submitMentoringRequest
        );

}


// =========================================================
// MENTOR OPTIONS
// =========================================================

async function loadRequestMentorOptions(
    selectedMentorId
) {

    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.mentors
            );


        const mentors =
            normalizeListResponse(
                data
            );


        const select =
            document.getElementById(
                "requestMentor"
            );


        mentors.forEach(
            mentor => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    mentor.id ??
                    mentor.mentorId ??
                    "";


                option.textContent =
                    mentor.name ??
                    mentor.fullName ??
                    "";


                if (
                    String(
                        option.value
                    ) ===
                    String(
                        selectedMentorId
                    )
                ) {

                    option.selected =
                        true;

                }


                select.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        console.error(
            error
        );

    }

}


// =========================================================
// SUBJECT OPTIONS
// =========================================================

async function loadRequestSubjectOptions() {

    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.subjects
            );


        const subjects =
            normalizeListResponse(
                data
            );


        const select =
            document.getElementById(
                "requestSubject"
            );


        subjects.forEach(
            subject => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subject.id ??
                    subject.value ??
                    "";


                option.textContent =
                    subject.name ??
                    subject.label ??
                    subject.title ??
                    "";


                select.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        console.error(
            error
        );

    }

}


// =========================================================
// SUBMIT MENTORING REQUEST
// =========================================================

async function submitMentoringRequest(
    event
) {

    event.preventDefault();


    const payload = {

        mentorId:
            document
                .getElementById(
                    "requestMentor"
                )
                .value,


        subjectId:
            document
                .getElementById(
                    "requestSubject"
                )
                .value,


        reason:
            document
                .getElementById(
                    "requestReason"
                )
                .value
                .trim()

    };


    try {

        await apiRequest(
            API_ENDPOINTS.requestMentoring,
            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        payload
                    )

            }
        );


        closeModal();


        await loadRequests();


        showSuccess(
            "Your mentoring request has been submitted."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to submit the mentoring request."
        );

    }

}


// =========================================================
// MENTOR DETAILS
// =========================================================

async function openMentorDetails(
    mentorId
) {

    try {

        const mentor =
            await apiRequest(
                `${API_ENDPOINTS.mentors}/${encodeURIComponent(mentorId)}`
            );


        modalContent.innerHTML = `

            <h2>

                ${escapeHTML(
                    mentor.name ??
                    mentor.fullName ??
                    ""
                )}

            </h2>


            <p>

                ${escapeHTML(
                    mentor.designation ??
                    mentor.role ??
                    ""
                )}

            </p>


            <p>

                ${escapeHTML(
                    mentor.department ??
                    mentor.departmentName ??
                    ""
                )}

            </p>


            <p>

                ${escapeHTML(
                    mentor.description ??
                    ""
                )}

            </p>

        `;


        openModal();

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to load mentor details."
        );

    }

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
                ${escapeHTML(message)}
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
                ${escapeHTML(message)}
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