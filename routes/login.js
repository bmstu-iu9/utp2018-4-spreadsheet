'use strict';

const qs = require('querystring');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');
const SAVE_CONFIG = require('../config/save_config.json');

const login = (req, res) => {
    logs.log('\x1b[34mLOGIN\x1b[0m Method: ' + req.method);

    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({"session" : cookies['token']});
    sendAuthRequest('/check_session', postData).then(
        authINFO => {
            if (authINFO.status !== SAVE_CONFIG.GUEST) {
                const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/';
                logs.log(`\x1b[33mREDIRECT\x1b[0m ${redirectURL}`);
                res.writeHead(302, {'Location' : redirectURL});
                return res.end();
            }

            res.render('login.html', null);
        },

        () => {
            res.render('error.html', {"code" : 500, "message" : '500 Internal server error!'});
        });    
}

module.exports.login = login;