/* =========================================================
   CAMPUSCONNECT
   ADMIN FACULTY MANAGEMENT
   Dynamic / API-Ready
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    /*
     * Keep this empty while frontend and backend
     * are not connected.
     *
     * Example later:
     * API_BASE_URL: "http://localhost:8080/api"
     */

    API_BASE_URL: "",

    ENDPOINTS: {
        faculty: "/admin/faculty",
        filters: "/admin/faculty/filters"
    }

};


/* =========================================================
   STATE
========================================================= */

const state = {

    allFaculty: [],

    filteredFaculty: [],

    filters: {
        department: "",
        designation: "",
        session: "",
        employmentStatus: "",
        employmentType: ""
    },

    search: ""

};


/* =========================================================
   DOM
========================================================= */

const elements = {

    backButton:
        document.getElementById("backButton"),

    searchButton:
        document.getElementById("searchButton"),

    searchContainer:
        document.getElementById("searchContainer"),

    facultySearch:
        document.getElementById("facultySearch"),

    clearSearch:
        document.getElementById("clearSearch"),

    filterButton:
        document.getElementById("filterButton"),

    filterPanel:
        document.getElementById("filterPanel"),

    closeFilter:
        document.getElementById("closeFilter"),

    departmentFilter:
        document.getElementById("departmentFilter"),

    designationFilter:
        document.getElementById("designationFilter"),

    sessionFilter:
        document.getElementById("sessionFilter"),

    employmentStatusFilter:
        document.getElementById("employmentStatusFilter"),

    employmentTypeFilter:
        document.getElementById("employmentTypeFilter"),

    clearFilters:
        document.getElementById("clearFilters"),

    applyFilters:
        document.getElementById("applyFilters"),

    refreshButton:
        document.getElementById("refreshButton"),

    facultyCount:
        document.getElementById("facultyCount"),

    activeFilterBadge:
        document.getElementById("activeFilterBadge"),

    listDescription:
        document.getElementById("listDescription"),

    facultyList:
        document.getElementById("facultyList"),

    loadingState:
        document.getElementById("loadingState"),

    emptyState:
        document.getElementById("emptyState"),

    emptyTitle:
        document.getElementById("emptyTitle"),

    emptyMessage:
        document.getElementById("emptyMessage")

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeEvents();

        loadFaculty();

    }
);


/* =========================================================
   EVENTS
========================================================= */

function initializeEvents() {

    elements.backButton.addEventListener(
        "click",
        goBack
    );


    elements.searchButton.addEventListener(
        "click",
        toggleSearch
    );


    elements.facultySearch.addEventListener(
        "input",
        handleSearch
    );


    elements.clearSearch.addEventListener(
        "click",
        clearSearch
    );


    elements.filterButton.addEventListener(
        "click",
        toggleFilters
    );


    elements.closeFilter.addEventListener(
        "click",
        closeFilters
    );


    elements.applyFilters.addEventListener(
        "click",
        applyFilters
    );


    elements.clearFilters.addEventListener(
        "click",
        clearFilters
    );


    elements.refreshButton.addEventListener(
        "click",
        loadFaculty
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function goBack() {

    if (window.history.length > 1) {

        window.history.back();

        return;

    }


    window.location.href =
        "admin-dashboard.html";

}


/* =========================================================
   SEARCH
========================================================= */

function toggleSearch() {

    elements.searchContainer.classList.toggle(
        "open"
    );


    if (
        elements.searchContainer.classList.contains(
            "open"
        )
    ) {

        setTimeout(() => {

            elements.facultySearch.focus();

        }, 100);

    }

}


function handleSearch(event) {

    state.search =
        event.target.value.trim();

    renderFaculty();

}


function clearSearch() {

    elements.facultySearch.value = "";

    state.search = "";

    renderFaculty();

    elements.facultySearch.focus();

}


/* =========================================================
   FILTER PANEL
========================================================= */

function toggleFilters() {

    elements.filterPanel.classList.toggle(
        "open"
    );

}


function closeFilters() {

    elements.filterPanel.classList.remove(
        "open"
    );

}


function applyFilters() {

    state.filters.department =
        elements.departmentFilter.value;


    state.filters.designation =
        elements.designationFilter.value;


    state.filters.session =
        elements.sessionFilter.value;


    state.filters.employmentStatus =
        elements.employmentStatusFilter.value;


    state.filters.employmentType =
        elements.employmentTypeFilter.value;


    updateFilterBadge();

    closeFilters();

    renderFaculty();

}


function clearFilters() {

    elements.departmentFilter.value = "";

    elements.designationFilter.value = "";

    elements.sessionFilter.value = "";

    elements.employmentStatusFilter.value = "";

    elements.employmentTypeFilter.value = "";


    state.filters = {

        department: "",
        designation: "",
        session: "",
        employmentStatus: "",
        employmentType: ""

    };


    updateFilterBadge();

    renderFaculty();

}


/* =========================================================
   FILTER BADGE
========================================================= */

function updateFilterBadge() {

    const count =
        Object.values(state.filters)
            .filter(value => value !== "")
            .length;


    elements.activeFilterBadge.textContent =
        `${count} filter${count === 1 ? "" : "s"}`;

}


/* =========================================================
   LOAD FACULTY
========================================================= */

async function loadFaculty() {

    showLoading();


    try {

        const data =
            await request(
                CONFIG.ENDPOINTS.faculty
            );


        state.allFaculty =
            normalizeFacultyResponse(data);


        populateFilters(data);

        renderFaculty();


    } catch (error) {

        console.error(
            "Unable to load faculty records:",
            error
        );


        state.allFaculty = [];


        showEmpty(
            "Faculty database is not connected",
            "Faculty records will appear here when the Admin Faculty API is connected."
        );

    }

}


/* =========================================================
   API REQUEST
========================================================= */

async function request(endpoint) {

    if (!CONFIG.API_BASE_URL) {

        throw new Error(
            "API_BASE_URL is not configured."
        );

    }


    const response =
        await fetch(
            `${CONFIG.API_BASE_URL}${endpoint}`,
            {
                method: "GET",

                headers: {
                    "Accept": "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            `Request failed with status ${response.status}`
        );

    }


    return response.json();

}


/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

function normalizeFacultyResponse(data) {

    /*
     * Supports:
     *
     * [
     *   {...},
     *   {...}
     * ]
     *
     * or
     *
     * {
     *   faculty: [...]
     * }
     *
     * or
     *
     * {
     *   data: [...]
     * }
     */

    if (Array.isArray(data)) {

        return data;

    }


    if (
        data &&
        Array.isArray(data.faculty)
    ) {

        return data.faculty;

    }


    if (
        data &&
        Array.isArray(data.faculties)
    ) {

        return data.faculties;

    }


    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }


    return [];

}


/* =========================================================
   POPULATE FILTERS
========================================================= */

function populateFilters(data) {

    const filterData =
        data?.filters ||
        data?.filterOptions;


    if (!filterData) {

        populateSelectFromFaculty(
            elements.departmentFilter,
            "department"
        );


        populateSelectFromFaculty(
            elements.designationFilter,
            "designation"
        );


        populateSelectFromFaculty(
            elements.sessionFilter,
            "session"
        );


        populateSelectFromFaculty(
            elements.employmentStatusFilter,
            "employmentStatus"
        );


        populateSelectFromFaculty(
            elements.employmentTypeFilter,
            "employmentType"
        );


        return;

    }


    populateSelect(
        elements.departmentFilter,
        filterData.departments,
        "All Departments"
    );


    populateSelect(
        elements.designationFilter,
        filterData.designations,
        "All Designations"
    );


    populateSelect(
        elements.sessionFilter,
        filterData.sessions,
        "All Sessions"
    );


    populateSelect(
        elements.employmentStatusFilter,
        filterData.employmentStatuses ||
        filterData.statuses,
        "All Status"
    );


    populateSelect(
        elements.employmentTypeFilter,
        filterData.employmentTypes,
        "All Types"
    );

}


/* =========================================================
   SELECT HELPERS
========================================================= */

function populateSelect(
    select,
    values,
    defaultText
) {

    select.innerHTML = "";


    const defaultOption =
        document.createElement("option");


    defaultOption.value = "";

    defaultOption.textContent =
        defaultText;


    select.appendChild(
        defaultOption
    );


    if (!Array.isArray(values)) {

        return;

    }


    [...new Set(values)]
        .filter(
            value =>
                value !== null &&
                value !== undefined
        )
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b)
                )
        )
        .forEach(value => {

            const option =
                document.createElement(
                    "option"
                );


            option.value = value;

            option.textContent = value;


            select.appendChild(
                option
            );

        });

}


function populateSelectFromFaculty(
    select,
    field
) {

    const values =
        state.allFaculty
            .map(
                faculty =>
                    getFacultyField(
                        faculty,
                        field
                    )
            )
            .filter(
                value =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            );


    let defaultText = "All";


    if (field === "department") {

        defaultText =
            "All Departments";

    }


    if (field === "designation") {

        defaultText =
            "All Designations";

    }


    if (field === "session") {

        defaultText =
            "All Sessions";

    }


    if (field === "employmentStatus") {

        defaultText =
            "All Status";

    }


    if (field === "employmentType") {

        defaultText =
            "All Types";

    }


    populateSelect(
        select,
        values,
        defaultText
    );

}


/* =========================================================
   FILTER + SEARCH
========================================================= */

function getVisibleFaculty() {

    let faculty =
        [...state.allFaculty];


    /* SEARCH */

    if (state.search) {

        const search =
            state.search.toLowerCase();


        faculty =
            faculty.filter(member => {

                const name =
                    getFacultyField(
                        member,
                        "name"
                    );


                const employeeId =
                    getFacultyField(
                        member,
                        "employeeId"
                    );


                const designation =
                    getFacultyField(
                        member,
                        "designation"
                    );


                return [

                    name,
                    employeeId,
                    designation

                ]
                    .filter(Boolean)
                    .some(
                        value =>
                            String(value)
                                .toLowerCase()
                                .includes(search)
                    );

            });

    }


    /* DEPARTMENT */

    if (state.filters.department) {

        faculty =
            faculty.filter(member =>
                matches(
                    getFacultyField(
                        member,
                        "department"
                    ),
                    state.filters.department
                )
            );

    }


    /* DESIGNATION */

    if (state.filters.designation) {

        faculty =
            faculty.filter(member =>
                matches(
                    getFacultyField(
                        member,
                        "designation"
                    ),
                    state.filters.designation
                )
            );

    }


    /* SESSION */

    if (state.filters.session) {

        faculty =
            faculty.filter(member =>
                matches(
                    getFacultyField(
                        member,
                        "session"
                    ),
                    state.filters.session
                )
            );

    }


    /* EMPLOYMENT STATUS */

    if (state.filters.employmentStatus) {

        faculty =
            faculty.filter(member =>
                matches(
                    getFacultyField(
                        member,
                        "employmentStatus"
                    ),
                    state.filters.employmentStatus
                )
            );

    }


    /* EMPLOYMENT TYPE */

    if (state.filters.employmentType) {

        faculty =
            faculty.filter(member =>
                matches(
                    getFacultyField(
                        member,
                        "employmentType"
                    ),
                    state.filters.employmentType
                )
            );

    }


    return faculty;

}


/* =========================================================
   RENDER
========================================================= */

function renderFaculty() {

    const faculty =
        getVisibleFaculty();


    state.filteredFaculty =
        faculty;


    elements.facultyList.innerHTML =
        "";


    updateFacultyCount(
        faculty.length
    );


    if (!faculty.length) {

        if (
            state.search ||
            Object.values(state.filters)
                .some(Boolean)
        ) {

            showEmpty(
                "No matching faculty",
                "Try changing the search text or selected filters."
            );

        } else {

            showEmpty(
                "No faculty records available",
                "Faculty records will appear here when they are available from the database."
            );

        }


        return;

    }


    hideStates();


    faculty.sort(
        compareFacultyNames
    );


    const groups =
        groupAlphabetically(
            faculty
        );


    Object.keys(groups)
        .sort()
        .forEach(letter => {

            const group =
                document.createElement(
                    "section"
                );


            group.className =
                "letter-group";


            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "letter-heading";


            heading.textContent =
                letter;


            group.appendChild(
                heading
            );


            groups[letter].forEach(
                member => {

                    group.appendChild(
                        createFacultyRow(
                            member
                        )
                    );

                }
            );


            elements.facultyList.appendChild(
                group
            );

        });


    elements.listDescription.textContent =
        state.search ||
        Object.values(state.filters)
            .some(Boolean)

            ? "Showing faculty matching your search or filters."

            : "Faculty are arranged alphabetically by name.";

}


/* =========================================================
   FACULTY ROW
========================================================= */

function createFacultyRow(
    faculty
) {

    const row =
        document.createElement(
            "article"
        );


    row.className =
        "faculty-row";


    const name =
        getFacultyField(
            faculty,
            "name"
        ) ||
        "Unnamed Faculty";


    const employeeId =
        getFacultyField(
            faculty,
            "employeeId"
        );


    const department =
        getFacultyField(
            faculty,
            "department"
        );


    const designation =
        getFacultyField(
            faculty,
            "designation"
        );


    const session =
        getFacultyField(
            faculty,
            "session"
        );


    const avatar =
        document.createElement(
            "img"
        );


    avatar.className =
        "faculty-avatar";


    avatar.alt =
        `${name} profile photo`;


    avatar.src =
        getProfileImage(
            faculty,
            name
        );


    avatar.addEventListener(
        "error",
        () => {

            avatar.src =
                createInitialAvatar(
                    name
                );

        },
        {
            once: true
        }
    );


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "faculty-info";


    const nameElement =
        document.createElement(
            "div"
        );


    nameElement.className =
        "faculty-name";


    nameElement.textContent =
        name;


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "faculty-meta";


    const values = [];


    if (employeeId) {

        values.push(
            `ID: ${employeeId}`
        );

    }


    if (designation) {

        values.push(
            designation
        );

    }


    if (department) {

        values.push(
            department
        );

    }


    if (session) {

        values.push(
            session
        );

    }


    values.forEach(
        (value, index) => {

            if (index > 0) {

                const separator =
                    document.createElement(
                        "span"
                    );


                separator.className =
                    "separator";


                separator.textContent =
                    "•";


                meta.appendChild(
                    separator
                );

            }


            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                value;


            meta.appendChild(
                span
            );

        }
    );


    info.appendChild(
        nameElement
    );


    info.appendChild(
        meta
    );


    const arrow =
        document.createElement(
            "div"
        );


    arrow.className =
        "faculty-arrow";


    arrow.innerHTML =
        '<i class="fa-solid fa-chevron-right"></i>';


    row.appendChild(
        avatar
    );


    row.appendChild(
        info
    );


    row.appendChild(
        arrow
    );


    row.addEventListener(
        "click",
        () => openFacultyProfile(
            faculty
        )
    );


    return row;

}


/* =========================================================
   OPEN PROFILE
========================================================= */

function openFacultyProfile(
    faculty
) {

    const id =
        faculty.id ??
        faculty.facultyId ??
        faculty.faculty_id ??
        faculty.employeeId ??
        faculty.employee_id;


    if (
        id === null ||
        id === undefined ||
        String(id).trim() === ""
    ) {

        console.error(
            "Faculty record does not contain a usable identifier.",
            faculty
        );

        return;

    }


    window.location.href =
        `faculty-profile.html?id=${encodeURIComponent(id)}`;

}


/* =========================================================
   ALPHABETICAL GROUPING
========================================================= */

function groupAlphabetically(
    faculty
) {

    const groups = {};


    faculty.forEach(member => {

        const name =
            getFacultyField(
                member,
                "name"
            ) || "";


        const firstCharacter =
            name
                .trim()
                .charAt(0)
                .toUpperCase();


        const letter =
            /^[A-Z]$/.test(
                firstCharacter
            )
                ? firstCharacter
                : "#";


        if (!groups[letter]) {

            groups[letter] = [];

        }


        groups[letter].push(
            member
        );

    });


    return groups;

}


/* =========================================================
   SORT
========================================================= */

function compareFacultyNames(
    a,
    b
) {

    const nameA =
        String(
            getFacultyField(
                a,
                "name"
            ) || ""
        );


    const nameB =
        String(
            getFacultyField(
                b,
                "name"
            ) || ""
        );


    return nameA.localeCompare(
        nameB,
        undefined,
        {
            sensitivity: "base"
        }
    );

}


/* =========================================================
   FIELD RESOLUTION
========================================================= */

function getFacultyField(
    faculty,
    field
) {

    const mappings = {

        name: [
            "name",
            "fullName",
            "full_name",
            "facultyName",
            "faculty_name"
        ],

        profilePhoto: [
            "profilePhoto",
            "profile_photo",
            "photo",
            "photoUrl",
            "photo_url",
            "profileImage",
            "profile_image"
        ],

        employeeId: [
            "employeeId",
            "employee_id",
            "employeeNo",
            "employee_no"
        ],

        department: [
            "department",
            "departmentName",
            "department_name"
        ],

        designation: [
            "designation",
            "designationName",
            "designation_name"
        ],

        session: [
            "session",
            "academicSession",
            "academic_session"
        ],

        employmentStatus: [
            "employmentStatus",
            "employment_status",
            "status"
        ],

        employmentType: [
            "employmentType",
            "employment_type"
        ]

    };


    const possibleKeys =
        mappings[field] ||
        [field];


    for (
        const key of possibleKeys
    ) {

        if (
            faculty &&
            faculty[key] !== undefined &&
            faculty[key] !== null
        ) {

            return faculty[key];

        }

    }


    return "";

}


/* =========================================================
   IMAGE
========================================================= */

function getProfileImage(
    faculty,
    name
) {

    const suppliedImage =
        getFacultyField(
            faculty,
            "profilePhoto"
        );


    if (suppliedImage) {

        return suppliedImage;

    }


    return createInitialAvatar(
        name
    );

}


function createInitialAvatar(
    name
) {

    return (
        "https://ui-avatars.com/api/?" +
        `name=${encodeURIComponent(name)}` +
        "&size=128" +
        "&background=edf5ff" +
        "&color=0757c9" +
        "&bold=true"
    );

}


/* =========================================================
   MATCH
========================================================= */

function matches(
    value,
    filter
) {

    return String(value)
        .toLowerCase()
        ===
        String(filter)
            .toLowerCase();

}


/* =========================================================
   COUNT
========================================================= */

function updateFacultyCount(
    count
) {

    elements.facultyCount.textContent =
        `${count} Faculty`;

}


/* =========================================================
   UI STATES
========================================================= */

function showLoading() {

    elements.loadingState.hidden =
        false;


    elements.emptyState.hidden =
        true;


    elements.facultyList.innerHTML =
        "";

}


function showEmpty(
    title,
    message
) {

    elements.loadingState.hidden =
        true;


    elements.emptyState.hidden =
        false;


    elements.emptyTitle.textContent =
        title;


    elements.emptyMessage.textContent =
        message;

}


function hideStates() {

    elements.loadingState.hidden =
        true;


    elements.emptyState.hidden =
        true;

}