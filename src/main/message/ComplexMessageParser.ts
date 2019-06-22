import { Context } from "./Context";
import { MessageParser } from "./MessageParser";

/** This class contains the banned word & its regex */
class WordAndRegex {
    public word: string;
    public regex: RegExp;

    constructor(word: string, regexStr: string) {
        this.word = word;
        this.regex = new RegExp(regexStr, 'g');
    }

    public equals(other: WordAndRegex) {
        if(other.word === this.word) {
            return true;
        } else {
            return false;
        }
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
    public processBannedWords(bannedWords: string[]) {
        for(let word of bannedWords) {
            //Generate RegExp for each word.
            let regexStr = "";
            for(let i = 0; i < word.length - 1; i++) {
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
        //If not alphanumeric, return empty string
        if(!this.isAlphaNumeric(char.charCodeAt(0))) {
            return "";
        }

        let beforeChar = String.fromCharCode(char.charCodeAt(0) - 1);
        let afterChar = String.fromCharCode(char.charCodeAt(0) + 1);
        if(char === "a") {
            return `${char}[^${afterChar}-z]*`;
        } else if(char === "z") {
            return `${char}[^a-${beforeChar}]*`;
        } else {
            return `${char}[^a-${beforeChar}${afterChar}-z]*`
        }
    }
    /**
     * Checks for instances of banned words in the content
     * 
     * @param  {string} convertedContent Content
     * @returns WordAndRegex returns banned words and its regex
     */
    private checkForBannedWords(convertedContent: string): WordAndRegex[] {
        let out: WordAndRegex[] = [];
        for(let wordRegex of this.WordAndRegexs) {
            const regex = wordRegex.regex;

            if(regex.test(convertedContent)) {
                //make sure no duplicates
                let found = false;
                for(let wordRegex_ of out) {
                    if(wordRegex_.equals(wordRegex)) {
                        found = true;
                        break;
                    }
                }
                if(!found)
                    out.push(wordRegex);
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
    public getContextOfBannedWord(originalContent: string, convertedContent: string, contextOfBannedWords: Context[]): void {
 
        let foundRegexs = this.checkForBannedWords(convertedContent);
        for(let foundRegex of foundRegexs) {
            let lastStoppedIdx = 0;
            let regex = foundRegex.regex;
            regex.lastIndex = 0; //reset last index
            let arr;
            while((arr = regex.exec(convertedContent)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if(arr.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                let word = arr[0];
                let end = regex.lastIndex - 1;
                let start = end - word.length + 1;

                // Don't need to consider if the substr is found before lastStoppedIdx.
                if(end <= lastStoppedIdx)
                    continue;

                //check chars behind the startIdx
                for(let i = start; i >= lastStoppedIdx; i--) {
                    if(!this.isAlphaNumeric(convertedContent.charCodeAt(i)))
                        break;
                    start = i;
                }

                //check chars after end of substring
                for(let i = end; i < convertedContent.length; i++) {
                    if(!this.isAlphaNumeric(convertedContent.charCodeAt(i)))
                        break;
                    end = i;                    
                }
                lastStoppedIdx = end;
                //console.log(start, end, lastStoppedIdx);

                //Get contexts
                let originalContext = originalContent.substring(start, end+1);
                let convertedContext = "";

                //Get context without additonal chars
                for(let i = 0; i < originalContext.length; i++) {
                    if(!this.isAlphaNumeric(originalContext.charCodeAt(i))) {
                        continue;
                    }
                    convertedContext += originalContext[i];
                }
                convertedContext = convertedContext.toLowerCase();

                // Check if it is an emote.
                let isEmote = this.checkIsEmote(originalContent, originalContext);
                const contextToBeAdded = new Context(foundRegex.word,
                                                     originalContext,
                                                     convertedContext);
                //Check for duplicates
                let found = false;
                for(let context of contextOfBannedWords) {
                    if(context.equals(contextToBeAdded)) {
                        found = true;
                        break;
                    }
                }

                //Add to array if there's no dupes and is not an emote
                if(!found && !isEmote) {
                    contextOfBannedWords.push(contextToBeAdded);
                }
            }
        }
    }
}