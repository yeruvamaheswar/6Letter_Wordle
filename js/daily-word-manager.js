class DailyWordManager {
    constructor() {
        this.storageKey = 'wordle_daily_words';
        this.gameStateKey = 'wordle_game_state';
        this.adminKey = 'wordle_admin_session';
        this.passwordKey = 'wordle_admin_password';
        this.defaultPassword = 'admin123'; // Default password
        
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialWords = this.generateInitialWords();
            localStorage.setItem(this.storageKey, JSON.stringify(initialWords));
        }
    }

    generateInitialWords() {
        const baseDate = new Date('2024-01-01');
        const words = [
            'PYTHON', 'JUNGLE', 'CASTLE', 'FLOWER', 'PLANET', 'WISDOM',
            'ROCKET', 'SPIRIT', 'WINDOW', 'BRIDGE', 'FOREST', 'MEADOW',
            'GOLDEN', 'SILVER', 'BRONZE', 'MARBLE', 'FABRIC', 'CAMERA',
            'GUITAR', 'VIOLIN', 'PENCIL', 'CRAYON', 'CANDLE', 'BOTTLE',
            'GARDEN', 'SQUARE', 'CIRCLE', 'STRIPE', 'SHADOW', 'BRIGHT',
            'SMOOTH', 'STRONG', 'GENTLE', 'MIGHTY', 'HUMBLE', 'SIMPLE',
            'FROZEN', 'WARMTH', 'SPRING', 'SUMMER', 'AUTUMN', 'WINTER',
            'ORANGE', 'PURPLE', 'YELLOW', 'VIOLET', 'SALMON', 'TURKEY',
            'NATURE', 'BEAUTY', 'FRIEND', 'FAMILY', 'HEALTH', 'FUTURE',
            'DREAMS', 'VISION', 'CHANGE', 'GROWTH', 'SKILLS', 'TALENT'
        ];

        const dailyWords = {};
        for (let i = 0; i < 365; i++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + i);
            const dateStr = this.formatDate(date);
            dailyWords[dateStr] = words[i % words.length];
        }

        return dailyWords;
    }

    formatDate(date) {
        // Convert to CST timezone (UTC-6, or UTC-5 during daylight saving)
        // Get current time in CST
        const now = new Date();
        const isDST = this.isDaylightSavingTime(now);
        const cstOffset = isDST ? -5 : -6; // CDT is UTC-5, CST is UTC-6
        
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const cstDate = new Date(utc + (cstOffset * 3600000));
        
        // Format as YYYY-MM-DD
        return cstDate.toISOString().split('T')[0];
    }

    getTodaysDate() {
        return this.formatDate(new Date());
    }

    getCSTDate() {
        const now = new Date();
        const isDST = this.isDaylightSavingTime(now);
        const cstOffset = isDST ? -5 : -6; // CDT is UTC-5, CST is UTC-6
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utc + (cstOffset * 3600000));
    }

    getDailyWord(date = null) {
        const targetDate = date || this.getTodaysDate();
        const dailyWords = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        
        if (dailyWords[targetDate]) {
            return {
                word: dailyWords[targetDate],
                date: targetDate,
                source: 'daily'
            };
        }

        // Auto-generate and store a word for today if none exists
        const generatedWord = this.generateWordForDate(targetDate);
        this.setDailyWord(targetDate, generatedWord);
        
        return {
            word: generatedWord,
            date: targetDate,
            source: 'auto-generated'
        };
    }

    hashDate(dateStr) {
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            const char = dateStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    setDailyWord(date, word) {
        const dailyWords = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        dailyWords[date] = word.toUpperCase();
        localStorage.setItem(this.storageKey, JSON.stringify(dailyWords));
        return true;
    }

    getAllDailyWords() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    }

    // Game state management
    saveGameState(gameState) {
        const today = this.getTodaysDate();
        const allStates = JSON.parse(localStorage.getItem(this.gameStateKey) || '{}');
        
        allStates[today] = {
            ...gameState,
            date: today,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(this.gameStateKey, JSON.stringify(allStates));
    }

    loadGameState(date = null) {
        const targetDate = date || this.getTodaysDate();
        const allStates = JSON.parse(localStorage.getItem(this.gameStateKey) || '{}');
        return allStates[targetDate] || null;
    }

    hasPlayedToday() {
        const currentDate = this.getTodaysDate();
        const todayState = this.loadGameState(currentDate);
        
        // Debug logging
        console.log('Checking if played today:', {
            currentDate,
            todayState,
            hasState: todayState !== null
        });
        
        // Check if game state exists AND if it's actually completed
        return todayState !== null && (todayState.won !== undefined || todayState.attempts >= 6);
    }

    clearTodayGameState() {
        const today = this.getTodaysDate();
        const allStates = JSON.parse(localStorage.getItem(this.gameStateKey) || '{}');
        delete allStates[today];
        localStorage.setItem(this.gameStateKey, JSON.stringify(allStates));
    }

    getTodayStats() {
        const todayState = this.loadGameState();
        if (!todayState) {
            return { played: false };
        }

        return {
            played: true,
            won: todayState.won || false,
            guesses: todayState.guesses || [],
            attempts: todayState.attempts || 0,
            completedAt: todayState.timestamp
        };
    }

    // Admin authentication
    isAdminLoggedIn() {
        const session = localStorage.getItem(this.adminKey);
        if (!session) return false;
        
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();
        const sessionTime = new Date(sessionData.timestamp).getTime();
        const hourInMs = 60 * 60 * 1000;
        
        return (now - sessionTime) < hourInMs; // Session valid for 1 hour
    }

    getStoredPassword() {
        return localStorage.getItem(this.passwordKey) || this.defaultPassword;
    }

    adminLogin(password) {
        const currentPassword = this.getStoredPassword();
        if (password === currentPassword) {
            const sessionData = {
                timestamp: new Date().toISOString(),
                authenticated: true
            };
            localStorage.setItem(this.adminKey, JSON.stringify(sessionData));
            return true;
        }
        return false;
    }

    changeAdminPassword(currentPassword, newPassword) {
        if (currentPassword === this.getStoredPassword()) {
            if (newPassword && newPassword.length >= 6) {
                localStorage.setItem(this.passwordKey, newPassword);
                return { success: true, message: 'Password changed successfully!' };
            } else {
                return { success: false, message: 'New password must be at least 6 characters long.' };
            }
        } else {
            return { success: false, message: 'Current password is incorrect.' };
        }
    }

    isUsingDefaultPassword() {
        return this.getStoredPassword() === this.defaultPassword;
    }

    adminLogout() {
        localStorage.removeItem(this.adminKey);
    }

    isDaylightSavingTime(date) {
        // DST in US: Second Sunday in March to First Sunday in November
        const year = date.getFullYear();
        
        // Second Sunday in March
        const march = new Date(year, 2, 1); // March 1st
        const dstStart = new Date(year, 2, (14 - march.getDay()) % 7 + 8);
        
        // First Sunday in November  
        const november = new Date(year, 10, 1); // November 1st
        const dstEnd = new Date(year, 10, (7 - november.getDay()) % 7 + 1);
        
        return date >= dstStart && date < dstEnd;
    }

    generateWordForDate(dateStr) {
        // Generate a deterministic word for any date
        const dateHash = this.hashDate(dateStr);
        const fallbackWords = [
            'PYTHON', 'JUNGLE', 'CASTLE', 'FLOWER', 'PLANET', 'WISDOM',
            'ROCKET', 'SPIRIT', 'WINDOW', 'BRIDGE', 'FOREST', 'MEADOW',
            'GOLDEN', 'SILVER', 'BRONZE', 'MARBLE', 'FABRIC', 'CAMERA',
            'GUITAR', 'VIOLIN', 'PENCIL', 'CRAYON', 'CANDLE', 'BOTTLE',
            'GARDEN', 'SQUARE', 'CIRCLE', 'STRIPE', 'SHADOW', 'BRIGHT',
            'SMOOTH', 'STRONG', 'GENTLE', 'MIGHTY', 'HUMBLE', 'SIMPLE',
            'FROZEN', 'WARMTH', 'SPRING', 'SUMMER', 'AUTUMN', 'WINTER',
            'ORANGE', 'PURPLE', 'YELLOW', 'VIOLET', 'SALMON', 'TURKEY',
            'NATURE', 'BEAUTY', 'FRIEND', 'FAMILY', 'HEALTH', 'FUTURE',
            'DREAMS', 'VISION', 'CHANGE', 'GROWTH', 'SKILLS', 'TALENT'
        ];
        
        return fallbackWords[dateHash % fallbackWords.length];
    }

    // Date change detection
    hasDateChanged() {
        const currentDate = this.getTodaysDate();
        const lastKnownDate = localStorage.getItem('wordle_last_date');
        
        if (!lastKnownDate || lastKnownDate !== currentDate) {
            localStorage.setItem('wordle_last_date', currentDate);
            return !lastKnownDate || lastKnownDate !== currentDate;
        }
        
        return false;
    }

    isNewDayAvailable() {
        const currentDate = this.getTodaysDate();
        const gameState = this.loadGameState(currentDate);
        
        // If no game state exists for today, new day is available
        return gameState === null;
    }

    // Utility methods
    getDaysUntilNext() {
        const now = this.getCSTDate();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilTomorrow = tomorrow.getTime() - now.getTime();
        const hoursUntilTomorrow = Math.floor(msUntilTomorrow / (1000 * 60 * 60));
        const minutesUntilTomorrow = Math.floor((msUntilTomorrow % (1000 * 60 * 60)) / (1000 * 60));
        
        return { hours: hoursUntilTomorrow, minutes: minutesUntilTomorrow };
    }

    getSecondsUntilMidnight() {
        const now = this.getCSTDate();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilTomorrow = tomorrow.getTime() - now.getTime();
        return Math.floor(msUntilTomorrow / 1000);
    }

    getShareText(gameState) {
        const today = this.getTodaysDate();
        const attempts = gameState.won ? gameState.attempts : 'X';
        
        // Get emoji message based on performance
        let emojiMessage = '';
        if (gameState.won) {
            const messages = {
                1: '🧠 GENIUS! You just read its mind.',
                2: '⚡ Sharp as a blade! Almost psychic.',
                3: '🎯 Bullseye! You\'ve got the touch.',
                4: '🕵️ Sleuth mode: Activated. Solid work!',
                5: '😅 That was close… But you made it!',
                6: '⏳ Just in time! You never gave up.'
            };
            emojiMessage = messages[gameState.attempts] || messages[6];
        } else {
            emojiMessage = '💔 The word won this time… Try again tomorrow!';
        }
        
        let shareText = `6-Letter Wordle ${today} ${attempts}/6\n\n`;
        
        if (gameState.guesses && gameState.guesses.length > 0) {
            gameState.guesses.forEach(guess => {
                let line = '';
                guess.result.forEach(cell => {
                    if (cell === 'correct') line += '🟩';
                    else if (cell === 'present') line += '🟨';
                    else line += '⬛';
                });
                shareText += line + '\n';
            });
        }
        
        shareText += `\n${emojiMessage}`;
        
        return shareText;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DailyWordManager;
}