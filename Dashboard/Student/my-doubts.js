/* =========================================================
   CAMPUSCONNECT - MY DOUBTS
   STUDENT MODULE

   FRONTEND
   API READY FOR FUTURE JAVA + MYSQL BACKEND

   No fabricated student, teacher, subject,
   or doubt data is used.
========================================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =================================================
           CONFIGURATION
        ================================================= */

        const CONFIG = {

            /*
             * Keep empty until the Java backend
             * is connected.
             *
             * Later:
             *
             * API_BASE_URL:
             * "http://localhost:8080/api"
             */

            API_BASE_URL: "",


            ENDPOINTS: {

                DOUBTS:
                    "/student/doubts",

                SUBJECTS:
                    "/student/subjects",

                SUBJECT_TEACHERS:
                    "/student/subjects/{subjectId}/teachers",

                DOUBT_DETAILS:
                    "/doubts/{doubtId}",

                DOUBT_REPLIES:
                    "/doubts/{doubtId}/replies"

            }

        };



        /* =================================================
           DOM REFERENCES
        ================================================= */

        const backBtn =
            document.getElementById(
                "backBtn"
            );


        const askDoubtBtn =
            document.getElementById(
                "askDoubtBtn"
            );


        const doubtModal =
            document.getElementById(
                "doubtModal"
            );


        const closeDoubtModal =
            document.getElementById(
                "closeDoubtModal"
            );


        const cancelDoubtBtn =
            document.getElementById(
                "cancelDoubtBtn"
            );


        const doubtForm =
            document.getElementById(
                "doubtForm"
            );


        const subjectSelect =
            document.getElementById(
                "subjectSelect"
            );


        const teacherSelect =
            document.getElementById(
                "teacherSelect"
            );


        const questionInput =
            document.getElementById(
                "questionInput"
            );


        const questionCounter =
            document.getElementById(
                "questionCounter"
            );


        const attachmentInput =
            document.getElementById(
                "attachmentInput"
            );


        const fileName =
            document.getElementById(
                "fileName"
            );


        const submitDoubtBtn =
            document.getElementById(
                "submitDoubtBtn"
            );


        const doubtsList =
            document.getElementById(
                "doubtsList"
            );


        const doubtSearch =
            document.getElementById(
                "doubtSearch"
            );


        const detailsModal =
            document.getElementById(
                "detailsModal"
            );


        const closeDetailsModal =
            document.getElementById(
                "closeDetailsModal"
            );


        const doubtDetailsContent =
            document.getElementById(
                "doubtDetailsContent"
            );


        const detailsTitle =
            document.getElementById(
                "detailsTitle"
            );


        const detailsSubtitle =
            document.getElementById(
                "detailsSubtitle"
            );



        /* =================================================
           STATE
        ================================================= */

        let doubts = [];

        let activeStatus =
            "all";

        let selectedDoubtId =
            null;



        /* =================================================
           UTILITY
        ================================================= */

        function buildUrl(endpoint) {

            return (
                CONFIG.API_BASE_URL +
                endpoint
            );

        }



        function escapeHTML(value) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");

        }



        function formatDate(value) {

            if (!value) {

                return "Date unavailable";

            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "Date unavailable";

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



        function formatStatus(status) {

            if (!status) {

                return "Unknown";

            }


            const normalized =
                String(status)
                    .toLowerCase()
                    .replaceAll("_", "-");


            const labels = {

                "pending":
                    "Pending",

                "in-progress":
                    "In Progress",

                "answered":
                    "Answered",

                "resolved":
                    "Resolved",

                "reopened":
                    "Reopened"

            };


            return (
                labels[normalized] ||
                status
            );

        }



        function normalizeStatus(status) {

            return String(
                status || ""
            )
                .toLowerCase()
                .replaceAll("_", "-");

        }



        /* =================================================
           BACK BUTTON
        ================================================= */

        if (backBtn) {

            backBtn.addEventListener(
                "click",
                function () {

                    if (
                        window.history.length > 1
                    ) {

                        window.history.back();

                    } else {

                        window.location.href =
                            "student-dashboard.html";

                    }

                }
            );

        }



        /* =================================================
           MODAL HELPERS
        ================================================= */

        function openModal(modal) {

            if (!modal) return;


            modal.classList.add(
                "active"
            );


            modal.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.classList.add(
                "modal-open"
            );

        }



        function closeModal(modal) {

            if (!modal) return;


            modal.classList.remove(
                "active"
            );


            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            if (
                !document.querySelector(
                    ".modal-overlay.active"
                )
            ) {

                document.body.classList.remove(
                    "modal-open"
                );

            }

        }



        function resetDoubtForm() {

            if (!doubtForm) return;


            doubtForm.reset();


            clearValidation();


            teacherSelect.innerHTML = `

                <option value="">
                    Select a subject first
                </option>

            `;


            teacherSelect.disabled =
                true;


            questionCounter.textContent =
                "0 / 2000";


            fileName.textContent =
                "Attach image or PDF";

        }



        /* =================================================
           OPEN NEW DOUBT
        ================================================= */

        if (askDoubtBtn) {

            askDoubtBtn.addEventListener(
                "click",
                function () {

                    resetDoubtForm();

                    openModal(
                        doubtModal
                    );

                    loadSubjects();

                }
            );

        }



        if (closeDoubtModal) {

            closeDoubtModal.addEventListener(
                "click",
                function () {

                    closeModal(
                        doubtModal
                    );

                }
            );

        }



        if (cancelDoubtBtn) {

            cancelDoubtBtn.addEventListener(
                "click",
                function () {

                    closeModal(
                        doubtModal
                    );

                }
            );

        }



        /* =================================================
           CLOSE DETAILS
        ================================================= */

        if (closeDetailsModal) {

            closeDetailsModal.addEventListener(
                "click",
                function () {

                    closeModal(
                        detailsModal
                    );

                }
            );

        }



        /* =================================================
           CLOSE MODALS WHEN CLICKING OVERLAY
        ================================================= */

        [doubtModal, detailsModal]
            .forEach(
                modal => {

                    if (!modal) return;


                    modal.addEventListener(
                        "click",
                        function (event) {

                            if (
                                event.target ===
                                modal
                            ) {

                                closeModal(
                                    modal
                                );

                            }

                        }
                    );

                }
            );



        /* =================================================
           ESCAPE KEY
        ================================================= */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Escape"
                ) {

                    return;

                }


                if (
                    doubtModal &&
                    doubtModal.classList.contains(
                        "active"
                    )
                ) {

                    closeModal(
                        doubtModal
                    );

                }


                if (
                    detailsModal &&
                    detailsModal.classList.contains(
                        "active"
                    )
                ) {

                    closeModal(
                        detailsModal
                    );

                }

            }
        );



        /* =================================================
           LOAD SUBJECTS
        ================================================= */

        async function loadSubjects() {

            subjectSelect.innerHTML = `

                <option value="">
                    Loading subjects...
                </option>

            `;


            subjectSelect.disabled =
                true;


            try {

                const response =
                    await fetch(
                        buildUrl(
                            CONFIG.ENDPOINTS.SUBJECTS
                        ),
                        {
                            method: "GET",
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load subjects."
                    );

                }


                const data =
                    await response.json();


                const subjects =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(
                            data.subjects
                        )
                            ? data.subjects
                            : [];


                renderSubjectOptions(
                    subjects
                );


            } catch (error) {

                console.error(
                    "Subject loading error:",
                    error
                );


                renderSubjectEmptyState();

            }

        }



        function renderSubjectOptions(
            subjects
        ) {

            subjectSelect.innerHTML = `

                <option value="">
                    Select Subject
                </option>

            `;


            if (
                !subjects.length
            ) {

                subjectSelect.innerHTML = `

                    <option value="">
                        No subjects available
                    </option>

                `;


                subjectSelect.disabled =
                    true;


                return;

            }


            subjects.forEach(
                subject => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        subject.id ??
                        subject.subjectId ??
                        "";


                    option.textContent =
                        subject.name ??
                        subject.subjectName ??
                        "Unnamed Subject";


                    if (
                        option.value
                    ) {

                        subjectSelect.appendChild(
                            option
                        );

                    }

                }
            );


            subjectSelect.disabled =
                false;

        }



        function renderSubjectEmptyState() {

            subjectSelect.innerHTML = `

                <option value="">
                    Subjects unavailable
                </option>

            `;


            subjectSelect.disabled =
                true;


            teacherSelect.innerHTML = `

                <option value="">
                    Select a subject first
                </option>

            `;


            teacherSelect.disabled =
                true;

        }



        /* =================================================
           SUBJECT CHANGE
        ================================================= */

        if (subjectSelect) {

            subjectSelect.addEventListener(
                "change",
                function () {

                    const subjectId =
                        subjectSelect.value;


                    clearFieldError(
                        "subjectError"
                    );


                    teacherSelect.innerHTML = `

                        <option value="">
                            Select Teacher
                        </option>

                    `;


                    teacherSelect.disabled =
                        true;


                    if (!subjectId) {

                        teacherSelect.innerHTML = `

                            <option value="">
                                Select a subject first
                            </option>

                        `;

                        return;

                    }


                    loadTeachers(
                        subjectId
                    );

                }
            );

        }



        /* =================================================
           LOAD TEACHERS
        ================================================= */

        async function loadTeachers(
            subjectId
        ) {

            teacherSelect.innerHTML = `

                <option value="">
                    Loading teachers...
                </option>

            `;


            teacherSelect.disabled =
                true;


            const endpoint =
                CONFIG.ENDPOINTS
                    .SUBJECT_TEACHERS
                    .replace(
                        "{subjectId}",
                        encodeURIComponent(
                            subjectId
                        )
                    );


            try {

                const response =
                    await fetch(
                        buildUrl(
                            endpoint
                        ),
                        {
                            method: "GET",
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load teachers."
                    );

                }


                const data =
                    await response.json();


                const teachers =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(
                            data.teachers
                        )
                            ? data.teachers
                            : [];


                renderTeacherOptions(
                    teachers
                );


            } catch (error) {

                console.error(
                    "Teacher loading error:",
                    error
                );


                teacherSelect.innerHTML = `

                    <option value="">
                        Teachers unavailable
                    </option>

                `;


                teacherSelect.disabled =
                    true;

            }

        }



        function renderTeacherOptions(
            teachers
        ) {

            teacherSelect.innerHTML = `

                <option value="">
                    Select Teacher
                </option>

            `;


            if (
                !teachers.length
            ) {

                teacherSelect.innerHTML = `

                    <option value="">
                        No teacher available for this subject
                    </option>

                `;


                teacherSelect.disabled =
                    true;


                return;

            }


            teachers.forEach(
                teacher => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        teacher.id ??
                        teacher.teacherId ??
                        "";


                    option.textContent =
                        teacher.name ??
                        teacher.teacherName ??
                        "Unnamed Teacher";


                    if (
                        option.value
                    ) {

                        teacherSelect.appendChild(
                            option
                        );

                    }

                }
            );


            teacherSelect.disabled =
                false;

        }



        /* =================================================
           QUESTION COUNTER
        ================================================= */

        if (questionInput) {

            questionInput.addEventListener(
                "input",
                function () {

                    questionCounter.textContent =
                        `${questionInput.value.length} / 2000`;

                    clearFieldError(
                        "questionError"
                    );

                }
            );

        }



        /* =================================================
           FILE INPUT
        ================================================= */

        if (attachmentInput) {

            attachmentInput.addEventListener(
                "change",
                function () {

                    const file =
                        attachmentInput.files[0];


                    if (!file) {

                        fileName.textContent =
                            "Attach image or PDF";

                        return;

                    }


                    fileName.textContent =
                        file.name;

                    clearFieldError(
                        "attachmentError"
                    );

                }
            );

        }



        /* =================================================
           VALIDATION
        ================================================= */

        function clearValidation() {

            document
                .querySelectorAll(
                    ".field-error"
                )
                .forEach(
                    element => {

                        element.textContent =
                            "";

                    }
                );

        }



        function clearFieldError(
            id
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    "";

            }

        }



        function setFieldError(
            id,
            message
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    message;

            }

        }



        function validateDoubtForm() {

            clearValidation();


            let valid = true;


            if (
                !subjectSelect.value
            ) {

                setFieldError(
                    "subjectError",
                    "Please select a subject."
                );


                valid = false;

            }


            if (
                !teacherSelect.value
            ) {

                setFieldError(
                    "teacherError",
                    "Please select a teacher."
                );


                valid = false;

            }


            const question =
                questionInput.value.trim();


            if (!question) {

                setFieldError(
                    "questionError",
                    "Please enter your question."
                );


                valid = false;

            } else if (
                question.length < 5
            ) {

                setFieldError(
                    "questionError",
                    "Please provide a little more detail."
                );


                valid = false;

            }


            const file =
                attachmentInput.files[0];


            if (file) {

                const allowedTypes = [

                    "image/jpeg",

                    "image/png",

                    "application/pdf"

                ];


                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {

                    setFieldError(
                        "attachmentError",
                        "Only JPG, PNG, or PDF files are allowed."
                    );


                    valid = false;

                }

            }


            return valid;

        }



        /* =================================================
           SUBMIT DOUBT
        ================================================= */

        if (doubtForm) {

            doubtForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    if (
                        !validateDoubtForm()
                    ) {

                        return;

                    }


                    const formData =
                        new FormData();


                    formData.append(
                        "subjectId",
                        subjectSelect.value
                    );


                    formData.append(
                        "teacherId",
                        teacherSelect.value
                    );


                    formData.append(
                        "question",
                        questionInput.value.trim()
                    );


                    if (
                        attachmentInput.files[0]
                    ) {

                        formData.append(
                            "attachment",
                            attachmentInput.files[0]
                        );

                    }


                    setSubmitState(
                        true
                    );


                    try {

                        const response =
                            await fetch(
                                buildUrl(
                                    CONFIG.ENDPOINTS.DOUBTS
                                ),
                                {
                                    method: "POST",
                                    body: formData
                                }
                            );


                        if (!response.ok) {

                            throw new Error(
                                "Unable to submit doubt."
                            );

                        }


                        closeModal(
                            doubtModal
                        );


                        resetDoubtForm();


                        await loadDoubts();


                    } catch (error) {

                        console.error(
                            "Doubt submission error:",
                            error
                        );


                        setFieldError(
                            "questionError",
                            "Your doubt could not be submitted. Please try again when the server is available."
                        );

                    } finally {

                        setSubmitState(
                            false
                        );

                    }

                }
            );

        }



        function setSubmitState(
            loading
        ) {

            if (!submitDoubtBtn) {
                return;
            }


            submitDoubtBtn.disabled =
                loading;


            if (loading) {

                submitDoubtBtn.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Submitting...

                `;

            } else {

                submitDoubtBtn.innerHTML = `

                    <i class="fa-solid fa-paper-plane"></i>

                    Submit Doubt

                `;

            }

        }



        /* =================================================
           LOAD DOUBTS
        ================================================= */

        async function loadDoubts() {

            renderLoadingState();


            try {

                const response =
                    await fetch(
                        buildUrl(
                            CONFIG.ENDPOINTS.DOUBTS
                        ),
                        {
                            method: "GET",
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load doubts."
                    );

                }


                const data =
                    await response.json();


                doubts =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(
                            data.doubts
                        )
                            ? data.doubts
                            : [];


                updateCounts();


                renderDoubts();


            } catch (error) {

                console.error(
                    "Doubt loading error:",
                    error
                );


                doubts = [];


                updateCounts();


                renderBackendUnavailableState();

            }

        }



        /* =================================================
           LOADING STATE
        ================================================= */

        function renderLoadingState() {

            doubtsList.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">

                        <i class="fa-solid fa-spinner fa-spin"></i>

                    </div>

                    <h3>
                        Loading your doubts
                    </h3>

                    <p>
                        Please wait while your academic doubts are loaded.
                    </p>

                </div>

            `;

        }



        /* =================================================
           BACKEND UNAVAILABLE
        ================================================= */

        function renderBackendUnavailableState() {

            doubtsList.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">

                        <i class="fa-solid fa-cloud-arrow-down"></i>

                    </div>

                    <h3>
                        Doubts are not available yet
                    </h3>

                    <p>
                        Your doubts will appear here when the
                        CampusConnect backend is connected.
                    </p>

                </div>

            `;

        }



        /* =================================================
           EMPTY STATE
        ================================================= */

        function renderEmptyState() {

            doubtsList.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">

                        <i class="fa-solid fa-circle-question"></i>

                    </div>

                    <h3>
                        No doubts yet
                    </h3>

                    <p>
                        You haven't submitted any academic doubts.
                        Click "Ask New Doubt" to send a question
                        to one of your teachers.
                    </p>

                </div>

            `;

        }



        /* =================================================
           UPDATE STATUS COUNTS
        ================================================= */

        function updateCounts() {

            const counts = {

                all:
                    doubts.length,

                pending:
                    0,

                "in-progress":
                    0,

                answered:
                    0,

                resolved:
                    0

            };


            doubts.forEach(
                doubt => {

                    const status =
                        normalizeStatus(
                            doubt.status
                        );


                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                counts,
                                status
                            )
                    ) {

                        counts[status]++;

                    }

                }
            );


            document.getElementById(
                "allCount"
            ).textContent =
                counts.all;


            document.getElementById(
                "pendingCount"
            ).textContent =
                counts.pending;


            document.getElementById(
                "progressCount"
            ).textContent =
                counts["in-progress"];


            document.getElementById(
                "answeredCount"
            ).textContent =
                counts.answered;


            document.getElementById(
                "resolvedCount"
            ).textContent =
                counts.resolved;

        }



        /* =================================================
           FILTER DOUBTS
        ================================================= */

        function getFilteredDoubts() {

            const search =
                doubtSearch
                    ? doubtSearch.value
                        .trim()
                        .toLowerCase()
                    : "";


            return doubts.filter(
                doubt => {

                    const status =
                        normalizeStatus(
                            doubt.status
                        );


                    const matchesStatus =
                        activeStatus === "all" ||
                        status === activeStatus;


                    if (!matchesStatus) {

                        return false;

                    }


                    if (!search) {

                        return true;

                    }


                    const searchableText = [

                        doubt.subjectName,

                        doubt.subject,

                        doubt.teacherName,

                        doubt.teacher,

                        doubt.question,

                        doubt.status

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        search
                    );

                }
            );

        }



        /* =================================================
           RENDER DOUBTS
        ================================================= */

        function renderDoubts() {

            const filteredDoubts =
                getFilteredDoubts();


            if (
                !filteredDoubts.length
            ) {

                renderEmptyState();

                return;

            }


            doubtsList.innerHTML =
                "";


            filteredDoubts.forEach(
                doubt => {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "doubt-card";


                    card.dataset.id =
                        doubt.id;


                    const status =
                        normalizeStatus(
                            doubt.status
                        );


                    const subject =
                        escapeHTML(
                            doubt.subjectName ??
                            doubt.subject ??
                            "Subject unavailable"
                        );


                    const teacher =
                        escapeHTML(
                            doubt.teacherName ??
                            doubt.teacher ??
                            "Teacher unavailable"
                        );


                    const question =
                        escapeHTML(
                            doubt.question ??
                            "Question unavailable"
                        );


                    const createdAt =
                        formatDate(
                            doubt.createdAt ??
                            doubt.created_at
                        );


                    card.innerHTML = `

                        <div class="doubt-card-top">

                            <div class="doubt-main">

                                <div class="doubt-subject">
                                    ${subject}
                                </div>

                                <div class="doubt-question">
                                    ${question}
                                </div>

                                <div class="doubt-meta">

                                    <span>
                                        <i class="fa-solid fa-user"></i>
                                        ${teacher}
                                    </span>

                                    <span>
                                        <i class="fa-regular fa-calendar"></i>
                                        ${createdAt}
                                    </span>

                                </div>

                            </div>


                            <span class="status-badge ${status}">

                                <i class="${getStatusIcon(status)}"></i>

                                ${escapeHTML(
                                    formatStatus(
                                        doubt.status
                                    )
                                )}

                            </span>

                        </div>

                    `;


                    card.addEventListener(
                        "click",
                        function () {

                            openDoubtDetails(
                                doubt.id
                            );

                        }
                    );


                    doubtsList.appendChild(
                        card
                    );

                }
            );

        }



        function getStatusIcon(
            status
        ) {

            const icons = {

                pending:
                    "fa-regular fa-clock",

                "in-progress":
                    "fa-solid fa-spinner",

                answered:
                    "fa-solid fa-check",

                resolved:
                    "fa-solid fa-circle-check",

                reopened:
                    "fa-solid fa-rotate-left"

            };


            return (
                icons[status] ||
                "fa-solid fa-circle-info"
            );

        }



        /* =================================================
           STATUS FILTER
        ================================================= */

        document
            .querySelectorAll(
                ".status-card"
            )
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        function () {

                            document
                                .querySelectorAll(
                                    ".status-card"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            card.classList.add(
                                "active"
                            );


                            activeStatus =
                                card.dataset.status ||
                                "all";


                            updateListHeading();


                            renderDoubts();

                        }
                    );

                }
            );



        function updateListHeading() {

            const titles = {

                all:
                    "My Doubts",

                pending:
                    "Pending Doubts",

                "in-progress":
                    "Doubts In Progress",

                answered:
                    "Answered Doubts",

                resolved:
                    "Resolved Doubts"

            };


            const descriptions = {

                all:
                    "Your submitted academic questions",

                pending:
                    "Doubts waiting for a teacher's response",

                "in-progress":
                    "Doubts currently being handled",

                answered:
                    "Doubts that have received a teacher response",

                resolved:
                    "Doubts marked as resolved"

            };


            document.getElementById(
                "doubtListTitle"
            ).textContent =
                titles[activeStatus] ||
                titles.all;


            document.getElementById(
                "doubtListDescription"
            ).textContent =
                descriptions[activeStatus] ||
                descriptions.all;

        }



        /* =================================================
           SEARCH
        ================================================= */

        if (doubtSearch) {

            doubtSearch.addEventListener(
                "input",
                function () {

                    renderDoubts();

                }
            );

        }



        /* =================================================
           OPEN DOUBT DETAILS
        ================================================= */

        async function openDoubtDetails(
            doubtId
        ) {

            selectedDoubtId =
                doubtId;


            doubtDetailsContent.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">

                        <i class="fa-solid fa-spinner fa-spin"></i>

                    </div>

                    <h3>
                        Loading doubt
                    </h3>

                    <p>
                        Please wait...
                    </p>

                </div>

            `;


            openModal(
                detailsModal
            );


            const endpoint =
                CONFIG.ENDPOINTS
                    .DOUBT_DETAILS
                    .replace(
                        "{doubtId}",
                        encodeURIComponent(
                            doubtId
                        )
                    );


            try {

                const response =
                    await fetch(
                        buildUrl(
                            endpoint
                        ),
                        {
                            method: "GET",
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load doubt details."
                    );

                }


                const data =
                    await response.json();


                renderDoubtDetails(
                    data
                );


            } catch (error) {

                console.error(
                    "Doubt details error:",
                    error
                );


                doubtDetailsContent.innerHTML = `

                    <div class="detail-empty">

                        Unable to load this doubt right now.

                    </div>

                `;

            }

        }



        /* =================================================
           RENDER DOUBT DETAILS
        ================================================= */

        function renderDoubtDetails(
            doubt
        ) {

            const status =
                normalizeStatus(
                    doubt.status
                );


            const subject =
                escapeHTML(
                    doubt.subjectName ??
                    doubt.subject ??
                    "Subject unavailable"
                );


            const teacher =
                escapeHTML(
                    doubt.teacherName ??
                    doubt.teacher ??
                    "Teacher unavailable"
                );


            const question =
                escapeHTML(
                    doubt.question ??
                    "Question unavailable"
                );


            const createdAt =
                formatDate(
                    doubt.createdAt ??
                    doubt.created_at
                );


            detailsTitle.textContent =
                "Doubt Details";


            detailsSubtitle.textContent =
                `${subject} • ${teacher}`;


            let conversationHTML =
                "";


            const replies =
                Array.isArray(
                    doubt.replies
                )
                    ? doubt.replies
                    : [];


            if (!replies.length) {

                conversationHTML = `

                    <div class="detail-empty">

                        No teacher response yet.

                    </div>

                `;

            } else {

                conversationHTML =
                    replies
                        .map(
                            reply => {

                                const senderType =
                                    String(
                                        reply.senderType ??
                                        reply.sender_type ??
                                        "teacher"
                                    )
                                        .toLowerCase();


                                const messageClass =
                                    senderType ===
                                    "student"
                                        ? "student"
                                        : "teacher";


                                const author =
                                    escapeHTML(
                                        reply.senderName ??
                                        reply.sender_name ??
                                        (
                                            messageClass ===
                                            "student"
                                                ? "You"
                                                : "Teacher"
                                        )
                                    );


                                const message =
                                    escapeHTML(
                                        reply.message ??
                                        ""
                                    );


                                const time =
                                    formatDate(
                                        reply.createdAt ??
                                        reply.created_at
                                    );


                                return `

                                    <div class="message ${messageClass}">

                                        <span class="message-author">
                                            ${author}
                                        </span>

                                        ${message}

                                        <span class="message-time">
                                            ${time}
                                        </span>

                                    </div>

                                `;

                            }
                        )
                        .join("");

            }


            doubtDetailsContent.innerHTML = `

                <div class="detail-header">

                    <div class="detail-header-row">

                        <div>

                            <div class="detail-subject">
                                ${subject}
                            </div>

                            <div class="detail-question">
                                ${question}
                            </div>

                        </div>


                        <span class="status-badge ${status}">

                            <i class="${getStatusIcon(status)}"></i>

                            ${escapeHTML(
                                formatStatus(
                                    doubt.status
                                )
                            )}

                        </span>

                    </div>


                    <div class="detail-meta">

                        <span>

                            <i class="fa-solid fa-user"></i>

                            ${teacher}

                        </span>


                        <span>

                            <i class="fa-regular fa-calendar"></i>

                            ${createdAt}

                        </span>

                    </div>

                </div>


                <h3 class="conversation-title">
                    Conversation
                </h3>


                <div class="conversation">

                    ${conversationHTML}

                </div>

            `;

        }



        /* =================================================
           INITIAL LOAD
        ================================================= */

        loadDoubts();

    }
);