import { DatamuseApi } from "../datamuseapi/DatamuseApi";
import { MessageCheckerResult } from "./MessageCheckerResult";
import { DatamuseQueryError } from "../errors/DatamuseQueryError";

/** This class checks a message if it contains any banned words */
export class MessageChecker {

    /**
     * This function checks the message for banned words
     * Then it queries Datamuse API to get the best fit word
     * If the best fit word matches, then it is a false positive
     * Else it is not.
     * 
     * @param  {string} content Content of the message
     * @param  {string[]} bannedWords Array of banned words
     * @returns MessageCheckerResult Results of the check
     */
    public async checkMessage(content: string, bannedWords: string[]): Promise<MessageCheckerResult> {
        return new Promise<MessageCheckerResult>(async (resolve) => {
            let bannedWordsFound = this.checkForBannedWords(content, bannedWords);
            let contextOfBannedWords = this.getContextOfBannedWord(content, bannedWordsFound);
            
            //Determine if the contexts of the banned words used was malicious
            let bannedWordsUsed: [string, string][] = [];
            for(let tuple of contextOfBannedWords) {
                try {
                    let isGuilty = await this.checkContext(bannedWordsUsed, tuple);
                    if(isGuilty) {
                        bannedWordsUsed.push(tuple)
                    }
                } catch (err) {
                    throw err;
                }
            }

            //Create result and resolve promise
            let isGuilty: boolean;
            if(bannedWordsUsed.length === 0) {
                isGuilty = false;
            } else { 
                isGuilty = true;
            }
            const result = new MessageCheckerResult(isGuilty, bannedWordsUsed);
            resolve(result);
        });
    }

    /**
     * This function checks datamuse Api for the context of the word used
     * 
     * @param  {[string string][]} bannedWordsUsed Array containing all found banned words
     *                                             and contexts used over the message
     * @param  {[string, string]} tuple containing banned word used & its context
     * @return boolean if the context is found to be a banned word
     */
    private async checkContext(bannedWordsUsed: [string, string][], tuple: [string, string]): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            let bannedWord = tuple[0].toLowerCase();
            let context = tuple[1].toLowerCase();

            // If it's a perfect match with a banned word, no need to query.
            if(context === bannedWord) {
                resolve(true);
            } else {
                let datamuseQueryResults = await new DatamuseApi().checkSpelling(context);
                // If no results, is not a legitimate word, mark it.
                if(datamuseQueryResults.length === 0) {
                    bannedWordsUsed.push(tuple);
                } else {
                    //if it does not match the top few (3 for now), mark it
                    let canBeFound = false;
                    let idx = 0;
                    do {
                        let bestFitWord = datamuseQueryResults[idx].word;

                        //if the word matches the context, it is a legitimate word
                        if(context.includes(bestFitWord)) {
                            canBeFound = true;
                        }
                        
                        //if I can find the banned word in the query, mark it.
                        if(bannedWord === bestFitWord) {
                            resolve(true)
                        }
                        idx++;
                    } while(idx < 3 && idx < datamuseQueryResults.length);

                    //if it does not match the top few, mark it for now; could be a masked banned word
                    //downside: typos will get flagged too
                    if(!canBeFound) {
                        resolve(true)
                    }
                }
            }
            resolve(false);
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
     * 
     * @param  {string} content Content of message
     * @param  {string[]} bannedWordsFound Banned words that are found in the content.
     * @returns Set<string> Set of strings
     */
    public getContextOfBannedWord(content: string, bannedWordsFound: string[]): [string, string][] {
        let arr: [string, string][] = [];
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

                // Check if it is an emote.
                // Emotes follow the patten <:context:>(\d+\d)>
                let context = content.substring(start, end+1);
                let isEmote = false;
                if(content.match(new RegExp(`<:${context}:([0-9]+[0-9])>`))) {
                    isEmote = true;
                }

                //Make sure no duplicates
                let found = false;
                for(let tuple of arr) {
                    if(tuple[0] === bannedWord && tuple[1] === context) {
                        found = true;
                        break;
                    }
                }

                //Add to array if there's no dupes and is not an emote
                if(!found && !isEmote) {
                    arr.push([bannedWord, context]);
                }

                //Move to next substring, if any
                idx = lowerCaseContent.indexOf(bannedWord, end);
                end = idx + bannedWord.length - 1;
            } while(idx != -1);
        }

        return arr;
    };
}