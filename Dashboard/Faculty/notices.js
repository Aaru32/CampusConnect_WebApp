/* =========================================
   CAMPUSCONNECT
   FACULTY NOTICES
   FRONTEND + BACKEND READY
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const backButton =
    document.getElementById("backButton");

const refreshButton =
    document.getElementById("refreshButton");

const noticeForm =
    document.getElementById("noticeForm");

const saveDraftButton =
    document.getElementById("saveDraftButton");

const publishButton =
    document.getElementById("publishButton");

const targetAudience =
    document.getElementById("targetAudience");

const classField =
    document.getElementById("classField");

const semesterField =
    document.getElementById("semesterField");

const subjectField =
    document.getElementById("subjectField");

const noticeTableBody =
    document.getElementById("noticeTableBody");

const emptyState =
    document.getElementById("emptyState");

const noticeSearch =
    document.getElementById("noticeSearch");

const statusFilter =
    document.getElementById("statusFilter");

const priorityFilter =
    document.getElementById("priorityFilter");

const noticeModal =
    document.getElementById("noticeModal");

const modalClose =
    document.getElementById("modalClose");

const modalContent =
    document.getElementById("modalContent");


/* =========================================
   OVERVIEW ELEMENTS
========================================= */

const totalNotices =
    document.getElementById("totalNotices");

const publishedNotices =
    document.getElementById("publishedNotices");

const draftNotices =
    document.getElementById("draftNotices");

const scheduledNotices =
    document.getElementById("scheduledNotices");


/* =========================================
   BACK NAVIGATION
========================================= */

backButton.addEventListener(
    "click",
    function () {

        if (window.history.length > 1) {

            window.history.back();

        } else {

            window.location.href =
                "../faculty-dashboard.html";
        }

    }
);


/* =========================================
   REFRESH
========================================= */

refreshButton.addEventListener(
    "click",
    async function () {

        refreshButton.disabled = true;

        const icon =
            refreshButton.querySelector("i");

        icon.classList.add("fa-spin");

        try {

            await loadNotices();

        } finally {

            icon.classList.remove("fa-spin");

            refreshButton.disabled = false;
        }

    }
);


/* =========================================
   TARGET AUDIENCE
========================================= */

targetAudience.addEventListener(
    "change",
    function () {

        const value =
            targetAudience.value;


        classField.hidden =
            value !== "class";


        semesterField.hidden =
            value !== "semester";


        subjectField.hidden =
            value !== "subject";

    }
);


/* =========================================
   LOAD DYNAMIC OPTIONS
========================================= */

function loadTargetOptions() {

    /*
        BACKEND INTEGRATION POINT

        These dropdowns should eventually be
        populated from the authenticated faculty's
        assigned classes, semesters and subjects.

        No student/class/subject data is hardcoded.
    */

    /*
        Example future endpoints:

        GET /faculty/classes
        GET /faculty/semesters
        GET /faculty/subjects
    */

}


/* =========================================
   LOAD NOTICES
========================================= */

async function loadNotices() {

    /*
        BACKEND INTEGRATION POINT

        Example future endpoint:

        GET /faculty/notices

        The backend should return only notices
        created by or accessible to the logged-in
        faculty member.

        No fixed notice data is inserted here.
    */


    clearNoticeTable();

    setOverviewToEmpty();

    showEmptyState();

}


/* =========================================
   CLEAR TABLE
========================================= */

function clearNoticeTable() {

    noticeTableBody.innerHTML = "";

}


/* =========================================
   EMPTY STATE
========================================= */

function showEmptyState() {

    emptyState.style.display =
        "flex";

}


function hideEmptyState() {

    emptyState.style.display =
        "none";

}


/* =========================================
   EMPTY OVERVIEW
========================================= */

function setOverviewToEmpty() {

    totalNotices.textContent = "—";

    publishedNotices.textContent = "—";

    draftNotices.textContent = "—";

    scheduledNotices.textContent = "—";

}


/* =========================================
   RENDER NOTICES
========================================= */

function renderNotices(notices) {

    clearNoticeTable();


    if (
        !Array.isArray(notices) ||
        notices.length === 0
    ) {

        showEmptyState();

        setOverviewToEmpty();

        return;
    }


    hideEmptyState();


    let published = 0;

    let drafts = 0;

    let scheduled = 0;


    notices.forEach(
        function (notice) {

            if (
                notice.status ===
                "published"
            ) {
                published++;
            }


            if (
                notice.status ===
                "draft"
            ) {
                drafts++;
            }


            if (
                notice.status ===
                "scheduled"
            ) {
                scheduled++;
            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="notice-title">
                        ${escapeHTML(
                            notice.title || "Untitled Notice"
                        )}
                    </div>

                    <div class="notice-meta">
                        ${
                            notice.createdAt
                                ? escapeHTML(
                                    notice.createdAt
                                )
                                : "—"
                        }
                    </div>

                </td>


                <td>
                    ${escapeHTML(
                        notice.audience || "—"
                    )}
                </td>


                <td>

                    <span
                        class="
                            priority-badge
                            priority-${escapeHTML(
                                notice.priority || "normal"
                            )}
                        "
                    >
                        ${escapeHTML(
                            formatLabel(
                                notice.priority
                            )
                        )}
                    </span>

                </td>


                <td>
                    ${
                        notice.publishDate
                            ? escapeHTML(
                                notice.publishDate
                            )
                            : "—"
                    }
                </td>


                <td>
                    ${
                        notice.expiryDate
                            ? escapeHTML(
                                notice.expiryDate
                            )
                            : "—"
                    }
                </td>


                <td>

                    <span
                        class="
                            status-badge
                            status-${escapeHTML(
                                notice.status || ""
                            )}
                        "
                    >
                        ${escapeHTML(
                            formatLabel(
                                notice.status
                            )
                        )}
                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="table-action"
                            title="View"
                            data-action="view"
                            data-id="${escapeHTML(
                                notice.id
                            )}"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>


                        <button
                            type="button"
                            class="table-action"
                            title="Edit"
                            data-action="edit"
                            data-id="${escapeHTML(
                                notice.id
                            )}"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>


                        <button
                            type="button"
                            class="table-action delete"
                            title="Delete"
                            data-action="delete"
                            data-id="${escapeHTML(
                                notice.id
                            )}"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </td>

            `;


            noticeTableBody.appendChild(row);

        }
    );


    totalNotices.textContent =
        notices.length;

    publishedNotices.textContent =
        published;

    draftNotices.textContent =
        drafts;

    scheduledNotices.textContent =
        scheduled;


    attachTableActions();

}


/* =========================================
   TABLE ACTIONS
========================================= */

function attachTableActions() {

    document
        .querySelectorAll(
            ".table-action"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const action =
                            button.dataset.action;

                        const id =
                            button.dataset.id;


                        handleNoticeAction(
                            action,
                            id
                        );

                    }
                );

            }
        );

}


/* =========================================
   NOTICE ACTION
========================================= */

function handleNoticeAction(
    action,
    id
) {

    if (action === "view") {

        openNoticeView(id);

        return;
    }


    if (action === "edit") {

        editNotice(id);

        return;
    }


    if (action === "delete") {

        deleteNotice(id);

    }

}


/* =========================================
   VIEW NOTICE
========================================= */

function openNoticeView(id) {

    /*
        BACKEND INTEGRATION POINT

        Future:

        GET /faculty/notices/{id}
    */

    modalContent.innerHTML = `

        <h2 class="modal-title">
            Notice Details
        </h2>

        <div class="modal-info">

            <span class="status-badge">
                Notice ID: ${escapeHTML(id)}
            </span>

        </div>

        <div class="modal-content-text">
            Notice details will be loaded from the backend for this notice.
        </div>

    `;


    noticeModal.hidden = false;

}


/* =========================================
   EDIT NOTICE
========================================= */

function editNotice(id) {

    /*
        BACKEND INTEGRATION POINT

        Future:

        GET /faculty/notices/{id}

        Then populate the Create Notice form
        with the returned notice data.
    */

    console.log(
        "Edit notice:",
        id
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   DELETE NOTICE
========================================= */

function deleteNotice(id) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this notice?"
        );


    if (!confirmed) {
        return;
    }


    /*
        BACKEND INTEGRATION POINT

        Future:

        DELETE /faculty/notices/{id}

        Do not delete from a local hardcoded
        array. The backend should perform the
        actual deletion.
    */

    console.log(
        "Delete notice:",
        id
    );

}


/* =========================================
   CREATE NOTICE
========================================= */

noticeForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        await submitNotice(
            "published"
        );

    }
);


/* =========================================
   SAVE DRAFT
========================================= */

saveDraftButton.addEventListener(
    "click",
    async function () {

        await submitNotice(
            "draft"
        );

    }
);


/* =========================================
   SUBMIT NOTICE
========================================= */

async function submitNotice(status) {

    const title =
        document.getElementById(
            "noticeTitle"
        ).value.trim();

    const content =
        document.getElementById(
            "noticeContent"
        ).value.trim();

    const audience =
        targetAudience.value;

    const priority =
        document.getElementById(
            "noticePriority"
        ).value;


    if (!title) {

        alert(
            "Please enter a notice title."
        );

        return;
    }


    if (!audience) {

        alert(
            "Please select the target audience."
        );

        return;
    }


    if (!priority) {

        alert(
            "Please select the notice priority."
        );

        return;
    }


    if (
        status === "published" &&
        !content
    ) {

        alert(
            "Please enter the notice content."
        );

        return;
    }


    const formData =
        new FormData(
            noticeForm
        );


    formData.append(
        "status",
        status
    );


    /*
        BACKEND INTEGRATION POINT

        Future API:

        POST /faculty/notices

        Send FormData so that notice attachments
        can also be uploaded.

        The backend must determine the authenticated
        faculty member from the login/session/token.

        Do NOT add a hardcoded faculty ID here.
    */


    console.log(
        "Notice ready for backend:",
        {
            status: status,
            title: title,
            content: content,
            audience: audience,
            priority: priority
        }
    );


    alert(
        status === "draft"
            ? "Draft is ready to be saved when the backend is connected."
            : "Notice is ready to be published when the backend is connected."
    );

}


/* =========================================
   SEARCH + FILTER
========================================= */

noticeSearch.addEventListener(
    "input",
    applyFilters
);


statusFilter.addEventListener(
    "change",
    applyFilters
);


priorityFilter.addEventListener(
    "change",
    applyFilters
);


function applyFilters() {

    /*
        BACKEND INTEGRATION POINT

        Filtering can eventually be performed
        through API query parameters, for example:

        GET /faculty/notices
            ?search=
            &status=
            &priority=

        For now there is no local notice dataset,
        so no fake filtering data is generated.
    */

}


/* =========================================
   MODAL CLOSE
========================================= */

modalClose.addEventListener(
    "click",
    closeModal
);


noticeModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            noticeModal
        ) {

            closeModal();

        }

    }
);


function closeModal() {

    noticeModal.hidden = true;

    modalContent.innerHTML = "";

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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


/* =========================================
   FORMAT LABEL
========================================= */

function formatLabel(value) {

    if (!value) {
        return "—";
    }


    return String(value)
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            function (letter) {
                return letter.toUpperCase();
            }
        );

}


/* =========================================
   INITIALIZE
========================================= */

loadTargetOptions();

loadNotices();