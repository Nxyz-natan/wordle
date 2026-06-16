const word_length = 5;
let maxGuesses = 6;

let targetWord = '';
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let validWord = [];

async function fetchWord() {
    try {
        const response = await fetch('https://random-words-api.kushcreates.com/api?length=5');
        const data = await response.json();
        validWord = data.map(w => w.word.toUppercase());
        const randomIndex = Math.floor(Math.random() * data.length);
        targetWord = validWord[randomIndex];

    } catch (error) {
        console.log('API failed using fallback');
        const fallbacks = ['CRANE', 'PLANT', 'BRUSH', 'GHOST', 'FLAME', 'STOVE', 'APPLE'];
        targetWord = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        validWord = fallbacks;
    }
    
}

function buildBoard () {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let i = 0; i < maxGuesses * word_length; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.id = `tile-${i}`;
        board.appendChild(tile);
    }
}

function buildKeyboard () {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    const rows = [
          ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['ENTER','Z','X','C','V','B','N','M','⌫']
    ];
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard_row');
        row.forEach(key => {
            const btn = document.createElement('button');
            btn.textContent = key;
            btn.classList.add('key');
            if (key === 'ENTER' || key === '⌫') btn.classList.add('wide');
            btn.dataset.key = key;
            btn.addEventListener('click', () => handleKey(key));
            rowDiv.appendChild(btn);
        });
        keyboard.appendChild(rowDiv);
    });
}

function getTile(row, col) {
    return document.getElementById(`tile-${row * word_length + col}`);
}

function showMessage(msg, duration = 2000) {
    const el = document.getElementById('message');
    el.textContent = msg;
    if (duration) setTimeout(() => el.textContent = '', duration);
}

function handleKey(key) {
    if (gameOver) return;
    if (!targetWord) return;
    if (key === '⌫' || key === 'Backspace') {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            getTile(currentRow, currentGuess.length).textContent = '';
        }
        return;
    }
    if (key === 'ENTER' || key === 'Enter') {
        sumbitGuess();
        return;
    }
    if (/^[A-Za-z]$/.test(key) && currentGuess.length < word_length) {
        currentGuess += key.toUppercase();
        getTile(currentRow, currentGuess.lengthn - 1).textContent = key.toUppercase();
        
    }
}

function sumbitGuess() {
    if (currentGuess.length < word_length) {
        showMessage('Not Enought Letters!!!');
        return;
    }
    const guess = currentGuess.toUpperCase();
    if (validWord.length > 0 && !validWord.includes(guess)) {
        showMessage('Not a valid word')
        return;
    }
}