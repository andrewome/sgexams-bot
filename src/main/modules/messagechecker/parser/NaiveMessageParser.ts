import { Context } from '../classes/Context';
import { MessageParser } from './MessageParser';

export class NaiveMessageParser extends MessageParser {
    public bannedWordsFound: string[] = [];

    /**
     * @param  {string} convertedContent Converted content
     * @param  {string[]} bannedWords Array of banned words
     * @returns NaiveMessageParser
     */
    public checkForBannedWords(convertedContent: string,
                               bannedWords: string[]): NaiveMessageParser {
        const bannedWordsFoundSet: Set<string> = new Set<string>();
        for (const bannedWord of bannedWords) {
            if (convertedContent.includes(bannedWord)) {
                bannedWordsFoundSet.add(bannedWord);
            }
        }
        this.bannedWordsFound = Array.from(bannedWordsFoundSet);
        return this;
    }

    /**
     * @param  {string} originalContent the actual content that was sent
     * @param  {string} convertedContent converted content
     * @param  {Context[]} contextOfBannedWords Array of all contexts found so far.
     * @returns void
     */
    public getContextOfBannedWord(originalContent: string,
                                  convertedContent: string,
                                  contextOfBannedWords: Context[]): void {
        // Check the context of the banned word appearing in the content
        for (const bannedWord of this.bannedWordsFound) {
            const { length } = convertedContent;

            // for all instances of the bannedword inside the content
            let start = 0;
            let idx = convertedContent.indexOf(bannedWord, 0);
            let end = idx + bannedWord.length - 1;
            do {
                // check chars behind the index.
                for (let i = idx; i >= 0; i--) {
                    if (!this.isAlpha(convertedContent.charCodeAt(i))) break;
                    start = i;
                }

                // check chars after the end of the substring
                for (let i = end; i < length; i++) {
                    if (!this.isAlpha(convertedContent.charCodeAt(i))) break;
                    end = i;
                }

                const originalContext = originalContent.substring(start, end + 1);
                const convertedContext = convertedContent.substring(start, end + 1);

                // Check if it is an emote.
                const isEmote = this.checkIsEmote(originalContent, originalContext);

                // Make sure no duplicates
                const contextToBeAdded
                    = new Context(bannedWord,
                                  originalContext,
                                  convertedContext);
                let found = false;
                for (const context of contextOfBannedWords) {
                    if (context.equals(contextToBeAdded)) {
                        found = true;
                        break;
                    }
                }

                // Add to array if there's no dupes and is not an emote
                if (!found && !isEmote) {
                    contextOfBannedWords.push(contextToBeAdded);
                }

                // Move to next substring, if any
                idx = convertedContent.indexOf(bannedWord, end);
                end = idx + bannedWord.length - 1;
            } while (idx !== -1);
        }
    }
}
