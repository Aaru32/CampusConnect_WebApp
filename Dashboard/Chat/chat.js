"use strict";

/* =========================================================
   CAMPUSCONNECT
   CHAT MODULE
   API-READY JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CHAT_CONFIG = {
    API_BASE_URL: "/api/chat",
    MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024,
    MAX_MESSAGE_LENGTH: 5000
};


/* =========================================================
   STATE
========================================================= */

let currentUser = null;
let currentGroup = null;
let currentGroupId = null;
let currentMessages = [];
let currentGroups = [];

let replyToMessage = null;
let selectedAttachment = null;
let editingMessageId = null;
let messageSearchTimeout = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const backButton = document.getElementById("backButton");

const groupList = document.getElementById("groupList");
const groupSearchForm = document.getElementById("groupSearchForm");
const groupSearchInput = document.getElementById("groupSearchInput");
const groupSearchResults = document.getElementById("groupSearchResults");

const chatMain = document.querySelector(".chat-main");
const groupsPanel = document.querySelector(".groups-panel");
const conversationPanel = document.querySelector(".conversation-panel");

const groupsBackButton = document.getElementById("groupsBackButton");

const conversationEmptyState =
    document.getElementById("conversationEmptyState");

const conversationContent =
    document.getElementById("conversationContent");

const conversationTitle =
    document.getElementById("conversationTitle");

const conversationDescription =
    document.getElementById("conversationDescription");

const messagesContainer =
    document.getElementById("messagesContainer");

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const attachmentButton =
    document.getElementById("attachmentButton");

const attachmentInput =
    document.getElementById("attachmentInput");

const attachmentPreview =
    document.getElementById("attachmentPreview");

const replyPreview = document.getElementById("replyPreview");
const cancelReplyButton =
    document.getElementById("cancelReplyButton");

const messageSearchForm =
    document.getElementById("messageSearchForm");

const messageSearchInput =
    document.getElementById("messageSearchInput");

const messageSearchResults =
    document.getElementById("messageSearchResults");


/* =========================================================
   API HELPER
========================================================= */

async function chatApiRequest(endpoint, options = {}) {
    const url = `${CHAT_CONFIG.API_BASE_URL}${endpoint}`;

    const requestOptions = {
        method: options.method || "GET",
        headers: {
            ...(options.headers || {})
        },
        credentials: "same-origin"
    };

    if (options.body instanceof FormData) {
        requestOptions.body = options.body;
    } else if (options.body !== undefined) {
        requestOptions.headers["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestOptions);

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";

    let result = null;

    if (contentType.includes("application/json")) {
        result = await response.json();
    } else {
        result = await response.text();
    }

    if (!response.ok) {
        let message = "The request could not be completed.";

        if (result && typeof result === "object") {
            message =
                result.message ||
                result.error ||
                message;
        } else if (typeof result === "string" && result.trim()) {
            message = result;
        }

        throw new Error(message);
    }

    return result;
}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


function getInitials(name) {
    const words = String(name || "User")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
        return "U";
    }

    return words
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}


function getUserId(user) {
    if (!user) {
        return null;
    }

    return user.id ?? user.userId ?? user.studentId ?? null;
}


function getMessageId(message) {
    return message?.id ?? message?.messageId ?? null;
}


function getGroupId(group) {
    return group?.id ?? group?.groupId ?? null;
}


function getUserName(user) {
    if (!user) {
        return "Unknown user";
    }

    return (
        user.name ||
        user.fullName ||
        user.displayName ||
        user.username ||
        "Unknown user"
    );
}


function getMessageSender(message) {
    if (message?.sender) {
        return message.sender;
    }

    if (message?.user) {
        return message.user;
    }

    return {
        id: message?.senderId ?? message?.userId ?? null,
        name:
            message?.senderName ||
            message?.userName ||
            "Unknown user"
    };
}


function getMessageText(message) {
    return (
        message?.content ??
        message?.text ??
        message?.message ??
        ""
    );
}


function getMessageTimestamp(message) {
    return (
        message?.createdAt ||
        message?.timestamp ||
        message?.sentAt ||
        message?.updatedAt ||
        null
    );
}


function formatTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


function formatDateLabel(value) {
    if (!value) {
        return "Unknown date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    const today = new Date();

    const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    if (isToday) {
        return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
        return "Yesterday";
    }

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year:
            date.getFullYear() === today.getFullYear()
                ? undefined
                : "numeric"
    });
}


function showMessage(container, message, type = "info") {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    const element = document.createElement("div");
    element.className = `chat-status-message ${type}`;
    element.textContent = message;

    container.appendChild(element);
}


function clearMessage(container) {
    if (container) {
        container.innerHTML = "";
    }
}


function normalizeArray(response, possibleKeys = []) {
    if (Array.isArray(response)) {
        return response;
    }

    if (!response || typeof response !== "object") {
        return [];
    }

    for (const key of possibleKeys) {
        if (Array.isArray(response[key])) {
            return response[key];
        }
    }

    return [];
}


function scrollMessagesToBottom() {
    if (!messagesContainer) {
        return;
    }

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


function isOwnMessage(message) {
    const sender = getMessageSender(message);

    const currentId = getUserId(currentUser);
    const senderId = getUserId(sender);

    if (
        currentId !== null &&
        senderId !== null
    ) {
        return String(currentId) === String(senderId);
    }

    return false;
}


/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeChat() {
    attachEventListeners();

    showMessage(
        groupList,
        "Loading conversations...",
        "info"
    );

    try {
        await loadCurrentUser();
        await loadGroups();
        await loadUnreadCount();
    } catch (error) {
        console.error("Chat initialization error:", error);
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function attachEventListeners() {
    if (backButton) {
        backButton.addEventListener("click", handleBackButton);
    }

    if (groupsBackButton) {
        groupsBackButton.addEventListener("click", closeCurrentConversation);
    }

    if (groupSearchForm) {
        groupSearchForm.addEventListener("submit", handleGroupSearch);
    }

    if (groupSearchInput) {
        groupSearchInput.addEventListener("input", handleGroupSearchInput);
    }

    if (messageForm) {
        messageForm.addEventListener("submit", handleSendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener("input", autoResizeMessageInput);
        messageInput.addEventListener("keydown", handleMessageKeydown);
    }

    if (attachmentButton && attachmentInput) {
        attachmentButton.addEventListener("click", () => {
            attachmentInput.click();
        });
    }

    if (attachmentInput) {
        attachmentInput.addEventListener("change", handleAttachmentSelection);
    }

    if (cancelReplyButton) {
        cancelReplyButton.addEventListener("click", clearReply);
    }

    if (messageSearchForm) {
        messageSearchForm.addEventListener("submit", handleMessageSearch);
    }

    if (messageSearchInput) {
        messageSearchInput.addEventListener("input", () => {
            clearTimeout(messageSearchTimeout);

            messageSearchTimeout = setTimeout(() => {
                if (messageSearchInput.value.trim()) {
                    searchMessages(messageSearchInput.value.trim());
                } else {
                    clearMessage(messageSearchResults);
                }
            }, 350);
        });
    }

    if (messagesContainer) {
        messagesContainer.addEventListener(
            "click",
            handleMessageContainerClick
        );
    }

    if (groupList) {
        groupList.addEventListener("click", handleGroupListClick);
    }
}


/* =========================================================
   BACK BUTTON
========================================================= */

function handleBackButton() {
    if (window.history.length > 1) {
        window.history.back();
        return;
    }

    window.location.href = "../Student/student-dashboard.html";
}


/* =========================================================
   CURRENT USER
========================================================= */

async function loadCurrentUser() {
    try {
        const response = await chatApiRequest("/me");

        currentUser =
            response?.user ||
            response?.data ||
            response ||
            null;

        return currentUser;
    } catch (error) {
        console.error("Could not load current user:", error);
        currentUser = null;
        throw error;
    }
}


/* =========================================================
   GROUPS / CONVERSATIONS
========================================================= */

async function loadGroups() {
    try {
        const response = await chatApiRequest("/groups");

        currentGroups = normalizeArray(response, [
            "groups",
            "data",
            "items"
        ]);

        renderGroups(currentGroups);

    } catch (error) {
        console.error("Could not load conversations:", error);

        showMessage(
            groupList,
            "Unable to load conversations. Please try again.",
            "error"
        );
    }
}


function renderGroups(groups) {
    if (!groupList) {
        return;
    }

    groupList.innerHTML = "";

    if (!groups.length) {
        showMessage(
            groupList,
            "No conversations available.",
            "empty"
        );
        return;
    }

    groups.forEach(group => {
        const groupId = getGroupId(group);

        const title =
            group.name ||
            group.title ||
            group.groupName ||
            "Conversation";

        const lastMessage =
            group.lastMessage?.content ||
            group.lastMessage?.text ||
            group.lastMessage ||
            group.lastMessageText ||
            "No messages yet";

        const unreadCount = Number(
            group.unreadCount ||
            group.unreadMessages ||
            0
        );

        const avatar = group.avatarUrl || group.avatar || "";

        const item = document.createElement("button");

        item.type = "button";
        item.className = "group-item";
        item.dataset.groupId = groupId ?? "";

        if (
            currentGroupId !== null &&
            String(currentGroupId) === String(groupId)
        ) {
            item.classList.add("active");
        }

        item.innerHTML = `
            <div class="group-avatar">
                ${
                    avatar
                        ? `<img src="${escapeHTML(avatar)}"
                                alt=""
                                loading="lazy">`
                        : `<span>${escapeHTML(getInitials(title))}</span>`
                }
            </div>

            <div class="group-details">
                <div class="group-top-row">
                    <h3 class="group-name">
                        ${escapeHTML(title)}
                    </h3>

                    <span class="group-time">
                        ${escapeHTML(
                            formatTime(
                                group.lastMessage?.createdAt ||
                                group.lastMessage?.timestamp ||
                                group.updatedAt
                            )
                        )}
                    </span>
                </div>

                <div class="group-bottom-row">
                    <p class="group-last-message">
                        ${escapeHTML(
                            typeof lastMessage === "string"
                                ? lastMessage
                                : "Attachment"
                        )}
                    </p>

                    ${
                        unreadCount > 0
                            ? `<span class="group-unread-badge">
                                    ${unreadCount > 99 ? "99+" : unreadCount}
                               </span>`
                            : ""
                    }
                </div>
            </div>
        `;

        groupList.appendChild(item);
    });
}


function handleGroupListClick(event) {
    const item = event.target.closest("[data-group-id]");

    if (!item) {
        return;
    }

    const groupId = item.dataset.groupId;

    const group = currentGroups.find(
        entry => String(getGroupId(entry)) === String(groupId)
    );

    if (group) {
        openGroup(group);
    }
}


async function openGroup(group) {
    currentGroup = group;
    currentGroupId = getGroupId(group);

    replyToMessage = null;
    editingMessageId = null;

    clearReply();
    clearAttachmentPreview();

    if (conversationTitle) {
        conversationTitle.textContent =
            group.name ||
            group.title ||
            group.groupName ||
            "Conversation";
    }

    if (conversationDescription) {
        conversationDescription.textContent =
            group.description ||
            group.memberDescription ||
            "";
    }

    if (conversationEmptyState) {
        conversationEmptyState.hidden = true;
    }

    if (conversationContent) {
        conversationContent.hidden = false;
    }

    if (chatMain) {
        chatMain.classList.add("conversation-open");
    }

    if (conversationPanel) {
        conversationPanel.classList.add("mobile-visible");
    }

    renderGroups(currentGroups);

    await loadMessages(currentGroupId);
    await markGroupAsRead(currentGroupId);
}


/* =========================================================
   MOBILE CONVERSATION NAVIGATION
========================================================= */

function closeCurrentConversation() {
    if (chatMain) {
        chatMain.classList.remove("conversation-open");
    }

    if (groupsPanel) {
        groupsPanel.classList.remove("mobile-hidden");
    }

    if (conversationPanel) {
        conversationPanel.classList.remove("mobile-visible");
    }

    currentGroup = null;
    currentGroupId = null;

    renderGroups(currentGroups);

    if (conversationEmptyState) {
        conversationEmptyState.hidden = false;
    }

    if (conversationContent) {
        conversationContent.hidden = true;
    }
}


/* =========================================================
   MESSAGES
========================================================= */

async function loadMessages(groupId) {
    if (!groupId) {
        return;
    }

    if (messagesContainer) {
        showMessage(
            messagesContainer,
            "Loading messages...",
            "info"
        );
    }

    try {
        const response = await chatApiRequest(
            `/groups/${encodeURIComponent(groupId)}/messages`
        );

        currentMessages = normalizeArray(response, [
            "messages",
            "data",
            "items"
        ]);

        renderMessages(currentMessages);

    } catch (error) {
        console.error("Could not load messages:", error);

        showMessage(
            messagesContainer,
            "Unable to load messages. Please try again.",
            "error"
        );
    }
}


function renderMessages(messages) {
    if (!messagesContainer) {
        return;
    }

    messagesContainer.innerHTML = "";

    if (!messages.length) {
        showMessage(
            messagesContainer,
            "No messages yet. Start the conversation.",
            "empty"
        );
        return;
    }

    let previousDateLabel = "";

    messages.forEach(message => {
        const timestamp = getMessageTimestamp(message);
        const dateLabel = formatDateLabel(timestamp);

        if (dateLabel && dateLabel !== previousDateLabel) {
            const dateDivider = document.createElement("div");

            dateDivider.className = "message-date-divider";
            dateDivider.innerHTML = `
                <span>${escapeHTML(dateLabel)}</span>
            `;

            messagesContainer.appendChild(dateDivider);
            previousDateLabel = dateLabel;
        }

        const messageElement = createMessageElement(message);

        messagesContainer.appendChild(messageElement);
    });

    scrollMessagesToBottom();
}


function createMessageElement(message) {
    const sender = getMessageSender(message);
    const ownMessage = isOwnMessage(message);

    const messageId = getMessageId(message);
    const text = getMessageText(message);
    const timestamp = getMessageTimestamp(message);

    const wrapper = document.createElement("div");

    wrapper.className = ownMessage
        ? "message-row own-message"
        : "message-row";

    wrapper.dataset.messageId = messageId ?? "";

    const attachment = message.attachment || message.file || null;

    const deleted = Boolean(
        message.deleted ||
        message.isDeleted ||
        message.deletedAt
    );

    const edited = Boolean(
        message.edited ||
        message.isEdited ||
        message.editedAt
    );

    const reply = message.replyTo || message.reply || null;

    let attachmentHTML = "";

    if (!deleted && attachment) {
        const attachmentUrl =
            attachment.url ||
            attachment.downloadUrl ||
            attachment.fileUrl ||
            "";

        const attachmentName =
            attachment.name ||
            attachment.fileName ||
            "Attachment";

        const attachmentType =
            attachment.type ||
            attachment.mimeType ||
            "";

        if (
            attachmentUrl &&
            attachmentType.startsWith("image/")
        ) {
            attachmentHTML = `
                <a class="message-attachment-image"
                   href="${escapeHTML(attachmentUrl)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    <img src="${escapeHTML(attachmentUrl)}"
                         alt="${escapeHTML(attachmentName)}"
                         loading="lazy">
                </a>
            `;
        } else if (attachmentUrl) {
            attachmentHTML = `
                <a class="message-attachment"
                   href="${escapeHTML(attachmentUrl)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    <i class="fa-solid fa-paperclip"></i>
                    <span>${escapeHTML(attachmentName)}</span>
                </a>
            `;
        }
    }

    let replyHTML = "";

    if (reply) {
        const replySender =
            reply.senderName ||
            reply.sender?.name ||
            "Message";

        const replyText =
            reply.content ||
            reply.text ||
            "Attachment";

        replyHTML = `
            <div class="message-reply-reference">
                <strong>${escapeHTML(replySender)}</strong>
                <span>${escapeHTML(replyText)}</span>
            </div>
        `;
    }

    const messageTextHTML = deleted
        ? `<p class="deleted-message">This message was deleted.</p>`
        : `<p class="message-text">${escapeHTML(text)}</p>`;

    const actionsHTML = ownMessage && !deleted
        ? `
            <div class="message-actions">
                <button type="button"
                        class="message-action"
                        data-action="reply"
                        data-message-id="${escapeHTML(messageId ?? "")}"
                        aria-label="Reply to message"
                        title="Reply">
                    <i class="fa-solid fa-reply"></i>
                </button>

                <button type="button"
                        class="message-action"
                        data-action="edit"
                        data-message-id="${escapeHTML(messageId ?? "")}"
                        aria-label="Edit message"
                        title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button type="button"
                        class="message-action"
                        data-action="delete"
                        data-message-id="${escapeHTML(messageId ?? "")}"
                        aria-label="Delete message"
                        title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `
        : `
            <div class="message-actions">
                ${
                    !deleted
                        ? `<button type="button"
                                   class="message-action"
                                   data-action="reply"
                                   data-message-id="${escapeHTML(messageId ?? "")}"
                                   aria-label="Reply to message"
                                   title="Reply">
                                <i class="fa-solid fa-reply"></i>
                           </button>`
                        : ""
                }
            </div>
        `;

    wrapper.innerHTML = `
        <div class="message-avatar">
            ${escapeHTML(getInitials(getUserName(sender)))}
        </div>

        <div class="message-content">
            <div class="message-sender">
                ${escapeHTML(getUserName(sender))}
            </div>

            <div class="message-bubble">
                ${replyHTML}
                ${messageTextHTML}
                ${attachmentHTML}

                <div class="message-footer">
                    <span class="message-time">
                        ${escapeHTML(formatTime(timestamp))}
                    </span>

                    ${edited && !deleted
                        ? `<span class="message-edited">Edited</span>`
                        : ""
                    }

                    ${ownMessage && message.read
                        ? `<i class="fa-solid fa-check-double message-read-status"
                              aria-label="Read"></i>`
                        : ""
                    }
                </div>
            </div>

            ${actionsHTML}
        </div>
    `;

    return wrapper;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function handleSendMessage(event) {
    event.preventDefault();

    if (!currentGroupId) {
        alert("Please select a conversation first.");
        return;
    }

    const text = messageInput?.value.trim() || "";

    if (!text && !selectedAttachment) {
        return;
    }

    if (text.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
        alert(
            `Messages cannot exceed ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters.`
        );
        return;
    }

    if (sendButton) {
        sendButton.disabled = true;
    }

    try {
        if (editingMessageId !== null) {
            await updateMessage(editingMessageId, text);
            editingMessageId = null;
        } else {
            await createMessage(text);
        }

        if (messageInput) {
            messageInput.value = "";
            messageInput.style.height = "";
        }

        clearReply();
        clearAttachmentPreview();

        await loadMessages(currentGroupId);
        await loadGroups();

    } catch (error) {
        console.error("Could not send message:", error);

        alert(
            error.message ||
            "Unable to send the message. Please try again."
        );
    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }

        messageInput?.focus();
    }
}


async function createMessage(text) {
    const endpoint =
        `/groups/${encodeURIComponent(currentGroupId)}/messages`;

    let body;

    if (selectedAttachment) {
        body = new FormData();

        body.append("content", text);

        if (replyToMessage) {
            body.append(
                "replyToMessageId",
                String(getMessageId(replyToMessage))
            );
        }

        body.append("attachment", selectedAttachment);
    } else {
        body = {
            content: text
        };

        if (replyToMessage) {
            body.replyToMessageId =
                getMessageId(replyToMessage);
        }
    }

    await chatApiRequest(endpoint, {
        method: "POST",
        body
    });
}


/* =========================================================
   EDIT MESSAGE
========================================================= */

async function updateMessage(messageId, text) {
    if (!messageId) {
        throw new Error("Message ID is missing.");
    }

    await chatApiRequest(
        `/messages/${encodeURIComponent(messageId)}`,
        {
            method: "PATCH",
            body: {
                content: text
            }
        }
    );
}


/* =========================================================
   DELETE MESSAGE
========================================================= */

async function deleteMessage(messageId) {
    if (!messageId) {
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to delete this message?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await chatApiRequest(
            `/messages/${encodeURIComponent(messageId)}`,
            {
                method: "DELETE"
            }
        );

        await loadMessages(currentGroupId);
        await loadGroups();

    } catch (error) {
        console.error("Could not delete message:", error);

        alert(
            error.message ||
            "Unable to delete the message. Please try again."
        );
    }
}


/* =========================================================
   MESSAGE ACTIONS
========================================================= */

function handleMessageContainerClick(event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const messageId = button.dataset.messageId;

    const message = currentMessages.find(
        entry =>
            String(getMessageId(entry)) === String(messageId)
    );

    if (!message) {
        return;
    }

    if (action === "reply") {
        setReply(message);
        return;
    }

    if (action === "edit") {
        if (!isOwnMessage(message)) {
            return;
        }

        beginEditMessage(message);
        return;
    }

    if (action === "delete") {
        if (!isOwnMessage(message)) {
            return;
        }

        deleteMessage(messageId);
    }
}


/* =========================================================
   REPLY TO MESSAGE
========================================================= */

function setReply(message) {
    replyToMessage = message;

    if (!replyPreview) {
        return;
    }

    const sender = getMessageSender(message);
    const text = getMessageText(message);

    replyPreview.innerHTML = `
        <div class="reply-preview-content">
            <strong>${escapeHTML(getUserName(sender))}</strong>
            <span>${escapeHTML(text || "Attachment")}</span>
        </div>

        <button type="button"
                id="cancelReplyButton"
                aria-label="Cancel reply"
                title="Cancel reply">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    replyPreview.hidden = false;

    const cancelButton =
        document.getElementById("cancelReplyButton");

    if (cancelButton) {
        cancelButton.addEventListener("click", clearReply);
    }

    messageInput?.focus();
}


function clearReply() {
    replyToMessage = null;

    if (replyPreview) {
        replyPreview.innerHTML = "";
        replyPreview.hidden = true;
    }
}


/* =========================================================
   EDIT MESSAGE UI
========================================================= */

function beginEditMessage(message) {
    if (!messageInput) {
        return;
    }

    editingMessageId = getMessageId(message);

    messageInput.value = getMessageText(message);
    messageInput.focus();

    autoResizeMessageInput();

    if (sendButton) {
        const icon = sendButton.querySelector("i");

        if (icon) {
            icon.className = "fa-solid fa-check";
        } else {
            sendButton.textContent = "Save";
        }
    }
}


/* =========================================================
   MESSAGE INPUT
========================================================= */

function autoResizeMessageInput() {
    if (!messageInput) {
        return;
    }

    messageInput.style.height = "auto";

    messageInput.style.height =
        `${Math.min(messageInput.scrollHeight, 140)}px`;
}


function handleMessageKeydown(event) {
    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
    ) {
        event.preventDefault();

        if (messageForm?.requestSubmit) {
            messageForm.requestSubmit();
        } else {
            messageForm?.dispatchEvent(
                new Event("submit", {
                    bubbles: true,
                    cancelable: true
                })
            );
        }
    }

    if (event.key === "Escape" && editingMessageId !== null) {
        editingMessageId = null;
        messageInput.value = "";
        messageInput.style.height = "";
    }
}


/* =========================================================
   ATTACHMENTS
========================================================= */

function handleAttachmentSelection(event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    if (file.size > CHAT_CONFIG.MAX_ATTACHMENT_SIZE) {
        alert("Attachments cannot exceed 10 MB.");

        attachmentInput.value = "";
        return;
    }

    selectedAttachment = file;
    renderAttachmentPreview(file);
}


function renderAttachmentPreview(file) {
    if (!attachmentPreview) {
        return;
    }

    attachmentPreview.innerHTML = `
        <div class="attachment-preview-item">
            <i class="fa-solid fa-paperclip"></i>

            <span class="attachment-preview-name">
                ${escapeHTML(file.name)}
            </span>

            <button type="button"
                    id="removeAttachmentButton"
                    aria-label="Remove attachment"
                    title="Remove attachment">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `;

    attachmentPreview.hidden = false;

    document
        .getElementById("removeAttachmentButton")
        ?.addEventListener("click", clearAttachmentPreview);
}


function clearAttachmentPreview() {
    selectedAttachment = null;

    if (attachmentInput) {
        attachmentInput.value = "";
    }

    if (attachmentPreview) {
        attachmentPreview.innerHTML = "";
        attachmentPreview.hidden = true;
    }
}


/* =========================================================
   GROUP SEARCH
========================================================= */

function handleGroupSearch(event) {
    event.preventDefault();

    const query = groupSearchInput?.value.trim().toLowerCase() || "";

    if (!query) {
        renderGroups(currentGroups);
        clearMessage(groupSearchResults);
        return;
    }

    const filteredGroups = currentGroups.filter(group => {
        const title =
            group.name ||
            group.title ||
            group.groupName ||
            "";

        const description = group.description || "";

        return (
            title.toLowerCase().includes(query) ||
            description.toLowerCase().includes(query)
        );
    });

    renderGroups(filteredGroups);
}


function handleGroupSearchInput() {
    const query = groupSearchInput?.value.trim() || "";

    if (!query) {
        renderGroups(currentGroups);
        clearMessage(groupSearchResults);
        return;
    }

    handleGroupSearch({
        preventDefault() {}
    });
}


/* =========================================================
   MESSAGE SEARCH
========================================================= */

async function handleMessageSearch(event) {
    event.preventDefault();

    const query = messageSearchInput?.value.trim() || "";

    if (!query) {
        clearMessage(messageSearchResults);
        return;
    }

    await searchMessages(query);
}


async function searchMessages(query) {
    if (!query) {
        return;
    }

    try {
        const response = await chatApiRequest(
            `/messages/search?query=${encodeURIComponent(query)}`
        );

        const results = normalizeArray(response, [
            "messages",
            "results",
            "data",
            "items"
        ]);

        renderMessageSearchResults(results);

    } catch (error) {
        console.error("Message search failed:", error);

        showMessage(
            messageSearchResults,
            "Unable to search messages. Please try again.",
            "error"
        );
    }
}


function renderMessageSearchResults(results) {
    if (!messageSearchResults) {
        return;
    }

    messageSearchResults.innerHTML = "";

    if (!results.length) {
        showMessage(
            messageSearchResults,
            "No matching messages found.",
            "empty"
        );
        return;
    }

    results.forEach(message => {
        const sender = getMessageSender(message);

        const item = document.createElement("button");

        item.type = "button";
        item.className = "message-search-result";

        item.innerHTML = `
            <strong>${escapeHTML(getUserName(sender))}</strong>
            <span>${escapeHTML(getMessageText(message))}</span>
            <small>
                ${escapeHTML(
                    formatTime(getMessageTimestamp(message))
                )}
            </small>
        `;

        item.addEventListener("click", () => {
            const resultGroupId =
                message.groupId ||
                message.conversationId ||
                message.group?.id;

            if (resultGroupId) {
                const group = currentGroups.find(
                    entry =>
                        String(getGroupId(entry)) ===
                        String(resultGroupId)
                );

                if (group) {
                    openGroup(group);
                }
            }
        });

        messageSearchResults.appendChild(item);
    });
}


/* =========================================================
   UNREAD COUNT
========================================================= */

async function loadUnreadCount() {
    try {
        const response = await chatApiRequest("/unread-count");

        const unreadCount = Number(
            response?.count ??
            response?.unreadCount ??
            response?.data?.count ??
            0
        );

        updateUnreadBadges(unreadCount);

    } catch (error) {
        /*
         * The chat page does not contain student bottom navigation.
         * A failed unread-count request should not prevent chat use.
         */
        console.warn("Could not load chat unread count:", error);
    }
}


function updateUnreadBadges(count) {
    const badges = document.querySelectorAll(
        "[data-chat-unread-badge]"
    );

    badges.forEach(badge => {
        badge.textContent = count > 99 ? "99+" : String(count);
        badge.hidden = count <= 0;
    });
}


/* =========================================================
   MARK CONVERSATION AS READ
========================================================= */

async function markGroupAsRead(groupId) {
    if (!groupId) {
        return;
    }

    try {
        await chatApiRequest(
            `/groups/${encodeURIComponent(groupId)}/read`,
            {
                method: "POST"
            }
        );

        const group = currentGroups.find(
            entry =>
                String(getGroupId(entry)) === String(groupId)
        );

        if (group) {
            group.unreadCount = 0;
            group.unreadMessages = 0;
        }

        renderGroups(currentGroups);
        await loadUnreadCount();

    } catch (error) {
        console.warn("Could not mark conversation as read:", error);
    }
}


/* =========================================================
   START CHAT
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeChat
    );
} else {
    initializeChat();
}