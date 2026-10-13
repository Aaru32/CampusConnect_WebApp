/* =========================================================
CAMPUSCONNECT
FACULTY PROFILE
Backend / API Ready
========================================================= */

/* =========================================================
CONFIGURATION
========================================================= */

const CONFIG = {

API_BASE_URL: "",

ENDPOINTS: {

    PROFILE:
        "/faculty/profile",

    PHOTO:
        "/faculty/profile/photo",

    NOTIFICATIONS:
        "/notifications"

}

};

/* =========================================================
DOM
========================================================= */

const DOM = {

backBtn:
    document.getElementById("backBtn"),

refreshButton:
    document.getElementById("refreshButton"),

notificationButton:
    document.getElementById(
        "notificationButton"
    ),

notificationCount:
    document.getElementById(
        "notificationCount"
    ),

profilePhoto:
    document.getElementById(
        "profilePhoto"
    ),

photoInput:
    document.getElementById(
        "photoInput"
    ),

photoModal:
    document.getElementById(
        "photoModal"
    ),

photoPreview:
    document.getElementById(
        "photoPreview"
    ),

cancelPhoto:
    document.getElementById(
        "cancelPhoto"
    ),

savePhoto:
    document.getElementById(
        "savePhoto"
    )

};

/* =========================================================
STATE
========================================================= */

const facultyState = {

profile: null,

notifications: [],

selectedPhotoFile: null

};

/* =========================================================
INITIALIZATION
========================================================= */

document.addEventListener(
"DOMContentLoaded",
initializeProfile
);

function initializeProfile() {

setupHeader();

setupPhotoEditor();

loadFacultyProfile();

loadNotifications();

}

/* =========================================================
API
========================================================= */

async function apiRequest(
endpoint,
options = {}
) {

if (!CONFIG.API_BASE_URL) {

    return null;

}


const response =
    await fetch(
        CONFIG.API_BASE_URL + endpoint,
        {
            ...options,

            credentials: "include",

            headers: {

                "Content-Type":
                    "application/json",

                ...(options.headers || {})

            }

        }
    );


if (!response.ok) {

    throw new Error(
        `Request failed: ${response.status}`
    );

}


return response.json();

}

/* =========================================================
PROFILE
========================================================= */

async function loadFacultyProfile() {

if (!CONFIG.API_BASE_URL) {

    renderEmptyProfile();

    return;

}


try {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.PROFILE
        );


    if (!data) {

        renderEmptyProfile();

        return;

    }


    facultyState.profile =
        data;


    renderProfile(data);

}

catch (error) {

    console.error(
        "Faculty profile error:",
        error
    );

    renderEmptyProfile();

}

}

/* =========================================================
RENDER PROFILE
========================================================= */

function renderProfile(
data
) {

setText(
    "profileName",
    data.name ||
    data.fullName ||
    "Faculty"
);


setText(
    "profileDesignation",
    data.designation ||
    "—"
);


setText(
    "profileDepartment",
    data.department ||
    data.departmentName ||
    "—"
);


setText(
    "employeeId",
    data.employeeId ||
    data.employeeID ||
    "—"
);


setText(
    "firstName",
    data.firstName ||
    "—"
);


setText(
    "lastName",
    data.lastName ||
    "—"
);


setText(
    "dateOfBirth",
    data.dateOfBirth ||
    "—"
);


setText(
    "gender",
    data.gender ||
    "—"
);


setText(
    "mobileNumber",
    data.mobileNumber ||
    data.phone ||
    "—"
);


setText(
    "emailId",
    data.email ||
    "—"
);


setText(
    "alternateContact",
    data.alternateContact ||
    "—"
);


setText(
    "bloodGroup",
    data.bloodGroup ||
    "—"
);


setText(
    "professionalEmployeeId",
    data.employeeId ||
    data.employeeID ||
    "—"
);


setText(
    "designation",
    data.designation ||
    "—"
);


setText(
    "professionalDepartment",
    data.department ||
    data.departmentName ||
    "—"
);


setText(
    "facultyType",
    data.facultyType ||
    data.employmentType ||
    "—"
);


setText(
    "joiningDate",
    data.joiningDate ||
    "—"
);


setText(
    "employmentStatus",
    data.employmentStatus ||
    data.status ||
    "—"
);


setText(
    "officeRoom",
    data.officeRoom ||
    data.room ||
    "—"
);


setText(
    "institution",
    data.institution ||
    "—"
);


renderQualifications(
    data.qualifications
);


renderSubjects(
    data.subjects
);


renderClasses(
    data.classes
);


renderSchedule(
    data.schedule
);


renderKPIs(
    data.statistics ||
    data.dashboard
);


renderAddress(
    data.address
);


if (data.profileImage) {

    DOM.profilePhoto.src =
        data.profileImage;

}

}

/* =========================================================
QUALIFICATIONS
========================================================= */

function renderQualifications(
qualifications
) {

const container =
    document.getElementById(
        "qualificationList"
    );


if (
    !container ||
    !Array.isArray(qualifications) ||
    qualifications.length === 0
) {

    return;

}


container.innerHTML =
    qualifications
        .map(
            qualification => `

                <div class="qualification-item">

                    <div>
                        <span class="qualification-label">
                            Degree
                        </span>

                        <span class="qualification-value">
                            ${escapeHTML(
                                qualification.degree ||
                                "—"
                            )}
                        </span>
                    </div>


                    <div>
                        <span class="qualification-label">
                            Specialization
                        </span>

                        <span class="qualification-value">
                            ${escapeHTML(
                                qualification.specialization ||
                                "—"
                            )}
                        </span>
                    </div>


                    <div>
                        <span class="qualification-label">
                            Institution
                        </span>

                        <span class="qualification-value">
                            ${escapeHTML(
                                qualification.institution ||
                                "—"
                            )}
                        </span>
                    </div>


                    <div>
                        <span class="qualification-label">
                            Year
                        </span>

                        <span class="qualification-value">
                            ${escapeHTML(
                                qualification.year ||
                                "—"
                            )}
                        </span>
                    </div>

                </div>

            `
        )
        .join("");

}

/* =========================================================
SUBJECTS
========================================================= */

function renderSubjects(
subjects
) {

const container =
    document.getElementById(
        "subjectsList"
    );


const count =
    document.getElementById(
        "subjectCount"
    );


if (!Array.isArray(subjects)) {

    return;

}


if (count) {

    count.textContent =
        subjects.length;

}


if (
    !container ||
    subjects.length === 0
) {

    return;

}


container.innerHTML =
    subjects
        .map(
            subject => `

                <div class="teaching-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                subject.name ||
                                subject.subjectName ||
                                "Subject"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                subject.code ||
                                subject.subjectCode ||
                                ""
                            )}
                        </span>

                    </div>

                    <i class="fa-solid fa-chevron-right"></i>

                </div>

            `
        )
        .join("");

}

/* =========================================================
CLASSES
========================================================= */

function renderClasses(
classes
) {

const container =
    document.getElementById(
        "classesList"
    );


const count =
    document.getElementById(
        "classCount"
    );


if (!Array.isArray(classes)) {

    return;

}


if (count) {

    count.textContent =
        classes.length;

}


if (
    !container ||
    classes.length === 0
) {

    return;

}


container.innerHTML =
    classes
        .map(
            classData => `

                <div class="teaching-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                classData.name ||
                                classData.className ||
                                "Class"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                classData.semester ||
                                ""
                            )}
                        </span>

                    </div>

                    <i class="fa-solid fa-chevron-right"></i>

                </div>

            `
        )
        .join("");

}

/* =========================================================
SCHEDULE
========================================================= */

function renderSchedule(
schedule
) {

const container =
    document.getElementById(
        "scheduleContainer"
    );


if (
    !container ||
    !Array.isArray(schedule) ||
    schedule.length === 0
) {

    return;

}


container.innerHTML = `

    <table class="schedule-table">

        <thead>

            <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Room</th>
            </tr>

        </thead>

        <tbody>

            ${schedule
                .map(
                    item => `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    item.day || "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.time || "—"
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        item.subject ||
                                        item.subjectName ||
                                        "—"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.className ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.room ||
                                    "—"
                                )}
                            </td>

                        </tr>

                    `
                )
                .join("")}

        </tbody>

    </table>

`;

}

/* =========================================================
KPIs
========================================================= */

function renderKPIs(
statistics
) {

if (!statistics) {

    return;

}


setText(
    "kpiStudents",
    statistics.assignedStudents ??
    "—"
);


setText(
    "kpiSubjects",
    statistics.subjects ??
    "—"
);


setText(
    "kpiClasses",
    statistics.classesThisWeek ??
    "—"
);


setText(
    "kpiAssignments",
    statistics.pendingAssignments ??
    "—"
);

}

/* =========================================================
ADDRESS
========================================================= */

function renderAddress(
address
) {

if (!address) {

    return;

}


setText(
    "addressLine1",
    address.line1 ||
    ""
);


setText(
    "addressLine2",
    address.line2 ||
    ""
);


setText(
    "cityState",
    [
        address.city,
        address.state
    ]
        .filter(Boolean)
        .join(", ")
);


setText(
    "pincode",
    address.pincode ||
    ""
);

}

/* =========================================================
EMPTY PROFILE
========================================================= */

function renderEmptyProfile() {

const ids = [

    "profileName",
    "profileDesignation",
    "profileDepartment",
    "employeeId",
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "mobileNumber",
    "emailId",
    "alternateContact",
    "bloodGroup",
    "professionalEmployeeId",
    "designation",
    "professionalDepartment",
    "facultyType",
    "joiningDate",
    "employmentStatus",
    "officeRoom",
    "institution",
    "kpiStudents",
    "kpiSubjects",
    "kpiClasses",
    "kpiAssignments"

];


ids.forEach(
    id => setText(id, "—")
);

}

/* =========================================================
PHOTO EDITOR
========================================================= */

function setupPhotoEditor() {

if (!DOM.photoInput) {

    return;

}


DOM.photoInput.addEventListener(
    "change",
    handlePhotoSelection
);


if (DOM.cancelPhoto) {

    DOM.cancelPhoto.addEventListener(
        "click",
        closePhotoModal
    );

}


if (DOM.savePhoto) {

    DOM.savePhoto.addEventListener(
        "click",
        saveSelectedPhoto
    );

}


if (DOM.photoModal) {

    DOM.photoModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                DOM.photoModal
            ) {

                closePhotoModal();

            }

        }
    );

}

}

function handlePhotoSelection(
event
) {

const file =
    event.target.files &&
    event.target.files[0];


if (!file) {

    return;

}


if (!file.type.startsWith("image/")) {

    DOM.photoInput.value = "";

    return;

}


facultyState.selectedPhotoFile =
    file;


const reader =
    new FileReader();


reader.onload =
    () => {

        DOM.photoPreview.src =
            reader.result;

        DOM.photoModal.hidden =
            false;

    };


reader.readAsDataURL(file);

}

function closePhotoModal() {

DOM.photoModal.hidden =
    true;

DOM.photoInput.value =
    "";

facultyState.selectedPhotoFile =
    null;

}

async function saveSelectedPhoto() {

const file =
    facultyState.selectedPhotoFile;


if (!file) {

    return;

}


/*
 * Immediately update the visual profile.
 * Backend upload happens when API_BASE_URL
 * is connected.
 */

const localPreview =
    URL.createObjectURL(file);


DOM.profilePhoto.src =
    localPreview;


if (CONFIG.API_BASE_URL) {

    try {

        const formData =
            new FormData();


        formData.append(
            "profileImage",
            file
        );


        const response =
            await fetch(
                CONFIG.API_BASE_URL +
                CONFIG.ENDPOINTS.PHOTO,
                {

                    method: "PUT",

                    body: formData,

                    credentials: "include"

                }
            );


        if (!response.ok) {

            throw new Error(
                "Photo upload failed"
            );

        }

    }

    catch (error) {

        console.error(
            "Profile photo update error:",
            error
        );

    }

}


closePhotoModal();

}

/* =========================================================
HEADER
========================================================= */

function setupHeader() {

if (DOM.backBtn) {

    DOM.backBtn.addEventListener(
        "click",
        () => {

            if (
                window.history.length > 1
            ) {

                window.history.back();

            }

        }
    );

}


if (DOM.refreshButton) {

    DOM.refreshButton.addEventListener(
        "click",
        () => {

            window.location.reload();

        }
    );

}


if (DOM.notificationButton) {

    DOM.notificationButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "notifications.html";

        }
    );

}

}

/* =========================================================
NOTIFICATIONS
========================================================= */

async function loadNotifications() {

if (!CONFIG.API_BASE_URL) {

    return;

}


try {

    const data =
        await apiRequest(
            CONFIG.ENDPOINTS.NOTIFICATIONS
        );


    if (!Array.isArray(data)) {

        return;

    }


    facultyState.notifications =
        data;


    const unread =
        data.filter(
            item =>
                item.read === false
        ).length;


    if (
        DOM.notificationCount &&
        unread > 0
    ) {

        DOM.notificationCount.textContent =
            unread;

        DOM.notificationCount.hidden =
            false;

    }

}

catch (error) {

    console.error(
        "Notification loading error:",
        error
    );

}

}

/* =========================================================
HELPERS
========================================================= */

function setText(
id,
value
) {

const element =
    document.getElementById(id);


if (!element) {

    return;

}


element.textContent =
    value ?? "—";

}

function escapeHTML(
value
) {

return String(
    value ?? ""
)
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