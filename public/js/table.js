'use strict';

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

const addCells = function(rows, cols){
  if (rows === 0) {
    for (let i = COLS + 1; i <= COLS + 1 + cols; i++) {

        currentLet.push(String.fromCharCode.apply(null, letters));
        updateLetters(letters.length - 1);
        const letter = currentLet[currentLet.length - 1];

        for (let j = 0; j <= ROWS; j++) {
            table.rows[j].insertCell(-1).innerHTML = i && j ? "<input id = '"+ letter + j +"'/>" : `<div align = "center"> ${letter} </div>`;
        }

    }
  } else {
    for (let i = ROWS; i <= ROWS + rows; i++) { //'<=' так как +1 строка для индексов

        const row = document.getElementById('table').insertRow(-1);

        for (let j = 0; j <= COLS + cols; j++) {

            if (j > currentLet.length) {
                currentLet.push(String.fromCharCode.apply(null, letters));
                updateLetters(letters.length - 1);
            }
            const letter = (currentLet.length ===0)? '' : currentLet[currentLet.length - 1];
            row.insertCell(-1).innerHTML = i && j ? "<input id = '"+ letter + i +"'/>" : i || j ? `<div align = "center"> ${i||letter} </div>`: "";
        }
    }
  }
  ROWS += rows;
  COLS += cols;
}

addCells(DEFAULT_ROWS, DEFAULT_COLS);

window.onscroll = function() {
  const moreCellsOnY = document.body.scrollHeight - innerHeight, moreCellsOnX = document.body.scrollWidth - innerWidth;
  const percentY = (pageYOffset / moreCellsOnY) * 100, percentX = (pageXOffset / moreCellsOnY) * 100;
  if(percentY > 80){
    addCells(5, 0);
  }
  if (percentX > 95){
    addCells(0, 1);
  }
}
