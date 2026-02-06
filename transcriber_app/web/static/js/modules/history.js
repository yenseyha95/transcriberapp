/**
 * Módulo de historial
 * Gestiona el panel lateral de historial de transcripciones
 */

import { addProcessedMode, getProcessedModes, resetProcessedModes, setLastRecordingBlob } from "./appState.js";
import { elements } from "./domElements.js";
import { getFormValues, setFormName, validateSessionName } from "./form.js";
import { getAllTranscriptions, getTranscriptionById } from "./historyStorage.js";
import { clearTranscriptionAndResults, updateRecordingButtonsState, updateSendButtonState } from "./ui.js";
import { parseMarkdown, reconstructBlob } from "./utils.js";

/**
 * Alterna la visibilidad del panel de historial
 */
async function toggleHistoryPanel() {
    if (!elements.historyPanel) return;

    const isOpening = !elements.historyPanel.classList.contains("open");
    elements.historyPanel.classList.toggle("open");
    document.body.classList.toggle("history-open", isOpening);

    if (isOpening) {
        await loadHistoryItems();
    }
}

/**
 * Carga la lista de items del historial
 */
async function loadHistoryItems() {
    if (!elements.historyList) return;

    elements.historyList.innerHTML = "";
    try {
        const items = await getAllTranscriptions();
        items
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .forEach(item => {
                const li = document.createElement("li");
                const fecha = new Date(item.fecha).toLocaleString();
                li.textContent = `${item.nombre} (${fecha})`;
                li.tabIndex = 0;
                li.onclick = () => loadTranscriptionFromHistory(item.id);
                li.onkeypress = (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        loadTranscriptionFromHistory(item.id);
                    }
                };
                elements.historyList.appendChild(li);
            });

    } catch (error) {
        console.error("Error cargando historial:", error);
        if (elements.historyList) {
            elements.historyList.innerHTML = "<li>Error cargando historial</li>";
        }
    }
}

/**
 * Carga una transcripción desde el historial
 */
async function loadTranscriptionFromHistory(id) {
    try {
        const item = await getTranscriptionById(id);
        if (!item) {
            alert("No se encontró la transcripción.");
            return;
        }

        // Limpiar todo lo anterior
        clearTranscriptionAndResults();

        // Resetear modos procesados y cargar los del historial
        resetProcessedModes();
        const modesDelHistorial = Object.keys(item.resumenes || {});
        modesDelHistorial.forEach(modo => addProcessedMode(modo));

        // Rellenar nombre
        setFormName(item.nombre);

        // Transcripciones: una o varias
        if (elements.transcripcionTexto) {
            const transcripcionSection = document.getElementById("transcripcion");
            if (transcripcionSection) transcripcionSection.hidden = false;

            if (Array.isArray(item.transcripcion)) {
                renderMultipleTranscriptions(item.transcripcion);
            } else {
                elements.transcripcionTexto.innerHTML = parseMarkdown(item.transcripcion || "");
            }
        }

        // Resúmenes guardados (multiResults)
        if (elements.multiResults) {
            elements.multiResults.innerHTML = "";
            elements.multiResults.hidden = false;
            for (const modo in item.resumenes) {
                addResultBox(modo, item.resumenes[modo]);
            }
        }

        // Resultado principal según modo actual (si coincide)
        const modoActual = document.getElementById("modo")?.value || "";
        if (modoActual && item.resumenes && item.resumenes[modoActual] && elements.mdResult) {
            elements.mdResult.innerHTML = parseMarkdown(item.resumenes[modoActual]);
            const resultSection = document.getElementById("result");
            if (resultSection) resultSection.hidden = false;
            if (elements.btnImprimirPDF) elements.btnImprimirPDF.style.display = "inline-block";
        }

        // Cargar grabación si existe
        if (item.grabacion) {
            const blob = reconstructBlob(item.grabacion);
            if (blob && elements.preview) {
                setLastRecordingBlob(blob);
                const url = URL.createObjectURL(blob);
                elements.preview.src = url;
                elements.preview.hidden = false;
            }
            updateRecordingButtonsState(true);  // Hay audio
        } else {
            updateRecordingButtonsState(false);  // No hay audio
        }

        validateSessionName(item.nombre);
        if (elements.chatToggle) elements.chatToggle.disabled = false;

        // 🔥 Actualizar estado del botón Enviar con los modos del historial
        const { nombre, email, modo } = getFormValues();
        const hayAudio = !!item.grabacion;

        updateSendButtonState(
            hayAudio,
            nombre,
            email,
            modo,
            getProcessedModes()
        );
    } catch (error) {
        console.error("Error cargando transcripción del historial:", error);
        alert("Error al cargar la transcripción del historial.");
    }
}

/**
 * Renderiza múltiples transcripciones en colapsables
 */
function renderMultipleTranscriptions(transcriptionsArray) {
    if (!elements.transcripcionTexto) return;

    elements.transcripcionTexto.innerHTML = "";

    transcriptionsArray.forEach((md, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "collapsible-block";

        const toggle = document.createElement("button");
        toggle.className = "collapsible-toggle";
        toggle.innerHTML = `Transcripción ${index + 1} <span class="arrow">▶</span>`;
        toggle.setAttribute("aria-expanded", "false");

        const content = document.createElement("div");
        content.className = "collapsible-content";
        content.hidden = true;
        content.innerHTML = parseMarkdown(md);

        toggle.onclick = () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
            content.hidden = expanded;
            toggle.querySelector(".arrow").textContent = expanded ? "▶" : "▼";
        };

        wrapper.appendChild(toggle);
        wrapper.appendChild(content);
        elements.transcripcionTexto.appendChild(wrapper);
    });
}

/**
 * Añade una caja de resultado (resumen)
 */
function addResultBox(mode, content) {
    if (!elements.multiResults) return;

    // Asegurar que el contenedor sea visible
    elements.multiResults.hidden = false;

    const html = `
    <details class="result-box" open>
        <summary>${mode.toUpperCase()}</summary>
        <div class="markdown-body">${parseMarkdown(content)}</div>
    </details>
    `;
    elements.multiResults.insertAdjacentHTML("beforeend", html);
}

export {
    addResultBox, loadHistoryItems,
    loadTranscriptionFromHistory,
    renderMultipleTranscriptions, toggleHistoryPanel
};

