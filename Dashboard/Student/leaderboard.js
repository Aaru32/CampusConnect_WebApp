/* =====================================================
   CAMPUSCONNECT
   LEADERBOARD
   STUDENT MODULE
===================================================== */


/* =====================================================
   APPLICATION STATE
===================================================== */

const leaderboardState = {

    currentType: "overall",

    exams: [],

    selectedExamId: null,

    rankings: [],

    currentStudent: null,

    participantCount: 0,

    loading: false

};


/* =====================================================
   API CONFIGURATION
===================================================== */

/*
    Keep this empty until the Java backend is connected.

    The frontend must never contain MySQL credentials.

    Later this can point to the actual CampusConnect
    Java backend.

    Example:

    const API_BASE_URL =
        "http://localhost:8080/api";
*/

const API_BASE_URL = "";


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeLeaderboard
);


async function initializeLeaderboard() {

    registerEventListeners();

    updateInterfaceForType();

    resetLeaderboardState();

    renderInitialEmptyState();

    /*
        When the Java backend becomes available,
        completed examinations will be loaded here.

        Example:

        await loadExamsFromBackend();
        await loadLeaderboardData();
    */

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function registerEventListeners() {


    /* =================================================
       BACK BUTTON
    ================================================= */

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


    /* =================================================
       LEADERBOARD TABS
    ================================================= */

    document
        .querySelectorAll(
            ".leaderboard-tab"
        )
        .forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    async function () {

                        const selectedType =
                            tab.dataset.type;


                        if (
                            !selectedType ||
                            selectedType ===
                            leaderboardState.currentType
                        ) {

                            return;

                        }


                        document
                            .querySelectorAll(
                                ".leaderboard-tab"
                            )
                            .forEach(
                                function (item) {

                                    item.classList.remove(
                                        "active"
                                    );

                                    item.setAttribute(
                                        "aria-selected",
                                        "false"
                                    );

                                }
                            );


                        tab.classList.add(
                            "active"
                        );


                        tab.setAttribute(
                            "aria-selected",
                            "true"
                        );


                        leaderboardState.currentType =
                            selectedType;


                        leaderboardState.selectedExamId =
                            null;


                        resetLeaderboardState();

                        updateInterfaceForType();


                        if (
                            selectedType ===
                            "exam"
                        ) {

                            await loadExamsFromBackend();

                            renderInitialEmptyState();

                            return;

                        }


                        await loadLeaderboardData();

                    }
                );

            }
        );


    /* =================================================
       EXAM SELECTOR
    ================================================= */

    const examSelector =
        document.getElementById(
            "examSelector"
        );


    if (examSelector) {

        examSelector.addEventListener(
            "change",
            async function () {

                leaderboardState.selectedExamId =
                    this.value || null;


                if (
                    leaderboardState.selectedExamId
                ) {

                    await loadLeaderboardData();

                }

                else {

                    resetLeaderboardState();

                    renderInitialEmptyState();

                }

            }
        );

    }

}


/* =====================================================
   BACK NAVIGATION
===================================================== */

function handleBackNavigation() {

    /*
        Return to the page that opened this module.
    */

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


    /*
        Fallback only for navigation.
        This is not application data.
    */

    window.location.href =
        "student-dashboard.html";

}


/* =====================================================
   INTERFACE
===================================================== */

function updateInterfaceForType() {

    const selectorSection =
        document.getElementById(
            "examSelectorSection"
        );


    const subtitle =
        document.getElementById(
            "rankingSubtitle"
        );


    if (
        !selectorSection ||
        !subtitle
    ) {

        return;

    }


    if (
        leaderboardState.currentType ===
        "exam"
    ) {

        selectorSection.hidden =
            false;


        subtitle.textContent =
            "Ranking for the selected examination";

    }

    else {

        selectorSection.hidden =
            true;


        subtitle.textContent =
            "Overall academic ranking";

    }

}


/* =====================================================
   EXAM DATA
===================================================== */

/*
    No examinations are hardcoded.

    The Java backend will provide completed examinations.

    Expected backend response:

    [
        {
            "id": "...",
            "title": "...",
            "subject": "..."
        }
    ]
*/

async function loadExamsFromBackend() {

    if (!API_BASE_URL) {

        leaderboardState.exams = [];

        populateExamSelector();

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/exams/completed`,
                {
                    method: "GET",
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


        leaderboardState.exams =
            Array.isArray(data)
                ? data
                : [];


        populateExamSelector();

    }

    catch (error) {

        console.error(
            "Exam loading failed:",
            error
        );

        leaderboardState.exams = [];

        populateExamSelector();

        renderErrorState();

    }

}


/* =====================================================
   EXAM SELECTOR
===================================================== */

function populateExamSelector() {

    const selector =
        document.getElementById(
            "examSelector"
        );


    if (!selector) {

        return;

    }


    selector.innerHTML = "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value = "";

    defaultOption.textContent =
        "Select an examination";


    selector.appendChild(
        defaultOption
    );


    leaderboardState.exams.forEach(
        function (exam) {

            if (!exam || exam.id == null) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(exam.id);


            option.textContent =
                exam.title ||
                exam.name ||
                "Examination";


            selector.appendChild(
                option
            );

        }
    );


    if (
        leaderboardState.selectedExamId
    ) {

        selector.value =
            leaderboardState.selectedExamId;

    }

}


/* =====================================================
   LOAD LEADERBOARD
===================================================== */

async function loadLeaderboardData() {

    if (leaderboardState.loading) {

        return;

    }


    renderLoadingState();


    if (
        leaderboardState.currentType ===
        "overall"
    ) {

        await loadOverallLeaderboard();

        return;

    }


    if (
        leaderboardState.currentType ===
        "exam"
    ) {

        if (
            !leaderboardState.selectedExamId
        ) {

            renderInitialEmptyState();

            return;

        }


        await loadExamLeaderboard(
            leaderboardState.selectedExamId
        );

    }

}


/* =====================================================
   OVERALL LEADERBOARD
===================================================== */

async function loadOverallLeaderboard() {

    if (!API_BASE_URL) {

        /*
            No mock data is generated.

            The leaderboard remains empty until
            the real backend supplies examination
            result data.
        */

        resetLeaderboardState();

        renderLeaderboard();

        return;

    }


    leaderboardState.loading = true;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/leaderboard`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to retrieve leaderboard."
            );

        }


        const data =
            await response.json();


        applyLeaderboardResponse(
            data
        );


        renderLeaderboard();

    }

    catch (error) {

        console.error(
            "Overall leaderboard error:",
            error
        );

        renderErrorState();

    }

    finally {

        leaderboardState.loading =
            false;

    }

}


/* =====================================================
   EXAM LEADERBOARD
===================================================== */

async function loadExamLeaderboard(
    examId
) {

    if (!API_BASE_URL) {

        resetLeaderboardState();

        renderLeaderboard();

        return;

    }


    leaderboardState.loading = true;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/exams/${encodeURIComponent(examId)}/leaderboard`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to retrieve exam leaderboard."
            );

        }


        const data =
            await response.json();


        applyLeaderboardResponse(
            data
        );


        renderLeaderboard();

    }

    catch (error) {

        console.error(
            "Exam leaderboard error:",
            error
        );

        renderErrorState();

    }

    finally {

        leaderboardState.loading =
            false;

    }

}


/* =====================================================
   APPLY BACKEND RESPONSE
===================================================== */

/*
    Expected structure:

    {
        rankings: [
            {
                rank: 1,
                studentId: "...",
                studentName: "...",
                score: 90,
                maximumMarks: 100,
                percentage: 90,
                isCurrentStudent: false
            }
        ],

        currentStudent: {
            rank: 5,
            score: 82,
            maximumMarks: 100,
            percentage: 82
        },

        participantCount: 50
    }
*/

function applyLeaderboardResponse(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        resetLeaderboardState();

        return;

    }


    leaderboardState.rankings =
        Array.isArray(data.rankings)
            ? data.rankings
            : [];


    leaderboardState.currentStudent =
        data.currentStudent &&
        typeof data.currentStudent === "object"
            ? data.currentStudent
            : null;


    leaderboardState.participantCount =
        Number.isFinite(
            Number(data.participantCount)
        )
            ? Number(data.participantCount)
            : leaderboardState.rankings.length;

}


/* =====================================================
   RENDER LEADERBOARD
===================================================== */

function renderLeaderboard() {

    updateStudentSummary();

    updateStatistics();


    const container =
        document.getElementById(
            "rankingContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        leaderboardState.rankings.length === 0
    ) {

        renderEmptyRanking(
            container
        );

        return;

    }


    renderRankingHeader(
        container
    );


    leaderboardState.rankings.forEach(
        function (student) {

            if (!student) {

                return;

            }


            container.appendChild(
                createRankingRow(
                    student
                )
            );

        }
    );

}


/* =====================================================
   STUDENT SUMMARY
===================================================== */

function updateStudentSummary() {

    const student =
        leaderboardState.currentStudent;


    const myRank =
        document.getElementById(
            "myRank"
        );


    const myScore =
        document.getElementById(
            "myScore"
        );


    const myPercentage =
        document.getElementById(
            "myPercentage"
        );


    const studentScore =
        document.getElementById(
            "studentScore"
        );


    const studentPercentage =
        document.getElementById(
            "studentPercentage"
        );


    if (myRank) {

        myRank.textContent =
            student?.rank ?? "--";

    }


    if (myScore) {

        myScore.textContent =
            formatScore(
                student
            );

    }


    if (myPercentage) {

        myPercentage.textContent =
            formatPercentage(
                student?.percentage
            );

    }


    if (studentScore) {

        studentScore.textContent =
            formatScore(
                student
            );

    }


    if (studentPercentage) {

        studentPercentage.textContent =
            formatPercentage(
                student?.percentage
            );

    }

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    const participantCount =
        document.getElementById(
            "participantCount"
        );


    if (participantCount) {

        participantCount.textContent =
            leaderboardState.participantCount > 0
                ? leaderboardState.participantCount
                : "--";

    }

}


/* =====================================================
   RANKING HEADER
===================================================== */

function renderRankingHeader(
    container
) {

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "ranking-header";


    header.innerHTML = `

        <span>
            Rank
        </span>

        <span>
            Student
        </span>

        <span>
            Score
        </span>

        <span>
            Percentage
        </span>

    `;


    container.appendChild(
        header
    );

}


/* =====================================================
   RANKING ROW
===================================================== */

function createRankingRow(
    student
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "ranking-row";


    const isCurrentStudent =
        Boolean(
            student.isCurrentStudent
        );


    if (isCurrentStudent) {

        row.classList.add(
            "current-student"
        );

    }


    const rank =
        student.rank ?? "--";


    const name =
        student.studentName ||
        student.name ||
        "Student";


    const score =
        formatScore(
            student
        );


    const percentage =
        formatPercentage(
            student.percentage
        );


    row.innerHTML = `

        <div class="rank-number">

            <span class="rank-medal">

                ${getRankIcon(rank)}

            </span>

            ${escapeHtml(
                String(rank)
            )}

        </div>


        <div class="student-cell">

            <div class="student-avatar">

                ${escapeHtml(
                    getInitials(name)
                )}

            </div>


            <div class="student-information">

                <span class="student-name">

                    ${escapeHtml(name)}

                </span>


                ${
                    isCurrentStudent
                        ? `
                            <span class="student-label">
                                YOU
                            </span>
                          `
                        : ""
                }

            </div>

        </div>


        <div class="score-cell">

            ${escapeHtml(score)}

        </div>


        <div class="percentage-cell">

            ${escapeHtml(percentage)}

        </div>

    `;


    return row;

}


/* =====================================================
   RANK ICON
===================================================== */

function getRankIcon(rank) {

    const numericRank =
        Number(rank);


    if (
        numericRank === 1
    ) {

        return `<i class="fa-solid fa-trophy"></i>`;

    }


    if (
        numericRank === 2
    ) {

        return `<i class="fa-solid fa-medal"></i>`;

    }


    if (
        numericRank === 3
    ) {

        return `<i class="fa-solid fa-award"></i>`;

    }


    return `<i class="fa-solid fa-hashtag"></i>`;

}


/* =====================================================
   EMPTY STATE
===================================================== */

function renderInitialEmptyState() {

    const container =
        document.getElementById(
            "rankingContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-ranking-star"></i>

            </div>


            <h3>
                No ranking data available
            </h3>


            <p>
                Rankings will appear here when completed
                online examination results are available.
            </p>

        </div>

    `;


    updateStudentSummary();

    updateStatistics();

}


function renderEmptyRanking(
    container
) {

    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-chart-column"></i>

            </div>


            <h3>
                No results available
            </h3>


            <p>
                There are no completed examination results
                available for this ranking yet.
            </p>

        </div>

    `;

}


/* =====================================================
   LOADING
===================================================== */

function renderLoadingState() {

    const container =
        document.getElementById(
            "rankingContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="loading-state">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Loading leaderboard...

        </div>

    `;

}


/* =====================================================
   ERROR
===================================================== */

function renderErrorState() {

    const container =
        document.getElementById(
            "rankingContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-circle-exclamation"></i>

            </div>


            <h3>
                Unable to load leaderboard
            </h3>


            <p>
                The leaderboard could not be retrieved.
                Please try again later.
            </p>

        </div>

    `;

}


/* =====================================================
   STATE RESET
===================================================== */

function resetLeaderboardState() {

    leaderboardState.rankings = [];

    leaderboardState.currentStudent = null;

    leaderboardState.participantCount = 0;

}


/* =====================================================
   FORMAT SCORE
===================================================== */

function formatScore(
    student
) {

    if (
        !student ||
        student.score == null
    ) {

        return "--";

    }


    if (
        student.maximumMarks != null
    ) {

        return `${student.score} / ${student.maximumMarks}`;

    }


    return String(
        student.score
    );

}


/* =====================================================
   FORMAT PERCENTAGE
===================================================== */

function formatPercentage(
    percentage
) {

    if (
        percentage == null
    ) {

        return "--";

    }


    return `${percentage}%`;

}


/* =====================================================
   INITIALS
===================================================== */

function getInitials(
    name
) {

    if (!name) {

        return "?";

    }


    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            function (word) {

                return word
                    .charAt(0)
                    .toUpperCase();

            }
        )
        .join("");

}


/* =====================================================
   HTML ESCAPE
===================================================== */

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