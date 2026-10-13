/* =====================================================
   CAMPUSCONNECT
   RESULT ANALYSIS
   STUDENT MODULE
===================================================== */


/* =====================================================
   APPLICATION STATE
===================================================== */

const resultAnalysisState = {

    results: [],

    subjects: [],

    overall: {

        completedExams: 0,

        averagePercentage: null,

        bestPercentage: null,

        totalQuestions: 0

    }

};


/* =====================================================
   API CONFIGURATION
===================================================== */

/*
    Keep this empty until the Java backend is available.

    Example later:

    const API_BASE_URL =
        "http://your-server/api";

    MySQL credentials must NEVER be placed
    inside this JavaScript file.
*/

const API_BASE_URL = "";


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeResultAnalysis
);


async function initializeResultAnalysis() {

    registerEventListeners();

    renderLoadingState();

    /*
        Backend integration point.

        When Java + MySQL are connected:

        await loadResultAnalysisData();
    */

    await loadResultAnalysisData();

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function registerEventListeners() {

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

}


/* =====================================================
   BACK NAVIGATION
===================================================== */

function handleBackNavigation() {

    /*
        First choice:
        return to the actual page from which
        Result Analysis was opened.
    */

    if (
        window.history.length > 1
    ) {

        window.history.back();

        return;

    }


    /*
        Fallback:
        use the previously stored CampusConnect page
        if available.
    */

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
        Final fallback only when browser history
        and stored previous page are unavailable.
    */

    window.location.href =
        "student-dashboard.html";

}


/* =====================================================
   LOAD DATA
===================================================== */

async function loadResultAnalysisData() {

    if (!API_BASE_URL) {

        /*
            No mock data is created.

            The interface stays in a legitimate
            empty state until the backend provides
            completed online examination results.
        */

        resultAnalysisState.results = [];

        resultAnalysisState.subjects = [];

        resultAnalysisState.overall = {

            completedExams: 0,

            averagePercentage: null,

            bestPercentage: null,

            totalQuestions: 0

        };


        renderResultAnalysis();

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/result-analysis`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to retrieve result analysis."
            );

        }


        const data =
            await response.json();


        applyResultAnalysisResponse(
            data
        );


        renderResultAnalysis();

    }

    catch (error) {

        console.error(
            "Result analysis loading failed:",
            error
        );

        renderErrorState();

    }

}


/* =====================================================
   RESPONSE
===================================================== */

function applyResultAnalysisResponse(
    data
) {

    resultAnalysisState.results =
        Array.isArray(data?.results)
            ? data.results
            : [];


    resultAnalysisState.subjects =
        Array.isArray(data?.subjects)
            ? data.subjects
            : [];


    resultAnalysisState.overall = {

        completedExams:
            data?.overall?.completedExams ??
            resultAnalysisState.results.length,

        averagePercentage:
            data?.overall?.averagePercentage ??
            calculateAveragePercentage(
                resultAnalysisState.results
            ),

        bestPercentage:
            data?.overall?.bestPercentage ??
            calculateBestPercentage(
                resultAnalysisState.results
            ),

        totalQuestions:
            data?.overall?.totalQuestions ??
            calculateTotalQuestions(
                resultAnalysisState.results
            )

    };

}


/* =====================================================
   RENDER
===================================================== */

function renderResultAnalysis() {

    updateOverview();

    renderPerformanceSummary();

    renderPerformanceTrend();

    renderSubjectAnalysis();

    renderExamResults();

}


/* =====================================================
   OVERVIEW
===================================================== */

function updateOverview() {

    document.getElementById(
        "completedExamCount"
    ).textContent =
        resultAnalysisState.overall.completedExams ??
        "--";


    document.getElementById(
        "averagePercentage"
    ).textContent =
        formatPercentage(
            resultAnalysisState.overall.averagePercentage
        );


    document.getElementById(
        "bestPercentage"
    ).textContent =
        formatPercentage(
            resultAnalysisState.overall.bestPercentage
        );


    document.getElementById(
        "totalQuestions"
    ).textContent =
        resultAnalysisState.overall.totalQuestions ??
        "--";

}


/* =====================================================
   PERFORMANCE SUMMARY
===================================================== */

function renderPerformanceSummary() {

    const container =
        document.getElementById(
            "performanceSummary"
        );


    if (!container) {
        return;
    }


    if (
        resultAnalysisState.results.length === 0
    ) {

        container.innerHTML =
            createEmptyState(
                "fa-chart-line",
                "No performance data available",
                "Your performance analysis will appear here after completed online examination results are available."
            );

        return;

    }


    const average =
        Number(
            resultAnalysisState.overall.averagePercentage
        );


    let title =
        "Performance overview";


    let message =
        "Your examination performance is being analysed from your completed online exams.";


    if (average >= 80) {

        title =
            "Strong academic performance";

        message =
            "Your completed examination results indicate a strong overall performance.";

    }

    else if (average >= 60) {

        title =
            "Good academic performance";

        message =
            "Your results show a good overall performance across completed examinations.";

    }

    else if (average >= 40) {

        title =
            "Performance needs attention";

        message =
            "Your results indicate areas where additional preparation may help improve future examination performance.";

    }

    else {

        title =
            "More preparation may be helpful";

        message =
            "Your current examination results indicate that additional preparation could help improve future performance.";

    }


    container.innerHTML = `

        <div class="performance-message">

            <div class="performance-message-icon">

                <i class="fa-solid fa-chart-line"></i>

            </div>


            <div>

                <h3>
                    ${escapeHtml(title)}
                </h3>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

        </div>

    `;

}


/* =====================================================
   PERFORMANCE TREND
===================================================== */

function renderPerformanceTrend() {

    const container =
        document.getElementById(
            "trendContainer"
        );


    if (!container) {
        return;
    }


    if (
        resultAnalysisState.results.length === 0
    ) {

        container.innerHTML =
            createEmptyState(
                "fa-chart-line",
                "No trend available",
                "Performance trends will be generated from your completed examination results."
            );

        return;

    }


    const results =
        resultAnalysisState.results;


    const maximumPercentage =
        Math.max(
            ...results.map(
                function (result) {

                    return Number(
                        result.percentage
                    ) || 0;

                }
            ),
            100
        );


    const trendList =
        document.createElement(
            "div"
        );


    trendList.className =
        "trend-list";


    results.forEach(
        function (result) {

            const percentage =
                Number(
                    result.percentage
                ) || 0;


            const height =
                Math.max(
                    3,
                    (percentage / maximumPercentage) * 100
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "trend-item";


            const title =
                result.examTitle ||
                result.title ||
                "Exam";


            item.innerHTML = `

                <span class="trend-value">

                    ${escapeHtml(
                        formatPercentage(percentage)
                    )}

                </span>


                <div class="trend-bar-wrapper">

                    <div
                        class="trend-bar"
                        style="height: ${height}%"
                    ></div>

                </div>


                <span
                    class="trend-label"
                    title="${escapeHtml(title)}"
                >

                    ${escapeHtml(title)}

                </span>

            `;


            trendList.appendChild(
                item
            );

        }
    );


    container.innerHTML = "";

    container.appendChild(
        trendList
    );

}


/* =====================================================
   SUBJECT ANALYSIS
===================================================== */

function renderSubjectAnalysis() {

    const container =
        document.getElementById(
            "subjectAnalysis"
        );


    if (!container) {
        return;
    }


    if (
        resultAnalysisState.subjects.length === 0
    ) {

        container.innerHTML =
            createEmptyState(
                "fa-book-open",
                "No subject analysis available",
                "Subject-wise performance will appear when examination results contain subject information."
            );

        return;

    }


    const list =
        document.createElement(
            "div"
        );


    list.className =
        "subject-list";


    resultAnalysisState.subjects.forEach(
        function (subject) {

            const percentage =
                Number(
                    subject.percentage
                ) || 0;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "subject-item";


            item.innerHTML = `

                <span class="subject-name">

                    ${escapeHtml(
                        subject.subjectName ||
                        subject.name ||
                        "Subject"
                    )}

                </span>


                <div class="subject-progress">

                    <div
                        class="subject-progress-bar"
                        style="width: ${Math.min(
                            Math.max(percentage, 0),
                            100
                        )}%"
                    ></div>

                </div>


                <span class="subject-percentage">

                    ${escapeHtml(
                        formatPercentage(percentage)
                    )}

                </span>

            `;


            list.appendChild(
                item
            );

        }
    );


    container.innerHTML = "";

    container.appendChild(
        list
    );

}


/* =====================================================
   EXAM RESULTS
===================================================== */

function renderExamResults() {

    const container =
        document.getElementById(
            "examResultsContainer"
        );


    if (!container) {
        return;
    }


    if (
        resultAnalysisState.results.length === 0
    ) {

        container.innerHTML =
            createEmptyState(
                "fa-file-circle-check",
                "No examination results available",
                "Completed online examination results will appear here."
            );

        return;

    }


    const fragment =
        document.createDocumentFragment();


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "exam-result-header";


    header.innerHTML = `

        <span>
            Examination
        </span>

        <span>
            Date
        </span>

        <span>
            Score
        </span>

        <span>
            Percentage
        </span>

        <span>
            Status
        </span>

    `;


    fragment.appendChild(
        header
    );


    resultAnalysisState.results.forEach(
        function (result) {

            fragment.appendChild(
                createExamResultRow(
                    result
                )
            );

        }
    );


    container.innerHTML = "";

    container.appendChild(
        fragment
    );

}


/* =====================================================
   EXAM RESULT ROW
===================================================== */

function createExamResultRow(
    result
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "exam-result-row";


    const title =
        result.examTitle ||
        result.title ||
        "Examination";


    const subject =
        result.subjectName ||
        result.subject ||
        "";


    const date =
        formatDate(
            result.completedAt ||
            result.date
        );


    const score =
        result.score != null
            ? (
                result.maximumMarks != null
                    ? `${result.score} / ${result.maximumMarks}`
                    : String(result.score)
            )
            : "--";


    const percentage =
        result.percentage != null
            ? formatPercentage(
                result.percentage
            )
            : "--";


    const status =
        result.status ||
        "Completed";


    row.innerHTML = `

        <div class="exam-result-name">

            <strong>
                ${escapeHtml(title)}
            </strong>

            ${
                subject
                    ? `
                        <span>
                            ${escapeHtml(subject)}
                        </span>
                      `
                    : ""
            }

        </div>


        <div>
            ${escapeHtml(date)}
        </div>


        <div class="exam-result-score">

            ${escapeHtml(score)}

        </div>


        <div class="exam-result-percentage">

            ${escapeHtml(percentage)}

        </div>


        <span class="exam-result-status">

            ${escapeHtml(status)}

        </span>

    `;


    return row;

}


/* =====================================================
   EMPTY STATE
===================================================== */

function createEmptyState(
    icon,
    title,
    message
) {

    return `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="fa-solid ${escapeHtml(icon)}"></i>

            </div>


            <h3>

                ${escapeHtml(title)}

            </h3>


            <p>

                ${escapeHtml(message)}

            </p>

        </div>

    `;

}


/* =====================================================
   LOADING
===================================================== */

function renderLoadingState() {

    const sections = [

        "performanceSummary",
        "trendContainer",
        "subjectAnalysis",
        "examResultsContainer"

    ];


    sections.forEach(
        function (id) {

            const container =
                document.getElementById(
                    id
                );


            if (!container) {
                return;
            }


            container.innerHTML = `

                <div class="loading-state">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading result analysis...

                </div>

            `;

        }
    );

}


/* =====================================================
   ERROR
===================================================== */

function renderErrorState() {

    const sections = [

        "performanceSummary",
        "trendContainer",
        "subjectAnalysis",
        "examResultsContainer"

    ];


    sections.forEach(
        function (id) {

            const container =
                document.getElementById(
                    id
                );


            if (!container) {
                return;
            }


            container.innerHTML =
                createEmptyState(
                    "fa-circle-exclamation",
                    "Unable to load result analysis",
                    "The examination result data could not be retrieved. Please try again later."
                );

        }
    );

}


/* =====================================================
   CALCULATIONS
===================================================== */

function calculateAveragePercentage(
    results
) {

    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        return null;

    }


    const percentages =
        results
            .map(
                function (result) {

                    return Number(
                        result.percentage
                    );

                }
            )
            .filter(
                function (value) {

                    return Number.isFinite(
                        value
                    );

                }
            );


    if (
        percentages.length === 0
    ) {

        return null;

    }


    const total =
        percentages.reduce(
            function (sum, value) {

                return sum + value;

            },
            0
        );


    return total / percentages.length;

}


function calculateBestPercentage(
    results
) {

    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        return null;

    }


    const percentages =
        results
            .map(
                function (result) {

                    return Number(
                        result.percentage
                    );

                }
            )
            .filter(
                function (value) {

                    return Number.isFinite(
                        value
                    );

                }
            );


    if (
        percentages.length === 0
    ) {

        return null;

    }


    return Math.max(
        ...percentages
    );

}


function calculateTotalQuestions(
    results
) {

    if (
        !Array.isArray(results)
    ) {

        return 0;

    }


    return results.reduce(
        function (total, result) {

            const questions =
                Number(
                    result.totalQuestions ??
                    result.questionCount
                );


            return total +
                (
                    Number.isFinite(
                        questions
                    )
                        ? questions
                        : 0
                );

        },
        0
    );

}


/* =====================================================
   FORMATTING
===================================================== */

function formatPercentage(
    value
) {

    if (
        value == null ||
        !Number.isFinite(
            Number(value)
        )
    ) {

        return "--";

    }


    return `${Number(value).toFixed(1)}%`;

}


function formatDate(
    value
) {

    if (!value) {

        return "--";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";

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
   SECURITY
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