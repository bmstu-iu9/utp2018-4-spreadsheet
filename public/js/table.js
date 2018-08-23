'use strict';

const mainDiv = document.getElementById('main-div');
const mainTable = document.getElementById('main-table');
const upTable = document.getElementById('up-table');
const leftTable = document.getElementById('left-table');
const upDiv = document.getElementById('up-div');
const leftDiv = document.getElementById('left-div');

let DEFAULT_ROWS = 50,
    DEFAULT_COLS = 25;
let ROWS = 0,
    COLS = 0;
let letters = [65];
let currentLet = [];
let focusID = '';
let innerTable = null;
let tableTitle = '';

const clear = (index) => {
    for (let i = index; i < letters.length; i++) {
        letters[i] = 65;
    }
}

const updateLetters = (index) => {
    if (letters[index] === 90) {
        if (index - 1 >= 0) {
            updateLetters(index - 1);
        } else {
            clear(0);
            letters.push(65);
        }
    } else {
        letters[index]++;
        if (index != letters.length - 1)
            clear(index + 1);
    }
}

const getXCoord = (elem) => elem.getBoundingClientRect().left + pageXOffset;
const getYCoord = (elem) => elem.getBoundingClientRect().top + pageYOffset;

const addExpansion = (letter, j) => {
    const newDiv = document.createElement('div');
    newDiv['id'] = letter;
    newDiv['className'] = 'modSymb';
    upTable.rows[0].cells[j].appendChild(newDiv);

    const movableLine = document.getElementById(letter);

    const changeParams = (element) => {
        const oldParams = {
            height: getComputedStyle(element).height,
            backgroundColor: getComputedStyle(element).backgroundColor,
            width: getComputedStyle(element).width,
        }

        element.style.height = getComputedStyle(mainTable).height;
        element.style.backgroundColor = '#808080';
        element.style.width = '2px';

        return oldParams;
    }

    movableLine.onmousedown = (e) => {
        const shiftX = e.pageX - getXCoord(movableLine);
        const params = changeParams(movableLine);
        let helpDiv;

        if (document.getElementById(letter + 'helper') === null) {
            helpDiv = document.createElement('div');
            helpDiv['id'] = letter + 'helper';
            helpDiv['className'] = 'modSymb';
            helpDiv.style.cursor = 'cell';
            mainTable.rows[0].cells[j].appendChild(helpDiv);
        } else {
            helpDiv = document.getElementById(letter + 'helper');
        }

        const params2 = changeParams(helpDiv);
        let coords = 'no move';

        const goExpansion = (delta1, delta2, padSize1, padSize2) => {
            document.getElementById(letter + '0').style.width = coords + delta1 + 'px';
            for (let i = 1; i <= ROWS; i++) {
                const flag = document.getElementById('Cell_' + i).isZeroPad;
                document.getElementById(letter + i).style.padding = (flag) ? '0px ' + padSize1 + 'px' : '2px ' + padSize1 + 'px';
                document.getElementById('Cell_' + letter + i).style.padding = (flag) ? '0px ' + padSize2 + 'px' : '1px ' + padSize2 + 'px';
                document.getElementById(letter + i).style.width = coords + delta2 + 'px';
            }
        }

        document.onmousemove = (e) => {
            const newLeft = e.pageX - shiftX - getXCoord(movableLine.parentNode);
            movableLine.style.left = (newLeft > 0) ? newLeft + 'px' : '0px';
            helpDiv.style.left = (newLeft > 0) ? newLeft + 'px' : '0px';
            coords = newLeft;
        }

        document.onmouseup = () => {
            if (coords != 'no move') {
                const mainCell = document.getElementById('Cell_' + letter);
                if (coords < 6) {
                    mainCell.style.padding = '0px';
                    mainCell.isZeroPad = true;
                    if (coords < 3) {
                        goExpansion(-coords, -coords, 0, 0);
                        movableLine.style.left = '-1px';
                        helpDiv.style.left = '-1px';
                        movableLine.style.cursor = 'col-resize';
                    } else {
                        movableLine.style.cursor = 'ew-resize';
                        goExpansion(0, 0, 0, 0);
                    }
                } else {
                    mainCell.style.padding = '1px 3px';
                    mainCell.isZeroPad = false;
                    movableLine.style.cursor = 'ew-resize';
                    goExpansion(-6, -6, 2, 3);
                }
            }

            movableLine.style.height = params.height;
            movableLine.style.width = params.width;
            movableLine.style.backgroundColor = params.backgroundColor;

            helpDiv.style.height = params2.height;
            helpDiv.style.width = params2.width;
            helpDiv.style.backgroundColor = params2.backgroundColor;

            document.onmousemove = document.onmouseup = null;
        }

        return false;
    }

    movableLine.ondragstart = () => false;
}

const addVerticalExpansion = (i) => {
    const newDiv = document.createElement('div');
    newDiv['id'] = (i + 1);
    newDiv['className'] = 'modVertSymb';
    leftTable.rows[i].cells[0].appendChild(newDiv);

    const movableLine = document.getElementById(i + 1);

    const changeParams = (element) => {
        const oldParams = {
            height: getComputedStyle(element).height,
            backgroundColor: getComputedStyle(element).backgroundColor,
            width: getComputedStyle(element).width,
        }

        element.style.height = '2px';
        element.style.backgroundColor = '#808080';
        element.style.width = getComputedStyle(mainTable).width;

        return oldParams;
    }

    movableLine.onmousedown = (e) => {
        const shiftY = e.pageY - getYCoord(movableLine);
        const params = changeParams(movableLine);
        let helpDiv;

        if (document.getElementById((i + 1) + 'helper') === null) {
            helpDiv = document.createElement('div');
            helpDiv['id'] = (i + 1) + 'helper';
            helpDiv['className'] = 'modVertSymb';
            helpDiv.style.cursor = 'cell';
            mainTable.rows[i].cells[0].appendChild(helpDiv);
        } else {
            helpDiv = document.getElementById((i + 1) + 'helper');
        }

        const params2 = changeParams(helpDiv);
        let coords = 'no move';

        const goExpansion = (delta1, delta2, padSize1, padSize2) => {
            document.getElementById('@' + (i + 1)).style.height = coords + delta1 + 'px';
            mainTable.rows[i].style['line-height'] = coords + delta2 + 'px';
            for (let j = 0; j <= COLS; j++) {
                const flag = document.getElementById('Cell_' + currentLet[j]).isZeroPad;
                document.getElementById(currentLet[j] + (i + 1)).style.padding =
                    (flag) ? padSize1 + 'px 0px' : padSize1 + 'px 2px';
                document.getElementById('Cell_' + currentLet[j] + (i + 1)).style.padding =
                    (flag) ? padSize2 + 'px 0px' : padSize2 + 'px 1px';
                document.getElementById(currentLet[j] + (i + 1)).style.height = coords + delta2 + 'px';
            }
        }

        document.onmousemove = (e) => {
            const newTop = e.pageY - shiftY - getYCoord(movableLine.parentNode);
            movableLine.style.top = (newTop > 0) ? newTop + 'px' : '0px';
            helpDiv.style.top = (newTop > 0) ? newTop + 'px' : '0px';
            coords = newTop;
        }

        document.onmouseup = () => {
            if (coords != 'no move') {
                const mainCell = document.getElementById('Cell_' + (i + 1));
                if (coords < 6) {
                    mainCell.style.padding = '0px';
                    mainCell.isZeroPad = true;
                    if (coords < 3) {
                        goExpansion(-coords, -coords, 0, 0);
                        movableLine.style.top = '-1px';
                        helpDiv.style.top = '-1px';
                        movableLine.style.cursor = 'row-resize';
                    } else {
                        movableLine.style.cursor = 'ns-resize';
                        goExpansion(0, -0.5, 0, 0);
                    }
                } else {
                    mainCell.style.padding = '1px 3px';
                    mainCell.isZeroPad = false;
                    movableLine.style.cursor = 'ns-resize';
                    goExpansion(-1, -5, 2, 3);
                }
            }

            movableLine.style.height = params.height;
            movableLine.style.width = params.width;
            movableLine.style.backgroundColor = params.backgroundColor;

            helpDiv.style.height = params2.height;
            helpDiv.style.width = params2.width;
            helpDiv.style.backgroundColor = params2.backgroundColor;

            document.onmousemove = document.onmouseup = null;
        }

        return false;
    }

    movableLine.ondragstart = () => false;
}

/**
 * Initialize cell events
 * @param {String} id
 */
const initCell = (columnNumber, rowNumber) => {
    const id = currentLet[columnNumber] + rowNumber;
    const newInput = document.getElementById(id);
    const newCell = document.getElementById('Cell_' + id);
    newInput.onkeydown = (e) => {
        let evtobj = window.event ? event : e
        if (evtobj.code === 'KeyZ' && evtobj.ctrlKey && evtobj.shiftKey) {
            console.log('REDO');
            evtobj.preventDefault();
        } else if (evtobj.code === 'KeyZ' && evtobj.ctrlKey) {
            console.log('UNDO');
            evtobj.preventDefault();
        }
    };
    newInput.addEventListener("keydown", function (elem) {
        return (event) => {
            console.log(newInput.id, 'code=', event.code, 'key=', event.key);
            if (event.key == 'Enter') {
                elem.blur();
            }
            if (event.key == 'Escape') {
                console.log(elem.value);
                elem.value = '';
            }
        }
    }(newInput))
    newInput.onfocus = function (elem) {
        return () => {
            console.log('onfocus')
            let coord = convCoord(elem.id)
            elem.value = innerTable.getCeil(coord.x, coord.y).realText;
        };
    }(newInput);
    newInput.onblur = function (elem) {
        return () => {
            console.log('onblur')
            let coord = convCoord(elem.id);
            innerTable.setCeil(coord.x, coord.y, elem.value);
            updateTables();
            elem.value = innerTable.getCeil(coord.x, coord.y).toDisplay;
        };
    }(newInput);
    newCell.onmousedown = (e) => { //please delete this brah 
        if (focusID) {
            const oldInput = document.getElementById(focusID);
            const oldCell = document.getElementById('Cell_' + focusID);

            oldInput.style.textAlign = 'right';
            oldCell.style.outline = '';
        }

        focusID = newInput.id;
        newInput.style.textAlign = 'left';
        newCell.style.outline = colorManualCofig[userColorCode]['cell']['outline'];
    }

    //При нажатии на Enter спускаемся вниз
    newInput.addEventListener('keydown', (e) => {
        let dx = 0;
        let dy = 0;

        if (e.key === 'Enter' || e.key === 'ArrowDown') { //Enter and down button
            dy = 1;
        } else if (e.key === 'ArrowUp') { //up
            dy = (rowNumber ? -1 : 0);
        } else if (e.key === 'ArrowLeft') { //left
            dx = (columnNumber ? -1 : 0);
        } else if (e.key === 'ArrowRight') { //right
            dx = 1;
        }

        const low_cell = document.getElementById('Cell_' + currentLet[columnNumber + dx] + (rowNumber + dy))
        const low_input = document.getElementById(currentLet[columnNumber + dx] + (rowNumber + dy))
        low_cell.dispatchEvent(new Event('mousedown', {
            keyCode: 13
        }));
        low_input.focus();
    });
}

const addCells = function (rows, cols) {

    if (rows === 0) {
        for (let i = COLS + 1; i <= COLS + cols; i++) {

            currentLet.push(String.fromCharCode.apply(null, letters));
            updateLetters(letters.length - 1);
            const letter = currentLet[currentLet.length - 1];

            const new_cell = upTable.rows[0].insertCell(-1);
            new_cell.innerHTML = `<div align = "center" id = "${letter + 0}" class = "up"> ${letter} </div>`;
            new_cell.id = 'Cell_' + letter;

            for (let j = 0; j < ROWS; j++) {

                const cell = mainTable.rows[j].insertCell(-1);
                cell.innerHTML = cell.innerHTML = "<textarea id = '" + letter + (j + 1) + "' class = 'cell_input_area'/>";
                cell.id = 'Cell_' + letter + (j + 1);
                initCell(currentLet.length - 1, j + 1);

                const inp = document.getElementById(letter + (j + 1));
                const preInp = document.getElementById(currentLet[currentLet.length - 2] + (j + 1));
                inp.style.height = preInp.style.height;
                inp.style.padding = preInp.style.padding;
                cell.style.padding = document.getElementById('Cell_' + currentLet[currentLet.length - 2] + (j + 1)).style.padding;
            }

            addExpansion(letter, i);
        }
    } else {

        if (ROWS === 0) {
            const row = upTable.insertRow(-1);

            for (let j = 0; j <= COLS + cols; j++) {

                currentLet.push(String.fromCharCode.apply(null, letters));
                updateLetters(letters.length - 1);
                const letter = currentLet[j];

                const new_cell = row.insertCell(-1);
                new_cell.innerHTML = `<div align = "center" id = "${letter + 0}" class = "up"> ${letter} </div>`;
                new_cell.id = 'Cell_' + letter;
                addExpansion(letter, j);
            }
        }

        for (let i = ROWS; i < ROWS + rows; i++) {
            const row = mainTable.insertRow(-1);
            const leftRow = leftTable.insertRow(-1);

            const left_cell = leftRow.insertCell(-1);
            left_cell.innerHTML = `<div align = "center" id = "${'@' + (i + 1)}" class = "left"> ${i+1} </div>`;
            left_cell.id = 'Cell_' + (i + 1);
            addVerticalExpansion(i);

            for (let j = 0; j <= COLS + cols; j++) {

                if (j > currentLet.length) {
                    currentLet.push(String.fromCharCode.apply(null, letters));
                    updateLetters(letters.length - 1);
                }
                const letter = currentLet[j];

                const new_cell = row.insertCell(-1);
                new_cell.innerHTML = "<textarea id = '" + letter + (i + 1) + "' class = 'cell_input_area'/>";
                new_cell.id = 'Cell_' + letter + (i + 1);
                initCell(j, i + 1);

                if (i >= DEFAULT_ROWS) {
                    const inp = document.getElementById(letter + (i + 1));
                    const preInp = document.getElementById(letter + i);
                    inp.style.width = preInp.style.width;
                    inp.style.padding = preInp.style.padding;
                    new_cell.style.padding = document.getElementById('Cell_' + letter + i).style.padding;
                }
            }
        }
    }

    ROWS += rows;
    COLS += cols;
}

mainDiv.onscroll = function () {
    upDiv.scrollLeft = this.scrollLeft;
    leftDiv.scrollTop = this.scrollTop;
    const moreCellsOnY = mainDiv.scrollHeight - mainDiv.clientHeight;
    const moreCellsOnX = mainDiv.scrollWidth - mainDiv.clientWidth;
    const percentY = (mainDiv.scrollTop / moreCellsOnY) * 100;
    const percentX = (mainDiv.scrollLeft / moreCellsOnX) * 100;
    if (percentY > 80) {
        addCells(5, 0);
    }
    if (percentX > 80) {
        addCells(0, 5);
    }
}


function colName(n) {
    let ordA = 'A'.charCodeAt(0);
    let ordZ = 'Z'.charCodeAt(0);
    let len = ordZ - ordA + 1;

    let s = "";
    while (n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;
}

const convNumtoId = (x, y) => {
    return colName(x) + String(y + 1);
}

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

const setNewTitle = (title) => {
    tableTitle = title;
    document.getElementById('name').textContent = title;
}

/**
 * Загрузка таблицы при открытии страницы
 * (надо бы отдельный файл, но пока нет)
 */
const loadTable = () => {
    sendXMLHttpRequest(config.host_main, config.port_main, '/start', 'GET', null,
        (data, error) => {
            if (data.error === ERRORS.AUTH_SERVER_ERROR || error) {
                console.log(ERROR_MESSAGES[error ? error : data.error])

                setColorScheme(USER_STATUS.GUEST);
                document.getElementById('username').textContent = ERROR_MESSAGES[error ? error : data.error];
                createTable(DEFAULT_ROWS, DEFAULT_COLS);
                alert('Данные не будут сохраняться');
                return;
            }

            if (data.status === 'new_guest') {
                setColorScheme(USER_STATUS.GUEST);
                document.getElementById('username').textContent = 'GUEST';

                const aHref = document.getElementById('account');
                aHref.href = '/authentication';
                aHref.textContent = 'Sign In';

                createTable(DEFAULT_ROWS, DEFAULT_COLS);
            } else if (data.status === 'user') {
                setColorScheme(USER_STATUS.USER);
                document.getElementById('username').textContent = (data.first_name ?
                    data.first_name + ' ' + data.last_name : data.email);

                const aHref = document.getElementById('account');
                aHref.href = '/logout';
                aHref.textContent = 'Sign Out';

                const newButton = document.createElement('button');
                newButton.onclick = () => {
                    if (tableTitle) {
                        save();
                    }

                    new_table(0,
                        () => {
                            removeTable();
                            createTable(DEFAULT_ROWS, DEFAULT_COLS);
                        },
                        (error) => {
                            alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                            console.log(ERROR_MESSAGES[error]);
                        });
                }
                newButton.innerText = 'New';
                document.getElementById('titles').appendChild(newButton);

                if (!data.error) {
                    data.titles.forEach((title) => {
                        const button = document.createElement('button');
                        button.onclick = () => {
                            if (tableTitle) {
                                save();
                            }

                            getSavedTable(title, (dataINFO) => {
                                    ajax_remove_guest(() => {
                                        removeTable();

                                        const tableData = JSON.parse(dataINFO.data);
                                        tableFromObject(tableData);
                                        setNewTitle(title);
                                    }, (error) => {
                                        alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                                        console.log(ERROR_MESSAGES[error]);
                                    });
                                },
                                (error) => {
                                    alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                                    console.log(ERROR_MESSAGES[error]);
                                });
                        }
                        button.innerText = title;
                        document.getElementById('titles').appendChild(button);
                    })
                } else {
                    alert(`Error: ${ERROR_MESSAGES[data.error]}. Retry later.`);
                    console.log(ERROR_MESSAGES[data.error]);
                }

                getSavedTable(null, (dataINFO) => {
                    const tableData = JSON.parse(dataINFO.data);
                    tableFromObject(tableData);
                    const newButton = document.createElement('button');
                    newButton.onclick = () => stay(0, null,
                        (error) => {
                            alert(`Error: ${ERROR_MESSAGES[error]}. Retry later.`);
                            console.log(ERROR_MESSAGES[error]);
                        });
                    newButton.innerText = 'Stay';
                    document.getElementById('titles').appendChild(newButton);
                }, () => {
                    console.log('No guest saves');
                });

                //заблокировать таблицу
            } else if (data.status === 'guest') {
                setColorScheme(USER_STATUS.GUEST);
                document.getElementById('username').textContent = 'GUEST';

                const aHref = document.getElementById('account');
                aHref.href = '/authentication';
                aHref.textContent = 'Sign In';

                getSavedTable(null, (dataINFO) => {
                    const tableData = JSON.parse(dataINFO.data);
                    tableFromObject(tableData);
                }, () => {
                    createTable(DEFAULT_ROWS, DEFAULT_COLS)
                })
            }
        },
        () => {
            createTable(DEFAULT_ROWS, DEFAULT_COLS);
        }
    );
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

loadTable();