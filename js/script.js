class WordleGame {
    constructor() {
        this.maxGuesses = 6;
        this.wordLength = 6;
        this.currentGuess = 0;
        this.currentLetter = 0;
        this.gameOver = false;
        this.targetWord = '';
        this.guesses = [];
        this.words = [];
        this.dictionary = new FreeDictionaryAPI();
        this.apiAvailable = false;
        this.dailyWordManager = new DailyWordManager();
        this.isDaily = true;
        this.gameComplete = false;
        
        this.board = document.querySelectorAll('.cell');
        this.keyboard = document.querySelectorAll('.key');
        this.message = document.getElementById('message');
        this.wordSourceElement = document.getElementById('wordSource');
        
        this.init();
    }
    
    async init() {
        // Check for date change first and force new day check
        const currentDate = this.dailyWordManager.getTodaysDate();
        const lastKnownDate = localStorage.getItem('wordle_last_date');
        
        console.log('Initializing game:', {
            currentDate,
            lastKnownDate,
            dateChanged: this.dailyWordManager.hasDateChanged()
        });
        
        // If date has changed, clear last known date to ensure fresh check
        if (this.dailyWordManager.hasDateChanged()) {
            console.log('New day detected! Clearing old states...');
            localStorage.removeItem('wordle_last_date');
        }
        
        // Check if player has already played today (with updated date logic)
        if (this.dailyWordManager.hasPlayedToday()) {
            this.showAlreadyPlayed();
            return;
        }
        
        this.showMessage('Testing API connection...', 'info');
        await this.testAPIConnection();
        
        this.showMessage('Loading dictionary...', 'info');
        await this.loadWords();
        await this.selectTargetWord();
        
        this.addEventListeners();
        this.loadProgress();
        this.updateDailyInfo();
        this.startTimer();
        this.setupMidnightCheck();
        this.message.textContent = '';
    }
    
    async loadWords() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt');
            const text = await response.text();
            const allWords = text.split('\n');
            
            this.words = allWords
                .filter(word => word.trim().length === this.wordLength)
                .map(word => word.trim().toUpperCase())
                .filter(word => /^[A-Z]+$/.test(word));
            
            
            if (this.words.length === 0) {
                throw new Error('No valid words found');
            }
        } catch (error) {
            this.words = [
                'PYTHON', 'JUNGLE', 'CASTLE', 'FLOWER', 'PLANET', 'WISDOM',
                'ROCKET', 'SPIRIT', 'WINDOW', 'BRIDGE', 'FOREST', 'MEADOW',
                'GOLDEN', 'SILVER', 'BRONZE', 'MARBLE', 'FABRIC', 'CAMERA',
                'GUITAR', 'VIOLIN', 'PENCIL', 'CRAYON', 'CANDLE', 'BOTTLE',
                'GARDEN', 'SQUARE', 'CIRCLE', 'STRIPE', 'SHADOW', 'BRIGHT',
                'SMOOTH', 'STRONG', 'GENTLE', 'MIGHTY', 'HUMBLE', 'SIMPLE',
                'FROZEN', 'WARMTH', 'SPRING', 'SUMMER', 'AUTUMN', 'WINTER',
                'ORANGE', 'PURPLE', 'YELLOW', 'VIOLET', 'SALMON', 'TURKEY'
            ];
            this.showMessage('Using fallback dictionary', 'info');
        }
    }

    async testAPIConnection() {
        try {
            this.wordSourceElement.textContent = 'Word source: Testing API...';
            const testResult = await this.dictionary.isValidWord('hello');
            
            if (testResult) {
                this.apiAvailable = true;
                this.wordSourceElement.textContent = 'Word source: API Connected';
                this.wordSourceElement.className = 'source-api';
            } else {
                this.apiAvailable = false;
                this.wordSourceElement.textContent = 'Word source: API Unavailable';
                this.wordSourceElement.className = 'source-fallback';
            }
        } catch (error) {
            this.apiAvailable = false;
            this.wordSourceElement.textContent = 'Word source: API Unavailable';
            this.wordSourceElement.className = 'source-fallback';
        }
    }

    async selectTargetWord() {
        // Get today's daily word
        const dailyWordData = this.dailyWordManager.getDailyWord();
        this.targetWord = dailyWordData.word;
        
        this.wordSourceElement.textContent = 'Word source: Daily Word';
        this.wordSourceElement.className = 'source-api';
        
    }
    
    addEventListeners() {
        // Prevent double-tap zoom on mobile
        this.preventDoubleTapZoom();
        
        // Optimized keyboard event handling
        this.keyboard.forEach(key => {
            const keyValue = key.getAttribute('data-key');
            
            key.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleKeyPress(keyValue);
            });
            
            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleKeyPress(keyValue);
            });
        });
        
        // Physical keyboard disabled - only on-screen keyboard allowed
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('keypress', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    preventDoubleTapZoom() {
        let lastTouchEnd = 0;
        
        // Simplified zoom prevention
        const preventZoom = (e) => {
            if (e.touches?.length > 1 || Date.now() - lastTouchEnd < 300) {
                e.preventDefault();
                return false;
            }
            lastTouchEnd = Date.now();
        };
        
        ['touchstart', 'touchend', 'touchmove', 'gesturestart', 'gesturechange', 'gestureend'].forEach(event => {
            document.addEventListener(event, preventZoom, { passive: false });
        });
    }
    
    handleKeyPress(key) {
        if (this.gameOver) return;
        
        if (key === 'Enter') {
            this.submitGuess();
        } else if (key === 'Backspace') {
            this.deleteLetter();
        } else if (key.match(/[a-zA-Z]/) && this.currentLetter < this.wordLength) {
            this.addLetter(key.toUpperCase());
        }
    }
    
    addLetter(letter) {
        if (this.currentLetter < this.wordLength) {
            const cellIndex = this.currentGuess * this.wordLength + this.currentLetter;
            this.board[cellIndex].textContent = letter;
            this.board[cellIndex].classList.add('filled');
            this.currentLetter++;
            this.saveProgress();
        }
    }
    
    deleteLetter() {
        if (this.currentLetter > 0) {
            this.currentLetter--;
            const cellIndex = this.currentGuess * this.wordLength + this.currentLetter;
            this.board[cellIndex].textContent = '';
            this.board[cellIndex].classList.remove('filled');
            this.saveProgress();
        }
    }
    
    async submitGuess() {
        if (this.currentLetter !== this.wordLength) {
            this.showMessage('Not enough letters!');
            return;
        }
        
        let guess = '';
        for (let i = 0; i < this.wordLength; i++) {
            const cellIndex = this.currentGuess * this.wordLength + i;
            guess += this.board[cellIndex].textContent;
        }
        
        this.showMessage('Checking word...', 'info');
        
        const isValidInFallback = this.words.includes(guess);
        const isValidInAPI = await this.dictionary.isValidWord(guess);
        
        if (!isValidInFallback && !isValidInAPI) {
            this.showInvalidWordFeedback();
            return;
        }
        
        this.guesses.push(guess);
        this.checkGuess(guess);
        
        if (guess === this.targetWord) {
            this.gameOver = true;
            this.gameComplete = true;
            this.showGameComplete(true, this.currentGuess + 1);
        } else if (this.currentGuess === this.maxGuesses - 1) {
            this.gameOver = true;
            this.gameComplete = true;
            this.showGameComplete(false, this.maxGuesses);
        } else {
            this.showMessage('');
        }
        
        this.currentGuess++;
        this.currentLetter = 0;
        
        // Save progress after each guess
        this.saveProgress();
    }
    
    checkGuess(guess) {
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const result = new Array(this.wordLength).fill('absent');
        
        // Check for correct letters in correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessArray[i] === targetArray[i]) {
                result[i] = 'correct';
                targetArray[i] = null; // Mark as used
            }
        }
        
        // Check for correct letters in wrong positions
        for (let i = 0; i < this.wordLength; i++) {
            if (result[i] === 'absent' && targetArray.includes(guessArray[i])) {
                result[i] = 'present';
                targetArray[targetArray.indexOf(guessArray[i])] = null; // Mark as used
            }
        }
        
        // Update the board
        for (let i = 0; i < this.wordLength; i++) {
            const cellIndex = this.currentGuess * this.wordLength + i;
            this.board[cellIndex].classList.add(result[i]);
        }
        
        // Update keyboard
        this.updateKeyboard(guess, result);
    }
    
    updateKeyboard(guess, result) {
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i];
            const keyButton = document.querySelector(`[data-key="${letter.toLowerCase()}"]`);
            
            if (keyButton) {
                // Only update if the new result is better than the current state
                if (result[i] === 'correct') {
                    keyButton.classList.remove('present', 'absent');
                    keyButton.classList.add('correct');
                } else if (result[i] === 'present' && !keyButton.classList.contains('correct')) {
                    keyButton.classList.remove('absent');
                    keyButton.classList.add('present');
                } else if (result[i] === 'absent' && !keyButton.classList.contains('correct') && !keyButton.classList.contains('present')) {
                    keyButton.classList.add('absent');
                }
            }
        }
    }
    
    showMessage(text, type = '') {
        this.message.textContent = text;
        this.message.className = `message ${type}`;
        
        if (type !== 'win' && type !== 'lose') {
            setTimeout(() => {
                this.message.textContent = '';
                this.message.className = 'message';
            }, 2000);
        }
    }

    showInvalidWordFeedback() {
        const currentRowIndex = this.currentGuess;
        const currentRow = document.querySelectorAll('.row')[currentRowIndex];
        
        // Add red glow effect to all cells in current row
        for (let i = 0; i < this.wordLength; i++) {
            const cellIndex = currentRowIndex * this.wordLength + i;
            this.board[cellIndex].classList.add('invalid');
        }
        
        // Create and show error message as centered overlay
        const errorMessage = document.createElement('div');
        errorMessage.className = 'row-error-message';
        errorMessage.textContent = 'Word not in dictionary!';
        document.body.appendChild(errorMessage);
        
        // Remove effects after 2 seconds
        setTimeout(() => {
            // Remove red glow from cells
            for (let i = 0; i < this.wordLength; i++) {
                const cellIndex = currentRowIndex * this.wordLength + i;
                this.board[cellIndex].classList.remove('invalid');
            }
            
            // Remove error message
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 2000);
    }
    
    loadProgress() {
        const progress = this.dailyWordManager.loadCurrentProgress();
        
        if (progress && progress.targetWord === this.targetWord) {
            // Restore game state
            this.currentGuess = progress.currentGuess || 0;
            this.currentLetter = progress.currentLetter || 0;
            this.guesses = progress.guesses || [];
            
            // Restore board state
            this.restoreBoard(progress.boardState || []);
            this.restoreKeyboard(progress.keyboardState || {});
            
        } else {
            this.resetBoard();
        }
    }

    saveProgress() {
        if (this.gameOver) return;
        
        const boardState = [];
        this.board.forEach(cell => {
            boardState.push({
                text: cell.textContent,
                classes: cell.className
            });
        });
        
        const keyboardState = {};
        this.keyboard.forEach(key => {
            const keyValue = key.getAttribute('data-key');
            keyboardState[keyValue] = {
                classes: key.className
            };
        });
        
        const progress = {
            currentGuess: this.currentGuess,
            currentLetter: this.currentLetter,
            guesses: this.guesses,
            targetWord: this.targetWord,
            boardState: boardState,
            keyboardState: keyboardState
        };
        
        this.dailyWordManager.saveCurrentProgress(progress);
    }

    restoreBoard(boardState) {
        this.board.forEach((cell, index) => {
            if (boardState[index]) {
                cell.textContent = boardState[index].text || '';
                cell.className = boardState[index].classes || 'cell';
            } else {
                cell.textContent = '';
                cell.className = 'cell';
            }
        });
    }

    restoreKeyboard(keyboardState) {
        this.keyboard.forEach(key => {
            const keyValue = key.getAttribute('data-key');
            if (keyboardState[keyValue]) {
                key.className = keyboardState[keyValue].classes || 'key';
            } else {
                key.className = 'key';
            }
        });
    }

    resetBoard() {
        this.board.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.keyboard.forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
        
        this.message.textContent = '';
        this.message.className = 'message';
    }

    showAlreadyPlayed() {
        const stats = this.dailyWordManager.getTodayStats();
        const currentDate = this.dailyWordManager.getTodaysDate();
        const container = document.querySelector('.container');
        
        container.innerHTML = `
            <header>
                <h1>6-Letter Wordle</h1>
                <p class="subtitle">By Uma Yeruva</p>
            </header>
            <main>
                <div class="already-played">
                    <h3>You've already played today!</h3>
                    <p>Come back tomorrow for a new word.</p>
                    <div style="margin: 20px 0;">
                        <strong>Today's Stats:</strong><br>
                        Result: ${stats.won ? '🎉 Won' : '❌ Lost'}<br>
                        Attempts: ${stats.attempts}/6<br>
                        Completed: ${new Date(stats.completedAt).toLocaleTimeString()}
                    </div>
                    <div style="margin: 10px 0; font-size: 12px; color: #818384;">
                        Current Date: ${currentDate}<br>
                        CST Time: ${this.dailyWordManager.getCSTDate().toLocaleString()}
                    </div>
                    <br>
                    <div class="timer-display" id="nextWordTimer"></div>
                </div>
            </main>
        `;
        
        this.startTimer();
        this.setupMidnightCheck();
    }


    getCompletionMessage(won, attempts) {
        if (!won) {
            return {
                title: '💔 The word won this time… Try again tomorrow!',
                message: `The word was: <strong>${this.targetWord}</strong><br>Come back tomorrow for a new chance!`
            };
        }

        const messages = {
            1: {
                title: '🧠 GENIUS! You just read its mind.',
                message: `Incredible! You solved it in just <strong>1 guess</strong>!`
            },
            2: {
                title: '⚡ Sharp as a blade! Almost psychic.',
                message: `Amazing! You solved it in <strong>2 guesses</strong>!`
            },
            3: {
                title: '🎯 Bullseye! You\'ve got the touch.',
                message: `Excellent! You solved it in <strong>3 guesses</strong>!`
            },
            4: {
                title: '🕵️ Sleuth mode: Activated. Solid work!',
                message: `Great job! You solved it in <strong>4 guesses</strong>!`
            },
            5: {
                title: '😅 That was close… But you made it!',
                message: `Phew! You solved it in <strong>5 guesses</strong>!`
            },
            6: {
                title: '⏳ Just in time! You never gave up.',
                message: `Close call! You solved it in <strong>6 guesses</strong>!`
            }
        };

        return messages[attempts] || messages[6];
    }

    showGameComplete(won, attempts) {
        // Save game state
        const gameState = {
            won: won,
            attempts: attempts,
            guesses: this.guesses.map((guess, index) => ({
                word: guess,
                result: this.getGuessResult(guess)
            })),
            targetWord: this.targetWord
        };
        
        this.dailyWordManager.saveGameState(gameState);
        
        // Trigger confetti for first attempt genius wins!
        if (won && attempts === 1) {
            setTimeout(() => {
                this.triggerConfetti();
            }, 1000); // Delay confetti slightly for better effect
        }
        
        // Show overlay with appreciation message first
        const completion = this.getCompletionMessage(won, attempts);
        this.showCompletionOverlay(completion);
        
        // Show full completion UI below after a delay
        setTimeout(() => {
            const completionMessage = document.getElementById('completionMessage');
            const gameCompleteDiv = document.getElementById('gameComplete');
            
            completionMessage.innerHTML = `
                The word was: <strong>${this.targetWord}</strong><br><br>
                Come back tomorrow for a new challenge!
            `;
            
            gameCompleteDiv.style.display = 'block';
        }, 3000); // Show detailed info after 3 seconds
    }

    showCompletionOverlay(completion) {
        const overlay = document.getElementById('completionOverlay');
        const overlayTitle = document.getElementById('overlayTitle');
        const overlayMessage = document.getElementById('overlayMessage');
        
        overlayTitle.textContent = completion.title;
        overlayMessage.innerHTML = completion.message;
        
        // Show overlay
        overlay.style.display = 'flex';
        
        // Auto-hide overlay after 3 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 3000);
        
        // Allow clicking overlay to dismiss early
        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
    }

    getGuessResult(guess) {
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const result = new Array(this.wordLength).fill('absent');
        
        // Check for correct letters in correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessArray[i] === targetArray[i]) {
                result[i] = 'correct';
                targetArray[i] = null;
            }
        }
        
        // Check for correct letters in wrong positions
        for (let i = 0; i < this.wordLength; i++) {
            if (result[i] === 'absent' && targetArray.includes(guessArray[i])) {
                result[i] = 'present';
                targetArray[targetArray.indexOf(guessArray[i])] = null;
            }
        }
        
        return result;
    }

    updateDailyInfo() {
        const dailyDate = document.getElementById('dailyDate');
        const today = this.dailyWordManager.getTodaysDate();
        dailyDate.textContent = `Daily Word: ${today}`;
    }

    startTimer() {
        const updateTimer = () => {
            const timeUntilNext = this.dailyWordManager.getDaysUntilNext();
            const timerElement = document.getElementById('nextWordTimer') || 
                                document.querySelector('.timer-display');
            
            if (timerElement) {
                timerElement.textContent = `Next word in: ${timeUntilNext.hours}h ${timeUntilNext.minutes}m`;
            }
        };
        
        updateTimer();
        setInterval(updateTimer, 60000); // Update every minute
    }

    setupMidnightCheck() {
        // Unified date change monitoring
        const checkDateChange = () => {
            if (this.dailyWordManager.hasDateChanged()) {
                location.reload();
            }
        };

        // Regular check every 30 seconds
        setInterval(checkDateChange, 30000);

        // Intensive check near midnight
        setInterval(() => {
            const secondsUntilMidnight = this.dailyWordManager.getSecondsUntilMidnight();
            if (secondsUntilMidnight <= 60 && secondsUntilMidnight > 0) {
                const intensiveCheck = setInterval(() => {
                    checkDateChange();
                    if (this.dailyWordManager.getSecondsUntilMidnight() > 60) {
                        clearInterval(intensiveCheck);
                    }
                }, 5000);
            }
        }, 60000);
    }

    createConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                background: ${colors[i % colors.length]};
                left: ${Math.random() * 100}%;
                width: ${Math.random() * 6 + 4}px;
                height: ${Math.random() * 6 + 4}px;
                animation-duration: ${Math.random() * 2 + 2}s;
                animation-delay: ${Math.random()}s;
            `;
            container.appendChild(confetti);
        }

        setTimeout(() => document.body.removeChild(container), 5000);
    }

    triggerConfetti() {
        // Create confetti effect
        this.createConfetti();
        
        // Add some extra visual effects
        const gameBoard = document.querySelector('.game-board');
        gameBoard.style.animation = 'celebrate 0.6s ease-in-out';
        
        setTimeout(() => {
            gameBoard.style.animation = '';
        }, 600);
    }
}

// Global functions for buttons
function shareResults() {
    const wordleGame = window.wordleGame;
    if (wordleGame && wordleGame.gameComplete) {
        const gameState = wordleGame.dailyWordManager.loadGameState();
        const shareText = wordleGame.dailyWordManager.getShareText(gameState);
        
        if (navigator.share) {
            navigator.share({
                title: '6-Letter Wordle',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Results copied to clipboard!');
            }).catch(() => {
                // Fallback: show text in alert
                alert('Share your results:\n\n' + shareText);
            });
        }
    }
}

function goToAdmin() {
    window.location.href = 'admin/admin-panel.html';
}




// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    
    window.wordleGame = new WordleGame();
});