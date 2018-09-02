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
        if (Number(innerTable.getCeil(ceil.x, ceil.y).toDisplay))
            document.getElementById(convNumtoId(ceil.x, ceil.y)).style.textAlign = 'right';
    }
}

/**
 * Удаляет таблицу, вместе с отображением
 */
const removeTable = () => {
    clearCellStyles();
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
 * @param {Object} serverData
 */
const tableFromObject = (serverData) => {
    document.getElementsByClassName('null-div')[0].innerHTML = `<table><tr><td></td></tr></table>`;
    const tableData = serverData['table'];
    innerTable = new Table(tableData['size'][0], tableData['size'][1]);
    addCells(tableData['size'][0], tableData['size'][1]);
    delete tableData['size'];
    for (let coordStr in tableData) {
        const coord = coordStr.split(',').map(e => parseInt(e, 10));
        innerTable.setCeil(coord[0], coord[1], arr2str(tableData[coordStr]));
    }

    updateTables();

    const styles = {
        8: 'left',
        16:'center',
        32: 'right',
    }
    const fontStyleData = serverData['styles'];
    for (let id in fontStyleData) {
        const elem = document.getElementById(id);
        for (let bit in styles) {
            if (fontStyleData[id] & bit) {
                setAlign(elem, styles[bit]);
            }
        }

        if (fontStyleData[id] & 1) { //bold
            setBold(elem, true);
        }

        if (fontStyleData[id] & 2) { //italic
            setItalic(elem, true);
        }

        if (fontStyleData[id] & 4) { //underline
            setUnderline(elem, true);
        }
    }

    const bgColorData = serverData['bgColors'];
    for (let id in bgColorData) {
        setBackgroundColor(document.getElementById(id), bgColorData[id], false);
    }
    
    
    const txtColorData = serverData['txtColors'];
    for (let id in txtColorData) {
        setTextColor(document.getElementById(id), txtColorData[id]);
    }
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
const autoCompleteMenu = new AutoCompleteMenu(document.getElementById('auto-complete-menu'));

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
                        const sideMenu = document.getElementById('sideMenuUl');
                        removeFromSideMenu(sideMenu, 'save');
                        removeFromSideMenu(sideMenu, 'saveAs');
                        removeFromSideMenu(sideMenu, 'downloadAsCSV');

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
            console.log('paste');
            if (cell.editMode)
                tryToPasteFromClipboard(cell);
            else {
                cell.blur();
                const coord = convCoord(cell.id);
                innerTable.bigPaste(coord, coord);
                updateTables();
                cell.focus();
            }
            break;
        case 'copy':
            console.log('cpy');
            if (cell.editMode)
                tryToSmthToClipboard(cell, 'copy');
            else {
                const coord = convCoord(cell.id);
                innerTable.bigCopy(coord, coord);
                updateTables();
                cell.focus();
            }
            break;
        case 'cut':
            if (cell.editMode)
                tryToSmthToClipboard(cell, 'cut');
            else {
                const coord = convCoord(cell.id);
                innerTable.bigCut(coord, coord);
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
document.addEventListener('mousedown', e => {
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

const autoCompleteListener = link => {
    autoCompleteMenu.paste(link.getAttribute("data-action"), POSSIBLE_FUNCTIONS.prefix.length);
    POSSIBLE_FUNCTIONS.clean();
    autoCompleteMenu.autoCompleteOff();
}

document.addEventListener('mousedown', e => {
    /* e.preventDefault();
    e.stopPropagation(); */
    //console.log('loool');
    let clickeElIsLink = clickInsideElement(e, 'auto-complete-menu_link');

    if (clickeElIsLink) {
        e.preventDefault();
        e.stopPropagation();
        autoCompleteListener(clickeElIsLink);
    } else {
        let button = e.which || e.button;
        if (button === 1) {
            autoCompleteMenu.autoCompleteOff();
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
        '&data=' + JSON.stringify({
            table: Object.assign({}, {
                'size': [ROWS, COLS]
            }, innerTable.activeCeils),
            styles: styledFontCells,
            bgColors: backgroundColoredCells,
            txtColors: textColoredCells
        }));
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
