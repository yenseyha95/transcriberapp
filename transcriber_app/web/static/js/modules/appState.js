/**
 * Módulo de gestión de estado global
 * Centraliza todo el estado de la aplicación
 */

let lastRecordingBlob = null;
let lastRecordingName = null;
let lastRecordingDuration = null;
let hasTranscript = false;
let processedModes = [];

/**
 * Obtiene el blob de la grabación actual
 */
function getLastRecordingBlob() {
    return lastRecordingBlob;
}

/**
 * Establece el blob de la grabación
 */
function setLastRecordingBlob(blob) {
    lastRecordingBlob = blob;
}

/**
 * Obtiene el nombre de la grabación
 */
function getLastRecordingName() {
    return lastRecordingName;
}

/**
 * Establece el nombre de la grabación
 */
function setLastRecordingName(name) {
    lastRecordingName = name;
}

/**
 * Obtiene la duración de la grabación
 */
function getLastRecordingDuration() {
    return lastRecordingDuration;
}

/**
 * Establece la duración de la grabación
 */
function setLastRecordingDuration(duration) {
    lastRecordingDuration = duration;
}

/**
 * ¿Existe transcripción?
 */
function getHasTranscript() {
    return hasTranscript;
}

/**
 * Establece si existe transcripción
 */
function setHasTranscript(value) {
    hasTranscript = value;
}

/**
 * Obtiene el array de modos procesados
 */
function getProcessedModes() {
    return [...processedModes];
}

/**
 * Añade un modo al array de procesados
 */
function addProcessedMode(modo) {
    if (modo && !processedModes.includes(modo)) {
        processedModes.push(modo);
    }
}

/**
 * Resetea los modos procesados
 */
function resetProcessedModes() {
    processedModes = [];
}

/**
 * Resetea TODO el estado
 */
function resetAllState() {
    lastRecordingBlob = null;
    lastRecordingName = "";
    lastRecordingDuration = null;
    hasTranscript = false;
    processedModes = [];
}

export {
    addProcessedMode, getHasTranscript, getLastRecordingBlob, getLastRecordingDuration, getLastRecordingName, getProcessedModes, resetAllState, resetProcessedModes, setHasTranscript, setLastRecordingBlob, setLastRecordingDuration, setLastRecordingName
};

