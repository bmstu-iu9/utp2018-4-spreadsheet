'use strict';

const http = require('http');
const qs = require('querystring');
const logs = require('../app/logs');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const sendSaveRequest = require('../app/auth_request').sendSaveRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const CONFIG = require('../config/main_config.json');

/**
 * Checks client's token,
 * if it's ok renders main page,
 * else redirects to login page
 * @param {http.ClientRequest} req 
 * @param {http.ServerResponse} res 
 */
const index = (req, res) => {
    logs.log(`\x1b[34mINDEX\x1b[0m Method: ${req.method}`);
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({"session" : cookies['token']});
    sendAuthRequest('/check_session', postData).then(
        authINFO => {
            if (authINFO.error) {
                //const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/login';
                logs.log(`\x1b[33mNEW USER\x1b[0m`);
                //res.writeHead(302, {'Location' : redirectURL});
                //return res.end();
            }

            if (authINFO.status) {
                sendSaveRequest('/titles', qs.stringify({"email" : authINFO.email})).then(
                    titles => {
                        logs.log(`Titles \x1b[32mRECEIVED\x1b[0m: ${titles.titles}`);
                        res.render('index.html', {
                            email : authINFO.email,
                            titles : titles ? ['<button onclick="stay()">stay</button>'] +
                                    titles.titles.map(title => `<button onclick="loadUserTable('${title}')">${title}</button>`) : ' ',
                            log : '<a href="/logout">Выйти</a>' });
                    },

                    () => {
                        res.render('error.html', {"code" : 500, "message" : '500 Internal server error!'});//fix
                    }
                );
            } else {
                res.render('index.html', {email : 'GUEST', titles : ' ', log : '<a href="/login">Войти</a>'});
            }
        },

        () => {
            res.render('error.html', {"code" : 500, "message" : '500 Internal server error!'});
        });    
}

module.exports.index = index;