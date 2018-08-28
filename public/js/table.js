'use strict';

const mainDiv = document.getElementById('main-div');
const mainTable = document.getElementById('main-table');
const upTable = document.getElementById('up-table');
const leftTable = document.getElementById('left-table');
const upDiv = document.getElementById('up-div');
const leftDiv = document.getElementById('left-div');

let DEFAULT_ROWS = 50,
    DEFAULT_COLS = 26;
let ROWS = 0,
    COLS = 0;
let letters = [65];
let currentLet = [];
let focusID = '';
let isMultiHL = false;
let curCell = null;
let grayCells = [];
let borderCells = [];
let lightblueBorderCells = [];
let selUpCells = [];
let selLeftCells = [];
let currentY = 0;
let currentX = 0;
let isScrolling = false;
let startCell = null;
let colorCell = null;
let stateScroll = -1;
let formulaBuf = '=';

const horScrollSpeed = 30;
const vertScrollSpeed = 15;

const innerTable = new Table(DEFAULT_COLS, DEFAULT_ROWS);

const convNumtoId = (x, y) => {
    return colName(x) + String(y + 1);
}

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
                    goExpansion(-6, -6, 2, 1);
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
                    goExpansion(-2, -6, 2, 1);
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

const addDecorUpDiv = (colNum) => {
    const upDiv = document.createElement('div');
    upDiv.id = 'up_' + colNum;
    upDiv.className = 'decorUp';
    upTable.rows[0].cells[colNum].appendChild(upDiv);
}

const addDecorLeftDiv = (rowNum) => {
    const leftDiv = document.createElement('div');
    leftDiv.id = 'left_' + (rowNum + 1);
    leftDiv.className = 'decorLeft';
    leftTable.rows[rowNum].cells[0].appendChild(leftDiv);
}

const bleachCells1 = () => {
    while (grayCells.length !== 0) {
        const obj = grayCells.pop();
        const cell = obj.cell;
        const upCell = upTable.rows[0].cells[cell.colNum];
        const leftCell = leftTable.rows[cell.rowNum].cells[0];

        cell.style.backgroundColor = 'transparent';
        document.getElementById(obj.id).style.backgroundColor = 'transparent';
        upCell.style.backgroundColor = '#eee';
        document.getElementById('up_' + cell.colNum).style.backgroundColor = 'transparent';
        leftCell.style.backgroundColor = '#eee';
        document.getElementById('left_' + (cell.rowNum + 1)).style.backgroundColor = 'transparent';
    }

    while (borderCells.length !== 0) {
        const cell = borderCells.pop();

        if (cell.rowNum) {
            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style.boxShadow = 'none';
            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style.zIndex = 3;
        }
        if (cell.colNum) {
            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style.boxShadow = 'none';
            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style.zIndex = 3;
        }
        if (cell.colNum + 1 <= COLS) {
            mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style.boxShadow = 'none';
            mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style.zIndex = 3;
        }
        if (cell.rowNum + 1 < ROWS) {
            mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style.boxShadow = 'none';
            mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style.zIndex = 3;
        }
    }

    while (selUpCells.length !== 0) {
        const obj = selUpCells.pop();
        const cell = obj.cell;
        const num = obj.num;

        cell.isSelected = false;
        cell.style.backgroundColor = '#eee';
        document.getElementById(currentLet[num] + '0').style.color = 'rgb(0, 0, 0)';
        document.getElementById('up_' + num).style.backgroundColor = 'transparent';
    }

    while (selLeftCells.length !== 0) {
        const obj = selLeftCells.pop();
        const cell = obj.cell;
        const num = obj.num;

        cell.isSelected = false;
        cell.style.backgroundColor = '#eee';
        document.getElementById('@' + num).style.color = 'rgb(0, 0, 0)';
        document.getElementById('left_' + num).style.backgroundColor = 'transparent';
    }
}

const bleachCells2 = () => {

  while (lightblueBorderCells.length !== 0) {
      const obj = lightblueBorderCells.pop();
      const cell = obj.cell;
      const focusCell = document.getElementById('Cell_' + focusID);

      if (obj.top) {
        if (cell.rowNum) {
            const bs = getComputedStyle(mainTable.rows[cell.rowNum - 1].cells[cell.colNum]).boxShadow.split(',');

            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style.boxShadow = (bs.length <= 3)? 'none' : bs[0] + bs[1] + bs[2];
            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style.zIndex = (bs.length <= 3)? 3 : 4;
        } else {
            document.getElementById('up_' + cell.colNum).style.backgroundColor =
                    (cell.colNum === focusCell.colNum)? '#6bc961' : 'transparent';
        }
      }

      if (obj.left) {
        if (cell.colNum) {
            const bs = getComputedStyle(mainTable.rows[cell.rowNum].cells[cell.colNum - 1]).boxShadow.split(',');

            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style.boxShadow = (bs.length <= 3)? 'none' : bs[0] + bs[1] + bs[2];
            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style.zIndex = (bs.length <= 3)? 3 : 4;
        } else {
            document.getElementById('left_' + (cell.rowNum + 1)).style.backgroundColor =
                    (cell.rowNum === focusCell.rowNum)? '#6bc961' : 'transparent';
        }
      }

      if (obj.right) {
        if (cell.colNum + 1 <= COLS) {
            const bs = getComputedStyle(mainTable.rows[cell.rowNum].cells[cell.colNum + 1]).boxShadow.split(',');

            mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style.boxShadow = (bs.length <= 3)? 'none' : bs[0] + bs[1] + bs[2];
            mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style.zIndex = (bs.length <= 3)? 3 : 4;
        }
      }

      if (obj.bottom) {
        if (cell.rowNum + 1 < ROWS) {
            const bs = getComputedStyle(mainTable.rows[cell.rowNum + 1].cells[cell.colNum]).boxShadow.split(',');

            mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style.boxShadow = (bs.length <= 3)? 'none' : bs[0] + bs[1] + bs[2];
            mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style.zIndex = (bs.length <= 3)? 3 : 4;
        }
      }

  }

}

let bleachCells = bleachCells1;

const paintCells1 = () => {
    const rowFlag = startCell.rowNum > curCell.rowNum;
    const colFlag = startCell.colNum > curCell.colNum;
    const start_i = (rowFlag) ? curCell.rowNum : startCell.rowNum;
    const start_j = (colFlag) ? curCell.colNum : startCell.colNum;
    const end_i = (rowFlag) ? startCell.rowNum : curCell.rowNum;
    const end_j = (colFlag) ? startCell.colNum : curCell.colNum;

    for (let i = start_i; i <= end_i; i++) {
        for (let j = start_j; j <= end_j; j++) {
            const id = currentLet[j] + (i + 1);

            if ((i !== startCell.rowNum) || (j !== startCell.colNum)) {
                grayCells.push({
                    cell: mainTable.rows[i].cells[j],
                    id: id
                });
                mainTable.rows[i].cells[j].style.backgroundColor = '#c3c3c3';
                document.getElementById(id).style.backgroundColor = '#c3c3c3';
            }

            if (i === start_i) {
                paintBorders(mainTable.rows[i].cells[j], true, false, false, false);
                borderCells.push(mainTable.rows[i].cells[j]);
            }
            if (j === start_j) {
                paintBorders(mainTable.rows[i].cells[j], false, true, false, false);
                borderCells.push(mainTable.rows[i].cells[j]);
            }
            if (j === end_j) {
                paintBorders(mainTable.rows[i].cells[j], false, false, true, false);
                borderCells.push(mainTable.rows[i].cells[j]);
            }
            if (i === end_i) {
                paintBorders(mainTable.rows[i].cells[j], false, false, false, true);
                borderCells.push(mainTable.rows[i].cells[j]);
            }

            upTable.rows[0].cells[j].style.backgroundColor = '#c3c3c3';
            document.getElementById('up_' + j).style.backgroundColor = '#6bc961';
            leftTable.rows[i].cells[0].style.backgroundColor = '#c3c3c3';
            document.getElementById('left_' + (i + 1)).style.backgroundColor = '#6bc961';
        }
    }
}

const paintCells2 = () => {
    const rowFlag = startCell.rowNum > curCell.rowNum;
    const colFlag = startCell.colNum > curCell.colNum;
    const start_i = (rowFlag) ? curCell.rowNum : startCell.rowNum;
    const start_j = (colFlag) ? curCell.colNum : startCell.colNum;
    const end_i = (rowFlag) ? startCell.rowNum : curCell.rowNum;
    const end_j = (colFlag) ? startCell.colNum : curCell.colNum;
    const focusTextArea = document.getElementById(focusID);

    for (let i = start_i; i <= end_i; i++) {
        for (let j = start_j; j <= end_j; j++) {
            const id = currentLet[j] + (i + 1);

            if (i === start_i) {
                paintBorders(mainTable.rows[i].cells[j], true, false, false, false);
                lightblueBorderCells.push({
                      cell: mainTable.rows[i].cells[j],
                      top: true,
                      left: false,
                      right: false,
                      bottom: false
                });
            }

            if (j === start_j) {
                paintBorders(mainTable.rows[i].cells[j], false, true, false, false);
                lightblueBorderCells.push({
                      cell: mainTable.rows[i].cells[j],
                      top: false,
                      left: true,
                      right: false,
                      bottom: false
                });
            }

            if (j === end_j) {
                paintBorders(mainTable.rows[i].cells[j], false, false, true, false);
                lightblueBorderCells.push({
                      cell: mainTable.rows[i].cells[j],
                      top: false,
                      left: false,
                      right: true,
                      bottom: false
                });
            }

            if (i === end_i) {
                paintBorders(mainTable.rows[i].cells[j], false, false, false, true);
                lightblueBorderCells.push({
                      cell: mainTable.rows[i].cells[j],
                      top: false,
                      left: false,
                      right: false,
                      bottom: true
                });
            }

        }
    }

    const id1 = currentLet[start_j] + (start_i + 1);
    const id2 = currentLet[end_j] + (end_i + 1);
    focusTextArea.value = (id1 === id2)? formulaBuf + id1 : formulaBuf + id1 + ':' + id2;
}

let paintCells = paintCells1;

const paintBorders1 = (cell, top, left, right, bottom) => {

    if ((top) && (cell.rowNum)) {
        mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['box-shadow'] = '0px 3px 0px 0px #6bc961';
        mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['z-index'] = 4;
    }

    if ((left) && (cell.colNum)) {
        mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['box-shadow'] = '3px 0px 0px 0px #6bc961';
        mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['z-index'] = 4;
    }

    if (right) {
        mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['box-shadow'] = '-2px 0px 0px 0px #6bc961';
        mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['z-index'] = 4;
    }

    if (bottom) {
        mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['box-shadow'] = '0px -2px 0px 0px #6bc961';
        mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['z-index'] = 4;
    }

}

const paintBorders2 = (cell, top, left, right, bottom) => {

      if (top) {

          if (cell.rowNum) {
            const prevBS = getComputedStyle(mainTable.rows[cell.rowNum - 1].cells[cell.colNum]).boxShadow;

            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['box-shadow'] =
                    (prevBS === 'none')? '0px 3px 0px 0px #00b7b7' : prevBS + ', 0px 3px 0px 0px #00b7b7';
            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['z-index'] = 4;

          } else {
            document.getElementById('up_' + cell.colNum).style.backgroundColor = '#00b7b7';
          }

      }

      if (left) {

          if (cell.colNum) {
            const prevBS = getComputedStyle(mainTable.rows[cell.rowNum].cells[cell.colNum - 1]).boxShadow;

            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['box-shadow'] =
                    (prevBS === 'none')? '3px 0px 0px 0px #00b7b7' : prevBS + ', 3px 0px 0px 0px #00b7b7';
            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['z-index'] = 4;

          } else {
            document.getElementById('left_' + (cell.rowNum + 1)).style.backgroundColor = '#00b7b7';
          }

      }

      if (right) {
          const prevBS = getComputedStyle(mainTable.rows[cell.rowNum].cells[cell.colNum + 1]).boxShadow;

          mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['box-shadow'] =
                  (prevBS === 'none')? '-2px 0px 0px 0px #00b7b7' : prevBS + ', -2px 0px 0px 0px #00b7b7';
          mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['z-index'] = 4;
      }

      if (bottom) {
          const prevBS = getComputedStyle(mainTable.rows[cell.rowNum + 1].cells[cell.colNum]).boxShadow;

          mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['box-shadow'] =
                  (prevBS === 'none')? '0px -2px 0px 0px #00b7b7' : prevBS + ', 0px -2px 0px 0px #00b7b7';
          mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['z-index'] = 4;
      }

}

let paintBorders = paintBorders1;

/**
 * Initialize cell events
 * @param {String} id
 */

const initCell = (columnNumber, rowNumber) => {
    const id = currentLet[columnNumber] + rowNumber;
    const newInput = document.getElementById(id);
    const newCell = document.getElementById('Cell_' + id);
    newInput.editMode = false;
    newInput.formulaMode = false;
    newInput.hasOldValue = false;

    newCell.colNum = columnNumber;
    newCell.rowNum = rowNumber - 1;

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
                const cell = document.getElementById('Cell_' + elem.id);
                console.log(elem.value);
                elem.value = '';
                elem.editMode = false;
                elem.style.cursor = 'cell';

                if (cell.rowNum) {
                    mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['box-shadow'] = '0px 3px 0px 0px #6bc961';
                }
                if (cell.colNum) {
                    mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['box-shadow'] = '3px 0px 0px 0px #6bc961';
                }

                mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['box-shadow'] = '-2px 0px 0px 0px #6bc961';
                mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['box-shadow'] = '0px -2px 0px 0px #6bc961';
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

    const activateFormulaMode = () => {
        newInput.editMode = false;
        newInput.formulaMode = true;
        newInput.style.cursor = 'text';
        bleachCells = bleachCells2;
        paintBorders = paintBorders2;
        paintCells = paintCells2;

        if (newCell.rowNum) {
            mainTable.rows[newCell.rowNum - 1].cells[newCell.colNum].style['box-shadow'] = '0px 3px 0px 0px #c9d217';
        }
        if (newCell.colNum) {
            mainTable.rows[newCell.rowNum].cells[newCell.colNum - 1].style['box-shadow'] = '3px 0px 0px 0px #c9d217';
        }

        mainTable.rows[newCell.rowNum].cells[newCell.colNum + 1].style['box-shadow'] = '-2px 0px 0px 0px #c9d217';
        mainTable.rows[newCell.rowNum + 1].cells[newCell.colNum].style['box-shadow'] = '0px -2px 0px 0px #c9d217';
    }

    const disableFormulaMode = () => {
        newInput.formulaMode = false;
        newInput.style.cursor = 'cell';
        bleachCells();
        bleachCells = bleachCells1;
        paintBorders = paintBorders1;
        paintCells = paintCells1;
        formulaBuf = '=';
    }

    const handler1 = (e) => {

      e.preventDefault();
      newInput.selectionStart = newInput.selectionEnd = 0;
      newInput.focus();
      isMultiHL = true;
      startCell = newCell;
      colorCell = newCell;

      bleachCells();

      if (focusID) {
          const oldInput = document.getElementById(focusID);
          const oldCell = document.getElementById('Cell_' + focusID);
          const upCell = upTable.rows[0].cells[oldCell.colNum];
          const leftCell = leftTable.rows[oldCell.rowNum].cells[0];

          upCell.style.backgroundColor = '#eee';
          document.getElementById('up_' + oldCell.colNum).style.backgroundColor = 'transparent';
          leftCell.style.backgroundColor = '#eee';
          document.getElementById('left_' + (oldCell.rowNum + 1)).style.backgroundColor = 'transparent';
          oldInput.style.textAlign = 'right';
          oldInput.editMode = false;
          oldInput.style.cursor = 'cell';
      }

      focusID = newInput.id;
      newInput.hasOldValue = true;
      const upCell = upTable.rows[0].cells[columnNumber];
      const leftCell = leftTable.rows[rowNumber - 1].cells[0];

      upCell.style.backgroundColor = '#c3c3c3';
      document.getElementById('up_' + columnNumber).style.backgroundColor = '#6bc961';
      leftCell.style.backgroundColor = '#c3c3c3';
      document.getElementById('left_' + rowNumber).style.backgroundColor = '#6bc961';
      newInput.style.textAlign = 'left';

      paintBorders(newCell, true, true, true, true);
      borderCells.push(newCell);

      document.onmousemove = (e) => {

          stateScroll = (mainDiv.scrollLeft && mainDiv.scrollTop) ? 3 :
              (mainDiv.scrollLeft) ? 2 :
              (mainDiv.scrollTop) ? 1 :
              0;

          currentX = e.clientX;
          currentY = e.clientY;

          if (e.target.className === 'main_cell') {
              curCell = e.target;
          } else if (e.target.parentNode.className === 'main_cell') {
              curCell = e.target.parentNode;
          } else if (!isScrolling) {
              isScrolling = true;
              mainDiv.onscroll();
          }

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

      }

      document.onmouseup = () => {
          isMultiHL = false;
          isScrolling = false;
          curCell = null;
          currentY = 0;
          currentX = 0;
          stateScroll = -1;
          document.onmousemove = document.onmouseup = null;
      }

    }

    const handler2 = (e) => {

      if (newInput.id !== focusID) {

        const focusTextArea = document.getElementById(focusID);

        e.preventDefault();
        isMultiHL = true;
        startCell = newCell;
        colorCell = newCell;

        bleachCells();

        paintBorders(newCell, true, true, true, true);
        lightblueBorderCells.push({
              cell: newCell,
              top: true,
              left: true,
              right: true,
              bottom: true
        });
        focusTextArea.value = formulaBuf + newInput.id;

        document.onmousemove = (e) => {

            stateScroll = (mainDiv.scrollLeft && mainDiv.scrollTop) ? 3 :
                (mainDiv.scrollLeft) ? 2 :
                (mainDiv.scrollTop) ? 1 :
                0;

            currentX = e.clientX;
            currentY = e.clientY;

            if (e.target.className === 'main_cell') {
                curCell = e.target;
            } else if (e.target.parentNode.className === 'main_cell') {
                curCell = e.target.parentNode;
            } else if (!isScrolling) {
                isScrolling = true;
                mainDiv.onscroll();
            }

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

        }

        document.onmouseup = () => {
            isMultiHL = false;
            isScrolling = false;
            curCell = null;
            currentY = 0;
            currentX = 0;
            stateScroll = -1;
            document.onmousemove = document.onmouseup = null;
        }

      } else {
        formulaBuf = newInput.value;
      }

    }

    newCell.onmousedown = (e) => {
        if (!newInput.editMode) {

            if (focusID && document.getElementById(focusID).formulaMode) {
                handler2(e);
            } else {
                handler1(e);
            }

        }
    }

    newCell.ondblclick = () => {

        if (!newInput.formulaMode) {

          if (newInput.value === '=') {
            newInput.focus();
            activateFormulaMode();
            newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
          } else {
            newInput.editMode = true;
            newInput.focus();

            newInput.style.cursor = 'text';
            newInput.selectionStart = newInput.selectionEnd = newInput.value.length;

            if (newCell.rowNum) {
                mainTable.rows[newCell.rowNum - 1].cells[newCell.colNum].style['box-shadow'] = '0px 3px 0px 0px #0080ff';
            }
            if (newCell.colNum) {
                mainTable.rows[newCell.rowNum].cells[newCell.colNum - 1].style['box-shadow'] = '3px 0px 0px 0px #0080ff';
            }

            mainTable.rows[newCell.rowNum].cells[newCell.colNum + 1].style['box-shadow'] = '-2px 0px 0px 0px #0080ff';
            mainTable.rows[newCell.rowNum + 1].cells[newCell.colNum].style['box-shadow'] = '0px -2px 0px 0px #0080ff';
          }

        }

    }

    newInput.addEventListener('keydown', (e) => {
        let dx = 0;
        let dy = 0;

        if (newInput.editMode) {

            if (e.key === 'Enter') {
                e.preventDefault();
                dy = 1;
            } else if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                dx = (columnNumber ? -1 : 0);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                dx = 1;
            } else if ((newInput.value === '') && (e.key === '=')) {
                activateFormulaMode();
            }

        } else if (newInput.formulaMode) {

            if (e.key === 'Enter') {
                e.preventDefault();
                dy = 1;
                disableFormulaMode();
            } else if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                dx = (columnNumber ? -1 : 0);
                disableFormulaMode();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                dx = 1;
                disableFormulaMode();
            } /*else if (e.key === 'ArrowDown') {
                e.preventDefault();
                dy = 1;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                dy = (rowNumber ? -1 : 0);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();                            !will be update later!
                dx = (columnNumber ? -1 : 0);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                dx = 1;
            } *//*else if (e.key !== 'Escape') {
                formulaBuf = newInput.value;
            }*/

        } else {

            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                dy = 1;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                dy = (rowNumber ? -1 : 0);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                dx = (columnNumber ? -1 : 0);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                dx = 1;
            } else if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                dx = (columnNumber ? -1 : 0);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                dx = 1;
            } else if ((newInput.hasOldValue) && (!e.shiftKey)) {
                newInput.value = '';
                newInput.hasOldValue = false;

                if (e.key === '=') {
                    activateFormulaMode();
                }
            }

        }

        if ((dx !== 0) || (dy !== 0)) {
            const low_cell = document.getElementById('Cell_' + currentLet[columnNumber + dx] + (rowNumber + dy));
            const low_input = document.getElementById(currentLet[columnNumber + dx] + (rowNumber + dy));
            low_cell.dispatchEvent(new Event('mousedown', {
                keyCode: 13
            }));
            document.dispatchEvent(new Event('mouseup'));
            low_input.focus();
        }
    });
}

const addUpAndLeftEvents = (type, num) => {

    const cell = (type === 'up') ? document.getElementById('Cell_' + currentLet[num]) :
        document.getElementById('Cell_' + num);
    cell.isSelected = false;
    let prevColor = '';

    cell.onmouseenter = () => {
        if (!isMultiHL) {
            prevColor = getComputedStyle(cell).backgroundColor;
            cell.style.backgroundColor = '#9fff9f';
        } else {
            prevColor = '#c3c3c3';
        }
    }

    cell.onmouseleave = () => {
        if (!isMultiHL) {
            cell.style.backgroundColor = prevColor;
        }
    }

    if (type === 'up') {

        cell.onmousedown = (e) => {

            if (e.target.className !== 'modSymb') {

                cell.isSelected = true;
                bleachCells();

                if (focusID) {
                    const oldInput = document.getElementById(focusID);
                    const oldCell = document.getElementById('Cell_' + focusID);
                    const upCell = upTable.rows[0].cells[oldCell.colNum];
                    const leftCell = leftTable.rows[oldCell.rowNum].cells[0];

                    upCell.style.backgroundColor = '#eee';
                    document.getElementById('up_' + oldCell.colNum).style.backgroundColor = 'transparent';
                    leftCell.style.backgroundColor = '#eee';
                    document.getElementById('left_' + (oldCell.rowNum + 1)).style.backgroundColor = 'transparent';
                    oldInput.style.textAlign = 'right';
                    oldInput.editMode = false;
                    oldInput.style.cursor = 'cell';
                    oldInput.hasOldValue = true;
                }

                focusID = '';
                prevColor = '#bbffbb';
                cell.style.backgroundColor = '#9fff9f';
                document.getElementById(currentLet[num] + '0').style.color = '#003e00';
                document.getElementById('up_' + num).style.backgroundColor = '#6bc961';
                selUpCells.push({
                    cell: cell,
                    num: num
                });

                for (let i = 0; i < ROWS; i++) {
                    const id = currentLet[num] + (i + 1);
                    const cell = mainTable.rows[i].cells[num];

                    if (i === 0) {
                        borderCells.push(cell);
                        grayCells.push({
                            cell: cell,
                            id: id
                        });

                        if (cell.colNum) {
                            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['box-shadow'] = '3px 0px 0px 0px #6bc961';
                            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['z-index'] = 4;
                        }
                        mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['box-shadow'] = '-2px 0px 0px 0px #6bc961';
                        mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['z-index'] = 4;
                    } else {
                        borderCells.push(cell);
                        grayCells.push({
                            cell: cell,
                            id: id
                        });
                        cell.style.backgroundColor = '#c3c3c3';
                        document.getElementById(id).style.backgroundColor = '#c3c3c3';

                        if (cell.colNum) {
                            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['box-shadow'] = '3px 0px 0px 0px #6bc961';
                            mainTable.rows[cell.rowNum].cells[cell.colNum - 1].style['z-index'] = 4;
                        }
                        mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['box-shadow'] = '-2px 0px 0px 0px #6bc961';
                        mainTable.rows[cell.rowNum].cells[cell.colNum + 1].style['z-index'] = 4;
                    }

                    leftTable.rows[i].cells[0].style.backgroundColor = '#c3c3c3';
                    document.getElementById('left_' + (i + 1)).style.backgroundColor = '#6bc961';
                }

            }

        }

    } else if (type === 'left') {

        cell.onmousedown = (e) => {

            if (e.target.className !== 'modVertSymb') {

                cell.isSelected = true;
                bleachCells();

                if (focusID) {
                    const oldInput = document.getElementById(focusID);
                    const oldCell = document.getElementById('Cell_' + focusID);
                    const upCell = upTable.rows[0].cells[oldCell.colNum];
                    const leftCell = leftTable.rows[oldCell.rowNum].cells[0];

                    upCell.style.backgroundColor = '#eee';
                    document.getElementById('up_' + oldCell.colNum).style.backgroundColor = 'transparent';
                    leftCell.style.backgroundColor = '#eee';
                    document.getElementById('left_' + (oldCell.rowNum + 1)).style.backgroundColor = 'transparent';
                    oldInput.style.textAlign = 'right';
                    oldInput.editMode = false;
                    oldInput.style.cursor = 'cell';
                    oldInput.hasOldValue = true;
                }

                focusID = '';
                prevColor = '#bbffbb';
                cell.style.backgroundColor = '#9fff9f';
                document.getElementById('@' + num).style.color = '#003e00';
                document.getElementById('left_' + num).style.backgroundColor = '#6bc961';
                selLeftCells.push({
                    cell: cell,
                    num: num
                });

                for (let i = 0; i <= COLS; i++) {
                    const cell = mainTable.rows[num - 1].cells[i];
                    const id = currentLet[i] + num;

                    if (i === 0) {
                        borderCells.push(cell);
                        grayCells.push({
                            cell: cell,
                            id: id
                        });

                        if (cell.rowNum) {
                            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['box-shadow'] = '0px 3px 0px 0px #6bc961';
                            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['z-index'] = 4;
                        }
                        mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['box-shadow'] = '0px -2px 0px 0px #6bc961';
                        mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['z-index'] = 4;
                    } else {
                        borderCells.push(cell);
                        grayCells.push({
                            cell: cell,
                            id: id
                        });
                        cell.style.backgroundColor = '#c3c3c3';
                        document.getElementById(id).style.backgroundColor = '#c3c3c3';

                        if (cell.rowNum) {
                            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['box-shadow'] = '0px 3px 0px 0px #6bc961';
                            mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['z-index'] = 4;
                        }
                        mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['box-shadow'] = '0px -2px 0px 0px #6bc961';
                        mainTable.rows[cell.rowNum + 1].cells[cell.colNum].style['z-index'] = 4;
                    }

                    upTable.rows[0].cells[i].style.backgroundColor = '#c3c3c3';
                    document.getElementById('up_' + i).style.backgroundColor = '#6bc961';
                }

            }

        }

    }

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
            addDecorUpDiv(currentLet.length - 1);
            addUpAndLeftEvents('up', currentLet.length - 1);

            for (let j = 0; j < ROWS; j++) {

                const cell = mainTable.rows[j].insertCell(-1);
                cell.innerHTML = "<textarea id = '" + letter + (j + 1) + "' class = 'cell_input_area'/>";
                cell.id = 'Cell_' + letter + (j + 1);
                cell.className = 'main_cell';
                initCell(currentLet.length - 1, j + 1);

                const curId = letter + (j + 1);
                const prevId = currentLet[currentLet.length - 2] + (j + 1);
                const inp = document.getElementById(curId);
                const preInp = document.getElementById(prevId);

                inp.style.height = preInp.style.height;
                inp.style.padding = preInp.style.padding;
                cell.style.padding = document.getElementById('Cell_' + prevId).style.padding;

                if (document.getElementById('Cell_' + (j + 1)).isSelected) {
                    grayCells.push({
                        cell: cell,
                        id: curId
                    });
                    cell.style.backgroundColor = '#c3c3c3';
                    document.getElementById(curId).style.backgroundColor = '#c3c3c3';
                    borderCells.push(cell);

                    if (cell.rowNum) {
                        mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['box-shadow'] = '0px 3px 0px 0px #6bc961';
                        mainTable.rows[cell.rowNum - 1].cells[cell.colNum].style['z-index'] = 4;
                    }

                    upTable.rows[0].cells[i].style.backgroundColor = '#c3c3c3';
                    document.getElementById('up_' + i).style.backgroundColor = '#6bc961';
                }

                if (j && document.getElementById('Cell_' + j).isSelected) {
                    cell.style['box-shadow'] = '0px -2px 0px 0px #6bc961';
                    cell.style['z-index'] = 4;
                }

                cell.onkeydown = function (e) {
                    if (e.ctrlKey && e.keyCode === 67) {
                        e.preventDefault();
                        tryToSmthToClipboard(cell.firstChild, 'copy');
                    } else if (e.ctrlKey && e.keyCode === 88) {
                        e.preventDefault();
                        tryToSmthToClipboard(cell.firstChild, 'cut');
                    }
                };
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
                addDecorUpDiv(j);
                addUpAndLeftEvents('up', j);
                addExpansion(letter, j);
            }
        }

        for (let i = ROWS; i < ROWS + rows; i++) {
            const row = mainTable.insertRow(-1);
            const leftRow = leftTable.insertRow(-1);

            const left_cell = leftRow.insertCell(-1);
            left_cell.innerHTML = `<div align = "center" id = "${'@' + (i + 1)}" class = "left"> ${i + 1} </div>`;
            left_cell.id = 'Cell_' + (i + 1);
            addDecorLeftDiv(i);
            addUpAndLeftEvents('left', i + 1);
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
                new_cell.className = 'main_cell';
                initCell(j, i + 1);

                new_cell.onkeydown = function (e) {
                    if (e.ctrlKey && e.keyCode === 67) {
                        e.preventDefault();
                        tryToSmthToClipboard(new_cell.firstChild, 'copy');
                    } else if (e.ctrlKey && e.keyCode === 88) {
                        e.preventDefault();
                        tryToSmthToClipboard(new_cell.firstChild, 'cut');
                    }
                };

                if (i >= DEFAULT_ROWS) {
                    const curId = letter + (i + 1);
                    const prevId = letter + i;
                    const inp = document.getElementById(curId);
                    const preInp = document.getElementById(prevId);

                    inp.style.width = preInp.style.width;
                    inp.style.padding = preInp.style.padding;
                    new_cell.style.padding = document.getElementById('Cell_' + prevId).style.padding;

                    if (document.getElementById('Cell_' + letter).isSelected) {
                        grayCells.push({
                            cell: new_cell,
                            id: curId
                        });
                        new_cell.style.backgroundColor = '#c3c3c3';
                        document.getElementById(curId).style.backgroundColor = '#c3c3c3';
                        borderCells.push(new_cell);

                        if (new_cell.colNum) {
                            mainTable.rows[new_cell.rowNum].cells[new_cell.colNum - 1].style['box-shadow'] = '3px 0px 0px 0px #6bc961';
                            mainTable.rows[new_cell.rowNum].cells[new_cell.colNum - 1].style['z-index'] = 4;
                        }

                        leftTable.rows[i].cells[0].style.backgroundColor = '#c3c3c3';
                        document.getElementById('left_' + (i + 1)).style.backgroundColor = '#6bc961';
                    }

                    if (j && document.getElementById('Cell_' + currentLet[j - 1]).isSelected) {
                        new_cell.style.boxShadow = '-2px 0px 0px 0px #6bc961';
                        new_cell.style['z-index'] = 4;
                    }
                }
            }
        }
    }

    ROWS += rows;
    COLS += cols;
}

addCells(DEFAULT_ROWS, DEFAULT_COLS);

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

    const condLeft = currentX < mainTable.rows[0].cells[0].getBoundingClientRect().left + mainDiv.scrollLeft;
    const condUp = currentY < mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop;
    const condBot = currentY > mainDiv.clientHeight + mainDiv.getBoundingClientRect().top;
    const condRight = currentX > mainDiv.clientWidth + mainDiv.getBoundingClientRect().left;

    if (stateScroll === 0) {

        if (condUp && condLeft) {
            curCell = mainTable.rows[0].cells[0];

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            isScrolling = false;

        } else if (condUp && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2,
              mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 2;
          mainDiv.scrollBy(horScrollSpeed, 0);
          upDiv.scrollBy(horScrollSpeed, 0);

        } else if (condBot && condLeft) {
          const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
              mainDiv.scrollLeft + 1,
              mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 1;
          mainDiv.scrollBy(0, vertScrollSpeed);
          leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condBot && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2,
              mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 3;
          mainDiv.scrollBy(horScrollSpeed, vertScrollSpeed);
          upDiv.scrollBy(horScrollSpeed, 0);
          leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condUp) {
            const elem = document.elementFromPoint(currentX, mainTable.rows[0].cells[0].getBoundingClientRect().top + 1);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? mainTable.rows[0].cells[elem.colNum] :
                (elem.parentNode.className === 'main_cell') ? mainTable.rows[0].cells[elem.parentNode.colNum] :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            isScrolling = false;

        } else if (condLeft) {
            const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left + 1, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? mainTable.rows[elem.rowNum].cells[0] :
                (elem.parentNode.className === 'main_cell') ? mainTable.rows[elem.parentNode.rowNum].cells[0] :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            isScrolling = false;

        } else if (condBot) {
            const elem = document.elementFromPoint(currentX,
                mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
                (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 1;
            mainDiv.scrollBy(0, vertScrollSpeed);
            leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condRight) {
            const elem = document.elementFromPoint(mainDiv.clientWidth +
                mainDiv.getBoundingClientRect().left -
                (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 2;
            mainDiv.scrollBy(horScrollSpeed, 0);
            upDiv.scrollBy(horScrollSpeed, 0);

        } else {
            isScrolling = false;
        }

    } else if (stateScroll === 1) {

        if (condUp && condLeft) {
          const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
              mainDiv.scrollLeft + 1,
              mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          if (mainDiv.scrollTop - vertScrollSpeed <= 0) {
              mainDiv.scrollTop = 0;
              stateScroll = 0;
              isScrolling = false;
          } else {
              stateScroll = 1;
              mainDiv.scrollBy(0, -vertScrollSpeed);
              leftDiv.scrollBy(0, -vertScrollSpeed);
          }

        } else if (condUp && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2,
              mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          if (mainDiv.scrollTop - vertScrollSpeed <= 0) {
              mainDiv.scrollTop = 0;
              stateScroll = 2;
              isScrolling = false;
          } else {
              stateScroll = 3;
              mainDiv.scrollBy(horScrollSpeed, -vertScrollSpeed);
              leftDiv.scrollBy(0, -vertScrollSpeed);
              upDiv.scrollBy(horScrollSpeed, 0);
          }

        } else if (condBot && condLeft) {
          const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
              mainDiv.scrollLeft + 1,
              mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 1;
          mainDiv.scrollBy(0, vertScrollSpeed);
          leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condBot && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, mainDiv.clientHeight +
              mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 3;
          mainDiv.scrollBy(horScrollSpeed, vertScrollSpeed);
          upDiv.scrollBy(horScrollSpeed, 0);
          leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condUp) {
            const elem = document.elementFromPoint(currentX,
                mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            if (mainDiv.scrollTop - vertScrollSpeed <= 0) {
                mainDiv.scrollTop = 0;
                stateScroll = 0;
                isScrolling = false;
            } else {
                stateScroll = 1;
                mainDiv.scrollBy(0, -vertScrollSpeed);
                leftDiv.scrollBy(0, -vertScrollSpeed);
            }

        } else if (condLeft) {
            const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left + 1, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? mainTable.rows[elem.rowNum].cells[0] :
                (elem.parentNode.className === 'main_cell') ? mainTable.rows[elem.parentNode.rowNum].cells[0] :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            isScrolling = false;

        } else if (condBot) {
            const elem = document.elementFromPoint(currentX,
                mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
                (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 1;
            mainDiv.scrollBy(0, vertScrollSpeed);
            leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condRight) {
            const elem = document.elementFromPoint(mainDiv.clientWidth +
                mainDiv.getBoundingClientRect().left -
                (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 3;
            mainDiv.scrollBy(horScrollSpeed, 0);
            upDiv.scrollBy(horScrollSpeed, 0);

        } else {
            isScrolling = false;
        }

    } else if (stateScroll === 2) {

        if (condUp && condLeft) {
          const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
              mainDiv.scrollLeft + 1, mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          if (mainDiv.scrollLeft - horScrollSpeed <= 0) {
              mainDiv.scrollLeft = 0;
              stateScroll = 0;
              isScrolling = false;
          } else {
              stateScroll = 2;
              mainDiv.scrollBy(-horScrollSpeed, 0);
              upDiv.scrollBy(-horScrollSpeed, 0);
          }

        } else if (condUp && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, mainTable.rows[0].cells[0].getBoundingClientRect().top +
              mainDiv.scrollTop + 1);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 2;
          mainDiv.scrollBy(horScrollSpeed, 0);
          upDiv.scrollBy(horScrollSpeed, 0);

        } else if (condBot && condLeft) {
          const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
              mainDiv.scrollLeft + 1, mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          if (mainDiv.scrollLeft - horScrollSpeed <= 0) {
              mainDiv.scrollLeft = 0;
              stateScroll = 1;
              isScrolling = false;
          } else {
              stateScroll = 3;
              mainDiv.scrollBy(-horScrollSpeed, vertScrollSpeed);
              upDiv.scrollBy(-horScrollSpeed, 0);
              leftDiv.scrollBy(0, vertScrollSpeed);
          }

        } else if (condBot && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, mainDiv.clientHeight +
              mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 3;
          mainDiv.scrollBy(horScrollSpeed, vertScrollSpeed);
          upDiv.scrollBy(horScrollSpeed, 0);
          leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condUp) {
            const elem = document.elementFromPoint(currentX, mainTable.rows[0].cells[0].getBoundingClientRect().top + 1);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? mainTable.rows[0].cells[elem.colNum] :
                (elem.parentNode.className === 'main_cell') ? mainTable.rows[0].cells[elem.parentNode.colNum] :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            isScrolling = false;

        } else if (condLeft) {
            const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
                mainDiv.scrollLeft + 1, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            if (mainDiv.scrollLeft - horScrollSpeed <= 0) {
                mainDiv.scrollLeft = 0;
                stateScroll = 0;
                isScrolling = false;
            } else {
                stateScroll = 2;
                mainDiv.scrollBy(-horScrollSpeed, 0);
                upDiv.scrollBy(-horScrollSpeed, 0);
            }

        } else if (condBot) {
            const elem = document.elementFromPoint(currentX,
                mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
                (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 3;
            mainDiv.scrollBy(0, vertScrollSpeed);
            leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condRight) {
            const elem = document.elementFromPoint(mainDiv.clientWidth +
                mainDiv.getBoundingClientRect().left -
                (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 2;
            mainDiv.scrollBy(horScrollSpeed, 0);
            upDiv.scrollBy(horScrollSpeed, 0);

        } else {
            isScrolling = false;
        }

    } else if (stateScroll === 3) {

        if (condUp && condLeft) {
          const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
              mainDiv.scrollLeft + 1,
              mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          if ((mainDiv.scrollTop - vertScrollSpeed <=0) && (mainDiv.scrollLeft - horScrollSpeed <= 0)) {
              mainDiv.scrollTop = mainDiv.scrollLeft = 0;
              stateScroll = 0;
              isScrolling = false;
          } else if (mainDiv.scrollTop - vertScrollSpeed <= 0) {
              mainDiv.scrollTop = 0;
              stateScroll = 2;
              mainDiv.scrollBy(-horScrollSpeed, 0);
              upDiv.scrollBy(-horScrollSpeed, 0);
          } else if (mainDiv.scrollLeft - horScrollSpeed <= 0) {
              mainDiv.scrollLeft = 0;
              stateScroll = 1;
              mainDiv.scrollBy(0, -vertScrollSpeed);
              leftDiv.scrollBy(0, -vertScrollSpeed);
          } else {
              stateScroll = 3;
              mainDiv.scrollBy(-horScrollSpeed, -vertScrollSpeed);
              upDiv.scrollBy(-horScrollSpeed, 0);
              leftDiv.scrollBy(0, -vertScrollSpeed);
          }

        } else if (condUp && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2,
              mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          if (mainDiv.scrollTop - vertScrollSpeed <= 0) {
              mainDiv.scrollTop = 0;
              stateScroll = 2;
              mainDiv.scrollBy(horScrollSpeed, 0);
              upDiv.scrollBy(horScrollSpeed, 0);
          } else {
              stateScroll = 3;
              mainDiv.scrollBy(horScrollSpeed, -vertScrollSpeed);
              upDiv.scrollBy(horScrollSpeed, 0);
              leftDiv.scrollBy(0, -vertScrollSpeed);
          }

        } else if (condBot && condLeft) {
          const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
              mainDiv.scrollLeft + 1, mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          if (mainDiv.scrollLeft - horScrollSpeed <= 0) {
              mainDiv.scrollLeft = 0;
              stateScroll = 1;
              mainDiv.scrollBy(0, vertScrollSpeed);
              leftDiv.scrollBy(0, vertScrollSpeed);
          } else {
              stateScroll = 3;
              mainDiv.scrollBy(-horScrollSpeed, vertScrollSpeed);
              upDiv.scrollBy(-horScrollSpeed, 0);
              leftDiv.scrollBy(0, vertScrollSpeed);
          }

        } else if (condBot && condRight) {
          const elem = document.elementFromPoint(mainDiv.clientWidth +
              mainDiv.getBoundingClientRect().left -
              (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, mainDiv.clientHeight +
              mainDiv.getBoundingClientRect().top -
              (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

          curCell = (elem === null) ? null :
              (elem.className === 'main_cell') ? elem :
              (elem.parentNode.className === 'main_cell') ? elem.parentNode :
              curCell;

          if ((curCell !== null) && (curCell !== colorCell)) {
              bleachCells();
              paintCells();
              colorCell = curCell;
          }

          stateScroll = 3;
          mainDiv.scrollBy(horScrollSpeed, vertScrollSpeed);
          upDiv.scrollBy(horScrollSpeed, 0);
          leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condUp) {
            const elem = document.elementFromPoint(currentX,
                mainTable.rows[0].cells[0].getBoundingClientRect().top + mainDiv.scrollTop + 1);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            if (mainDiv.scrollTop - vertScrollSpeed <= 0) {
                mainDiv.scrollTop = 0;
                stateScroll = 2;
                isScrolling = false;
            } else {
                stateScroll = 3;
                mainDiv.scrollBy(0, -vertScrollSpeed);
                leftDiv.scrollBy(0, -vertScrollSpeed);
            }

        } else if (condLeft) {
            const elem = document.elementFromPoint(mainTable.rows[0].cells[0].getBoundingClientRect().left +
                mainDiv.scrollLeft + 1, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            if (mainDiv.scrollLeft - horScrollSpeed <= 0) {
                mainDiv.scrollLeft = 0;
                stateScroll = 1;
                isScrolling = false;
            } else {
                stateScroll = 3;
                mainDiv.scrollBy(-horScrollSpeed, 0);
                upDiv.scrollBy(-horScrollSpeed, 0);
            }

        } else if (condBot) {
            const elem = document.elementFromPoint(currentX,
                mainDiv.clientHeight + mainDiv.getBoundingClientRect().top -
                (mainDiv.offsetHeight - mainDiv.clientHeight) / 2);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 3;
            mainDiv.scrollBy(0, vertScrollSpeed);
            leftDiv.scrollBy(0, vertScrollSpeed);

        } else if (condRight) {
            const elem = document.elementFromPoint(mainDiv.clientWidth +
                mainDiv.getBoundingClientRect().left -
                (mainDiv.offsetWidth - mainDiv.clientWidth) / 2, currentY);

            curCell = (elem === null) ? null :
                (elem.className === 'main_cell') ? elem :
                (elem.parentNode.className === 'main_cell') ? elem.parentNode :
                curCell;

            if ((curCell !== null) && (curCell !== colorCell)) {
                bleachCells();
                paintCells();
                colorCell = curCell;
            }

            stateScroll = 3;
            mainDiv.scrollBy(horScrollSpeed, 0);
            upDiv.scrollBy(horScrollSpeed, 0);

        } else {
            isScrolling = false;
        }

    } else {
        isScrolling = false;
    }

}
