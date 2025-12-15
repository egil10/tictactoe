/**
 * Board Renderer Module
 * Handles visual rendering and user interaction with the game board
 */

import { EMPTY, X_PLAYER, O_PLAYER, BoardState } from './boardState.js';

class BoardRenderer {
    constructor(boardElement) {
        this.boardElement = boardElement;
        this.cells = Array.from(boardElement.querySelectorAll('.cell'));
        this.onCellClick = null;
    }

    /**
     * Render the board state
     */
    render(board, highlightOptimal = false, optimalPositions = []) {
        this.cells.forEach((cell, index) => {
            const value = board[index];

            // Clear previous classes
            cell.classList.remove('cell-x', 'cell-o', 'cell-optimal', 'cell-suboptimal', 'disabled');
            cell.textContent = '';

            // Set content based on value
            if (value === X_PLAYER) {
                cell.textContent = 'X';
                cell.classList.add('cell-x', 'disabled');
            } else if (value === O_PLAYER) {
                cell.textContent = 'O';
                cell.classList.add('cell-o', 'disabled');
            }

            // Highlight optimal moves
            if (highlightOptimal && optimalPositions.includes(index) && value === EMPTY) {
                cell.classList.add('cell-optimal');
            }
        });
    }

    /**
     * Enable cell clicks
     */
    enableClicks(clickHandler) {
        this.onCellClick = clickHandler;
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => {
                if (!cell.classList.contains('disabled') && this.onCellClick) {
                    this.onCellClick(index);
                }
            });
        });
    }

    /**
     * Disable all clicks
     */
    disableClicks() {
        this.cells.forEach(cell => {
            cell.classList.add('disabled');
        });
    }

    /**
     * Highlight a specific cell (for feedback)
     */
    highlightCell(position, type = 'optimal') {
        const cell = this.cells[position];
        if (cell) {
            cell.classList.add(`cell-${type}`);
        }
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        this.cells.forEach(cell => {
            cell.classList.remove('cell-optimal', 'cell-suboptimal');
        });
    }

    /**
     * Animate cell update
     */
    animateCell(position) {
        const cell = this.cells[position];
        if (cell) {
            cell.style.animation = 'none';
            setTimeout(() => {
                cell.style.animation = '';
            }, 10);
        }
    }

    /**
     * Show winning line (visual feedback)
     */
    showWinningLine(pattern) {
        pattern.forEach(position => {
            const cell = this.cells[position];
            if (cell) {
                cell.style.background = 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(167, 139, 250, 0.3))';
            }
        });
    }

    /**
     * Reset board visually
     */
    reset() {
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.background = '';
            cell.style.animation = '';
        });
    }
}

export default BoardRenderer;
