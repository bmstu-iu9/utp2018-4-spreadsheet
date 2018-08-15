'use strict';

const url = require('url');
const qs = require('querystring');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');
const SAVE_CONFIG = require('../config/save_config.json');

const auth = (req, res) => {
    logs.log('\x1b[34mAUTH\x1b[0m Method: ' + req.method);

    const parsedURL = url.parse(req.url, true);
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({
        'session': cookies['token'],
        'email': parsedURL.query['email'],
        'password': parsedURL.query['password']
    });

    sendAuthRequest('/login', postData).then(
        loginINFO => {
            if (!loginINFO.error) {
                res.setHeader('Set-Cookie', ['token=' + loginINFO.session_id +
                    ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString(),
                    'status=' + SAVE_CONFIG.USER + ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString()
                ]) //на год
            }

            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(loginINFO));
        },

        () => {
            res.render('error.html', {
                "code": 500,
                "message": '500 Internal server error!'
            });
        });
}

const login = (req, res) => {
    logs.log('\x1b[34mLOGIN\x1b[0m Method: ' + req.method);

    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({
        "session": cookies['token']
    });
    sendAuthRequest('/check_session', postData).then(
        authINFO => {
            if (authINFO.status !== SAVE_CONFIG.GUEST) {
                const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/';
                logs.log(`\x1b[33mREDIRECT\x1b[0m ${redirectURL}`);
                res.writeHead(302, {
                    'Location': redirectURL
                });
                return res.end();
            }

            res.render('login.html', null);
        },

        () => {
            res.render('error.html', {
                "code": 500,
                "message": '500 Internal server error!'
            });
        });
}

module.exports.auth = auth;
module.exports.login = login;