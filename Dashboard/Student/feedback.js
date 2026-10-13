/* =====================================================
   CAMPUSCONNECT - FEEDBACK MODULE
   FINAL FRONTEND
   Java Backend + MySQL Ready
===================================================== */


/* =====================================================
   API CONFIGURATION
   -----------------------------------------------
   Change only the API_BASE_URL when the Java backend
   is deployed.
===================================================== */

const API_BASE_URL = "/api";


/* =====================================================
   API ENDPOINTS
===================================================== */

const API = {

    feedback:
        `${API_BASE_URL}/feedback`,

    categories:
        `${API_BASE_URL}/feedback/categories`,

    myFeedback:
        `${API_BASE_URL}/feedback/my`,

    vote:
        feedbackId =>
            `${API_BASE_URL}/feedback/${feedbackId}/vote`

};


/* =====================================================
   DOM
===================================================== */

const elements = {

    feedbackList:
        document.getElementById("feedbackList"),

    myFeedbackList:
        document.getElementById("myFeedbackList"),

    myFeedbackSection:
        document.getElementById("myFeedbackSection"),

    feedbackFormSection:
        document.getElementById("feedbackFormSection"),

    feedbackForm:
        document.getElementById("feedbackForm"),

    feedbackTitle:
        document.getElementById("feedbackTitle"),

    feedbackCategory:
        document.getElementById("feedbackCategory"),

    feedbackDescription:
        document.getElementById("feedbackDescription"),

    descriptionCount:
        document.getElementById("descriptionCount"),

    totalFeedback:
        document.getElementById("totalFeedback"),

    activeFeedback:
        document.getElementById("activeFeedback"),

    resolvedFeedback:
        document.getElementById("resolvedFeedback"),

    search:
        document.getElementById("feedbackSearch"),

    statusFilter:
        document.getElementById("statusFilter"),

    sortFilter:
        document.getElementById("sortFilter"),

    toast:
        document.getElementById("toast"),

    toastTitle:
        document.getElementById("toastTitle"),

    toastMessage:
        document.getElementById("toastMessage"),

    toastIcon:
        document.getElementById("toastIcon"),

    submitButton:
        document.getElementById(
            "submitFeedbackButton"
        )

};


/* =====================================================
   STATE
===================================================== */

const state = {

    feedback: [],

    categories: [],

    myFeedback: [],

    currentUser: null,

    loading: false

};


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeFeedback
);


async function initializeFeedback() {

    state.currentUser =
        getCurrentUser();


    bindEvents();


    await Promise.all([
        loadCategories(),
        loadFeedback()
    ]);

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function bindEvents() {

    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            goBack
        );


    document
        .getElementById("openFeedbackButton")
        .addEventListener(
            "click",
            openFeedbackForm
        );


    document
        .getElementById("closeFeedbackButton")
        .addEventListener(
            "click",
            closeFeedbackForm
        );


    document
        .getElementById("myFeedbackButton")
        .addEventListener(
            "click",
            loadAndShowMyFeedback
        );


    document
        .getElementById("refreshButton")
        .addEventListener(
            "click",
            loadFeedback
        );


    elements.feedbackForm
        .addEventListener(
            "submit",
            submitFeedback
        );


    elements.feedbackDescription
        .addEventListener(
            "input",
            updateCharacterCount
        );


    elements.search
        .addEventListener(
            "input",
            applyFilters
        );


    elements.statusFilter
        .addEventListener(
            "change",
            applyFilters
        );


    elements.sortFilter
        .addEventListener(
            "change",
            applyFilters
        );


    elements.feedbackList
        .addEventListener(
            "click",
            handleFeedbackAction
        );


    elements.myFeedbackList
        .addEventListener(
            "click",
            handleFeedbackAction
        );

}


/* =====================================================
   CURRENT USER
   -----------------------------------------------
   Reads the existing CampusConnect login/session data.
   No student identity is hardcoded here.
===================================================== */

function getCurrentUser() {

    const possibleKeys = [
        "currentUser",
        "studentData",
        "userData",
        "loggedInUser"
    ];


    for (const key of possibleKeys) {

        const stored =
            localStorage.getItem(key);


        if (!stored) {
            continue;
        }


        try {

            const parsed =
                JSON.parse(stored);


            if (parsed &&
                typeof parsed === "object") {

                return parsed;

            }

        } catch (error) {

            console.warn(
                `Unable to parse ${key}.`
            );

        }

    }


    return null;

}


/* =====================================================
   API REQUEST HELPER
===================================================== */

async function apiRequest(
    url,
    options = {}
) {

    const requestOptions = {

        ...options,

        headers: {

            "Content-Type":
                "application/json",

            ...(options.headers || {})

        }

    };


    const response =
        await fetch(
            url,
            requestOptions
        );


    if (response.status === 401) {

        handleUnauthorized();

        throw new Error(
            "Authentication required."
        );

    }


    if (!response.ok) {

        let message =
            "Unable to complete the request.";


        try {

            const errorData =
                await response.json();


            if (errorData.message) {

                message =
                    errorData.message;

            }

        } catch (error) {

            // Server did not return JSON.
        }


        throw new Error(message);

    }


    if (response.status === 204) {

        return null;

    }


    return response.json();

}


/* =====================================================
   LOAD CATEGORIES
===================================================== */

async function loadCategories() {

    try {

        const response =
            await apiRequest(
                API.categories
            );


        state.categories =
            normalizeArray(response);


        renderCategories();

    } catch (error) {

        console.error(
            "Category loading error:",
            error
        );


        elements.feedbackCategory.innerHTML = `

            <option value="">
                Unable to load categories
            </option>

        `;

    }

}


/* =====================================================
   RENDER CATEGORIES
===================================================== */

function renderCategories() {

    elements.feedbackCategory.innerHTML = `

        <option value="">
            Select a category
        </option>

    `;


    state.categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                getObjectValue(
                    category,
                    [
                        "id",
                        "categoryId",
                        "value"
                    ]
                );


            option.textContent =
                getObjectValue(
                    category,
                    [
                        "name",
                        "categoryName",
                        "label"
                    ]
                );


            elements.feedbackCategory
                .appendChild(option);

        }
    );

}


/* =====================================================
   LOAD ALL PUBLISHED FEEDBACK
===================================================== */

async function loadFeedback() {

    showLoading();


    try {

        const response =
            await apiRequest(
                API.feedback
            );


        state.feedback =
            normalizeArray(response);


        updateStatistics();


        applyFilters();

    } catch (error) {

        console.error(
            "Feedback loading error:",
            error
        );


        showError(
            "Unable to load feedback.",
            loadFeedback
        );

    }

}


/* =====================================================
   LOAD MY FEEDBACK
===================================================== */

async function loadAndShowMyFeedback() {

    elements.myFeedbackSection
        .hidden = false;


    elements.myFeedbackList.innerHTML = `

        <div class="loading-state">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Loading your feedback...
            </span>

        </div>

    `;


    elements.myFeedbackSection
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    try {

        const response =
            await apiRequest(
                API.myFeedback
            );


        state.myFeedback =
            normalizeArray(response);


        renderFeedbackList(
            state.myFeedback,
            elements.myFeedbackList
        );

    } catch (error) {

        console.error(
            "My feedback loading error:",
            error
        );


        showError(
            "Unable to load your feedback.",
            loadAndShowMyFeedback,
            elements.myFeedbackList
        );

    }

}


/* =====================================================
   SUBMIT FEEDBACK
===================================================== */

async function submitFeedback(event) {

    event.preventDefault();


    const title =
        elements.feedbackTitle
            .value
            .trim();


    const categoryId =
        elements.feedbackCategory
            .value;


    const description =
        elements.feedbackDescription
            .value
            .trim();


    if (!title) {

        showToast(
            "Error",
            "Please enter a problem title.",
            "error"
        );

        return;

    }


    if (!categoryId) {

        showToast(
            "Error",
            "Please select a category.",
            "error"
        );

        return;

    }


    if (!description) {

        showToast(
            "Error",
            "Please describe the problem.",
            "error"
        );

        return;

    }


    setSubmitState(true);


    try {

        await apiRequest(
            API.feedback,
            {

                method: "POST",

                body: JSON.stringify({

                    title:
                        title,

                    categoryId:
                        categoryId,

                    description:
                        description

                })

            }
        );


        elements.feedbackForm
            .reset();


        updateCharacterCount();


        closeFeedbackForm();


        showToast(
            "Feedback Submitted",
            "Your feedback has been submitted successfully.",
            "success"
        );


        await loadFeedback();


    } catch (error) {

        console.error(
            "Feedback submission error:",
            error
        );


        showToast(
            "Submission Failed",
            error.message,
            "error"
        );

    } finally {

        setSubmitState(false);

    }

}


/* =====================================================
   VOTING
===================================================== */

async function submitVote(
    feedbackId,
    voteType
) {

    if (!feedbackId) {
        return;
    }


    try {

        await apiRequest(
            API.vote(feedbackId),
            {

                method: "POST",

                body: JSON.stringify({

                    vote:
                        voteType

                })

            }
        );


        showToast(
            "Vote Updated",
            "Your response has been recorded.",
            "success"
        );


        await loadFeedback();


    } catch (error) {

        console.error(
            "Vote error:",
            error
        );


        showToast(
            "Vote Failed",
            error.message,
            "error"
        );

    }

}


/* =====================================================
   FEEDBACK ACTION HANDLER
===================================================== */

function handleFeedbackAction(event) {

    const button =
        event.target.closest(
            "[data-vote]"
        );


    if (!button) {
        return;
    }


    const feedbackId =
        button.dataset.feedbackId;


    const voteType =
        button.dataset.vote;


    submitVote(
        feedbackId,
        voteType
    );

}


/* =====================================================
   FILTERING
===================================================== */

function applyFilters() {

    const searchText =
        elements.search
            .value
            .trim()
            .toLowerCase();


    const status =
        elements.statusFilter
            .value;


    const sort =
        elements.sortFilter
            .value;


    let filtered =
        [...state.feedback];


    if (searchText) {

        filtered =
            filtered.filter(
                feedback => {

                    const title =
                        getFeedbackTitle(
                            feedback
                        ).toLowerCase();


                    const description =
                        getFeedbackDescription(
                            feedback
                        ).toLowerCase();


                    const category =
                        getFeedbackCategory(
                            feedback
                        ).toLowerCase();


                    return (

                        title.includes(
                            searchText
                        )

                        ||

                        description.includes(
                            searchText
                        )

                        ||

                        category.includes(
                            searchText
                        )

                    );

                }
            );

    }


    if (status !== "all") {

        filtered =
            filtered.filter(
                feedback => {

                    return normalizeStatus(
                        getFeedbackStatus(
                            feedback
                        )
                    ) ===
                    normalizeStatus(
                        status
                    );

                }
            );

    }


    if (sort === "popular") {

        filtered.sort(
            (a, b) =>
                getLikeCount(b) -
                getLikeCount(a)
        );

    } else {

        filtered.sort(
            (a, b) =>
                getDateValue(b) -
                getDateValue(a)
        );

    }


    renderFeedbackList(
        filtered,
        elements.feedbackList
    );

}


/* =====================================================
   RENDER FEEDBACK
===================================================== */

function renderFeedbackList(
    feedbackItems,
    container
) {

    container.innerHTML = "";


    if (!feedbackItems.length) {

        showEmptyState(
            container,
            "No feedback found.",
            "fa-regular fa-comments"
        );

        return;

    }


    feedbackItems.forEach(
        feedback => {

            container.appendChild(
                createFeedbackCard(
                    feedback
                )
            );

        }
    );

}


/* =====================================================
   CREATE FEEDBACK CARD
===================================================== */

function createFeedbackCard(
    feedback
) {

    const card =
        document.createElement("article");


    card.className =
        "feedback-card";


    const feedbackId =
        getFeedbackId(feedback);


    const title =
        getFeedbackTitle(feedback);


    const category =
        getFeedbackCategory(feedback);


    const description =
        getFeedbackDescription(feedback);


    const status =
        getFeedbackStatus(feedback);


    const likes =
        getLikeCount(feedback);


    const dislikes =
        getDislikeCount(feedback);


    const userVote =
        getUserVote(feedback);


    const date =
        getFeedbackDate(feedback);


    const response =
        getOfficialResponse(feedback);


    const statusClass =
        status
            .toLowerCase()
            .replace(/\s+/g, "-");


    card.innerHTML = `

        <div class="feedback-header">

            <div class="feedback-title">

                <div class="feedback-title-icon">

                    <i class="fa-solid fa-circle-exclamation"></i>

                </div>

                <div>

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    <div class="feedback-category">

                        ${escapeHTML(category)}

                    </div>

                </div>

            </div>


            <span class="status ${escapeHTML(statusClass)}">

                ${escapeHTML(status)}

            </span>

        </div>


        <p class="feedback-description">

            ${escapeHTML(description)}

        </p>


        ${
            response
            ?
            `

            <div class="official-response">

                <div class="response-heading">

                    <i class="fa-solid fa-building-columns"></i>

                    Official Response

                </div>

                <div class="response-text">

                    ${escapeHTML(response)}

                </div>

            </div>

            `
            :
            ""
        }


        <div class="feedback-meta">

            <span>

                ${escapeHTML(date)}

            </span>


            <div class="vote-section">

                <button
                    type="button"
                    class="vote-btn ${
                        userVote === "LIKE"
                            ? "active"
                            : ""
                    }"
                    data-vote="LIKE"
                    data-feedback-id="${escapeHTML(feedbackId)}"
                    aria-label="Like this feedback"
                >

                    <i class="fa-regular fa-thumbs-up"></i>

                    <span>
                        ${likes}
                    </span>

                </button>


                <button
                    type="button"
                    class="vote-btn dislike ${
                        userVote === "DISLIKE"
                            ? "active"
                            : ""
                    }"
                    data-vote="DISLIKE"
                    data-feedback-id="${escapeHTML(feedbackId)}"
                    aria-label="Dislike this feedback"
                >

                    <i class="fa-regular fa-thumbs-down"></i>

                    <span>
                        ${dislikes}
                    </span>

                </button>

            </div>

        </div>

    `;


    return card;

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    const total =
        state.feedback.length;


    const active =
        state.feedback.filter(
            feedback => {

                const status =
                    normalizeStatus(
                        getFeedbackStatus(
                            feedback
                        )
                    );


                return (
                    status === "submitted"
                    ||
                    status === "under review"
                    ||
                    status === "in progress"
                );

            }
        ).length;


    const resolved =
        state.feedback.filter(
            feedback =>
                normalizeStatus(
                    getFeedbackStatus(
                        feedback
                    )
                ) ===
                "resolved"
        ).length;


    elements.totalFeedback.textContent =
        total;


    elements.activeFeedback.textContent =
        active;


    elements.resolvedFeedback.textContent =
        resolved;

}


/* =====================================================
   FORM UI
===================================================== */

function openFeedbackForm() {

    elements.feedbackFormSection
        .hidden = false;


    elements.feedbackFormSection
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    elements.feedbackTitle.focus();

}


function closeFeedbackForm() {

    elements.feedbackFormSection
        .hidden = true;

}


function updateCharacterCount() {

    elements.descriptionCount.textContent =
        elements.feedbackDescription
            .value
            .length;

}


/* =====================================================
   SUBMIT BUTTON
===================================================== */

function setSubmitState(
    submitting
) {

    elements.submitButton.disabled =
        submitting;


    if (submitting) {

        elements.submitButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Submitting...

        `;

    } else {

        elements.submitButton.innerHTML = `

            <i class="fa-solid fa-paper-plane"></i>

            Submit Feedback

        `;

    }

}


/* =====================================================
   LOADING
===================================================== */

function showLoading() {

    elements.feedbackList.innerHTML = `

        <div class="loading-state">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Loading feedback...
            </span>

        </div>

    `;

}


/* =====================================================
   EMPTY STATE
===================================================== */

function showEmptyState(
    container,
    message,
    icon
) {

    container.innerHTML = `

        <div class="empty-state">

            <i class="${icon}"></i>

            <span>
                ${escapeHTML(message)}
            </span>

        </div>

    `;

}


/* =====================================================
   ERROR STATE
===================================================== */

function showError(
    message,
    retryFunction,
    container = elements.feedbackList
) {

    container.innerHTML = `

        <div class="error-state">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <span>
                ${escapeHTML(message)}
            </span>

            <button
                type="button"
                class="retry-btn"
                id="retryFeedbackButton"
            >
                Try Again
            </button>

        </div>

    `;


    document
        .getElementById(
            "retryFeedbackButton"
        )
        ?.addEventListener(
            "click",
            retryFunction
        );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    title,
    message,
    type
) {

    elements.toastTitle.textContent =
        title;


    elements.toastMessage.textContent =
        message;


    elements.toast.className =
        `toast show ${type}`;


    elements.toastIcon.className =
        type === "success"
            ?
            "toast-icon fa-solid fa-circle-check"
            :
            "toast-icon fa-solid fa-circle-exclamation";


    clearTimeout(
        showToast.timeout
    );


    showToast.timeout =
        setTimeout(
            () => {

                elements.toast
                    .classList
                    .remove("show");

            },
            3500
        );

}


/* =====================================================
   BACK
===================================================== */

function goBack() {

    if (window.history.length > 1) {

        window.history.back();

        return;

    }


    window.location.href =
        "student-dashboard.html";

}


/* =====================================================
   UNAUTHORIZED
===================================================== */

function handleUnauthorized() {

    localStorage.removeItem(
        "currentUser"
    );


    window.location.href =
        "../Login/Login.html";

}


/* =====================================================
   RESPONSE HELPERS
===================================================== */

function normalizeArray(
    response
) {

    if (Array.isArray(response)) {

        return response;

    }


    if (
        response &&
        Array.isArray(response.content)
    ) {

        return response.content;

    }


    if (
        response &&
        Array.isArray(response.data)
    ) {

        return response.data;

    }


    if (
        response &&
        Array.isArray(response.items)
    ) {

        return response.items;

    }


    return [];

}


function getObjectValue(
    object,
    keys
) {

    for (const key of keys) {

        if (
            object &&
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];

        }

    }


    return "";

}


/* =====================================================
   FEEDBACK DATA ACCESSORS
   -----------------------------------------------
   Supports normal Java/Spring JSON naming.
===================================================== */

function getFeedbackId(
    feedback
) {

    return getObjectValue(
        feedback,
        [
            "feedbackId",
            "id"
        ]
    );

}


function getFeedbackTitle(
    feedback
) {

    return getObjectValue(
        feedback,
        [
            "title",
            "feedbackTitle"
        ]
    );

}


function getFeedbackCategory(
    feedback
) {

    return getObjectValue(
        feedback,
        [
            "categoryName",
            "category",
            "categoryTitle"
        ]
    );

}


function getFeedbackDescription(
    feedback
) {

    return getObjectValue(
        feedback,
        [
            "description",
            "message",
            "feedback"
        ]
    );

}


function getFeedbackStatus(
    feedback
) {

    return getObjectValue(
        feedback,
        [
            "status"
        ]
    ) || "Submitted";

}


function getLikeCount(
    feedback
) {

    return Number(
        getObjectValue(
            feedback,
            [
                "likeCount",
                "likes",
                "upvotes"
            ]
        )
    ) || 0;

}


function getDislikeCount(
    feedback
) {

    return Number(
        getObjectValue(
            feedback,
            [
                "dislikeCount",
                "dislikes",
                "downvotes"
            ]
        )
    ) || 0;

}


function getUserVote(
    feedback
) {

    return getObjectValue(
        feedback,
        [
            "currentUserVote",
            "userVote",
            "myVote"
        ]
    );

}


function getFeedbackDate(
    feedback
) {

    const value =
        getObjectValue(
            feedback,
            [
                "createdAt",
                "createdDate",
                "date"
            ]
        );


    if (!value) {

        return "";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getDateValue(
    feedback
) {

    const value =
        getObjectValue(
            feedback,
            [
                "createdAt",
                "createdDate",
                "date"
            ]
        );


    const time =
        new Date(value)
            .getTime();


    return Number.isNaN(time)
        ? 0
        : time;

}


function getOfficialResponse(
    feedback
) {

    return getObjectValue(
        feedback,
        [
            "officialResponse",
            "adminResponse",
            "facultyResponse",
            "response"
        ]
    );

}


/* =====================================================
   STATUS
===================================================== */

function normalizeStatus(
    status
) {

    return String(status)
        .trim()
        .toLowerCase()
        .replace(/_/g, " ");

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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