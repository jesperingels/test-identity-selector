const form = document.getElementById("selector-form");
const input = document.getElementById("query");
const statusLine = document.getElementById("status");
const resultsSection = document.getElementById("results-section");
const resultsList = document.getElementById("results-list");
const recentList = document.getElementById("recent-list");
const favoritesList = document.getElementById("favorites-list");
const clearRecentButton = document.getElementById("clear-recent");

let currentMatches = [];
let highlightedIndex = -1;
let state = { favorites: [], recent: [] };

const setStatus = (type, message) => {
    statusLine.textContent = message;
    statusLine.className = `status ${type || ""}`.trim();
};

// Storage helpers
const loadState = async () => {
    try {
        const result = await chrome.storage.local.get(["favorites", "recent"]);
        state = {
            favorites: result.favorites || [],
            recent: result.recent || [],
        };
    } catch (error) {
        console.error("Failed to load state:", error);
        state = { favorites: [], recent: [] };
    }
};

const saveState = async () => {
    try {
        await chrome.storage.local.set({
            favorites: state.favorites,
            recent: state.recent,
        });
    } catch (error) {
        console.error("Failed to save state:", error);
    }
};

const addToRecent = (name) => {
    // Remove existing entry with same name
    state.recent = state.recent.filter((item) => item.name !== name);
    // Add to front
    state.recent.unshift({ name, ts: Date.now() });
    // Cap at 10 items
    if (state.recent.length > 10) {
        state.recent = state.recent.slice(0, 10);
    }
    saveState();
};

const toggleFavorite = (name) => {
    const index = state.favorites.indexOf(name);
    if (index === -1) {
        state.favorites.push(name);
    } else {
        state.favorites.splice(index, 1);
    }
    saveState();
    renderLists();
};

const clearRecent = () => {
    state.recent = [];
    saveState();
    renderLists();
};

const isFavorite = (name) => {
    return state.favorites.includes(name);
};

// Content script function to find all matches
const findMatchesScript = (searchText) => {
    const select = document.querySelector("select.form-control");
    if (!select) {
        return { ok: false, reason: "select_not_found" };
    }

    const queryLower = searchText.toLowerCase();
    const options = Array.from(select.options || []);
    const matches = options
        .filter((option) => option.innerText.toLowerCase().includes(queryLower))
        .map((option) => ({
            text: option.innerText,
            value: option.value,
        }));

    if (matches.length === 0) {
        return { ok: false, reason: "no_match", matches: [] };
    }

    return { ok: true, matches };
};

// Content script function to select a specific value
const selectValueScript = (value) => {
    const select = document.querySelector("select.form-control");
    if (!select) {
        return { ok: false, reason: "select_not_found" };
    }

    const option = Array.from(select.options || []).find(
        (opt) => opt.value === value
    );

    if (!option) {
        return { ok: false, reason: "option_not_found" };
    }

    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return { ok: true, text: option.innerText, value: option.value };
};

const renderResultsList = () => {
    resultsList.innerHTML = "";
    highlightedIndex = -1;

    if (currentMatches.length <= 1) {
        resultsSection.style.display = "none";
        return;
    }

    resultsSection.style.display = "block";

    currentMatches.forEach((match, index) => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.setAttribute("data-index", index);
        li.setAttribute("data-value", match.value);

        const nameSpan = document.createElement("span");
        nameSpan.className = "list-item-name";
        nameSpan.textContent = match.text;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "list-item-actions";

        const favoriteBtn = document.createElement("button");
        favoriteBtn.className = `favorite-button ${
            isFavorite(match.text) ? "favorited" : ""
        }`;
        favoriteBtn.type = "button";
        favoriteBtn.setAttribute("aria-label", "Toggle favorite");
        favoriteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(match.text);
        });

        actionsDiv.appendChild(favoriteBtn);
        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);

        li.addEventListener("click", () => {
            selectMatch(match);
        });

        resultsList.appendChild(li);
    });
};

const renderRecentList = () => {
    recentList.innerHTML = "";

    if (state.recent.length === 0) {
        const li = document.createElement("li");
        li.className = "list-item";
        li.style.cursor = "default";
        li.style.color = "#999999";
        li.textContent = "Geen recente selecties";
        recentList.appendChild(li);
        return;
    }

    state.recent.forEach((item) => {
        const li = document.createElement("li");
        li.className = "list-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "list-item-name";
        nameSpan.textContent = item.name;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "list-item-actions";

        const favoriteBtn = document.createElement("button");
        favoriteBtn.className = `favorite-button ${
            isFavorite(item.name) ? "favorited" : ""
        }`;
        favoriteBtn.type = "button";
        favoriteBtn.setAttribute("aria-label", "Toggle favorite");
        favoriteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(item.name);
        });

        actionsDiv.appendChild(favoriteBtn);
        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);

        li.addEventListener("click", () => {
            input.value = item.name;
            runSelection();
        });

        recentList.appendChild(li);
    });
};

const renderFavoritesList = () => {
    favoritesList.innerHTML = "";

    if (state.favorites.length === 0) {
        const li = document.createElement("li");
        li.className = "list-item";
        li.style.cursor = "default";
        li.style.color = "#999999";
        li.textContent = "Geen favorieten";
        favoritesList.appendChild(li);
        return;
    }

    state.favorites.forEach((name) => {
        const li = document.createElement("li");
        li.className = "list-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "list-item-name";
        nameSpan.textContent = name;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "list-item-actions";

        const favoriteBtn = document.createElement("button");
        favoriteBtn.className = "favorite-button favorited";
        favoriteBtn.type = "button";
        favoriteBtn.setAttribute("aria-label", "Remove favorite");
        favoriteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(name);
        });

        actionsDiv.appendChild(favoriteBtn);
        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);

        li.addEventListener("click", () => {
            input.value = name;
            runSelection();
        });

        favoritesList.appendChild(li);
    });
};

const renderLists = () => {
    renderResultsList();
    renderRecentList();
    renderFavoritesList();
};

const selectMatch = async (match) => {
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
            func: selectValueScript,
            args: [match.value],
        });

        const result = results && results[0] && results[0].result;

        if (!result || !result.ok) {
            setStatus("error", "Selectie mislukt.");
            return;
        }

        setStatus("success", `Geselecteerd: ${result.text}`);
        addToRecent(result.text);
        renderLists();
    } catch (error) {
        const message =
            chrome.runtime.lastError?.message ||
            error?.message ||
            "Script kon niet worden uitgevoerd.";
        setStatus("error", message);
    }
};

const runSelection = async () => {
    const query = input.value.trim();

    if (!query) {
        setStatus("warn", "Vul een zoekterm in.");
        currentMatches = [];
        renderResultsList();
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
            func: findMatchesScript,
            args: [query],
        });

        const result = results && results[0] && results[0].result;

        if (!result) {
            setStatus("error", "Onbekend resultaat van de pagina.");
            currentMatches = [];
            renderResultsList();
            return;
        }

        if (!result.ok) {
            if (result.reason === "select_not_found") {
                setStatus("error", "Geen select element gevonden.");
            } else if (result.reason === "no_match") {
                setStatus("warn", "Geen match gevonden.");
            } else {
                setStatus("error", "Onbekende fout.");
            }
            currentMatches = [];
            renderResultsList();
            return;
        }

        currentMatches = result.matches || [];

        if (currentMatches.length === 0) {
            setStatus("warn", "Geen match gevonden.");
            renderResultsList();
            return;
        }

        // Auto-select first match
        const firstMatch = currentMatches[0];
        await selectMatch(firstMatch);

        // Render results list (will show if >1 match)
        renderResultsList();
    } catch (error) {
        const message =
            chrome.runtime.lastError?.message ||
            error?.message ||
            "Script kon niet worden uitgevoerd.";
        setStatus("error", message);
        currentMatches = [];
        renderResultsList();
    }
};

// Keyboard navigation
const handleKeyboardNavigation = (event) => {
    if (currentMatches.length <= 1) {
        return;
    }

    const items = Array.from(resultsList.querySelectorAll(".list-item"));

    if (event.key === "ArrowDown") {
        event.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
        updateHighlight();
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        updateHighlight();
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
        event.preventDefault();
        const match = currentMatches[highlightedIndex];
        if (match) {
            selectMatch(match);
        }
    }
};

const updateHighlight = () => {
    const items = Array.from(resultsList.querySelectorAll(".list-item"));
    items.forEach((item, index) => {
        if (index === highlightedIndex) {
            item.classList.add("highlighted");
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else {
            item.classList.remove("highlighted");
        }
    });
};

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await loadState();
    renderLists();
    input.focus();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    runSelection();
});

input.addEventListener("keydown", handleKeyboardNavigation);

clearRecentButton.addEventListener("click", () => {
    clearRecent();
});
