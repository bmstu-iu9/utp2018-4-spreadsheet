'use strict';

/**
 * Send AJAX save request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_save = (postData, okCallback, errorCallback) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                let saveINFO = null;
                try {
                    saveINFO = JSON.parse(ajax.responseText);
                } catch {
                    errorCallback();
                    return;
                }

                if (saveINFO.error) {
                    errorCallback(saveINFO.error);
                    return;
                }

                okCallback(saveINFO);
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_main + ':' + config.port_main + '/save_user_data');
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send('status=' + postData.status + '&title=' + postData.title + '&session=' + postData.session + '&data=' + postData.data);
}

/**
 * Send AJAX remove request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_remove_guest = (okCallback, errorCallback) => {
    sendXMLHttpRequest(config.host_main, config.port_main,
        '/remove_user_data?status=' + USER_STATUS.GUEST, 'GET', (dataJSON) => {
            if (dataJSON.error) {
                return errorCallback(dataJSON.error);
            } else {
                okCallback(dataJSON);
            }
        }, errorCallback);
}

const transfer = (transferData, okCallback, errorCallback) => {
    sendXMLHttpRequest(config.host_main, config.port_main,
        '/check_user_title?title=' + transferData.title, 'GET',
        (dataJSON) => {
            if (dataJSON.error) {
                return errorCallback(dataJSON.error);
            }

            const saveXHR = new XMLHttpRequest();
            saveXHR.open('POST', 'http://' + config.host_main + ':' + config.port_main + '/save_user_data');
            saveXHR.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            saveXHR.send('status=' + USER_STATUS.USER + '&session=' + transferData.session + '&title=' + transferData.title + '&data=' + transferData.data);
            saveXHR.onload = () => {
                let saveINFO = null;
                try {
                    saveINFO = JSON.parse(saveXHR.responseText);
                } catch {
                    return errorCallback();
                }

                if (saveINFO.error) {
                    return errorCallback(saveINFO.error);
                }

                ajax_remove_guest(okCallback, errorCallback);
            }

        }, errorCallback);
}

const saveData = (postData) => {
    ajax_save(postData, () => {
            document.getElementById('saveINFO').textContent = 'Last save: ' + new Date().toLocaleTimeString();
        },
        () => {
            document.getElementById('saveINFO').textContent = 'Autosave failed';
        });
}

const new_table = (mode, okCallback) => {
    const cookie = parseCookies(document.cookie);
    const newTitle = prompt(mode ? 'Title is already used' : 'Enter file title: ', 'new_title');
    if (!newTitle) return;
    ajax_save({
        title: newTitle,
        status: cookie['status'],
        session: cookie['token'],
        data: JSON.stringify({
            'size': [DEFAULT_ROWS, DEFAULT_COLS]
        })
    }, (saveINFO) => {
        tableTitle = newTitle;
        okCallback(saveINFO);
    }, (error) => {
        new_table(1);
    });
}

const stay = (mode, data) => {
    const newTitle = prompt(mode ? 'Title is already used' : 'Enter file title: ', 'new_title');
    if (!newTitle) return;
    const newData = mode ? data : JSON.stringify(Object.assign({}, {
        'size': [ROWS, COLS]
    }, innerTable.activeCeils));
    transfer({
        session: parseCookies(document.cookie)['token'],
        title: newTitle,
        data: newData
    }, (removeINFO) => {
        tableTitle = newTitle;
        console.log('ok' + removeINFO);
    }, (error) => {
        console.log('err' + error)
        stay(1, newData);
    });
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

const save = () => {
    const cookie = parseCookies(document.cookie);
    console.log(cookie);
    saveData({
        title: tableTitle,
        status: cookie['status'],
        session: cookie['token'],
        data: JSON.stringify(Object.assign({}, {
            'size': [ROWS, COLS]
        }, innerTable.activeCeils))
    })
}

//const mem = () => ajax_remove({session: parseCookies(document.cookie)['token']});
setInterval(save, 600000 * 3); //30 минут