import axios from 'axios';

// http://www.datamuse.com/api/
export class DatamuseApi {
    private endpoint: string = "https://api.datamuse.com/words";
    
    /**
     * This function returns the API call from datamuse
     * 
     * @param  {string} word Word to be queried
     * @returns Promise holding the return data from the API.
     */
    public async fetchSimilarSpellings(word: string): Promise<any> {
        return new Promise<any>(resolve => {
            let query = `${this.endpoint}?sp=${word}`;
            axios.get(query).then(res => { resolve(res.data); });
        });
    }
}