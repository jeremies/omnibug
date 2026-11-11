/**
 * Create a new HTML element
 *
 * @param type
 * @param options
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const createElement = (type, options = {}) => {
    let element = document.createElement(type);

    // Add any classes
    if (typeof options.classes === "object" && options.classes.length) {
        element.classList.add(...options.classes);
    } else if (typeof options.classes === "string") {
        element.classList.add(options.classes);
    }

    // Add any attributes
    if (typeof options.attributes === "object") {
        Object.entries(options.attributes).forEach((attribute) => {
            element.setAttribute(...attribute);
        });
    }

    // Add a text node
    if (options.text) {
        let textNode = document.createTextNode(options.text);
        element.appendChild(textNode);
    }

    // Add any children
    if (typeof options.children === "object" && options.children.length) {
        options.children.forEach((child) => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof options.children === "object" && options.children instanceof HTMLElement) {
        element.appendChild(options.children);
    }

    return element;
};

/**
 * Removes all styles from a stylesheet
 *
 * @param styleSheet
 */
// eslint-disable-next-line no-unused-vars
const clearStyles = (styleSheet) => {
    if (!styleSheet || !styleSheet.sheet || !styleSheet.sheet.cssRules) {
        throw new TypeError("Parameter is not a stylesheet");
    }
    while (styleSheet.sheet.cssRules.length) {
        styleSheet.sheet.deleteRule(0);
    }
};

/**
 * Remove all the pesky children for an element
 *
 * @param element
 */
// eslint-disable-next-line no-unused-vars
const clearChildren = (element) => {
    if (!(element instanceof HTMLElement)) {
        throw new TypeError("Parameter is not an HTMLElement");
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

/**
 * Show toast message
 *
 * @param message
 * @param type
 * @param timeout
 */
// eslint-disable-next-line no-unused-vars
const showToast = (message, type = "primary", timeout = 10) => {
    if (["primary", "success", "warning", "error"].indexOf(type) === -1) {
        type = "primary";
    }
    let wrapper = document.getElementById("toasts"),
        toastTemplate = document.getElementById("toast-template"),
        toast = document.importNode(toastTemplate.content, true),
        toastDiv = toast.querySelector(".toast");

    toast.querySelector("span").innerText = message;
    toastDiv.classList.add(`toast-${type}`);
    wrapper.appendChild(toast);
    window.setTimeout(() => {
        toastDiv.remove();
    }, timeout * 1000);
};

/**
 * Get the appropriate text color for a given background color
 *
 * @param bgColor   string  The hexadecimal background color
 */
// eslint-disable-next-line no-unused-vars
const getAppropriateTextColor = (bgColor = "#FFFFFF") => {
    bgColor = bgColor.replace("#", "");
    const r = parseInt(bgColor.substr(0,2),16),
        g = parseInt(bgColor.substr(2,2),16),
        b = parseInt(bgColor.substr(4,2),16),
        yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? "#000" : "#FFF";
};

/**
 * Parse a property path (e.g. ".subparam2.sub3" or '["sub.param.2"][0]') into an array of keys
 *
 * @param {string} path
 * @returns {string[]|null}
 */
const parsePathSegments = (path) => {
    if (typeof path !== "string" || path.length === 0) {
        return null;
    }

    let segments = [],
        i = 0,
        len = path.length;

    while (i < len) {
        if (path[i] === ".") {
            i++;
            if (i >= len || path[i] === "." || path[i] === "[") {
                return null;
            }
            let start = i;
            while (i < len && path[i] !== "." && path[i] !== "[") {
                i++;
            }
            segments.push(path.slice(start, i));
        } else if (path[i] === "[") {
            i++;
            while (i < len && (path[i] === " " || path[i] === "\t")) {
                i++;
            }
            if (i >= len) {
                return null;
            }
            if (path[i] === "\"" || path[i] === "'") {
                let quote = path[i];
                i++;
                let key = "",
                    closed = false;
                while (i < len) {
                    if (path[i] === "\\" && i + 1 < len) {
                        key += path[i + 1];
                        i += 2;
                    } else if (path[i] === quote) {
                        closed = true;
                        i++;
                        break;
                    } else {
                        key += path[i];
                        i++;
                    }
                }
                if (!closed) {
                    return null;
                }
                while (i < len && (path[i] === " " || path[i] === "\t")) {
                    i++;
                }
                if (i >= len || path[i] !== "]") {
                    return null;
                }
                i++;
                if (i < len && path[i] !== "." && path[i] !== "[") {
                    return null;
                }
                segments.push(key);
            } else {
                let start = i;
                while (i < len && path[i] !== "]") {
                    i++;
                }
                if (i >= len) {
                    return null;
                }
                let rawKey = path.slice(start, i).trim();
                if (rawKey.length === 0) {
                    return null;
                }
                i++;
                if (i < len && path[i] !== "." && path[i] !== "[") {
                    return null;
                }
                segments.push(rawKey);
            }
        } else if (i === 0) {
            let start = 0;
            while (i < len && path[i] !== "." && path[i] !== "[") {
                i++;
            }
            segments.push(path.slice(start, i));
        } else {
            return null;
        }
    }

    return segments.length > 0 ? segments : null;
};

/**
 * Resolve a sequence of keys against a value (parsing JSON strings along the way)
 *
 * @param {*} value
 * @param {string[]} segments
 * @returns {{found: boolean, value: string}}
 */
const resolveJsonSegments = (value, segments) => {
    let current = value;

    for (let i = 0; i < segments.length; i++) {
        if (typeof current === "string") {
            try {
                current = JSON.parse(current);
            } catch (e) {
                return { "found": false, "value": "" };
            }
        }

        if (typeof current !== "object" || current === null) {
            return { "found": false, "value": "" };
        }

        let key = segments[i];
        if (!Object.prototype.hasOwnProperty.call(current, key)) {
            return { "found": false, "value": "" };
        }

        current = current[key];
    }

    if (current === null || typeof current === "undefined") {
        return { "found": true, "value": "" };
    }
    if (typeof current === "object") {
        return { "found": true, "value": JSON.stringify(current) };
    }
    return { "found": true, "value": String(current) };
};

/**
 * Get value from request data, supporting JSON path traversal (e.g. param1.subparam2 or param1["sub.param.2"])
 *
 * @param {string} field
 * @param {Object} request
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
const getDataColumnValue = (field, request) => {
    if (!field || typeof field !== "string" || !request || !Array.isArray(request.data)) {
        return "";
    }

    // 1. Check for an exact match first
    let exactMatch = request.data.find((fld) => {
        return fld && fld.field === field;
    });
    if (exactMatch) {
        if (exactMatch.value === null || typeof exactMatch.value === "undefined") {
            return "";
        }
        return typeof exactMatch.value === "object" ? JSON.stringify(exactMatch.value) : String(exactMatch.value);
    }

    // 2. Find candidate entries where fld.field is a prefix followed by "." or "[" (longest match first)
    let candidates = request.data
        .filter((fld) => {
            if (!fld || typeof fld.field !== "string" || fld.field.length === 0 || field.length <= fld.field.length) {
                return false;
            }
            if (field.indexOf(fld.field) !== 0) {
                return false;
            }
            let nextChar = field[fld.field.length];
            return nextChar === "." || nextChar === "[";
        })
        .sort((a, b) => b.field.length - a.field.length);

    for (let i = 0; i < candidates.length; i++) {
        let candidate = candidates[i],
            remainingPath = field.slice(candidate.field.length),
            segments = parsePathSegments(remainingPath);
        if (segments && segments.length > 0) {
            let resolved = resolveJsonSegments(candidate.value, segments);
            if (resolved.found) {
                return resolved.value;
            }
        }
    }

    // 3. Support root bracket notation (e.g. ["param.with.dots"].subparam2)
    if (field[0] === "[") {
        let allSegments = parsePathSegments(field);
        if (allSegments && allSegments.length > 0) {
            let rootField = allSegments[0],
                restSegments = allSegments.slice(1),
                rootEntry = request.data.find((fld) => fld && fld.field === rootField);
            if (rootEntry) {
                if (restSegments.length === 0) {
                    if (rootEntry.value === null || typeof rootEntry.value === "undefined") {
                        return "";
                    }
                    return typeof rootEntry.value === "object" ? JSON.stringify(rootEntry.value) : String(rootEntry.value);
                }
                let resolved = resolveJsonSegments(rootEntry.value, restSegments);
                if (resolved.found) {
                    return resolved.value;
                }
            }
        }
    }

    return "";
};
