'use strict';

const url = require('url');
const qs = require('querystring');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');

const ERROR_MESSAGES = {
    3 : 'Email already registered',
    4 : 'Something goes wrong',
}

const register = (req, res) => {
    if (req.method === 'GET') {
        const parsedURL = url.parse(req.url, true);
        logs.log('\x1b[34mREGISTER\x1b[0m Method: ' + req.method);
        const error_message = parsedURL.query['e'] ? ERROR_MESSAGES[parseInt(parsedURL.query['e'], 10)] : ' ';
        res.render('register.html', {"error_message" : error_message});
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => sendAuthRequest('/register', body).then(
            registerResult => {
                if (registerResult.error) {
                    logs.log(`Register \x1b[31mFAILED\x1b[0m user: ${body} ${ERROR_MESSAGES[registerResult.error]}`);

                    const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/register?' + qs.stringify({e : registerResult.error});
                    logs.log('\x1b[33mREDIRECT\x1b[0m ' + redirectURL);
                    res.writeHead(302, {'Location' : redirectURL});
                    return res.end();
                }

                logs.log('Register \x1b[32mSUCCESS\x1b[0m user: ' + body);

                const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/login';
                logs.log('\x1b[33mREDIRECT\x1b[0m ' + redirectURL);
                res.writeHead(302, {'Location' : redirectURL});
                return res.end();
            }
        ));

        
    }
}

module.exports.register = register;