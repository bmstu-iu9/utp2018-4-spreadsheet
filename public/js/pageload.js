'use strict';


const pushFrontSideMenu = (sideMenu, text, func, id) => {
    const li = document.createElement('li');
    li.id = (id ? id : '');
    const aLi = document.createElement('a');
    aLi.onclick = func;
    aLi.textContent = text;
    li.appendChild(aLi);

    sideMenu.insertBefore(li, sideMenu.childNodes[0]);
}

const pushBackSideMenu = (sideMenu, text, func, id) => {
    const li = document.createElement('li');
    li.id = (id ? id : '');
    const aLi = document.createElement('a');
    aLi.onclick = func;
    aLi.textContent = text;
    li.appendChild(aLi);

    sideMenu.appendChild(li);
}

const addLoadOption = (sideMenu, fileMenu, title, timeStamp, mode) => {
    const li = document.createElement('li');
    li.id = 'load_' + title;
    li.className = 'fileMenuLi';
    const aLi = document.createElement('a');
    aLi.onclick = () => {
        if (tableTitle) {
            save(() => {
                console.log('save ok');
            }, (error) => {
                alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                console.log(ERROR_MESSAGES[error]);
            });
        }

        toLoad();
        getSavedTable(aLi.innerText, (dataINFO) => {
                ajax_remove_guest(() => {
                    removeTable();

                    const tableData = JSON.parse(dataINFO.data);
                    tableFromObject(tableData);
                    setNewTitle(aLi.innerText);

                    closeSideMenu(document.getElementById('filesMenu'));
                    closeSideMenu(document.getElementById('sideMenu'));

                    removeFromSideMenu(sideMenu, 'stay_li');
                    addSaveOptions(sideMenu);
                    toLoad();
                }, (error) => {
                    alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                    console.log(ERROR_MESSAGES[error]);
                    toLoad();
                });
            },
            (error) => {
                alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                console.log(ERROR_MESSAGES[error]);
                toLoad();
            });
    };

    aLi.textContent = title;
    li.appendChild(aLi);

    const timeStampP = document.createElement('p');
    timeStampP.className = 'timeStamp'
    timeStampP.textContent = 'Save: ' + timeStamp;
    li.appendChild(timeStampP);

    if (mode === 'front') {
        fileMenu.insertBefore(li, fileMenu.childNodes[0]);
    } else if (mode === 'back') {
        fileMenu.appendChild(li);
    }
}

const loadSideMenu = (sideMenu, funcObj) => {
    for (let funcName in funcObj) {
        pushBackSideMenu(sideMenu, funcName, funcObj[funcName]);
    };
}

const closeSideMenu = (sideMenu) => {
    const closeElem = document.getElementById('close');
    if (!closeElem.getAttribute('for')) {
        closeElem.setAttribute('for', 'sideMenu');
    }

    if (sideMenu.nodeName === 'DIV') {
        sideMenu.style.left = '-340px';
        sideMenu.style.opacity = '0';
    } else {
        sideMenu.checked = false;
    }
}

const openSideMenu = (sideMenu, block) => {
    if (block) {
        document.getElementById("close").setAttribute("for", "");
    }

    if (sideMenu.nodeName === 'DIV') {
        sideMenu.style.left = '0px';
        sideMenu.style.transform = 'rotateY(0)';
        sideMenu.style.opacity = '1';
    } else {
        sideMenu.checked = true;
    }
}

const removeFromSideMenu = (sideMenu, element_id) => {
    const element = document.getElementById(element_id);
    if (element) {
        sideMenu.removeChild(element);
    }
}


const addSaveOptions = (sideMenu) => {
    if (!document.getElementById('save')) {
        pushBackSideMenu(sideMenu,
            'Save', () => {
                save(() => {
                    closeSideMenu(document.getElementById('sideMenu'));
                    document.getElementById('filesMenuUl').removeChild(document.getElementById('load_' + tableTitle));
                    addLoadOption(document.getElementById('sideMenuUl'), document.getElementById('filesMenuUl'),
                        tableTitle, dateToString(new Date()), 'front');
                }, (error) => {
                    alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                    console.log(ERROR_MESSAGES[error]);
                });
            }, 'save');
    }

    if (!document.getElementById('saveAs')) {
        pushBackSideMenu(sideMenu,
            'Save As..', () => {
                saveAs(0, null,
                    () => {
                        closeSideMenu(document.getElementById('sideMenu'));
                        addLoadOption(document.getElementById('sideMenuUl'), document.getElementById('filesMenuUl'),
                            tableTitle, dateToString(new Date()), 'front');
                    },
                    (error) => {
                        alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                        console.log(ERROR_MESSAGES[error]);
                    });
            }, 'saveAs');
    }
}

/**
 * Загрузка таблицы при открытии страницы
 */
const loadTable = () => {
    sendXMLHttpRequest(config.host_main, config.port_main, '/start', 'GET', null,
        (data, error) => {
            if (data.error === ERRORS.AUTH_SERVER_ERROR || error) {
                console.log(ERROR_MESSAGES[error ? error : data.error])

                loadSideMenu(document.getElementById('sideMenuUl'), {
                    'Clear Table': () => {
                        closeSideMenu(document.getElementById('sideMenu'));
                        if (confirm('All your data will be lost')) {
                            removeTable();
                            createTable(DEFAULT_ROWS, DEFAULT_COLS);
                        }
                    },
                });


                setColorScheme(USER_STATUS.GUEST);
                document.getElementById('username').textContent = ERROR_MESSAGES[error ? error : data.error];
                createTable(DEFAULT_ROWS, DEFAULT_COLS);
                alert('Данные не будут сохраняться');
                toLoad();
                return;
            }

            if (data.status === 'new_guest' || data.status === 'guest') {
                setColorScheme(USER_STATUS.GUEST);
                document.getElementById('username').textContent = 'GUEST';

                const aHref = document.getElementById('account');
                aHref.href = '/authentication';
                aHref.textContent = 'Sign In';

                loadSideMenu(document.getElementById('sideMenuUl'), {
                    'Clear Table': () => {
                        if (confirm('All your data will be lost')) {
                            removeTable();
                            createTable(DEFAULT_ROWS, DEFAULT_COLS);
                            closeSideMenu(document.getElementById('sideMenu'));
                        }
                    },
                    'Save': () => {
                        closeSideMenu(document.getElementById('sideMenu'));
                        save();
                    },
                });


                if (data.status === 'new_guest') {
                    createTable(DEFAULT_ROWS, DEFAULT_COLS);
                    toLoad();
                } else if (data.status === 'guest') {
                    getSavedTable(null, (dataINFO) => {
                        const tableData = JSON.parse(dataINFO.data);
                        tableFromObject(tableData);
                        toLoad();
                    }, () => {
                        createTable(DEFAULT_ROWS, DEFAULT_COLS);
                        toLoad();
                    });
                }
            } else if (data.status === 'user') {
                setColorScheme(USER_STATUS.USER);
                document.getElementById('username').textContent = (data.first_name ?
                    data.first_name + ' ' + data.last_name : data.email);

                const aHref = document.getElementById('account');
                aHref.href = '/logout';
                aHref.textContent = 'Sign Out';

                const sideMenu = document.getElementById('sideMenuUl');
                loadSideMenu(sideMenu, {
                    'New': () => {
                        if (tableTitle) {
                            save(() => {
                                console.log('save ok');
                            }, (error) => {
                                alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                                console.log(ERROR_MESSAGES[error]);
                            });
                        }

                        new_table(0,
                            () => {
                                removeTable();
                                createTable(DEFAULT_ROWS, DEFAULT_COLS);
                                closeSideMenu(document.getElementById('sideMenu'));
                                addSaveOptions(sideMenu);

                                removeFromSideMenu(sideMenu, 'stay_li');
                                addLoadOption(sideMenu, document.getElementById('filesMenuUl'), tableTitle, dateToString(new Date()), 'front');
                            },
                            (error) => {
                                alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                                console.log(ERROR_MESSAGES[error]);
                            });
                    },
                    'Open': () => {
                        openSideMenu(document.getElementById('filesMenu'), false);
                    }
                });

                getSavedTable(null, (dataINFO) => {
                    const tableData = JSON.parse(dataINFO.data);
                    tableFromObject(tableData);
                    pushBackSideMenu(sideMenu, 'Stay', () => {
                        stay(0, null,
                            (info) => {
                                addLoadOption(document.getElementById('sideMenuUl'), document.getElementById('filesMenuUl'),
                                    tableTitle, dateToString(new Date()), 'front');
                                closeSideMenu(document.getElementById('sideMenu'));

                                removeFromSideMenu(sideMenu, 'stay_li');
                                addSaveOptions(sideMenu);
                            },
                            (error) => {
                                alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                                console.log(ERROR_MESSAGES[error]);
                            });

                    }, 'stay_li');
                    toLoad();
                    openSideMenu(document.getElementById('sideMenu'), true);
                }, () => {
                    createTable(DEFAULT_ROWS, DEFAULT_COLS);
                    toLoad();
                    openSideMenu(document.getElementById('sideMenu'), true);
                    console.log('No guest saves');
                });


                if (!data.error) {
                    const filesMenu = document.getElementById('filesMenuUl');
                    data.titles.forEach((titleINFO) => addLoadOption(sideMenu, filesMenu, titleINFO.title,
                        dateToString(new Date(titleINFO.timeStamp)), 'back'));
                } else {
                    alert(`Error: ${ERROR_MESSAGES[data.error]}. Retry later.`);
                    console.log(ERROR_MESSAGES[data.error]);
                }

                //заблокировать таблицу
            }
        },
        () => {
            createTable(DEFAULT_ROWS, DEFAULT_COLS);
            toLoad();
        }
    );
};

loadTable();