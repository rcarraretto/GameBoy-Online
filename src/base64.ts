export function base64(data) {
    return window.btoa(data);
}

export function base64_decode(data) {
    return window.atob(data);
}

export function to_little_endian_dword(str) {
    return to_little_endian_word(str) + to_little_endian_word(str >> 16);
}

function to_little_endian_word(str) {
    return to_byte(str) + to_byte(str >> 8);
}

export function to_byte(str) {
    return String.fromCharCode(str & 0xff);
}

export function arrayToBase64(arrayIn) {
    var binString = "";
    var length = arrayIn.length;
    for (var index = 0; index < length; ++index) {
        if (typeof arrayIn[index] == "number") {
            binString += String.fromCharCode(arrayIn[index]);
        }
    }
    return base64(binString);
}

export function base64ToArray(b64String) {
    var binString = base64_decode(b64String);
    var outArray = [];
    var length = binString.length;
    for (var index = 0; index < length; ) {
        outArray.push(binString.charCodeAt(index++) & 0xff);
    }
    return outArray;
}
