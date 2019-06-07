import { DatamuseApi } from "../datamuseapi/DatamuseApi";
import { MessageCheckerResult } from "./MessageCheckerResult";

/** This class checks a message if it contains any banned words*/
export class MessageChecker {
    /**
     * This function checks the message for banned words
     * Then it queries Datamuse API to get the best fit word
     * If the best fit word matches, then it is a false positive
     * Else it is not.
     * 
     * @param  {string} content Content of the message
     * @param  {string[]} bannedWords Array of banned words
     * @returns Promise
     */
    public async checkMessage(content: string, bannedWords: string[]): Promise<MessageCheckerResult> {
        return new Promise<MessageCheckerResult>(async (resolve) => {
            const datamuse = new DatamuseApi();
            let bannedWordsFound = this.checkForBannedWords(content, bannedWords);
            let contextOfBannedWords: string[] = this.getContextOfBannedWord(content, bannedWordsFound);
            
            // Naive check for false positives - no typos. Definitely have room to grow.
            let guilty = false;
            let actualBannedWords: string[] = [];
            for(let word of contextOfBannedWords) {
                let wordsFromDictionary = await datamuse.fetchSimilarSpellings(word);
                let bestFitWord = wordsFromDictionary[0].word;
                //console.log(`${word}, ${bestFitWord}`);
                if(!(bestFitWord === word && !bannedWords.includes(word))) {
                    guilty = true;
                    actualBannedWords.push(word);
                }
            };

            //create new class and resolve promise
            const result = new MessageCheckerResult(guilty, actualBannedWords, content);
            resolve(result);
        });
    }

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
     * This function checks the message contents for instances of banned words.
     * Returns an array of banned words spotted in the content.
     * 
     * @param  {string} content Message contents
     * @param  {string[]} bannedWords Array of banned words
     * @returns string[] Instances of banned words found.
     */
    public checkForBannedWords(content: string, bannedWords: string[]): string[] {
        let bannedWordsFound: string[] = [];
        content = content.toLowerCase();
        for(let bannedWord of bannedWords) {
            if(content.includes(bannedWord)) {
                bannedWordsFound.push(bannedWord);
            }
        }
        return bannedWordsFound;
    };

    /**
     * This function returns the context of the banned words found.
     * eg. if the banned word is "shit", and the term used was "ashithole",
     *     this will return "ashithole".
     * 
     * @param  {string} content Content of message
     * @param  {string[]} bannedWordsFound Banned words that are found in the content.
     * @returns Set<string> Set of strings
     */
    public getContextOfBannedWord(content: string, bannedWordsFound: string[]): string[] {
        let hashSet = new Set<string>();
        let lowerCaseContent = content.toLowerCase();
        for(let bannedWord of bannedWordsFound) {
            let length = content.length;

            //for all instances of the bannedword inside the content
            let start = 0
            let idx = lowerCaseContent.indexOf(bannedWord, 0);
            let end = idx + bannedWord.length - 1;
            do {
                //check chars behind the index.
                for(let i = idx; i >= 0; i--) {
                    if(!this.isAlphaNumeric(content.charCodeAt(i)))
                        break;
                    start = i;
                }

                //check chars after the end of the substring
                for(let i = end; i < length; i++) {
                    if(!this.isAlphaNumeric(content.charCodeAt(i)))
                        break;
                    end = i;
                }
                //console.log(`Start: ${start}, End: ${end}`);

                //Add to hashset
                hashSet.add(content.substring(start, end+1));

                //Move to next substring, if any
                idx = lowerCaseContent.indexOf(bannedWord, end);
                end = idx + bannedWord.length - 1;
            } while(idx != -1);
        }
        //console.log(hashSet); 
        return Array.from(hashSet);
    };
}