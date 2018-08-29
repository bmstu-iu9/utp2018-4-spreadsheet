'use strict';

const http = require('http');
const qs = require('querystring');
const logs = require('../app/logs');
const sendAuthRequest = require('../app/server_request').sendAuthRequest;
const sendSaveRequest = require('../app/server_request').sendSaveRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const CONFIG = require('../config/main_config.json');
const ERRORS = require('../config/errors.json');
const ERROR_MESSAGES = require('../config/error_messages.json');
const returnError = require('../app/server_responses').returnError;

/**
 * Checks client's token,
 * if it's ok renders main page,
 * else redirects to login page
 * @param {http.ClientRequest} req 
 * @param {http.ServerResponse} res 
 */
const start = (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({
        "session": cookies['token']
    });
    sendAuthRequest('/check_session', postData).then(
        authINFO => {
            if (authINFO.error) { //добавить код ошибки
                logs.log(`\x1b[34mSTART USER CHECK\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${cookies['token']}, Error: ${ERROR_MESSAGES[authINFO.error]}`);
                //Новый юзер с незареганой кукой
                //ставим гостя
                sendAuthRequest('/guest', '').then(
                    sessionINFO => {
                        if (!sessionINFO.error) {
                            logs.log(`\x1b[34mSTART FOR NEW GUEST\x1b[0m: SessionID: ${sessionINFO.session_id}`);
                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                                'Set-Cookie': ['token=' + sessionINFO.session_id +
                                    ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString(),
                                'status=' + CONFIG.GUEST + ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString()
                                ]
                            }); //на месяц
                            return res.end(JSON.stringify({
                                status: 'new_guest'
                            }));
                        } //повтор
                    }
                );

                return;
            }

            if (authINFO.status) {
                logs.log(`\x1b[34mSTART FOR USER\x1b[0m: SessionID: ${cookies['token']}, Email: ${authINFO.email}`);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': ['token=' + cookies['token'] +
                        ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString(),
                    'status=' + CONFIG.USER + ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString()
                    ]
                }) //на год

                const reqData = qs.stringify({ email: authINFO.email });
                sendAuthRequest('/data', reqData).then(
                    data => {
                        logs.log(`\x1b[34mUSER INFO\x1b[0m \x1b[32mRECEIVED\x1b[0m: SessionID: ${cookies['token']}, Email: ${authINFO.email}`);

                        sendSaveRequest('/titles', reqData).then(
                            titles => {
                                logs.log(`\x1b[34mTITLES\x1b[0m \x1b[32mRECEIVED\x1b[0m: SessionID: ${cookies['token']}, Email: ${authINFO.email}`);
                                res.end(JSON.stringify({
                                    status: 'user',
                                    first_name: data.first_name,
                                    last_name: data.last_name,
                                    org: data.org,
                                    email: authINFO.email,
                                    titles: titles.titles
                                }));
                            },

                            (err) => {
                                logs.log(`\x1b[34mTITLES LOAD\x1b[0m \x1b[31mFAILED\x1b[0m: SessionID: ${cookies['token']}, Email: ${authINFO.email}, Error: ${err.message}`);
                                res.end(JSON.stringify({
                                    status: 'user',
                                    first_name: data.first_name,
                                    last_name: data.last_name,
                                    org: data.org,
                                    email: authINFO.email,
                                    error: ERRORS.SAVE_SERVER_ERROR
                                }));
                            }
                        );
                    },

                    (err) => {
                        logs.log(`\x1b[34mUSER INFO LOAD\x1b[0m \x1b[31mFAILED\x1b[0m: SessionID: ${cookies['token']}, Email: ${authINFO.email}, Error: ${err.message}`);
                        res.end(JSON.stringify({
                            status: 'user',
                            email: authINFO.email,
                            error: ERRORS.AUTH_SERVER_ERROR
                        }));
                    }
                )
            } else {
                logs.log(`\x1b[34mSTART FOR GUEST\x1b[0m: SessionID: ${cookies['token']}`);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': ['token=' + cookies['token'] +
                        ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString(),
                    'status=' + CONFIG.GUEST + ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString()
                    ]
                }); //на месяц
                res.end(JSON.stringify({
                    status: 'guest'
                }));
            }
        },

        (err) => {
            logs.log('\x1b[34mSTART CHECK STATUS\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                `SessionID ${cookies['token']}, Server Error: ${err.message}`);
            return returnError(ERRORS.AUTH_SERVER_ERROR, res);
        });
}

module.exports.start = start;