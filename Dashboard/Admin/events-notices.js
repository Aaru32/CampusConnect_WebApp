"use strict";

const CONFIG = {
  API_BASE_URL: "",
  ENDPOINTS: {
    EVENTS: "/admin/events",
    NOTICES: "/admin/notices"
  }
};

const state = {
  view: "events",
  records: []
};

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  
  bindEvents();
  loadRecords();
  
});

function bindEvents() {
  
  $("backBtn").onclick = () => {
    history.length > 1 ?
      history.back() :
      window.location.href = "../admin-dashboard.html";
  };
  
  $("refreshBtn").onclick = loadRecords;
  
  document.querySelectorAll(".switch-btn").forEach(btn => {
    btn.onclick = () => {
      
      document.querySelectorAll(".switch-btn")
        .forEach(x => x.classList.remove("active"));
      
      btn.classList.add("active");
      
      state.view = btn.dataset.view;
      
      loadRecords();
    };
  });
  
  $("searchInput").oninput = render;
  $("statusFilter").onchange = render;
  
  $("addEventBtn").onclick = () => openModal("eventModal");
  $("addNoticeBtn").onclick = () => openModal("noticeModal");
  
  $("closeEventModal").onclick = () => closeModal("eventModal");
  $("cancelEventBtn").onclick = () => closeModal("eventModal");
  
  $("closeNoticeModal").onclick = () => closeModal("noticeModal");
  $("cancelNoticeBtn").onclick = () => closeModal("noticeModal");
  
  $("eventForm").onsubmit = submitEvent;
  $("noticeForm").onsubmit = submitNotice;
}

async function loadRecords() {
  
  state.records = [];
  
  const endpoint =
    state.view === "events" ?
    CONFIG.ENDPOINTS.EVENTS :
    CONFIG.ENDPOINTS.NOTICES;
  
  try {
    
    if (!CONFIG.API_BASE_URL) {
      render();
      return;
    }
    
    const response =
      await fetch(CONFIG.API_BASE_URL + endpoint);
    
    if (!response.ok) throw new Error();
    
    const data = await response.json();
    
    state.records =
      Array.isArray(data) ?
      data :
      data.records || data.data || [];
    
    render();
    
  } catch {
    render();
  }
}

function render() {
  
  const grid = $("recordsGrid");
  
  grid.innerHTML = "";
  
  const search =
    $("searchInput").value.trim().toLowerCase();
  
  const status =
    $("statusFilter").value.toLowerCase();
  
  const records = state.records.filter(item => {
    
    const text =
      JSON.stringify(item).toLowerCase();
    
    const itemStatus =
      String(item.status || "").toLowerCase();
    
    return (
      (!search || text.includes(search)) &&
      (!status || itemStatus === status)
    );
  });
  
  $("emptyState").hidden = records.length > 0;
  
  records.forEach(item => {
    
    const card = document.createElement("article");
    
    card.className = "record-card";
    
    if (state.view === "events") {
      
      card.innerHTML = `
                <h3>${safe(item.title)}</h3>
                <p>${safe(item.description)}</p>

                <div class="record-meta">
                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${safe(item.date)}
                    </span>

                    <span>
                        <i class="fa-solid fa-location-dot"></i>
                        ${safe(item.venue)}
                    </span>

                    <span>${safe(item.status)}</span>
                </div>
            `;
      
    } else {
      
      card.innerHTML = `
                <h3>${safe(item.title)}</h3>
                <p>${safe(item.content)}</p>

                <div class="record-meta">
                    <span>
                        <i class="fa-solid fa-users"></i>
                        ${safe(item.audience)}
                    </span>

                    <span>${safe(item.status)}</span>
                </div>
            `;
    }
    
    grid.appendChild(card);
  });
}

async function submitEvent(e) {
  
  e.preventDefault();
  
  const payload = {
    title: $("eventTitle").value.trim(),
    date: $("eventDate").value,
    venue: $("eventVenue").value.trim(),
    description: $("eventDescription").value.trim()
  };
  
  await submit(CONFIG.ENDPOINTS.EVENTS, payload, "eventModal");
}

async function submitNotice(e) {
  
  e.preventDefault();
  
  const payload = {
    title: $("noticeTitle").value.trim(),
    audience: $("noticeAudience").value,
    content: $("noticeContent").value.trim()
  };
  
  await submit(CONFIG.ENDPOINTS.NOTICES, payload, "noticeModal");
}

async function submit(endpoint, payload, modalId) {
  
  if (!CONFIG.API_BASE_URL) {
    alert("The backend API is not connected yet. This form is ready for API integration.");
    return;
  }
  
  try {
    
    const response = await fetch(
      CONFIG.API_BASE_URL + endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) throw new Error();
    
    closeModal(modalId);
    loadRecords();
    
  } catch {
    alert("Unable to save the record.");
  }
}

function openModal(id) {
  $(id).hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  $(id).hidden = true;
  document.body.style.overflow = "";
}

function safe(value) {
  
  if (value === undefined || value === null || value === "") {
    return "—";
  }
  
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}