'use strict';

const contextMenu = new ContextMenu(document.getElementById('context-menu')); //Контекстное меню
let itemInContext = null; //Ссылка на клетку, для которой вызвано контекстное меню

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
    contextMenu.contextMenuOff();
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
        contextMenu.contextMenuOff();
    }
}

window.onresize = function (e) {
    contextMenu.contextMenuOff();
};
//************************* */

//Добавлнеие ячеек при скроле
mainDiv.onscroll = function () {
    upDiv.scrollLeft = this.scrollLeft;
    leftDiv.scrollTop = this.scrollTop;

    if (mainDiv.scrollLeft !== upDiv.scrollLeft) {
        mainDiv.scrollLeft = upDiv.scrollLeft;
    }

    if (mainDiv.scrollTop !== leftDiv.scrollTop) {
        mainDiv.scrollTop = leftDiv.scrollTop;
    }

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

//Вызов контекстного меню на ПКМ
document.addEventListener('contextmenu', e => {
    itemInContext = clickInsideElement(e, 'cell_input_area');

    if (itemInContext) {
        e.preventDefault();
        contextMenu.contextMenuOn(e);
    } else {
        itemInContext = null;
        contextMenu.contextMenuOff();
    }
});

//Выбор действия внутри меню
document.addEventListener("click", e => {
    let clickeElIsLink = clickInsideElement(e, 'context-menu_link');

    if (clickeElIsLink) {
        e.preventDefault();
        menuItemListener(clickeElIsLink);
    } else {
        let button = e.which || e.button;
        if (button === 1) {
            contextMenu.contextMenuOff();
        }
    }
});

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