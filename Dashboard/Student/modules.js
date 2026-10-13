/* =====================================================
   CAMPUSCONNECT - ALL MODULES
===================================================== */


/* =====================================================
   MODULE DATA
===================================================== */

const modules = [

    {
    name: "Library",
    icon: "fa-solid fa-book-open",
    description: "Books and library services",
    page: "library.html"
},
    {
        name: "Certificate",
        icon: "fa-solid fa-certificate",
        description: "Certificates and achievements",
        page: "certificate.html"
    },

    {
        name: "Feedback",
        icon: "fa-solid fa-comment-dots",
        description: "Share your feedback",
        page: "feedback.html"
    },

    {
        name: "Events",
        icon: "fa-solid fa-calendar-days",
        description: "College events and activities",
        page: "events.html"
    },

    {
        name: "Fees",
        icon: "fa-solid fa-receipt",
        description: "Fee details and payments",
        page: "fees.html"
    },

    {
        name: "Hostel",
        icon: "fa-solid fa-building",
        description: "Hostel information",
        page: "hostel.html"
    },

    {
        name: "Leaderboard",
        icon: "fa-solid fa-ranking-star",
        description: "Academic points and ranking",
        page: "leaderboard.html"
    },

    {
        name: "LMS",
        icon: "fa-solid fa-laptop",
        description: "Learning management system",
        page: "lms.html"
    },

    {
        name: "My ID",
        icon: "fa-solid fa-id-card",
        description: "Digital student identity",
        page: "my-id.html"
    },

    {
        name: "Notice Board",
        icon: "fa-solid fa-bullhorn",
        description: "Important college notices",
        page: "notice.html"
    },

    {
        name: "Mentoring",
        icon: "fa-solid fa-user-group",
        description: "Mentoring and guidance",
        page: "mentoring.html"
    },

    {
        name: "Online Exams",
        icon: "fa-solid fa-file-pen",
        description: "Online examination services", 
        page: "online-exams.html"
    },

    {
        name: "Peer Learning",
        icon: "fa-solid fa-people-group",
        description: "Learn with your peers",
        page: "peer-learning.html"
    },

    {
        name: "Result Analysis",
        icon: "fa-solid fa-chart-column",
        description: "Academic result analysis",
        page: "result-analysis.html"
    },

    {
        name: "Training & Placement",
        icon: "fa-solid fa-briefcase",
        description: "Career and placement services",
        page: "training-placement.html"
    },

    {
        name: "Assignments",
        icon: "fa-solid fa-file-lines",
        description: "Assignments and submissions",
        page: "assignment.html"
    },

    {
        name: "Attendance",
        icon: "fa-solid fa-calendar-check",
        description: "Attendance information",
        page: "attendance.html"
    },
    {
        name: "Academic Planning",
        icon: "fa-solid fa-clipboard-list",
        description: "Plan Your Academics",
        page: "academic-planning.html"
},
{
    name: "My Tasks",
    icon: "fa-solid fa-list-check",
    description: "Create and track your daily and weekly tasks",
    page: "my-tasks.html"
},
    {
    name: "My Doubts",
    icon: "fa-solid fa-circle-question",
    description: "Ask questions, connect with teachers, and track your doubts",
    page: "my-doubts.html"
},
   {  
    name: "SafeSpeak",
    icon: "fa-solid fa-lock",
    description: "Confidentially report concerns and seek support in a safe environment.",
    page: "../SafeSpeak/safespeak.html"
},
    { 
        name: "Settings",
        icon: "fa-solid fa-gear",
        description: "Manage your account and preferences",
        page: "settings.html"
    }
];


/* =====================================================
   DISPLAY MODULES
===================================================== */

const moduleContainer =
    document.getElementById("allModules");


function displayModules() {

    if (!moduleContainer) {

        return;

    }


    moduleContainer.innerHTML = "";


    modules.forEach(
        function (module) {

            const card =
                document.createElement("div");


            card.className =
                "portal-module";


            card.innerHTML = `

                <div class="portal-module-icon">

                    <i class="${module.icon}"></i>

                </div>


                <div class="portal-module-info">

                    <h3>
                        ${module.name}
                    </h3>


                    <p>
                        ${module.description}
                    </p>

                </div>


                <div class="portal-module-arrow">

                    <i class="fa-solid fa-chevron-right"></i>

                </div>

            `;


            /* =========================================
               MODULE CLICK
            ========================================= */

            card.addEventListener(
                "click",
                function () {

                    if (module.page) {

                        window.location.href =
                            module.page;

                    }

                    else {

                        alert(
                            module.name +
                            " module will be available soon."
                        );

                    }

                }
            );


            moduleContainer.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   START MODULE DISPLAY
===================================================== */

displayModules();


/* =====================================================
   BOTTOM NAVIGATION
===================================================== */


/* =====================================================
   HOME
===================================================== */

const homeNav =
    document.getElementById("homeNav");


if (homeNav) {

    homeNav.addEventListener(
        "click",
        function () {

            window.location.href =
                "student-dashboard.html";

        }
    );

}


/* =====================================================
   PROFILE
===================================================== */

const profileNav =
    document.getElementById("profileNav");


if (profileNav) {

    profileNav.addEventListener(
        "click",
        function () {

            window.location.href =
                "profile.html";

        }
    );

}



/* =====================================================
   COMMON STUDENT HEADER
===================================================== */

const studentName =
    "Student";


const headerStudentName =
    document.getElementById(
        "headerStudentName"
    );


if (headerStudentName) {

    headerStudentName.textContent =
        studentName;

}


/* =====================================================
   GLOBAL NOTIFICATION
   -----------------------------------------------------
   Notification handling is NOT placed here.

   notification.js creates and controls the
   single global notification bell for CampusConnect.

   Do NOT add another notification button or
   notification alert in this file.
===================================================== */