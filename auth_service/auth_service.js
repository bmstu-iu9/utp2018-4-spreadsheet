'use strict';

const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const url = require('url');
const qs = require('querystring');
const logs = require('../app/logs');
const CONFIG = require('./config.json');

//Connection with database (users info)
const usersClient = new sqlite3.Database(CONFIG.dbAdress, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        logs.log('\x1b[35mAuth service\x1b[0m database connection error: ' + err.message);
    }

    logs.log('\x1b[35msqlite3\x1b[0m client connected \x1b[32msuccessfully\x1b[0m');
});

//To generate a session token
const ID = () => Math.random().toString(36).substr(2, 9);

const returnJSON = (obj, response) => {
    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    return response.end(JSON.stringify(obj));
}

const returnError = (errorCode, response) => {
    return returnJSON({
        error: errorCode
    }, response);
} 

/**
 * Finds user's session token in token key-value store
 * @param {Object} body 
 * @param {http.ServerResponse} response
 */
const checkSession = (body, response) => {
    usersClient.get(`SELECT Email email, Status status
                    FROM sessions
                    WHERE Token = ?`, [body.session], (err, row) => {
        if (err || !row) {
            let errorType = 0;
            if (err) {
                errorType = CONFIG.SQLITE3_DATABASE_ERROR;
                logs.log(`Check \x1b[31mFAILED\x1b[0m: SessionID: ${body.session}. Database error: ${err.message}`);
            } else {
                errorType = CONFIG.NO_TOKEN_ERROR;
                logs.log(`Check \x1b[31mFAILED\x1b[0m: SessionID: ${body.session}. Token is not registered`);
            }

            return returnError(errorType, response);
        }

        logs.log(`Check \x1b[32mSUCCESS\x1b[0m: SessionID: ${body.session}, Email: ${row.email}, Status: ${row.status}`);
        return returnJSON({
            email: row.email,
            status: row.status,
            error: null
        }, response);
    });
}

/**
 * Finds user's session token in token key-value store
 * @param {Object} body 
 * @param {http.ServerResponse} response
 */
const addGuest = (body, response) => { //body для общности
    const sessionID = ID();
    const currDate = new Date();

    usersClient.run(`INSERT INTO sessions(Token, Status, LoginTime)
                    VALUES(?, ?, ?)`, [sessionID, CONFIG.GUEST, Math.round(currDate.getTime() / 1000)],
        (err) => {
            if (err) {
                logs.log(`Login GUEST \x1b[31mFAILED\x1b[0m: SessionID: ${sessionID}, Database error: ${err.message}`);
                return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
            }

            logs.log(`Login GUEST \x1b[32mSUCCESS\x1b[0m: SessionID: ${sessionID}`);
            return returnJSON({
                session_id: sessionID,
                error: null
            }, response);
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
                    WHERE Email = ?`, [body.email], (err, row) => {
        if (err || !row || row.pass != body.password) {
            let errorType = 0;
            if (err) {
                errorType = CONFIG.SQLITE3_DATABASE_ERROR;
                logs.log(`Login USER(check email) \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Database error: ${err.message}`);
            } else if (!row) {
                errorType = CONFIG.NO_USER_ERROR;
                logs.log(`Login USER \x1b[31mFAILED\x1b[0m: Email: ${body.email}. User is not registered`);
            } else {
                errorType = CONFIG.INCORRECT_PASS_ERROR;
                logs.log(`Login USER \x1b[31mFAILED\x1b[0m: Email: ${body.email}. Incorrect password`);
            }

            return returnError(errorType, response);
        }


        //Insert session token for this user
        //на случай, если пользователь сразу попал на страницу логина
        const sessionID = (body.session === 'undefined' ? ID() : body.session);
        const currDate = new Date();
        usersClient.run(`REPLACE INTO sessions(Token, Email, Status, LoginTime)
                        VALUES(?, ?, ?, ?)`, [sessionID, body.email, CONFIG.USER, Math.round(currDate.getTime() / 1000)],
            (err) => {
                if (err) {
                    logs.log(`Login USER(replace token) \x1b[31mFAILED\x1b[0m: SessionID: ${sessionID} Email: ${body.email}, Database error: ${err.message}`);
                    return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
                }

                logs.log(`Login USER \x1b[32mSUCCESS\x1b[0m: SessionID: ${sessionID}, Email: ${body.email}`);
                return returnJSON({
                    session_id: sessionID,
                    error: null
                }, response);
            });
    });
}

/**
 * Delets user's token
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const logoutHandle = (body, response) => {
    const currDate = new Date();
    usersClient.run(`REPLACE INTO sessions(Token, Email, Status, LoginTime)
                    VALUES(?, ?, ?, ?)`, [body.session, ' ', CONFIG.GUEST, Math.round(currDate.getTime() / 1000)],
        (err) => {
            if (err) {
                logs.log(`Logout USER \x1b[31mFAILED\x1b[0m: SessionID: ${body.session}, Database error: ${err.message}`);
                return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
            }

            logs.log(`Logout USER \x1b[32mSUCCESS\x1b[0m: SessionID: ${body.session}`);
            return returnJSON({
                error: null
            }, response);
        });
}

/**
 * Inserts new user data in database
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const registerHandle = (body, response) => {
    usersClient.run(`INSERT INTO login_data(First_name, Last_name, Organization, Email, Pass)
                    VALUES(?, ?, ?, ?, ?)`, [body.first_name, body.last_name, body.organization, body.email, body.password],
        (err) => {
            if (err) {
                logs.log(`Register \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Database error: ${err.message}`);
                return returnError(err.message.indexOf('UNIQUE') === -1 ?
                    CONFIG.SQLITE3_DATABASE_ERROR : CONFIG.NOT_UNIQUE_ERROR, response);
            }

            logs.log(`Register \x1b[32mSUCCESS\x1b[0m: Email: ${body.email}`);
            return returnJSON({
                error: null
            }, response);
        });
}

//Starts server, which works only with POST requests
const server = http.createServer((req, res) => {
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
                } else if (path.path === '/guest') {
                    addGuest(qs.parse(body), res);
                } else if (path.path === '/register') {
                    registerHandle(qs.parse(body), res);
                } else if (path.path === '/logout') {
                    logoutHandle(qs.parse(body), res);
                } else {
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.end();
                }
            });
        } else {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end();
        }

    }).listen(CONFIG.port, () =>
        logs.log(`\x1b[35mAuth service\x1b[0m successfully \x1b[32mstarted\x1b[0m at ${CONFIG.port}`))
    .on('close', () => {
        usersClient.close((err) => {
            if (err) {
                logs.log('\x1b[35mAuth service\x1b[0m database close connection error' + err.message);
            }

            logs.log('\x1b[35msqlite3\x1b[0m client connection closed \x1b[32msuccessfully\x1b[0m');
        })

        logs.log(`\x1b[35mAuth service\x1b[0m successfully \x1b[32mstoped\x1b[0m at ${CONFIG.port}`);
    });

//процесс закончится автоматически(иначе не успеваем закрыть быстро БД коннект)
process.on('SIGINT', () => server.close());