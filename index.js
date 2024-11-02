const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

let isPaused = false;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

function arenaSweep() {
    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        score += 10;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
        document.getElementById("score").innerText = score;
        document.getElementById("highScore").innerText = highScore;
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    switch (type) {
        case 'T': return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
        case 'O': return [[1, 1], [1, 1]];
        case 'L': return [[0, 0, 1], [1, 1, 1], [0, 0, 0]];
        case 'J': return [[1, 0, 0], [1, 1, 1], [0, 0, 0]];
        case 'I': return [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]];
        case 'S': return [[0, 1, 1], [1, 1, 0], [0, 0, 0]];
        case 'Z': return [[1, 1, 0], [0, 1, 1], [0, 0, 0]];
    }
}


function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {
    if (isPaused) return; 
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        score += 1; 
        document.getElementById("score").innerText = score; 
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    if (isPaused) return; 
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
    player.pos.y = 0;
    player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);
    
    const colorArray = ['#0B7DCF', '#CF2B31', '#F0830E'];
    player.color = colorArray[Math.floor(colorArray.length * Math.random())];
    
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0;
        document.getElementById("score").innerText = score;
    }
}

function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 }, "#444"); // Заливка арены серым
    drawMatrix(player.matrix, player.pos, player.color); // Используем цвет фигуры
}



function playerRotate(dir) {
    if (isPaused) return; 
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    if (!isPaused) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) playerDrop();
        draw();
    }
    requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") playerMove(-1);
    else if (event.key === "ArrowRight") playerMove(1);
    else if (event.key === "ArrowDown") playerDrop();
    else if (event.key === "ArrowUp") playerRotate(1);
    else if (event.key === " ") {
        isPaused = !isPaused;
    }
});

const arena = createMatrix(COLS, ROWS);
const player = { pos: { x: 0, y: 0 }, matrix: null };
playerReset();
update();
 