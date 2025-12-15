/**
 * Board State Manager Module
 * Handles board state encoding, canonical key generation, and move validation
 */

// Constants
const EMPTY = 0;
const X_PLAYER = 1;
const O_PLAYER = 2;

// Win patterns (indices for 3x3 board)
const WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
    [0, 4, 8], [2, 4, 6]               // Diagonals
];

// Symmetry transformations (index mappings)
const TRANSFORMATIONS = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8],  // Original
    [6, 3, 0, 7, 4, 1, 8, 5, 2],  // Rotate 90° CW
    [8, 7, 6, 5, 4, 3, 2, 1, 0],  // Rotate 180°
    [2, 5, 8, 1, 4, 7, 0, 3, 6],  // Rotate 270° CW
    [2, 1, 0, 5, 4, 3, 8, 7, 6],  // Horizontal flip
    [6, 7, 8, 3, 4, 5, 0, 1, 2],  // Vertical flip
    [0, 3, 6, 1, 4, 7, 2, 5, 8],  // Diagonal flip (main)
    [8, 5, 2, 7, 4, 1, 6, 3, 0],  // Diagonal flip (anti)
];

class BoardState {
    /**
     * Convert board array to string
     */
    static boardToString(board) {
        return board.join('');
    }

    /**
     * Convert board string to array
     */
    static stringToBoard(boardStr) {
        return boardStr.split('').map(c => parseInt(c));
    }

    /**
     * Apply a transformation to a board
     */
    static applyTransformation(board, transformation) {
        return transformation.map(i => board[i]);
    }

    /**
     * Get canonical (smallest) representation of a board
     */
    static getCanonicalKey(board) {
        const allVersions = TRANSFORMATIONS.map(t =>
            this.boardToString(this.applyTransformation(board, t))
        );
        return allVersions.sort()[0];  // Lexicographically smallest
    }

    /**
     * Check for a winner
     * Returns: X_PLAYER, O_PLAYER, or null
     */
    static checkWinner(board) {
        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            if (board[a] !== EMPTY &&
                board[a] === board[b] &&
                board[b] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    /**
     * Check if game is over
     */
    static isTerminal(board) {
        return this.checkWinner(board) !== null || !board.includes(EMPTY);
    }

    /**
     * Get current player based on piece count
     */
    static getCurrentPlayer(board) {
        const xCount = board.filter(c => c === X_PLAYER).length;
        const oCount = board.filter(c => c === O_PLAYER).length;
        return xCount === oCount ? X_PLAYER : O_PLAYER;
    }

    /**
     * Get list of legal move positions
     */
    static getLegalMoves(board) {
        return board
            .map((cell, index) => cell === EMPTY ? index : null)
            .filter(index => index !== null);
    }

    /**
     * Make a move on the board
     */
    static makeMove(board, position, player) {
        if (board[position] !== EMPTY) {
            throw new Error('Invalid move: position already occupied');
        }
        const newBoard = [...board];
        newBoard[position] = player;
        return newBoard;
    }

    /**
     * Get game status
     */
    static getGameStatus(board) {
        const winner = this.checkWinner(board);
        if (winner === X_PLAYER) {
            return { over: true, winner: 'X', draw: false };
        }
        if (winner === O_PLAYER) {
            return { over: true, winner: 'O', draw: false };
        }
        if (!board.includes(EMPTY)) {
            return { over: true, winner: null, draw: true };
        }
        return { over: false, winner: null, draw: false };
    }

    /**
     * Create an empty board
     */
    static createEmpty() {
        return Array(9).fill(EMPTY);
    }

    /**
     * Get player symbol
     */
    static getPlayerSymbol(player) {
        if (player === X_PLAYER) return 'X';
        if (player === O_PLAYER) return 'O';
        return '';
    }

    /**
     * Get outcome description
     */
    static getOutcomeDescription(score, currentPlayer) {
        if (score === 1) {
            return currentPlayer === X_PLAYER ? 'Win for X' : 'Loss for X';
        }
        if (score === -1) {
            return currentPlayer === O_PLAYER ? 'Win for O' : 'Loss for O';
        }
        return 'Draw';
    }
}

// Export constants and class
export { EMPTY, X_PLAYER, O_PLAYER, BoardState };
