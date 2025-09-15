const gridSize = 6;
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const directions = [
    { x: 0, y: 1 },   // Horizontal
    { x: 1, y: 0 },   // Vertical
    { x: 1, y: 1 },   // Diagonal down-right
    { x: 1, y: -1 },  // Diagonal down-left
    { x: 0, y: -1 },  // Horizontal left
    { x: -1, y: 0 },  // Vertical up
    { x: -1, y: -1 }, // Diagonal up-left
    { x: -1, y: 1 },  // Diagonal up-right
];

export const generatePuzzleGrid = (words) => {
    let grid = Array(gridSize * gridSize).fill(null);
    let placedWords = [];

    for (const word of words) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const startX = Math.floor(Math.random() * gridSize);
            const startY = Math.floor(Math.random() * gridSize);
            const startIndex = startY * gridSize + startX;

            let currentX = startX;
            let currentY = startY;
            let fits = true;
            let wordIndices = [];

            for (let i = 0; i < word.length; i++) {
                if (
                    currentX < 0 || currentX >= gridSize ||
                    currentY < 0 || currentY >= gridSize
                ) {
                    fits = false;
                    break;
                }

                const index = currentY * gridSize + currentX;
                if (grid[index] !== null && grid[index] !== word[i]) {
                    fits = false;
                    break;
                }
                
                wordIndices.push(index);
                currentX += direction.x;
                currentY += direction.y;
            }

            if (fits) {
                for (let i = 0; i < word.length; i++) {
                    grid[wordIndices[i]] = word[i];
                }
                placedWords.push(word);
                placed = true;
            }
            attempts++;
        }
    }

    // Fill the rest of the grid with random letters
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === null) {
            grid[i] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
    }

    if (placedWords.length !== words.length) {
        console.warn("Could not place all words. Consider a larger grid or fewer/shorter words.");
    }
    
    return grid;
};
