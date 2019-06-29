/** Class that represents the results from Datamuse API */
export class DatamuseSpellingQueryResult {
    public word: string;

    public score: number;

    public constructor(word: string, score: number) {
        this.word = word;
        this.score = score;
    }
}
