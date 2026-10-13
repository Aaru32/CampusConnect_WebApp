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
   LOAD PROFILE
========================================================= */

function loadProfile() {

    document.getElementById("firstName").textContent =
        student.firstName;

    document.getElementById("lastName").textContent =
        student.lastName;

    document.getElementById("rollNumber").textContent =
        student.rollNumber;

    document.getElementById("registrationNumber").textContent =
        student.registrationNumber;

    document.getElementById("dateOfBirth").textContent =
        student.dateOfBirth;

    document.getElementById("bloodGroup").textContent =
        student.bloodGroup;

    document.getElementById("mobileNumber").textContent =
        student.mobileNumber;

    document.getElementById("emailId").textContent =
        student.emailId;

    document.getElementById("department").textContent =
        student.department;

    document.getElementById("semester").textContent =
        student.semester;

    document.getElementById("profileName").textContent =
        student.firstName + " " + student.lastName;
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
    profilePhoto.src =
        outputCanvas.toDataURL(
            "image/jpeg",
            0.92
        );


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
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfile();

    }
);