"use strict";

/* =========================================================
   CAMPUSCONNECT — ADMIN LIBRARY
   API / DATABASE READY
========================================================= */

const CONFIG = {
    API_BASE_URL: "",

    ENDPOINTS: {
        dashboard: "/admin/library/dashboard",
        books: "/admin/library/books",
        members: "/admin/library/members",
        issues: "/admin/library/issues",
        returns: "/admin/library/returns",
        overdue: "/admin/library/overdue",
        activity: "/admin/library/activity",
        categories: "/admin/library/categories",
        reports: "/admin/library/reports",
        settings: "/admin/library/settings",
        inventory: "/admin/library/inventory"
    },

    PAGE_SIZE: 10
};


/* =========================================================
   STATE
========================================================= */

const state = {
    activeTab: "overview",

    currentPage: 1,
    totalPages: 1,

    search: "",
    category: "",
    availability: "",

    books: [],
    categories: [],
    members: [],
    activity: [],

    dashboard: null
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeLibrary
);


async function initializeLibrary() {

    setupTabs();
    setupNavigation();
    setupActions();
    setupSearch();
    setupFilters();
    setupPagination();
    setupModal();
    setupGlobalSearch();
    setupAdminProfile();

    await Promise.all([
        loadDashboard(),
        loadCategories(),
        loadBooks(),
        loadActivity()
    ]);
}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(endpoint, options = {}) {

    if (!CONFIG.API_BASE_URL) {
        return null;
    }

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();

    } catch (error) {

        console.error(
            "Library API error:",
            error
        );

        return null;
    }
}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    const data = await apiRequest(
        CONFIG.ENDPOINTS.dashboard
    );

    state.dashboard = data;

    setText(
        "totalBooks",
        data?.totalBooks !== undefined
            ? formatNumber(data.totalBooks)
            : "—"
    );

    setText(
        "availableBooks",
        data?.availableBooks !== undefined
            ? formatNumber(data.availableBooks)
            : "—"
    );

    setText(
        "issuedBooks",
        data?.issuedBooks !== undefined
            ? formatNumber(data.issuedBooks)
            : "—"
    );
}


/* =========================================================
   LOAD BOOKS
========================================================= */

async function loadBooks() {

    const params = new URLSearchParams();

    params.set(
        "page",
        state.currentPage
    );

    params.set(
        "pageSize",
        CONFIG.PAGE_SIZE
    );

    if (state.search) {
        params.set(
            "search",
            state.search
        );
    }

    if (state.category) {
        params.set(
            "category",
            state.category
        );
    }

    if (state.availability) {
        params.set(
            "availability",
            state.availability
        );
    }

    const data = await apiRequest(
        `${CONFIG.ENDPOINTS.books}?${params.toString()}`
    );

    if (!data) {

        state.books = [];
        state.totalPages = 1;

        renderBooks();

        return;
    }

    state.books = Array.isArray(data)
        ? data
        : Array.isArray(data.books)
            ? data.books
            : [];

    state.totalPages = Math.max(
        1,
        Number(data.totalPages || 1)
    );

    renderBooks();
}


/* =========================================================
   RENDER BOOKS
========================================================= */

function renderBooks() {

    const tbody =
        document.getElementById(
            "booksTableBody"
        );

    if (!tbody) {
        return;
    }

    if (!state.books.length) {

        tbody.innerHTML = `
            <tr class="table-empty-row">
                <td colspan="6">

                    <div class="table-empty">

                        <div class="empty-image">
                            <img
                                src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80"
                                alt="Library books">
                        </div>

                        <h3>
                            No library records available
                        </h3>

                        <p>
                            Books will appear here when
                            library data is available.
                        </p>

                    </div>

                </td>
            </tr>
        `;

        setText(
            "catalogSummary",
            "No records to display"
        );

        setText(
            "currentPage",
            state.currentPage
        );

        updatePagination();

        return;
    }

    tbody.innerHTML =
        state.books.map(book => `

            <tr>

                <td>

                    <strong>
                        ${escapeHtml(
                            book.title || "Untitled"
                        )}
                    </strong>

                    ${
                        book.author
                            ? `
                                <div class="book-author">
                                    ${escapeHtml(
                                        book.author
                                    )}
                                </div>
                              `
                            : ""
                    }

                </td>

                <td>
                    ${escapeHtml(
                        book.isbn || "—"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        book.category || "—"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        book.copies ?? "—"
                    )}
                </td>

                <td>
                    ${renderStatus(book.status)}
                </td>

                <td>

                    <button
                        class="secondary-button"
                        type="button"
                        data-book-id="${escapeHtml(
                            book.id ?? ""
                        )}">

                        View

                    </button>

                </td>

            </tr>

        `).join("");

    tbody
        .querySelectorAll(
            "[data-book-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const bookId =
                        button.dataset.bookId;

                    const book =
                        state.books.find(
                            item =>
                                String(
                                    item.id
                                ) === String(
                                    bookId
                                )
                        );

                    if (book) {
                        openBookDetails(book);
                    }
                }
            );
        });

    const start =
        ((state.currentPage - 1) *
            CONFIG.PAGE_SIZE) + 1;

    const end =
        start +
        state.books.length -
        1;

    setText(
        "catalogSummary",
        `Showing ${start}–${end} records`
    );

    setText(
        "currentPage",
        state.currentPage
    );

    updatePagination();
}


/* =========================================================
   BOOK STATUS
========================================================= */

function renderStatus(status) {

    const value =
        String(status || "")
            .toLowerCase();

    let background = "#f1f5f9";
    let color = "#64748b";

    if (value === "available") {
        background = "#eaf7ee";
        color = "#16803c";
    }

    if (value === "issued") {
        background = "#fff5df";
        color = "#b77900";
    }

    if (
        value === "unavailable" ||
        value === "lost" ||
        value === "damaged"
    ) {
        background = "#fdecec";
        color = "#c62828";
    }

    return `
        <span
            style="
                display:inline-flex;
                align-items:center;
                padding:4px 7px;
                border-radius:5px;
                background:${background};
                color:${color};
                font-size:10px;
                font-weight:600;
            "
        >
            ${escapeHtml(
                status || "—"
            )}
        </span>
    `;
}


/* =========================================================
   LOAD CATEGORIES
========================================================= */

async function loadCategories() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.categories
        );

    state.categories =
        Array.isArray(data)
            ? data
            : Array.isArray(
                data?.categories
            )
                ? data.categories
                : [];

    const select =
        document.getElementById(
            "categoryFilter"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;

    state.categories.forEach(
        category => {

            const value =
                typeof category === "string"
                    ? category
                    : category.name;

            if (!value) {
                return;
            }

            const option =
                document.createElement(
                    "option"
                );

            option.value = value;
            option.textContent = value;

            select.appendChild(option);
        }
    );
}


/* =========================================================
   LOAD ACTIVITY
========================================================= */

async function loadActivity() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.activity
        );

    state.activity =
        Array.isArray(data)
            ? data
            : Array.isArray(
                data?.activity
            )
                ? data.activity
                : [];

    renderActivity();
}


/* =========================================================
   RENDER ACTIVITY
========================================================= */

function renderActivity() {

    const container =
        document.getElementById(
            "activityList"
        );

    if (!container) {
        return;
    }

    if (!state.activity.length) {

        container.innerHTML = `

            <div class="activity-empty">

                <i class="fa-regular fa-clock"></i>

                <div>

                    <strong>
                        No recent activity
                    </strong>

                    <span>
                        Activity will appear when
                        library transactions are recorded.
                    </span>

                </div>

            </div>

        `;

        return;
    }

    container.innerHTML =
        state.activity
            .map(item => `

                <div class="activity-item">

                    <strong>
                        ${escapeHtml(
                            item.title ||
                            item.action ||
                            "Library activity"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            item.description || ""
                        )}
                    </span>

                </div>

            `)
            .join("");
}


/* =========================================================
   TABS
========================================================= */

function setupTabs() {

    document
        .querySelectorAll(
            ".library-tab"
        )
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;

                    if (!target) {
                        return;
                    }

                    switchToTab(target);
                }
            );
        });
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const sidebarToggle =
        document.getElementById(
            "sidebarToggle"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    sidebarToggle?.addEventListener(
        "click",
        () => {

            sidebar?.classList.toggle(
                "sidebar-open"
            );
        }
    );


    /* -----------------------------------------------------
       BACK BUTTON
    ----------------------------------------------------- */

    const backButton =
        document.getElementById(
            "backButton"
        );

    backButton?.addEventListener(
        "click",
        () => {

            if (
                window.history.length > 1
            ) {
                window.history.back();
            }
        }
    );


    /* -----------------------------------------------------
       REFRESH
    ----------------------------------------------------- */

    const refreshButton =
        document.getElementById(
            "refreshButton"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async () => {

                const icon =
                    refreshButton.querySelector(
                        "i"
                    );

                if (icon) {
                    icon.classList.add(
                        "fa-spin"
                    );
                }

                await Promise.all([
                    loadDashboard(),
                    loadCategories(),
                    loadBooks(),
                    loadActivity()
                ]);

                if (icon) {
                    icon.classList.remove(
                        "fa-spin"
                    );
                }
            }
        );
    }
}


/* =========================================================
   ACTIONS
========================================================= */

function setupActions() {

    /* -----------------------------------------------------
       ADD BOOK
    ----------------------------------------------------- */

    document
        .getElementById(
            "addBookButton"
        )
        ?.addEventListener(
            "click",
            openAddBookForm
        );

    document
        .getElementById(
            "addBookButtonSecondary"
        )
        ?.addEventListener(
            "click",
            openAddBookForm
        );


    /* -----------------------------------------------------
       VIEW ALL BOOKS
    ----------------------------------------------------- */

    document
        .getElementById(
            "viewAllBooksButton"
        )
        ?.addEventListener(
            "click",
            () => {

                state.currentPage = 1;
                state.search = "";
                state.category = "";
                state.availability = "";

                resetBookFilters();

                switchToTab("books");

                loadBooks();
            }
        );


    /* -----------------------------------------------------
       VIEW ACTIVITY
    ----------------------------------------------------- */

    document
        .getElementById(
            "viewActivityButton"
        )
        ?.addEventListener(
            "click",
            openActivityInterface
        );


    /* -----------------------------------------------------
       TOTAL BOOKS
    ----------------------------------------------------- */

    document
        .getElementById(
            "totalBooksCard"
        )
        ?.addEventListener(
            "click",
            () => {

                state.search = "";
                state.category = "";
                state.availability = "";
                state.currentPage = 1;

                resetBookFilters();

                switchToTab("books");

                loadBooks();
            }
        );


    /* -----------------------------------------------------
       AVAILABLE BOOKS
    ----------------------------------------------------- */

    document
        .getElementById(
            "availableBooksCard"
        )
        ?.addEventListener(
            "click",
            () => {

                state.availability =
                    "available";

                state.currentPage = 1;

                const filter =
                    document.getElementById(
                        "availabilityFilter"
                    );

                if (filter) {
                    filter.value =
                        "available";
                }

                switchToTab("books");

                loadBooks();
            }
        );


    /* -----------------------------------------------------
       ISSUED BOOKS
    ----------------------------------------------------- */

    document
        .getElementById(
            "issuedBooksCard"
        )
        ?.addEventListener(
            "click",
            () => {

                state.availability =
                    "issued";

                state.currentPage = 1;

                const filter =
                    document.getElementById(
                        "availabilityFilter"
                    );

                if (filter) {
                    filter.value =
                        "issued";
                }

                switchToTab("issue");

                openIssuedBooksInterface();
            }
        );


    /* -----------------------------------------------------
       ISSUE / RETURN / OVERDUE CARDS
    ----------------------------------------------------- */

    document
        .querySelectorAll(
            ".workflow-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const action =
                        card.dataset.action;

                    if (action === "issue") {
                        openIssueBookInterface();
                    }

                    if (action === "return") {
                        openReturnBookInterface();
                    }

                    if (action === "overdue") {
                        openOverdueInterface();
                    }
                }
            );
        });


    /* -----------------------------------------------------
       MORE MANAGEMENT CARDS
    ----------------------------------------------------- */

    const managementCards =
        document.querySelectorAll(
            ".management-card"
        );

    managementCards.forEach(
        (card, index) => {

            card.addEventListener(
                "click",
                () => {

                    if (index === 0) {
                        openCategoriesInterface();
                    }

                    if (index === 1) {
                        openReportsInterface();
                    }

                    if (index === 2) {
                        openSettingsInterface();
                    }

                    if (index === 3) {
                        openInventoryInterface();
                    }
                }
            );
        }
    );
}


/* =========================================================
   ISSUE BOOK INTERFACE
========================================================= */

async function openIssueBookInterface() {

    const data =
        await apiRequest(
            `${CONFIG.ENDPOINTS.books}?availability=available&pageSize=100`
        );

    const books =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.books)
                ? data.books
                : [];

    const membersData =
        await apiRequest(
            `${CONFIG.ENDPOINTS.members}?pageSize=100`
        );

    const members =
        Array.isArray(membersData)
            ? membersData
            : Array.isArray(
                membersData?.members
            )
                ? membersData.members
                : [];

    openCustomModal(
        "Issue Book",
        "Record a book issue for an authorized library member.",
        `
        <form
            class="library-operation-form"
            id="issueBookForm"
        >

            <div class="operation-grid">

                <div class="form-group">

                    <label for="issueBookSelect">
                        Book <span>*</span>
                    </label>

                    <select
                        id="issueBookSelect"
                        name="bookId"
                        required
                    >

                        <option value="">
                            ${books.length
                                ? "Select available book"
                                : "No book records available"}
                        </option>

                        ${books.map(book => `
                            <option value="${escapeHtml(book.id ?? "")}">
                                ${escapeHtml(book.title || "Untitled")}
                                ${book.isbn
                                    ? ` — ${escapeHtml(book.isbn)}`
                                    : ""}
                            </option>
                        `).join("")}

                    </select>

                </div>


                <div class="form-group">

                    <label for="issueMemberSelect">
                        Member <span>*</span>
                    </label>

                    <select
                        id="issueMemberSelect"
                        name="memberId"
                        required
                    >

                        <option value="">
                            ${members.length
                                ? "Select member"
                                : "No member records available"}
                        </option>

                        ${members.map(member => `
                            <option value="${escapeHtml(member.id ?? "")}">
                                ${escapeHtml(
                                    member.name ||
                                    member.fullName ||
                                    member.memberName ||
                                    "Unnamed member"
                                )}
                            </option>
                        `).join("")}

                    </select>

                </div>


                <div class="form-group">

                    <label for="issueDate">
                        Issue Date <span>*</span>
                    </label>

                    <input
                        type="date"
                        id="issueDate"
                        name="issueDate"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="dueDate">
                        Due Date <span>*</span>
                    </label>

                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        required
                    >

                </div>

            </div>


            <div
                id="issueFormMessage"
                class="form-message"
            ></div>


            <div class="form-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="cancelIssueBook"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    <i class="fa-solid fa-arrow-right"></i>
                    Issue Book
                </button>

            </div>

        </form>
        `
    );

    setTodayDate("issueDate");

    document
        .getElementById("cancelIssueBook")
        ?.addEventListener(
            "click",
            closeLibraryModal
        );

    document
        .getElementById("issueBookForm")
        ?.addEventListener(
            "submit",
            handleIssueBook
        );
}


/* =========================================================
   HANDLE ISSUE BOOK
========================================================= */

async function handleIssueBook(event) {

    event.preventDefault();

    const form = event.target;

    const data = {
        bookId: form.bookId.value,
        memberId: form.memberId.value,
        issueDate: form.issueDate.value,
        dueDate: form.dueDate.value
    };

    const message =
        document.getElementById(
            "issueFormMessage"
        );

    if (!CONFIG.API_BASE_URL) {

        showFormMessage(
            message,
            "The issue form is ready. Connect the Java backend and MySQL API to save this transaction.",
            "info"
        );

        console.log(
            "Issue Book data ready for backend:",
            data
        );

        return;
    }

    try {

        const result =
            await apiRequest(
                CONFIG.ENDPOINTS.issues,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

        if (!result) {
            throw new Error(
                "Issue request failed."
            );
        }

        closeLibraryModal();

        await Promise.all([
            loadDashboard(),
            loadBooks(),
            loadActivity()
        ]);

        openSuccessModal(
            "Book Issued",
            "The book issue has been recorded successfully."
        );

    } catch (error) {

        console.error(error);

        showFormMessage(
            message,
            "The book could not be issued. Please check the backend connection.",
            "error"
        );
    }
}


/* =========================================================
   RETURN BOOK INTERFACE
========================================================= */

async function openReturnBookInterface() {

    const data =
        await apiRequest(
            `${CONFIG.ENDPOINTS.issues}?status=issued&pageSize=100`
        );

    const issues =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.issues)
                ? data.issues
                : [];

    openCustomModal(
        "Return Book",
        "Record the return of a currently issued library book.",
        `
        <form
            class="library-operation-form"
            id="returnBookForm"
        >

            <div class="operation-grid">

                <div class="form-group full-width">

                    <label for="returnIssueSelect">
                        Issued Book <span>*</span>
                    </label>

                    <select
                        id="returnIssueSelect"
                        name="issueId"
                        required
                    >

                        <option value="">
                            ${issues.length
                                ? "Select issued book"
                                : "No issued-book records available"}
                        </option>

                        ${issues.map(issue => `
                            <option value="${escapeHtml(issue.id ?? "")}">
                                ${escapeHtml(
                                    issue.bookTitle ||
                                    issue.title ||
                                    "Issued book"
                                )}
                                ${
                                    issue.memberName
                                        ? ` — ${escapeHtml(issue.memberName)}`
                                        : ""
                                }
                            </option>
                        `).join("")}

                    </select>

                </div>


                <div class="form-group">

                    <label for="returnDate">
                        Return Date <span>*</span>
                    </label>

                    <input
                        type="date"
                        id="returnDate"
                        name="returnDate"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="returnCondition">
                        Book Condition
                    </label>

                    <select
                        id="returnCondition"
                        name="condition"
                    >

                        <option value="good">
                            Good
                        </option>

                        <option value="damaged">
                            Damaged
                        </option>

                        <option value="lost">
                            Lost
                        </option>

                    </select>

                </div>


                <div class="form-group full-width">

                    <label for="returnNotes">
                        Notes
                    </label>

                    <textarea
                        id="returnNotes"
                        name="notes"
                        placeholder="Add return notes if required..."
                    ></textarea>

                </div>

            </div>


            <div
                id="returnFormMessage"
                class="form-message"
            ></div>


            <div class="form-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="cancelReturnBook"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    <i class="fa-solid fa-arrow-left"></i>
                    Record Return
                </button>

            </div>

        </form>
        `
    );

    setTodayDate("returnDate");

    document
        .getElementById("cancelReturnBook")
        ?.addEventListener(
            "click",
            closeLibraryModal
        );

    document
        .getElementById("returnBookForm")
        ?.addEventListener(
            "submit",
            handleReturnBook
        );
}


/* =========================================================
   HANDLE RETURN BOOK
========================================================= */

async function handleReturnBook(event) {

    event.preventDefault();

    const form = event.target;

    const data = {
        issueId: form.issueId.value,
        returnDate: form.returnDate.value,
        condition: form.condition.value,
        notes: form.notes.value.trim()
    };

    const message =
        document.getElementById(
            "returnFormMessage"
        );

    if (!CONFIG.API_BASE_URL) {

        showFormMessage(
            message,
            "The return form is ready. Connect the Java backend and MySQL API to save this transaction.",
            "info"
        );

        console.log(
            "Return Book data ready for backend:",
            data
        );

        return;
    }

    try {

        const result =
            await apiRequest(
                CONFIG.ENDPOINTS.returns,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

        if (!result) {
            throw new Error(
                "Return request failed."
            );
        }

        closeLibraryModal();

        await Promise.all([
            loadDashboard(),
            loadBooks(),
            loadActivity()
        ]);

        openSuccessModal(
            "Book Returned",
            "The book return has been recorded successfully."
        );

    } catch (error) {

        console.error(error);

        showFormMessage(
            message,
            "The return could not be recorded. Please check the backend connection.",
            "error"
        );
    }
}


/* =========================================================
   OVERDUE INTERFACE
========================================================= */

async function openOverdueInterface() {

    const data =
        await apiRequest(
            `${CONFIG.ENDPOINTS.overdue}?pageSize=100`
        );

    const records =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.records)
                ? data.records
                : Array.isArray(data?.overdue)
                    ? data.overdue
                    : [];

    openCustomModal(
        "Overdue Records",
        "Review library books that have crossed their due date.",
        `
        <div class="records-interface">

            <div class="records-toolbar">

                <div class="records-search">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="search"
                        id="overdueSearch"
                        placeholder="Search overdue records..."
                    >

                </div>

            </div>


            <div class="records-table-wrapper">

                <table class="records-table">

                    <thead>

                        <tr>
                            <th>Book</th>
                            <th>Member</th>
                            <th>Due Date</th>
                            <th>Days Overdue</th>
                        </tr>

                    </thead>

                    <tbody id="overdueTableBody">

                        ${renderOverdueRows(records)}

                    </tbody>

                </table>

            </div>

        </div>
        `
    );

    document
        .getElementById("overdueSearch")
        ?.addEventListener(
            "input",
            event => {

                const value =
                    event.target.value
                        .trim()
                        .toLowerCase();

                const filtered =
                    records.filter(
                        record =>
                            JSON.stringify(
                                record
                            )
                                .toLowerCase()
                                .includes(value)
                    );

                const body =
                    document.getElementById(
                        "overdueTableBody"
                    );

                if (body) {
                    body.innerHTML =
                        renderOverdueRows(
                            filtered
                        );
                }
            }
        );
}


/* =========================================================
   RENDER OVERDUE ROWS
========================================================= */

function renderOverdueRows(records) {

    if (!records.length) {

        return `
            <tr>
                <td
                    colspan="4"
                    class="records-empty"
                >
                    <i class="fa-solid fa-circle-check"></i>

                    <strong>
                        No overdue records available
                    </strong>

                    <span>
                        Overdue records will appear here when
                        library transaction data is available.
                    </span>

                </td>
            </tr>
        `;
    }

    return records.map(record => `

        <tr>

            <td>
                ${escapeHtml(
                    record.bookTitle ||
                    record.title ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    record.memberName ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    record.dueDate ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    record.daysOverdue ??
                    "—"
                )}
            </td>

        </tr>

    `).join("");
}


/* =========================================================
   ISSUED BOOKS INTERFACE
========================================================= */

async function openIssuedBooksInterface() {

    const data =
        await apiRequest(
            `${CONFIG.ENDPOINTS.issues}?status=issued&pageSize=100`
        );

    const issues =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.issues)
                ? data.issues
                : [];

    openCustomModal(
        "Currently Issued Books",
        "View books currently issued to library members.",
        `
        <div class="records-interface">

            <div class="records-table-wrapper">

                <table class="records-table">

                    <thead>
                        <tr>
                            <th>Book</th>
                            <th>Member</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            issues.length
                                ? issues.map(issue => `
                                    <tr>
                                        <td>
                                            ${escapeHtml(
                                                issue.bookTitle ||
                                                issue.title ||
                                                "—"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                issue.memberName ||
                                                "—"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                issue.issueDate ||
                                                "—"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                issue.dueDate ||
                                                "—"
                                            )}
                                        </td>
                                    </tr>
                                `).join("")
                                : `
                                    <tr>
                                        <td
                                            colspan="4"
                                            class="records-empty"
                                        >
                                            <i class="fa-solid fa-book"></i>

                                            <strong>
                                                No issued-book records available
                                            </strong>

                                            <span>
                                                Current circulation data will appear
                                                when the library API is connected.
                                            </span>
                                        </td>
                                    </tr>
                                `
                        }

                    </tbody>

                </table>

            </div>

        </div>
        `
    );
}


/* =========================================================
   CATEGORIES INTERFACE
========================================================= */

async function openCategoriesInterface() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.categories
        );

    const categories =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.categories)
                ? data.categories
                : [];

    openCustomModal(
        "Categories",
        "Manage book categories and subjects used by the library.",
        `
        <div class="management-interface">

            <div class="management-toolbar">

                <strong>
                    Library Categories
                </strong>

                <button
                    type="button"
                    class="primary-button"
                    id="addCategoryButton"
                >
                    <i class="fa-solid fa-plus"></i>
                    Add Category
                </button>

            </div>


            <div
                class="category-list"
                id="categoryManagementList"
            >

                ${
                    categories.length
                        ? categories.map(category => {

                            const name =
                                typeof category === "string"
                                    ? category
                                    : category.name;

                            return `
                                <div class="category-item">

                                    <span>
                                        ${escapeHtml(name || "Unnamed category")}
                                    </span>

                                </div>
                            `;

                        }).join("")
                        : `
                            <div class="records-empty">

                                <i class="fa-solid fa-tags"></i>

                                <strong>
                                    No categories available
                                </strong>

                                <span>
                                    Categories will appear here when
                                    library category data is available.
                                </span>

                            </div>
                        `
                }

            </div>

        </div>
        `
    );

    document
        .getElementById(
            "addCategoryButton"
        )
        ?.addEventListener(
            "click",
            openAddCategoryForm
        );
}


/* =========================================================
   ADD CATEGORY
========================================================= */

function openAddCategoryForm() {

    const list =
        document.getElementById(
            "categoryManagementList"
        );

    if (!list) {
        return;
    }

    const existing =
        document.getElementById(
            "addCategoryForm"
        );

    if (existing) {
        return;
    }

    list.insertAdjacentHTML(
        "afterbegin",
        `
        <form
            class="inline-management-form"
            id="addCategoryForm"
        >

            <input
                type="text"
                name="name"
                placeholder="Category name"
                required
            >

            <button
                type="submit"
                class="primary-button"
            >
                Add
            </button>

            <button
                type="button"
                class="secondary-button"
                id="cancelCategory"
            >
                Cancel
            </button>

        </form>
        `
    );

    document
        .getElementById(
            "cancelCategory"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "addCategoryForm"
                    )
                    ?.remove();
            }
        );

    document
        .getElementById(
            "addCategoryForm"
        )
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const name =
                    event.target.name.value.trim();

                if (!name) {
                    return;
                }

                if (!CONFIG.API_BASE_URL) {

                    alert(
                        "Category form is ready. Connect the backend to save this category."
                    );

                    console.log(
                        "Category data ready for backend:",
                        { name }
                    );

                    return;
                }

                const result =
                    await apiRequest(
                        CONFIG.ENDPOINTS.categories,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                name
                            })
                        }
                    );

                if (result) {
                    openCategoriesInterface();
                    await loadCategories();
                }
            }
        );
}


/* =========================================================
   REPORTS INTERFACE
========================================================= */

function openReportsInterface() {

    openCustomModal(
        "Library Reports",
        "Generate library usage, circulation and inventory reports.",
        `
        <form
            class="library-operation-form"
            id="reportForm"
        >

            <div class="operation-grid">

                <div class="form-group">

                    <label for="reportType">
                        Report Type <span>*</span>
                    </label>

                    <select
                        id="reportType"
                        name="reportType"
                        required
                    >

                        <option value="">
                            Select report
                        </option>

                        <option value="circulation">
                            Circulation Report
                        </option>

                        <option value="inventory">
                            Inventory Report
                        </option>

                        <option value="overdue">
                            Overdue Report
                        </option>

                        <option value="members">
                            Member Activity Report
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="reportFrom">
                        From Date
                    </label>

                    <input
                        type="date"
                        id="reportFrom"
                        name="fromDate"
                    >

                </div>


                <div class="form-group">

                    <label for="reportTo">
                        To Date
                    </label>

                    <input
                        type="date"
                        id="reportTo"
                        name="toDate"
                    >

                </div>

            </div>


            <div
                id="reportFormMessage"
                class="form-message"
            ></div>


            <div class="form-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="cancelReport"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    <i class="fa-solid fa-chart-column"></i>
                    Generate Report
                </button>

            </div>

        </form>
        `
    );

    document
        .getElementById(
            "cancelReport"
        )
        ?.addEventListener(
            "click",
            closeLibraryModal
        );

    document
        .getElementById(
            "reportForm"
        )
        ?.addEventListener(
            "submit",
            handleReportSubmit
        );
}


/* =========================================================
   REPORT SUBMIT
========================================================= */

async function handleReportSubmit(event) {

    event.preventDefault();

    const form = event.target;

    const data = {
        reportType: form.reportType.value,
        fromDate: form.fromDate.value || null,
        toDate: form.toDate.value || null
    };

    const message =
        document.getElementById(
            "reportFormMessage"
        );

    if (!CONFIG.API_BASE_URL) {

        showFormMessage(
            message,
            "The report interface is ready. Connect the backend API to generate actual library reports.",
            "info"
        );

        console.log(
            "Report request ready for backend:",
            data
        );

        return;
    }

    try {

        const result =
            await apiRequest(
                CONFIG.ENDPOINTS.reports,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

        if (!result) {
            throw new Error(
                "Report generation failed."
            );
        }

        showFormMessage(
            message,
            "The report request was successfully submitted.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showFormMessage(
            message,
            "The report could not be generated. Please check the backend connection.",
            "error"
        );
    }
}


/* =========================================================
   SETTINGS INTERFACE
========================================================= */

async function openSettingsInterface() {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.settings
        );

    const settings =
        data || {};

    openCustomModal(
        "Library Settings",
        "Configure borrowing and circulation rules.",
        `
        <form
            class="library-operation-form"
            id="librarySettingsForm"
        >

            <div class="operation-grid">

                <div class="form-group">

                    <label for="borrowingDays">
                        Default Borrowing Period
                    </label>

                    <input
                        type="number"
                        id="borrowingDays"
                        name="borrowingDays"
                        min="1"
                        value="${escapeHtml(
                            settings.borrowingDays ?? ""
                        )}"
                        placeholder="Enter number of days"
                    >

                </div>


                <div class="form-group">

                    <label for="maxBooks">
                        Maximum Books Per Member
                    </label>

                    <input
                        type="number"
                        id="maxBooks"
                        name="maxBooks"
                        min="1"
                        value="${escapeHtml(
                            settings.maxBooks ?? ""
                        )}"
                        placeholder="Enter maximum books"
                    >

                </div>


                <div class="form-group">

                    <label for="finePerDay">
                        Fine Per Overdue Day
                    </label>

                    <input
                        type="number"
                        id="finePerDay"
                        name="finePerDay"
                        min="0"
                        step="0.01"
                        value="${escapeHtml(
                            settings.finePerDay ?? ""
                        )}"
                        placeholder="Enter fine amount"
                    >

                </div>


                <div class="form-group">

                    <label for="renewalAllowed">
                        Renewal
                    </label>

                    <select
                        id="renewalAllowed"
                        name="renewalAllowed"
                    >

                        <option
                            value="true"
                            ${settings.renewalAllowed === true
                                ? "selected"
                                : ""}
                        >
                            Allowed
                        </option>

                        <option
                            value="false"
                            ${settings.renewalAllowed === false
                                ? "selected"
                                : ""}
                        >
                            Not Allowed
                        </option>

                    </select>

                </div>

            </div>


            <div
                id="settingsFormMessage"
                class="form-message"
            ></div>


            <div class="form-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="cancelSettings"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    <i class="fa-solid fa-floppy-disk"></i>
                    Save Settings
                </button>

            </div>

        </form>
        `
    );

    document
        .getElementById(
            "cancelSettings"
        )
        ?.addEventListener(
            "click",
            closeLibraryModal
        );

    document
        .getElementById(
            "librarySettingsForm"
        )
        ?.addEventListener(
            "submit",
            handleSettingsSubmit
        );
}


/* =========================================================
   SETTINGS SUBMIT
========================================================= */

async function handleSettingsSubmit(event) {

    event.preventDefault();

    const form = event.target;

    const data = {
        borrowingDays:
            form.borrowingDays.value
                ? Number(form.borrowingDays.value)
                : null,

        maxBooks:
            form.maxBooks.value
                ? Number(form.maxBooks.value)
                : null,

        finePerDay:
            form.finePerDay.value
                ? Number(form.finePerDay.value)
                : null,

        renewalAllowed:
            form.renewalAllowed.value === "true"
    };

    const message =
        document.getElementById(
            "settingsFormMessage"
        );

    if (!CONFIG.API_BASE_URL) {

        showFormMessage(
            message,
            "Settings interface is ready. Connect the backend API to save these library rules.",
            "info"
        );

        console.log(
            "Library settings ready for backend:",
            data
        );

        return;
    }

    try {

        const result =
            await apiRequest(
                CONFIG.ENDPOINTS.settings,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );

        if (!result) {
            throw new Error(
                "Settings update failed."
            );
        }

        showFormMessage(
            message,
            "Library settings have been saved successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showFormMessage(
            message,
            "Settings could not be saved. Please check the backend connection.",
            "error"
        );
    }
}


/* =========================================================
   INVENTORY INTERFACE
========================================================= */

async function openInventoryInterface() {

    const data =
        await apiRequest(
            `${CONFIG.ENDPOINTS.inventory}?pageSize=100`
        );

    const inventory =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.inventory)
                ? data.inventory
                : [];

    openCustomModal(
        "Inventory",
        "Track available, lost, damaged and archived library books.",
        `
        <div class="records-interface">

            <div class="records-toolbar">

                <div class="records-search">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="search"
                        id="inventorySearch"
                        placeholder="Search inventory..."
                    >

                </div>

            </div>


            <div class="records-table-wrapper">

                <table class="records-table">

                    <thead>

                        <tr>
                            <th>Book</th>
                            <th>Total Copies</th>
                            <th>Available</th>
                            <th>Issued</th>
                            <th>Status</th>
                        </tr>

                    </thead>

                    <tbody id="inventoryTableBody">

                        ${renderInventoryRows(inventory)}

                    </tbody>

                </table>

            </div>

        </div>
        `
    );

    document
        .getElementById(
            "inventorySearch"
        )
        ?.addEventListener(
            "input",
            event => {

                const value =
                    event.target.value
                        .trim()
                        .toLowerCase();

                const filtered =
                    inventory.filter(
                        item =>
                            JSON.stringify(
                                item
                            )
                                .toLowerCase()
                                .includes(value)
                    );

                const body =
                    document.getElementById(
                        "inventoryTableBody"
                    );

                if (body) {
                    body.innerHTML =
                        renderInventoryRows(
                            filtered
                        );
                }
            }
        );
}


/* =========================================================
   INVENTORY ROWS
========================================================= */

function renderInventoryRows(inventory) {

    if (!inventory.length) {

        return `
            <tr>

                <td
                    colspan="5"
                    class="records-empty"
                >

                    <i class="fa-solid fa-boxes-stacked"></i>

                    <strong>
                        No inventory records available
                    </strong>

                    <span>
                        Inventory information will appear here
                        when library data is available.
                    </span>

                </td>

            </tr>
        `;
    }

    return inventory.map(item => `

        <tr>

            <td>
                ${escapeHtml(
                    item.bookTitle ||
                    item.title ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.totalCopies ??
                    item.copies ??
                    "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.availableCopies ??
                    item.available ??
                    "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.issuedCopies ??
                    item.issued ??
                    "—"
                )}
            </td>

            <td>
                ${renderStatus(
                    item.status
                )}
            </td>

        </tr>

    `).join("");
}


/* =========================================================
   ACTIVITY INTERFACE
========================================================= */

function openActivityInterface() {

    const activity =
        state.activity || [];

    openCustomModal(
        "Library Activity",
        "Review recent issue, return and inventory activity.",
        `
        <div class="records-interface">

            <div class="activity-detail-list">

                ${
                    activity.length
                        ? activity.map(item => `
                            <div class="activity-detail-item">

                                <div class="activity-detail-icon">
                                    <i class="fa-solid fa-clock"></i>
                                </div>

                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            item.title ||
                                            item.action ||
                                            "Library activity"
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            item.description || ""
                                        )}
                                    </span>

                                </div>

                            </div>
                        `).join("")
                        : `
                            <div class="records-empty">

                                <i class="fa-regular fa-clock"></i>

                                <strong>
                                    No recent activity
                                </strong>

                                <span>
                                    Activity will appear when
                                    library transactions are recorded.
                                </span>

                            </div>
                        `
                }

            </div>

        </div>
        `
    );
}


/* =========================================================
   CUSTOM MODAL
========================================================= */

function openCustomModal(
    title,
    description,
    bodyHTML
) {

    const titleElement =
        document.getElementById(
            "modalTitle"
        );

    const descriptionElement =
        document.getElementById(
            "modalDescription"
        );

    const body =
        document.getElementById(
            "modalBody"
        );

    const modal =
        document.getElementById(
            "libraryModal"
        );

    if (!modal || !body) {
        return;
    }

    if (titleElement) {
        titleElement.textContent =
            title;
    }

    if (descriptionElement) {
        descriptionElement.textContent =
            description;
    }

    body.innerHTML =
        bodyHTML;

    modal.classList.add(
        "active"
    );
}


/* =========================================================
   SUCCESS MODAL
========================================================= */

function openSuccessModal(
    title,
    description
) {

    openCustomModal(
        title,
        description,
        `
        <div class="success-state">

            <div class="success-icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>

            <h3>
                Operation completed successfully
            </h3>

            <button
                type="button"
                class="primary-button"
                id="successCloseButton"
            >
                Close
            </button>

        </div>
        `
    );

    document
        .getElementById(
            "successCloseButton"
        )
        ?.addEventListener(
            "click",
            closeLibraryModal
        );
}


/* =========================================================
   ADD BOOK FORM
========================================================= */

function openAddBookForm() {

    const modal =
        document.getElementById(
            "libraryModal"
        );

    const title =
        document.getElementById(
            "modalTitle"
        );

    const description =
        document.getElementById(
            "modalDescription"
        );

    const body =
        document.getElementById(
            "modalBody"
        );

    if (!modal || !body) {
        return;
    }

    if (title) {
        title.textContent =
            "Add Book";
    }

    if (description) {
        description.textContent =
            "Enter the details of the book to add it to the Central Library.";
    }

    body.innerHTML = `

        <form
            id="addBookForm"
            class="add-book-form"
        >

            <div class="form-grid">

                <div class="form-group">

                    <label for="bookTitle">
                        Book Title <span>*</span>
                    </label>

                    <input
                        type="text"
                        id="bookTitle"
                        name="title"
                        placeholder="Enter book title"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="bookAuthor">
                        Author <span>*</span>
                    </label>

                    <input
                        type="text"
                        id="bookAuthor"
                        name="author"
                        placeholder="Enter author name"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="bookISBN">
                        ISBN
                    </label>

                    <input
                        type="text"
                        id="bookISBN"
                        name="isbn"
                        placeholder="Enter ISBN"
                    >

                </div>


                <div class="form-group">

                    <label for="bookCategory">
                        Category <span>*</span>
                    </label>

                    <select
                        id="bookCategory"
                        name="category"
                        required
                    >

                        <option value="">
                            Select category
                        </option>

                        <option value="Computer Science">
                            Computer Science
                        </option>

                        <option value="Programming">
                            Programming
                        </option>

                        <option value="Networking">
                            Networking
                        </option>

                        <option value="Database">
                            Database
                        </option>

                        <option value="Software Engineering">
                            Software Engineering
                        </option>

                        <option value="Mathematics">
                            Mathematics
                        </option>

                        <option value="Electronics">
                            Electronics
                        </option>

                        <option value="General">
                            General
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="bookPublisher">
                        Publisher
                    </label>

                    <input
                        type="text"
                        id="bookPublisher"
                        name="publisher"
                        placeholder="Enter publisher name"
                    >

                </div>


                <div class="form-group">

                    <label for="bookYear">
                        Publication Year
                    </label>

                    <input
                        type="number"
                        id="bookYear"
                        name="publicationYear"
                        placeholder="e.g. 2025"
                        min="1900"
                        max="2100"
                    >

                </div>


                <div class="form-group">

                    <label for="bookCopies">
                        Total Copies <span>*</span>
                    </label>

                    <input
                        type="number"
                        id="bookCopies"
                        name="totalCopies"
                        placeholder="Enter number of copies"
                        min="1"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="bookLocation">
                        Shelf / Location
                    </label>

                    <input
                        type="text"
                        id="bookLocation"
                        name="location"
                        placeholder="e.g. Shelf A-12"
                    >

                </div>

            </div>


            <div class="form-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="cancelAddBook"
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    class="primary-button"
                >

                    <i class="fa-solid fa-plus"></i>

                    Add Book

                </button>

            </div>

        </form>
    `;

    modal.classList.add(
        "active"
    );

    document
        .getElementById(
            "cancelAddBook"
        )
        ?.addEventListener(
            "click",
            closeLibraryModal
        );

    document
        .getElementById(
            "addBookForm"
        )
        ?.addEventListener(
            "submit",
            handleAddBookSubmit
        );
}


/* =========================================================
   HANDLE ADD BOOK
========================================================= */

async function handleAddBookSubmit(event) {

    event.preventDefault();

    const form =
        event.target;

    const bookData = {

        title:
            form.title.value.trim(),

        author:
            form.author.value.trim(),

        isbn:
            form.isbn.value.trim(),

        category:
            form.category.value,

        publisher:
            form.publisher.value.trim(),

        publicationYear:
            form.publicationYear.value
                ? Number(
                    form.publicationYear.value
                )
                : null,

        totalCopies:
            Number(
                form.totalCopies.value
            ),

        location:
            form.location.value.trim()
    };

    if (!CONFIG.API_BASE_URL) {

        const body =
            document.getElementById(
                "modalBody"
            );

        if (body) {

            body.innerHTML = `

                <div class="success-state">

                    <div class="success-icon">

                        <i class="fa-solid fa-server"></i>

                    </div>

                    <h3>
                        Book Form Ready
                    </h3>

                    <p>
                        The book details have been collected.
                        Connect the Java backend and MySQL database
                        to store them permanently.
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        id="closeBackendMessage"
                    >
                        Close
                    </button>

                </div>

            `;

            document
                .getElementById(
                    "closeBackendMessage"
                )
                ?.addEventListener(
                    "click",
                    closeLibraryModal
                );
        }

        console.log(
            "Book data ready for backend:",
            bookData
        );

        return;
    }

    try {

        const result =
            await apiRequest(
                CONFIG.ENDPOINTS.books,
                {
                    method: "POST",
                    body: JSON.stringify(
                        bookData
                    )
                }
            );

        if (!result) {
            throw new Error(
                "Book creation failed."
            );
        }

        closeLibraryModal();

        await Promise.all([
            loadDashboard(),
            loadBooks()
        ]);

        openSuccessModal(
            "Book Added",
            "The book has been successfully added to the library."
        );

    } catch (error) {

        console.error(
            "Add Book Error:",
            error
        );

        openLibraryModal(
            "Unable to Add Book",
            "The book could not be added. Please check the backend connection."
        );
    }
}


/* =========================================================
   BOOK DETAILS
========================================================= */

function openBookDetails(book) {

    if (!book) {
        return;
    }

    openCustomModal(
        book.title ||
            "Book Details",

        "Library record details.",

        `
        <div class="book-details">

            <div class="book-detail-row">
                <strong>Title</strong>
                <span>
                    ${escapeHtml(
                        book.title || "—"
                    )}
                </span>
            </div>

            <div class="book-detail-row">
                <strong>Author</strong>
                <span>
                    ${escapeHtml(
                        book.author || "—"
                    )}
                </span>
            </div>

            <div class="book-detail-row">
                <strong>ISBN</strong>
                <span>
                    ${escapeHtml(
                        book.isbn || "—"
                    )}
                </span>
            </div>

            <div class="book-detail-row">
                <strong>Category</strong>
                <span>
                    ${escapeHtml(
                        book.category || "—"
                    )}
                </span>
            </div>

            <div class="book-detail-row">
                <strong>Copies</strong>
                <span>
                    ${escapeHtml(
                        book.copies ?? "—"
                    )}
                </span>
            </div>

            <div class="book-detail-row">
                <strong>Status</strong>
                <span>
                    ${escapeHtml(
                        book.status || "—"
                    )}
                </span>
            </div>

        </div>
        `
    );
}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function setupGlobalSearch() {

    const search =
        document.getElementById(
            "globalSearch"
        );

    if (!search) {
        return;
    }

    search.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {
                return;
            }

            const value =
                search.value.trim();

            if (!value) {
                return;
            }

            const bookSearch =
                document.getElementById(
                    "bookSearch"
                );

            if (bookSearch) {
                bookSearch.value =
                    value;
            }

            state.search = value;
            state.currentPage = 1;

            switchToTab("books");

            loadBooks();
        }
    );
}


/* =========================================================
   ADMIN PROFILE
========================================================= */

function setupAdminProfile() {

    const profile =
        document.getElementById(
            "adminProfileButton"
        );

    if (!profile) {
        return;
    }

    profile.addEventListener(
        "click",
        () => {

            openCustomModal(
                "Administrator Profile",
                "Administrator profile information will be loaded from CampusConnect.",
                `
                <div class="profile-interface">

                    <div class="profile-interface-icon">
                        <i class="fa-solid fa-user"></i>
                    </div>

                    <strong>
                        Administrator
                    </strong>

                    <span>
                        Profile information will be loaded
                        from the CampusConnect backend.
                    </span>

                </div>
                `
            );
        }
    );
}


/* =========================================================
   SWITCH TAB
========================================================= */

function switchToTab(tabName) {

    state.activeTab =
        tabName;

    document
        .querySelectorAll(
            ".library-tab"
        )
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.tab ===
                    tabName
            );
        });

    document
        .querySelectorAll(
            ".tab-content"
        )
        .forEach(content => {

            content.classList.toggle(
                "active",
                content.id ===
                    `${tabName}Tab`
            );
        });
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const search =
        document.getElementById(
            "bookSearch"
        );

    if (!search) {
        return;
    }

    search.addEventListener(
        "input",
        debounce(
            () => {

                state.search =
                    search.value.trim();

                state.currentPage = 1;

                loadBooks();

            },
            350
        )
    );
}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    const category =
        document.getElementById(
            "categoryFilter"
        );

    const availability =
        document.getElementById(
            "availabilityFilter"
        );

    category?.addEventListener(
        "change",
        () => {

            state.category =
                category.value;

            state.currentPage = 1;

            loadBooks();
        }
    );

    availability?.addEventListener(
        "change",
        () => {

            state.availability =
                availability.value;

            state.currentPage = 1;

            loadBooks();
        }
    );
}


/* =========================================================
   PAGINATION
========================================================= */

function setupPagination() {

    const previous =
        document.getElementById(
            "previousPage"
        );

    const next =
        document.getElementById(
            "nextPage"
        );

    previous?.addEventListener(
        "click",
        () => {

            if (
                state.currentPage <= 1
            ) {
                return;
            }

            state.currentPage--;

            loadBooks();
        }
    );

    next?.addEventListener(
        "click",
        () => {

            if (
                state.currentPage >=
                state.totalPages
            ) {
                return;
            }

            state.currentPage++;

            loadBooks();
        }
    );
}


/* =========================================================
   UPDATE PAGINATION
========================================================= */

function updatePagination() {

    const previous =
        document.getElementById(
            "previousPage"
        );

    const next =
        document.getElementById(
            "nextPage"
        );

    if (previous) {
        previous.disabled =
            state.currentPage <= 1;
    }

    if (next) {
        next.disabled =
            state.currentPage >=
            state.totalPages;
    }
}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

    const modal =
        document.getElementById(
            "libraryModal"
        );

    const close =
        document.getElementById(
            "modalCloseButton"
        );

    close?.addEventListener(
        "click",
        closeLibraryModal
    );

    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {
                closeLibraryModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeLibraryModal();
            }
        }
    );
}


/* =========================================================
   ORIGINAL MODAL HELPER
========================================================= */

function openLibraryModal(
    title,
    description
) {

    openCustomModal(
        title,
        description,
        `
        <div class="modal-info-box">

            This operation is ready
            for backend/API integration.

            No sample records have
            been added.

        </div>
        `
    );
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeLibraryModal() {

    const modal =
        document.getElementById(
            "libraryModal"
        );

    if (modal) {
        modal.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   RESET BOOK FILTERS
========================================================= */

function resetBookFilters() {

    const search =
        document.getElementById(
            "bookSearch"
        );

    const category =
        document.getElementById(
            "categoryFilter"
        );

    const availability =
        document.getElementById(
            "availabilityFilter"
        );

    if (search) {
        search.value = "";
    }

    if (category) {
        category.value = "";
    }

    if (availability) {
        availability.value = "";
    }
}


/* =========================================================
   FORM MESSAGE
========================================================= */

function showFormMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `form-message ${type}`;
}


/* =========================================================
   TODAY DATE
========================================================= */

function setTodayDate(id) {

    const input =
        document.getElementById(id);

    if (!input) {
        return;
    }

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    input.value =
        `${year}-${month}-${day}`;
}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }
}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString();
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

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


/* =========================================================
   DEBOUNCE
========================================================= */

function debounce(
    callback,
    delay
) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer =
            setTimeout(
                () =>
                    callback(...args),
                delay
            );
    };
}