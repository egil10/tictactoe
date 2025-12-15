/**
 * Game Modes Module - With Depth-Based Outcome Tree
 * Shows 1-8 steps ahead for both X and O
 */

import { EMPTY, X_PLAYER, O_PLAYER, BoardState } from './boardState.js';
import gameTreeLoader from './gameTree.js';
import BoardRenderer from './boardRenderer.js';

class GameModes {
    constructor() {
        this.currentMode = null;
        this.currentBoard = null;
        this.renderer = null;
        this.hintsVisible = true;
    }

    init(renderer) {
        this.renderer = renderer;
    }

    showFeedback(message, type = 'info') {
        const feedbackPanel = document.getElementById('feedbackPanel');
        feedbackPanel.innerHTML = message;
        feedbackPanel.className = `feedback-panel feedback-${type}`;
    }

    updateInfoPanel(board) {
        const currentPlayer = BoardState.getCurrentPlayer(board);
        const canonicalKey = BoardState.getCanonicalKey(board);
        const stateData = gameTreeLoader.getState(canonicalKey);

        document.getElementById('currentTurn').textContent = BoardState.getPlayerSymbol(currentPlayer);

        if (stateData) {
            const outcome = this.getOutcomeText(stateData.best_outcome, currentPlayer);
            document.getElementById('bestOutcome').textContent = outcome;
        } else {
            const status = BoardState.getGameStatus(board);
            if (status.draw) {
                document.getElementById('bestOutcome').textContent = 'Draw';
            } else if (status.winner) {
                document.getElementById('bestOutcome').textContent = `${status.winner} Wins`;
            }
        }
    }

    getOutcomeText(score, currentPlayer) {
        if (score === 1) {
            return 'X Wins';
        } else if (score === -1) {
            return 'O Wins';
        }
        return 'Draw';
    }

    /**
     * Build outcome panels showing 1-8 steps ahead for both X and O
     */
    buildOutcomePanels(board) {
        if (BoardState.isTerminal(board)) {
            document.getElementById('outcomeXContent').innerHTML = '<div class="outcome-empty">Game Over</div>';
            document.getElementById('outcomeOContent').innerHTML = '<div class="outcome-empty">Game Over</div>';
            return;
        }

        const canonicalKey = BoardState.getCanonicalKey(board);
        const stateData = gameTreeLoader.getState(canonicalKey);

        if (!stateData || !stateData.next_moves || stateData.next_moves.length === 0) {
            document.getElementById('outcomeXContent').innerHTML = '<div class="outcome-empty">No moves available</div>';
            document.getElementById('outcomeOContent').innerHTML = '<div class="outcome-empty">No moves available</div>';
            return;
        }

        // Explore moves for both players at different depths
        const xMoves = this.exploreMovesByPlayer(board, X_PLAYER, 8);
        const oMoves = this.exploreMovesByPlayer(board, O_PLAYER, 8);

        // Render panels
        this.renderPlayerPanel('outcomeXContent', xMoves, X_PLAYER);
        this.renderPlayerPanel('outcomeOContent', oMoves, O_PLAYER);
    }

    /**
     * Explore moves for a specific player at different depths
     */
    exploreMovesByPlayer(board, targetPlayer, maxDepth) {
        const movesByDepth = [];
        for (let i = 0; i <= maxDepth; i++) {
            movesByDepth[i] = [];
        }

        const currentPlayer = BoardState.getCurrentPlayer(board);
        const startDepth = (currentPlayer === targetPlayer) ? 0 : 1;

        this.exploreDepth(board, targetPlayer, startDepth, maxDepth, movesByDepth, new Set());

        return movesByDepth;
    }

    /**
     * Recursively explore tree for target player's moves
     */
    exploreDepth(board, targetPlayer, currentDepth, maxDepth, movesByDepth, visited) {
        if (currentDepth > maxDepth || BoardState.isTerminal(board)) {
            return;
        }

        const canonicalKey = BoardState.getCanonicalKey(board);
        const stateData = gameTreeLoader.getState(canonicalKey);

        if (!stateData || !stateData.next_moves) {
            return;
        }

        const currentPlayer = BoardState.getCurrentPlayer(board);

        if (currentPlayer === targetPlayer) {
            // It's target player's turn - record moves
            stateData.next_moves.forEach(move => {
                const moveKey = `${currentDepth}-${move.pos}`;
                if (!visited.has(moveKey)) {
                    visited.add(moveKey);
                    movesByDepth[currentDepth].push({
                        pos: move.pos,
                        score: move.minimax_score,
                        optimal: move.is_optimal
                    });
                }

                // Explore further (next occurrence is 2 steps ahead)
                const newBoard = BoardState.stringToBoard(move.to_board);
                if (!BoardState.isTerminal(newBoard)) {
                    this.exploreDepth(newBoard, targetPlayer, currentDepth + 2, maxDepth, movesByDepth, visited);
                }
            });
        } else {
            // Not target player's turn - explore all opponent moves
            stateData.next_moves.forEach(move => {
                const newBoard = BoardState.stringToBoard(move.to_board);
                if (!BoardState.isTerminal(newBoard)) {
                    this.exploreDepth(newBoard, targetPlayer, currentDepth + 1, maxDepth, movesByDepth, visited);
                }
            });
        }
    }

    /**
     * Render player panel with depth-organized moves
     */
    renderPlayerPanel(elementId, movesByDepth, player) {
        const container = document.getElementById(elementId);
        let html = '';

        // Check if player has any moves
        const hasAnyMoves = movesByDepth.some(moves => moves.length > 0);

        if (!hasAnyMoves) {
            container.innerHTML = `<div class="outcome-empty">No moves for ${BoardState.getPlayerSymbol(player)}</div>`;
            return;
        }

        // Render each depth level
        movesByDepth.forEach((moves, depth) => {
            if (moves.length === 0) return;

            const depthLabel = depth === 0 ? 'Now' : `${depth} step${depth > 1 ? 's' : ''} ahead`;

            html += `<div class="tree-level">`;
            html += `  <div class="tree-level-title">${depthLabel}</div>`;
            html += `  <div class="tree-moves">`;

            // Sort moves by position
            const sortedMoves = [...moves].sort((a, b) => a.pos - b.pos);

            sortedMoves.forEach(move => {
                const outcomeClass = move.score === 1 ? 'win' : move.score === -1 ? 'loss' : 'draw';
                const outcomeLabel = move.score === 1 ? 'Win' : move.score === -1 ? 'Loss' : 'Draw';

                html += `<div class="outcome-move-compact">`;
                html += `  <span class="outcome-move-pos">${move.pos + 1}</span>`;
                html += `  <span class="outcome-badge ${outcomeClass}">${outcomeLabel}</span>`;
                if (move.optimal && this.hintsVisible && depth === 0) {
                    html += `  <span class="outcome-star">★</span>`;
                }
                html += `</div>`;
            });

            html += `  </div>`;
            html += `</div>`;
        });

        container.innerHTML = html;
    }

    toggleHints() {
        this.hintsVisible = !this.hintsVisible;
        const btn = document.getElementById('btnToggleHints');
        const text = btn.querySelector('.toggle-text');
        const container = document.getElementById('outcomeContainer');

        if (this.hintsVisible) {
            btn.classList.remove('active');
            text.textContent = 'Hide Hints';
            container.classList.remove('hidden');
        } else {
            btn.classList.add('active');
            text.textContent = 'Show Hints';
            container.classList.add('hidden');
        }
    }

    // ==================== MODE 1: PLAY GAME ====================

    startPlayMode() {
        this.currentMode = 'play';
        this.currentBoard = BoardState.createEmpty();

        this.renderer.render(this.currentBoard);
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomePanels(this.currentBoard);
        this.showFeedback('Make your move to start!');

        this.renderer.enableClicks((position) => this.handlePlayMove(position));
    }

    handlePlayMove(position) {
        if (this.currentBoard[position] !== EMPTY) {
            this.showFeedback('⚠️ Cell already occupied', 'error');
            return;
        }

        const currentPlayer = BoardState.getCurrentPlayer(this.currentBoard);
        const playerSymbol = BoardState.getPlayerSymbol(currentPlayer);

        this.currentBoard = BoardState.makeMove(this.currentBoard, position, currentPlayer);

        this.renderer.render(this.currentBoard);
        this.renderer.animateCell(position);
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomePanels(this.currentBoard);

        if (BoardState.isTerminal(this.currentBoard)) {
            const status = BoardState.getGameStatus(this.currentBoard);
            if (status.draw) {
                this.showFeedback('🤝 Game ended in a draw!', 'info');
            } else {
                this.showFeedback(`🏆 ${status.winner} wins the game!`, 'optimal');
            }
            this.renderer.disableClicks();
        } else {
            this.showFeedback(`${playerSymbol} played position ${position + 1}`);
        }
    }

    // ==================== MODE 2: FIND OPTIMAL MOVE ====================

    startPracticeMode() {
        this.currentMode = 'practice';
        this.loadRandomPosition();
    }

    loadRandomPosition() {
        const randomKey = gameTreeLoader.getRandomState();
        this.currentBoard = BoardState.stringToBoard(randomKey);

        this.renderer.render(this.currentBoard);
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomePanels(this.currentBoard);

        const currentPlayer = BoardState.getCurrentPlayer(this.currentBoard);
        this.showFeedback(`Find the optimal move for ${BoardState.getPlayerSymbol(currentPlayer)}!`);

        this.renderer.enableClicks((position) => this.handlePracticeMove(position));
    }

    handlePracticeMove(position) {
        if (this.currentBoard[position] !== EMPTY) {
            this.showFeedback('⚠️ Cell already occupied', 'error');
            return;
        }

        const canonicalKey = BoardState.getCanonicalKey(this.currentBoard);
        const stateData = gameTreeLoader.getState(canonicalKey);

        if (!stateData) {
            this.showFeedback('❌ Error: State not found', 'error');
            return;
        }

        const currentPlayer = BoardState.getCurrentPlayer(this.currentBoard);
        const newBoard = BoardState.makeMove(this.currentBoard, position, currentPlayer);
        const newCanonicalKey = BoardState.getCanonicalKey(newBoard);

        const moveData = stateData.next_moves.find(m => {
            const moveCanonical = BoardState.getCanonicalKey(BoardState.stringToBoard(m.to_board));
            return moveCanonical === newCanonicalKey;
        });

        if (!moveData) {
            this.showFeedback('❌ Error: Move not found', 'error');
            return;
        }

        this.currentBoard = newBoard;
        this.renderer.render(this.currentBoard);
        this.renderer.animateCell(position);
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomePanels(this.currentBoard);

        if (moveData.is_optimal) {
            this.showFeedback('✅ Perfect! That was an optimal move!', 'optimal');
            this.renderer.highlightCell(position, 'optimal');
        } else {
            const optimalPos = stateData.winning_move_pos;
            this.showFeedback(`⚠️ Suboptimal.The optimal move was position ${optimalPos + 1} `, 'suboptimal');
            this.renderer.highlightCell(position, 'suboptimal');
        }

        if (BoardState.isTerminal(this.currentBoard)) {
            setTimeout(() => this.loadRandomPosition(), 2000);
        }
    }

    // ==================== MODE 3: IDENTIFY OUTCOME ====================

    startQuizMode() {
        this.currentMode = 'quiz';
        this.loadQuizQuestion();
    }

    loadQuizQuestion() {
        const randomKey = gameTreeLoader.getRandomState();
        this.currentBoard = BoardState.stringToBoard(randomKey);
        const stateData = gameTreeLoader.getState(randomKey);

        this.renderer.render(this.currentBoard);
        this.renderer.disableClicks();
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomePanels(this.currentBoard);

        const currentPlayer = BoardState.getCurrentPlayer(this.currentBoard);
        const playerSymbol = BoardState.getPlayerSymbol(currentPlayer);

        this.showFeedback(
            `What is the outcome for ${playerSymbol} with optimal play ? <br><br>` +
            `<button class="mode-btn" id="quizWin" style="display:inline-block; margin:0.25rem; padding:0.75rem 1.5rem;">Win</button> ` +
            `<button class="mode-btn" id="quizDraw" style="display:inline-block; margin:0.25rem; padding:0.75rem 1.5rem;">Draw</button> ` +
            `<button class="mode-btn" id="quizLoss" style="display:inline-block; margin:0.25rem; padding:0.75rem 1.5rem;">Loss</button>`
        );

        setTimeout(() => {
            document.getElementById('quizWin')?.addEventListener('click', () =>
                this.handleQuizAnswer(currentPlayer === X_PLAYER ? 1 : -1, stateData, currentPlayer));
            document.getElementById('quizDraw')?.addEventListener('click', () =>
                this.handleQuizAnswer(0, stateData, currentPlayer));
            document.getElementById('quizLoss')?.addEventListener('click', () =>
                this.handleQuizAnswer(currentPlayer === X_PLAYER ? -1 : 1, stateData, currentPlayer));
        }, 100);
    }

    handleQuizAnswer(userAnswer, stateData, currentPlayer) {
        const correctAnswer = stateData.best_outcome;
        const isCorrect = userAnswer === correctAnswer;

        const correctText = this.getOutcomeText(correctAnswer, currentPlayer);

        if (isCorrect) {
            this.showFeedback(`✅ Correct! The outcome is ${correctText}`, 'optimal');
        } else {
            this.showFeedback(`❌ Incorrect. The correct outcome is ${correctText}`, 'suboptimal');
        }

        setTimeout(() => this.loadQuizQuestion(), 2500);
    }

    // ==================== COMMON ACTIONS ====================

    resetBoard() {
        if (this.currentMode === 'play') {
            this.startPlayMode();
        } else if (this.currentMode === 'practice') {
            this.loadRandomPosition();
        } else if (this.currentMode === 'quiz') {
            this.loadQuizQuestion();
        }
    }
}

export default GameModes;
