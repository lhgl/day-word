document.getElementById('save-settings').addEventListener('click', function() {
    const chances = document.getElementById('chances').value;
    const maxLetters = document.getElementById('max-letters').value;

    // Save settings to hidden inputs
    document.getElementById('solve-form').dataset.chances = chances;
    document.getElementById('solve-form').dataset.maxLetters = maxLetters;

    // Populate position options based on maxLetters
    const positionSelect = document.getElementById('position');
    positionSelect.innerHTML = '';
    for (let i = 1; i <= maxLetters; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        positionSelect.appendChild(option);
    }

    // Show the solve form and hide the settings form
    document.getElementById('settings-form').style.display = 'none';
    document.getElementById('solve-form').style.display = 'block';

    // Display the settings information
    const settingsInfo = document.getElementById('settings-info');
    settingsInfo.innerHTML = `<p>Number of chances: ${chances}</p><p>Maximum word length: ${maxLetters}</p>`;
    settingsInfo.style.display = 'block';

    // Initialize the word display
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.textContent = '_ '.repeat(maxLetters).trim();

    // Initialize the possible letters display
    const possibleLetters = document.getElementById('possible-letters');
    possibleLetters.innerHTML = '';
    const table = document.createElement('table');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < alphabet.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < maxLetters; j++) {
            const cell = document.createElement('td');
            cell.textContent = alphabet[i];
            cell.dataset.position = j + 1;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    possibleLetters.appendChild(table);
});

document.getElementById('status').addEventListener('change', function() {
    const status = document.getElementById('status').value;
    const positionLabel = document.getElementById('position-label');
    const positionSelect = document.getElementById('position');
    if (status === 'absent') {
        positionLabel.style.display = 'none';
        positionSelect.style.display = 'none';
    } else {
        positionLabel.style.display = 'inline';
        positionSelect.style.display = 'inline';
    }
});

document.getElementById('add-clue').addEventListener('click', function() {
    const letter = document.getElementById('letter').value.toUpperCase();
    const status = document.getElementById('status').value;
    const position = status !== 'absent' ? document.getElementById('position').value : null;

    let statusEmoji;
    if (status === 'correct') {
        statusEmoji = '✅';
    } else if (status === 'present') {
        statusEmoji = '🟡';
    } else if (status === 'absent') {
        statusEmoji = '❌';
    }

    const clueList = document.getElementById('clue-list');
    const clueItem = document.createElement('li');
    clueItem.dataset.letter = letter;
    clueItem.dataset.status = status;
    clueItem.dataset.position = position;
    clueItem.innerHTML = `Letter: <strong>${letter}</strong>, Status: ${statusEmoji}` + (position ? `, Position: ${position}` : '');
    
    const removeButton = document.createElement('button');
    removeButton.textContent = '✖';
    removeButton.style.marginLeft = '10px';
    removeButton.addEventListener('click', function() {
        clueList.removeChild(clueItem);
        updateCluesInput();
        updateWordDisplay();

        // Add the letter back to the select options if it was marked as absent
        if (status === 'absent') {
            const letterSelect = document.getElementById('letter');
            const option = document.createElement('option');
            option.value = letter.toLowerCase();
            option.textContent = letter.toUpperCase();
            letterSelect.appendChild(option);
        }

        // Add the position back to the select options if it was marked as correct
        if (status === 'correct') {
            const positionSelect = document.getElementById('position');
            const option = document.createElement('option');
            option.value = position;
            option.textContent = position;
            positionSelect.appendChild(option);
        }
    });
    
    clueItem.appendChild(removeButton);
    clueList.appendChild(clueItem);

    // Remove the position from the select options if it was marked as correct
    if (status === 'correct') {
        const positionSelect = document.getElementById('position');
        const optionToRemove = positionSelect.querySelector(`option[value="${position}"]`);
        if (optionToRemove) {
            positionSelect.removeChild(optionToRemove);
        }
    }

    updateCluesInput();
    updateWordDisplay();
});

function updateCluesInput() {
    const clueList = document.getElementById('clue-list');
    const clues = [];
    clueList.querySelectorAll('li').forEach(clueItem => {
        const letter = clueItem.dataset.letter;
        const status = clueItem.dataset.status;
        const position = clueItem.dataset.position;
        clues.push(`${letter} ${position || ''} ${status}`);
    });
    document.getElementById('clues').value = clues.join(',');
}

function updatePossibleLetters(clues, maxLetters) {
    const possibleLetters = Array.from({ length: maxLetters }, () => new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));

    clues.forEach(clue => {
        const pos = clue.position - 1;
        if (clue.status === 'correct') {
            possibleLetters[pos] = new Set([clue.letter]);
            for (let i = 0; i < maxLetters; i++) {
                if (i !== pos) {
                    possibleLetters[i].delete(clue.letter);
                }
            }
        } else if (clue.status === 'present') {
            possibleLetters[pos].delete(clue.letter);
        } else if (clue.status === 'absent') {
            possibleLetters.forEach(set => set.delete(clue.letter));
        }
    });

    // Verificar se todas as letras distintas foram encontradas
    const relevantClues = clues.filter(clue => clue.status === 'present' || clue.status === 'correct');
    const distinctLetters = new Set(relevantClues.map(clue => clue.letter));
    if (distinctLetters.size === Number(maxLetters)) {
        possibleLetters.forEach((set, index) => {
            set.forEach(letter => {
                if (!distinctLetters.has(letter)) {
                    set.delete(letter);
                }
            });
        });
    }

    return possibleLetters;
}

function updateWordDisplay() {
    const maxLetters = parseInt(document.getElementById('solve-form').dataset.maxLetters);
    const cluesInput = document.getElementById('clues').value;
    const clues = cluesInput.split(',').filter(clue => clue.trim() !== '').map(clue => {
        const [letter, position, status] = clue.trim().split(' ');
        return { letter: letter.toUpperCase(), position: parseInt(position), status };
    });

    let wordDisplay = '_ '.repeat(maxLetters).trim().split(' ');
    const possibleLetters = updatePossibleLetters(clues, maxLetters);

    clues.forEach(clue => {
        const pos = clue.position - 1;
        if (clue.status === 'correct') {
            wordDisplay[pos] = clue.letter;
        }
    });

    console.log(`Word display: ${wordDisplay.join(' ')}`);
    document.getElementById('word-display').textContent = wordDisplay.join(' ');

    const possibleLettersDiv = document.getElementById('possible-letters');
    possibleLettersDiv.innerHTML = '';
    const table = document.createElement('table');
    for (let i = 0; i < 26; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < maxLetters; j++) {
            const cell = document.createElement('td');
            const letter = String.fromCharCode(65 + i); // 'A' is 65 in ASCII
            if (possibleLetters[j].has(letter)) {
                cell.textContent = letter;
            } else {
                cell.textContent = '';
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    possibleLettersDiv.appendChild(table);
}

function generateCombinations(possibleLetters, length, prefix = '', combinations = [], limit = 1000) {
    if (combinations.length >= limit) {
        return combinations;
    }
    if (prefix.length === length) {
        combinations.push(prefix);
        return combinations;
    }

    const pos = prefix.length;
    if (possibleLetters[pos] && possibleLetters[pos].size > 0) {
        possibleLetters[pos].forEach(letter => {
            generateCombinations(possibleLetters, length, prefix + letter, combinations, limit);
        });
    }

    return combinations;
}

function isValidWord(word) {
    return true; // Supondo que todas as combinações são válidas para este exemplo
}

function generateValidWords(possibleLetters, length, limit = 100) {
    const combinations = generateCombinations(possibleLetters, length, '', [], limit);
    return combinations.filter(isValidWord);
}

let currentPage = 0;
const pageSize = 100;

function updatePossibleWords() {
    const maxLetters = parseInt(document.getElementById('solve-form').dataset.maxLetters);
    const cluesInput = document.getElementById('clues').value;
    const clues = cluesInput.split(',').filter(clue => clue.trim() !== '').map(clue => {
        const [letter, position, status] = clue.trim().split(' ');
        return { letter: letter.toUpperCase(), position: parseInt(position), status };
    });

    const possibleLetters = updatePossibleLetters(clues, maxLetters);
    const validWords = generateValidWords(possibleLetters, maxLetters);
    console.log('Valid words:', validWords);

    displayWords(validWords);
}

function displayWords(words) {
    console.log('Displaying words:', words); // Log para verificar as palavras recebidas

    const start = currentPage * pageSize;
    const end = start + pageSize;
    const paginatedWords = words.slice(start, end);

    console.log('Paginated words:', paginatedWords); // Log para verificar as palavras paginadas

    document.getElementById('result').innerText = `Possible words: ${paginatedWords.join(', ')}`;
    document.getElementById('pagination').innerText = `Page ${currentPage + 1} of ${Math.ceil(words.length / pageSize)}`;
}

document.getElementById('next-page').addEventListener('click', function() {
    currentPage++;
    updatePossibleWords();
});

document.getElementById('prev-page').addEventListener('click', function() {
    if (currentPage > 0) {
        currentPage--;
    }
    updatePossibleWords();
});

document.getElementById('solve-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const chances = document.getElementById('solve-form').dataset.chances;
    const maxLetters = document.getElementById('solve-form').dataset.maxLetters;
    const cluesInput = document.getElementById('clues').value;
    const clues = cluesInput.split(',').filter(clue => clue.trim() !== '').map(clue => {
        const [letter, position, status] = clue.trim().split(' ');
        return { letter, position: parseInt(position), status };
    });

    // Chame a função para atualizar as possíveis palavras
    updatePossibleWords();

    const response = await fetch('/solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chances, maxLetters, clues })
    });
    const data = await response.json();
    //document.getElementById('result').innerText = `Possible words: ${data.possibleWords.join(', ')}`;
});