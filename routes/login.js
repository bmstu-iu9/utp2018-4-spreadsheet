'use strict';

const url = require('url');
const qs = require('querystring');
const sendAuthRequest = require('../app/server_request').sendAuthRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');
const ERRORS = require('../config/errors.json');
const ERROR_MESSAGES = require('../config/error_messages.json');
const returnError = require('../app/server_responses').returnError;

const auth = (req, res) => {
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
                logs.log(`\x1b[34mAUTHORIZATION\x1b[0m \x1b[32mSUCCESS\x1b[0m: SessionID: ${cookies['token']}, Email: ${parsedURL.query['email']}`);
                res.setHeader('Set-Cookie', ['token=' + loginINFO.session_id +
                    ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString(),
                    'status=' + CONFIG.USER + ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString()
                ]) //на год
            } else {
                logs.log(`\x1b[34mAUTHORIZATION\x1b[0m \x1b[31mFAILED\x1b[0m: SessionID: ${cookies['token']}, Email: ${parsedURL.query['email']}, Error: ${ERROR_MESSAGES[loginINFO.error]}`);
            }

            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(loginINFO));
        },

        (err) => {
            logs.log(`\x1b[34mAUTHORIZATION\x1b[0m \x1b[31mFAILED\x1b[0m: SessionID: ${cookies['token']}, Email: ${parsedURL.query['email']}, Error: ${err.message}`);
            return returnError(ERRORS.AUTH_SERVER_ERROR, res);
        });
}

const login = (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({
        "session": cookies['token']
    });
    sendAuthRequest('/check_session', postData).then(
        authINFO => {
            if (authINFO.status != CONFIG.GUEST) {
                const redirectURL = 'http://' + CONFIG.host_main + ':' + CONFIG.port_main + '/';
                logs.log(`\x1b[33mREDIRECT\x1b[0m: ${redirectURL}. User ${cookies['token']} have no permission to get login page.`);
                res.writeHead(302, {
                    'Location': redirectURL
                });
                return res.end();
            }

            logs.log(`\x1b[34mAUTHENTICATION PAGE\x1b[0m User: ${cookies['token']}`);
            res.render('authentication.html', null);
        },

        (err) => {
            logs.log(`\x1b[34mAUTHENTICATION PAGE\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${cookies['token']}, Error: ${err.message}`);
            res.render('error.html', {
                "code": 500,
                "message": '500 Internal server error!'
            });
        });
}

module.exports.auth = auth;
module.exports.login = login;