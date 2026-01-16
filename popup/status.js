export const createStatusSetter = (statusLine) => (type, message) => {
    statusLine.textContent = message;
    statusLine.className = `status ${type || ""}`.trim();
};
