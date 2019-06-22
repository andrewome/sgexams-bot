import { DatamuseApi } from "./datamuseapi/DatamuseApi";
import { MessageCheckerResult } from "./classes/MessageCheckerResult";
import { CharacterSubstitutor } from "./charactersubstitutor/CharacterSubstitutor";
import { Context } from "./classes/Context";
import { ComplexMessageParser } from "./parser/ComplexMessageParser";

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
     * @returns Promise<MessageCheckerResult> Results of the check
     */
    public async checkMessage(content: string, bannedWords: string[]): Promise<MessageCheckerResult> {
        return new Promise<MessageCheckerResult>(async (resolve) => {
            
            //Removing diacritic accents
            //https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
            content = content.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            //Generate contents
            let contents: string[] = [];
            //Push lower case
            contents.push(content.toLowerCase());
            //Generate other possible contents
            contents = contents.concat(new CharacterSubstitutor().convertText(content.toLowerCase()));

           
            //Checking for bad words
            let contextOfBannedWords: Context[] = [];
            const complexMessageParser = new ComplexMessageParser().processBannedWords(bannedWords);

            for(let convertedContent of contents) {
                complexMessageParser.getContextOfBannedWord(content, convertedContent, contextOfBannedWords);
            }

            //Determine if the contexts of the banned words used was malicious
            let realBannedWords: Context[] = [];
            let promises: Promise<Context | null>[] = [];
            for(let context of contextOfBannedWords) {
                promises.push(this.checkContext(context));
            }

            let results = await Promise.all(promises);
            for(let result of results) {
                if(result !== null) {
                    realBannedWords.push(result);
                }
            }

            //Create result and resolve promise
            let isGuilty: boolean;
            if(realBannedWords.length === 0) {
                isGuilty = false;
            } else { 
                isGuilty = true;
            }
            const result = new MessageCheckerResult(isGuilty, realBannedWords);
            resolve(result);
        });
    }

    /**
     * This function checks datamuse Api for the context of the word used
     * 
     * @param  {Context} context containing banned word used & its context
     * @return Promise<Context | null> if the context is found to be a banned word
     */
    private async checkContext(context: Context): Promise<Context | null> {
        return new Promise<Context | null>(async (resolve) => {
            let bannedWord = context.bannedWord;
            let convertedContext = context.convertedContext;

            // If it's a perfect match with a banned word, no need to query.
            if(convertedContext === bannedWord) {
                resolve(context);
            } else {
                let datamuseQueryResults = await new DatamuseApi().checkSpelling(convertedContext);
                // If no results, is not a legitimate word, mark it.
                if(datamuseQueryResults.length === 0) {
                    resolve(context);
                } else {
                    //if it does not match the top few (3 for now), mark it
                    let canBeFound = false;
                    let idx = 0;
                    do {
                        let bestFitWord = datamuseQueryResults[idx].word;

                        //if the word can be found in the context, it is a legitimate word
                        //this adds some tolerance to prevent false positives
                        if(convertedContext.includes(bestFitWord)) {
                            canBeFound = true;
                        }
                        
                        //if I can find the banned word in the query, mark it.
                        if(bannedWord === bestFitWord) {
                            resolve(context)
                        }
                        idx++;
                    } while(idx < 3 && idx < datamuseQueryResults.length);

                    //if it does not match the top few, mark it for now; could be a masked banned word
                    //downside: typos will get flagged too
                    if(!canBeFound) {
                        resolve(context)
                    }
                }
            }
            resolve(null);
        });
    }
}