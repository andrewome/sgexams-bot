/** This class substitutes common leetspeech characters to characters. */
export class CharacterSubstitutor {
    private conversionMap: Map<string, string>;

    constructor() {
        this.conversionMap = new Map<string, string>();
        this.conversionMap.set("@", "a");
        this.conversionMap.set("4", "a");
        this.conversionMap.set("3", "e");
        this.conversionMap.set("0", "o");
        this.conversionMap.set("|", "i");
        this.conversionMap.set("1", "i");
        this.conversionMap.set("7", "t");
    }

    public convertText(text: string): string {
        let output = "";
        for(let letter of text) {
            if(this.conversionMap.has(letter)) {
                output += this.conversionMap.get(letter);
            } else {
                output += letter;
            }
        }
        return output;
    }
}