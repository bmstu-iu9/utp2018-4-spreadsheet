'use strict';
const tableDiv = document.getElementById('table-div');

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
  let newDiv = document.createElement('div');
  newDiv.innerHTML = '|';
  newDiv['id'] = letter;
  newDiv['className'] = 'modSymb';
  table.rows[0].cells[j].appendChild(newDiv);

  const movableLine = document.getElementById(letter);

  movableLine.onmousedown = (e) => {
    const shiftX = e.pageX - getXCoord(movableLine);

    document.onmousemove = (e) => {
      const newLeft = e.pageX - shiftX - getXCoord(movableLine.parentNode);

      if (newLeft - 2.75 < 100) {
        newLeft = movableLine.style.left;
      }

      movableLine.style.left = newLeft + 'px';
      for (let i = 1; i < ROWS; i++) {
          document.getElementById(letter + i).style.width = newLeft - 2.75 + 'px';
      }
    }

    document.onmouseup = () => document.onmousemove = document.onmouseup = null;

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

  movableLine.onmousedown = (e) => {
    const shiftY = e.pageY - getYCoord(movableLine);

    document.onmousemove = (e) => {
      const newTop = e.pageY - shiftY - getYCoord(movableLine.parentNode);

      if (newTop - 2.75 < 18) {
        newTop = movableLine.style.top;
      }

      movableLine.style.top = newTop + 'px';
      for (let j = 1; j <= COLS; j++) {
          document.getElementById(currentLet[j - 1] + i).style.height = newTop - 2.75 + 'px';
      }
    }

    document.onmouseup = () => document.onmousemove = document.onmouseup = null;

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

        for (let j = 0; j < ROWS; j++) {
            table.rows[j].insertCell(-1).innerHTML = i && j ? "<input id = '"+ letter + j +"'/>" : `<div align = "center"> ${letter} </div>`;
            if (i && j) {
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
            row.insertCell(-1).innerHTML = i && j ? "<input id = '"+ letter + i +"'/>" : i || j ? `<div align = "center"> ${i||letter} </div>`: "";
            
            if (!i && j) {
                addExpansion(letter, j);
            } else if ((i && j) && (i >= DEFAULT_ROWS)) {
                document.getElementById(letter + i).style.width = document.getElementById(letter + (i - 1)).style.width;
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
