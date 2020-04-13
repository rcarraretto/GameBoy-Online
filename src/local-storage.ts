export function checkStorageLength() {
    return window.localStorage.length;
}

//Wrapper for localStorage getItem, so that data can be retrieved in various types.
export function findValue(key) {
    if (window.localStorage.getItem(key) != null) {
	return JSON.parse(window.localStorage.getItem(key));
    }
    return null;
}

//Wrapper for localStorage setItem, so that data can be set in various types.
export function setValue(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}

//Wrapper for localStorage removeItem, so that data can be set in various types.
export function deleteValue(key) {
    window.localStorage.removeItem(key);
}

export function findKey(keyNum) {
    return window.localStorage.key(keyNum);
}
