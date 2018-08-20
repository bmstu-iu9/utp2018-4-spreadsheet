'use strict';

const qs = require('querystring');
const sendAuthRequest = require('../app/server_request').sendAuthRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');
const ERROR_MESSAGES = require('../config/error_messages.json');

const logout = (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({
        "session": cookies['token']
    });
    sendAuthRequest('/logout', postData).then(
        logoutINFO => {
            if (logoutINFO.error) {
                logs.log(`\x1b[34mLOGOUT\x1b[0m \x1b[31mFAILED\x1b[0m: SessionID: ${cookies['token']}, Error: ${ERROR_MESSAGES[logoutINFO.error]}`);
            } else {
                logs.log(`\x1b[34mLOGOUT\x1b[0m \x1b[32mSUCCESS\x1b[0m: SessionID: ${cookies['token']}`);
            }

            const redirectURL = 'http://' + CONFIG.host_main + ':' + CONFIG.port_main;
            logs.log(`\x1b[33mREDIRECT\x1b[0m ${redirectURL}. User: ${cookies['token']}`);
            res.writeHead(302, {
                'Location': redirectURL,
                'Set-Cookie': 'status=' + CONFIG.GUEST + ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString()
            });
            return res.end();
        });
}

module.exports.logout = logout;