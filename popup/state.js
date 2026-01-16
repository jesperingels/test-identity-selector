export const state = { favorites: [], recent: [] };

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

export const loadState = async () => {
    try {
        const result = await chrome.storage.local.get(["favorites", "recent"]);
        state.favorites = result.favorites || [];
        state.recent = result.recent || [];
    } catch (error) {
        console.error("Failed to load state:", error);
        state.favorites = [];
        state.recent = [];
    }
};

export const addToRecent = (name) => {
    state.recent = state.recent.filter((item) => item.name !== name);
    state.recent.unshift({ name, ts: Date.now() });
    if (state.recent.length > 10) {
        state.recent = state.recent.slice(0, 10);
    }
    saveState();
};

export const toggleFavorite = (name) => {
    const index = state.favorites.indexOf(name);
    if (index === -1) {
        state.favorites.push(name);
    } else {
        state.favorites.splice(index, 1);
    }
    saveState();
};

export const clearRecent = () => {
    state.recent = [];
    saveState();
};

export const isFavorite = (name) => state.favorites.includes(name);
