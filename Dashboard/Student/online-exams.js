/* =====================================================
   CAMPUSCONNECT
   ONLINE EXAMS
===================================================== */


/* =====================================================
   APPLICATION STATE
===================================================== */

const examState = {

    currentView: "home",

    currentTab: "available",

    exams: [],

    selectedExam: null,

    questions: [],

    answers: {},

    reviewQuestions: new Set(),

    currentQuestionIndex: 0,

    remainingSeconds: 0,

    totalDurationSeconds: 0,

    timerInterval: null,

    examStartedAt: null,

    submitting: false,

    result: null

};


/* =====================================================
   API CONFIGURATION
===================================================== */

/*
    Keep this empty until the Java backend is available.

    Example later:

    const API_BASE_URL =
        "http://your-server/api";

    Never put MySQL credentials here.
*/

const API_BASE_URL = "";


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeOnlineExams
);


function initializeOnlineExams() {

    registerEventListeners();

    showView("home");

    loadExams(
        examState.currentTab
    );

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function registerEventListeners() {


    /* BACK */

    const backButton =
        document.getElementById(
            "backButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            handleBackNavigation
        );

    }


    /* EXAM TABS */

    document
        .querySelectorAll(".exam-tab")
        .forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".exam-tab"
                            )
                            .forEach(
                                function (item) {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        tab.classList.add(
                            "active"
                        );


                        examState.currentTab =
                            tab.dataset.status;


                        loadExams(
                            examState.currentTab
                        );

                    }
                );

            }
        );


    /* INSTRUCTIONS BACK */

    const instructionsBackButton =
        document.getElementById(
            "instructionsBackButton"
        );


    if (instructionsBackButton) {

        instructionsBackButton.addEventListener(
            "click",
            function () {

                stopTimer();

                showView("home");

                loadExams(
                    examState.currentTab
                );

            }
        );

    }


    /* CONFIRMATION CHECKBOX */

    const confirmation =
        document.getElementById(
            "instructionConfirmation"
        );


    if (confirmation) {

        confirmation.addEventListener(
            "change",
            function () {

                const startButton =
                    document.getElementById(
                        "startExamButton"
                    );


                if (startButton) {

                    startButton.disabled =
                        !this.checked;

                }

            }
        );

    }


    /* START EXAM */

    const startButton =
        document.getElementById(
            "startExamButton"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            startSelectedExam
        );

    }


    /* PREVIOUS */

    const previousButton =
        document.getElementById(
            "previousQuestionButton"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                moveToQuestion(
                    examState.currentQuestionIndex - 1
                );

            }
        );

    }


    /* NEXT */

    const nextButton =
        document.getElementById(
            "nextQuestionButton"
        );


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                moveToQuestion(
                    examState.currentQuestionIndex + 1
                );

            }
        );

    }


    /* REVIEW */

    const reviewButton =
        document.getElementById(
            "reviewButton"
        );


    if (reviewButton) {

        reviewButton.addEventListener(
            "click",
            toggleReview
        );

    }


    /* PALETTE TOGGLE */

    const paletteToggle =
        document.getElementById(
            "paletteToggle"
        );


    if (paletteToggle) {

        paletteToggle.addEventListener(
            "click",
            togglePalette
        );

    }


    /* SUBMIT */

    const submitButton =
        document.getElementById(
            "submitExamButton"
        );


    if (submitButton) {

        submitButton.addEventListener(
            "click",
            openSubmitModal
        );

    }


    /* CANCEL SUBMISSION */

    const cancelSubmitButton =
        document.getElementById(
            "cancelSubmitButton"
        );


    if (cancelSubmitButton) {

        cancelSubmitButton.addEventListener(
            "click",
            closeSubmitModal
        );

    }


    /* CONFIRM SUBMISSION */

    const confirmSubmitButton =
        document.getElementById(
            "confirmSubmitButton"
        );


    if (confirmSubmitButton) {

        confirmSubmitButton.addEventListener(
            "click",
            submitExam
        );

    }


    /* BACK TO EXAMS */

    const backToExamsButton =
        document.getElementById(
            "backToExamsButton"
        );


    if (backToExamsButton) {

        backToExamsButton.addEventListener(
            "click",
            function () {

                showView("home");

                loadExams(
                    examState.currentTab
                );

            }
        );

    }


    /* ESCAPE MODAL */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeSubmitModal();

            }

        }
    );

}


/* =====================================================
   BACK NAVIGATION
===================================================== */

function handleBackNavigation() {

    if (
        examState.currentView !==
        "home"
    ) {

        stopTimer();

        showView("home");

        loadExams(
            examState.currentTab
        );

        return;

    }


    if (
        window.history.length > 1
    ) {

        window.history.back();

        return;

    }


    const previousPage =
        sessionStorage.getItem(
            "campusConnectPreviousPage"
        );


    if (previousPage) {

        window.location.href =
            previousPage;

        return;

    }


    window.location.href =
        "student-dashboard.html";

}


/* =====================================================
   VIEW MANAGEMENT
===================================================== */

function showView(view) {

    const views = {

        home:
            document.getElementById(
                "examHomeView"
            ),

        instructions:
            document.getElementById(
                "instructionsView"
            ),

        attempt:
            document.getElementById(
                "attemptView"
            ),

        result:
            document.getElementById(
                "resultView"
            )

    };


    Object.values(views)
        .forEach(
            function (viewElement) {

                if (viewElement) {

                    viewElement.classList.remove(
                        "active"
                    );

                }

            }
        );


    if (views[view]) {

        views[view].classList.add(
            "active"
        );

        examState.currentView =
            view;

    }


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =====================================================
   LOAD EXAMS
===================================================== */

async function loadExams(
    status
) {

    const examList =
        document.getElementById(
            "examList"
        );


    if (!examList) {
        return;
    }


    renderLoadingState(
        examList
    );


    /*
        No mock examination data is generated.

        Until the backend exists, the module displays
        an empty state.

        Expected backend response:

        [
            {
                id: "...",
                title: "...",
                subject: "...",
                status: "available",
                durationMinutes: 60,
                questionCount: 30,
                maximumMarks: 30,
                startTime: "...",
                endTime: "..."
            }
        ]
    */


    if (!API_BASE_URL) {

        examState.exams = [];

        renderExamList();

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/exams?status=${encodeURIComponent(status)}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load examinations."
            );

        }


        const data =
            await response.json();


        examState.exams =
            Array.isArray(data)
                ? data
                : [];


        renderExamList();

    }

    catch (error) {

        console.error(
            "Examination loading failed:",
            error
        );

        renderErrorState(
            examList
        );

    }

}


/* =====================================================
   EXAM LIST
===================================================== */

function renderExamList() {

    const container =
        document.getElementById(
            "examList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        examState.exams.length === 0
    ) {

        renderEmptyExamState(
            container
        );

        return;

    }


    examState.exams.forEach(
        function (exam) {

            container.appendChild(
                createExamCard(exam)
            );

        }
    );

}


/* =====================================================
   EXAM CARD
===================================================== */

function createExamCard(
    exam
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "exam-card";


    const status =
        normalizeExamStatus(
            exam.status
        );


    const title =
        exam.title ||
        "Examination";


    const subject =
        exam.subject ||
        "Subject not specified";


    const duration =
        exam.durationMinutes != null
            ? `${exam.durationMinutes} min`
            : "--";


    const questionCount =
        exam.questionCount != null
            ? exam.questionCount
            : "--";


    const maximumMarks =
        exam.maximumMarks != null
            ? exam.maximumMarks
            : "--";


    const actionText =
        status === "available"
            ? "View Instructions"
            : status === "completed"
                ? "View Result"
                : "Not Available";


    card.innerHTML = `

        <div class="exam-card-top">

            <div class="exam-card-icon">

                <i class="fa-solid fa-file-circle-check"></i>

            </div>


            <span class="exam-status ${escapeHtml(status)}">

                ${escapeHtml(
                    formatStatus(status)
                )}

            </span>

        </div>


        <h3>
            ${escapeHtml(title)}
        </h3>


        <p class="exam-subject">
            ${escapeHtml(subject)}
        </p>


        <div class="exam-meta">

            <div class="exam-meta-item">

                <i class="fa-solid fa-list-ol"></i>

                <span>
                    ${escapeHtml(
                        String(questionCount)
                    )}
                    Questions
                </span>

            </div>


            <div class="exam-meta-item">

                <i class="fa-solid fa-clock"></i>

                <span>
                    ${escapeHtml(
                        String(duration)
                    )}
                </span>

            </div>


            <div class="exam-meta-item">

                <i class="fa-solid fa-star"></i>

                <span>
                    ${escapeHtml(
                        String(maximumMarks)
                    )}
                    Marks
                </span>

            </div>

        </div>


        <div class="exam-card-actions">

            <button
                type="button"
                class="${
                    status === "available"
                        ? "primary-button"
                        : "secondary-button"
                }"
                data-exam-id="${escapeHtml(
                    String(exam.id ?? "")
                )}"
                data-action="${escapeHtml(
                    status
                )}"
                ${status === "upcoming"
                    ? "disabled"
                    : ""}
            >

                ${
                    status === "available"
                        ? `<i class="fa-solid fa-arrow-right"></i>`
                        : status === "completed"
                            ? `<i class="fa-solid fa-chart-column"></i>`
                            : `<i class="fa-solid fa-clock"></i>`
                }

                ${actionText}

            </button>

        </div>

    `;


    const button =
        card.querySelector(
            "button"
        );


    if (button) {

        button.addEventListener(
            "click",
            function () {

                const examId =
                    button.dataset.examId;


                const selectedExam =
                    examState.exams.find(
                        function (item) {

                            return String(item.id) ===
                                String(examId);

                        }
                    );


                if (!selectedExam) {
                    return;
                }


                if (
                    status === "available"
                ) {

                    openInstructions(
                        selectedExam
                    );

                }


                if (
                    status === "completed"
                ) {

                    handleCompletedExam(
                        selectedExam
                    );

                }

            }
        );

    }


    return card;

}


/* =====================================================
   INSTRUCTIONS
===================================================== */

function openInstructions(
    exam
) {

    examState.selectedExam =
        exam;


    const title =
        document.getElementById(
            "instructionExamTitle"
        );


    const subject =
        document.getElementById(
            "instructionExamSubject"
        );


    const questionCount =
        document.getElementById(
            "instructionQuestionCount"
        );


    const duration =
        document.getElementById(
            "instructionDuration"
        );


    const maximumMarks =
        document.getElementById(
            "instructionMaximumMarks"
        );


    const instructions =
        document.getElementById(
            "examInstructions"
        );


    const confirmation =
        document.getElementById(
            "instructionConfirmation"
        );


    const startButton =
        document.getElementById(
            "startExamButton"
        );


    if (title) {

        title.textContent =
            exam.title ||
            "Examination";

    }


    if (subject) {

        subject.textContent =
            exam.subject ||
            "Examination instructions";

    }


    if (questionCount) {

        questionCount.textContent =
            exam.questionCount ??
            "--";

    }


    if (duration) {

        duration.textContent =
            exam.durationMinutes != null
                ? `${exam.durationMinutes} min`
                : "--";

    }


    if (maximumMarks) {

        maximumMarks.textContent =
            exam.maximumMarks ??
            "--";

    }


    if (instructions) {

        instructions.textContent =
            exam.instructions ||
            "Please follow all instructions provided by the examination system.";

    }


    if (confirmation) {

        confirmation.checked =
            false;

    }


    if (startButton) {

        startButton.disabled =
            true;

    }


    showView(
        "instructions"
    );

}


/* =====================================================
   START EXAM
===================================================== */

async function startSelectedExam() {

    const exam =
        examState.selectedExam;


    if (!exam || !exam.id) {
        return;
    }


    const startButton =
        document.getElementById(
            "startExamButton"
        );


    if (startButton) {

        startButton.disabled =
            true;

    }


    try {

        /*
            Backend should return the actual examination
            attempt/questions.

            Expected structure:

            {
                attemptId: "...",
                exam: {...},
                questions: [
                    {
                        id: "...",
                        questionText: "...",
                        options: [
                            {
                                id: "...",
                                text: "..."
                            }
                        ]
                    }
                ],
                durationSeconds: 3600
            }
        */


        if (!API_BASE_URL) {

            throw new Error(
                "Examination service is not connected yet."
            );

        }


        const response =
            await fetch(
                `${API_BASE_URL}/student/exams/${encodeURIComponent(exam.id)}/start`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to start examination."
            );

        }


        const data =
            await response.json();


        prepareAttempt(
            data
        );


    }

    catch (error) {

        console.error(
            "Exam start failed:",
            error
        );


        alert(
            error.message ||
            "Unable to start examination."
        );


        if (startButton) {

            const confirmation =
                document.getElementById(
                    "instructionConfirmation"
                );


            startButton.disabled =
                !confirmation?.checked;

        }

    }

}


/* =====================================================
   PREPARE ATTEMPT
===================================================== */

function prepareAttempt(
    data
) {

    examState.questions =
        Array.isArray(data?.questions)
            ? data.questions
            : [];


    if (
        examState.questions.length === 0
    ) {

        throw new Error(
            "No examination questions were provided."
        );

    }


    examState.selectedExam =
        data.exam ||
        examState.selectedExam;


    examState.answers =
        {};


    examState.reviewQuestions =
        new Set();


    examState.currentQuestionIndex =
        0;


    examState.examStartedAt =
        new Date();


    examState.totalDurationSeconds =
        Number(
            data.durationSeconds ??
            (
                Number(
                    examState.selectedExam
                        ?.durationMinutes
                ) * 60
            )
        );


    if (
        !Number.isFinite(
            examState.totalDurationSeconds
        ) ||
        examState.totalDurationSeconds <= 0
    ) {

        throw new Error(
            "Invalid examination duration."
        );

    }


    examState.remainingSeconds =
        examState.totalDurationSeconds;


    updateAttemptHeader();

    renderQuestionPalette();

    renderCurrentQuestion();

    startTimer();

    showView(
        "attempt"
    );

}


/* =====================================================
   ATTEMPT HEADER
===================================================== */

function updateAttemptHeader() {

    const exam =
        examState.selectedExam;


    const title =
        document.getElementById(
            "attemptExamTitle"
        );


    const subject =
        document.getElementById(
            "attemptExamSubject"
        );


    const total =
        document.getElementById(
            "totalQuestionNumber"
        );


    if (title) {

        title.textContent =
            exam?.title ||
            "Examination";

    }


    if (subject) {

        subject.textContent =
            exam?.subject ||
            "";

    }


    if (total) {

        total.textContent =
            examState.questions.length;

    }

}


/* =====================================================
   QUESTION RENDERING
===================================================== */

function renderCurrentQuestion() {

    const question =
        examState.questions[
            examState.currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    const currentNumber =
        document.getElementById(
            "currentQuestionNumber"
        );


    const questionText =
        document.getElementById(
            "questionText"
        );


    const optionsContainer =
        document.getElementById(
            "optionsContainer"
        );


    if (currentNumber) {

        currentNumber.textContent =
            examState.currentQuestionIndex + 1;

    }


    if (questionText) {

        questionText.textContent =
            question.questionText ||
            "";

    }


    if (!optionsContainer) {
        return;
    }


    optionsContainer.innerHTML =
        "";


    const options =
        Array.isArray(
            question.options
        )
            ? question.options
            : [];


    if (options.length === 0) {

        optionsContainer.innerHTML = `

            <div class="empty-state">

                <h3>
                    No options available
                </h3>

                <p>
                    This question does not currently contain
                    selectable options.
                </p>

            </div>

        `;

        return;

    }


    const selectedAnswer =
        examState.answers[
            question.id
        ];


    const letters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    options.forEach(
        function (option, index) {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "option";


            const isSelected =
                String(selectedAnswer) ===
                String(option.id);


            if (isSelected) {

                label.classList.add(
                    "selected"
                );

            }


            label.innerHTML = `

                <input
                    type="radio"
                    name="question-${escapeHtml(
                        String(question.id)
                    )}"
                    value="${escapeHtml(
                        String(option.id)
                    )}"
                    ${isSelected ? "checked" : ""}
                >


                <span class="option-letter">

                    ${letters[index] || ""}

                </span>


                <span class="option-text">

                    ${escapeHtml(
                        option.text ?? ""
                    )}

                </span>

            `;


            label.addEventListener(
                "click",
                function () {

                    selectAnswer(
                        question.id,
                        option.id
                    );

                }
            );


            optionsContainer.appendChild(
                label
            );

        }
    );


    updateReviewButton();

    updateNavigationButtons();

    updateProgress();

    updateQuestionPalette();

}


/* =====================================================
   SELECT ANSWER
===================================================== */

function selectAnswer(
    questionId,
    optionId
) {

    examState.answers[
        questionId
    ] = optionId;


    renderCurrentQuestion();

}


/* =====================================================
   QUESTION NAVIGATION
===================================================== */

function moveToQuestion(
    index
) {

    if (
        index < 0 ||
        index >= examState.questions.length
    ) {

        return;

    }


    examState.currentQuestionIndex =
        index;


    renderCurrentQuestion();

}


/* =====================================================
   NAVIGATION BUTTONS
===================================================== */

function updateNavigationButtons() {

    const previousButton =
        document.getElementById(
            "previousQuestionButton"
        );


    const nextButton =
        document.getElementById(
            "nextQuestionButton"
        );


    const index =
        examState.currentQuestionIndex;


    if (previousButton) {

        previousButton.disabled =
            index === 0;

    }


    if (nextButton) {

        const isLast =
            index ===
            examState.questions.length - 1;


        nextButton.innerHTML =
            isLast
                ? `
                    <i class="fa-solid fa-check"></i>
                    Finish
                  `
                : `
                    Next
                    <i class="fa-solid fa-arrow-right"></i>
                  `;

    }

}


/* =====================================================
   REVIEW
===================================================== */

function toggleReview() {

    const question =
        examState.questions[
            examState.currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    if (
        examState.reviewQuestions.has(
            question.id
        )
    ) {

        examState.reviewQuestions.delete(
            question.id
        );

    }

    else {

        examState.reviewQuestions.add(
            question.id
        );

    }


    updateReviewButton();

    updateQuestionPalette();

}


function updateReviewButton() {

    const button =
        document.getElementById(
            "reviewButton"
        );


    const question =
        examState.questions[
            examState.currentQuestionIndex
        ];


    if (!button || !question) {
        return;
    }


    const marked =
        examState.reviewQuestions.has(
            question.id
        );


    button.classList.toggle(
        "active",
        marked
    );


    button.innerHTML =
        marked
            ? `
                <i class="fa-solid fa-bookmark"></i>
                Marked for Review
              `
            : `
                <i class="fa-regular fa-bookmark"></i>
                Mark for Review
              `;

}


/* =====================================================
   QUESTION PALETTE
===================================================== */

function renderQuestionPalette() {

    const palette =
        document.getElementById(
            "questionPalette"
        );


    if (!palette) {
        return;
    }


    palette.innerHTML =
        "";


    examState.questions.forEach(
        function (question, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "palette-question";


            button.textContent =
                index + 1;


            button.addEventListener(
                "click",
                function () {

                    moveToQuestion(
                        index
                    );

                }
            );


            palette.appendChild(
                button
            );

        }
    );


    updateQuestionPalette();

}


function updateQuestionPalette() {

    const buttons =
        document.querySelectorAll(
            ".palette-question"
        );


    buttons.forEach(
        function (button, index) {

            const question =
                examState.questions[
                    index
                ];


            if (!question) {
                return;
            }


            const answered =
                Object.prototype.hasOwnProperty.call(
                    examState.answers,
                    question.id
                );


            const review =
                examState.reviewQuestions.has(
                    question.id
                );


            button.classList.toggle(
                "current",
                index ===
                    examState.currentQuestionIndex
            );


            button.classList.toggle(
                "answered",
                answered
            );


            button.classList.toggle(
                "review",
                review
            );

        }
    );

}


/* =====================================================
   PROGRESS
===================================================== */

function updateProgress() {

    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (!progressBar) {
        return;
    }


    const total =
        examState.questions.length;


    const current =
        examState.currentQuestionIndex + 1;


    const percentage =
        total > 0
            ? (
                current / total
            ) * 100
            : 0;


    progressBar.style.width =
        `${percentage}%`;

}


/* =====================================================
   PALETTE TOGGLE
===================================================== */

function togglePalette() {

    const palette =
        document.getElementById(
            "questionPalette"
        );


    const toggle =
        document.getElementById(
            "paletteToggle"
        );


    if (!palette || !toggle) {
        return;
    }


    const hidden =
        palette.style.display ===
        "none";


    palette.style.display =
        hidden
            ? "grid"
            : "none";


    toggle.innerHTML =
        hidden
            ? `<i class="fa-solid fa-chevron-up"></i>`
            : `<i class="fa-solid fa-chevron-down"></i>`;

}


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

    stopTimer();


    updateTimerDisplay();


    examState.timerInterval =
        setInterval(
            function () {

                examState.remainingSeconds--;

                updateTimerDisplay();


                if (
                    examState.remainingSeconds <= 0
                ) {

                    stopTimer();

                    submitExam(
                        true
                    );

                }

            },
            1000
        );

}


function stopTimer() {

    if (
        examState.timerInterval
    ) {

        clearInterval(
            examState.timerInterval
        );

        examState.timerInterval =
            null;

    }

}


function updateTimerDisplay() {

    const timer =
        document.getElementById(
            "examTimer"
        );


    const timerText =
        document.getElementById(
            "timerText"
        );


    if (!timerText) {
        return;
    }


    const seconds =
        Math.max(
            0,
            examState.remainingSeconds
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const remaining =
        seconds % 60;


    const formatted =
        hours > 0
            ? `${pad(hours)}:${pad(minutes)}:${pad(remaining)}`
            : `${pad(minutes)}:${pad(remaining)}`;


    timerText.textContent =
        formatted;


    if (timer) {

        timer.classList.remove(
            "warning",
            "danger"
        );


        if (
            seconds <= 60
        ) {

            timer.classList.add(
                "danger"
            );

        }

        else if (
            seconds <= 300
        ) {

            timer.classList.add(
                "warning"
            );

        }

    }

}


function pad(value) {

    return String(value)
        .padStart(
            2,
            "0"
        );

}


/* =====================================================
   SUBMISSION MODAL
===================================================== */

function openSubmitModal() {

    const modal =
        document.getElementById(
            "submitModal"
        );


    if (!modal) {
        return;
    }


    const unanswered =
        examState.questions.filter(
            function (question) {

                return !Object.prototype.hasOwnProperty.call(
                    examState.answers,
                    question.id
                );

            }
        ).length;


    const message =
        document.getElementById(
            "submitModalMessage"
        );


    if (message) {

        message.textContent =
            unanswered > 0
                ? `You have ${unanswered} unanswered question${
                    unanswered === 1
                        ? ""
                        : "s"
                  }. Are you sure you want to submit the examination?`
                : "Are you sure you want to submit this examination? You will not be able to change your answers afterward.";

    }


    modal.classList.add(
        "active"
    );

}


function closeSubmitModal() {

    const modal =
        document.getElementById(
            "submitModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


/* =====================================================
   SUBMIT EXAM
===================================================== */

async function submitExam(
    automaticSubmission = false
) {

    if (
        examState.submitting
    ) {

        return;

    }


    examState.submitting =
        true;


    closeSubmitModal();

    stopTimer();


    const submitButton =
        document.getElementById(
            "submitExamButton"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Submitting...
        `;

    }


    try {

        if (!API_BASE_URL) {

            throw new Error(
                "Examination service is not connected yet."
            );

        }


        const payload =
            buildSubmissionPayload(
                automaticSubmission
            );


        const examId =
            examState.selectedExam?.id;


        const response =
            await fetch(
                `${API_BASE_URL}/student/exams/${encodeURIComponent(examId)}/submit`,
                {
                    method: "POST",

                    credentials:
                        "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to submit examination."
            );

        }


        const result =
            await response.json();


        examState.result =
            result;


        renderResult(
            result
        );


        showView(
            "result"
        );

    }

    catch (error) {

        console.error(
            "Examination submission failed:",
            error
        );


        alert(
            error.message ||
            "Unable to submit examination. Please try again."
        );


        examState.submitting =
            false;


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.innerHTML = `
                <i class="fa-solid fa-paper-plane"></i>
                Submit Examination
            `;

        }


        /*
            If submission failed, the attempt is still
            active from the frontend perspective.
        */

        startTimer();

    }

}


/* =====================================================
   SUBMISSION PAYLOAD
===================================================== */

function buildSubmissionPayload(
    automaticSubmission
) {

    const answers =
        Object.entries(
            examState.answers
        ).map(
            function (
                [questionId, optionId]
            ) {

                return {

                    questionId:
                        questionId,

                    selectedOptionId:
                        optionId

                };

            }
        );


    const reviewQuestionIds =
        Array.from(
            examState.reviewQuestions
        );


    const elapsedSeconds =
        Math.max(
            0,
            examState.totalDurationSeconds -
            examState.remainingSeconds
        );


    return {

        answers:

            answers,

        reviewQuestionIds:

            reviewQuestionIds,

        elapsedSeconds:

            elapsedSeconds,

        automaticSubmission:

            Boolean(
                automaticSubmission
            )

    };

}


/* =====================================================
   RESULT
===================================================== */

function renderResult(
    result
) {

    const score =
        document.getElementById(
            "resultScore"
        );


    const maximumMarks =
        document.getElementById(
            "resultMaximumMarks"
        );


    const percentage =
        document.getElementById(
            "resultPercentage"
        );


    const correct =
        document.getElementById(
            "resultCorrect"
        );


    const incorrect =
        document.getElementById(
            "resultIncorrect"
        );


    const unanswered =
        document.getElementById(
            "resultUnanswered"
        );


    const timeTaken =
        document.getElementById(
            "resultTimeTaken"
        );


    const message =
        document.getElementById(
            "resultMessage"
        );


    if (score) {

        score.textContent =
            result?.score ?? "--";

    }


    if (maximumMarks) {

        maximumMarks.textContent =
            result?.maximumMarks != null
                ? `/ ${result.maximumMarks}`
                : "/ --";

    }


    if (percentage) {

        percentage.textContent =
            result?.percentage != null
                ? `${result.percentage}%`
                : "--";

    }


    if (correct) {

        correct.textContent =
            result?.correct ?? "--";

    }


    if (incorrect) {

        incorrect.textContent =
            result?.incorrect ?? "--";

    }


    if (unanswered) {

        unanswered.textContent =
            result?.unanswered ?? "--";

    }


    if (timeTaken) {

        timeTaken.textContent =
            formatDuration(
                result?.timeTakenSeconds
            );

    }


    if (message) {

        message.textContent =
            result?.message ||
            "Your examination has been submitted successfully.";

    }

}


/* =====================================================
   COMPLETED EXAM
===================================================== */

function handleCompletedExam(
    exam
) {

    /*
        A completed exam result should eventually be opened
        from the backend result endpoint.

        This module does not generate a fake result.
    */

    if (
        !API_BASE_URL ||
        !exam?.id
    ) {

        alert(
            "Result service is not connected yet."
        );

        return;

    }


    window.location.href =
        `result-analysis.html?examId=${encodeURIComponent(exam.id)}`;

}


/* =====================================================
   EMPTY STATES
===================================================== */

function renderEmptyExamState(
    container
) {

    const messages = {

        available:
            [
                "No examinations available",
                "There are currently no examinations available for you."
            ],

        upcoming:
            [
                "No upcoming examinations",
                "Upcoming examinations assigned to you will appear here."
            ],

        completed:
            [
                "No completed examinations",
                "Your completed examinations will appear here after submission."
            ]

    };


    const message =
        messages[
            examState.currentTab
        ] ||
        messages.available;


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-file-circle-xmark"></i>

            </div>


            <h3>

                ${escapeHtml(
                    message[0]
                )}

            </h3>


            <p>

                ${escapeHtml(
                    message[1]
                )}

            </p>

        </div>

    `;

}


function renderLoadingState(
    container
) {

    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-spinner fa-spin"></i>

            </div>


            <h3>
                Loading examinations
            </h3>


            <p>
                Please wait while your examination data is retrieved.
            </p>

        </div>

    `;

}


function renderErrorState(
    container
) {

    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-circle-exclamation"></i>

            </div>


            <h3>
                Unable to load examinations
            </h3>


            <p>
                The examination data could not be retrieved.
                Please try again later.
            </p>

        </div>

    `;

}


/* =====================================================
   UTILITIES
===================================================== */

function normalizeExamStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "available"
    ) {

        return "available";

    }


    if (
        value === "upcoming"
    ) {

        return "upcoming";

    }


    if (
        value === "completed"
    ) {

        return "completed";

    }


    return "upcoming";

}


function formatStatus(
    status
) {

    const normalized =
        normalizeExamStatus(
            status
        );


    return normalized
        .charAt(0)
        .toUpperCase() +
        normalized.slice(1);

}


function formatDuration(
    seconds
) {

    if (
        seconds == null ||
        !Number.isFinite(
            Number(seconds)
        )
    ) {

        return "--";

    }


    const total =
        Math.max(
            0,
            Number(seconds)
        );


    const hours =
        Math.floor(
            total / 3600
        );


    const minutes =
        Math.floor(
            (total % 3600) / 60
        );


    const remaining =
        total % 60;


    if (hours > 0) {

        return `${hours}h ${minutes}m`;

    }


    return `${minutes}m ${remaining}s`;

}


function escapeHtml(
    value
) {

    return String(value)
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