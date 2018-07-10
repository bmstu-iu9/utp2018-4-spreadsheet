'use strict';

const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const url = require('url');
const qs = require('querystring');
const logs = require('./logs');
const CONFIG = require('../config/auth_config.json');

const ERRORS = {
    CHECK_SESSION_ERROR : 1,
    NO_USER_ERROR : 2,
    SQLITE3_ERROR : 3,
};

//Connection with database (users info)
const usersClient = new sqlite3.Database(CONFIG.dbAdress, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('something went wrong: ' + err.message); //сделать нормально;
    }

    logs.log('\x1b[35msqlite3\x1b[0m client connected \x1b[32msuccessfully\x1b[0m');
});

//To generate a session token
const ID = () => '_' + Math.random().toString(36).substr(2, 9);

/**
 * Finds user's session token in token key-value store
 * @param {Object} body 
 * @param {http.ServerResponse} response
 */
const checkSession = (body, response) => {
    usersClient.get(`SELECT SessionJSON sessionJSON
                    FROM sessions
                    WHERE Token = ?`,
                    [body.session], (err, row) => {
        if (err || !row) {
            logs.log(`Check \x1b[31mFAILED\x1b[0m: sessionID: ${body.session}`);
            response.writeHead(200, { 'Content-Type' : 'application/json' });
            return response.end(JSON.stringify({email : null, error : ERRORS.CHECK_SESSION_ERROR}));
        }

        logs.log(`Check \x1b[32mSUCCESS\x1b[0m: sessionID: ${body.session}, user: ${row.sessionJSON}`);

        response.writeHead(200, { 'Content-Type' : 'application/json' });
        return response.end(row.sessionJSON);
    });
}

/**
 * Finds user email and compares passwords
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const loginHandle = (body, response) => {
    usersClient.get(`SELECT Email email,
                            Pass pass
                    FROM login_data
                    WHERE Email = ?`,
                    [body.email], (err, row) => {
        if (err || !row || row.pass != body.password) {
            logs.log(`Login \x1b[31mFAILED\x1b[0m: user: ${body.email}`);
            response.writeHead(200, { 'Content-Type' : 'application/json' });
            return response.end(JSON.stringify({session_id : null, error : ERRORS.NO_USER_ERROR}));
        }

        //Insert session token for this user
        const sessionID = ID();
        usersClient.run(`INSERT INTO sessions(Token, SessionJSON) VALUES(?, ?)`,
                        [sessionID, JSON.stringify({email : body.email})], (err) => {
            if (err) {
                logs.log(`Set sessionID \x1b[31mFAILED\x1b[0m: ${sessionID}`);
                response.writeHead(200, { 'Content-Type' : 'application/json' });
                return response.end(JSON.stringify({session_id : null, error : ERRORS.SQLITE3_ERROR})); 
            }
        });
    
        logs.log(`Login \x1b[32mSUCCESS\x1b[0m: user: ${body.email}, sessionID: ${sessionID}`);
        response.writeHead(200, { 'Content-Type' : 'application/json' });
        response.end(JSON.stringify({session_id : sessionID, error : null})); 
    });
}

/**
 * Inserts new user data in database
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const registerHandle = (body, response) => {
    usersClient.run(`INSERT INTO login_data(First_name, Last_name, Organization, Email, Pass)
                    VALUES(?, ?, ?, ?, ?)`,
                    [body.first_name, body.last_name, body.organization, body.email, body.password],
                    (err) => {
        if (err) {
            logs.log(`Register \x1b[31mFAILED\x1b[0m: ${body.email}`);
            response.writeHead(200, { 'Content-Type' : 'application/json' });
            return response.end(JSON.stringify({error : ERRORS.SQLITE3_ERROR})); 
        }
    });

    logs.log(`Register \x1b[32mSUCCESS\x1b[0m: user: ${body.email}`);
    response.writeHead(200, { 'Content-Type' : 'application/json' });
    response.end(JSON.stringify({error : null}));
}

//Starts server, which works only with POST requests
http.createServer((req, res) => {
    const path = url.parse(req.url, true)
    if (req.method === 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            if (path.path === '/check_session') {
                checkSession(qs.parse(body), res);
            } else if (path.path === '/login') {
                loginHandle(qs.parse(body), res);
            } else if (path.path === '/register') {
                registerHandle(qs.parse(body), res);
            }
        }); 
    } else {
        res.writeHead(404, { 'Content-Type' : 'text/plain' });
        res.end(); 
    }

}).listen(CONFIG.port,() => 
        logs.log(`\x1b[35mAuth service\x1b[0m successfully \x1b[32mstarted\x1b[0m at ${CONFIG.port}`))
    .on('close', () => {
        usersClient.close((err) => {
            if (err) {
                logs.log('something went wrong' + err.message); //сделать нормально;
            }

            logs.log('\x1b[35msqlite3\x1b[0m client connection closed \x1b[32msuccessfully\x1b[0m');
        })

        logs.log(`\x1b[35mAuth service\x1b[0m successfully \x1b[32mstoped\x1b[0m at ${CONFIG.port}`);
    });
