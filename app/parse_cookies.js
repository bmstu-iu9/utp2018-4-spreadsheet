'use strict';

const parseCookies = (reqCookies) => {
    const cookies = {};
    
    if (reqCookies) {
        reqCookies.split(';').forEach((cookie) => {
            const kv = cookie.split('=');
            cookies[kv[0]] = kv[1];
        });
    }

    return cookies;
}

module.exports.parseCookies = parseCookies;