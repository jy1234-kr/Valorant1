import { GameEngine } from './engine/GameEngine.js';

// Global game instance
const game = new GameEngine();

// UI State management
let currentScreen = 'main-menu';

// DOM Elements
const screens = {
  'main-menu': document.getElementById('main-menu'),
  'lobby-screen': document.getElementById('lobby-screen'),
  'agent-select-screen': document.getElementById('agent-select-screen'),
  'game-container': document.getElementById('game-container'),
  'match-end-screen': document.getElementById('match-end-screen')
};

// Initialize the game
async function init() {
  console.log('Initializing VALORANT-WEB...');
  
  // Setup event listeners for menus
  setupMenuListeners();
  
  // Initialize game engine
  await game.init();
  
  console.log('VALORANT-WEB ready!');
}

function setupMenuListeners() {
  // Main Menu
  document.getElementById('btn-play')?.addEventListener('click', () => {
    showScreen('lobby-screen');
    loadRoomList();
  });
  
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    game.settings.toggle();
  });
  
  // Lobby
  document.getElementById('btn-create-room')?.addEventListener('click', () => {
    document.getElementById('create-room-modal').classList.remove('hidden');
  });
  
  document.getElementById('btn-back-menu')?.addEventListener('click', () => {
    showScreen('main-menu');
  });
  
  // Create Room Modal
  document.getElementById('btn-confirm-create')?.addEventListener('click', () => {
    const roomName = document.getElementById('room-name').value;
    const map = document.getElementById('room-map').value;
    const maxPlayers = parseInt(document.getElementById('room-max-players').value);
    
    game.networkManager.createRoom(roomName, map, maxPlayers);
    document.getElementById('create-room-modal').classList.add('hidden');
  });
  
  document.getElementById('btn-cancel-create')?.addEventListener('click', () => {
    document.getElementById('create-room-modal').classList.add('hidden');
  });
  
  // Agent Select
  document.getElementById('btn-lock-agent')?.addEventListener('click', () => {
    game.networkManager.lockAgent();
  });
  
  // Match End
  document.getElementById('btn-back-lobby')?.addEventListener('click', () => {
    game.networkManager.leaveRoom();
    showScreen('lobby-screen');
    document.getElementById('match-end-screen').classList.add('hidden');
  });
  
  // Buy Menu
  document.getElementById('btn-close-buy')?.addEventListener('click', () => {
    document.getElementById('buy-menu').classList.add('hidden');
  });
  
  // Settings
  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    game.settings.save();
    document.getElementById('settings-menu').classList.add('hidden');
  });
}

function showScreen(screenId) {
  // Hide all screens
  for (const [id, el] of Object.entries(screens)) {
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('active');
    }
  }
  
  // Show target screen
  const target = screens[screenId];
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  
  currentScreen = screenId;
}

function loadRoomList() {
  // Request room list from server
  // This will be populated via socket events
}

// Socket event handlers for UI
function setupSocketHandlers() {
  if (!game.networkManager.socket) return;
  
  const socket = game.networkManager.socket;
  
  socket.on('roomJoined', (data) => {
    console.log('Joined room:', data.roomId);
    
    // Transition to agent select or game
    if (data.initialState?.phase === 'WAITING') {
      showScreen('lobby-screen');
    } else if (data.initialState?.phase === 'AGENT_SELECT') {
      showScreen('agent-select-screen');
      startAgentSelectTimer(data.initialState.timer || 60);
    } else {
      // Game already in progress
      startGame();
    }
  });
  
  socket.on('roomList', (rooms) => {
    updateRoomList(rooms);
  });
}

function updateRoomList(rooms) {
  const tbody = document.querySelector('#room-list tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  for (const room of rooms) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${room.name}</td>
      <td>${room.map}</td>
      <td>${room.players}/${room.maxPlayers}</td>
      <td>${room.phase}</td>
      <td><button class="join-room-btn" data-room-id="${room.id}">JOIN</button></td>
    `;
    
    tr.querySelector('.join-room-btn').addEventListener('click', () => {
      const playerName = prompt('Enter your name:') || 'Player';
      game.networkManager.joinRoom(room.id, playerName, 'jett');
    });
    
    tbody.appendChild(tr);
  }
}

function startAgentSelectTimer(seconds) {
  const timerEl = document.getElementById('agent-timer');
  if (!timerEl) return;
  
  let timeLeft = seconds;
  
  const interval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }, 1000);
}

function startGame() {
  showScreen('game-container');
  game.audioSystem.init();
  game.start();
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.stop();
  } else if (currentScreen === 'game-container') {
    game.start();
  }
});

// Initialize on load
window.addEventListener('load', init);

// Export for debugging
window.game = game;
