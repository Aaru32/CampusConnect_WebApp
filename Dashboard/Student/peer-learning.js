/* =========================================================
   CAMPUSCONNECT
   PEER LEARNING
   BACKEND-READY JAVASCRIPT
   ========================================================= */


/*
    ========================================================
    IMPORTANT ARCHITECTURE
    ========================================================

    This frontend DOES NOT connect directly to MySQL.

    Final architecture:

        HTML/CSS/JS
             |
             v
        Java REST API
             |
             v
           MySQL


    The API_BASE_URL below is the single place where
    the future Java backend base URL can be configured.

    No student, group, question, session or statistic
    records are hardcoded in this file.
*/


// =========================================================
// API CONFIGURATION
// =========================================================

const API_BASE_URL = "/api";


// =========================================================
// API ENDPOINTS
// =========================================================

const API_ENDPOINTS = {

    peers:
        `${API_BASE_URL}/peer-learning/peers`,

    groups:
        `${API_BASE_URL}/peer-learning/groups`,

    questions:
        `${API_BASE_URL}/peer-learning/questions`,

    sessions:
        `${API_BASE_URL}/peer-learning/sessions`,

    activity:
        `${API_BASE_URL}/peer-learning/my-activity`,

    subjects:
        `${API_BASE_URL}/subjects`,

    semesters:
        `${API_BASE_URL}/semesters`,

    availability:
        `${API_BASE_URL}/peer-learning/availability`,

    connections:
        `${API_BASE_URL}/peer-learning/connections`,

    joinGroup:
        groupId =>
            `${API_BASE_URL}/peer-learning/groups/${groupId}/join`

};


// =========================================================
// DOM ELEMENTS
// =========================================================

const peerGrid =
    document.getElementById("peerGrid");

const peerSearch =
    document.getElementById("peerSearch");

const subjectFilter =
    document.getElementById("subjectFilter");

const semesterFilter =
    document.getElementById("semesterFilter");

const availabilityFilter =
    document.getElementById("availabilityFilter");

const peerResultCount =
    document.getElementById("peerResultCount");

const peerLoading =
    document.getElementById("peerLoading");

const peerEmptyState =
    document.getElementById("peerEmptyState");

const peerErrorState =
    document.getElementById("peerErrorState");

const groupGrid =
    document.getElementById("groupGrid");

const groupLoading =
    document.getElementById("groupLoading");

const groupEmptyState =
    document.getElementById("groupEmptyState");

const questionList =
    document.getElementById("questionList");

const questionLoading =
    document.getElementById("questionLoading");

const questionEmptyState =
    document.getElementById("questionEmptyState");

const sessionList =
    document.getElementById("sessionList");

const sessionLoading =
    document.getElementById("sessionLoading");

const sessionEmptyState =
    document.getElementById("sessionEmptyState");

const statsGrid =
    document.getElementById("statsGrid");

const activityLoading =
    document.getElementById("activityLoading");

const activityEmptyState =
    document.getElementById("activityEmptyState");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalContent =
    document.getElementById("modalContent");

const modalClose =
    document.getElementById("modalClose");


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializePeerLearning
);


async function initializePeerLearning() {

    setupEventListeners();

    await Promise.allSettled([

        loadFilterOptions(),

        loadPeers(),

        loadGroups(),

        loadQuestions(),

        loadSessions(),

        loadMyActivity()

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
                credentials: "include",

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
// LOAD FILTER OPTIONS
// =========================================================

async function loadFilterOptions() {

    try {

        const results =
            await Promise.allSettled([

                apiRequest(
                    API_ENDPOINTS.subjects
                ),

                apiRequest(
                    API_ENDPOINTS.semesters
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
                subjectFilter,
                results[0].value
            );

        }


        if (
            results[1].status ===
            "fulfilled"
        ) {

            populateSelect(
                semesterFilter,
                results[1].value
            );

        }


        if (
            results[2].status ===
            "fulfilled"
        ) {

            populateSelect(
                availabilityFilter,
                results[2].value
            );

        }

    }

    catch (error) {

        console.error(
            "Unable to load filters:",
            error
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


    const currentFirstOption =
        selectElement
            .querySelector("option");


    selectElement.innerHTML = "";


    if (currentFirstOption) {

        selectElement.appendChild(
            currentFirstOption
        );

    }


    options.forEach(
        option => {

            const optionElement =
                document.createElement(
                    "option"
                );


            if (
                typeof option ===
                "object"
            ) {

                optionElement.value =
                    option.value ??
                    option.id ??
                    "";

                optionElement.textContent =
                    option.label ??
                    option.name ??
                    option.title ??
                    "";

            }

            else {

                optionElement.value =
                    option;

                optionElement.textContent =
                    option;

            }


            selectElement.appendChild(
                optionElement
            );

        }
    );

}


// =========================================================
// LOAD PEERS
// =========================================================

async function loadPeers() {

    showLoading(
        peerLoading,
        true
    );

    hideElement(
        peerEmptyState
    );

    hideElement(
        peerErrorState
    );


    try {

        const params =
            new URLSearchParams();


        const search =
            peerSearch.value.trim();


        const subject =
            subjectFilter.value;


        const semester =
            semesterFilter.value;


        const availability =
            availabilityFilter.value;


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


        if (semester) {

            params.set(
                "semester",
                semester
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
                ? `${API_ENDPOINTS.peers}?${params}`
                : API_ENDPOINTS.peers;


        const data =
            await apiRequest(url);


        const peers =
            normalizeListResponse(data);


        renderPeers(peers);

    }

    catch (error) {

        console.error(
            "Peer loading error:",
            error
        );


        showElement(
            peerErrorState
        );

    }

    finally {

        showLoading(
            peerLoading,
            false
        );

    }

}


// =========================================================
// RENDER PEERS
// =========================================================

function renderPeers(peers) {

    peerGrid.innerHTML = "";


    peerResultCount.textContent =
        `${peers.length} student${peers.length === 1 ? "" : "s"}`;


    if (!peers.length) {

        showElement(
            peerEmptyState
        );

        return;

    }


    hideElement(
        peerEmptyState
    );


    peers.forEach(
        peer => {

            peerGrid.appendChild(
                createPeerCard(peer)
            );

        }
    );

}


// =========================================================
// PEER CARD
// =========================================================

function createPeerCard(peer) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "peer-card";


    const name =
        peer.name ??
        peer.fullName ??
        "Student";


    const semester =
        peer.semester ??
        "";


    const initials =
        getInitials(name);


    const skills =
        normalizeArray(
            peer.skills
        );


    const subjects =
        normalizeArray(
            peer.subjects
        );


    const availability =
        peer.availability ??
        "";


    card.innerHTML = `

        <div class="peer-top">

            <div class="avatar">

                ${escapeHTML(initials)}

            </div>


            <div class="peer-info">

                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(
                        semester
                            ? `${semester} Semester`
                            : ""
                    )}
                </p>

            </div>

        </div>


        <p class="peer-description">

            ${escapeHTML(
                peer.description ?? ""
            )}

        </p>


        <div class="tag-title">
            SKILLS
        </div>


        <div class="tags">

            ${skills
                .map(
                    skill => `
                        <span class="tag">
                            ${escapeHTML(skill)}
                        </span>
                    `
                )
                .join("")}

        </div>


        <div class="tag-title">
            SUBJECTS
        </div>


        <div class="tags">

            ${subjects
                .map(
                    subject => `
                        <span class="tag">
                            ${escapeHTML(
                                typeof subject === "object"
                                    ? (
                                        subject.name ??
                                        subject.title ??
                                        ""
                                    )
                                    : subject
                            )}
                        </span>
                    `
                )
                .join("")}

        </div>


        <div class="availability">

            <i class="fa-regular fa-clock"></i>

            ${escapeHTML(
                availability
            )}

        </div>


        <div class="peer-actions">

            <button
                class="primary-btn connect-peer"
                data-id="${escapeHTML(
                    peer.id
                )}">

                <i class="fa-solid fa-user-plus"></i>

                Connect

            </button>


            <button
                class="secondary-btn view-peer"
                data-id="${escapeHTML(
                    peer.id
                )}">

                View

            </button>

        </div>

    `;


    return card;

}


// =========================================================
// LOAD GROUPS
// =========================================================

async function loadGroups() {

    showLoading(
        groupLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.groups
            );


        const groups =
            normalizeListResponse(data);


        renderGroups(groups);

    }

    catch (error) {

        console.error(
            "Group loading error:",
            error
        );

        showElement(
            groupEmptyState
        );

    }

    finally {

        showLoading(
            groupLoading,
            false
        );

    }

}


// =========================================================
// RENDER GROUPS
// =========================================================

function renderGroups(groups) {

    groupGrid.innerHTML = "";


    if (!groups.length) {

        showElement(
            groupEmptyState
        );

        return;

    }


    hideElement(
        groupEmptyState
    );


    groups.forEach(
        group => {

            groupGrid.appendChild(
                createGroupCard(group)
            );

        }
    );

}


// =========================================================
// GROUP CARD
// =========================================================

function createGroupCard(group) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "group-card";


    const groupId =
        group.id ??
        group.groupId;


    const title =
        group.name ??
        group.title ??
        "Study Group";


    const subject =
        group.subjectName ??
        group.subject ??
        "";


    const semester =
        group.semester ??
        "";


    const members =
        group.memberCount ??
        group.membersCount ??
        group.members ??
        0;


    const maxMembers =
        group.maxMembers ??
        group.capacity ??
        "";


    card.innerHTML = `

        <div class="group-icon">

            <i class="fa-solid fa-people-group"></i>

        </div>


        <h3>

            ${escapeHTML(title)}

        </h3>


        <p>

            ${escapeHTML(
                group.description ?? ""
            )}

        </p>


        <div class="group-meta">

            <span>
                ${escapeHTML(subject)}
            </span>


            <span>
                ${escapeHTML(
                    semester
                )}
            </span>


            <span>
                ${escapeHTML(
                    maxMembers
                        ? `${members}/${maxMembers} members`
                        : `${members} members`
                )}
            </span>

        </div>


        <div class="peer-actions">

            <button
                class="primary-btn join-group"
                data-id="${escapeHTML(
                    groupId
                )}">

                <i class="fa-solid fa-right-to-bracket"></i>

                Join Group

            </button>


            <button
                class="secondary-btn view-group"
                data-id="${escapeHTML(
                    groupId
                )}">

                View

            </button>

        </div>

    `;


    return card;

}


// =========================================================
// LOAD QUESTIONS
// =========================================================

async function loadQuestions() {

    showLoading(
        questionLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.questions
            );


        const questions =
            normalizeListResponse(data);


        renderQuestions(
            questions
        );

    }

    catch (error) {

        console.error(
            "Question loading error:",
            error
        );

        showElement(
            questionEmptyState
        );

    }

    finally {

        showLoading(
            questionLoading,
            false
        );

    }

}


// =========================================================
// RENDER QUESTIONS
// =========================================================

function renderQuestions(
    questions
) {

    questionList.innerHTML = "";


    if (!questions.length) {

        showElement(
            questionEmptyState
        );

        return;

    }


    hideElement(
        questionEmptyState
    );


    questions.forEach(
        question => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "question-card";


            card.innerHTML = `

                <div class="question-icon">

                    <i class="fa-solid fa-circle-question"></i>

                </div>


                <div class="question-content">

                    <h3>

                        ${escapeHTML(
                            question.title ??
                            question.question ??
                            ""
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            question.subjectName ??
                            question.subject ??
                            ""
                        )}

                    </p>


                    <div class="question-meta">

                        <span>

                            <i class="fa-regular fa-comment"></i>

                            ${escapeHTML(
                                String(
                                    question.answerCount ??
                                    question.answers ??
                                    0
                                )
                            )}
                            answers

                        </span>

                    </div>

                </div>


                <button
                    class="secondary-btn view-question"
                    data-id="${escapeHTML(
                        question.id ??
                        question.questionId ??
                        ""
                    )}">

                    View

                </button>

            `;


            questionList.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD SESSIONS
// =========================================================

async function loadSessions() {

    showLoading(
        sessionLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.sessions
            );


        const sessions =
            normalizeListResponse(data);


        renderSessions(
            sessions
        );

    }

    catch (error) {

        console.error(
            "Session loading error:",
            error
        );

        showElement(
            sessionEmptyState
        );

    }

    finally {

        showLoading(
            sessionLoading,
            false
        );

    }

}


// =========================================================
// RENDER SESSIONS
// =========================================================

function renderSessions(
    sessions
) {

    sessionList.innerHTML = "";


    if (!sessions.length) {

        showElement(
            sessionEmptyState
        );

        return;

    }


    hideElement(
        sessionEmptyState
    );


    sessions.forEach(
        session => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "session-card";


            card.innerHTML = `

                <div class="session-date">

                    <strong>
                        ${escapeHTML(
                            session.day ?? ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            session.month ?? ""
                        )}
                    </span>

                </div>


                <div class="session-content">

                    <h3>

                        ${escapeHTML(
                            session.title ??
                            session.name ??
                            ""
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            session.details ??
                            ""
                        )}

                    </p>

                </div>

            `;


            sessionList.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOAD ACTIVITY
// =========================================================

async function loadMyActivity() {

    showLoading(
        activityLoading,
        true
    );


    try {

        const data =
            await apiRequest(
                API_ENDPOINTS.activity
            );


        renderActivity(
            data
        );

    }

    catch (error) {

        console.error(
            "Activity loading error:",
            error
        );

        showElement(
            activityEmptyState
        );

    }

    finally {

        showLoading(
            activityLoading,
            false
        );

    }

}


// =========================================================
// RENDER ACTIVITY
// =========================================================

function renderActivity(
    activity
) {

    if (
        !activity ||
        typeof activity !== "object"
    ) {

        showElement(
            activityEmptyState
        );

        return;

    }


    const statistics = [

        {
            icon:
                "fa-people-group",

            value:
                activity.groupsJoined ??
                0,

            label:
                "Groups Joined"
        },


        {
            icon:
                "fa-user-check",

            value:
                activity.connections ??
                0,

            label:
                "Connections"
        },


        {
            icon:
                "fa-circle-question",

            value:
                activity.questionsAsked ??
                0,

            label:
                "Questions Asked"
        },


        {
            icon:
                "fa-comment-dots",

            value:
                activity.answersGiven ??
                0,

            label:
                "Answers Given"
        }

    ];


    statsGrid.innerHTML = "";


    statistics.forEach(
        statistic => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "stat-card";


            card.innerHTML = `

                <div class="stat-icon">

                    <i class="fa-solid ${escapeHTML(
                        statistic.icon
                    )}"></i>

                </div>


                <div>

                    <strong>
                        ${escapeHTML(
                            statistic.value
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            statistic.label
                        )}
                    </span>

                </div>

            `;


            statsGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// EVENT LISTENERS
// =========================================================

function setupEventListeners() {


    peerSearch.addEventListener(
        "input",
        debounce(
            loadPeers,
            350
        )
    );


    subjectFilter.addEventListener(
        "change",
        loadPeers
    );


    semesterFilter.addEventListener(
        "change",
        loadPeers
    );


    availabilityFilter.addEventListener(
        "change",
        loadPeers
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
                                button.dataset.scrollTarget
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
            "createGroupButton"
        )
        .addEventListener(
            "click",
            openCreateGroupModal
        );


    document
        .getElementById(
            "askQuestionButton"
        )
        .addEventListener(
            "click",
            openAskQuestionModal
        );


    document
        .getElementById(
            "retryPeersButton"
        )
        .addEventListener(
            "click",
            loadPeers
        );


    peerGrid.addEventListener(
        "click",
        handlePeerActions
    );


    groupGrid.addEventListener(
        "click",
        handleGroupActions
    );


    questionList.addEventListener(
        "click",
        handleQuestionActions
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
// PEER ACTIONS
// =========================================================

function handlePeerActions(
    event
) {

    const connectButton =
        event.target.closest(
            ".connect-peer"
        );


    const viewButton =
        event.target.closest(
            ".view-peer"
        );


    if (connectButton) {

        openConnectionModal(
            connectButton.dataset.id
        );

    }


    if (viewButton) {

        openPeerDetails(
            viewButton.dataset.id
        );

    }

}


// =========================================================
// GROUP ACTIONS
// =========================================================

function handleGroupActions(
    event
) {

    const joinButton =
        event.target.closest(
            ".join-group"
        );


    const viewButton =
        event.target.closest(
            ".view-group"
        );


    if (joinButton) {

        joinGroup(
            joinButton.dataset.id
        );

    }


    if (viewButton) {

        openGroupDetails(
            viewButton.dataset.id
        );

    }

}


// =========================================================
// QUESTION ACTIONS
// =========================================================

function handleQuestionActions(
    event
) {

    const viewButton =
        event.target.closest(
            ".view-question"
        );


    if (!viewButton) {

        return;

    }


    openQuestionDetails(
        viewButton.dataset.id
    );

}


// =========================================================
// CONNECTION
// =========================================================

function openConnectionModal(
    peerId
) {

    modalContent.innerHTML = `

        <h2>
            Send Connection Request
        </h2>


        <p>
            Send a learning connection request to
            this student.
        </p>


        <form
            id="connectionForm">


            <div class="form-group">

                <label>
                    Message
                </label>


                <textarea
                    id="connectionMessage"
                    placeholder="Write a short message..."
                    required>
                </textarea>

            </div>


            <button
                type="submit"
                class="form-submit">

                Send Request

            </button>

        </form>

    `;


    openModal();


    document
        .getElementById(
            "connectionForm"
        )
        .addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const message =
                    document
                        .getElementById(
                            "connectionMessage"
                        )
                        .value
                        .trim();


                try {

                    await apiRequest(
                        API_ENDPOINTS.connections,
                        {
                            method:
                                "POST",

                            body:
                                JSON.stringify({
                                    peerId,
                                    message
                                })
                        }
                    );


                    showSuccess(
                        "Connection request sent successfully."
                    );

                }

                catch (error) {

                    console.error(
                        error
                    );


                    showError(
                        "Unable to send the connection request."
                    );

                }

            }
        );

}


// =========================================================
// CREATE GROUP
// =========================================================

function openCreateGroupModal() {

    modalContent.innerHTML = `

        <h2>
            Create Study Group
        </h2>


        <p>
            Create a collaborative learning group.
        </p>


        <form id="createGroupForm">


            <div class="form-group">

                <label>
                    Group Name
                </label>


                <input
                    id="groupName"
                    type="text"
                    required>

            </div>


            <div class="form-group">

                <label>
                    Subject
                </label>


                <select
                    id="groupSubject"
                    required>

                    <option value="">
                        Select Subject
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Description
                </label>


                <textarea
                    id="groupDescription"
                    required>
                </textarea>

            </div>


            <div class="form-group">

                <label>
                    Maximum Members
                </label>


                <input
                    id="groupCapacity"
                    type="number"
                    min="2"
                    required>

            </div>


            <button
                type="submit"
                class="form-submit">

                Create Study Group

            </button>

        </form>

    `;


    openModal();


    populateModalSubjects();


    document
        .getElementById(
            "createGroupForm"
        )
        .addEventListener(
            "submit",
            submitCreateGroup
        );

}


// =========================================================
// POPULATE MODAL SUBJECTS
// =========================================================

async function populateModalSubjects() {

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
                "groupSubject"
            );


        subjects.forEach(
            subject => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    typeof subject === "object"
                        ? (
                            subject.id ??
                            subject.value ??
                            ""
                        )
                        : subject;


                option.textContent =
                    typeof subject === "object"
                        ? (
                            subject.name ??
                            subject.label ??
                            subject.title ??
                            ""
                        )
                        : subject;


                select.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load subjects:",
            error
        );

    }

}


// =========================================================
// CREATE GROUP REQUEST
// =========================================================

async function submitCreateGroup(
    event
) {

    event.preventDefault();


    const payload = {

        name:
            document
                .getElementById(
                    "groupName"
                )
                .value
                .trim(),

        subjectId:
            document
                .getElementById(
                    "groupSubject"
                )
                .value,

        description:
            document
                .getElementById(
                    "groupDescription"
                )
                .value
                .trim(),

        maxMembers:
            Number(
                document
                    .getElementById(
                        "groupCapacity"
                    )
                    .value
            )

    };


    try {

        await apiRequest(
            API_ENDPOINTS.groups,
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


        await loadGroups();


        showSuccess(
            "Study group created successfully."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to create the study group."
        );

    }

}


// =========================================================
// JOIN GROUP
// =========================================================

async function joinGroup(
    groupId
) {

    try {

        await apiRequest(
            API_ENDPOINTS.joinGroup(
                groupId
            ),
            {
                method:
                    "POST"
            }
        );


        await loadGroups();


        showSuccess(
            "You have joined the study group."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to join this study group."
        );

    }

}


// =========================================================
// ASK QUESTION
// =========================================================

function openAskQuestionModal() {

    modalContent.innerHTML = `

        <h2>
            Ask a Question
        </h2>


        <p>
            Share an academic question with your peers.
        </p>


        <form id="questionForm">


            <div class="form-group">

                <label>
                    Question
                </label>


                <input
                    id="questionTitle"
                    type="text"
                    required>

            </div>


            <div class="form-group">

                <label>
                    Subject
                </label>


                <select
                    id="questionSubject"
                    required>

                    <option value="">
                        Select Subject
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Details
                </label>


                <textarea
                    id="questionDetails"
                    required>
                </textarea>

            </div>


            <button
                type="submit"
                class="form-submit">

                Post Question

            </button>

        </form>

    `;


    openModal();


    populateQuestionSubjects();


    document
        .getElementById(
            "questionForm"
        )
        .addEventListener(
            "submit",
            submitQuestion
        );

}


// =========================================================
// QUESTION SUBJECTS
// =========================================================

async function populateQuestionSubjects() {

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
                "questionSubject"
            );


        subjects.forEach(
            subject => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    typeof subject === "object"
                        ? (
                            subject.id ??
                            subject.value ??
                            ""
                        )
                        : subject;


                option.textContent =
                    typeof subject === "object"
                        ? (
                            subject.name ??
                            subject.label ??
                            subject.title ??
                            ""
                        )
                        : subject;


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
// QUESTION REQUEST
// =========================================================

async function submitQuestion(
    event
) {

    event.preventDefault();


    const payload = {

        title:
            document
                .getElementById(
                    "questionTitle"
                )
                .value
                .trim(),

        subjectId:
            document
                .getElementById(
                    "questionSubject"
                )
                .value,

        details:
            document
                .getElementById(
                    "questionDetails"
                )
                .value
                .trim()

    };


    try {

        await apiRequest(
            API_ENDPOINTS.questions,
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


        await loadQuestions();


        showSuccess(
            "Question posted successfully."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to post your question."
        );

    }

}


// =========================================================
// DETAIL VIEWS
// =========================================================

async function openPeerDetails(
    peerId
) {

    try {

        const peer =
            await apiRequest(
                `${API_ENDPOINTS.peers}/${encodeURIComponent(peerId)}`
            );


        modalContent.innerHTML = `

            <h2>
                ${escapeHTML(
                    peer.name ??
                    peer.fullName ??
                    "Student"
                )}
            </h2>


            <p>

                ${escapeHTML(
                    peer.description ??
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
            "Unable to load student details."
        );

    }

}


// =========================================================
// GROUP DETAILS
// =========================================================

async function openGroupDetails(
    groupId
) {

    try {

        const group =
            await apiRequest(
                `${API_ENDPOINTS.groups}/${encodeURIComponent(groupId)}`
            );


        modalContent.innerHTML = `

            <h2>
                ${escapeHTML(
                    group.name ??
                    group.title ??
                    "Study Group"
                )}
            </h2>


            <p>

                ${escapeHTML(
                    group.description ??
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
            "Unable to load group details."
        );

    }

}


// =========================================================
// QUESTION DETAILS
// =========================================================

async function openQuestionDetails(
    questionId
) {

    try {

        const question =
            await apiRequest(
                `${API_ENDPOINTS.questions}/${encodeURIComponent(questionId)}`
            );


        modalContent.innerHTML = `

            <h2>

                ${escapeHTML(
                    question.title ??
                    question.question ??
                    ""
                )}

            </h2>


            <p>

                ${escapeHTML(
                    question.details ??
                    question.description ??
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
            "Unable to load the discussion."
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
// SUCCESS / ERROR
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
                class="form-submit"
                onclick="closeModal()">

                Done

            </button>

        </div>

    `;


    openModal();

}


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
                class="form-submit"
                onclick="closeModal()">

                Close

            </button>

        </div>

    `;


    openModal();

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
                () => callback(...args),
                delay
            );

    };

}