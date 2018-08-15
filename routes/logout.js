'use strict';

const qs = require('querystring');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');
const SAVE_CONFIG = require('../config/save_config.json');

const logout = (req, res) => {
    logs.log(`\x1b[34mLOGOUT\x1b[0m Method: ${req.method}`);
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({
        "session": cookies['token']
    });
    sendAuthRequest('/logout', postData).then(
        logoutINFO => {
            if (logoutINFO.error) {
                logs.log('Logout \x1b[31mFAILED\x1b[0m session: ' + cookies['token']);
            } else {
                logs.log('Logout \x1b[32mSUCCESS\x1b[0m user: ' + cookies['token']);
            }

            const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port;
            logs.log('\x1b[33mREDIRECT\x1b[0m ' + redirectURL);
            res.writeHead(302, {
                'Location': redirectURL,
                'Set-Cookie': 'status=' + SAVE_CONFIG.GUEST + ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString()
            });
            return res.end();
        });
}

module.exports.logout = logout;