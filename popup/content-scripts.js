export const findMatchesScript = (searchText) => {
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

export const selectValueScript = (value) => {
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
