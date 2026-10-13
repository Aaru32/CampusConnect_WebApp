/* =====================================================
   CAMPUSCONNECT
   ATTENDANCE MODULE
===================================================== */


/* =====================================================
   ATTENDANCE DATA

   This is the structure that will later receive
   data from Java Backend + MySQL.

   No fake student attendance is being displayed.
===================================================== */

const attendanceData = {

    overall: {

        percentage: null,

        present: null,

        absent: null,

        totalClasses: null

    },


    subjects: [

        /*
        Example structure:

        {
            name: "Data Communication & Computer Networks",
            code: "DC&CN",
            present: 22,
            absent: 3,
            total: 25,
            percentage: 88
        }
        */

    ],


    history: [

        /*
        Example structure:

        {
            subject: "DC&CN",
            date: "12 Aug 2026",
            status: "Present"
        }
        */

    ]

};



/* =====================================================
   LOAD ATTENDANCE
===================================================== */

function loadAttendance() {

    const overall =
        attendanceData.overall;


    /* ---------- OVERALL ---------- */

    if (overall.percentage === null) {

        setText(
            "overallPercentage",
            "--%"
        );

        setText(
            "presentCount",
            "--"
        );

        setText(
            "absentCount",
            "--"
        );

        setText(
            "totalClasses",
            "--"
        );

        setText(
            "attendanceMessage",
            "Attendance data will appear here once available."
        );

        setText(
            "attendanceInsight",
            "Your attendance insights will appear here when attendance data is available."
        );

    }

    else {

        setText(
            "overallPercentage",
            overall.percentage + "%"
        );


        setText(
            "presentCount",
            overall.present
        );


        setText(
            "absentCount",
            overall.absent
        );


        setText(
            "totalClasses",
            overall.totalClasses
        );


        updateCircle(
            overall.percentage
        );


        updateMessage(
            overall.percentage
        );


        updateInsight(
            overall.percentage
        );

    }


    loadSubjects();

    loadHistory();

}



/* =====================================================
   SUBJECT ATTENDANCE
===================================================== */

function loadSubjects() {

    const container =
        document.getElementById(
            "subjectAttendance"
        );


    container.innerHTML = "";


    if (
        attendanceData.subjects.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-calendar-xmark"></i>

                <p>
                    Subject attendance data is not
                    available yet.
                </p>

            </div>

        `;

        return;

    }


    attendanceData.subjects.forEach(
        subject => {

            const isLow =
                subject.percentage < 75;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "subject-card";


            card.innerHTML = `

                <div class="subject-header">

                    <div>

                        <div class="subject-name">

                            ${subject.name}

                        </div>

                        <div class="subject-code">

                            ${subject.code}

                        </div>

                    </div>


                    <div class="subject-percentage">

                        ${subject.percentage}%

                    </div>

                </div>



                <div class="subject-meta">

                    <span>
                        Present: ${subject.present}
                    </span>

                    <span>
                        Absent: ${subject.absent}
                    </span>

                    <span>
                        Total: ${subject.total}
                    </span>

                </div>



                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="
                            width:
                            ${subject.percentage}%;
                        ">
                    </div>

                </div>



                <div class="subject-footer">

                    <span class="
                        subject-status
                        ${isLow ? "low" : ""}
                    ">

                        ${
                            isLow
                            ? "Attendance Low"
                            : "Attendance Good"
                        }

                    </span>


                    <span
                        style="
                            font-size:9px;
                            color:#8995a5;
                        ">

                        ${
                            isLow
                            ? "Needs attention"
                            : "On track"
                        }

                    </span>

                </div>

            `;


            container.appendChild(card);

        }
    );

}



/* =====================================================
   ATTENDANCE HISTORY
===================================================== */

function loadHistory() {

    const container =
        document.getElementById(
            "attendanceHistory"
        );


    container.innerHTML = "";


    if (
        attendanceData.history.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <p>
                    Recent attendance records
                    are not available yet.
                </p>

            </div>

        `;

        return;

    }


    attendanceData.history.forEach(
        record => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            const status =
                record.status.toLowerCase();


            item.innerHTML = `

                <div class="history-left">

                    <div class="history-icon">

                        <i class="fa-solid fa-book"></i>

                    </div>


                    <div>

                        <div class="history-subject">

                            ${record.subject}

                        </div>

                        <div class="history-date">

                            ${record.date}

                        </div>

                    </div>

                </div>


                <span class="
                    history-status
                    ${status}
                ">

                    ${record.status}

                </span>

            `;


            container.appendChild(item);

        }
    );

}



/* =====================================================
   CIRCLE
===================================================== */

function updateCircle(percentage) {

    const circle =
        document.getElementById(
            "circleValue"
        );


    const circumference =
        365;


    const offset =
        circumference -
        (
            percentage / 100
        ) *
        circumference;


    circle.style.strokeDashoffset =
        offset;

}



/* =====================================================
   ATTENDANCE MESSAGE
===================================================== */

function updateMessage(percentage) {

    const message =
        document.getElementById(
            "attendanceMessage"
        );


    if (percentage >= 75) {

        message.textContent =
            "Your attendance is currently satisfactory.";

    }

    else {

        message.textContent =
            "Your attendance is below the required level.";

    }

}



/* =====================================================
   ATTENDANCE INSIGHT
===================================================== */

function updateInsight(percentage) {

    const insight =
        document.getElementById(
            "attendanceInsight"
        );


    if (percentage >= 75) {

        insight.textContent =
            "Your overall attendance is currently above the minimum required level. Continue maintaining regular attendance.";

    }

    else {

        insight.textContent =
            "Your overall attendance is currently below the minimum required level. Regular attendance is recommended.";

    }

}



/* =====================================================
   HELPER
===================================================== */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}



/* =====================================================
   NAVIGATION
===================================================== */

function goBack() {

    window.history.back();

}


function goHome() {

    window.location.href =
        "../Dashboard/dashboard.html";

}


function openModules() {

    window.location.href =
        "../Dashboard/modules.html";

}


function openProfile() {

    window.location.href =
        "../Dashboard/profile.html";

}


function openNotifications() {

    /*
       This will later connect to the
       CampusConnect global notification system.
    */

    alert(
        "Notifications will open here."
    );

}



/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAttendance();

    }
);