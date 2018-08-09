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
  //newDiv.innerHTML = '';
  newDiv['id'] = letter;
  newDiv['className'] = 'modSymb';
  upTable.rows[0].cells[j].appendChild(newDiv);
  //table.rows[0].cells[j].appendChild(newDiv); //old

  const movableLine = document.getElementById(letter);

  const changeParams = (element) => {
      const oldParams = {
          height: getComputedStyle(element).height,
          backgroundColor: getComputedStyle(element).backgroundColor,
          //color: getComputedStyle(movableLine).color,
          width: getComputedStyle(element).width,
      }

      element.style.height = getComputedStyle(mainTable).height;
      element.style.backgroundColor = '#808080';
      //movableLine.style.color = '#808080';
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
      //document.getElementById('Cell_' + letter).style.width = coords + delta1 + 'px';
      for (let i = 1; i <= ROWS; i++) {
          //document.getElementById(letter + i).style.padding = (document.getElementById('Cell_undefined' + i).isZeroPad)?
          //                                                                                      '0px ' + padSize + 'px' : '2px ' + padSize + 'px';
          document.getElementById(letter + i).style.padding = '2px ' + padSize1 + 'px';
          document.getElementById('Cell_' + letter + i).style.padding = '1px ' + padSize2 + 'px';
          document.getElementById(letter + i).style.width = coords + delta2 + 'px';
      }
    }

    document.onmousemove = (e) => {
      const newLeft = e.pageX - shiftX - getXCoord(movableLine.parentNode);
      movableLine.style.left = (newLeft > 0)? newLeft + 'px': '0px';
      helpDiv.style.left = (newLeft > 0)? newLeft + 'px': '0px'; //new
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
              movableLine.style.cursor = 'col-resize';
            } else {
              movableLine.style.cursor = 'ew-resize';
              goExpansion(0, 0, 0, 0); //check
            }
        } else {
          mainCell.style.padding = '1px 3px';
          mainCell.isZeroPad = false;
          movableLine.style.cursor = 'ew-resize';
          goExpansion(-6, -6, 2, 1); //new
        }
      }

      movableLine.style.height = params.height;
      movableLine.style.width = params.width;
      movableLine.style.backgroundColor = params.backgroundColor;
      //new1!!!1
      helpDiv.style.height = params2.height;
      helpDiv.style.width = params2.width;
      helpDiv.style.backgroundColor = params2.backgroundColor;
      //movableLine.style.color = params.color;
      //mainTable.rows[0].cells[j].removeChild(helpDiv);

      document.onmousemove = document.onmouseup = null;
    }

    return false;
  }

  movableLine.ondragstart = () => false;
}


const addCells = function(rows, cols){

  if (rows === 0) {
    for (let i = COLS + 1; i <= COLS + cols; i++) {

        currentLet.push(String.fromCharCode.apply(null, letters));
        updateLetters(letters.length - 1);
        const letter = currentLet[currentLet.length - 1];

        const new_cell = upTable.rows[0].insertCell(-1);
        new_cell.innerHTML = `<div align = "center" id = "${letter + 0}" class = "up"> ${letter} </div>`;
        new_cell.id = 'Cell_' + letter;//new

        for (let j = 0; j < ROWS; j++) {
            const cell = mainTable.rows[j].insertCell(-1);
            cell.innerHTML = "<input id = '"+ letter + (j + 1) +"'/>";
            cell.id = 'Cell_' + letter + (j + 1);
            if (i && j) {
                document.getElementById(letter + j).style.height = document.getElementById(currentLet[i - 2] + j).style.height;
            }
        }

        addExpansion(letter, i);
    }
  } else {

    if (ROWS === 0){
      const row = upTable.insertRow(-1);
      for (let j = 0; j <= COLS + cols; j++) {
          //if (j >= currentLet.length) {//chng
              currentLet.push(String.fromCharCode.apply(null, letters));
              updateLetters(letters.length - 1);
          //}

          //const letter = (currentLet.length === 0)? '' : currentLet[j - 1];
          const letter = currentLet[j];
          //if (letter === '') continue;
          const new_cell = row.insertCell(-1);
          new_cell.innerHTML = `<div align = "center" id = "${letter + 0}" class = "up"> ${letter} </div>`;
          new_cell.id = 'Cell_' + letter;
          addExpansion(letter, j); //control_them!11!
  /*
              if (!i && j) {
                  addExpansion(letter, j);
              } else if ((i && j) && (i >= DEFAULT_ROWS)) {
                  document.getElementById(letter + i).style.width = document.getElementById(letter + (i - 1)).style.width;
              } else if (i && !j) {
                  addVerticalExpansion(i);
              }
              */
        }
      }

        for (let i = ROWS; i < ROWS + rows; i++) {
          const row = mainTable.insertRow(-1);
          const leftRow = leftTable.insertRow(-1);

          leftRow.insertCell(-1).innerHTML = `<div align = "center"> ${i+1} </div>`;

          for (let j = 0; j <= COLS + cols; j++) {
            if (j > currentLet.length) {
              currentLet.push(String.fromCharCode.apply(null, letters));
              updateLetters(letters.length - 1);
            }

            //const letter = (currentLet.length === 0)? '' : currentLet[j - 1];
            const letter = currentLet[j];
            //if (letter === '') continue;
            const new_cell = row.insertCell(-1);
            new_cell.innerHTML = "<input id = '"+ letter + (i + 1) +"'/>";
            new_cell.id = 'Cell_' + letter + (i + 1);
            if (i >= DEFAULT_ROWS) {
                const inp = document.getElementById(letter + (i + 1));
                const preInp = document.getElementById(letter + i);
                inp.style.width = preInp.style.width;
                inp.style.padding = preInp.style.padding;
                new_cell.style.padding = document.getElementById('Cell_' + letter + i).style.padding;
                //document.getElementById(letter + (i + 1)).style.width = document.getElementById(letter + i).style.width;
            }
    /*
                if (!i && j) {
                    addExpansion(letter, j);
                } else if ((i && j) && (i >= DEFAULT_ROWS)) {
                    document.getElementById(letter + i).style.width = document.getElementById(letter + (i - 1)).style.width;
                } else if (i && !j) {
                    addVerticalExpansion(i);
                }
                */
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
