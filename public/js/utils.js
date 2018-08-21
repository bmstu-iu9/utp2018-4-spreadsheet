'use strict';

/**
 * Simple cookie parser
 * @param {String} reqCookies
 * @returns {Object} Parsed key-value cookie pairs
 */
const parseCookies = (reqCookies) => {
    const cookies = {};

    if (reqCookies) {
        reqCookies.replace(' ', '').split(';').forEach((cookie) => {
            const kv = cookie.split('=');
            cookies[kv[0]] = kv[1];
        });
    }

    return cookies;
}


/**
 * Send XMLHttpRequest
 */
const sendXMLHttpRequest = (host, port, adress, method, data, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, 'http://' + host + ':' + port + adress);
    if (method === 'POST') {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    xhr.send(method === 'POST' ? data : null);
    xhr.onload = () => {
        if (xhr.status === 200 && xhr.readyState === 4) {
            let dataJSON = null;
            try {
                dataJSON = JSON.parse(xhr.responseText);
            } catch {
                return callback(null, ERRORS.JSON_PARSE_ERROR);
            }

            callback(dataJSON, null);
        } else {
            callback(null, ERRORS.XMLHTTP_FAILED);
        }
    };
}

function arr2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

function str2arr(str) {
    var buf = new Array(str.length); // 2 bytes for each char
    for (var i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }

    return buf;
}