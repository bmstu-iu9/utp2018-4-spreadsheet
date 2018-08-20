'use strict';

const config = {
    "host_main" : "127.0.0.1",
    "port_main" : 8080,
    
    "host_auth" : "127.0.0.1",
    "port_auth" : 8081,

    "host_save" : "127.0.0.1",
    "port_save" : 8082,
};

const ERROR_MESSAGES = {
    401 : 'NO_TOKEN_ERROR',
    402 : 'Invalid email or password',
    403 : 'Email is already used',
    404 : 'The authorization server has a rest :)',
    405 : 'Invalid email or password',

    501 : 'NO_TOKEN_ERROR',
    502 : 'Invalid email',
    503 : 'Title is already used',
    504 : 'The save server has a rest :)',
    505 : "TOKEN_UNDEFINED",
    
    601 : "PERMISSION_DENIED",
    602 : "SAVE_SERVER_ERROR",
    603 : "AUTH_SERVER_ERROR", 
};

const USER_STATUS = {
    GUEST : 0,
    USER : 1,
    ADMIN : 666,
}