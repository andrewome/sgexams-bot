import { Context } from '../classes/Context';
import { MessageParser } from './MessageParser';

/** This class contains the banned word & its regex */
class WordAndRegex {
    public word: string;

    public regex: RegExp;

    public constructor(word: string, regexStr: string) {
        this.word = word;
        this.regex = new RegExp(regexStr, 'g');
    }

    public equals(other: WordAndRegex): boolean {
        if (other.word === this.word) {
            return true;
        }
        return false;
    }
}

/** This class parses the string for more complex combinations of banned words */
export class ComplexMessageParser extends MessageParser {
    /** This array stores the regex of banned words */
    private WordAndRegexs: WordAndRegex[] = [];

    /**
     * Processes banned words and stores them in WordAndRegexs array
     *
     * @param  {string[]} bannedWords Array of banned words
     */
    public processBannedWords(bannedWords: string[]): ComplexMessageParser {
        for (const word of bannedWords) {
            // Generate RegExp for each word.
            let regexStr = '';
            for (let i = 0; i < word.length - 1; i++) {
                regexStr += this.generateRegexForChar(word[i]);
            }
            regexStr += `${word[word.length - 1]}+`;
            this.WordAndRegexs.push(new WordAndRegex(word, regexStr));
        }
        return this;
    }

    /**
     * This function generates the regex for each char.
     * The aim is to get an expression looking for non alphabetical with range
     * from [a-<alphabet before char>, <alphabet after char>-z] for each char
     *
     * @param  {string} char character
     * @returns string regex of the char
     */
    private generateRegexForChar(char: string): string {
        // If not alphabetical, return empty string
        if (!this.isAlpha(char.charCodeAt(0))) {
            return '';
        }

        const beforeChar = String.fromCharCode(char.charCodeAt(0) - 1);
        const afterChar = String.fromCharCode(char.charCodeAt(0) + 1);
        if (char === 'a') {
            return `${char}[^${afterChar}-z]*`;
        } if (char === 'z') {
            return `${char}[^a-${beforeChar}]*`;
        }
        return `${char}[^a-${beforeChar}${afterChar}-z]*`;
    }

    /**
     * Checks for instances of banned words in the content
     *
     * @param  {string} convertedContent Content
     * @returns WordAndRegex returns banned words and its regex
     */
    private checkForBannedWords(convertedContent: string): WordAndRegex[] {
        const out: WordAndRegex[] = [];
        for (const wordRegex of this.WordAndRegexs) {
            const { regex } = wordRegex;

            if (regex.test(convertedContent)) {
                // make sure no duplicates
                let found = false;
                for (const wordRegex_ of out) {
                    if (wordRegex_.equals(wordRegex)) {
                        found = true;
                        break;
                    }
                }
                if (!found) out.push(wordRegex);
            }
        }
        return out;
    }

    /**
     * This function gets the context of the banned word
     *
     * @param  {string} originalContent Original content
     * @param  {string} convertedContent Converted content (by CharacterSubstitutor or smth)
     * @returns Context Context of banned word
     */
    public getContextOfBannedWord(originalContent: string,
                                  convertedContent: string,
                                  contextOfBannedWords: Context[]): void {
        const foundRegexs = this.checkForBannedWords(convertedContent);
        for (const foundRegex of foundRegexs) {
            let lastStoppedIdx = 0;
            const { regex } = foundRegex;
            regex.lastIndex = 0; // reset last index
            let arr;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            while ((arr = regex.exec(convertedContent)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (arr.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                const word = arr[0];
                let end = regex.lastIndex - 1;
                let start = end - word.length + 1;

                // Don't need to consider if the substr is found before lastStoppedIdx.
                if (end <= lastStoppedIdx) continue;

                // check chars behind the startIdx
                for (let i = start; i >= lastStoppedIdx; i--) {
                    const asciiVal = convertedContent.charCodeAt(i);
                    if (!this.isAlpha(asciiVal) && asciiVal !== "'".charCodeAt(0)) break;
                    start = i;
                }

                // check chars after end of substring
                for (let i = end; i < convertedContent.length; i++) {
                    const asciiVal = convertedContent.charCodeAt(i);
                    if (!this.isAlpha(asciiVal) && asciiVal !== "'".charCodeAt(0)) break;
                    end = i;
                }
                lastStoppedIdx = end;

                // Get contexts
                const originalContext = originalContent.substring(start, end + 1);
                const convertedContext = convertedContent.substring(start, end + 1);

                // Check if it is an emote.
                const isEmote = this.checkIsEmote(originalContent, originalContext);

                const contextToBeAdded = new Context(foundRegex.word,
                    originalContext,
                    convertedContext);

                // Check for duplicates
                let found = false;
                for (const context of contextOfBannedWords) {
                    if (context.equals(contextToBeAdded)) {
                        found = true;
                        break;
                    }
                }

                // Add to array if is not an emote or a dupe
                if (!found && !isEmote) {
                    contextOfBannedWords.push(contextToBeAdded);
                }
            }
        }
    }
}
