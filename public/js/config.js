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
    2 : 'Invalid email or password',
    3 : 'Title is already used',
    4 : 'Something goes wrong',
    5 : 'The authorization server has a rest :)',
    6 : 'The save server has a rest :)',
};