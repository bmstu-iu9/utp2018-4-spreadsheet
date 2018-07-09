'use strict';

const redis = require('redis');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const url = require('url');
const qs = require('querystring');
const logs = require('./logs');
const CONFIG = require('../config/auth_config.json');

const CHECK_SESSION_ERROR = 1;
const NO_USER_ERROR = 2;
const REDIS_ERROR = 3;

const usersClient = new sqlite3.Database(CONFIG.dbAdress, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('something went wrong: ' + err.message); //сделать нормально;
    }

    logs.log('\x1b[35msqlite3\x1b[0m client connected \x1b[32msuccessfully\x1b[0m');
});

const redisClient = redis.createClient(CONFIG.redisPort, CONFIG.redisHost);
redisClient.on('connect', () => {logs.log('\x1b[35mRedis\x1b[0m client connected \x1b[32msuccessfully\x1b[0m')});
redisClient.on('error', (err) => {
    console.error('something went wrong: ' + err); //сделать нормально;
});

const ID = () => '_' + Math.random().toString(36).substr(2, 9);

const checkSession = (body, response) => {
    const mkey = "session: " + body.session;
    redisClient.get(mkey, (error, res) => {
        if (error || res === null) {
            logs.log('Check \x1b[31mFAILED\x1b[0m: sessionID:' + body.session);
            response.writeHead(200, { 'Content-Type' : 'application/json' });
            return response.end(JSON.stringify({email : null, error : CHECK_SESSION_ERROR}));
        }

        logs.log(`Check \x1b[32mSUCCESS\x1b[0m: sessionID: ${body.session}, user: ${res}`);

        response.writeHead(200, { 'Content-Type' : 'application/json' });
        return response.end(res);
    });
}

const loginHandle = (body, response) => {
    const emailData = body.email;
    const sqlQuery = `SELECT Email email,
                             Pass pass
                        FROM login_data
                        WHERE Email = ?`;
    usersClient.get(sqlQuery, [emailData], (err, row) => {
            if (err || !row || row.pass != body.password) {
                logs.log('Login \x1b[31mFAILED\x1b[0m: user:' + emailData);
                response.writeHead(200, { 'Content-Type' : 'application/json' });
                return response.end(JSON.stringify({session_id : null, error : NO_USER_ERROR}));
            }//нужны ли здесь мьютексы(нода же однопоточная)


            const sessionID = ID();
            const data = JSON.stringify({email : emailData});
            const mkey = "session: " + sessionID;
            redisClient.set(mkey, data, (error, res) => {
                if (error) {
                    logs.log('set sessionID \x1b[31mFAILED\x1b[0m: ' + sessionID);
                    response.writeHead(200, { 'Content-Type' : 'application/json' });
                    return response.end(JSON.stringify({session_id : null, error : REDIS_ERROR})); 
                }
            
                logs.log('\x1b[35mRedis\x1b[0m result: ' + res);
            });
        
            logs.log(`Login \x1b[32mSUCCESS\x1b[0m: user: ${emailData}, sessionID: ${sessionID}`);
            response.writeHead(200, { 'Content-Type' : 'application/json' });
            response.end(JSON.stringify({session_id : sessionID, error : null})); 
    });
}

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
            }
        }); 
    } else {
        res.writeHead(404, { 'Content-Type' : 'text/plain' });
        res.end(); 
    }

}).listen(CONFIG.port,() => 
        console.log('\x1b[35m%s\x1b[0m successfully \x1b[32mstarted\x1b[0m at %d','Auth service',
                CONFIG.port))
    .on('close', () => {
        usersClient.close((err) => {
            if (err) {
                console.error('something went wrong' + err.message); //сделать нормально;
            }

            logs.log('\x1b[35msqlite3\x1b[0m client connection closed \x1b[32msuccessfully\x1b[0m');
        })

        console.log('\x1b[35m%s\x1b[0m successfully \x1b[32mstoped\x1b[0m at %d','Auth service',
                CONFIG.port);
    });
