Js script
const word_length = 5;
let maxGuesses = 6;

let targetWord = '';
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let validWords = [];

async function fetchWord() {
    try {
        const response = await fetch('https://random-words-api.kushcreates.com/api?length=5');
        const data = await response.json();
        validWords = data.map(w => w.word.toUpperCase());
        const randomIndex = Math.floor(Math.random() * data.length);
        targetWord = validWords[randomIndex];
        console.log('Target word:', targetWord);
    } catch (error) {
        console.log('API failed, using fallback');
        const fallbacks = ['CRANE', 'PLANT', 'BRUSH', 'GHOST', 'FLAME', 'STOVE', 'BREAD', 'LIGHT'];
        targetWord = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        validWords = fallbacks;
    }
}

function buildBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let i = 0; i < maxGuesses * word_length; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.id = `tile-${i}`;
        board.appendChild(tile);
    }
}

function buildKeyboard() {
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
        submitGuess();
        return;
    }

    if (/^[A-Za-z]$/.test(key) && currentGuess.length < word_length) {
        currentGuess += key.toUpperCase();
        getTile(currentRow, currentGuess.length - 1).textContent = key.toUpperCase();
    }
}

function submitGuess() {
    if (currentGuess.length < word_length) {
        showMessage('Not enough letters!');
        return;
    }

    const guess = currentGuess.toUpperCase();

    if (validWords.length > 0 && !validWords.includes(guess)) {
        showMessage('Not a valid word!');
        return;
    }

    const target = targetWord.toUpperCase();
    const result = Array(word_length).fill('absent');
    const targetLetters = target.split('');
    const guessLetters = guess.split('');

    guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) {
            result[i] = 'correct';
            targetLetters[i] = null;
        }
    });

    guessLetters.forEach((letter, i) => {
        if (result[i] === 'correct') return;
        const idx = targetLetters.indexOf(letter);
        if (idx !== -1) {
            result[i] = 'present';
            targetLetters[idx] = null;
        }
    });

    guessLetters.forEach((letter, i) => {
        const tile = getTile(currentRow, i);
        tile.classList.add(result[i]);
        colorKey(letter, result[i]);
    });

    if (guess === target) {
        showMessage('You got it! 🎉', 0);
        gameOver = true;
        return;
    }

    currentRow++;
    currentGuess = '';

    if (currentRow >= maxGuesses) {
        showMessage('The word was: ' + target, 0);
        gameOver = true;
    }
}

function colorKey(letter, result) {
    const key = document.querySelector(`[data-key="${letter}"]`);
    if (!key) return;
    if (key.classList.contains('correct')) return;
    if (key.classList.contains('present') && result === 'absent') return;
    key.classList.remove('correct', 'present', 'absent');
    key.classList.add(result);
}

async function startGame() {
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    document.getElementById('message').textContent = 'Loading word...';
    buildBoard();
    buildKeyboard();
    await fetchWord();
    document.getElementById('message').textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('[data-guesses="6"]').classList.add('selected');

    document.querySelectorAll('.diff').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            maxGuesses = parseInt(btn.dataset.guesses);
        });
    });

    document.getElementById('start').addEventListener('click', () => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('game').style.display = 'flex';
        startGame();
    });

    document.getElementById('Restart').addEventListener('click', startGame);
    document.addEventListener('keydown', (e) => handleKey(e.key));
});
