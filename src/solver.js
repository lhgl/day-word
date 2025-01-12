class Solver {
    constructor() {
        this.allWords = ['apple', 'berry', 'cherry', 'dates', 'elder']; // Example word list
    }

    solve(clues) {
        const possibleWords = this.getPossibleWords(clues);
        return possibleWords;
    }

    getPossibleWords(clues) {
        return this.allWords.filter(word => {
            return clues.every(clue => {
                const { letter, position, status } = clue;
                if (status === 'correct') {
                    return word[position - 1] === letter;
                } else if (status === 'present') {
                    return word.includes(letter) && word[position - 1] !== letter;
                } else if (status === 'absent') {
                    return !word.includes(letter);
                }
                return true;
            });
        });
    }
}

module.exports = Solver;