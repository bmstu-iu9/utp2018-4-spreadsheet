'use strict';

const http = require('http');
const logs = require('../app/logs');
const parseCookies = require('../app/parse_cookies').parseCookies;

/**
 * Checks client's token,
 * if it's ok renders main page,
 * else redirects to login page
 * @param {http.ClientRequest} req 
 * @param {http.ServerResponse} res 
 */
const index = (req, res) => {
    logs.log(`\x1b[34mINDEX PAGE\x1b[0m. User: ${parseCookies(req.headers.cookie)['token']}`);
    res.render('index.html', null);
}

module.exports.index = index;