/* =====================================================
   CAMPUSCONNECT LIBRARY
   API-BASED FRONTEND

   Student/resource information is NOT hardcoded.

   Data flow:

   Login / Session
        ↓
   Java Backend
        ↓
   MySQL Database
        ↓
   Library API
        ↓
   This frontend
===================================================== */


/* =====================================================
   API
===================================================== */

const API = "/api/library";

let selectedResourceType = "ALL";

let resourceSearchTimer;

let globalSearchTimer;


/* =====================================================
   COMMON API REQUEST
===================================================== */

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {

        credentials: "include",

        ...options,

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }

    });


    if (!response.ok) {

        throw new Error(
            `Request failed: ${response.status}`
        );

    }


    return response.json();

}


/* =====================================================
   BACK NAVIGATION
===================================================== */

function goBack() {

    /*
        First priority:
        Use the browser's real history.

        This takes the user to the actual page
        they visited before Library.
    */

    if (window.history.length > 1) {

        window.history.back();

        return;

    }


    /*
        If browser history is unavailable,
        use document.referrer.
    */

    if (document.referrer) {

        window.location.replace(
            document.referrer
        );

        return;

    }


    /*
        Last fallback only.

        This should normally never be needed.
    */

    window.location.replace(
        "../Dashboard/dashboard.html"
    );

}


/* =====================================================
   HANDLE BROWSER BACK / FORWARD
===================================================== */

window.addEventListener(
    "popstate",
    async function(event) {

        /*
            If the history entry contains a
            Library section, open that section.
        */

        if (
            event.state &&
            event.state.librarySection
        ) {

            await openSection(
                event.state.librarySection,
                false
            );

            return;

        }

        /*
            Otherwise the browser has gone
            to another actual webpage.

            Nothing needs to be done here.
            Browser navigation handles it.
        */

    }
);


/* =====================================================
   DASHBOARD
===================================================== */

async function loadDashboard() {

    try {

        const data =
            await apiRequest(
                `${API}/dashboard`
            );


        setText(
            "issuedCount",
            data.issuedResources
        );


        setText(
            "renewedCount",
            data.renewedResources
        );


        setText(
            "returnedCount",
            data.returnedResources
        );


        renderRecentResources(
            data.recentResources || []
        );


        renderCurrentBooks(
            data.currentBooks || []
        );


    } catch (error) {

        console.error(
            "Library dashboard error:",
            error
        );


        showEmpty(
            "recentResources",
            "Library data is currently unavailable."
        );


        showEmpty(
            "currentBooks",
            "Library data is currently unavailable."
        );


        setText(
            "issuedCount",
            null
        );


        setText(
            "renewedCount",
            null
        );


        setText(
            "returnedCount",
            null
        );

    }

}


/* =====================================================
   RECENT E-RESOURCES
===================================================== */

function renderRecentResources(resources) {

    const container =
        document.getElementById(
            "recentResources"
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !Array.isArray(resources) ||
        !resources.length
    ) {

        showEmpty(
            "recentResources",
            "No recent e-resources available."
        );

        return;

    }


    resources.forEach(resource => {

        const card =
            document.createElement("article");


        card.className =
            "recent-card";


        const category =
            resource.category
                ? escapeHTML(resource.category)
                : "";


        const type =
            resource.type
                ? escapeHTML(resource.type)
                : "";


        const metadata =
            category || type
                ?

                `
                <div class="resource-mini-info">

                    ${
                        category
                            ? `<span>${category}</span>`
                            : ""
                    }

                    ${
                        type
                            ? `<span>${type}</span>`
                            : ""
                    }

                </div>
                `

                : "";


        card.innerHTML = `

            ${bookCover(
                resource.coverImage,
                resource.title
            )}

            <div>

                <h3>
                    ${escapeHTML(
                        resource.title ||
                        "Resource"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        resource.author ||
                        "Author information unavailable"
                    )}
                </p>

                ${metadata}

            </div>

        `;


        container.appendChild(card);

    });

}


/* =====================================================
   CURRENT BOOKS
===================================================== */

function renderCurrentBooks(books) {

    const container =
        document.getElementById(
            "currentBooks"
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !Array.isArray(books) ||
        !books.length
    ) {

        showEmpty(
            "currentBooks",
            "No books are currently issued to your account."
        );

        return;

    }


    books.forEach(book => {

        const card =
            document.createElement("article");


        card.className =
            "issued-book";


        const description =
            book.description
                ?

                `
                <div class="book-description">
                    ${escapeHTML(
                        book.description
                    )}
                </div>
                `

                : "";


        card.innerHTML = `

            ${bookCover(
                book.coverImage,
                book.title,
                "issued"
            )}

            <div>

                <h3>
                    ${escapeHTML(
                        book.title ||
                        "Book"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        book.author ||
                        "Author information unavailable"
                    )}
                </p>

                <div class="book-info">

                    ${
                        book.issueDate
                            ? `
                            <span>
                                Issued:
                                ${escapeHTML(
                                    book.issueDate
                                )}
                            </span>
                            `
                            : ""
                    }

                    ${
                        book.dueDate
                            ? `
                            <span>
                                Due:
                                ${escapeHTML(
                                    book.dueDate
                                )}
                            </span>
                            `
                            : ""
                    }

                    ${
                        book.status
                            ? `
                            <span>
                                Status:
                                ${escapeHTML(
                                    book.status
                                )}
                            </span>
                            `
                            : ""
                    }

                </div>

                ${description}

            </div>

        `;


        container.appendChild(card);

    });

}


/* =====================================================
   E-RESOURCES
===================================================== */

async function loadResources() {

    try {

        const searchInput =
            document.getElementById(
                "resourceSearch"
            );


        const search =
            searchInput
                ? searchInput.value.trim()
                : "";


        const params =
            new URLSearchParams();


        if (
            selectedResourceType !== "ALL"
        ) {

            params.append(
                "type",
                selectedResourceType
            );

        }


        if (search) {

            params.append(
                "search",
                search
            );

        }


        const query =
            params.toString();


        const url =
            query
                ? `${API}/resources?${query}`
                : `${API}/resources`;


        const data =
            await apiRequest(url);


        renderResources(
            data.resources || []
        );


    } catch (error) {

        console.error(
            "Resource loading error:",
            error
        );


        showEmpty(
            "resourceList",
            "E-resources are currently unavailable."
        );


        setText(
            "resourceCount",
            "0 resources"
        );

    }

}


/* =====================================================
   RESOURCE RENDER
===================================================== */

function renderResources(resources) {

    const container =
        document.getElementById(
            "resourceList"
        );


    const count =
        document.getElementById(
            "resourceCount"
        );


    if (!container) return;


    container.innerHTML = "";


    if (count) {

        count.textContent =
            `${resources.length} resources`;

    }


    if (!resources.length) {

        showEmpty(
            "resourceList",
            "No resources available."
        );

        return;

    }


    resources.forEach(resource => {

        const card =
            document.createElement("article");


        card.className =
            "resource-card";


        const tags = [];


        if (resource.category) {

            tags.push(
                `<span class="tag">
                    ${escapeHTML(
                        resource.category
                    )}
                </span>`
            );

        }


        if (resource.type) {

            tags.push(
                `<span class="tag">
                    ${escapeHTML(
                        resource.type
                    )}
                </span>`
            );

        }


        if (resource.subject) {

            tags.push(
                `<span class="tag">
                    ${escapeHTML(
                        resource.subject
                    )}
                </span>`
            );

        }


        if (resource.availability) {

            tags.push(
                `<span class="tag">
                    ${escapeHTML(
                        resource.availability
                    )}
                </span>`
            );

        }


        const description =
            resource.description
                ?

                `
                <p class="resource-description">
                    ${escapeHTML(
                        resource.description
                    )}
                </p>
                `

                : "";


        const action =
            resource.resourceUrl
                ?

                `
                <div class="resource-actions">

                    <button
                        class="resource-action"
                        type="button"
                        data-resource-url="${escapeAttribute(
                            resource.resourceUrl
                        )}">

                        <i class="fa-solid fa-arrow-up-right-from-square"></i>

                        Open Resource

                    </button>

                </div>
                `

                : "";


        card.innerHTML = `

            <div class="resource-top">

                ${bookCover(
                    resource.coverImage,
                    resource.title,
                    "resource"
                )}

                <div>

                    <h3>
                        ${escapeHTML(
                            resource.title ||
                            "Resource"
                        )}
                    </h3>

                    <p class="author">

                        ${escapeHTML(
                            resource.author ||
                            "Author information unavailable"
                        )}

                    </p>

                </div>

            </div>


            ${description}


            ${
                tags.length
                    ? `
                    <div class="tags">
                        ${tags.join("")}
                    </div>
                    `
                    : ""
            }


            ${action}

        `;


        const actionButton =
            card.querySelector(
                ".resource-action"
            );


        if (actionButton) {

            actionButton.addEventListener(
                "click",
                function() {

                    openExternalResource(
                        actionButton.dataset.resourceUrl
                    );

                }
            );

        }


        container.appendChild(card);

    });

}


/* =====================================================
   RESOURCE TYPE
===================================================== */

function toggleResourceTypes() {

    const dropdown =
        document.getElementById(
            "resourceTypes"
        );


    if (!dropdown) return;


    dropdown.classList.toggle(
        "show"
    );

}


function chooseResourceType(type) {

    selectedResourceType =
        type;


    const labels = {

        ALL:
            "All Types",

        BOOK:
            "Books",

        PDF:
            "PDFs",

        EBOOK:
            "E-Books",

        NOTES:
            "Notes",

        REFERENCE:
            "Reference Material"

    };


    const typeElement =
        document.getElementById(
            "resourceType"
        );


    if (typeElement) {

        typeElement.textContent =
            labels[type] ||
            "All Types";

    }


    const dropdown =
        document.getElementById(
            "resourceTypes"
        );


    if (dropdown) {

        dropdown.classList.remove(
            "show"
        );

    }


    loadResources();

}


/* =====================================================
   RESOURCE SEARCH
===================================================== */

function initializeResourceSearch() {

    const resourceSearch =
        document.getElementById(
            "resourceSearch"
        );


    if (!resourceSearch) return;


    resourceSearch.addEventListener(
        "input",
        function() {

            clearTimeout(
                resourceSearchTimer
            );


            resourceSearchTimer =
                setTimeout(
                    loadResources,
                    300
                );

        }
    );

}


/* =====================================================
   PURCHASE BOOKS
===================================================== */

async function loadPurchaseBooks() {

    try {

        const data =
            await apiRequest(
                `${API}/purchase-books`
            );


        renderPurchaseBooks(
            data.books || []
        );


    } catch (error) {

        console.error(
            "Purchase books error:",
            error
        );


        showEmpty(
            "purchaseList",
            "Books are currently unavailable."
        );

    }

}


/* =====================================================
   PURCHASE BOOK RENDER
===================================================== */

function renderPurchaseBooks(books) {

    const container =
        document.getElementById(
            "purchaseList"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!books.length) {

        showEmpty(
            "purchaseList",
            "No books available for purchase."
        );

        return;

    }


    books.forEach(book => {

        const card =
            document.createElement("article");


        card.className =
            "purchase-card";


        const price =
            Number(book.price);


        const formattedPrice =
            Number.isFinite(price)
                ? `₹${price.toFixed(2)}`
                : "Price unavailable";


        const purchaseButton =
            book.purchaseUrl
                ?

                `
                <button
                    class="buy-button"
                    type="button"
                    data-purchase-url="${escapeAttribute(
                        book.purchaseUrl
                    )}">

                    Buy / View

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </button>
                `

                : "";


        const description =
            book.description
                ?

                `
                <p class="purchase-description">
                    ${escapeHTML(
                        book.description
                    )}
                </p>
                `

                : "";


        card.innerHTML = `

            ${bookCover(
                book.coverImage,
                book.title,
                "purchase"
            )}

            <div>

                <h3>
                    ${escapeHTML(
                        book.title ||
                        "Book"
                    )}
                </h3>

                <p class="author">

                    ${escapeHTML(
                        book.author ||
                        "Author information unavailable"
                    )}

                </p>

                ${description}

                <div class="price">
                    ${formattedPrice}
                </div>

                ${
                    book.availability
                        ? `
                        <div class="availability">
                            ${escapeHTML(
                                book.availability
                            )}
                        </div>
                        `
                        : ""
                }

                ${purchaseButton}

            </div>

        `;


        const button =
            card.querySelector(
                ".buy-button"
            );


        if (button) {

            button.addEventListener(
                "click",
                function() {

                    openExternalResource(
                        button.dataset.purchaseUrl
                    );

                }
            );

        }


        container.appendChild(card);

    });

}


/* =====================================================
   GLOBAL SEARCH
===================================================== */

function initializeGlobalSearch() {

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );


    if (!globalSearch) return;


    globalSearch.addEventListener(
        "input",
        function() {

            clearTimeout(
                globalSearchTimer
            );


            globalSearchTimer =
                setTimeout(
                    performGlobalSearch,
                    300
                );

        }
    );

}


/* =====================================================
   PERFORM GLOBAL SEARCH
===================================================== */

async function performGlobalSearch() {

    const searchInput =
        document.getElementById(
            "globalSearch"
        );


    const container =
        document.getElementById(
            "searchResults"
        );


    if (!searchInput || !container) return;


    const search =
        searchInput.value.trim();


    if (!search) {

        showEmpty(
            "searchResults",
            "Start searching for a resource."
        );


        setText(
            "searchResultCount",
            "0 results"
        );


        return;

    }


    try {

        const data =
            await apiRequest(
                `${API}/resources?search=${encodeURIComponent(
                    search
                )}`
            );


        renderSearchResults(
            data.resources || []
        );


    } catch (error) {

        console.error(
            "Global search error:",
            error
        );


        showEmpty(
            "searchResults",
            "Unable to perform search."
        );

    }

}


/* =====================================================
   SEARCH RESULTS
===================================================== */

function renderSearchResults(resources) {

    const container =
        document.getElementById(
            "searchResults"
        );


    const count =
        document.getElementById(
            "searchResultCount"
        );


    if (!container) return;


    container.innerHTML = "";


    if (count) {

        count.textContent =
            `${resources.length} results`;

    }


    if (!resources.length) {

        showEmpty(
            "searchResults",
            "No matching resources found."
        );

        return;

    }


    resources.forEach(resource => {

        const card =
            document.createElement("article");


        card.className =
            "resource-card";


        const tags = [];


        if (resource.category) {

            tags.push(
                `<span class="tag">
                    ${escapeHTML(
                        resource.category
                    )}
                </span>`
            );

        }


        if (resource.type) {

            tags.push(
                `<span class="tag">
                    ${escapeHTML(
                        resource.type
                    )}
                </span>`
            );

        }


        if (resource.subject) {

            tags.push(
                `<span class="tag">
                    ${escapeHTML(
                        resource.subject
                    )}
                </span>`
            );

        }


        card.innerHTML = `

            <div class="resource-top">

                ${bookCover(
                    resource.coverImage,
                    resource.title,
                    "resource"
                )}

                <div>

                    <h3>
                        ${escapeHTML(
                            resource.title ||
                            "Resource"
                        )}
                    </h3>

                    <p class="author">

                        ${escapeHTML(
                            resource.author ||
                            "Author information unavailable"
                        )}

                    </p>

                </div>

            </div>


            ${
                resource.description
                    ? `
                    <p class="resource-description">
                        ${escapeHTML(
                            resource.description
                        )}
                    </p>
                    `
                    : ""
            }


            ${
                tags.length
                    ? `
                    <div class="tags">
                        ${tags.join("")}
                    </div>
                    `
                    : ""
            }


            ${
                resource.resourceUrl
                    ? `
                    <div class="resource-actions">

                        <button
                            class="resource-action"
                            type="button"
                            data-resource-url="${escapeAttribute(
                                resource.resourceUrl
                            )}">

                            <i class="fa-solid fa-arrow-up-right-from-square"></i>

                            Open Resource

                        </button>

                    </div>
                    `
                    : ""
            }

        `;


        const action =
            card.querySelector(
                ".resource-action"
            );


        if (action) {

            action.addEventListener(
                "click",
                function() {

                    openExternalResource(
                        action.dataset.resourceUrl
                    );

                }
            );

        }


        container.appendChild(card);

    });

}


/* =====================================================
   ACCOUNT
===================================================== */

async function loadAccount() {

    try {

        const data =
            await apiRequest(
                `${API}/account`
            );


        setText(
            "totalFine",
            formatCurrency(
                data.totalFine
            )
        );


        setText(
            "balanceAmount",
            formatCurrency(
                data.balanceAmount
            )
        );


        setText(
            "paidAmount",
            formatCurrency(
                data.paidAmount
            )
        );


        setText(
            "accountIssued",
            data.issuedResources
        );


        setText(
            "accountRenewed",
            data.renewedResources
        );


        setText(
            "accountReturned",
            data.returnedResources
        );


        renderHistory(
            data.history || []
        );


    } catch (error) {

        console.error(
            "Library account error:",
            error
        );


        setText(
            "totalFine",
            null,
            "₹—"
        );


        setText(
            "balanceAmount",
            null,
            "₹—"
        );


        setText(
            "paidAmount",
            null,
            "₹—"
        );


        setText(
            "accountIssued",
            null
        );


        setText(
            "accountRenewed",
            null
        );


        setText(
            "accountReturned",
            null
        );


        showEmpty(
            "libraryHistory",
            "Library account data is currently unavailable."
        );

    }

}


/* =====================================================
   CURRENCY
===================================================== */

function formatCurrency(value) {

    const amount =
        Number(value);


    if (!Number.isFinite(amount)) {

        return "₹—";

    }


    return `₹${amount.toFixed(2)}`;

}


/* =====================================================
   HISTORY
===================================================== */

function renderHistory(history) {

    const container =
        document.getElementById(
            "libraryHistory"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!history.length) {

        showEmpty(
            "libraryHistory",
            "No library history available."
        );

        return;

    }


    history.forEach(item => {

        const card =
            document.createElement("article");


        card.className =
            "history-card";


        const details = [];


        if (item.issueDate) {

            details.push(
                `
                <span>
                    Issued:
                    ${escapeHTML(
                        item.issueDate
                    )}
                </span>
                `
            );

        }


        if (item.dueDate) {

            details.push(
                `
                <span>
                    Due:
                    ${escapeHTML(
                        item.dueDate
                    )}
                </span>
                `
            );

        }


        if (item.returnDate) {

            details.push(
                `
                <span>
                    Returned:
                    ${escapeHTML(
                        item.returnDate
                    )}
                </span>
                `
            );

        }


        if (item.status) {

            details.push(
                `
                <span>
                    Status:
                    ${escapeHTML(
                        item.status
                    )}
                </span>
                `
            );

        }


        card.innerHTML = `

            <h3>
                ${escapeHTML(
                    item.title ||
                    "Library Resource"
                )}
            </h3>


            <p>
                ${escapeHTML(
                    item.author ||
                    "Author information unavailable"
                )}
            </p>


            ${
                details.length
                    ? `
                    <div class="history-details">
                        ${details.join("")}
                    </div>
                    `
                    : ""
            }


            ${
                item.description
                    ? `
                    <p class="history-description">
                        ${escapeHTML(
                            item.description
                        )}
                    </p>
                    `
                    : ""
            }

        `;


        container.appendChild(card);

    });

}


/* =====================================================
   LIBRARY RULES
===================================================== */

function toggleRules() {

    const content =
        document.getElementById(
            "rulesContent"
        );


    const arrow =
        document.getElementById(
            "rulesArrow"
        );


    if (!content) return;


    content.classList.toggle(
        "open"
    );


    if (arrow) {

        arrow.classList.toggle(
            "fa-chevron-down"
        );


        arrow.classList.toggle(
            "fa-chevron-up"
        );

    }

}


/* =====================================================
   NAVIGATION
===================================================== */

async function openSection(
    section,
    addHistory = true
) {

    const target =
        document.getElementById(
            section
        );


    if (!target) return;


    /*
        Hide every Library section.
    */

    document
        .querySelectorAll(
            ".library-section"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "active"
                );

            }
        );


    /*
        Show selected section.
    */

    target.classList.add(
        "active"
    );


    /*
        Update bottom navigation.
    */

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                    section
                );

            }
        );


    /*
        Add Library section to browser history.

        This is important because it allows
        Android/browser Back to move through
        Library sections properly.
    */

    if (addHistory) {

        const currentState =
            window.history.state;


        if (
            !currentState ||
            currentState.librarySection !== section
        ) {

            window.history.pushState(

                {
                    librarySection: section
                },

                "",

                window.location.href
            );

        }

    }


    /*
        Scroll to top.
    */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    /*
        Load required data.
    */

    if (section === "dashboard") {

        await loadDashboard();

    }


    if (section === "eresources") {

        await loadResources();

        await loadPurchaseBooks();

    }


    if (section === "account") {

        await loadAccount();

    }


    if (section === "search") {

        const searchInput =
            document.getElementById(
                "globalSearch"
            );


        if (searchInput) {

            searchInput.focus();

        }

    }

}


/* =====================================================
   SCROLL TO ELEMENT
===================================================== */

function scrollToElement(elementId) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) return;


    element.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


/* =====================================================
   EXTERNAL RESOURCE
===================================================== */

function openExternalResource(url) {

    if (!url) return;


    try {

        const parsedURL =
            new URL(
                url,
                window.location.origin
            );


        if (
            parsedURL.protocol !== "http:" &&
            parsedURL.protocol !== "https:"
        ) {

            console.error(
                "Invalid resource URL."
            );

            return;

        }


        window.open(
            parsedURL.href,
            "_blank",
            "noopener,noreferrer"
        );


    } catch (error) {

        console.error(
            "Invalid resource URL:",
            error
        );

    }

}


/* =====================================================
   IMAGE / BOOK COVER
===================================================== */

function bookCover(
    imageUrl,
    title,
    type = ""
) {

    const safeTitle =
        escapeAttribute(
            title || "Book"
        );


    const isIssued =
        type === "issued";


    const imageClass =
        isIssued
            ? "issued-cover"
            : "book-cover";


    const placeholderClass =
        isIssued
            ? "issued-cover-placeholder"
            : "cover-placeholder";


    if (imageUrl) {

        return `

            <img
                src="${escapeAttribute(
                    imageUrl
                )}"
                alt="${safeTitle}"
                class="${imageClass}"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                ">


            <div
                class="${placeholderClass}"
                style="display:none;">

                <i class="fa-solid fa-book"></i>

            </div>

        `;

    }


    return `

        <div
            class="${placeholderClass}">

            <i class="fa-solid fa-book"></i>

        </div>

    `;

}


/* =====================================================
   SET TEXT SAFELY
===================================================== */

function setText(
    elementId,
    value,
    fallback = "—"
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) return;


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        element.textContent =
            fallback;

        return;

    }


    element.textContent =
        value;

}


/* =====================================================
   EMPTY STATE
===================================================== */

function showEmpty(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) return;


    element.innerHTML = `

        <div class="empty-state">

            ${escapeHTML(
                message
            )}

        </div>

    `;

}


/* =====================================================
   SECURITY HELPERS
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


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


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =====================================================
   CLOSE RESOURCE DROPDOWN
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const box =
            document.querySelector(
                ".resource-type-box"
            );


        const dropdown =
            document.getElementById(
                "resourceTypes"
            );


        if (
            box &&
            dropdown &&
            !box.contains(event.target)
        ) {

            dropdown.classList.remove(
                "show"
            );

        }

    }
);


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        /*
            Initialize search listeners.
        */

        initializeResourceSearch();

        initializeGlobalSearch();


        /*
            Set the initial Library state.

            replaceState is used here instead of
            pushState so opening Library does not
            create an unnecessary duplicate entry.
        */

        const initialSection =
            "dashboard";


        window.history.replaceState(

            {
                librarySection:
                    initialSection
            },

            "",

            window.location.href
        );


        /*
            Load dashboard data.
        */

        await loadDashboard();

    }
);