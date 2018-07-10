'use strict';

const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');


const register = (req, res) => {
    if (req.method === 'GET') {
        logs.log('\x1b[34mREGISTER\x1b[0m Method: ' + req.method);
        res.render('register.html', null);
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => sendAuthRequest('/register', body).then(
            registerResult => {
                if (registerResult.error) {
                    logs.log('Register \x1b[31mFAILED\x1b[0m user: ' + body);

                    const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/register';
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