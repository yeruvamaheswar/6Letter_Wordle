class FreeDictionaryAPI {
    constructor() {
        this.baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
        this.cache = new Map();
    }

    async getWordDefinition(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        if (this.cache.has(normalizedWord)) {
            return this.cache.get(normalizedWord);
        }

        try {
            const url = `${this.baseUrl}/${normalizedWord}`;
            console.log('API: Making request to:', url);
            
            const response = await fetch(url);
            console.log('API: Response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('API: Word not found (404)');
                    return { found: false, word: normalizedWord };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API: Response data received for:', normalizedWord);
            const result = this.parseDefinition(data);
            console.log('API: Parsed result:', result);
            this.cache.set(normalizedWord, result);
            return result;
            
        } catch (error) {
            console.error('Dictionary API Error:', error);
            return { found: false, word: normalizedWord, error: error.message };
        }
    }

    parseDefinition(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { found: false };
        }

        const entry = data[0];
        const result = {
            found: true,
            word: entry.word,
            phonetic: entry.phonetic || '',
            definitions: [],
            synonyms: [],
            antonyms: []
        };

        if (entry.meanings && Array.isArray(entry.meanings)) {
            entry.meanings.forEach(meaning => {
                if (meaning.definitions && Array.isArray(meaning.definitions)) {
                    meaning.definitions.forEach(def => {
                        result.definitions.push({
                            partOfSpeech: meaning.partOfSpeech || '',
                            definition: def.definition || '',
                            example: def.example || ''
                        });

                        if (def.synonyms && Array.isArray(def.synonyms)) {
                            result.synonyms.push(...def.synonyms);
                        }
                        if (def.antonyms && Array.isArray(def.antonyms)) {
                            result.antonyms.push(...def.antonyms);
                        }
                    });
                }
            });
        }

        result.synonyms = [...new Set(result.synonyms)];
        result.antonyms = [...new Set(result.antonyms)];

        return result;
    }

    async isValidWord(word) {
        console.log('API: Checking word validity for:', word);
        const result = await this.getWordDefinition(word);
        console.log('API: Word definition result:', result);
        return result.found;
    }

    async getBatchDefinitions(words) {
        const promises = words.map(word => this.getWordDefinition(word));
        return await Promise.all(promises);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeDictionaryAPI;
}