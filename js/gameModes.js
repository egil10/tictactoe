/**
 * Game Modes Module - Simplified
 * 3 Modes: Play Game, Find Optimal Move, Identify Outcome
 */

import { EMPTY, X_PLAYER, O_PLAYER, BoardState } from './boardState.js';
import gameTreeLoader from './gameTree.js';
import BoardRenderer from './boardRenderer.js';

class GameModes {
    constructor() {
        this.currentMode = null;
        this.currentBoard = null;
        this.renderer = null;
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
            return currentPlayer === X_PLAYER ? 'X Wins' : 'X Wins';
        } else if (score === -1) {
            return currentPlayer === O_PLAYER ? 'O Wins' : 'O Wins';
        }
        return 'Draw';
    }

    /**
     * Build and display outcome tree showing all possible moves sorted by depth
     */
    buildOutcomeTree(board) {
        const treeContainer = document.getElementById('outcomeTree');

        if (BoardState.isTerminal(board)) {
            treeContainer.innerHTML = '';
            return;
        }

        const canonicalKey = BoardState.getCanonicalKey(board);
        const stateData = gameTreeLoader.getState(canonicalKey);

        if (!stateData || !stateData.next_moves || stateData.next_moves.length === 0) {
            treeContainer.innerHTML = '';
            return;
        }

        // Group moves by depth (we'll simulate depth by exploring further)
        const movesByDepth = this.exploreMoveTree(board, 3); // Explore up to 3 levels

        let html = '<h3>Possible Outcomes</h3>';

        movesByDepth.forEach((moves, depth) => {
            if (moves.length === 0) return;

            html += `<div class="tree-level">`;
            html += `<div class="tree-level-title">${depth === 0 ? 'Immediate Moves' : `${depth + 1} Move${depth > 0 ? 's' : ''} Ahead`}</div>`;
            html += `<div class="tree-outcomes">`;

            moves.forEach(move => {
                const outcomeClass = move.score === 1 ? 'win' : move.score === -1 ? 'loss' : 'draw';
                const outcomeSymbol = move.score === 1 ? '✓' : move.score === -1 ? '✗' : '=';
                html += `<div class="tree-outcome ${outcomeClass}">`;
                html += `<span class="tree-outcome-pos">${move.pos + 1}</span>`;
                html += `<span>${outcomeSymbol}</span>`;
                if (move.optimal) {
                    html += `<span>★</span>`;
                }
                html += `</div>`;
            });

            html += `</div></div>`;
        });

        treeContainer.innerHTML = html;
    }

    /**
     * Explore move tree to organize by depth
     */
    exploreMoveTree(board, maxDepth) {
        const movesByDepth = [];

        for (let depth = 0; depth <= maxDepth; depth++) {
            movesByDepth[depth] = [];
        }

        // First level - immediate moves
        const canonicalKey = BoardState.getCanonicalKey(board);
        const stateData = gameTreeLoader.getState(canonicalKey);

        if (!stateData) return movesByDepth;

        stateData.next_moves.forEach(move => {
            movesByDepth[0].push({
                pos: move.pos,
                score: move.minimax_score,
                optimal: move.is_optimal
            });
        });

        // Subsequent levels
        for (let depth = 1; depth <= maxDepth; depth++) {
            const seenPositions = new Set();

            stateData.next_moves.forEach(firstMove => {
                const newBoard = BoardState.stringToBoard(firstMove.to_board);
                this.exploreDepth(newBoard, depth, depth, movesByDepth, seenPositions);
            });
        }

        return movesByDepth;
    }

    exploreDepth(board, currentDepth, targetDepth, movesByDepth, seenPositions) {
        if (currentDepth === 0 || BoardState.isTerminal(board)) return;

        const canonicalKey = BoardState.getCanonicalKey(board);
        const stateData = gameTreeLoader.getState(canonicalKey);

        if (!stateData) return;

        if (currentDepth === 1) {
            // We're at the target depth, record the moves
            stateData.next_moves.forEach(move => {
                const posKey = `${targetDepth}-${move.pos}`;
                if (!seenPositions.has(posKey)) {
                    seenPositions.add(posKey);
                    movesByDepth[targetDepth].push({
                        pos: move.pos,
                        score: move.minimax_score,
                        optimal: move.is_optimal
                    });
                }
            });
        } else {
            // Keep exploring
            stateData.next_moves.forEach(move => {
                const newBoard = BoardState.stringToBoard(move.to_board);
                this.exploreDepth(newBoard, currentDepth - 1, targetDepth, movesByDepth, seenPositions);
            });
        }
    }

    // ==================== MODE 1: PLAY GAME ====================

    startPlayMode() {
        this.currentMode = 'play';
        this.currentBoard = BoardState.createEmpty();

        this.renderer.render(this.currentBoard);
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomeTree(this.currentBoard);
        this.showFeedback('Make your move!');

        this.renderer.enableClicks((position) => this.handlePlayMove(position));
    }

    handlePlayMove(position) {
        if (this.currentBoard[position] !== EMPTY) {
            this.showFeedback('Cell already occupied!', 'error');
            return;
        }

        const currentPlayer = BoardState.getCurrentPlayer(this.currentBoard);
        this.currentBoard = BoardState.makeMove(this.currentBoard, position, currentPlayer);

        this.renderer.render(this.currentBoard);
        this.renderer.animateCell(position);
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomeTree(this.currentBoard);

        // Check if game is over
        if (BoardState.isTerminal(this.currentBoard)) {
            const status = BoardState.getGameStatus(this.currentBoard);
            if (status.draw) {
                this.showFeedback('Game ended in a draw!', 'info');
            } else {
                this.showFeedback(`${status.winner} wins!`, 'optimal');
            }
            this.renderer.disableClicks();
        } else {
            this.showFeedback('Move made!');
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
        this.buildOutcomeTree(this.currentBoard);
        this.showFeedback('Find the optimal move!');

        this.renderer.enableClicks((position) => this.handlePracticeMove(position));
    }

    handlePracticeMove(position) {
        if (this.currentBoard[position] !== EMPTY) {
            this.showFeedback('Cell already occupied!', 'error');
            return;
        }

        const canonicalKey = BoardState.getCanonicalKey(this.currentBoard);
        const stateData = gameTreeLoader.getState(canonicalKey);

        if (!stateData) {
            this.showFeedback('Error: State not found!', 'error');
            return;
        }

        const currentPlayer = BoardState.getCurrentPlayer(this.currentBoard);
        const newBoard = BoardState.makeMove(this.currentBoard, position, currentPlayer);
        const newCanonicalKey = BoardState.getCanonicalKey(newBoard);

        // Find the move in next_moves
        const moveData = stateData.next_moves.find(m => {
            const moveCanonical = BoardState.getCanonicalKey(BoardState.stringToBoard(m.to_board));
            return moveCanonical === newCanonicalKey;
        });

        if (!moveData) {
            this.showFeedback('Error: Move not found!', 'error');
            return;
        }

        this.currentBoard = newBoard;
        this.renderer.render(this.currentBoard);
        this.renderer.animateCell(position);
        this.updateInfoPanel(this.currentBoard);
        this.buildOutcomeTree(this.currentBoard);

        if (moveData.is_optimal) {
            this.showFeedback('✅ Optimal move!', 'optimal');
            this.renderer.highlightCell(position, 'optimal');
        } else {
            const optimalPos = stateData.winning_move_pos;
            this.showFeedback(`⚠️ Suboptimal! Optimal: Position ${optimalPos + 1}`, 'suboptimal');
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
        this.buildOutcomeTree(this.currentBoard);

        const currentPlayer = BoardState.getCurrentPlayer(this.currentBoard);
        const playerSymbol = BoardState.getPlayerSymbol(currentPlayer);

        this.showFeedback(
            `What is the outcome for ${playerSymbol}?<br>` +
            `<button class="mode-btn" id="quizWin" style="display:inline-block; margin:0.5rem; padding:0.75rem 1.5rem;">Win</button> ` +
            `<button class="mode-btn" id="quizDraw" style="display:inline-block; margin:0.5rem; padding:0.75rem 1.5rem;">Draw</button> ` +
            `<button class="mode-btn" id="quizLoss" style="display:inline-block; margin:0.5rem; padding:0.75rem 1.5rem;">Loss</button>`
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
            this.showFeedback(`✅ Correct! ${correctText}`, 'optimal');
        } else {
            this.showFeedback(`❌ Incorrect. Answer: ${correctText}`, 'suboptimal');
        }

        setTimeout(() => this.loadQuizQuestion(), 2000);
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
