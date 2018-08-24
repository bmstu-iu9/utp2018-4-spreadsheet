'use strict';

const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const url = require('url');
const qs = require('querystring');
const logs = require('../app/logs');
const CONFIG = require('./config.json');

//Connection with database
const saveClient = new sqlite3.Database(CONFIG.dbAdress, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        logs.log('\x1b[35mSave service\x1b[0m database connection error: ' + err.message);
    }

    logs.log('\x1b[35msqlite3\x1b[0m client connected \x1b[32msuccessfully\x1b[0m');
});

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
 * Loads user titles ordered by savetime DESC.
 * @param {Object} body //Object with email property for load.
 * @param {http.ServerResponse} response 
 */
const loadUserTitlesHandle = (body, response) => {
    saveClient.all(`SELECT Title title, SaveTime timeStamp FROM saves_user
                    WHERE Email=? ORDER BY SaveTime DESC`, [body.email], (err, rows) => {
        if (err) {
            logs.log(`Load user titles \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Database error: ${err.message}`);
            return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
        }

        const titles = rows.map(e => { return{ title: e.title, timeStamp: e.timeStamp} });
        logs.log(`Load user titles \x1b[32mSUCCESS\x1b[0m: Email: ${body.email}`);
        return returnJSON({
            titles: titles,
            error: null
        }, response);
    });
}

/**
 * Saves guests data
 * @param {Object} body //Object with token and data info
 * @param {http.ServerResponse} response 
 */
const saveGuestHandle = (body, response) => {
    if (body.session === 'undefined') {
        logs.log(`Save GUEST \x1b[31mFAILED\x1b[0m: Session token is undefined.`);
        return returnError(CONFIG.TOKEN_UNDEFINED, response);
    }

    saveClient.run(`REPLACE INTO saves_guest(Token, Data, SaveTime) VALUES(?, ?, ?)`, [body.session, body.data, Date.now()],
        (err) => {
            if (err) {
                logs.log(`Save GUEST \x1b[31mFAILED\x1b[0m: SessionID: ${body.session}, Database error: ${err.message}`);
                return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
            }

            logs.log(`Save GUEST \x1b[32mSUCCESS\x1b[0m: SessionID: ${body.session}`);
            return returnJSON({
                error: null
            }, response);
        });
}

/**
 * Saves users data
 * @param {Object} body //Object with title, email and data info.
 * @param {http.ServerResponse} response 
 */
const saveUserHandle = (body, response) => {
    if (!body.title) {
        logs.log(`Save USER \x1b[31mFAILED\x1b[0m: Title is empty.`);
        return returnError(CONFIG.TOKEN_UNDEFINED, response);
    }

    saveClient.run(`REPLACE INTO saves_user(Title, Email, Data, SaveTime) VALUES(?, ?, ?, ?)`, [body.title, body.email, body.data, Date.now()], (err) => {
        if (err) {
            logs.log(`Save USER \x1b[31mFAILED\x1b[0m: Title: ${body.title}, Email: ${body.email}, Database error: ${err.message}`);
            return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
        }

        logs.log(`Save USER \x1b[32mSUCCESS\x1b[0m: Title: ${body.title}, Email: ${body.email}`);
        return returnJSON({
            error: null
        }, response);
    });
}

/**
 * Checks the uniqueness of the title 
 * @param {Object} body // Object with email and title info
 * @param {http.ServerResponse} response 
 */
const checkTitleHandle = (body, response) => {
    saveClient.get(`SELECT 1 FROM saves_user
                    WHERE Email=? AND Title=?`, [body.email, body.title], (err, row) => {
        if (err) {
            logs.log(`Check title file \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Title: ${body.title}, Database error: ${err.message}`);
            return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
        }

        if (!row) {
            logs.log(`Check title file \x1b[32mSUCCESS\x1b[0m: Email: ${body.email}, Title: ${body.title}`);
            return returnJSON({
                error: null
            }, response);
        } else {
            logs.log(`Check title file \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Title: ${body.title}, Error: Title is already used`);
            return returnError(CONFIG.NOT_UNIQUE_ERROR, response);
        }
    });
}

/**
 * Removes guests's data
 * @param {Object} body //Object with token
 * @param {http.ServerResponse} response 
 */
const removeGuestHandle = (body, response) => {
    if (body.session === 'undefined') {
        logs.log(`Remove GUEST FILE \x1b[31mFAILED\x1b[0m: Session token is undefined.`);
        return returnError(CONFIG.TOKEN_UNDEFINED, response);
    }

    saveClient.run(`DELETE FROM saves_guest WHERE Token=?`, [body.session], (err) => {
        if (err) {
            logs.log(`Remove GUEST FILE \x1b[31mFAILED\x1b[0m: SessionID: ${body.session}, Database error: ${err.message}`);
            return returnError(CONFIG.SQLITE3_DATABASE_ERROR, response);
        }

        logs.log(`Remove GUEST FILE \x1b[32mSUCCESS\x1b[0m: SessionID: ${body.session}`);
        return returnJSON({
            error: null
        }, response);
    });
}

/**
 * Removes users's data
 * @param {Object} body //Object with title and email info
 * @param {http.ServerResponse} response 
 */
const removeUserHandle = (body, response) => {
    saveClient.run(`DELETE FROM saves_user WHERE Title=? AND Email=?`, [body.title, body.email], (err) => {
        if (err) {
            logs.log(`Remove USER FILE \x1b[31mFAILED\x1b[0m: Title: ${body.title}, Email: ${body.email}, Database error: ${err.message}`);
            return returnError(CONFIG.TOKEN_UNDEFINED, response);
        }

        logs.log(`Remove USER FILE \x1b[32mSUCCESS\x1b[0m: Title: ${body.title}, Email: ${body.email}`);
        return returnJSON({
            error: null
        }, response);
    });
}

/**
 * Loads guests's data
 * @param {Object} body //Object with token
 * @param {http.ServerResponse} response 
 */
const loadGuestHandle = (body, response) => {
    saveClient.get(`SELECT Data data, SaveTime time
                    FROM saves_guest
                    WHERE Token = ?`, [body.session], (err, row) => {
        if (err || !row) {
            logs.log(`Load GUEST FILE \x1b[31mFAILED\x1b[0m: SessionID: ${body.session}, ${(err) ? err.message : 'Error: No data for this token'}`);
            return returnError((err) ? CONFIG.SQLITE3_DATABASE_ERROR : CONFIG.NO_TOKEN_ERROR, response);
        }

        logs.log(`Load GUEST FILE \x1b[32mSUCCESS\x1b[0m: SessionID: ${body.session}`);
        return returnJSON({
            data: row.data,
            error: null
        }, response);
    });
}

/**
 * Loads users's data
 * @param {Object} body //Object with email & title for load
 * @param {http.ServerResponse} response 
 */
const loadUserHandle = (body, response) => {
    saveClient.get(`SELECT Data data
                FROM saves_user
                WHERE Email=? AND Title=?`, [body.email, body.title], (err, row) => {
        if (err || !row) {
            logs.log(`Load USER FILE \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Title: ${body.title}, ${(err) ? err.message : 'Error: No data for this token'}`);
            return returnError((err) ? CONFIG.SQLITE3_DATABASE_ERROR : CONFIG.NO_TOKEN_ERROR, response);
        }

        logs.log(`Load USER FILE \x1b[32mSUCCESS\x1b[0m: Email: ${body.email}, Title: ${body.title}`);
        return returnJSON({
            data: row.data,
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
                if (path.path === '/save_guest') {
                    saveGuestHandle(qs.parse(body), res);
                } else if (path.path === '/save_user') {
                    saveUserHandle(qs.parse(body), res);
                } else if (path.path === '/check_title') { //Отдельный запрос на проверку уникальности,
                    checkTitleHandle(qs.parse(body), res); //чтобы не гонять данные с таблицы несколько раз.
                } else if (path.path === '/remove_guest') {
                    removeGuestHandle(qs.parse(body), res);
                } else if (path.path === '/remove_user') {
                    removeUserHandle(qs.parse(body), res);
                } else if (path.path === '/load_guest') {
                    loadGuestHandle(qs.parse(body), res);
                } else if (path.path === '/load_user') {
                    loadUserHandle(qs.parse(body), res);
                } else if (path.path === '/titles') {
                    loadUserTitlesHandle(qs.parse(body), res);
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
        logs.log(`\x1b[35mSave service\x1b[0m successfully \x1b[32mstarted\x1b[0m at ${CONFIG.port}`))
    .on('close', () => {
        saveClient.close((err) => {
            if (err) {
                logs.log('\x1b[35mSave service\x1b[0m database close connection error' + err.message); //сделать нормально;
            }

            logs.log('\x1b[35msqlite3\x1b[0m client connection closed \x1b[32msuccessfully\x1b[0m');
        })

        logs.log(`\x1b[35mSave service\x1b[0m successfully \x1b[32mstoped\x1b[0m at ${CONFIG.port}`);
    });

//процесс закончится автоматически(иначе не успеваем закрыть быстро БД коннект)
process.on('SIGINT', () => server.close());