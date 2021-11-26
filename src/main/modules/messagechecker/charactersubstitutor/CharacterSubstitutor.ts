/** This class substitutes common leetspeech characters to characters. */
export class CharacterSubstitutor {
    private oneToOneMap: Map<string, string>;

    private oneToManyMap: Map<string, string[]>;

    public constructor() {
        this.oneToOneMap = new Map<string, string>();
        this.oneToOneMap.set('@', 'a');
        this.oneToOneMap.set('3', 'e');
        this.oneToOneMap.set('0', 'o');
        this.oneToOneMap.set('!', 'i');
        this.oneToOneMap.set('5', 's');
        this.oneToOneMap.set('$', 's');

        this.oneToManyMap = new Map<string, string[]>();
        this.oneToManyMap.set('|', ['i', 'l']);
        this.oneToManyMap.set('1', ['i', 'l']);
        this.oneToManyMap.set('7', ['t', 'l']);
        this.oneToManyMap.set('4', ['a', 'u']);
    }

    /**
     * @param  {string} text Text to be converted
     * @returns string[] Array of different texts that it could be
     */
    public convertText(text: string): string[] {
        // https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
        const f = (a: any[], b: any[]): any[] => ([] as any).concat(...a.map((a2): any[] => b.map((b2): any => ([] as any).concat(a2, b2))));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartesianProduct = (a: any[], b: any[], ...c: any[]): any[][] => {
            if (!b || b.length === 0) {
                return a;
            }
            const [b2, ...c2] = c;
            const fab = f(a, b);
            return cartesianProduct(fab, b2, ...c2);
        };

        // Round 1, convert one to one chars. Note down how many chars
        // from the one-to-many set the string contains.
        let output = '';
        const usedChars = new Set<string>();
        const oneToManyCharsFound: string[] = [];
        for (const letter of text) {
            if (this.oneToOneMap.has(letter)) {
                output += this.oneToOneMap.get(letter);
            } else if (this.oneToManyMap.has(letter) && !usedChars.has(letter)) {
                oneToManyCharsFound.push(letter);
                output += letter;
            } else {
                output += letter;
            }
            usedChars.add(letter);
        }

        // Round 2 convert one to many chars, if any
        // If empty, return in array

        // Chars that need to be escaped in regex
        const charSet = new Set<string>(['[', '\\', '^', '$', '.', '|', '?', '*', '+', '(', ')']);
        const { length } = oneToManyCharsFound;
        const outputs: string[] = [];
        if (length === 0) {
            outputs.push(output);
            return outputs;
        } // Not empty, generate the rest of the contents
        const mappings: string[][] = [];
        let combinations: string[][] = [];
        for (const char of oneToManyCharsFound) {
            const arr = this.oneToManyMap.get(char);
            if (arr !== undefined) mappings.push(arr);
        }
        // If length is 1, generate text for the mapping for the char
        // Cartesian product formula won't work here
        if (length === 1) {
            const charToBeReplaced = oneToManyCharsFound[0];
            let regex: RegExp;
            if (charSet.has(charToBeReplaced)) {
                regex = new RegExp(`\\${charToBeReplaced}`, 'g');
            } else {
                regex = new RegExp(charToBeReplaced, 'g');
            }
            for (const i of mappings[0]) {
                outputs.push(output.replace(regex, i));
            }
            return outputs;
        }
        if (length === 2) {
            const [a1, a2] = mappings;
            combinations = cartesianProduct(a1, a2);
        }
        if (length > 2) {
            const [a1, a2, ...a3] = mappings;
            combinations = cartesianProduct(a1, a2, ...a3);
        }

        for (const i of combinations) {
            let _output = output;
            for (let j = 0; j < i.length; j++) {
                const charToBeReplaced = oneToManyCharsFound[j];
                let regex: RegExp;
                if (charSet.has(charToBeReplaced)) {
                    regex = new RegExp(`\\${charToBeReplaced}`, 'g');
                } else {
                    regex = new RegExp(charToBeReplaced, 'g');
                }
                const replacementChar = i[j];
                _output = _output.replace(regex, replacementChar);
            }
            outputs.push(_output);
        }
        return outputs;
    }
}
