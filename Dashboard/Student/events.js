/* ==========================================
   CAMPUSCONNECT EVENTS
========================================== */


/* ==========================================
   EVENT DATA
========================================== */

const events = [

    {
        id: 1,
        title: "Technical Workshop",
        category: "workshop",
        date: "20 August 2026",
        time: "10:00 AM - 1:00 PM",
        venue: "Computer Lab",
        organizer: "CSE Department",
        deadline: "18 August 2026",

        description:
            "A hands-on technical workshop designed to help students improve their practical knowledge and understand current technologies."
    },


    {
        id: 2,
        title: "Annual Tech Fest 2026",
        category: "technical",
        date: "25 August 2026",
        time: "10:00 AM - 4:00 PM",
        venue: "College Auditorium",
        organizer: "CSE Department",
        deadline: "20 August 2026",

        description:
            "An annual technical event featuring coding activities, project exhibitions, quizzes and other technology-based competitions."
    },


    {
        id: 3,
        title: "Independence Day Celebration",
        category: "cultural",
        date: "15 August 2026",
        time: "8:00 AM - 11:00 AM",
        venue: "College Campus",
        organizer: "Student Activity Committee",
        deadline: "12 August 2026",

        description:
            "A college celebration featuring cultural activities, performances and a special program organized for Independence Day."
    },


    {
        id: 4,
        title: "Coding Competition",
        category: "technical",
        date: "30 August 2026",
        time: "11:00 AM - 2:00 PM",
        venue: "Programming Lab",
        organizer: "CSE Department",
        deadline: "27 August 2026",

        description:
            "A programming competition where students can demonstrate their problem-solving and coding skills."
    },


    {
        id: 5,
        title: "Sports Meet",
        category: "sports",
        date: "5 September 2026",
        time: "9:00 AM - 3:00 PM",
        venue: "College Ground",
        organizer: "Sports Committee",
        deadline: "1 September 2026",

        description:
            "An inter-department sports event encouraging students to participate in various indoor and outdoor sporting activities."
    },


    {
        id: 6,
        title: "Academic Seminar",
        category: "academic",
        date: "10 September 2026",
        time: "11:00 AM - 1:00 PM",
        venue: "Seminar Hall",
        organizer: "Academic Department",
        deadline: "8 September 2026",

        description:
            "An academic seminar focused on career development, higher education opportunities and professional skills."
    }

];


/* ==========================================
   NOTIFICATIONS
========================================== */

const notifications = [

    {
        id: 1,
        message: "Technical Workshop registration is open.",
        read: false
    },

    {
        id: 2,
        message: "Annual Tech Fest registration deadline approaching.",
        read: false
    },

    {
        id: 3,
        message: "New academic seminar announced.",
        read: true
    }

];


/* ==========================================
   NOTIFICATION COUNT
========================================== */

function updateNotificationCount() {

    const notificationCount =
        document.getElementById("notificationCount");

    if (!notificationCount) return;


    const unreadCount =
        notifications.filter(
            notification =>
                notification.read === false
        ).length;


    notificationCount.textContent =
        unreadCount;

}


/* ==========================================
   LOAD EVENTS
========================================== */

function loadEvents(eventList = events) {

    const container =
        document.getElementById("eventsContainer");

    const eventCount =
        document.getElementById("eventCount");


    if (!container) return;


    container.innerHTML = "";


    if (eventCount) {

        eventCount.textContent =
            eventList.length +
            (eventList.length === 1
                ? " Event"
                : " Events");

    }


    if (eventList.length === 0) {

        container.innerHTML = `

            <div class="no-events">

                <i class="fa-regular fa-calendar-xmark"></i>

                <h3>
                    No Events Found
                </h3>

                <p>
                    Try changing your search or category.
                </p>

            </div>

        `;

        return;

    }


    eventList.forEach(event => {

        const card =
            document.createElement("div");


        card.className =
            "event-card";


        card.innerHTML = `

            <div class="event-top">

                <div class="event-icon">

                    <i class="fa-solid fa-calendar-days"></i>

                </div>

                <h3>
                    ${event.title}
                </h3>

            </div>


            <div class="event-body">

                <span class="event-category">
                    ${event.category}
                </span>


                <div class="event-info">

                    <i class="fa-regular fa-calendar"></i>

                    <span>
                        ${event.date}
                    </span>

                </div>


                <div class="event-info">

                    <i class="fa-regular fa-clock"></i>

                    <span>
                        ${event.time}
                    </span>

                </div>


                <div class="event-info">

                    <i class="fa-solid fa-location-dot"></i>

                    <span>
                        ${event.venue}
                    </span>

                </div>


                <p class="event-description">
                    ${event.description}
                </p>


                <button
                    class="details-btn"
                    onclick="showEvent(${event.id})">

                    View Details

                </button>

            </div>

        `;


        container.appendChild(card);

    });

}


/* ==========================================
   SHOW EVENT DETAILS
========================================== */

function showEvent(id) {

    const event =
        events.find(
            item => item.id === id
        );


    if (!event) return;


    document.getElementById("modalTitle")
        .textContent = event.title;


    document.getElementById("modalCategory")
        .textContent = event.category;


    document.getElementById("modalDate")
        .textContent = event.date;


    document.getElementById("modalTime")
        .textContent = event.time;


    document.getElementById("modalVenue")
        .textContent = event.venue;


    document.getElementById("modalOrganizer")
        .textContent = event.organizer;


    document.getElementById("modalDescription")
        .textContent = event.description;


    document.getElementById("modalDeadline")
        .textContent = event.deadline;


    document.getElementById("eventModal")
        .classList.add("show");

}


/* ==========================================
   CLOSE EVENT
========================================== */

function closeEvent() {

    document.getElementById("eventModal")
        .classList.remove("show");

}


/* ==========================================
   REGISTER EVENT
========================================== */

function registerEvent() {

    alert(
        "Event registration will be connected to the database."
    );

}


/* ==========================================
   SEARCH + CATEGORY FILTER
========================================== */

function filterEvents() {

    const searchInput =
        document.getElementById("searchEvent");


    const categoryInput =
        document.getElementById("eventCategory");


    if (!searchInput || !categoryInput) return;


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryInput.value;


    const filteredEvents =
        events.filter(event => {


            const matchesSearch =

                event.title
                    .toLowerCase()
                    .includes(searchText)

                ||

                event.description
                    .toLowerCase()
                    .includes(searchText)

                ||

                event.organizer
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =

                category === "all"

                ||

                event.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    loadEvents(filteredEvents);

}


/* ==========================================
   CLOSE MODAL OUTSIDE CLICK
========================================== */

const eventModal =
    document.getElementById("eventModal");


if (eventModal) {

    eventModal.addEventListener(
        "click",
        function(event) {

            if (event.target === this) {

                closeEvent();

            }

        }
    );

}


/* ==========================================
   NOTIFICATION BUTTON
========================================== */

const notificationButton =
    document.getElementById(
        "notificationButton"
    );


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function() {

            alert(
                "You have " +
                notifications.filter(
                    notification =>
                        notification.read === false
                ).length +
                " unread notifications."
            );

        }
    );

}


/* ==========================================
   INITIAL LOAD
========================================== */

loadEvents();

updateNotificationCount();