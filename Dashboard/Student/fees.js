/* =====================================================
   CAMPUSCONNECT
   FEES
===================================================== */


/* =====================================================
   APPLICATION STATE
===================================================== */

const feesState = {

    summary: null,

    feeStructure: [],

    paymentHistory: [],

    receipts: [],

    dues: [],

    scholarships: []

};


/* =====================================================
   API CONFIGURATION
===================================================== */

/*
    The Java backend API URL will be configured here
    when the backend is ready.

    Example:

    const API_BASE_URL =
        "http://your-server/api";

    Never put MySQL username/password here.
*/

const API_BASE_URL = "";


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeFees
);


async function initializeFees() {

    registerEventListeners();

    renderInitialStates();

    /*
        Backend loading will be enabled once the
        Java + MySQL API is available.

        Example:

        await loadFeesData();
    */

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function registerEventListeners() {


    /* BACK BUTTON */

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


    /* SERVICE CARDS */

    document
        .querySelectorAll(
            ".service-card"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        showSection(
                            card.dataset.section
                        );

                    }
                );

            }
        );


    /* PAYMENT */

    document
        .getElementById(
            "payButton"
        )
        ?.addEventListener(
            "click",
            function () {

                openModal(
                    "paymentModal"
                );

            }
        );


    /* MODAL CLOSE */

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        closeModal(
                            button.dataset.closeModal
                        );

                    }
                );

            }
        );


    /* OUTSIDE MODAL CLICK */

    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(
            function (modal) {

                modal.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target === modal
                        ) {

                            closeModal(
                                modal.id
                            );

                        }

                    }
                );

            }
        );

}


/* =====================================================
   BACK NAVIGATION
===================================================== */

function handleBackNavigation() {

    /*
        First try the browser's actual history.
        This handles normal navigation between pages.
    */

    if (window.history.length > 1) {

        window.history.back();

        return;

    }


    /*
        Fallback for Acode/direct-preview situations.
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
        Final fallback:
        Fees is inside Dashboard.
    */

    window.location.href =
        "../dashboard.html";

}
/* =====================================================
   SECTION NAVIGATION
===================================================== */

function showSection(
    section
) {

    const sectionMap = {

        structure:
            "structureSection",

        history:
            "historySection",

        receipts:
            "receiptsSection",

        dues:
            "duesSection",

        scholarships:
            "scholarshipsSection",

        payment:
            "paymentSection"

    };


    const targetId =
        sectionMap[section];


    if (!targetId) {
        return;
    }


    const target =
        document.getElementById(
            targetId
        );


    if (!target) {
        return;
    }


    target.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* =====================================================
   MODALS
===================================================== */

function openModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =====================================================
   INITIAL STATES
===================================================== */

function renderInitialStates() {

    renderSummary();

    renderFeeStructure();

    renderPaymentHistory();

    renderReceipts();

    renderDues();

    renderScholarships();

}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary() {

    const summary =
        feesState.summary;


    document.getElementById(
        "totalPayable"
    ).textContent =
        formatAmount(
            summary?.totalPayable
        );


    document.getElementById(
        "totalPaid"
    ).textContent =
        formatAmount(
            summary?.totalPaid
        );


    document.getElementById(
        "outstandingAmount"
    ).textContent =
        formatAmount(
            summary?.outstanding
        );


    document.getElementById(
        "nextDueDate"
    ).textContent =
        summary?.nextDueDate ||
        "--";


    document.getElementById(
        "paymentOutstanding"
    ).textContent =
        formatAmount(
            summary?.outstanding
        );

}


/* =====================================================
   FEE STRUCTURE
===================================================== */

function renderFeeStructure() {

    const container =
        document.getElementById(
            "feeStructureTable"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        feesState.feeStructure.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-list-check",
            "Fee structure unavailable",
            "Your applicable fee structure will appear here when provided by the institution."
        );

        return;

    }


    const table =
        document.createElement(
            "table"
        );


    table.className =
        "data-table";


    table.innerHTML = `

        <thead>

            <tr>

                <th>
                    Fee Component
                </th>

                <th>
                    Academic Period
                </th>

                <th>
                    Amount
                </th>

                <th>
                    Status
                </th>

            </tr>

        </thead>

        <tbody></tbody>

    `;


    const tbody =
        table.querySelector(
            "tbody"
        );


    feesState.feeStructure.forEach(
        function (fee) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        fee.component ||
                        "--"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        fee.period ||
                        "--"
                    )}
                </td>

                <td class="amount-cell">
                    ${formatAmount(
                        fee.amount
                    )}
                </td>

                <td>
                    ${createStatusBadge(
                        fee.status
                    )}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    container.appendChild(
        table
    );

}


/* =====================================================
   PAYMENT HISTORY
===================================================== */

function renderPaymentHistory() {

    const container =
        document.getElementById(
            "paymentHistoryTable"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        feesState.paymentHistory.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-clock-rotate-left",
            "No payment history",
            "Your completed fee transactions will appear here."
        );

        return;

    }


    const table =
        document.createElement(
            "table"
        );


    table.className =
        "data-table";


    table.innerHTML = `

        <thead>

            <tr>

                <th>
                    Transaction
                </th>

                <th>
                    Date
                </th>

                <th>
                    Amount
                </th>

                <th>
                    Method
                </th>

                <th>
                    Status
                </th>

            </tr>

        </thead>

        <tbody></tbody>

    `;


    const tbody =
        table.querySelector(
            "tbody"
        );


    feesState.paymentHistory.forEach(
        function (payment) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        payment.transactionId ||
                        "--"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        payment.date ||
                        "--"
                    )}
                </td>

                <td class="amount-cell">
                    ${formatAmount(
                        payment.amount
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        payment.method ||
                        "--"
                    )}
                </td>

                <td>
                    ${createStatusBadge(
                        payment.status
                    )}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    container.appendChild(
        table
    );

}


/* =====================================================
   RECEIPTS
===================================================== */

function renderReceipts() {

    const container =
        document.getElementById(
            "receiptList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        feesState.receipts.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-receipt",
            "No receipts available",
            "Official receipts will appear here after successful payments."
        );

        return;

    }


    feesState.receipts.forEach(
        function (receipt) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "list-item";


            item.innerHTML = `

                <div class="list-item-header">

                    <span class="list-item-title">

                        Receipt
                        ${escapeHtml(
                            receipt.receiptNumber ||
                            "--"
                        )}

                    </span>


                    ${
                        receipt.receiptUrl
                            ? `
                                <button
                                    type="button"
                                    class="outline-button"
                                    data-receipt-url="${escapeHtml(
                                        receipt.receiptUrl
                                    )}"
                                >
                                    View Receipt
                                </button>
                            `
                            : ""
                    }

                </div>


                <div class="list-item-meta">

                    <span>
                        Date:
                        ${escapeHtml(
                            receipt.date ||
                            "--"
                        )}
                    </span>

                    <span>
                        Amount:
                        ${formatAmount(
                            receipt.amount
                        )}
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );


    container
        .querySelectorAll(
            "[data-receipt-url]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const url =
                            button.dataset.receiptUrl;

                        if (url) {

                            window.open(
                                url,
                                "_blank"
                            );

                        }

                    }
                );

            }
        );

}


/* =====================================================
   DUES
===================================================== */

function renderDues() {

    const container =
        document.getElementById(
            "dueList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        feesState.dues.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-calendar-check",
            "No upcoming dues",
            "Applicable fee due dates will appear here."
        );

        return;

    }


    feesState.dues.forEach(
        function (due) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "list-item";


            item.innerHTML = `

                <div class="list-item-header">

                    <span class="list-item-title">

                        ${escapeHtml(
                            due.title ||
                            "Fee Due"
                        )}

                    </span>


                    ${createStatusBadge(
                        due.status
                    )}

                </div>


                <div class="list-item-meta">

                    <span>
                        Due:
                        ${escapeHtml(
                            due.dueDate ||
                            "--"
                        )}
                    </span>

                    <span>
                        Amount:
                        ${formatAmount(
                            due.amount
                        )}
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   SCHOLARSHIPS
===================================================== */

function renderScholarships() {

    const container =
        document.getElementById(
            "scholarshipList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        feesState.scholarships.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-award",
            "No scholarship information",
            "Scholarship or concession details will appear here when provided by the institution."
        );

        return;

    }


    feesState.scholarships.forEach(
        function (scholarship) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "list-item";


            item.innerHTML = `

                <div class="list-item-header">

                    <span class="list-item-title">

                        ${escapeHtml(
                            scholarship.name ||
                            "Scholarship"
                        )}

                    </span>


                    ${createStatusBadge(
                        scholarship.status
                    )}

                </div>


                <div class="list-item-meta">

                    <span>
                        Academic Period:
                        ${escapeHtml(
                            scholarship.period ||
                            "--"
                        )}
                    </span>

                    <span>
                        Amount:
                        ${formatAmount(
                            scholarship.amount
                        )}
                    </span>

                </div>


                ${
                    scholarship.description
                        ? `
                            <div class="list-item-description">

                                ${escapeHtml(
                                    scholarship.description
                                )}

                            </div>
                        `
                        : ""
                }

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   BACKEND DATA
===================================================== */

async function loadFeesData() {

    if (!API_BASE_URL) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/fees`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load fee information."
            );

        }


        const data =
            await response.json();


        feesState.summary =
            data.summary ||
            null;


        feesState.feeStructure =
            Array.isArray(
                data.feeStructure
            )
                ? data.feeStructure
                : [];


        feesState.paymentHistory =
            Array.isArray(
                data.paymentHistory
            )
                ? data.paymentHistory
                : [];


        feesState.receipts =
            Array.isArray(
                data.receipts
            )
                ? data.receipts
                : [];


        feesState.dues =
            Array.isArray(
                data.dues
            )
                ? data.dues
                : [];


        feesState.scholarships =
            Array.isArray(
                data.scholarships
            )
                ? data.scholarships
                : [];


        renderSummary();

        renderFeeStructure();

        renderPaymentHistory();

        renderReceipts();

        renderDues();

        renderScholarships();

    }

    catch (error) {

        console.error(
            "Fees data error:",
            error
        );

    }

}


/* =====================================================
   PAYMENT REQUEST
===================================================== */

async function initiatePayment() {

    /*
        This function is intentionally prepared for
        the future payment backend.

        The actual payment gateway must be connected
        through the institution-approved backend.

        Never put payment gateway secret keys in
        this frontend JavaScript file.
    */

    if (!API_BASE_URL) {

        openModal(
            "paymentModal"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/fees/payment`,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            amount:
                                feesState.summary
                                    ?.outstanding

                        })

                    }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to initiate payment."
            );

        }


        const paymentData =
            await response.json();


        if (
            paymentData.paymentUrl
        ) {

            window.location.href =
                paymentData.paymentUrl;

        }

    }

    catch (error) {

        console.error(
            "Payment error:",
            error
        );

    }

}


/* =====================================================
   STATUS BADGE
===================================================== */

function createStatusBadge(
    status
) {

    if (!status) {

        return `
            <span class="status">
                --
            </span>
        `;

    }


    const normalized =
        String(status)
            .toLowerCase()
            .replaceAll(
                " ",
                "-"
            );


    let className =
        "status";


    if (
        normalized === "paid" ||
        normalized === "approved" ||
        normalized === "completed"
    ) {

        className +=
            " status-paid";

    }

    else if (
        normalized === "pending" ||
        normalized === "due"
    ) {

        className +=
            " status-pending";

    }

    else if (
        normalized === "overdue" ||
        normalized === "rejected"
    ) {

        className +=
            " status-overdue";

    }


    return `

        <span class="${className}">

            ${escapeHtml(
                String(status)
            )}

        </span>

    `;

}


/* =====================================================
   AMOUNT FORMATTER
===================================================== */

function formatAmount(
    amount
) {

    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {

        return "--";

    }


    const numericAmount =
        Number(amount);


    if (
        Number.isNaN(
            numericAmount
        )
    ) {

        return escapeHtml(
            String(amount)
        );

    }


    return new Intl.NumberFormat(
        "en-IN",
        {
            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                2
        }
    ).format(
        numericAmount
    );

}


/* =====================================================
   EMPTY STATE
===================================================== */

function renderEmptyState(
    container,
    icon,
    title,
    description
) {

    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <i class="${icon}"></i>

            </div>


            <h3>

                ${escapeHtml(
                    title
                )}

            </h3>


            <p>

                ${escapeHtml(
                    description
                )}

            </p>

        </div>

    `;

}


/* =====================================================
   HTML ESCAPING
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