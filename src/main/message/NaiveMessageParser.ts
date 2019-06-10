import { Context } from "./Context";

export class NaiveMessageParser {
    /**
     * This function checks if the unicode number is alphanumeric.
     * Taken from: https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
     * 
     * @param  {number} code Unicode number of character
     * @returns boolean Whether it is alphanumeric or not.
     */
    public isAlphaNumeric(code: number): boolean {
        if (!(code > 47 && code < 58) &&  // numeric (0-9)
            !(code > 64 && code < 91) &&  // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
        }
    return true;
    };

    /**
     * @param  {string} convertedContent Converted content
     * @param  {string[]} bannedWords Array of banned words
     * @returns string[] Instances of banned words found.
     */
    public checkForBannedWords(convertedContent: string, bannedWords: string[]): string[] {
        let bannedWordsFound: Set<string> = new Set<string>();
        for(let bannedWord of bannedWords) {
            if(convertedContent.includes(bannedWord)) {
                bannedWordsFound.add(bannedWord);
            }
        }
        return Array.from(bannedWordsFound);
    };
  
    /**
     * @param  {string} originalContent the actual content that was sent
     * @param  {string} convertedContent converted content
     * @param  {string[]} bannedWordsFound Banned words that were found in the content.
     * @returns Context[] Array of context 
     */
    public getContextOfBannedWord(originalContent: string, convertedContent: string, bannedWordsFound: string[]): Context[] {
        let contexts: Context[] = [];

        //Check the context of the banned word appearing in the content
        for(let bannedWord of bannedWordsFound) {
            let length = convertedContent.length;

            //for all instances of the bannedword inside the content
            let start = 0
            let idx = convertedContent.indexOf(bannedWord, 0);
            let end = idx + bannedWord.length - 1;
            do {
                //check chars behind the index.
                for(let i = idx; i >= 0; i--) {
                    if(!this.isAlphaNumeric(convertedContent.charCodeAt(i)))
                        break;
                    start = i;
                }

                //check chars after the end of the substring
                for(let i = end; i < length; i++) {
                    if(!this.isAlphaNumeric(convertedContent.charCodeAt(i)))
                        break;
                    end = i;
                }
                //console.log(`Start: ${start}, End: ${end}`);

                // Check if it is an emote.
                // Emotes follow the patten /<:context:[0-9]+>/
                let originalContext = originalContent.substring(start, end+1);
                let convertedContext = convertedContent.substring(start, end+1);
                let isEmote = false;
                if(originalContent.match(new RegExp(`<:${originalContext}:[0-9]+>`))) {
                    isEmote = true;
                }

                //Make sure no duplicates
                const contextToBeAdded = new Context(bannedWord,
                                                     originalContext,
                                                     convertedContext);
                let found = false;
                for(let context of contexts) {
                    if(context.equals(contextToBeAdded)) {
                        found = true;
                        break;
                    }
                }

                //Add to array if there's no dupes and is not an emote
                if(!found && !isEmote) {
                    contexts.push(contextToBeAdded);
                }

                //Move to next substring, if any
                idx = convertedContent.indexOf(bannedWord, end);
                end = idx + bannedWord.length - 1;
            } while(idx != -1);
        }
        return contexts;
    };
}