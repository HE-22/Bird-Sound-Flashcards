/**
 * Fisher-Yates (aka Knuth) Shuffle Algorithm.
 * @param {Array<T>} array - The array to shuffle.
 * @returns {Array<T>} A new shuffled array.
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array]; // Create a copy
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
            shuffledArray[j],
            shuffledArray[i],
        ]; // Swap elements
    }
    return shuffledArray;
}
