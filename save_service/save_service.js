'use strict';

const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const url = require('url');
const qs = require('querystring');
const logs = require('../app/logs');
const CONFIG = require('./config.json');

const ERRORS = {
    CHECK_SESSION_ERROR : 1,
    SQLITE3_ERROR_NO_USER : 2,
    SQLITE3_ERROR_UNIQUE : 3,
    SQLITE3_ERROR_UNKNOWN : 4,
};

const removeTimers = {};

//Connection with database
const saveClient = new sqlite3.Database(CONFIG.dbAdress, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('something went wrong: ' + err.message); //сделать нормально;
    }

    logs.log('\x1b[35msqlite3\x1b[0m client connected \x1b[32msuccessfully\x1b[0m');
});

const removeToken = (token) => {
    saveClient.run(`DELETE FROM saves WHERE Token=?`,
                    [token], (err) => {
            if (err) {
                console.log(`Planned remove \x1b[31mFAILED\x1b[0m: ${err}, ${token}`)
            }

            console.log(`Planned remove \x1b[32mSUCCESS\x1b[0m: ${token}`)
        });
}

/**
 * Saves user's data
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const saveHandle = (body, response) => {
    const localeTime = new Date().toLocaleTimeString();
    new Promise((resolve, reject) => {
        saveClient.run(`REPLACE INTO saves(Token, Data, Time) VALUES(?, ?, ?)`,
                    [body.session, body.data, localeTime], (err) => {
            if (err) {
                reject(err);
            }

            resolve();
        });
    }).then(
        () => {
            if (removeTimers[body.session]) {
                clearTimeout(removeTimers[body.session])
            }

            removeTimers[body.session] = setTimeout(() => removeToken(body.session), 31536000000); //будем хранить год 31536000000
            logs.log(`Save \x1b[32mSUCCESS\x1b[0m: sessionID: ${body.session}, ${localeTime}`);
            response.writeHead(200, { 
                'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin' : '*',
            });
            response.end(JSON.stringify({error : null})); 
    },
        (err) => {
            logs.log(`Save \x1b[31mFAILED\x1b[0m: ${err}, ${localeTime}`);
            response.writeHead(200, { 
                'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin' : '*',
            });
            return response.end(JSON.stringify({error : ERRORS.SQLITE3_ERROR}));
    });
}

/**
 * Removes user's data
 * @param {Object} body 
 * @param {http.ServerResponse} response 
 */
const removeHandle = (body, response) => {
    new Promise((resolve, reject) => {
        saveClient.run(`DELETE FROM saves WHERE Token=?`,
                    [body.session], (err) => {
            if (err) {
                reject(err);
            }

            resolve();
        });
    }).then(
        () => {
            logs.log(`Remove \x1b[32mSUCCESS\x1b[0m:`);
            response.writeHead(200, { 
                'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin' : '*',
            });
            response.end(JSON.stringify({error : null}));
    },
        (err) => {
            logs.log(`Remove \x1b[31mFAILED\x1b[0m: ${err}`);
            response.writeHead(200, { 
                'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin' : '*',
            });
            return response.end(JSON.stringify({error : ERRORS.SQLITE3_ERROR}));
    });
}

const loadHandle = (body, response) => {
    saveClient.get(`SELECT Data data, Time time
                    FROM saves
                    WHERE Token = ?`,
                    [body.session], (err, row) => {
        if (err || !row) {
            logs.log(`Load \x1b[31mFAILED\x1b[0m: ${err}`);
            response.writeHead(200, { 
                'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin' : '*',
            });
            return response.end(JSON.stringify({data : null, error : (err) ?
                ERRORS.SQLITE3_ERROR_UNKNOWN : ERRORS.SQLITE3_ERROR_NO_USER}));
        }

        logs.log(`Load \x1b[32mSUCCESS\x1b[0m: ${body.session} ${row.time}`);
        response.writeHead(200, { 
            'Content-Type' : 'application/json',
            'Access-Control-Allow-Origin' : '*',
        });
        return response.end(JSON.stringify({data : row.data, error : null}));
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
            if (path.path === '/save') {
                saveHandle(qs.parse(body), res);
            } else if (path.path === '/remove') {
                removeHandle(qs.parse(body), res);
            } else if (path.path === '/load') {
                loadHandle(qs.parse(body), res);
            } else {
                res.writeHead(404, { 'Content-Type' : 'text/plain' });
                res.end(); 
            }
        }); 
    } else {
        res.writeHead(404, { 'Content-Type' : 'text/plain' });
        res.end(); 
    }

}).listen(CONFIG.port,() => 
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