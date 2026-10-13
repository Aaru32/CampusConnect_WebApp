/* =========================================
   CampusConnect LMS
   Frontend + Backend Ready
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const backButton =
    document.getElementById(
        "backButton"
    );


const lmsSearch =
    document.getElementById(
        "lmsSearch"
    );


const searchButton =
    document.getElementById(
        "searchButton"
    );


const resourceGrid =
    document.getElementById(
        "resourceGrid"
    );


const resourceShelfTitle =
    document.getElementById(
        "resourceShelfTitle"
    );


const progressValue =
    document.getElementById(
        "progressValue"
    );


const resourceModal =
    document.getElementById(
        "resourceModal"
    );


const modalClose =
    document.getElementById(
        "modalClose"
    );


const modalContent =
    document.getElementById(
        "modalContent"
    );


/* =========================================
   CURRENT FILTER
========================================= */

let currentResourceType = "all";


/* =========================================
   BACK NAVIGATION
========================================= */

backButton.addEventListener(
    "click",
    function () {

        if (
            window.history.length > 1
        ) {

            window.history.back();

        } else {

            /*
                Temporary fallback.

                The final global CampusConnect
                navigation system can replace this.
            */

            window.location.href =
                "student-dashboard.html";
        }

    }
);


/* =========================================
   RESOURCE TYPE FILTER
========================================= */

const resourceTypeButtons =
    document.querySelectorAll(
        ".resource-type"
    );


resourceTypeButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                resourceTypeButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentResourceType =
                    button.dataset.type;


                resourceShelfTitle.textContent =
                    getResourceTitle(
                        currentResourceType
                    );


                /*
                    BACKEND INTEGRATION POINT

                    Later this will request:

                    GET /api/lms/resources

                    with the selected resource
                    type as a filter.
                */

                loadResources(
                    currentResourceType,
                    lmsSearch.value.trim()
                );

            }
        );

    }
);


/* =========================================
   RESOURCE TITLE
========================================= */

function getResourceTitle(type) {

    const titles = {

        all: "All Resources",

        notes: "Notes",

        documents: "Documents",

        presentations: "Presentations",

        videos: "Videos"

    };


    return (
        titles[type] ||
        "All Resources"
    );
}


/* =========================================
   SEARCH
========================================= */

function performSearch() {

    const searchText =
        lmsSearch.value.trim();


    /*
        BACKEND INTEGRATION POINT

        Later:

        GET /api/lms/search?q={searchText}

        The backend will search the resources
        available to the authenticated student.
    */

    loadResources(
        currentResourceType,
        searchText
    );

}


searchButton.addEventListener(
    "click",
    performSearch
);


lmsSearch.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            performSearch();

        }

    }
);


/* =========================================
   RESOURCE LOADING
========================================= */

async function loadResources(
    type = "all",
    search = ""
) {

    /*
        IMPORTANT:

        There is intentionally no fake resource
        array here.

        When the Java backend is ready,
        this function will fetch real data.

        Example future request:

        const response = await fetch(
            `/api/lms/resources?type=${type}&search=${encodeURIComponent(search)}`,
            {
                credentials: "include"
            }
        );

        const resources = await response.json();

        renderResources(resources);
    */

}


/* =========================================
   COURSE LOADING
========================================= */

async function loadCourses() {

    /*
        Future API:

        GET /api/lms/courses

        The backend determines which courses
        belong to the authenticated student.

        Nothing is hardcoded here.
    */

}


/* =========================================
   LEARNING ACTIVITY
========================================= */

async function loadLearningActivity() {

    /*
        Future API:

        GET /api/lms/activity

        This can return:

        - recently viewed resources
        - current learning item
        - progress
        - saved resources
    */

}


/* =========================================
   PROGRESS
========================================= */

async function loadLearningProgress() {

    /*
        Future API:

        GET /api/lms/progress

        The backend calculates the actual
        progress of the authenticated student.

        The value must NOT be hardcoded.
    */

}


/* =========================================
   SAVED RESOURCES
========================================= */

const savedButton =
    document.getElementById(
        "savedButton"
    );


savedButton.addEventListener(
    "click",
    function () {

        /*
            Future API:

            GET /api/lms/resources/saved

            This will display the resources
            saved by the authenticated student.
        */

        openInformationModal(
            "Saved Resources",
            "Your saved learning resources will be available here."
        );

    }
);


/* =========================================
   VIEW ALL
========================================= */

const viewAllButton =
    document.getElementById(
        "viewAllButton"
    );


viewAllButton.addEventListener(
    "click",
    function () {

        /*
            Future implementation:

            Expand the resource shelf or
            open the complete resource browser.

            Data will come from backend.
        */

        openInformationModal(
            "All Resources",
            "The complete resource library will be loaded from the CampusConnect backend."
        );

    }
);


/* =========================================
   MODAL
========================================= */

function openInformationModal(
    title,
    description
) {

    modalContent.innerHTML = `

        <h3>
            ${escapeHTML(title)}
        </h3>

        <p>
            ${escapeHTML(description)}
        </p>

    `;


    resourceModal.classList.add(
        "active"
    );


    resourceModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeInformationModal() {

    resourceModal.classList.remove(
        "active"
    );


    resourceModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


modalClose.addEventListener(
    "click",
    closeInformationModal
);


resourceModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            resourceModal
        ) {

            closeInformationModal();

        }

    }
);


/* =========================================
   SAFE TEXT HELPER
========================================= */

function escapeHTML(value) {

    const temporaryElement =
        document.createElement(
            "div"
        );


    temporaryElement.textContent =
        value;


    return temporaryElement.innerHTML;

}


/* =========================================
   INITIALIZE LMS
========================================= */

function initializeLMS() {

    /*
        These functions are intentionally
        not connected to a nonexistent API yet.

        Once the Java backend is created,
        they will retrieve real CampusConnect
        data.

        No fixed student information,
        subjects, courses, resources or
        progress is created here.
    */


    loadResources();

    loadCourses();

    loadLearningActivity();

    loadLearningProgress();

}


initializeLMS();