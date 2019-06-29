export abstract class MessageParser {
    /**
     * This function checks if the unicode number is alphabetical
     * Taken from: https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
     *
     * @param  {number} code Unicode number of character
     * @returns boolean Whether it is alphanumeric or not.
     */
    public isAlpha(code: number): boolean {
        if (!(code > 64 && code < 91) // upper alpha (A-Z)
            && !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
        return true;
    }

    /**
     * This function checks if the unicode number is numeric.
     *
     * @param  {number} code Unicode number of character
     * @returns boolean Whether it is alphanumeric or not.
     */
    public isNumeric(code: number): boolean {
        if (!(code > 47 && code < 58)) // numeric (0-9))
        { return false; }
        return true;
    }

    /**
     * @param  {string} content Content of string
     * @param  {string} context Name of the emote
     * @returns boolean if it is an emote in the content
     */
    public checkIsEmote(content: string, context: string): boolean {
        // This function escapes reserved chars in Regex
        const escapeChars = (str: string): string => {
            const charSet = new Set<string>(['[', '\\', '^', '$', '.', '|', '?', '*', '+', '(', ')']);
            let out = '';
            for (let i = 0; i < str.length; i++) {
                if (charSet.has(str[i])) {
                    out += `\\${str[i]}`;
                } else {
                    out += str[i];
                }
            }
            return out;
        };
        context = escapeChars(context);
        // Emotes follow the patten /<a?:context:[0-9]+>/
        try {
            const regexEmote = new RegExp(`<a?:${context}:[0-9]+>`, 'g');
            if (regexEmote.test(content)) {
                return true;
            }
        } catch (err) { // if there's other symbols inside the string, it might give an error on regex creation
            return false;
        }
        return false;
    }
}
