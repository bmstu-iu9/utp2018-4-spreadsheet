'use strict';

/**
 * Обновляет значения в клетках таблицы
 */
const updateTables = () => {
    let upd = innerTable.update();

    console.log(upd);
    console.log('POKA OKEY')
    for (let i = 0; i < upd.length; i++) {
        let ceil = upd[i];
        console.log(ceil.x, ceil.y);
        console.log(innerTable.getCeil(ceil.x, ceil.y).toDisplay);
        console.log(innerTable.getCeil(ceil.x, ceil.y).realText);
        console.log(innerTable.getCeil(ceil.x, ceil.y).error);
        document.getElementById(convNumtoId(ceil.x, ceil.y)).value = innerTable.getCeil(ceil.x, ceil.y).toDisplay;
    }
}

/**
 * Удаляет таблицу, вместе с отображением
 */
const removeTable = () => {
    ROWS = COLS = 0;
    letters = [65];
    currentLet = [];
    mainTable.innerHTML = upTable.innerHTML = leftTable.innerHTML = '';
    document.getElementsByClassName('null-div')[0].innerHTML = '';
}

/**
 * Создаёт в памяти таблицу rows x cols + её отображение
 * @param {Number} rows 
 * @param {Number} cols 
 */
const createTable = (rows, cols) => {
    document.getElementsByClassName('null-div')[0].innerHTML = `<table><tr><td></td></tr></table>`;
    innerTable = new Table(cols, rows);
    addCells(rows, cols);
}

/**
 * Восстанавливает таблицу(+отображение) из JSON объекта,
 * Размер задаётся свойством size : [rows, cols]
 * Ячейки записываются в формате [x, y] : [<массив кодов символов>]
 * @param {Object} tableData 
 */
const tableFromObject = (tableData) => {
    document.getElementsByClassName('null-div')[0].innerHTML = `<table><tr><td></td></tr></table>`;
    innerTable = new Table(tableData['size'][0], tableData['size'][1]);
    addCells(tableData['size'][0], tableData['size'][1]);
    delete tableData['size'];
    for (let coordStr in tableData) {
        const coord = coordStr.split(',').map(e => parseInt(e, 10));
        innerTable.setCeil(coord[0], coord[1], arr2str(tableData[coordStr]));
    }

    updateTables();
}

/**
 * Загружает таблицу
 * @param {String} title 
 * @param {Function} okCallback 
 * @param {Function} errCallback 
 */
const getSavedTable = (title, okCallback, errorCallback) => {
    let adress = title ? '/load_user_data?status=' + USER_STATUS.USER + '&title=' + title :
        '/load_user_data?status=' + USER_STATUS.GUEST;

    sendXMLHttpRequest(config.host_main, config.port_main, adress, 'GET', null,
        (dataJSON, error) => {
            if (dataJSON.error || error) {
                return errorCallback(error ? error : dataJSON.error);
            }

            okCallback(dataJSON);
        });
}

const contextMenuCell = new ContextMenu(document.getElementById('context-menu-cell'), 10, 210); //Контекстное меню
const contextMenuFile = new ContextMenu(document.getElementById('context-menu-file'), 0, 0);

let itemInContext = null; //Ссылка на клетку, для которой вызвано контекстное меню
let fileInContext = null; //Ссылка на файл, для которого вызвано контекстное меню

const fileMenuItemListener = link => {
    const fileLi = fileInContext;
    const childLabels = fileInContext.childNodes;
    switch (link.getAttribute("data-action")) {
        case 'rename':
            rename(0, childLabels[0].innerText,
                (removeINFO) => {
                    fileLi.id = 'load_' + removeINFO.new_title;
                    setNewTitle(removeINFO.new_title);
                    childLabels[0].innerHTML = removeINFO.new_title;
                },
                (error) => {
                    console.log(`Rename error: ${ERROR_MESSAGES[error]}`);
                    alert(`Rename error: ${ERROR_MESSAGES[error]}`);
                });
            break;
        case 'remove':
            ajax_remove_user(childLabels[0].innerText,
                () => {
                    fileLi.remove();
                    if (childLabels[0].innerText === tableTitle) {
                        removeTable();
                        createTable(DEFAULT_ROWS, DEFAULT_COLS);
                        const saveLink = document.getElementById('save');
                        const saveAsLink = document.getElementById('saveAs');

                        if (saveLink) {
                            saveLink.remove();
                        }

                        if (saveAsLink) {
                            saveAsLink.remove();
                        }

                        setNewTitle('');
                        openSideMenu(document.getElementById('sideMenu'), true);
                    }
                },
                (error) => {
                    console.log(`Rename error: ${ERROR_MESSAGES[error]}`);
                    alert(`Rename error: ${ERROR_MESSAGES[error]}`);
                })
            break;
    }
    fileInContext = null;
    contextMenuFile.contextMenuOff();
}


/**
 * Отвечает за действия в контекстном меню
 * @param {*} link
 */
const menuItemListener = link => {
    const cell = itemInContext;
    switch (link.getAttribute("data-action")) {
        case 'paste':
            if (cell.editMode)
                tryToPasteFromClipboard(cell);
            else {
                const coord = convCoord(cell.id);
                innerTable.paste(coord.x, coord.y);
                updateTables();
                cell.focus();
            }
            break;
        case 'copy':
            if (cell.editMode)
                tryToSmthToClipboard(cell, 'copy');
            else {
                const coord = convCoord(cell.id);
                innerTable.copy(coord.x, coord.y);
                updateTables();
                cell.focus();
            }
            break;
        case 'cut':
            if (cell.editMode)
                tryToSmthToClipboard(cell, 'cut');
            else {
                const coord = convCoord(cell.id);
                innerTable.cut(coord.x, coord.y);
                updateTables();
                cell.focus();
            }
            break;
        case 'delete':
            cell.value = '';
            updateTables();
            cell.focus();
    }

    itemInContext = null;
    contextMenuCell.contextMenuOff();
}

/**
 * Вставка из буфера обмена работает только на хромиуме 66+
 * @param {Cell} cell
 */
const tryToPasteFromClipboard = cell => {
    if (navigator.clipboard) {
        navigator.clipboard.readText()
            .then(text => {
                cell.value = text;
            })
            .catch(err => {
                alert('Failed to read clipboard contents: ' + err);
            });
    } else {
        alert("Only for Chromium 66+");
    }
}

/**
 * Копировать и вырезать через буфер обмена
 * @param {Cell} cell
 * @param {String} command
 */
const tryToSmthToClipboard = (cell, command) => {
    cell.focus();
    cell.select();
    try {
        document.execCommand(command);
    } catch (err) {
        alert("Opa4ki!");
    }
    window.getSelection().removeAllRanges();
}

/**
 * Определяет был ли клик внутри элемента с классом className
 * @param {Event} e
 * @param {String} className
 */
const clickInsideElement = (e, className) => {
    let el = e.srcElement || e.target;

    if (el.classList.contains(className)) {
        return el;
    } else {
        while (el = el.parentNode) {
            if (el.classList && el.classList.contains(className)) {
                return el;
            }
        }
    }
    return false;
}


//Cброс меню
window.onkeyup = e => {
    if (e.keyCode === 27) {
        contextMenuCell.contextMenuOff();
        contextMenuFile.contextMenuOff();
    }
}

window.onresize = function (e) {
    contextMenuCell.contextMenuOff();
    contextMenuFile.contextMenuOff();
};
//************************* */

//Вызов контекстного меню на ПКМ
document.addEventListener('contextmenu', e => {
    itemInContext = clickInsideElement(e, 'cell_input_area');

    if (itemInContext) {
        e.preventDefault();
        contextMenuFile.contextMenuOff();
        contextMenuCell.contextMenuOn(e);
    } else {
        itemInContext = null;
        contextMenuCell.contextMenuOff();

        fileInContext = clickInsideElement(e, 'fileMenuLi');
        if (fileInContext) {
            e.preventDefault();
            contextMenuFile.contextMenuOn(e);
        } else {
            fileInContext = null;
            contextMenuFile.contextMenuOff();
        }
    }
});


//Выбор действия внутри меню
document.addEventListener('click', e => {
    let clickeElIsLink = clickInsideElement(e, 'context-menu-cell_link');

    if (clickeElIsLink) {
        e.preventDefault();
        menuItemListener(clickeElIsLink);
    } else {
        clickeElIsLink = clickInsideElement(e, 'context-menu-file_link');
        if (clickeElIsLink) {
            e.preventDefault();
            fileMenuItemListener(clickeElIsLink);
        } else {
            const button = e.which || e.button;
            if (button === 1) {
                contextMenuCell.contextMenuOff();
                contextMenuFile.contextMenuOff();
            }
        }
    }
});

const setNewTitle = (title) => {
    tableTitle = title;
    document.getElementById('name').textContent = title;
}

//Сохраняем перед закрытием
window.onbeforeunload = function () {
    const cookie = parseCookies(document.cookie);
    navigator.sendBeacon('http://' + config.host_main + ':' + config.port_main + '/save_user_data',
        'status=' + cookie['status'] + '&title=' + tableTitle + '&session=' + cookie['token'] +
        '&data=' + JSON.stringify(Object.assign({}, {
            'size': [ROWS, COLS]
        }, innerTable.activeCeils)));
}

//UNDO REDO
document.onkeydown = (e) => {
    let evtobj = window.event ? event : e
    if (evtobj.code === 'KeyZ' && evtobj.ctrlKey && evtobj.shiftKey) {
        console.log('REDO');
        innerTable.redo();
        updateTables();
    } else if (evtobj.code === 'KeyZ' && evtobj.ctrlKey) {
        console.log('UNDO');
        innerTable.undo();
        updateTables();
    }
};