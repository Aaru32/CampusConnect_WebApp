/* =====================================================
   CAMPUSCONNECT NOTICE
===================================================== */


/* =====================================================
   NOTICE DATA
   -----------------------------------------------------
   TEMPORARY FRONTEND DATA

   Later:
   Java Backend → MySQL → API → this page
===================================================== */

const notices = [

    {
        id: 1,

        title: "Semester Examination Schedule Released",

        description:
            "The semester examination schedule has been released. All students are advised to check the examination timetable carefully and prepare accordingly. Students must report to the examination centre before the scheduled time.",

        category: "examination",

        categoryName: "Examination",

        priority: "important",

        date: "12 August 2026",

        time: "10:30 AM",

        issuer: "Examination Cell",

        pinned: true,

        unread: true
    },


    {
        id: 2,

        title: "Independence Day Celebration",

        description:
            "The college will organize an Independence Day celebration on campus. Students are invited to participate in the programme and make the event successful.",

        category: "events",

        categoryName: "Events",

        priority: "normal",

        date: "11 August 2026",

        time: "02:00 PM",

        issuer: "Student Activity Cell",

        pinned: true,

        unread: true
    },


    {
        id: 3,

        title: "Assignment Submission Notice",

        description:
            "All students are requested to complete and submit their pending assignments within the prescribed deadline. Students should contact their respective faculty members in case of any academic clarification.",

        category: "academic",

        categoryName: "Academic",

        priority: "important",

        date: "10 August 2026",

        time: "11:15 AM",

        issuer: "Academic Section",

        pinned: false,

        unread: true
    },


    {
        id: 4,

        title: "Library Timing Updated",

        description:
            "The college library timings have been revised. Students are requested to follow the updated schedule while accessing library services.",

        category: "general",

        categoryName: "General",

        priority: "normal",

        date: "8 August 2026",

        time: "09:00 AM",

        issuer: "Central Library",

        pinned: false,

        unread: false
    },


    {
        id: 5,

        title: "Internal Assessment Guidelines",

        description:
            "Students are advised to follow the instructions provided by their respective departments regarding internal assessment activities and submissions.",

        category: "academic",

        categoryName: "Academic",

        priority: "normal",

        date: "7 August 2026",

        time: "01:30 PM",

        issuer: "Academic Section",

        pinned: false,

        unread: false
    },


    {
        id: 6,

        title: "Technical Workshop Registration",

        description:
            "Registration is now open for the upcoming technical workshop. Interested students can register through the college student portal.",

        category: "events",

        categoryName: "Events",

        priority: "normal",

        date: "5 August 2026",

        time: "12:00 PM",

        issuer: "CSE Department",

        pinned: false,

        unread: false
    }

];


/* =====================================================
   GLOBAL NOTIFICATION SYSTEM
   -----------------------------------------------------
   Temporary localStorage system.

   Later:
   Java Backend → MySQL → API
===================================================== */

const NOTIFICATION_STORAGE_KEY =
    "campusConnectNotifications";


/*
   No fake global notifications are created here.

   Notifications can later come from:
   - Notices
   - Events
   - Assignments
   - Exams
   - Library
   - Attendance
   - Fees
   - LMS
   - Other modules

   Backend will eventually provide these.
*/

const notificationData = [];


/* =====================================================
   CURRENT FILTER
===================================================== */

let currentCategory = "all";


/* =====================================================
   DOM ELEMENTS
===================================================== */

const noticeList =
    document.getElementById("noticeList");

const noResults =
    document.getElementById("noResults");

const searchInput =
    document.getElementById("searchInput");

const clearSearchButton =
    document.getElementById("clearSearch");


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeNotificationStorage();

        displayNotices();

        updateNotificationUI();

    }
);


/* =====================================================
   NOTICE DISPLAY
===================================================== */

function displayNotices() {

    if (!noticeList) {
        return;
    }


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    let filteredNotices =
        notices.filter(function (notice) {

            const matchesCategory =
                currentCategory === "all" ||
                notice.category === currentCategory;


            const matchesSearch =
                notice.title
                    .toLowerCase()
                    .includes(searchText)

                ||

                notice.description
                    .toLowerCase()
                    .includes(searchText)

                ||

                notice.categoryName
                    .toLowerCase()
                    .includes(searchText);


            return (
                matchesCategory &&
                matchesSearch
            );

        });


    /* ================= PINNED FIRST ================= */

    filteredNotices.sort(
        function (a, b) {

            if (a.pinned && !b.pinned) {

                return -1;

            }


            if (!a.pinned && b.pinned) {

                return 1;

            }


            return b.id - a.id;

        }
    );


    noticeList.innerHTML = "";


    if (noResults) {

        if (filteredNotices.length === 0) {

            noResults.classList.remove("hidden");

        }

        else {

            noResults.classList.add("hidden");

        }

    }


    filteredNotices.forEach(
        function (notice) {

            noticeList.appendChild(
                createNoticeCard(notice)
            );

        }
    );


    updateResultText(
        filteredNotices.length
    );

}


/* =====================================================
   CREATE NOTICE CARD
===================================================== */

function createNoticeCard(notice) {

    const card =
        document.createElement("article");


    card.className =
        "notice-card";


    if (notice.unread) {

        card.classList.add("unread");

    }


    card.onclick =
        function () {

            openNotice(notice.id);

        };


    let icon =
        "fa-circle-info";


    if (notice.category === "academic") {

        icon = "fa-book";

    }

    else if (
        notice.category === "examination"
    ) {

        icon = "fa-file-lines";

    }

    else if (
        notice.category === "events"
    ) {

        icon = "fa-calendar-days";

    }


    const priorityClass =
        notice.priority === "important"
            ? "priority-important"
            : "priority-normal";


    const priorityText =
        notice.priority === "important"
            ? "Important"
            : "Normal";


    card.innerHTML = `

        ${
            notice.unread
                ?
                `
                <span class="unread-dot"></span>
                `
                :
                ""
        }


        <div
            class="notice-card-icon ${notice.category}">

            <i class="fa-solid ${icon}"></i>

        </div>


        <div class="notice-card-content">

            <h3>
                ${notice.title}
            </h3>


            <p>
                ${notice.description}
            </p>


            <div class="notice-meta">

                <span class="category-badge">

                    ${notice.categoryName}

                </span>


                <span
                    class="priority-badge ${priorityClass}">

                    ${priorityText}

                </span>


                <span>

                    <i class="fa-regular fa-calendar"></i>

                    ${notice.date}

                </span>


                <span>

                    <i class="fa-regular fa-clock"></i>

                    ${notice.time}

                </span>

            </div>

        </div>


        <div class="notice-card-arrow">

            <i class="fa-solid fa-chevron-right"></i>

        </div>


        ${
            notice.pinned
                ?
                `
                <span class="pin-label">

                    <i class="fa-solid fa-thumbtack"></i>

                    Pinned

                </span>
                `
                :
                ""
        }

    `;


    return card;

}


/* =====================================================
   OPEN NOTICE
===================================================== */

function openNotice(id) {

    const notice =
        notices.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!notice) {

        return;

    }


    /* ================= MARK NOTICE AS READ ================= */

    notice.unread = false;


    /* ================= DETAILS ================= */

    const detailsTitle =
        document.getElementById("detailsTitle");

    const detailsCategory =
        document.getElementById("detailsCategory");

    const detailsDate =
        document.getElementById("detailsDate");

    const detailsTime =
        document.getElementById("detailsTime");

    const detailsDescription =
        document.getElementById("detailsDescription");

    const detailsIssuer =
        document.getElementById("detailsIssuer");

    const priority =
        document.getElementById("detailsPriority");

    const readStatus =
        document.getElementById("readStatus");


    if (detailsTitle) {

        detailsTitle.textContent =
            notice.title;

    }


    if (detailsCategory) {

        detailsCategory.textContent =
            notice.categoryName;

    }


    if (detailsDate) {

        detailsDate.textContent =
            notice.date;

    }


    if (detailsTime) {

        detailsTime.textContent =
            notice.time;

    }


    if (detailsDescription) {

        detailsDescription.textContent =
            notice.description;

    }


    if (detailsIssuer) {

        detailsIssuer.textContent =
            notice.issuer;

    }


    if (priority) {

        priority.textContent =
            notice.priority === "important"
                ? "Important"
                : "Normal";


        priority.className =
            "priority-badge " +

            (
                notice.priority === "important"
                    ? "priority-important"
                    : "priority-normal"
            );

    }


    if (readStatus) {

        readStatus.innerHTML =
            `
            <i class="fa-solid fa-check"></i>
            Read
            `;

    }


    /* =================================================
       HIDE NOTICE LIST
    ================================================= */

    const intro =
        document.querySelector(".notice-intro");

    const searchSection =
        document.querySelector(".search-section");

    const filterSection =
        document.querySelector(".filter-section");

    const noticeSection =
        document.getElementById("noticeSection");

    const noticeDetails =
        document.getElementById("noticeDetails");


    if (intro) {

        intro.classList.add("hidden");

    }


    if (searchSection) {

        searchSection.classList.add("hidden");

    }


    if (filterSection) {

        filterSection.classList.add("hidden");

    }


    if (noticeSection) {

        noticeSection.classList.add("hidden");

    }


    /* ================= SHOW DETAILS ================= */

    if (noticeDetails) {

        noticeDetails.classList.remove("hidden");

    }


    /*
       Update global notification count
       after reading a notice.
    */

    updateNotificationUI();

}


/* =====================================================
   CLOSE NOTICE
===================================================== */

function closeNotice() {

    const noticeDetails =
        document.getElementById("noticeDetails");


    const intro =
        document.querySelector(".notice-intro");


    const searchSection =
        document.querySelector(".search-section");


    const filterSection =
        document.querySelector(".filter-section");


    const noticeSection =
        document.getElementById("noticeSection");


    if (noticeDetails) {

        noticeDetails.classList.add("hidden");

    }


    if (intro) {

        intro.classList.remove("hidden");

    }


    if (searchSection) {

        searchSection.classList.remove("hidden");

    }


    if (filterSection) {

        filterSection.classList.remove("hidden");

    }


    if (noticeSection) {

        noticeSection.classList.remove("hidden");

    }


    displayNotices();

}


/* =====================================================
   SEARCH
===================================================== */

function searchNotices() {

    if (!searchInput) {

        return;

    }


    if (
        searchInput.value.trim() !== ""
    ) {

        if (clearSearchButton) {

            clearSearchButton.style.display =
                "block";

        }

    }

    else {

        if (clearSearchButton) {

            clearSearchButton.style.display =
                "none";

        }

    }


    displayNotices();

}


/* =====================================================
   CLEAR SEARCH
===================================================== */

function clearSearch() {

    if (!searchInput) {

        return;

    }


    searchInput.value = "";


    if (clearSearchButton) {

        clearSearchButton.style.display =
            "none";

    }


    displayNotices();

}


/* =====================================================
   CATEGORY FILTER
===================================================== */

function filterNotices(
    category,
    button
) {

    currentCategory =
        category;


    document
        .querySelectorAll(".filter-btn")
        .forEach(
            function (btn) {

                btn.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    displayNotices();

}


/* =====================================================
   RESULT TEXT
===================================================== */

function updateResultText(count) {

    const resultText =
        document.getElementById(
            "resultText"
        );


    if (!resultText) {

        return;

    }


    const searchValue =
        searchInput
            ? searchInput.value.trim()
            : "";


    if (searchValue !== "") {

        resultText.textContent =
            `Found ${count} matching notice${count !== 1 ? "s" : ""}`;

        return;

    }


    if (
        currentCategory !== "all"
    ) {

        resultText.textContent =
            `Showing ${count} ${currentCategory} notice${count !== 1 ? "s" : ""}`;

        return;

    }


    resultText.textContent =
        `Showing ${count} notices`;

}


/* =====================================================
   GLOBAL NOTIFICATION STORAGE
===================================================== */

function initializeNotificationStorage() {

    const existing =
        localStorage.getItem(
            NOTIFICATION_STORAGE_KEY
        );


    /*
       Create empty notification storage
       only if it does not already exist.
    */

    if (!existing) {

        localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            JSON.stringify([])
        );

    }

}


/* =====================================================
   GET NOTIFICATIONS
===================================================== */

function getNotifications() {

    const stored =
        localStorage.getItem(
            NOTIFICATION_STORAGE_KEY
        );


    if (!stored) {

        return [];

    }


    try {

        const data =
            JSON.parse(stored);


        if (!Array.isArray(data)) {

            return [];

        }


        return data;

    }

    catch (error) {

        return [];

    }

}


/* =====================================================
   SAVE NOTIFICATIONS
===================================================== */

function saveNotifications(data) {

    localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =====================================================
   UPDATE GLOBAL NOTIFICATION UI
===================================================== */

function updateNotificationUI() {

    const data =
        getNotifications();


    const unread =
        data.filter(
            function (item) {

                return item.unread === true;

            }
        ).length;


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    const countText =
        document.getElementById(
            "notificationCountText"
        );


    if (badge) {

        if (unread > 0) {

            badge.textContent =
                unread > 99
                    ? "99+"
                    : unread;


            badge.classList.remove(
                "hidden"
            );

        }

        else {

            badge.textContent = "0";


            badge.classList.add(
                "hidden"
            );

        }

    }


    if (countText) {

        if (unread > 0) {

            countText.textContent =
                `${unread} unread notification${unread !== 1 ? "s" : ""}`;

        }

        else {

            countText.textContent =
                "No unread notifications";

        }

    }


    renderNotifications(data);

}


/* =====================================================
   RENDER GLOBAL NOTIFICATIONS
===================================================== */

function renderNotifications(data) {

    const list =
        document.getElementById(
            "notificationList"
        );


    const empty =
        document.getElementById(
            "emptyNotifications"
        );


    if (!list || !empty) {

        return;

    }


    list.innerHTML = "";


    /* ================= NO NOTIFICATIONS ================= */

    if (data.length === 0) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    /* =================================================
       NEWEST NOTIFICATIONS FIRST
    ================================================= */

    const sortedData =
        [...data].sort(
            function (a, b) {

                return (
                    (b.id || 0) -
                    (a.id || 0)
                );

            }
        );


    sortedData.forEach(
        function (notification) {

            const item =
                document.createElement("div");


            item.className =
                "notification-item";


            if (notification.unread) {

                item.classList.add(
                    "unread"
                );

            }


            let icon =
                "fa-circle-info";


            if (
                notification.type ===
                "examination"
            ) {

                icon =
                    "fa-file-lines";

            }

            else if (
                notification.type ===
                "events"
            ) {

                icon =
                    "fa-calendar-days";

            }

            else if (
                notification.type ===
                "academic"
            ) {

                icon =
                    "fa-book";

            }

            else if (
                notification.type ===
                "library"
            ) {

                icon =
                    "fa-book-open";

            }

            else if (
                notification.type ===
                "assignment"
            ) {

                icon =
                    "fa-file-lines";

            }

            else if (
                notification.type ===
                "attendance"
            ) {

                icon =
                    "fa-calendar-check";

            }

            else if (
                notification.type ===
                "fee"
            ) {

                icon =
                    "fa-receipt";

            }


            item.innerHTML = `

                <div class="notification-item-icon">

                    <i class="fa-solid ${icon}"></i>

                </div>


                <div class="notification-item-content">

                    <h4>
                        ${notification.title || "Notification"}
                    </h4>


                    <p>
                        ${notification.message || ""}
                    </p>


                    <span class="notification-time">

                        ${notification.time || ""}

                    </span>

                </div>

            `;


            item.onclick =
                function () {

                    markNotificationRead(
                        notification.id
                    );

                };


            list.appendChild(item);

        }
    );

}


/* =====================================================
   TOGGLE NOTIFICATION PANEL
===================================================== */

function toggleNotifications() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if (!panel) {

        return;

    }


    panel.classList.toggle(
        "show"
    );


    updateNotificationUI();

}


/* =====================================================
   MARK SINGLE NOTIFICATION READ
===================================================== */

function markNotificationRead(id) {

    const data =
        getNotifications();


    const notification =
        data.find(
            function (item) {

                return item.id === id;

            }
        );


    if (notification) {

        notification.unread =
            false;

    }


    saveNotifications(data);


    updateNotificationUI();

}


/* =====================================================
   MARK ALL NOTIFICATIONS READ
===================================================== */

function markAllNotificationsRead() {

    const data =
        getNotifications();


    data.forEach(
        function (notification) {

            notification.unread =
                false;

        }
    );


    saveNotifications(data);


    updateNotificationUI();

}


/* =====================================================
   MARK ALL NOTICE ITEMS AS READ
   -----------------------------------------------------
   This is used by your Notice page button:
   "Mark all as read"
===================================================== */

function markAllRead() {

    notices.forEach(
        function (notice) {

            notice.unread =
                false;

        }
    );


    displayNotices();


    updateNotificationUI();

}


/* =====================================================
   CLOSE NOTIFICATION PANEL
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const wrapper =
            document.querySelector(
                ".notification-wrapper"
            );


        const panel =
            document.getElementById(
                "notificationPanel"
            );


        if (
            wrapper &&
            panel &&
            !wrapper.contains(
                event.target
            )
        ) {

            panel.classList.remove(
                "show"
            );

        }

    }
);


/* =====================================================
   GLOBAL BACK BUTTON
   -----------------------------------------------------
   Returns to the actual previous webpage.

   Example:

   Modules
       ↓
   Notice Board
       ↓
   Notice Details
       ↓
   Back
       ↓
   Notice Board

   It does NOT force the user to Dashboard.
===================================================== */

function goBack() {

    if (window.history.length > 1) {

        window.history.back();

    }

    else {

        window.location.href =
            "student-dashboard.html";

    }

}


/* =====================================================
   HEADER BACK ARROW
===================================================== */

const noticePageBackButton =
    document.getElementById("noticePageBackButton");

if (noticePageBackButton) {

    noticePageBackButton.addEventListener(
        "click",
        function () {

            goBack();

        }
    );

}


/* =====================================================
   BROWSER BACK / FORWARD SUPPORT
===================================================== */

window.addEventListener(
    "pageshow",
    function () {

        updateNotificationUI();

    }
);