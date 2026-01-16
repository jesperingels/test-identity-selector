export const selectMatch = async (match, deps) => {
    const { setStatus, addToRecent, renderLists, selectValueScript } = deps;

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
        renderLists(deps);
    } catch (error) {
        const message =
            chrome.runtime.lastError?.message ||
            error?.message ||
            "Script kon niet worden uitgevoerd.";
        setStatus("error", message);
    }
};

export const runSelection = async (deps) => {
    const { dom, refs, setStatus, findMatchesScript, renderResultsList } =
        deps;

    const query = dom.input.value.trim();

    if (!query) {
        setStatus("warn", "Vul een zoekterm in.");
        refs.currentMatches = [];
        renderResultsList(deps);
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
            refs.currentMatches = [];
            renderResultsList(deps);
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
            refs.currentMatches = [];
            renderResultsList(deps);
            return;
        }

        refs.currentMatches = result.matches || [];

        if (refs.currentMatches.length === 0) {
            setStatus("warn", "Geen match gevonden.");
            renderResultsList(deps);
            return;
        }

        await selectMatch(refs.currentMatches[0], deps);
    } catch (error) {
        const message =
            chrome.runtime.lastError?.message ||
            error?.message ||
            "Script kon niet worden uitgevoerd.";
        setStatus("error", message);
        refs.currentMatches = [];
        renderResultsList(deps);
    }
};
