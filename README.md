# 🎮 TicTacToe Mastery

**An interactive learning platform powered by solved game theory**

Master the perfect game of Tic-Tac-Toe through AI-powered learning modes. This application uses a complete solution of the 3×3 Tic-Tac-Toe game generated via the Minimax algorithm with symmetry reduction!

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://egil10.github.io/tictactoe/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- **📊 Solved Game Tree**: Complete solution with 627 unique canonical states
- **🎯 Strategy Practice**: Learn optimal moves from random mid-game positions
- **🧠 Position Quiz**: Test your ability to evaluate positions
- **🤖 Perfect AI Opponent**: Challenge an unbeatable AI that always plays optimally
- **📈 Progress Tracking**: Monitor your accuracy and improvement over time
- **🎨 Premium Design**: Modern, responsive UI with smooth animations

## 🚀 Quick Start

### Option 1: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/egil10/tictactoe.git
   cd tictactoe
   ```

2. **Generate the game tree** (if not included)
   ```bash
   python generate_game_tree.py
   ```

3. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

### Option 2: GitHub Pages

This application is live at: **https://egil10.github.io/tictactoe/**

## 📁 Project Structure

```
tictactoe/
├── generate_game_tree.py      # Minimax solver script
├── game_tree.json              # Generated game data (627 states)
├── index.html                  # Main web application
├── css/
│   └── styles.css              # Premium styling
├── js/
│   ├── app.js                  # Main application controller
│   ├── gameTree.js             # Game tree loader
│   ├── boardState.js           # State management
│   ├── boardRenderer.js        # UI rendering
│   └── gameModes.js            # Game mode logic
└── README.md                   # This file
```

## 🎓 How It Works

### Data Generation (Minimax Algorithm)

The Python script `generate_game_tree.py` implements:

1. **Board Encoding**: 9-digit strings representing board states
   - `0` = Empty cell
   - `1` = Player X
   - `2` = Player O
   - Example: `"100020000"` = X at top-left, O at center

2. **Symmetry Reduction**: Reduces ~255,168 sequences to **627 unique canonical states**
   - Considers 8 transformations (4 rotations + 4 reflections)
   - Uses lexicographically smallest representation as canonical key

3. **Minimax Solver**: Determines optimal outcome for every state
   - Terminal win (X): +1
   - Terminal win (O): -1
   - Draw: 0
   - Memoization prevents recomputation

### Game Tree Structure

The `game_tree.json` file contains:

```json
{
  "000000000": {
    "turn": 1,
    "best_outcome": 0,
    "next_moves": [
      {
        "pos": 0,
        "to_board": "100000000",
        "minimax_score": 0,
        "is_optimal": true
      }
    ]
  }
}
```

### Learning Modes

1. **Strategy Practice**
   - Play from random mid-game positions
   - Receive instant feedback on each move
   - Learn which moves are optimal vs suboptimal

2. **Position Quiz**
   - Evaluate whether a position is winning, losing, or drawing
   - Test your understanding of game theory
   - Track your accuracy

3. **AI Opponent**
   - Play against perfect AI from the start
   - AI always selects moves marked `is_optimal: true`
   - Experience forced draws (with perfect play)

## 🎨 Technology Stack

- **Backend**: Pure Python 3 (data generation)
- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6+ modules)
- **Typography**: Google Fonts (Inter, Outfit)
- **Design**: Custom CSS with glassmorphism and animations
- **Hosting**: GitHub Pages (static)

## 🧮 Game Theory Insights

- **Total possible games**: ~255,168 unique sequences
- **Canonical states**: 627 (after symmetry reduction)
- **Optimal outcome**: Always a **draw** with perfect play from both sides
- **State space reduction**: ~99.75% compression via symmetry

### Fun Facts

- 💡 From the starting position, there are 9 equally optimal first moves for X
- 💡 The center and corners are strategically equivalent after symmetry reduction
- 💡 Perfect play from both players guarantees a draw 100% of the time

## 🛠️ Development

### Regenerate Game Tree

```bash
python generate_game_tree.py
```

Expected output:
```
✅ Generation complete!
📊 Total canonical states: 627
🎯 Optimal outcome (X starts): 0 (Draw)
💾 Saved to: game_tree.json
📦 File size: ~209 KB
```

### Modify Styles

All styling is in `css/styles.css`. Key design tokens:

- **Primary Accent**: `#7c3aed` (Purple)
- **Secondary Accent**: `#a78bfa` (Light Purple)
- **Background**: Dark gradient (`#0a0e27` to `#1a1030`)
- **Typography**: Inter (body), Outfit (headings)

### Add New Features

The modular structure makes it easy to extend:

- `gameTree.js`: Add data filtering/search
- `boardState.js`: Add board analysis utilities
- `boardRenderer.js`: Add new visual effects
- `gameModes.js`: Add new learning modes

## 📊 Statistics

Track your learning progress:

- **Optimal Moves**: Moves matching the perfect strategy
- **Suboptimal Moves**: Moves that don't maximize the outcome
- **Accuracy**: Percentage of optimal decisions

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Minimax Algorithm**: Classic game theory algorithm
- **Symmetry Reduction**: Inspired by combinatorial game theory research
- **Design Inspiration**: Modern web design best practices

## 📧 Contact

Created by [@egil10](https://github.com/egil10)

---

**💡 Remember**: In Tic-Tac-Toe, the only winning move is not to lose!