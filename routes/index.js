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
const index = (req, res) => {
    logs.log(`\x1b[34mINDEX\x1b[0m Method: ${req.method}`);
    res.render('index.html', null);
}

module.exports.index = index;