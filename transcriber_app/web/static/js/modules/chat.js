/**
 * Módulo de chat
 * Gestiona el panel de chat y mensajes
 */

import { chatStream } from "./api.js";
import { elements } from "./domElements.js";
import { hideOverlay, showOverlay } from "./ui.js";
import { formatAsHTML, parseMarkdown } from "./utils.js";

let chatHistory = [];

/**
 * Añade un mensaje al chat
 */
function addMessage(text, sender = "user", returnNode = false) {
    if (!elements.chatMessages) return null;

    const div = document.createElement("div");
    div.className = sender === "user" ? "msg-user" : "msg-ai";
    div.innerHTML = formatAsHTML(text);
    elements.chatMessages.appendChild(div);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    return returnNode ? div : null;
}

/**
 * Envía un mensaje de chat
 */
async function sendMessage() {
    const msg = elements.chatInput?.value?.trim() || "";
    if (!msg) return;

    const nombre = document.getElementById("nombre")?.value?.trim() || "";
    const transcripcion = elements.transcripcionTexto?.textContent?.trim() || "";
    const resumen = elements.mdResult?.textContent?.trim() || "";
    const modo = document.getElementById("modo")?.value || "";

    // Validar que hay contenido
    if (!transcripcion && !resumen) {
        alert("No hay transcripción ni resumen disponible para chatear.");
        return;
    }

    addMessage(msg, "user");
    if (elements.chatInput) elements.chatInput.value = "";
    chatHistory.push({ role: "user", content: msg });

    const aiMsg = addMessage("", "ai", true);
    showOverlay();

    try {
        let acumulado = "";
        let textoFinal = "";

        for await (const parcial of chatStream(msg, modo, transcripcion, resumen)) {
            hideOverlay();
            acumulado += parcial;

            // Mostrar texto en vivo sin parsear markdown
            if (aiMsg) aiMsg.innerHTML = `<pre>${acumulado}</pre>`;
            textoFinal = acumulado;
        }

        // Cuando termina el streaming → renderizamos markdown completo
        if (aiMsg) aiMsg.innerHTML = parseMarkdown(textoFinal);
        chatHistory.push({ role: "assistant", content: textoFinal });

    } catch (e) {
        if (aiMsg) aiMsg.innerHTML = formatAsHTML("Error al procesar la respuesta.");
        console.error("Error en chat:", e);
    }
}

/**
 * Limpia el historial de chat
 */
function clearChatHistory() {
    chatHistory = [];
}

/**
 * Obtiene el historial de chat
 */
function getChatHistory() {
    return chatHistory;
}

/**
 * Abre/cierra el panel de chat
 */
function toggleChatPanel() {
    if (!elements.chatPanel || !elements.chatToggle) return;

    const isOpening = !elements.chatPanel.classList.contains("open");
    elements.chatPanel.classList.toggle("open");
    elements.chatToggle.classList.toggle("hidden");
    document.body.classList.toggle("chat-open", isOpening);
}

/**
 * Cierra el panel de chat
 */
function closeChatPanel() {
    if (elements.chatPanel) {
        elements.chatPanel.classList.remove("open");
    }
    if (elements.chatToggle) {
        elements.chatToggle.classList.remove("hidden");
    }
    document.body.classList.remove("chat-open");
}

export {
    addMessage, clearChatHistory, closeChatPanel, getChatHistory, sendMessage, toggleChatPanel
};

