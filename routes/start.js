'use strict';

const http = require('http');
const qs = require('querystring');
const logs = require('../app/logs');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const sendSaveRequest = require('../app/auth_request').sendSaveRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const SAVE_CONFIG = require('../config/save_config.json');

/**
 * Checks client's token,
 * if it's ok renders main page,
 * else redirects to login page
 * @param {http.ClientRequest} req 
 * @param {http.ServerResponse} res 
 */
const start = (req, res) => {
    logs.log(`\x1b[34mSTART\x1b[0m Method: ${req.method}`);
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({
        "session": cookies['token']
    });
    sendAuthRequest('/check_session', postData).then(
        authINFO => {
            if (authINFO.error) { //добавить код ошибки
                //Новый юзер с незареганой кукой
                //ставим гостя
                sendAuthRequest('/guest', '').then(
                    sessionINFO => {
                        if (!sessionINFO.error) {
                            logs.log(`\x1b[33mNEW GUEST\x1b[0m: sessionID: ${sessionINFO.session_id}`);
                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                                'Set-Cookie': ['token=' + sessionINFO.session_id +
                                    ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString(),
                                    'status=' + SAVE_CONFIG.GUEST + ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString()
                                ]
                            }); //на месяц
                            res.end(JSON.stringify({
                                status: 'new_guest'
                            }));
                        } //повтор
                    }
                );
                return;
            }

            if (authINFO.status) {
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': ['token=' + cookies['token'] +
                        ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString(),
                        'status=' + SAVE_CONFIG.USER + ';expires=' + new Date(new Date().getTime() + 31556952000).toUTCString()
                    ]
                }) //на год

                sendSaveRequest('/titles', qs.stringify({
                    "email": authINFO.email
                })).then(
                    titles => {
                        logs.log(`\x1b[33mUSER\x1b[0m: Email: ${authINFO.email}, sessionID: ${cookies['token']}`);
                        logs.log(`Titles \x1b[32mRECEIVED\x1b[0m: ${titles.titles}`);
                        res.end(JSON.stringify({
                            status: 'user',
                            email: authINFO.email,
                            titles: titles.titles
                        }));
                    },

                    () => {
                        logs.log(`\x1b[33mTITLES ERROR\x1b[0m: sessionID: ${cookies['token']}`);
                        res.end(JSON.stringify({
                            status: 'user',
                            email: authINFO.email,
                            error: 'titles_error'
                        }));
                    }
                );
            } else {
                logs.log(`\x1b[33mGUEST\x1b[0m: sessionID: ${cookies['token']}`);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': ['token=' + cookies['token'] +
                        ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString(),
                        'status=' + SAVE_CONFIG.GUEST + ';expires=' + new Date(new Date().getTime() + 2592000000).toUTCString()
                    ]
                }); //на месяц
                res.end(JSON.stringify({
                    status: 'guest'
                }));
            }
        },

        () => {
            logs.log(`\x1b[33mCHECK STATUS ERROR\x1b[0m: sessionID: ${cookies['token']}`);
            res.writeHead(200, {
                'Content-Type': 'application/json',
            }); //на месяц
            res.end(JSON.stringify({
                error: 'check_error'
            }));
        });
}

module.exports.start = start;