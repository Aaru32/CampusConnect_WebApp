/* =========================================================
   CAMPUSCONNECT - HOME PAGE JAVASCRIPT
   PUBLIC / API-READY / SECURITY-CONSCIOUS
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = Object.freeze({

    /*
     * Empty while backend is not connected.
     *
     * Future example:
     * API_BASE_URL: "https://your-domain.example/api"
     *
     * Never put:
     * - database credentials
     * - API secret keys
     * - passwords
     * - private signing keys
     * here.
     */

    API_BASE_URL: "",

    LOGIN_PAGE: "login.html",
    REGISTER_PAGE: "register.html",

    AUTO_SLIDE_TIME: 4000,
    API_TIMEOUT: 8000,

    ENDPOINTS: Object.freeze({

        HOME: "/public/home",

        NOTICES: "/public/notices",
        NEWS: "/public/news",
        EVENTS: "/public/events",

        DEPARTMENTS: "/public/departments",
        COURSES: "/public/courses",
        EXAMINATIONS: "/public/examinations",
        LEARNING: "/public/learning",

        RESEARCH: "/public/research",

        GALLERY: "/public/gallery",
        FAQS: "/public/faqs"

    })

});


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* =========================================================
   APPLICATION STATE
========================================================= */

const STATE = {

    notices: [],
    news: [],
    events: [],
    departments: [],
    courses: [],
    examinations: [],
    learning: [],
    research: [],
    gallery: [],
    faqs: [],

    lastFocusedElement: null

};


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();

    initializeHeroSlider();

    initializeSearch();

    initializeFAQ();

    initializeGallery();

    initializeButtons();

    initializeModal();

    initializeScrollSpy();

    initializeYear();

    initializeImageFallbacks();

    loadPublicContent();

});


/* =========================================================
   API LAYER
========================================================= */

/*
 * Builds an API URL safely.
 */

function buildApiUrl(endpoint) {

    if (!CONFIG.API_BASE_URL) {
        return null;
    }

    const base =
        CONFIG.API_BASE_URL.replace(/\/+$/, "");

    const path =
        String(endpoint || "").startsWith("/")
            ? endpoint
            : `/${endpoint}`;

    return `${base}${path}`;

}


/*
 * Public API request.
 *
 * Only GET requests are used by this public page.
 *
 * credentials: "include" allows a future backend to use
 * secure HttpOnly cookies without exposing authentication
 * tokens to JavaScript.
 */

async function apiGet(endpoint, options = {}) {

    const url =
        buildApiUrl(endpoint);

    if (!url) {

        return {
            configured: false,
            data: null
        };

    }


    const controller =
        new AbortController();

    const timeoutId =
        setTimeout(
            () => controller.abort(),
            CONFIG.API_TIMEOUT
        );


    try {

        const response =
            await fetch(url, {

                method: "GET",

                credentials: "include",

                headers: {
                    "Accept": "application/json"
                },

                signal: controller.signal,

                cache: "no-store",

                ...options

            });


        if (!response.ok) {

            throw new Error(
                `API request failed with status ${response.status}`
            );

        }


        const contentType =
            response.headers.get("content-type") || "";


        if (!contentType.includes("application/json")) {

            throw new Error(
                "The server returned an unexpected response format."
            );

        }


        const data =
            await response.json();


        return {
            configured: true,
            data
        };

    } catch (error) {

        console.error(
            "CampusConnect public API error:",
            error
        );

        return {
            configured: true,
            data: null,
            error
        };

    } finally {

        clearTimeout(timeoutId);

    }

}


/* =========================================================
   NORMALIZE API COLLECTIONS
========================================================= */

function normalizeCollection(payload) {

    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== "object") {
        return [];
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    if (Array.isArray(payload.content)) {
        return payload.content;
    }

    if (Array.isArray(payload.items)) {
        return payload.items;
    }

    if (Array.isArray(payload.results)) {
        return payload.results;
    }

    return [];

}


/* =========================================================
   LOAD PUBLIC CONTENT
========================================================= */

async function loadPublicContent() {

    /*
     * Backend is intentionally not connected yet.
     *
     * Therefore the page remains in a truthful empty state.
     */

    if (!CONFIG.API_BASE_URL) {

        renderAllEmptyStates();

        return;

    }


    await Promise.allSettled([

        loadNotices(),
        loadNews(),
        loadEvents(),
        loadDepartments(),
        loadCourses(),
        loadExaminations(),
        loadLearning(),
        loadResearch(),
        loadGallery(),
        loadFAQs()

    ]);

}


/* =========================================================
   NOTICES API
========================================================= */

async function loadNotices() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.NOTICES
        );


    if (!result.configured) {
        return;
    }


    if (result.error) {

        renderApiError(
            $("#noticeList"),
            "Notices could not be loaded."
        );

        return;

    }


    STATE.notices =
        normalizeCollection(result.data);


    renderNotices();

}


/* =========================================================
   NEWS API
========================================================= */

async function loadNews() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.NEWS
        );


    if (!result.configured) {
        return;
    }


    if (result.error) {

        renderApiError(
            $("#newsGrid"),
            "News could not be loaded."
        );

        return;

    }


    STATE.news =
        normalizeCollection(result.data);


    renderNews();

}


/* =========================================================
   EVENTS API
========================================================= */

async function loadEvents() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.EVENTS
        );


    if (!result.configured) {
        return;
    }


    if (result.error) {

        renderApiError(
            $("#eventList"),
            "Events could not be loaded."
        );

        return;

    }


    STATE.events =
        normalizeCollection(result.data);


    renderEvents();

}


/* =========================================================
   ACADEMIC API
========================================================= */

async function loadDepartments() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.DEPARTMENTS
        );

    if (!result.configured || result.error) {
        return;
    }

    STATE.departments =
        normalizeCollection(result.data);

}


async function loadCourses() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.COURSES
        );

    if (!result.configured || result.error) {
        return;
    }

    STATE.courses =
        normalizeCollection(result.data);

}


async function loadExaminations() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.EXAMINATIONS
        );

    if (!result.configured || result.error) {
        return;
    }

    STATE.examinations =
        normalizeCollection(result.data);

}


async function loadLearning() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.LEARNING
        );

    if (!result.configured || result.error) {
        return;
    }

    STATE.learning =
        normalizeCollection(result.data);

}


/* =========================================================
   RESEARCH API
========================================================= */

async function loadResearch() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.RESEARCH
        );


    if (!result.configured || result.error) {
        return;
    }


    STATE.research =
        normalizeCollection(result.data);

}


/* =========================================================
   GALLERY API
========================================================= */

async function loadGallery() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.GALLERY
        );


    if (!result.configured || result.error) {
        return;
    }


    STATE.gallery =
        normalizeCollection(result.data);


    if (STATE.gallery.length) {

        renderGallery();

    }

}


/* =========================================================
   FAQ API
========================================================= */

async function loadFAQs() {

    const result =
        await apiGet(
            CONFIG.ENDPOINTS.FAQS
        );


    if (!result.configured || result.error) {
        return;
    }


    STATE.faqs =
        normalizeCollection(result.data);


    if (STATE.faqs.length) {

        renderFAQs();

    }

}


/* =========================================================
   EMPTY STATES
========================================================= */

function renderAllEmptyStates() {

    renderNotices();
    renderNews();
    renderEvents();

}


function createEmptyState(
    icon,
    title,
    description
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "empty-state";


    const iconElement =
        document.createElement("i");

    iconElement.className =
        icon;


    const heading =
        document.createElement("h3");

    heading.textContent =
        title;


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        description;


    wrapper.append(
        iconElement,
        heading,
        paragraph
    );


    return wrapper;

}


/* =========================================================
   API ERROR STATE
========================================================= */

function renderApiError(container, message) {

    if (!container) {
        return;
    }


    container.replaceChildren();


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "api-error";


    const icon =
        document.createElement("i");

    icon.className =
        "fa-solid fa-triangle-exclamation";


    const text =
        document.createElement("span");

    text.textContent =
        message;


    wrapper.append(
        icon,
        text
    );


    container.appendChild(wrapper);

}


/* =========================================================
   NOTICES RENDERING
========================================================= */

function renderNotices() {

    const container =
        $("#noticeList");

    if (!container) {
        return;
    }


    container.replaceChildren();


    if (!STATE.notices.length) {

        container.appendChild(
            createEmptyState(
                "fa-regular fa-folder-open",
                "No notices available",
                "New public institutional notices will appear here when published."
            )
        );

        updateNoticeFeature(null);

        return;

    }


    STATE.notices
        .slice(0, 5)
        .forEach(notice => {

            const item =
                document.createElement("button");

            item.type =
                "button";

            item.className =
                "notice-item";


            const title =
                document.createElement("h3");

            title.textContent =
                getText(
                    notice,
                    ["title", "name", "heading"],
                    "Institutional Notice"
                );


            const description =
                document.createElement("p");

            description.textContent =
                truncate(
                    getText(
                        notice,
                        ["summary", "description", "content"],
                        "Open this notice for more information."
                    ),
                    150
                );


            const meta =
                document.createElement("div");

            meta.className =
                "notice-meta";


            const icon =
                document.createElement("i");

            icon.className =
                "fa-regular fa-calendar";


            const date =
                document.createElement("span");

            date.textContent =
                formatDate(
                    getValue(
                        notice,
                        ["publishedAt", "date", "createdAt"]
                    )
                );


            meta.append(icon, date);

            item.append(
                title,
                description,
                meta
            );


            item.addEventListener(
                "click",
                () => {

                    showRecordModal(
                        "Notice",
                        notice
                    );

                }
            );


            container.appendChild(item);

        });


    updateNoticeFeature(
        STATE.notices[0]
    );

}


/* =========================================================
   NOTICE FEATURE
========================================================= */

function updateNoticeFeature(notice) {

    const title =
        $("#noticeFeatureTitle");

    const description =
        $("#noticeFeatureDescription");

    const status =
        $("#noticeFeatureStatus");


    if (!title || !description || !status) {
        return;
    }


    if (!notice) {

        title.textContent =
            "Institutional announcements will appear here.";

        description.textContent =
            "Public notices published by the institution can be displayed automatically through the CampusConnect public API.";

        status.replaceChildren();

        const icon =
            document.createElement("i");

        icon.className =
            "fa-regular fa-bell-slash";

        const text =
            document.createElement("span");

        text.textContent =
            "No active notices available.";

        status.append(icon, text);

        return;

    }


    title.textContent =
        getText(
            notice,
            ["title", "name", "heading"],
            "Institutional Notice"
        );


    description.textContent =
        truncate(
            getText(
                notice,
                ["summary", "description", "content"],
                "Open the notice for more information."
            ),
            220
        );


    status.replaceChildren();

    const icon =
        document.createElement("i");

    icon.className =
        "fa-solid fa-circle-check";


    const text =
        document.createElement("span");

    text.textContent =
        "Latest public notice available.";


    status.append(icon, text);

}


/* =========================================================
   NEWS RENDERING
========================================================= */

function renderNews() {

    const container =
        $("#newsGrid");

    if (!container) {
        return;
    }


    container.replaceChildren();


    if (!STATE.news.length) {

        container.appendChild(
            createEmptyState(
                "fa-regular fa-newspaper",
                "No news available",
                "Published campus news will appear here."
            )
        );

        return;

    }


    STATE.news
        .slice(0, 6)
        .forEach(news => {

            container.appendChild(
                createNewsCard(news)
            );

        });

}


function createNewsCard(news) {

    const article =
        document.createElement("article");

    article.className =
        "news-card";


    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "news-image";


    const image =
        document.createElement("img");


    const imageUrl =
        getSafeImageUrl(
            getValue(
                news,
                ["imageUrl", "image", "thumbnail"]
            )
        );


    if (imageUrl) {

        image.src =
            imageUrl;

    }


    image.alt =
        getText(
            news,
            ["title", "name"],
            "Campus news"
        );


    image.addEventListener(
        "error",
        () => {

            image.style.display =
                "none";

        }
    );


    const category =
        document.createElement("span");

    category.className =
        "news-category";

    category.textContent =
        getText(
            news,
            ["category", "type"],
            "CAMPUS"
        );


    imageWrapper.append(
        image,
        category
    );


    const body =
        document.createElement("div");

    body.className =
        "news-body";


    const date =
        document.createElement("span");

    date.className =
        "news-date";


    const dateIcon =
        document.createElement("i");

    dateIcon.className =
        "fa-regular fa-calendar";


    const dateText =
        document.createElement("span");

    dateText.textContent =
        formatDate(
            getValue(
                news,
                ["publishedAt", "date", "createdAt"]
            )
        );


    date.append(
        dateIcon,
        dateText
    );


    const title =
        document.createElement("h3");

    title.textContent =
        getText(
            news,
            ["title", "name", "heading"],
            "Campus News"
        );


    const description =
        document.createElement("p");

    description.textContent =
        truncate(
            getText(
                news,
                ["summary", "description", "content"],
                "Open this news item for more information."
            ),
            160
        );


    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "read-more-btn";

    button.textContent =
        "Read More";


    const arrow =
        document.createElement("i");

    arrow.className =
        "fa-solid fa-arrow-right";


    button.appendChild(arrow);


    button.addEventListener(
        "click",
        () => {

            showRecordModal(
                "News",
                news
            );

        }
    );


    body.append(
        date,
        title,
        description,
        button
    );


    article.append(
        imageWrapper,
        body
    );


    return article;

}


/* =========================================================
   EVENTS RENDERING
========================================================= */

function renderEvents() {

    const container =
        $("#eventList");

    if (!container) {
        return;
    }


    container.replaceChildren();


    if (!STATE.events.length) {

        container.appendChild(
            createEmptyState(
                "fa-regular fa-calendar-xmark",
                "No upcoming events",
                "Upcoming public campus events will appear here when published."
            )
        );

        return;

    }


    STATE.events
        .slice(0, 6)
        .forEach(eventRecord => {

            const item =
                document.createElement("button");

            item.type =
                "button";

            item.className =
                "event-item";


            const title =
                document.createElement("h3");

            title.textContent =
                getText(
                    eventRecord,
                    ["title", "name", "heading"],
                    "Campus Event"
                );


            const description =
                document.createElement("p");

            description.textContent =
                truncate(
                    getText(
                        eventRecord,
                        ["summary", "description", "content"],
                        "Open this event for more information."
                    ),
                    160
                );


            const meta =
                document.createElement("div");

            meta.className =
                "event-meta";


            const date =
                document.createElement("span");

            date.textContent =
                formatDate(
                    getValue(
                        eventRecord,
                        ["startDate", "date", "eventDate"]
                    )
                );


            const location =
                document.createElement("span");

            const locationValue =
                getValue(
                    eventRecord,
                    ["location", "venue"]
                );


            if (locationValue) {

                location.textContent =
                    String(locationValue);

            }


            meta.appendChild(date);

            if (locationValue) {
                meta.appendChild(location);
            }


            item.append(
                title,
                description,
                meta
            );


            item.addEventListener(
                "click",
                () => {

                    showRecordModal(
                        "Campus Event",
                        eventRecord
                    );

                }
            );


            container.appendChild(item);

        });

}


/* =========================================================
   GALLERY RENDERING
========================================================= */

function renderGallery() {

    const container =
        $("#galleryGrid");

    if (!container || !STATE.gallery.length) {
        return;
    }


    container.replaceChildren();


    STATE.gallery
        .slice(0, 3)
        .forEach(
            (item, index) => {

                const button =
                    document.createElement("button");

                button.type =
                    "button";

                button.className =
                    index === 0
                        ? "gallery-item large"
                        : "gallery-item";


                const image =
                    document.createElement("img");


                const imageUrl =
                    getSafeImageUrl(
                        getValue(
                            item,
                            ["imageUrl", "image", "url"]
                        )
                    );


                if (!imageUrl) {
                    return;
                }


                image.src =
                    imageUrl;


                image.alt =
                    getText(
                        item,
                        ["title", "name", "caption"],
                        "Campus gallery"
                    );


                const label =
                    document.createElement("span");

                label.textContent =
                    getText(
                        item,
                        ["title", "name", "caption"],
                        "Campus Gallery"
                    );


                const icon =
                    document.createElement("i");

                icon.className =
                    "fa-solid fa-expand";


                label.appendChild(icon);

                button.append(
                    image,
                    label
                );


                button.addEventListener(
                    "click",
                    () => {

                        openGalleryModal(
                            imageUrl,
                            label.textContent
                        );

                    }
                );


                container.appendChild(button);

            }
        );

}


/* =========================================================
   FAQ RENDERING
========================================================= */

function renderFAQs() {

    const container =
        $("#faqList");

    if (!container || !STATE.faqs.length) {
        return;
    }


    container.replaceChildren();


    STATE.faqs
        .slice(0, 10)
        .forEach(faq => {

            const item =
                document.createElement("div");

            item.className =
                "faq-item";


            const question =
                document.createElement("button");

            question.type =
                "button";

            question.className =
                "faq-question";

            question.setAttribute(
                "aria-expanded",
                "false"
            );


            const questionText =
                document.createElement("span");

            questionText.textContent =
                getText(
                    faq,
                    ["question", "title"],
                    "Frequently Asked Question"
                );


            const icon =
                document.createElement("i");

            icon.className =
                "fa-solid fa-plus";


            question.append(
                questionText,
                icon
            );


            const answer =
                document.createElement("div");

            answer.className =
                "faq-answer";


            const answerText =
                document.createElement("p");

            answerText.textContent =
                getText(
                    faq,
                    ["answer", "description", "content"],
                    "Information is currently unavailable."
                );


            answer.appendChild(answerText);

            item.append(
                question,
                answer
            );

            container.appendChild(item);

        });


    initializeFAQ();

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const mobileMenuButton =
        $("#mobileMenuButton");

    const mobileNav =
        $("#mobileNav");


    mobileMenuButton?.addEventListener(
        "click",
        () => {

            const open =
                mobileNav.classList.toggle("open");


            mobileMenuButton.setAttribute(
                "aria-expanded",
                String(open)
            );


            const icon =
                mobileMenuButton.querySelector("i");


            if (icon) {

                icon.className =
                    open
                        ? "fa-solid fa-xmark"
                        : "fa-solid fa-bars";

            }

        }
    );


    $$(".mobile-nav a").forEach(link => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    });


    $$("[data-scroll]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                scrollToSection(
                    button.dataset.scroll
                );

            }
        );

    });


    $(".brand")?.addEventListener(
        "click",
        event => {

            if (
                event.currentTarget.getAttribute("href")
                === "#home"
            ) {

                event.preventDefault();

                scrollToSection("#home");

            }

        }
    );

}


function closeMobileMenu() {

    const mobileNav =
        $("#mobileNav");

    const mobileMenuButton =
        $("#mobileMenuButton");


    mobileNav?.classList.remove("open");

    mobileMenuButton?.setAttribute(
        "aria-expanded",
        "false"
    );


    const icon =
        mobileMenuButton?.querySelector("i");


    if (icon) {

        icon.className =
            "fa-solid fa-bars";

    }

}


function scrollToSection(selector) {

    if (!selector) {
        return;
    }


    const target =
        document.querySelector(selector);


    if (!target) {
        return;
    }


    closeMobileMenu();


    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   LOGIN / REGISTER
========================================================= */

function openLogin() {

    window.location.assign(
        CONFIG.LOGIN_PAGE
    );

}


function openRegister() {

    window.location.assign(
        CONFIG.REGISTER_PAGE
    );

}


function initializeLoginButtons() {

    [
        "#topLoginButton",
        "#headerLoginButton",
        "#heroLoginButton",
        "#mobileLoginButton",
        "#contactLoginButton",
        "#footerLoginButton"
    ].forEach(selector => {

        $(selector)?.addEventListener(
            "click",
            openLogin
        );

    });


    $("#footerRegisterButton")
        ?.addEventListener(
            "click",
            openRegister
        );

}


/* =========================================================
   HERO SLIDER
========================================================= */

function initializeHeroSlider() {

    const slides =
        $$(".hero-slide");

    const dots =
        $$(".hero-dot");

    const previousButton =
        $("#heroPrev");

    const nextButton =
        $("#heroNext");

    const hero =
        $(".hero");


    if (!slides.length) {
        return;
    }


    let currentSlide = 0;

    let autoSlideTimer;


    function showSlide(index) {

        if (index < 0) {
            index = slides.length - 1;
        }

        if (index >= slides.length) {
            index = 0;
        }


        slides.forEach(
            (slide, slideIndex) => {

                slide.classList.toggle(
                    "active",
                    slideIndex === index
                );

            }
        );


        dots.forEach(
            (dot, dotIndex) => {

                dot.classList.toggle(
                    "active",
                    dotIndex === index
                );

            }
        );


        currentSlide =
            index;

    }


    function startAutoSlide() {

        clearInterval(
            autoSlideTimer
        );


        autoSlideTimer =
            setInterval(
                () => {

                    showSlide(
                        currentSlide + 1
                    );

                },
                CONFIG.AUTO_SLIDE_TIME
            );

    }


    nextButton?.addEventListener(
        "click",
        () => {

            showSlide(
                currentSlide + 1
            );

            startAutoSlide();

        }
    );


    previousButton?.addEventListener(
        "click",
        () => {

            showSlide(
                currentSlide - 1
            );

            startAutoSlide();

        }
    );


    dots.forEach(
        (dot, index) => {

            dot.addEventListener(
                "click",
                () => {

                    showSlide(index);

                    startAutoSlide();

                }
            );

        }
    );


    hero?.addEventListener(
        "mouseenter",
        () => {

            clearInterval(
                autoSlideTimer
            );

        }
    );


    hero?.addEventListener(
        "mouseleave",
        startAutoSlide
    );


    showSlide(0);

    startAutoSlide();

}


/* =========================================================
   SEARCH
========================================================= */

const searchableSections = [

    {
        title: "About CampusConnect",
        description:
            "Learn about the CampusConnect digital campus platform.",
        target: "#about"
    },

    {
        title: "Academic Units",
        description:
            "Departments, courses, examinations and digital learning.",
        target: "#academics"
    },

    {
        title: "Important Notices",
        description:
            "Institutional announcements and notices.",
        target: "#notices"
    },

    {
        title: "Latest News",
        description:
            "Campus, academic and student news.",
        target: "#news"
    },

    {
        title: "Upcoming Events",
        description:
            "Campus events, seminars and activities.",
        target: "#events"
    },

    {
        title: "Research and Innovation",
        description:
            "Projects, innovation and technology.",
        target: "#research"
    },

    {
        title: "Campus Services",
        description:
            "Library, attendance, results, hostel, fees and more.",
        target: "#services"
    },

    {
        title: "Photo Gallery",
        description:
            "Campus life and activities.",
        target: "#gallery"
    },

    {
        title: "Frequently Asked Questions",
        description:
            "Common CampusConnect questions.",
        target: "#faq"
    },

    {
        title: "Contact",
        description:
            "CampusConnect contact information.",
        target: "#contact"
    }

];


function initializeSearch() {

    const searchButton =
        $("#searchButton");

    const overlay =
        $("#searchOverlay");

    const closeButton =
        $("#searchCloseButton");

    const input =
        $("#siteSearchInput");


    if (!searchButton || !overlay) {
        return;
    }


    function openSearch() {

        STATE.lastFocusedElement =
            document.activeElement;


        overlay.classList.add("open");

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        setTimeout(
            () => input?.focus(),
            50
        );

    }


    function closeSearch() {

        overlay.classList.remove("open");

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );


        if (input) {
            input.value = "";
        }


        renderSearchResults("");


        STATE.lastFocusedElement?.focus();

    }


    searchButton.addEventListener(
        "click",
        openSearch
    );


    closeButton?.addEventListener(
        "click",
        closeSearch
    );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay
            ) {

                closeSearch();

            }

        }
    );


    input?.addEventListener(
        "input",
        event => {

            renderSearchResults(
                event.target.value
            );

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                overlay.classList.contains("open")
            ) {

                closeSearch();

            }

        }
    );

}


function renderSearchResults(query) {

    const container =
        $("#searchResults");

    if (!container) {
        return;
    }


    const cleanedQuery =
        String(query)
            .trim()
            .toLowerCase();


    if (!cleanedQuery) {

        container.replaceChildren();

        const empty =
            document.createElement("p");

        empty.className =
            "search-empty";

        empty.textContent =
            "Start typing to search the campus website.";

        container.appendChild(empty);

        return;

    }


    const results =
        searchableSections.filter(item => {

            return (
                item.title
                    .toLowerCase()
                    .includes(cleanedQuery)
                ||
                item.description
                    .toLowerCase()
                    .includes(cleanedQuery)
            );

        });


    if (!results.length) {

        container.replaceChildren();

        const empty =
            document.createElement("p");

        empty.className =
            "search-empty";

        empty.textContent =
            "No matching campus section was found.";

        container.appendChild(empty);

        return;

    }


    container.replaceChildren();


    results.forEach(item => {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "search-result-item";


        const title =
            document.createElement("strong");

        title.textContent =
            item.title;


        const description =
            document.createElement("span");

        description.textContent =
            item.description;


        button.append(
            title,
            description
        );


        button.addEventListener(
            "click",
            () => {

                $("#searchOverlay")
                    ?.classList.remove("open");


                $("#searchOverlay")
                    ?.setAttribute(
                        "aria-hidden",
                        "true"
                    );


                document.body.classList.remove(
                    "modal-open"
                );


                scrollToSection(
                    item.target
                );

            }
        );


        container.appendChild(button);

    });

}


/* =========================================================
   FAQ
========================================================= */

function initializeFAQ() {

    $$(".faq-question").forEach(button => {

        if (
            button.dataset.faqInitialized === "true"
        ) {
            return;
        }


        button.dataset.faqInitialized =
            "true";


        button.addEventListener(
            "click",
            () => {

                const item =
                    button.closest(".faq-item");

                if (!item) {
                    return;
                }


                const answer =
                    $(".faq-answer", item);

                if (!answer) {
                    return;
                }


                const wasOpen =
                    item.classList.contains("open");


                $$(".faq-item").forEach(
                    otherItem => {

                        if (
                            otherItem === item
                        ) {
                            return;
                        }


                        otherItem.classList.remove(
                            "open"
                        );


                        const otherButton =
                            $(".faq-question", otherItem);


                        const otherAnswer =
                            $(".faq-answer", otherItem);


                        otherButton?.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        if (otherAnswer) {

                            otherAnswer.style.maxHeight =
                                null;

                        }

                    }
                );


                if (wasOpen) {

                    item.classList.remove("open");

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    answer.style.maxHeight =
                        null;

                } else {

                    item.classList.add("open");

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                    answer.style.maxHeight =
                        `${answer.scrollHeight}px`;

                }

            }
        );

    });

}


/* =========================================================
   GALLERY
========================================================= */

function initializeGallery() {

    $$(".gallery-item").forEach(item => {

        if (
            item.dataset.galleryInitialized === "true"
        ) {
            return;
        }


        item.dataset.galleryInitialized =
            "true";


        item.addEventListener(
            "click",
            () => {

                const image =
                    item.dataset.galleryImage;

                const title =
                    item.dataset.galleryTitle ||
                    "Campus Gallery";


                if (!image) {
                    return;
                }


                openGalleryModal(
                    image,
                    title
                );

            }
        );

    });


    $$("[data-close-gallery]").forEach(
        element => {

            element.addEventListener(
                "click",
                closeGalleryModal
            );

        }
    );

}


function openGalleryModal(
    image,
    title
) {

    const modal =
        $("#galleryModal");

    const modalImage =
        $("#galleryModalImage");

    const modalTitle =
        $("#galleryModalTitle");


    if (!modal || !modalImage) {
        return;
    }


    STATE.lastFocusedElement =
        document.activeElement;


    modalImage.src =
        image;

    modalImage.alt =
        title;


    if (modalTitle) {
        modalTitle.textContent =
            title;
    }


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeGalleryModal() {

    const modal =
        $("#galleryModal");


    if (!modal) {
        return;
    }


    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    STATE.lastFocusedElement?.focus();

}


/* =========================================================
   GENERAL MODAL
========================================================= */

function initializeModal() {

    $$("[data-close-modal]").forEach(
        element => {

            element.addEventListener(
                "click",
                closeGeneralModal
            );

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
                &&
                $("#generalModal")
                    ?.classList.contains("open")
            ) {

                closeGeneralModal();

            }

        }
    );

}


function showModal(
    title,
    message
) {

    const modal =
        $("#generalModal");

    const modalTitle =
        $("#modalTitle");

    const modalMessage =
        $("#modalMessage");


    if (!modal) {
        return;
    }


    STATE.lastFocusedElement =
        document.activeElement;


    if (modalTitle) {

        modalTitle.textContent =
            title;

    }


    if (modalMessage) {

        modalMessage.replaceChildren();


        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            message;


        modalMessage.appendChild(
            paragraph
        );

    }


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function showRecordModal(
    type,
    record
) {

    const modal =
        $("#generalModal");

    const modalTitle =
        $("#modalTitle");

    const modalMessage =
        $("#modalMessage");


    if (!modal) {
        return;
    }


    STATE.lastFocusedElement =
        document.activeElement;


    if (modalTitle) {

        modalTitle.textContent =
            getText(
                record,
                ["title", "name", "heading"],
                type
            );

    }


    if (modalMessage) {

        modalMessage.replaceChildren();


        const category =
            document.createElement("p");

        category.textContent =
            type;


        const description =
            document.createElement("p");

        description.textContent =
            getText(
                record,
                [
                    "content",
                    "description",
                    "summary",
                    "body"
                ],
                "Additional information is not currently available."
            );


        const dateValue =
            getValue(
                record,
                [
                    "publishedAt",
                    "date",
                    "createdAt",
                    "startDate",
                    "eventDate"
                ]
            );


        modalMessage.appendChild(
            category
        );


        if (dateValue) {

            const date =
                document.createElement("p");

            date.textContent =
                formatDate(dateValue);

            modalMessage.appendChild(
                date
            );

        }


        modalMessage.appendChild(
            description
        );

    }


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeGeneralModal() {

    const modal =
        $("#generalModal");


    if (!modal) {
        return;
    }


    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    STATE.lastFocusedElement?.focus();

}


/* =========================================================
   BUTTON FUNCTIONALITY
========================================================= */

function initializeButtons() {

    initializeLoginButtons();


    /*
     * Academic cards.
     *
     * These are public-read operations.
     * If the backend is not connected, the user receives
     * an honest status instead of fake information.
     */

    $$(".academic-card").forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const feature =
                    card.dataset.feature ||
                    "Academic Information";


                handleAcademicFeature(
                    feature
                );

            }
        );

    });


    /*
     * Protected services.
     *
     * Personal attendance, results, fees, hostel data etc.
     * must never be fetched publicly.
     */

    $$(".service-card").forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const service =
                    card.dataset.service ||
                    "Campus Service";


                showModal(
                    service,
                    "This service requires authentication. Please log in to CampusConnect to continue."
                );

                setTimeout(
                    () => {

                        closeGeneralModal();

                        openLogin();

                    },
                    900
                );

            }
        );

    });


    $("#viewAllNotices")
        ?.addEventListener(
            "click",
            () => {

                if (!STATE.notices.length) {

                    showModal(
                        "Important Notices",
                        "There are currently no public notices available."
                    );

                    return;

                }


                showCollectionModal(
                    "All Public Notices",
                    STATE.notices,
                    "notice"
                );

            }
        );


    $("#viewAllNews")
        ?.addEventListener(
            "click",
            () => {

                if (!STATE.news.length) {

                    showModal(
                        "Latest News",
                        "There is currently no published public news."
                    );

                    return;

                }


                showCollectionModal(
                    "Latest News",
                    STATE.news,
                    "news"
                );

            }
        );


    $("#viewAllEvents")
        ?.addEventListener(
            "click",
            () => {

                if (!STATE.events.length) {

                    showModal(
                        "Campus Events",
                        "There are currently no upcoming public events."
                    );

                    return;

                }


                showCollectionModal(
                    "Upcoming Events",
                    STATE.events,
                    "event"
                );

            }
        );


    $("#calendarButton")
        ?.addEventListener(
            "click",
            () => {

                if (!STATE.events.length) {

                    showModal(
                        "Campus Calendar",
                        "There are currently no public events available for the calendar."
                    );

                    return;

                }


                showCollectionModal(
                    "Campus Calendar",
                    STATE.events,
                    "event"
                );

            }
        );


    $("#researchButton")
        ?.addEventListener(
            "click",
            () => {

                if (!STATE.research.length) {

                    showModal(
                        "Research & Innovation",
                        "No public research or innovation information is currently available."
                    );

                    return;

                }


                showCollectionModal(
                    "Research & Innovation",
                    STATE.research,
                    "research"
                );

            }
        );


    $("#viewGalleryButton")
        ?.addEventListener(
            "click",
            () => {

                scrollToSection(
                    "#gallery"
                );

            }
        );

}


/* =========================================================
   ACADEMIC FEATURE HANDLER
========================================================= */

function handleAcademicFeature(feature) {

    let collection = [];


    switch (feature) {

        case "Departments":
            collection =
                STATE.departments;
            break;

        case "Courses & Subjects":
            collection =
                STATE.courses;
            break;

        case "Examinations":
            collection =
                STATE.examinations;
            break;

        case "Digital Learning":
            collection =
                STATE.learning;
            break;

        default:
            collection = [];

    }


    if (!collection.length) {

        showModal(
            feature,
            `No public ${feature.toLowerCase()} information is currently available.`
        );

        return;

    }


    showCollectionModal(
        feature,
        collection,
        "academic"
    );

}


/* =========================================================
   COLLECTION MODAL
========================================================= */

function showCollectionModal(
    title,
    collection,
    type
) {

    const modal =
        $("#generalModal");

    const modalTitle =
        $("#modalTitle");

    const modalMessage =
        $("#modalMessage");


    if (!modal || !modalMessage) {
        return;
    }


    STATE.lastFocusedElement =
        document.activeElement;


    if (modalTitle) {
        modalTitle.textContent =
            title;
    }


    modalMessage.replaceChildren();


    const intro =
        document.createElement("p");

    intro.textContent =
        `${collection.length} public item${collection.length === 1 ? "" : "s"} available.`;


    const list =
        document.createElement("div");

    list.className =
        "modal-list";


    collection.forEach(record => {

        const item =
            document.createElement("div");

        item.className =
            "modal-list-item";


        const heading =
            document.createElement("strong");

        heading.textContent =
            getText(
                record,
                ["title", "name", "heading"],
                title
            );


        const description =
            document.createElement("span");

        description.textContent =
            truncate(
                getText(
                    record,
                    ["summary", "description", "content"],
                    "Additional information is available through CampusConnect."
                ),
                180
            );


        item.append(
            heading,
            description
        );


        item.addEventListener(
            "click",
            () => {

                showRecordModal(
                    type,
                    record
                );

            }
        );


        list.appendChild(item);

    });


    modalMessage.append(
        intro,
        list
    );


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   SCROLL SPY
========================================================= */

function initializeScrollSpy() {

    const sections = [
        "home",
        "about",
        "academics",
        "notices",
        "news",
        "events",
        "research",
        "contact"
    ];


    const navLinks =
        $$(".nav-link");


    const sectionElements =
        sections
            .map(id =>
                document.getElementById(id)
            )
            .filter(Boolean);


    if (!sectionElements.length) {
        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    navLinks.forEach(link => {

                        link.classList.remove(
                            "active"
                        );

                    });


                    document
                        .querySelector(
                            `.nav-link[href="#${entry.target.id}"]`
                        )
                        ?.classList.add(
                            "active"
                        );

                });

            },
            {
                rootMargin:
                    "-35% 0px -55% 0px",

                threshold: 0
            }
        );


    sectionElements.forEach(section => {

        observer.observe(
            section
        );

    });

}


/* =========================================================
   YEAR
========================================================= */

function initializeYear() {

    const yearElement =
        $("#currentYear");


    if (!yearElement) {
        return;
    }


    yearElement.textContent =
        String(
            new Date().getFullYear()
        );

}


/* =========================================================
   IMAGE FALLBACKS
========================================================= */

function initializeImageFallbacks() {

    $$("img").forEach(img => {

        img.addEventListener(
            "error",
            () => {

                img.style.display =
                    "none";

            }
        );

    });

}


/* =========================================================
   SAFE DATA HELPERS
========================================================= */

function getValue(
    object,
    keys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return null;

    }


    for (const key of keys) {

        const value =
            object[key];


        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return value;

        }

    }


    return null;

}


function getText(
    object,
    keys,
    fallback = ""
) {

    const value =
        getValue(
            object,
            keys
        );


    if (
        value === null ||
        value === undefined
    ) {

        return fallback;

    }


    return String(value);

}


function truncate(
    value,
    maxLength
) {

    const text =
        String(value || "");


    if (
        text.length <= maxLength
    ) {

        return text;

    }


    return `${text.slice(0, maxLength).trim()}...`;

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


/* =========================================================
   SAFE IMAGE URL
========================================================= */

function getSafeImageUrl(value) {

    if (!value) {
        return "";
    }


    const raw =
        String(value).trim();


    /*
     * Relative image paths are allowed.
     */

    if (
        raw.startsWith("/") ||
        raw.startsWith("./") ||
        raw.startsWith("../")
    ) {

        return raw;

    }


    /*
     * HTTPS is required for remote images.
     *
     * This avoids silently allowing javascript:
     * or other dangerous URL schemes.
     */

    try {

        const parsed =
            new URL(
                raw,
                window.location.href
            );


        if (
            parsed.protocol === "https:"
            ||
            (
                parsed.protocol === "http:"
                &&
                parsed.hostname ===
                    window.location.hostname
            )
        ) {

            return parsed.href;

        }

    } catch {
        return "";
    }


    return "";

}


/* =========================================================
   GLOBAL KEYBOARD HANDLING
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        if (
            $("#galleryModal")
                ?.classList.contains("open")
        ) {

            closeGalleryModal();

        }


        if (
            $("#generalModal")
                ?.classList.contains("open")
        ) {

            closeGeneralModal();

        }

    }
);