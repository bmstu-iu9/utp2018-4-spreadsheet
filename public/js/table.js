'use strict';
const mainDiv = document.getElementById('main-div');
const mainTable = document.getElementById('main-table');
const upTable = document.getElementById('up-table');
const leftTable = document.getElementById('left-table');
const upDiv = document.getElementById('up-div');
const leftDiv = document.getElementById('left-div');

let DEFAULT_ROWS = 50, DEFAULT_COLS = 26;
let ROWS = 0, COLS = 0;
let letters = [65];
let currentLet = [];
let focusID = '';
let lastFocusedTextarea = '';
let somePoliticalDirections = ['left', 'center', 'right'];

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
          document.getElementById(letter + i).style.padding = (flag)? '0px ' + padSize1 + 'px' : '2px ' + padSize1 + 'px';
          document.getElementById('Cell_' + letter + i).style.padding = (flag)? '0px ' + padSize2 + 'px' : '1px ' + padSize2 + 'px';
          document.getElementById(letter + i).style.width = coords + delta2 + 'px';
      }
    }

    document.onmousemove = (e) => {
      const newLeft = e.pageX - shiftX - getXCoord(movableLine.parentNode);
      movableLine.style.left = (newLeft > 0)? newLeft + 'px': '0px';
      helpDiv.style.left = (newLeft > 0)? newLeft + 'px': '0px';
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
                          (flag)? padSize1 + 'px 0px' : padSize1 + 'px 2px';
          document.getElementById('Cell_' + currentLet[j] + (i + 1)).style.padding =
                          (flag)? padSize2 + 'px 0px' : padSize2 + 'px 1px';
          document.getElementById(currentLet[j] + (i + 1)).style.height = coords + delta2 + 'px';
      }
    }

    document.onmousemove = (e) => {
      const newTop = e.pageY - shiftY - getYCoord(movableLine.parentNode);
      movableLine.style.top = (newTop > 0)? newTop + 'px': '0px';
      helpDiv.style.top = (newTop > 0)? newTop + 'px': '0px';
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
    newCell.onmousedown = (e) => {
        if (focusID) {
            const oldInput = document.getElementById(focusID);
            const oldCell = document.getElementById('Cell_' + focusID);

            if(!oldInput.data && Number(oldInput.value))
              oldInput.style.textAlign = 'right';
            oldCell.style.outline = '';
        }

        focusID = newInput.id;
        if(!newInput.data)
          newInput.style.textAlign = 'left';
        newCell.style.outline = '3px solid #6bc961'
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

        const new_cell = upTable.rows[0].insertCell(-1);
        new_cell.innerHTML = `<div align = "center" id = "${letter + 0}" class = "up"> ${letter} </div>`;
        new_cell.id = 'Cell_' + letter;

        for (let j = 0; j < ROWS; j++) {

            const cell = mainTable.rows[j].insertCell(-1);
            cell.innerHTML = "<textarea id = '"+ letter + (j + 1) +"' class = 'cell_input_area'/>";
            cell.id = 'Cell_' + letter + (j + 1);
            initCell(currentLet.length - 1, j + 1);

            cell.firstChild.onfocus = function() {
              lastFocusedTextarea = document.activeElement;
            };


            const inp = document.getElementById(letter + (j + 1));
            const preInp = document.getElementById(currentLet[currentLet.length - 2] + (j + 1));
            inp.style.height = preInp.style.height;
            inp.style.padding = preInp.style.padding;
            cell.style.padding = document.getElementById('Cell_' + currentLet[currentLet.length - 2] + (j + 1)).style.padding;
        }

        addExpansion(letter, i);
    }
  } else {

    if (ROWS === 0){
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
            new_cell.innerHTML = "<textarea id = '"+ letter + (i + 1) +"' class = 'cell_input_area'/>";
            new_cell.id = 'Cell_' + letter + (i + 1);
            initCell(j, i + 1);

            //new_cell.firstChild.data = 0;

            new_cell.firstChild.onfocus = function() {
              lastFocusedTextarea = document.activeElement;
              document.getElementById("left-button").style.border = document.getElementById("center-button").style.border = document.getElementById("right-button").style.border = "2px solid #ffffff"
              if(new_cell.firstChild.data){
                //alert(new_cell.data);
                document.getElementById("" + new_cell.firstChild.data + "-button").style.border = "2px solid #6bc961";
              }
            };

            /*
            new_cell.firstChild.onblur = function() {
              //console.log(document.activeElement.id);
              //new_cell.firstChild.data = 0;
            };
            */

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

addCells(DEFAULT_ROWS, DEFAULT_COLS);

mainDiv.onscroll = function() {
  upDiv.scrollLeft = this.scrollLeft;
  leftDiv.scrollTop = this.scrollTop;
  const moreCellsOnY = mainDiv.scrollHeight - mainDiv.clientHeight;
  const moreCellsOnX = mainDiv.scrollWidth - mainDiv.clientWidth;
  const percentY = (mainDiv.scrollTop / moreCellsOnY) * 100;
  const percentX = (mainDiv.scrollLeft / moreCellsOnX) * 100;
  if(percentY > 80){
    addCells(5, 0);
  }
  if (percentX > 80){
    addCells(0, 5);
  }
}


// KHOPO4KU & DESIGH

somePoliticalDirections.forEach( direction => {
  document.getElementById(direction + "-button").addEventListener("click", e => {
     if (lastFocusedTextarea.data != direction){
       document.getElementById(direction + "-button").style.borderRadius = "5px 5px 5px 5px";
       document.getElementById(direction + "-button").style.border = "2px solid #6bc961";
       lastFocusedTextarea.style.textAlign = lastFocusedTextarea.data = direction;
       somePoliticalDirections.forEach( directX => {
         if(directX != direction){
           document.getElementById(directX + "-button").style.border = "2px solid #ffffff"
         }
       });
     } else {
       lastFocusedTextarea.data = '';
       lastFocusedTextarea.style.textAlign = 'left';
       document.getElementById(direction + "-button").style.border = "2px solid #ffffff";
     }

  });
});
