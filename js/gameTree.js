/**
 * Game Tree Loader Module
 * Handles loading and accessing the solved game tree data
 */

class GameTreeLoader {
    constructor() {
        this.gameTree = null;
        this.isLoaded = false;
    }

    /**
     * Load the game tree from JSON file
     */
    async load() {
        try {
            const response = await fetch('game_tree.json');
            if (!response.ok) {
                throw new Error(`Failed to load game tree: ${response.statusText}`);
            }
            this.gameTree = await response.json();
            this.isLoaded = true;
            console.log(`✅ Game tree loaded: ${Object.keys(this.gameTree).length} canonical states`);
            return true;
        } catch (error) {
            console.error('❌ Error loading game tree:', error);
            return false;
        }
    }

    /**
     * Get state data for a canonical board key
     */
    getState(canonicalKey) {
        if (!this.isLoaded) {
            throw new Error('Game tree not loaded');
        }
        return this.gameTree[canonicalKey] || null;
    }

    /**
     * Get all non-terminal states (for random position selection)
     */
    getAllNonTerminalStates() {
        if (!this.isLoaded) {
            throw new Error('Game tree not loaded');
        }
        return Object.keys(this.gameTree);
    }

    /**
     * Get a random non-terminal state
     */
    getRandomState() {
        const states = this.getAllNonTerminalStates();
        const randomIndex = Math.floor(Math.random() * states.length);
        return states[randomIndex];
    }

    /**
     * Check if game tree is loaded
     */
    isReady() {
        return this.isLoaded;
    }
}

// Create singleton instance
const gameTreeLoader = new GameTreeLoader();

export default gameTreeLoader;
