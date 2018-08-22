'use strict';

/**
 * Send AJAX save request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_save = (postData, okCallback, errorCallback) => {
    sendXMLHttpRequest(config.host_main, config.port_main, '/save_user_data', 'POST',
        'status=' + postData.status + '&title=' + postData.title + '&session=' + postData.session + '&data=' + postData.data,
        (dataJSON, error) => {
            if (dataJSON.error || error) {
                return errorCallback(error ? error : dataJSON.error); //почему то || не работает
            }

            okCallback(dataJSON);
        });
}

/**
 * Send AJAX remove request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_remove_guest = (okCallback, errorCallback) => {
    sendXMLHttpRequest(config.host_main, config.port_main,
        '/remove_user_data?status=' + USER_STATUS.GUEST, 'GET', null,
        (dataJSON, error) => {
            if (dataJSON.error || error) {
                return errorCallback(error ? error : dataJSON.error);
            }

            okCallback(dataJSON);
        });
}

const transfer = (transferData, okCallback, errorCallback) => {
    sendXMLHttpRequest(config.host_main, config.port_main,
        '/check_user_title?title=' + transferData.title, 'GET', null,
        (dataJSON, error) => {
            if (dataJSON.error || error) {
                return errorCallback(error ? error : dataJSON.error);
            }

            sendXMLHttpRequest(config.host_main, config.port_main, '/save_user_data', 'POST',
                'status=' + USER_STATUS.USER + '&session=' + transferData.session +
                '&title=' + transferData.title + '&data=' + transferData.data,
                (dataJSON, error) => {
                    if (dataJSON.error || error) {
                        return errorCallback(error ? error : dataJSON.error);
                    }

                    ajax_remove_guest(okCallback, errorCallback);
                });


        });
}

const new_table = (mode, okCallback, errorCallback) => {
    const cookie = parseCookies(document.cookie);
    const newTitle = prompt(mode === 1 ? 'Title is already used' : 'Enter file title: ', 'new_title');
    if (!newTitle) return;

    transfer({
        title: newTitle,
        session: cookie['token'],
        data: JSON.stringify({
            'size': [DEFAULT_ROWS, DEFAULT_COLS]
        })
    }, (removeINFO) => {
        tableTitle = newTitle;
        okCallback(removeINFO);
    }, (errorCode) => {
        if (errorCode === ERRORS.NOT_UNIQUE_ERROR) //Название занято
            new_table(1, okCallback, errorCallback);
        else {
            return errorCallback(errorCode);
        }
    });
}

const stay = (mode, data, errorCallback) => {
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
    }, (errorCode) => {
        console.log('err' + errorCode)
        if (errorCode === ERRORS.NOT_UNIQUE_ERROR) //Название занято
            stay(1, newData, errorCallback);
        else {
            return errorCallback(errorCode);
        }
    });
}

const saveData = (postData) => {
    ajax_save(postData, () => {
            document.getElementById('saveINFO').textContent = 'Last save: ' + new Date().toLocaleTimeString();
        },
        (errorCode) => {
            document.getElementById('saveINFO').textContent = ERROR_MESSAGES[errorCode];
        });
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