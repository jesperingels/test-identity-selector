const form = document.getElementById("selector-form");
const input = document.getElementById("query");
const statusLine = document.getElementById("status");

const setStatus = (type, message) => {
    statusLine.textContent = message;
    statusLine.className = `status ${type || ""}`.trim();
};

const runSelection = async () => {
    const query = input.value.trim();

    if (!query) {
        setStatus("warn", "Vul een zoekterm in.");
        return;
    }

    setStatus("info", "Zoeken...");

    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });

    if (!tab || !tab.id) {
        setStatus("error", "Geen actieve tab gevonden.");
        return;
    }

    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (searchText) => {
                const select = document.querySelector("select.form-control");
                if (!select) {
                    return { ok: false, reason: "select_not_found" };
                }

                const queryLower = searchText.toLowerCase();
                const options = Array.from(select.options || []);
                const match = options.find((option) =>
                    option.innerText.toLowerCase().includes(queryLower)
                );

                if (!match) {
                    return { ok: false, reason: "no_match" };
                }

                select.value = match.value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
                return { ok: true, text: match.innerText, value: match.value };
            },
            args: [query],
        });

        const result = results && results[0] && results[0].result;

        if (!result) {
            setStatus("error", "Onbekend resultaat van de pagina.");
            return;
        }

        if (result.ok) {
            setStatus("success", `Geselecteerd: ${result.text}`);
            return;
        }

        if (result.reason === "select_not_found") {
            setStatus("error", "Geen select element gevonden.");
            return;
        }

        if (result.reason === "no_match") {
            setStatus("warn", "Geen match gevonden.");
            return;
        }

        setStatus("error", "Onbekende fout.");
    } catch (error) {
        const message =
            chrome.runtime.lastError?.message ||
            error?.message ||
            "Script kon niet worden uitgevoerd.";
        setStatus("error", message);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    input.focus();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    runSelection();
});
