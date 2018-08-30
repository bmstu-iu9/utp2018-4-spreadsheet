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

const ajax_remove_user = (title, okCallback, errorCallback) => {
    sendXMLHttpRequest(config.host_main, config.port_main,
        '/remove_user_data?status=' + USER_STATUS.USER + '&title=' + title, 'GET', null,
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
                'status=' + transferData.status + '&session=' + transferData.session +
                '&title=' + transferData.title + '&data=' + transferData.data,
                (dataJSON, error) => {
                    if (dataJSON.error || error) {
                        return errorCallback(error ? error : dataJSON.error);
                    }

                    ajax_remove_guest(okCallback, errorCallback);
                });


        });
}

const updateTitle = (updateInfo, okCallback, errorCallback) => {
    sendXMLHttpRequest(config.host_main, config.port_main,
        '/check_user_title?title=' + updateInfo.new_title, 'GET', null,
        (dataJSON, error) => {
            if (dataJSON.error || error) {
                return errorCallback(error ? error : dataJSON.error);
            }

            sendXMLHttpRequest(config.host_main, config.port_main, '/rename_user_data', 'POST',
                'status=' + updateInfo.status + '&session=' + updateInfo.session +
                '&title=' + updateInfo.title + '&new_title=' + updateInfo.new_title,
                (dataJSON, error) => {
                    if (dataJSON.error || error) {
                        return errorCallback(error ? error : dataJSON.error);
                    }

                    okCallback(dataJSON);
                });
        });
}

const rename = (mode, oldTitle, okCallback, errorCallback) => {
    const cookie = parseCookies(document.cookie);
    const newTitle = prompt(mode === 1 ? 'Title is already used' : 'Enter file title: ', oldTitle);
    if (!newTitle) return;

    updateTitle({
        title: oldTitle,
        new_title: newTitle,
        status: cookie['status'],
        session: cookie['token'],
    }, (removeINFO) => {
        removeINFO.new_title = newTitle;
        okCallback(removeINFO);
    }, (errorCode) => {
        if (errorCode === ERRORS.NOT_UNIQUE_ERROR) //Название занято
            rename(1, oldTitle, okCallback, errorCallback);
        else {
            return errorCallback(errorCode);
        }
    });
}

const new_table = (mode, okCallback, errorCallback) => {
    const cookie = parseCookies(document.cookie);
    const newTitle = prompt(mode === 1 ? 'Title is already used' : 'Enter file title: ', 'new_title');
    if (!newTitle) return;

    transfer({
        title: newTitle,
        status: cookie['status'],
        session: cookie['token'],
        data: JSON.stringify({
            table: {
                'size': [ROWS, COLS]
            },
            styles: {},
            bgColors: {},
            txtColors: {}
        })
    }, (removeINFO) => {
        setNewTitle(newTitle);
        okCallback(removeINFO);
    }, (errorCode) => {
        if (errorCode === ERRORS.NOT_UNIQUE_ERROR) //Название занято
            new_table(1, okCallback, errorCallback);
        else {
            return errorCallback(errorCode);
        }
    });
}

const stay = (mode, data, okCallback, errorCallback) => {
    const cookie = parseCookies(document.cookie);
    const newTitle = prompt(mode ? 'Title is already used' : 'Enter file title: ', 'new_title');
    if (!newTitle) return;
    const newData = mode ? data : JSON.stringify({
        table: Object.assign({}, {
            'size': [ROWS, COLS]
        }, innerTable.activeCeils),
        styles: styledFontCells,
        bgColors: backgroundColoredCells,
        txtColors: textColoredCells
    })

    transfer({
        session: cookie['token'],
        status: cookie['status'],
        title: newTitle,
        data: newData
    }, (removeINFO) => {
        setNewTitle(newTitle);
        okCallback(removeINFO);
    }, (errorCode) => {
        if (errorCode === ERRORS.NOT_UNIQUE_ERROR) //Название занято
            stay(1, newData, okCallback, errorCallback);
        else {
            return errorCallback(errorCode);
        }
    });
}

const save = (okCallback, errorCallback) => {
    const cookie = parseCookies(document.cookie);

    ajax_save({
        title: tableTitle,
        status: cookie['status'],
        session: cookie['token'],
        data: JSON.stringify({
            table: Object.assign({}, {
                'size': [ROWS, COLS]
            }, innerTable.activeCeils),
            styles: styledFontCells,
            bgColors: backgroundColoredCells,
            txtColors: textColoredCells
        })
    }, okCallback, errorCallback);
}

const saveAs = (mode, data, okCallback, errorCallback) => {
    const cookie = parseCookies(document.cookie);
    const newTitle = prompt(mode === 1 ? 'Title is already used' : 'Enter file title: ', 'new_title');
    if (!newTitle) return;
    const newData = mode ? data : JSON.stringify({
        table: Object.assign({}, {
            'size': [ROWS, COLS]
        }, innerTable.activeCeils),
        styles: styledFontCells,
        bgColors: backgroundColoredCells,
        txtColors: textColoredCells
    });

    ajax_save({
        title: newTitle,
        status: cookie['status'],
        session: cookie['token'],
        data: newData
    }, (saveInfo) => {
        setNewTitle(newTitle);
        okCallback(saveInfo);
    }, (errorCode) => {
        if (errorCode === ERRORS.NOT_UNIQUE_ERROR) //Название занято
            saveAs(1, newData, okCallback, errorCallback);
        else {
            return errorCallback(errorCode);
        }
    });
}

//const mem = () => ajax_remove({session: parseCookies(document.cookie)['token']});
setInterval(() => {
    save(() => {
        closeSideMenu(document.getElementById('sideMenu'));
        document.getElementById('filesMenuUl').removeChild(document.getElementById('load_' + tableTitle));
        addLoadOption(document.getElementById('sideMenuUl'), document.getElementById('filesMenuUl'),
            tableTitle, dateToString(new Date()), 'front');
    }, (error) => {
        console.log('INTERVAL SAVE ERROR: ' + ERROR_MESSAGES[error]);
    });
}, 600000 * 3); //30 минут