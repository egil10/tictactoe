"""
Tic-Tac-Toe Minimax Solver with Symmetry Reduction
Generates a complete, canonical, and solved game graph for 3x3 Tic-Tac-Toe.

Board Encoding:
- 9-digit string representing the 9 squares (row-major order)
- 0: Empty, 1: Player X, 2: Player O
- Example: "100020000" = X at top-left, O at center

Output: game_tree.json containing all canonical states with optimal moves
"""

import json
import itertools
from typing import Dict, List, Tuple, Optional

# Constants
EMPTY = 0
X_PLAYER = 1
O_PLAYER = 2

# Win conditions (indices for 3x3 board)
WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
    [0, 4, 8], [2, 4, 6]               # Diagonals
]

# Symmetry transformations (index mappings for 3x3 grid)
TRANSFORMATIONS = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8],  # Original
    [6, 3, 0, 7, 4, 1, 8, 5, 2],  # Rotate 90° CW
    [8, 7, 6, 5, 4, 3, 2, 1, 0],  # Rotate 180°
    [2, 5, 8, 1, 4, 7, 0, 3, 6],  # Rotate 270° CW
    [2, 1, 0, 5, 4, 3, 8, 7, 6],  # Horizontal flip
    [6, 7, 8, 3, 4, 5, 0, 1, 2],  # Vertical flip
    [0, 3, 6, 1, 4, 7, 2, 5, 8],  # Diagonal flip (main)
    [8, 5, 2, 7, 4, 1, 6, 3, 0],  # Diagonal flip (anti)
]


def board_to_string(board: List[int]) -> str:
    """Convert board array to 9-digit string."""
    return ''.join(str(cell) for cell in board)


def string_to_board(board_str: str) -> List[int]:
    """Convert 9-digit string to board array."""
    return [int(cell) for cell in board_str]


def apply_transformation(board: List[int], transformation: List[int]) -> List[int]:
    """Apply a symmetry transformation to a board."""
    return [board[i] for i in transformation]


def get_canonical_key(board: List[int]) -> str:
    """
    Get the canonical (smallest) representation of a board state.
    Considers all 8 symmetrical versions and returns the lexicographically smallest.
    """
    all_versions = [
        board_to_string(apply_transformation(board, t))
        for t in TRANSFORMATIONS
    ]
    return min(all_versions)


def check_winner(board: List[int]) -> Optional[int]:
    """
    Check if there's a winner.
    Returns: X_PLAYER, O_PLAYER, or None
    """
    for pattern in WIN_PATTERNS:
        if board[pattern[0]] != EMPTY and \
           board[pattern[0]] == board[pattern[1]] == board[pattern[2]]:
            return board[pattern[0]]
    return None


def is_terminal(board: List[int]) -> bool:
    """Check if the game is over (win or draw)."""
    return check_winner(board) is not None or EMPTY not in board


def get_current_player(board: List[int]) -> int:
    """Determine whose turn it is based on piece count."""
    x_count = board.count(X_PLAYER)
    o_count = board.count(O_PLAYER)
    return X_PLAYER if x_count == o_count else O_PLAYER


def get_legal_moves(board: List[int]) -> List[int]:
    """Get list of legal move positions."""
    return [i for i, cell in enumerate(board) if cell == EMPTY]


def minimax(board: List[int], is_maximizing: bool, memo: Dict[str, int]) -> int:
    """
    Minimax algorithm with memoization.
    
    Returns:
        +1: Win for X (maximizer)
        -1: Win for O (minimizer)
         0: Draw
    """
    # Get canonical key for memoization
    canonical_key = get_canonical_key(board)
    
    if canonical_key in memo:
        return memo[canonical_key]
    
    # Check terminal states
    winner = check_winner(board)
    if winner == X_PLAYER:
        return 1
    elif winner == O_PLAYER:
        return -1
    elif EMPTY not in board:
        return 0  # Draw
    
    # Recursive minimax
    legal_moves = get_legal_moves(board)
    
    if is_maximizing:  # X's turn (maximize)
        max_score = -float('inf')
        for move in legal_moves:
            new_board = board.copy()
            new_board[move] = X_PLAYER
            score = minimax(new_board, False, memo)
            max_score = max(max_score, score)
        memo[canonical_key] = max_score
        return max_score
    else:  # O's turn (minimize)
        min_score = float('inf')
        for move in legal_moves:
            new_board = board.copy()
            new_board[move] = O_PLAYER
            score = minimax(new_board, True, memo)
            min_score = min(min_score, score)
        memo[canonical_key] = min_score
        return min_score


def generate_game_tree() -> Dict:
    """
    Generate the complete game tree with all canonical states and optimal moves.
    """
    game_tree = {}
    memo = {}  # Minimax memoization cache
    visited = set()  # Track visited canonical states
    
    def explore_state(board: List[int]):
        """Recursively explore all game states."""
        canonical_key = get_canonical_key(board)
        
        # Skip if already processed
        if canonical_key in visited:
            return
        visited.add(canonical_key)
        
        # Skip terminal states (wins/draws)
        if is_terminal(board):
            return
        
        # Determine current player
        current_player = get_current_player(board)
        is_maximizing = (current_player == X_PLAYER)
        
        # Get best outcome for this state
        best_outcome = minimax(board, is_maximizing, memo)
        
        # Generate all legal moves with their scores
        legal_moves = get_legal_moves(board)
        move_data = []
        
        for move_pos in legal_moves:
            # Make the move
            new_board = board.copy()
            new_board[move_pos] = current_player
            
            # Score the resulting state
            move_score = minimax(new_board, not is_maximizing, memo)
            
            # Determine if this is an optimal move
            if is_maximizing:
                is_optimal = (move_score == best_outcome)
            else:
                is_optimal = (move_score == best_outcome)
            
            move_data.append({
                "pos": move_pos,
                "to_board": board_to_string(new_board),
                "minimax_score": move_score,
                "is_optimal": is_optimal
            })
            
            # Recursively explore the resulting state
            explore_state(new_board)
        
        # Find the single winning move position (first optimal move)
        winning_move_pos = None
        for move in move_data:
            if move["is_optimal"]:
                winning_move_pos = move["pos"]
                break
        
        # Store state in game tree
        game_tree[canonical_key] = {
            "turn": current_player,
            "best_outcome": best_outcome,
            "next_moves": move_data,
            "winning_move_pos": winning_move_pos
        }
    
    # Start from empty board
    initial_board = [EMPTY] * 9
    explore_state(initial_board)
    
    return game_tree


def main():
    """Main execution function."""
    print("🎮 Tic-Tac-Toe Minimax Solver with Symmetry Reduction")
    print("=" * 60)
    print("Generating complete game tree...\n")
    
    # Generate the game tree
    game_tree = generate_game_tree()
    
    # Statistics
    total_states = len(game_tree)
    initial_state = game_tree.get("000000000", {})
    
    print(f"✅ Generation complete!")
    print(f"📊 Total canonical states: {total_states}")
    print(f"🎯 Optimal outcome (X starts): {initial_state.get('best_outcome', 'N/A')} (0 = Draw)")
    print(f"🔢 Initial moves available: {len(initial_state.get('next_moves', []))}")
    
    # Save to JSON
    output_file = "game_tree.json"
    with open(output_file, 'w') as f:
        json.dump(game_tree, f, separators=(',', ':'))
    
    file_size_kb = len(json.dumps(game_tree)) / 1024
    print(f"\n💾 Saved to: {output_file}")
    print(f"📦 File size: {file_size_kb:.2f} KB")
    print("\n✨ Ready for web application!")


if __name__ == "__main__":
    main()
