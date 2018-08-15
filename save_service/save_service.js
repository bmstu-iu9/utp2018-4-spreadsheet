'use strict';

const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const url = require('url');
const qs = require('querystring');
const logs = require('../app/logs');
const CONFIG = require('./config.json');

const ERRORS = {
    CHECK_SESSION_ERROR: 1,
    SQLITE3_ERROR_NO_USER: 2,
    SQLITE3_ERROR_UNIQUE: 3,
    SQLITE3_ERROR_UNKNOWN: 4,
};

//Connection with database
const saveClient = new sqlite3.Database(CONFIG.dbAdress, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('something went wrong: ' + err.message); //сделать нормально;
    }

    logs.log('\x1b[35msqlite3\x1b[0m client connected \x1b[32msuccessfully\x1b[0m');
});

const removeToken = (token) => {
    saveClient.run(`DELETE FROM saves WHERE Token=?`, [token], (err) => {
        if (err) {
            console.log(`Planned remove \x1b[31mFAILED\x1b[0m: ${err}, ${token}`)
        }

        console.log(`Planned remove \x1b[32mSUCCESS\x1b[0m: ${token}`)
    });
}

const loadUserTitlesHandle = (body, response) => {
    saveClient.all(`SELECT Title title FROM saves_user
                    WHERE Email=? ORDER BY SaveTime DESC`, [body.email], (err, rows) => {
        if (err || !rows) {
            logs.log(`Load user titles \x1b[31mFAILED\x1b[0m: ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                titles: null,
                error: (err) ?
                    ERRORS.SQLITE3_ERROR_UNKNOWN : ERRORS.SQLITE3_ERROR_NO_USER
            }));
        }

        const titles = rows.map(e => e.title)
        logs.log(`Load user titles \x1b[32mSUCCESS\x1b[0m: ${body.email}`);


        response.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        });
        return response.end(JSON.stringify({
            titles: titles,
            error: null
        }));
    });
}

/**
 * Saves user's data
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const saveGuestHandle = (body, response) => {
    const currDate = new Date();
    new Promise((resolve, reject) => {
        if (body.session === 'undefined') {
            reject(new Error('Session undefined'));
            return;
        }

        saveClient.run(`REPLACE INTO saves_guest(Token, Data, SaveTime) VALUES(?, ?, ?)`, [body.session, body.data, Math.round(currDate.getTime() / 1000)], (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    }).then(
        () => {
            logs.log(`Save GUEST \x1b[32mSUCCESS\x1b[0m: sessionID: ${body.session}, ${currDate.toLocaleTimeString()}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            response.end(JSON.stringify({
                error: null
            }));
        },
        (err) => {
            logs.log(`Save GUEST \x1b[31mFAILED\x1b[0m: ${err}, ${currDate.toLocaleTimeString()}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                error: ERRORS.SQLITE3_ERROR
            }));
        });
}

const saveUserHandle = (body, response) => {
    const currDate = new Date();
    new Promise((resolve, reject) => {
        saveClient.run(`REPLACE INTO saves_user(Title, Email, Data, SaveTime) VALUES(?, ?, ?, ?)`,
            [body.title, body.email, body.data, Math.round(currDate.getTime() / 1000)], (err) => {
            if (err) {
                reject(err);
            }

            resolve();
        });
    }).then(
        () => {
            logs.log(`Save USER \x1b[32mSUCCESS\x1b[0m: Title: ${body.title}, Email: ${body.email}, Time: ${currDate.toLocaleTimeString()}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            response.end(JSON.stringify({
                error: null
            }));
        },
        (err) => {
            logs.log(`Save USER \x1b[31mFAILED\x1b[0m: Title: ${body.title}, Email: ${body.email}, Time: ${currDate.toLocaleTimeString()}, ERROR: ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                error: ERRORS.SQLITE3_ERROR
            }));
        });
}


const checkTitleHandle = (body, response) => {
    saveClient.get(`SELECT 1 FROM saves_user
                    WHERE Email=? AND Title=?`, [body.email, body.title], (err, row) => {
        if (err) {
            logs.log(`Check title file \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Title: ${body.title}, Error: ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                error: ERRORS.SQLITE3_ERROR_UNKNOWN
            }));
        }

        if (!row) {
            logs.log(`Check title file \x1b[32mSUCCESS\x1b[0m: Email: ${body.email}, Title: ${body.title}, Error: ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                error: null
            }));
        } else {
            logs.log(`Check title file \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Title: ${body.title}, Error: Title is already used`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                error: ERRORS.SQLITE3_ERROR_UNIQUE
            }));
        }
    });
}

/**
 * Removes user's data
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const removeGuestHandle = (body, response) => {
    new Promise((resolve, reject) => {
        if (body.session === 'undefined') {
            reject(new Error('Session undefined'));
            return;
        }

        saveClient.run(`DELETE FROM saves_guest WHERE Token=?`, [body.session], (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    }).then(
        () => {
            logs.log(`Remove \x1b[32mSUCCESS\x1b[0m: ${body.session}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            response.end(JSON.stringify({
                error: null
            }));
        },
        (err) => {
            logs.log(`Remove \x1b[31mFAILED\x1b[0m: ${body.session} ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                error: ERRORS.SQLITE3_ERROR
            }));
        });
}

const removeUserHandle = (body, response) => {
    new Promise((resolve, reject) => {
        saveClient.run(`DELETE FROM saves_user WHERE Title=? AND Email=?`, [body.title, body.email], (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    }).then(
        () => {
            logs.log(`Remove USER FILE \x1b[32mSUCCESS\x1b[0m: Title: ${body.title}, Email: ${body.email}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            response.end(JSON.stringify({
                error: null
            }));
        },
        (err) => {
            logs.log(`Remove USER FILE \x1b[31mFAILED\x1b[0m: Title: ${body.title}, Email: ${body.email}, Error: ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                error: ERRORS.SQLITE3_ERROR
            }));
        });
}

const loadGuestHandle = (body, response) => {
    saveClient.get(`SELECT Data data, SaveTime time
                    FROM saves_guest
                    WHERE Token = ?`, [body.session], (err, row) => {
        if (err || !row) {
            logs.log(`Load \x1b[31mFAILED\x1b[0m: ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                data: null,
                error: (err) ?
                    ERRORS.SQLITE3_ERROR_UNKNOWN : ERRORS.SQLITE3_ERROR_NO_USER
            }));
        }

        logs.log(`Load \x1b[32mSUCCESS\x1b[0m: ${body.session} ${row.time}`);
        response.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        });
        return response.end(JSON.stringify({
            data: row.data,
            error: null
        }));
    });
}

const loadUserHandle = (body, response) => {
    saveClient.get(`SELECT Data data
                FROM saves_user
                WHERE Email=? AND Title=?`, [body.email, body.title], (err, row) => {
        if (err || !row) {
            logs.log(`Load user file \x1b[31mFAILED\x1b[0m: Email: ${body.email}, Title: ${body.title}, Error: ${err}`);
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return response.end(JSON.stringify({
                data: null,
                error: (err) ?
                    ERRORS.SQLITE3_ERROR_UNKNOWN : ERRORS.SQLITE3_ERROR_NO_USER
            }));
        }

        logs.log(`Load user file \x1b[32mSUCCESS\x1b[0m: Email: ${body.email}, Title: ${body.title}, Error: ${err}`);
        response.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        });
        return response.end(JSON.stringify({
            data: row.data,
            error: null
        }));
    });
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
        usersClient.close((err) => {
            if (err) {
                logs.log('something went wrong' + err.message); //сделать нормально;
            }

            logs.log('\x1b[35msqlite3\x1b[0m client connection closed \x1b[32msuccessfully\x1b[0m');
        })

        logs.log(`\x1b[35mSave service\x1b[0m successfully \x1b[32mstoped\x1b[0m at ${CONFIG.port}`);
    });