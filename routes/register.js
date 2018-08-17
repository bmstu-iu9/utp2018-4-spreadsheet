'use strict';

const qs = require('querystring');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const logs = require('../app/logs');

const register = (body, res) => {
    logs.log(`\x1b[34mREGISTER\x1b[0m Email: ${body.email_reg}`);

    const postData = qs.stringify({
        'first_name': body.first_name,
        'last_name': body.first_name,
        'organization': body.org,
        'email': body.email_reg,
        'password': body.password
    });

    sendAuthRequest('/register', postData).then(
        regINFO => {
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(regINFO));
        },

        () => {
            res.writeHead(500, {'Content-Type' : 'text/plain'});
            res.end('500 Internal server error!');
        });
}

module.exports.register = register;