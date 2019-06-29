/* eslint-disable @typescript-eslint/no-unused-vars */
import { should } from 'chai';
import { DatamuseApi } from '../../../main/messagechecker/datamuseapi/DatamuseApi';

should();

const datamuse = new DatamuseApi();
describe('DatamuseApi test suite', function (): void {
    this.timeout(5000);
    describe('fetchSimilarSpellings test', (): void => {
        it('Valid word should be a straight match 1', async (): Promise<void> => {
            const str = 'hello';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('hello');
        });
        it('Valid word should be a straight match 2', async (): Promise<void> => {
            const str = 'redundant';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('redundant');
        });
        it('Return words should be lowercase regardless of input 1', async (): Promise<void> => {
            const str = 'heLLo';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('hello');
        });
        it('Return words should be lowercase regardless of input 2', async (): Promise<void> => {
            const str = 'reduNdAnT';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('redundant');
        });
    });
});
