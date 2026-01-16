const updateHighlight = (deps) => {
    const { dom, refs } = deps;
    const items = Array.from(dom.resultsList.querySelectorAll(".list-item"));
    items.forEach((item, index) => {
        if (index === refs.highlightedIndex) {
            item.classList.add("highlighted");
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else {
            item.classList.remove("highlighted");
        }
    });
};

export const handleKeyboardNavigation = (event, deps) => {
    const { refs, onSelectMatch, dom } = deps;

    if (refs.currentMatches.length <= 1) {
        return;
    }

    const items = Array.from(dom.resultsList.querySelectorAll(".list-item"));

    if (event.key === "ArrowDown") {
        event.preventDefault();
        refs.highlightedIndex = Math.min(
            refs.highlightedIndex + 1,
            items.length - 1
        );
        updateHighlight(deps);
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        refs.highlightedIndex = Math.max(refs.highlightedIndex - 1, -1);
        updateHighlight(deps);
    } else if (event.key === "Enter" && refs.highlightedIndex >= 0) {
        event.preventDefault();
        const match = refs.currentMatches[refs.highlightedIndex];
        if (match) {
            onSelectMatch(match);
        }
    }
};
