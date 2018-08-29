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
const EXPECTED_CELL = 107;

//formula args errors 2**
const ARG_ERROR = 200;
const DIV_BY_ZERO = 201;
const UNDEFINED_ARG = 202;
const WRONG_ARGS_AMOUNT = 203;

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


class ActionStack {
    constructor(cap) {
        this.stack = new Array(cap + 1);
        this.curPos = 0;
        this.lastPush = 0;
        this.lim = 0;
    }

    do(x) {
        //console.log('do', 'curPos:', this.curPos, 'lastPush:', this.lastPush, 'lim', this.lim);
        this.stack[this.curPos] = x;
        this.curPos = (this.curPos + 1) % this.stack.length;
        this.lastPush = this.curPos;
        if (this.lim === this.curPos) {
            this.lim = (this.lim + 1) % this.stack.length;
        }
    }

    undo() {
        //console.log('undo', 'curPos:', this.curPos, 'lastPush:', this.lastPush, 'lim', this.lim);
        if (this.curPos === this.lim) {
            return false;
        } else {
            this.curPos = (this.curPos + this.stack.length - 1) % this.stack.length;
            return this.stack[this.curPos];
        }
    }

    redo() {
        //console.log('redo', 'curPos:', this.curPos, 'lastPush:', this.lastPush, 'lim', this.lim);
        if (this.curPos === this.lastPush) {
            return false;
        } else {
            let res = this.stack[this.curPos]
            this.curPos = (this.curPos + 1) % this.stack.length;
            return res;
        }
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
        //console.log("created ceil")
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
    for (let i = str.length - 1; i >= 0; i--) {
        res += mul * (str.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        mul *= 26;
    }

    return res - 1;
}

const isAlphabetic = (str) => {
    return str !== undefined && ('A'.charCodeAt(0) <= str.charCodeAt(0) && str.charCodeAt(0) <= 'Z'.charCodeAt(0) ||
        'a'.charCodeAt(0) <= str.charCodeAt(0) && str.charCodeAt(0) <= 'z'.charCodeAt(0)
    );
}

const isNumeric = (str) => {
    return str !== undefined && ('0'.charCodeAt(0) <= str.charCodeAt(0) && str.charCodeAt(0) <= '9'.charCodeAt(0));
}

const isSpecial = (str) => {
    return ((str === '(') || (str === ')') ||
        (str === '+') || (str === '-') ||
        (str === '*') || (str === '/') ||
        (str === ';') || (str === ':'));
}

const isSpaceChar = (str) => {
    return (str.trim() === '');
}

const convCoord = (str) => {
    //console.log(str)
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


    return {
        x: first,
        y: second
    };
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

function transform(str) {
    try {
        str = str.toUpperCase();
        let res = '${';
        let coord = convCoord(str);
        if (str[0] == '$') {
            res += "'$" + colName(coord.x) + "'";
        } else {
            res += 'colName(' + coord.x + ' + delta_x)'
        }
        res += ' + '
        if (str.includes('$') && str.lastIndexOf('$') !== 0) {
            //console.log(res.includes('$'), str.lastIndexOf('$') !== 0)
            res += "'$' + " + (coord.y + 1);
        } else {
            res += '(' + (coord.y + 1) + ' + delta_y) '
        }
        return res + '}';
    } catch (e) {
        return str;
    }
}

function build(str, x, y) {

    if (str === '' || str[0] !== '=') {
        return (x, y) => str;
    } else {
        let formula = `(x, y) =>{
                        const delta_x = x - ${x};
                        const delta_y = y - ${y};
                        return \``
        let pt = 0;
        let old_pt = 0;
        while (pt < str.length) {
            old_pt = pt;
            while (pt < str.length && (isAlphabetic(str[pt]) || isNumeric(str[pt]) || str[pt] == '$')) {
                pt++;
            }

            formula += transform(str.substring(pt, old_pt));

            old_pt = pt;
            while (pt < str.length && !(isAlphabetic(str[pt]) || isNumeric(str[pt]) || str[pt] == '$')) {
                pt++;
            }

            formula += str.substring(pt, old_pt);
        }
        formula += '`;}'
        //console.log(formula);
        return eval(formula);
    }
}

class Table {

    constructor(x, y, action_memo = 50) {
        this.activeCeils = {};
        this.field = new Array(x)
        for (let i = 0; i < x; i++) {
            this.field[i] = new Array(y)
            for (let j = 0; j < y; j++) {
                this.field[i][j] = new Ceil(i, j);
            }
        }
        //console.log('ALL CREATED');
        this.toUpdate = new Stack();
        this.actions = new ActionStack(action_memo);
        this.copied = null;
    }

    createCeilIfNeed(x, y) {
        if (this.field[x] == undefined) {
            this.field[x] = new Array(y + 1);
        }
        if (this.field[x][y] == undefined) {
            this.field[x][y] = new Ceil(x, y);
        }
    }

    setCeil(x, y, text, undo_or_redo = false) {
        this.createCeilIfNeed(x, y)
        if (text === this.field[x][y].realText) {
            return;
        }

        if (!undo_or_redo)
            this.actions.do({
                x: x,
                y: y,
                newText: text,
                oldText: this.field[x][y].realText
            });

        this.field[x][y].realText = text;
        if (this.field[x][y].realText) { //Обновляем в активных
            this.activeCeils[[x, y]] = str2arr(this.field[x][y].realText);
        } else {
            delete this.activeCeils[[x, y]];
        }

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
        return {
            realText: this.field[x][y].realText,
            toDisplay: this.field[x][y].toDisplay,
            error: this.field[x][y].error
        }
    }

    update() {
        //console.log(this.field[0][0].receivers)
        //console.log(this.field[0][1].receivers)
        //console.log(this.field[1][1].receivers)
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
            this.toUpdate.pop();

            while (!depth_stack.isEmpty()) {
                //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TRACKING UPDATE")
                if (depth_stack.top().colour === WHITE) {
                    depth_stack.top().colour = GREY;
                    //console.log(depth_stack.top().x, depth_stack.top().y, 'not popped');
                    depth_stack.top().receivers.forEach(ceil => {
                        //console.log(ceil.x, ceil.y, 'watching', ceil.colour);
                        if (ceil.colour === WHITE) {
                            depth_stack.push(ceil);
                            usage_array.push(ceil);
                        }
                    })
                } else {
                    //console.log(depth_stack.top().x, depth_stack.top().y, 'popped');
                    depth_stack.top().colour = BLACK;
                    rightOrderedUPD.push(depth_stack.pop());
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
                        'some error in args', -1,
                        e);
                    curCeil.toDisplay = curCeil.error.msg;
                }
            } else if (curCeil.error !== null) {
                curCeil.toDisplay = curCeil.error.msg;
            }

            res.push({
                x: curCeil.x,
                y: curCeil.y
            });
        }
        //console.log('res:', res);
        return res;
    }

    undo() {
        let change = this.actions.undo();
        if (change) {
            this.setCeil(change.x, change.y, change.oldText, true);
        }
        return change;
    }

    redo() {
        let change = this.actions.redo();
        if (change) {
            this.setCeil(change.x, change.y, change.newText, true);
        }
        return change;
    }

    copy(x, y) {
        this.copied = build(this.field[x][y].realText, x, y);
    }

    paste(x, y) {
        if (this.copied != null)
            this.setCeil(x, y, this.copied(x, y));
    }

    cut(x, y) {
        this.copied = build(this.field[x][y].realText, x, y);
        this.setCeil(x, y, '')
    }

    deleteCopy(x, y) {
        this.copied = null;
    }

}

class StringSetWitnSearch {
    constructor(args) {
        this.elems = new Array(...args);
        this.begin = 0;
        this.end = this.elems.length - 1;
        this.prefix = '';
    }

    add(str) {
        this.elems.push(str);
    }

    has(str) {
        let beg = 0;
        let end = this.elems.length - 1;
        let mid = Math.floor((end + beg) / 2);

        while (this.elems[mid] != str && beg < end) {
            if (str < this.elems[mid]) {
                end = mid - 1;
            } else if (str > this.elems[mid]) {
                beg = mid + 1;
            }

            mid = Math.floor((end + beg) / 2);
        }
        return (this.elems[mid] != str) ? false : true;
    }

    binSearchBegByPrefix(str, beg, end) {
        let mid = Math.floor((end + beg) / 2);

        while (this.elems[mid] != str && beg < end) {
            console.log(str, this.elems[mid], '>', str > this.elems[mid], '=', str == this.elems[mid])
            console.log(str, beg, this.elems[beg], mid, this.elems[mid], end, this.elems[end]);
            if (str < this.elems[mid]) {
                end = mid - 1;
            } else if (str > this.elems[mid]) {
                beg = mid + 1;
            }

            mid = Math.floor((end + beg) / 2);
        }
        console.log(mid, this.elems[mid], (str > this.elems[mid]) ? mid + 1 : mid, this.elems[(str > this.elems[mid]) ? mid + 1 : mid]);
        return (str > this.elems[mid]) ? mid + 1 : mid;
    }

    binSearchEndByPrefix(str, beg, end) {
        str += '\uffff'; //hack
        let mid = Math.floor((end + beg) / 2);

        while (this.elems[mid] != str && beg < end) {
            if (str < this.elems[mid]) {
                end = mid - 1;
            } else if (str > this.elems[mid]) {
                beg = mid + 1;
            }

            mid = Math.floor((end + beg) / 2);
        }
        return (str > this.elems[mid]) ? mid : mid - 1;
    }

    addLetters(letters) {
        this.prefix += letters.toUpperCase();
        this.begin = this.binSearchBegByPrefix(this.prefix, this.begin, this.end);
        this.end = this.binSearchEndByPrefix(this.prefix, this.begin, this.end);
        console.log('BORDERS:', this.begin, this.end + 1)
        return this.elems.slice(this.begin, this.end + 1);
    };

    removeLetters(am) {
        this.prefix = this.prefix.substring(0, (this.prefix.length - am) > 0 ? (this.prefix.length - am) : 0);
        this.begin = this.binSearchBegByPrefix(this.prefix, 0, this.begin);
        this.end = this.binSearchEndByPrefix(this.prefix, this.begin, this.elems.length - 1);
        return this.elems.slice(this.begin, this.end + 1);
    }

    charged() {
        return this.prefix.length > 0;
    }

    setPrefix(prefix) {
        this.clear;
        this.prefix = prefix;
        this.begin = this.binSearchBegByPrefix(this.prefix, this.begin, this.end);
        this.end = this.binSearchEndByPrefix(this.prefix, this.begin, this.end);
        return this.elems.slice(this.begin, this.end + 1);
    }

    clean() {
        this.prefix = '';
        this.begin = 0;
        this.end = this.elems.length - 1;
    }

    prepareToWork() {
        this.elems.sort();
        this.end = this.elems.length - 1;
    }
}

const POSSIBLE_FUNCTIONS = new StringSetWitnSearch(["SUM", "MUL"]);

const OPERATOR = (first, oper, second) => { //TODO: bigNums
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
            return -(-first - second);
        case '-':
            return +first - second;
        case '*':
            return +first * second;
        case '/':
            if (second == 0) {
                throw new FormulaError(
                    DIV_BY_ZERO,
                    second + " equals zero",
                );
            }
            return +first / second;
    }
}

const SUM = (...args) => {
    let sum = 0;
    for (let i = 0; i < args.length; i++) {
        sum = OPERATOR(sum, '+', args[i]);
    }
    return sum;
}

const MUL = (...args) => {
    let mul = 1;
    for (let i = 0; i < args.length; i++) {
        mul = OPERATOR(mul, '*', args[i]);
    }
    return mul;
}


const funcConstructor = (func, funcName, min_arg, max_arg) => {
    POSSIBLE_FUNCTIONS.add(funcName);
    return (...args) => {
        if (args.length < min_arg) {
            throw new FormulaError(
                WRONG_ARGS_AMOUNT,
                'expected more then ' + min_arg + ' arguments',
            );
        }

        if (max_arg !== undefined && args.length > max_arg) {
            throw new FormulaError(
                WRONG_ARGS_AMOUNT,
                'expected less then ' + max_arg + ' arguments',
            );
        }
        console.log('ERROR', args.length < min_arg, max_arg !== undefined && args.length > max_arg, min_arg, max_arg)

        for (let arg in args) {
            if (isNaN(arg)) {
                throw new FormulaError(
                    NAN,
                    arg + ' is not a number'
                );
            }
        }

        let res = func(...args);
        if (res === undefined || res === NaN) {
            throw new FormulaError(
                UNDEFINED,
                funcName + ' result undefined',
            );
        }
        return res;
    }
}

const ABS = funcConstructor(Math.abs, 'ABS', 1, 1);

const POWER = funcConstructor(Math.pow, 'POWER', 2, 2);

const LOG = funcConstructor(Math.log, 'LOG', 1, 1);

const SQRT = funcConstructor(Math.sqrt, 'SQRT', 1, 1);

const KOPEH = funcConstructor(Math.sqrt, 'KOPEH', 1, 1);

const ROUND = funcConstructor(Math.round, 'ROUND', 1, 1);

const FLOOR = funcConstructor(Math.floor, 'FLOOR', 1, 1);

const COS = funcConstructor(Math.cos, 'COS', 1, 1);

const SIN = funcConstructor(Math.sin, 'SIN', 1, 1);

const ACOS = funcConstructor(Math.acos, 'ACOS', 1, 1);

const ASIN = funcConstructor(Math.asin, 'ASIN', 1, 1);

const EXP = funcConstructor(Math.exp, 'EXP', 1, 1);

const PI = funcConstructor(() => Math.PI, 'PI', 0, 0);

const MAX = funcConstructor(Math.max, 'MAX', 1);

const MIN = funcConstructor(Math.min, 'MIN', 1);

const SIGN = funcConstructor(Math.sign, 'SIGN', 1, 1);

const RAND = funcConstructor(Math.random, 'RAND', 1, 1);

const AHTOH = funcConstructor(() => 'AHTOH <3', 'AHTOH', 0, 0);

// const CONCAT = funcConstructor((...args) => {
//     let res = '';
//     for(let i = 0; i < args.length; i++){
//         res += String(args[i]);
//     }
//     return res;
// }, 'CONCAT', 1);

POSSIBLE_FUNCTIONS.prepareToWork();

const isCircDepend = (startCeil) => {
    let depth_stack = new Stack();
    let usage_array = new Array();
    let hasDependency = false;

    depth_stack.push(startCeil);
    usage_array.push(startCeil);
    startCeil.colour = GREY;

    while (!depth_stack.isEmpty()) {
        //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TRACKING CIRCULAR")
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
    //console.log('ceilInsert')
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
            'circular dependency detected', -2,
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
            if (!POSSIBLE_FUNCTIONS.has(temp)) {
                try {
                    convCoord(temp);
                } catch (e) {
                    throw new FormulaError(
                        UNKNOWN_IDENTIFIER,
                        "bad identifier: " + temp,
                        beg,
                    )
                }
            }
            tokens.push(temp);
        } else {
            //console.log("kek lol kek lol")
            throw new FormulaError(
                WRONG_SYMBOL,
                "wrong symb: " + formula[ptL],
                ptL
            );
        }
    }

    //console.log("ALL OK");
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
        return {
            token: this.tokens[this.cur - 1],
            pos: this.positions[this.cur - 1]
        }
    }

    peek() {
        if (this.isEmpty()) {
            throw new FormulaError(
                WRONG_SYNTAX,
                'cant parse',
            );
        }
        return {
            token: this.tokens[this.cur],
            pos: this.positions[this.cur]
        }
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
//TODO: update scheme

const mustBe = (tokens, token) => {
    //console.log("MUSTBE " + "empty: " + tokens.isEmpty())
    if (tokens.isEmpty()) {
        throw new FormulaError(
            EXPECTED_EXACT,
            'expected exact ' + token + ', but found nothing', -2
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
    //console.log('parseAndCreate')
    let func = parseAddBeg(table, ceil, tokens);
    func = '(table) => { return (() => (' + func + '))}'; //"(d) => {return (() => pow2(d.x))}"
    //console.log(func)

    return eval(func)(table);
}

const parseAddBeg = (table, ceil, tokens) => {
    //console.log('parseAddBeg');
    return parseAddEnd(table, ceil, tokens, parseMulBeg(table, ceil, tokens));
}

const parseAddEnd = (table, ceil, tokens, funcStr) => {
    //console.log('parseAddEnd' + ' ' + funcStr)
    if (!tokens.isEmpty()) {
        if (tokens.peek().token === '+' || tokens.peek().token === '-') {
            funcStr = 'OPERATOR(' + funcStr + ', \'' + tokens.next().token + '\', ';
            funcStr += parseMulBeg(table, ceil, tokens) + ')';
            return parseAddEnd(table, ceil, tokens, funcStr);
        } else if (tokens.peek().token === ')' || tokens.peek().token === ';' || tokens.peek().token === ':') {
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
    //console.log('parseMulBeg')
    return parseMulEnd(table, ceil, tokens, parseElem(table, ceil, tokens));
}

const parseMulEnd = (table, ceil, tokens, funcStr) => {
    //console.log('parseMulEnd' + ' ' + funcStr)
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
    //console.log('parseElem' + ' ')
    let funcStr = '';
    if (!tokens.isEmpty()) {
        if (isNumeric(tokens.peek().token[0])) {
            //console.log("OK : " + tokens.peek().token)
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
                //console.log(e)
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
    //console.log('parseArgs')
    let cur = '';
    let funcStr = '';
    let temp = '';
    let next1 = '';
    let next2 = '';
    if (tokens.peek().token === ')') {
        return funcStr;
    }
    while (!tokens.isEmpty()) {
        cur = tokens.peek().token;
        next1 = parseAddBeg(table, ceil, tokens)
        if (tokens.peek().token !== ':')
            funcStr += next1;
        else {
            tokens.next();
            temp = tokens.peek().token;
            next2 = parseAddBeg(table, ceil, tokens);

            try {
                if (next1.indexOf('()') !== next1.lastIndexOf('()') || next2.indexOf('()') !== next2.lastIndexOf('()'))
                    throw 'err';
                let firstCoord = convCoord(cur);
                let secondCoord = convCoord(temp);
                let s1 = Math.min(firstCoord.x, secondCoord.x);
                let s2 = Math.min(firstCoord.y, secondCoord.y);
                let f1 = Math.max(firstCoord.x, secondCoord.x);
                let f2 = Math.max(firstCoord.y, secondCoord.y);
                //console.log('KKKEEEKKK', s1, s2, f1, f2);
                for (; s1 <= f1; s1++) {
                    for (let i = s2; i <= f2; i++) {
                        funcStr += 'table.getInnerCeil(' + s1 + ',' + i + ').get()';

                        ceil.dependencies.add(table.getInnerCeil(s1, i));
                        table.getInnerCeil(s1, i).receivers.add(ceil);
                        if (s1 != f1 || i != f2) {
                            funcStr += ',';
                        }
                    }
                }
            } catch (e) {
                //console.log(e);
                //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                throw new FormulaError(
                    EXPECTED_CELL,
                    'expected: *cell*:*cell*, found: ' + next1 + ':' + next2,
                )
            }
        }
        if (tokens.peek().token === ')') {
            return funcStr;
        }
        funcStr += ', '
        mustBe(tokens, ';');
    }

    throw new FormulaError(
        EXPECTED_IDENTIFIER,
        "expected identifier, found: nothing", -1
    );

}
