"use strict";

const CONFIG = {
  API_BASE_URL: "",
  ENDPOINTS: {
    FEEDBACK: "/admin/feedback",
    CREATE: "/admin/feedback/requests"
  }
};

const state = {
  view: "",
  records: []
};

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
});

function bindEvents() {
  
  $("backBtn").onclick = () => {
    
    if (state.view) {
      closeWorkspace();
      return;
    }
    
    history.length > 1 ?
      history.back() :
      window.location.href = "../admin-dashboard.html";
  };
  
  $("refreshBtn").onclick = () => {
    if (state.view) loadRecords();
  };
  
  document.querySelectorAll(".action-card").forEach(card => {
    card.onclick = () => openWorkspace(card.dataset.view);
  });
  
  $("closeWorkspaceBtn").onclick = closeWorkspace;
  
  $("searchInput").oninput = render;
  $("statusFilter").onchange = render;
  
  $("exportBtn").onclick = exportCSV;
  
  $("createFeedbackBtn").onclick = () => {
    $("feedbackModal").hidden = false;
    document.body.style.overflow = "hidden";
  };
  
  $("closeFeedbackModal").onclick = closeModal;
  $("cancelFeedbackBtn").onclick = closeModal;
  
  $("feedbackForm").onsubmit = createRequest;
}

function openWorkspace(view) {
  
  state.view = view;
  
  const config = {
    responses: [
      "Responses",
      "Feedback Responses",
      "Review submitted feedback."
    ],
    requests: [
      "Requests",
      "Feedback Requests",
      "Manage active feedback requests."
    ],
    issues: [
      "Flagged Feedback",
      "Feedback Requiring Attention",
      "Review feedback that has been flagged."
    ]
  } [view];
  
  $("viewLabel").textContent = config[0];
  $("viewTitle").textContent = config[1];
  $("viewDescription").textContent = config[2];
  
  $("workspace").hidden = false;
  
  $("workspace").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
  
  loadRecords();
}

async function loadRecords() {
  
  state.records = [];
  
  try {
    
    if (!CONFIG.API_BASE_URL) {
      render();
      return;
    }
    
    const response =
      await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FEEDBACK);
    
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
  
  const list = $("feedbackList");
  
  list.innerHTML = "";
  
  $("emptyState").hidden = records.length > 0;
  
  records.forEach(item => {
    
    const card = document.createElement("article");
    
    card.className = "feedback-card";
    
    card.innerHTML = `
            <h3>${safe(item.title || item.subject)}</h3>

            <p>
                ${safe(item.message || item.feedback || item.description)}
            </p>

            <div class="feedback-meta">

                <span>
                    <i class="fa-solid fa-user"></i>
                    ${safe(item.studentName)}
                </span>

                <span>
                    <i class="fa-regular fa-calendar"></i>
                    ${safe(item.date)}
                </span>

                <span>
                    ${safe(item.status)}
                </span>

            </div>
        `;
    
    list.appendChild(card);
  });
}

async function createRequest(e) {
  
  e.preventDefault();
  
  const payload = {
    title: $("feedbackTitle").value.trim(),
    audience: $("feedbackAudience").value,
    deadline: $("feedbackDeadline").value,
    description: $("feedbackDescription").value.trim()
  };
  
  if (!CONFIG.API_BASE_URL) {
    alert("Feedback API is not connected yet. The form is ready for backend integration.");
    return;
  }
  
  try {
    
    const response = await fetch(
      CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.CREATE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) throw new Error();
    
    closeModal();
    $("feedbackForm").reset();
    
    if (state.view) loadRecords();
    
  } catch {
    alert("Unable to create feedback request.");
  }
}

function closeModal() {
  $("feedbackModal").hidden = true;
  document.body.style.overflow = "";
}

function closeWorkspace() {
  state.view = "";
  $("workspace").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exportCSV() {
  
  if (!state.records.length) {
    alert("There are no feedback records to export.");
    return;
  }
  
  const rows = [
    ["Title", "Student", "Message", "Date", "Status"]
  ];
  
  state.records.forEach(item => {
    
    rows.push([
      item.title || item.subject || "",
      item.studentName || "",
      item.message || item.feedback || "",
      item.date || "",
      item.status || ""
    ]);
  });
  
  const csv = rows.map(row =>
    row.map(value =>
      `"${String(value).replace(/"/g,'""')}"`
    ).join(",")
  ).join("\n");
  
  const blob =
    new Blob([csv], { type: "text/csv;charset=utf-8;" });
  
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  
  a.href = url;
  a.download = "feedback.csv";
  a.click();
  
  URL.revokeObjectURL(url);
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