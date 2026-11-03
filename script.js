const targetWord = ['I', 'L', 'O', 'V', 'E', 'Y', 'O', 'U'];
const nameGateEl = document.getElementById('nameGate');
const gamePanelEl = document.getElementById('gamePanel');
const playerNameInput = document.getElementById('playerName');
const startBtn = document.getElementById('startBtn');
const boardEl = document.getElementById('board');
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('scoreText');
const messageBox = document.getElementById('messageBox');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const linkLayer = document.getElementById('linkLayer');

let tiles = [];
let selectedTiles = [];
let bestStreak = 0;
let playerName = '';

function shuffleArray(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setMessage(text, type = '') {
  messageBox.textContent = text;
  messageBox.classList.remove('error', 'success');
  if (type) {
    messageBox.classList.add(type);
  }
}

function showLoveMessage() {
  const name = playerName.trim() || 'you';
  const flash = document.createElement('div');
  flash.className = 'love-flash';
  flash.textContent = `I LOVE YOU ${name.toUpperCase()}`;
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 1800);
}

function startGame() {
  const name = playerNameInput.value.trim();
  if (!name) {
    setMessage('Please enter your name before starting.', 'error');
    playerNameInput.focus();
    return;
  }

  playerName = name;
  nameGateEl.classList.add('hidden');
  gamePanelEl.classList.remove('hidden');
  createBoard();
  setMessage(`Hello ${playerName}! Start with the letter I.`);
}

function refreshProgress() {
  progressText.textContent = `${selectedTiles.length} / ${targetWord.length}`;
}

function resetSelection() {
  selectedTiles = [];
  refreshProgress();
  drawConnections();
  document.querySelectorAll('.letter-tile').forEach((tile) => {
    tile.classList.remove('is-selected', 'is-wrong');
  });
}

function drawConnections() {
  const selectedButtons = selectedTiles
    .map((tile) => boardEl.querySelector(`[data-id="${tile.id}"]`))
    .filter(Boolean);

  if (selectedButtons.length <= 1) {
    linkLayer.innerHTML = '';
    return;
  }

  const boardRect = boardEl.getBoundingClientRect();
  const points = selectedButtons.map((button) => {
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - boardRect.left;
    const y = rect.top + rect.height / 2 - boardRect.top;
    return `${x},${y}`;
  }).join(' ');

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', points);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', '#7dd3fc');
  polyline.setAttribute('stroke-width', '6');
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');
  polyline.setAttribute('opacity', '0.95');
  linkLayer.innerHTML = '';
  linkLayer.appendChild(polyline);
}

function createBoard() {
  tiles = shuffleArray(targetWord).map((letter, index) => ({
    id: `${letter}-${index}-${Math.random().toString(16).slice(2)}`,
    letter,
  }));

  boardEl.innerHTML = '';

  tiles.forEach((tile) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'letter-tile';
    button.dataset.id = tile.id;
    button.textContent = tile.letter;
    button.setAttribute('aria-label', `Letter ${tile.letter}`);
    button.addEventListener('click', () => handleTileClick(tile));
    boardEl.appendChild(button);
  });

  boardEl.classList.remove('shake');
  resetSelection();
  setMessage('Start with the letter I.');
}

function handleTileClick(tile) {
  const expectedLetter = targetWord[selectedTiles.length];

  if (tile.letter === expectedLetter) {
    selectedTiles.push(tile);
    const selectedButton = boardEl.querySelector(`[data-id="${tile.id}"]`);
    if (selectedButton) {
      selectedButton.classList.add('is-selected');
    }

    refreshProgress();
    drawConnections();

    if (selectedTiles.length === targetWord.length) {
      bestStreak += 1;
      scoreText.textContent = String(bestStreak);
      setMessage('Perfect! You spelled ILOVEYOU!', 'success');
      showLoveMessage();
      setTimeout(() => {
        createBoard();
      }, 950);
      return;
    }

    setMessage(`Nice! Next is ${targetWord[selectedTiles.length]}.`);
    return;
  }

  document.querySelectorAll('.letter-tile').forEach((button) => button.classList.remove('is-selected'));
  const wrongButton = boardEl.querySelector(`[data-id="${tile.id}"]`);
  if (wrongButton) {
    wrongButton.classList.add('is-wrong');
  }

  boardEl.classList.remove('shake');
  void boardEl.offsetWidth;
  boardEl.classList.add('shake');

  setTimeout(() => {
    wrongButton?.classList.remove('is-wrong');
    boardEl.classList.remove('shake');
  }, 260);

  setMessage(`Not quite — ${expectedLetter} is next.`, 'error');
  resetSelection();
}

hintBtn.addEventListener('click', () => {
  setMessage('Hint: I → L → O → V → E → Y → O → U');
});

resetBtn.addEventListener('click', () => {
  createBoard();
  setMessage('Fresh board ready. Start with the letter I.');
});

shuffleBtn.addEventListener('click', () => {
  createBoard();
  setMessage('Board shuffled. Start again from I.');
});

startBtn.addEventListener('click', startGame);
playerNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    startGame();
  }
});

scoreText.textContent = String(bestStreak);
nameGateEl.classList.remove('hidden');
gamePanelEl.classList.add('hidden');
playerNameInput.focus();
