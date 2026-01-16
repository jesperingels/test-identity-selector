export const renderResultsList = (deps) => {
    const { dom, refs, isFavorite, onToggleFavorite, onSelectMatch } = deps;
    const matches = refs.currentMatches;

    dom.resultsList.innerHTML = "";
    refs.highlightedIndex = -1;

    if (matches.length <= 1) {
        dom.resultsSection.style.display = "none";
        return;
    }

    dom.resultsSection.style.display = "block";

    matches.forEach((match, index) => {
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
            onToggleFavorite(match.text);
        });

        actionsDiv.appendChild(favoriteBtn);
        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);

        li.addEventListener("click", () => {
            onSelectMatch(match);
        });

        dom.resultsList.appendChild(li);
    });
};

export const renderRecentList = (deps) => {
    const { dom, state, isFavorite, onToggleFavorite, onRunSelection } = deps;

    dom.recentList.innerHTML = "";

    if (state.recent.length === 0) {
        const li = document.createElement("li");
        li.className = "list-item";
        li.style.cursor = "default";
        li.style.color = "#999999";
        li.textContent = "Geen recente selecties";
        dom.recentList.appendChild(li);
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
            onToggleFavorite(item.name);
        });

        actionsDiv.appendChild(favoriteBtn);
        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);

        li.addEventListener("click", () => {
            dom.input.value = item.name;
            onRunSelection();
        });

        dom.recentList.appendChild(li);
    });
};

export const renderFavoritesList = (deps) => {
    const { dom, state, onToggleFavorite, onRunSelection } = deps;

    dom.favoritesList.innerHTML = "";

    if (state.favorites.length === 0) {
        const li = document.createElement("li");
        li.className = "list-item";
        li.style.cursor = "default";
        li.style.color = "#999999";
        li.textContent = "Geen favorieten";
        dom.favoritesList.appendChild(li);
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
            onToggleFavorite(name);
        });

        actionsDiv.appendChild(favoriteBtn);
        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);

        li.addEventListener("click", () => {
            dom.input.value = name;
            onRunSelection();
        });

        dom.favoritesList.appendChild(li);
    });
};

export const renderLists = (deps) => {
    renderResultsList(deps);
    renderRecentList(deps);
    renderFavoritesList(deps);
};
