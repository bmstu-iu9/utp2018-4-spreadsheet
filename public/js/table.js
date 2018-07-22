'use strict';
const tableDiv = document.getElementById('table-div');

let DEFAULT_ROWS = 50, DEFAULT_COLS = 26;
let ROWS = 0, COLS = 0;
let letters = [65];
let currentLet = [];
let focusID = '';

/**
 * Colorize cell in user focus;
 * @param {String} color 
 */
const colorize = (color) => {
    if (focusID) {
        document.getElementById(focusID).style.backgroundColor = color
        document.getElementById('Cell_' + focusID).style.backgroundColor = color // для FF
    }
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
  let newDiv = document.createElement('div');
  newDiv.innerHTML = '|';
  newDiv['id'] = letter;
  newDiv['className'] = 'modSymb';
  table.rows[0].cells[j].appendChild(newDiv);

  const movableLine = document.getElementById(letter);
  
  const changeParams = () => {
      const oldParams = {
          height: getComputedStyle(movableLine).height,
          backgroundColor: getComputedStyle(movableLine).backgroundColor,
          color: getComputedStyle(movableLine).color,
          width: getComputedStyle(movableLine).width,
      }

      movableLine.style.height = getComputedStyle(document.getElementById('table')).height;
      movableLine.style.backgroundColor = '#808080';
      movableLine.style.color = '#808080';
      movableLine.style.width = '2px';

      return oldParams;
  }
  
  movableLine.onmousedown = (e) => {
    const shiftX = e.pageX - getXCoord(movableLine);
    const params = changeParams();
    let coords = 'no move';
      
    const goExpansion = (delta1, delta2, padSize) => {
      document.getElementById(letter + '0').style.width = coords + delta1 + 'px';
      for (let i = 1; i < ROWS; i++) {
          document.getElementById(letter + i).style.padding = padSize + 'px';
          document.getElementById(letter + i).style.width = coords + delta2 + 'px';
      }
    }
      
    document.onmousemove = (e) => {
      const newLeft = e.pageX - shiftX - getXCoord(movableLine.parentNode);
      movableLine.style.left = (newLeft > 0)? newLeft + 'px': '0px';
      coords = newLeft;
    }

    document.onmouseup = () => {
       if (coords != 'no move') {
        if (coords < 6) {
            document.getElementById('Cell_' + letter + '0').style.padding = '0px';
            if (coords < 3) {
              goExpansion(-coords, -coords, 0);
              movableLine.style.left = '-1px';
              movableLine.style.cursor = 'col-resize';
            } else {
              movableLine.style.cursor = 'ew-resize';
              goExpansion(0, 1, 0);
            }
        } else {
          document.getElementById('Cell_' + letter + '0').style.padding = '1px 3px';
          movableLine.style.cursor = 'ew-resize';
          goExpansion(-6, -3, 2);
        }
      }

      movableLine.style.height = params.height;
      movableLine.style.width = params.width;
      movableLine.style.backgroundColor = params.backgroundColor;
      movableLine.style.color = params.color;

      document.onmousemove = document.onmouseup = null;
    }

    return false;
  }

  movableLine.ondragstart = () => false;
}

const addVerticalExpansion = (i) => {
  let newDiv = document.createElement('div');
  newDiv.innerHTML = '';
  newDiv['id'] = i;
  newDiv['className'] = 'modVertSymb';
  table.rows[i].cells[0].appendChild(newDiv);

  const movableLine = document.getElementById(i);
  
  const changeParams = () => {
      const oldParams = {
          height: getComputedStyle(movableLine).height,
          backgroundColor: getComputedStyle(movableLine).backgroundColor,
          width: getComputedStyle(movableLine).width,
      }

      movableLine.style.height = '2px';
      movableLine.style.backgroundColor = '#808080';
      movableLine.style.width = getComputedStyle(document.getElementById('table')).width;

      return oldParams;
  }
    
  movableLine.onmousedown = (e) => {
    const shiftY = e.pageY - getYCoord(movableLine);
    const params = changeParams();
    let coords = 'no move';

    const goExpansion = (delta1, delta2, padSize) => {
      document.getElementById('@' + i).style.height = coords + delta1 + 'px';
      document.getElementById('table').rows[i].style['line-height'] = coords + delta1 + 'px';
      for (let j = 1; j <= COLS; j++) {
          document.getElementById(currentLet[j - 1] + i).style.padding = padSize + 'px';
          document.getElementById(currentLet[j - 1] + i).style.height = coords + delta2 + 'px';
      }
    }

    document.onmousemove = (e) => {
      const newTop = e.pageY - shiftY - getYCoord(movableLine.parentNode);
      movableLine.style.top = (newTop > 0)? newTop + 'px': '0px';
      coords = newTop;
    }

    document.onmouseup = () => {
      if (coords != 'no move') {
        if (coords < 6) {
            document.getElementById('Cell_undefined' + i).style.padding = '0px';
            if (coords < 3) {
              goExpansion(-coords, -coords, 0);
              movableLine.style.top = '-1px';
              movableLine.style.cursor = 'row-resize';
            } else {
              movableLine.style.cursor = 'ns-resize';
              goExpansion(0, 1, 0);
            }
        } else {
          document.getElementById('Cell_undefined' + i).style.padding = '1px 3px';
          movableLine.style.cursor = 'ns-resize';
          goExpansion(-3, -3, 2);
        }
      }

      movableLine.style.height = params.height;
      movableLine.style.width = params.width;
      movableLine.style.backgroundColor = params.backgroundColor;

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
    newCell.onmousedown = (e) => {
        if (focusID) {
            const oldInput = document.getElementById(focusID);
            const oldCell = document.getElementById('Cell_' + focusID);

            oldInput.style.textAlign = 'right';
            oldCell.style.outline = '';
        }

        focusID = newInput.id;
        newInput.style.textAlign = 'left';
        newCell.style.outline = '3px solid #35b729';
    }

    //При нажатии на Enter спускаемся вниз
    newInput.addEventListener('keydown', (e) => {
        let dx = 0;
        let dy = 0;

        if (e.keyCode === 13 || e.keyCode === 40) { //Enter and down button
            dy = 1;
        } else if (e.keyCode === 38) { //up
            dy = (rowNumber ? -1 : 0);
        } else if (e.keyCode === 37) { //left
            dx = (columnNumber ? -1 : 0);
        } else if (e.keyCode === 39) { //right
            dx = 1;
        }

        const low_cell = document.getElementById('Cell_' + currentLet[columnNumber + dx] + (rowNumber + dy))
        const low_input = document.getElementById(currentLet[columnNumber + dx] + (rowNumber + dy))
        low_cell.dispatchEvent(new Event('mousedown', {keyCode : 13}));
        low_input.focus();
    });
}

const addCells = function(rows, cols){
  if (rows === 0) {
        for (let i = COLS + 1; i <= COLS + cols; i++) {        
            currentLet.push(String.fromCharCode.apply(null, letters));
            updateLetters(letters.length - 1);
            const letter = currentLet[currentLet.length - 1];
        
            for (let j = 0; j < ROWS; j++) {
                const new_cell = table.rows[j].insertCell(-1)
                new_cell.innerHTML = i && j ? "<input id = '"+ letter + j +"'/>" : `<div align = "center" id = "${letter + 0}"> ${letter} </div>`;
                new_cell.id = 'Cell_' + letter + j;
                if (i && j) {
                    initCell(currentLet.length - 1, j);
                    document.getElementById(letter + j).style.height = document.getElementById(currentLet[i - 2] + j).style.height;
                }
            }
            
            addExpansion(letter, i);
        }
  } else {
        for (let i = ROWS; i < ROWS + rows; i++) {
            const row = document.getElementById('table').insertRow(-1);

            for (let j = 0; j <= COLS + cols; j++) {
                if (j > currentLet.length) {
                    currentLet.push(String.fromCharCode.apply(null, letters));
                    updateLetters(letters.length - 1);
                }

                const letter = (currentLet.length === 0)? '' : currentLet[j - 1];
                const new_cell = row.insertCell(-1);
                new_cell.innerHTML = i && j ? "<input id = '"+ letter + i +"'/>" :
                                                       i && !j ? `<div align = "center" id = "${'@' + i}" style = "overflow: hidden;"> ${i} </div>`:
                                                       !i && j ? `<div align = "center" id = "${letter + 0}"> ${letter} </div>`:
                                                       "";
                new_cell.id = 'Cell_' + letter + i;

                if (!i && j) {
                    addExpansion(letter, j);
                } else if (i && j) {
                    initCell(j - 1, i);
                    if (i >= DEFAULT_ROWS) {
                        document.getElementById(letter + i).style.width = document.getElementById(letter + (i - 1)).style.width;
                    }
                } else if (i && !j) {
                    addVerticalExpansion(i);
                }
            }
        }
  }
  
  ROWS += rows;
  COLS += cols;
}

addCells(DEFAULT_ROWS, DEFAULT_COLS);

tableDiv.onscroll = function() {
  const moreCellsOnY = tableDiv.scrollHeight - tableDiv.clientHeight;
  const moreCellsOnX = tableDiv.scrollWidth - tableDiv.clientWidth;
  const percentY = (tableDiv.scrollTop / moreCellsOnY) * 100;
  const percentX = (tableDiv.scrollLeft / moreCellsOnX) * 100;
  if(percentY > 80){
    addCells(5, 0);
  }
  if (percentX > 80){
    addCells(0, 5);
  }
}
