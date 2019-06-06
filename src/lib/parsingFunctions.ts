/**
 * This function checks if the unicode number is alphanumeric.
 * Taken from: https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
 * @param  {number} code Unicode number of character
 * @returns boolean Whether it is alphanumeric or not.
 */
export const isAlphaNumeric = function(code: number): boolean {
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
 * @param  {string} content Message contents
 * @param  {string[]} bannedWords Array of banned words
 * @returns string[] Instances of banned words found.
 */
export const checkForBannedWords = function(content: string, bannedWords: string[]): string[] {
    let bannedWordsFound: string[] = [];
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
 * @param  {string} content Content of message
 * @param  {string[]} bannedWordsFound Banned words that are found in the content.
 * @returns Set<string> Set of strings
 */
export const getContextOfBannedWord = function(content: string, bannedWordsFound: string[]): Set<string> {
    let hashSet = new Set<string>();
    for(let bannedWord of bannedWordsFound) {
        let length = content.length;
        let start = 0, end = 0;

        //for all instances of the bannedword inside the content
        while(true) {
            let idx = content.indexOf(bannedWord, end);
            if(idx == -1)
                break;
            //check chars behind the index.
            for(let i = idx; i >= 0; i--) {
                if(!isAlphaNumeric(content.charCodeAt(i)))
                    break;
                start = i;
            }

            //check chars after the index
            for(let i = idx; i < length; i++) {
                if(!isAlphaNumeric(content.charCodeAt(i)))
                    break;
                end = i;
            }
            //console.log(`Start: ${start}, End: ${end}`);
            hashSet.add(content.substring(start, end+1));
        }
    }
    return hashSet;
};

