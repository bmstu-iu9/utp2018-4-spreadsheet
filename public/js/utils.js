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

const arr2str = (buf) => {
    return String.fromCharCode.apply(null, buf);
}

const str2arr = (str) => {
    var buf = new Array(str.length); // 2 bytes for each char
    for (var i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }

    return buf;
}

const toDateTime = (secs) => {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}

const closeSideMenu = (sideMenu) => {
    if (sideMenu.nodeName === 'DIV') {
        sideMenu.style.left = '-340px';
        sideMenu.style.opacity = '0';
    } else {
        sideMenu.checked = false;
    }
}