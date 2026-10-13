
"use strict";

/*
 * CampusConnect Room Status
 *
 * Assumed API routes:
 * GET    /rooms
 * POST   /rooms
 * POST   /rooms/{id}/start
 * POST   /rooms/{id}/end
 * POST   /rooms/{id}/extend
 * POST   /rooms/{id}/reservations
 *
 * Confirm these routes and their request/response fields against
 * your Spring Boot controllers before deployment.
 */

const CONFIG = {
  // Leave "" only when this page and API share the same origin.
  // Otherwise enter your Spring Boot base URL, e.g. http://localhost:8080
  API_BASE_URL: "",

  ROOMS_ENDPOINT: "/rooms",
  REFRESH_INTERVAL: 15000,
  DEFAULT_DURATION: 60
};

const state = {
  rooms: [],
  reservations: [],
  loading: false,
  activeAlarmKey: null,
  alarmedSessions: new Set(),
  audioContext: null,
  alarmInterval: null,
  countdownInterval: null,
  messageTimeout: null
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  roomGrid: $("#roomGrid"),
  reservationsList: $("#reservationsList"),
  pageMessage: $("#pageMessage"),
  totalRooms: $("#totalRooms"),
  availableRooms: $("#availableRooms"),
  occupiedRooms: $("#occupiedRooms"),
  reservedRooms: $("#reservedRooms"),
  roomDialog: $("#roomDialog"),
  roomForm: $("#roomForm"),
  roomStatus: $("#roomStatus"),
  initialDurationGroup: $("#initialDurationGroup"),
  initialDuration: $("#initialDuration"),
  saveRoomBtn: $("#saveRoomBtn"),
  extendDialog: $("#extendDialog"),
  extendForm: $("#extendForm"),
  extendRoomId: $("#extendRoomId"),
  extendRoomLabel: $("#extendRoomLabel"),
  extraMinutes: $("#extraMinutes"),
  reservationDialog: $("#reservationDialog"),
  reservationForm: $("#reservationForm"),
  reservationRoomId: $("#reservationRoomId"),
  reservationRoomLabel: $("#reservationRoomLabel"),
  reservationTitle: $("#reservationTitle"),
  reservationStart: $("#reservationStart"),
  reservationEnd: $("#reservationEnd")
};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function normaliseStatus(status) {
  const value = String(status ?? "AVAILABLE")
    .trim()
    .toUpperCase();

  if (["OCCUPIED", "IN_USE", "IN USE"].includes(value)) {
    return "OCCUPIED";
  }

  if (["RESERVED", "BOOKED"].includes(value)) {
    return "RESERVED";
  }

  return "AVAILABLE";
}

function getRoomId(room) {
  return room.id ?? room.roomId ?? room.room_id ?? room.roomNumber;
}

function getRoomNumber(room) {
  return room.roomNumber ?? room.roomNo ?? room.number ?? room.id ?? "Room";
}

function getRoomName(room) {
  return room.roomName ?? room.name ?? room.title ?? "Classroom";
}

function getRoomDeadline(room) {
  const session = room.activeSession ?? room.session ?? {};

  const rawDeadline =
    room.sessionEndTime ??
    room.timerEndTime ??
    room.expiresAt ??
    room.endTime ??
    room.endsAt ??
    session.endTime ??
    session.endsAt ??
    session.expiresAt ??
    null;

  if (!rawDeadline) return null;

  let timestamp;

  if (typeof rawDeadline === "number") {
    timestamp = rawDeadline;
  } else {
    timestamp = new Date(rawDeadline).getTime();
  }

  // Support Unix timestamps expressed in seconds.
  if (Number.isFinite(timestamp) && timestamp > 0 && timestamp < 1e12) {
    timestamp *= 1000;
  }

  return Number.isFinite(timestamp) && timestamp > 0
    ? timestamp
    : null;
}

function getRoomReservations(room) {
  const list = room.reservations ?? room.bookings ?? [];
  return Array.isArray(list) ? list : [];
}

function formatDateTime(value) {
  if (!value) return "Not specified";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function showMessage(message, type = "info") {
  elements.pageMessage.textContent = message;
  elements.pageMessage.className = "message";

  if (type === "error") elements.pageMessage.classList.add("error");
  if (type === "success") elements.pageMessage.classList.add("success");

  clearTimeout(state.messageTimeout);
  state.messageTimeout = setTimeout(() => {
    elements.pageMessage.classList.add("hidden");
  }, 5000);
}

async function apiRequest(path, options = {}) {
  const base = CONFIG.API_BASE_URL.trim().replace(/\/+$/, "");

  const response = await fetch(`${base}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers ?? {})
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {})
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const errorData = await response.json();
      message = errorData.message ?? errorData.error ?? message;
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractRooms(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.rooms)) return response.rooms;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.rooms)) return response.data.rooms;

  return [];
}

function extractReservations(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.reservations)) return response.reservations;
  if (Array.isArray(response?.bookings)) return response.bookings;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;

  return [];
}

function updateSummary() {
  const total = state.rooms.length;
  const available = state.rooms.filter(
    room => normaliseStatus(room.status) === "AVAILABLE"
  ).length;
  const occupied = state.rooms.filter(
    room => normaliseStatus(room.status) === "OCCUPIED"
  ).length;
  const reserved = state.rooms.filter(
    room => normaliseStatus(room.status) === "RESERVED"
  ).length;

  elements.totalRooms.textContent = total;
  elements.availableRooms.textContent = available;
  elements.occupiedRooms.textContent = occupied;
  elements.reservedRooms.textContent = reserved;
}

function statusClass(status) {
  return {
    AVAILABLE: "status-available",
    OCCUPIED: "status-occupied",
    RESERVED: "status-reserved"
  }[status] ?? "status-available";
}

function statusText(status) {
  return {
    AVAILABLE: "Available",
    OCCUPIED: "Occupied",
    RESERVED: "Reserved"
  }[status] ?? "Available";
}

function roomTimerMarkup(room) {
  if (normaliseStatus(room.status) !== "OCCUPIED") return "";

  const deadline = getRoomDeadline(room);
  const roomId = String(getRoomId(room));

  if (!deadline) {
    return `
      <div class="detail-row">
        <span class="detail-label">Class Timer</span>
        <span class="detail-value">Not available</span>
      </div>
    `;
  }

  const remaining = deadline - Date.now();
  const expired = remaining <= 0;

  return `
    <div class="detail-row">
      <span class="detail-label">Time Remaining</span>
      <span
        class="detail-value timer-value ${expired ? "timer-expired" : ""}"
        data-room-timer="${escapeHTML(roomId)}"
        data-deadline="${deadline}">
        ${expired ? "00:00:00" : formatCountdown(remaining)}
      </span>
    </div>
  `;
}

function roomActionsMarkup(room, status) {
  const id = escapeHTML(getRoomId(room));

  if (status === "AVAILABLE") {
    return `
      <button class="primary-button" data-action="start" data-id="${id}">
        <i class="fa-solid fa-play"></i> Start Class
      </button>
      <button class="secondary-button" data-action="reserve" data-id="${id}">
        <i class="fa-regular fa-calendar"></i> Reserve
      </button>
    `;
  }

  if (status === "OCCUPIED") {
    return `
      <button class="secondary-button" data-action="extend" data-id="${id}">
        <i class="fa-regular fa-clock"></i> Extend
      </button>
      <button class="secondary-button" data-action="reserve" data-id="${id}">
        <i class="fa-regular fa-calendar"></i> Schedule
      </button>
      <button class="danger-button" data-action="end" data-id="${id}">
        <i class="fa-solid fa-stop"></i> End Class
      </button>
    `;
  }

  return `
    <button class="primary-button" data-action="start" data-id="${id}">
      <i class="fa-solid fa-play"></i> Start Class
    </button>
    <button class="secondary-button" data-action="reserve" data-id="${id}">
      <i class="fa-regular fa-calendar"></i> Schedule
    </button>
  `;
}

function roomCardMarkup(room) {
  const status = normaliseStatus(room.status);

  const number = escapeHTML(getRoomNumber(room));
  const name = escapeHTML(getRoomName(room));
  const roomId = String(getRoomId(room));

  const nextReservation = getRoomReservations(room)
    .filter(item => item.startTime || item.start || item.startsAt)
    .sort((a, b) => {
      const aTime = new Date(a.startTime ?? a.start ?? a.startsAt).getTime();
      const bTime = new Date(b.startTime ?? b.start ?? b.startsAt).getTime();
      return aTime - bTime;
    })[0];

  const reservationLabel = nextReservation
    ? formatDateTime(
        nextReservation.startTime ??
        nextReservation.start ??
        nextReservation.startsAt
      )
    : "No upcoming reservation";

  return `
    <article class="room-card" data-room-card="${escapeHTML(roomId)}">
      <div class="room-card-top">
        <div>
          <h3 class="room-number">Room ${number}</h3>
          <p class="room-name">${name}</p>
        </div>
        <span class="status-label ${statusClass(status)}">
          ${statusText(status)}
        </span>
      </div>

      <div class="room-details">
        <div class="detail-row">
          <span class="detail-label">Room Number</span>
          <span class="detail-value">${number}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Current Status</span>
          <span class="detail-value">${statusText(status)}</span>
        </div>

        ${roomTimerMarkup(room)}

       <div class="detail-row">
  <span class="detail-label">Reservation</span>
  <span class="detail-value">
    ${
      nextReservation
        ? `${escapeHTML(formatDateTime(
            nextReservation.startTime ??
            nextReservation.start ??
            nextReservation.startsAt
          ))} – ${escapeHTML(formatDateTime(
            nextReservation.endTime ??
            nextReservation.end ??
            nextReservation.endsAt
          ))}`
        : status === "RESERVED"
          ? "Timing not available"
          : "No upcoming reservation"
    }
  </span>
</div>
      </div>

      <div class="room-actions">
        ${roomActionsMarkup(room, status)}
      </div>
    </article>
  `;
}

function renderRooms() {
  updateSummary();

  if (!state.rooms.length) {
    elements.roomGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-door-open"></i>
        <p>No classrooms have been added yet.</p>
      </div>
    `;
    return;
  }

  elements.roomGrid.innerHTML = state.rooms.map(roomCardMarkup).join("");
}

function getReservationRoomLabel(reservation) {
  const room = reservation.room ?? {};

  const number =
    reservation.roomNumber ??
    room.roomNumber ??
    reservation.roomNo ??
    "";

  const name =
    reservation.roomName ??
    room.roomName ??
    room.name ??
    "";

  if (number && name) return `Room ${number} — ${name}`;
  if (number) return `Room ${number}`;
  if (name) return name;

  const id = reservation.roomId ?? room.id;
  const matchedRoom = state.rooms.find(
    item => String(getRoomId(item)) === String(id)
  );

  return matchedRoom
    ? `Room ${getRoomNumber(matchedRoom)} — ${getRoomName(matchedRoom)}`
    : "Classroom";
}

function renderReservations() {
  const allReservations = [...state.reservations];

  // Include room-embedded reservations if the API returns them that way.
  state.rooms.forEach(room => {
    getRoomReservations(room).forEach(reservation => {
      allReservations.push({
        ...reservation,
        roomNumber: reservation.roomNumber ?? getRoomNumber(room),
        roomName: reservation.roomName ?? getRoomName(room),
        roomId: reservation.roomId ?? getRoomId(room)
      });
    });
  });

  const unique = new Map();

  allReservations.forEach((reservation, index) => {
    const key = reservation.id ??
      `${reservation.roomId}-${reservation.startTime ?? reservation.start ?? index}-${reservation.title ?? ""}`;

    if (!unique.has(String(key))) unique.set(String(key), reservation);
  });

  const now = Date.now();

  const upcoming = [...unique.values()]
    .filter(reservation => {
      const start = reservation.startTime ??
        reservation.start ??
        reservation.startsAt;

      if (!start) return false;

      const timestamp = new Date(start).getTime();
      return Number.isFinite(timestamp) && timestamp >= now;
    })
    .sort((a, b) => {
      const aTime = new Date(
        a.startTime ?? a.start ?? a.startsAt
      ).getTime();
      const bTime = new Date(
        b.startTime ?? b.start ?? b.startsAt
      ).getTime();

      return aTime - bTime;
    });

  if (!upcoming.length) {
    elements.reservationsList.innerHTML =
      '<p class="muted-text">No upcoming reservations.</p>';
    return;
  }

  elements.reservationsList.innerHTML = upcoming.map(reservation => {
    const title = escapeHTML(
      reservation.title ??
      reservation.purpose ??
      reservation.className ??
      "Classroom Reservation"
    );

    const start = reservation.startTime ??
      reservation.start ??
      reservation.startsAt;

    const end = reservation.endTime ??
      reservation.end ??
      reservation.endsAt;

    return `
      <article class="reservation-item">
        <div class="reservation-main">
          <h3 class="reservation-title">${title}</h3>
          <p class="reservation-meta">
            ${escapeHTML(formatDateTime(start))}
            ${end ? ` – ${escapeHTML(formatDateTime(end))}` : ""}
          </p>
        </div>
        <span class="reservation-room">
          ${escapeHTML(getReservationRoomLabel(reservation))}
        </span>
      </article>
    `;
  }).join("");
}

async function loadRooms({ silent = false } = {}) {
  if (state.loading) return;

  state.loading = true;

  if (!silent) {
    elements.roomGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-rotate fa-spin"></i>
        <p>Loading classrooms...</p>
      </div>
    `;
  }

  try {
    const response = await apiRequest(CONFIG.ROOMS_ENDPOINT);
    state.rooms = extractRooms(response);
    renderRooms();

    // Some APIs include reservations in each room response.
    // A dedicated reservation endpoint can be added if your backend has one.
    renderReservations();

    syncExpiredAlarms();

    if (!silent) {
      showMessage("Classroom information refreshed.", "success");
    }
  } catch (error) {
    console.error("Unable to load classrooms:", error);

    if (!state.rooms.length) {
      elements.roomGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Unable to load classrooms from the server.</p>
          <p>Check the API URL, backend availability, and endpoint.</p>
        </div>
      `;
    }

    showMessage(error.message || "Unable to load classrooms.", "error");
  } finally {
    state.loading = false;
  }
}

function findRoom(id) {
  return state.rooms.find(
    room => String(getRoomId(room)) === String(id)
  );
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    showMessage("This browser does not support the dialog window.", "error");
  }
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

function updateInitialDurationVisibility() {
  const occupied = elements.roomStatus.value === "OCCUPIED";
  elements.initialDurationGroup.classList.toggle("hidden", !occupied);
  elements.initialDuration.required = occupied;
}

function openExtendDialog(room) {
  elements.extendRoomId.value = getRoomId(room);
  elements.extendRoomLabel.textContent =
    `Room ${getRoomNumber(room)} — ${getRoomName(room)}`;

  openDialog(elements.extendDialog);
}

function toDateTimeLocalValue(date) {
  const pad = value => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes())
  ].join("");
}

function openReservationDialog(room) {
  elements.reservationRoomId.value = getRoomId(room);
  elements.reservationRoomLabel.textContent =
    `Room ${getRoomNumber(room)} — ${getRoomName(room)}`;

  elements.reservationTitle.value = "";

  const start = new Date();
  start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5, 0, 0);

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  elements.reservationStart.value = toDateTimeLocalValue(start);
  elements.reservationEnd.value = toDateTimeLocalValue(end);

  elements.reservationStart.min = toDateTimeLocalValue(new Date());

  openDialog(elements.reservationDialog);
}

async function createRoom(event) {
  event.preventDefault();

  const formData = new FormData(elements.roomForm);

  const roomNumber = String(formData.get("roomNumber") ?? "").trim();
  const roomName = String(formData.get("roomName") ?? "").trim();
  const status = normaliseStatus(formData.get("status"));
  const durationMinutes = Number(formData.get("durationMinutes"));

  if (!roomNumber && !roomName) {
  showMessage(
    "Enter at least a room number or a room name.",
    "error"
  );
  return;
}

  if (
  roomNumber &&
  state.rooms.some(room =>
    String(room.roomNumber ?? room.roomNo ?? room.number ?? "")
    .trim()
    .toLowerCase() === roomNumber.toLowerCase()
  )
) {
  showMessage("That room number is already listed.", "error");
  return;
}

  if (
    status === "OCCUPIED" &&
    (!Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 480)
  ) {
    showMessage("Enter a duration between 1 and 480 minutes.", "error");
    return;
  }

  const payload = {
    roomNumber,
    roomName,
    status
  };

  if (status === "OCCUPIED") {
    payload.durationMinutes = durationMinutes;
  }

  elements.saveRoomBtn.disabled = true;

  try {
    await apiRequest(CONFIG.ROOMS_ENDPOINT, {
      method: "POST",
      body: payload
    });

    closeDialog(elements.roomDialog);
    elements.roomForm.reset();
    elements.initialDuration.value = CONFIG.DEFAULT_DURATION;
    updateInitialDurationVisibility();

    showMessage("Classroom added successfully.", "success");
    await loadRooms({ silent: true });
  } catch (error) {
    console.error("Unable to add classroom:", error);
    showMessage(error.message || "Unable to add classroom.", "error");
  } finally {
    elements.saveRoomBtn.disabled = false;
  }
}

async function startClass(room) {
  const durationMinutes = normaliseStatus(room.status) === "OCCUPIED"
    ? CONFIG.DEFAULT_DURATION
    : CONFIG.DEFAULT_DURATION;

  if (!confirm(
    `Start a ${durationMinutes}-minute class in Room ${getRoomNumber(room)}?`
  )) {
    return;
  }

  try {
    await apiRequest(
      `${CONFIG.ROOMS_ENDPOINT}/${encodeURIComponent(getRoomId(room))}/start`,
      {
        method: "POST",
        body: { durationMinutes }
      }
    );

    showMessage("Class started.", "success");
    await loadRooms({ silent: true });
  } catch (error) {
    console.error("Unable to start class:", error);
    showMessage(error.message || "Unable to start class.", "error");
  }
}

async function endClass(room) {
  if (!confirm(
    `End the current class in Room ${getRoomNumber(room)}?`
  )) {
    return;
  }

  try {
    await apiRequest(
      `${CONFIG.ROOMS_ENDPOINT}/${encodeURIComponent(getRoomId(room))}/end`,
      { method: "POST" }
    );

    stopAlarmForRoom(room);
    showMessage("Class ended.", "success");
    await loadRooms({ silent: true });
  } catch (error) {
    console.error("Unable to end class:", error);
    showMessage(error.message || "Unable to end class.", "error");
  }
}

async function extendClass(event) {
  event.preventDefault();

  const roomId = elements.extendRoomId.value;
  const extraMinutes = Number(elements.extraMinutes.value);

  if (!roomId || !Number.isInteger(extraMinutes) || extraMinutes < 1) {
    showMessage("Select a valid extension duration.", "error");
    return;
  }

  try {
    await apiRequest(
      `${CONFIG.ROOMS_ENDPOINT}/${encodeURIComponent(roomId)}/extend`,
      {
        method: "POST",
        body: { extraMinutes }
      }
    );

    const room = findRoom(roomId);
    if (room) {
      state.alarmedSessions.delete(alarmKey(room));
      stopAlarmForRoom(room);
    }

    closeDialog(elements.extendDialog);
    showMessage(`Class time extended by ${extraMinutes} minutes.`, "success");
    await loadRooms({ silent: true });
  } catch (error) {
    console.error("Unable to extend class:", error);
    showMessage(error.message || "Unable to extend class time.", "error");
  }
}

async function createReservation(event) {
  event.preventDefault();

  const roomId = elements.reservationRoomId.value;
  const title = elements.reservationTitle.value.trim();
  const startValue = elements.reservationStart.value;
  const endValue = elements.reservationEnd.value;

  const startDate = new Date(startValue);
  const endDate = new Date(endValue);

  if (!roomId || !title || !startValue || !endValue) {
    showMessage("Complete all reservation fields.", "error");
    return;
  }

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate <= new Date() ||
    endDate <= startDate
  ) {
    showMessage(
      "Choose a future start time and an end time after the start.",
      "error"
    );
    return;
  }

  const payload = {
    title,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString()
  };

  try {
    await apiRequest(
      `${CONFIG.ROOMS_ENDPOINT}/${encodeURIComponent(roomId)}/reservations`,
      {
        method: "POST",
        body: payload
      }
    );

    closeDialog(elements.reservationDialog);
    showMessage("Reservation saved successfully.", "success");
    await loadRooms({ silent: true });
  } catch (error) {
    console.error("Unable to reserve classroom:", error);
    showMessage(error.message || "Unable to save reservation.", "error");
  }
}

function alarmKey(room) {
  const id = getRoomId(room);
  const deadline = getRoomDeadline(room);

  return `${id}:${deadline ?? "no-deadline"}`;
}

function getAudioContext() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!state.audioContext) {
    state.audioContext = new AudioContextClass();
  }

  return state.audioContext;
}

function playAlarmTone() {
  try {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.0001;

    oscillator.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.04);
    gain.gain.setValueAtTime(0.16, now + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    oscillator.start(now);
    oscillator.stop(now + 0.34);
  } catch (error) {
    console.warn("Browser audio could not play:", error);
  }
}

function startAlarm(room) {
  const key = alarmKey(room);

  if (state.activeAlarmKey === key) return;

  stopAlarm();

  state.activeAlarmKey = key;
  state.alarmedSessions.add(key);

  playAlarmTone();

  state.alarmInterval = setInterval(() => {
    if (state.activeAlarmKey !== key) return;
    playAlarmTone();
  }, 1500);

  showMessage(
    `Class time has ended for Room ${getRoomNumber(room)}. Extend the time or end the class.`,
    "error"
  );
}

function stopAlarm() {
  if (state.alarmInterval) {
    clearInterval(state.alarmInterval);
    state.alarmInterval = null;
  }

  state.activeAlarmKey = null;
}

function stopAlarmForRoom(room) {
  const key = alarmKey(room);

  if (state.activeAlarmKey === key) {
    stopAlarm();
  }

  state.alarmedSessions.delete(key);
}

function syncExpiredAlarms() {
  const occupiedRooms = state.rooms.filter(
    room => normaliseStatus(room.status) === "OCCUPIED"
  );

  const expiredRooms = occupiedRooms.filter(room => {
    const deadline = getRoomDeadline(room);
    return deadline !== null && deadline <= Date.now();
  });

  if (!expiredRooms.length) {
    stopAlarm();
    return;
  }

  const room = expiredRooms[0];
  const key = alarmKey(room);

  if (!state.alarmedSessions.has(key)) {
    startAlarm(room);
  }
}

function updateCountdowns() {
  const now = Date.now();

  document.querySelectorAll("[data-room-timer]").forEach(timer => {
    const deadline = Number(timer.dataset.deadline);
    if (!Number.isFinite(deadline)) return;

    const remaining = deadline - now;

    timer.textContent = remaining <= 0
      ? "00:00:00"
      : formatCountdown(remaining);

    timer.classList.toggle("timer-expired", remaining <= 0);
  });

  const occupiedRooms = state.rooms.filter(
    room => normaliseStatus(room.status) === "OCCUPIED"
  );

  const expiredRooms = occupiedRooms.filter(room => {
    const deadline = getRoomDeadline(room);
    return deadline !== null && deadline <= now;
  });

  if (expiredRooms.length) {
    const room = expiredRooms[0];
    const key = alarmKey(room);

    if (!state.alarmedSessions.has(key)) {
      startAlarm(room);
    }
  }
}

function handleRoomAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const room = findRoom(button.dataset.id);

  if (!room) {
    showMessage("This classroom is no longer in the current list. Refresh and try again.", "error");
    return;
  }

  switch (button.dataset.action) {
    case "start":
      startClass(room);
      break;

    case "end":
      endClass(room);
      break;

    case "extend":
      openExtendDialog(room);
      break;

    case "reserve":
      openReservationDialog(room);
      break;

    default:
      break;
  }
}

function initialisePage() {
  $("#backBtn").addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "faculty-dashboard.html";
    }
  });

  $("#refreshBtn").addEventListener("click", () => {
    loadRooms();
  });

  $("#addRoomBtn").addEventListener("click", () => {
    elements.roomForm.reset();
    elements.initialDuration.value = CONFIG.DEFAULT_DURATION;
    updateInitialDurationVisibility();
    openDialog(elements.roomDialog);
  });

  elements.roomStatus.addEventListener(
    "change",
    updateInitialDurationVisibility
  );

  elements.roomForm.addEventListener("submit", createRoom);
  elements.extendForm.addEventListener("submit", extendClass);
  elements.reservationForm.addEventListener("submit", createReservation);

  elements.roomGrid.addEventListener("click", handleRoomAction);

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.close);
      if (dialog) closeDialog(dialog);
    });
  });

  [elements.roomDialog, elements.extendDialog, elements.reservationDialog]
    .forEach(dialog => {
      dialog.addEventListener("click", event => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

  elements.reservationStart.addEventListener("change", () => {
    if (!elements.reservationStart.value) return;

    elements.reservationEnd.min = elements.reservationStart.value;

    if (
      elements.reservationEnd.value &&
      elements.reservationEnd.value <= elements.reservationStart.value
    ) {
      const start = new Date(elements.reservationStart.value);
      start.setHours(start.getHours() + 1);
      elements.reservationEnd.value = toDateTimeLocalValue(start);
    }
  });

  // Browsers may require a user gesture before playing alarm audio.
  document.addEventListener("click", () => {
    const context = getAudioContext();

    if (context && context.state === "suspended") {
      context.resume().catch(() => {});
    }
  }, { once: true });

  updateInitialDurationVisibility();
  loadRooms();

  state.countdownInterval = setInterval(updateCountdowns, 1000);

  setInterval(() => {
    loadRooms({ silent: true });
  }, CONFIG.REFRESH_INTERVAL);
}

document.addEventListener("DOMContentLoaded", initialisePage);
