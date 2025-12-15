/**
 * Main Application Controller - Simplified
 */

import gameTreeLoader from './gameTree.js';
import BoardRenderer from './boardRenderer.js';
import GameModes from './gameModes.js';

class App {
    constructor() {
        this.renderer = null;
        this.gameModes = null;
    }

    async init() {
        console.log('🚀 Initializing TicTacToe Mastery...');

        this.showLoading(true);

        const success = await gameTreeLoader.load();

        if (!success) {
            alert('Failed to load game tree. Please refresh the page.');
            return;
        }

        const boardElement = document.getElementById('board');
        this.renderer = new BoardRenderer(boardElement);

        this.gameModes = new GameModes();
        this.gameModes.init(this.renderer);

        this.setupEventListeners();
        this.showLoading(false);

        console.log('✅ Application ready!');
    }

    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            if (btn.dataset.mode) {
                btn.addEventListener('click', () => {
                    const mode = btn.dataset.mode;
                    this.startMode(mode);
                });
            }
        });

        // Back button
        document.getElementById('btnBack').addEventListener('click', () => {
            this.showModeSelector();
        });

        // New round button
        document.getElementById('btnNewRound').addEventListener('click', () => {
            this.gameModes.resetBoard();
        });
    }

    startMode(mode) {
        document.getElementById('modeSelector').style.display = 'none';
        document.getElementById('gameArea').style.display = 'flex';

        const titles = {
            'play': 'Play Game',
            'practice': 'Find Optimal Move',
            'quiz': 'Identify Outcome'
        };
        document.getElementById('gameTitle').textContent = titles[mode] || 'Game';

        if (mode === 'play') {
            this.gameModes.startPlayMode();
        } else if (mode === 'practice') {
            this.gameModes.startPracticeMode();
        } else if (mode === 'quiz') {
            this.gameModes.startQuizMode();
        }
    }

    showModeSelector() {
        document.getElementById('modeSelector').style.display = 'block';
        document.getElementById('gameArea').style.display = 'none';
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

export default App;
