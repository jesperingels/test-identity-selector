import { dom } from "./dom.js";
import { createStatusSetter } from "./status.js";
import {
    loadState,
    addToRecent,
    toggleFavorite,
    clearRecent,
    isFavorite,
    state,
} from "./state.js";
import { findMatchesScript, selectValueScript } from "./content-scripts.js";
import { renderLists, renderResultsList } from "./render.js";
import { selectMatch, runSelection } from "./selection.js";
import { handleKeyboardNavigation } from "./keyboard.js";

const refs = { currentMatches: [], highlightedIndex: -1 };
const setStatus = createStatusSetter(dom.statusLine);

const deps = {
    dom,
    state,
    refs,
    setStatus,
    addToRecent,
    toggleFavorite,
    clearRecent,
    isFavorite,
    findMatchesScript,
    selectValueScript,
    renderResultsList,
    renderLists,
};

deps.onSelectMatch = (match) => selectMatch(match, deps);
deps.onRunSelection = () => runSelection(deps);
deps.onToggleFavorite = (name) => {
    toggleFavorite(name);
    renderLists(deps);
};
deps.onClearRecent = () => {
    clearRecent();
    renderLists(deps);
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadState();
    renderLists(deps);
    dom.input.focus();
});

dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    deps.onRunSelection();
});

dom.input.addEventListener("keydown", (event) => {
    handleKeyboardNavigation(event, deps);
});

dom.clearRecentButton.addEventListener("click", () => {
    deps.onClearRecent();
});
