'use strict';

//codes of errors
const OK = 0;

//syntax errors 1**
const WRONG_SYNTAX = 100;
const WRONG_SYMBOL = 101;
const BAD_NUMBER = 102;
const UNKNOWN_IDENTIFIER = 103;
const EXPECTED_OPERATOR = 104;
const EXPECTED_IDENTIFIER = 105;
const EXPECTED_EXACT = 106;

//formula args errors 2**
const ARG_ERROR = 200;
const DIV_BY_ZERO = 201;
const UNDEFINED_ARG = 202;

//service errors 3**
const SERVICE_ERR = 300;
const UNDEFINED = 301;
const NAN = 302;
const NOT_A_FORMULA = 303;

//dependency errors 4**
const DEPEND_ERR = 400;
const CIRC_DEPEND_ERR = 401;

//colour consts)))
const WHITE = 0;
const GREY = 1;
const BLACK = 2;

class Stack {
    constructor() {
        this.stack = new Array();
    }

    isEmpty() {
        return this.stack.length === 0;
    }

    push(x) {
        this.stack.push(x);
    }

    pop() {
        if (this.isEmpty()) throw 'stack undeflow'
        return this.stack.pop();
    }

    top() {
        if (this.isEmpty()) throw 'stack undeflow'
        return this.stack[this.stack.length - 1];
    }

    clear() {
        this.stack.length = 0;
    }
}


class FormulaError {
    constructor(error, msg, char_pos = -1, prev = null) {
        this.error = error;
        this.msg = msg;
        this.char_pos = char_pos;
        this.prev = prev;
    }

    getTrace() {
        let trace = "";
        for (let cur = this; cur != null; cur = cur.prev) {
            trace += this.error + " " + this.msg + "\n";
        }
        return trace;
    }
}

class Ceil {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.realText = '';
        this.toDisplay = '';
        this.error = null;
        this.colour = WHITE;
        this.dependencies = new Set();
        this.receivers = new Set();
        this.func = null;
        console.log("created ceil")
    }

    toString() {
        return this.toDisplay + ' \\' + this.realText + "\\"
    }

    get() {
        if (this.error != null) {
            throw this.error;
        } else {
            return this.toDisplay;
        }
    }

}



const coordFromLetters = (str) => {
    str = str.toUpperCase();
    let res = 0;
    let mul = 1;
    for(let i = str.length - 1; i >= 0; i--){
        res += mul * (str.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        mul *= 26;
    }
    
    return res - 1;
}

const isAlphabetic = (str) => {
    return ('A'.charCodeAt(0) <= str.charCodeAt(0) && str.charCodeAt(0) <= 'Z'.charCodeAt(0) ||
        'a'.charCodeAt(0) <= str.charCodeAt(0) && str.charCodeAt(0) <= 'z'.charCodeAt(0));
}

const isNumeric = (str) => {
    return ('0'.charCodeAt(0) <= str.charCodeAt(0) && str.charCodeAt(0) <= '9'.charCodeAt(0));
}

const isSpecial = (str) => {
    return ((str === '(') || (str === ')') ||
        (str === '+') || (str === '-') ||
        (str === '*') || (str === '/') ||
        (str === ';'));
}

const isSpaceChar = (str) => {
    return (str.trim() === '');
}

const convCoord = (str) => {
    str = str.toUpperCase();
    let beg = 0;
    if (str[0] === "$") beg = 1;
    let end = beg;
    for (; end < str.length && isAlphabetic(str[end]); end++);
    if (beg === end) {
        throw "not a ceil";
    }
    let first = Number(coordFromLetters(str.substring(beg, end)));


    beg = end;
    if (str[beg] === "$") beg++;
    for (end = beg; end < str.length && isNumeric(str[end]); end++);
    if (beg === end || end != str.length || str[beg] === "0") {
        throw "not a ceil";
    }
    let second = Number(str.substring(beg, end)) - 1;


    return { x: first, y: second };
}

class Table {

    constructor(x, y) {
        this.field = new Array(x)
        for (let i = 0; i < x; i++) {
            this.field[i] = new Array(y)
            for (let j = 0; j < y; j++) {
                this.field[i][j] = new Ceil(i, j);
            }
        }
        console.log('ALL CREATED');
        this.toUpdate = new Stack();
    }

    createCeilIfNeed(x, y) {
        console.log('CREATE ' + x + ' ' + y);
        if (this.field[x] == undefined) {
            this.field[x] = new Array(y + 1);
        }
        if (this.field[x][y] == undefined) {
            this.field[x][y] = new Ceil(x, y);
        }
    }

    setCeil(x, y, text) {
        this.createCeilIfNeed(x, y)
        if (text === this.field[x][y].realText) {
            return;
        }

        this.field[x][y].realText = text;
        if (text[0] !== '=') {
            this.field[x][y].toDisplay = text;
            this.field[x][y].error = null;
            this.field[x][y].func = null;
        } else {
            ceilInsert(this, this.field[x][y], text.substring(1, text.length));
        }
        this.toUpdate.push(this.field[x][y]);
    }

    getInnerCeil(x, y) {
        this.createCeilIfNeed(x, y);
        return this.field[x][y];
    }

    getCeil(x, y) {
        this.createCeilIfNeed(x, y)
        return { realText: this.field[x][y].realText, toDisplay: this.field[x][y].toDisplay, error: this.field[x][y].error }
    }

    collectData() {
        let data = {size: [ROWS, COLS]};
        for (let i = 0; i < this.field.length; i++){
            if (this.field[i]) { //Надо ли?
                for (let j = 0; j < this.field[i].length; j++) {
                    if (this.field[i][j].realText) {
                        //сохраняем координаты, а не индекс, потому что загружаться надо будет один раз за сеанс,
                        //а сохранятся много, и время конвертации было бы велико.
                        data[[j, i]] = this.field[i][j].realText;
                    }
                }
            }
        }
    
        return data;//на что-нибудь уникальное
    }

    update() {
        let rightOrderedUPD = new Stack();
        let depth_stack = new Stack();
        let usage_array = new Array();
        while (!this.toUpdate.isEmpty()) {
            if (this.toUpdate.top().colour !== WHITE) {
                this.toUpdate.pop();
                continue;
            }
            depth_stack.push(this.toUpdate.top());
            usage_array.push(this.toUpdate.top());
            this.toUpdate.top().colour = GREY;
            this.toUpdate.pop();

            while (!depth_stack.isEmpty()) {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TRACKING UPDATE")
                if (depth_stack.top().colour === BLACK) {
                    depth_stack.top().colour = BLACK;
                    rightOrderedUPD.push(depth_stack.pop());
                } else {
                    depth_stack.top().colour = BLACK;
                    depth_stack.top().receivers.forEach(ceil => {
                        if (ceil.colour === WHITE) {
                            depth_stack.push(ceil);
                            usage_array.push(ceil);
                            ceil.colour = GREY;
                        }
                    })
                }
            }

        }

        usage_array.forEach(x => {
            x.colour = WHITE;
        })

        let res = new Array();

        while (!rightOrderedUPD.isEmpty()) {
            let curCeil = rightOrderedUPD.pop();
            if (curCeil.func != null && (curCeil.error === null || curCeil.error.prev !== null)) {
                try {
                    curCeil.error = null;
                    curCeil.toDisplay = String(curCeil.func());
                } catch (e) {
                    curCeil.error = new FormulaError(
                        ARG_ERROR,
                        'some error in args',
                        -1,
                        e);
                    curCeil.toDisplay = curCeil.error.msg;
                }
            } else if (curCeil.error !== null) {
                curCeil.toDisplay = curCeil.error.msg;
            }

            res.push({ x: curCeil.x, y: curCeil.y });
        }
        console.log(res);
        return res;
    }


}



const POSSIBLE_FUNCTIONS = new Set(["SUM", "MUL", "ABS"]);

function OPERATOR(first, oper, second) {//TODO: bigNums
    if (oper === undefined && second === undefined) {
        return first;
    }

    if (isNaN(first)) {
        throw new FormulaError(
            NAN,
            first + ' is not a number'
        )
    }
    if (isNaN(second)) {
        throw new FormulaError(
            NAN,
            second + ' is not a number'
        )
    }
    switch (oper) {
        case '+':
            return -(- first - second);
        case '-':
            return + first - second;
        case '*':
            return + first * second;
        case '/':
            if (second == 0) {
                throw new FormulaError(
                    DIV_BY_ZERO,
                    second + " equals zero",
                );
            }
            return + first / second;
    }
}

function SUM(...args) {
    let sum = 0;
    for (let i = 0; i < args.length; i++) {
        sum = OPERATOR(sum, '+', args[i]);
    }
    return sum;
}

const isCircDepend = (startCeil) => {
    let depth_stack = new Stack();
    let usage_array = new Array();
    let hasDependency = false;

    depth_stack.push(startCeil);
    usage_array.push(startCeil);
    startCeil.colour = GREY;

    while (!depth_stack.isEmpty()) {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TRACKING CIRCULAR")
        if (depth_stack.top().colour === BLACK) {
            depth_stack.pop();
        } else {
            depth_stack.top().colour = BLACK;
            if (depth_stack.top().receivers.has(startCeil)) {
                hasDependency = true;
                break;
            }
            depth_stack.top().receivers.forEach(ceil => {
                if (ceil.colour === WHITE) {
                    depth_stack.push(ceil);
                    usage_array.push(ceil);
                    ceil.colour = GREY;
                }
            })
        }
    }

    usage_array.forEach(x => {
        x.colour = WHITE;
    })

    return hasDependency;

}

const ceilInsert = (table, ceil, text) => {
    console.log('ceilInsert')
    ceil.dependencies.forEach(x => x.receivers.delete(ceil));
    ceil.dependencies.clear();
    ceil.error = null;
    let func;
    try {
        let tokens = tokenize(text);
        func = parseAndCreate(table, ceil, tokens);
    } catch (e) {
        ceil.dependencies.forEach(x => x.receivers.delete(ceil));
        ceil.dependencies.clear();
        ceil.error = e;
        return;
    }
    ceil.func = func;
    if (isCircDepend(ceil)) {
        ceil.dependencies.forEach(x => x.receivers.delete(ceil));
        ceil.dependencies.clear();
        ceil.error = new FormulaError(
            CIRC_DEPEND_ERR,
            'circular dependency detected',
            -2,
        )
        ceil.func = null;
    }
}

const tokenize = (formula) => {
    formula = formula.toUpperCase();
    let tokens = new Array();
    let positions = new Array();
    let ptL = 0;
    while (ptL < formula.length) {
        if (isSpaceChar(formula[ptL])) {
            ptL++;
        } else if (isSpecial(formula[ptL])) {
            tokens.push(formula[ptL]);
            positions.push(ptL);
            ptL++;
        } else if (isNumeric(formula[ptL])) {
            positions.push(ptL);
            let beg = ptL;
            let temp = '';
            while (ptL < formula.length && (isNumeric(formula[ptL]) || formula[ptL] == '.')) {
                temp += formula[ptL];
                ptL++;
            }

            if (isNaN(temp)) {
                throw new FormulaError(
                    BAD_NUMBER,
                    "bad number: " + temp,
                    beg,
                )
            }
            tokens.push(temp);
        } else if (isAlphabetic(formula[ptL]) || formula[ptL] == '$') {
            positions.push(ptL);
            let beg = ptL;
            let temp = '';
            while (ptL < formula.length && (isAlphabetic(formula[ptL]) || isNumeric(formula[ptL]) || formula[ptL] == '$')) {
                temp += formula[ptL];
                ptL++;
            }
            if (!POSSIBLE_FUNCTIONS.has(temp))
                try {
                    convCoord(temp);
                } catch (e) {
                    throw new FormulaError(
                        UNKNOWN_IDENTIFIER,
                        "bad identifier: " + temp,
                        beg,
                    )
                }
            tokens.push(temp);
        } else {
            console.log("kek lol kek lol")
            throw new FormulaError(
                WRONG_SYMBOL,
                "wrong symb: " + formula[ptL],
                ptL
            );
        }
    }

    console.log("ALL OK");
    return new Tokens(tokens, positions);

}

class Tokens {
    constructor(tokens, positions) {
        this.tokens = tokens;
        this.positions = positions;
        this.cur = 0;
    }

    isEmpty() {
        return this.cur === this.tokens.length;
    }

    next() {
        if (this.isEmpty()) {
            throw new FormulaError(
                WRONG_SYNTAX,
                'cant parse',
            );
        }
        this.cur++;
        return { token: this.tokens[this.cur - 1], pos: this.positions[this.cur - 1] }
    }

    peek() {
        if (this.isEmpty()) {
            throw new FormulaError(
                WRONG_SYNTAX,
                'cant parse',
            );
        }
        return { token: this.tokens[this.cur], pos: this.positions[this.cur] }
    }

    clear() {
        this.cur = 0;
    }
}

//<E>  ::= <T> <E’>. 
//<E’> ::= + <T> <E’> | - <T> <E’> | . 
//<T>  ::= <F> <T’>. 
//<T’> ::= * <F> <T’> | / <F> <T’> | . 
//<F>  ::= <number> | <ceil> | ( <E> ) | - <F> | + <F> |  <func> ( <B> ).
//<B>  ::= <E> ; <B> | <E> | .

const mustBe = (tokens, token) => {
    console.log("MUSTBE " + "empty: " + tokens.isEmpty())
    if (tokens.isEmpty()) {
        throw new FormulaError(
            EXPECTED_EXACT,
            'expected exact ' + token + ', but found nothing',
            -2
        );
    }
    if (tokens.peek().token != token) {
        throw new FormulaError(
            EXPECTED_EXACT,
            'expected exact ' + token + ', found: ' + tokens.peek().token,
            tokens.peek().pos
        );
    } else {
        tokens.next();
    }
}

const parseAndCreate = (table, ceil, tokens) => {
    console.log('parseAndCreate')
    let func = parseAddBeg(table, ceil, tokens);
    func = '(table) => { return (() => (' + func + '))}'; //"(d) => {return (() => pow2(d.x))}"
    console.log(func)

    return eval(func)(table);
}

const parseAddBeg = (table, ceil, tokens) => {
    console.log('parseAddBeg');
    return parseAddEnd(table, ceil, tokens, parseMulBeg(table, ceil, tokens));
}

const parseAddEnd = (table, ceil, tokens, funcStr) => {
    console.log('parseAddEnd' + ' ' + funcStr)
    if (!tokens.isEmpty()) {
        if (tokens.peek().token === '+' || tokens.peek().token === '-') {
            funcStr = 'OPERATOR(' + funcStr + ', \'' + tokens.next().token + '\', ';
            funcStr += parseMulBeg(table, ceil, tokens) + ')';
            return parseAddEnd(table, ceil, tokens, funcStr);
        } else if (tokens.peek().token === ')' || tokens.peek().token === ';') {
            return funcStr;
        }
    } else {
        return funcStr;
    }

    throw new FormulaError(
        EXPECTED_OPERATOR,
        "expected operator, found: " + tokens.peek().token,
        tokens.peek().pos
    );



}

const parseMulBeg = (table, ceil, tokens) => {
    console.log('parseMulBeg')
    return parseMulEnd(table, ceil, tokens, parseElem(table, ceil, tokens));
}

const parseMulEnd = (table, ceil, tokens, funcStr) => {
    console.log('parseMulEnd' + ' ' + funcStr)
    if (!tokens.isEmpty()) {
        if (tokens.peek().token === '*' || tokens.peek().token === '/') {
            funcStr = 'OPERATOR(' + funcStr + ', \'' + tokens.next().token + '\', ';
            funcStr += parseElem(table, ceil, tokens) + ')';
            return parseMulEnd(table, ceil, tokens, funcStr);
        } else if (tokens.peek().token === ')' || tokens.peek().token === ';') {
            return funcStr;
        }
        return funcStr;
    } else {

        return funcStr;
    }


}

const parseElem = (table, ceil, tokens) => {
    console.log('parseElem' + ' ')
    let funcStr = '';
    if (!tokens.isEmpty()) {
        if (isNumeric(tokens.peek().token[0])) {
            console.log("OK : " + tokens.peek().token)
            return tokens.next().token;
        } else if (isAlphabetic(tokens.peek().token[0]) || tokens.peek().token[0] == '$') {
            if (POSSIBLE_FUNCTIONS.has(tokens.peek().token)) {
                funcStr += ' ' + tokens.next().token + '(';
                mustBe(tokens, '(')
                funcStr += parseArgs(table, ceil, tokens) + ')';
                mustBe(tokens, ')')
                return funcStr;
            }
            let x, y;
            try {
                let coord = convCoord(tokens.peek().token);
                x = coord.x;
                y = coord.y;
            } catch (e) {
                console.log(e)
                throw new FormulaError(
                    EXPECTED_IDENTIFIER,
                    "expected identifier, found: " + tokens.peek().token,
                    tokens.peek().pos
                );
            }

            ceil.dependencies.add(table.getInnerCeil(x, y));
            table.getInnerCeil(x, y).receivers.add(ceil);
            tokens.next();
            return funcStr + 'table.getInnerCeil(' + x + ',' + y + ').get()';

        } else if (tokens.peek().token === '(') {
            tokens.next();
            funcStr = '(' + parseAddBeg(table, ceil, tokens, funcStr) + ')';
            mustBe(tokens, ')');
            return funcStr;
        } else if (tokens.peek().token === '-' || tokens.peek().token === '+') {
            funcStr = tokens.next().token + parseElem(table, ceil, tokens, funcStr);
            return funcStr;
        }
    }

    throw new FormulaError(
        EXPECTED_IDENTIFIER,
        "expected identifier, found: " + tokens.peek().token,
        tokens.peek().pos
    );
}

const parseArgs = (table, ceil, tokens) => {
    console.log('parseArgs')
    let funcStr = '';
    if (tokens.peek().token === ')') {
        return funcStr;
    }
    while (!tokens.isEmpty()) {
        funcStr += parseAddBeg(table, ceil, tokens);
        if (tokens.peek().token === ')') {
            return funcStr;
        }
        funcStr += ', '
        mustBe(tokens, ';');
    }

    throw new FormulaError(
        EXPECTED_IDENTIFIER,
        "expected identifier, found: nothing",
        -1
    );

}


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

const innerTable = new Table(DEFAULT_COLS, DEFAULT_ROWS);

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
        //global_shit
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
        //end_shit
        let coords = 'no move';

        const goExpansion = (delta1, delta2, padSize) => {
            document.getElementById(letter + '0').style.width = coords + delta1 + 'px';
            for (let i = 1; i < ROWS; i++) {
                //document.getElementById(letter + i).style.padding = (document.getElementById('Cell_undefined' + i).isZeroPad)?
                //                                                                                      '0px ' + padSize + 'px' : '2px ' + padSize + 'px';
                document.getElementById(letter + i).style.padding = '2px ' + padSize + 'px';
                document.getElementById(letter + i).style.width = coords + delta2 + 'px';
            }
        }

        document.onmousemove = (e) => {
            const newLeft = e.pageX - shiftX - getXCoord(movableLine.parentNode);
            movableLine.style.left = (newLeft > 0) ? newLeft + 'px' : '0px';
            helpDiv.style.left = (newLeft > 0) ? newLeft + 'px' : '0px'; //new
            coords = newLeft;
        }

        document.onmouseup = () => {
            if (coords != 'no move') {
                const mainCell = document.getElementById('Cell_' + letter);
                if (coords < 6) {
                    mainCell.style.padding = '0px';
                    mainCell.isZeroPad = true;
                    if (coords < 3) {
                        goExpansion(-coords, -coords, 0);
                        movableLine.style.left = '-1px';
                        movableLine.style.cursor = 'col-resize';
                    } else {
                        movableLine.style.cursor = 'ew-resize';
                        goExpansion(0, 1, 0);
                    }
                } else {
                    mainCell.style.padding = '1px 3px';
                    mainCell.isZeroPad = false;
                    movableLine.style.cursor = 'ew-resize';
                    goExpansion(-6, -6, 2); //new
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


const addCells = (rows, cols) => {
    if (rows === 0) {
        for (let i = COLS + 1; i <= COLS + cols; i++) {

            currentLet.push(String.fromCharCode.apply(null, letters));
            updateLetters(letters.length - 1);
            const letter = currentLet[currentLet.length - 1];

            const new_cell = upTable.rows[0].insertCell(-1);
            new_cell.innerHTML = `<div align = "center" id = "${letter + 0}"> ${letter} </div>`;
            new_cell.id = 'Cell_' + letter;//new

            for (let j = 0; j < ROWS; j++) {
                mainTable.rows[j].insertCell(-1).innerHTML = "<input id = '" + letter + (j + 1) + "'/>";
                let curCell = document.getElementById(letter + (j + 1));
                curCell.addEventListener("keydown", function (elem) {
                    return (event) => {
                        console.log(curCell.id, 'code=', event.code, 'key=', event.key);
                        if(event.key == 'Enter'){
                            elem.blur();
                        }
                        if(event.key == 'Escape'){
                            console.log(elem.value);
                            elem.value = '';
                        }
                    }
                }(curCell))
                curCell.onfocus = function (elem) {
                    return () => {
                        console.log('onfocus')
                        let coord = convCoord(elem.id)
                        elem.value = innerTable.getCeil(coord.x, coord.y).realText;
                    };
                }(curCell);
                curCell.onblur = function (elem) {
                    return () => {
                        console.log('onblur')
                        let coord = convCoord(elem.id);
                        innerTable.setCeil(coord.x, coord.y, elem.value);
                        updateTables();
                        elem.value = innerTable.getCeil(coord.x, coord.y).toDisplay;
                    };
                }(curCell);
                if (i && j) {
                    document.getElementById(letter + j).style.height = document.getElementById(currentLet[i - 2] + j).style.height;
                }
            }

            //addExpansion(letter, i);
        }
    } else {

        if (ROWS === 0) {
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
                new_cell.innerHTML = `<div align = "center" id = "${letter + 0}"> ${letter} </div>`;
                new_cell.id = 'Cell_' + letter;
                //addExpansion(letter, j); //control_them!11!
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

            leftRow.insertCell(-1).innerHTML = `<div align = "center"> ${i + 1} </div>`;

            for (let j = 0; j <= COLS + cols; j++) {
                if (j > currentLet.length) {
                    currentLet.push(String.fromCharCode.apply(null, letters));
                    updateLetters(letters.length - 1);
                }

                //const letter = (currentLet.length === 0)? '' : currentLet[j - 1];
                const letter = currentLet[j];
                //if (letter === '') continue;
                row.insertCell(-1).innerHTML = "<input id = '" + letter + (i + 1) + "'/>";
                let curCell = document.getElementById(letter + (i + 1));
                curCell.addEventListener("keydown", function (elem) {
                    return (event) => {
                        console.log(curCell.id, 'code=', event.code, 'key=', event.key);
                        if(event.key == 'Enter'){
                            elem.blur();
                        }
                        if(event.key == 'Escape'){
                            console.log(elem.value);
                            elem.value = '';
                        }
                    }
                }(curCell))
                curCell.onfocus = function (elem) {
                    return () => {
                        console.log('onfocus');
                        let coord = convCoord(elem.id)
                        elem.value = innerTable.getCeil(coord.x, coord.y).realText;
                    };
                }(curCell);
                curCell.onblur = function (elem) {
                    return () => {
                        console.log('onblur');
                        let coord = convCoord(elem.id);
                        innerTable.setCeil(coord.x, coord.y, elem.value);
                        updateTables();
                        elem.value = innerTable.getCeil(coord.x, coord.y).toDisplay;
                    };
                }(curCell);
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
        document.getElementById(convNumtoId(ceil.x, ceil.y)).value = innerTable.getCeil(ceil.x, ceil.y).toDisplay;
    }
}

const loadTable = (token) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://' + config.host_save + ':' + config.port_save + '/load');
    xhr.send('session='+token);
    xhr.onload = () => {
        let data = null;
        try {
            data = JSON.parse(xhr.responseText);
        } catch {
            addCells(DEFAULT_ROWS, DEFAULT_COLS);
            return;
        }

        if (data.error) {
            console.log(data.error);
            addCells(DEFAULT_ROWS, DEFAULT_COLS);
            return;
        }

        const tableData = JSON.parse(data.data);
        addCells(tableData['size'][0], tableData['size'][1]);
        delete tableData['size'];

        for (let coordStr in tableData) {
            const coord = coordStr.split(',');
            innerTable.setCeil(coord[1], coord[0], arr2str(tableData[coord]));
        }

        updateTables();
    }
}


const cookie = parseCookies(document.cookie);
//Сохраняем перед закрытием
window.onbeforeunload = () => {
    navigator.sendBeacon('http://' + config.host_save + ':' + config.port_save + '/save', 'session='+cookie['token'] +
     '&data='+JSON.stringify(prepareText(innerTable.collectData())));
    //ajax_save({session: parseCookies(document.cookie)['token'], data: JSON.stringify(prepareText(innerTable.collectData()))});
}

if (cookie['token']) {
    loadTable(cookie['token']);
} else {
    addCells(DEFAULT_ROWS, DEFAULT_COLS);
}