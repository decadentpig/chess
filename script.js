// GLOBAL DECLARATIONS
let stage;
let canvas;

const WHITE_BOARD_COLOR = "#e3deb6";
const BLACK_BOARD_COLOR = "#728c57";
const SELECTION_COLOR = "rgba(222, 222, 51, 0.5)";

const DEFAULT_SIZE = 400;
const BOARD_SIZE = DEFAULT_SIZE;
const SQUARE_SIZE = BOARD_SIZE / 8;

const UNICODE = {
    wPawn: "\u2659",
    wRook: "\u2656",
    wKnight: "\u2658",
    wBishop: "\u2657",
    wQueen: "\u2655",
    wKing: "\u2654",
    bPawn: "\u265F",
    bRook: "\u265C",
    bKnight: "\u265E",
    bBishop: "\u265D",
    bQueen: "\u265B",
    bKing: "\u265A",
}

let currentTurn = "w";

const GAME_STATE = [...Array(8)].map(e => Array(8).fill(null));
const PIECES = [];

let selectX = null;
let selectY = null;
let selectionFrame = null;

function init() {
    canvas = document.getElementById("game-board");
    canvas.width = BOARD_SIZE;
    canvas.height = BOARD_SIZE;

    stage = new createjs.Stage(canvas);

    stage.enableMouseOver();
    stage.enableDOMEvents(true);

    drawChessBoard();
    initPieces();

    initEventListeners();
}

function initEventListeners() {
    // Handle tick event by redrawing pieces and updating stage
    createjs.Ticker.on("tick", () => {
        redrawPieces();
        stage.update();
    });

    stage.addEventListener("mousedown", (event) => {
        // Fetch the x and y of a mouseclick (adjusted for game coordinates)
        let x = Math.floor(event.stageX / SQUARE_SIZE);
        let y = Math.floor(event.stageY / SQUARE_SIZE);

        // Pass x and y to interact function, for use with GAME_STATE array
        interact(x, y);
    });
}

function drawChessBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Determine the color for each square
            let color = (i + j) % 2 == 0 ? WHITE_BOARD_COLOR : BLACK_BOARD_COLOR;

            let square = new createjs.Shape();
            square.graphics.beginFill(color).drawRect(i * SQUARE_SIZE, j * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

            stage.addChild(square);
        }
    }
}

function initPieces() {
    // create pawns
    for (let i = 0; i < 8; i++) {
        GAME_STATE[i][6] = "wPawn";
        GAME_STATE[i][1] = "bPawn";
    }

    // create white major pieces
    GAME_STATE[0][7] = "wRook";
    GAME_STATE[1][7] = "wKnight";
    GAME_STATE[2][7] = "wBishop";
    GAME_STATE[3][7] = "wQueen";
    GAME_STATE[4][7] = "wKing";
    GAME_STATE[5][7] = "wBishop";
    GAME_STATE[6][7] = "wKnight";
    GAME_STATE[7][7] = "wRook";

    // create black major pieces
    GAME_STATE[0][0] = "bRook";
    GAME_STATE[1][0] = "bKnight";
    GAME_STATE[2][0] = "bBishop";
    GAME_STATE[3][0] = "bQueen";
    GAME_STATE[4][0] = "bKing";
    GAME_STATE[5][0] = "bBishop";
    GAME_STATE[6][0] = "bKnight";
    GAME_STATE[7][0] = "bRook";
}

function redrawPieces() {
    for (let i = 0; i < PIECES.length; i++) {
        stage.removeChild(PIECES[i]);
    }

    // empty PIECES array after all Text objects have been removed from the stage
    PIECES.length = 0;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (GAME_STATE[i][j] !== null) {
                createPiece(GAME_STATE[i][j], i, j);
            }
        }
    }
}

function createPiece(tag, x, y) {
    const piece = new createjs.Text(UNICODE[tag], `${SQUARE_SIZE}px Times New Roman`, (tag[0] === "w") ? "white" : "black");

    // Some offset for x and y provided to improve visuals
    piece.x = x * SQUARE_SIZE - (SQUARE_SIZE / 50);
    piece.y = y * SQUARE_SIZE + (SQUARE_SIZE * 0.1);

    stage.addChild(piece);

    PIECES.push(piece);
}

function interact(x, y) {
    // If selected piece has been clicked a second time, clear selection
    if (selectX === x && selectY === y) {
        clearSelection();
    }

    // Else, if there is a current selection, CHECK FOR LEGAL MOVES at new position, and then move piece
    else if (selectX !== null && selectY !== null) {
        if (moveIsLegal(GAME_STATE[selectX][selectY], selectX, selectY, x, y)) {
            movePiece(selectX, selectY, x, y);
        }
    } 
    
    // Else, if there is no current selection but the user has clicked on a piece, allow that piece to 
    // be selected if it belongs to them
    else if (GAME_STATE[x][y] !== null) {
        // Select piece if it belongs to player whose turn it is
        if (GAME_STATE[x][y][0] === currentTurn) {
            selectPiece(x, y);
        }
    }
}

function moveIsLegal(tag, originX, originY, destX, destY) {
    console.log("Tag is: " + tag);
    const piece = tag.slice(1);

    switch (piece) {
        case "Pawn":
            return pawnMoveLegal(tag, originX, originY, destX, destY);
            break;
        case "Rook":
            rookMoveLegal(tag, originX, originY, destX, destY);
            break;
        case "Knight":
            knightMoveLegal(tag, originX, originY, destX, destY);
            break;
        case "Bishop":
            bishopMoveLegal(tag, originX, originY, destX, destY);
            break;
        case "Queen":
            queenMoveLegal(tag, originX, originY, destX, destY);
            break;
        case "King":
            kingMoveLegal(tag, originX, originY, destX, destY);
            break;
    }
}

function pawnMoveLegal(tag, originX, originY, destX, destY) {
    const color = tag[0];

    if (color === "w") {
        if (originY === 6 && destX === originX && destY === 4) {
            return true;
        }

        else if (destY - originY === -1 && originX == destX) {
            return true;
        }

        return false;
    }

    else if (color === "b") {
        if (originY === 1 && destX === originX && destY === 3) {
            return true;
        }

        else if (destY - originY === 1 && originX == destX) {
            return true;
        }

        return false;
    }
}

function movePiece(originX, originY, destX, destY) {
    // Store piece tag
    const piece = GAME_STATE[originX][originY];

    // Clear original space
    GAME_STATE[originX][originY] = null;

    // Place tag at new position
    GAME_STATE[destX][destY] = piece;

    // Finally, switch turns and clear selection
    nextTurn();
    clearSelection();
}

function nextTurn() {
    currentTurn = (currentTurn === "w") ? "b" : "w";
}

function selectPiece(x, y) {
    console.log("Selected " + GAME_STATE[x][y]);
    selectX = x;
    selectY = y;

    selectionFrame = new createjs.Shape();
    selectionFrame.graphics.beginFill(SELECTION_COLOR).dr(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    stage.addChild(selectionFrame);
}

function clearSelection() {
    console.log("Cleared selection!");

    stage.removeChild(selectionFrame);
    selectionFrame = null;

    selectX = null;
    selectY = null;
}
