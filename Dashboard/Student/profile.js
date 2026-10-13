/* =========================================================
   CAMPUSCONNECT - PROFILE
   Dynamic / API-ready
========================================================= */


/* =========================================================
   STUDENT DATA
========================================================= */

const student = {
    firstName: "Student",
    lastName: "Name",
    rollNumber: "--------",
    registrationNumber: "--------",
    dateOfBirth: "--------",
    bloodGroup: "--------",
    mobileNumber: "--------",
    emailId: "--------",
    department: "Computer Science & Engineering",
    semester: "5th Semester"
};


/* =========================================================
   LOAD PROFILE (FIRESTORE PERSISTENT)
========================================================= */

function renderStudentFields(data) {
    if (!data) return;
    const fullName = data.fullName || (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : "Student Name");
    const parts = fullName.split(" ");
    const firstName = parts[0] || "Student";
    const lastName = parts.slice(1).join(" ") || "";

    const el = (id) => document.getElementById(id);
    if (el("firstName")) el("firstName").textContent = data.firstName || firstName;
    if (el("lastName")) el("lastName").textContent = data.lastName || lastName || "—";
    if (el("rollNumber")) el("rollNumber").textContent = data.rollNumber || "101";
    if (el("registrationNumber")) el("registrationNumber").textContent = data.registrationNumber || "GWPOLY-CS101";
    if (el("dateOfBirth")) el("dateOfBirth").textContent = data.dateOfBirth || "15/08/2004";
    if (el("bloodGroup")) el("bloodGroup").textContent = data.bloodGroup || "O+";
    if (el("mobileNumber")) el("mobileNumber").textContent = data.mobileNumber || data.mobile || "9876543210";
    if (el("emailId")) el("emailId").textContent = data.email || data.emailId || "student@gwpoly.ac.in";
    if (el("department")) el("department").textContent = data.department || data.branch || "Computer Science & Engineering";
    if (el("semester")) el("semester").textContent = data.semester || "5th Semester";
    if (el("profileName")) el("profileName").textContent = fullName;
    if (data.photoUrl && el("profilePhoto")) {
        el("profilePhoto").src = data.photoUrl;
    }
}

async function loadProfile() {
    // 1. Initial render from cached data or fallback to prevent blank state
    const cached = localStorage.getItem("studentData");
    if (cached) {
        try {
            renderStudentFields(JSON.parse(cached));
        } catch (e) {
            renderStudentFields(student);
        }
    } else {
        renderStudentFields(student);
    }

    // 2. Fetch live data from Cloud Firestore
    if (window.CampusConnectFirebase) {
        const { auth, db } = window.CampusConnectFirebase;

        const fetchLive = async (user) => {
            if (!user) return;
            try {
                const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js');
                const studentRef = doc(db, 'students', user.uid);
                const snap = await getDoc(studentRef);

                if (snap.exists()) {
                    const data = snap.data();
                    renderStudentFields(data);
                    localStorage.setItem("studentData", JSON.stringify(data));
                } else {
                    const sessionUser = sessionStorage.getItem("campusConnectUser");
                    let name = user.displayName || "Aarti Kumari";
                    let email = user.email || "student@gwpoly.ac.in";
                    let mobile = "9876543210";

                    if (sessionUser) {
                        try {
                            const u = JSON.parse(sessionUser);
                            if (u.name) name = u.name;
                            if (u.email) email = u.email;
                            if (u.mobile) mobile = u.mobile;
                        } catch (e) {}
                    }

                    const newProfile = {
                        uid: user.uid,
                        fullName: name,
                        rollNumber: "101",
                        registrationNumber: "GWPOLY-" + user.uid.slice(0, 6).toUpperCase(),
                        dateOfBirth: "15/08/2004",
                        bloodGroup: "O+",
                        mobileNumber: mobile,
                        email: email,
                        department: "Computer Science & Engineering",
                        semester: "5th Semester",
                        updatedAt: new Date().toISOString()
                    };

                    await setDoc(studentRef, newProfile);
                    renderStudentFields(newProfile);
                    localStorage.setItem("studentData", JSON.stringify(newProfile));
                }
            } catch (err) {
                console.warn("[CampusConnect] Firestore profile fetch:", err);
            }
        };

        if (auth.currentUser) {
            fetchLive(auth.currentUser);
        } else {
            auth.onAuthStateChanged((user) => {
                if (user) fetchLive(user);
            });
        }
    }
}


/* =========================================================
   PHOTO EDITOR ELEMENTS
========================================================= */

const photoInput = document.getElementById("photoInput");
const profilePhoto = document.getElementById("profilePhoto");

const photoEditor = document.getElementById("photoEditor");
const cropCanvas = document.getElementById("cropCanvas");
const cropArea = document.getElementById("cropArea");

const cancelCrop = document.getElementById("cancelCrop");
const doneCrop = document.getElementById("doneCrop");
const rotatePhoto = document.getElementById("rotatePhoto");


/* =========================================================
   PHOTO EDITOR VARIABLES
========================================================= */

const ctx = cropCanvas.getContext("2d");

let selectedImage = null;

let imageX = 0;
let imageY = 0;

let imageScale = 1;

let rotation = 0;

let startX = 0;
let startY = 0;

let startImageX = 0;
let startImageY = 0;

let isDragging = false;


/* =========================================================
   CROP SIZE
========================================================= */

function getCropSize() {

    return Math.min(
        window.innerWidth * 0.86,
        390
    );
}


/* =========================================================
   OPEN PHOTO EDITOR
========================================================= */

photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image file.");

        this.value = "";

        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        const image = new Image();

        image.onload = function () {

            selectedImage = image;

            rotation = 0;

            imageX = 0;
            imageY = 0;

            /*
             * Make the image large enough
             * to completely cover the crop square.
             */
            const cropSize = getCropSize();

            const imageRatio =
                Math.max(
                    cropSize / image.width,
                    cropSize / image.height
                );

            imageScale = imageRatio;

            setupCanvas();

            drawEditor();

            photoEditor.classList.add("open");

            document.body.style.overflow = "hidden";
        };

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);

});


/* =========================================================
   SETUP CANVAS
========================================================= */

function setupCanvas() {

    const cropSize = getCropSize();

    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;

    cropCanvas.style.width = cropSize + "px";
    cropCanvas.style.height = cropSize + "px";
}


/* =========================================================
   DRAW IMAGE
========================================================= */

function drawEditor() {

    if (!selectedImage) {
        return;
    }

    const size = cropCanvas.width;

    ctx.clearRect(0, 0, size, size);

    ctx.save();

    ctx.translate(
        size / 2 + imageX,
        size / 2 + imageY
    );

    ctx.rotate(
        rotation * Math.PI / 180
    );

    ctx.scale(
        imageScale,
        imageScale
    );

    ctx.drawImage(
        selectedImage,
        -selectedImage.width / 2,
        -selectedImage.height / 2
    );

    ctx.restore();
}


/* =========================================================
   DRAG PHOTO
========================================================= */

cropCanvas.addEventListener("pointerdown", function (event) {

    isDragging = true;

    startX = event.clientX;
    startY = event.clientY;

    startImageX = imageX;
    startImageY = imageY;

    cropCanvas.setPointerCapture(event.pointerId);
});


cropCanvas.addEventListener("pointermove", function (event) {

    if (!isDragging) {
        return;
    }

    const differenceX =
        event.clientX - startX;

    const differenceY =
        event.clientY - startY;

    imageX =
        startImageX + differenceX;

    imageY =
        startImageY + differenceY;

    drawEditor();
});


cropCanvas.addEventListener("pointerup", function () {

    isDragging = false;
});


cropCanvas.addEventListener("pointercancel", function () {

    isDragging = false;
});


/* =========================================================
   9-SIDE CROP ADJUSTMENT
========================================================= */

document.querySelectorAll(".crop-point").forEach(function (point) {

    point.addEventListener("click", function (event) {

        event.stopPropagation();

        const x = Number(this.dataset.x);
        const y = Number(this.dataset.y);

        const moveAmount = 25;

        imageX += x * moveAmount;
        imageY += y * moveAmount;

        drawEditor();
    });

});


/* =========================================================
   ROTATE
========================================================= */

rotatePhoto.addEventListener("click", function () {

    rotation += 90;

    if (rotation >= 360) {
        rotation = 0;
    }

    drawEditor();
});


/* =========================================================
   CANCEL
========================================================= */

cancelCrop.addEventListener("click", function () {

    closeEditor();

});


/* =========================================================
   DONE
========================================================= */

doneCrop.addEventListener("click", function () {

    if (!selectedImage) {
        closeEditor();
        return;
    }

    const outputCanvas = document.createElement("canvas");

    const outputSize = 600;

    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;

    const outputCtx =
        outputCanvas.getContext("2d");

    const cropSize = cropCanvas.width;

    /*
     * Convert editor coordinates
     * to final image coordinates.
     */
    const scaleMultiplier =
        outputSize / cropSize;

    outputCtx.save();

    outputCtx.translate(
        outputSize / 2 + imageX * scaleMultiplier,
        outputSize / 2 + imageY * scaleMultiplier
    );

    outputCtx.rotate(
        rotation * Math.PI / 180
    );

    outputCtx.scale(
        imageScale * scaleMultiplier,
        imageScale * scaleMultiplier
    );

    outputCtx.drawImage(
        selectedImage,
        -selectedImage.width / 2,
        -selectedImage.height / 2
    );

    outputCtx.restore();


    /*
     * Save the cropped image.
     */
    const photoDataUrl =
        outputCanvas.toDataURL(
            "image/jpeg",
            0.92
        );

    profilePhoto.src = photoDataUrl;

    // Persist to Cloud Firestore and local storage
    if (window.CampusConnectFirebase) {
        const { auth, db } = window.CampusConnectFirebase;
        if (auth.currentUser) {
            import('https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js').then(({ doc, updateDoc }) => {
                updateDoc(doc(db, "students", auth.currentUser.uid), {
                    photoUrl: photoDataUrl,
                    updatedAt: new Date().toISOString()
                }).then(() => {
                    console.info("[CampusConnect] Profile photo persisted to Cloud Firestore.");
                }).catch((err) => {
                    console.warn("[CampusConnect] Photo Firestore sync warning:", err);
                });
            });
        }
    }

    try {
        const cached = JSON.parse(localStorage.getItem("studentData") || "{}");
        cached.photoUrl = photoDataUrl;
        localStorage.setItem("studentData", JSON.stringify(cached));
    } catch (e) {}

    closeEditor();

});


/* =========================================================
   CLOSE EDITOR
========================================================= */

function closeEditor() {

    photoEditor.classList.remove("open");

    document.body.style.overflow = "";

    selectedImage = null;

    photoInput.value = "";
}


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener("resize", function () {

    if (!photoEditor.classList.contains("open")) {
        return;
    }

    setupCanvas();

    drawEditor();
});


/* =========================================================
   BACK BUTTON
========================================================= */

const backBtn = document.getElementById("backBtn");

if (backBtn) {

    backBtn.addEventListener("click", function () {

        if (window.history.length > 1) {

            window.history.back();

        } else {

            window.location.href =
                "student-dashboard.html";
        }

    });

}


/* =========================================================
   HOME BUTTON
========================================================= */

const homeButton =
    document.getElementById("homeButton");

if (homeButton) {

    homeButton.addEventListener("click", function () {

        window.location.href =
            "student-dashboard.html";

    });

}


/* =========================================================
   MODULES BUTTON
========================================================= */

const modulesButton =
    document.getElementById("modulesButton");

if (modulesButton) {

    modulesButton.addEventListener("click", function () {

        window.location.href =
            "modules.html";

    });

}


/* =========================================================
   INITIALIZE & INTERACTIVE EDITING
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfile();

        // Allow students to edit personal details and save to Firestore
        const editableFields = [
            { id: "mobileNumber", label: "Mobile Number", key: "mobileNumber" },
            { id: "bloodGroup", label: "Blood Group", key: "bloodGroup" },
            { id: "dateOfBirth", label: "Date of Birth", key: "dateOfBirth" }
        ];

        editableFields.forEach(function (field) {
            const el = document.getElementById(field.id);
            if (!el) return;

            el.style.cursor = "pointer";
            el.title = "Click to update " + field.label;

            el.addEventListener("click", async function () {
                const currentVal = el.textContent.trim();
                const newVal = prompt("Update your " + field.label + ":", currentVal === "—" ? "" : currentVal);

                if (newVal !== null && newVal.trim() !== "") {
                    const cleanVal = newVal.trim();
                    el.textContent = cleanVal;

                    // Update Cloud Firestore
                    if (window.CampusConnectFirebase) {
                        const { auth, db } = window.CampusConnectFirebase;
                        if (auth.currentUser) {
                            try {
                                const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js');
                                await updateDoc(doc(db, "students", auth.currentUser.uid), {
                                    [field.key]: cleanVal,
                                    updatedAt: new Date().toISOString()
                                });
                                console.info("[CampusConnect] " + field.label + " updated in Cloud Firestore.");
                            } catch (err) {
                                console.warn("[CampusConnect] Firestore field update error:", err);
                            }
                        }
                    }

                    // Update local cache
                    try {
                        const cached = JSON.parse(localStorage.getItem("studentData") || "{}");
                        cached[field.key] = cleanVal;
                        localStorage.setItem("studentData", JSON.stringify(cached));
                    } catch (e) {}
                }
            });
        });

    }
);