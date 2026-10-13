/* =====================================================
   CAMPUSCONNECT - MY TASKS
   PERSONAL STUDENT TASK MANAGEMENT
   FRONTEND DEVELOPMENT VERSION
   API READY FOR FUTURE JAVA + MYSQL BACKEND
===================================================== */

"use strict";


/* =====================================================
   CONFIGURATION
===================================================== */

const CONFIG = {

    /*
     * Keep empty until Java backend is connected.
     *
     * Later:
     *
     * API_BASE_URL:
     * "http://localhost:7700/api"
     */

    API_BASE_URL: "",

    STORAGE_KEY:
        "campusconnect_student_tasks"

};


/* =====================================================
   APPLICATION STATE
===================================================== */

let tasks = [];

let feedbackTimeout = null;


/* =====================================================
   DOM ELEMENTS
===================================================== */

const taskModal =
    document.getElementById("taskModal");

const openTaskModal =
    document.getElementById("openTaskModal");

const closeTaskModal =
    document.getElementById("closeTaskModal");

const cancelTask =
    document.getElementById("cancelTask");

const taskForm =
    document.getElementById("taskForm");

const taskTitle =
    document.getElementById("taskTitle");

const taskDescription =
    document.getElementById("taskDescription");

const taskDueDate =
    document.getElementById("taskDueDate");

const taskReminder =
    document.getElementById("taskReminder");

const todayTaskList =
    document.getElementById("todayTaskList");

const weekTaskList =
    document.getElementById("weekTaskList");

const completedTaskList =
    document.getElementById("completedTaskList");

const todayTaskCount =
    document.getElementById("todayTaskCount");

const weekTaskCount =
    document.getElementById("weekTaskCount");

const completedTaskCount =
    document.getElementById("completedTaskCount");

const progressText =
    document.getElementById("progressText");

const progressPercentage =
    document.getElementById("progressPercentage");

const progressBar =
    document.getElementById("progressBar");

const backButton =
    document.getElementById("backButton");

const refreshButton =
    document.getElementById("refreshButton");

const taskFeedback =
    document.getElementById("taskFeedback");

const feedbackIcon =
    document.getElementById("feedbackIcon");

const feedbackTitle =
    document.getElementById("feedbackTitle");

const feedbackMessage =
    document.getElementById("feedbackMessage");

const closeFeedback =
    document.getElementById("closeFeedback");


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeTaskPage();

    }
);


/* =====================================================
   INITIALIZE
===================================================== */

function initializeTaskPage() {

    setMinimumDate();

    loadTasks();

    renderTasks();

    setupEventListeners();

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function setupEventListeners() {


    /* =============================================
       OPEN MODAL
    ============================================= */

    if (openTaskModal) {

        openTaskModal.addEventListener(
            "click",
            openModal
        );

    }


    /* =============================================
       CLOSE MODAL
    ============================================= */

    if (closeTaskModal) {

        closeTaskModal.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelTask) {

        cancelTask.addEventListener(
            "click",
            closeModal
        );

    }


    /* =============================================
       FORM
    ============================================= */

    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            handleTaskCreation
        );

    }


    /* =============================================
       BACK
    ============================================= */

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                if (window.history.length > 1) {

                    window.history.back();

                }

                else {

                    window.location.href =
                        "modules.html";

                }

            }
        );

    }


    /* =============================================
       REFRESH
    ============================================= */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                refreshButton
                    .querySelector("i")
                    ?.classList
                    .add("fa-spin");


                loadTasks();

                renderTasks();


                setTimeout(
                    function () {

                        refreshButton
                            .querySelector("i")
                            ?.classList
                            .remove("fa-spin");

                    },
                    500
                );

            }
        );

    }


    /* =============================================
       CLOSE FEEDBACK
    ============================================= */

    if (closeFeedback) {

        closeFeedback.addEventListener(
            "click",
            hideFeedback
        );

    }


    /* =============================================
       CLOSE MODAL BY OVERLAY
    ============================================= */

    if (taskModal) {

        taskModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    taskModal
                ) {

                    closeModal();

                }

            }
        );

    }


    /* =============================================
       ESCAPE KEY
    ============================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                taskModal.classList.contains("active")
            ) {

                closeModal();

            }

        }
    );

}


/* =====================================================
   SET MINIMUM DATE
===================================================== */

function setMinimumDate() {

    if (!taskDueDate) {

        return;

    }


    const today =
        getTodayDate();


    taskDueDate.min =
        today;


    taskDueDate.value =
        today;

}


/* =====================================================
   OPEN MODAL
===================================================== */

function openModal() {

    if (!taskModal) {

        return;

    }


    taskModal.classList.add("active");

    taskModal.setAttribute(
        "aria-hidden",
        "false"
    );


    setMinimumDate();


    setTimeout(
        function () {

            if (taskTitle) {

                taskTitle.focus();

            }

        },
        100
    );

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    if (!taskModal) {

        return;

    }


    taskModal.classList.remove("active");

    taskModal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (taskForm) {

        taskForm.reset();

    }


    setMinimumDate();

}


/* =====================================================
   CREATE TASK
===================================================== */

function handleTaskCreation(event) {

    event.preventDefault();


    const title =
        taskTitle.value.trim();


    const description =
        taskDescription.value.trim();


    const taskTypeElement =
        document.querySelector(
            'input[name="taskType"]:checked'
        );


    const taskType =
        taskTypeElement
            ? taskTypeElement.value
            : "today";


    const dueDate =
        taskDueDate.value ||
        getTodayDate();


    const reminder =
        taskReminder.checked;


    if (!title) {

        taskTitle.focus();

        return;

    }


    const newTask = {

        id:
            createTaskId(),

        title:
            title,

        description:
            description,

        type:
            taskType,

        dueDate:
            dueDate,

        reminder:
            reminder,

        status:
            "pending",

        createdAt:
            new Date().toISOString(),

        completedAt:
            null

    };


    tasks.push(newTask);


    saveTasks();


    renderTasks();


    closeModal();


    showFeedback(
        "Task created",
        "Your task has been added successfully.",
        "success"
    );

}


/* =====================================================
   TASK ID
===================================================== */

function createTaskId() {

    return (
        "task_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =====================================================
   LOAD TASKS
===================================================== */

function loadTasks() {

    /*
     * Frontend development storage only.
     *
     * This will later be replaced by:
     *
     * GET /student/tasks
     */

    try {

        const savedTasks =
            localStorage.getItem(
                CONFIG.STORAGE_KEY
            );


        if (!savedTasks) {

            tasks = [];

            return;

        }


        const parsedTasks =
            JSON.parse(savedTasks);


        if (Array.isArray(parsedTasks)) {

            tasks =
                parsedTasks;

        }

        else {

            tasks = [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load student tasks:",
            error
        );

        tasks = [];

    }

}


/* =====================================================
   SAVE TASKS
===================================================== */

function saveTasks() {

    /*
     * Temporary frontend persistence.
     *
     * Later this function will send data
     * to the Java REST API.
     */

    try {

        localStorage.setItem(
            CONFIG.STORAGE_KEY,
            JSON.stringify(tasks)
        );

    }

    catch (error) {

        console.error(
            "Unable to save student tasks:",
            error
        );

    }

}


/* =====================================================
   RENDER ALL TASKS
===================================================== */

function renderTasks() {

    if (
        !todayTaskList ||
        !weekTaskList ||
        !completedTaskList
    ) {

        return;

    }


    todayTaskList.innerHTML = "";

    weekTaskList.innerHTML = "";

    completedTaskList.innerHTML = "";


    const activeTasks =
        tasks.filter(
            function (task) {

                return (
                    task.status !==
                    "completed"
                );

            }
        );


    const todayTasks =
        activeTasks.filter(
            function (task) {

                return task.type === "today";

            }
        );


    const weeklyTasks =
        activeTasks.filter(
            function (task) {

                return task.type === "week";

            }
        );


    const completedTasks =
        tasks.filter(
            function (task) {

                return task.status ===
                    "completed";

            }
        );


    renderTaskGroup(
        todayTasks,
        todayTaskList,
        "today"
    );


    renderTaskGroup(
        weeklyTasks,
        weekTaskList,
        "week"
    );


    renderCompletedTasks(
        completedTasks
    );


    updateCounts(
        todayTasks,
        weeklyTasks,
        completedTasks
    );


    updateProgress();

}


/* =====================================================
   RENDER TASK GROUP
===================================================== */

function renderTaskGroup(
    taskArray,
    container,
    group
) {

    if (!taskArray.length) {

        container.innerHTML =
            createEmptyState(group);

        return;

    }


    sortTasks(taskArray);


    taskArray.forEach(
        function (task) {

            container.appendChild(
                createTaskCard(task)
            );

        }
    );

}


/* =====================================================
   RENDER COMPLETED
===================================================== */

function renderCompletedTasks(
    completedTasks
) {

    if (!completedTasks.length) {

        completedTaskList.innerHTML =
            createCompletedEmptyState();

        return;

    }


    completedTasks
        .slice()
        .sort(
            function (a, b) {

                return (
                    new Date(b.completedAt || 0) -
                    new Date(a.completedAt || 0)
                );

            }
        )
        .forEach(
            function (task) {

                completedTaskList.appendChild(
                    createTaskCard(task)
                );

            }
        );

}


/* =====================================================
   SORT TASKS
===================================================== */

function sortTasks(taskArray) {

    taskArray.sort(
        function (a, b) {

            const dateDifference =
                String(a.dueDate)
                .localeCompare(
                    String(b.dueDate)
                );


            if (dateDifference !== 0) {

                return dateDifference;

            }


            return (
                new Date(a.createdAt) -
                new Date(b.createdAt)
            );

        }
    );

}


/* =====================================================
   CREATE TASK CARD
===================================================== */

function createTaskCard(task) {

    const card =
        document.createElement("article");


    card.className =
        "task-card";


    if (
        task.status ===
        "completed"
    ) {

        card.classList.add(
            "completed"
        );

    }


    const overdue =
        isTaskOverdue(task);


    if (
        overdue &&
        task.status !== "completed"
    ) {

        card.classList.add(
            "overdue"
        );

    }


    const checkButton =
        document.createElement("button");


    checkButton.type =
        "button";


    checkButton.className =
        "task-check";


    checkButton.setAttribute(
        "aria-label",
        task.status === "completed"
            ? "Mark task as incomplete"
            : "Mark task as completed"
    );


    checkButton.innerHTML =
        '<i class="fa-solid fa-check"></i>';


    checkButton.addEventListener(
        "click",
        function () {

            toggleTaskCompletion(
                task.id
            );

        }
    );


    const content =
        document.createElement("div");


    content.className =
        "task-content";


    const title =
        document.createElement("div");


    title.className =
        "task-title";


    title.textContent =
        task.title;


    content.appendChild(
        title
    );


    if (task.description) {

        const description =
            document.createElement("div");


        description.className =
            "task-description";


        description.textContent =
            task.description;


        content.appendChild(
            description
        );

    }


    const meta =
        document.createElement("div");


    meta.className =
        "task-meta";


    const dateBadge =
        document.createElement("span");


    dateBadge.className =
        "task-badge";


    if (
        overdue &&
        task.status !== "completed"
    ) {

        dateBadge.classList.add(
            "overdue"
        );

    }


    dateBadge.innerHTML =
        '<i class="fa-regular fa-calendar"></i> ' +
        escapeHTML(
            formatTaskDate(task.dueDate)
        );


    meta.appendChild(
        dateBadge
    );


    if (
        task.status ===
        "completed"
    ) {

        const completedBadge =
            document.createElement("span");


        completedBadge.className =
            "task-badge completed-badge";


        completedBadge.innerHTML =
            '<i class="fa-solid fa-check"></i> Completed';


        meta.appendChild(
            completedBadge
        );

    }


    if (
        task.reminder &&
        task.status !== "completed"
    ) {

        const reminderBadge =
            document.createElement("span");


        reminderBadge.className =
            "task-badge";


        reminderBadge.innerHTML =
            '<i class="fa-regular fa-bell"></i> Reminder';


        meta.appendChild(
            reminderBadge
        );

    }


    content.appendChild(
        meta
    );


    const actions =
        document.createElement("div");


    actions.className =
        "task-actions";


    if (
        task.status !== "completed"
    ) {

        const incompleteButton =
            document.createElement("button");


        incompleteButton.type =
            "button";


        incompleteButton.className =
            "task-action";


        incompleteButton.title =
            "Mark as not completed";


        incompleteButton.setAttribute(
            "aria-label",
            "Mark task as not completed"
        );


        incompleteButton.innerHTML =
            '<i class="fa-solid fa-xmark"></i>';


        incompleteButton.addEventListener(
            "click",
            function () {

                markTaskIncomplete(
                    task.id
                );

            }
        );


        actions.appendChild(
            incompleteButton
        );

    }


    const deleteButton =
        document.createElement("button");


    deleteButton.type =
        "button";


    deleteButton.className =
        "task-action delete";


    deleteButton.title =
        "Delete task";


    deleteButton.setAttribute(
        "aria-label",
        "Delete task"
    );


    deleteButton.innerHTML =
        '<i class="fa-solid fa-trash"></i>';


    deleteButton.addEventListener(
        "click",
        function () {

            deleteTask(
                task.id
            );

        }
    );


    actions.appendChild(
        deleteButton
    );


    card.appendChild(
        checkButton
    );


    card.appendChild(
        content
    );


    card.appendChild(
        actions
    );


    return card;

}


/* =====================================================
   TOGGLE COMPLETION
===================================================== */

function toggleTaskCompletion(
    taskId
) {

    const task =
        tasks.find(
            function (item) {

                return item.id === taskId;

            }
        );


    if (!task) {

        return;

    }


    if (
        task.status ===
        "completed"
    ) {

        markTaskIncomplete(
            taskId
        );

        return;

    }


    task.status =
        "completed";


    task.completedAt =
        new Date().toISOString();


    saveTasks();


    renderTasks();


    showFeedback(
        "Well done!",
        getMotivationalMessage(),
        "success"
    );


    /*
     * Later:
     *
     * POST /student/tasks/{id}/complete
     *
     * The backend will persist the completion.
     */

}


/* =====================================================
   MARK INCOMPLETE
===================================================== */

function markTaskIncomplete(
    taskId
) {

    const task =
        tasks.find(
            function (item) {

                return item.id === taskId;

            }
        );


    if (!task) {

        return;

    }


    task.status =
        "pending";


    task.completedAt =
        null;


    saveTasks();


    renderTasks();


    showFeedback(
        "Keep going",
        getSupportiveMessage(),
        "support"
    );


    /*
     * Later:
     *
     * POST /student/tasks/{id}/incomplete
     */

}


/* =====================================================
   DELETE TASK
===================================================== */

function deleteTask(
    taskId
) {

    const task =
        tasks.find(
            function (item) {

                return item.id === taskId;

            }
        );


    if (!task) {

        return;

    }


    const shouldDelete =
        window.confirm(
            "Are you sure you want to delete this task?"
        );


    if (!shouldDelete) {

        return;

    }


    tasks =
        tasks.filter(
            function (item) {

                return item.id !== taskId;

            }
        );


    saveTasks();


    renderTasks();


    showFeedback(
        "Task removed",
        "The task has been removed from your list.",
        "info"
    );

}


/* =====================================================
   UPDATE COUNTS
===================================================== */

function updateCounts(
    todayTasks,
    weeklyTasks,
    completedTasks
) {

    if (todayTaskCount) {

        todayTaskCount.textContent =
            todayTasks.length;

    }


    if (weekTaskCount) {

        weekTaskCount.textContent =
            weeklyTasks.length;

    }


    if (completedTaskCount) {

        completedTaskCount.textContent =
            completedTasks.length;

    }

}


/* =====================================================
   UPDATE PROGRESS
===================================================== */

function updateProgress() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.status ===
                    "completed";

            }
        ).length;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    if (progressText) {

        progressText.textContent =
            completed +
            " of " +
            total +
            " completed";

    }


    if (progressPercentage) {

        progressPercentage.textContent =
            percentage +
            "%";

    }


    if (progressBar) {

        progressBar.style.width =
            percentage +
            "%";

    }

}


/* =====================================================
   EMPTY STATE
===================================================== */

function createEmptyState(
    group
) {

    let title =
        "No tasks for today";


    let message =
        "Create a task to start organizing your day.";


    let icon =
        "fa-sun";


    if (group === "week") {

        title =
            "No weekly tasks";

        message =
            "Create a task for this week and keep your plans organized.";

        icon =
            "fa-calendar-week";

    }


    return `

        <div class="empty-state">

            <div class="empty-icon">

                <i class="fa-solid ${icon}"></i>

            </div>

            <h3>
                ${title}
            </h3>

            <p>
                ${message}
            </p>

        </div>

    `;

}


/* =====================================================
   COMPLETED EMPTY STATE
===================================================== */

function createCompletedEmptyState() {

    return `

        <div class="empty-state">

            <div class="empty-icon">

                <i class="fa-solid fa-check"></i>

            </div>

            <h3>
                No completed tasks yet
            </h3>

            <p>
                Completed tasks will appear here
                once you finish them.
            </p>

        </div>

    `;

}


/* =====================================================
   TASK OVERDUE
===================================================== */

function isTaskOverdue(
    task
) {

    if (
        !task.dueDate ||
        task.status === "completed"
    ) {

        return false;

    }


    return (
        task.dueDate <
        getTodayDate()
    );

}


/* =====================================================
   FORMAT TASK DATE
===================================================== */

function formatTaskDate(
    dateString
) {

    if (!dateString) {

        return "No due date";

    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   TODAY DATE
===================================================== */

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* =====================================================
   MOTIVATIONAL MESSAGE
===================================================== */

function getMotivationalMessage() {

    const messages = [

        "Great work! One more task completed. Keep moving forward.",

        "Well done! Small completed tasks build meaningful progress.",

        "Excellent! You followed through on your plan. Keep going.",

        "Nice work! Your consistency is building momentum.",

        "Task completed! Keep taking your progress one step at a time."

    ];


    return messages[
        Math.floor(
            Math.random() *
            messages.length
        )
    ];

}


/* =====================================================
   SUPPORTIVE MESSAGE
===================================================== */

function getSupportiveMessage() {

    const messages = [

        "That’s okay. You can try again and continue at your own pace.",

        "No worries. One unfinished task does not define your progress.",

        "You still have another opportunity to complete it. Keep going.",

        "Plans can change. Take another look when you are ready.",

        "Keep moving forward. You can return to this task when you have time."

    ];


    return messages[
        Math.floor(
            Math.random() *
            messages.length
        )
    ];

}


/* =====================================================
   SHOW FEEDBACK
===================================================== */

function showFeedback(
    title,
    message,
    type
) {

    if (!taskFeedback) {

        return;

    }


    if (feedbackTimeout) {

        clearTimeout(
            feedbackTimeout
        );

    }


    feedbackTitle.textContent =
        title;


    feedbackMessage.textContent =
        message;


    feedbackIcon.innerHTML =
        getFeedbackIcon(type);


    taskFeedback.classList.add(
        "show"
    );


    feedbackTimeout =
        setTimeout(
            hideFeedback,
            5000
        );

}


/* =====================================================
   FEEDBACK ICON
===================================================== */

function getFeedbackIcon(
    type
) {

    if (type === "support") {

        return `
            <i class="fa-solid fa-hand-holding-heart"></i>
        `;

    }


    if (type === "info") {

        return `
            <i class="fa-solid fa-circle-info"></i>
        `;

    }


    return `
        <i class="fa-solid fa-check"></i>
    `;

}


/* =====================================================
   HIDE FEEDBACK
===================================================== */

function hideFeedback() {

    if (!taskFeedback) {

        return;

    }


    taskFeedback.classList.remove(
        "show"
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   GLOBAL NOTIFICATION CONNECTION
===================================================== */

/*
 * IMPORTANT:
 *
 * This page does NOT create another notification bell.
 *
 * The existing CampusConnect global notification system
 * remains responsible for the global notification UI.
 *
 * The task reminder backend can later create notifications
 * through the same global notification system.
 *
 * Example future notification:
 *
 * "Did you complete your task?"
 *
 * [Completed] [Not Completed]
 *
 * These actions can call:
 *
 * POST /student/tasks/{id}/complete
 * POST /student/tasks/{id}/incomplete
 *
 */


/* =====================================================
   FUTURE API STRUCTURE
===================================================== */

/*
 * Future Java + MySQL integration:
 *
 * GET
 * /student/tasks
 *
 * POST
 * /student/tasks
 *
 * PUT
 * /student/tasks/{id}
 *
 * DELETE
 * /student/tasks/{id}
 *
 * POST
 * /student/tasks/{id}/complete
 *
 * POST
 * /student/tasks/{id}/incomplete
 *
 *
 * The current localStorage implementation is only
 * frontend persistence while the backend is unavailable.
 */