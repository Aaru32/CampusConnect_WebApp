/* =====================================================
   CAMPUSCONNECT - STUDENT DASHBOARD
===================================================== */


/* =====================================================
   STUDENT DATA
   -----------------------------------------------
   Student profile data can later come from
   the Java backend / MySQL.

   Assignment statistics are NOT stored here.
===================================================== */

const savedStudentData =
    localStorage.getItem("studentData");


const studentData = savedStudentData
    ? JSON.parse(savedStudentData)
    : {

        name: "Student",

        fullName: "Student Name",

        registrationNumber: "--------",

        department:
            "Computer Science & Engineering",

        semester:
            "5th Semester",

        academicYear:
            "2026-27"

    };



/* =====================================================
   LOAD STUDENT DATA
===================================================== */

function loadStudentData() {


    const headerName =
        document.getElementById(
            "headerStudentName"
        );


    const fullName =
        document.getElementById(
            "studentFullName"
        );


    const registrationNumber =
        document.getElementById(
            "registrationNumber"
        );


    const department =
        document.getElementById(
            "department"
        );


    const semester =
        document.getElementById(
            "semester"
        );


    const academicYear =
        document.getElementById(
            "academicYear"
        );



    if (headerName) {

        headerName.textContent =
            studentData.name ||
            studentData.fullName ||
            "Student";

    }



    if (fullName) {

        fullName.textContent =
            studentData.fullName ||
            "Student Name";

    }



    if (registrationNumber) {

        registrationNumber.textContent =
            "Registration No: " +
            (
                studentData.registrationNumber ||
                "--------"
            );

    }



    if (department) {

        department.textContent =
            studentData.department ||
            "Computer Science & Engineering";

    }



    if (semester) {

        semester.textContent =
            studentData.semester ||
            "5th Semester";

    }



    if (academicYear) {

        academicYear.textContent =
            studentData.academicYear ||
            "2026-27";

    }

}



/* =====================================================
   ASSIGNMENT STATISTICS
   -----------------------------------------------------
   Assignment counts are kept separate from
   student profile data.

   The values will eventually come from:

   Java Backend
        ↓
   MySQL Database
        ↓
   Assignment API
        ↓
   This function

   Expected backend response:

   {
       "total": 12,
       "pending": 4
   }
===================================================== */

async function loadAssignmentStatistics() {


    const totalAssignments =
        document.getElementById(
            "totalAssignments"
        );


    const pendingAssignments =
        document.getElementById(
            "pendingAssignments"
        );



    if (
        !totalAssignments ||
        !pendingAssignments
    ) {

        return;

    }



    /*
       Loading state.

       We deliberately do NOT use a fake
       number such as 50 or 08.
    */

    totalAssignments.textContent =
        "—";


    pendingAssignments.textContent =
        "—";



    try {


        /*
           Future Java backend endpoint.

           The backend will identify the
           currently logged-in student and
           return the actual assignment counts.
        */

        const headers = { "Content-Type": "application/json" };
        const sessionUser = sessionStorage.getItem("campusConnectUser");
        if (sessionUser) {
            try {
                const parsed = JSON.parse(sessionUser);
                if (parsed.email) headers["X-User-Email"] = parsed.email;
                if (parsed.role) headers["X-User-Role"] = parsed.role;
                if (parsed.uid) headers["X-User-Uid"] = parsed.uid;
            } catch (e) {}
        }
        if (window.CampusConnectFirebase && window.CampusConnectFirebase.auth?.currentUser) {
            try {
                const token = await window.CampusConnectFirebase.auth.currentUser.getIdToken();
                if (token) headers["Authorization"] = `Bearer ${token}`;
            } catch (e) {}
        }

        const response =
            await fetch(
                "/api/student/assignments/statistics",
                { headers }
            );

        if (!response.ok) {
            throw new Error(
                `Failed to load assignment statistics (HTTP ${response.status})`
            );
        }



        const data =
            await response.json();



        /*
           TOTAL
        */

        const total =
            Number(data.total);



        if (
            Number.isFinite(total) &&
            total >= 0
        ) {

            totalAssignments.textContent =
                total;

        } else {

            totalAssignments.textContent =
                "0";

        }



        /*
           PENDING
        */

        const pending =
            Number(data.pending);



        if (
            Number.isFinite(pending) &&
            pending >= 0
        ) {

            pendingAssignments.textContent =
                pending;

        } else {

            pendingAssignments.textContent =
                "0";

        }


    } catch (error) {


        console.error(
            "Unable to load assignment statistics:",
            error
        );


        /*
           Backend is not available yet.

           Do not show fabricated values.
        */

        totalAssignments.textContent =
            "—";


        pendingAssignments.textContent =
            "—";

    }

}



/* =====================================================
   INITIAL LOAD
===================================================== */

loadStudentData();

loadAssignmentStatistics();



/* =====================================================
   MODULES
===================================================== */

const modules = [


    {
        name: "Library",
        icon: "fa-solid fa-book-open",
        page: "library.html"
    },


    {
        name: "Certificate",
        icon: "fa-solid fa-certificate",
        page: "certificate.html"
    },


    {
        name: "Feedback",
        icon: "fa-solid fa-comment-dots",
        page: "feedback.html"
    },


    {
        name: "Events",
        icon: "fa-solid fa-calendar-days",
        page: "events.html"
    },


    {
        name: "Fees",
        icon: "fa-solid fa-receipt",
        page: "fees.html"
    },


    {
        name: "Hostel",
        icon: "fa-solid fa-building",
        page: "hostel.html"
    },


    {
        name: "Leaderboard",
        icon: "fa-solid fa-ranking-star",
        page: "leaderboard.html"
    },


    {
        name: "LMS",
        icon: "fa-solid fa-laptop",
        page: "lms.html"
    },


    {
        name: "My ID",
        icon: "fa-solid fa-id-card",
        page: "my-id.html"
    },


    {
        name: "Notice Board",
        icon: "fa-solid fa-bullhorn",
        page: "notice.html"
    },


    {
        name: "Mentoring",
        icon: "fa-solid fa-user-group",
        page: "mentoring.html"
    },


    {
        name: "Online Exams",
        icon: "fa-solid fa-file-pen",
        page: "online-exams.html"
    },


    {
        name: "Peer Learning",
        icon: "fa-solid fa-people-group",
        page: "peer-learning.html"
    },


    {
        name: "Result Analysis",
        icon: "fa-solid fa-chart-column",
        page: "result-analysis.html"
    },


    {
        name: "Training & Placement",
        icon: "fa-solid fa-briefcase",
        page: "training-placement.html"
    },


    {
        name: "Assignments",
        icon: "fa-solid fa-file-lines",
        page: "assignment.html"
    },


    {
        name: "Attendance",
        icon: "fa-solid fa-calendar-check",
        page: "attendance.html"
    },


    {
        name: "Academic Planning",
        icon: "fa-solid fa-clipboard-list",
        page: "academic-planning.html"
    },
    {
        name: "My Tasks",
        icon: "fa-solid fa-list-check",
        page: "my-tasks.html"
    },
    {
        name: "My Doubts",
        icon: "fa-solid fa-circle-question",
        page: "my-doubts.html"
    },
    {
    name: "SafeSpeak",
    icon: "fa-solid fa-lock",
    page: "../SafeSpeak/safespeak.html"
},


    {
        name: "Settings",
        icon: "fa-solid fa-gear",
        page: "settings.html"
    }

];



/* =====================================================
   RECENT MODULE STORAGE
===================================================== */

const RECENT_MODULES_KEY =
    "campusConnectRecentModules";



/* =====================================================
   GET RECENT MODULES
===================================================== */

function getRecentModules() {


    let recentModules = [];


    try {


        const savedRecentModules =
            localStorage.getItem(
                RECENT_MODULES_KEY
            );


        if (savedRecentModules) {

            recentModules =
                JSON.parse(
                    savedRecentModules
                );

        }


    } catch (error) {


        console.error(
            "Unable to load recent modules:",
            error
        );


        recentModules = [];

    }



    if (!Array.isArray(recentModules)) {

        recentModules = [];

    }


    return recentModules;

}



/* =====================================================
   SAVE RECENT MODULE
===================================================== */

function saveRecentModule(module) {


    let recentModules =
        getRecentModules();



    /*
       Remove the module if it already
       exists in recent history.
    */

    recentModules =
        recentModules.filter(
            item =>
                item.page !== module.page
        );



    /*
       Put the newly opened module
       at the beginning.
    */

    recentModules.unshift({

        name: module.name,

        icon: module.icon,

        page: module.page

    });



    /*
       Keep only the latest four.
    */

    recentModules =
        recentModules.slice(0, 4);



    localStorage.setItem(

        RECENT_MODULES_KEY,

        JSON.stringify(
            recentModules
        )

    );

}



function getDashboardModules() {
    
    const recentModules =
        getRecentModules();
    
    /*
       Find the actual module objects
       from the main modules array.
    */
    
    const recentFromFullList =
        recentModules
        .map(recent => {
            
            return modules.find(
                module =>
                module.page === recent.page
            );
            
        })
        .filter(Boolean);
    
    /*
       Find modules that have not
       appeared in recent history.
    */
    
    const usedPages =
        recentFromFullList.map(
            module =>
            module.page
        );
    
    const remainingModules =
        modules.filter(
            module =>
            !usedPages.includes(
                module.page
            )
        );
    
    /*
       Recent modules come first,
       followed by all remaining modules.

       IMPORTANT:
       Do NOT use .slice() here.
       The arrow navigation needs access
       to the complete module list.
    */
    
    return [
        ...recentFromFullList,
        ...remainingModules
    ];
    
}


/* =====================================================
   DISPLAY MODULES
===================================================== */

const moduleContainer =
    document.getElementById(
        "moduleContainer"
    );



function displayModules() {


    if (!moduleContainer) return;


    moduleContainer.innerHTML = "";


    const dashboardModules =
        getDashboardModules();



    dashboardModules.forEach(
        module => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "module-card";



            card.innerHTML = `

                <div class="module-icon">

                    <i class="${module.icon}"></i>

                </div>


                <span>
                    ${module.name}
                </span>

            `;



            /* ==============================
               OPEN MODULE
            ============================== */

            card.addEventListener(
                "click",
                function () {


                    /*
                       Save module before
                       opening its page.
                    */

                    saveRecentModule(
                        module
                    );


                    window.location.href =
                        module.page;

                }
            );



            /* ==============================
               ACCESSIBILITY
            ============================== */

            card.setAttribute(
                "role",
                "button"
            );


            card.setAttribute(
                "tabindex",
                "0"
            );



            card.addEventListener(
                "keydown",
                function (event) {


                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {


                        event.preventDefault();


                        saveRecentModule(
                            module
                        );


                        window.location.href =
                            module.page;

                    }

                }
            );



            moduleContainer.appendChild(
                card
            );

        }
    );

}
displayModules();


/* =====================================================
   MODULE ARROW NAVIGATION
===================================================== */

const modulePrev =
    document.getElementById(
        "modulePrev"
    );


const moduleNext =
    document.getElementById(
        "moduleNext"
    );



/*
   One module width:

   105px card
   +
   12px gap

   = 117px
*/

const MODULE_SCROLL_AMOUNT =
    117;



/* =====================================================
   PREVIOUS MODULE
===================================================== */

if (modulePrev) {


    modulePrev.addEventListener(
        "click",
        function () {


            moduleContainer.scrollBy({

                left:
                    -MODULE_SCROLL_AMOUNT,

                behavior:
                    "smooth"

            });

        }
    );

}



/* =====================================================
   NEXT MODULE
===================================================== */

if (moduleNext) {


    moduleNext.addEventListener(
        "click",
        function () {


            moduleContainer.scrollBy({

                left:
                    MODULE_SCROLL_AMOUNT,

                behavior:
                    "smooth"

            });

        }
    );

}



/* =====================================================
   EVENTS DATA
===================================================== */

const events = [


    {
        title: "Dandiya Celebration",

        icon: "fa-solid fa-music",

        description:
            "Join the campus celebration and enjoy the festive evening."
    },


    {
        title: "Saraswati Puja",

        icon: "fa-solid fa-hands-praying",

        description:
            "Celebrate the festival of knowledge and learning."
    },


    {
        title: "Women's Day Celebration",

        icon: "fa-solid fa-person-dress",

        description:
            "A special celebration honoring women and their achievements."
    },


    {
        title: "Children's Day Celebration",

        icon: "fa-solid fa-children",

        description:
            "A joyful campus celebration filled with activities and events."
    },


    {
        title: "Annual College Event",

        icon: "fa-solid fa-star",

        description:
            "Participate in the upcoming annual college celebration."
    }

];



/* =====================================================
   OPEN EVENTS PAGE
===================================================== */

function openEventsPage() {

    window.location.href =
        "events.html";

}



/* =====================================================
   DISPLAY EVENTS
===================================================== */

const eventContainer =
    document.getElementById(
        "eventContainer"
    );



function displayEvents() {


    if (!eventContainer) return;


    eventContainer.innerHTML = "";



    events.forEach(
        event => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "event-card";



            card.innerHTML = `

                <div class="event-icon">

                    <i class="${event.icon}"></i>

                </div>


                <div class="event-content">

                    <h3>
                        ${event.title}
                    </h3>


                    <p>
                        ${event.description}
                    </p>


                    <button
                        class="event-button"
                        type="button">

                        View Event

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                </div>

            `;



            card.addEventListener(
                "click",
                function () {

                    openEventsPage();

                }
            );



            const eventButton =
                card.querySelector(
                    ".event-button"
                );



            if (eventButton) {


                eventButton.addEventListener(
                    "click",
                    function (e) {


                        e.stopPropagation();


                        openEventsPage();

                    }
                );

            }



            card.style.cursor =
                "pointer";



            eventContainer.appendChild(
                card
            );

        }
    );

}



displayEvents();



/* =====================================================
   BOTTOM NAVIGATION
===================================================== */


/* ================= HOME ================= */

const homeButton =
    document.getElementById(
        "homeButton"
    );


if (homeButton) {


    homeButton.addEventListener(
        "click",
        function () {


            window.location.href =
                "student-dashboard.html";

        }
    );

}



/* ================= MODULES ================= */

const modulesButton =
    document.getElementById(
        "modulesButton"
    );


if (modulesButton) {


    modulesButton.addEventListener(
        "click",
        function () {


            window.location.href =
                "modules.html";

        }
    );

}


/* ================= CHAT ================= */

const CHAT_PAGE = "../Chat/chat.html";

/* Bottom navigation Chat button */
const chatButton =
    document.getElementById("chatButton");

if (chatButton) {
    chatButton.addEventListener("click", function() {
        window.location.href = CHAT_PAGE;
    });
}

/* Top header Chat button */
const headerChatButton =
    document.getElementById("headerChatButton");

if (headerChatButton) {
    headerChatButton.addEventListener("click", function() {
        window.location.href = CHAT_PAGE;
    });
}


/* ================= PROFILE ================= */

const profileButton =
    document.getElementById(
        "profileButton"
    );


if (profileButton) {


    profileButton.addEventListener(
        "click",
        function () {


            window.location.href =
                "profile.html";

        }
    );

}



/* =====================================================
   VIEW ALL MODULES
===================================================== */

const viewModules =
    document.getElementById(
        "viewModules"
    );


if (viewModules) {


    viewModules.addEventListener(
        "click",
        function () {


            window.location.href =
                "modules.html";

        }
    );

}



/* =====================================================
   VIEW ALL EVENTS
===================================================== */

const viewEvents =
    document.getElementById(
        "viewEvents"
    );


if (viewEvents) {


    viewEvents.addEventListener(
        "click",
        function () {


            openEventsPage();

        }
    );

}



/* =====================================================
   QUICK ACCESS - EVENTS
===================================================== */

const eventsQuick =
    document.getElementById(
        "eventsQuick"
    );


if (eventsQuick) {


    eventsQuick.addEventListener(
        "click",
        function () {


            openEventsPage();

        }
    );

}



/* =====================================================
   LEADERBOARD
===================================================== */

const leaderboardCard =
    document.getElementById(
        "leaderboardCard"
    );



function openLeaderboardPage() {

    window.location.href =
        "leaderboard.html";

}



if (leaderboardCard) {


    leaderboardCard.addEventListener(
        "click",
        function () {


            openLeaderboardPage();

        }
    );


    leaderboardCard.style.cursor =
        "pointer";

}



/* =====================================================
   QUICK ACCESS
===================================================== */


/* ================= ATTENDANCE ================= */

const attendanceQuick =
    document.getElementById(
        "attendanceQuick"
    );


if (attendanceQuick) {


    attendanceQuick.addEventListener(
        "click",
        function () {


            window.location.href =
                "attendance.html";

        }
    );

}



/* ================= RESULT ANALYSIS ================= */

const resultQuick =
    document.getElementById(
        "resultQuick"
    );


if (resultQuick) {


    resultQuick.addEventListener(
        "click",
        function () {


            window.location.href =
                "result-analysis.html";

        }
    );

}



/* ================= NOTICE BOARD ================= */

const noticeQuick =
    document.getElementById(
        "noticeQuick"
    );


if (noticeQuick) {


    noticeQuick.addEventListener(
        "click",
        function () {


            window.location.href =
                "notice.html";

        }
    );

}



/* =====================================================
   LEARNING BUTTON
===================================================== */

const learningButton =
    document.getElementById(
        "learningButton"
    );


if (learningButton) {


    learningButton.addEventListener(
        "click",
        function () {


            window.location.href =
                "lms.html";

        }
    );

}



/* =====================================================
   LMS BUTTONS
===================================================== */

const certifiedButton =
    document.getElementById(
        "certifiedButton"
    );


if (certifiedButton) {


    certifiedButton.addEventListener(
        "click",
        function () {


            window.location.href =
                "lms.html";

        }
    );

}



const coursesCard =
    document.getElementById(
        "coursesCard"
    );


if (coursesCard) {


    coursesCard.addEventListener(
        "click",
        function () {


            window.location.href =
                "lms.html";

        }
    );


    coursesCard.style.cursor =
        "pointer";

}



/* =====================================================
   CERTIFICATE HUB
===================================================== */

const certificateHub =
    document.getElementById(
        "certificateHub"
    );


if (certificateHub) {


    certificateHub.addEventListener(
        "click",
        function () {


            window.location.href =
                "certificate.html";

        }
    );


    certificateHub.style.cursor =
        "pointer";

}



/* =====================================================
   ASSIGNMENTS
===================================================== */

const viewAssignments =
    document.getElementById(
        "viewAssignments"
    );


if (viewAssignments) {


    viewAssignments.addEventListener(
        "click",
        function () {


            window.location.href =
                "assignment.html";

        }
    );

}



/* =====================================================
   NOTIFICATION
===================================================== */

const notificationButton =
    document.getElementById(
        "notificationButton"
    );


if (notificationButton) {


    notificationButton.addEventListener(
        "click",
        function () {


            alert(
                "You have no new notifications."
            );

        }
    );

}