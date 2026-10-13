"use strict";

const CONFIG = {
  API_BASE_URL: "",
  ENDPOINTS: {
    CERTIFICATES: "/admin/certificates",
    CREATE: "/admin/certificates"
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
      closeRecords();
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
    card.onclick = () => openRecords(card.dataset.view);
  });
  
  $("closeRecordsBtn").onclick = closeRecords;
  $("searchInput").oninput = render;
  $("exportBtn").onclick = exportCSV;
  
  $("issueCertificateBtn").onclick = () => {
    $("certificateModal").hidden = false;
    document.body.style.overflow = "hidden";
  };
  
  $("closeCertificateModal").onclick = closeModal;
  $("cancelCertificateBtn").onclick = closeModal;
  
  $("certificateForm").onsubmit = issueCertificate;
}

function openRecords(view) {
  
  state.view = view;
  
  const config = {
    issued: [
      "Issued Certificates",
      "Issued Certificates",
      "View certificates issued to students."
    ],
    verification: [
      "Verification",
      "Certificate Verification",
      "Verify certificate records."
    ],
    pending: [
      "Pending Requests",
      "Pending Certificate Requests",
      "Review pending certificate requests."
    ]
  } [view];
  
  $("viewLabel").textContent = config[0];
  $("viewTitle").textContent = config[1];
  $("viewDescription").textContent = config[2];
  
  $("recordsSection").hidden = false;
  
  $("recordsSection").scrollIntoView({
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
      await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.CERTIFICATES);
    
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
  
  const records =
    state.records.filter(item =>
      !search ||
      JSON.stringify(item).toLowerCase().includes(search)
    );
  
  const body = $("tableBody");
  
  body.innerHTML = "";
  
  $("emptyState").hidden = records.length > 0;
  
  records.forEach(item => {
    
    const row = document.createElement("tr");
    
    row.innerHTML = `
            <td>${safe(item.certificateId)}</td>
            <td>${safe(item.studentName)}</td>
            <td>${safe(item.certificateType)}</td>
            <td>${safe(item.issueDate)}</td>
            <td>${safe(item.status)}</td>
        `;
    
    body.appendChild(row);
  });
}

async function issueCertificate(e) {
  
  e.preventDefault();
  
  const payload = {
    studentId: $("studentId").value.trim(),
    certificateType: $("certificateType").value,
    remarks: $("remarks").value.trim()
  };
  
  if (!CONFIG.API_BASE_URL) {
    alert("Certificate API is not connected yet. The form is ready for backend integration.");
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
    $("certificateForm").reset();
    
    if (state.view) loadRecords();
    
  } catch {
    alert("Unable to issue certificate.");
  }
}

function closeModal() {
  $("certificateModal").hidden = true;
  document.body.style.overflow = "";
}

function closeRecords() {
  state.view = "";
  $("recordsSection").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exportCSV() {
  
  if (!state.records.length) {
    alert("There are no certificate records to export.");
    return;
  }
  
  const rows = [
    [
      "Certificate ID",
      "Student",
      "Certificate Type",
      "Issue Date",
      "Status"
    ]
  ];
  
  state.records.forEach(item => {
    rows.push([
      item.certificateId || "",
      item.studentName || "",
      item.certificateType || "",
      item.issueDate || "",
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
  a.download = "certificates.csv";
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