import axios from 'axios';
import { DatamuseSpellingQueryResult } from './DatamuseSpellingQueryResult';
import { DatamuseQueryError } from './errors/DatamuseQueryError';

// http://www.datamuse.com/api/
export class DatamuseApi {
    private endpoint = 'http://api.datamuse.com/words';

    /**
     * This function returns the API call from datamuse
     *
     * @param  {string} word Word to be queried
     * @returns Promise holding the return data from the API.
     */
    public async checkSpelling(word: string): Promise<DatamuseSpellingQueryResult[]> {
        const query = `${this.endpoint}?sp=${word}`;

        try {
            const { data } = await axios.get(query);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const output: DatamuseSpellingQueryResult[] = [];
            for (const d of data) {
                output.push(new DatamuseSpellingQueryResult(d.word, d.score));
            }
            return output;
        } catch (err) {
            throw new DatamuseQueryError('Error fetching result');
        }
    }
}
