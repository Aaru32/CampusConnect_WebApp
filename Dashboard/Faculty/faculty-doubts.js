/* =====================================================
   CAMPUSCONNECT
   FACULTY - STUDENT DOUBTS
   API READY FOR JAVA + MYSQL
===================================================== */

"use strict";


/* =====================================================
   CONFIGURATION
===================================================== */

const CONFIG = {

    /*
     * Keep empty until the Java backend is connected.
     *
     * Later example:
     *
     * API_BASE_URL: "http://localhost:8080/api"
     */

    API_BASE_URL: ""

};


/* =====================================================
   API ENDPOINTS
===================================================== */

const ENDPOINTS = {

    doubts:
        "/faculty/doubts",

    statistics:
        "/faculty/doubts/statistics",

    subjects:
        "/faculty/doubts/subjects",

    answer:
        "/faculty/doubts/{id}/answer"

};


/* =====================================================
   DOM ELEMENTS
===================================================== */

const backBtn =
    document.getElementById("backBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const totalDoubts =
    document.getElementById("totalDoubts");

const pendingDoubts =
    document.getElementById("pendingDoubts");

const answeredDoubts =
    document.getElementById("answeredDoubts");

const doubtSearch =
    document.getElementById("doubtSearch");

const subjectFilter =
    document.getElementById("subjectFilter");

const statusFilter =
    document.getElementById("statusFilter");

const resultCount =
    document.getElementById("resultCount");

const emptyState =
    document.getElementById("emptyState");

const doubtsList =
    document.getElementById("doubtsList");

const doubtModal =
    document.getElementById("doubtModal");

const closeModal =
    document.getElementById("closeModal");

const cancelModal =
    document.getElementById("cancelModal");

const submitAnswerBtn =
    document.getElementById("submitAnswerBtn");

const modalStudentName =
    document.getElementById("modalStudentName");

const modalSubject =
    document.getElementById("modalSubject");

const modalSemester =
    document.getElementById("modalSemester");

const modalDate =
    document.getElementById("modalDate");

const modalQuestion =
    document.getElementById("modalQuestion");

const modalAnswer =
    document.getElementById("modalAnswer");

const existingAnswer =
    document.getElementById("existingAnswer");

const answerInput =
    document.getElementById("answerInput");

const modalDoubtTitle =
    document.getElementById("modalDoubtTitle");


/* =====================================================
   STATE
===================================================== */

let doubts = [];

let selectedDoubt = null;


/* =====================================================
   API HELPER
===================================================== */

async function apiRequest(
    endpoint,
    options = {}
) {

    const url =
        CONFIG.API_BASE_URL +
        endpoint;


    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                }

            }
        );


    if (!response.ok) {

        throw new Error(
            `Request failed: ${response.status}`
        );

    }


    return response.json();

}


/* =====================================================
   LOAD DOUBT STATISTICS
===================================================== */

async function loadDoubtStatistics() {

    if (
        !totalDoubts ||
        !pendingDoubts ||
        !answeredDoubts
    ) {

        return;

    }


    totalDoubts.textContent = "—";
    pendingDoubts.textContent = "—";
    answeredDoubts.textContent = "—";


    try {

        const data =
            await apiRequest(
                ENDPOINTS.statistics
            );


        totalDoubts.textContent =
            Number.isFinite(
                Number(data.total)
            )
                ? Number(data.total)
                : "0";


        pendingDoubts.textContent =
            Number.isFinite(
                Number(data.pending)
            )
                ? Number(data.pending)
                : "0";


        answeredDoubts.textContent =
            Number.isFinite(
                Number(data.answered)
            )
                ? Number(data.answered)
                : "0";


    } catch (error) {

        console.error(
            "Unable to load doubt statistics:",
            error
        );


        totalDoubts.textContent = "—";
        pendingDoubts.textContent = "—";
        answeredDoubts.textContent = "—";

    }

}


/* =====================================================
   LOAD SUBJECTS
===================================================== */

async function loadSubjects() {

    if (!subjectFilter) return;


    /*
     * Keep only the default option.
     */

    subjectFilter.innerHTML = `

        <option value="all">
            All Subjects
        </option>

    `;


    try {

        const data =
            await apiRequest(
                ENDPOINTS.subjects
            );


        if (
            !Array.isArray(data)
        ) {

            return;

        }


        data.forEach(
            subject => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subject.id ??
                    subject.code ??
                    subject.name;


                option.textContent =
                    subject.name ??
                    subject.subjectName ??
                    subject.title ??
                    "Subject";


                subjectFilter.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load subjects:",
            error
        );

    }

}


/* =====================================================
   LOAD DOUBTS
===================================================== */

async function loadDoubts() {

    showLoadingState();


    try {

        const data =
            await apiRequest(
                ENDPOINTS.doubts
            );


        doubts =
            Array.isArray(data)
                ? data
                : [];


        displayDoubts();


    } catch (error) {

        console.error(
            "Unable to load student doubts:",
            error
        );


        /*
         * Backend is not connected yet.
         *
         * Do NOT create fake doubts.
         */

        doubts = [];

        displayDoubts();

    }

}


/* =====================================================
   LOADING STATE
===================================================== */

function showLoadingState() {

    if (!doubtsList) return;


    emptyState.style.display =
        "none";


    doubtsList.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">

                <i class="fa-solid fa-rotate"></i>

            </div>

            <h3>
                Loading Doubts
            </h3>

            <p>
                Loading student doubts...
            </p>

        </div>

    `;

}


/* =====================================================
   FILTER DOUBTS
===================================================== */

function getFilteredDoubts() {

    const search =
        (
            doubtSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const subject =
        subjectFilter?.value ||
        "all";


    const status =
        statusFilter?.value ||
        "all";


    return doubts.filter(
        doubt => {

            const studentName =
                String(
                    doubt.studentName ||
                    doubt.student?.name ||
                    ""
                ).toLowerCase();


            const question =
                String(
                    doubt.question ||
                    doubt.title ||
                    ""
                ).toLowerCase();


            const subjectName =
                String(
                    doubt.subjectName ||
                    doubt.subject?.name ||
                    doubt.subject ||
                    ""
                ).toLowerCase();


            const doubtStatus =
                String(
                    doubt.status ||
                    "pending"
                ).toLowerCase();


            const matchesSearch =
                !search ||
                studentName.includes(search) ||
                question.includes(search) ||
                subjectName.includes(search);


            const doubtSubjectId =
                String(
                    doubt.subjectId ||
                    doubt.subject?.id ||
                    ""
                );


            const matchesSubject =
                subject === "all" ||
                doubtSubjectId ===
                    String(subject) ||
                subjectName ===
                    String(subject).toLowerCase();


            const matchesStatus =
                status === "all" ||
                doubtStatus === status;


            return (
                matchesSearch &&
                matchesSubject &&
                matchesStatus
            );

        }
    );

}


/* =====================================================
   DISPLAY DOUBTS
===================================================== */

function displayDoubts() {

    if (
        !doubtsList ||
        !emptyState
    ) {

        return;

    }


    doubtsList.innerHTML = "";


    const filteredDoubts =
        getFilteredDoubts();


    if (
        filteredDoubts.length === 0
    ) {

        emptyState.style.display =
            "block";


        if (doubts.length === 0) {

            resultCount.textContent =
                "No doubts available";

        } else {

            resultCount.textContent =
                "No doubts match the selected filters";

        }


        return;

    }


    emptyState.style.display =
        "none";


    resultCount.textContent =
        `${filteredDoubts.length} ${
            filteredDoubts.length === 1
                ? "doubt"
                : "doubts"
        }`;


    filteredDoubts.forEach(
        doubt => {

            doubtsList.appendChild(
                createDoubtCard(doubt)
            );

        }
    );

}


/* =====================================================
   CREATE DOUBT CARD
===================================================== */

function createDoubtCard(doubt) {

    const card =
        document.createElement("article");


    card.className =
        "doubt-card";


    const studentName =
        escapeHTML(
            doubt.studentName ||
            doubt.student?.name ||
            "Student"
        );


    const subjectName =
        escapeHTML(
            doubt.subjectName ||
            doubt.subject?.name ||
            doubt.subject ||
            "Subject"
        );


    const question =
        escapeHTML(
            doubt.question ||
            doubt.title ||
            "Student doubt"
        );


    const semester =
        escapeHTML(
            doubt.semester ||
            doubt.student?.semester ||
            "—"
        );


    const date =
        formatDate(
            doubt.createdAt ||
            doubt.submittedAt ||
            doubt.date
        );


    const status =
        String(
            doubt.status ||
            "pending"
        ).toLowerCase();


    const statusText =
        status === "answered"
            ? "Answered"
            : "Pending";


    card.innerHTML = `

        <div class="doubt-main">

            <div class="doubt-top">

                <span class="doubt-subject">
                    ${subjectName}
                </span>

                <span class="status-badge ${status}">
                    ${statusText}
                </span>

            </div>


            <h3 class="doubt-title">
                ${question}
            </h3>


            <div class="doubt-meta">

                <span>

                    <i class="fa-solid fa-user"></i>

                    ${studentName}

                </span>


                <span>

                    <i class="fa-solid fa-graduation-cap"></i>

                    ${semester}

                </span>


                <span>

                    <i class="fa-regular fa-calendar"></i>

                    ${date}

                </span>

            </div>

        </div>


        <div class="doubt-action">

            <button
                type="button"
                class="view-doubt-btn"
                aria-label="View doubt">

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>

    `;


    card.addEventListener(
        "click",
        function () {

            openDoubtModal(doubt);

        }
    );


    return card;

}


/* =====================================================
   OPEN DOUBT MODAL
===================================================== */

function openDoubtModal(doubt) {

    selectedDoubt =
        doubt;


    const studentName =
        doubt.studentName ||
        doubt.student?.name ||
        "Student";


    const subjectName =
        doubt.subjectName ||
        doubt.subject?.name ||
        doubt.subject ||
        "Subject";


    const semester =
        doubt.semester ||
        doubt.student?.semester ||
        "—";


    const question =
        doubt.question ||
        doubt.title ||
        "—";


    const answer =
        doubt.answer ||
        doubt.response ||
        "";


    modalDoubtTitle.textContent =
        question;


    modalStudentName.textContent =
        studentName;


    modalSubject.textContent =
        subjectName;


    modalSemester.textContent =
        semester;


    modalDate.textContent =
        formatDate(
            doubt.createdAt ||
            doubt.submittedAt ||
            doubt.date
        );


    modalQuestion.textContent =
        question;


    answerInput.value =
        answer;


    if (answer) {

        existingAnswer.classList.add(
            "visible"
        );

        modalAnswer.textContent =
            answer;

    } else {

        existingAnswer.classList.remove(
            "visible"
        );

        modalAnswer.textContent =
            "—";

    }


    /*
     * Already answered doubts can still
     * be edited/replied to.
     */

    submitAnswerBtn.innerHTML = `

        <i class="fa-solid fa-paper-plane"></i>

        ${answer ? "Update Answer" : "Submit Answer"}

    `;


    doubtModal.classList.add(
        "active"
    );


    doubtModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(
        () => {

            answerInput.focus();

        },
        100
    );

}


/* =====================================================
   CLOSE DOUBT MODAL
===================================================== */

function closeDoubtModal() {

    doubtModal.classList.remove(
        "active"
    );


    doubtModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    selectedDoubt =
        null;

}


/* =====================================================
   SUBMIT ANSWER
===================================================== */

async function submitAnswer() {

    if (!selectedDoubt) {

        return;

    }


    const answer =
        answerInput.value.trim();


    if (!answer) {

        alert(
            "Please enter an answer before submitting."
        );

        answerInput.focus();

        return;

    }


    const doubtId =
        selectedDoubt.id;


    if (
        doubtId === undefined ||
        doubtId === null
    ) {

        alert(
            "This doubt does not have a valid ID."
        );

        return;

    }


    const endpoint =
        ENDPOINTS.answer.replace(
            "{id}",
            encodeURIComponent(doubtId)
        );


    submitAnswerBtn.disabled =
        true;


    submitAnswerBtn.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Saving...

    `;


    try {

        await apiRequest(
            endpoint,
            {

                method: "POST",

                body:
                    JSON.stringify({
                        answer: answer
                    })

            }
        );


        closeDoubtModal();


        await Promise.all([
            loadDoubts(),
            loadDoubtStatistics()
        ]);


        alert(
            "Answer submitted successfully."
        );


    } catch (error) {

        console.error(
            "Unable to submit answer:",
            error
        );


        alert(
            "Unable to submit the answer. Please try again."
        );


    } finally {

        submitAnswerBtn.disabled =
            false;

    }

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

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


/* =====================================================
   ESCAPE HTML
   -----------------------------------------------------
   Prevents backend/user text from being inserted
   directly as executable HTML.
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   BACK BUTTON
===================================================== */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            /*
             * Uses browser history instead of forcing
             * the faculty dashboard.
             */

            if (
                window.history.length > 1
            ) {

                window.history.back();

            } else {

                window.location.href =
                    "faculty-dashboard.html";

            }

        }
    );

}


/* =====================================================
   REFRESH
===================================================== */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function () {

            refreshBtn.disabled =
                true;


            const icon =
                refreshBtn.querySelector("i");


            if (icon) {

                icon.classList.add(
                    "fa-spin"
                );

            }


            await Promise.all([
                loadDoubts(),
                loadDoubtStatistics(),
                loadSubjects()
            ]);


            if (icon) {

                icon.classList.remove(
                    "fa-spin"
                );

            }


            refreshBtn.disabled =
                false;

        }
    );

}


/* =====================================================
   SEARCH
===================================================== */

if (doubtSearch) {

    doubtSearch.addEventListener(
        "input",
        displayDoubts
    );

}


/* =====================================================
   SUBJECT FILTER
===================================================== */

if (subjectFilter) {

    subjectFilter.addEventListener(
        "change",
        displayDoubts
    );

}


/* =====================================================
   STATUS FILTER
===================================================== */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        displayDoubts
    );

}


/* =====================================================
   MODAL EVENTS
===================================================== */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeDoubtModal
    );

}


if (cancelModal) {

    cancelModal.addEventListener(
        "click",
        closeDoubtModal
    );

}


if (submitAnswerBtn) {

    submitAnswerBtn.addEventListener(
        "click",
        submitAnswer
    );

}


if (doubtModal) {

    doubtModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                doubtModal
            ) {

                closeDoubtModal();

            }

        }
    );

}


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            doubtModal.classList.contains("active")
        ) {

            closeDoubtModal();

        }

    }
);


/* =====================================================
   INITIAL LOAD
===================================================== */

async function initializeFacultyDoubts() {

    await Promise.all([
        loadDoubtStatistics(),
        loadSubjects(),
        loadDoubts()
    ]);

}


initializeFacultyDoubts();