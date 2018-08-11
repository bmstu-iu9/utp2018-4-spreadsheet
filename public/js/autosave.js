'use strict';

const config = {
    "host_main" : "127.0.0.1",
    "port_main" : 8080,
    
    "host_save" : "127.0.0.1",
    "port_save" : 8082,

    "column_del" : ',',
    "row_del" : '|',
}

const ERROR_MESSAGES = {
    4 : 'Something goes wrong',
    5 : 'The save server has a rest :)',
}

/**
 * Send AJAX save request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_save = (postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                let saveINFO = null;
                try {
                    saveINFO = JSON.parse(ajax.responseText);
                } catch {
                    return;
                }

                if (saveINFO.error) {
                    return;
                }

                document.getElementById('saveINFO').textContent = 'Last save: ' + new Date().toLocaleTimeString();
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_save + ':' + config.port_save + '/save');
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send('session='+postData.session + '&data='+postData.data);
}

/**
 * Send AJAX remove request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_remove = (postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                let saveINFO = null;
                try {
                    saveINFO = JSON.parse(ajax.responseText);
                } catch {
                    return;
                }
                
                if (saveINFO.error) {
                    return;
                }
  
                //document.getElementById('saveINFO').textContent = 'No autosave';
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_save + ':' + config.port_save + '/remove');
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send('session='+postData.session);
}

/**
 * Simple cookie parser
 * @param {String} reqCookies
 * @returns {Object} Parsed key-value cookie pairs
 */
const parseCookies = (reqCookies) => {
    const cookies = {};
    
    if (reqCookies) {
        reqCookies.split(';').forEach((cookie) => {
            const kv = cookie.split('=');
            cookies[kv[0]] = kv[1];
        });
    }

    return cookies;
}

const prepareText = (data) => {
    for (let field in data) {
        if (field === 'size') continue;
        data[field] = str2arr(data[field]);
    }

    return data;
}


function arr2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

function str2arr(str) {
    var buf = new Array(str.length); // 2 bytes for each char
    for (var i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }

    return buf;
}

const save = () => ajax_save({session: parseCookies(document.cookie)['token'], data: JSON.stringify(prepareText(innerTable.collectData()))});
//const mem = () => ajax_remove({session: parseCookies(document.cookie)['token']});
setInterval(() => ajax_save({session: parseCookies(document.cookie)['token'], data: JSON.stringify(prepareText(innerTable.collectData()))}), 600000 * 3); //30 минут