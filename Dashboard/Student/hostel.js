/* =====================================================
   CAMPUSCONNECT
   HOSTEL
   STUDENT MODULE
===================================================== */


/* =====================================================
   APPLICATION STATE
===================================================== */

const hostelState = {

    hostel: null,

    room: null,

    leaveRequests: [],

    attendanceRecords: [],

    complaints: [],

    mess: null,

    notices: []

};


/* =====================================================
   API CONFIGURATION
===================================================== */

/*
    Java backend URL will be placed here later.

    Example:

    const API_BASE_URL =
        "http://your-server/api";

    Do NOT place MySQL credentials here.
*/

const API_BASE_URL = "";


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeHostel
);


async function initializeHostel() {

    registerEventListeners();

    renderInitialStates();

    /*
        Backend integration will be enabled when
        the Java + MySQL API is created.

        Example:

        await loadHostelData();
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

                        const section =
                            card.dataset.section;

                        showContentSection(
                            section
                        );

                    }
                );

            }
        );


    /* NEW LEAVE */

    document
        .getElementById(
            "newLeaveButton"
        )
        ?.addEventListener(
            "click",
            function () {

                openModal(
                    "leaveModal"
                );

            }
        );


    /* NEW COMPLAINT */

    document
        .getElementById(
            "newComplaintButton"
        )
        ?.addEventListener(
            "click",
            function () {

                openModal(
                    "complaintModal"
                );

            }
        );


    /* CLOSE MODALS */

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


    /* LEAVE FORM */

    document
        .getElementById(
            "leaveForm"
        )
        ?.addEventListener(
            "submit",
            handleLeaveSubmit
        );


    /* COMPLAINT FORM */

    document
        .getElementById(
            "complaintForm"
        )
        ?.addEventListener(
            "submit",
            handleComplaintSubmit
        );


    /* CLOSE WHEN CLICKING OUTSIDE MODAL */

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
        Return to the actual previous page visited.

        Do not depend on document.referrer because
        Acode/browser preview may not provide it.
    */

    if (window.history.length > 1) {

        window.history.back();

        return;
    }


    /*
        Fallback for situations where there is
        no previous browser history entry.
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
        Hostel is inside Dashboard.
    */

    window.location.href =
        "student-dashboard.html";

}


/* =====================================================
   SECTION NAVIGATION
===================================================== */

function showContentSection(
    section
) {

    const sectionMap = {

        room:
            "roomSection",

        leave:
            "leaveSection",

        attendance:
            "attendanceSection",

        complaints:
            "complaintsSection",

        mess:
            "messSection",

        notices:
            "noticesSection"

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
        behavior: "smooth",
        block: "start"
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

    renderHostelOverview();

    renderRoomDetails();

    renderLeaveRequests();

    renderAttendanceRecords();

    renderComplaints();

    renderMess();

    renderNotices();

}


/* =====================================================
   HOSTEL OVERVIEW
===================================================== */

function renderHostelOverview() {

    const hostel =
        hostelState.hostel;


    document.getElementById(
        "hostelName"
    ).textContent =
        hostel?.name ??
        "--";


    document.getElementById(
        "hostelBlock"
    ).textContent =
        hostel?.block ??
        "--";


    document.getElementById(
        "roomNumber"
    ).textContent =
        hostel?.roomNumber ??
        "--";


    document.getElementById(
        "bedNumber"
    ).textContent =
        hostel?.bedNumber ??
        "--";


    document.getElementById(
        "hostelStatus"
    ).textContent =
        hostel?.status ??
        "--";

}


/* =====================================================
   ROOM DETAILS
===================================================== */

function renderRoomDetails() {

    const container =
        document.getElementById(
            "roomDetails"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!hostelState.room) {

        renderEmptyState(
            container,
            "fa-solid fa-door-open",
            "No room information available",
            "Your room allotment details will appear here when provided by the hostel administration."
        );

        return;

    }


    const room =
        hostelState.room;


    const details = [

        [
            "Hostel",
            room.hostel
        ],

        [
            "Block",
            room.block
        ],

        [
            "Room Number",
            room.roomNumber
        ],

        [
            "Room Type",
            room.roomType
        ],

        [
            "Bed / Seat",
            room.bedNumber
        ],

        [
            "Allotment Date",
            room.allotmentDate
        ],

        [
            "Occupancy",
            room.occupancy
        ],

        [
            "Roommate(s)",
            room.roommates
        ]

    ];


    details.forEach(
        function (item) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "detail-card";


            card.innerHTML = `

                <span>
                    ${escapeHtml(
                        item[0]
                    )}
                </span>

                <strong>
                    ${
                        item[1] != null
                            ? escapeHtml(
                                String(item[1])
                            )
                            : "--"
                    }
                </strong>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   LEAVE REQUESTS
===================================================== */

function renderLeaveRequests() {

    const container =
        document.getElementById(
            "leaveRequests"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        hostelState.leaveRequests.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-calendar-days",
            "No leave requests",
            "Your submitted hostel leave or outing requests will appear here."
        );

        return;

    }


    hostelState.leaveRequests.forEach(
        function (request) {

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
                            request.type ||
                            "Request"
                        )}

                    </span>


                    <span class="item-status">

                        ${escapeHtml(
                            request.status ||
                            "--"
                        )}

                    </span>

                </div>


                <div class="list-item-meta">

                    <span>
                        From:
                        ${escapeHtml(
                            request.from ||
                            "--"
                        )}
                    </span>

                    <span>
                        To:
                        ${escapeHtml(
                            request.to ||
                            "--"
                        )}
                    </span>

                </div>


                <div class="list-item-description">

                    ${escapeHtml(
                        request.reason ||
                        ""
                    )}

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   ATTENDANCE / IN OUT
===================================================== */

function renderAttendanceRecords() {

    const container =
        document.getElementById(
            "attendanceRecords"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        hostelState.attendanceRecords.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-right-left",
            "No records available",
            "Your hostel entry and exit records will appear here."
        );

        return;

    }


    hostelState.attendanceRecords.forEach(
        function (record) {

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
                            record.date ||
                            "--"
                        )}

                    </span>


                    <span class="item-status">

                        ${escapeHtml(
                            record.status ||
                            "--"
                        )}

                    </span>

                </div>


                <div class="list-item-meta">

                    <span>
                        In:
                        ${escapeHtml(
                            record.inTime ||
                            "--"
                        )}
                    </span>

                    <span>
                        Out:
                        ${escapeHtml(
                            record.outTime ||
                            "--"
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
   COMPLAINTS
===================================================== */

function renderComplaints() {

    const container =
        document.getElementById(
            "complaintList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        hostelState.complaints.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-screwdriver-wrench",
            "No complaints",
            "Your hostel maintenance complaints will appear here."
        );

        return;

    }


    hostelState.complaints.forEach(
        function (complaint) {

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
                            complaint.category ||
                            "Complaint"
                        )}

                    </span>


                    <span class="item-status">

                        ${escapeHtml(
                            complaint.status ||
                            "--"
                        )}

                    </span>

                </div>


                <div class="list-item-meta">

                    <span>
                        ID:
                        ${escapeHtml(
                            complaint.id ||
                            "--"
                        )}
                    </span>

                    <span>
                        Date:
                        ${escapeHtml(
                            complaint.date ||
                            "--"
                        )}
                    </span>

                </div>


                <div class="list-item-description">

                    ${escapeHtml(
                        complaint.description ||
                        ""
                    )}

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   MESS
===================================================== */

function renderMess() {

    const container =
        document.getElementById(
            "messInformation"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!hostelState.mess) {

        renderEmptyState(
            container,
            "fa-solid fa-utensils",
            "Mess information unavailable",
            "Mess menu and other information will appear here when provided by the hostel administration."
        );

        return;

    }


    const mess =
        hostelState.mess;


    const cards = [

        {
            icon:
                "fa-utensils",

            title:
                "Today's Menu",

            text:
                mess.todayMenu

        },

        {
            icon:
                "fa-clock",

            title:
                "Mess Timings",

            text:
                mess.timings

        },

        {
            icon:
                "fa-calendar-days",

            title:
                "Weekly Menu",

            text:
                mess.weeklyMenu

        },

        {
            icon:
                "fa-circle-info",

            title:
                "Mess Information",

            text:
                mess.information

        }

    ];


    cards.forEach(
        function (cardData) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "mess-card";


            card.innerHTML = `

                <div class="mess-card-header">

                    <div class="mess-card-icon">

                        <i class="fa-solid ${escapeHtml(
                            cardData.icon
                        )}"></i>

                    </div>


                    <h3>

                        ${escapeHtml(
                            cardData.title
                        )}

                    </h3>

                </div>


                <p>

                    ${
                        cardData.text
                            ? escapeHtml(
                                String(cardData.text)
                            )
                            : "--"
                    }

                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   NOTICES
===================================================== */

function renderNotices() {

    const container =
        document.getElementById(
            "hostelNotices"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        hostelState.notices.length === 0
    ) {

        renderEmptyState(
            container,
            "fa-solid fa-bullhorn",
            "No hostel notices",
            "Important hostel announcements will appear here."
        );

        return;

    }


    hostelState.notices.forEach(
        function (notice) {

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
                            notice.title ||
                            "Notice"
                        )}

                    </span>


                    <span class="item-status">

                        ${escapeHtml(
                            notice.date ||
                            "--"
                        )}

                    </span>

                </div>


                <div class="list-item-description">

                    ${escapeHtml(
                        notice.description ||
                        ""
                    )}

                </div>

            `;


            container.appendChild(
                item
            );

        }
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
                ${escapeHtml(title)}
            </h3>


            <p>
                ${escapeHtml(description)}
            </p>

        </div>

    `;

}


/* =====================================================
   LEAVE FORM
===================================================== */

async function handleLeaveSubmit(
    event
) {

    event.preventDefault();


    const request = {

        type:
            document.getElementById(
                "leaveType"
            ).value,

        from:
            document.getElementById(
                "leaveFrom"
            ).value,

        to:
            document.getElementById(
                "leaveTo"
            ).value,

        reason:
            document.getElementById(
                "leaveReason"
            ).value.trim()

    };


    /*
        Frontend validation only.

        Actual submission and approval will be
        handled by the Java backend.
    */

    if (
        !request.type ||
        !request.from ||
        !request.to ||
        !request.reason
    ) {

        return;

    }


    if (!API_BASE_URL) {

        /*
            No fake request is added to the list.

            The request will be submitted here once
            the backend endpoint is available.
        */

        closeModal(
            "leaveModal"
        );

        document
            .getElementById(
                "leaveForm"
            )
            .reset();

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/hostel/leave-requests`,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            request
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to submit request."
            );

        }


        closeModal(
            "leaveModal"
        );


        document
            .getElementById(
                "leaveForm"
            )
            .reset();


        await loadLeaveRequests();

    }

    catch (error) {

        console.error(
            "Leave request error:",
            error
        );

    }

}


/* =====================================================
   COMPLAINT FORM
===================================================== */

async function handleComplaintSubmit(
    event
) {

    event.preventDefault();


    const complaint = {

        category:
            document.getElementById(
                "complaintCategory"
            ).value,

        description:
            document.getElementById(
                "complaintDescription"
            ).value.trim()

    };


    if (
        !complaint.category ||
        !complaint.description
    ) {

        return;

    }


    /*
        No fake complaint is created.

        Actual submission will happen through the
        Java backend.
    */

    if (!API_BASE_URL) {

        closeModal(
            "complaintModal"
        );


        document
            .getElementById(
                "complaintForm"
            )
            .reset();

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/hostel/complaints`,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            complaint
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to submit complaint."
            );

        }


        closeModal(
            "complaintModal"
        );


        document
            .getElementById(
                "complaintForm"
            )
            .reset();


        await loadComplaints();

    }

    catch (error) {

        console.error(
            "Complaint error:",
            error
        );

    }

}


/* =====================================================
   BACKEND DATA
===================================================== */

async function loadHostelData() {

    if (!API_BASE_URL) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/hostel`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load hostel information."
            );

        }


        const data =
            await response.json();


        hostelState.hostel =
            data.hostel ||
            null;


        hostelState.room =
            data.room ||
            null;


        hostelState.mess =
            data.mess ||
            null;


        hostelState.notices =
            Array.isArray(
                data.notices
            )
                ? data.notices
                : [];


        renderHostelOverview();

        renderRoomDetails();

        renderMess();

        renderNotices();

    }

    catch (error) {

        console.error(
            "Hostel data error:",
            error
        );

    }

}


/* =====================================================
   LEAVE DATA
===================================================== */

async function loadLeaveRequests() {

    if (!API_BASE_URL) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/hostel/leave-requests`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load leave requests."
            );

        }


        const data =
            await response.json();


        hostelState.leaveRequests =
            Array.isArray(data)
                ? data
                : [];


        renderLeaveRequests();

    }

    catch (error) {

        console.error(
            "Leave data error:",
            error
        );

    }

}


/* =====================================================
   ATTENDANCE DATA
===================================================== */

async function loadAttendanceRecords() {

    if (!API_BASE_URL) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/hostel/in-out`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load records."
            );

        }


        const data =
            await response.json();


        hostelState.attendanceRecords =
            Array.isArray(data)
                ? data
                : [];


        renderAttendanceRecords();

    }

    catch (error) {

        console.error(
            "Attendance data error:",
            error
        );

    }

}


/* =====================================================
   COMPLAINT DATA
===================================================== */

async function loadComplaints() {

    if (!API_BASE_URL) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/student/hostel/complaints`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load complaints."
            );

        }


        const data =
            await response.json();


        hostelState.complaints =
            Array.isArray(data)
                ? data
                : [];


        renderComplaints();

    }

    catch (error) {

        console.error(
            "Complaint data error:",
            error
        );

    }

}


/* =====================================================
   UTILITY
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