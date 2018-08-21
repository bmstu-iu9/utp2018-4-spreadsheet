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
const sendXMLHttpRequest = (host, port, adress, method, callback, jsonErrorCallback) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, 'http://' + host + ':' + port + adress);
    xhr.send();
    xhr.onload = () => {
        let dataJSON = null;
        try {
            dataJSON = JSON.parse(xhr.responseText);
        } catch {
            return jsonErrorCallback();
        }

        callback(dataJSON);
    };
}